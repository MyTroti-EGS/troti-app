import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useAuthSession } from 'providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import CryptoJS from 'react-native-crypto-js';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
  showChevron?: boolean;
}

const SettingItem = ({ icon, title, onPress, showChevron = true }: SettingItemProps) => (
  <Pressable 
    style={styles.settingItem} 
    onPress={onPress}
    android_ripple={{ color: '#f0f0f0' }}
  >
    <View style={styles.settingItemContent}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color="#175D97" />
        <Text style={styles.settingItemText}>{title}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#666" />}
    </View>
  </Pressable>
);

export default function ProfileScreen() {
  const { name, email, signOut } = useAuthSession();
  const insets = useSafeAreaInsets();

  const getGravatarUrl = (email: string) => {
    const trimmedEmail = email.toLowerCase().trim();
    const hash = CryptoJS.MD5(trimmedEmail).toString();
    return `https://www.gravatar.com/avatar/${hash}?s=200&d=mm`;
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <LinearGradient
        colors={['#175D97', '#1A6BA8']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.profileHeader}>
          {email?.current && (
            <Image
              source={{
                uri: getGravatarUrl(email.current),
              }}
              style={styles.avatar}
            />
          )}
          <Text style={styles.name}>{name?.current || 'Unknown'}</Text>
          <Text style={styles.email}>{email?.current || 'Unknown'}</Text>
        </View>
      </LinearGradient>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <SettingItem icon="lock-closed" title="Privacy Settings" />
        <SettingItem icon="document-text" title="Terms of Service" />
        <SettingItem icon="help-circle" title="Support" />
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Communication Preferences</Text>
        <SettingItem icon="mail" title="Email Communications" />
        <SettingItem icon="megaphone" title="Marketing Communications" />
        <SettingItem icon="notifications" title="Push Notifications" />
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <SettingItem icon="language" title="Language" />
        <SettingItem icon="moon" title="Dark Mode" />
        <SettingItem icon="information-circle" title="About" />
      </View>

      <Pressable 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  settingsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 1,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  signOutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#ff3b30',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 145,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
