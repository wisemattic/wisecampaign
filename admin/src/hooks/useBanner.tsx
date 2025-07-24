import { useEffect, useState } from 'react';
import { getBannerData, saveBannerData, updateBannerData } from '../api';
import useDbToFormMapper from './useDbToFormMapper';
import { updateCssTopHeight } from '../utilities/main';

const useBanner = () => {
    const [bannerData, setBannerData] = useState<any[]>([]);
    const [activeBanner, setActiveBanner] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const mapDbToForm = useDbToFormMapper();

    const fetchBannerData = async () => {
        setLoading(true);
        try {
            const data = await getBannerData();
            setBannerData(data);

            data.map((banner)=>{
                if(banner.is_selected === "1") {
                    updateCssTopHeight(banner.height);
                    const formBanner = mapDbToForm(banner)
                    setActiveBanner(formBanner);
                }
            })
        } catch (err) {
            setError('Error fetching banner data');
        } finally {
            setLoading(false);
        }
    };

    // const saveBanner = async (newBanner: any) => {
    //     setLoading(true);
    //     try {
    //         await saveBannerData(newBanner);
    //         await fetchBannerData();
    //     } catch (err) {
    //         setError('Error saving banner data');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const updateBanner = async ( id: number | null, data: any ) => {
        setLoading(true);
        try {
            await updateBannerData(id, data);
            await fetchBannerData();
        } catch (err) {
            setError('Error banner status update');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBannerData();
    }, []);

    const updateActiveBanner = async(banner: any) => {
        setActiveBanner({ ...banner });
    }

    return { bannerData, loading, error, updateBanner, activeBanner, updateActiveBanner };
};

export default useBanner;
