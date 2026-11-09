/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/sculpt-strokes.js
function e(e, t) {
	if (!Number.isFinite(e) || !Number.isFinite(Math.fround(e))) throw TypeError(`${t} must be a finite Float32 value.`);
	return e;
}
function t(t, n) {
	if (!Array.isArray(t) && !ArrayBuffer.isView(t) || t.length !== 3) throw TypeError(`${n} must contain three components.`);
	return Array.from(t, (t) => e(t, n));
}
function n(n) {
	return n.map((n) => {
		if (![
			"inflate",
			"displace",
			"smooth"
		].includes(n?.type)) throw TypeError("Sculpt stroke type must be inflate, displace or smooth.");
		let r = t(n.center, "center"), i = e(n.radius, "radius"), a = e(n.strength, "strength");
		if (Math.fround(i) <= 0) throw RangeError("Brush radius must remain positive at Float32 precision.");
		if (n.type === "smooth" && (a < 0 || a > 1)) throw RangeError("Smooth strength must be within zero and one.");
		let o;
		if (n.type === "displace") {
			o = t(n.direction, "direction");
			let e = Math.hypot(...o);
			if (e === 0) throw RangeError("Displace direction cannot be zero.");
			o = o.map((t) => t / e);
		}
		return {
			type: n.type,
			center: r,
			radius: i,
			strength: a,
			direction: o
		};
	});
}
function r(t, n) {
	let r = n.type === "smooth" ? t.map((e) => [...e.point]) : null;
	for (let e = 0; e < t.length; e++) {
		let i = t[e], a = Math.hypot(...i.point.map((e, t) => e - n.center[t]));
		if (a >= n.radius || n.strength === 0) continue;
		let o = a / n.radius, s = 1 - o ** 3 * (10 + o * (-15 + 6 * o));
		if (n.type === "smooth") {
			if (!i.neighbors.size) continue;
			let a = [
				0,
				0,
				0
			];
			for (let e of i.neighbors) for (let n = 0; n < 3; n++) a[n] += t[e].point[n] / i.neighbors.size;
			for (let t = 0; t < 3; t++) r[e][t] += (a[t] - i.point[t]) * n.strength * s;
		} else {
			let e = n.type === "inflate" ? i.normal : n.direction;
			for (let t = 0; t < 3; t++) i.point[t] += e[t] * n.strength * s;
		}
	}
	r && t.forEach((e, t) => {
		e.point = r[t];
	});
	for (let n of t) for (let t of n.point) e(t, "Sculpt result");
}
export { e as n, n as r, r as t };
