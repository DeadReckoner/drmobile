import AntDesign from '@expo/vector-icons/AntDesign';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconSymbolName = keyof typeof AntDesign.glyphMap;
type IconSymbolProps = {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
};

export const IconSymbol = ({
  name,
  size = 24,
  color,
  style,
}: IconSymbolProps) => {
  return <AntDesign color={color} size={size} name={name} style={style} />;
};
