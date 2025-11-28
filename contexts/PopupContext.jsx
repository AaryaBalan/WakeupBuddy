import React, { createContext, useContext, useState } from 'react';
import Popup from '../app/components/Popup';

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
    const [popup, setPopup] = useState({
        visible: false,
        text: '',
        color: '#C9E265',
    });

    const showPopup = (text, color = '#C9E265') => {
        setPopup({
            visible: true,
            text,
            color,
        });
    };

    const hidePopup = () => {
        setPopup({
            ...popup,
            visible: false,
        });
    };

    return (
        <PopupContext.Provider value={{ showPopup, hidePopup }}>
            {children}
            <Popup
                visible={popup.visible}
                text={popup.text}
                color={popup.color}
                onHide={hidePopup}
            />
        </PopupContext.Provider>
    );
};

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
};
