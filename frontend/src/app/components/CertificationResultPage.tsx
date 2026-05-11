import { Link, useParams } from "react-router";
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Award, Share2, CheckCircle2, Clock } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DownloadReportButton } from "./DownloadReportButton";

export function CertificationResultPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isApproved = id !== 'pending';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <LanguageSwitcher />
          <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl">Certification Result</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {isApproved ? (
          <div>
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[#156B5F] rounded-full mb-6">
                <Award className="w-14 h-14 text-white" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-5xl mb-4 text-[var(--primary)]">{t('common.success')} - Certified!</h2>
              <p className="text-xl text-[var(--muted-foreground)]">Your company has passed Anti-Grind certification review</p>
            </div>

            <div className="bg-white rounded-2xl border-4 border-[var(--primary)] p-12 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-[var(--primary)]/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

              <div className="relative text-center">
                <div className="mb-8">
                  <div className="inline-block p-6 bg-gradient-to-br from-[var(--primary)] to-[#156B5F] rounded-2xl shadow-2xl transform -rotate-3">
                    <Award className="w-20 h-20 text-white" />
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-4xl mb-4">Anti-Grind Certificate</h3>

                <div className="max-w-md mx-auto mb-8">
                  <p className="text-lg mb-6">This certifies that</p>
                  <p style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl mb-6 text-[var(--primary)]">Lüye Internet Technology Co., Ltd.</p>
                  <p className="text-lg mb-8">Has passed the Anti-Grind workplace environment certification with the following rating:</p>

                  <div className="inline-block px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[#156B5F] rounded-xl text-white mb-8">
                    <p className="text-sm opacity-90 mb-1">{t('home.anti_grind_index')}</p>
                    <p style={{ fontFamily: 'var(--font-mono)' }} className="text-5xl font-bold">92</p>
                  </div>

                  <p className="text-base opacity-75 mb-4">Issued on: April 18, 2026</p>
                  <p className="text-base opacity-75">Certificate No.: AIC-2026-000002</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              {id && (
                <DownloadReportButton
                  certificationId={id}
                  companyName="Lüye Internet Technology Co., Ltd."
                  variant="default"
                  size="lg"
                />
              )}
              <button className="px-6 py-3 border border-[var(--border)] rounded-xl font-medium hover:bg-[var(--muted)] transition-colors inline-flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
              <Clock className="w-14 h-14 text-yellow-600" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-4xl mb-4">Application Under Review</h2>
            <p className="text-lg text-[var(--muted-foreground)] mb-8 max-w-md mx-auto">
              Your certification application has been submitted and is currently being reviewed. This process typically takes 7-14 business days.
            </p>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
