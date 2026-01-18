import { useState, useEffect } from 'react';
import { FeaturePart } from '../../../services/factory.service';
import { getPartSchema, PropSchema } from './PropsRegistry';
import { X, Save, Info, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PropsPanelProps {
    selectedPart: FeaturePart | null;
    onUpdate: (featurePartId: string, newProps: Record<string, any>) => void;
    onClose: () => void;
}

export default function PropsPanel({ selectedPart, onUpdate, onClose }: PropsPanelProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});

    // reset form when selected part changes
    useEffect(() => {
        if (selectedPart) {
            let initialProps = {};
            try {
                // Parse existing props config if it exists
                initialProps = selectedPart.propsConfig
                    ? (typeof selectedPart.propsConfig === 'string' ? JSON.parse(selectedPart.propsConfig) : selectedPart.propsConfig)
                    : {};
            } catch (e) {
                console.error("Failed to parse propsConfig", e);
            }
            setFormData(initialProps || {});
        }
    }, [selectedPart]);

    if (!selectedPart) return null;

    const schema = getPartSchema(selectedPart.part.code);
    const partName = selectedPart.part.name;

    const handleChange = (key: string, value: any) => {
        const newData = { ...formData, [key]: value };
        setFormData(newData);
        // Live update parent immediately
        onUpdate(selectedPart.id, newData);
    };

    const renderField = (key: string, fieldSchema: PropSchema) => {
        const value = formData[key] ?? fieldSchema.defaultValue;

        switch (fieldSchema.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                        placeholder={fieldSchema.placeholder}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={value || 0}
                        onChange={(e) => handleChange(key, Number(e.target.value))}
                        className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                    />
                );
            case 'boolean':
                return (
                    <div className="flex items-center justify-between bg-dark-700 p-2 rounded border border-dark-600">
                        <span className="text-sm text-dark-300">{value ? 'Enabled' : 'Disabled'}</span>
                        <button
                            onClick={() => handleChange(key, !value)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-primary-500' : 'bg-dark-500'
                                }`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${value ? 'left-6' : 'left-1'
                                }`} />
                        </button>
                    </div>
                );
            case 'color':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="h-9 w-14 bg-transparent border-0 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="flex-1 bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm font-mono text-white focus:border-primary-500 focus:outline-none"
                        />
                    </div>
                );
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                    >
                        {fieldSchema.options?.map(opt => (
                            <option key={opt.value.toString()} value={opt.value.toString()}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 border-l border-dark-700 bg-dark-800 flex flex-col h-full overflow-hidden shadow-xl absolute right-0 top-0 bottom-0 z-20"
        >
            {/* Header */}
            <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-800">
                <div>
                    <h3 className="font-semibold text-white">Properties</h3>
                    <p className="text-xs text-dark-400 truncate w-48">{partName}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {schema && Object.entries(schema).length > 0 ? (
                    Object.entries(schema).map(([key, fieldSchema]) => (
                        <div key={key} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-dark-300 uppercase tracking-wider">
                                    {fieldSchema.label}
                                </label>
                                {fieldSchema.description && (
                                    <div className="group relative">
                                        <Info size={12} className="text-dark-500 cursor-help" />
                                        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-dark-900 border border-dark-700 rounded shadow-lg text-xs text-dark-200 hidden group-hover:block z-50">
                                            {fieldSchema.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {renderField(key, fieldSchema)}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-dark-400">
                        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No configurable properties for this component.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-dark-700 bg-dark-800 text-xs text-dark-500 text-center">
                Changes apply instantly in preview
            </div>
        </motion.div>
    );
}
