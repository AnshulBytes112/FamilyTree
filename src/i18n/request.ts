import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Read locale from a cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  // Default to English if no cookie is set or if it's an unsupported locale
  const locale = (localeCookie === 'hi' || localeCookie === 'en') ? localeCookie : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
