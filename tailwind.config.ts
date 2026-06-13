import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lantern: "#d51f1f",
        ink: "#110d0b",
        wood: "#7a3f1e",
        soy: "#24130d",
        magnet: "#1274d8",
        neon: "#ffef7a"
      },
      boxShadow: {
        neon: "0 0 10px rgba(255,239,122,.85), 0 0 26px rgba(213,31,31,.72)",
        board: "0 18px 40px rgba(0,0,0,.35)"
      }
    }
  },
  plugins: []
};

export default config;
