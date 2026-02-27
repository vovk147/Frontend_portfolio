import '../styles/globals.scss';
import { LanguageProvider } from '@/context/LanguageContext';

// 👇 Додаємо типізацію { children: React.ReactNode }
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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