import apiClient from './apiClient';

export const getBannerData = async () => {
    try {
        const response = await apiClient.get('/banner/data/');
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const saveBannerData = async (bannerData) => {
    try {
        const response = await apiClient.post('/banner/save/', bannerData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateBannerData = async (id, data) => {
    try {
        const response = await apiClient.post(`/banner/${id}/update`,  data );
        return response.data;
    } catch (error) {
        throw error;
    }
};
