/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e } from "./path-tracer-scene-DTz5cgiX.js";
import { t } from "./path-tracer-denoise-j_ATlMbO.js";
import { i as n } from "./path-tracer-light-tree-BZYzVWXO.js";
import { createCamera as r, normalizePathTracerOptions as i, toneMapToRgba8 as a } from "./path-tracer.js";
import { a as o, d as s, f as c, i as l, l as u, n as d, o as f, r as p, t as m, u as h } from "./path-tracer-gpu-6qSt8fAB.js";
import { u as g } from "./path-tracer-gpu-pack-B_ap1Af7.js";
// src/path-tracer-progressive.js
var _ = Object.freeze([
	4,
	2,
	1
]);
async function v(v, y = {}, { resolutionDivisors: b = _ } = {}) {
	let x = await c(i({
		...y,
		backend: "gpu",
		samples: 1,
		maxSeconds: y.maxSeconds ?? 3600
	})), { gl: S, gpu: C } = o(), { width: w, height: T } = x, E = null, D = x, O = null, k = 0, A = 0, j = 0, M = 0, N = !1, P = /* @__PURE__ */ new Float32Array(4), F = d(T), I = !1, L = () => {
		let e = b[j];
		return {
			divisor: e,
			levelWidth: Math.max(1, Math.ceil(w / e)),
			levelHeight: Math.max(1, Math.ceil(T / e))
		};
	}, R = (t, r) => {
		u(S), E = e(t, r), D = {
			...x,
			lightSelection: n(x.lightSelection, E.lights)
		};
		let i = f(g(E.materials), !1, D);
		O = i.program, k = i.compileSeconds, S.useProgram(O), A = s(S, O, E, D).lightCount, p(S, w, T);
	}, z = (e) => {
		let t = r(e, w, T);
		h(S, O, E, t, D, A);
	}, B = () => {
		for (let e = 0; e < 4; e++) S.clearBufferfv(S.COLOR, e, [
			0,
			0,
			0,
			0
		]);
	}, V = () => {
		let { levelWidth: e, levelHeight: t } = L();
		S.uniform2i(S.getUniformLocation(O, "uSize"), e, t);
	}, H = () => {
		j = 0, M = 0, N = !1, F = d(T), V(), B();
	};
	return R(v.parts, v.environment ?? {}), z(v.camera), H(), {
		gpu: C,
		get compileSeconds() {
			return k;
		},
		get samples() {
			return M;
		},
		get level() {
			return {
				...L(),
				final: j === b.length - 1
			};
		},
		update({ camera: e, parts: t, environment: n }) {
			t && R(t, n ?? {}), e && z(e), H();
		},
		async step(e = () => {}) {
			if (I) throw Error("This progressive tracer was disposed.");
			N && j < b.length - 1 && (j++, M = 0, V(), B());
			let { levelWidth: t, levelHeight: n, divisor: r } = L();
			return await l(S, O, t, n, M, F, e), S.readBuffer(S.COLOR_ATTACHMENT0), S.readPixels(0, 0, 1, 1, S.RGBA, S.FLOAT, P), M++, N = !0, {
				width: t,
				height: n,
				divisor: r,
				samples: M
			};
		},
		snapshot() {
			let { levelWidth: e, levelHeight: n } = L(), r = m(S, e, n, M);
			for (let t = 0; t < e * n; t++) {
				let e = Math.hypot(r.normal[t * 3], r.normal[t * 3 + 1], r.normal[t * 3 + 2]) || 1;
				for (let n = 0; n < 3; n++) r.normal[t * 3 + n] /= e;
			}
			let { samplesTaken: i, ...o } = r, s = x.denoiser === "wavelet" ? t({
				width: e,
				height: n,
				...o
			}) : r.color;
			return {
				width: e,
				height: n,
				linear: s,
				rgba: a(s, e, n, x),
				samples: M,
				features: o
			};
		},
		dispose() {
			I = !0, u(S);
		}
	};
}
export { v as createProgressiveTracer };
