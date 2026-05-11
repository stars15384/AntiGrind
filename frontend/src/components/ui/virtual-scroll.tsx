import { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of extra items to render above/below viewport
  className?: string;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Scroll to index
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
      setScrollTop(index * itemHeight);
    }
  }, [itemHeight]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: `${containerHeight}px`,
        overflowY: 'auto',
        position: 'relative',
      }}
      className={className}
    >
      {/* Spacer for scroll height */}
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {/* Visible items with absolute positioning */}
        {visibleItems.map((item, i) => {
          const actualIndex = startIndex + i;
          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top: `${actualIndex * itemHeight}px`,
                left: 0,
                right: 0,
                height: `${itemHeight}px`,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook for virtual scrolling with dynamic row heights
export function useVirtualScroll(options: {
  itemCount: number;
  getItemHeight?: (index: number) => number;
  estimatedItemHeight?: number;
  overscan?: number;
}) {
  const { 
    itemCount, 
    getItemHeight, 
    estimatedItemHeight = 50, 
    overscan = 5 
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  const getVisibleRange = useCallback(() => {
    const startIdx = Math.max(
      0,
      Math.floor(scrollTop / estimatedItemHeight) - overscan
    );
    
    let currentOffset = 0;
    let endIdx = startIdx;

    for (let i = 0; i < itemCount && currentOffset < scrollTop + containerHeight; i++) {
      if (i >= startIdx) endIdx = i;
      currentOffset += getItemHeight ? getItemHeight(i) : estimatedItemHeight;
    }

    return {
      startIndex: startIdx,
      endIndex: Math.min(itemCount - 1, endIdx + overscan),
    };
  }, [scrollTop, containerHeight, itemCount, getItemHeight, estimatedItemHeight, overscan]);

  return {
    scrollTop,
    setScrollTop,
    containerHeight,
    setContainerHeight,
    ...getVisibleRange(),
  };
}

export default VirtualScrollList;
