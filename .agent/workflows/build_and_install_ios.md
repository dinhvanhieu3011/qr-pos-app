---
description: Build and install iOS app on iPhone "Hieu"
---
1. Build the archive
// turbo
```bash
xcodebuild -workspace ios/phmbnhng.xcworkspace -scheme phmbnhng -configuration Release -destination 'generic/platform=iOS' -archivePath ios/build/phmbnhng.xcarchive archive
```

2. Export the IPA
// turbo
```bash
xcodebuild -exportArchive -archivePath ios/build/phmbnhng.xcarchive -exportOptionsPlist ios/ExportOptions.plist -exportPath ios/build/output
```

3. Install on device "Hieu"
// turbo
```bash
xcrun devicectl device install app --device B6DA1D14-C4F2-5A68-90BB-44B8BCF747A1 ios/build/output/phmbnhng.ipa
```
