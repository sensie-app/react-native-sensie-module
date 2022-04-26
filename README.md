# react-native-sensie-module

&nbsp; React Native Sensie SDK MVP version for iOS.



## Installation

```sh
npm install react-native-sensie-module
```
&nbsp;&nbsp; Install via npm.


## Usage

### Import
```js
import { SensieEngine, CalibrationSession } from "react-native-sensie-module";
```
&nbsp;&nbsp; Import **SensieEngine** and **CalibrationSession** class.

### Initination
```js
const s = new SensieEngine({accessToken: '[Token]'})
```
&nbsp;&nbsp; Pass the generated token for Sensie SDK.

### Connection
```js
await s.connect()
```
&nbsp;&nbsp; A method to establish a connection. It should return a promise that will tell us if the connection was successful.<br/>
&nbsp;&nbsp; Also, **canRecalibrate** property will be set depending on stored sensies in storage.


### Calibration
```js
calibrationSession = s.startCalibration({
    userId,
    onEnds: (result) => {
    }
})
```
&nbsp;&nbsp; **result** will be an object with a single property contains **calibration strength**.


### Capturing Sensie
```js
const sensie = await calibrationSession.captureSensie({
    flow,
    onSensorData: (data) => {
    }
})
```

&nbsp;&nbsp; **sensie** will be an object with the following properties:<br />
- **id**: the id of the sensie
- **whips**: the number of whips
- **valid**: true if whips == 3

&nbsp;&nbsp; **flow** is boolean value(true or false)<br />

&nbsp;&nbsp; **onSensorData** is a callback function that will be called every time we have new values from the sensors (optional)<br />

&nbsp;&nbsp; **data** will be an object with the following properties:
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
&nbsp;&nbsp; Reset storage if you want to recalibrate.

### Evaluation
```js
const sensie = await s.captureSensie({
  userId,
  onSensorData: (data) => {}, // (optional)
});

```
&nbsp;&nbsp; **sensie** object will be an object with the following properties:
- **id**: the id of the sensie
- **whips**: the number of whips
- **flowing**: the result of the evaluation (true or false)

<br />

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

Proprietary Software
