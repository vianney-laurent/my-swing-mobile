import { CacheService } from './cache-service';
import { UnifiedAnalysisService } from '../analysis/unified-analysis-service';
import { MobileProfileService, UserProfile } from '../profile/mobile-profile-service';
import { MobileWeatherService } from '../weather/mobile-weather-service';
import { Analysis } from '../../types/profile';

export interface UserStats {
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
}

export interface WeatherPhrase {
  text: string;
  emoji: string;
}

/**
 * Gestionnaire de données avec cache intelligent
 * Optimise les performances tout en garantissant la fraîcheur des données
 */
export class DataManager {
  
  /**
   * Récupère les statistiques utilisateur avec cache
   */
  static async getUserStats(userId: string, forceRefresh = false): Promise<UserStats> {
    const cacheConfig = CacheService.CONFIGS.USER_STATS;
    
    // Vérifier le cache d'abord (sauf si forceRefresh)
    if (!forceRefresh) {
      const cached = await CacheService.get<UserStats>(cacheConfig, userId);
      if (cached) {
        return cached;
      }
    }

    console.log('📊 [DataManager] Loading fresh user stats...');
    
    try {
      // Charger les analyses pour calculer les stats
      const analyses = await UnifiedAnalysisService.getUserAnalyses(50);
      
      const totalAnalyses = analyses.length;
      const scores = analyses
        .filter(a => a.overall_score && a.overall_score > 0)
        .map(a => a.overall_score);
      
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      const stats: UserStats = { totalAnalyses, averageScore, bestScore };
      
      // Sauvegarder en cache
      await CacheService.set(cacheConfig, stats, userId);
      
      console.log('✅ [DataManager] User stats loaded and cached:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ [DataManager] Error loading user stats:', error);
      // Retourner des stats vides en cas d'erreur
      return { totalAnalyses: 0, averageScore: 0, bestScore: 0 };
    }
  }

  /**
   * Récupère les analyses utilisateur avec cache et pagination
   */
  static async getUserAnalyses(
    userId: string, 
    limit = 10, 
    forceRefresh = false
  ): Promise<Analysis[]> {
    const cacheConfig = CacheService.CONFIGS.USER_ANALYSES;
    
    // Vérifier le cache d'abord (sauf si forceRefresh)
    if (!forceRefresh) {
      const cached = await CacheService.get<Analysis[]>(cacheConfig, userId);
      if (cached) {
        // Retourner seulement le nombre demandé depuis le cache
        return cached.slice(0, limit);
      }
    }

    console.log(`📋 [DataManager] Loading fresh analyses (limit: ${limit})...`);
    
    try {
      // Charger plus d'analyses pour le cache (optimisation future)
      const analyses = await UnifiedAnalysisService.getUserAnalyses(Math.max(limit, 20));
      
      // Sauvegarder en cache
      await CacheService.set(cacheConfig, analyses, userId);
      
      console.log(`✅ [DataManager] ${analyses.length} analyses loaded and cached`);
      return analyses.slice(0, limit);
      
    } catch (error) {
      console.error('❌ [DataManager] Error loading analyses:', error);
      return [];
    }
  }

  /**
   * Récupère le profil utilisateur avec cache
   */
  static async getUserProfile(userId: string, forceRefresh = false): Promise<UserProfile | null> {
    const cacheConfig = CacheService.CONFIGS.USER_PROFILE;
    
    // Vérifier le cache d'abord (sauf si forceRefresh)
    if (!forceRefresh) {
      const cached = await CacheService.get<UserProfile>(cacheConfig, userId);
      if (cached) {
        return cached;
      }
    }

    console.log('👤 [DataManager] Loading fresh user profile...');
    
    try {
      const profile = await MobileProfileService.getCurrentUserProfile();
      
      if (profile) {
        // Sauvegarder en cache
        await CacheService.set(cacheConfig, profile, userId);
        console.log('✅ [DataManager] User profile loaded and cached');
      }
      
      return profile;
      
    } catch (error) {
      console.error('❌ [DataManager] Error loading user profile:', error);
      return null;
    }
  }

  /**
   * Récupère les données météo avec cache
   */
  static async getWeatherData(city: string, forceRefresh = false): Promise<WeatherPhrase | null> {
    const cacheConfig = CacheService.CONFIGS.WEATHER_DATA;
    const cacheKey = `weather_${city.toLowerCase()}`;
    
    // Vérifier le cache d'abord (sauf si forceRefresh)
    if (!forceRefresh) {
      const cached = await CacheService.get<WeatherPhrase>({ 
        key: cacheKey, 
        expiresIn: cacheConfig.expiresIn 
      });
      if (cached) {
        return cached;
      }
    }

    console.log(`🌤️ [DataManager] Loading fresh weather for ${city}...`);
    
    try {
      const weather = await MobileWeatherService.getWeather(city);
      const phrase = MobileWeatherService.generateGolfPhrase(weather, '');
      
      // Sauvegarder en cache
      await CacheService.set({ 
        key: cacheKey, 
        expiresIn: cacheConfig.expiresIn 
      }, phrase);
      
      console.log('✅ [DataManager] Weather data loaded and cached');
      return phrase;
      
    } catch (error) {
      console.error('❌ [DataManager] Error loading weather:', error);
      return null;
    }
  }

  /**
   * Chargement parallèle des données de la page d'accueil
   */
  static async loadHomeData(userId: string, city?: string, forceRefresh = false): Promise<{
    profile: UserProfile | null;
    stats: UserStats;
    greeting: WeatherPhrase;
  }> {
    console.log('🏠 [DataManager] Loading home data in parallel...');
    
    try {
      // Chargement parallèle de toutes les données
      const [profile, stats, weatherGreeting] = await Promise.all([
        this.getUserProfile(userId, forceRefresh),
        this.getUserStats(userId, forceRefresh),
        city ? this.getWeatherData(city, forceRefresh) : Promise.resolve(null)
      ]);

      // Générer le greeting avec le nom d'utilisateur
      const userName = MobileProfileService.getDisplayName(profile);
      let greeting: WeatherPhrase;

      if (weatherGreeting) {
        // Personnaliser le greeting avec le nom
        greeting = {
          ...weatherGreeting,
          text: weatherGreeting.text.replace('Bonjour !', `Bonjour, ${userName} !`)
        };
      } else {
        // Fallback sans météo
        greeting = await MobileWeatherService.generatePersonalizedGreeting(userName);
      }

      console.log('✅ [DataManager] Home data loaded successfully');
      
      return {
        profile,
        stats,
        greeting
      };
      
    } catch (error) {
      console.error('❌ [DataManager] Error loading home data:', error);
      
      // Fallback en cas d'erreur
      return {
        profile: null,
        stats: { totalAnalyses: 0, averageScore: 0, bestScore: 0 },
        greeting: { text: 'Bonjour !', emoji: '👋' }
      };
    }
  }

  /**
   * Chargement des données de l'historique avec pagination
   */
  static async loadHistoryData(
    userId: string, 
    limit = 8, 
    forceRefresh = false
  ): Promise<{
    analyses: Analysis[];
    stats: UserStats;
    hasMore: boolean;
  }> {
    console.log('📋 [DataManager] Loading history data...');
    
    try {
      // Charger les analyses et stats en parallèle
      const [analyses, stats] = await Promise.all([
        this.getUserAnalyses(userId, limit + 1, forceRefresh), // +1 pour détecter s'il y en a plus
        this.getUserStats(userId, forceRefresh)
      ]);

      const hasMore = analyses.length > limit;
      const limitedAnalyses = analyses.slice(0, limit);

      console.log(`✅ [DataManager] History data loaded: ${limitedAnalyses.length} analyses, hasMore: ${hasMore}`);
      
      return {
        analyses: limitedAnalyses,
        stats,
        hasMore
      };
      
    } catch (error) {
      console.error('❌ [DataManager] Error loading history data:', error);
      
      return {
        analyses: [],
        stats: { totalAnalyses: 0, averageScore: 0, bestScore: 0 },
        hasMore: false
      };
    }
  }

  /**
   * Invalide le cache après une nouvelle analyse
   */
  static async invalidateAfterNewAnalysis(userId: string): Promise<void> {
    console.log('🔄 [DataManager] Invalidating cache after new analysis...');
    await CacheService.invalidateUserData(userId);
  }

  /**
   * Invalide le cache après suppression d'analyse
   */
  static async invalidateAfterAnalysisDeletion(userId: string): Promise<void> {
    console.log('🗑️ [DataManager] Invalidating cache after analysis deletion...');
    await CacheService.invalidateUserData(userId);
  }

  /**
   * Invalide le cache après mise à jour du profil
   */
  static async invalidateAfterProfileUpdate(userId: string): Promise<void> {
    console.log('👤 [DataManager] Invalidating cache after profile update...');
    await CacheService.remove(CacheService.CONFIGS.USER_PROFILE, userId);
    
    // Invalider aussi la météo si la ville a changé
    const keys = await CacheService.getCacheStats();
    const weatherKeys = keys.cacheKeys.filter(key => key.includes('weather_'));
    for (const key of weatherKeys) {
      await CacheService.remove({ key: key.replace(CacheService['CACHE_PREFIX'], ''), expiresIn: 0 });
    }
  }
}