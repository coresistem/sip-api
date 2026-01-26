export const currencies = [
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia' },
    { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', country: 'Malaysia' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', country: 'Thailand' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', country: 'Vietnam' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', country: 'Philippines' },
    { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', country: 'Brunei' },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', country: 'Cambodia' },
    { code: 'LAK', name: 'Lao Kip', symbol: '₭', country: 'Laos' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'Ks', country: 'Myanmar' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country: 'China' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', country: 'South Korea' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India' },
    { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom' },
    { code: 'EUR', name: 'Euro', symbol: '€', country: 'France' }, // Simplified
    { code: 'OTH', name: 'Other', symbol: '', country: 'Other' }
].sort((a, b) => {
    if (a.code === 'IDR') return -1;
    if (b.code === 'IDR') return 1;
    return a.code.localeCompare(b.code);
});
