import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // en millisecondes
}

export interface CacheConfig {
  key: string;
  expiresIn: number; // en millisecondes
}

/**
 * Service de cache intelligent avec invalidation automatique
 * Garantit la fraîcheur des données tout en optimisant les performances
 */
export class CacheService {
  private static readonly CACHE_PREFIX = '@golf_cache_';

  /**
   * Configurations de cache par type de données
   */
  static readonly CONFIGS = {
    USER_STATS: { key: 'user_stats', expiresIn: 5 * 60 * 1000 }, // 5 minutes
    USER_ANALYSES: { key: 'user_analyses', expiresIn: 2 * 60 * 1000 }, // 2 minutes
    USER_PROFILE: { key: 'user_profile', expiresIn: 10 * 60 * 1000 }, // 10 minutes
    WEATHER_DATA: { key: 'weather_data', expiresIn: 30 * 60 * 1000 }, // 30 minutes
    DAILY_TIP: { key: 'daily_tip', expiresIn: 24 * 60 * 60 * 1000 }, // 24 heures
  } as const;

  /**
   * Sauvegarde des données dans le cache
   */
  static async set<T>(config: CacheConfig, data: T, userId?: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(config.key, userId);
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: config.expiresIn
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      console.log(`✅ [Cache] Saved ${config.key} for user ${userId || 'global'}`);
    } catch (error) {
      console.error(`❌ [Cache] Failed to save ${config.key}:`, error);
    }
  }

  /**
   * Récupération des données du cache
   */
  static async get<T>(config: CacheConfig, userId?: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(config.key, userId);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) {
        console.log(`📭 [Cache] No cache found for ${config.key}`);
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      const isExpired = (now - cacheItem.timestamp) > cacheItem.expiresIn;

      if (isExpired) {
        console.log(`⏰ [Cache] Cache expired for ${config.key}, removing...`);
        await this.remove(config, userId);
        return null;
      }

      const ageInMinutes = Math.round((now - cacheItem.timestamp) / (1000 * 60));
      console.log(`✅ [Cache] Cache hit for ${config.key} (age: ${ageInMinutes}min)`);
      return cacheItem.data;
    } catch (error) {
      console.error(`❌ [Cache] Failed to get ${config.key}:`, error);
      return null;
    }
  }

  /**
   * Suppression d'un élément du cache
   */
  static async remove(config: CacheConfig, userId?: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(config.key, userId);
      await AsyncStorage.removeItem(cacheKey);
      console.log(`🗑️ [Cache] Removed ${config.key} for user ${userId || 'global'}`);
    } catch (error) {
      console.error(`❌ [Cache] Failed to remove ${config.key}:`, error);
    }
  }

  /**
   * Invalidation du cache utilisateur (après nouvelle analyse, etc.)
   */
  static async invalidateUserData(userId: string): Promise<void> {
    console.log(`🔄 [Cache] Invalidating user data for ${userId}...`);
    
    const userConfigs = [
      this.CONFIGS.USER_STATS,
      this.CONFIGS.USER_ANALYSES,
      this.CONFIGS.USER_PROFILE
    ];

    await Promise.all(
      userConfigs.map(config => this.remove(config, userId))
    );

    console.log(`✅ [Cache] User data invalidated for ${userId}`);
  }

  /**
   * Nettoyage complet du cache
   */
  static async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`🧹 [Cache] Cleared ${cacheKeys.length} cache entries`);
      }
    } catch (error) {
      console.error('❌ [Cache] Failed to clear cache:', error);
    }
  }

  /**
   * Génère la clé de cache complète
   */
  private static getCacheKey(key: string, userId?: string): string {
    return `${this.CACHE_PREFIX}${key}${userId ? `_${userId}` : ''}`;
  }

  /**
   * Vérifie si le cache existe et est valide
   */
  static async isValid(config: CacheConfig, userId?: string): Promise<boolean> {
    const data = await this.get(config, userId);
    return data !== null;
  }

  /**
   * Récupère les statistiques du cache
   */
  static async getCacheStats(): Promise<{
    totalEntries: number;
    cacheKeys: string[];
    totalSize: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        totalEntries: cacheKeys.length,
        cacheKeys,
        totalSize
      };
    } catch (error) {
      console.error('❌ [Cache] Failed to get cache stats:', error);
      return { totalEntries: 0, cacheKeys: [], totalSize: 0 };
    }
  }
}