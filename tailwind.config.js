/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#3b82f6', // 연한 푸른색 유지
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  // 사용하지 않는 기능 비활성화
  corePlugins: {
    float: false,
    clear: false,
    backdropFilter: false,
  }
}; 