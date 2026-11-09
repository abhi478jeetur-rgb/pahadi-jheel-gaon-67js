/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { planLightmaps as e } from "./light-bake.js";
import "./agent-scene-capabilities-BGAS_VVR.js";
import { i as t, r as n } from "./agent-bake-DekR6ZC4.js";
import { s as r } from "./path-tracer-gpu-6qSt8fAB.js";
import { traceLightmapsAsync as i } from "./light-bake-gpu.js";
// src/agent-bake-gpu.js
function a(e) {
	return [
		...e.pointLights ?? [],
		...e.spotLights ?? [],
		...e.areaLights ?? []
	];
}
function o(e) {
	return a(e).every((e) => e.affects === void 0 || e.affects === null);
}
async function s(r, a, o, s) {
	let c = s ? "native" : "gpu", l = e(r, a, {
		...o,
		maxSeconds: 90,
		backend: c
	}), { used: u, reduced: d, reduction: f } = t(l, o), { parts: p, report: m } = await i(l, {
		...u,
		backend: c,
		...s ? { texelTracer: s } : {}
	});
	return {
		changed: n(p, r),
		report: m,
		used: u,
		reduced: d,
		reduction: f
	};
}
async function c(e, t, n, i) {
	try {
		return await s(e, t, n, i);
	} catch (i) {
		if (!r()) throw i;
		let a = await s(e, t, n);
		return {
			...a,
			report: {
				...a.report,
				backendNote: `The native bake could not run (${i.message}); the gpu backend ran instead.`
			}
		};
	}
}
function l({ texelTracer: e } = {}) {
	if (e || r()) return { lightBake: {
		accepts: ([, e]) => o(e),
		compute: ([t, n, r]) => e ? c(t, n, r, e) : s(t, n, r)
	} };
}
export { l as gpuBakeKernels };
