// FocusBlocks Input Component
import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  success = false,
  icon,
  iconRight,
  secureTextEntry,
  multiline,
  numberOfLines,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style,
  inputStyle,
  editable = true,
  onPress,
}) {
  const { colors, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const Container = onPress ? TouchableOpacity : View;
  const isEditable = editable && !onPress;
  const borderColor = error
    ? colors.error
    : success
    ? colors.success
    : isFocused
    ? colors.state.focusRing
    : colors.border;

  return (
    <View style={[styles.container, { marginBottom: spacing.gapMd }, style]}>
      {label && (
        <Text
          selectable
          style={[styles.label, { color: colors.textPrimary, marginBottom: spacing.xs }]}
        >
          {label}
        </Text>
      )}
      <Container
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.inputContainer,
          {
            backgroundColor: isEditable
              ? colors.surface
              : colors.state.disabledBackground,
            borderColor,
            borderWidth: isFocused ? 2 : 1,
            borderRadius: spacing.inputRadius,
            paddingHorizontal: spacing.inputPadding,
            minHeight: spacing.inputHeight,
          },
        ]}
      >
        {icon && (
          <View style={[styles.iconLeft, { marginRight: spacing.sm }]}>
            {icon}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={isEditable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              color: isEditable ? colors.textPrimary : colors.state.disabledText,
              minHeight: multiline ? 80 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
        />
        {iconRight && (
          <View style={[styles.iconRight, { marginLeft: spacing.sm }]}>
            {iconRight}
          </View>
        )}
      </Container>
      {error && (
        <Text
          selectable
          style={[styles.error, { color: colors.error, marginTop: spacing.xs }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  iconLeft: {
    marginRight: 0,
  },
  iconRight: {
    marginLeft: 0,
  },
  error: {
    fontSize: 13,
    marginTop: 6,
  },
});
