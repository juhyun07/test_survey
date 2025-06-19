/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 커스텀 padding 값 추가
      spacing: {
        '16': '40px', // 원하시는 값으로 조정 가능
      }
    },
  },
  plugins: [],
}
