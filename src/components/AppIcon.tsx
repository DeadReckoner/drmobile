import { useAppTheme } from '@/hooks/useAppTheme';
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { ColorValue, StyleProp, TextStyle } from 'react-native';
import { Colors } from 'react-native-ui-lib';

type AntDesignGlyphsType = keyof typeof AntDesign.glyphMap;
type FeatherGlyphsType = keyof typeof Feather.glyphMap;
type IoniconsGlyphsType = keyof typeof Ionicons.glyphMap;
type MaterialCommunityIconsGlyphsType =
  keyof typeof MaterialCommunityIcons.glyphMap;

type UnifiedIconProps =
  | {
      set?: 'AntDesign';
      name: AntDesignGlyphsType;
      size?: number;
      color?: ColorValue;
      style?: StyleProp<TextStyle>;
    }
  | {
      set: 'Feather';
      name: FeatherGlyphsType;
      size?: number;
      color?: ColorValue;
      style?: StyleProp<TextStyle>;
    }
  | {
      set: 'Ionicons';
      name: IoniconsGlyphsType;
      size?: number;
      color?: ColorValue;
      style?: StyleProp<TextStyle>;
    }
  | {
      set: 'MaterialCommunityIcons';
      name: MaterialCommunityIconsGlyphsType;
      size?: number;
      color?: ColorValue;
      style?: StyleProp<TextStyle>;
    };

export const AppIcon: React.FC<UnifiedIconProps> = ({
  // Bound to a local name: the Hermes version in React Native 0.88 fails to
  // parse a destructured `set = ...` default (`set` is a contextual keyword).
  set: iconSet = 'AntDesign',
  name,
  size = 24,
  color,
  style,
}) => {
  const { theme } = useAppTheme();

  if (iconSet === 'Feather') {
    return (
      <Feather
        name={name as FeatherGlyphsType}
        size={size}
        color={color || (theme === 'dark' ? Colors.white : Colors.primary)}
        style={style}
      />
    );
  }
  if (iconSet === 'Ionicons') {
    return (
      <Ionicons
        name={name as IoniconsGlyphsType}
        size={size}
        color={color || (theme === 'dark' ? Colors.white : Colors.primary)}
        style={style}
      />
    );
  }

  if (iconSet === 'MaterialCommunityIcons') {
    return (
      <MaterialCommunityIcons
        name={name as MaterialCommunityIconsGlyphsType}
        size={size}
        color={color || (theme === 'dark' ? Colors.white : Colors.primary)}
        style={style}
      />
    );
  }
  return (
    <AntDesign
      name={name as AntDesignGlyphsType}
      size={size}
      color={color || (theme === 'dark' ? Colors.white : Colors.primary)}
      style={style}
    />
  );
};
