// Service pour charger le contenu d'aide
// En production, ces contenus pourraient être chargés depuis un serveur

const helpContent: Record<string, string> = {
  home: `# Aide - Écran d'accueil

Bienvenue sur l'écran d'accueil de My Swing ! C'est votre point de départ pour analyser et améliorer votre swing de golf.

## Fonctionnalités principales

### Conseil du jour
- Recevez chaque jour un conseil personnalisé pour améliorer votre jeu
- Les conseils sont adaptés à votre niveau et vos analyses précédentes
- Appuyez sur le conseil pour voir plus de détails

### Météo locale
- Consultez les conditions météorologiques actuelles
- Informations sur la température, l'humidité et le vent
- Idéal pour planifier vos sessions d'entraînement

### Actions rapides
- **Nouvelle analyse** : Lancez directement l'enregistrement de votre swing
- **Voir l'historique** : Accédez à toutes vos analyses précédentes
- **Mon profil** : Gérez vos informations personnelles

## Navigation

Utilisez la barre de navigation en bas pour accéder aux différentes sections :
- **Accueil** : Retour à cet écran
- **Caméra** : Enregistrer un nouveau swing
- **Historique** : Voir vos analyses passées
- **Profil** : Gérer votre compte

## Conseils d'utilisation

- Consultez régulièrement les conseils du jour pour progresser
- Vérifiez la météo avant vos sessions d'entraînement
- Utilisez les actions rapides pour un accès direct aux fonctionnalités

**Besoin d'aide ?** Appuyez sur l'icône d'aide (?) en haut à droite de n'importe quel écran.`,

  camera: `# Aide - Enregistrement vidéo

Apprenez à enregistrer parfaitement votre swing pour obtenir les meilleures analyses.

## Préparation de l'enregistrement

### Positionnement de la caméra
- Placez votre téléphone à environ 2-3 mètres de distance
- La caméra doit être à hauteur de hanches
- Filmez de profil (côté droit pour les droitiers, gauche pour les gauchers)
- Assurez-vous que tout votre corps est visible dans le cadre

### Conditions d'éclairage
- Privilégiez un éclairage naturel uniforme
- Évitez les contre-jours et les ombres marquées
- L'arrière-plan doit être contrasté avec vos vêtements

## Enregistrement

### Étapes à suivre
1. **Préparez-vous** : Positionnez-vous face à la balle
2. **Appuyez sur Enregistrer** : Le compte à rebours de 3 secondes commence
3. **Effectuez votre swing** : Mouvement complet du backswing à la finition
4. **Arrêtez l'enregistrement** : Maintenez la position finale quelques secondes

### Conseils pour un bon enregistrement
- Portez des vêtements contrastés (évitez le blanc sur fond clair)
- Effectuez un swing naturel, comme à l'entraînement
- Gardez la même vitesse que d'habitude
- Assurez-vous que le téléphone est stable (utilisez un trépied si possible)

## Contexte du swing

Avant l'analyse, renseignez les informations suivantes :
- **Type de club** : Driver, fer, wedge, etc.
- **Objectif** : Distance, précision, correction d'un défaut
- **Conditions** : Vent, lie de la balle, etc.

## Problèmes courants

### Vidéo floue
- Nettoyez l'objectif de votre téléphone
- Assurez-vous que l'éclairage est suffisant
- Stabilisez votre téléphone

### Swing coupé
- Vérifiez que tout votre corps est dans le cadre
- Reculez la caméra si nécessaire
- Commencez l'enregistrement avant de vous positionner

**Astuce** : Faites quelques tests d'enregistrement pour trouver le meilleur angle avant votre vraie session.`,

  analysis: `# Aide - Analyse en cours

Votre swing est en cours d'analyse par notre intelligence artificielle avancée.

## Processus d'analyse

### Étapes de traitement
1. **Upload de la vidéo** : Envoi sécurisé vers nos serveurs
2. **Détection des mouvements** : Identification des phases du swing
3. **Analyse biomécanique** : Évaluation de la technique
4. **Génération des conseils** : Recommandations personnalisées

### Temps d'attente
- **Analyse standard** : 30 secondes à 2 minutes
- **Analyse approfondie** : 2 à 5 minutes
- Le temps varie selon la qualité vidéo et la charge serveur

## Pendant l'attente

### Que se passe-t-il ?
Notre IA analyse plus de 20 points clés de votre swing :
- Position et alignement
- Tempo et rythme
- Plan de swing
- Impact avec la balle
- Équilibre et finition

### Conseils d'attente
- Gardez l'application ouverte pour recevoir les résultats
- Profitez-en pour noter vos sensations sur ce swing
- Vous pouvez consulter vos analyses précédentes

## Indicateurs de progression

### Barre de progression
- **0-25%** : Traitement de la vidéo
- **25-50%** : Détection des mouvements
- **50-75%** : Analyse technique
- **75-100%** : Génération des conseils

### Messages d'état
- "Analyse en cours..." : Traitement normal
- "Finalisation..." : Dernières étapes
- "Presque terminé..." : Résultats bientôt disponibles

## En cas de problème

### Analyse qui traîne
- Vérifiez votre connexion internet
- L'analyse reprendra automatiquement si interrompue
- Contactez le support si l'attente dépasse 10 minutes

### Erreur d'analyse
- Vérifiez la qualité de votre vidéo
- Assurez-vous que le swing est complet
- Réessayez avec un nouvel enregistrement si nécessaire

**Patience** : Une analyse de qualité prend du temps. Les résultats en valent la peine !`,

  history: `# Aide - Historique des analyses

Consultez et gérez toutes vos analyses de swing précédentes.

## Vue d'ensemble

### Organisation des analyses
- **Tri chronologique** : Les plus récentes en premier
- **Cartes d'analyse** : Aperçu rapide de chaque session
- **Filtres** : Recherche par date, club ou score

### Informations affichées
- Date et heure de l'analyse
- Club utilisé
- Score global obtenu
- Miniature de la vidéo
- Statut de l'analyse

## Navigation dans l'historique

### Actions disponibles
- **Appuyer sur une carte** : Voir les détails complets
- **Glisser vers la gauche** : Options rapides (supprimer, partager)
- **Tirer vers le bas** : Actualiser la liste

### Détails d'une analyse
En appuyant sur une analyse, vous accédez à :
- Vidéo complète du swing
- Analyse détaillée point par point
- Conseils d'amélioration
- Comparaison avec vos autres swings

## Gestion des analyses

### Supprimer une analyse
1. Glissez vers la gauche sur la carte
2. Appuyez sur "Supprimer"
3. Confirmez votre choix

### Partager une analyse
- Partagez vos progrès avec votre coach
- Exportez les résultats en PDF
- Envoyez la vidéo à un ami

## Suivi des progrès

### Évolution des scores
- Observez l'amélioration de vos scores dans le temps
- Identifiez les domaines de progression
- Comparez différents clubs

### Statistiques personnelles
- Nombre total d'analyses
- Score moyen
- Meilleur score obtenu
- Clubs les plus utilisés

## Conseils d'utilisation

### Analyse régulière
- Enregistrez vos swings régulièrement
- Comparez vos progrès mois par mois
- Notez l'impact des conseils appliqués

### Organisation
- Supprimez les analyses de mauvaise qualité
- Gardez les meilleures pour référence
- Utilisez les filtres pour retrouver des analyses spécifiques

**Astuce** : Consultez régulièrement vos anciennes analyses pour voir vos progrès et vous motiver !`,

  profile: `# Aide - Profil utilisateur

Gérez vos informations personnelles et les paramètres de votre compte.

## Informations personnelles

### Données de profil
- **Nom et prénom** : Pour personnaliser votre expérience
- **Email** : Votre identifiant de connexion
- **Ville** : Pour les informations météo locales
- **Index de golf** : Pour des conseils adaptés à votre niveau
- **Main dominante** : Influence l'analyse de votre swing

### Modification du profil
1. Appuyez sur "Modifier" en haut à droite
2. Modifiez les champs souhaités
3. Appuyez sur "Sauver" pour confirmer

## Statistiques personnelles

### Cartes de statistiques
- **Analyses** : Nombre total d'analyses effectuées
- **Moyenne** : Score moyen de vos analyses
- **Meilleur** : Votre meilleur score obtenu

### Évolution dans le temps
- Suivez vos progrès depuis votre inscription
- Observez l'amélioration de vos performances
- Identifiez vos points forts

## Support et informations légales

### Documents légaux
- **Politique de confidentialité** : Comment nous protégeons vos données
- **Conditions d'utilisation** : Règles d'usage de l'application
- **Politique des cookies** : Gestion des données de navigation

### Support technique
- **Contacter le support** : Envoyez un email pour toute question
- Réponse sous 24h en moyenne
- Support en français

## Gestion du compte

### Sécurité
- Votre mot de passe est chiffré et sécurisé
- Possibilité de changer votre mot de passe
- Déconnexion sécurisée

### Déconnexion
1. Faites défiler vers le bas
2. Appuyez sur "Se déconnecter"
3. Confirmez votre choix

## Conseils de sécurité

### Protection des données
- Ne partagez jamais vos identifiants
- Utilisez un mot de passe fort
- Déconnectez-vous sur les appareils partagés

### Sauvegarde
- Vos analyses sont automatiquement sauvegardées
- Synchronisation cloud sécurisée
- Accès depuis n'importe quel appareil

## Personnalisation

### Optimisation des conseils
Renseignez correctement :
- Votre index de golf pour des conseils adaptés
- Votre main dominante pour l'analyse technique
- Votre ville pour la météo locale

**Important** : Des informations précises permettent une meilleure personnalisation de l'analyse et des conseils.`,

  auth: `# Aide - Authentification

Guide pour vous connecter ou créer votre compte My Swing.

## Création de compte

### Inscription
1. **Email** : Saisissez une adresse email valide
2. **Mot de passe** : Minimum 8 caractères, incluez chiffres et lettres
3. **Confirmation** : Ressaisissez le même mot de passe
4. Appuyez sur "Créer un compte"

### Vérification email
- Un email de confirmation vous sera envoyé
- Cliquez sur le lien dans l'email pour activer votre compte
- Vérifiez vos spams si vous ne recevez rien

## Connexion

### Se connecter
1. Saisissez votre email
2. Entrez votre mot de passe
3. Appuyez sur "Se connecter"

### Option "Se souvenir de moi"
- Cochée : Connexion automatique lors des prochaines ouvertures
- Décochée : Vous devrez vous reconnecter à chaque fois

## Mot de passe oublié

### Réinitialisation
1. Appuyez sur "Mot de passe oublié ?"
2. Saisissez votre email
3. Consultez votre boîte mail
4. Suivez les instructions dans l'email reçu

### Nouveau mot de passe
- Choisissez un mot de passe sécurisé
- Différent de l'ancien
- Notez-le dans un endroit sûr

## Sécurité du compte

### Bonnes pratiques
- **Mot de passe fort** : Mélangez lettres, chiffres et symboles
- **Email sécurisé** : Utilisez une adresse email que vous consultez régulièrement
- **Confidentialité** : Ne partagez jamais vos identifiants

### Protection des données
- Vos données sont chiffrées
- Connexion sécurisée (HTTPS)
- Conformité RGPD

## Problèmes courants

### Impossible de se connecter
- Vérifiez votre email et mot de passe
- Assurez-vous d'avoir confirmé votre email
- Vérifiez votre connexion internet

### Email non reçu
- Vérifiez vos spams/courriers indésirables
- Attendez quelques minutes
- Vérifiez l'orthographe de votre email

### Compte bloqué
- Contactez le support : contact@myswing.app
- Précisez votre email d'inscription
- Décrivez le problème rencontré

## Changement d'appareil

### Synchronisation
- Vos données sont liées à votre compte
- Connectez-vous avec les mêmes identifiants
- Toutes vos analyses seront disponibles

**Conseil** : Notez vos identifiants dans un gestionnaire de mots de passe sécurisé.`,

  analysisResult: `# Aide - Résultats d'analyse

Comprenez et utilisez les résultats détaillés de l'analyse de votre swing.

## Vue d'ensemble des résultats

### Score global
- **Note sur 100** : Évaluation générale de votre swing
- **Couleur** : Vert (bon), Orange (moyen), Rouge (à améliorer)
- **Évolution** : Comparaison avec vos analyses précédentes

### Catégories analysées
- **Setup & Alignement** : Position initiale
- **Backswing** : Montée du club
- **Downswing** : Descente vers la balle
- **Impact** : Contact avec la balle
- **Follow-through** : Finition du mouvement

## Analyse détaillée

### Points techniques
Chaque aspect est évalué avec :
- **Score spécifique** : Note de 0 à 100
- **Description** : Explication technique
- **Conseil** : Recommandation d'amélioration
- **Priorité** : Importance de la correction

### Visualisation vidéo
- **Lecture ralentie** : Observez chaque phase
- **Annotations** : Points clés surlignés
- **Comparaison** : Avant/après si disponible

## Conseils d'amélioration

### Recommandations prioritaires
- **Top 3** : Les points les plus importants à travailler
- **Exercices** : Drills spécifiques recommandés
- **Progression** : Étapes pour s'améliorer

### Conseils personnalisés
Basés sur :
- Votre niveau (index de golf)
- Vos analyses précédentes
- Le type de club utilisé
- Vos objectifs déclarés

## Actions disponibles

### Partage
- **Envoyer à un coach** : Partagez l'analyse complète
- **Réseaux sociaux** : Partagez vos progrès
- **Export PDF** : Sauvegarde hors ligne

### Sauvegarde
- **Favoris** : Marquez les meilleures analyses
- **Notes personnelles** : Ajoutez vos commentaires
- **Comparaison** : Comparez avec d'autres swings

## Interprétation des scores

### Échelle de notation
- **90-100** : Excellent, niveau professionnel
- **80-89** : Très bon, joueur confirmé
- **70-79** : Bon, joueur régulier
- **60-69** : Moyen, en progression
- **50-59** : Débutant, beaucoup de potentiel
- **<50** : Nombreux points à améliorer

### Progression typique
- **Débutant** : +5-10 points par mois
- **Intermédiaire** : +2-5 points par mois
- **Confirmé** : +1-2 points par mois

## Utilisation des conseils

### Application pratique
1. **Concentrez-vous** sur 1-2 points maximum
2. **Pratiquez** les exercices recommandés
3. **Enregistrez** un nouveau swing après quelques sessions
4. **Comparez** les résultats

### Suivi des progrès
- Notez les conseils appliqués
- Observez l'évolution des scores
- Ajustez votre entraînement selon les résultats

**Astuce** : Ne cherchez pas à tout corriger d'un coup. Travaillez un point à la fois pour des progrès durables.`,

  helpIndex: `# Centre d'aide My Swing

Bienvenue dans le centre d'aide de My Swing ! Trouvez rapidement les réponses à vos questions.

## Navigation rapide

### Par écran de l'application
- **Accueil** : Découvrez les fonctionnalités principales
- **Enregistrement** : Apprenez à filmer votre swing parfaitement
- **Analyse en cours** : Comprenez le processus d'analyse
- **Historique** : Gérez vos analyses précédentes
- **Résultats** : Interprétez vos scores et conseils
- **Profil** : Configurez votre compte
- **Connexion** : Créez et gérez votre compte

## Questions fréquentes

### Utilisation générale
**Comment obtenir une bonne analyse ?**
- Filmez de profil à 2-3m de distance
- Assurez-vous d'un bon éclairage
- Effectuez un swing complet et naturel

**Pourquoi mon analyse prend-elle du temps ?**
- L'IA analyse plus de 20 points techniques
- Le temps varie de 30 secondes à 5 minutes
- La qualité de l'analyse justifie l'attente

**Comment améliorer mes scores ?**
- Concentrez-vous sur 1-2 conseils à la fois
- Pratiquez régulièrement les exercices recommandés
- Enregistrez un nouveau swing après quelques sessions

### Problèmes techniques
**L'application se ferme pendant l'analyse**
- Gardez l'application ouverte pendant l'analyse
- Vérifiez votre connexion internet
- L'analyse reprendra automatiquement

**Je ne reçois pas les emails de confirmation**
- Vérifiez vos spams/courriers indésirables
- Assurez-vous de l'orthographe de votre email
- Contactez le support si le problème persiste

## Conseils pour débuter

### Première utilisation
1. **Créez votre compte** avec un email valide
2. **Complétez votre profil** pour des conseils personnalisés
3. **Enregistrez votre premier swing** en suivant les conseils de positionnement
4. **Analysez les résultats** et notez les points d'amélioration prioritaires

### Progression optimale
- **Régularité** : Enregistrez vos swings régulièrement
- **Patience** : Les progrès prennent du temps
- **Focus** : Travaillez un aspect à la fois
- **Suivi** : Consultez votre historique pour voir vos progrès

## Support technique

### Nous contacter
- **Email** : contact@myswing.app
- **Réponse** : Sous 24h en moyenne
- **Langues** : Support en français

### Informations à fournir
- Modèle de votre téléphone
- Version de l'application
- Description détaillée du problème
- Captures d'écran si possible

## Mises à jour

### Nouvelles fonctionnalités
- Consultez régulièrement les mises à jour
- Nouvelles analyses et conseils ajoutés
- Améliorations de performance

### Feedback
Vos retours nous aident à améliorer l'application :
- Suggestions de fonctionnalités
- Rapports de bugs
- Témoignages d'amélioration

**Astuce** : Bookmarkez cette page d'aide pour un accès rapide à toutes les informations !`
};

export class HelpContentService {
  static getHelpContent(screenName: string): string {
    return helpContent[screenName] || helpContent.helpIndex;
  }

  static getAllHelpSections(): Array<{ key: string; title: string; description: string }> {
    return [
      {
        key: 'home',
        title: 'Écran d\'accueil',
        description: 'Découvrez les fonctionnalités principales de l\'app'
      },
      {
        key: 'camera',
        title: 'Enregistrement vidéo',
        description: 'Apprenez à filmer votre swing parfaitement'
      },
      {
        key: 'analysis',
        title: 'Analyse en cours',
        description: 'Comprenez le processus d\'analyse IA'
      },
      {
        key: 'analysisResult',
        title: 'Résultats d\'analyse',
        description: 'Interprétez vos scores et conseils'
      },
      {
        key: 'history',
        title: 'Historique',
        description: 'Gérez vos analyses précédentes'
      },
      {
        key: 'profile',
        title: 'Profil utilisateur',
        description: 'Configurez votre compte et vos préférences'
      },
      {
        key: 'auth',
        title: 'Authentification',
        description: 'Créez et gérez votre compte'
      }
    ];
  }
}