import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
    UIElement,
    UIElementType,
    ModuleLayout,
    TextConfig,
    ButtonConfig,
    IconConfig,
    LogoConfig,
    getRoleUISettings,
    DEFAULT_MODULE_LAYOUTS
} from '../../types/uiBuilder';
import { ModuleName, UserRole } from '../../types/permissions';

interface ModuleHeaderProps {
    moduleId: ModuleName;
    className?: string;
    fallbackTitle?: string;
    fallbackSubtitle?: string;
}

// Render individual element based on type
const RenderElement = ({ element, user }: { element: UIElement; user: any }) => {
    const navigate = useNavigate();

    if (!element.visible) return null;

    const replaceVariables = (text: string) => {
        return text
            .replace('{user.name}', user?.name || 'User')
            .replace('{user.role}', user?.role || 'Member')
            .replace('{club.name}', 'CORE Archery Club');
    };

    switch (element.type) {
        case 'text': {
            const config = element.config as TextConfig;
            const content = replaceVariables(config.content);
            const styleClasses = {
                heading: 'text-2xl font-bold',
                subheading: 'text-dark-400 mt-1',
                body: 'text-sm text-dark-300',
            };
            return (
                <span key={element.id} className={styleClasses[config.style]}>
                    {content}
                </span>
            );
        }

        case 'button': {
            const config = element.config as ButtonConfig;
            const variantClasses = {
                primary: 'btn-primary',
                secondary: 'btn-secondary',
                ghost: 'text-dark-400 hover:text-white transition-colors',
            };
            const handleClick = () => {
                if (config.action === 'navigate') {
                    navigate(config.target);
                } else if (config.action === 'external') {
                    window.open(config.target, '_blank');
                }
                // Modal actions would need additional handling
            };
            return (
                <button
                    key={element.id}
                    onClick={handleClick}
                    className={`${variantClasses[config.variant]} flex items-center gap-2`}
                >
                    {config.label}
                </button>
            );
        }

        case 'icon': {
            const config = element.config as IconConfig;
            const IconComponent = (Icons as any)[config.name] || Icons.Circle;
            return (
                <IconComponent
                    key={element.id}
                    size={24}
                    style={{ color: config.color }}
                />
            );
        }

        case 'logo': {
            const config = element.config as LogoConfig;
            const sizeClasses = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
            const src = config.source === 'user'
                ? user?.avatar || '/default-avatar.png'
                : config.source === 'club'
                    ? '/logo.png'
                    : config.customUrl || '/logo.png';
            return (
                <img
                    key={element.id}
                    src={src}
                    alt="Logo"
                    className={`${sizeClasses[config.size]} object-contain rounded`}
                />
            );
        }

        default:
            return null;
    }
};

export default function ModuleHeader({
    moduleId,
    className = '',
    fallbackTitle,
    fallbackSubtitle
}: ModuleHeaderProps) {
    const { user } = useAuth();

    // Get layout from UI Builder config or defaults
    const layout = useMemo((): ModuleLayout => {
        const roleSettings = getRoleUISettings(user?.role as UserRole);
        const moduleConfig = roleSettings?.modules.find(m => m.moduleId === moduleId);

        if (moduleConfig?.layout) {
            return moduleConfig.layout;
        }

        // Fall back to defaults
        return (DEFAULT_MODULE_LAYOUTS[moduleId] || {
            leftTitle: fallbackTitle ? [
                { id: 'fallback_title', type: 'text' as UIElementType, visible: true, config: { content: fallbackTitle, style: 'heading' } as TextConfig },
                ...(fallbackSubtitle ? [{ id: 'fallback_subtitle', type: 'text' as UIElementType, visible: true, config: { content: fallbackSubtitle, style: 'subheading' } as TextConfig }] : [])
            ] : [],
        }) as ModuleLayout;
    }, [moduleId, user?.role, fallbackTitle, fallbackSubtitle]);

    const hasLeftElements = layout.leftTitle && layout.leftTitle.length > 0;
    const hasMiddleElements = layout.middleTitle && layout.middleTitle.length > 0;
    const hasRightElements = layout.rightTitle && layout.rightTitle.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between ${className}`}
        >
            {/* Left Section */}
            {hasLeftElements && (
                <div className="flex flex-col">
                    {layout.leftTitle!.map(elem => (
                        <RenderElement key={elem.id} element={elem} user={user} />
                    ))}
                </div>
            )}

            {/* Middle Section */}
            {hasMiddleElements && (
                <div className="flex items-center gap-3">
                    {layout.middleTitle!.map(elem => (
                        <RenderElement key={elem.id} element={elem} user={user} />
                    ))}
                </div>
            )}

            {/* Right Section */}
            {hasRightElements && (
                <div className="flex items-center gap-3">
                    {layout.rightTitle!.map(elem => (
                        <RenderElement key={elem.id} element={elem} user={user} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
