import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
    videoPath: string
    context: {
        club: string
        shotType: 'driver' | 'iron' | 'wedge' | 'putter'
        targetDistance?: number
        conditions?: string
        focusArea?: string
        angle: 'face-on' | 'down-the-line'
    }
    captureMetadata: {
        fps: number
        resolution: string
        duration: number
        club?: string
        angle?: string
        shotType?: string
        fileSize: number
    }
    clientRequestId: string
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('🚀 Edge Function started')

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('❌ Missing Supabase environment variables')
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: req.headers.get('Authorization')! },
            },
        })

        console.log('✅ Supabase client initialized')

        // Get authenticated user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            console.error('❌ Authentication failed:', userError)
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('✅ User authenticated:', user.id)

        // Parse request body
        let body: AnalysisRequest
        try {
            body = await req.json()
        } catch (parseError) {
            console.error('❌ Failed to parse request body:', parseError)
            return new Response(
                JSON.stringify({ error: 'Invalid request body' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { videoPath, context, captureMetadata, clientRequestId } = body

        console.log('📋 Analysis request received:', {
            userId: user.id,
            videoPath,
            clientRequestId
        })

        // Check for existing job (idempotency)
        console.log('🔍 Checking for existing job...')
        const { data: existingJob, error: existingJobError } = await supabaseClient
            .from('analysis_jobs')
            .select('id, status, analyses!job_id(id)')
            .eq('user_id', user.id)
            .eq('client_request_id', clientRequestId)
            .single()

        if (existingJobError && existingJobError.code !== 'PGRST116') {
            console.error('❌ Error checking existing job:', existingJobError)
            return new Response(
                JSON.stringify({ error: 'Database error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (existingJob) {
            console.log('✅ Found existing job:', existingJob.id)

            if (existingJob.status === 'completed' && existingJob.analyses?.[0]) {
                return new Response(
                    JSON.stringify({
                        jobId: existingJob.id,
                        isSync: true,
                        analysisId: existingJob.analyses[0].id
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            } else {
                return new Response(
                    JSON.stringify({
                        jobId: existingJob.id,
                        isSync: false
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
        }

        console.log('🆕 No existing job found, creating new one...')

        // Get user profile for personalized analysis
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        // Create new job
        const { data: job, error: jobError } = await supabaseClient
            .from('analysis_jobs')
            .insert({
                user_id: user.id,
                client_request_id: clientRequestId,
                video_path: videoPath,
                capture_meta: captureMetadata,
                status: 'queued'
            })
            .select()
            .single()

        if (jobError) {
            console.error('Failed to create job:', jobError)
            return new Response(
                JSON.stringify({ error: 'Failed to create analysis job' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('Created job:', job.id)

        // Start processing (with timeout for sync response)
        const processingPromise = processVideoAnalysis(
            supabaseClient,
            job.id,
            videoPath,
            context,
            captureMetadata,
            profile
        )

        // Try to complete synchronously (25 second timeout)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 25000)
        )

        try {
            const analysisId = await Promise.race([processingPromise, timeoutPromise])

            // Sync completion
            return new Response(
                JSON.stringify({
                    jobId: job.id,
                    isSync: true,
                    analysisId: analysisId
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )

        } catch (error) {
            if (error.message === 'timeout') {
                // Continue processing asynchronously
                console.log('Analysis timeout, continuing async:', job.id)
                processingPromise.catch(err =>
                    console.error('Async processing failed:', err)
                )

                return new Response(
                    JSON.stringify({
                        jobId: job.id,
                        isSync: false
                    }),
                    { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            } else {
                throw error
            }
        }

    } catch (error) {
        console.error('Edge function error:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

async function processVideoAnalysis(
    supabaseClient: any,
    jobId: string,
    videoPath: string,
    context: any,
    captureMetadata: any,
    profile: any
): Promise<string> {

    // Update job status to processing
    await supabaseClient
        .from('analysis_jobs')
        .update({
            status: 'processing',
            started_at: new Date().toISOString()
        })
        .eq('id', jobId)

    try {
        // Get signed URL for video
        const { data: videoUrl } = await supabaseClient.storage
            .from('videos')
            .createSignedUrl(videoPath, 3600)

        if (!videoUrl?.signedUrl) {
            throw new Error('Failed to get video URL')
        }

        // Upload to Gemini Files API
        const geminiFileId = await uploadToGeminiFiles(videoUrl.signedUrl)

        // Generate analysis with Gemini
        const analysisResult = await analyzeWithGemini(
            geminiFileId,
            context,
            captureMetadata,
            profile
        )

        // Save analysis to database
        const { data: analysis, error: analysisError } = await supabaseClient
            .from('analyses')
            .insert({
                job_id: jobId,
                user_id: profile.id,
                video_url: videoPath, // Store the path, not the signed URL
                analysis_type: 'coaching', // Required field
                gemini_response: JSON.stringify(analysisResult),
                swing_data: JSON.stringify({
                    totalTime: Date.now(),
                    userLevel: 'intermediate',
                    videoHash: jobId.substring(0, 16),
                    videoSize: captureMetadata.fileSize / (1024 * 1024),
                    originalVideoSize: captureMetadata.fileSize / (1024 * 1024),
                    compressed: false,
                    videoSource: 'camera_recorded',
                    confidence: analysisResult.overall_score || 75,
                    videoMethod: 'unified-edge-processing',
                    context: {
                        club: context.club,
                        angle: context.angle
                    }
                }),
                overall_score: analysisResult.overall_score || 75,
                club_used: context.club,
                camera_angle: context.angle,
                frames_urls: '[]', // Empty array for now
                status: 'completed',
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (analysisError) {
            throw new Error(`Failed to save analysis: ${analysisError.message}`)
        }

        // Update job as completed
        await supabaseClient
            .from('analysis_jobs')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', jobId)

        console.log('Analysis completed:', analysis.id)
        return analysis.id

    } catch (error) {
        console.error('Processing error:', error)

        // Update job as failed
        await supabaseClient
            .from('analysis_jobs')
            .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_details: error.message
            })
            .eq('id', jobId)

        throw error
    }
}

async function uploadToGeminiFiles(videoUrl: string): Promise<string> {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured')
    }

    // Download video
    const videoResponse = await fetch(videoUrl)
    if (!videoResponse.ok) {
        throw new Error('Failed to download video')
    }

    const videoBlob = await videoResponse.blob()

    // Upload to Gemini Files API
    const formData = new FormData()
    // Use .mov extension and quicktime mime type for better Gemini compatibility
    const file = new File([videoBlob], 'video.mov', { type: 'video/quicktime' })
    formData.append('file', file)

    const uploadResponse = await fetch(
        `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            body: formData,
        }
    )

    if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Gemini upload failed: ${errorText}`)
    }

    const uploadResult = await uploadResponse.json()
    const fileName = uploadResult.file.name
    console.log('Uploaded to Gemini Files:', fileName)

    // Wait for file to be processed and become ACTIVE
    console.log('Waiting for file to become ACTIVE...')
    await waitForFileActive(fileName, GEMINI_API_KEY)

    return fileName
}

async function waitForFileActive(fileName: string, apiKey: string): Promise<void> {
    const maxAttempts = 30 // 30 seconds max
    const delayMs = 1000 // 1 second between checks

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const statusResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`,
                { method: 'GET' }
            )

            if (!statusResponse.ok) {
                throw new Error(`Failed to check file status: ${statusResponse.statusText}`)
            }

            const fileInfo = await statusResponse.json()
            console.log(`File status check ${attempt}/${maxAttempts}:`, fileInfo.state)

            if (fileInfo.state === 'ACTIVE') {
                console.log('✅ File is now ACTIVE and ready for analysis')
                return
            }

            if (fileInfo.state === 'FAILED') {
                throw new Error('File processing failed on Gemini side')
            }

            // Wait before next check
            await new Promise(resolve => setTimeout(resolve, delayMs))

        } catch (error) {
            console.error(`File status check ${attempt} failed:`, error)
            if (attempt === maxAttempts) {
                throw new Error(`File did not become ACTIVE after ${maxAttempts} attempts`)
            }
            await new Promise(resolve => setTimeout(resolve, delayMs))
        }
    }

    throw new Error('File processing timeout')
}

async function analyzeWithGemini(
    fileId: string,
    context: any,
    captureMetadata: any,
    profile: any
): Promise<any> {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    // Build personalized prompt
    const prompt = buildAnalysisPrompt(context, captureMetadata, profile)

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    },
                    {
                        fileData: {
                            mimeType: "video/quicktime",
                            fileUri: `https://generativelanguage.googleapis.com/v1beta/${fileId}`
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 8192,
        }
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        }
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini analysis failed: ${errorText}`)
    }

    const result = await response.json()
    const analysisText = result.candidates[0].content.parts[0].text

    try {
        // Clean the response text - remove markdown code blocks if present
        let cleanedText = analysisText.trim()

        // Remove ```json and ``` if present
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }

        console.log('Cleaned analysis text length:', cleanedText.length)
        console.log('Analysis text preview:', cleanedText.substring(0, 300) + '...')

        const parsedResponse = JSON.parse(cleanedText)

        // Log the structure of the parsed response
        console.log('✅ Gemini response structure:', {
            hasOverallScore: !!parsedResponse.overall_score,
            keyInsightsCount: parsedResponse.key_insights?.length || 0,
            recommendationsCount: parsedResponse.recommendations?.length || 0,
            swingPhasesKeys: parsedResponse.swing_phases ? Object.keys(parsedResponse.swing_phases) : [],
            hasTechnicalAnalysis: !!parsedResponse.technical_analysis,
            technicalAnalysisKeys: parsedResponse.technical_analysis ? Object.keys(parsedResponse.technical_analysis) : []
        })

        // Validate required fields
        if (!parsedResponse.overall_score) {
            console.warn('⚠️ Missing overall_score in Gemini response')
        }
        if (!parsedResponse.key_insights || parsedResponse.key_insights.length === 0) {
            console.warn('⚠️ Missing or empty key_insights in Gemini response')
        }
        if (!parsedResponse.recommendations || parsedResponse.recommendations.length === 0) {
            console.warn('⚠️ Missing or empty recommendations in Gemini response')
        }
        if (!parsedResponse.swing_phases) {
            console.warn('⚠️ Missing swing_phases in Gemini response')
        }

        return parsedResponse
    } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError)
        console.error('Raw response text (first 1000 chars):', analysisText.substring(0, 1000))
        console.error('Raw response text (last 500 chars):', analysisText.substring(Math.max(0, analysisText.length - 500)))
        throw new Error('Invalid analysis response format')
    }
}

function buildAnalysisPrompt(context: any, captureMetadata: any, profile: any): string {
    return `Vous êtes un instructeur de golf professionnel certifié PGA analysant une vidéo de swing de golf. Votre expertise couvre la biomécanique, la technique, et la psychologie du golf.

PROFIL DU GOLFEUR:
- Handicap: ${profile?.handicap || 'Non spécifié'}
- Niveau d'expérience: ${profile?.experience_level || 'Non spécifié'}
- Main dominante: ${profile?.dominant_hand || 'Non spécifié'}
- Âge approximatif: ${profile?.age || 'Non spécifié'}

CONTEXTE DU SWING:
- Club utilisé: ${context.club}
- Type de coup: ${context.shotType}
- Angle de caméra: ${context.angle}
- Distance cible: ${context.targetDistance || 'Non spécifiée'}
- Conditions: ${context.conditions || 'Non spécifiées'}
- Zone de focus: ${context.focusArea || 'Analyse générale'}

MÉTADONNÉES VIDÉO:
- Durée: ${captureMetadata.duration}s
- Résolution: ${captureMetadata.resolution}
- FPS: ${captureMetadata.fps}

Analysez cette vidéo de swing de golf avec l'expertise d'un pro et fournissez un feedback détaillé en format JSON avec la structure suivante:

{
  "overall_score": number (1-100, basé sur le niveau du joueur),
  "key_insights": [
    {
      "category": "setup|backswing|downswing|impact|follow_through",
      "title": "Titre concis en français",
      "description": "Observation détaillée et technique en français",
      "severity": "positive|neutral|needs_attention",
      "timestamp": number (seconde dans la vidéo où c'est observé)
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "title": "Titre de l'action en français",
      "description": "Recommandation spécifique et actionnable en français",
      "drill_suggestion": "Exercice pratique détaillé en français avec instructions précises"
    }
  ],
  "swing_phases": {
    "setup": {
      "score": number (1-100),
      "feedback": "Analyse détaillée de la posture d'adresse en français"
    },
    "backswing": {
      "score": number (1-100),
      "feedback": "Analyse détaillée de la montée en français"
    },
    "downswing": {
      "score": number (1-100),
      "feedback": "Analyse détaillée de la descente en français"
    },
    "impact": {
      "score": number (1-100),
      "feedback": "Analyse détaillée de l'impact en français"
    },
    "follow_through": {
      "score": number (1-100),
      "feedback": "Analyse détaillée du finish en français"
    }
  },
  "technical_analysis": {
    "tempo": "Analyse du tempo et du rythme en français",
    "balance": "Analyse de l'équilibre tout au long du swing en français",
    "club_path": "Analyse du chemin de club et de la trajectoire en français",
    "face_angle": "Analyse de l'orientation de la face de club en français",
    "weight_transfer": "Analyse du transfert de poids en français",
    "spine_angle": "Analyse de l'angle de la colonne vertébrale en français"
  },
  "performance_metrics": {
    "consistency_indicators": "Indicateurs de régularité observés en français",
    "power_generation": "Analyse de la génération de puissance en français",
    "accuracy_factors": "Facteurs influençant la précision en français"
  },
  "personalized_insights": {
    "strengths_to_build_on": "Points forts à développer davantage en français",
    "quick_wins": "Améliorations rapides possibles en français",
    "long_term_development": "Développement à long terme recommandé en français"
  }
}

INSTRUCTIONS SPÉCIFIQUES:
1. Répondez UNIQUEMENT en français
2. Adaptez l'analyse au niveau du joueur (débutant vs expérimenté)
3. Soyez spécifique sur les timestamps des observations
4. Proposez des exercices pratiques détaillés
5. Utilisez un vocabulaire technique approprié mais accessible
6. Donnez des conseils progressifs et réalisables
7. Mentionnez les aspects biomécaniques quand pertinent
8. Considérez l'équipement utilisé dans vos recommandations

IMPORTANT: Retournez UNIQUEMENT du JSON valide sans formatage markdown, blocs de code, ou texte supplémentaire. Ne pas entourer la réponse avec \`\`\`json ou autre formatage.`
}