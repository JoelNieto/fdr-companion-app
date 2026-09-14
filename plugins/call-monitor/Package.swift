// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CallMonitor",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "CallMonitor",
            targets: ["CallMonitorPlugin"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-spm.git", branch: "main"),
    ],
    targets: [
        .target(
            name: "CallMonitorPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-spm"),
            ],
            path: "src/ios",
            sources: ["CallMonitorPlugin.swift"],
            publicHeadersPath: "include",
            cSettings: [
                .headerSearchPath("."),
            ]
        ),
    ]
)