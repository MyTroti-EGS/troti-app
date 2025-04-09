import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Scooter } from 'types/graphql';
import { Ionicons } from '@expo/vector-icons';
import { startTrip, endTrip } from '../services/tripService';
import { router } from 'expo-router';
import { useAuthSession } from '../providers/AuthProvider';

interface RideDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  scooter: Scooter | null;
  onStartRide: () => void;
  onStopRide: () => void;
  isMinimized: boolean;
  onMinimize: () => void;
  onExpand: () => void;
}

export default function RideDrawer({ 
  isVisible, 
  onClose, 
  scooter, 
  onStartRide, 
  onStopRide,
  isMinimized,
  onMinimize,
  onExpand
}: RideDrawerProps) {
  const insets = useSafeAreaInsets();
  const [timer, setTimer] = useState(0);
  const [isRiding, setIsRiding] = useState(false);
  const [drawerHeight] = useState(new Animated.Value(300));
  const [opacity] = useState(new Animated.Value(0.5));
  const { token } = useAuthSession();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(drawerHeight, {
        toValue: isMinimized ? 100 : 300,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: isMinimized ? 0 : 0.5,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [isMinimized]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRiding) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRiding]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRide = async () => {
    if (!scooter || !token?.current) return;

    const authToken = token.current;
    if (!authToken) return;

    if (scooter.battery && scooter.battery < 40) {
      Alert.alert(
        'Low Battery Warning',
        'This scooter has low battery. Are you sure you want to start the ride?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Start Ride', 
            onPress: async () => {
              try {
                await startTrip(scooter.id, authToken);
                setIsRiding(true);
                onStartRide();
              } catch (error) {
                console.error('Start ride error:', error);
                Alert.alert(
                  'Error Starting Ride',
                  error instanceof Error ? error.message : 'Failed to start the trip. Please try again.'
                );
              }
            }
          },
        ]
      );
    } else {
      try {
        await startTrip(scooter.id, authToken);
        setIsRiding(true);
        onStartRide();
      } catch (error) {
        console.error('Start ride error:', error);
        Alert.alert(
          'Error Starting Ride',
          error instanceof Error ? error.message : 'Failed to start the trip. Please try again.'
        );
      }
    }
  };

  const handleStopRide = async () => {
    if (!token?.current) return;
    const authToken = token.current;
    if (!authToken) return;

    try {
      const response = await endTrip(authToken);
      setIsRiding(false);
      setTimer(0);
      onStopRide();
      
      // Navigate to thank you screen with trip details
      router.push({
        pathname: '/thank-you',
        params: {
          tripCost: response.tripCost.toString(),
          paymentUrl: response.paymentUrl,
        },
      });
    } catch (error) {
      console.error('Stop ride error:', error);
      Alert.alert(
        'Error Ending Ride',
        error instanceof Error ? error.message : 'Failed to end the trip. Please try again.'
      );
    }
  };

  const handleOverlayPress = () => {
    if (isRiding) {
      onMinimize();
    } else {
      onClose();
    }
  };

  const handleHeaderButtonPress = () => {
    if (isRiding) {
      onMinimize();
    } else {
      onClose();
    }
  };

  const isStartButtonDisabled = !scooter || 
    scooter.status === 'MAINTENANCE' || 
    scooter.status === 'OCCUPIED' || 
    isRiding;

  if (!scooter) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (!isRiding) {
          onClose();
        } else {
          onMinimize();
        }
      }}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {!isMinimized && (
          <Pressable 
            style={styles.overlayContainer}
            onPress={handleOverlayPress}
          >
            <Animated.View 
              style={[
                styles.overlay, 
                { opacity }
              ]}
            />
          </Pressable>
        )}
        <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
          {!isMinimized ? (
            <>
              <View style={styles.header}>
                <View style={styles.scooterInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="barcode-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>Serial: {scooter.serial_number}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="battery-charging" size={20} color="#666" />
                    <Text style={styles.infoText}>Battery: {scooter.battery}%</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleHeaderButtonPress} style={styles.minimizeButton}>
                  <Ionicons 
                    name={isRiding ? "chevron-down" : "close"} 
                    size={24} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.timerSection}>
                <Text style={styles.sectionTitle}>Ride Duration</Text>
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>{formatTime(timer)}</Text>
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, isStartButtonDisabled && styles.buttonDisabled]}
                  onPress={handleStartRide}
                  disabled={isStartButtonDisabled}
                >
                  <Text style={styles.buttonText}>Start Ride</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.stopButton]}
                  onPress={handleStopRide}
                  disabled={!isRiding}
                >
                  <Text style={styles.buttonText}>Stop Ride</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.minimizedContent}>
              <View style={styles.minimizedInfo}>
                <Text style={styles.minimizedText}>Ride in Progress</Text>
                <Text style={styles.minimizedTimer}>{formatTime(timer)}</Text>
              </View>
              <TouchableOpacity onPress={onExpand} style={styles.expandButton}>
                <Ionicons name="chevron-up" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scooterInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  minimizeButton: {
    padding: 8,
  },
  timerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  minimizedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  minimizedInfo: {
    flex: 1,
  },
  minimizedText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  minimizedTimer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  expandButton: {
    padding: 8,
  },
}); 