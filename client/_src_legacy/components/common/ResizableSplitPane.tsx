import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizableSplitPaneProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    defaultLeftWidth?: number; // percentage 0-100
    minLeftWidth?: number; // percentage
    maxLeftWidth?: number; // percentage
    className?: string;
}

const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
    leftPanel,
    rightPanel,
    defaultLeftWidth = 50,
    minLeftWidth = 20,
    maxLeftWidth = 80,
    className = '',
}) => {
    const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Clamp to min/max
        const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
        setLeftWidth(clampedWidth);
    }, [isDragging, minLeftWidth, maxLeftWidth]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={containerRef}
            className={`flex h-full ${className}`}
        >
            {/* Left Panel */}
            <div
                className="overflow-auto"
                style={{ width: `${leftWidth}%` }}
            >
                {leftPanel}
            </div>

            {/* Draggable Divider */}
            <div
                onMouseDown={handleMouseDown}
                className={`
                    w-1 cursor-col-resize bg-slate-700 hover:bg-primary-500 
                    transition-colors relative group flex-shrink-0
                    ${isDragging ? 'bg-primary-500' : ''}
                `}
            >
                {/* Wider hit area */}
                <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />

                {/* Visual indicator */}
                <div className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-1 h-8 rounded-full 
                    ${isDragging ? 'bg-primary-400' : 'bg-slate-500 group-hover:bg-primary-400'}
                    transition-colors
                `} />
            </div>

            {/* Right Panel */}
            <div
                className="overflow-auto flex-1"
                style={{ width: `${100 - leftWidth}%` }}
            >
                {rightPanel}
            </div>
        </div>
    );
};

export default ResizableSplitPane;
