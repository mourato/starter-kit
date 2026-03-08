import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        tanstackRouter(),
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler", { target: "19" }]],
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        tsconfigPaths: true,
    },
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            "/trpc": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
});
