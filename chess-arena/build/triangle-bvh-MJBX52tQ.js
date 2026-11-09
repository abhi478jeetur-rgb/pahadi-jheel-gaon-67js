/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
function e(e, t) {
	let n = t.length / 3, r = new Float64Array(n * 6), i = new Float64Array(n * 3);
	for (let a = 0; a < n; a++) for (let n = 0; n < 3; n++) {
		let o = e[t[a * 3] * 3 + n], s = e[t[a * 3 + 1] * 3 + n], c = e[t[a * 3 + 2] * 3 + n], l = Math.min(o, s, c), u = Math.max(o, s, c);
		r[a * 6 + n] = l, r[a * 6 + 3 + n] = u, i[a * 3 + n] = (l + u) / 2;
	}
	return {
		bounds: r,
		centroids: i
	};
}
function t(e, t, n, r, i, a) {
	for (let e = 0; e < 3; e++) i[a + e] = Infinity, i[a + 3 + e] = -Infinity;
	for (let o = n; o < r; o++) {
		let n = t[o] * 6;
		for (let t = 0; t < 3; t++) i[a + t] = Math.min(i[a + t], e[n + t]), i[a + 3 + t] = Math.max(i[a + 3 + t], e[n + 3 + t]);
	}
}
function n(e, t) {
	let n = e[t + 3] - e[t], r = e[t + 4] - e[t + 1], i = e[t + 5] - e[t + 2];
	return n < 0 ? 0 : 2 * (n * r + r * i + i * n);
}
function r(e, t, n, r) {
	let i = [
		Infinity,
		Infinity,
		Infinity
	], a = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let o = n; o < r; o++) for (let n = 0; n < 3; n++) i[n] = Math.min(i[n], e[t[o] * 3 + n]), a[n] = Math.max(a[n], e[t[o] * 3 + n]);
	let o = a.map((e, t) => e - i[t]), s = o.indexOf(Math.max(...o));
	return {
		axis: s,
		low: i[s],
		extent: o[s]
	};
}
function i(e, n, r, i, o, s) {
	let c = /* @__PURE__ */ new Uint32Array(16), l = /* @__PURE__ */ new Float64Array(96);
	for (let n = 0; n < 16; n++) t(e, r, 0, 0, l, n * 6);
	let u = 16 / s.extent;
	for (let t = i; t < o; t++) {
		let i = r[t], a = Math.min(15, Math.floor((n[i * 3 + s.axis] - s.low) * u));
		c[a]++;
		for (let t = 0; t < 3; t++) l[a * 6 + t] = Math.min(l[a * 6 + t], e[i * 6 + t]), l[a * 6 + 3 + t] = Math.max(l[a * 6 + 3 + t], e[i * 6 + 3 + t]);
	}
	let d = a(c, l, 0, 1), f = a(c, l, 15, -1), p = -1, m = Infinity, h = 0;
	for (let e = 0; e < 15; e++) {
		if (h += c[e], h === 0 || h === o - i) continue;
		let t = d[e] + f[e + 1];
		t < m && (m = t, p = e);
	}
	return p;
}
function a(e, r, i, a) {
	let o = /* @__PURE__ */ new Float64Array(16), s = /* @__PURE__ */ new Float64Array(6);
	t(r, [], 0, 0, s, 0);
	let c = 0;
	for (let t = i; t >= 0 && t < 16; t += a) {
		c += e[t];
		for (let e = 0; e < 3; e++) s[e] = Math.min(s[e], r[t * 6 + e]), s[3 + e] = Math.max(s[3 + e], r[t * 6 + 3 + e]);
		o[t] = c * n(s, 0);
	}
	return o;
}
function o(e, t, n, r, i, a) {
	let o = n, s = r - 1;
	for (; o <= s;) if (a(t[e[o] * 3 + i])) o++;
	else {
		let t = e[o];
		e[o] = e[s], e[s] = t, s--;
	}
	return o;
}
function s(e, t, n, a, s) {
	let c = r(t, n, a, s);
	if (!(c.extent > 0)) return -1;
	let l = i(e, t, n, a, s, c), u = c.low + c.extent * (l + 1) / 16, d = l < 0 ? a : o(n, t, a, s, c.axis, (e) => e < u);
	if (d === a || d === s) {
		let e = c.low + c.extent / 2;
		d = o(n, t, a, s, c.axis, (t) => t < e);
	}
	return d === a || d === s ? -1 : d;
}
function c(n, r, { leafSize: i = 8, maxDepth: a = 64 } = {}) {
	let o = r.length / 3, { bounds: c, centroids: l } = e(n, r), u = Uint32Array.from({ length: o }, (e, t) => t), d = Math.max(1, o * 2), f = new Float64Array(d * 6), p = new Int32Array(d).fill(-1), m = new Uint32Array(d), h = new Uint32Array(d), g = 0, _ = [{
		start: 0,
		end: o,
		depth: 0,
		parent: -1
	}];
	for (; _.length;) {
		let { start: e, end: n, depth: r, parent: o } = _.pop(), d = g++;
		o >= 0 && (p[o] = d), t(c, u, e, n, f, d * 6), m[d] = e, h[d] = n - e;
		let v = n - e <= i || r >= a ? -1 : s(c, l, u, e, n);
		v < 0 || (_.push({
			start: v,
			end: n,
			depth: r + 1,
			parent: d
		}), _.push({
			start: e,
			end: v,
			depth: r + 1,
			parent: -1
		}));
	}
	return {
		positions: n,
		indices: r,
		triangleOrder: u,
		nodeBounds: f,
		rightChild: p,
		rangeStart: m,
		rangeCount: h,
		nodeCount: g
	};
}
function l(e, t, n, r) {
	let i = [0], a = [0];
	for (; i.length;) {
		let o = i.pop();
		if (!n(a.pop())) continue;
		let s = e.rightChild[o];
		if (s < 0) {
			let t = e.rangeStart[o] + e.rangeCount[o];
			for (let n = e.rangeStart[o]; n < t; n++) if (r(e.triangleOrder[n])) return !0;
			continue;
		}
		let c = o + 1, l = t(e.nodeBounds, c * 6), u = t(e.nodeBounds, s * 6), d = l <= u;
		i.push(d ? s : c), a.push(d ? u : l), i.push(d ? c : s), a.push(d ? l : u);
	}
	return !1;
}
function u(e, t, n) {
	let r = 0;
	for (let i = 0; i < 3; i++) {
		let a = Math.max(t[n + i] - e[i], 0, e[i] - t[n + 3 + i]);
		r += a * a;
	}
	return Math.sqrt(r);
}
function d(e, t, n, r) {
	let i = 0, a = Infinity;
	for (let o = 0; o < 3; o++) {
		let s = n[r + o] - e[o], c = n[r + 3 + o] - e[o];
		if (t[o] === 0) {
			if (s > 0 || c < 0) return Infinity;
			continue;
		}
		let l = s / t[o], u = c / t[o];
		i = Math.max(i, Math.min(l, u)), a = Math.min(a, Math.max(l, u));
	}
	return i <= a * (1 + 1e-12) + 1e-12 ? i : Infinity;
}
function f(e, t, n, r) {
	let { nodeCount: i, rightChild: a, rangeStart: o, rangeCount: s, triangleOrder: c, indices: l } = t;
	for (let e = i - 1; e >= 0; e--) {
		let t = e * 6;
		if (a[e] >= 0) {
			let n = [e + 1, a[e]];
			for (let e = 0; e < 3; e++) r[t + e] = Math.min(r[n[0] * 6 + e], r[n[1] * 6 + e]), r[t + 3 + e] = Math.max(r[n[0] * 6 + 3 + e], r[n[1] * 6 + 3 + e]);
		} else {
			for (let e = 0; e < 3; e++) r[t + e] = Infinity, r[t + 3 + e] = -Infinity;
			for (let i = o[e]; i < o[e] + s[e]; i++) for (let e = 0; e < 3; e++) {
				let a = l[c[i] * 3 + e] * 3;
				for (let e = 0; e < 3; e++) r[t + e] = Math.min(r[t + e], n[a + e]), r[t + 3 + e] = Math.max(r[t + 3 + e], n[a + e]);
			}
		}
	}
	return r;
}
function p(e, t, n, r) {
	for (let i = 0; i < 3; i++) if (e[t + i] > n[r + 3 + i] || n[r + i] > e[t + 3 + i]) return !1;
	return !0;
}
function m(e, t) {
	return Math.max(e[t + 3] - e[t], e[t + 4] - e[t + 1], e[t + 5] - e[t + 2]);
}
function h(e, t, n, r) {
	let i = f(e, t, n, new Float64Array(t.nodeCount * 6)), a = [[0, 0]];
	for (; a.length;) {
		let [n, o] = a.pop();
		if (!p(e.nodeBounds, n * 6, i, o * 6)) continue;
		let s = e.rightChild[n] < 0, c = t.rightChild[o] < 0;
		if (s && c) {
			if (g(e, t, n, o, r)) return !0;
		} else c || !s && m(e.nodeBounds, n * 6) >= m(i, o * 6) ? a.push([e.rightChild[n], o], [n + 1, o]) : a.push([n, t.rightChild[o]], [n, o + 1]);
	}
	return !1;
}
function g(e, t, n, r, i) {
	for (let a = e.rangeStart[n]; a < e.rangeStart[n] + e.rangeCount[n]; a++) for (let n = t.rangeStart[r]; n < t.rangeStart[r] + t.rangeCount[r]; n++) if (i(e.triangleOrder[a], t.triangleOrder[n])) return !0;
	return !1;
}
export { l as a, h as i, u as n, d as r, c as t };
