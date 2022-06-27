import type {SensorData, CaptureSensieInput} from './types'
import { gyroscope, accelerometer } from 'react-native-sensors';
import { whipCounter } from './index';
import { addSensie, checkStorage } from './asyncStorageUtils';
import { BASE_URL } from './request';

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
        if (callback)
          callback(this.sensorData);
      });
      const subAcc = accelerometer.subscribe(({ x, y, z }) => {
        this.sensorData.accelX.push(x);
        this.sensorData.accelY.push(y);
        this.sensorData.accelZ.push(z);
        if (callback)
          callback(this.sensorData);
      });
      return {subGyro, subAcc}
    }
    
    async captureSensie(captureSensieInput: CaptureSensieInput) {
      if (!this.canCaptureSensie) {
        return undefined;
      }
      const {subGyro, subAcc } = this.startSensors(captureSensieInput.onSensorData)
  
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
            this.currentSensie = {
              whipCount: whipCount,
              signal: avgFlatCrest,
              sensorData: this.sensorData,
              flow: captureSensieInput.flow,
            };
  
            await addSensie(this.currentSensie);
  
            this.canCaptureSensie = !(await checkStorage());
  
            const path = '/session/' + this.id + '/sensie';
  
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
              flowing: captureSensieInput.flow ? 1 : -1,
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
              valid: whipCount == 3,
            };
  
            this.sensorData = {
              gyroX: [],
              gyroY: [],
              gyroZ: [],
              accelX: [],
              accelY: [],
              accelZ: [],
            }; // Reset sensor data
  
            resolve(retSensie);
          }
          reject({ message: 'Whipcount is not 3.' });
        }, 3000);
      });
      return prom;
    }
  }