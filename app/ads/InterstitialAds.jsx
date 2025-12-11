import {
    AdEventType,
    InterstitialAd,
    TestIds,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-2512361520457456/1362953981';

const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export const showInterstitialAd = (onFinished) => {
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
};
