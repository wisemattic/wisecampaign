
import React, {useEffect} from 'react';
import Banner from './Banner';

const BannerShow: React.FC = () => {


    useEffect(() => {
        document.documentElement.style.setProperty('--wpadminbar-top', '0');
    }, []);

    return (
        <Banner/>
    );
};

export default BannerShow;

