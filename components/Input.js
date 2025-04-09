import React from 'react';
import { 
    View, 
    TextInput, 
    Text, 
    StyleSheet
  } from 'react-native';
  import Colors from '@/constants/colors';
  
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.lightGray,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: Colors.lightGray,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});