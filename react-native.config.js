// react-native.config.js
// @dr.pogodin/react-native-fs omits the "react-native" field in package.json,
// so RN CLI autolinking skips it. This tells autolinking where the Android
// subproject lives and which class registers it.
module.exports = {
  dependencies: {
    '@dr.pogodin/react-native-fs': {
      platforms: {
        android: {
          sourceDir: 'node_modules/@dr.pogodin/react-native-fs/android',
          packageImportPath: 'import com.drpogodin.reactnativefs.ReactNativeFsPackage;',
          packageInstance: 'new ReactNativeFsPackage()',
        },
      },
    },
  },
};
