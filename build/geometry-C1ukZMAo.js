/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/geometry.js
var e = Math.PI * 2, t = 1e6;
function n(e, t, n, r) {
	if (!Number.isInteger(e) || e < t || e > n) throw RangeError(`${r} must be an integer from ${t} to ${n}.`);
}
function r(e, t) {
	if (!Number.isFinite(e) || !Number.isFinite(Math.fround(e))) throw TypeError(`${t} must be a finite Float32 value.`);
}
function i(e) {
	if (e > t) throw RangeError("Primitive exceeds one million vertices. Reduce segments or subdivisions.");
}
function a(t) {
	return t === 1 ? 0 : t * e;
}
function o(e, t, n) {
	return {
		positions: new Float32Array(e),
		normals: new Float32Array(t),
		indices: new Uint32Array(n)
	};
}
function s(e, t, n) {
	let r = [], i = [], a = [];
	for (let a = 0; a <= t; a++) for (let o = 0; o <= e; o++) {
		let s = n(o / e, a / t);
		r.push(...s.position), i.push(...s.normal);
	}
	function s(e, t, n) {
		let o = r.slice(t * 3, t * 3 + 3).map((t, n) => t - r[e * 3 + n]), s = r.slice(n * 3, n * 3 + 3).map((t, n) => t - r[e * 3 + n]), c = [
			o[1] * s[2] - o[2] * s[1],
			o[2] * s[0] - o[0] * s[2],
			o[0] * s[1] - o[1] * s[0]
		];
		if (Math.hypot(...c) < 1e-10) return;
		let l = c.reduce((r, a, o) => r + a * (i[e * 3 + o] + i[t * 3 + o] + i[n * 3 + o]), 0);
		a.push(e, l > 0 ? t : n, l > 0 ? n : t);
	}
	for (let n = 0; n < t; n++) for (let t = 0; t < e; t++) {
		let r = n * (e + 1) + t, i = r + e + 1;
		s(r, r + 1, i), s(r + 1, i + 1, i);
	}
	let c = o(r, i, a);
	c.uvs = new Float32Array((e + 1) * (t + 1) * 2);
	for (let n = 0; n <= t; n++) for (let r = 0; r <= e; r++) {
		let i = (n * (e + 1) + r) * 2;
		c.uvs[i] = r / e, c.uvs[i + 1] = n / t;
	}
	return c;
}
function c(e = 64, t = 40) {
	return n(e, 3, 2048, "segments"), n(t, 2, 2048, "rings"), i((e + 1) * (t + 1)), s(e, t, (e, t) => {
		let n = a(e), r = t * Math.PI, i = t === 0 || t === 1 ? 0 : Math.sin(r), o = [
			i * Math.cos(n),
			Math.cos(r),
			i * Math.sin(n)
		];
		return {
			position: o,
			normal: o
		};
	});
}
function l(e = 16) {
	return n(e, 1, 64, "segments"), s(e, e, (e, t) => ({
		position: [
			e - .5,
			.5 - t,
			0
		],
		normal: [
			0,
			0,
			1
		]
	}));
}
function u(e = 0, t = 1, c = 64) {
	if (r(e, "radiusTop"), r(t, "radiusBottom"), e < 0 || t < 0 || Math.fround(e) + Math.fround(t) <= 0) throw RangeError("radiusTop and radiusBottom must not be negative, and at least one must be above zero.");
	n(c, 3, 2048, "segments"), i((c + 1) * 2 + 2 * (c + 2));
	let l = t - e, u = Math.hypot(1, l), d = s(c, 1, (n, r) => {
		let i = a(n), o = r === 0 ? e : t;
		return {
			position: [
				o * Math.cos(i),
				.5 - r,
				o * Math.sin(i)
			],
			normal: [
				Math.cos(i) / u,
				l / u,
				Math.sin(i) / u
			]
		};
	}), f = [...d.positions], p = [...d.normals], m = [...d.indices], h = [{
		sign: 1,
		radius: e
	}, {
		sign: -1,
		radius: t
	}];
	for (let { sign: e, radius: t } of h) {
		if (t === 0) continue;
		let n = f.length / 3;
		f.push(0, e * .5, 0), p.push(0, e, 0);
		for (let n = 0; n <= c; n++) {
			let r = a(n / c);
			f.push(t * Math.cos(r), e * .5, t * Math.sin(r)), p.push(0, e, 0);
		}
		for (let t = 0; t < c; t++) {
			let r = n + t + 1;
			m.push(n, e > 0 ? r + 1 : r, e > 0 ? r : r + 1);
		}
	}
	return o(f, p, m);
}
function d(e = 2) {
	n(e, 0, 7, "subdivisions"), i(10 * 4 ** e + 2);
	let t = (1 + Math.sqrt(5)) / 2, r = [], a = [
		[
			-1,
			t,
			0
		],
		[
			1,
			t,
			0
		],
		[
			-1,
			-t,
			0
		],
		[
			1,
			-t,
			0
		],
		[
			0,
			-1,
			t
		],
		[
			0,
			1,
			t
		],
		[
			0,
			-1,
			-t
		],
		[
			0,
			1,
			-t
		],
		[
			t,
			0,
			-1
		],
		[
			t,
			0,
			1
		],
		[
			-t,
			0,
			-1
		],
		[
			-t,
			0,
			1
		]
	];
	for (let e of a) {
		let t = Math.hypot(...e);
		r.push(...e.map((e) => e / t));
	}
	let s = [
		[
			0,
			11,
			5
		],
		[
			0,
			5,
			1
		],
		[
			0,
			1,
			7
		],
		[
			0,
			7,
			10
		],
		[
			0,
			10,
			11
		],
		[
			1,
			5,
			9
		],
		[
			5,
			11,
			4
		],
		[
			11,
			10,
			2
		],
		[
			10,
			7,
			6
		],
		[
			7,
			1,
			8
		],
		[
			3,
			9,
			4
		],
		[
			3,
			4,
			2
		],
		[
			3,
			2,
			6
		],
		[
			3,
			6,
			8
		],
		[
			3,
			8,
			9
		],
		[
			4,
			9,
			5
		],
		[
			2,
			4,
			11
		],
		[
			6,
			2,
			10
		],
		[
			8,
			6,
			7
		],
		[
			9,
			8,
			1
		]
	];
	for (let t = 0; t < e; t++) {
		let e = /* @__PURE__ */ new Map(), t = (t, n) => {
			let i = t < n ? `${t}:${n}` : `${n}:${t}`;
			if (e.has(i)) return e.get(i);
			let a = [
				0,
				1,
				2
			].map((e) => r[t * 3 + e] + r[n * 3 + e]), o = Math.hypot(...a), s = r.length / 3;
			return r.push(...a.map((e) => e / o)), e.set(i, s), s;
		}, n = [];
		for (let [e, r, i] of s) {
			let a = t(e, r), o = t(r, i), s = t(i, e);
			n.push([
				e,
				a,
				s
			], [
				r,
				o,
				a
			], [
				i,
				s,
				o
			], [
				a,
				o,
				s
			]);
		}
		s = n;
	}
	return o(r, r, s.flat());
}
function f(e = 64, t = 0) {
	if (n(e, 3, 2048, "segments"), r(t, "innerRadius"), t < 0 || t >= 1) throw RangeError("innerRadius must be from 0 up to but not including 1.");
	let c = (e) => e === 0 ? t : 1;
	if (t > 0) {
		i((e + 1) * 2);
		let t = s(e, 1, (e, t) => {
			let n = a(e);
			return {
				position: [
					c(t) * Math.cos(n),
					c(t) * Math.sin(n),
					0
				],
				normal: [
					0,
					0,
					1
				]
			};
		}), n = [];
		for (let t = 0; t <= 1; t++) for (let r = 0; r <= e; r++) {
			let i = a(r / e);
			n.push(.5 + .5 * c(t) * Math.cos(i), .5 + .5 * c(t) * Math.sin(i));
		}
		return t.uvs = new Float32Array(n), t;
	}
	i(e + 2);
	let l = [
		0,
		0,
		0
	], u = [
		0,
		0,
		1
	], d = [.5, .5], f = [];
	for (let t = 0; t <= e; t++) {
		let n = a(t / e);
		l.push(Math.cos(n), Math.sin(n), 0), u.push(0, 0, 1), d.push(.5 + .5 * Math.cos(n), .5 + .5 * Math.sin(n));
	}
	for (let t = 0; t < e; t++) f.push(0, t + 1, t + 2);
	return {
		...o(l, u, f),
		uvs: new Float32Array(d)
	};
}
function p(t = .08, c = 96, l = 24, u = e, d = 0) {
	if (r(t, "tubeRadius"), r(u, "arc"), r(d, "start"), Math.fround(t) <= 0 || Math.fround(u) <= 0 || u > e) throw RangeError("tubeRadius must remain positive at Float32 precision and arc must be within (0, 2PI].");
	n(c, 3, 2048, "segments"), n(l, 3, 128, "sides"), i((c + 1) * (l + 1) + (u === e ? 0 : 2 * (l + 2))), d %= e;
	let f = s(c, l, (n, r) => {
		let i = d + (u === e && n === 1 ? 0 : n * u), o = a(r), s = 1 + t * Math.cos(o);
		return {
			position: [
				s * Math.cos(i),
				s * Math.sin(i),
				t * Math.sin(o)
			],
			normal: [
				Math.cos(i) * Math.cos(o),
				Math.sin(i) * Math.cos(o),
				Math.sin(o)
			]
		};
	});
	if (u === e) return f;
	let p = [...f.positions], m = [...f.normals], h = [...f.indices], g = [...f.uvs];
	for (let e of [0, 1]) {
		let n = d + u * e, r = e === 0 ? -1 : 1, i = [
			-Math.sin(n) * r,
			Math.cos(n) * r,
			0
		], o = p.length / 3;
		p.push(Math.cos(n), Math.sin(n), 0), m.push(...i), g.push(.5, .5);
		for (let e = 0; e <= l; e++) {
			let r = a(e / l), o = 1 + t * Math.cos(r);
			p.push(o * Math.cos(n), o * Math.sin(n), t * Math.sin(r)), m.push(...i), g.push(.5 + Math.cos(r) * .5, .5 + Math.sin(r) * .5);
		}
		for (let t = 0; t < l; t++) {
			let n = o + t + 1;
			h.push(o, e === 0 ? n : n + 1, e === 0 ? n + 1 : n);
		}
	}
	return {
		...o(p, m, h),
		uvs: new Float32Array(g)
	};
}
function m(e = 80, t = .025, c = 6) {
	if (n(e, 3, 2048, "segments"), n(c, 1, 128, "bevelSegments"), r(t, "bevel"), t < 0 || t > .5 || t > 0 && Math.fround(t) === 0) throw RangeError("Cylinder bevel must be within zero and 0.5 without Float32 underflow.");
	i((e + 1) * 2 * (c + 1) + 2 * (e + 2));
	let l = [];
	for (let e = 0; e <= c; e++) {
		let n = -Math.PI / 2 + e / c * Math.PI / 2;
		l.push({
			radius: 1 - t + t * Math.cos(n),
			height: -.5 + t + t * Math.sin(n),
			radialNormal: Math.cos(n),
			verticalNormal: Math.sin(n)
		});
	}
	for (let e = 0; e <= c; e++) {
		let n = e / c * Math.PI / 2;
		l.push({
			radius: 1 - t + t * Math.cos(n),
			height: .5 - t + t * Math.sin(n),
			radialNormal: Math.cos(n),
			verticalNormal: Math.sin(n)
		});
	}
	let u = s(e, l.length - 1, (e, t) => {
		let n = a(e), r = l[Math.round(t * (l.length - 1))];
		return {
			position: [
				r.radius * Math.cos(n),
				r.height,
				r.radius * Math.sin(n)
			],
			normal: [
				r.radialNormal * Math.cos(n),
				r.verticalNormal,
				r.radialNormal * Math.sin(n)
			]
		};
	}), d = [...u.positions], f = [...u.normals], p = [...u.indices];
	for (let n of [-1, 1]) {
		let r = d.length / 3;
		d.push(0, n * .5, 0), f.push(0, n, 0);
		for (let r = 0; r <= e; r++) {
			let i = a(r / e);
			d.push((1 - t) * Math.cos(i), n * .5, (1 - t) * Math.sin(i)), f.push(0, n, 0);
		}
		for (let t = 0; t < e; t++) {
			let e = r + t + 1;
			p.push(r, n > 0 ? e + 1 : e, n > 0 ? e : e + 1);
		}
	}
	return o(d, f, p);
}
function h(e = .08, t = 6) {
	if (r(e, "bevel"), e < 0 || e > .5 || e > 0 && Math.fround(e) === 0) throw RangeError("Box bevel must be within zero and 0.5 without Float32 underflow.");
	n(t, 1, 128, "subdivisions"), i(e === 0 ? 24 : 6 * (2 * t + 2) ** 2);
	let a = [], c = [], l = [], u = .5 - e, d = [];
	if (e === 0) d.push(-.5, .5);
	else {
		for (let n = 0; n <= t; n++) {
			let r = (1 - n / t) * Math.PI / 4;
			d.push(-u - e * Math.tan(r));
		}
		d.push(u);
		for (let n = 1; n <= t; n++) {
			let r = n / t * Math.PI / 4;
			d.push(u + e * Math.tan(r));
		}
	}
	let f = d.length - 1;
	for (let t = 0; t < 6; t++) {
		let n = Math.floor(t / 2), r = t % 2 == 0 ? -1 : 1, i = s(f, f, (t, i) => {
			let a = [
				0,
				0,
				0
			];
			if (a[n] = r * .5, a[(n + 1) % 3] = d[Math.round(t * f)], a[(n + 2) % 3] = d[Math.round(i * f)], e === 0) {
				let e = [
					0,
					0,
					0
				];
				return e[n] = r, {
					position: a,
					normal: e
				};
			}
			let o = a.map((t) => Math.max(-.5 + e, Math.min(.5 - e, t))), s = a.map((e, t) => e - o[t]), c = Math.hypot(...s), l = s.map((e) => e / c);
			return {
				position: o.map((t, n) => t + l[n] * e),
				normal: l
			};
		}), o = a.length / 3;
		a.push(...i.positions), c.push(...i.normals), l.push(...Array.from(i.indices, (e) => e + o));
	}
	return o(a, c, l);
}
export { l as a, p as c, m as i, f as n, d as o, u as r, c as s, h as t };
