import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../contexts/AuthContext';

export interface TabItem {
    id: string;
    label: string;
    icon?: any;
    [key: string]: any;
}

// Global event bus for layout updates
const layoutUpdateListeners: Set<(featureKey: string, config: any) => void> = new Set();

export const notifyLayoutUpdate = (featureKey: string, config: any) => {
    layoutUpdateListeners.forEach(listener => listener(featureKey, config));
};

export const useLayoutTabs = (featureKey: string, defaultTabs: TabItem[]) => {
    const [config, setConfig] = useState<{ order: string[]; hidden: string[] } | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = useCallback(async () => {
        try {
            const res = await api.get(`/layout/${featureKey}`);
            if (res.data.success && res.data.data) {
                setConfig(res.data.data);
            }
        } catch (error) {
            console.error(`Failed to fetch tab layout for ${featureKey}:`, error);
        } finally {
            setLoading(false);
        }
    }, [featureKey]);

    useEffect(() => {
        fetchConfig();

        // Listen for global updates
        const listener = (updatedKey: string, newConfig: any) => {
            if (updatedKey === featureKey) {
                setConfig(newConfig);
            }
        };

        layoutUpdateListeners.add(listener);
        return () => {
            layoutUpdateListeners.delete(listener);
        };
    }, [featureKey, fetchConfig]);

    const activeTabs = useMemo(() => {
        if (!config) return defaultTabs;

        // 1. Filter out hidden tabs
        const filtered = defaultTabs.filter(tab => !config.hidden.includes(tab.id));

        // 2. Sort by order
        const sorted = [...filtered].sort((a, b) => {
            const indexA = config.order.indexOf(a.id);
            const indexB = config.order.indexOf(b.id);

            // If tab is not in order list, put it at the end
            const finalA = indexA === -1 ? 999 : indexA;
            const finalB = indexB === -1 ? 999 : indexB;

            return finalA - finalB;
        });

        return sorted;
    }, [config, defaultTabs]);

    const updateConfig = async (newOrder: string[], hidden: string[]) => {
        try {
            const configPayload = { order: newOrder, hidden };
            const res = await api.post(`/layout/${featureKey}`, {
                config: configPayload
            });
            if (res.data.success) {
                const newConfig = res.data.data;
                setConfig(newConfig);
                notifyLayoutUpdate(featureKey, newConfig);
            }
        } catch (error) {
            console.error(`Failed to update tab layout for ${featureKey}:`, error);
            throw error;
        }
    };

    return { tabs: activeTabs, config, loading, updateConfig, refresh: fetchConfig };
};
