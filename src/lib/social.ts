import { supabase } from '@/lib/supabase';
import type { Lang } from '@/lib/i18n';

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/profile.php?id=61593081983447',
  youtube: 'https://www.youtube.com/@Foladkabuli',
  email: 'collegetec2025@gmail.com',
};

export async function fetchSocialSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('key, value')
    .eq('category', 'social')
    .eq('is_public', true);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const row of data) {
    map[row.key] = row.value;
  }
  return map;
}

export function socialLabel(lang: Lang, platform: 'facebook' | 'youtube' | 'whatsapp' | 'email'): string {
  const labels: Record<string, Record<string, string>> = {
    en: { facebook: 'Facebook', youtube: 'YouTube', whatsapp: 'WhatsApp', email: 'Email' },
    fa: { facebook: 'فیسبوک', youtube: 'یوتیوب', whatsapp: 'واتساپ', email: 'ایمیل' },
    ps: { facebook: 'فېسبوک', youtube: 'یوټیوب', whatsapp: 'واټساپ', email: 'برېښنالیک' },
  };
  return labels[lang]?.[platform] ?? labels.en[platform];
}
