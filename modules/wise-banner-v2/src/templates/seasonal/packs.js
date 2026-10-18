import { halloweenPack } from '../halloween/pack';
import { blackFridayPack } from '../blackfriday/pack';
import { newYearPack } from '../newyear/pack';

/**
 * Seasonal template packs, keyed by the banner config's `layout` value.
 * Add a new season by creating a pack and registering it here.
 */
export const SEASONAL_PACKS = {
    [halloweenPack.id]: halloweenPack,
    [blackFridayPack.id]: blackFridayPack,
    [newYearPack.id]: newYearPack
};
