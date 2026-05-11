import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Filter,
  TrendingUp,
  Award,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { RankingCard } from './RankingCard';
import { rankingsApi, type RankingsResponse } from '@/api/rankings';

export function RankingsPage() {
  const { t } = useTranslation();
  const [rankingsData, setRankingsData] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [sortBy, setSortBy] = useState('agi_score');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const limit = 20;

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rankingsApi.getRankings({
        industry: selectedIndustry || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: limit,
        offset: page * limit,
      });
      setRankingsData(data);
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedIndustry, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry === selectedIndustry ? '' : industry);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <LanguageSwitcher />
          <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('rankings.title', 'Anti-Grind Rankings')}
          </h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {rankingsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Green Zone</span>
              </div>
              <p className="text-3xl font-bold text-green-800">{rankingsData.statistics.green_companies}</p>
              <p className="text-xs text-green-600 mt-1">Companies (AGI ≤30)</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Yellow Zone</span>
              </div>
              <p className="text-3xl font-bold text-yellow-800">{rankingsData.statistics.yellow_companies}</p>
              <p className="text-xs text-yellow-600 mt-1">Companies (AGI 31-60)</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">Red Zone</span>
              </div>
              <p className="text-3xl font-bold text-red-800">{rankingsData.statistics.red_companies}</p>
              <p className="text-xs text-red-600 mt-1">Companies (AGI &gt; 60)</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Average Score</span>
              </div>
              <p className="text-3xl font-bold text-blue-800">{rankingsData.statistics.avg_agi_score}</p>
              <p className="text-xs text-blue-600 mt-1">Total: {rankingsData.statistics.total_certified} certified</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Sorting
            </h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Industries</option>
                {rankingsData?.filters.industries.map((ind) => (
                  <option key={ind.name} value={ind.name}>
                    {ind.name} ({ind.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(0);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="agi_score">AGI Score</option>
                <option value="name">Company Name</option>
                <option value="created_at">Certification Date</option>
              </select>
            </div>

            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  setPage(0);
                }}
                className="flex items-center gap-2"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </Button>
            </div>

            {selectedIndustry && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedIndustry('');
                    setPage(0);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕ Clear Filter
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />
              ))}
            </div>
          ) : rankingsData && rankingsData.rankings.length > 0 ? (
            <>
              {rankingsData.rankings.map((company) => (
                <RankingCard key={company.company_id} company={company} />
              ))}

              {rankingsData.pagination.has_more && (
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    Load More
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Companies Found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or check back later for newly certified companies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RankingsPage;
