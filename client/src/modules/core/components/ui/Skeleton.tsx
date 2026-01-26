import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    count?: number;
}

/**
 * Skeleton loader component for displaying loading states
 * Provides smooth pulse animation while content is loading
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    count = 1,
}) => {
    const baseClasses = 'animate-pulse bg-dark-700/50 rounded';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        card: 'rounded-xl',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px'),
    };

    if (variant === 'circular') {
        style.width = style.height;
    }

    const elements = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    ));

    return count === 1 ? elements[0] : <div className="space-y-2">{elements}</div>;
};

/**
 * Table skeleton for loading data tables
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
    rows = 5,
    columns = 4,
}) => {
    return (
        <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex gap-4 pb-2 border-b border-dark-700">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} variant="text" width={`${100 / columns}%`} height="1.25rem" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-2">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            variant="text"
                            width={`${100 / columns}%`}
                            height="1rem"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

/**
 * Card skeleton for loading card grids
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 space-y-3"
                >
                    <div className="flex items-center gap-3">
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="text" width="60%" height="1rem" />
                    </div>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="40%" />
                </div>
            ))}
        </div>
    );
};

/**
 * Dashboard stats skeleton
 */
export const StatsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 space-y-2"
                >
                    <Skeleton variant="text" width="40%" height="0.875rem" />
                    <Skeleton variant="text" width="60%" height="1.5rem" />
                </div>
            ))}
        </div>
    );
};

export default Skeleton;
