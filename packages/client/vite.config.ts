import { defineConfig } from "vite"

import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		allowedHosts: ["awareness-ivory-mats-equations.trycloudflare.com", "idaho-allocated-sound-charts.trycloudflare.com"],
		proxy: {
			/**
			 * https://discord.com/developers/docs/change-log#activities-proxy-csp-update
			 */
			"/.proxy/colyseus": {
				target: "http://localhost:2567",
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace(/^\/\.proxy\/colyseus/, "")
			},
			"/colyseus": {
				target: "http://localhost:2567",
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace(/^\/colyseus/, "")
			}
		}
	}
})
