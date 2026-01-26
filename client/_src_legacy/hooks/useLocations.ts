/**
 * useLocations Hook
 * Manages province and city data with caching
 */
import { useState, useEffect, useCallback } from 'react';
import {
    Province,
    City,
    getProvincesWithCache,
    getCitiesByProvince
} from '../services/locationApi';

interface UseLocationsReturn {
    provinces: Province[];
    cities: City[];
    selectedProvince: string;
    selectedCity: string;
    isLoadingProvinces: boolean;
    isLoadingCities: boolean;
    error: string | null;
    setSelectedProvince: (provinceId: string) => void;
    setSelectedCity: (cityId: string) => void;
    getProvinceName: (provinceId: string) => string;
    getCityName: (cityId: string) => string;
}

export function useLocations(
    initialProvinceId?: string,
    initialCityId?: string
): UseLocationsReturn {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedProvince, setSelectedProvinceState] = useState(initialProvinceId || '');
    const [selectedCity, setSelectedCityState] = useState(initialCityId || '');
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setIsLoadingProvinces(true);
                const data = await getProvincesWithCache();
                setProvinces(data);
            } catch (err) {
                setError('Failed to load provinces');
                console.error('Provinces fetch error:', err);
            } finally {
                setIsLoadingProvinces(false);
            }
        };

        fetchProvinces();
    }, []);

    // Fetch cities when province changes
    useEffect(() => {
        if (!selectedProvince) {
            setCities([]);
            return;
        }

        const fetchCities = async () => {
            try {
                setIsLoadingCities(true);
                const data = await getCitiesByProvince(selectedProvince);
                setCities(data.cities);
            } catch (err) {
                setError('Failed to load cities');
                console.error('Cities fetch error:', err);
            } finally {
                setIsLoadingCities(false);
            }
        };

        fetchCities();
    }, [selectedProvince]);

    // Set province and clear city
    const setSelectedProvince = useCallback((provinceId: string) => {
        setSelectedProvinceState(provinceId);
        setSelectedCityState(''); // Clear city when province changes
    }, []);

    // Set city
    const setSelectedCity = useCallback((cityId: string) => {
        setSelectedCityState(cityId);
    }, []);

    // Get province name by ID
    const getProvinceName = useCallback((provinceId: string): string => {
        const province = provinces.find(p => p.id === provinceId);
        return province?.name || '';
    }, [provinces]);

    // Get city name by ID
    const getCityName = useCallback((cityId: string): string => {
        const city = cities.find(c => c.id === cityId);
        return city?.name || '';
    }, [cities]);

    return {
        provinces,
        cities,
        selectedProvince,
        selectedCity,
        isLoadingProvinces,
        isLoadingCities,
        error,
        setSelectedProvince,
        setSelectedCity,
        getProvinceName,
        getCityName,
    };
}
