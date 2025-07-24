import React from "react";
import {SettingProvider} from "./context/SettingContext";
import MainComponent from "./components/MainComponent";
import {BannerProvider} from "./context/BannerContext";
import { ToastProvider } from "./provider/ToastProvider";
import { DisplayRuleProvider } from "./context/DisplayRuleContext";
import { AppSettingProvider } from "./context/common/AppSettingContext";
// import Dashboard from "./pages/Dashboard";
// import Preview from "./components/Preview";

const App: React.FC = () => {
    return (
        <AppSettingProvider>
        <SettingProvider>
            <BannerProvider>
                <DisplayRuleProvider>
            <ToastProvider>
                {/*<Dashboard />*/}
                <MainComponent />
                </ToastProvider>
                </DisplayRuleProvider>
            </BannerProvider>
        </SettingProvider>
        </AppSettingProvider>
        
    );
};

export default App;