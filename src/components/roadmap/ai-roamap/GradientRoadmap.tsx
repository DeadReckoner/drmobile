import React from 'react';
import { Dimensions } from 'react-native';
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';
import { Colors } from 'react-native-ui-lib';

export const GradientBackdrop = () => (
  <Svg
    height="250"
    width={Dimensions.get('window').width}
    style={{
      position: 'absolute',
      bottom: 0,
    }}
    pointerEvents="none">
    <Defs>
      <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={Colors.black} stopOpacity="0" />
        <Stop offset="1" stopColor={Colors.black} stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Rect width="100%" height="100%" fill="url(#grad)" />
  </Svg>
);
