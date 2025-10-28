import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MobileWeatherService } from '../lib/weather/mobile-weather-service';
import { ShimmerEffect } from './ui/ShimmerEffect';

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  windSpeed: number;
  humidity: number;
}

interface WeatherCardProps {
  city: string;
}

export default function WeatherCard({ city }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (city) {
      loadWeather();
    }
  }, [city]);

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🌤️ [WeatherCard] Loading weather for:', city);
      
      const weatherData = await MobileWeatherService.getWeather(city);
      setWeather(weatherData);
      
      if (weatherData) {
        console.log('✅ [WeatherCard] Weather loaded successfully');
      }
    } catch (err) {
      console.error('❌ [WeatherCard] Error loading weather:', err);
      setError('Météo indisponible');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'sunny';
      case 'clouds':
        return 'cloudy';
      case 'rain':
        return 'rainy';
      case 'snow':
        return 'snow';
      case 'thunderstorm':
        return 'thunderstorm';
      default:
        return 'partly-sunny';
    }
  };

  const getWeatherColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return '#f59e0b'; // Orange/Jaune
      case 'clouds':
        return '#6b7280'; // Gris
      case 'rain':
        return '#3b82f6'; // Bleu
      case 'snow':
        return '#93c5fd'; // Bleu clair
      case 'thunderstorm':
        return '#8b5cf6'; // Violet
      default:
        return '#6b7280';
    }
  };

  const getGradientColors = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return ['#fbbf24', '#f59e0b']; // Jaune vers orange
      case 'clouds':
        return ['#9ca3af', '#6b7280']; // Gris clair vers gris
      case 'rain':
        return ['#60a5fa', '#3b82f6']; // Bleu clair vers bleu
      case 'snow':
        return ['#bfdbfe', '#93c5fd']; // Bleu très clair
      case 'thunderstorm':
        return ['#a78bfa', '#8b5cf6']; // Violet clair vers violet
      default:
        return ['#9ca3af', '#6b7280'];
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ShimmerEffect height={32} width={32} borderRadius={8} />
            <View>
              <Text style={styles.title}>Météo</Text>
              <Text style={styles.cityName}>{city}</Text>
            </View>
          </View>
          <ShimmerEffect height={16} width={16} borderRadius={8} />
        </View>
        
        <View style={styles.shimmerMainWeather}>
          <View style={styles.shimmerTemperatureSection}>
            <ShimmerEffect height={28} width="60%" style={{ marginBottom: 8 }} />
            <ShimmerEffect height={14} width="80%" />
          </View>
          <ShimmerEffect height={32} width={32} borderRadius={16} />
        </View>

        <View style={styles.shimmerDetailsContainer}>
          <View style={styles.shimmerDetailItem}>
            <ShimmerEffect height={14} width="50%" style={{ marginBottom: 6 }} />
            <ShimmerEffect height={16} width="70%" />
          </View>
          <View style={styles.shimmerDetailItem}>
            <ShimmerEffect height={14} width="50%" style={{ marginBottom: 6 }} />
            <ShimmerEffect height={16} width="70%" />
          </View>
        </View>

        <View style={styles.shimmerAdviceContainer}>
          <ShimmerEffect height={13} width="90%" />
        </View>
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#f3f4f6' }]}>
              <Ionicons name="location" size={16} color="#9ca3af" />
            </View>
            <View>
              <Text style={styles.title}>Météo</Text>
              <Text style={styles.cityName}>{city}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={loadWeather} style={styles.refreshButton}>
            <Ionicons name="refresh" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.errorContent}>
          <Ionicons name="cloud-offline" size={32} color="#d1d5db" />
          <Text style={styles.errorText}>Météo indisponible</Text>
          <Text style={styles.errorSubtext}>{error || 'Aucune donnée'}</Text>
        </View>
      </View>
    );
  }

  const gradientColors = getGradientColors(weather.condition);
  const weatherColor = getWeatherColor(weather.condition);
  const golfAdvice = MobileWeatherService.getGolfAdvice(weather);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="location" size={16} color="#3b82f6" />
          </View>
          <View>
            <Text style={styles.title}>Météo</Text>
            <Text style={styles.cityName}>{city}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={loadWeather} style={styles.refreshButton}>
          <Ionicons name="refresh" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Température principale */}
      <View style={[styles.mainWeather, { backgroundColor: weatherColor }]}>
        <View style={styles.mainWeatherContent}>
          <View style={styles.temperatureSection}>
            <Text style={styles.temperature}>{weather.temperature}°C</Text>
            <Text style={styles.description}>{weather.description}</Text>
          </View>
          <View style={styles.iconSection}>
            <Ionicons 
              name={getWeatherIcon(weather.condition) as any} 
              size={32} 
              color="white" 
            />
          </View>
        </View>
      </View>

      {/* Détails météo */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <View style={styles.detailHeader}>
            <Ionicons name="flag" size={14} color="#6b7280" />
            <Text style={styles.detailLabel}>Vent</Text>
          </View>
          <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
        </View>
        
        <View style={styles.detailItem}>
          <View style={styles.detailHeader}>
            <Ionicons name="water" size={14} color="#6b7280" />
            <Text style={styles.detailLabel}>Humidité</Text>
          </View>
          <Text style={styles.detailValue}>{weather.humidity}%</Text>
        </View>
      </View>

      {/* Conseil golf */}
      <View style={styles.adviceContainer}>
        <Text style={styles.adviceText}>{golfAdvice}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    borderRadius: 8,
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  cityName: {
    fontSize: 12,
    color: '#64748b',
  },
  refreshButton: {
    padding: 4,
    borderRadius: 6,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '500',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  mainWeather: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mainWeatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  temperatureSection: {
    flex: 1,
  },
  temperature: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'capitalize',
  },
  iconSection: {
    marginLeft: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  adviceContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 12,
  },
  adviceText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Shimmer styles
  shimmerMainWeather: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shimmerTemperatureSection: {
    flex: 1,
  },
  shimmerDetailsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shimmerDetailItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  shimmerAdviceContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
});