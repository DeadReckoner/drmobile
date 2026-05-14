import { useAppTheme } from '@/hooks/useAppTheme';
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';
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
      color?: string;
      style?: StyleProp<TextStyle>;
    }
  | {
      set: 'Feather';
      name: FeatherGlyphsType;
      size?: number;
      color?: string;
      style?: StyleProp<TextStyle>;
    }
  | {
      set: 'Ionicons';
      name: IoniconsGlyphsType;
      size?: number;
      color?: string;
      style?: StyleProp<TextStyle>;
    }
  | {
      set: 'MaterialCommunityIcons';
      name: MaterialCommunityIconsGlyphsType;
      size?: number;
      color?: string;
      style?: StyleProp<TextStyle>;
    };

export const AppIcon: React.FC<UnifiedIconProps> = ({
  set = 'AntDesign',
  name,
  size = 24,
  color,
  style,
}) => {
  const { theme } = useAppTheme();

  if (set === 'Feather') {
    return (
      <Feather
        name={name as FeatherGlyphsType}
        size={size}
        color={color || (theme === 'dark' ? Colors.white : Colors.primary)}
        style={style}
      />
    );
  }
  if (set === 'Ionicons') {
    return (
      <Ionicons
        name={name as IoniconsGlyphsType}
        size={size}
        color={color || (theme === 'dark' ? Colors.white : Colors.primary)}
        style={style}
      />
    );
  }

  if (set === 'MaterialCommunityIcons') {
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
