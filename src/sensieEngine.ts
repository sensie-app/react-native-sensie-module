import type {SensorData, SensieEngineInit, CalibrationInput, CaptureEvaluateSensieInput} from './types'
import { SENSIES, checkStorage, resetAllData, getDataFromAsyncStorage } from './asyncStorageUtils';
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
      this.onEnds = () => { };
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
  
    async sensiePostRequest(path: string, body: Object) {
      const header = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-api-key': this.accessToken,
      };
      const headers = new Headers(header)
  
      const option = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers,
      }
  
      const res = await fetch(BASE_URL + path, option)
      return res.json()
    }
  
    async startCalibration(calibrationInput: CalibrationInput): Promise<any> {
      if (this.canRecalibrate) {
        this.userId = calibrationInput.userId;
        this.onEnds = calibrationInput.onEnds;
  
        // const path = '/session';
  
        // const API_TOKEN = this.accessToken;
  
        // const headers = new Headers();
        // headers.append('Content-Type', 'application/json');
        // headers.append('Accept', 'application/json');
        // headers.append('X-api-key', API_TOKEN);
  
        const body = { userId: this.userId, Type: 'calibration' };
  
        // const option = {
        //   method: 'POST',
        //   body: JSON.stringify(body),
        //   headers: headers,
        // };
  
        // const res = await fetch(BASE_URL + path, option);
        // const resJSON = await res.json();
        const resJSON = await this.sensiePostRequest('/session', body)
        const sessionId = resJSON.data.session.id;
        this.sessionId = sessionId;
  
        return new CalibrationSession(this.accessToken, sessionId);
      }
      return { error: 'There are stored sensies already. Please reset first' };
    }
  
    async resetCalibration() {
      this.onEnds = () => { };
      await resetAllData();
    }
  
    async captureSensie(
      captureSensieInput: CaptureEvaluateSensieInput
    ): Promise<any> {
      if (captureSensieInput.userId != this.userId)
        return { message: 'User id is not valid.' };
  
      const path = '/session';
      const API_TOKEN = this.accessToken;
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('X-api-key', API_TOKEN);
      const body = { userId: this.userId, Type: 'evaluation' };
      const option = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers,
      };
      const res = await fetch(BASE_URL + path, option);
      const resJSON = await res.json();
      const sessionId = resJSON.data.session.id;
      this.sessionId = sessionId;
  
      const sensies = await getDataFromAsyncStorage(SENSIES);
  
      const subGyro = gyroscope.subscribe(({ x, y, z }) => {
        this.sensorData.gyroX.push(x);
        this.sensorData.gyroY.push(y);
        this.sensorData.gyroZ.push(z);
        if (captureSensieInput.onSensorData)
          captureSensieInput.onSensorData(this.sensorData);
      });
      const subAcc = accelerometer.subscribe(({ x, y, z }) => {
        this.sensorData.accelX.push(x);
        this.sensorData.accelY.push(y);
        this.sensorData.accelZ.push(z);
        if (captureSensieInput.onSensorData)
          captureSensieInput.onSensorData(this.sensorData);
      }); // Start sensors
  
      const prom = new Promise((resolve, reject) => {
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
            const sensie = {
              whipCount: whipCount,
              signal: avgFlatCrest,
              sensorData: this.sensorData,
            };
            const { flowing } = await evaluateSensie(sensie, sensies);
  
            const path = '/session/' + this.sessionId + '/sensie';
  
            const API_TOKEN = this.accessToken;
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Accept', 'application/json');
            headers.append('X-api-key', API_TOKEN);
  
            const body = {
              accelerometerX: this.sensorData.accelX,
              accelerometerY: this.sensorData.accelY,
              accelerometerZ: this.sensorData.accelZ,
              gyroscopeX: this.sensorData.gyroX,
              gyroscopeY: this.sensorData.gyroY,
              gyroscopeZ: this.sensorData.gyroZ,
              whips: whipCount,
              flowing: 1,
              agreement: 1,
            };
  
            const option = {
              method: 'POST',
              body: JSON.stringify(body),
              headers: headers,
            };
  
            const res = await fetch(BASE_URL + path, option);
            const resJSON = await res.json();
            const sensieId = resJSON.data.sensie.id;
  
            const retSensie = {
              id: sensieId,
              whips: whipCount,
              flowing: flowing,
              agreement: undefined,
            };
  
            this.sensorData = {
              gyroX: [],
              gyroY: [],
              gyroZ: [],
              accelX: [],
              accelY: [],
              accelZ: [],
            }; // Reset sensor data
  
            const calibration_strength = await siganlStrength(sensies);
            this.onEnds({ calibration_strength: calibration_strength });
            resolve(retSensie);
          }
  
          reject({ message: 'Whipcount is not 3.' });
        }, 3000);
      });
  
      return prom;
    }
  }