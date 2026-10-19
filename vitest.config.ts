import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
export default defineConfig({
	optimizeDeps: { exclude: ["superdoc"] },
	test: {
		include: ["*.browser.test.ts"],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [{ browser: "chromium" }],
			viewport: { width: 1100, height: 700 },
		},
	},
});
