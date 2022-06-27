import AsyncStorage from '@react-native-async-storage/async-storage';

const SENSIES = 'sensies';

const storeDataToAsyncStorage = async (key: string, value: Object) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.log(e);
  }
};

const getDataFromAsyncStorage = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log(e);
  }
};

const addSensie = async (sensie: Object) => {
  try {
    const sensies = await getDataFromAsyncStorage(SENSIES);
    await storeDataToAsyncStorage(
      SENSIES,
      sensies == null ? JSON.stringify([...sensies, sensie]) : [sensie]
    );
  } catch (e) {
    console.log(e);
  }
};

const resetAllData = async () => {
  await AsyncStorage.removeItem(SENSIES);
  return null;
};

const checkStorage = async () => {
  const sensies = await getDataFromAsyncStorage(SENSIES);
  let flow = 0;
  let block = 0;
  if (!sensies) return true;
  for (let i = 0; i < sensies.length; i++) {
    if (sensies[i].flow) flow++;
    else block++;
  }
  if (flow >= 3 && block >= 3) return true;
  return false;
};

// const getJSONArrayAttribute =  async <T>(key: string) => {
//     const arr = await AsyncStorage.getItem(key);
//   if (arr) {
//     return JSON.parse(arr) as T[];
//   }
//   return [];
// }

export { SENSIES, addSensie, resetAllData, getDataFromAsyncStorage, checkStorage };
