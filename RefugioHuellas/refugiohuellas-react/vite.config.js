import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        react(),
        {
            name: "base-trailing-slash",
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    // Redirect /app → /app/ so Keycloak post-login/logout callbacks work
                    if (req.url === "/app" || req.url?.startsWith("/app?")) {
                        const qs = req.url.slice(4); // everything after "/app"
                        res.writeHead(302, { Location: "/app/" + qs });
                        res.end();
                        return;
                    }
                    next();
                });
            },
        },
    ],
    base: "/app/",
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
});

