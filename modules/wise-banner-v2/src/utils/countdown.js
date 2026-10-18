const pad = (value) => value.toString().padStart(2, '0');

export const EMPTY_TIME = { days: '00', hrs: '00', min: '00', sec: '00' };

/**
 * Time remaining until endDate/endTime. With recursion enabled the target
 * keeps rolling forward by the recurrence interval once the fixed end passes.
 */
export const getTimeLeft = ({ endDate, endTime, enableRecursion = false, recurrenceAmount = 24, recurrenceUnit = 'hours' }) => {
    let target = new Date(`${endDate}T${endTime || '23:59'}:00`);
    const now = new Date();
    let diff = target.getTime() - now.getTime();

    if (Number.isNaN(diff)) {
        return EMPTY_TIME;
    }

    // Handle Recurring Mode (Evergreen Loop after fixed end)
    if (enableRecursion && diff <= 0) {
        const amount = parseInt(recurrenceAmount) || 24;
        const msPerUnit = recurrenceUnit === 'days' ? 86400000 : (recurrenceUnit === 'hours' ? 3600000 : 60000);
        const intervalMs = amount * msPerUnit;

        // Add intervals until target is in the future
        const intervalsPassed = Math.floor(Math.abs(diff) / intervalMs) + 1;
        target = new Date(target.getTime() + (intervalsPassed * intervalMs));
        diff = target.getTime() - now.getTime();
    }

    if (diff <= 0) {
        return EMPTY_TIME;
    }

    return {
        days: pad(Math.floor(diff / (1000 * 60 * 60 * 24))),
        hrs: pad(Math.floor((diff / (1000 * 60 * 60)) % 24)),
        min: pad(Math.floor((diff / (1000 * 60)) % 60)),
        sec: pad(Math.floor((diff / 1000) % 60))
    };
};

/**
 * Next October 31st (this year's if it hasn't passed yet), as YYYY-MM-DD.
 */
export const getUpcomingHalloween = () => {
    const now = new Date();
    const year = now.getMonth() > 9 ? now.getFullYear() + 1 : now.getFullYear();
    return `${year}-10-31`;
};

const toDateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Black Friday is the day after the fourth Thursday of November.
const blackFridayOf = (year) => {
    const firstOfNovember = new Date(year, 10, 1);
    const firstThursday = ((4 - firstOfNovember.getDay() + 7) % 7) + 1;
    return new Date(year, 10, firstThursday + 22);
};

/**
 * Next Black Friday (or a day relative to it, e.g. +3 for Cyber Monday) that
 * hasn't ended yet, as YYYY-MM-DD.
 */
export const getUpcomingBlackFriday = (offsetDays = 0) => {
    const now = new Date();
    let year = now.getFullYear();
    let date = blackFridayOf(year);
    date.setDate(date.getDate() + offsetDays);

    if (new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59) < now) {
        year += 1;
        date = blackFridayOf(year);
        date.setDate(date.getDate() + offsetDays);
    }
    return toDateString(date);
};

/**
 * The New Year sale this campaign targets: the coming year, or the current one
 * during its first week. The sale runs until January 7th.
 */
export const getUpcomingNewYear = () => {
    const now = new Date();
    const inFirstWeek = now.getMonth() === 0 && now.getDate() <= 7;
    const year = inFirstWeek ? now.getFullYear() : now.getFullYear() + 1;
    return { year, endDate: `${year}-01-07` };
};
