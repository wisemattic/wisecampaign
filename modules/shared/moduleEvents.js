// What each module's storefront numbers mean. Module ids match includes/Classes/Modules.php and the
// events match includes/Classes/Analytics.php (CLIENT_EVENTS). "seen" and "engaged" are null when a
// module reports no such event; "credit" says which orders count for the module.
export const MODULE_EVENTS = {
    banner: {
        seen: { event: 'view', label: 'views' },
        engaged: { event: 'click', label: 'clicks' },
        credit: 'Orders after a banner click',
    },
    checkout: {
        seen: { event: 'view', label: 'pages with the button' },
        engaged: { event: 'click', label: 'Buy Now clicks' },
        credit: 'Bought with Buy Now',
    },
    socialproof: {
        seen: { event: 'view', label: 'pages with popups' },
        engaged: { event: 'click', label: 'popup clicks' },
        credit: 'Orders after a popup click',
    },
    wisecart: {
        seen: { event: 'open', label: 'cart opens' },
        engaged: { event: 'checkout', label: 'checkouts started' },
        credit: 'Orders checked out from the cart',
    },
    stockbar: {
        seen: { event: 'view', label: 'pages with the bar' },
        engaged: null,
        credit: 'Orders with products added next to the bar',
    },
    wisevideo: {
        seen: { event: 'play', label: 'pages with plays' },
        engaged: { event: 'click', label: 'add to cart clicks' },
        credit: 'Orders after watching, or added from a video',
    },
    producttable: {
        seen: { event: 'view', label: 'table views' },
        engaged: null,
        credit: 'Added to the cart from a table',
    },
    discountmanager: {
        seen: null,
        engaged: null,
        credit: 'Orders that got a discount',
    },
};

// Modules that put products in the cart themselves; their adds to cart are counted on the server
export const ADDS_TO_CART = ['checkout', 'producttable', 'wisevideo'];
