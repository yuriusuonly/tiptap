// Single entrypoint. Web builds run the landing site,
// Android (and other non-web) builds run the TipTap app.
// Conditional import is compile-time: the unused branch is
// tree-shaken, so web never touches Firebase/AdMob/IAP deps
// and Android never touches flutter_web_plugins.
import 'app_entry.dart' if (dart.library.js_interop) 'site_entry.dart' as entry;

void main() => entry.bootstrap();
