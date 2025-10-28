// Service météo mobile - Version simplifiée pour React Native

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  windSpeed: number;
  humidity: number;
}

interface WeatherPhrase {
  text: string;
  emoji: string;
}

export class MobileWeatherService {
  /**
   * Génère une phrase contextuelle basée sur la météo et le golf
   */
  static generateGolfPhrase(weather: WeatherData | null, userName: string): WeatherPhrase {
    const fallbackPhrases = [
      { text: `Bonjour, ${userName} !`, emoji: '👋' },
      { text: `Prêt à améliorer votre swing, ${userName} ?`, emoji: '⛳' },
      { text: `C'est le moment de travailler votre petit jeu !`, emoji: '🏌️‍♂️' },
      { text: `Une nouvelle session d'analyse vous attend !`, emoji: '📊' },
      { text: `Votre prochain birdie n'attend que vous !`, emoji: '🐦' },
      { text: `Prêt pour une analyse de swing ?`, emoji: '🎯' }
    ];

    if (!weather) {
      const randomPhrase = fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
      return randomPhrase;
    }

    const { temperature, condition, windSpeed } = weather;

    // Phrases basées sur la température
    if (temperature >= 25) {
      return {
        text: `${temperature}°C parfait pour le golf ! Hydratez-vous bien`,
        emoji: '☀️'
      };
    }

    if (temperature >= 15) {
      return {
        text: `${temperature}°C idéal pour travailler votre swing !`,
        emoji: '🌤️'
      };
    }

    if (temperature >= 5) {
      return {
        text: `${temperature}°C un peu frais, mais parfait pour se concentrer !`,
        emoji: '🧥'
      };
    }

    if (temperature < 5) {
      return {
        text: `${temperature}°C ! Échauffez-vous bien avant de swinger`,
        emoji: '❄️'
      };
    }

    // Phrases basées sur les conditions météo
    switch (condition.toLowerCase()) {
      case 'rain':
        return {
          text: 'Pluie dehors ? Parfait pour analyser vos swings au chaud !',
          emoji: '🌧️'
        };

      case 'snow':
        return {
          text: 'Neige dehors ! Travaillons votre technique en attendant le printemps',
          emoji: '⛄'
        };

      case 'clear':
        return {
          text: `Ciel dégagé et ${temperature}°C ! Conditions parfaites !`,
          emoji: '☀️'
        };

      case 'clouds':
        return {
          text: `Nuageux mais ${temperature}°C, idéal pour une session golf !`,
          emoji: '☁️'
        };

      case 'thunderstorm':
        return {
          text: 'Orage dehors ! Restons au sec et analysons vos swings',
          emoji: '⛈️'
        };

      default:
        // Phrases basées sur le vent
        if (windSpeed > 20) {
          return {
            text: `Vent fort (${windSpeed} km/h) ! Travaillons la stabilité de votre swing`,
            emoji: '💨'
          };
        }

        return fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
    }
  }

  /**
   * Récupère la météo via OpenWeatherMap API (gratuite)
   */
  static async getWeather(city: string): Promise<WeatherData | null> {
    try {
      console.log(`🌤️ [Weather] Fetching weather for ${city}...`);
      
      // Utiliser OpenWeatherMap API (gratuite, 1000 calls/jour)
      const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
      
      if (!API_KEY) {
        console.warn('⚠️ [Weather] No API key configured, using fallback');
        return this.getFallbackWeather();
      }
      
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=fr`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`⚠️ [Weather] API call failed: ${response.status}`);
        return this.getFallbackWeather();
      }
      
      const data = await response.json();
      
      const weather: WeatherData = {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        description: data.weather[0].description,
        windSpeed: Math.round(data.wind.speed * 3.6), // m/s vers km/h
        humidity: data.main.humidity
      };
      
      console.log(`✅ [Weather] Weather loaded for ${city}:`, weather);
      return weather;
      
    } catch (error) {
      console.error('❌ [Weather] Error getting weather:', error);
      return this.getFallbackWeather();
    }
  }

  /**
   * Météo de fallback si l'API échoue
   */
  static getFallbackWeather(): WeatherData {
    // Données réalistes basées sur la saison et la ville
    const now = new Date();
    const month = now.getMonth(); // 0-11
    
    let baseTemp = 15; // Température de base
    
    // Ajustement saisonnier
    if (month >= 5 && month <= 8) { // Été
      baseTemp = 22;
    } else if (month >= 11 || month <= 2) { // Hiver
      baseTemp = 8;
    }
    
    // Variation aléatoire
    const temp = baseTemp + Math.floor(Math.random() * 10) - 5;
    
    const conditions = ['clear', 'clouds', 'rain'];
    const descriptions = ['Ensoleillé', 'Nuageux', 'Pluvieux'];
    const conditionIndex = Math.floor(Math.random() * 3);
    
    return {
      temperature: temp,
      condition: conditions[conditionIndex],
      description: descriptions[conditionIndex],
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      humidity: Math.floor(Math.random() * 30) + 50 // 50-80%
    };
  }

  /**
   * Génère un greeting personnalisé avec météo
   */
  static async generatePersonalizedGreeting(userName: string, city?: string): Promise<WeatherPhrase> {
    try {
      let weather: WeatherData | null = null;
      
      if (city) {
        weather = await this.getWeather(city);
      }

      return this.generateGolfPhrase(weather, userName);
    } catch (error) {
      console.error('Error generating greeting:', error);
      return {
        text: `Bonjour, ${userName} !`,
        emoji: '👋'
      };
    }
  }

  /**
   * Obtient un conseil golf basé sur la météo
   */
  static getGolfAdvice(weather: WeatherData): string {
    const { temperature, condition, windSpeed } = weather;
    
    if (condition === 'rain') {
      return "🏌️ Parfait pour analyser vos swings au sec !";
    }
    
    if (temperature >= 25) {
      return "☀️ Conditions idéales ! N'oubliez pas l'hydratation";
    }
    
    if (temperature < 5) {
      return "🧥 Pensez à bien vous échauffer avant de jouer";
    }
    
    if (windSpeed > 20) {
      return "💨 Vent fort - Travaillez votre stabilité !";
    }
    
    if (temperature >= 15 && temperature < 25) {
      return "⛳ Conditions parfaites pour le golf !";
    }
    
    return "🏌️‍♂️ Bonne session de golf !";
  }
}

export const mobileWeatherService = new MobileWeatherService();