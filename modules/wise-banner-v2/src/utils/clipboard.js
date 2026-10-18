/**
 * Copy text to the clipboard. Uses the Clipboard API on secure origins and
 * falls back to execCommand('copy') elsewhere (e.g. http:// stores).
 * Resolves to true when the copy succeeded.
 */
export const copyText = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (err) {
        // Permission denied or unsupported; try the fallback below.
    }

    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        return false;
    }
};
