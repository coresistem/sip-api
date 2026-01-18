/**
 * Location API Service
 * Handles province and city data
 */
import { api } from '../context/AuthContext';

// Types
export interface Province {
    id: string;
    name: string;
}

export interface City {
    id: string;
    name: string;
    type: 'KOTA' | 'KABUPATEN';
}

export interface ProvinceWithCities {
    province: Province;
    cities: City[];
}

/**
 * Get all provinces
 */
export const getProvinces = async (): Promise<Province[]> => {
    const response = await api.get('/locations/provinces');
    return response.data.data;
};

/**
 * Get cities by province ID
 */
export const getCitiesByProvince = async (provinceId: string): Promise<ProvinceWithCities> => {
    const response = await api.get(`/locations/cities/${provinceId}`);
    return response.data.data;
};

/**
 * Search provinces by name
 */
export const searchProvinces = async (query: string): Promise<Province[]> => {
    const response = await api.get(`/locations/provinces/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
};

// Cache for provinces (rarely changes)
let provincesCache: Province[] | null = null;

/**
 * Get provinces with caching
 */
export const getProvincesWithCache = async (): Promise<Province[]> => {
    if (provincesCache) {
        return provincesCache;
    }
    provincesCache = await getProvinces();
    return provincesCache;
};

/**
 * Clear provinces cache
 */
export const clearProvincesCache = () => {
    provincesCache = null;
};
