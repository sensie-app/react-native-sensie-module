// Types for Sensie Engine

type SensieEngineInit = {
  accessToken: String
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

export { WhipCounterReturn, SensorData, EvaluateSensieReturn, SensieEngineInit };
