import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableResizableCardProps {
    id: string;
    children: React.ReactNode;
    canEdit: boolean;
    colSpan: number;
    height: number;
    onToggleSize: (id: string) => void;
    onResize: (id: string, deltaX: number, deltaY: number) => void;
    isResizing?: boolean;
    className?: string;
}

export const SortableResizableCard: React.FC<SortableResizableCardProps> = ({
    id,
    children,
    canEdit,
    colSpan,
    height,
    onToggleSize,
    onResize,
    isResizing,
    className = ''
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: canEdit || isDragging ? CSS.Transform.toString(transform) : undefined,
        transition: canEdit || isDragging ? transition : undefined,
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        height: height ? `${height}px` : 'auto',
        zIndex: isDragging ? 100 : undefined,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        overflow: height ? 'hidden' : 'visible'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${className} relative group border border-transparent rounded-2xl overflow-visible transition-colors duration-200 ${canEdit ? 'hover:border-primary-500/30 bg-dark-900/10' : ''}`}
        >
            {canEdit && (
                <>
                    {/* Controls Overlay */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSize(id);
                            }}
                            className="p-2 bg-dark-700/80 hover:bg-dark-600 rounded-lg border border-dark-600 shadow-xl transition-colors text-dark-300 hover:text-white"
                            title={colSpan < 12 ? 'Expand to full width' : 'Collapse to half width'}
                        >
                            {colSpan < 12 ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                        <div
                            {...attributes}
                            {...listeners}
                            className="p-2 bg-dark-700/80 hover:bg-dark-600 rounded-lg cursor-grab active:cursor-grabbing border border-dark-600 shadow-xl"
                        >
                            <GripVertical className="w-4 h-4 text-dark-400" />
                        </div>
                    </div>

                    {/* Resize Handles */}
                    <div className="absolute inset-x-0 inset-y-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Right Width Handle */}
                        <motion.div
                            drag
                            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                            dragElastic={0}
                            onDragStart={() => document.body.style.cursor = 'ew-resize'}
                            onDragEnd={() => document.body.style.cursor = 'auto'}
                            onDrag={(_, info) => onResize(id, info.delta.x, 0)}
                            className="pointer-events-auto absolute -right-2 top-8 bottom-8 w-4 cursor-ew-resize hover:bg-primary-500/20 rounded-full transition-colors flex items-center justify-center group/handle"
                        >
                            <div className="w-1 h-8 bg-primary-500/30 rounded-full group-hover/handle:bg-primary-500/60 transition-colors" />
                        </motion.div>

                        {/* Bottom Height Handle */}
                        <motion.div
                            drag
                            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                            dragElastic={0}
                            onDragStart={() => document.body.style.cursor = 'ns-resize'}
                            onDragEnd={() => document.body.style.cursor = 'auto'}
                            onDrag={(_, info) => onResize(id, 0, info.delta.y)}
                            className="pointer-events-auto absolute inset-x-8 -bottom-2 h-4 cursor-ns-resize hover:bg-primary-500/20 rounded-full transition-colors flex items-center justify-center group/handle_v"
                        >
                            <div className="h-1 w-12 bg-primary-500/30 rounded-full group-hover/handle_v:bg-primary-500/60 transition-colors" />
                        </motion.div>

                        {/* Corner Handle */}
                        <motion.div
                            drag
                            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                            dragElastic={0}
                            onDragStart={() => document.body.style.cursor = 'nwse-resize'}
                            onDragEnd={() => document.body.style.cursor = 'auto'}
                            onDrag={(_, info) => onResize(id, info.delta.x, info.delta.y)}
                            className="pointer-events-auto absolute -bottom-2 -right-2 w-6 h-6 cursor-nwse-resize hover:bg-primary-500/80 rounded-full transition-all border-2 border-primary-500 shadow-lg bg-dark-800 flex items-center justify-center"
                        >
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                        </motion.div>
                    </div>
                </>
            )}
            {children}
        </div>
    );
};
