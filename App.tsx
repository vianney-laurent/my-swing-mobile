import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { config, validateConfig } from './src/lib/config';

export default function App() {
  // Validate configuration on startup
  React.useEffect(() => {
    const isValid = validateConfig();
    if (!isValid) {
      console.warn('Some environment variables are missing. Check your .env file.');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
