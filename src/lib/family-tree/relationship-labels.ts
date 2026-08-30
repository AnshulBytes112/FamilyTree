import { RelationshipKind } from './relationship-engine';

export function getRelationshipLabel(kind: RelationshipKind, language: 'en' | 'hi' = 'en'): string {
  const labels: Record<RelationshipKind, { en: string; hi: string }> = {
    'FATHER': { en: 'Father', hi: 'पिता' },
    'MOTHER': { en: 'Mother', hi: 'माता' },
    'PARENT': { en: 'Parent', hi: 'माता-पिता' },
    
    'SON': { en: 'Son', hi: 'बेटा' },
    'DAUGHTER': { en: 'Daughter', hi: 'बेटी' },
    'CHILD': { en: 'Child', hi: 'बच्चा' },
    
    'BROTHER': { en: 'Brother', hi: 'भाई' },
    'SISTER': { en: 'Sister', hi: 'बहन' },
    'SIBLING': { en: 'Sibling', hi: 'भाई/बहन' },
    
    'HUSBAND': { en: 'Husband', hi: 'पति' },
    'WIFE': { en: 'Wife', hi: 'पत्नी' },
    'SPOUSE': { en: 'Spouse', hi: 'जीवनसाथी' },
    
    'GRANDFATHER': { en: 'Grandfather', hi: 'दादा/नाना' },
    'GRANDMOTHER': { en: 'Grandmother', hi: 'दादी/नानी' },
    'GRANDPARENT': { en: 'Grandparent', hi: 'दादा/दादी' },
    
    'GRANDSON': { en: 'Grandson', hi: 'पोता/नाती' },
    'GRANDDAUGHTER': { en: 'Granddaughter', hi: 'पोती/नातिन' },
    'GRANDCHILD': { en: 'Grandchild', hi: 'पोता/पोती' },
    
    'UNCLE': { en: 'Uncle', hi: 'चाचा/मामा/फूफा/मौसा' },
    'AUNT': { en: 'Aunt', hi: 'चाची/मामी/बुआ/मौसी' },
    
    'NEPHEW': { en: 'Nephew', hi: 'भतीजा/भांजा' },
    'NIECE': { en: 'Niece', hi: 'भतीजी/भांजी' },
    
    'FIRST_COUSIN': { en: 'First Cousin', hi: 'चचेरा/ममेरा भाई/बहन' },
    'SECOND_COUSIN': { en: 'Second Cousin', hi: 'दूसरा चचेरा/ममेरा भाई/बहन' },
    'THIRD_COUSIN': { en: 'Third Cousin', hi: 'तीसरा चचेरा/ममेरा भाई/बहन' },
    
    'FIRST_COUSIN_ONCE_REMOVED': { en: 'First Cousin Once Removed', hi: 'चचेरा/ममेरा भाई/बहन (एक पीढ़ी दूर)' },
    'FIRST_COUSIN_TWICE_REMOVED': { en: 'First Cousin Twice Removed', hi: 'चचेरा/ममेरा भाई/बहन (दो पीढ़ी दूर)' },
    
    'RELATIVE_BY_MARRIAGE': { en: 'Relative by marriage', hi: 'वैवाहिक संबंधी' },
    'EXTENDED_FAMILY': { en: 'Extended Family', hi: 'विस्तृत परिवार' },
    
    'NO_KNOWN_RELATIONSHIP': { en: 'No known relationship', hi: 'कोई ज्ञात संबंध नहीं' },
    'SAME_PERSON': { en: 'Same Person', hi: 'वही व्यक्ति' }
  };

  return labels[kind]?.[language] || labels['EXTENDED_FAMILY'][language];
}
