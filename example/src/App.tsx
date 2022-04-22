import * as React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { multiply, add, subtract, whipCounter } from 'react-native-sensie-module';

const f = () => {
  add(3,4).then(function(res) {
    console.log(res)
  })
}

const f2 = async () => {
  const res = await subtract(3, 4)
  console.log(res)
}

const f3 = async () => {
  const res = await whipCounter({yaw: [1.0, 2.0, 3.0]})
  console.log(res)
}

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  return (
    <View style={styles.container}>
      <Button onPress={f} title="Button"></Button>
      <Button onPress={f2} title="Button2"></Button>
      <Button onPress={f3} title="Button3"></Button>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
