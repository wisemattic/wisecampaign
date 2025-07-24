import React, { useState } from 'react';
import {useBannerContext} from "../context/BannerContext";
import DefaultCountdown from "./CountdownTimer/DefaultCountdown";
import SeparatorCountdown from "./CountdownTimer/SeparatorCountdown";
import CircleCountdown from "./CountdownTimer/CircleCountdown";
import BoxedCountdown from "./CountdownTimer/BoxedCountdown";

const CountdownStyleSelector: React.FC = () => {

    const {activeBanner, updateActiveBanner} = useBannerContext();
    const [selectedCountDown, setSelectedCountDown] = useState(null);


    const handleClick = (key: any) => {

        const updatedValues = {
            ...activeBanner,
            banner: {
                ...activeBanner.banner,
                countdown: {
                    ...activeBanner.banner.countdown,
                    component: key
                }
            }
        };
        updateActiveBanner(updatedValues);
        setSelectedCountDown(key)
        // onCheckedBannerChange(updatedValues);
    };

    return (<div className="w-1/1 mx-auto p-5 rounded-lg">
            <aside className="grid grid-cols-2 gap-2 mt-5">
                <div style={{backgroundColor: 'transparent', padding:'15px'}} onClick={() => handleClick("DefaultCountdown")} 
                    className={`${selectedCountDown === "DefaultCountdown" ? 'outline outline-2 outline-blue-500 outline-offset-2' : ''}`}>
                    <DefaultCountdown
                        text=""
                        fontSize={activeBanner.banner.countdown.fontSize}
                        fontWeight={activeBanner.banner.countdown.fontWeight}
                        fontStyle={activeBanner.banner.countdown.fontStyle}
                        fontFamily={activeBanner.banner.countdown.fontFamily}
                        color={activeBanner.banner.countdown.color}
                        timerEndDate={new Date(new Date().setDate(new Date().getDate() + 11)).toISOString().replace('T', ' ').substring(0, 19)}
                    />
                </div>
                <div style={{backgroundColor: 'transparent', padding:'15px'}} onClick={() => handleClick("SeparatorCountdown")} 
                    className={`${selectedCountDown === 'SeparatorCountdown' ? 'outline outline-2 outline-blue-500 outline-offset-2' : ''}`}>
                    <SeparatorCountdown
                        text=""
                        fontSize={activeBanner.banner.countdown.fontSize}
                        fontWeight={activeBanner.banner.countdown.fontWeight}
                        fontStyle={activeBanner.banner.countdown.fontStyle}
                        fontFamily={activeBanner.banner.countdown.fontFamily}
                        color={activeBanner.banner.countdown.color}
                        timerEndDate={new Date(new Date().setDate(new Date().getDate() + 11)).toISOString().replace('T', ' ').substring(0, 19)}
                    />
                </div>
                <div style={{backgroundColor: 'transparent', padding:'15px'}} onClick={() => handleClick("CircleCountdown")} 
                    className={`${selectedCountDown === 'CircleCountdown' ? 'outline outline-2 outline-blue-500 outline-offset-2' : ''}`}>
                    <CircleCountdown
                        text=""
                        fontSize="16px" // Fixed size for preview
                        fontWeight={activeBanner.banner.countdown.fontWeight}
                        fontStyle={activeBanner.banner.countdown.fontStyle}
                        fontFamily={activeBanner.banner.countdown.fontFamily}
                        color={activeBanner.banner.countdown.color}
                        timerEndDate={new Date(new Date().setDate(new Date().getDate() + 11)).getTime()}
                    />
                </div>
                <div style={{backgroundColor: 'transparent', padding:'15px'}} onClick={() => handleClick("BoxedCountdown")} 
                    className={`${selectedCountDown === 'BoxedCountdown' ? 'outline outline-2 outline-blue-500 outline-offset-2' : ''}`}>
                    <BoxedCountdown
                        text=""
                        fontSize="16px"
                        fontWeight={activeBanner.banner.countdown.fontWeight}
                        fontStyle={activeBanner.banner.countdown.fontStyle}
                        fontFamily={activeBanner.banner.countdown.fontFamily}
                        color={activeBanner.banner.countdown.color}
                        timerEndDate={new Date(new Date().setDate(new Date().getDate() + 11)).getTime()}
                    />
                </div>
            </aside>
        </div>);
};

export default CountdownStyleSelector;
