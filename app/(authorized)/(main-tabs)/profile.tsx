import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuthSession } from 'providers/AuthProvider';

export default function ProfileScreen() {
  const { name, email, signOut } = useAuthSession();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Profile</Text>
        <Text style={{ textAlign: 'center' }}>Name: {name?.current || 'Unknown'}</Text>
        <Text style={{ textAlign: 'center' }}>Email: {email?.current || 'Unknown'}</Text>
      </View>
      <View style={styles.action_buttons}>
        <Pressable onPress={signOut} style={styles.primary_button}>
          <Text style={styles.primary_button_text}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 25,
  },
  action_buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  primary_button: {
    flex: 1 / 2,
    backgroundColor: '#175D97',
    color: 'white',
    paddingVertical: 15,
    borderRadius: 40,
  },
  primary_button_text: {
    color: 'white',
    fontWeight: 500,
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});
