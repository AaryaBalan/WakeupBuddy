import AppText from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const Popup = ({ text, color = '#C9E265', visible, onHide, duration = 3000 }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Determine icon based on color/type
    const getIconName = () => {
        const lowerColor = color.toLowerCase();
        if (lowerColor.includes('4caf50') || lowerColor.includes('c9e265')) return 'checkmark-circle';
        if (lowerColor.includes('ff6b6b') || lowerColor.includes('ff4444')) return 'alert-circle';
        if (lowerColor.includes('ffa500')) return 'warning';
        return 'information-circle';
    };

    useEffect(() => {
        if (visible) {
            // Slide down and fade in
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hidePopup();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hidePopup = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onHide) onHide();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                    borderLeftColor: color,
                },
            ]}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={getIconName()} size={24} color={color} />
                </View>
                <AppText style={styles.text}>{text}</AppText>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: '#1a1a1a',
        borderLeftWidth: 4,
        paddingVertical: 16,
        paddingHorizontal: 16,
        zIndex: 9999,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    text: {
        color: '#ffffff',
        fontSize: 14,
        flex: 1,
        fontFamily: 'Montserrat_600SemiBold',
        lineHeight: 20,
    },
});

export default Popup;
