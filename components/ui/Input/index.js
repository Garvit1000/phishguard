import React from 'react';
import { View, TextInput, Text } from 'react-native';
import Colors from '@/constants/colors';
import styles from './styles';

export default function Input({
  label,
  error,
  containerStyle,
  ...props
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          props.editable === false && styles.disabledInput
        ]}
        placeholderTextColor={Colors.mediumGray}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}