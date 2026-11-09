/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/ray-query.js
var e = 1e-30;
function t(e, t, n) {
	let r = new Float64Array(n.length * 9);
	for (let i = 0; i < n.length; i++) {
		let a = t[n[i] * 3] * 3, o = t[n[i] * 3 + 1] * 3, s = t[n[i] * 3 + 2] * 3, c = i * 9;
		for (let t = 0; t < 3; t++) r[c + t] = e[a + t], r[c + 3 + t] = e[o + t] - e[a + t], r[c + 6 + t] = e[s + t] - e[a + t];
	}
	return r;
}
function n(e, t, n, r, i, a, o, s) {
	let c = (e[t] - n) * a, l = (e[t + 3] - n) * a, u = (e[t + 1] - r) * o, d = (e[t + 4] - r) * o, f = (e[t + 2] - i) * s, p = (e[t + 5] - i) * s, m = Math.max(0, Math.min(c, l), Math.min(u, d), Math.min(f, p));
	return m <= Math.min(Math.max(c, l), Math.max(u, d), Math.max(f, p)) * 1.000000000001 + 1e-12 ? m : Infinity;
}
function r(t) {
	return t > e || t < -1e-30 ? 1 / t : t < 0 ? -1 / e : 1 / e;
}
function i(e) {
	let { nodeBounds: i, rightChild: a, rangeStart: o, rangeCount: s } = e.bvh, c = t(e.positions, e.indices, e.bvh.triangleOrder), l = e.bvh.triangleOrder, u = /* @__PURE__ */ new Int32Array(160), d = /* @__PURE__ */ new Float64Array(160), f = {
		nearestDistance: Infinity,
		nearestTriangle: -1,
		stopAtAnyHit: !1
	};
	function p(e, t, n, r, i, a, u) {
		let d = o[e] + s[e];
		for (let s = o[e]; s < d; s++) {
			let e = s * 9, o = c[e + 6], d = c[e + 7], p = c[e + 8], m = a * p - u * d, h = u * o - i * p, g = i * d - a * o, _ = c[e + 3], v = c[e + 4], y = c[e + 5], b = _ * m + v * h + y * g;
			if (b === 0) continue;
			let x = t - c[e], S = n - c[e + 1], C = r - c[e + 2], w = (x * m + S * h + C * g) / b;
			if (w < 0 || w > 1) continue;
			let T = S * y - C * v, E = C * _ - x * y, D = x * v - S * _, O = (i * T + a * E + u * D) / b;
			if (O < 0 || w + O > 1) continue;
			let k = (o * T + d * E + p * D) / b;
			if (!(k < 0 || k >= f.nearestDistance) && (f.nearestDistance = k, f.nearestTriangle = l[s], f.stopAtAnyHit)) return !0;
		}
		return !1;
	}
	function m(e, t, o, s, c, l, m, h) {
		f.nearestDistance = m, f.nearestTriangle = -1, f.stopAtAnyHit = h;
		let g = r(s), _ = r(c), v = r(l), y = 1;
		for (u[0] = 0, d[0] = 0; y > 0;) {
			y--;
			let r = u[y];
			if (!(d[y] < f.nearestDistance)) continue;
			let m = a[r];
			if (m < 0) {
				if (p(r, e, t, o, s, c, l)) return f;
				continue;
			}
			let h = r + 1, b = n(i, h * 6, e, t, o, g, _, v), x = n(i, m * 6, e, t, o, g, _, v), S = b <= x;
			u[y] = S ? m : h, d[y] = S ? x : b, u[y + 1] = S ? h : m, d[y + 1] = S ? b : x, y += 2;
		}
		return f;
	}
	return { trace: m };
}
function a(e, t) {
	let n = 1;
	if (t.range > 0) {
		let r = e / (t.range * t.range), i = Math.max(1 - r * r, 0);
		n = i * i;
	}
	return n / Math.max(e, t.radius * t.radius);
}
export { a as n, i as t };
