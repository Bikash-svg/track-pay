const { withAndroidManifest } = require('@expo/config-plugins');

// Permissions to forcibly strip from the merged AndroidManifest.
// - INTERNET: Path B — no network use (GUARDRAILS §2.2)
// - Storage family: no storage-wide access (GUARDRAILS §3)
//   Shared files arrive as content URIs granted via intent; no manifest
//   permission is needed to read them. OCR reads via the same grant.
const STRIP = [
  'android.permission.INTERNET',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.MANAGE_EXTERNAL_STORAGE',
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.ACCESS_MEDIA_LOCATION',
];

module.exports = function withStripInternet(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    // 1. Ensure xmlns:tools is declared (required for tools:node)
    if (!manifest.$) manifest.$ = {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // 2. Strip any matching entries from source manifest (defensive)
    if (!Array.isArray(manifest['uses-permission'])) {
      manifest['uses-permission'] = [];
    }
    manifest['uses-permission'] = manifest['uses-permission'].filter(
      (perm) => !STRIP.includes(perm.$?.['android:name'])
    );

    // 3. Add tools:node="remove" so the merger strips them even when
    //    library AARs declare them
    for (const perm of STRIP) {
      manifest['uses-permission'].push({
        $: {
          'android:name': perm,
          'tools:node': 'remove',
        },
      });
    }

    return cfg;
  });
};