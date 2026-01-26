import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    className = "",
    disabled = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedOption = options.find(option => option.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm bg-dark-800 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-white/10 hover:border-white/20'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={selectedOption ? 'text-white' : 'text-dark-400'}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronsUpDown className="w-4 h-4 text-dark-400 opacity-50" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-50 w-full mt-2 bg-dark-800 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="flex items-center px-3 py-2 border-b border-white/5">
                            <Search className="w-4 h-4 text-dark-400 mr-2" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full bg-transparent border-none focus:outline-none text-sm text-white placeholder-dark-400"
                            />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto py-1">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-dark-400 text-center">
                                    No results found.
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearchQuery("");
                                        }}
                                        className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${value === option.value
                                                ? 'bg-primary-500/20 text-primary-400'
                                                : 'text-dark-200 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Check
                                            className={`w-4 h-4 mr-2 ${value === option.value ? 'opacity-100' : 'opacity-0'
                                                }`}
                                        />
                                        {option.label}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
