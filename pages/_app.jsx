// pages/_app.jsx
import '../styles/globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { I18nProvider } from '../hooks/useI18n';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <Component {...pageProps} />
      </I18nProvider>
    </AuthProvider>
  );
}
