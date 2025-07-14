import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '../context/CartContext';
import { UserProvider } from '../context/UserContext';
import { WishlistProvider } from '../context/WishlistContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <CartProvider>
        <WishlistProvider>
          <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="seller" options={{ headerShown: false }} />
          <Stack.Screen name="seller-panel" options={{ 
            headerShown: false,
            contentStyle: { paddingBottom: 50 }
          }} />
          <Stack.Screen name="admin-panel" options={{ 
            headerShown: false,
            contentStyle: { paddingBottom: 50 }
          }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen 
            name="product/[id]" 
            options={{ 
              title: 'Ürün Detayı',
              headerStyle: { backgroundColor: '#B8860B' },
              headerTintColor: 'white'
            }} 
          />
          <Stack.Screen 
            name="orders" 
            options={{headerShown: false }}
          />
          <Stack.Screen 
            name="settings" 
            options={{
              headerShown: false,
              contentStyle:{paddingBottom: 50,
                paddingTop:30,
                backgroundColor: '#f8f9fa'
              }
             }}
          />
          <Stack.Screen 
            name="favorites" 
            options={{headerShown: false ,
              contentStyle: { paddingBottom: 50, paddingTop: 30, backgroundColor: '#f8f9fa' }
            }}
          />
        </Stack>
        <StatusBar style="auto" />
        </WishlistProvider>
      </CartProvider>
    </UserProvider>
  );
}
