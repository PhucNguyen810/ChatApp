import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

export function ErrorNotice({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.message}>{message}</Text>;
}

const styles = StyleSheet.create({
  message: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
