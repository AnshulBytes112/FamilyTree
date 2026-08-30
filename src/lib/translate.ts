import { createAdminClient } from '@/lib/supabase';

// In-memory cache for ultra-fast repeated lookups during the same request lifecycle
const memoryCache = new Map<string, string>();

/**
 * Translates text using Google Translate's free API and caches it in Supabase.
 * Uses an in-memory cache as a first layer of defense.
 * 
 * @param text The text to translate.
 * @param targetLang The target language code (e.g. 'hi' for Hindi). Defaults to 'hi'.
 * @returns The translated text, or the original text if translation fails.
 */
export async function translateText(text: string | null | undefined, targetLang: string = 'hi'): Promise<string> {
  if (!text || !text.trim()) return text || '';
  if (targetLang === 'en') return text; // No translation needed if target is English

  const cacheKey = `${targetLang}:${text}`;
  
  // 1. Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  const supabase = createAdminClient();

  // 2. Check Database cache
  try {
    const { data: cached } = await supabase
      .from('translations')
      .select('translated_text')
      .eq('source_text', text)
      .eq('target_language', targetLang)
      .single();

    if (cached && cached.translated_text) {
      memoryCache.set(cacheKey, cached.translated_text);
      return cached.translated_text;
    }
  } catch (error) {
    // Silent fail for DB cache miss
  }

  // 3. Call Google Translate Free API
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();
    
    // The response is a nested array. The first element contains segments of translation.
    // data[0] is an array of [translated_segment, original_segment, ...]
    let translated = '';
    if (data && data[0] && Array.isArray(data[0])) {
      for (const segment of data[0]) {
        if (segment[0]) translated += segment[0];
      }
    }

    if (translated) {
      // 4. Save to Database Cache (async, don't await so we don't block)
      supabase.from('translations').insert({
        source_text: text,
        target_language: targetLang,
        translated_text: translated
      }).then(() => {}).catch(err => console.error("Failed to cache translation", err));

      // Save to memory cache
      memoryCache.set(cacheKey, translated);
      
      return translated;
    }
  } catch (error) {
    console.error('Translation error:', error);
  }

  // Fallback to original text
  return text;
}

/**
 * Utility to translate an array of objects based on specific keys.
 */
export async function translateArray<T>(
  items: T[], 
  keysToTranslate: (keyof T)[], 
  targetLang: string
): Promise<T[]> {
  if (targetLang === 'en' || !items || items.length === 0) return items;

  // We map over items, but wait for all translations to resolve concurrently
  const translatedItems = await Promise.all(items.map(async (item) => {
    const newItem = { ...item };
    for (const key of keysToTranslate) {
      const val = item[key];
      if (typeof val === 'string' && val.trim() !== '') {
        (newItem as any)[key] = await translateText(val, targetLang);
      }
    }
    return newItem;
  }));

  return translatedItems;
}
