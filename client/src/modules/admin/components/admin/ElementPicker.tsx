import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image, Type, MousePointer, Sparkles } from 'lucide-react';
import {
    UIElement, UIElementType, LogoConfig, IconConfig, TextConfig, ButtonConfig,
    generateElementId
} from '../../../core/types/uiBuilder';

interface ElementPickerProps {
    onClose: () => void;
    onAdd: (element: UIElement) => void;
}

const ELEMENT_TYPES: { type: UIElementType; label: string; icon: React.ElementType; description: string }[] = [
    { type: 'logo', label: 'Logo', icon: Image, description: 'Club logo or user avatar' },
    { type: 'icon', label: 'Icon', icon: Sparkles, description: 'Lucide icon with color' },
    { type: 'text', label: 'Text', icon: Type, description: 'Static or dynamic text' },
    { type: 'button', label: 'Button', icon: MousePointer, description: 'Action button' },
];

const LUCIDE_ICONS = [
    'Home', 'Settings', 'User', 'Users', 'Target', 'Calendar', 'Clock', 'Bell',
    'Mail', 'MessageSquare', 'Heart', 'Star', 'Award', 'Trophy', 'Flag',
    'MapPin', 'Navigation', 'Search', 'Filter', 'Download', 'Upload', 'Share',
    'Plus', 'Minus', 'Check', 'X', 'AlertCircle', 'Info', 'HelpCircle'
];

export default function ElementPicker({ onClose, onAdd }: ElementPickerProps) {
    const [selectedType, setSelectedType] = useState<UIElementType | null>(null);

    // Logo config
    const [logoSource, setLogoSource] = useState<'club' | 'user' | 'custom'>('club');
    const [logoSize, setLogoSize] = useState<'sm' | 'md' | 'lg'>('md');
    const [customLogoUrl, setCustomLogoUrl] = useState('');

    // Icon config
    const [iconName, setIconName] = useState('Star');
    const [iconColor, setIconColor] = useState('#0ea5e9');

    // Text config
    const [textContent, setTextContent] = useState('');
    const [textStyle, setTextStyle] = useState<'heading' | 'subheading' | 'body'>('body');

    // Button config
    const [buttonLabel, setButtonLabel] = useState('');
    const [buttonAction, setButtonAction] = useState<'navigate' | 'modal' | 'external'>('navigate');
    const [buttonTarget, setButtonTarget] = useState('');
    const [buttonVariant, setButtonVariant] = useState<'primary' | 'secondary' | 'ghost'>('primary');

    const handleAdd = () => {
        if (!selectedType) return;

        let config: LogoConfig | IconConfig | TextConfig | ButtonConfig;

        switch (selectedType) {
            case 'logo':
                config = { source: logoSource, customUrl: customLogoUrl, size: logoSize } as LogoConfig;
                break;
            case 'icon':
                config = { name: iconName, color: iconColor } as IconConfig;
                break;
            case 'text':
                config = { content: textContent, style: textStyle } as TextConfig;
                break;
            case 'button':
                config = { label: buttonLabel, action: buttonAction, target: buttonTarget, variant: buttonVariant } as ButtonConfig;
                break;
        }

        const element: UIElement = {
            id: generateElementId(),
            type: selectedType,
            visible: true,
            config
        };

        onAdd(element);
    };

    const renderTypeConfig = () => {
        switch (selectedType) {
            case 'logo':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="label">Source</label>
                            <select
                                value={logoSource}
                                onChange={(e) => setLogoSource(e.target.value as 'club' | 'user' | 'custom')}
                                className="input"
                            >
                                <option value="club">Club Logo</option>
                                <option value="user">User Avatar</option>
                                <option value="custom">Custom URL</option>
                            </select>
                        </div>
                        {logoSource === 'custom' && (
                            <div>
                                <label className="label">Custom URL</label>
                                <input
                                    type="url"
                                    value={customLogoUrl}
                                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="input"
                                />
                            </div>
                        )}
                        <div>
                            <label className="label">Size</label>
                            <div className="flex gap-2">
                                {(['sm', 'md', 'lg'] as const).map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setLogoSize(size)}
                                        className={`px-4 py-2 rounded-lg ${logoSize === size
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-700 text-dark-300'
                                            }`}
                                    >
                                        {size.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'icon':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="label">Icon</label>
                            <select
                                value={iconName}
                                onChange={(e) => setIconName(e.target.value)}
                                className="input"
                            >
                                {LUCIDE_ICONS.map(icon => (
                                    <option key={icon} value={icon}>{icon}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Color</label>
                            <input
                                type="color"
                                value={iconColor}
                                onChange={(e) => setIconColor(e.target.value)}
                                className="w-full h-10 rounded-lg cursor-pointer"
                            />
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="label">Content</label>
                            <input
                                type="text"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                placeholder="Welcome back, {user.name}"
                                className="input"
                            />
                            <p className="text-xs text-dark-400 mt-1">
                                Variables: {'{user.name}'}, {'{user.role}'}, {'{club.name}'}
                            </p>
                        </div>
                        <div>
                            <label className="label">Style</label>
                            <div className="flex gap-2">
                                {(['heading', 'subheading', 'body'] as const).map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setTextStyle(style)}
                                        className={`px-4 py-2 rounded-lg capitalize ${textStyle === style
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-700 text-dark-300'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'button':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="label">Label</label>
                            <input
                                type="text"
                                value={buttonLabel}
                                onChange={(e) => setButtonLabel(e.target.value)}
                                placeholder="View Report"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">Action</label>
                            <select
                                value={buttonAction}
                                onChange={(e) => setButtonAction(e.target.value as 'navigate' | 'modal' | 'external')}
                                className="input"
                            >
                                <option value="navigate">Navigate to page</option>
                                <option value="modal">Open modal</option>
                                <option value="external">External link</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Target</label>
                            <input
                                type="text"
                                value={buttonTarget}
                                onChange={(e) => setButtonTarget(e.target.value)}
                                placeholder={buttonAction === 'navigate' ? '/reports' : 'https://...'}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">Variant</label>
                            <div className="flex gap-2">
                                {(['primary', 'secondary', 'ghost'] as const).map(variant => (
                                    <button
                                        key={variant}
                                        onClick={() => setButtonVariant(variant)}
                                        className={`px-4 py-2 rounded-lg capitalize ${buttonVariant === variant
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-700 text-dark-300'
                                            }`}
                                    >
                                        {variant}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Add Element</h3>
                    <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Type Selection */}
                {!selectedType ? (
                    <div className="grid grid-cols-2 gap-3">
                        {ELEMENT_TYPES.map(({ type, label, icon: Icon, description }) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className="p-4 rounded-lg border border-dark-700 hover:border-primary-500/50 transition-colors text-left"
                            >
                                <Icon size={24} className="text-primary-400 mb-2" />
                                <h4 className="font-medium">{label}</h4>
                                <p className="text-xs text-dark-400">{description}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => setSelectedType(null)}
                            className="text-sm text-primary-400 mb-4 hover:underline"
                        >
                            ← Back to types
                        </button>

                        <h4 className="font-medium mb-4 capitalize">{selectedType} Configuration</h4>

                        {renderTypeConfig()}

                        <button
                            onClick={handleAdd}
                            className="w-full mt-6 btn-primary"
                        >
                            Add {selectedType}
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
