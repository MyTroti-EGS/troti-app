import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ThankYouScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    tripCost?: string;
    paymentUrl?: string;
  }>();

  const tripCost = params.tripCost ? parseFloat(params.tripCost) : 0;
  const paymentUrl = params.paymentUrl || '';

  const handlePayNow = () => {
    if (paymentUrl) {
      Linking.openURL(paymentUrl);
    }
  };

  const handleReturnToMap = () => {
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Thank You for Riding!</Text>
        <Text style={styles.cost}>Total Cost: €{tripCost.toFixed(2)}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.payButton]} 
            onPress={handlePayNow}
            disabled={!paymentUrl}
          >
            <Text style={styles.buttonText}>Pay Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.returnButton]} 
            onPress={handleReturnToMap}
          >
            <Text style={styles.buttonText}>Return to Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  cost: {
    fontSize: 24,
    marginBottom: 40,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#007AFF',
  },
  returnButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 