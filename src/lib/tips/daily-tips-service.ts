/**
 * Service pour gérer les conseils du jour générés par IA
 */

import { supabase } from '../supabase/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface DailyTip {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'technique' | 'mental' | 'equipement' | 'entrainement';
  icon: string;
  color: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  generated_by: string;
  metadata?: any;
  created_at: string;
}

export interface GeneratedTipData {
  title: string;
  content: string;
  category: 'technique' | 'mental' | 'equipement' | 'entrainement';
  icon: string;
  color: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
}

export class DailyTipsService {
  private genAI: GoogleGenerativeAI | null = null;

  private initializeGenAI() {
    if (!this.genAI) {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Récupère le conseil du jour actuel
   */
  async getTodaysTip(): Promise<DailyTip | null> {
    try {
      console.log('📅 Fetching today\'s tip...');
      
      const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      const { data, error } = await supabase
        .from('daily_tips')
        .select('*')
        .eq('date', today)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucun conseil pour aujourd'hui, on peut en générer un
          console.log('📅 No tip found for today, might need to generate one');
          return null;
        }
        throw error;
      }

      console.log('✅ Today\'s tip loaded successfully');
      return data as DailyTip;
      
    } catch (error) {
      console.error('❌ Error fetching today\'s tip:', error);
      throw error;
    }
  }

  /**
   * Récupère les conseils récents (pour fallback)
   */
  async getRecentTips(limit: number = 7): Promise<DailyTip[]> {
    try {
      console.log(`📅 Fetching ${limit} recent tips...`);
      
      const { data, error } = await supabase
        .from('daily_tips')
        .select('*')
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      console.log(`✅ Loaded ${data?.length || 0} recent tips`);
      return data as DailyTip[] || [];
      
    } catch (error) {
      console.error('❌ Error fetching recent tips:', error);
      throw error;
    }
  }

  /**
   * Génère un nouveau conseil avec Gemini
   */
  async generateTipWithGemini(): Promise<GeneratedTipData> {
    try {
      console.log('🤖 Generating new tip with Gemini...');
      
      const genAI = this.initializeGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = this.buildTipGenerationPrompt();
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini response received');
      
      const tipData = this.parseTipResponse(text);
      
      console.log('✅ Tip generated successfully:', tipData.title);
      return tipData;
      
    } catch (error) {
      console.error('❌ Error generating tip with Gemini:', error);
      throw error;
    }
  }

  /**
   * Construit le prompt pour générer un conseil
   */
  private buildTipGenerationPrompt(): string {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('fr-FR', { weekday: 'long' });
    const season = this.getCurrentSeason();
    
    return `Tu es un coach de golf professionnel expérimenté. Génère un conseil du jour unique et pratique pour les golfeurs.

CONTEXTE:
- Jour: ${dayOfWeek}
- Saison: ${season}
- Public: Golfeurs de tous niveaux (débutants à avancés)
- Format: Application mobile de coaching golf

INSTRUCTIONS:
1. Crée un conseil UNIQUE qui n'est pas générique
2. Le conseil doit être actionnable et pratique
3. Adapte le conseil au contexte (jour de la semaine, saison)
4. Varie les catégories: technique, mental, équipement, entraînement
5. Utilise un ton encourageant et professionnel

RÉPONSE REQUISE (format JSON strict):
{
  "title": "<titre accrocheur en 3-6 mots>",
  "content": "<conseil détaillé en 2-3 phrases maximum, très pratique>",
  "category": "<technique|mental|equipement|entrainement>",
  "icon": "<nom d'icône Ionicons appropriée>",
  "color": "<couleur hex selon catégorie: #3b82f6 technique, #8b5cf6 mental, #f59e0b équipement, #10b981 entraînement>",
  "difficulty_level": "<beginner|intermediate|advanced>"
}

EXEMPLES DE CONSEILS SELON LE CONTEXTE:
- Lundi: Préparation mentale pour la semaine
- Mercredi: Technique de swing ou posture
- Vendredi: Conseils pour le weekend au golf
- Hiver: Exercices en intérieur, équipement froid
- Été: Hydratation, protection solaire, conditions chaudes

Génère maintenant un conseil unique et pertinent:`;
  }

  /**
   * Parse la réponse de Gemini
   */
  private parseTipResponse(text: string): GeneratedTipData {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Valider la structure
      const required = ['title', 'content', 'category', 'icon', 'color', 'difficulty_level'];
      const missing = required.filter(field => !parsed.hasOwnProperty(field));
      
      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }

      // Valider les valeurs
      const validCategories = ['technique', 'mental', 'equipement', 'entrainement'];
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      
      if (!validCategories.includes(parsed.category)) {
        parsed.category = 'technique'; // Fallback
      }
      
      if (!validLevels.includes(parsed.difficulty_level)) {
        parsed.difficulty_level = 'beginner'; // Fallback
      }

      // Valider la couleur (format hex)
      if (!parsed.color.match(/^#[0-9A-Fa-f]{6}$/)) {
        parsed.color = '#3b82f6'; // Fallback
      }
      
      console.log('✅ Tip parsed successfully');
      return parsed as GeneratedTipData;
      
    } catch (error) {
      console.error('❌ Failed to parse tip response:', error);
      console.log('Raw response:', text);
      
      // Fallback tip en cas d'erreur de parsing
      return {
        title: 'Conseil du jour',
        content: 'Concentrez-vous sur votre posture et gardez les yeux sur la balle pendant tout le swing.',
        category: 'technique',
        icon: 'golf',
        color: '#3b82f6',
        difficulty_level: 'beginner'
      };
    }
  }

  /**
   * Détermine la saison actuelle
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    
    if (month >= 3 && month <= 5) return 'Printemps';
    if (month >= 6 && month <= 8) return 'Été';
    if (month >= 9 && month <= 11) return 'Automne';
    return 'Hiver';
  }

  /**
   * Sauvegarde un conseil généré en base
   * (Utilisé par l'Edge Function)
   */
  async saveTip(tipData: GeneratedTipData, date?: string): Promise<DailyTip> {
    try {
      const tipDate = date || new Date().toISOString().split('T')[0];
      
      console.log('💾 Saving tip to database...');
      
      const { data, error } = await supabase
        .from('daily_tips')
        .insert({
          date: tipDate,
          title: tipData.title,
          content: tipData.content,
          category: tipData.category,
          icon: tipData.icon,
          color: tipData.color,
          difficulty_level: tipData.difficulty_level,
          generated_by: 'gemini',
          metadata: {
            generated_at: new Date().toISOString(),
            prompt_version: '1.0'
          }
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Tip saved successfully');
      return data as DailyTip;
      
    } catch (error) {
      console.error('❌ Error saving tip:', error);
      throw error;
    }
  }

  /**
   * Génère et sauvegarde le conseil du jour si nécessaire
   */
  async ensureTodaysTip(): Promise<DailyTip> {
    try {
      // Vérifier si on a déjà un conseil pour aujourd'hui
      const existingTip = await this.getTodaysTip();
      
      if (existingTip) {
        console.log('✅ Today\'s tip already exists');
        return existingTip;
      }

      console.log('📝 No tip for today, trying Edge Function first...');
      
      // Essayer d'appeler l'Edge Function d'abord
      try {
        await this.callEdgeFunction();
        
        // Récupérer le conseil généré par l'Edge Function
        const newTip = await this.getTodaysTip();
        if (newTip) {
          console.log('✅ Tip generated by Edge Function');
          return newTip;
        }
      } catch (edgeError) {
        console.warn('⚠️ Edge Function failed, falling back to local generation:', edgeError);
      }
      
      // Fallback: générer localement
      console.log('📝 Generating tip locally...');
      const tipData = await this.generateTipWithGemini();
      
      // Sauvegarder en base
      const savedTip = await this.saveTip(tipData);
      
      console.log('✅ Today\'s tip generated and saved locally');
      return savedTip;
      
    } catch (error) {
      console.error('❌ Error ensuring today\'s tip:', error);
      
      // Fallback final: retourner un conseil récent
      const recentTips = await this.getRecentTips(1);
      if (recentTips.length > 0) {
        console.log('⚠️ Using recent tip as final fallback');
        return recentTips[0];
      }
      
      // Fallback ultime: conseil statique
      return this.getFallbackTip();
    }
  }

  /**
   * Appelle l'Edge Function pour générer le conseil du jour
   */
  private async callEdgeFunction(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session for Edge Function call');
      }

      console.log('📞 Calling Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('generate-daily-tip', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      console.log('✅ Edge Function called successfully:', data);
      
    } catch (error) {
      console.error('❌ Edge Function call failed:', error);
      throw error;
    }
  }

  /**
   * Conseil de fallback en cas d'échec total
   */
  private getFallbackTip(): DailyTip {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      id: 'fallback-tip',
      date: today,
      title: 'Conseil du jour',
      content: 'Concentrez-vous sur votre posture et gardez les yeux sur la balle pendant tout le swing. La régularité vient avec la pratique !',
      category: 'technique',
      icon: 'golf',
      color: '#3b82f6',
      difficulty_level: 'beginner',
      generated_by: 'fallback',
      created_at: new Date().toISOString()
    };
  }

  /**
   * Teste la connectivité avec Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      const { data, error } = await supabase
        .from('daily_tips')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        return false;
      }

      console.log('✅ Supabase connection test successful');
      return true;
      
    } catch (error) {
      console.error('❌ Supabase connection test error:', error);
      return false;
    }
  }

  /**
   * Récupère les statistiques des conseils
   */
  async getTipsStats(): Promise<{
    totalTips: number;
    categoriesCount: Record<string, number>;
    recentTipsCount: number;
  }> {
    try {
      console.log('📊 Fetching tips statistics...');
      
      // Compter le total
      const { count: totalTips } = await supabase
        .from('daily_tips')
        .select('*', { count: 'exact', head: true });

      // Compter par catégorie
      const { data: categoryData } = await supabase
        .from('daily_tips')
        .select('category');

      const categoriesCount = (categoryData || []).reduce((acc, tip) => {
        acc[tip.category] = (acc[tip.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Compter les conseils récents (7 derniers jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentTipsCount } = await supabase
        .from('daily_tips')
        .select('*', { count: 'exact', head: true })
        .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

      console.log('✅ Tips statistics loaded');
      
      return {
        totalTips: totalTips || 0,
        categoriesCount,
        recentTipsCount: recentTipsCount || 0
      };
      
    } catch (error) {
      console.error('❌ Error fetching tips statistics:', error);
      return {
        totalTips: 0,
        categoriesCount: {},
        recentTipsCount: 0
      };
    }
  }
}

export const dailyTipsService = new DailyTipsService();