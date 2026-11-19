let InterstitialAd, AdEventType, TestIds;
try {
    const ads = require('react-native-google-mobile-ads');
    InterstitialAd = ads.InterstitialAd;
    AdEventType = ads.AdEventType;
    TestIds = ads.TestIds;
} catch (e) {
    // In Expo Go or environments without native ads module
}

const adUnitId = __DEV__ ? TestIds?.INTERSTITIAL || '' : 'ca-app-pub-2512361520457456/1362953981';

let interstitial = null;
if (InterstitialAd && adUnitId) {
    try {
        interstitial = InterstitialAd.createForAdRequest(adUnitId);
    } catch (e) {
        console.warn('Failed to initialize InterstitialAd:', e);
    }
}

export const showInterstitialAd = (onFinished) => {
    if (!interstitial || !AdEventType) {
        if (onFinished) onFinished();
        return;
    }

    try {
        // Load the ad
        interstitial.load();

        // When Ad loads
        const loadedListener = interstitial.addAdEventListener(
            AdEventType.LOADED,
            () => {
                interstitial.show();
            }
        );

        // When Ad closes
        const closedListener = interstitial.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                loadedListener();
                closedListener();
                if (onFinished) onFinished();
            }
        );

        // If Ad errors out
        const errorListener = interstitial.addAdEventListener(
            AdEventType.ERROR,
            () => {
                loadedListener();
                closedListener();
                errorListener();
                if (onFinished) onFinished();
            }
        );
    } catch (e) {
        console.warn('Error showing interstitial ad:', e);
        if (onFinished) onFinished();
    }
};

export default function InterstitialAdsRoute() {
    return null;
}
