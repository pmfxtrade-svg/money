
export const parseInputNumber = (value: string | number | undefined): number => {
    if (!value) return 0;
    const persianToEnglish = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const cleanedValue = String(value).replace(/,/g, '').split('').map(char => {
        const index = persianToEnglish.indexOf(char);
        return index > -1 ? index : char;
    }).join('');
    return parseFloat(cleanedValue) || 0;
};

export const formatForDisplay = (value: number | string | undefined): string => {
    const numericValue = parseInputNumber(value);
    if (numericValue === 0 && value !== '0' && value !== 0) return '';
    return new Intl.NumberFormat('fa-IR').format(numericValue);
};

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(value)) + ' تومان';
};

export const getTodayDate = (): string => {
    const today = new Date();
    return today.toLocaleDateString('fa-IR');
};

// Simplified Persian date parser for sorting/filtering
export const parsePersianDate = (dateStr: string): Date => {
    try {
        const parts = dateStr.split('/');
        // Simple conversion to make comparable (Year 1402 -> 2023 approx)
        // This isn't perfect calendar conversion but works for comparison within the app
        return new Date(
            parseInt(parts[0]) + 621,
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
        );
    } catch (e) {
        return new Date();
    }
};

export const numberToText = (num: number): string => {
    if (num === 0) return 'صفر تومان';
    
    const levels = [
        { value: 1e12, name: 'تریلیون' },
        { value: 1e9, name: 'میلیارد' },
        { value: 1e6, name: 'میلیون' },
        { value: 1e3, name: 'هزار' }
    ];

    let remaining = Math.round(num);
    const parts = [];

    for (const level of levels) {
        if (remaining >= level.value) {
            const quotient = Math.floor(remaining / level.value);
            remaining %= level.value;
            parts.push(`${quotient} ${level.name}`);
        }
    }

    if (parts.length === 0) return formatCurrency(num); // For small numbers
    
    // Take top 2 significant parts for readability (e.g. 1 billion and 200 million)
    return parts.slice(0, 2).join(' و ') + ' تومان';
};
