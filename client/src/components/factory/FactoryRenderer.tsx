import React from 'react';
import { FeaturePart } from '../../services/factory.service';
import { PREVIEW_REGISTRY } from '../../pages/admin/factory/PreviewRegistry';

interface FactoryRendererProps {
    part: FeaturePart;
}

export const FactoryRenderer: React.FC<FactoryRendererProps> = ({ part }) => {
    // 1. Get Component
    const Component = PREVIEW_REGISTRY[part.part.code];

    if (!Component) {
        return (
            <div className="p-4 border border-red-500/20 bg-red-500/10 rounded text-red-400 text-xs">
                Component not found: {part.part.code}
            </div>
        );
    }

    // 2. Parse Props
    let props = {};
    try {
        if (part.propsConfig) {
            props = JSON.parse(part.propsConfig);
        }
    } catch (e) {
        console.error('Failed to parse props for part', part.id, e);
    }

    // 3. Render
    // We wrap in a generic container if needed, but for widgets we usually leave layout to parent.
    // However, Preview components have their own internal card styles (bg-slate-800 etc).
    return <Component {...props} />;
};
