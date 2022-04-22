import { NativeModules, Platform } from 'react-native';
import { accelerometer, gyroscope} from 'react-native-sensors';

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

type WhipCounterReturn = {
  avgFlatCrest: number[],
  whipCount: number
}

// type SensorData = {
//   gyroX: number[];
//   gyroY: number[];
//   gyroZ: number[];
//   accelX: number[];
//   accelY: number[];
//   accelZ: number[];
// };

// export class SensieEngine {
//   accessToken: String;
//   canCalibrate: Boolean;
//   onEnds: (result: Object) => void;
//   sensorData: SensorData;

//   constructor(accessToken = '') {
//     this.accessToken = accessToken;
//     this.canCalibrate = false;
//     this.onEnds = () => {};
//     this.sensorData = {
//       gyroX: [],
//       gyroY: [],
//       gyroZ: [],
//       accelX: [],
//       accelY: [],
//       accelZ: [],
//     };
//   }

//   genSessionId() {
//     return 'sessionID' + Math.random().toString(16).slice(2);
//   }

//   connect() {
//     const ret = new Promise((resolve, reject) => {
//       if (this.accessToken == '') {
//         this.canCalibrate = true;
//         resolve('Successfully connected');
//       } else {
//         reject('Connection failed');
//       }
//     });
//     return ret;
//   }

//   startCalibration(
//     userId: String = 'default',
//     onEnds: (result: Object) => void
//   ): Object {
//     if (userId == 'default' && this.canCalibrate == true) {
//       this.onEnds = onEnds;

//       let calibrationSession = {
//         canCaptureSensie: true,
//         id: this.genSessionId(),
//         currentSensie: {},
//         captureSensie: (
//           flow: Boolean,
//           onSensorData?: (data: SensorData) => {}
//         ) => {
//           const subGyro = gyroscope.subscribe(({ x, y, z}) => {
//             this.sensorData.gyroX.push(x);
//             this.sensorData.gyroY.push(y);
//             this.sensorData.gyroZ.push(z);
//             if (onSensorData) onSensorData(this.sensorData);
//           });
//           const subAcc = accelerometer.subscribe(({ x, y, z }) => {
//             this.sensorData.accelX.push(x);
//             this.sensorData.accelY.push(y);
//             this.sensorData.accelZ.push(z);
//             if (onSensorData) onSensorData(this.sensorData);
//           });

//           setTimeout(async () => {
//             subGyro.unsubscribe();
//             subAcc.unsubscribe();
//             const {whipCount, avgFlatCrest} = await whipCounter({yaw: this.sensorData.gyroZ})

//           }, 3000);
//         },
//       };
//       return calibrationSession;
//     }
//     return {};
//   }
// }
