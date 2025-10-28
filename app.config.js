export default {
  expo: {
    name: "My Swing",
    slug: "my-swing-golf-coach",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#10b981"
    },
    ios: {
      bundleIdentifier: "com.myswing.golfcoach",
      infoPlist: {
        NSCameraUsageDescription: "Cette app utilise la caméra pour analyser votre swing de golf",
        NSMicrophoneUsageDescription: "Cette app peut utiliser le microphone pour enregistrer des vidéos"
      }
    },
    android: {
      package: "com.myswing.golfcoach",
      permissions: [
        "CAMERA",
        "RECORD_AUDIO"
      ]
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Autoriser My Swing à utiliser votre caméra pour analyser votre swing de golf"
        }
      ]
    ]
  }
};