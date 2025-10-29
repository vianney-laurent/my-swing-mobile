import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HelpButtonProps {
  currentScreen: string;
  onPress: () => void;
}

export default function HelpButton({ currentScreen, onPress }: HelpButtonProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <TouchableOpacity
      style={[styles.helpButton, { top: insets.top + 16 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="help-circle" size={20} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  helpButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1000,
  },
});