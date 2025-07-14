import { Nunito } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/shared/components/shared/ThemeProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { AuroraBackground } from '@/shared/components/ui/aurora-background';

const nunito = Nunito({
  subsets: ['cyrillic'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={nunito.className} suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <AuroraBackground />
            {children}
          </ThemeProvider>

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
