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
}
