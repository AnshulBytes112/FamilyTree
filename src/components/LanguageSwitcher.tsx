'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    // Refresh to apply new language
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2 py-1 rounded transition-colors ${
          locale === 'en' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-slate-300">|</span>
      <button
        onClick={() => handleLanguageChange('hi')}
        className={`px-2 py-1 rounded transition-colors ${
          locale === 'hi' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'
        }`}
        aria-label="हिन्दी में स्विच करें"
      >
        हिन्दी
      </button>
    </div>
  );
}
