import React from 'react';
import { motion } from 'framer-motion';
import { Info, Calendar, MapPin } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LocationPicker from '@/modules/core/components/LocationPicker';
import SearchableSelect from '@/modules/core/components/ui/SearchableSelect';
import { countries } from '@/modules/core/data/countries';
import { EventForm } from '../../types';

interface Step1Props {
    form: EventForm;
    updateForm: (field: keyof EventForm, value: any) => void;
    provinces: any[];
    cities: any[];
    isLoadingProvinces: boolean;
    isLoadingCities: boolean;
    handleProvinceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Step1GeneralInfo: React.FC<Step1Props> = ({
    form,
    updateForm,
    provinces,
    cities,
    isLoadingProvinces,
    isLoadingCities,
    handleProvinceChange
}) => {
    return (
        <div className="space-y-8">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Info className="w-5 h-5 text-primary-400" />
                    <h2 className="text-lg font-bold text-white">General Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="label">Event Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => updateForm('name', e.target.value)}
                            placeholder="e.g., Regional Championship 2026"
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="label">Event Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => updateForm('description', e.target.value)}
                            placeholder="Describe your event, highlights, and what participants can expect..."
                            className="input w-full h-32 resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Event Level</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['CLUB', 'CITY', 'PROVINCE', 'NATIONAL', 'INTERNATIONAL'].map(lvl => (
                                    <button
                                        key={lvl}
                                        onClick={() => updateForm('level', lvl as any)}
                                        className={`p-2 rounded-lg border transition-all text-xs font-bold ${form.level === lvl
                                            ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                            : 'bg-dark-800/50 border-white/5 text-dark-400 hover:border-white/10'
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="label">Event Type & Field</label>
                            <div className="space-y-3">
                                {/* Type */}
                                <div className="flex gap-2">
                                    {['INTERNAL', 'SELECTION', 'OPEN'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => updateForm('type', type as any)}
                                            className={`flex-1 p-2 rounded-lg border transition-all text-xs font-bold ${form.type === type
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                : 'bg-dark-800/50 border-white/5 text-dark-400 hover:border-white/10'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                {/* Field Type */}
                                <div className="flex gap-2">
                                    {['OUTDOOR', 'INDOOR'].map(ft => (
                                        <button
                                            key={ft}
                                            onClick={() => updateForm('fieldType', ft as any)}
                                            className={`flex-1 p-2 rounded-lg border transition-all text-xs font-bold ${form.fieldType === ft
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                : 'bg-dark-800/50 border-white/5 text-dark-400 hover:border-white/10'
                                                }`}
                                        >
                                            {ft}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Schedule */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    <h2 className="text-lg font-bold text-white">Schedule</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <label className="label">Start Date</label>
                        <DatePicker
                            selected={form.startDate}
                            onChange={(date) => updateForm('startDate', date)}
                            className="input w-full"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select start date"
                            showMonthDropdown
                            showYearDropdown
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="label">End Date</label>
                        <DatePicker
                            selected={form.endDate}
                            onChange={(date) => updateForm('endDate', date)}
                            className="input w-full"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select end date"
                            showMonthDropdown
                            showYearDropdown
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="label text-amber-400">Registration Deadline</label>
                        <DatePicker
                            selected={form.registrationDeadline}
                            onChange={(date) => updateForm('registrationDeadline', date)}
                            className="input w-full border-amber-500/30 focus:border-amber-500"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select deadline"
                            showMonthDropdown
                            showYearDropdown
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Location */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <MapPin className="w-5 h-5 text-primary-400" />
                    <h2 className="text-lg font-bold text-white">Location</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="label">Venue Name</label>
                        <input
                            type="text"
                            value={form.venue}
                            onChange={(e) => updateForm('venue', e.target.value)}
                            placeholder="e.g., GOR Panahan Bandung"
                            className="input w-full"
                        />
                    </div>

                    <div>
                        <label className="label mb-1 block">Country</label>
                        <SearchableSelect
                            options={countries.map(c => ({ value: c.name, label: c.name }))}
                            value={form.country}
                            onChange={(val) => updateForm('country', val)}
                            placeholder="Select Country"
                            className="w-full"
                        />
                    </div>

                    {form.country === 'Indonesia' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Province</label>
                                <select
                                    value={form.province}
                                    onChange={handleProvinceChange}
                                    className="input w-full"
                                    disabled={isLoadingProvinces}
                                >
                                    <option value="">Select Province</option>
                                    {[...provinces].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">City</label>
                                <select
                                    value={form.city}
                                    onChange={(e) => updateForm('city', e.target.value)}
                                    className="input w-full"
                                    disabled={!form.province || isLoadingCities}
                                >
                                    <option value="">Select City</option>
                                    {cities.map(c => (
                                        <option key={c.id} value={c.id}>{c.type} {c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="label">Full Address</label>
                        <textarea
                            value={form.address}
                            onChange={(e) => updateForm('address', e.target.value)}
                            placeholder="Enter complete address..."
                            className="input w-full h-20 resize-none mb-4"
                        />
                    </div>
                    <div>
                        <label className="label mb-2">Pin Location on Map</label>
                        <LocationPicker
                            onLocationSelect={(lat, lng) => {
                                updateForm('latitude', lat);
                                updateForm('longitude', lng);
                            }}
                            initialLat={form.latitude}
                            initialLng={form.longitude}
                        />
                        {form.latitude && (
                            <p className="text-xs text-dark-400 mt-2">
                                Selected Coordinates: {form.latitude.toFixed(6)}, {form.longitude?.toFixed(6)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step1GeneralInfo;
