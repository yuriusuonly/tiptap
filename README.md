<img src="images/logo_1024x1024.png" alt="TipTap" width="64px" height="64px" align="right"/>

# TipTap

A mobile application built with Flutter that transforms the way we consume information. Using a high-performance, vertical scrolling feed, users can explore an endless stream of AI-generated, verified facts. No fluff, no fake news—just pure knowledge powered by intelligence.

Endless Discovery: Smooth, gesture-based scrolling experience.

AI-Curated: Dynamically generated content tailored to intrigue.

Dart & Flutter: A cross-platform experience built for performance.

## Code

> Still in closed testing development and not yet publicly released.

Implementing best practices, app architectures, and design patterns for modern cross-platform application.

Such implementation includes the following and may actively change overtime:

#### Patterns and architectures
- [x] Repository-based (pattern) — Centralized data management
  - [ ] Handling Asynchronous, Futures, and Streams
- [ ] Custom UI/UX — Branding and design
  - [ ] Responsive (design) — Dynamic layout for different screen sizes
  - [ ] User Experience — Fluid animations and transitions
  - [ ] Theming — Look and feel customization
- [ ] Overall Optimizations — High performance and scalability
- [ ] CI/CD automation — Continuous integration and deployment

#### Remote services
- [x] Firebase Analytics — App usage monitoring
- [x] Firebase Crashlytics — App crash diagnostics
- [x] Firebase Authentication — Data binding and account synchronization
- [x] Firebase Firestore — Backend database collection
- [x] Firebase AI Logic — Primary content generation
- [x] Firebase Hosting — Homepage presentation

#### Transactions and monetization
- [x] Google AdMob — Content unlocking free service
- [ ] In-app-purchase — Subscriptions and paid services

#### State management
- [x] BLoC (with persistence) — State serves data from repository to the UI

#### UI design and navigation
- [x] GoRouter — Navigation between page views

#### Testing and debugging
- [ ] Not included yet (focusing on the UI aspects first)

#### Localization and translations
- [ ] Not included yet

### Configuration

Almost all commands needed to configure and run the code are under the `.vscode` configurations. Visual Studio Code is our choice of IDE. Just run the specific task to perform the desired action or create a custom one to chain them.

Ensure all package dependencies are installed:

```
flutter pub get
npm install
```

> For Firebase, we use NPM here, but you can use any other package managers.  
> Run `flutter doctor` to check SDKs and platform-specific confugrations.

Create a centralized `.env` file for inlining environment variables.

#### Configuring Firebase

Authenticate to initialize Firebase:

```
npx firebase init
```

Using Flutterfire to automatically configure this for supported platforms.

```
dart run flutterfire_cli:flutterfire configure
```

#### Generating launcher icons

You may add your desired icons under `images`, then generate for all platforms using:

```
dart run flutter_launcher_icons
```

#### Generating spash screens

Under `images` as well, place your splash images, then generate for all platforms using:

```
dart run flutter_native_splash:create
```

#### Running the app

Check available devices with `flutter devices` and replace `<device>` with the target device:

```
flutter run --device-id=<device> --target=lib/main.dart --dart-define-from-file=.env
```

For the web version, specify that the hostname is set to `localhost` for debug development:

```
flutter run \
  --device-id=<device> \
  --target=lib/main.dart \
  --dart-define-from-file=.env \
  --web-hostname=localhost
  --web-port=3000
```

#### Build for deployment

Build a executable release, replace the `<executable>` with target platform:

```
flutter build <executable> --target=lib/main.dart --dart-define-from-file=.env
```

## Documentations

- App Architecture
  - https://docs.flutter.dev/app-architecture
- User Interface
  - https://docs.flutter.dev/ui/widgets
  - https://docs.flutter.dev/ui/navigation
  - https://docs.flutter.dev/cookbook/design/themes
- State Management
  - https://docs.flutter.dev/data-and-backend/state-mgmt/intro
- Firebase
  - https://docs.flutter.dev/data-and-backend/firebase
- Ads
  - https://docs.flutter.dev/resources/ads-overview
- In-app-purchases
  - https://docs.flutter.dev/resources/in-app-purchases-overview
- Testing and Debugging
  - https://docs.flutter.dev/testing/overview
- Internationalization
  - https://docs.flutter.dev/ui/internationalization
- Environment Variables
  - https://dart.dev/libraries/core/environment-declarations
- Optimization
  - https://docs.flutter.dev/perf
- Deployment
  - https://docs.flutter.dev/deployment/android
  - https://docs.flutter.dev/deployment/web
- Continuous Delivery
  - https://docs.flutter.dev/deployment/cd

## Resources

- Dart & Flutter
  - https://dart.dev/
  - https://flutter.dev/
- Animations
  - https://lottie.github.io/
- Design Orchestration
  - https://figma.com
