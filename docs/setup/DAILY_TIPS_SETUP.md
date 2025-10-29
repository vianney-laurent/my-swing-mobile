# Configuration du Système de Conseils du Jour

## 🎯 Vue d'ensemble

Ce document contient toutes les informations nécessaires pour configurer le système de conseils du jour dynamiques dans l'app mobile, incluant la migration Supabase et l'Edge Function.

## 📊 1. Migration Supabase

### Créer la table `daily_tips`

Exécuter cette migration dans Supabase SQL Editor :

```sql
-- Migration pour créer la table des conseils du jour
-- Table pour stocker les conseils du jour générés par IA
CREATE TABLE IF NOT EXISTS daily_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE, -- Un seul conseil par jour
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'technique', 'mental', 'equipement', 'entrainement'
  icon TEXT NOT NULL, -- Nom de l'icône Ionicons
  color TEXT NOT NULL, -- Couleur hexadécimale pour l'affichage
  difficulty_level TEXT NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  generated_by TEXT NOT NULL DEFAULT 'gemini', -- Source de génération
  metadata JSONB DEFAULT '{}', -- Métadonnées additionnelles
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes par date
CREATE INDEX IF NOT EXISTS idx_daily_tips_date ON daily_tips(date DESC);

-- Index pour les requêtes par catégorie
CREATE INDEX IF NOT EXISTS idx_daily_tips_category ON daily_tips(category);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_daily_tips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_update_daily_tips_updated_at ON daily_tips;
CREATE TRIGGER trigger_update_daily_tips_updated_at
  BEFORE UPDATE ON daily_tips
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_tips_updated_at();

-- Politique RLS (Row Level Security)
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow read access to daily tips for authenticated users" ON daily_tips
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour permettre l'insertion/mise à jour via service role uniquement
CREATE POLICY "Allow insert/update for service role" ON daily_tips
  FOR ALL
  TO service_role
  USING (true);

-- Insérer quelques conseils d'exemple pour commencer
INSERT INTO daily_tips (date, title, content, category, icon, color, difficulty_level) VALUES
  (
    CURRENT_DATE,
    'Position de départ optimale',
    'Placez vos pieds à la largeur des épaules et fléchissez légèrement les genoux. Cette position stable vous donnera une base solide pour un swing puissant et précis.',
    'technique',
    'body',
    '#3b82f6',
    'beginner'
  ),
  (
    CURRENT_DATE - INTERVAL '1 day',
    'Visualisation avant le swing',
    'Avant chaque coup, visualisez mentalement la trajectoire de la balle. Cette technique mentale améliore la précision et la confiance dans votre jeu.',
    'mental',
    'eye',
    '#8b5cf6',
    'intermediate'
  ),
  (
    CURRENT_DATE - INTERVAL '2 days',
    'Entretien des clubs',
    'Nettoyez vos clubs après chaque utilisation avec une brosse et de l''eau. Des clubs propres améliorent le contact avec la balle et prolongent leur durée de vie.',
    'equipement',
    'build',
    '#f59e0b',
    'beginner'
  );
```

## ⚡ 2. Edge Function Supabase

### Créer la fonction `generate-daily-tip`

Dans Supabase Dashboard > Edge Functions, créer une nouvelle fonction nommée `generate-daily-tip` avec ce code :

```typescript
// Edge Function pour générer automatiquement les conseils du jour
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface GeneratedTipData {
  title: string;
  content: string;
  category: 'technique' | 'mental' | 'equipement' | 'entrainement';
  icon: string;
  color: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    console.log("🚀 Starting daily tip generation...")

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get today's date
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD format
    console.log("📅 Generating tip for date:", today)

    // Check if tip already exists for today
    const { data: existingTip, error: checkError } = await supabase
      .from("daily_tips")
      .select("id")
      .eq("date", today)
      .single()

    if (existingTip) {
      console.log("✅ Tip already exists for today")
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Tip already exists for today",
          tipId: existingTip.id 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      )
    }

    // Generate new tip with Gemini
    console.log("🤖 Generating tip with Gemini...")
    const tipData = await generateTipWithGemini()

    // Save to database
    console.log("💾 Saving tip to database...")
    const { data: savedTip, error: saveError } = await supabase
      .from("daily_tips")
      .insert({
        date: today,
        title: tipData.title,
        content: tipData.content,
        category: tipData.category,
        icon: tipData.icon,
        color: tipData.color,
        difficulty_level: tipData.difficulty_level,
        generated_by: "gemini-edge-function",
        metadata: {
          generated_at: new Date().toISOString(),
          prompt_version: "1.0",
          edge_function: true
        }
      })
      .select()
      .single()

    if (saveError) {
      throw new Error(`Failed to save tip: ${saveError.message}`)
    }

    console.log("✅ Daily tip generated and saved successfully")

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Daily tip generated successfully",
        tip: savedTip 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )

  } catch (error) {
    console.error("❌ Error generating daily tip:", error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})

async function generateTipWithGemini(): Promise<GeneratedTipData> {
  const geminiApiKey = Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY")!
  const genAI = new GoogleGenerativeAI(geminiApiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

  const today = new Date()
  const dayOfWeek = today.toLocaleDateString("fr-FR", { weekday: "long" })
  const season = getCurrentSeason()
  
  const prompt = `Tu es un coach de golf professionnel expérimenté. Génère un conseil du jour unique et pratique pour les golfeurs.

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

Génère maintenant un conseil unique et pertinent:`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  // Parse the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("No JSON found in Gemini response")
  }
  
  const parsed = JSON.parse(jsonMatch[0])
  
  // Validate and sanitize
  const validCategories = ["technique", "mental", "equipement", "entrainement"]
  const validLevels = ["beginner", "intermediate", "advanced"]
  
  if (!validCategories.includes(parsed.category)) {
    parsed.category = "technique"
  }
  
  if (!validLevels.includes(parsed.difficulty_level)) {
    parsed.difficulty_level = "beginner"
  }

  if (!parsed.color.match(/^#[0-9A-Fa-f]{6}$/)) {
    parsed.color = "#3b82f6"
  }
  
  return parsed as GeneratedTipData
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1 // 1-12
  
  if (month >= 3 && month <= 5) return "Printemps"
  if (month >= 6 && month <= 8) return "Été"
  if (month >= 9 && month <= 11) return "Automne"
  return "Hiver"
}
```

### Variables d'environnement requises

Dans Supabase Dashboard > Settings > Edge Functions, ajouter :

```
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📱 3. Configuration App Mobile

### Variables d'environnement (.env)

Ajouter dans le fichier `.env` de l'app mobile :

```
EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Structure des fichiers créés

L'app mobile est déjà configurée avec :

1. **Service** : `src/lib/tips/daily-tips-service.ts`
2. **Composant UI** : `src/components/tips/DailyTipCard.tsx`
3. **Intégration** : Déjà ajouté dans `src/screens/HomeScreen.tsx`

## 🔄 4. Workflow de fonctionnement

### Automatique (recommandé)
1. **Cron job quotidien** appelle l'Edge Function
2. **Edge Function** génère un conseil avec Gemini
3. **Conseil sauvé** dans la table `daily_tips`
4. **App mobile** récupère le conseil du jour

### Manuel (pour test)
1. **Appeler l'Edge Function** manuellement
2. **Ou utiliser** le service mobile pour générer

## 🧪 5. Tests

### Test de l'Edge Function

```bash
# Appel direct à l'Edge Function
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://your-project.supabase.co/functions/v1/generate-daily-tip
```

### Test dans l'app mobile

```javascript
// Test du service mobile
import { dailyTipsService } from './src/lib/tips/daily-tips-service';

// Récupérer le conseil du jour
const tip = await dailyTipsService.getTodaysTip();
console.log('Today\'s tip:', tip);

// Générer un nouveau conseil (si nécessaire)
const newTip = await dailyTipsService.ensureTodaysTip();
console.log('Generated tip:', newTip);
```

## 🚀 6. Déploiement

### Étapes de déploiement

1. **Exécuter la migration SQL** dans Supabase
2. **Créer l'Edge Function** dans Supabase Dashboard
3. **Configurer les variables d'environnement**
4. **Tester l'Edge Function** manuellement
5. **Configurer un cron job** (optionnel)

### Cron job automatique

Utiliser GitHub Actions ou un service externe pour appeler l'Edge Function quotidiennement :

```yaml
# .github/workflows/daily-tip.yml
name: Generate Daily Tip
on:
  schedule:
    - cron: '0 6 * * *' # Tous les jours à 6h UTC
jobs:
  generate-tip:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            https://your-project.supabase.co/functions/v1/generate-daily-tip
```

## 🎨 7. Interface utilisateur

### DailyTipCard Features

- ✅ **Loading states** avec shimmer effects
- ✅ **Error handling** avec bouton retry
- ✅ **Animations** fade-in
- ✅ **Badges** catégorie et difficulté
- ✅ **Indicateur IA** pour conseils générés
- ✅ **Refresh manuel** possible
- ✅ **Design responsive**

### Intégration HomeScreen

Le composant `DailyTipCard` remplace automatiquement la section conseils statiques et affiche :

- **Conseil unique** chaque jour
- **Catégorie visuelle** (technique, mental, équipement, entraînement)
- **Niveau de difficulté** (débutant, intermédiaire, avancé)
- **Badge IA** si généré par Gemini
- **Possibilité de refresh** pour nouveau contenu

## 🔧 8. Maintenance

### Monitoring

- **Logs Edge Function** dans Supabase Dashboard
- **Métriques d'utilisation** via analytics
- **Taux de génération** quotidien

### Fallbacks

1. **Pas de conseil aujourd'hui** → Génération automatique
2. **Échec génération** → Conseil récent en fallback
3. **Erreur réseau** → Message d'erreur avec retry

## 📈 9. Améliorations futures

- **Personnalisation** basée sur l'historique utilisateur
- **Conseils multi-langues** avec i18n
- **Intégration météo** pour conseils contextuels
- **Notifications push** pour nouveaux conseils
- **Partage social** des conseils favoris

## 🚨 10. Troubleshooting

### Problèmes courants

1. **Pas de conseil affiché** → Vérifier la migration DB
2. **Erreur génération IA** → Vérifier la clé API Gemini
3. **Edge Function timeout** → Optimiser le prompt
4. **Conseils dupliqués** → Vérifier la contrainte UNIQUE sur date

### Debug

```typescript
// Activer les logs détaillés dans l'app
console.log('🔍 Debug mode enabled');
const tip = await dailyTipsService.getTodaysTip();
console.log('Current tip:', tip);
```

---

## ✅ Checklist de déploiement

- [ ] Migration SQL exécutée
- [ ] Edge Function créée et déployée
- [ ] Variables d'environnement configurées
- [ ] Test Edge Function réussi
- [ ] Test app mobile réussi
- [ ] Cron job configuré (optionnel)
- [ ] Monitoring en place

Le système est maintenant prêt à générer des conseils du jour dynamiques et contextuels ! 🎯