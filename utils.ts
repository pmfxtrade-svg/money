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