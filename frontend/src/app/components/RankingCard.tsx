import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router';
import type { RankingCompany } from '@/api/rankings';

interface RankingCardProps {
  company: RankingCompany;
  showRank?: boolean;
}

export function RankingCard({ company, showRank = true }: RankingCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800',
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <span className="text-lg">🥈</span>;
    if (rank === 3) return <span className="text-lg">🥉</span>;
    return <span className="text-lg font-bold text-gray-500">{rank}</span>;
  };

  const colors = getLevelColor(company.level);

  return (
    <Link
      to={`/company/${company.company_id}`}
      className={`block p-4 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {showRank && (
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              {getRankBadge(company.rank)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-lg ${colors.text} truncate`}>
              {company.name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
              <span>{company.industry}</span>
              <span>•</span>
              <span>{company.certification_level?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 ml-4">
          <div className="text-right">
            <div className={`text-2xl font-bold ${colors.text}`}>
              {company.agi_score}
            </div>
            <div className="text-xs text-gray-500 mt-1">AGI Score</div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
              {company.level.toUpperCase()}
            </span>
            {getTrendIcon(company.trend)}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RankingCard;
