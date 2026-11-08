import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Colors from '@/constants/colors';

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  color?: string;
}

export default function CategoryChip({ label, isActive, onPress, color }: CategoryChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        isActive && styles.chipActive,
        isActive && color && { backgroundColor: color },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      testID={`category-chip-${label}`}
    >
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.textSecondary,
  },
  labelActive: {
    color: '#FFF',
  },
});
