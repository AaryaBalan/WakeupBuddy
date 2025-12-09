import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import { useUser } from '../../contexts/UserContext';
import styles from '../../styles/premium.styles';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';

export default function PremiumScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [selectedBilling, setSelectedBilling] = useState('yearly'); // 'monthly' or 'yearly'
    const [selectedPlan, setSelectedPlan] = useState('premium'); // 'basic' or 'premium'

    const plans = {
        basic: {
            name: 'Basic',
            subtitle: 'Get started',
            features: [
                { text: '30 stranger matches/month', icon: 'people-outline', included: true },
                { text: '15 buddy requests/month', icon: 'person-add-outline', included: true },
                { text: 'Standard alarm features', icon: 'alarm-outline', included: true },
                { text: 'Contains ads', icon: 'megaphone-outline', included: true },
                { text: 'Limited features', icon: 'lock-closed-outline', included: true },
            ],
            price: 'Free',
            period: '',
            highlight: false,
        },
        premium: {
            name: 'Premium',
            subtitle: 'Best value',
            features: [
                { text: 'Unlimited stranger matches', icon: 'people', included: true },
                { text: 'Unlimited buddy requests', icon: 'person-add', included: true },
                { text: 'All alarm features', icon: 'alarm', included: true },
                { text: 'No ads', icon: 'eye-off-outline', included: true },
                { text: 'Priority support', icon: 'headset-outline', included: true },
                { text: 'Early access to new features', icon: 'sparkles-outline', included: true },
            ],
            monthlyPrice: '₹199',
            yearlyPrice: '₹1,999',
            yearlySavings: 'Save ₹389/year',
            highlight: true,
        },
    };

    const handlePurchase = () => {
        // TODO: Implement actual purchase logic with in-app purchases
        router.push('/(tabs)/profile')
    };

    const renderFeatureItem = (feature, index, isPremiumPlan) => (
        <View key={index} style={styles.featureItem}>
            <View style={[
                styles.featureIconContainer,
                feature.included ? styles.featureIconIncluded : styles.featureIconExcluded,
                isPremiumPlan && feature.included && styles.featureIconPremium
            ]}>
                <Ionicons
                    name={feature.included ? 'checkmark' : 'close'}
                    size={14}
                    color={feature.included ? '#000' : '#666'}
                />
            </View>
            <AppText style={[
                styles.featureText,
                !feature.included && styles.featureTextExcluded,
                feature.isNegative && styles.featureTextNegative
            ]}>
                {feature.text}
            </AppText>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>Premium Plans</AppText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.crownContainer}>
                        <View style={styles.crownGradient}>
                            <Ionicons name="diamond" size={32} color="#000" />
                        </View>
                    </View>
                    <AppText style={styles.heroTitle}>Upgrade Your Wake-Up Experience</AppText>
                    <AppText style={styles.heroSubtitle}>
                        Choose the plan that's right for you
                    </AppText>
                </View>

                {/* Billing Toggle */}
                <View style={styles.billingToggle}>
                    <TouchableOpacity
                        style={[
                            styles.billingOption,
                            selectedBilling === 'monthly' && styles.billingOptionActive
                        ]}
                        onPress={() => setSelectedBilling('monthly')}
                    >
                        <AppText style={[
                            styles.billingText,
                            selectedBilling === 'monthly' && styles.billingTextActive
                        ]}>
                            Monthly
                        </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.billingOption,
                            selectedBilling === 'yearly' && styles.billingOptionActive
                        ]}
                        onPress={() => setSelectedBilling('yearly')}
                    >
                        <AppText style={[
                            styles.billingText,
                            selectedBilling === 'yearly' && styles.billingTextActive
                        ]}>
                            Yearly
                        </AppText>
                        <View style={styles.saveBadge}>
                            <AppText style={styles.saveBadgeText}>-16%</AppText>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Plans Container */}
                <View style={styles.plansContainer}>
                    {/* Basic Plan Card */}
                    <TouchableOpacity
                        style={[
                            styles.planCard,
                            selectedPlan === 'basic' && styles.planCardSelected
                        ]}
                        onPress={() => setSelectedPlan('basic')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.planHeader}>
                            <View>
                                <AppText style={styles.planName}>{plans.basic.name}</AppText>
                                <AppText style={styles.planSubtitle}>{plans.basic.subtitle}</AppText>
                            </View>
                            <View style={[
                                styles.radioButton,
                                selectedPlan === 'basic' && styles.radioButtonSelected
                            ]}>
                                {selectedPlan === 'basic' && (
                                    <View style={styles.radioButtonInner} />
                                )}
                            </View>
                        </View>

                        <View style={styles.priceContainer}>
                            <AppText style={styles.price}>{plans.basic.price}</AppText>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.featuresContainer}>
                            {plans.basic.features.map((feature, index) =>
                                renderFeatureItem(feature, index, false)
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Premium Plan Card */}
                    <TouchableOpacity
                        style={[
                            styles.planCard,
                            styles.planCardPremium,
                            selectedPlan === 'premium' && styles.planCardSelected
                        ]}
                        onPress={() => setSelectedPlan('premium')}
                        activeOpacity={0.8}
                    >
                        {/* Recommended Badge */}
                        <View style={styles.recommendedBadge}>
                            <Ionicons name="star" size={12} color="#000" />
                            <AppText style={styles.recommendedText}>RECOMMENDED</AppText>
                        </View>

                        <View style={styles.planHeader}>
                            <View>
                                <AppText style={[styles.planName, styles.planNamePremium]}>
                                    {plans.premium.name}
                                </AppText>
                                <AppText style={styles.planSubtitle}>{plans.premium.subtitle}</AppText>
                            </View>
                            <View style={[
                                styles.radioButton,
                                styles.radioButtonPremium,
                                selectedPlan === 'premium' && styles.radioButtonSelected
                            ]}>
                                {selectedPlan === 'premium' && (
                                    <View style={[styles.radioButtonInner, styles.radioButtonInnerPremium]} />
                                )}
                            </View>
                        </View>

                        <View style={styles.priceContainer}>
                            <AppText style={[styles.price, styles.pricePremium]}>
                                {selectedBilling === 'monthly' ? plans.premium.monthlyPrice : plans.premium.yearlyPrice}
                            </AppText>
                            <AppText style={styles.pricePeriod}>
                                /{selectedBilling === 'monthly' ? 'month' : 'year'}
                            </AppText>
                        </View>

                        {selectedBilling === 'yearly' && (
                            <View style={styles.savingsContainer}>
                                <AppText style={styles.savingsText}>{plans.premium.yearlySavings}</AppText>
                            </View>
                        )}

                        <View style={[styles.divider, styles.dividerPremium]} />

                        <View style={styles.featuresContainer}>
                            {plans.premium.features.map((feature, index) =>
                                renderFeatureItem(feature, index, true)
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Feature Comparison */}
                <View style={styles.comparisonSection}>
                    <AppText style={styles.comparisonTitle}>Why Go Premium?</AppText>

                    <View style={styles.comparisonCard}>
                        <View style={styles.comparisonRow}>
                            <View style={styles.comparisonFeature}>
                                <AppText style={styles.comparisonFeatureText}>Feature</AppText>
                            </View>
                            <View style={styles.comparisonPlan}>
                                <AppText style={styles.comparisonPlanText}>Basic</AppText>
                            </View>
                            <View style={styles.comparisonPlan}>
                                <AppText style={[styles.comparisonPlanText, styles.comparisonPremiumText]}>Premium</AppText>
                            </View>
                        </View>

                        <View style={styles.comparisonDivider} />

                        {[
                            { feature: 'Stranger Matches', basic: '30/mo', premium: 'Unlimited' },
                            { feature: 'Buddy Requests', basic: '15/mo', premium: 'Unlimited' },
                            { feature: 'Ad-Free Experience', basic: '-', premium: 'Yes' },
                            { feature: 'Priority Support', basic: '-', premium: 'Yes' },
                            { feature: 'Early Features', basic: '-', premium: 'Yes' },
                        ].map((item, index) => (
                            <View key={index}>
                                <View style={styles.comparisonRow}>
                                    <View style={styles.comparisonFeature}>
                                        <AppText style={styles.comparisonFeatureLabel}>{item.feature}</AppText>
                                    </View>
                                    <View style={styles.comparisonPlan}>
                                        <AppText style={[
                                            styles.comparisonValue,
                                            item.basic === '✗' && styles.comparisonValueNo
                                        ]}>
                                            {item.basic}
                                        </AppText>
                                    </View>
                                    <View style={styles.comparisonPlan}>
                                        <AppText style={[
                                            styles.comparisonValue,
                                            styles.comparisonValuePremium,
                                            item.premium === '✓' && styles.comparisonValueYes
                                        ]}>
                                            {item.premium}
                                        </AppText>
                                    </View>
                                </View>
                                {index < 4 && <View style={styles.comparisonRowDivider} />}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Fixed Bottom CTA */}
            <View style={styles.bottomCta}>
                <TouchableOpacity
                    style={[
                        styles.purchaseButton,
                        selectedPlan === 'premium' && styles.purchaseButtonPremium
                    ]}
                    onPress={handlePurchase}
                    activeOpacity={0.8}
                >
                    <View style={[
                        styles.purchaseButtonGradient,
                        selectedPlan === 'premium' && styles.purchaseButtonGradientPremium
                    ]}>
                        <AppText style={[
                            styles.purchaseButtonText,
                            selectedPlan === 'premium' && styles.purchaseButtonTextPremium
                        ]}>
                            {selectedPlan === 'basic' ? 'Continue with Basic' : `Get Premium - ${selectedBilling === 'monthly' ? '₹199/mo' : '₹1,999/yr'}`}
                        </AppText>
                    </View>
                </TouchableOpacity>
                <AppText style={styles.termsText}>
                    By continuing, you agree to our Terms of Service
                </AppText>
            </View>
        </SafeAreaView>
    );
}
