import apiClient from './apiClient';

export const getStockbarStatus = async () => {
    try {
        const response = await apiClient.get('/stockbar-status');
        return response.data;
    } catch (error) {

        throw error;
    }
};


export const updateStockbarStatus = async (status) => {
    try {
        const response = await apiClient.post(`/stockbar-status`,  status );
        return response.data;
    } catch (error) {
        throw error;
    }
};
