// Points math and labels, the same as includes/Rewards/Settings.php and Earning.php.
import React from 'react';
import { formatMoney } from '../../shared/format.js';

export const apiBase = () => `${window.wiseModuleData?.apiUrl || '/wp-json/wisecampaign/v1/'}rewards`;
export const apiHeaders = (json = false) => {
    const nonce = window.wiseModuleData?.nonce;
    return {
        ...(json ? { 'Content-Type': 'application/json' } : {}),
        ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    };
};

export const api = async (path = '', { method = 'GET', body } = {}) => {
    const res = await fetch(`${apiBase()}${path}`, {
        method,
        headers: apiHeaders(!!body),
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store',
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(payload?.message || 'Something went wrong. Please try again.');
    }
    return payload;
};

export const UPGRADE_URL = 'https://wisemattic.com/wisecampaign/pricing';

export const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);

export const pointsFor = (settings, amount, multiplier = 1) => {
    const per = num(settings.earnAmount);
    if (!settings.earnPurchase || per <= 0) return 0;
    return Math.floor((num(amount) / per) * num(settings.earnPoints) * multiplier + 1e-6);
};

export const pointValue = (settings) => num(settings.redeemAmount) / Math.max(1, num(settings.redeemPoints));

export const label = (settings, n) => `${Number(n).toLocaleString()} ${Math.abs(n) === 1 ? settings.pointLabel : settings.pointsLabel}`;

export const money = (value, currency) => formatMoney(value, currency);

// Share of a purchase that comes back as points, in percent
export const backPercent = (settings) => {
    const per = num(settings.earnAmount);
    if (!per) return 0;
    return (num(settings.earnPoints) / per) * pointValue(settings) * 100;
};

// "Earn {points} with this purchase" with the points in bold, as React nodes
export const renderMessage = (template, settings, n) => {
    const parts = String(template || '').split('{points}');
    return parts.flatMap((part, i) => (i === 0 ? [part] : [<strong key={i}>{label(settings, n)}</strong>, part]));
};
