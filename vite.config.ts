import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(() => {
  return {
    plugins: [react()],
    /* define: {
      __APP_ENV__: process.env.VITE_VERCEL_ENV,
    }, */
  };
});
