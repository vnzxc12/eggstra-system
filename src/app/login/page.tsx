import { LoginPage } from '@/components/auth/LoginPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Eggstra OS',
  description: 'Sign in to access your poultry layer operational dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginRoute() {
  return <LoginPage />;
}
