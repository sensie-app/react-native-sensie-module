# react-native-sensie-module

React Native Sensie SDK

<br/>

## Installation

```sh
npm install react-native-sensie-module
```

<br/>

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
    }
})
```
**result** will be an object with a single property contains **calibration strength**.


### Capturing Sensie
```js
const sensie = await calibrationSession.captureSensie({
    flow,
    onSensorData: (data) => {
    }
})
```

**sensie** will be an object with the following properties:<br />
- **id**: the id of the sensie
- **whips**: the number of whips
- **valid**: true if whips == 3

**flow** is boolean value(true or false)<br />

**onSensorData** is a callback function that will be called every time we have new values from the sensors (optional)<br />

**data** will be an object with the following properties:
- **gyroX**: the gyroscope X axis value
- **gyroY**: the gyroscope Y axis value
- **gyroZ**: the gyroscope Z axis value
- **accelX**: the accelerometer X axis value
- **accelY**: the accelerometer Y axis value
- **accelZ**: the accelerometer Z axis value




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

```
**sensie** object will be an object with the following properties:
- **id**: the id of the sensie
- **whips**: the number of whips
- **flowing**: the result of the evaluation (true or false)

<br />

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

Proprietary Software
