# 🚀 Quick Start - Conseils du Jour

## Étapes rapides pour activer les conseils du jour

### 1. ⚡ Migration Supabase (2 min)

Dans Supabase Dashboard > SQL Editor, exécuter :

```sql
-- Copier-coller le SQL complet depuis DAILY_TIPS_SETUP.md
-- Ou juste la version courte :

CREATE TABLE daily_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  generated_by TEXT NOT NULL DEFAULT 'gemini',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to daily tips for authenticated users" ON daily_tips
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert/update for service role" ON daily_tips
  FOR ALL TO service_role USING (true);

-- Conseil d'exemple pour tester
INSERT INTO daily_tips (date, title, content, category, icon, color, difficulty_level) VALUES
(CURRENT_DATE, 'Position de départ', 'Placez vos pieds à la largeur des épaules et fléchissez légèrement les genoux.', 'technique', 'body', '#3b82f6', 'beginner');
```

### 2. 🔧 Variables d'environnement (.env)

```env
EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 🧪 Test rapide

```bash
# Dans le dossier golf-coaching-mobile
node test-mobile-tips-ready.js
```

### 4. ⚡ Edge Function (optionnel)

Dans Supabase Dashboard > Edge Functions :

1. Créer fonction `generate-daily-tip`
2. Copier le code depuis `DAILY_TIPS_SETUP.md`
3. Configurer les variables d'environnement
4. Déployer

### 5. ✅ Vérification

L'app mobile devrait maintenant afficher :
- Un conseil du jour dans HomeScreen
- Design moderne avec badges
- Refresh possible
- Fallbacks en cas d'erreur

## 🎯 Résultat attendu

**Avant :** Conseils statiques répétitifs
**Après :** Conseil unique qui change chaque jour, généré par IA

## 🚨 Troubleshooting rapide

- **Pas de conseil affiché** → Vérifier la migration SQL
- **Erreur de connexion** → Vérifier les variables d'environnement
- **Conseil statique** → Edge Function pas encore configurée (normal)

## 📱 Interface

Le `DailyTipCard` remplace automatiquement les anciens conseils statiques avec :

- 🎨 **Design moderne** avec animations
- 🏷️ **Badges** catégorie et difficulté  
- 🤖 **Indicateur IA** si généré par Gemini
- 🔄 **Bouton refresh** pour nouveau contenu
- ⚠️ **Gestion d'erreurs** avec retry

---

**Temps total d'installation : ~5 minutes**
**Résultat : Conseils du jour dynamiques et intelligents ! 🎉**