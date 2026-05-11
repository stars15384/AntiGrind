import { Link } from "react-router";
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, Users, FileText, Award, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const steps = [
  { id: 1, title: "Basic Info", icon: Building2 },
  { id: 2, title: "Employee Data", icon: Users },
  { id: 3, title: "Material Upload", icon: FileText },
  { id: 4, title: "Submit Review", icon: Award },
];

export function CertificationApplicationPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <LanguageSwitcher />
          <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl">{t('apply.title')}</h1>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-4xl mb-3">{t('apply.get_certified')}</h2>
          <p className="text-[var(--muted-foreground)]">{t('apply.showcase_culture')}</p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                    step.id < currentStep ? 'bg-[var(--primary)] text-white' :
                    step.id === currentStep ? 'bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20' :
                    'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <step.icon className="w-8 h-8" />
                    )}
                  </div>
                  <p className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[var(--border)]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl font-medium mb-6">Company Information</h3>

              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  {t('apply.company_full_name')}
                </label>
                <input
                  id="company-name"
                  type="text"
                  placeholder={t('apply.company_name_placeholder')}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="credit-code" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  {t('apply.credit_code')}
                </label>
                <input
                  id="credit-code"
                  type="text"
                  placeholder="91440300XXXXXXXXXX"
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity mt-6"
              >
                {t('common.next')} →
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl font-medium mb-6">Employee Data</h3>
              <p className="text-[var(--muted-foreground)] mb-4">Upload employee work hours data or connect to HR system</p>

              <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center hover:border-[var(--primary)] transition-colors cursor-pointer">
                <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                <p className="font-medium mb-2">Upload Employee Data</p>
                <p className="text-sm text-[var(--muted-foreground)]">CSV, Excel, or JSON format</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--muted)] transition-colors"
                >
                  ← {t('common.previous')}
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {t('common.next')} →
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl font-medium mb-6">Supporting Materials</h3>
              <p className="text-[var(--muted-foreground)] mb-4">Upload company policies and certifications</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--primary)] transition-colors cursor-pointer">
                  <Award className="w-10 h-10 mx-auto mb-3 text-[var(--muted-foreground)]" />
                  <p className="font-medium text-sm">Work Policy</p>
                </div>
                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--primary)] transition-colors cursor-pointer">
                  <Users className="w-10 h-10 mx-auto mb-3 text-[var(--muted-foreground)]" />
                  <p className="font-medium text-sm">Org Chart</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--muted)] transition-colors"
                >
                  ← {t('common.previous')}
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {t('common.next')} →
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl font-medium mb-6">Review & Submit</h3>
              
              <div className="bg-[var(--muted)]/30 rounded-xl p-6 space-y-3">
                <div className="flex justify-between">
                  <span>Company Name</span>
                  <span className="font-medium">Lüye Internet Tech</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Code</span>
                  <span className="font-medium">91440300XXXXXXXXXX</span>
                </div>
                <div className="flex justify-between">
                  <span>Employee Data</span>
                  <span className="font-medium text-green-600">✓ Uploaded</span>
                </div>
                <div className="flex justify-between">
                  <span>Materials</span>
                  <span className="font-medium text-green-600">✓ Ready</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--muted)] transition-colors"
                >
                  ← {t('common.previous')}
                </button>
                <button
                  className="flex-1 py-3 bg-gradient-to-r from-[var(--primary)] to-[#156B5F] text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  ✓ {t('apply.step_submit_review')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
