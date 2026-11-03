import React from 'react';
import { SEASONAL_PACKS } from '../../templates/seasonal/packs';
import ClassicPopup from './ClassicPopup';
import SeasonalPopup, { SEASONAL_POPUP_WIDTH } from './SeasonalPopup';

const CLASSIC_POPUP_WIDTH = 440;

// Seasonal artwork is a Pro design, as it is for the banner.
const isSeasonal = (config, isPro) => Boolean(SEASONAL_PACKS[config.layout] && isPro);

export const getPopupWidth = (config, isPro) => (isSeasonal(config, isPro) ? SEASONAL_POPUP_WIDTH : CLASSIC_POPUP_WIDTH);

/** Picks the popup card that matches the template's banner design. */
const PopupContent = (props) => {
    const Card = isSeasonal(props.config, props.isPro) ? SeasonalPopup : ClassicPopup;
    return <Card {...props} />;
};

export default PopupContent;
