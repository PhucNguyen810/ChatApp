import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  name: string;
  online?: boolean;
  size?: number;
};

export function Avatar({ name, online, size = 52 }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
      {online !== undefined && (
        <View
          style={[
            styles.status,
            { backgroundColor: online ? colors.online : colors.muted },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8ECFF',
  },
  initial: { color: colors.primary, fontWeight: '700' },
  status: {
    position: 'absolute',
    width: 13,
    height: 13,
    right: 0,
    bottom: 0,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
