import type {
  SensorData,
  SensieEngineInit,
  CalibrationInput,
  CaptureEvaluateSensieInput,
} from './types';
import { SENSIES } from './asyncStorageUtils';
import { BASE_URL } from './request';
import { CalibrationSession } from './calibrationSession';
import { whipCounter, signalStrength, evaluateSensie } from './index';
import { gyroscope, accelerometer } from 'react-native-sensors';
import { Sensie } from './sensie';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SensieEngine {
  accessToken: string;
  canRecalibrate: boolean;
  onEnds: (result: Object) => void;
  canEvaluate: boolean;
  sensorData: SensorData;
  userId: string;
  sessionId: string;
  isConnecting: boolean;

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
    this.isConnecting = false;
  }

  async getDataFromAsyncStorage(key: string) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log(e);
    }
  }

  async checkCanEvaluate() {
    const sensies = await this.getDataFromAsyncStorage(SENSIES);
    let [flow, block] = [0, 0];
    if (!sensies) {
      this.canEvaluate = false;
      return false;
    }
    for (let i = 0; i < sensies.length; i++) {
      if (sensies[i].flow == 1) flow++;
      else block++;
    }
    if (flow >= 3 && block >= 3) {
      this.canEvaluate = true;
      return true;
    }
    this.canEvaluate = false;
    return false;
  }

  async checkCanRecalibrate() {
    return true;
  }

  async connect() {
    if (this.accessToken) {
      this.canRecalibrate = await this.checkCanRecalibrate();
      this.canEvaluate = await this.checkCanEvaluate();
    }
    return new Promise((resolve, reject) => {
      if (this.accessToken) {
        resolve({
          message: `Successfully connected. Recalibrate : ${this.canRecalibrate}, Evaluate : ${this.canEvaluate}`,
        });
      } else {
        reject({ message: 'Connection failed : Empty accessToken' });
      }
    });
  }

  async startCalibration(calibrationInput: CalibrationInput): Promise<any> {
    if (this.canRecalibrate) {
      this.userId = calibrationInput.userId;
      this.onEnds = calibrationInput.onEnds;
      const resJSON = await this.startSessionRequest('calibration');
      const sessionId = resJSON.data.session.id;
      this.sessionId = sessionId;
      return new CalibrationSession(this.accessToken, this.sessionId);
    }
    return { message: "Can't recalibrate sensie. Please check async storage." };
  }

  async resetCalibration() {
    await AsyncStorage.removeItem(SENSIES);
  }

  get getCanEvaluate() {
    return this.canEvaluate;
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
    this.sensorData.gyroX = this.sensorData.gyroX.map(
      (x) => Math.round(x * 100) / 100
    );
    this.sensorData.gyroY = this.sensorData.gyroY.map(
      (x) => Math.round(x * 100) / 100
    );
    this.sensorData.gyroZ = this.sensorData.gyroZ.map(
      (x) => Math.round(x * 100) / 100
    );
    this.sensorData.accelX = this.sensorData.accelX.map(
      (x) => Math.round(x * 100) / 100
    );
    this.sensorData.accelY = this.sensorData.accelY.map(
      (x) => Math.round(x * 100) / 100
    );
    this.sensorData.accelZ = this.sensorData.accelZ.map(
      (x) => Math.round(x * 100) / 100
    );
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

  async startSessionRequest(type: string): Promise<any> {
    const path = '/session';

    const body = { userId: this.userId, type: type };

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
      flowing: flowing ? 1 : -1,
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

        if (whipCount == 3) {
          const sensies = await this.getDataFromAsyncStorage(SENSIES);
          const sensie = {
            whipCount: whipCount,
            signal: avgFlatCrest,
            sensorData: this.sensorData,
          };
          const { flowing } = await evaluateSensie(sensie, sensies);

          const retSensie = new Sensie(
            {
              whips: whipCount,
              flowing: flowing,
              signal: avgFlatCrest,
              sensorData: this.sensorData,
            },
            {
              sessionId: this.sessionId,
              accessToken: this.accessToken,
            }
          );

          const calibration_strength = await signalStrength(sensies);
          if (this.onEnds) {
            this.onEnds({ calibration_strength: calibration_strength });
          }

          this.resetSensorData();

          return resolve(retSensie);
        }

        this.resetSensorData();
        return resolve({
          id: 'Invalid sensie',
          whips: whipCount,
          flowing: undefined,
        });
      }, 3000);
    });

    return prom;
  }
}
