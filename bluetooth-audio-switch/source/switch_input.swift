import CoreAudio
import Foundation

struct AudioDevice {
    let id: AudioDeviceID
    let name: String
    let uid: String
    let transport: UInt32
    let inputChannels: Int
}

enum SwitchInputError: Error, CustomStringConvertible {
    case coreAudio(String, OSStatus)
    case noInputDevices

    var description: String {
        switch self {
        case .coreAudio(let message, let status):
            return "\(message): OSStatus \(status)"
        case .noInputDevices:
            return "No input audio devices were found"
        }
    }
}

func propertyAddress(_ selector: AudioObjectPropertySelector,
                     _ scope: AudioObjectPropertyScope = kAudioObjectPropertyScopeGlobal,
                     _ element: AudioObjectPropertyElement = kAudioObjectPropertyElementMain) -> AudioObjectPropertyAddress {
    AudioObjectPropertyAddress(mSelector: selector, mScope: scope, mElement: element)
}

func check(_ status: OSStatus, _ message: String) throws {
    if status != noErr {
        throw SwitchInputError.coreAudio(message, status)
    }
}

func stringProperty(device: AudioDeviceID, selector: AudioObjectPropertySelector) -> String {
    var address = propertyAddress(selector)
    var value: CFString = "" as CFString
    var size = UInt32(MemoryLayout<CFString>.size)
    let status = AudioObjectGetPropertyData(device, &address, 0, nil, &size, &value)
    if status != noErr {
        return ""
    }
    return value as String
}

func uint32Property(device: AudioDeviceID, selector: AudioObjectPropertySelector) -> UInt32 {
    var address = propertyAddress(selector)
    var value: UInt32 = 0
    var size = UInt32(MemoryLayout<UInt32>.size)
    let status = AudioObjectGetPropertyData(device, &address, 0, nil, &size, &value)
    if status != noErr {
        return 0
    }
    return value
}

func inputChannelCount(device: AudioDeviceID) -> Int {
    var address = propertyAddress(kAudioDevicePropertyStreamConfiguration, kAudioDevicePropertyScopeInput)
    var size: UInt32 = 0
    let sizeStatus = AudioObjectGetPropertyDataSize(device, &address, 0, nil, &size)
    if sizeStatus != noErr || size == 0 {
        return 0
    }

    let rawPointer = UnsafeMutableRawPointer.allocate(
        byteCount: Int(size),
        alignment: MemoryLayout<AudioBufferList>.alignment
    )
    defer { rawPointer.deallocate() }

    let bufferList = rawPointer.bindMemory(to: AudioBufferList.self, capacity: 1)
    let dataStatus = AudioObjectGetPropertyData(device, &address, 0, nil, &size, bufferList)
    if dataStatus != noErr {
        return 0
    }

    return UnsafeMutableAudioBufferListPointer(bufferList).reduce(0) { total, buffer in
        total + Int(buffer.mNumberChannels)
    }
}

func allAudioDevices() throws -> [AudioDevice] {
    var address = propertyAddress(kAudioHardwarePropertyDevices)
    var size: UInt32 = 0

    try check(
        AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &size),
        "Unable to read device list size"
    )

    let count = Int(size) / MemoryLayout<AudioDeviceID>.size
    var ids = [AudioDeviceID](repeating: 0, count: count)

    try check(
        AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &size, &ids),
        "Unable to read device list"
    )

    return ids.map { id in
        AudioDevice(
            id: id,
            name: stringProperty(device: id, selector: kAudioObjectPropertyName),
            uid: stringProperty(device: id, selector: kAudioDevicePropertyDeviceUID),
            transport: uint32Property(device: id, selector: kAudioDevicePropertyTransportType),
            inputChannels: inputChannelCount(device: id)
        )
    }
}

func score(_ device: AudioDevice, preferredName: String?) -> Int {
    guard device.inputChannels > 0 else {
        return -100
    }

    let haystack = "\(device.name) \(device.uid)".lowercased()
    if let preferredName, !preferredName.isEmpty, haystack.contains(preferredName.lowercased()) {
        return 100
    }

    var value = 0
    if device.transport == kAudioDeviceTransportTypeBuiltIn {
        value += 60
    }
    if haystack.contains("microphone") || haystack.contains("built-in") || haystack.contains("builtin") {
        value += 25
    }
    if haystack.contains("bluetooth") || haystack.contains("hfp") || haystack.contains("handsfree") {
        value -= 80
    }
    return value
}

func selectInputDevice(_ device: AudioDevice) throws {
    var address = propertyAddress(kAudioHardwarePropertyDefaultInputDevice)
    var selected = device.id
    try check(
        AudioObjectSetPropertyData(
            AudioObjectID(kAudioObjectSystemObject),
            &address,
            0,
            nil,
            UInt32(MemoryLayout<AudioDeviceID>.size),
            &selected
        ),
        "Unable to set default input device"
    )
}

do {
    let preferredName = ProcessInfo.processInfo.environment["BUILTIN_INPUT_NAME"]
    let devices = try allAudioDevices().filter { $0.inputChannels > 0 }
    guard let selected = devices.max(by: { score($0, preferredName: preferredName) < score($1, preferredName: preferredName) }) else {
        throw SwitchInputError.noInputDevices
    }

    try selectInputDevice(selected)
    print("Default input switched to \(selected.name) (\(selected.inputChannels) input channels)")
} catch {
    fputs("switch_input failed: \(error)\n", stderr)
    exit(1)
}
