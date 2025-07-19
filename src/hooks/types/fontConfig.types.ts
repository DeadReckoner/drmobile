import { TextStyle } from 'react-native';

export type TFontTextStyle = Pick<
  TextStyle,
  | 'fontFamily'
  | 'fontSize'
  | 'fontStyle'
  | 'fontWeight'
  | 'letterSpacing'
  | 'lineHeight'
  | 'textAlign'
  | 'textDecorationLine'
  | 'textDecorationColor'
  | 'textDecorationStyle'
  | 'textTransform'
  | 'textAlignVertical'
  | 'includeFontPadding'
  | 'writingDirection'
  | 'color'
>;
