/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
    'grid-cols-5', 'gap-2', 'gap-3', 'gap-4',
    'col-span-2', 'col-span-3', 'col-span-4',
    'flex-1', 'flex-shrink-0', 'min-w-0',
    'overflow-hidden', 'overflow-y-auto',
    'absolute', 'relative', 'inset-0',
    'border-l-4', 'border-l-indigo-500',
    'border-l-amber-500', 'border-l-pink-500',
    'border-l-blue-500', 'opacity-60',
    'min-h-96', 'h-28', 'h-9', 'h-6',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}