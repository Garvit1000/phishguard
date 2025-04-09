import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles';

export default function SafeAreaWrapper({ children, style }) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={[styles.content, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}