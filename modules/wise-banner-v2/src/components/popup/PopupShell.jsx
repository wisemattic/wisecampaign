import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { BUTTON_RESET } from './parts';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Modal frame for the exit-intent popup: dimmed backdrop, centered card and a close button.
 *
 * On the storefront it is a real dialog: Escape and a backdrop click close it, focus stays
 * inside while it is open and returns afterwards, and the page behind stops scrolling.
 * With `isPreview` it fills its positioned parent instead, for the editor's mock browser.
 */
const PopupShell = ({ onClose, isPreview = false, isMobileMode = false, maxWidth = 460, closeColor = '#FFFFFF', labelledBy, children }) => {
    const shellRef = useRef(null);
    const dialogRef = useRef(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        if (isPreview) return undefined;
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;

        const focusables = () => (dialog ? Array.from(dialog.querySelectorAll(FOCUSABLE)) : []);
        // Focus the dialog itself so screen readers announce it without highlighting a button.
        if (dialog) dialog.focus({ preventScroll: true });

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeRef.current('esc');
                return;
            }
            if (e.key !== 'Tab') return;
            const items = focusables();
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && (active === first || active === dialog)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);

        // Make everything outside the popup inert, so screen readers can't wander behind it.
        // Walks up from the popup and marks the siblings at each level (the bar included).
        const madeInert = [];
        for (let node = shellRef.current; node && node.parentElement && node !== document.body; node = node.parentElement) {
            Array.from(node.parentElement.children).forEach((sibling) => {
                if (sibling === node || sibling.hasAttribute('inert') || ['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)) return;
                sibling.setAttribute('inert', '');
                madeInert.push(sibling);
            });
        }

        // Lock page scroll; pad for the scrollbar so the page doesn't jump sideways.
        const root = document.documentElement;
        const scrollbar = window.innerWidth - root.clientWidth;
        const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
        root.style.overflow = 'hidden';
        if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            madeInert.forEach((el) => el.removeAttribute('inert'));
            root.style.overflow = previous.overflow;
            root.style.paddingRight = previous.paddingRight;
            if (previousFocus && typeof previousFocus.focus === 'function') {
                previousFocus.focus({ preventScroll: true });
            }
        };
    }, [isPreview]);

    return (
        <div
            ref={shellRef}
            // In the editor it stays inside the mock browser (which isolates its z-index), above the bar preview.
            className={`${isPreview ? 'absolute z-[200]' : 'fixed z-[100000]'} inset-0 overflow-y-auto wb-popup`}
            style={{ overscrollBehavior: 'contain' }}
        >
            <div
                className="absolute inset-0 wb-popup-backdrop"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.62)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
                onClick={() => !isPreview && onClose('overlay')}
                aria-hidden="true"
            />
            {/* The editor's desktop mock page is taller than the screen, so its popup sits near the top. */}
            <div
                className={`relative min-h-full flex justify-center pointer-events-none ${isPreview && !isMobileMode ? 'items-start' : 'items-center'}`}
                style={{ padding: isMobileMode ? 16 : 24, paddingTop: isPreview && !isMobileMode ? 120 : undefined }}
            >
                <div
                    ref={dialogRef}
                    role={isPreview ? undefined : 'dialog'}
                    aria-modal={isPreview ? undefined : 'true'}
                    aria-labelledby={labelledBy}
                    tabIndex={-1}
                    className="relative w-full pointer-events-auto wb-popup-card outline-none"
                    style={{ maxWidth }}
                >
                    {children}
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isPreview) onClose('close');
                        }}
                        className="absolute z-30 flex items-center justify-center rounded-full cursor-pointer opacity-80 hover:opacity-100 transition-all hover:scale-105"
                        style={{
                            ...BUTTON_RESET,
                            top: 12,
                            right: 12,
                            width: 32,
                            height: 32,
                            color: closeColor,
                            backgroundColor: `color-mix(in srgb, ${closeColor} 14%, transparent)`
                        }}
                    >
                        <X size={17} strokeWidth={2.75} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupShell;
