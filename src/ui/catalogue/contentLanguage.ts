import type { ContentLanguage } from '../../domain/catalogue/exercise';
import { isLanguage } from '../i18n/i18n';

/** The Catalogue content language matching the interface language. */
export function contentLanguage(interfaceLanguage: string): ContentLanguage {
  return isLanguage(interfaceLanguage) ? interfaceLanguage : 'en';
}

/** Where the Catalogue's images are served from (copied from public/ at build time). */
export const imageUrl = (fileName: string) => `/catalogue/images/${fileName}`;
