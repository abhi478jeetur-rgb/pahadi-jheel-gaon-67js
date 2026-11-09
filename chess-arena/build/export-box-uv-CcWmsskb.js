/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/export-box-uv.js
function e(e) {
	return [
		0,
		4,
		8
	].map((t) => Math.hypot(e[t], e[t + 1], e[t + 2]));
}
function t(e, t) {
	return t === 0 ? [
		e[1],
		e[0],
		e[2]
	] : t === 2 ? [
		e[0],
		e[2],
		e[1]
	] : e;
}
function n(e, n, r, i) {
	let [a, o, s] = [
		0,
		1,
		2
	].map((e) => n[r * 3 + e] * 3), c = [
		0,
		1,
		2
	].map((t) => e[o + t] - e[a + t]), l = [
		0,
		1,
		2
	].map((t) => e[s + t] - e[a + t]), u = t([
		c[1] * l[2] - c[2] * l[1],
		c[2] * l[0] - c[0] * l[2],
		c[0] * l[1] - c[1] * l[0]
	], i).map(Math.abs);
	return u[0] >= u[1] && u[0] >= u[2] ? 0 : u[1] >= u[2] ? 1 : 2;
}
function r(e, n, r, i, a) {
	let [o, s, c] = t(e.map((e, t) => e * n[t] * r), i);
	return a === 0 ? [c, s] : a === 1 ? [o, c] : [o, s];
}
function i(e, t, n) {
	let r = new e.constructor(n.length * t);
	return n.forEach((n, i) => {
		for (let a = 0; a < t; a++) r[i * t + a] = e[n * t + a];
	}), r;
}
function a(e, t, a, o) {
	let { positions: s, indices: c } = e, l = c.length / 3, u = /* @__PURE__ */ new Map(), d = [], f = new Uint32Array(c.length), p = [];
	for (let e = 0; e < l; e++) {
		let t = n(s, c, e, o);
		for (let n = 0; n < 3; n++) {
			let r = c[e * 3 + n], i = r * 3 + t;
			u.has(i) || (u.set(i, d.length), d.push(r), p.push(t)), f[e * 3 + n] = u.get(i);
		}
	}
	let m = {
		...e,
		indices: f
	};
	m.positions = i(s, 3, d), m.normals = i(e.normals, 3, d);
	for (let [t, n] of [
		["colors", 3],
		["lightUvs", 2],
		["skinIndices", 4],
		["skinWeights", 4]
	]) e[t] && (m[t] = i(e[t], n, d));
	return e.morphTargets && (m.morphTargets = e.morphTargets.map((e) => ({
		...e,
		...e.positions ? { positions: i(e.positions, 3, d) } : {},
		...e.normals ? { normals: i(e.normals, 3, d) } : {}
	}))), m.uvs = new Float32Array(d.length * 2), d.forEach((e, n) => {
		let i = [
			s[e * 3],
			s[e * 3 + 1],
			s[e * 3 + 2]
		];
		m.uvs.set(r(i, t, a, o, p[n]), n * 2);
	}), m;
}
export { e as n, a as t };
