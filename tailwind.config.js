/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        duck: {
          yellow: "#E3B84A",
          yellowDark: "#B8902B",
          yellowLight: "#EBD798",
          orange: "#C56A26",
          orangeDark: "#9A4E1A",
          cream: "#EFE2C1",
          paper: "#E6D4A8",
          ink: "#2A1F14",
          red: "#B33A2C",
          teal: "#2F5D5A",
        },
      },
      fontFamily: {
        sans: [
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          '"Noto Sans JP"',
          "system-ui",
          "sans-serif",
        ],
        mincho: [
          '"Shippori Mincho"',
          '"Noto Serif JP"',
          '"Yu Mincho"',
          '"游明朝"',
          '"Hiragino Mincho ProN"',
          "serif",
        ],
        display: [
          '"Dela Gothic One"',
          '"RocknRoll One"',
          '"Reggae One"',
          '"Hiragino Sans"',
          "system-ui",
          "sans-serif",
        ],
        kanban: [
          '"RocknRoll One"',
          '"Dela Gothic One"',
          '"Hiragino Sans"',
          "sans-serif",
        ],
      },
      boxShadow: {
        duck: "0 10px 30px -8px rgba(197, 106, 38, 0.45)",
        retro: "6px 6px 0 0 #2A1F14",
        retroSm: "4px 4px 0 0 #2A1F14",
        retroLg: "10px 10px 0 0 #2A1F14",
        retroRed: "6px 6px 0 0 #B33A2C",
      },
      keyframes: {
        "duck-float": {
          "0%, 100%": { transform: "translateY(0) rotate(-3deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        "duck-bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "wing-flap": {
          "0%, 100%": { transform: "rotate(-8deg)" },
          "50%": { transform: "rotate(14deg)" },
        },
        "ripple": {
          "0%": { transform: "translate(-50%, 0) scale(0.6)", opacity: "0.7" },
          "100%": { transform: "translate(-50%, 0) scale(1.6)", opacity: "0" },
        },
        "sparkle": {
          "0%, 100%": { transform: "scale(0.9) rotate(-6deg)", opacity: "0.7" },
          "50%": { transform: "scale(1.15) rotate(6deg)", opacity: "1" },
        },
        "sun-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "duck-float": "duck-float 3.4s ease-in-out infinite",
        "duck-bob": "duck-bob 2s ease-in-out infinite",
        "wing-flap": "wing-flap 0.9s ease-in-out infinite",
        "ripple-slow": "ripple 2.6s ease-out infinite",
        "ripple-fast": "ripple 2.6s ease-out 1.3s infinite",
        "sparkle": "sparkle 1.6s ease-in-out infinite",
        "sun-spin": "sun-spin 18s linear infinite",
      },
    },
  },
  plugins: [],
};
