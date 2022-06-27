// Types for Sensie Engine

type SensieEngineInit = {
  accessToken: string;
};

type CalibrationInput = {
  userId: string;
  onEnds: (result: Object) => void;
};

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
  flowing: number;
  ratio: number;
};

type CaptureSensieInput = {
  flow: boolean;
  onSensorData?: (data: any) => void;
};

type CaptureEvaluateSensieInput = {
  userId: string;
  onSensorData?: (data: any) => void;
};

enum Agreement {
  Agree = 1,
  Disagree = -1,
  AgreeAfterReflecting = 2,
}

export {
  WhipCounterReturn,
  SensorData,
  EvaluateSensieReturn,
  SensieEngineInit,
  CalibrationInput,
  CaptureSensieInput,
  CaptureEvaluateSensieInput,
  Agreement,
};
