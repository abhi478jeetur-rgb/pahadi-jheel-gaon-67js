/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e } from "./volumetric-D8WftbY1.js";
// src/path-tracer-volume.js
function t(t) {
	if (!t) return null;
	let n = e(t);
	return n.density > 0 ? {
		density: n.density,
		minimum: n.minimum,
		maximum: n.maximum,
		albedo: n.color,
		anisotropy: n.anisotropy,
		maxDistance: n.maxDistance
	} : null;
}
function n(e, t, n, r, i, a, o, s, c) {
	let l = 0, u = Math.min(s, e.maxDistance);
	for (let s = 0; s < 3; s++) {
		let c = s === 0 ? t : s === 1 ? n : r, d = s === 0 ? i : s === 1 ? a : o;
		if (d === 0) {
			if (c < e.minimum[s] || c > e.maximum[s]) return !1;
			continue;
		}
		let f = (e.minimum[s] - c) / d, p = (e.maximum[s] - c) / d;
		l = Math.max(l, Math.min(f, p)), u = Math.min(u, Math.max(f, p));
	}
	return l < u && (c[0] = l, c[1] = u, !0);
}
function r(e, t) {
	let n = e * e;
	return (1 - n) / (4 * Math.PI * (1 + n - 2 * e * t) ** 1.5);
}
function i(e, t) {
	if (Math.abs(e) < .001) return 1 - 2 * t;
	let n = e * e, r = (1 - n) / (1 - e + 2 * e * t);
	return Math.max(-1, Math.min(1, (1 + n - r * r) / (2 * e)));
}
export { n as i, t as n, i as r, r as t };
