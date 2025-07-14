import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function AdminLayout() {
  return (
    <View style={styles.container}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#f8f9fa' }
        }}
      >
        <Stack.Screen name="categories" options={{ headerShown: false }} />
        <Stack.Screen name="edit-product" options={{ headerShown: false }} />
        <Stack.Screen name="products" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50, // Alt navigation için boşluk
    backgroundColor: '#f8f9fa',
  },
});