import { useCallback, useMemo, useState } from 'react';

// Memoize expensive calculations
export const useMemoizedValue = <T>(factory: () => T, deps: any[]): T => {
  return useMemo(factory, deps);
};

// Debounce hook for search inputs
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return useCallback((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
};

// Optimized search filter
export const useOptimizedSearch = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerSearchTerm);
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(lowerSearchTerm)
          );
        }
        return false;
      })
    );
  }, [items, searchTerm, searchFields]);
};

// Pagination hook
export const usePagination = <T>(
  items: T[],
  itemsPerPage: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  return {
    currentPage,
    setCurrentPage,
    paginatedItems,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    nextPage: () => setCurrentPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage(p => Math.max(p - 1, 1))
  };
};