# Google login return on Android and iOS

The app uses `com.gepefe.app://login-callback`. The JavaScript listener cannot register this scheme with the operating system. This checkout has no `android/` or `ios/` project, so complete the following in the native projects on your computer.

1. In Supabase → Authentication → URL Configuration → Redirect URLs, allow exactly `com.gepefe.app://login-callback`. Leave the Google Cloud redirect pointed at Supabase's HTTPS auth callback, not the custom scheme.
2. Inside the main activity in `android/app/src/main/AndroidManifest.xml`, add:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="com.gepefe.app" android:host="login-callback" />
</intent-filter>
```

3. In `ios/App/App/Info.plist`, merge this entry into existing URL types (do not remove other schemes):

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array><string>com.gepefe.app</string></array>
    </dict>
</array>
```

4. Pull the latest project, run `npm install`, `npm run build`, then `npx cap sync`, and rebuild/reinstall the native app. Sync alone does not add the custom scheme.
5. On a physical device, test Google login while the app is open and when it starts from the callback. Then test a journal link, PDF preview and PDF download. Capacitor Browser uses an Android Custom Tab / iOS Safari View Controller; system browser branding or an optional “open in browser” menu is normal, but the initial document should open in that app-associated window.

The current Capacitor configuration loads the Lovable preview URL. Opening that URL directly in the phone browser is web mode, not native mode. Plugin changes require a rebuilt native app; a web page refresh is not enough.

Guide: https://lovable.dev/blog/mobile-app-capacitor