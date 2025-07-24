export const convertPxToPercent = (originalSize : string, percentage : number) => {
    return Math.round(convertPxToNumber(originalSize) * (percentage / 100)) + 'px';
};

export const convertPxToNumber = (pxValue: string) => {
    return parseFloat(pxValue);
};

export const renderImage = (src: string | File, alt: string, width: string, height: string) => (
    <img
        src={typeof src === 'string' ? src : URL.createObjectURL(src)}
        alt={alt}
        className=""
        style={{ width, height }}
    />
);

export const getBackgroundImage = (image: File | string | null) => {
    if (typeof image === 'string') {
        return image;
    }
    if (image instanceof Blob) {
        return URL.createObjectURL(image);
    }
    return '';
};


export const toSnakeCase = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
        return obj.map(toSnakeCase);
    }

    return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        acc[snakeKey] = toSnakeCase(obj[key]); // Recursive call for nested objects or arrays
        return acc;
    }, {});
};

export const toCamelCase = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
        return obj.map(toCamelCase); // Recursively convert arrays
    }

    return Object.keys(obj).reduce((acc, key) => {
        // Convert the key from snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        acc[camelKey] = toCamelCase(obj[key]); // Recursive call for nested objects or arrays
        return acc;
    }, {});
};

export const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const getPathFor = (imgName) => {
    return "/wp-content/plugins/wisecampaign/images/fe/"+imgName;
}