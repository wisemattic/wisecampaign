import React, { useEffect, useState } from 'react';
import ICONS from './icons.json';

/**
 * The stock bar with the same markup and classes as StockBar::render_stock_bar() in
 * includes/Classes/StockBar.php, styled by includes/css/stock-bar.css. Keep the two in sync.
 */

const isColor = (value) => /^#[0-9a-f]{3,8}$/i.test(String(value));
const pad = (n) => String(n).padStart(2, '0');

// Fills {stock}, {sold} and {total}; texts without tokens get the stock count in front when prefixCount.
function fillText(text, stock, sold, prefixCount, strong = true) {
    let value = String(text ?? '');
    // The old Urgent Alert default had a fixed number in it
    if (value === 'Only 12 items remaining') {
        value = 'Only {stock} left in stock';
    }
    const wrap = (n, key) => (strong ? <strong key={key}>{n}</strong> : <React.Fragment key={key}>{n}</React.Fragment>);

    if (!value.includes('{')) {
        return prefixCount ? <>{wrap(stock, 'n')} {value}</> : value;
    }
    const numbers = { '{stock}': stock, '{sold}': sold, '{total}': stock + sold };
    return value.split(/(\{stock\}|\{sold\}|\{total\})/).map((part, i) => (part in numbers ? wrap(numbers[part], i) : part));
}

// Seconds left until the end date, ticking every second. null without an end date.
function useSecondsLeft(expiry) {
    const target = expiry ? new Date(expiry).getTime() : NaN;
    const calc = () => (Number.isNaN(target) ? null : Math.floor((target - Date.now()) / 1000));
    const [left, setLeft] = useState(calc);

    useEffect(() => {
        setLeft(calc());
        if (Number.isNaN(target)) return undefined;
        const timer = setInterval(() => setLeft(calc()), 1000);
        return () => clearInterval(timer);
    }, [target]);

    return left;
}

const Icon = ({ name }) => (
    <span className="wise-sb__icon" dangerouslySetInnerHTML={{ __html: ICONS[name] || ICONS.Flame }} />
);

export default function StockBarMarkup({ templateId, config: c, defaults, stock = 12, sold = 21, context = 'single' }) {
    const secondsLeft = useSecondsLeft(templateId === 'countdown' ? c.timerExpiry : '');
    const color = (key) => (isColor(c[key]) ? c[key] : defaults[key]);
    const total = stock + sold;
    const fill = total > 0 ? Math.max(6, Math.round((sold / total) * 100)) : 6;

    const style = {
        '--wsb-accent': color('progressBarColor'),
        '--wsb-bg': color('stockBarBg'),
        '--wsb-text': color('textColor'),
        '--wsb-border': color('borderColor'),
        '--wsb-size': `${Math.max(9, Math.min(40, parseInt(c.fontSize, 10) || 13))}px`,
        '--wsb-weight': c.fontWeight === 'Bold' ? 700 : 500,
        '--wsb-fill': `${fill}%`,
    };

    const title = <span className="wise-sb__title">{fillText(c.mainText, stock, sold, false)}</span>;
    const track = (thin = false) => (
        <div className={`wise-sb__track${thin ? ' wise-sb__track--thin' : ''}`}>
            <span className="wise-sb__fill" />
        </div>
    );

    let body;
    switch (templateId) {
        case 'pulse':
            body = (
                <div className="wise-sb__row">
                    <Icon name={c.icon} />
                    <div className="wise-sb__text">
                        {title}
                        <span className="wise-sb__sub">{fillText(c.subText, stock, sold, false)}</span>
                    </div>
                </div>
            );
            break;

        case 'minimal':
            body = (
                <>
                    <div className="wise-sb__row">
                        <Icon name={c.icon} />
                        {title}
                        <span className="wise-sb__sub">{fillText(c.subText, stock, sold, true)}</span>
                    </div>
                    {track(true)}
                </>
            );
            break;

        case 'countdown': {
            // Without an end date the editor shows a sample time; the storefront leaves the timer out
            const left = secondsLeft === null ? 5 * 3600 + 42 * 60 + 17 : Math.max(0, secondsLeft);
            const position = ['left', 'top', 'right', 'below'].includes(c.labelPosition) ? c.labelPosition : 'top';
            body = (
                <>
                    <div className="wise-sb__row">
                        <Icon name={c.icon} />
                        <div className={`wise-sb__text wise-sb__text--${position}`}>
                            {title}
                            <span className="wise-sb__timer">
                                <b>{pad(Math.floor(left / 3600))}</b><i>{c.hoursLabel || 'h'}</i>
                                <b>{pad(Math.floor((left % 3600) / 60))}</b><i>{c.minutesLabel || 'm'}</i>
                                <b>{pad(left % 60)}</b><i>{c.secondsLabel || 's'}</i>
                            </span>
                        </div>
                        <div className="wise-sb__stock">
                            <b>{stock}</b>
                            <span>{fillText(c.subText, stock, sold, false, false)}</span>
                        </div>
                    </div>
                    {track(true)}
                </>
            );
            break;
        }

        case 'badge':
            body = (
                <>
                    <span className="wise-sb__dot" />
                    {title}
                    <span className="wise-sb__pill">{fillText(c.subText, stock, sold, true, false)}</span>
                </>
            );
            break;

        default: // linear
            body = (
                <>
                    <div className="wise-sb__head">
                        <Icon name={c.icon} />
                        {title}
                        <span className="wise-sb__count">{fillText(c.subText, stock, sold, true)}</span>
                    </div>
                    {track()}
                    {sold > 0 && (
                        <div className="wise-sb__meta">
                            <span>{sold} sold</span>
                            <span>{Math.round((sold / total) * 100)}% claimed</span>
                        </div>
                    )}
                </>
            );
    }

    return (
        <div className={`wise-sb wise-sb--${templateId} wise-sb--${context}`} style={style} role="status">
            {body}
        </div>
    );
}

export { ICONS };
