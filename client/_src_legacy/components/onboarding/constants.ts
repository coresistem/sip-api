export const COLORS = {
    bg: '#000000',
    text: '#E0F2FE', // Light Sky Blue for text
    cyan: '#22D3EE', // Bright Cyan (Highlight)
    sky: '#0EA5E9',  // Sky Blue
    blue: '#2563EB', // Royal Blue (Primary)
    darkBlue: '#1E3A8A', // Deep Blue (Shadow/Accent)
    darkGrey: '#1e293b', // Slate for subtle particles
    gold: '#F4B315', // Gold for interaction
    amber: '#E59312', // Amber for interaction
};

// Hex to RGBA helper function used in Canvas
export const hexToRgbA = (hex: string, alpha: number): string => {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        const num = parseInt(c, 16);
        return 'rgba(' + [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(',') + ',' + alpha + ')';
    }
    return hex;
};
