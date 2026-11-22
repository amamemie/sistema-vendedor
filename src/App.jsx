import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/toast';
import { useTranslation } from 'react-i18next';
import AppRouter from './router/index';

function SkipLink() {
  const { t } = useTranslation();
  return <a className="skip-link" href="#main">{t('a11y.skip')}</a>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SkipLink />
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
