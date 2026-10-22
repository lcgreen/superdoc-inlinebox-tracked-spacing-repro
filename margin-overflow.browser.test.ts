import { it, expect } from "vitest";
import { page } from "vitest/browser";
import url from "./margin-overflow.docx?url";
import "superdoc/style.layered.css";

it("2.24.0: an application-added citation must not push text past its margin", async () => {
	const host = document.createElement("div");
	host.style.cssText = "width:900px;height:500px";
	document.body.append(host);
	const { SuperDoc } = await import("superdoc");
	const file = new File(
		[await (await fetch(url)).blob()],
		"margin-overflow.docx",
		{
			type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		},
	);
	const instance = await new Promise<any>((resolve, reject) => {
		const t = setTimeout(() => reject(new Error("not ready")), 60000);
		const i = new SuperDoc({
			selector: host,
			document: file,
			documentMode: "suggesting",
			role: "editor",
			telemetry: { enabled: false },
			modules: {
				comments: false,
				trackChanges: { visible: true, mode: "review" },
			},
			onReady: () => {
				clearTimeout(t);
				resolve(i);
			},
		});
	});
	await expect
		.poll(() => host.querySelector('[data-track-change-id="imported:102"]'), {
			timeout: 30000,
		})
		.not.toBeNull();
	await document.fonts.ready;
	const mark = host.querySelector('[data-track-change-id="imported:102"]')!;
	const line = mark.closest<HTMLElement>(".superdoc-line")!;
	const textRight = () =>
		Math.max(
			...Array.from(line.children)
				.filter((x) => !x.hasAttribute("data-demo-citation"))
				.map((x) => x.getBoundingClientRect().right),
		);
	const marginRight = line.getBoundingClientRect().right;
	const before = textRight() - marginRight;
	expect(
		before,
		"bare SuperDoc text should fit inside its margin",
	).toBeLessThanOrEqual(0.5);
	// Paint-only boundary: this does not participate in layout.
	line.style.outline = "1px dashed #a3a3a3";
	await page.elementLocator(host).screenshot({ path: "./margin-before.png" });
	// Minimal model of the application's current integration: a citation is
	// inserted after SuperDoc has measured and painted the document line.
	// No Orbital code or styling is included here.
	const pill = document.createElement("span");
	pill.setAttribute("data-demo-citation", "");
	pill.setAttribute("contenteditable", "false");
	pill.textContent = "[1]";
	pill.style.cssText =
		"display:inline-block;box-sizing:border-box;width:24px;font:10px Arial;line-height:14px;color:#854000;background:#fff0d8;border:1px solid #d28d36;border-radius:3px;text-align:center;vertical-align:baseline";
	mark.after(pill);
	const overflow = textRight() - marginRight;
	console.log(
		"MARGIN_OVERFLOW",
		JSON.stringify({
			version: "2.24.0",
			beforePx: before,
			afterPx: overflow,
			citationWidthPx: pill.getBoundingClientRect().width,
		}),
	);
	await page.elementLocator(host).screenshot({ path: "./margin-after.png" });
	instance.destroy();
	host.remove();
	// This deliberately fails for the current post-layout insertion approach.
	// It is not evidence that unmodified SuperDoc text overflows.
	expect(
		overflow,
		"citation and following text should wrap within the text margin",
	).toBeLessThanOrEqual(0.5);
}, 90000);
