import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { BrandLogo } from '@/components/ui/brand-logo';

export default async function HomePage() {
  const session = await getSession();
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dots relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-tertiary rounded-full border-2 border-foreground opacity-60"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-secondary rounded-full border-2 border-foreground opacity-40"></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-quaternary rotate-45 border-2 border-foreground opacity-50"></div>
      <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-accent rounded-lg border-2 border-foreground opacity-30 rotate-12"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>

        {/* Login Card */}
        <div className="bg-card border-2 border-foreground rounded-xl p-8 shadow-pop-accent relative">
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-tertiary rounded-full border-2 border-foreground"></div>
          
          <h1 className="text-2xl font-bold font-heading mb-2">Welcome back!</h1>
          <p className="text-muted-foreground font-medium mb-6">Enter your email to receive a magic link</p>
          
          <LoginForm />
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6 font-medium">
          Need help? Contact your administrator
        </p>
      </div>
    </div>
  );
}
