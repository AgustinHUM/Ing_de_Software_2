import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, useTheme } from 'react-native-paper';

/**
 * Props:
 * - label, placeholder, value, defaultValue, onChangeText
 * - password?: boolean (custom alias)
 * - secureTextEntry?: boolean (alias, forwarded)
 * - showToggle?: boolean (default true) -- show eye icon when password mode
 * - style?: any
 * - right?: ReactNode or { icon, onPress, accessibilityLabel }
 * - ...rest: forwarded to PaperTextInput
 */

const TextInput = React.forwardRef((props, ref) => {
  const {
    label,
    placeholder,
    value: controlledValue,
    defaultValue,
    onChangeText,
    // support both aliases
    password = false,
    secureTextEntry: secureTextEntryProp,
    showToggle = true,
    style,
    right,
    ...rest
  } = props;

  const theme = useTheme();

  // controlled/uncontrolled
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '');
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const setValue = (t) => {
    if (onChangeText) onChangeText(t);
    if (controlledValue === undefined) setUncontrolledValue(t);
  };

  // determine whether field should be secure by default
  const initialSecure = !!password || !!secureTextEntryProp;
  const [secure, setSecure] = React.useState(initialSecure);

  // Build right element:
  // - if caller passed a React element, use it
  // - if caller passed an object ({icon, onPress...}), create an Icon
  // - otherwise, if password mode and showToggle, add eye toggle
  let rightElement = null;

  if (React.isValidElement(right)) {
    rightElement = right;
  } else if (right && typeof right === 'object' && right.icon) {
    rightElement = (
      <PaperTextInput.Icon
        icon={right.icon}
        onPress={right.onPress}
        accessibilityLabel={right.accessibilityLabel}
      />
    );
  } else if ((password || secureTextEntryProp) && showToggle) {
    rightElement = (
      <PaperTextInput.Icon
        icon={secure ? 'eye-off' : 'eye'}
        onPress={() => setSecure((s) => !s)}
        accessibilityLabel={secure ? 'Show password' : 'Hide password'}
      />
    );
  }

  return (
    <PaperTextInput
      ref={ref}
      mode="outlined"
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={setValue}
      outlineColor={theme.colors.accent}
      activeOutlineColor={theme.colors.primary}
      textColor={theme.colors.text}
      placeholderTextColor={theme.colors.placeholder}
      outlineStyle={{ borderRadius: 100, borderWidth: 2 }}
      style={[styles.input, style]}
      selectionColor={theme.colors.primary}
      // secureTextEntry respects internal toggle (secure) but allow override via rest
      secureTextEntry={rest.secureTextEntry ?? secure}
      right={rightElement ?? rest.right}
      {...rest}
    />
  );
});

TextInput.displayName = 'CustomTextInput';

const styles = StyleSheet.create({
  input: {
    height: 52,
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingLeft: 10,
  },
});

export default TextInput;
