import { useState, useEffect } from 'react';
import { getSettingData, saveSettingData, getSubscriptionStatus, getLicenseStatus } from '../api';

interface SettingData {
    enabled: boolean;
}

interface UseSettingReturn {
    settingData: SettingData | null;
    loading: boolean;
    error: string | null;
    fetchSettingData: () => Promise<void>;
    updateSettingData: (newData: SettingData) => Promise<void>;
    fetchSubscriptionStatus: () => Promise<void>;
    isPro: boolean;
}

const useSetting = (): UseSettingReturn => {
    const [settingData, setSettingData] = useState<SettingData | null>(null);
    const [isPro, setIsPro] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptionStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSubscriptionStatus();
            if(data?.is_pro_version) {
                const license = await getLicenseStatus();
                if(license?.status == 'active')
                    setIsPro(true);
                else
                    setIsPro(false);
            } else {
                setIsPro(false);
            }
            
        } catch {
            setError('Error fetching subscription data.');
        } finally {
            setLoading(false);
        }
    }; 

    const fetchSettingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSettingData();
            setSettingData(data);
            return data;
        } catch {
            setError('Error fetching setting data.');
        } finally {
            setLoading(false);
        }
    };

    const updateSettingData = async (newData: SettingData) => {
        setLoading(true);
        setError(null);
        try {
            const updatedData = await saveSettingData(newData);
            setSettingData(updatedData);
        } catch {
            setError('Error saving setting data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettingData();
    }, []);

    return {
        settingData,    // The current setting data
        loading,        // Loading state (for showing spinners or loading indicators)
        error,          // Error state (for displaying error messages)
        fetchSettingData, // Function to manually fetch setting data
        updateSettingData,
        fetchSubscriptionStatus,
        isPro
    };
};

export default useSetting;
