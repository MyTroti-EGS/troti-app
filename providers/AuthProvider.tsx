import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import JWT from 'expo-jwt';
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const AuthContext = createContext<{
  signIn: (arg0: string) => void;
  signOut: () => void;
  token: MutableRefObject<string | null> | null;
  name: MutableRefObject<string | null> | null;
  email: MutableRefObject<string | null> | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  token: null,
  name: null,
  email: null,
  isLoading: true,
});

// This hook can be used to access the user info.
export function useAuthSession() {
  return useContext(AuthContext);
}

function decodeToken(token: string): { name: string; email: string; exp: number } {
  return JWT.decode(token, 'EGS_JWT_Secret') as { name: string; email: string; exp: number };
}

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeToken(token);
    console.log('Token expiration:', exp);
    return Date.now() >= exp * 1000;
  } catch (error) {
    console.log('Error decoding token:', error);
    return true; // Treat invalid tokens as expired
  }
}

export default function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const tokenRef = useRef<string | null>(null);
  const nameRef = useRef<string | null>(null);
  const emailRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async (): Promise<void> => {
      const token = await AsyncStorage.getItem('@token');
      console.log('Token:', token);

      if (token) {
        try {
          console.log('Is token expired:', isTokenExpired(token));

          if (isTokenExpired(token)) {
            signOut();
            return;
          }

          tokenRef.current = token;
          const { name, email } = decodeToken(token);
          nameRef.current = name;
          emailRef.current = email;
          router.replace('/');
        } catch (error) {
          console.log('Error processing token:', error);
          signOut();
        }
      } else {
        signOut();
      }

      setIsLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (token: string) => {
    await AsyncStorage.setItem('@token', token);

    const { name, email } = decodeToken(token);
    if (!name || !email || !token || isTokenExpired(token)) {
      await AsyncStorage.setItem('@token', '');
      tokenRef.current = null;
      nameRef.current = null;
      emailRef.current = null;
      router.replace('/login');
    }

    tokenRef.current = token;
    nameRef.current = name;
    emailRef.current = email;
    router.replace('/');
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.setItem('@token', '');
    tokenRef.current = null;
    nameRef.current = null;
    emailRef.current = null;
    router.replace('/login');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        token: tokenRef,
        name: nameRef,
        email: emailRef,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
