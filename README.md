# react-native-sensie-module

&nbsp; React Native Sensie SDK. <br/>
&nbsp; [Go To The Docs](https://sensie-app.github.io/react-native-sensie-module/)


## Installation

&nbsp;&nbsp; Install via yarn. Link it and install dependencies for ios.

```sh
yarn add react-native-sensie-module
npx react-native link
cd ios && pod install
```



## Usage

### Import
&nbsp;&nbsp; Import **SensieEngine** and **CalibrationSession** class.
```js
import { SensieEngine } from "react-native-sensie-module";
```

### Initination
&nbsp;&nbsp; Pass the generated token for Sensie SDK.
```js
const s = new SensieEngine({accessToken: '[Token]'})
```

### Connection
&nbsp;&nbsp; A method to establish a connection. It should return a promise that will tell us if the connection was successful.<br/>
```js
await s.connect()
```
&nbsp;&nbsp; Also, **canRecalibrate** property will be set depending on stored sensies in storage.


### Calibration
```js
calibrationSession = await s.startCalibration({
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
&nbsp;&nbsp; Reset storage if you want to recalibrate.
```js
await s.resetCalibration();
```


### Evaluation
```js
await s.startEvaluation(userId) // creation of evaluation session

const sensie = await s.captureSensie({
  userId,
  onSensorData: (data) => {}, // (optional)
});

```
&nbsp;&nbsp; **sensie** object will be an object with the following properties:
- **id**: the id of the sensie but undefied yet.
- **whips**: the number of whips
- **flowing**: the result of the evaluation (true or false)
- **setAgreement**: Method for setting agreement. Sensie id will be set as soon as the agrement value is set. Agreement enum is included in the index.tsx.



### Setting agreement
```js
enum Agreement {
  Agree = 1,
  Disagree = -1,
  AgreeAfterReflecting = 2,
}

sensie.setAgreement(Agreement.Agree)
```
<br />

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

Proprietary Software
