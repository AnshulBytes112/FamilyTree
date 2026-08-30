'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface PersonListRowProps {
  person: {
    id: string;
    name: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
    date_of_birth?: string | null;
  };
  familyId: string;
  relationship?: string;
}

export function PersonListRow({ person, familyId, relationship }: PersonListRowProps) {
  const t = useTranslations('people');
  
  // Calculate age
  let ageStr = null;
  if (person.date_of_birth) {
    const dob = new Date(person.date_of_birth);
    if (!isNaN(dob.getTime())) {
      // eslint-disable-next-line react-hooks/purity
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      ageStr = `${age} ${t('years', { defaultMessage: 'years' })}`;
    }
  }

  // Formatting gender/age subtitle
  const getGenderText = (g: string) => {
    switch (g) {
      case 'MALE': return t('genderMale', { defaultMessage: 'Male' });
      case 'FEMALE': return t('genderFemale', { defaultMessage: 'Female' });
      case 'OTHER': return t('genderOther', { defaultMessage: 'Other' });
      default: return null;
    }
  };

  const genderStr = getGenderText(person.gender);
  
  let subtitle = '';
  if (genderStr && ageStr) {
    subtitle = `${genderStr}, ${ageStr}`;
  } else if (genderStr) {
    subtitle = genderStr;
  } else if (ageStr) {
    subtitle = ageStr;
  }

  // Avatar placeholder
  const avatarLetter = person.name ? person.name.charAt(0).toUpperCase() : '?';

  return (
    <Link 
      href={`/family/${familyId}/people/${person.id}`} 
      className="flex items-center gap-4 py-4 px-6 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 text-lg">
        {avatarLetter}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-[family-name:var(--font-playfair)] font-bold text-slate-900 text-[17px] mb-0.5">{person.name}</p>
        {subtitle && (
          <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 text-right shrink-0">
        {relationship && (
          <span className="hidden sm:inline text-[15px] font-medium text-slate-700">{relationship}</span>
        )}
        <ChevronRight size={18} className="text-slate-400" />
      </div>
    </Link>
  );
}
