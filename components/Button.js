
import React from 'react';
import { 
    TouchableOpacity, 
    Text, 
    StyleSheet, 
    ActivityIndicator
  } from 'react-native';
  import Colors from '@/constants/colors';
  
  export default function Button({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    loading = false,
    disabled = false
  }) {
    const getButtonStyle = () => {
      switch (variant) {
        case 'primary':
          return styles.primaryButton;
        case 'secondary':
          return styles.secondaryButton;
        case 'outline':
          return styles.outlineButton;
        default:
          return styles.primaryButton;
      }
    };
  
    const getTextStyle = () => {
      switch (variant) {
        case 'primary':
          return styles.primaryText;
        case 'secondary':
          return styles.secondaryText;
        case 'outline':
          return styles.outlineText;
        default:
          return styles.primaryText;
      }
    };
  return (
    <TouchableOpacity
    style={[
      styles.button,
      getButtonStyle(),
      disabled && styles.disabledButton,
      style
    ]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator 
        color={variant === 'outline' ? Colors.primary : '#fff'} 
        size="small" 
      />
    ) : (
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    )}
  </TouchableOpacity>
);
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  outlineText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});