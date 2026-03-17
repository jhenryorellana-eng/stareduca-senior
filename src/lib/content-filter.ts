/**
 * Basic content moderation filter.
 * Checks for prohibited words in Spanish and English.
 */

const PROHIBITED_PATTERNS: RegExp[] = [
  // Spanish profanity
  /\b(put[ao]|mierda|cabr[oó]n|pend?ej[oa]|chinga|verga|cul[oe]ro|malparido|hijueput[ao]|gonorrea|maric[oó]n|zorra|perr[ao])\b/gi,
  // English profanity
  /\b(fuck|shit|bitch|asshole|dick|cunt|bastard|whore|slut|nigge?r)\b/gi,
  // Hate speech indicators
  /\b(te\s+voy\s+a\s+matar|voy\s+a\s+matarte|ojalá?\s+te\s+mueras|suicid(ate|io))\b/gi,
  // Spam patterns
  /(https?:\/\/\S+){3,}/gi, // 3+ URLs in one post
];

export interface ContentFilterResult {
  isClean: boolean;
  reason?: string;
}

export function filterContent(text: string): ContentFilterResult {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const pattern of PROHIBITED_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text) || pattern.test(normalized)) {
      return {
        isClean: false,
        reason: 'Tu publicación contiene contenido que no cumple con las normas de la comunidad.',
      };
    }
  }

  return { isClean: true };
}
