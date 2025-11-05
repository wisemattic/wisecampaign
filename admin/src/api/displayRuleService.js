import apiClient from './apiClient';

export const getDisplayRule = async () => {
    console.log('fetching.....display rule')
    try {
        const response = await apiClient.get('/banner-settings');
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const getTargetingOptions = async () => {
    try {
        const response = await apiClient.get('/targeting-options');
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const saveDisplayRule = async (bannerData) => {
    try {
        const response = await apiClient.post('/banner-settings', bannerData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateDisplayRule = async (id, data) => {
    try {
        const response = await apiClient.post(`/banner-settings/${id}/update`,  data );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getSelectedBannerData = async () => {
    console.log('fetching.....')
    try {
        const response = await apiClient.get(`/banner/selected` );
        return response.data;
    } catch (error) {
        throw error;
    }
};