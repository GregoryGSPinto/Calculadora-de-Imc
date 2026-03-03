# IMC Pro AI ⚡

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Claude AI](https://img.shields.io/badge/Claude-AI-blueviolet?logo=anthropic)](https://anthropic.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com/)

Calculadora de IMC profissional com análise inteligente via Claude AI, design premium com tema claro/escuro e gauge chart interativo.

---

## Features

- **Calculadora de IMC** com 8 faixas OMS e classificação detalhada
- **Gauge Chart SVG** animado com agulha e gradiente de cores
- **Análise com IA** via Claude AI — recomendações personalizadas
- **Tema Dia/Noite** com transição suave e glassmorphism
- **Design Mobile-First** responsivo e otimizado para portfólio
- **SEO Otimizado** com Open Graph e Twitter Cards
- **Tipografia Premium** com Space Grotesk + JetBrains Mono

## Tech Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 14 | Framework React com App Router |
| React | 18 | Biblioteca UI |
| Tailwind CSS | 3.4 | Estilização utility-first |
| Claude AI | API | Análise inteligente de saúde |
| Vercel | — | Deploy e hosting |

## Quick Start

```bash
# Clone o repositório
git clone https://github.com/GregoryGSPinto/Calculadora-de-Imc.git

# Instale as dependências
npm install

# Configure a variável de ambiente
cp .env.example .env.local
# Edite .env.local e adicione sua ANTHROPIC_API_KEY

# Rode em modo desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da API Anthropic para análise com IA |

## Deploy na Vercel

1. Faça push do projeto para o GitHub
2. Importe o repositório na [Vercel](https://vercel.com/new)
3. Adicione a variável `ANTHROPIC_API_KEY` nas configurações do projeto
4. Deploy automático!

## Licença

MIT © Gregory Pinto
