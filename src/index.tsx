import { NativeModules, Platform } from 'react-native';
import type { WhipCounterReturn, EvaluateSensieReturn } from './types';
export { SensieEngine } from './sensieEngine';
export { CalibrationSession } from './calibrationSession';
export { Sensie } from './sensie';

export enum Agreement {
  Agree = 1,
  Disagree = -1,
  AgreeAfterReflecting = 2,
}

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

export function evaluateSensie(
  sensie: Object,
  sensies: Array<Object>
): Promise<EvaluateSensieReturn> {
  return SensieModule.evaluateSensie(sensie, sensies);
}

export function siganlStrength(sensies: Array<Object>): Promise<number> {
  return SensieModule.siganlStrength(sensies);
}
