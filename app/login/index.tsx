import { useAuthSession } from 'providers/AuthProvider';
import { ReactNode, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Pressable, Text, View, StyleSheet, Image } from 'react-native';

export default function Login(): ReactNode {
  const { signIn } = useAuthSession();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    const parsedUrl = Linking.parse(url);

    console.log('Received deep link:', parsedUrl);

    // Handle authentication callback URL
    if (parsedUrl.hostname === 'login' && parsedUrl.queryParams?.token) {
      const token = parsedUrl.queryParams.token;
      signIn(token as string);
    }
  };

  const login = (): void => {
    Linking.openURL('https://egs-backend.mxv.pt/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('assets/mytroti_big_logo.png')} style={styles.logo} />
      </View>

      <View style={styles.termscontainer}>
        <View style={styles.action_buttons}>
          <Pressable onPress={login} style={styles.primary_button}>
            <Text style={styles.primary_button_text}>Sign in</Text>
          </Pressable>
          <Pressable onPress={login} style={styles.secondary_button}>
            <Text style={styles.secondary_button_text}>Sign up</Text>
          </Pressable>
        </View>
        <Text style={styles.terms_text}>
          By signing in or registering, you agree to our Terms of Service and Privacy Policy
        </Text>
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
    padding: 25,
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termscontainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 15,
    justifyContent: 'center',
  },
  terms_text: {
    fontSize: 12,
    color: 'gray',
    marginTop: 20,
    marginHorizontal: 20,
    textAlign: 'center',
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
  secondary_button: {
    flex: 1 / 2,
    backgroundColor: 'white',
    color: '#175D97',
    paddingVertical: 15,
    borderRadius: 40,
    borderColor: '#175D97',
    borderWidth: 1,
  },
  secondary_button_text: {
    color: '#175D97',
    fontWeight: 500,
    fontSize: 16,
    textAlign: 'center',
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
});
