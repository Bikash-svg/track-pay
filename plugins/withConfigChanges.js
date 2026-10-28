const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withConfigChanges(config) {
  return withAndroidManifest(config, (cfg) => {
    const activities = cfg.modResults.manifest.application?.[0]?.activity;
    const main = activities?.find(
      (a) => a.$?.['android:name'] === '.MainActivity'
    );
    if (!main) return cfg;

    const required = [
      'keyboard',
      'keyboardHidden',
      'orientation',
      'screenSize',
      'screenLayout',
      'uiMode',
      'locale',
      'layoutDirection',
      'smallestScreenSize',
    ];

    const current = (main.$['android:configChanges'] || '')
      .split('|')
      .filter(Boolean);
    main.$['android:configChanges'] = Array.from(
      new Set([...current, ...required])
    ).join('|');

    if (!main.$['android:launchMode']) {
      main.$['android:launchMode'] = 'singleTask';
    }

    return cfg;
  });
};