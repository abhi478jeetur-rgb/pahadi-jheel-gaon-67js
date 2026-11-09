/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e } from "./path-tracer-scene-DTz5cgiX.js";
import { createCamera as t } from "./path-tracer.js";
import { a as n, d as r, l as i, o as a, u as o } from "./path-tracer-gpu-6qSt8fAB.js";
import { h as s, u as c, v as l, y as u } from "./path-tracer-gpu-pack-B_ap1Af7.js";
import { i as d, n as f, r as p, t as m } from "./path-tracer-realtime-options-DiPfECqi.js";
// src/path-tracer-realtime.js
async function h(h, g = {}) {
	let _ = f(g), v = null;
	if (_.backend === "webgpu") try {
		let { createWebGpuRealtimeTracer: e } = await import("./path-tracer-realtime-webgpu-2ydke_HJ.js");
		return await e(h, _, g.canvas);
	} catch (e) {
		v = e.message;
	}
	let { outputWidth: y, outputHeight: b, traceWidth: x, traceHeight: S, options: C, historyLimit: w, filterIterations: T, cacheCellSize: E } = _, { gl: D, gpu: O } = n();
	if (D.getParameter(D.MAX_COMBINED_TEXTURE_IMAGE_UNITS) < 28) throw Error("The real-time path tracer needs 28 texture units.");
	D.canvas.width = y, D.canvas.height = b;
	let k = [l(D, x, S), l(D, x, S)], A = [l(D, x, S), l(D, x, S)], j = l(D, x, S), M = l(D, x, S), N = [0, 1].map((e) => u(D, [
		{
			slot: 0,
			texture: k[e]
		},
		{
			slot: 1,
			texture: j
		},
		{
			slot: 2,
			texture: A[e]
		},
		{
			slot: 4,
			texture: M
		}
	])), P = s(D), F = d(D, {
		traceWidth: x,
		traceHeight: S,
		outputWidth: y,
		outputHeight: b,
		historyLimit: w,
		filterIterations: T
	}), I = /* @__PURE__ */ new Uint8Array(4), L = null, R = null, z = 0, B = 0, V = 0, H = 0, U = 0, W = null, G = null, K = !0, q = !1, J = (t, n) => {
		i(D), L = e(t, n);
		let o = a(c(L.materials), !1, C);
		R = o.program, V = o.compileSeconds, D.useProgram(R);
		let s = r(D, R, L, C);
		z = s.lightCount, B = s.nextUnit, D.uniform1i(D.getUniformLocation(R, "uRadianceCache"), B);
		let { cellSize: l, levelDistance: u } = m(L, E);
		D.uniform1f(D.getUniformLocation(R, "uCacheCellSize"), l), D.uniform1f(D.getUniformLocation(R, "uCacheLevelDistance"), u), P.clear(), W = null, K = !0;
	};
	J(h.parts, h.environment ?? {});
	let Y = () => {
		D.useProgram(R), D.uniform1i(D.getUniformLocation(R, "uSample"), U + 1), D.activeTexture(D.TEXTURE0 + B), D.bindTexture(D.TEXTURE_2D, P.texture), D.bindFramebuffer(D.FRAMEBUFFER, N[H]), D.viewport(0, 0, x, S), D.disable(D.BLEND), D.disable(D.SCISSOR_TEST), D.drawArrays(D.TRIANGLES, 0, 3);
	};
	return {
		gpu: O,
		backend: "gpu",
		fallbackReason: v,
		canvas: D.canvas,
		width: y,
		height: b,
		traceWidth: x,
		traceHeight: S,
		get compileSeconds() {
			return V;
		},
		get frameCount() {
			return U;
		},
		update({ parts: e, environment: t }) {
			e && J(e, t ?? {});
		},
		resetHistory() {
			K = !0;
		},
		frame(e, { wait: n = !1 } = {}) {
			if (q) throw Error("This real-time tracer was disposed.");
			let r = t(e, y, b);
			return G = W ?? r, p(W, r) || (D.useProgram(R), o(D, R, L, r, C, z)), W = r, Y(), P.update(M, x, S), F.run({
				radiance: k[H],
				albedo: j,
				normal: A[H],
				previousRadiance: k[1 - H],
				previousNormal: A[1 - H],
				camera: W,
				previousCamera: G,
				resetHistory: K,
				farDistance: L.farDistance
			}), K = !1, H = 1 - H, U++, n && D.readPixels(0, 0, 1, 1, D.RGBA, D.UNSIGNED_BYTE, I), { frame: U };
		},
		readFrame() {
			D.bindFramebuffer(D.FRAMEBUFFER, null);
			let e = new Uint8Array(y * b * 4);
			D.readPixels(0, 0, y, b, D.RGBA, D.UNSIGNED_BYTE, e);
			let t = new Uint8ClampedArray(e.length), n = y * 4;
			for (let r = 0; r < b; r++) t.set(e.subarray((b - 1 - r) * n, (b - r) * n), r * n);
			return {
				width: y,
				height: b,
				rgba: t
			};
		},
		dispose() {
			q = !0, P.dispose(), F.dispose();
			for (let e of [
				...k,
				...A,
				j,
				M
			]) D.deleteTexture(e);
			for (let e of N) D.deleteFramebuffer(e);
			i(D);
		}
	};
}
export { h as createRealtimeTracer };
