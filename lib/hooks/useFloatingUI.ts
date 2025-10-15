'use client';

import { useFloating, autoUpdate, offset, flip, shift, arrow } from '@floating-ui/react';
import { useHover, useFocus, useInteractions, useRole, useDismiss } from '@floating-ui/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useRef } from 'react';

export interface FloatingUIOptions {
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
  offset?: number;
  interaction?: 'hover' | 'click' | 'focus';
  arrow?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useFloatingUI(options: FloatingUIOptions = {}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const arrowRef = useRef<HTMLDivElement>(null);
  
  const floating = useFloating({
    open: options.open,
    onOpenChange: options.onOpenChange,
    placement: isMobile ? 'top' : options.placement || 'bottom-start',
    middleware: [
      offset(options.offset || 8),
      flip({ 
        fallbackAxisSideDirection: 'start',
        padding: 8 
      }),
      shift({ padding: 8 }),
      ...(options.arrow ? [arrow({ element: arrowRef })] : [])
    ],
    whileElementsMounted: autoUpdate
  });

  const interactions = useInteractions([
    useHover(floating.context, {
      enabled: options.interaction === 'hover',
      move: false,
      delay: { open: 500, close: 0 }
    }),
    useFocus(floating.context, {
      enabled: options.interaction === 'focus'
    }),
    useDismiss(floating.context),
    useRole(floating.context, { role: 'tooltip' })
  ]);

  return {
    ...floating,
    ...interactions,
    isMobile,
    arrowRef
  };
}