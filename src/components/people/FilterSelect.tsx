'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';

export function FilterSelect({ familyId, currentQuery, currentFilter }: { familyId: string, currentQuery: string, currentFilter: string }) {
  const t = useTranslations('people');
  const router = useRouter();

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    router.push(`/family/${familyId}/people?q=${currentQuery}&filter=${val}`);
  };

  return (
    <div className="relative flex items-center">
      <Filter size={16} className="absolute left-3 text-slate-500 pointer-events-none" />
      <select 
        value={currentFilter}
        onChange={handleFilterChange}
        className="h-11 pl-10 pr-8 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-[15px] font-medium text-slate-700 appearance-none cursor-pointer hover:bg-slate-50"
      >
        <option value="all">{t('all', { defaultMessage: 'All' })}</option>
        <option value="male">{t('male', { defaultMessage: 'Male' })}</option>
        <option value="female">{t('female', { defaultMessage: 'Female' })}</option>
        <option value="unknown">{t('unknown', { defaultMessage: 'Other / Unknown' })}</option>
      </select>
      <div className="absolute right-3 pointer-events-none">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
  );
}
