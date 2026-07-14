import { Image, ImageProps } from 'expo-image';

export const AppImage = (props: ImageProps) => {
  return <Image cachePolicy="memory-disk" {...props} />;
};
