function relativeDate(date) {
    if (!date)
        return '';

    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (seconds < 1)
        return 'just now';

    const units = [
        { label: 'y', s: 31536000 },
        { label: 'mo', s: 2592000 },
        { label: 'w', s: 604800 },
        { label: 'd', s: 86400 },
        { label: 'h', s: 3600 },
        { label: 'm', s: 60 },
        { label: 's', s: 1 }
    ];

    for (const u of units) {
        const val = Math.floor(seconds / u.s);
        if (val >= 1)
            return `${val}${u.label} ago`;
    }

    return 'just now';
}

module.exports = relativeDate;