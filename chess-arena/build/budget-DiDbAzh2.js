/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/budget.js
var e = 1048576;
function t(t, n, r, i) {
	let a = (t) => (t / e).toFixed(1);
	return /* @__PURE__ */ RangeError(`Memory budget cannot hold geometry ${a(t)} MiB, textures ${a(n)} MiB and frame ${a(r)} MiB, over memoryBudgetMiB ${i}. Fix: pass { memoryBudgetMiB: ${Math.ceil((t + n + r) / e)} }.`);
}
var n = Object.freeze({
	preview: {
		width: 960,
		height: 540,
		samples: 2,
		fps: 24,
		memoryBudgetMiB: 256
	},
	balanced: {
		width: 1280,
		height: 720,
		samples: 4,
		fps: 24,
		memoryBudgetMiB: 384
	},
	high: {
		width: 1920,
		height: 1080,
		samples: 4,
		fps: 24,
		memoryBudgetMiB: 512
	},
	cpu: {
		width: 640,
		height: 360,
		samples: 1,
		fps: 12,
		memoryBudgetMiB: 192
	}
});
function r(e, t, { mipmaps: n = !0 } = {}) {
	if (!Number.isInteger(e) || !Number.isInteger(t) || e <= 0 || t <= 0) throw Error("Texture dimensions must be positive integers.");
	let r = 0;
	do {
		if (r += e * t * 4, !n || e === 1 && t === 1) break;
		e = Math.max(1, Math.floor(e / 2)), t = Math.max(1, Math.floor(t / 2));
	} while (1);
	return r;
}
function i(e, t, n, r = 2048, { hdr: i = !1, bloom: a = !1, depth: o = !1 } = {}) {
	let s = i ? 8 : 4;
	return e * t * ((s + 4) * Math.max(1, n) + s + 16) + (a ? Math.ceil(e / 2) * Math.ceil(t / 2) * s * 2 : 0) + (o ? e * t * 4 : 0) + r ** 2 * 4;
}
function a({ width: n, height: r, pixelRatio: a = 1, samples: o = 4, memoryBudgetMiB: s, geometryBytes: c = 0, textureBytes: l = 0, hdr: u = !1, bloom: d = !1, depth: f = !1, shadowResolution: p = 2048, maximumSize: m = 8192 }) {
	let h = Math.max(1, Math.round(n * a)), g = Math.max(1, Math.round(r * a)), _ = i(Math.min(h, m), Math.min(g, m), o, p, {
		hdr: u,
		bloom: d,
		depth: f
	});
	s ??= Math.min(globalThis.navigator?.deviceMemory >= 8 ? 1024 : 512, Math.max(256, Math.ceil((c + l + _) / e)));
	for (let e of [
		n,
		r,
		a,
		o,
		s,
		m
	]) if (!Number.isFinite(e) || e <= 0) throw Error("Render dimensions, sample count and budget must be positive finite numbers.");
	if (c < 0 || !Number.isFinite(c)) throw Error("Geometry memory must be a nonnegative finite number.");
	if (l < 0 || !Number.isFinite(l)) throw Error("Texture memory must be a nonnegative finite number.");
	if (!Number.isFinite(p) || p < 0) throw Error("Shadow resolution must be nonnegative and finite.");
	let v = s * e - c - l - p ** 2 * 4, y = (u ? 12 : 8) * Math.max(1, o) + (u ? 24 : 20) + (d ? u ? 4 : 2 : 0) + (f ? 4 : 0);
	if (v < i(64, 64, o, 0, {
		hdr: u,
		bloom: d,
		depth: f
	})) throw t(c, l, _, s);
	let b = Math.min(1, m / h, m / g, Math.sqrt(v / (h * g * y))), x = Math.max(1, Math.floor(h * b)), S = Math.max(1, Math.floor(g * b)), C = s * e;
	for (; i(x, S, o, p, {
		hdr: u,
		bloom: d,
		depth: f
	}) + c + l > C;) x = Math.max(1, x - 1), S = Math.max(1, S - 1);
	return {
		width: x,
		height: S,
		samples: o,
		hdr: u,
		bloom: d,
		depth: f,
		textureBytes: l,
		estimatedBytes: i(x, S, o, p, {
			hdr: u,
			bloom: d,
			depth: f
		}) + c + l,
		memoryBudgetMiB: s,
		reduced: x < h || S < g
	};
}
export { a, t as i, i as n, r, n as t };
