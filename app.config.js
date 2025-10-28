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
      bundleIdentifier: "com.myswing.golfcoach"
    },
    android: {
      package: "com.myswing.golfcoach"
    }
  }
};