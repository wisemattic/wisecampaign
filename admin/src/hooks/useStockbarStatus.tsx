import { useEffect, useState } from 'react';
import { getStockbarStatus, updateStockbarStatus } from '../api';

const useStockbarStatus = () => {
    const [stockbarStatus, setStockbarStatus] = useState({'stockBarEnabled': false});
    const fetchStockbarStatus = async () => {
        const status = await getStockbarStatus();
        console.log('statussss', status);
        setStockbarStatus(status);
    };


    const updateStockbar = async (status) => {
        try {
           const updatedStatus = await updateStockbarStatus(status);
           console.log('statussss', updatedStatus);
           setStockbarStatus(updatedStatus);
        } catch (err) {
           
        }
    };

    useEffect(() => {
        fetchStockbarStatus();
    }, []);

    return { stockbarStatus, updateStockbar };
};

export default useStockbarStatus;