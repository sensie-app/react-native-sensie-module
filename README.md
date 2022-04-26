# react-native-sensie-module

React Native Sensie SDK

## Installation

```sh
npm install react-native-sensie-module
```

## Usage

### Import
```js
import { SensieEngine, CalibrationSession } from "react-native-sensie-module";
```

### Initination
```js
const s = new SensieEngine({accessToken: '[Token]'})
```

### Connection
```js
await s.connect()
```

### Calibration
```js
calibrationSession = s.startCalibration({
    userId,
    onEnds: (result) => {
        // result will be an object with a single property:
        // - calibration strength: numeric value
    }
})
```
### Capturing Sensie
```js
const sensie = await calibrationSession.captureSensie({
    flow, // true or false
    onSensorData: (data) => {
        // data will be an object with the following properties:
        // - gyroX: the gyroscope X axis value
        // - gyroY: the gyroscope Y axis value
        // - gyroZ: the gyroscope Z axis value
        // - accelX: the accelerometer X axis value
        // - accelY: the accelerometer Y axis value
        // - accelZ: the accelerometer Z axis value
    } // a callback function that will be called every time we have new values from the sensors (optional)
})

// sensie will be an object with the following properties:
// - id: the id of the sensie
// - whips: the number of whips
// - valid: true if whips == 3
```
### Resetting
```js
s.resetCalibration();
```
### Evaluation
```js
const sensie = await s.captureSensie({
  userId,
  onSensorData: (data) => {}, // (optional)
});

// sensie object will be an object with the following properties:
// - id: the id of the sensie
// - whips: the number of whips
// - flowing: the result of the evaluation (true or false)

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

Proprietary Software
