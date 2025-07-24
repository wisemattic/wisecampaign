import apiClient from './apiClient';

export const getSettingData = async () => {
    try {
        const response = await apiClient.get('/setting/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const saveSettingData = async (settingData) => {
    try {
        const response = await apiClient.post('/setting/', settingData);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const getSubscriptionStatus = async () => {
    try {
        const response = await apiClient.get('/plugin-version');
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const getLicenseStatus = async () => {
    try {
        const response = await apiClient.get('/license-status');
        return response.data;
    } catch (error) {
        throw error;
    }
};