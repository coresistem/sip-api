
export interface PropSchema {
    type: 'text' | 'number' | 'boolean' | 'color' | 'select' | 'json' | 'icon';
    label: string;
    description?: string;
    options?: { label: string; value: string | number | boolean }[];
    defaultValue?: any;
    placeholder?: string;
}

export const COMMON_PROPS: Record<string, PropSchema> = {
    visible: {
        type: 'boolean',
        label: 'Initially Visible',
        defaultValue: true
    },
    className: {
        type: 'text',
        label: 'CSS Classes',
        placeholder: 'e.g. mt-4 p-4'
    }
};

export const PART_PROPS_SCHEMAS: Record<string, Record<string, PropSchema>> = {
    // -----------------------------------------------------
    // WIDGETS
    // -----------------------------------------------------
    'chart_line': {
        'title': { type: 'text', label: 'Title', defaultValue: 'Score Trend' },
        'period': {
            type: 'select',
            label: 'Default Period',
            options: [
                { label: 'Last 7 Days', value: '7d' },
                { label: 'Last 30 Days', value: '30d' },
                { label: 'This Year', value: '1y' }
            ],
            defaultValue: '30d'
        },
        'color': { type: 'color', label: 'Line Color', defaultValue: '#38bdf8' }
    },

    'chart_bar': {
        'title': { type: 'text', label: 'Title', defaultValue: 'Weekly Volume' },
        'showLegend': { type: 'boolean', label: 'Show Legend', defaultValue: false },
        'startColor': { type: 'color', label: 'Start Color', defaultValue: '#3b82f6' }
    },

    'stats_card': {
        'title': { type: 'text', label: 'Label', defaultValue: 'Total Athletes' },
        'value': { type: 'text', label: 'Static Value (Demo)', defaultValue: '1,284' },
        'trend': { type: 'text', label: 'Trend Label', defaultValue: '+12%' },
        'trendColor': {
            type: 'select',
            label: 'Trend Color',
            options: [
                { label: 'Emerald (Good)', value: 'emerald' },
                { label: 'Red (Bad)', value: 'red' },
                { label: 'Blue (Neutral)', value: 'blue' }
            ],
            defaultValue: 'emerald'
        }
    },

    'recent_activity': {
        'title': { type: 'text', label: 'Title', defaultValue: 'Recent Activity' },
        'limit': { type: 'number', label: 'Max Items', defaultValue: 5 }
    },

    // -----------------------------------------------------
    // FORM INPUTS
    // -----------------------------------------------------
    'score_input': {
        'label': { type: 'text', label: 'Label', defaultValue: 'Arrow Score' },
        'maxScore': { type: 'number', label: 'Max Score', defaultValue: 10 },
        'allowX': { type: 'boolean', label: 'Allow X', defaultValue: true }
    },

    'date_picker': {
        'label': { type: 'text', label: 'Label', defaultValue: 'Select Date' },
        'minDate': { type: 'text', label: 'Min Date', placeholder: 'YYYY-MM-DD' }
    },

    // -----------------------------------------------------
    // FULLSTACK
    // -----------------------------------------------------
    'bleeptest': {
        'defaultLevel': { type: 'number', label: 'Start Level', defaultValue: 1 },
        'audioVoice': {
            type: 'select',
            label: 'Audio Voice',
            options: [
                { label: 'Male - English', value: 'en-m' },
                { label: 'Female - English', value: 'en-f' }
            ],
            defaultValue: 'en-m'
        }
    },

    'scoring': {
        'defaultDistance': { type: 'number', label: 'Default Distance (m)', defaultValue: 70 },
        'arrowsPerEnd': { type: 'number', label: 'Arrows per End', defaultValue: 6 }
    },

    'jersey_shop': {
        'currency': { type: 'text', label: 'Currency', defaultValue: 'IDR' },
        'showRatings': { type: 'boolean', label: 'Show Ratings', defaultValue: true }
    },

    // Default fallback
    'default': {
        'title': { type: 'text', label: 'Component Title', defaultValue: 'Untitled' }
    }
};

export const getPartSchema = (partCode: string): Record<string, PropSchema> => {
    const specificSchema = PART_PROPS_SCHEMAS[partCode] || PART_PROPS_SCHEMAS['default'];
    return { ...specificSchema, ...COMMON_PROPS };
};
