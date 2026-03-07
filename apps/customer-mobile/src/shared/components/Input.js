import { TextInput, View, Text } from "react-native";

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  error,
  ...props
}) {
  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 font-medium mb-1">{label}</Text>}
      <TextInput
        className={`bg-white border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg px-4 py-3 text-gray-900 w-full`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
