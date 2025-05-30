import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    background: 'src/background.ts',
    content: 'src/content.ts',
    popup: 'src/popup/popup.ts'
  },
  format: ['iife'],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'chrome88',
  bundle: true,
  splitting: false,
  outDir: 'dist',
  publicDir: 'public',
  outExtension: () => ({ js: '.js' })
});