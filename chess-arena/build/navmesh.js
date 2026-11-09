/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/navmesh.js
var e = Object.freeze({
	maximumCells: 25e4,
	maximumSearchNodes: 2e5,
	maximumObstacles: 64,
	maximumPathPoints: 200,
	defaultAgentRadius: .3,
	defaultSlopeDegrees: 40
}), t = -Infinity, n = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
	[1, 1],
	[1, -1],
	[-1, 1],
	[-1, -1]
], r = 4;
function i(e, t, n) {
	let r = e ?? t;
	if (!Number.isFinite(r) || r <= 0) throw RangeError(`navmesh ${n} must be a positive number.`);
	return r;
}
function a(e, t) {
	if (!Array.isArray(e) || e.length !== 2 || !e.every(Number.isFinite)) throw RangeError(`navmesh ${t} must be [x, z] in metres.`);
	return e;
}
function o(e) {
	let t = Infinity, n = Infinity, r = -Infinity, i = -Infinity;
	for (let a = 0; a < e.length; a += 3) t = Math.min(t, e[a]), r = Math.max(r, e[a]), n = Math.min(n, e[a + 2]), i = Math.max(i, e[a + 2]);
	return {
		minimumX: t,
		minimumZ: n,
		maximumX: r,
		maximumZ: i
	};
}
function s() {
	let e = [], t = [];
	function n(n, r) {
		return e[n] < e[r] || e[n] === e[r] && t[n] < t[r];
	}
	function r(n, r) {
		[e[n], e[r]] = [e[r], e[n]], [t[n], t[r]] = [t[r], t[n]];
	}
	return {
		get size() {
			return t.length;
		},
		push(i, a) {
			e.push(a), t.push(i);
			let o = t.length - 1;
			for (; o > 0;) {
				let e = o - 1 >> 1;
				if (!n(o, e)) break;
				r(o, e), o = e;
			}
		},
		pop() {
			let i = t[0], a = e.pop(), o = t.pop();
			if (t.length > 0) {
				e[0] = a, t[0] = o;
				let i = 0;
				for (;;) {
					let e = i * 2 + 1, a = e + 1, o = i;
					if (e < t.length && n(e, o) && (o = e), a < t.length && n(a, o) && (o = a), o === i) break;
					r(i, o), i = o;
				}
			}
			return i;
		}
	};
}
function c({ positions: c, indices: f, agentRadius: p, maxSlopeDegrees: m, cellSize: h, obstacles: g = [], maxCells: _ } = {}) {
	if (!(c?.length >= 9) || !(f?.length >= 3)) throw RangeError("navmesh needs positions and indices with at least one triangle.");
	let v = i(p, e.defaultAgentRadius, "agentRadius"), y = i(m, e.defaultSlopeDegrees, "maxSlopeDegrees");
	if (y >= 90) throw RangeError("navmesh maxSlopeDegrees must stay below 90.");
	let b = i(h, Math.max(v, .05), "cellSize"), x = i(_, e.maximumCells, "maxCells");
	if (!Array.isArray(g) || g.length > e.maximumObstacles) throw RangeError(`navmesh obstacles must be a list of at most ${e.maximumObstacles} footprints.`);
	let S = o(c), C = Math.max(1, Math.ceil((S.maximumX - S.minimumX) / b)), w = Math.max(1, Math.ceil((S.maximumZ - S.minimumZ) / b));
	if (C * w > x) {
		let e = Math.sqrt((S.maximumX - S.minimumX) * (S.maximumZ - S.minimumZ) / x);
		throw RangeError(`navmesh needs ${C * w} cells at cellSize ${b} m, over the budget of ${x}. Raise cellSize to at least ${Math.ceil(e * 100) / 100} m or use a smaller ground.`);
	}
	let T = Math.tan(y * Math.PI / 180), E = new Float32Array(C * w).fill(t);
	l(c, f, S, b, C, w, E);
	let D = new Uint8Array(C * w);
	for (let e = 0; e < D.length; e++) E[e] === t && (D[e] = 1);
	for (let e of g) u(e, S, b, C, w, D);
	let O = d(D, C, w, Math.ceil(v / b), v / b), k = O.reduce((e, t) => e + t, 0);
	function A(e, t) {
		let n = Math.floor((e - S.minimumX) / b), r = Math.floor((t - S.minimumZ) / b);
		return n < 0 || r < 0 || n >= C || r >= w ? -1 : r * C + n;
	}
	function j(e) {
		return [S.minimumX + (e % C + .5) * b, S.minimumZ + (Math.floor(e / C) + .5) * b];
	}
	function M(e, t) {
		let n = A(e, t);
		return n >= 0 && O[n] === 1;
	}
	function N(e, n) {
		let r = (e - S.minimumX) / b - .5, i = (n - S.minimumZ) / b - .5, a = Math.floor(r), o = Math.floor(i), s = 0, c = 0;
		for (let e = 0; e <= 1; e++) for (let n = 0; n <= 1; n++) {
			let l = a + n, u = o + e;
			if (l < 0 || u < 0 || l >= C || u >= w) continue;
			let d = E[u * C + l];
			if (d === t) continue;
			let f = (n === 0 ? 1 - (r - a) : r - a) * (e === 0 ? 1 - (i - o) : i - o);
			s += d * f, c += f;
		}
		if (c > 0) return s / c;
		let l = A(e, n);
		return l >= 0 && E[l] !== t ? E[l] : null;
	}
	function P(e, t, n) {
		return O[t] === 1 && Math.abs(E[t] - E[e]) <= T * n;
	}
	function F(e, t) {
		let n = Math.hypot(t[0] - e[0], t[1] - e[1]), i = Math.max(1, Math.ceil(n / b * r)), a = A(e[0], e[1]);
		for (let n = 1; n <= i; n++) {
			let r = n / i, o = A(e[0] + (t[0] - e[0]) * r, e[1] + (t[1] - e[1]) * r);
			if (o < 0 || O[o] === 0) return !1;
			if (o !== a) {
				let [e, t] = j(a), [n, r] = j(o);
				if (!P(a, o, Math.hypot(n - e, r - t))) return !1;
				a = o;
			}
		}
		return !0;
	}
	function I(e, n, r) {
		let i = A(e, n);
		return i < 0 ? `${r} [${e}, ${n}] is outside the ground.` : E[i] === t ? `${r} [${e}, ${n}] has no ground under it (a hole).` : `${r} [${e}, ${n}] is not walkable: it is on an obstacle or a steep slope, or within the agent radius ${v} m of a hole or an obstacle.`;
	}
	function L(t, n, { spacing: r, maxSearchNodes: o } = {}) {
		a(t, "from"), a(n, "to");
		let s = i(o, e.maximumSearchNodes, "maxSearchNodes"), c = A(t[0], t[1]), l = A(n[0], n[1]);
		if (c < 0 || O[c] === 0) throw RangeError(I(t[0], t[1], "Start"));
		if (l < 0 || O[l] === 0) throw RangeError(I(n[0], n[1], "Goal"));
		let u = R(c, l, s), d = B([
			t,
			...u.cells.slice(1, -1).map(j),
			n
		]), f = V(d, i(r, Math.max(1.5, b * 2), "spacing")), p = 0;
		for (let e = 1; e < d.length; e++) p += Math.hypot(d[e][0] - d[e - 1][0], d[e][1] - d[e - 1][1]);
		return {
			points: f,
			length: p,
			searchNodes: u.searchNodes
		};
	}
	function R(e, t, r) {
		let [i, a] = j(t), o = new Float32Array(C * w).fill(Infinity), c = new Int32Array(C * w).fill(-1), l = new Uint8Array(C * w), u = s(), d = (e) => {
			let [t, n] = j(e);
			return Math.hypot(t - i, n - a);
		};
		o[e] = 0, u.push(e, d(e));
		let f = 0;
		for (; u.size > 0;) {
			let e = u.pop();
			if (l[e] === 1) continue;
			if (l[e] = 1, f++, e === t) return {
				cells: z(c, e),
				searchNodes: f
			};
			if (f > r) throw RangeError(`navmesh search used ${r} nodes without reaching the goal. Raise cellSize, or check that the goal is on the same side of the holes and obstacles.`);
			let i = e % C, a = Math.floor(e / C);
			for (let [t, r] of n) {
				let n = i + t, s = a + r;
				if (n < 0 || s < 0 || n >= C || s >= w) continue;
				let f = s * C + n, p = t !== 0 && r !== 0, m = p ? b * Math.SQRT2 : b;
				if (l[f] === 1 || !P(e, f, m) || p && (O[a * C + n] === 0 || O[s * C + i] === 0)) continue;
				let h = o[e] + Math.hypot(m, E[f] - E[e]);
				h < o[f] && (o[f] = h, c[f] = e, u.push(f, h + d(f)));
			}
		}
		throw RangeError("navmesh found no walkable route from start to goal: holes, obstacles or steep ground cut them apart.");
	}
	function z(e, t) {
		let n = [];
		for (let r = t; r !== -1; r = e[r]) n.push(r);
		return n.reverse();
	}
	function B(e) {
		let t = [e[0]], n = 0;
		for (; n < e.length - 1;) {
			let r = n + 1;
			for (let t = e.length - 1; t > n + 1; t--) if (F(e[n], e[t])) {
				r = t;
				break;
			}
			t.push(e[r]), n = r;
		}
		return t;
	}
	function V(t, n) {
		let r = 0;
		for (let e = 1; e < t.length; e++) r += Math.hypot(t[e][0] - t[e - 1][0], t[e][1] - t[e - 1][1]);
		let i = Math.max(n, r / (e.maximumPathPoints - t.length)), a = [], o = (e, t) => a.push([
			e,
			N(e, t) ?? E[A(e, t)],
			t
		]);
		o(t[0][0], t[0][1]);
		for (let e = 1; e < t.length; e++) {
			let [n, r] = t[e - 1], [a, s] = t[e], c = Math.hypot(a - n, s - r), l = Math.max(1, Math.round(c / i));
			for (let e = 1; e <= l; e++) {
				let t = e / l;
				o(n + (a - n) * t, r + (s - r) * t);
			}
		}
		return a;
	}
	return {
		cellSize: b,
		columns: C,
		rows: w,
		cellCount: C * w,
		walkableCellCount: k,
		agentRadius: v,
		isWalkable: M,
		heightAt: N,
		findPath: L
	};
}
function l(e, t, n, r, i, a, o) {
	for (let s = 0; s < t.length; s += 3) {
		let c = t[s] * 3, l = t[s + 1] * 3, u = t[s + 2] * 3, d = e[c], f = e[c + 2], p = (e[l + 2] - e[u + 2]) * (d - e[u]) + (e[u] - e[l]) * (f - e[u + 2]);
		if (Math.abs(p) < 1e-12) continue;
		let m = Math.max(0, Math.floor((Math.min(d, e[l], e[u]) - n.minimumX) / r - .5)), h = Math.min(i - 1, Math.ceil((Math.max(d, e[l], e[u]) - n.minimumX) / r)), g = Math.max(0, Math.floor((Math.min(f, e[l + 2], e[u + 2]) - n.minimumZ) / r - .5)), _ = Math.min(a - 1, Math.ceil((Math.max(f, e[l + 2], e[u + 2]) - n.minimumZ) / r));
		for (let t = g; t <= _; t++) for (let a = m; a <= h; a++) {
			let s = n.minimumX + (a + .5) * r, m = n.minimumZ + (t + .5) * r, h = ((e[l + 2] - e[u + 2]) * (s - e[u]) + (e[u] - e[l]) * (m - e[u + 2])) / p, g = ((e[u + 2] - f) * (s - e[u]) + (d - e[u]) * (m - e[u + 2])) / p, _ = 1 - h - g;
			if (h < -1e-9 || g < -1e-9 || _ < -1e-9) continue;
			let v = h * e[c + 1] + g * e[l + 1] + _ * e[u + 1], y = t * i + a;
			v > o[y] && (o[y] = v);
		}
	}
}
function u(e, t, n, r, i, o) {
	let s = a(e?.min, "obstacle min"), c = a(e?.max, "obstacle max"), l = Math.max(0, Math.floor((s[0] - t.minimumX) / n)), u = Math.min(r - 1, Math.floor((c[0] - t.minimumX) / n)), d = Math.max(0, Math.floor((s[1] - t.minimumZ) / n)), f = Math.min(i - 1, Math.floor((c[1] - t.minimumZ) / n));
	for (let e = d; e <= f; e++) for (let t = l; t <= u; t++) o[e * r + t] = 1;
}
function d(e, t, n, r, i) {
	let a = new Uint8Array(e.length).fill(1), o = Math.max(r, 1), s = Math.max(i, .75);
	for (let r = 0; r < n; r++) for (let i = 0; i < t; i++) if (e[r * t + i] !== 0) for (let e = -o; e <= o; e++) for (let c = -o; c <= o; c++) {
		if (Math.hypot(e, c) > s) continue;
		let o = r + e, l = i + c;
		o < 0 || l < 0 || o >= n || l >= t || (a[o * t + l] = 0);
	}
	return a;
}
export { e as NAVMESH_LIMITS, c as createNavmesh };
