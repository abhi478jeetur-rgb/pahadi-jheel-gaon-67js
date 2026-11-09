/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/path-tracer-blue-noise.js
var e = 64, t = 4096, n = 1.5;
function r(e) {
	let t = e >>> 0 || 1;
	return () => {
		t = Math.imul(t, 747796405) + 2891336453 >>> 0;
		let e = Math.imul((t >>> (t >>> 28) + 4 ^ t) >>> 0, 277803737) >>> 0;
		return e = (e >>> 22 ^ e) >>> 0, (e >>> 8) / 16777216;
	};
}
function i() {
	let e = /* @__PURE__ */ new Float64Array(361);
	for (let t = -9; t <= 9; t++) for (let r = -9; r <= 9; r++) e[(t + 9) * 19 + r + 9] = Math.exp(-(r * r + t * t) / (2 * n * n));
	return e;
}
var a = i();
function o(e, t, n) {
	let r = t % 64, i = (t - r) / 64;
	for (let t = -9; t <= 9; t++) {
		let o = (i + t + 64) % 64 * 64;
		for (let i = -9; i <= 9; i++) e[o + (r + i + 64) % 64] += n * a[(t + 9) * 19 + i + 9];
	}
}
function s(e, n, r, i) {
	let a = -1, o = i ? -Infinity : Infinity;
	for (let s = 0; s < t; s++) {
		if (n[s] === 1 !== r) continue;
		let t = e[s];
		(i ? t > o : t < o) && (o = t, a = s);
	}
	return a;
}
function c(e) {
	let n = r(e), i = new Uint8Array(t), a = new Float64Array(t), c = Array.from({ length: t }, (e, t) => t);
	for (let e = 4095; e > 0; e--) {
		let t = Math.floor(n() * (e + 1));
		[c[e], c[t]] = [c[t], c[e]];
	}
	for (let e = 0; e < 410; e++) i[c[e]] = 1, o(a, c[e], 1);
	for (let e = 0; e < t; e++) {
		let e = s(a, i, !0, !0);
		i[e] = 0, o(a, e, -1);
		let t = s(a, i, !1, !1);
		if (i[t] = 1, o(a, t, 1), t === e) break;
	}
	let l = new Uint16Array(t), u = i.slice(), d = a.slice();
	for (let e = 409; e >= 0; e--) {
		let t = s(a, i, !0, !0);
		i[t] = 0, o(a, t, -1), l[t] = e;
	}
	i.set(u), a.set(d);
	for (let e = 410; e < t; e++) {
		let t = s(a, i, !1, !1);
		i[t] = 1, o(a, t, 1), l[t] = e;
	}
	return l;
}
function l(e = 0) {
	let n = new Uint8Array(t * 4);
	for (let r = 0; r < 4; r++) {
		let i = c(Math.imul((e >>> 0) + 1, 2654435761) + r * 1663821227);
		for (let e = 0; e < t; e++) n[e * 4 + r] = i[e] >> 4;
	}
	return n;
}
export { e as BLUE_NOISE_SIZE, l as createBlueNoiseTile };
