import type {
  SensorData,
  SensieEngineInit,
  CalibrationInput,
  CaptureEvaluateSensieInput,
} from './types';
import {
  SENSIES,
  checkStorage,
  resetAllData,
  getDataFromAsyncStorage,
} from './asyncStorageUtils';
import { BASE_URL } from './request';
import { CalibrationSession } from './calibrationSession';
import { whipCounter, siganlStrength, evaluateSensie } from './index';
import { gyroscope, accelerometer } from 'react-native-sensors';

export class SensieEngine {
  accessToken: string;
  canRecalibrate: boolean;
  onEnds: (result: Object) => void;
  canEvaluate: boolean;
  sensorData: SensorData;
  userId: string;
  sessionId: string;

  constructor(sensieEngineInit: SensieEngineInit) {
    this.accessToken = sensieEngineInit.accessToken;
    this.canRecalibrate = false;
    this.onEnds = () => {};
    this.canEvaluate = false;
    this.sensorData = {
      gyroX: [],
      gyroY: [],
      gyroZ: [],
      accelX: [],
      accelY: [],
      accelZ: [],
    };
    this.userId = '';
    this.sessionId = '';
  }

  async connect() {
    this.canEvaluate = await checkStorage();
    const ret = new Promise((resolve, reject) => {
      if (this.accessToken) {
        this.canRecalibrate = this.canEvaluate;
        resolve('Successfully connected');
      } else {
        reject('Connection failed');
      }
    });
    return ret;
  }

  async startCalibration(calibrationInput: CalibrationInput): Promise<any> {
    if (this.canRecalibrate) {
      this.userId = calibrationInput.userId;
      this.onEnds = calibrationInput.onEnds;

      const resJSON = await this.startSessionRequest('calibration');
      const sessionId = resJSON.data.session.id;

      this.sessionId = sessionId;

      return new CalibrationSession(this.accessToken, sessionId);
    }
    return { message: 'There are stored sensies already. Please reset first.' };
  }

  async resetCalibration() {
    this.onEnds = () => {};
    await resetAllData();
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
    this.sensorData.gyroX.map((x) => Math.round(x * 100) / 100);
    this.sensorData.gyroY.map((x) => Math.round(x * 100) / 100);
    this.sensorData.gyroZ.map((x) => Math.round(x * 100) / 100);
    this.sensorData.accelX.map((x) => Math.round(x * 100) / 100);
    this.sensorData.accelY.map((x) => Math.round(x * 100) / 100);
    this.sensorData.accelZ.map((x) => Math.round(x * 100) / 100);
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

  async startSessionRequest(type: string) {
    const path = '/session';

    const body = { userId: this.userId, Type: type };

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

  async storeSensieRequest(whipCount: number, flowing: number): Promise<any> {
    const path = '/session/' + this.sessionId + '/sensie';

    const body = {
      accelerometerX: this.sensorData.accelX,
      accelerometerY: this.sensorData.accelY,
      accelerometerZ: this.sensorData.accelZ,
      gyroscopeX: this.sensorData.gyroX,
      gyroscopeY: this.sensorData.gyroY,
      gyroscopeZ: this.sensorData.gyroZ,
      whips: whipCount,
      flowing: flowing,
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

  async captureSensie(
    captureSensieInput: CaptureEvaluateSensieInput
  ): Promise<any> {
    if (captureSensieInput.userId != this.userId)
      return { message: 'User id is not valid.' };

    const resJSON = await this.startSessionRequest('evaluation');
    const sessionId = resJSON.data.session.id;
    this.sessionId = sessionId;

    const sensies = await getDataFromAsyncStorage(SENSIES);

    const { subGyro, subAcc } = this.startSensors(
      captureSensieInput.onSensorData
    );

    const prom = new Promise((resolve, reject) => {
      setTimeout(async () => {
        this.stopSensors(subGyro, subAcc);
        this.roundSensorData();

        const { whipCount, avgFlatCrest } = await whipCounter({
          yaw: this.sensorData.gyroZ,
        });

        if (whipCount == 3) {
          const sensie = {
            whipCount: whipCount,
            signal: avgFlatCrest,
            sensorData: this.sensorData,
          };
          const { flowing } = await evaluateSensie(sensie, sensies);

          const resJSON = await this.storeSensieRequest(whipCount, flowing);
          const sensieId = resJSON.data.sensie.id;

          const retSensie = {
            id: sensieId,
            whips: whipCount,
            flowing: flowing,
            agreement: undefined,
          };

          const calibration_strength = await siganlStrength(sensies);
          this.onEnds({ calibration_strength: calibration_strength });

          this.resetSensorData();

          resolve(retSensie);
        }

        this.resetSensorData();
        reject({ message: 'Whipcount is not 3.' });
      }, 3000);
    });

    return prom;
  }
}
