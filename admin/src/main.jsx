import { createRoot, render } from '@wordpress/element';
import App from './App';
//import './style/tailwind.css';
import './style/tailwind-out.css';
import './style/main.scss';

import BannerShow from "./frontend/BannerShow";
import GettingStarted from "./pages/GettingStarted";
import { SettingProvider } from './context/SettingContext';
import { BannerProvider } from './context/BannerContext';
import { DisplayRuleProvider } from './context/DisplayRuleContext';
import StockBar from './pages/stockbar/StockBar';
import WiseBannerTabs from './pages/wisebanner/WiseBannerTabs';
import UpComming from './pages/UpComming';
import { ToastProvider } from './provider/ToastProvider';
import MainComponent from './components/MainComponent';
import { AppSettingProvider } from './context/common/AppSettingContext';
import WiseWrapper from './components/WiseWrapper';
import Banner from './components/Banner';
import Preview from './components/Preview';

// Get DOM elements
const elements = {
    settings: document.getElementById('wisecampaign-setting-page-admin-app'),
    bannerShow: document.getElementById('wise-campaign-banner-show'),
    dashboard: document.getElementById('wisecampaign-getting-started-page-app'),
    banner: document.getElementById('wisecampaign-banner-page-app'),
    bannerPreview: document.getElementById('wisecampaign-banner-preview-app'),
    stockbar: document.getElementById('wisecampaign-stockbar-page-app'),
    checkout: document.getElementById('wisecampaign-checkout-page-app'),
    notification: document.getElementById('wisecampaign-notification-page-app'),
    cart: document.getElementById('wisecampaign-cart-page-app')
};

// Render components based on page
if (elements.settings) {
    createRoot(elements.settings).render(<App />);
}

if (elements.dashboard) {
    createRoot(elements.dashboard).render(
        <WiseWrapper>
            <GettingStarted />
        </WiseWrapper>
    );
}

if (elements.banner) {
    createRoot(elements.banner).render(
        <SettingProvider>
            <ToastProvider>
                <BannerProvider>
                    <DisplayRuleProvider>
                        <AppSettingProvider>
                            <WiseWrapper>
                                <WiseBannerTabs />
                            </WiseWrapper>
                        </AppSettingProvider>
                    </DisplayRuleProvider>
                </BannerProvider>
            </ToastProvider>
        </SettingProvider>
    );
}

if (elements.bannerPreview) {
    createRoot(elements.bannerPreview).render(
        <SettingProvider>
            <ToastProvider>
                <BannerProvider>
                    <DisplayRuleProvider>
                        <AppSettingProvider>
                            <Preview />
                        </AppSettingProvider>
                    </DisplayRuleProvider>
                </BannerProvider>
            </ToastProvider>
        </SettingProvider>
    );
}

if (elements.stockbar) {
    createRoot(elements.stockbar).render(
        <SettingProvider>
            <WiseWrapper>
                <StockBar />
            </WiseWrapper>
        </SettingProvider>
    );
}

if (elements.checkout) {
    createRoot(elements.checkout).render(
        <WiseWrapper>
            <UpComming />
        </WiseWrapper>
    );
}

if (elements.cart) {
    createRoot(elements.cart).render(
        <WiseWrapper>
            <UpComming />
        </WiseWrapper>
    );
}

if (elements.notification) {
    createRoot(elements.notification).render(
        <WiseWrapper>
            <UpComming />
        </WiseWrapper>
    );
}

if (elements.bannerShow) {
    createRoot(elements.bannerShow).render(
        <SettingProvider>
            <BannerProvider>
                <DisplayRuleProvider>
                    <WiseWrapper>
                        <BannerShow />
                    </WiseWrapper>
                </DisplayRuleProvider>
            </BannerProvider>
        </SettingProvider>
    );
}
