declare module 'react-native-gravatar' {
  import { StyleProp, ViewStyle } from 'react-native';

  interface GravatarOptions {
    email: string;
    parameters?: {
      size?: string;
      d?: string;
      r?: string;
      f?: string;
    };
    secure?: boolean;
  }

  interface GravatarProps {
    options: GravatarOptions;
    style?: StyleProp<ViewStyle>;
  }

  const Gravatar: React.FC<GravatarProps>;
  export default Gravatar;
} 