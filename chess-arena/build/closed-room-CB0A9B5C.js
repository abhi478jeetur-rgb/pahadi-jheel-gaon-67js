/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
var e = .9, t = 15e4;
function n(e, t) {
	let n = 0;
	for (let t of e) n += t.geometry.indices.length / 3;
	if (n === 0 || n > 15e4) return null;
	let r = new Float64Array(n * 9), i = [
		Infinity,
		Infinity,
		Infinity
	], a = [
		-Infinity,
		-Infinity,
		-Infinity
	], o = 0;
	for (let n of e) {
		let e = t.get(n.name), { positions: s, indices: c } = n.geometry;
		for (let t of c) for (let n = 0; n < 3; n++) {
			let c = e[n] * s[t * 3] + e[4 + n] * s[t * 3 + 1] + e[8 + n] * s[t * 3 + 2] + e[12 + n];
			r[o++] = c, i[n] = Math.min(i[n], c), a[n] = Math.max(a[n], c);
		}
	}
	return {
		corners: r,
		triangleCount: n,
		centre: i.map((e, t) => (e + a[t]) / 2)
	};
}
function r(e, t, n) {
	let r = 1 - (e + .5) * 2 / t, i = Math.sqrt(1 - r * r), a = e * Math.PI * (3 - Math.sqrt(5));
	return n[0] = Math.cos(a) * i, n[1] = r, n[2] = Math.sin(a) * i, n;
}
function i(e, t, n, r) {
	let i = e[t + 3] - e[t], a = e[t + 4] - e[t + 1], o = e[t + 5] - e[t + 2], s = e[t + 6] - e[t], c = e[t + 7] - e[t + 1], l = e[t + 8] - e[t + 2], u = r[1] * l - r[2] * c, d = r[2] * s - r[0] * l, f = r[0] * c - r[1] * s, p = i * u + a * d + o * f;
	if (p < 1e-9) return !1;
	let m = n[0] - e[t], h = n[1] - e[t + 1], g = n[2] - e[t + 2], _ = m * u + h * d + g * f;
	if (_ < 0 || _ > p) return !1;
	let v = h * o - g * a, y = g * i - m * o, b = m * a - h * i, x = r[0] * v + r[1] * y + r[2] * b;
	return x < 0 || _ + x > p ? !1 : s * v + c * y + l * b > 0;
}
function a(e, t) {
	let a = n(e.filter((e) => !["blend", "add"].includes(e.material?.alphaMode)), t);
	if (!a) return null;
	let o = [
		0,
		0,
		0
	], s = 0;
	for (let e = 0; e < 48; e++) {
		r(e, 48, o);
		for (let e = 0; e < a.triangleCount; e++) if (i(a.corners, e * 9, a.centre, o)) {
			s++;
			break;
		}
	}
	return s / 48;
}
function o(e, t) {
	let a = new Map(e.map((e) => [e.name, e.matrix])), o = n(e.filter((e) => !["blend", "add"].includes(e.material?.alphaMode)), a);
	if (!o) return null;
	let s = [
		0,
		0,
		0
	], c = 0;
	for (let e = 0; e < 32; e++) {
		r(e, 64, s);
		let n = !1;
		for (let e = 0; e < o.triangleCount && !n; e++) n = i(o.corners, e * 9, t, s);
		n || c++;
	}
	return c / 32;
}
function s(e, t) {
	let n = t.map((t, n) => t - e[n]), r = Math.max(Math.cbrt(n[0] * n[1] * n[2] / 2048), Math.max(...n) / 32);
	return n.map((e) => Math.min(32, Math.max(2, Math.ceil(e / r))));
}
function c(e, t, a) {
	let o = new Map(e.map((e) => [e.name, e.matrix])), c = n(e.filter((e) => !["blend", "add"].includes(e.material?.alphaMode)), o);
	if (!c) return null;
	let l = s(t, a), u = Array.from({ length: 24 }, (e, t) => r(t, 48, [
		0,
		0,
		0
	])), d = new Uint8Array(l[0] * l[1] * l[2]), f = [
		0,
		0,
		0
	], p = 0;
	for (let e = 0; e < l[2]; e++) for (let n = 0; n < l[1]; n++) for (let r = 0; r < l[0]; r++) {
		let o = [
			r,
			n,
			e
		];
		for (let e = 0; e < 3; e++) f[e] = t[e] + (o[e] + .5) / l[e] * (a[e] - t[e]);
		let s = 0;
		for (let e of u) {
			let t = !1;
			for (let n = 0; n < c.triangleCount && !t; n++) t = i(c.corners, n * 9, f, e);
			t || s++;
		}
		d[p++] = Math.round(255 * s / 24);
	}
	return {
		size: l,
		data: d
	};
}
export { o as a, r as i, e as n, c as o, a as r, t };
