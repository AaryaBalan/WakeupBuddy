import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import AppText from '../../components/AppText';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/premium.styles';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';

export default function PremiumScreen() {
    const router = useRouter();

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Premium</AppText>
                <View style={{ width: 24 }} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Crown Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="diamond" size={64} color={NEON} />
                    </View>
                    <View style={styles.sparkle1}>
                        <Ionicons name="sparkles" size={20} color={NEON} />
                    </View>
                    <View style={styles.sparkle2}>
                        <Ionicons name="sparkles" size={16} color="#fff" />
                    </View>
                </View>

                {/* Title */}
                <AppText style={styles.title}>WakeupBuddy Premium</AppText>
                <AppText style={styles.subtitle}>Unlock the full potential</AppText>

                {/* Message Card */}
                <View style={styles.messageCard}>
                    <View style={styles.messageIconRow}>
                        <Ionicons name="gift-outline" size={24} color={NEON} />
                    </View>
                    <AppText style={styles.messageTitle}>Enjoy Free Access!</AppText>
                    <AppText style={styles.messageText}>
                        We're currently offering all features completely free.
                        Premium subscriptions may be introduced in the future with
                        exclusive benefits.
                    </AppText>
                </View>

                {/* Features Preview */}
                <View style={styles.featuresContainer}>
                    <AppText style={styles.featuresTitle}>Current Free Features</AppText>
                    {[
                        { icon: 'alarm-outline', text: 'Unlimited Alarms' },
                        { icon: 'people-outline', text: 'Wake Buddies' },
                        { icon: 'trophy-outline', text: 'Leaderboards & Ranks' },
                        { icon: 'flame-outline', text: 'Streaks & Achievements' },
                        { icon: 'analytics-outline', text: 'Statistics & Insights' },
                    ].map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={styles.featureIconBg}>
                                <Ionicons name={feature.icon} size={18} color={NEON} />
                            </View>
                            <AppText style={styles.featureText}>{feature.text}</AppText>
                            <Ionicons name="checkmark-circle" size={20} color={NEON} />
                        </View>
                    ))}
                </View>

                {/* Footer Note */}
                <View style={styles.footerNote}>
                    <Ionicons name="information-circle-outline" size={16} color="#666" />
                    <AppText style={styles.footerText}>
                        We'll notify you when premium features become available
                    </AppText>
                </View>
            </View>
        </ScreenWrapper>
    );
}
