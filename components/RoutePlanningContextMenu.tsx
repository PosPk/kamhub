'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFloatingUI } from '@/lib/hooks/useFloatingUI';

interface RoutePlanningContextMenuProps {
  position: { x: number; y: number };
  onAddStop: () => void;
  onOptimize: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export function RoutePlanningContextMenu({
  position,
  onAddStop,
  onOptimize,
  onRemove,
  onClose
}: RoutePlanningContextMenuProps) {
  const { refs, floatingStyles, context, getFloatingProps } = useFloatingUI({
    open: true,
    placement: 'right-start',
    interaction: 'click',
    offset: 10
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refs.floating.current && !refs.floating.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, refs.floating]);

  return (
    <div
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        position: 'fixed',
        left: position.x,
        top: position.y
      }}
      className="context-menu"
      {...getFloatingProps()}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48">
        <button
          onClick={onAddStop}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
        >
          <span className="mr-3">📍</span>
          Добавить остановку
        </button>
        <button
          onClick={onOptimize}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
        >
          <span className="mr-3">🔄</span>
          Оптимизировать маршрут
        </button>
        <button
          onClick={onRemove}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-red-600"
        >
          <span className="mr-3">🗑️</span>
          Удалить точку
        </button>
      </div>
    </div>
  );
}