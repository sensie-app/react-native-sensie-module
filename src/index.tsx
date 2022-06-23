import { NativeModules, Platform } from 'react-native';
import { accelerometer, gyroscope } from 'react-native-sensors';
import {
  SENSIES,
  addSensie,
  resetAllData,
  getDataFromAsyncStorage,
} from './asyncStorageUtils';
import type {
  WhipCounterReturn,
  SensorData,
  EvaluateSensieReturn,
  SensieEngineInit,
  CalibrationInit,
  CaptureSensieInput,
} from './types';

const LINKING_ERROR =
  `The package 'react-native-sensie-module' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const SensieModule = NativeModules.SensieModule
  ? NativeModules.SensieModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

// For checking linking is working
export function multiply(a: number, b: number): Promise<number> {
  return SensieModule.multiply(a, b);
}

export function add(a: number, b: number): Promise<number> {
  return SensieModule.add(a, b);
}

export function subtract(a: number, b: number): Promise<number> {
  return SensieModule.subtract(a, b);
}

// Following lines are interface for native code & utils. No algorithms are exposed.
export function whipCounter(p: Object): Promise<WhipCounterReturn> {
  return SensieModule.whipCounter(p);
}

export function evaluateSensie(
  sensie: Object,
  sensies: Array<Object>
): Promise<EvaluateSensieReturn> {
  return SensieModule.evaluateSensie(sensie, sensies);
}

export function siganlStrength(sensies: Array<Object>): Promise<number> {
  return SensieModule.siganlStrength(sensies);
}

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

const BASE_URL = "https://0x7xrifn76.execute-api.us-east-1.amazonaws.com/dev"

export class CalibrationSession {
  id: string;
  currentSensie: Object;
  sensorData: SensorData;
  canCaptureSensie: Boolean;
  accessToken: string;

  constructor(accessToken: string, sessionId: string) {
    this.id = sessionId
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
    this.accessToken = accessToken
  }

  async captureSensie(captureSensieInput: CaptureSensieInput) {
    if (!this.canCaptureSensie) {
      return undefined;
    }

    const subGyro = gyroscope.subscribe(({ x, y, z }) => {
      this.sensorData.gyroX.push(x);
      this.sensorData.gyroY.push(y);
      this.sensorData.gyroZ.push(z);
      if (captureSensieInput.onSensorData) captureSensieInput.onSensorData(this.sensorData);
    });
    const subAcc = accelerometer.subscribe(({ x, y, z }) => {
      this.sensorData.accelX.push(x);
      this.sensorData.accelY.push(y);
      this.sensorData.accelZ.push(z);
      if (captureSensieInput.onSensorData) captureSensieInput.onSensorData(this.sensorData);
    }); // Start sensors

    const prom = new Promise((resolve) => {
      setTimeout(async () => {
        subGyro.unsubscribe();
        subAcc.unsubscribe();

        this.sensorData.gyroX.map((x) => Math.round(x * 100) / 100);
        this.sensorData.gyroY.map((x) => Math.round(x * 100) / 100);
        this.sensorData.gyroZ.map((x) => Math.round(x * 100) / 100);
        this.sensorData.accelX.map((x) => Math.round(x * 100) / 100);
        this.sensorData.accelY.map((x) => Math.round(x * 100) / 100);
        this.sensorData.accelZ.map((x) => Math.round(x * 100) / 100);

        const { whipCount, avgFlatCrest } = await whipCounter({
          yaw: this.sensorData.gyroZ,
        });

        if (whipCount == 3) {
          this.currentSensie = {
            whipCount: whipCount,
            signal: avgFlatCrest,
            sensorData: this.sensorData,
            flow: captureSensieInput.flow,
          };

          await addSensie(this.currentSensie);

          this.canCaptureSensie = !(await checkStorage());

          this.sensorData = {
            gyroX: [],
            gyroY: [],
            gyroZ: [],
            accelX: [],
            accelY: [],
            accelZ: [],
          }; // Reset sensor data
        }

        const path = "/session/" + this.id + "/sensie"

        const API_TOKEN = this.accessToken
        const headers = new Headers()
        headers.append("Content-Type", "application/json");
        headers.append("Accept", "application/json");
        headers.append("X-api-key", API_TOKEN)

        const body = {"accelerometerX":this.sensorData.accelX,
        "accelerometerY":this.sensorData.accelY,
        "accelerometerZ":this.sensorData.accelZ,
        "gyroscopeX":this.sensorData.gyroX,
        "gyroscopeY":this.sensorData.gyroY,
        "gyroscopeZ":this.sensorData.gyroZ,
        "whips":whipCount,
        "flowing":captureSensieInput.flow ? 1 : -1,
        "agreement":1}

        const option = {
          method: "POST",
          body: JSON.stringify(body),
          headers: headers
        }

        const res = await fetch(BASE_URL + path, option)
        const resJSON = await res.json()
        const sensieId = resJSON.data.sensie.id

        const retSensie = {
          id: sensieId,
          whips: whipCount,
          valid: whipCount == 3,
        };

        resolve(retSensie);
      }, 3000);
    });
    return prom;
  }
}

export class SensieEngine {
  accessToken: string;
  canRecalibrate: Boolean;
  onEnds: (result: Object) => void;
  canEvaluate: Boolean;
  sensorData: SensorData;
  userId: String;

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

  async startCalibration(calibrationInit: CalibrationInit): Promise<any> {
    if (this.canRecalibrate) {
      this.userId = calibrationInit.userId;
      this.onEnds = calibrationInit.onEnds;

      const path = "/session"

      const API_TOKEN = this.accessToken
      
      const headers = new Headers()
      headers.append("X-api-key", API_TOKEN)

      const body = {userId: this.userId};

      const option = {
        method: "POST",
        body: JSON.stringify(body),
        headers: headers
      }

      const res = await fetch(BASE_URL + path, option)
      const resJSON = await res.json()
      const sessionId = resJSON.data.session.id

      return new CalibrationSession(this.accessToken, sessionId);
    }
    return { error: 'There are stored sensies already. Please reset first' };
  }

  async resetCalibration() {
    this.onEnds = () => {};
    await resetAllData();
  }

  genSensieId() {
    return (
      'sensieID' +
      Date.now().toString(36) +
      Math.random().toString(36).substring(2)
    );
  }

  async captureSensie(userId: String, onSensorData?: (data: SensorData) => {}) {
    if (userId != this.userId) return undefined;

    const sensies = await getDataFromAsyncStorage(SENSIES);

    const subGyro = gyroscope.subscribe(({ x, y, z }) => {
      this.sensorData.gyroX.push(x);
      this.sensorData.gyroY.push(y);
      this.sensorData.gyroZ.push(z);
      if (onSensorData) onSensorData(this.sensorData);
    });
    const subAcc = accelerometer.subscribe(({ x, y, z }) => {
      this.sensorData.accelX.push(x);
      this.sensorData.accelY.push(y);
      this.sensorData.accelZ.push(z);
      if (onSensorData) onSensorData(this.sensorData);
    }); // Start sensors

    setTimeout(async () => {
      subGyro.unsubscribe();
      subAcc.unsubscribe();
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

        this.sensorData = {
          gyroX: [],
          gyroY: [],
          gyroZ: [],
          accelX: [],
          accelY: [],
          accelZ: [],
        }; // Reset sensor data

        const retSensie = {
          id: this.genSensieId(),
          whips: whipCount,
          flowing: flowing,
          agree: -1,
        };

        const calibration_strength = await siganlStrength(sensies);
        this.onEnds({ calibration_strength: calibration_strength });
        return retSensie;
      }

      return { error: 'WhipCount is not 3' };
    }, 3000);
    return undefined;
  }
}
