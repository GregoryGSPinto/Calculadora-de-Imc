import './globals.css'

export const metadata = {
  title: 'IMC Pro AI | Calculadora Inteligente de Massa Corporal',
  description: 'Calculadora de IMC profissional com análise inteligente via Claude AI. Descubra seu índice de massa corporal, classificação OMS e receba recomendações personalizadas.',
  keywords: ['IMC', 'calculadora', 'massa corporal', 'saúde', 'inteligência artificial', 'Claude AI', 'Next.js'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'IMC Pro AI | Calculadora Inteligente de Massa Corporal',
    description: 'Calculadora de IMC com análise inteligente via Claude AI.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IMC Pro AI',
    description: 'Calculadora de IMC com IA integrada.',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IMC Pro AI',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
