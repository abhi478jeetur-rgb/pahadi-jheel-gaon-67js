/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e } from "./path-tracer-scene-DTz5cgiX.js";
import { checkBudget as t, checkedBakeSize as n, finishLightmaps as r, planLightmaps as i, rasterizeEntries as a, traceLightmaps as o } from "./light-bake.js";
// src/light-bake-gpu.js
var s = 1, c = 1e6;
function l({ lights: e }) {
	if ([
		...e.pointLights,
		...e.spotLights,
		...e.areaLights,
		...e.sun ? [e.sun] : []
	].some((e) => e.affects !== null)) throw RangeError("A light bake on the GPU backend does not support light linking (`affects`). Use the CPU backend.");
	return {
		pointLights: e.pointLights,
		spotLights: e.spotLights.map((e) => ({
			...e,
			angle: Math.acos(e.cosineHalfAngle),
			penumbra: e.blend / (1 - e.cosineHalfAngle)
		})),
		areaLights: e.areaLights.map((e) => ({
			...e,
			direction: e.normal,
			up: e.along
		})),
		keyColor: e.sun?.color ?? [
			0,
			0,
			0
		],
		lightDirection: e.sun?.direction ?? [
			0,
			1,
			0
		]
	};
}
function u(e) {
	let t = 0;
	for (let { covered: n } of e) for (let e of n) t += e;
	let n = new Float32Array(t * 3), r = new Float32Array(t * 3), i = [], a = 0;
	for (let { positions: t, normals: o, covered: s } of e) {
		let e = [];
		for (let i = 0; i < s.length; i++) s[i] && (n.set(t.subarray(i * 3, i * 3 + 3), a * 3), r.set(o.subarray(i * 3, i * 3 + 3), a * 3), e.push(i), a++);
		i.push(e);
	}
	return {
		count: t,
		points: n,
		normals: r,
		slices: i
	};
}
async function d(e) {
	if (e === "native") throw RangeError("A light bake on the native backend needs a `texelTracer` function in its settings: the native tracer runs outside the page.");
	return e === "webgpu" ? (await import("./path-tracer-webgpu-DrdzCEqK.js")).traceTexelsOnWebGpu : (await import("./path-tracer-gpu-6qSt8fAB.js").then((e) => e.c)).traceTexelsOnGpu;
}
async function f(t, n, r, i) {
	let a = l(t), o = u(r), f = e(t.parts, a), p = await (n.texelTracer ?? await d(n.backend))(f, o, {
		samples: n.samples,
		bounces: n.bounces,
		seed: s,
		fireflyClamp: c
	}, i), m = 0;
	return {
		entries: r.map(({ resolution: e }, t) => {
			let n = new Float32Array(e * e * 3), r = new Float32Array(e * e);
			for (let e of o.slices[t]) n.set(p.radiance.subarray(m * 3, m * 3 + 3), e * 3), r[e] = p.escaped[m], m++;
			return {
				light: n,
				escaped: r
			};
		}),
		gpu: p.gpu,
		compileSeconds: p.compileSeconds
	};
}
async function p(e, i) {
	let s = {
		...e.settings,
		...i
	};
	if (s.backend === "cpu") return o(e, s);
	if (s.skyOnly) throw RangeError("A sky visibility bake runs on the CPU backend only.");
	let c = n(e, s), l = a(e, s), u = await f(e, s, l, () => t(e, s)), d = r(e, s, l, u.entries, c);
	return {
		parts: d.parts,
		report: {
			...d.report,
			gpu: u.gpu,
			gpuCompileSeconds: u.compileSeconds
		}
	};
}
async function m(e, t, n = {}) {
	let r = i(e, t, n);
	return p(r, {
		...r.settings,
		skyOnly: n.skyOnly === !0,
		...n.texelTracer ? { texelTracer: n.texelTracer } : {}
	});
}
export { m as bakeLightmapsAsync, p as traceLightmapsAsync };
