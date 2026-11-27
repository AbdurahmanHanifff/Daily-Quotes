# Getting onto Android and iPhone

The phone apps use [Capacitor](https://capacitorjs.com/) 8, which wraps the same code as the web app and adds
reminders, native storage, the share sheet and the Android back button.

## Today, without a store
Host the `www/` folder on any HTTPS host, open it on the phone, then:
- Android (Chrome): menu > Add to Home screen / Install app.
- iPhone (Safari): Share > Add to Home Screen.
Reminders are not available in this web version.

## Android
Requires Node 22+, Android Studio and its SDK.

    npm install
    npm run build
    npx cap add android
    npm run sync
    npx cap open android

The GitHub Actions workflow also builds a **debug APK** (artifact `quote-feed-debug-apk`) for testing on a phone.
A debug APK cannot be published.

## iPhone
Requires a Mac with Xcode.

    npm install
    npm run build
    npx cap add ios
    npm run sync
    npx cap open ios

## Before publishing
- [ ] Finish every check in [SOURCES.md](SOURCES.md).
- [ ] Choose the final app ID in `capacitor.config.json` (`com.abdurahman.quotefeed` is a placeholder). It cannot be changed after publishing.
- [ ] After `cap add`, remove `android/` and `ios/` from `.gitignore` and commit them, so signing, icons and native edits are kept.
- [ ] Create app icons and splash screens from `assets/icon.png` (for example with `@capacitor/assets`).
- [ ] iPhone: add a privacy manifest (`PrivacyInfo.xcprivacy`) declaring required-reason APIs used by the plugins (Preferences uses UserDefaults; check Filesystem's documentation too).
- [ ] Host PRIVACY.md at a public URL with contact details and add it to both store listings. Also link it in the app.
- [ ] Test on real phones: reminder arrives, share image, backup and restore, back button, notches, offline.
- [ ] Complete Google's Data safety form and Apple's App Privacy answers.

## Store rules to plan for
- **Google Play:** personal accounts created after 13 Nov 2023 need a closed test with at least 12 testers opted in for 14 continuous days before applying for production.
  [Google's page](https://support.google.com/googleplay/android-developer/answer/14151465)
- **Apple guideline 4.2:** the app must be more than "a repackaged website". Reminders and native sharing help, but approval is not guaranteed.
  A home screen widget would strengthen the case.
- **Apple 5.1.1:** privacy policy in the store listing and inside the app.
- Developer accounts are paid. Check current fees when you sign up.
  [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)

## Not built yet (suggested order)
1. Home screen widgets (needs native Swift and Kotlin code).
2. More quotes: the smallest sets have 6, so a single-belief reader sees daily repeats within a week.
3. Other languages and right-to-left layout.
4. Optional cloud sync between phones (use backup and restore until then).

Reminders are queued for 30 days and refill each time the app is opened.
