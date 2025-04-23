declare module "react-native-config" {
  export interface NativeConfig {
    API_URL: string;
    anon_key: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
