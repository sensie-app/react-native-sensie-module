package com.reactnativesensiemodule

import com.facebook.react.bridge.*
import com.sensie.*
import com.sensie.sensielibrary.eucDistance
import com.sensie.sensielibrary.evaluateSensie
import com.sensie.sensielibrary.signalStrength
import com.sensie.sensielibrary.whipCounter

class SensieModuleModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SensieModule"
    }

    // Example method
    // See https://reactnative.dev/docs/native-modules-android
    @ReactMethod
    fun multiply(a: Int, b: Int, promise: Promise) {

      promise.resolve(a * b)

    }

    @ReactMethod
    fun whipCounter(param: ReadableMap, promise: Promise){
      promise.resolve(whipCounter(param))
    }

    @ReactMethod
    fun evaluateSensie(sensie: ReadableMap, sensies: ReadableArray, promise: Promise){
      promise.resolve(evaluateSensie(sensie, sensies))
    }

    @ReactMethod
    fun signalStrength(sensies: ReadableArray, promise: Promise){
      promise.resolve(signalStrength(sensies))
    }
}
