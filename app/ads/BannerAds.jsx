import { useRef, useState } from 'react';
import { Platform, View } from 'react-native';

// Safely import ads library - may fail in some builds
let BannerAd, BannerAdSize, TestIds, useForeground;
try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
    TestIds = ads.TestIds;
    useForeground = ads.useForeground;
} catch (e) {
    console.warn('Google Mobile Ads not available:', e);
}

const adUnitId = __DEV__ ? TestIds?.ADAPTIVE_BANNER || '' : 'ca-app-pub-2512361520457456/9617042041';

function BannerAds() {
    const bannerRef = useRef(null);
    const [adFailed, setAdFailed] = useState(false);

    // If ads library not available, return empty
    if (!BannerAd || !BannerAdSize) {
        return null;
    }

    // (iOS) WKWebView can terminate if app is in a "suspended state"
    if (useForeground) {
        useForeground(() => {
            Platform.OS === 'ios' && bannerRef.current?.load();
        });
    }

    if (adFailed) {
        return null;
    }

    return (
        <View>
            <BannerAd
                ref={bannerRef}
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                onAdFailedToLoad={(error) => {
                    console.warn('Ad failed to load:', error);
                    setAdFailed(true);
                }}
            />
        </View>
    );
}

export default BannerAds;
