'use client';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

export default function Input({ ...props }) {
  return <TextInput style={styles.input} placeholderTextColor={colors.primary} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#1a1a1a',
    color: colors.text,
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
});
