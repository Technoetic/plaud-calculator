/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#0b1220", accent: "#ff6a3d" }, // PLAUD 오렌지 계열 액센트
  } },
  plugins: [],
};
