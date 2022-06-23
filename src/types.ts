// Types for Sensie Engine

type SensieEngineInit = {
  accessToken: string
}

type CalibrationInit = {
  userId: String
  onEnds: (result: Object) => void
}

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

type EvaluateSensieReturn = {
  flowing: number
  ratio: number
}

type CaptureSensieInput = {
  flow: boolean,
  onSensorData?: (data: any) => {}
}

export { WhipCounterReturn, SensorData, EvaluateSensieReturn, SensieEngineInit, CalibrationInit, CaptureSensieInput };
