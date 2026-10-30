const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withShareIntentAttributes(config) {
    return withAndroidManifest(config, (cfg) => {
        const manifest = cfg.modResults?.manifest;
        if (!manifest) return cfg;
        const app = manifest.application?.[0];
        const activity = app?.activity?.find(
            (a) => a.$?.['android:name'] === '.MainActivity'
        );
        if (!activity) return cfg;

        activity.$['android:launchMode'] = 'singleTask';
        if (!activity.$['android:configChanges']) {
            activity.$['android:configChanges'] = [
                'keyboard', 'keyboardHidden', 'orientation',
                'screenSize', 'screenLayout', 'uiMode', 'locale',
                'layoutDirection', 'smallestScreenSize',
            ].join('|');
        }

        // Ensure intent-filter array exists
        if (!activity['intent-filter']) {
            activity['intent-filter'] = [];
        }

        // Add SEND + image/* if not already present (this is what makes
        // Track Pay appear in Android's share sheet for image shares)
        const hasSendImage = activity['intent-filter'].some((filter) => {
            const actions = filter.action || [];
            const data = filter.data || [];
            return actions.some((a) => a.$?.['android:name'] === 'android.intent.action.SEND')
                && data.some((d) => d.$?.['android:mimeType'] === 'image/*');
        });

        if (!hasSendImage) {
            activity['intent-filter'].push({
                action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
                category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
                data: [{ $: { 'android:mimeType': 'image/*' } }],
            });
        }

        return cfg;
    });
};