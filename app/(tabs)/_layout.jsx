import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';

export default function TabLayout() {
    const { isBanned } = useUser();
    const router = useRouter();

    // Redirect banned users to appeal page
    useEffect(() => {
        if (isBanned) {
            router.replace('/screens/appeal');
        }
    }, [isBanned]);

    // Don't render tabs if banned
    if (isBanned) {
        return null;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#000',
                    borderTopColor: '#555',
                    height: 60,
                    paddingBottom: 5,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#C9E265',
                tabBarInactiveTintColor: '#666',
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" size={30} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="alarms"
                options={{
                    title: 'Alarms',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="alarm-outline" size={30} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="compass-outline" size={30} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="rank"
                options={{
                    title: 'Rank',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="trophy-outline" size={30} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="person-outline" size={30} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
