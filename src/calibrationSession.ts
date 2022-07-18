import type { SensorData, CaptureSensieInput } from './types';
import { gyroscope, accelerometer } from 'react-native-sensors';
import { whipCounter } from './index';
import { BASE_URL } from './request';
import { SENSIES } from './asyncStorageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class CalibrationSession {
  id: string;
  currentSensie: Object;
  sensorData: SensorData;
  canCaptureSensie: boolean;
  accessToken: string;

  constructor(accessToken: string, sessionId: string) {
    this.id = sessionId;
    this.currentSensie = {};
    this.sensorData = {
      gyroX: [],
      gyroY: [],
      gyroZ: [],
      accelX: [],
      accelY: [],
      accelZ: [],
    };
    this.canCaptureSensie = true;
    this.accessToken = accessToken;
  }

  startSensors(callback: ((data: any) => void) | undefined) {
    const subGyro = gyroscope.subscribe(({ x, y, z }) => {
      this.sensorData.gyroX.push(x);
      this.sensorData.gyroY.push(y);
      this.sensorData.gyroZ.push(z);
      if (callback) callback(this.sensorData);
    });
    const subAcc = accelerometer.subscribe(({ x, y, z }) => {
      this.sensorData.accelX.push(x);
      this.sensorData.accelY.push(y);
      this.sensorData.accelZ.push(z);
      if (callback) callback(this.sensorData);
    });
    return { subGyro, subAcc };
  }

  roundSensorData() {
    this.sensorData.gyroX = this.sensorData.gyroX.map(x => Math.round(x * 100) / 100);
    this.sensorData.gyroY = this.sensorData.gyroY.map(x => Math.round(x * 100) / 100);
    this.sensorData.gyroZ = this.sensorData.gyroZ.map(x => Math.round(x * 100) / 100);
    this.sensorData.accelX = this.sensorData.accelX.map(x => Math.round(x * 100) / 100);
    this.sensorData.accelY = this.sensorData.accelY.map(x => Math.round(x * 100) / 100);
    this.sensorData.accelZ = this.sensorData.accelZ.map(x => Math.round(x * 100) / 100);
  }

  resetSensorData() {
    this.sensorData = {
      gyroX: [],
      gyroY: [],
      gyroZ: [],
      accelX: [],
      accelY: [],
      accelZ: [],
    };
  }

  stopSensors(subGyro: any, subAcc: any) {
    subGyro.unsubscribe();
    subAcc.unsubscribe();
  }

  async storeSensieRequest(whipCount: number, flow: boolean): Promise<any> {
    const path = '/session/' + this.id + '/sensie';

    const body = {
      accelerometerX: this.sensorData.accelX,
      accelerometerY: this.sensorData.accelY,
      accelerometerZ: this.sensorData.accelZ,
      gyroscopeX: this.sensorData.gyroX,
      gyroscopeY: this.sensorData.gyroY,
      gyroscopeZ: this.sensorData.gyroZ,
      whips: whipCount,
      flowing: flow ? 1 : -1,
      agreement: 1,
    };

    const header = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-api-key': this.accessToken,
    };
    const headers = new Headers(header);

    const option = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    };

    const res = await fetch(BASE_URL + path, option);
    return await res.json();
  }

  async storeDataToAsyncStorage(key: string, value: any) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.log(e);
    }
  }

  async addSensie(sensie: any) {
    try {
      const sensies = await this.getDataFromAsyncStorage(SENSIES);
      await this.storeDataToAsyncStorage(
        SENSIES,
        sensies != null ? [...sensies, sensie] : [sensie]
      );
    } catch (e) {
      console.log(e);
    }
  }

  async getDataFromAsyncStorage(key: string) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log(e);
    }
  }

  async checkCanCaptureSensie() {
    return true;
  }

  async captureSensie(captureSensieInput: CaptureSensieInput) {
    if (!this.canCaptureSensie) {
      return { message: "Can't capture sensie anymore" };
    }
    const { subGyro, subAcc } = this.startSensors(
      captureSensieInput.onSensorData
    );

    const prom = new Promise((resolve) => {
      setTimeout(async () => {
        this.stopSensors(subGyro, subAcc);
        this.roundSensorData();

        const { whipCount, avgFlatCrest } = await whipCounter({
          yaw: this.sensorData.gyroZ,
        });

        this.currentSensie = {
          whipCount: whipCount,
          signal: avgFlatCrest,
          sensorData: this.sensorData,
          flow: captureSensieInput.flow,
        };

        this.canCaptureSensie = await this.checkCanCaptureSensie();

        if (whipCount == 3) {
          await this.addSensie(this.currentSensie);
        }
        const resJSON = await this.storeSensieRequest(
          whipCount,
          captureSensieInput.flow
        );
        const sensieId = resJSON.data.sensie.id;
        
        const retSensie = {
          id: sensieId,
          whips: whipCount,
          valid: whipCount == 3,
        };
        this.resetSensorData();
        return resolve(retSensie);
      }, 3000);
    });
    return prom;
  }
}
