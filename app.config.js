import 'dotenv/config';

export default {
  expo: {
    name: "My Swing",
    slug: "my-swing-golf-coach",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#10b981"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.myswing.golfcoach",
      infoPlist: {
        NSCameraUsageDescription: "Cette app utilise la caméra pour analyser votre swing de golf",
        NSMicrophoneUsageDescription: "Cette app peut utiliser le microphone pour enregistrer des vidéos"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#10b981"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.myswing.golfcoach",
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Autoriser My Swing à utiliser votre caméra pour analyser votre swing de golf"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id-here"
      }
    }
  }
};