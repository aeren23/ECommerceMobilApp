import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen 
          name="product/[id]" 
          options={{ 
            title: 'Ürün Detayı',
            headerStyle: { backgroundColor: '#B8860B' },
            headerTintColor: 'white'
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </CartProvider>
  );
}
