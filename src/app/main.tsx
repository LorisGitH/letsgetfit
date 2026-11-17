import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { App } from '../ui/App';
import { createI18n, detectLanguage } from '../ui/i18n/i18n';
import '../ui/styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Missing #root element in index.html');
}

const i18n = createI18n(detectLanguage(navigator.languages));
const syncDocumentLanguage = (language: string) => {
  document.documentElement.lang = language;
};
syncDocumentLanguage(i18n.language);
i18n.on('languageChanged', syncDocumentLanguage);

createRoot(rootElement).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>,
);
