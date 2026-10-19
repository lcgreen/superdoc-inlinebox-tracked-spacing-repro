import { it, expect } from "vitest";
import { page } from "vitest/browser";
import url from "./synthetic.docx?url";
import "superdoc/style.layered.css";
for (const version of ["2.24.0"]) {
	it(`${version}: an insertion gap must follow the insertion despite earlier deleted text`, async () => {
		const host = document.createElement("div");
		host.style.cssText = "width:900px;height:500px";
		document.body.append(host);
		const { SuperDoc } = await import("superdoc");
		let context: any;
		const file = new File([await (await fetch(url)).blob()], "synthetic.docx", {
			type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		});
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
				extensions: [
					{
						id: "test.spacing",
						activate(ctx) {
							context = ctx;
						},
					},
				],
				onReady: () => {
					clearTimeout(t);
					resolve(i);
				},
			});
		});
		await expect
			.poll(() => host.querySelectorAll(".superdoc-text-run").length, {
				timeout: 30000,
			})
			.toBeGreaterThan(0);
		const change = await context.doc.trackChanges.get({ id: "imported:102" });
		console.log("NATIVE_GAP_TARGET", version, JSON.stringify(change.target));
		const seg = change.target.segments.at(-1);
		const visual = context.visuals.inlineBox("citation", {
			layout: { gapAfter: 24 },
			data: { citationGap: "added" },
		});
		visual.replace([
			{
				kind: "text",
				segments: [
					{
						blockId: seg.blockId,
						range: { start: seg.range.end - 1, end: seg.range.end },
					},
				],
			},
		]);
		await expect
			.poll(() => host.querySelector("[data-superdoc-ext-citation-gap]"), {
				timeout: 15000,
			})
			.not.toBeNull();
		const target = host.querySelector("[data-superdoc-ext-citation-gap]")!;
		const actual = target.textContent;
		console.log(
			"NATIVE_GAP_PAINT",
			version,
			JSON.stringify(actual),
			target.outerHTML,
		);
		await page.elementLocator(host).screenshot({ path: `./synthetic-gap.png` });
		visual.dispose();
		instance.destroy();
		host.remove();
		expect(actual, "the reserved width must follow the final d of added").toBe(
			"d",
		);
	}, 90000);
}
