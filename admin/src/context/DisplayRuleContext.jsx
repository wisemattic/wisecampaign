import React, {createContext, useContext, useState} from 'react';
import useDisplayRule from '../hooks/useDisplayRule';

const DisplayRuleContext = createContext();

export const DisplayRuleProvider = ({ children }) => {
    const { fetchDisplayRule, save, updateDisplayRule, getSelectedBanner, selectedBanner } = useDisplayRule();

    return (
        <DisplayRuleContext.Provider value={{ fetchDisplayRule, save, updateDisplayRule, getSelectedBanner, selectedBanner }}>
            {children}
        </DisplayRuleContext.Provider>
    );
};

export const useDisplayRuleContext = () => {
    const context = useContext(DisplayRuleContext);
    if (!context) {
        throw new Error('use DisplayRuleContext must be used within a DisplayRuleProvider');
    }
    return context;
};
