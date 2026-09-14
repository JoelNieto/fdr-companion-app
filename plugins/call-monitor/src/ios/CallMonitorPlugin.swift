import Foundation
import CallKit
import Capacitor

@objc(CallMonitorPlugin)
public class CallMonitorPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CallMonitorPlugin"
    public let jsName = "CallMonitor"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startCall", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addListener", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeAllListeners", returnType: CAPPluginReturnPromise),
    ]
    
    private var callObserver: CXCallObserver?
    private var activeCallUUID: UUID?
    private var targetPhoneNumber: String?
    
    @objc public func startCall(_ call: CAPPluginCall) {
        guard let phoneNumber = call.getString("phoneNumber") else {
            call.reject("Missing phoneNumber parameter")
            return
        }
        
        self.targetPhoneNumber = phoneNumber
        
        // Initialize call observer
        if callObserver == nil {
            callObserver = CXCallObserver()
            callObserver?.setDelegate(self, queue: DispatchQueue.main)
        }
        
        // Open phone call
        let cleanedNumber = phoneNumber.replacingOccurrences(of: "[^0-9+]", with: "", options: .regularExpression)
        guard let url = URL(string: "tel://\(cleanedNumber)") else {
            call.reject("Invalid phone number")
            return
        }
        
        DispatchQueue.main.async {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url) { success in
                    if success {
                        call.resolve()
                    } else {
                        call.reject("Failed to initiate call")
                    }
                }
            } else {
                call.reject("Cannot open tel URL")
            }
        }
    }
    
    @objc public override func addListener(_ call: CAPPluginCall) {
        // Listener registration is handled by Capacitor's event system
        // We just need to ensure the observer is active
        if callObserver == nil {
            callObserver = CXCallObserver()
            callObserver?.setDelegate(self, queue: DispatchQueue.main)
        }
        call.resolve(["callbackId": UUID().uuidString])
    }
    
    @objc public override func removeAllListeners(_ call: CAPPluginCall) {
        callObserver?.setDelegate(nil, queue: nil)
        callObserver = nil
        activeCallUUID = nil
        targetPhoneNumber = nil
        call.resolve()
    }
    
    private func notifyCallState(_ state: String, phoneNumber: String? = nil) {
        var stateDict: [String: Any] = ["state": state]
        if let phoneNumber = phoneNumber {
            stateDict["phoneNumber"] = phoneNumber
        }
        notifyListeners("callState", data: stateDict)
    }
}

extension CallMonitorPlugin: CXCallObserverDelegate {
    public func callObserver(_ callObserver: CXCallObserver, callChanged call: CXCall) {
        if call.hasEnded {
            if call.uuid == activeCallUUID {
                notifyCallState("ended", phoneNumber: targetPhoneNumber)
                activeCallUUID = nil
                targetPhoneNumber = nil
            }
        } else if call.hasConnected {
            if activeCallUUID == nil {
                activeCallUUID = call.uuid
                notifyCallState("started", phoneNumber: targetPhoneNumber)
            }
        }
        
        // Handle failed calls
        if call.isOnHold && !call.hasConnected {
            // Call might have failed to connect
            if call.uuid == activeCallUUID {
                notifyCallState("failed", phoneNumber: targetPhoneNumber)
                activeCallUUID = nil
                targetPhoneNumber = nil
            }
        }
    }
}