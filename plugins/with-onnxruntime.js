// plugins/with-onnxruntime.js
// Injects OnnxruntimePackage into MainApplication.kt during `expo prebuild`.
// The package's own app.plugin.js only touches app/build.gradle — it does NOT
// register OnnxruntimePackage() in MainApplication.kt. Without this plugin,
// NativeModules.Onnxruntime is undefined and lib/binding.ts warns
// "Native module not found via NativeModules.Onnxruntime nor TurboModuleRegistry".
const { withMainApplication } = require('@expo/config-plugins');

const IMPORT_ANCHOR = /import com\.facebook\.react\.ReactApplication/;
const PACKAGE_LIST_ANCHOR = /PackageList\(this\)\.packages\.apply \{/;

module.exports = function withOnnxruntime(config) {
  return withMainApplication(config, (config) => {
    let contents = config.modResults.contents;

    if (contents.includes('ai.onnxruntime.reactnative.OnnxruntimePackage')) {
      return config;
    }

    if (!IMPORT_ANCHOR.test(contents)) {
      throw new Error(
        '[with-onnxruntime] Anchor not found: "import com.facebook.react.ReactApplication" ' +
          'in MainApplication.kt. Update IMPORT_ANCHOR in plugins/with-onnxruntime.js.',
      );
    }
    if (!PACKAGE_LIST_ANCHOR.test(contents)) {
      throw new Error(
        '[with-onnxruntime] Anchor not found: "PackageList(this).packages.apply {" ' +
          'in MainApplication.kt. Update PACKAGE_LIST_ANCHOR in plugins/with-onnxruntime.js.',
      );
    }

    contents = contents.replace(
      IMPORT_ANCHOR,
      'import com.facebook.react.ReactApplication\nimport ai.onnxruntime.reactnative.OnnxruntimePackage',
    );
    contents = contents.replace(
      PACKAGE_LIST_ANCHOR,
      'PackageList(this).packages.apply {\n              add(OnnxruntimePackage())',
    );

    config.modResults.contents = contents;
    return config;
  });
};
