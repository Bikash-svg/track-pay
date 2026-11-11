// plugins/with-rnfs.js
// @dr.pogodin/react-native-fs omits the "react-native" field in package.json,
// so neither RN CLI nor Expo's autolinking finds it. This plugin manually wires
// all three native touchpoints: settings.gradle, app/build.gradle, MainApplication.kt.
const { withSettingsGradle, withAppBuildGradle, withMainApplication } = require('@expo/config-plugins');

const RNFS_DIR = 'node_modules/@dr.pogodin/react-native-fs/android';
const GRADLE_PROJECT = 'dr-pogodin_react-native-fs';
const CLASS_PKG = 'com.drpogodin.reactnativefs.ReactNativeFsPackage';

module.exports = function withRnfs(config) {
  // 1. settings.gradle — include the subproject
  config = withSettingsGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes(`':${GRADLE_PROJECT}'`)) return config;
    contents += `\ninclude ':${GRADLE_PROJECT}'\nproject(':${GRADLE_PROJECT}').projectDir = new File(rootProject.projectDir, '../${RNFS_DIR}')\n`;
    config.modResults.contents = contents;
    return config;
  });

  // 2. app/build.gradle — add implementation dependency
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('[with-rnfs] app/build.gradle is not groovy');
    }
    let contents = config.modResults.contents;
    if (contents.includes(`project(':${GRADLE_PROJECT}')`)) return config;
    const anchor = /^dependencies[ \t]*\{[ \t]*$/m;
    if (!anchor.test(contents)) {
      throw new Error('[with-rnfs] could not find "dependencies {" anchor in app/build.gradle');
    }
    contents = contents.replace(anchor, `dependencies {\n    implementation project(':${GRADLE_PROJECT}')`);
    config.modResults.contents = contents;
    return config;
  });

  // 3. MainApplication.kt — import + register
  config = withMainApplication(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes(CLASS_PKG)) return config;

    const IMPORT_ANCHOR = /import com\.facebook\.react\.ReactApplication/;
    const PACKAGE_LIST_ANCHOR = /PackageList\(this\)\.packages\.apply \{/;
    if (!IMPORT_ANCHOR.test(contents)) {
      throw new Error('[with-rnfs] anchor "import com.facebook.react.ReactApplication" missing');
    }
    if (!PACKAGE_LIST_ANCHOR.test(contents)) {
      throw new Error('[with-rnfs] anchor "PackageList(this).packages.apply {" missing');
    }
    contents = contents.replace(
      IMPORT_ANCHOR,
      'import com.facebook.react.ReactApplication\nimport com.drpogodin.reactnativefs.ReactNativeFsPackage',
    );
    contents = contents.replace(
      PACKAGE_LIST_ANCHOR,
      'PackageList(this).packages.apply {\n              add(ReactNativeFsPackage())',
    );
    config.modResults.contents = contents;
    return config;
  });

  return config;
};
