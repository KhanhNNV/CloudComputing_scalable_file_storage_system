/** @type {import('tailwindcss').Config} */
export default {
  // Chỉ định Tailwind quét các file trong thư mục src để nhận diện class CSS
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}