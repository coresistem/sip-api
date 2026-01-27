import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../contexts/AuthContext';

export interface LayoutConfig {
    order: string[];
    sizes: Record<string, number>;
    heights: Record<string, number>;
}

export const useDashboardLayout = (
    storageKey: string,
    defaultOrder: string[],
    defaultSizes: Record<string, number>,
    defaultHeights: Record<string, number>,
    dashboardTypeKey: string // Key used for the database (e.g., 'athlete_main')
) => {
    const [order, setOrder] = useState<string[]>(defaultOrder);
    const [sizes, setSizes] = useState<Record<string, number>>(defaultSizes);
    const [heights, setHeights] = useState<Record<string, number>>(defaultHeights);
    const [isResizing, setIsResizing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Load layout from API or LocalStorage
    useEffect(() => {
        const fetchLayout = async () => {
            try {
                const response = await api.get(`/api/v1/dashboard/layout/${dashboardTypeKey}`);
                if (response.data.success && response.data.data) {
                    const { order: o, sizes: s, heights: h } = response.data.data;
                    setOrder(o);
                    setSizes(s);
                    setHeights(h);
                } else {
                    // Fallback to local storage if API fails or no data
                    const savedOrder = localStorage.getItem(`${storageKey}_order`);
                    const savedSizes = localStorage.getItem(`${storageKey}_sizes`);
                    const savedHeights = localStorage.getItem(`${storageKey}_heights`);

                    if (savedOrder) setOrder(JSON.parse(savedOrder));
                    if (savedSizes) setSizes(JSON.parse(savedSizes));
                    if (savedHeights) setHeights(JSON.parse(savedHeights));
                }
            } catch (error) {
                console.error('Failed to fetch dashboard layout:', error);
            } finally {
                setIsInitialLoad(false);
            }
        };

        fetchLayout();
    }, [dashboardTypeKey, storageKey]);

    // 2. Debounced save to API and LocalStorage
    const saveLayout = useCallback((newOrder: string[], newSizes: Record<string, number>, newHeights: Record<string, number>, asDefault: boolean = false) => {
        // Always save to local storage immediately
        localStorage.setItem(`${storageKey}_order`, JSON.stringify(newOrder));
        localStorage.setItem(`${storageKey}_sizes`, JSON.stringify(newSizes));
        localStorage.setItem(`${storageKey}_heights`, JSON.stringify(newHeights));

        // Debounce API call
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await api.post('/api/v1/dashboard/layout', {
                    key: dashboardTypeKey,
                    layoutData: { order: newOrder, sizes: newSizes, heights: newHeights },
                    isDefault: asDefault
                });
            } catch (error) {
                console.error('Failed to save dashboard layout to server:', error);
            }
        }, 1000); // Wait 1 second after last change
    }, [dashboardTypeKey, storageKey]);

    const updateOrder = useCallback((newOrder: string[]) => {
        setOrder(newOrder);
        saveLayout(newOrder, sizes, heights);
    }, [saveLayout, sizes, heights]);

    const toggleSize = useCallback((id: string) => {
        setSizes(prev => {
            const newSpan = (prev[id] || 6) < 12 ? 12 : 6;
            const newSizes = { ...prev, [id]: newSpan };
            saveLayout(order, newSizes, heights);
            return newSizes;
        });
    }, [order, heights, saveLayout]);

    const handleResize = useCallback((id: string, deltaX: number, deltaY: number) => {
        setIsResizing(true);
        let updatedSizes = sizes;
        let updatedHeights = heights;

        if (deltaY !== 0) {
            setHeights(prev => {
                const currentHeight = prev[id] || 320;
                const newHeight = Math.max(150, Math.min(1200, Math.round((currentHeight + deltaY) / 10) * 10));
                if (newHeight === currentHeight) return prev;
                updatedHeights = { ...prev, [id]: newHeight };
                return updatedHeights;
            });
        }

        if (deltaX !== 0) {
            setSizes(prev => {
                const currentSpan = prev[id] || 6;
                const sensitivity = 60;
                const moveColumns = Math.round(deltaX / sensitivity);
                if (moveColumns === 0) return prev;
                const newSpan = Math.max(2, Math.min(12, currentSpan + moveColumns));
                if (newSpan === currentSpan) return prev;
                updatedSizes = { ...prev, [id]: newSpan };
                return updatedSizes;
            });
        }

        // Trigger save after state update
        saveLayout(order, updatedSizes, updatedHeights);

        setTimeout(() => setIsResizing(false), 200);
    }, [order, sizes, heights, saveLayout]);

    // Specific function for Super Admin to save current view as global default
    const saveAsDefault = useCallback(() => {
        saveLayout(order, sizes, heights, true);
    }, [order, sizes, heights, saveLayout]);

    return {
        order,
        sizes,
        heights,
        isResizing,
        isInitialLoad,
        updateOrder,
        toggleSize,
        handleResize,
        saveAsDefault
    };
};
