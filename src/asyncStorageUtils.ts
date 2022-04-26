import AsyncStorage from '@react-native-async-storage/async-storage';

const SENSIES = 'sensies'

const storeDataToAsyncStorage = async (key: string, value: Object) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
      console.log(e)
    }
}

const getDataFromAsyncStorage = async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      console.log(e)
    }
  }

const addSensie = async (sensie: Object) => {
    try {
        const sensies = await getDataFromAsyncStorage(SENSIES)
        await storeDataToAsyncStorage(SENSIES, sensies == null ? JSON.stringify([...sensies, sensie]) : [sensie])
    } catch(e) {
        console.log(e)
    }
}

const resetAllData = async () => {
  await AsyncStorage.removeItem(SENSIES);
  return null;
};

// const getJSONArrayAttribute =  async <T>(key: string) => {
//     const arr = await AsyncStorage.getItem(key);
//   if (arr) {
//     return JSON.parse(arr) as T[];
//   }
//   return [];
// }

export {SENSIES, addSensie, resetAllData, getDataFromAsyncStorage}