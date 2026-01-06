import React, {createContext, useContext, useState} from 'react';
import useBanner from '../hooks/useBanner';

const initialValues: FormValues = {
    id: null,
    banner: {
        general: {
            width: '100%',
            height: '90px',
            bgImage: '',
            bannerColor: '#776EFF',
        },
        headline: {
            text: 'Get 5% Cashback* on grocery',
            color: '#000000',
            align: 'center',
            fontSize: '24',
            fontFamily: 'Afacad',
            fontWeight: 'normal',
            fontStyle: '',
        },
        subHeadline: {
            text: 'Promocode: RECHARGE100',
            color: '#000000',
            align: 'center',
            fontSize: '14.4',
            fontFamily: 'Afacad',
            fontWeight: 'normal',
            fontStyle: '',
        },
        bogo: {
            imgSrc: null,
            alt: '',
            width: '110',
            height: '80',
        },
        countdown: {
            component: 'DefaultCountdown',
            text: 'Offer ends:',
            timer: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().replace('T', ' ').substring(0, 19),
            color: '#000000',
            fontSize: '15',
            fontFamily: 'Kreon',
            fontWeight: 'normal',
            fontStyle: '',
        },
        button: {
            width: '117px',
            height: '40px',
            text: 'Claim Offer >',
            padding: '5px',
            color: '#E5E7EC',
            bgColor: '#1C4ED8',
            borderRadius: '5px',
            borderColor: '#4F26E4',
            hoverBgColor: '#ffffff',
            hoverBorderColor: '#4F26E4',
            hoverTextColor: '#4F26E4',
            link: '',
            fontSize: '14',
            fontFamily: 'Abhaya Libre ExtraBold',
            fontWeight: 'bold',
            fontStyle: 'normal',
            show: true
        },
    },
    isActive: false
};
interface BannerContextType {
    bannerData: any[];
    activeBanner: any;
    updateActiveBanner: any;
    getSelectedBanner: any;
    selectedBanner: any;
    loading: boolean;
    error: string | null;
    saveBanner: (banner: any) => Promise<void>;
    updateBanner: (id: number | null, data: any) => Promise<void>;
    formValues: FormValues;
    setFormValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { bannerData, loading, error, updateBanner, activeBanner, updateActiveBanner } = useBanner();
    const [formValues, setFormValues] = useState<FormValues>(initialValues);

    return (
        <BannerContext.Provider value={{ bannerData, loading, error, updateBanner, formValues, setFormValues, activeBanner, updateActiveBanner}}>
            {children}
        </BannerContext.Provider>
    );
};

export const useBannerContext = () => {
    const context = useContext(BannerContext);
    if (!context) {
        throw new Error('useBannerContext must be used within a BannerProvider');
    }
    return context;
};
