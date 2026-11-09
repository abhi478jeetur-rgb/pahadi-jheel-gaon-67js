/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
var e = .1;
function t(e, t) {
	return e === "auto" ? t.points.length + t.spots.length + t.areas.length > 8 ? "tree" : "uniform" : e;
}
var n = Math.PI / 2;
function r(e) {
	return .2126 * e[0] + .7152 * e[1] + .0722 * e[2];
}
function i(e, t) {
	return {
		minimum: e.map((e) => e - t),
		maximum: e.map((e) => e + t)
	};
}
function a(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity
	], n = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r of [-.5, .5]) for (let i of [-.5, .5]) for (let a = 0; a < 3; a++) {
		let o = e.position[a] + e.across[a] * r * e.width + e.along[a] * i * e.height;
		t[a] = Math.min(t[a], o), n[a] = Math.max(n[a], o);
	}
	return {
		minimum: t,
		maximum: n
	};
}
function o(e, t) {
	let o = r(e.color) * e.intensity;
	if (t === "area") return {
		...a(e),
		axis: [...e.normal],
		thetaO: 0,
		thetaE: n,
		energy: o
	};
	let s = i(e.position, e.radius ?? 0);
	return t === "spot" ? {
		...s,
		axis: [...e.direction],
		thetaO: 0,
		thetaE: Math.acos(Math.min(1, Math.max(-1, e.cosineHalfAngle))),
		energy: o
	} : {
		...s,
		axis: [
			0,
			1,
			0
		],
		thetaO: Math.PI,
		thetaE: n,
		energy: o
	};
}
function s(e, t) {
	let n = e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
	return Math.acos(Math.min(1, Math.max(-1, n)));
}
function c(e) {
	let t = e.map(Math.abs).indexOf(Math.min(...e.map(Math.abs))), n = [
		0,
		0,
		0
	];
	n[t] = 1;
	let r = [
		e[1] * n[2] - e[2] * n[1],
		e[2] * n[0] - e[0] * n[2],
		e[0] * n[1] - e[1] * n[0]
	], i = Math.hypot(...r);
	return r.map((e) => e / i);
}
function l(e, t) {
	let [n, r] = t.thetaO > e.thetaO ? [t, e] : [e, t], i = Math.max(e.thetaE, t.thetaE), a = s(n.axis, r.axis);
	if (Math.min(a + r.thetaO, Math.PI) <= n.thetaO) return {
		axis: [...n.axis],
		thetaO: n.thetaO,
		thetaE: i
	};
	let o = (n.thetaO + a + r.thetaO) / 2;
	if (o >= Math.PI) return {
		axis: [...n.axis],
		thetaO: Math.PI,
		thetaE: i
	};
	let l = o - n.thetaO;
	if (Math.sin(a) < 1e-6) return {
		axis: c(n.axis),
		thetaO: o,
		thetaE: i
	};
	let u = Math.sin(a - l) / Math.sin(a), d = Math.sin(l) / Math.sin(a), f = n.axis.map((e, t) => e * u + r.axis[t] * d), p = Math.hypot(...f) || 1;
	return {
		axis: f.map((e) => e / p),
		thetaO: o,
		thetaE: i
	};
}
function u(e, t) {
	let n = l(e, t);
	return {
		minimum: e.minimum.map((e, n) => Math.min(e, t.minimum[n])),
		maximum: e.maximum.map((e, n) => Math.max(e, t.maximum[n])),
		energy: e.energy + t.energy,
		...n
	};
}
function d(e, t) {
	return e.minimum[t] + e.maximum[t];
}
var f = 12;
function p(e, t) {
	let n = t.map((t, n) => t - e[n]), r = Math.max(...n, 1e-6), i = n.map((e) => e + r * .001);
	return i[0] * i[1] + i[1] * i[2] + i[2] * i[0];
}
function m(e, t) {
	let n = Math.min(e + t, Math.PI);
	return 2 * Math.PI * (1 - Math.cos(e)) + .5 * Math.PI * (2 * n * Math.sin(e) - Math.cos(e - 2 * n) - 2 * e * Math.sin(e) + Math.cos(e));
}
function h(e) {
	return e.reduce((e, t) => e ? u(e, t) : t, null);
}
function g(e) {
	return e.energy * p(e.minimum, e.maximum) * m(e.thetaO, e.thetaE);
}
function _(e) {
	let t = e.reduce((e, t) => ({
		minimum: e.minimum.map((e, n) => Math.min(e, t.minimum[n])),
		maximum: e.maximum.map((e, n) => Math.max(e, t.maximum[n]))
	}), {
		minimum: [
			Infinity,
			Infinity,
			Infinity
		],
		maximum: [
			-Infinity,
			-Infinity,
			-Infinity
		]
	}), n = Math.max(...t.maximum.map((e, n) => e - t.minimum[n]), 1e-9), r = null;
	for (let i = 0; i < 3; i++) {
		let a = e.map((e) => d(e, i)), o = Math.min(...a), s = Math.max(...a);
		if (!(s - o > 1e-9)) continue;
		let c = Array.from({ length: f }, () => []);
		e.forEach((e, t) => {
			let n = Math.min(11, Math.floor((a[t] - o) / (s - o) * f));
			c[n].push(e);
		});
		let l = t.maximum[i] - t.minimum[i], u = n / Math.max(l, n * .001);
		for (let e = 1; e < f; e++) {
			let t = c.slice(0, e).flat(), n = c.slice(e).flat();
			if (t.length === 0 || n.length === 0) continue;
			let i = u * (g(h(t)) + g(h(n)));
			(!r || i < r.cost) && (r = {
				cost: i,
				left: t,
				right: n
			});
		}
	}
	if (r && Number.isFinite(r.cost)) return [r.left, r.right];
	let i = 0, a = -1;
	for (let t = 0; t < 3; t++) {
		let n = e.map((e) => d(e, t)), r = Math.max(...n) - Math.min(...n);
		r > a && (a = r, i = t);
	}
	let o = [...e].sort((e, t) => d(e, i) - d(t, i)), s = o.length >> 1;
	return [o.slice(0, s), o.slice(s)];
}
function v(e) {
	let t = [
		...e.points.map((e) => o(e, "point")),
		...e.spots.map((e) => o(e, "spot")),
		...e.areas.map((e) => o(e, "area"))
	].map((e, t) => ({
		...e,
		lightIndex: t
	})), n = [];
	function r(e) {
		let t = n.length, i = {
			left: -1,
			right: -1,
			lightIndex: -1
		};
		if (n.push(i), e.length === 1) return Object.assign(i, e[0]), t;
		let [a, o] = _(e);
		return i.left = r(a), i.right = r(o), Object.assign(i, u(n[i.left], n[i.right])), t;
	}
	if (t.length === 0) return {
		nodeCount: 0,
		data: /* @__PURE__ */ new Float32Array(16)
	};
	r(t);
	let i = new Float32Array(n.length * 16);
	return n.forEach((e, t) => {
		let n = t * 16;
		i.set([...e.minimum, e.energy], n), i.set([...e.maximum, Math.cos(e.thetaO)], n + 4), i.set([...e.axis, Math.cos(e.thetaE)], n + 8), i.set([
			e.left,
			e.right,
			e.lightIndex,
			0
		], n + 12);
	}), {
		nodeCount: n.length,
		data: i
	};
}
var y = {
	maximum: 0,
	minimum: 0
};
function b(e, t, n, r, i, a, o, s) {
	let c = t * 16, l = e[c + 3], u = (e[c] + e[c + 4]) * .5, d = (e[c + 1] + e[c + 5]) * .5, f = (e[c + 2] + e[c + 6]) * .5, p = .5 * Math.hypot(e[c + 4] - e[c], e[c + 5] - e[c + 1], e[c + 6] - e[c + 2]), m = u - n, h = d - r, g = f - i, _ = Math.hypot(m, h, g), v = Math.max(_, p, 1e-4), b = _ + p;
	if (y.minimum = l / Math.max(b * b, 1e-8), _ <= p) return y.maximum = l / (v * v), y;
	let x = m / _, S = h / _, C = g / _, w = Math.acos(Math.sqrt(Math.max(0, 1 - (p / _) ** 2))), T = -(e[c + 8] * x + e[c + 9] * S + e[c + 10] * C), E = Math.acos(Math.min(1, Math.max(-1, T))), D = Math.acos(Math.min(1, Math.max(-1, e[c + 7]))), O = Math.acos(Math.min(1, Math.max(-1, e[c + 11]))), k = Math.max(E - D - w, 0);
	if (k >= O) return y.maximum = 0, y;
	let A = Math.acos(Math.min(1, Math.max(-1, a * x + o * S + s * C))), j = Math.max(Math.cos(Math.max(A - w, 0)), 0);
	return y.maximum = l * Math.cos(k) * j / (v * v), y;
}
function x(t, n, r, i) {
	let a = t + r, o = n + i;
	return o > 0 ? a > 0 ? t / a * .9 + n / o * e : n / o : -1;
}
var S = {
	lightIndex: -1,
	probability: 0
};
function C(e, t, n, r, i, a, o, s) {
	if (S.lightIndex = -1, S.probability = 0, e.nodeCount === 0) return S;
	let { data: c } = e, l = 0, u = 1;
	for (; c[l * 16 + 12] >= 0;) {
		let e = l * 16, d = c[e + 12], f = c[e + 13];
		b(c, d, t, n, r, i, a, o);
		let p = y.maximum, m = y.minimum;
		b(c, f, t, n, r, i, a, o);
		let h = x(p, m, y.maximum, y.minimum);
		if (h < 0) return S;
		s() < h ? (l = d, u *= h) : (l = f, u *= 1 - h);
	}
	return S.lightIndex = c[l * 16 + 14], S.probability = u, S;
}
export { t as i, v as n, C as r, e as t };
