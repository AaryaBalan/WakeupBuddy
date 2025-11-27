import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Failed to save user:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            setUser(null);
        } catch (error) {
            console.error('Failed to remove user:', error);
            throw error;
        }
    };

    const updateUser = async (updatedData) => {
        try {
            const updatedUser = { ...user, ...updatedData };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, login, logout, updateUser, loadUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
