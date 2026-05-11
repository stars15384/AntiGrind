import { Link } from "react-router";
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, TrendingUp, Calendar, Clock } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const weekData = [
  { day: 'Mon', hours: 8.5, mood: 'good' },
  { day: 'Tue', hours: 9.0, mood: 'good' },
  { day: 'Wed', hours: 8.0, mood: 'great' },
  { day: 'Thu', hours: 9.5, mood: 'neutral' },
  { day: 'Fri', hours: 7.5, mood: 'great' },
];

export function EmployeeCheckInPage() {
  const { t } = useTranslation();
  const totalHours = weekData.reduce((sum, day) => sum + day.hours, 0);
  const avgHours = (totalHours / weekData.length).toFixed(1);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <LanguageSwitcher />
          <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl">{t('checkin.title')}</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-[var(--border)] mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[#156B5F] rounded-full flex items-center justify-center">
              <span className="text-white font-medium">Z</span>
            </div>
            <div className="text-left">
              <p className="font-medium">Zhang Xiaoming</p>
              <p className="text-xs text-[var(--muted-foreground)]">Product Designer</p>
            </div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-4xl mb-3">{t('checkin.greeting')}</h2>
          <p className="text-[var(--muted-foreground)]">{t('checkin.greeting_sub')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">{t('checkin.weekly_hours')}</p>
                <p style={{ fontFamily: 'var(--font-mono)' }} className="text-2xl font-bold text-[var(--primary)]">{totalHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">{t('checkin.daily_avg')}</p>
                <p style={{ fontFamily: 'var(--font-mono)' }} className="text-2xl font-bold text-blue-600">{avgHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">{t('checkin.mood_score')}</p>
                <p style={{ fontFamily: 'var(--font-mono)' }} className="text-2xl font-bold text-green-600">8.5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[var(--border)]">
          <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl font-medium mb-6">This Week's Work Log</h3>
          <div className="space-y-4">
            {weekData.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--muted)]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    day.mood === 'great' ? 'bg-green-100' :
                    day.mood === 'good' ? 'bg-blue-100' :
                    'bg-yellow-100'
                  }`}>
                    <Calendar className={`w-5 h-5 ${
                      day.mood === 'great' ? 'text-green-600' :
                      day.mood === 'good' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{day.day}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{day.mood}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p style={{ fontFamily: 'var(--font-mono)' }} className="text-lg font-semibold">{day.hours}h</p>
                  {day.hours <= 8 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {t('checkin.healthy_range')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Upload Today's Screenshot
          </button>
        </div>
      </div>
    </div>
  );
}
