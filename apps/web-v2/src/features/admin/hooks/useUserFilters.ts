/**
 * Custom hook for managing user filters state
 */
import { useState } from 'react';

export type FilterType = 'all' | 'banned' | 'active' | 'has-flagged';

export function useUserFilters() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [mbti, setMbti] = useState('');
  const [page, setPage] = useState(1);

  const resetFilters = () => {
    setSearch('');
    setFilter('all');
    setMbti('');
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    setPage(1);
  };

  const handleMbtiChange = (value: string) => {
    setMbti(value);
    setPage(1);
  };

  return {
    search,
    filter,
    mbti,
    page,
    setPage,
    setSearch: handleSearchChange,
    setFilter: handleFilterChange,
    setMbti: handleMbtiChange,
    resetFilters,
  };
}
