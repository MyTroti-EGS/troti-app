import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import MapBox, { MapView, Camera, ShapeSource, LineLayer } from '@rnmapbox/maps';

export default function ThankYouScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    tripCost?: string;
    invoiceId?: string;
    duration?: string;
    distance?: string;
    startLat?: string;
    startLng?: string;
    endLat?: string;
    endLng?: string;
  }>();

  const tripCost = params.tripCost ? parseFloat(params.tripCost) : 0;
  const invoiceId = params.invoiceId || '';
  const duration = params.duration ? formatDuration(parseInt(params.duration)) : '0h 0m 0s';
  const distance = params.distance || '0 km';
  const [rating, setRating] = useState(0);

  // Default coordinates for Aveiro
  const startLat = parseFloat(params.startLat || '40.6443');
  const startLng = parseFloat(params.startLng || '-8.6455');
  const endLat = parseFloat(params.endLat || '40.6443');
  const endLng = parseFloat(params.endLng || '-8.6455');

  const handlePayNow = () => {
    if (invoiceId) {
      const paymentUrl = `https://egs-backend.mxv.pt/pay/${invoiceId}`;
      Linking.openURL(paymentUrl);
    }
  };

  const handleReturnToMap = () => {
    router.replace('/');
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share trip details');
  };

  const handleRate = (stars: number) => {
    setRating(stars);
    // Implement rating submission
    console.log('Rating submitted:', stars);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#175D97', '#1A6BA8']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <Ionicons name="checkmark-circle" size={80} color="#fff" />
          <Text style={styles.title}>Thank You for Riding!</Text>
          <Text style={styles.subtitle}>Your trip has been completed successfully</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.costCard}>
          <Text style={styles.costLabel}>Total Cost</Text>
          <Text style={styles.cost}>€{tripCost.toFixed(2)}</Text>
          
          <View style={styles.tripDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.detailText}>{duration}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="bicycle" size={20} color="#666" />
              <Text style={styles.detailText}>{distance}</Text>
            </View>
          </View>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            logoEnabled={false}
            attributionEnabled={false}
            scaleBarEnabled={false}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Camera
              centerCoordinate={[(startLng + endLng) / 2, (startLat + endLat) / 2]}
              zoomLevel={14}
              animationDuration={0}
            />
            <ShapeSource
              id="route"
              shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [startLng, startLat],
                    [endLng, endLat],
                  ],
                },
              }}
            >
              <LineLayer
                id="route-line"
                style={{
                  lineColor: '#175D97',
                  lineWidth: 4,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </ShapeSource>
          </MapView>
          <View style={styles.mapOverlay}>
            <Text style={styles.mapText}>Your Route</Text>
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>How was your ride?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRate(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= rating ? '#FFD700' : '#ccc'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.payButton]} 
            onPress={handlePayNow}
            disabled={!invoiceId}
          >
            <Ionicons name="card" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Pay Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.shareButton]} 
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Share Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.returnButton]} 
            onPress={handleReturnToMap}
          >
            <Ionicons name="map" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Return to Map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  costCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: -5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  costLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  cost: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  mapContainer: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
  },
  mapText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingSection: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  starButton: {
    padding: 5,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  payButton: {
    backgroundColor: '#175D97',
  },
  shareButton: {
    backgroundColor: '#5856D6',
  },
  returnButton: {
    backgroundColor: '#34C759',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 