import { Link, useSearchParams } from "react-router";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, CheckCircle2, AlertCircle, Loader2, Barcode } from "lucide-react";
import { scanApi } from "../../api/scan";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getCompanyName } from "../../utils/i18n";
import type { ScanResult } from "../../types";

export function ScanVerifyPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const barcodeFromUrl = searchParams.get('barcode') || '';

  const [barcode, setBarcode] = useState(barcodeFromUrl);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    if (!barcode.trim()) {
      setError(t('scan.enter_barcode'));
      return;
    }

    try {
      setScanning(true);
      setError(null);
      const scanResult = await scanApi.getByBarcode(barcode.trim());
      setResult(scanResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('scan.scan_failed'));
      setResult(null);
    } finally {
      setScanning(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleScan();
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <LanguageSwitcher />
          <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl">{t('scan.title')}</h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl mb-3">{t('scan.verify_product')}</h2>
          <p className="text-[var(--muted-foreground)]">{t('scan.subtitle')}</p>
        </div>

        {!result && !scanning && (
          <div className="bg-white rounded-2xl p-8 border border-[var(--border)] mb-8">
            <div className="relative aspect-square max-w-md mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10 rounded-2xl"></div>
              <div className="absolute inset-4 border-4 border-[var(--primary)] rounded-2xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--primary)]"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--primary)]"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--primary)]"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--primary)]"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Barcode className="w-16 h-16 text-[var(--primary)] opacity-30" />
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-[var(--primary)]/50 animate-pulse"></div>
            </div>
          </div>
        )}

        {scanning && (
          <div className="bg-white rounded-2xl p-12 border border-[var(--border)] text-center">
            <Loader2 className="w-16 h-16 animate-spin text-[var(--primary)] mx-auto mb-4" />
            <p className="text-lg text-[var(--muted-foreground)]">{t('scan.scanning')}</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl p-8 border border-[var(--border)] mb-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2 text-red-600">{t('scan.query_failed')}</h3>
              <p className="text-[var(--muted-foreground)]">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl p-8 border border-[var(--border)] mb-8">
            <div className="text-center mb-8">
              <CheckCircle2 className="w-20 h-20 text-[var(--primary)] mx-auto mb-4" />
              <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2 text-[var(--primary)]">{t('scan.query_success')}</h3>
              <p className="text-[var(--muted-foreground)]">{result.recommendation}</p>
            </div>

            {result.product && (
              <div className="space-y-4 border-t border-[var(--border)] pt-6 mb-6">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Product Name</span>
                  <span className="font-medium">{result.product.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Barcode</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }} className="font-medium">{result.product.barcode}</span>
                </div>
              </div>
            )}

            <div className="space-y-4 border-t border-[var(--border)] pt-6">
              {(result.brand_owner || result.manufacturer) && (
                <>
                  {result.brand_owner && (
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Brand Owner</span>
                      <Link
                        to={`/company/${result.brand_owner.id}`}
                        className="font-medium text-[var(--primary)] hover:underline"
                      >
                        {getCompanyName(result.brand_owner, i18n.language)}
                      </Link>
                    </div>
                  )}
                  {result.manufacturer && (
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Manufacturer</span>
                      <Link
                        to={`/company/${result.manufacturer.id}`}
                        className="font-medium text-[var(--primary)] hover:underline"
                      >
                        {getCompanyName(result.manufacturer, i18n.language)}
                      </Link>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--muted-foreground)]">OEM</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${result.is_oem ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {result.is_oem ? 'Yes' : 'No'}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">{t('home.anti_grind_index')}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }} className={`text-2xl font-bold ${
                  (result.agi_score || 0) >= 90 ? 'text-[var(--primary)]' :
                  (result.agi_score || 0) >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {result.agi_score || '--'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <p className="text-center text-sm text-[var(--muted-foreground)] mb-4">{t('scan.enter_barcode')}</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('scan.enter_barcode')}
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {scanning ? t('scan.scanning') : t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
