// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    // shadcn/ui uses OKLCH colour tokens injected by init
    extend: {},
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
