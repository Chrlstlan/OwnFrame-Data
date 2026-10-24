# OCR runtime assets

Binary models used by the OwnFrame Overwolf app for relic-reward OCR.
The ONNX models are **not** shipped inside the OPK — the app downloads them on
first warm-up and caches them under the Overwolf extension appData folder
(`%AppData%\Roaming\Overwolf\<UID>\ocr-assets\`), which is removed when the
user uninstalls the app.

| File | Purpose |
| --- | --- |
| `reward_tile.onnx` | YOLOv8 tile detector |
| `theme_classifier.onnx` | MobileNetV2 UI-theme classifier (20 themes, incl. Drippy) |
| `tessdata/eng.traineddata` | Tesseract English LSTM model — downloaded by app versions up to 0.4.6 only |
| `tessdata/deu.traineddata` | Tesseract German LSTM model — downloaded by app versions up to 0.4.6 only |
| `manifest.json` | Paths + SHA-256 checksums (documentation; the app pins its own copy) |

From app version 0.5.0 on, a single fast Tesseract model ships inside the OPK
and reads every Latin-script game language, so `tessdata/` is no longer
downloaded. The files stay here because older installs pin this repo's
commits and still fetch them.

The app downloads these files from one **fixed commit** of this repo and
checks them against SHA-256 values **compiled into its OCR DLL**
(`OwnFrame-App/native/OwnFrameOcr/OcrAssetInstaller.cs`). A push to `main`
alone therefore never changes what installed apps load.

## Updating a model

1. Replace the file(s).
2. Recompute SHA-256 and `bytes` in `manifest.json`.
3. Commit + push (or bump via the usual OwnFrame sync flow).
4. In OwnFrame-App, set `AssetCommit` in `OcrAssetInstaller.cs` to that
   commit and update the hashes there, then ship an app update. Installs
   re-download on the next warm-up once the cached checksum no longer
   matches.

Do not edit these binaries by hand without re-running the app OCR eval
corpus (`npm run eval:ocr` in OwnFrame-App).
