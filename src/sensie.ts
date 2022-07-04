import { BASE_URL } from './request';
import type { SensorData } from './types';

export enum Agreement {
    Agree = 1,
    Disagree = -1,
    AgreeAfterReflecting = 2,
}

export type SessionInfo = {
    sessionId: string
    accessToken: string
}

export class Sensie {
    id: string
    whips: number
    flowing: number
    agreement: number
    sensorData: SensorData
    sessionInfo: SessionInfo

    constructor(whips: number, flowing: number, sensorData: SensorData, sessionInfo: SessionInfo) {
        this.id = "Sensie id will be availabe after the agreement"
        this.whips = whips
        this.flowing = flowing
        this.agreement = 0
        this.sensorData = sensorData
        this.sessionInfo = sessionInfo
    }

    async storeSensieRequest(whipCount: number, flowing: number, agreement: number): Promise<any> {
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

    async setAgreement(agreement: number) {
        this.agreement = agreement
        const resJSON = await this.storeSensieRequest(this.whips, this.flowing, this.agreement)
        this.id = resJSON.data.sensie.id
    }
}