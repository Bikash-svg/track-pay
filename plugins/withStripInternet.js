const { withAndroidManifest } = require('@expo/config-plugins');

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

    if (!manifest.$) manifest.$ = {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    if (!Array.isArray(manifest['uses-permission'])) {
      manifest['uses-permission'] = [];
    }
    manifest['uses-permission'] = manifest['uses-permission'].filter(
      (perm) => !STRIP.includes(perm.$?.['android:name'])
    );

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