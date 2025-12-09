import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const NEON = '#C9E265';
const GRAY = '#BDBDBD';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },

    // Hero Section
    heroSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    crownContainer: {
        marginBottom: 16,
    },
    crownGradient: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: NEON,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: NEON,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    heroTitle: {
        fontSize: 22,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: GRAY,
        textAlign: 'center',
    },

    // Billing Toggle
    billingToggle: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    billingOption: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10,
    },
    billingOptionActive: {
        backgroundColor: '#1a1a1a',
    },
    billingText: {
        fontSize: 14,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#666',
    },
    billingTextActive: {
        color: '#fff',
    },
    saveBadge: {
        backgroundColor: NEON,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 6,
    },
    saveBadgeText: {
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
        color: '#000',
    },

    // Plans Container
    plansContainer: {
        gap: 14,
        marginBottom: 24,
    },

    // Plan Card
    planCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 18,
        borderWidth: 2,
        borderColor: '#222',
    },
    planCardSelected: {
        borderColor: NEON,
    },
    planCardPremium: {
        backgroundColor: '#0d1a0d',
        borderColor: 'rgba(201, 226, 101, 0.3)',
    },

    // Recommended Badge
    recommendedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: NEON,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 12,
    },
    recommendedText: {
        fontSize: 10,
        fontFamily: 'Montserrat_700Bold',
        color: '#000',
        marginLeft: 4,
        letterSpacing: 0.5,
    },

    // Plan Header
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    planName: {
        fontSize: 20,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginBottom: 2,
    },
    planNamePremium: {
        color: NEON,
    },
    planSubtitle: {
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
    },

    // Radio Button
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonPremium: {
        borderColor: 'rgba(201, 226, 101, 0.5)',
    },
    radioButtonSelected: {
        borderColor: NEON,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: NEON,
    },
    radioButtonInnerPremium: {
        backgroundColor: NEON,
    },

    // Price
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    price: {
        fontSize: 32,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    pricePremium: {
        color: NEON,
    },
    pricePeriod: {
        fontSize: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        marginLeft: 2,
    },

    // Savings
    savingsContainer: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(201, 226, 101, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 12,
    },
    savingsText: {
        fontSize: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: NEON,
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: '#222',
        marginVertical: 14,
    },
    dividerPremium: {
        backgroundColor: 'rgba(201, 226, 101, 0.2)',
    },

    // Features
    featuresContainer: {
        gap: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIconContainer: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    featureIconIncluded: {
        backgroundColor: '#4CAF50',
    },
    featureIconPremium: {
        backgroundColor: NEON,
    },
    featureIconExcluded: {
        backgroundColor: '#333',
    },
    featureText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
        color: '#fff',
    },
    featureTextExcluded: {
        color: '#666',
    },
    featureTextNegative: {
        color: '#888',
        textDecorationLine: 'line-through',
    },

    // Comparison Section
    comparisonSection: {
        marginBottom: 20,
    },
    comparisonTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginBottom: 14,
    },
    comparisonCard: {
        backgroundColor: '#111',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#222',
    },
    comparisonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    comparisonFeature: {
        flex: 1.2,
    },
    comparisonPlan: {
        flex: 0.8,
        alignItems: 'center',
    },
    comparisonFeatureText: {
        fontSize: 11,
        fontFamily: 'Montserrat_700Bold',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    comparisonPlanText: {
        fontSize: 11,
        fontFamily: 'Montserrat_700Bold',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    comparisonPremiumText: {
        color: NEON,
    },
    comparisonDivider: {
        height: 1,
        backgroundColor: '#222',
        marginBottom: 4,
    },
    comparisonRowDivider: {
        height: 1,
        backgroundColor: '#1a1a1a',
    },
    comparisonFeatureLabel: {
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
        color: '#ccc',
    },
    comparisonValue: {
        fontSize: 13,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#888',
    },
    comparisonValuePremium: {
        color: '#fff',
    },
    comparisonValueNo: {
        color: '#666',
    },
    comparisonValueYes: {
        color: NEON,
        fontFamily: 'Montserrat_700Bold',
    },

    // Guarantee Section
    guaranteeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(201, 226, 101, 0.08)',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(201, 226, 101, 0.15)',
        marginBottom: 20,
    },
    guaranteeTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    guaranteeTitle: {
        fontSize: 14,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
        marginBottom: 2,
    },
    guaranteeSubtitle: {
        fontSize: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#888',
    },

    // Bottom CTA
    bottomCta: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
    },
    purchaseButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 8,
    },
    purchaseButtonPremium: {
        shadowColor: NEON,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    purchaseButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 14,
    },
    purchaseButtonGradientPremium: {
        backgroundColor: NEON,
    },
    purchaseButtonText: {
        fontSize: 16,
        fontFamily: 'Montserrat_700Bold',
        color: '#fff',
    },
    purchaseButtonTextPremium: {
        color: '#000',
    },
    termsText: {
        fontSize: 11,
        fontFamily: 'Montserrat_500Medium',
        color: '#666',
        textAlign: 'center',
    },
});

export default styles;

