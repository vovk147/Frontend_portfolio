import '../styles/globals.scss';
import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html lang="uk" data-theme="dark">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
