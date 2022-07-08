import Foundation
import SensieFramework
@objc(SensieModule)
class SensieModule: NSObject {

    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a*b)
    } // for testing
    @objc(add:withB:withResolver:withRejecter:)
    func add(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a+b)
    } // for testing
    @objc(subtract:withB:withResolver:withRejecter:)
    func subtract(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(a-b)
    } // for testing
    
    @objc(whipCounter:withResolver:withRejecter:)
    func whipCounter(p: NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(SensieFramework.whipCounter(param: p))
    }
    @objc(evaluateSensie:withSensies:withResolver:withRejecter:)
    func evaluateSensie(sensie: NSDictionary, sensies: [NSDictionary], resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        guard let sensieDic = sensie as? [String: Any],
              let sensiesDic = sensies as? [[String: Any]] else {
            return
        }
        resolve(SensieFramework.evaluateSensie(sensie: sensieDic, sensies: sensiesDic))
    }
    @objc(signalStrength:withResolver:withRejecter:)
    func signalStrength(sensies: [NSDictionary], resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        guard let sensiesDic = sensies as? [[String: Any]] else {
            return
        }
        resolve(SensieFramework.signalStrength(sensies: sensiesDic))
    }
}
