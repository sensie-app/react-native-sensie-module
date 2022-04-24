import { NativeModules, Platform } from 'react-native';
import { accelerometer, gyroscope } from 'react-native-sensors';

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

export function multiply(a: number, b: number): Promise<number> {
  return SensieModule.multiply(a, b);
}

export function add(a: number, b: number): Promise<number> {
  return SensieModule.add(a, b);
}

export function subtract(a: number, b: number): Promise<number> {
  return SensieModule.subtract(a, b);
}

export function whipCounter(p: Object): Promise<WhipCounterReturn> {
  return SensieModule.whipCounter(p);
}

// Following lines are interface for native code & utils. No Algorithms are exposed.

type WhipCounterReturn = {
  avgFlatCrest: number[];
  whipCount: number;
};

type SensorData = {
  gyroX: number[];
  gyroY: number[];
  gyroZ: number[];
  accelX: number[];
  accelY: number[];
  accelZ: number[];
};

class CalibrationSession {
  id: String
  currentSensie: Object
  sensorData: SensorData
  sensies: Object[]

  constructor() {
    this.id = this.genSessionId()
    this.currentSensie = {}
    this.sensorData = {
      gyroX: [],
      gyroY: [],
      gyroZ: [],
      accelX: [],
      accelY: [],
      accelZ: [],
    }
    this.sensies = []
  }

  genSessionId() {
    return 'sessionID' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  genSensieId() {
    return 'sensieID' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  captureSensie(flow: Boolean, onSensorData: (data: SensorData) => {}) {
    
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
        
        this.currentSensie = {
          whipCount: whipCount,
          signal: avgFlatCrest,
          sensorData: this.sensorData,
          flow: flow
        }
        this.sensies.push(this.currentSensie); // Store sensie data from sensors

        // send currentSensie data to native part
        // In native part,
        // store sensie using storage logic accumulatively

        this.sensorData = {
          gyroX: [],
          gyroY: [],
          gyroZ: [],
          accelX: [],
          accelY: [],
          accelZ: [],
        }; // Reset sensor data
      }

      const retSensie = {
        id: this.genSensieId(),
        whips: whipCount,
        valid: whipCount == 3,
      }; // Sensie containing the minimal informations for checking validation.

      return retSensie;

    }, 3000);
  }
}

export class SensieEngine {
  accessToken: String;
  canCalibrate: Boolean;
  onEnds: (result: Object) => void;

  constructor(accessToken = '') {
    this.accessToken = accessToken;
    this.canCalibrate = false;
    this.onEnds = () => {};
  }

  connect() {
    const ret = new Promise((resolve, reject) => {
      if (this.accessToken == '') {
        this.canCalibrate = true;
        resolve('Successfully connected');
      } else {
        reject('Connection failed');
      }
    });

    return ret;
  }

  startCalibration (
    userId: String = 'default',
    onEnds: (result: Object) => void
  ): Object {

    if (userId == 'default' && this.canCalibrate == true) {
      this.onEnds = onEnds;
      return new CalibrationSession();
    }
    return {};
    
  }

  resetCalibration() {
    this.onEnds = () => {};
    // Remove sensies in storage and flow change
  }

  canEvaluate() {
    // check number of stored sensies in storage
    // if there are 3 flow and 3 block sensies, return true
  }

  captureSensie() {
    // get objects from storage (It is also important to sort dictionary by time)
    // evaluate using evaluateSensie

    // onEnds, send signal strength
  }
}
