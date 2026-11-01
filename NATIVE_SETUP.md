# Google login return on Android and iOS

The app uses `br.com.gepefe.app://login-callback`. The JavaScript listener cannot register this scheme with the operating system. The Android project is in `android/`; this checkout has no iOS project.

1. In Supabase → Authentication → URL Configuration → Redirect URLs, allow exactly `br.com.gepefe.app://login-callback`. Leave the Google Cloud redirect pointed at Supabase's HTTPS auth callback, not the custom scheme.
2. Inside the main activity in `android/app/src/main/AndroidManifest.xml`, add:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="br.com.gepefe.app" android:host="login-callback" />
</intent-filter>
```

3. In `ios/App/App/Info.plist`, merge this entry into existing URL types (do not remove other schemes):

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array><string>br.com.gepefe.app</string></array>
    </dict>
</array>
```

4. Pull the latest project, run `npm install`, `npm run build`, then `npx cap sync`, and rebuild/reinstall the native app. Sync alone does not add the custom scheme.
5. On a physical device, test Google login while the app is open and when it starts from the callback. Then test a journal link, PDF preview and PDF download. Capacitor Browser uses an Android Custom Tab / iOS Safari View Controller; system browser branding or an optional “open in browser” menu is normal, but the initial document should open in that app-associated window.

The Capacitor configuration uses bundled `dist` assets without a remote `server.url`, allowing cold offline startup. Opening the website in a phone browser is web mode, not native mode. Plugin changes require a rebuilt native app; a web page refresh is not enough.

## Native offline PDFs

Update the local project from the connected repository, run `npm install`, `npm run build`, then `npx cap sync`, and rebuild/reinstall the app. Filesystem and Network plugins must be included in the new installation. No web service worker is used.

On the native device, save a real PDF using the publication download icon. Confirm it appears in Baixados. Enable airplane mode: the app should navigate to Baixados; open the PDF and turn pages. Force-close and reopen while offline, confirm the PDF remains readable, then remove it and confirm it stays removed after another restart. On Chrome/Safari and desktop browsers, Baixados and remove-download controls must never appear; opening /baixados returns to the home page and losing connectivity never redirects there. Remote authentication, news and unsaved publications still require internet. Downloads stay on this device until removed or app data is cleared.

Guide: https://lovable.dev/blog/mobile-app-capacitor
