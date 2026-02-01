import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search, X, Loader2 } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    avatar?: string;
}

interface CsystemDropdownSearchProps {
    options: Option[];
    value?: string | string[]; // Support single or multi
    onChange: (value: any) => void;
    placeholder?: string;
    isMulti?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

export default function CsystemDropdownSearch({
    options,
    value,
    onChange,
    placeholder = "Search and select...",
    isMulti = false,
    isLoading = false,
    disabled = false,
    className = ""
}: CsystemDropdownSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [tempValue, setTempValue] = useState<any>(value);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync tempValue with value when dropdown opens
    useEffect(() => {
        if (isOpen) setTempValue(value);
    }, [isOpen, value]);

    const filteredOptions = useMemo(() => {
        return options.filter(option =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            option.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [options, searchQuery]);

    const isSelected = (optionValue: string) => {
        if (isMulti) {
            return Array.isArray(tempValue) && tempValue.includes(optionValue);
        }
        return tempValue === optionValue;
    };

    const toggleOption = (optionValue: string) => {
        if (isMulti) {
            const currentValues = Array.isArray(tempValue) ? tempValue : [];
            const newValues = currentValues.includes(optionValue)
                ? currentValues.filter(v => v !== optionValue)
                : [...currentValues, optionValue];
            setTempValue(newValues);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    const handleSelectAll = () => {
        const allVisible = filteredOptions.map(o => o.value);
        setTempValue(allVisible);
    };

    const handleClear = () => {
        setTempValue(isMulti ? [] : "");
    };

    const handleApply = () => {
        onChange(tempValue);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* COMPACT TRIGGER */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    h-10 px-3 flex items-center justify-between
                    bg-slate-900 border rounded-lg transition-all cursor-pointer text-sm
                    ${isOpen ? 'border-cyan-500 ring-1 ring-cyan-500/20' : 'border-slate-800 hover:border-slate-700'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex-grow truncate text-slate-300">
                    {isMulti && Array.isArray(value) && value.length > 0
                        ? `${value.length} items selected`
                        : !isMulti && value
                            ? options.find(o => o.value === value)?.label
                            : placeholder
                    }
                </div>
                <ChevronDown size={16} className={`text-slate-500 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute z-[100] w-[320px] mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden"
                    >
                        {/* COMPACT ACTIONS HEADER */}
                        <div className="px-3 py-2 flex items-center justify-between text-[11px] border-b border-white/5 bg-slate-950/50">
                            <div className="flex gap-2">
                                {isMulti && (
                                    <>
                                        <button onClick={handleSelectAll} className="text-cyan-400 hover:underline font-bold">Select all {filteredOptions.length}</button>
                                        <span className="text-slate-700">-</span>
                                    </>
                                )}
                                <button onClick={handleClear} className="text-cyan-400 hover:underline font-bold">Clear</button>
                            </div>
                            <div className="text-slate-500">Displaying {filteredOptions.length}</div>
                        </div>

                        {/* COMPACT SEARCH */}
                        <div className="p-2 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-8 pl-3 pr-8 bg-slate-950 border border-slate-800 rounded focus:border-cyan-500/50 outline-none text-xs text-white"
                                placeholder="Filter values..."
                            />
                            <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                        </div>

                        {/* DATA LIST (Checkmark Left) */}
                        <div className="max-h-[220px] overflow-y-auto py-1 scrollbar-thin">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-8 text-center text-slate-600 text-xs italic">No matching results</div>
                            ) : (
                                filteredOptions.map((option, index) => {
                                    const active = isSelected(option.value);
                                    return (
                                        <div
                                            key={option.value}
                                            onClick={() => toggleOption(option.value)}
                                            className={`
                                                px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors
                                                ${active ? 'bg-cyan-500/5' : 'hover:bg-white/5'}
                                            `}
                                        >
                                            <div className={`w-4 h-4 flex items-center justify-center rounded border ${active ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700'}`}>
                                                {active && <Check size={12} className="text-slate-950" strokeWidth={4} />}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className={`text-xs truncate ${active ? 'text-white font-medium' : 'text-slate-400'}`}>{option.label}</p>
                                                {option.description && <p className="text-[10px] text-slate-600 truncate">{option.description}</p>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* COMPACT FOOTER ACTIONS */}
                        <div className="p-2 bg-slate-950/80 border-t border-white/5 flex gap-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 h-8 text-[11px] font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 h-8 text-[11px] font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
