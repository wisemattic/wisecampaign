import React, { createContext, useContext, ReactNode } from 'react';
import useSetting from '../hooks/useSetting';

export interface SettingData {
    enabled: boolean;
}
interface SettingContextType {
    settingData: SettingData | null;
    loading: boolean;
    error: string | null;
    updateSettingData: (newData: SettingData) => Promise<void>;
    fetchSettingData: () => Promise<void>;
    fetchSubscriptionStatus: () => Promise<void>;
    isPro: boolean;
}

const SettingContext = createContext<SettingContextType | undefined>(undefined);

export const SettingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settingData, loading, error, updateSettingData, fetchSettingData, fetchSubscriptionStatus, isPro } = useSetting();

    return (
        <SettingContext.Provider value={{ settingData, loading, error, updateSettingData, fetchSettingData, fetchSubscriptionStatus, isPro }}>
            {children}
        </SettingContext.Provider>
    );
};

export const useSettingContext = () => {
    const context = useContext(SettingContext);
    if (!context) {
        throw new Error("useSettingContext must be used within a SettingProvider");
    }
    return context;
};
