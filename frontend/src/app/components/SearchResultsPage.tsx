import { Link, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, SlidersHorizontal, Building2, Loader2 } from "lucide-react";
import { companiesApi } from "../../api/companies";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getCompanyName } from "../../utils/i18n";
import type { CompanySearchResult } from "../../types";

export function SearchResultsPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      searchCompanies(initialQuery);
    }
  }, [initialQuery]);

  async function searchCompanies(searchQuery: string) {
    try {
      setLoading(true);
      const data = await companiesApi.search(searchQuery);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      searchCompanies(query.trim());
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      searchCompanies(query.trim());
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <LanguageSwitcher />
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('search.placeholder')}
              className="w-full pl-12 pr-4 py-2 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </form>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span>筛选</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl mb-2">{t('search.results')}</h2>
            <p className="text-[var(--muted-foreground)]">
              {loading ? t('common.loading') : `${t('search.results')} ${results.length}`}
            </p>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            {t('search.fuzzy_search_tip')}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)]">正在搜索...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((company) => {
              const score = company.agi_score || 0;
              const scoreColor = score >= 90 ? 'text-[var(--primary)] bg-[var(--primary)]/10' :
                                 score >= 70 ? 'text-yellow-600 bg-yellow-50' :
                                 'text-red-600 bg-red-50';
              const scoreBorderColor = score >= 90 ? 'border-[var(--primary)]' :
                                     score >= 70 ? 'border-yellow-600' :
                                     'border-red-600';

              return (
                <Link
                  key={company.id}
                  to={`/company/${company.id}`}
                  className="bg-white rounded-xl p-6 border border-[var(--border)] hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 flex items-center justify-center group-hover:from-[var(--primary)]/20 group-hover:to-[var(--primary)]/10 transition-all">
                      <Building2 className="w-8 h-8 text-[var(--primary)]" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-2">
                        <h3 className="text-2xl font-medium group-hover:text-[var(--primary)] transition-colors">
                          {getCompanyName(company, i18n.language)}
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-[var(--muted)] text-sm">
                          {company.verification_status}
                        </span>
                      </div>
                    </div>

                    <div className={`px-8 py-6 rounded-xl border-2 ${scoreBorderColor} ${scoreColor}`}>
                      <div style={{ fontFamily: 'var(--font-mono)' }} className="text-4xl font-bold text-center">
                        {score || '--'}
                      </div>
                      <div className="text-xs text-center mt-1 opacity-75">反内卷指数</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : query && !loading ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--muted-foreground)]">未找到匹配的企业</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">请尝试其他关键词</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
