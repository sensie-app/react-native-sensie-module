import { BASE_URL } from './request';
import type { SensorData } from './types';
import { Agreement } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SENSIES } from './asyncStorageUtils';

export type SessionInfo = {
  sessionId: string;
  accessToken: string;
};

export type SensieInfo = {
  whips: number,
  flowing: number,
  signal: number[],
  sensorData: SensorData
}

export class Sensie {
  id: string;
  whips: number;
  flowing: number;
  signal: number[];
  agreement: number;
  sensorData: SensorData;
  sessionInfo: SessionInfo;

  constructor(
    sensieInfo: SensieInfo,
    sessionInfo: SessionInfo
  ) {
    this.id = 'Sensie id will be availabe after the agreement';
    this.whips = sensieInfo.whips;
    this.flowing = sensieInfo.flowing;
    this.signal = sensieInfo.signal
    this.agreement = 0;
    this.sensorData = sensieInfo.sensorData;
    this.sessionInfo = sessionInfo;
  }

  async storeSensieRequest(
    whipCount: number,
    flowing: number,
    agreement: number
  ): Promise<any> {
    const path = '/session/' + this.sessionInfo.sessionId + '/sensie';

    const body = {
      accelerometerX: this.sensorData.accelX,
      accelerometerY: this.sensorData.accelY,
      accelerometerZ: this.sensorData.accelZ,
      gyroscopeX: this.sensorData.gyroX,
      gyroscopeY: this.sensorData.gyroY,
      gyroscopeZ: this.sensorData.gyroZ,
      whips: whipCount,
      flowing: flowing,
      agreement: agreement,
    };

    const header = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-api-key': this.sessionInfo.accessToken,
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

  async setAgreement(agreement: number) {
    this.agreement = agreement;
    if (this.agreement == Agreement.Agree) {
      await this.addSensie({
        whipCount: this.whips,
        signal: this.signal,
        sensorData: this.sensorData,
        flow: true,
      })
    }
    const resJSON = await this.storeSensieRequest(
      this.whips,
      this.flowing,
      this.agreement
    );
    this.id = resJSON.data.sensie.id;
  }
}
