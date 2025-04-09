import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthSession } from 'providers/AuthProvider';

export default function PaymentSuccessScreen() {
  const { token } = useAuthSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // If not authenticated (no token), redirect to login
    if (!token?.current) {
      router.replace('/login');
      return;
    }

    // After a short delay, redirect to invoices page
    const timer = setTimeout(() => {
      if (isMounted) {
        router.replace('/(authorized)/(main-tabs)/invoices');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [token, isMounted]);

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>Thank you for your payment</Text>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        <Text style={styles.redirectText}>Redirecting to invoices...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
  },
  loader: {
    marginVertical: 20,
  },
  redirectText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
}); 