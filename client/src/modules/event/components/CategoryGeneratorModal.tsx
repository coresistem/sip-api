import React, { useState } from 'react';
import { X, Check, AlertCircle, Layers, Users, Target } from 'lucide-react';
import { CATEGORY_DIVISIONS, AGE_CLASSES, GENDERS } from '../constants';
import { CompetitionCategoryItem } from '../types';

interface CategoryGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (categories: CompetitionCategoryItem[]) => void;
}

const DISTANCE_RULES: Record<string, Record<string, string>> = {
    'RECURVE': {
        'Senior': '70m', 'U21': '70m', 'U18': '60m', 'U15': '40m', 'U13': '30m', 'U10': '20m', 'Master (50+)': '60m', 'Open': '70m'
    },
    'COMPOUND': {
        'Senior': '50m', 'U21': '50m', 'U18': '50m', 'U15': '40m', 'U13': '30m', 'U10': '20m', 'Master (50+)': '50m', 'Open': '50m'
    },
    'BAREBOW': {
        'Senior': '50m', 'U21': '50m', 'U18': '50m', 'U15': '40m', 'U13': '30m', 'U10': '20m', 'Master (50+)': '50m', 'Open': '50m'
    },
    'STANDARD': {
        'Senior': '40m', 'U21': '40m', 'U18': '40m', 'U15': '30m', 'U13': '20m', 'U10': '15m', 'Master (50+)': '40m', 'Open': '40m'
    },
    'TRADITIONAL': {
        'Senior': '20m', 'U21': '20m', 'U18': '15m', 'U15': '10m', 'U13': '10m', 'U10': '5m', 'Master (50+)': '20m', 'Open': '20m'
    }
};

export default function CategoryGeneratorModal({ isOpen, onClose, onGenerate }: CategoryGeneratorModalProps) {
    const [selectedDivisions, setSelectedDivisions] = useState<string[]>(['RECURVE']);
    const [selectedClasses, setSelectedClasses] = useState<string[]>(['Senior']);
    const [selectedGenders, setSelectedGenders] = useState<string[]>(['MALE', 'FEMALE']);
    const [defaultQuota, setDefaultQuota] = useState(64);
    const [defaultFee, setDefaultFee] = useState(150000);
    const [includeTeam, setIncludeTeam] = useState(true);
    const [includeMixed, setIncludeMixed] = useState(true);

    if (!isOpen) return null;

    const toggleSelection = (list: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(item)) {
            setter(list.filter(i => i !== item));
        } else {
            setter([...list, item]);
        }
    };

    const previewCount = selectedDivisions.length * selectedClasses.length * selectedGenders.length;

    const handleGenerate = () => {
        const newCategories: CompetitionCategoryItem[] = [];

        selectedDivisions.forEach(div => {
            selectedClasses.forEach(cls => {
                selectedGenders.forEach(gen => {
                    // Logic for Team/Mix
                    // Usually Mix is its own category or flag? 
                    // In this system, 'qMix' flags exist on the Individual Category to say "This serves as qual for Mix".
                    // But if we want a separate Mix Team Category (like in the DB), the current model supports it via 'gender: MIXED'.

                    // If gender is MIXED, we usually don't have Mixed Team flag set, it IS the Mixed Team event.
                    // But for MALE/FEMALE, we set qTeam/qMix.

                    let isMixCategory = gen === 'MIXED';
                    let fee = defaultFee;
                    let quota = defaultQuota;

                    // Auto-distance
                    let distance = '70m'; // default
                    if (DISTANCE_RULES[div] && DISTANCE_RULES[div][cls]) {
                        distance = DISTANCE_RULES[div][cls];
                    } else if (DISTANCE_RULES[div]) {
                        // Fallback to first rule of division or generic
                        distance = Object.values(DISTANCE_RULES[div])[0] || '70m';
                    }

                    // For 'General' class fallback
                    if (cls === 'General') distance = DISTANCE_RULES[div]['Senior'] || '70m';

                    // Flags
                    const qInd = !isMixCategory;
                    const eInd = !isMixCategory;
                    const qTeam = isMixCategory ? false : includeTeam;
                    const eTeam = isMixCategory ? false : includeTeam;
                    const qMix = isMixCategory ? false : includeMixed; // M/F scores count for Mix
                    const eMix = isMixCategory ? true : false; // If this IS the mix category


                    // Wait, usually we don't create a separate "MIXED" category in the list for Registration 
                    // unless it's a specific "Mixed Team" registration event.
                    // But in this system, typically users register as Individuals, and Teams are formed.
                    // However, sometimes there IS a Mixed Team category entry for allocation/scheduling.
                    // Given the 'GENDERS' constant has 'MIXED', we might generate it.
                    // If the user selects 'MIXED' in genders, we generate it.

                    newCategories.push({
                        id: Math.random().toString(36).substr(2, 9),
                        division: div,
                        ageClass: cls,
                        gender: gen,
                        distance: distance,
                        quota: quota,
                        fee: fee,
                        qInd,
                        eInd,
                        qTeam,
                        eTeam,
                        qMix: isMixCategory ? false : qMix,
                        eMix: isMixCategory ? true : false,
                        isSpecial: false,
                        categoryLabel: ''
                    });
                });
            });
        });

        onGenerate(newCategories);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-dark-900 border border-dark-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
                <div className="p-6 border-b border-dark-700 flex justify-between items-center sticky top-0 bg-dark-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Layers className="text-primary-500" />
                            Bulk Category Generator
                        </h2>
                        <p className="text-dark-400 text-sm mt-1">Select combinations to auto-generate multiple categories</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Divisions */}
                    <section>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Target size={14} className="text-primary-400" /> Divisions
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {CATEGORY_DIVISIONS.map(div => (
                                <button
                                    key={div}
                                    onClick={() => toggleSelection(selectedDivisions, div, setSelectedDivisions)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedDivisions.includes(div)
                                            ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                            : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600'
                                        }`}
                                >
                                    {div}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Classes */}
                    <section>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Users size={14} className="text-primary-400" /> Age Classes
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {AGE_CLASSES.map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => toggleSelection(selectedClasses, cls, setSelectedClasses)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedClasses.includes(cls)
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                            : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600'
                                        }`}
                                >
                                    {cls}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Genders */}
                    <section>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Genders</h3>
                        <div className="flex flex-wrap gap-3">
                            {GENDERS.map(gen => (
                                <button
                                    key={gen}
                                    onClick={() => toggleSelection(selectedGenders, gen, setSelectedGenders)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedGenders.includes(gen)
                                            ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                                            : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600'
                                        }`}
                                >
                                    {gen}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Settings */}
                    <section className="bg-dark-800/50 p-4 rounded-xl border border-dark-700/50">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Default Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="label">Quota per Category</label>
                                <input
                                    type="number"
                                    value={defaultQuota}
                                    onChange={e => setDefaultQuota(parseInt(e.target.value) || 0)}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="label">Fee per Athlete (IDR)</label>
                                <input
                                    type="number"
                                    value={defaultFee}
                                    onChange={e => setDefaultFee(parseInt(e.target.value) || 0)}
                                    className="input w-full"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <input
                                    type="checkbox"
                                    checked={includeTeam}
                                    onChange={e => setIncludeTeam(e.target.checked)}
                                    className="rounded bg-dark-700 border-dark-600 text-primary-500"
                                />
                                <span className="text-sm text-dark-300">Enable Team Events</span>
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <input
                                    type="checkbox"
                                    checked={includeMixed}
                                    onChange={e => setIncludeMixed(e.target.checked)}
                                    className="rounded bg-dark-700 border-dark-600 text-primary-500"
                                />
                                <span className="text-sm text-dark-300">Enable Mixed Team</span>
                            </div>
                        </div>
                    </section>

                    {/* Preview */}
                    <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400">
                        <AlertCircle size={20} />
                        <div>
                            <span className="font-bold">Preview: </span>
                            This will generate <span className="font-bold underline text-white">{previewCount}</span> new categories.
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-dark-700 flex justify-end gap-3 bg-dark-900 sticky bottom-0">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button
                        onClick={handleGenerate}
                        disabled={previewCount === 0}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Check size={18} />
                        Generate {previewCount} Categories
                    </button>
                </div>
            </div>
        </div>
    );
}
