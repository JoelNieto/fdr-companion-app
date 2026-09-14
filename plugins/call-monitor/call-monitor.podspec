Pod::Spec.new do |s|
  s.name             = 'CallMonitor'
  s.version          = '1.0.0'
  s.summary          = 'Capacitor plugin to monitor phone call state using CXCallObserver on iOS'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.homepage         = 'https://github.com/fieldcompanion/call-monitor'
  s.author           = { 'Field Companion' => 'dev@fieldcompanion.app' }
  s.source           = { :git => 'https://github.com/fieldcompanion/call-monitor', :tag => s.version.to_s }
  s.ios.deployment_target = '15.0'
  s.swift_version    = '5.9'
  s.source_files     = 'src/ios/**/*.{swift,h,m}'
  s.dependency 'Capacitor'
  s.frameworks       = 'CallKit'
end