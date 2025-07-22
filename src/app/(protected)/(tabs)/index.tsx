import { ScrollView, Text, View } from 'react-native';

const index = () => {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        style={{
          height: 1800,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>index</Text>
      </View>
    </ScrollView>
  );
};

export default index;
