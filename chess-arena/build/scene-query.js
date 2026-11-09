/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { createMeshQueryIndex as e } from "./mesh-query.js";
// src/scene-query.js
var t = Object.freeze({
	maxTriangles: 1e6,
	maxVertices: 1e6,
	memoryBudgetMiB: 256
}), n = Object.freeze({
	cellSize: 1,
	topY: 100,
	probeHeight: .3,
	clearanceCap: 99,
	maxCells: 65536
}), r = /* @__PURE__ */ new Set([
	"min",
	"max",
	"cellSize",
	"topY",
	"probeHeight",
	"clearanceCap",
	"maxCells",
	"lowerPass",
	"obstacles"
]), i = /* @__PURE__ */ new Set([
	"fromY",
	"maxDistance",
	"groundBelow",
	"minHeadroom"
]), a = Object.freeze({
	reach: 2.6,
	minHeight: .3,
	maxDrop: 6,
	maxLayers: 8
}), o = /* @__PURE__ */ new Set([
	"streetY",
	"fromY",
	"reach",
	"minHeight"
]), s = 1024, c = .75;
function l(e, t) {
	if (!Number.isFinite(e)) throw TypeError(`${t} requires a finite number.`);
	return e;
}
function u(e) {
	let t = [
		Infinity,
		Infinity,
		Infinity,
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let n = 0; n < e.length; n += 3) for (let r = 0; r < 3; r++) t[r] = Math.min(t[r], e[n + r]), t[3 + r] = Math.max(t[3 + r], e[n + r]);
	return t;
}
function d(e, t) {
	let n = [
		Infinity,
		Infinity,
		Infinity,
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = 0; r < 8; r++) {
		let i = r & 1 ? e[3] : e[0], a = r & 2 ? e[4] : e[1], o = r & 4 ? e[5] : e[2], s = [
			t[0] * i + t[4] * a + t[8] * o + t[12],
			t[1] * i + t[5] * a + t[9] * o + t[13],
			t[2] * i + t[6] * a + t[10] * o + t[14]
		];
		for (let e = 0; e < 3; e++) n[e] = Math.min(n[e], s[e]), n[3 + e] = Math.max(n[3 + e], s[e]);
	}
	return n;
}
function f(e, t, n, r) {
	let i = 0, a = r;
	for (let r = 0; r < 3; r++) {
		if (t[r] === 0) {
			if (e[r] < n[r] || e[r] > n[3 + r]) return Infinity;
			continue;
		}
		let o = (n[r] - e[r]) / t[r], s = (n[3 + r] - e[r]) / t[r];
		if (i = Math.max(i, Math.min(o, s)), a = Math.min(a, Math.max(o, s)), i > a) return Infinity;
	}
	return i;
}
function p(e, t, n) {
	let { positions: r, indices: i } = e, a = Math.max(n[3] - n[0], n[4] - n[1], n[5] - n[2]), o = (e) => Math.hypot(t[e], t[e + 1], t[e + 2]), s = Math.max((o(0) + o(4) + o(8)) / 3, 1e-12), c = Math.max(a * 1e-6, 2 ** -19 * Math.max(...n.map(Math.abs)) / s), l = [];
	for (let e = 0; e < i.length; e += 3) {
		let t = i[e] * 3, n = i[e + 1] * 3, a = i[e + 2] * 3, o = [
			0,
			1,
			2
		].map((e) => r[n + e] - r[t + e]), s = [
			0,
			1,
			2
		].map((e) => r[a + e] - r[t + e]), u = [
			0,
			1,
			2
		].map((e) => o[e] - s[e]), d = Math.hypot(o[1] * s[2] - o[2] * s[1], o[2] * s[0] - o[0] * s[2], o[0] * s[1] - o[1] * s[0]), f = Math.max(Math.hypot(...o), Math.hypot(...s), Math.hypot(...u));
		f > 0 && d / f > c && l.push(i[e], i[e + 1], i[e + 2]);
	}
	return l.length === i.length ? {
		geometry: e,
		dropped: 0
	} : {
		geometry: {
			positions: r,
			indices: Uint32Array.from(l)
		},
		dropped: (i.length - l.length) / 3
	};
}
function m(e, t, n, r) {
	let i = [
		0,
		1,
		2
	].map((r) => {
		let i = e.indices[t * 3 + r] * 3, a = e.positions[i], o = e.positions[i + 1], s = e.positions[i + 2];
		return [
			n[0] * a + n[4] * o + n[8] * s + n[12],
			n[1] * a + n[5] * o + n[9] * s + n[13],
			n[2] * a + n[6] * o + n[10] * s + n[14]
		];
	}), a = i[1].map((e, t) => e - i[0][t]), o = i[2].map((e, t) => e - i[0][t]), s = [
		a[1] * o[2] - a[2] * o[1],
		a[2] * o[0] - a[0] * o[2],
		a[0] * o[1] - a[1] * o[0]
	], c = Math.hypot(...s) || 1, l = s[0] * r[0] + s[1] * r[1] + s[2] * r[2] > 0 ? -1 : 1;
	return s.map((e) => e / c * l);
}
function h(e, t) {
	let { columns: n, rows: r, cellSize: i } = e, a = Math.max(1, Math.ceil(Math.sqrt(n * r / s))), o = Infinity;
	for (let s = 0; s < n; s += a) for (let n = 0; n < r; n += a) {
		let r = t(e.min[0] + s * i, e.min[1] + n * i);
		r && (o = Math.min(o, r.point[1]));
	}
	if (o === Infinity) throw RangeError("walkMap obstacles found no surface to take the street level from. Pass obstacles.streetY.");
	return o;
}
function g(e) {
	if (!e || typeof e != "object") throw TypeError("walkMap requires an options object.");
	for (let t of Object.keys(e)) if (!r.has(t)) throw TypeError(`Unsupported walkMap option ${t}.`);
	let t = Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0)), s = {
		...n,
		...t
	};
	for (let e of ["min", "max"]) {
		if (!Array.isArray(s[e]) || s[e].length !== 2) throw TypeError(`walkMap ${e} requires [x, z].`);
		s[e].forEach((t, n) => l(t, `walkMap ${e}[${n}]`));
	}
	for (let e of [
		"cellSize",
		"topY",
		"probeHeight",
		"clearanceCap",
		"maxCells"
	]) l(s[e], `walkMap ${e}`);
	if (s.cellSize <= 0 || s.probeHeight <= 0) throw RangeError("walkMap cellSize and probeHeight must be positive.");
	if (s.max[0] < s.min[0] || s.max[1] < s.min[1]) throw RangeError("walkMap max must not be below min.");
	if (s.lowerPass !== void 0) {
		for (let e of Object.keys(s.lowerPass)) if (!i.has(e)) throw TypeError(`Unsupported walkMap lowerPass option ${e}.`);
		s.lowerPass = {
			maxDistance: 4,
			minHeadroom: 2.4,
			...s.lowerPass
		};
		for (let e of ["fromY", "groundBelow"]) l(s.lowerPass[e], `walkMap lowerPass.${e}`);
	}
	if (s.obstacles !== void 0) {
		let e = s.obstacles === !0 ? {} : s.obstacles;
		if (!e || typeof e != "object") throw TypeError("walkMap obstacles requires true or an options object.");
		for (let t of Object.keys(e)) {
			if (!o.has(t)) throw TypeError(`Unsupported walkMap obstacles option ${t}.`);
			l(e[t], `walkMap obstacles.${t}`);
		}
		if (s.obstacles = {
			...a,
			...e
		}, s.obstacles.minHeight <= 0 || s.obstacles.reach <= 0) throw RangeError("walkMap obstacles minHeight and reach must be positive.");
	}
	if (s.columns = Math.floor((s.max[0] - s.min[0]) / s.cellSize + 1e-9) + 1, s.rows = Math.floor((s.max[1] - s.min[1]) / s.cellSize + 1e-9) + 1, s.columns * s.rows > s.maxCells) throw RangeError(`walkMap region holds ${s.columns * s.rows} cells, above maxCells ${s.maxCells}. Use a larger cellSize or a smaller region.`);
	return s;
}
function _(n, r = {}) {
	if (!Array.isArray(n)) throw TypeError("createSceneQuery requires an array of parts.");
	let i = {
		...t,
		...r
	}, a = n.map((e, t) => ({
		part: e,
		position: t,
		id: e.id ?? e.name ?? `part-${t}`,
		index: null,
		failed: null,
		bounds: d(u(e.geometry.positions), e.matrix)
	})), o = [], s = !1, c = 0;
	function l(t) {
		if (t.failed) return null;
		if (!t.index) try {
			let n = p(t.part.geometry, t.part.matrix, t.bounds);
			t.index = e(n.geometry, i), t.surface = n.geometry, c += n.dropped;
		} catch (e) {
			return t.failed = e.message, o.push({
				id: t.id,
				reason: e.message
			}), null;
		}
		return t.index;
	}
	function _(e) {
		if (s) throw Error("Scene query was disposed. Create a new one.");
		let t = Array.from(e.direction), n = Math.hypot(...t);
		if (!(n > 0)) throw RangeError("Ray direction must be nonzero.");
		let r = t.map((e) => e / n), i = Array.from(e.origin), o = e.maxDistance ?? Infinity, c = [];
		for (let e of a) {
			let t = f(i, r, e.bounds, o);
			t !== Infinity && c.push({
				entry: e,
				enter: t
			});
		}
		c.sort((e, t) => e.enter - t.enter);
		let u = null;
		for (let { entry: e, enter: t } of c) {
			if (u && t > u.distance) break;
			let n = l(e);
			if (!n) continue;
			let a = n.raycast(e.part.matrix, {
				origin: i,
				direction: r,
				maxDistance: o
			});
			a && (!u || a.distance < u.distance) && (u = {
				...a,
				entry: e
			});
		}
		return u ? {
			point: u.point,
			distance: u.distance,
			id: u.entry.id,
			partIndex: u.entry.position,
			material: u.entry.part.material ?? null,
			triangle: u.triangle,
			normal: m(u.entry.surface, u.triangle, u.entry.part.matrix, r)
		} : null;
	}
	function v(e) {
		let t = g(e), { cellSize: n, columns: r, rows: i, topY: a, probeHeight: o, clearanceCap: s, lowerPass: c } = t, l = [
			0,
			-1,
			0
		], u = [
			0,
			1,
			0
		];
		function d(e, t, n) {
			let r = _({
				origin: [
					e,
					n + o,
					t
				],
				direction: u,
				maxDistance: a - n
			});
			return r ? Math.min(r.point[1] - n, s) : s;
		}
		let f = t.obstacles, p = f?.fromY;
		f && p === void 0 && (p = (f.streetY ?? h(t, (e, t) => _({
			origin: [
				e,
				a,
				t
			],
			direction: l
		}))) + f.reach);
		function m(e, t) {
			let n = _({
				origin: [
					e,
					p,
					t
				],
				direction: l
			});
			if (!n) return null;
			let r = n.point[1];
			for (let n = 0; n < f.maxLayers; n++) {
				let n = _({
					origin: [
						e,
						r - .01,
						t
					],
					direction: l,
					maxDistance: f.maxDrop
				});
				if (!n) break;
				r = n.point[1];
			}
			let i = n.point[1] - r > f.minHeight;
			return [
				e,
				t,
				r,
				d(e, t, r),
				+!!i
			];
		}
		let v = [];
		for (let e = 0; e < r; e++) for (let r = 0; r < i; r++) {
			let i = t.min[0] + e * n, o = t.min[1] + r * n;
			if (f) {
				let e = m(i, o);
				e && v.push(e);
				continue;
			}
			let s = _({
				origin: [
					i,
					a,
					o
				],
				direction: l
			});
			if (!s) continue;
			let u = s.point[1], p = d(i, o, u);
			if (c && u > c.groundBelow) {
				let e = _({
					origin: [
						i,
						c.fromY,
						o
					],
					direction: l,
					maxDistance: c.maxDistance
				});
				if (e && e.point[1] < c.groundBelow) {
					let t = d(i, o, e.point[1]);
					t > c.minHeadroom && (u = e.point[1], p = t);
				}
			}
			v.push([
				i,
				o,
				u,
				p
			]);
		}
		return {
			cellSize: n,
			min: t.min,
			columns: r,
			rows: i,
			cells: v
		};
	}
	return Object.freeze({
		raycast: _,
		walkMap: v,
		get skipped() {
			return o.slice();
		},
		get info() {
			return {
				parts: a.length,
				indexed: a.filter((e) => e.index).length,
				droppedTriangles: c
			};
		},
		dispose() {
			s = !0;
			for (let e of a) e.index?.dispose();
		}
	});
}
function v(e, { clearance: t = 2, groundRange: n, keepOut: r = 0 } = {}) {
	let { columns: i, rows: a, cellSize: o, min: s } = e, l = i * a, u = new Uint8Array(l), d = new Uint8Array(l);
	for (let [r, i, c, l, f] of e.cells) {
		let e = Math.round((r - s[0]) / o) * a + Math.round((i - s[1]) / o), p = !n || c >= n[0] && c <= n[1];
		f ? d[e] = 1 : l >= t && p && (u[e] = 1);
	}
	if (!(r > 0)) return u;
	let f = Math.max(1, Math.round(c / o)), p = u;
	for (let e = 0; e < f; e++) p = y(p, i, a, 1);
	for (let e = 0; e < f; e++) p = y(p, i, a, 0);
	for (let e = 0; e < l; e++) d[e] && (p[e] = 0);
	return p = y(y(p, i, a, 0), i, a, 1), b(p, i, a, r / o);
}
function y(e, t, n, r) {
	let i = Uint8Array.from(e);
	for (let a = 0; a < t; a++) for (let o = 0; o < n; o++) {
		let s = a * n + o;
		e[s] !== r && (a > 0 && e[s - n] === r || a < t - 1 && e[s + n] === r || o > 0 && e[s - 1] === r || o < n - 1 && e[s + 1] === r) && (i[s] = r);
	}
	return i;
}
function b(e, t, n, r) {
	let i = Math.ceil(r), a = [];
	for (let e = -i; e <= i; e++) for (let t = -i; t <= i; t++) e * e + t * t < r * r && a.push([e, t]);
	let o = Uint8Array.from(e);
	for (let r = 0; r < t; r++) for (let i = 0; i < n; i++) if (!e[r * n + i] && (r > 0 && e[(r - 1) * n + i] || r < t - 1 && e[(r + 1) * n + i] || i > 0 && e[r * n + i - 1] || i < n - 1 && e[r * n + i + 1])) for (let [e, s] of a) {
		let a = r + e, c = i + s;
		a >= 0 && a < t && c >= 0 && c < n && (o[a * n + c] = 0);
	}
	return o;
}
export { _ as createSceneQuery, v as walkableMask };
