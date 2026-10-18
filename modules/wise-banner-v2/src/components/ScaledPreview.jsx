import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Renders children at a fixed virtual width and scales them down to fit the
 * available space, so a full-width banner can be previewed inside a card.
 * The preview is inert: links and buttons inside it can't be focused or clicked.
 * With `lazy`, children only mount once the preview scrolls near the viewport.
 */
const ScaledPreview = ({ width = 1440, lazy = false, placeholderRatio = 0.07, children, className = '' }) => {
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(!lazy);
    const [scale, setScale] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (isVisible || !outerRef.current) return undefined;
        if (typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return undefined;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some(entry => entry.isIntersecting)) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '300px 0px' });
        observer.observe(outerRef.current);
        return () => observer.disconnect();
    }, [isVisible]);

    useLayoutEffect(() => {
        const outer = outerRef.current;
        const inner = innerRef.current;
        if (!outer) return undefined;

        const update = () => {
            setScale(outer.clientWidth / width);
            setHeight(inner ? inner.offsetHeight : 0);
        };
        update();

        if (typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(update);
        observer.observe(outer);
        if (inner) observer.observe(inner);
        return () => observer.disconnect();
    }, [width, isVisible]);

    const outerHeight = isVisible && height
        ? Math.ceil(height * scale)
        : Math.ceil(width * scale * placeholderRatio);

    return (
        <div ref={outerRef} className={`relative w-full overflow-hidden ${className}`} style={{ height: outerHeight }}>
            {isVisible ? (
                <div
                    ref={innerRef}
                    inert=""
                    aria-hidden="true"
                    className="absolute left-0 top-0 pointer-events-none select-none"
                    style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }}
                >
                    {children}
                </div>
            ) : (
                <div className="absolute inset-0 bg-slate-100 animate-pulse" />
            )}
        </div>
    );
};

export default ScaledPreview;
