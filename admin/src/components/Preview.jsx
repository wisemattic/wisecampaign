import React, { useEffect } from 'react';
import Banner from '../frontend/Banner';
import { useBannerContext } from '../context/BannerContext';
import BannerTemplate from '../pages/wisebanner/tabs/templates/BannerTemplate';

const Preview = () => {
    const { activeBanner } = useBannerContext();

    return (
        activeBanner && (
                <BannerTemplate banner={activeBanner.banner} />
            
        )
    );
};

export default Preview;
