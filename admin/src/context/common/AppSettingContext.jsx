
import React, {createContext, useContext, useState} from 'react';

const AppSettingContext = createContext();

export const AppSettingProvider = ({ children }) => {
    const [settingConfig, setsettingConfig] = useState({
        isWooCommerceExists: wiseCampaignPageData.isWooCommerceExists === "1",
        // isWiseCampaignProActive: wiseCampaignProData.isWiseCampaignProActive === "1"
     });
    
    return (
        <AppSettingContext.Provider value={{settingConfig}}>
            {children}
        </AppSettingContext.Provider>
    );
};

export const useAppSettingContext = () => {
    const context = useContext(AppSettingContext);
    if (!context) {
        throw new Error('use AppSettingContext must be used within a AppSettingProvider');
    }
    return context;
};
