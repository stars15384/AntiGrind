import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { CompanyResponse } from '../../types';

interface VirtualizedCompanyListProps {
  companies: CompanyResponse[];
  renderItem: (company: CompanyResponse) => React.ReactNode;
  estimateSize?: () => number;
  overscan?: number;
}

export function VirtualizedCompanyList({
  companies,
  renderItem,
  estimateSize = () => 120,
  overscan = 5,
}: VirtualizedCompanyListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: companies.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{
        height: '600px',
        width: '100%',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualRow) => {
          const company = companies[virtualRow.index];
          return (
            <div
              key={company.id || virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(company)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  estimateSize?: () => number;
}

export function InfiniteScrollList<T extends { id: string | number }>({
  items,
  renderItem,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  estimateSize = () => 120,
}: InfiniteScrollListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: hasMore ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{
        height: '600px',
        width: '100%',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const isLoaderRow = virtualRow.index >= items.length;

          if (isLoaderRow) {
            return (
              <div
                key="loader-sentinel"
                ref={sentinelRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                  <span className="ml-3 text-[var(--muted-foreground)]">Loading more...</span>
                </div>
              </div>
            );
          }

          const item = items[virtualRow.index];
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
