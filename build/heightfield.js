/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/heightfield.js
function e(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function t({ count: t, coordinateAt: n, boxLow: r, boxHigh: i, pixels: a, reversed: o, cellSize: s, samplesPerSide: c }) {
	let l = new Int32Array(t), u = new Int32Array(t), d = new Int32Array(t), f = new Int32Array(c), p = new Float64Array(c), m = 1 / c, h = new Float64Array(t * (c + 1)), g = 0;
	for (let _ = 0; _ < t; _ += 1) {
		let t = n(_), v = a, y = 0;
		for (let n = 0; n < c; n += 1) {
			let l = t + ((n + .5) / c - .5) * s, u = (o ? (i - l) / (i - r) : (l - r) / (i - r)) * a - .5, d = e(Math.floor(u), 0, a - 2);
			f[n] = d, p[n] = e(u - d, 0, 1), v = Math.min(v, d), y = Math.max(y, d + 1);
		}
		let b = y - v + 1;
		if (g + b > h.length) {
			let e = new Float64Array(Math.max(h.length * 2, g + b));
			e.set(h), h = e;
		}
		l[_] = v, u[_] = b, d[_] = g;
		for (let e = 0; e < c; e += 1) {
			let t = g + f[e] - v;
			h[t] += (1 - p[e]) * m, h[t + 1] += p[e] * m;
		}
		g += b;
	}
	return {
		firstPixel: l,
		tapCount: u,
		tapOffset: d,
		weights: h
	};
}
function n(e, { columns: n, rows: r, eastAt: i, northAt: a, cellSize: o = 0, samplesPerSide: s = 1, scale: c = 1 }) {
	let { values: l, width: u, height: d, box: f } = e;
	if (u < 2 || d < 2) throw RangeError("A raster needs at least 2 by 2 pixels.");
	let p = t({
		count: n,
		coordinateAt: i,
		boxLow: f.x_min,
		boxHigh: f.x_max,
		pixels: u,
		reversed: !1,
		cellSize: o,
		samplesPerSide: s
	}), m = t({
		count: r,
		coordinateAt: a,
		boxLow: f.y_min,
		boxHigh: f.y_max,
		pixels: d,
		reversed: !0,
		cellSize: o,
		samplesPerSide: s
	}), h = d, g = 0;
	for (let e = 0; e < r; e += 1) h = Math.min(h, m.firstPixel[e]), g = Math.max(g, m.firstPixel[e] + m.tapCount[e] - 1);
	let _ = new Float64Array((g - h + 1) * n);
	for (let e = h; e <= g; e += 1) {
		let t = e * u, r = (e - h) * n;
		for (let e = 0; e < n; e += 1) {
			let n = p.tapOffset[e], i = t + p.firstPixel[e], a = 0;
			for (let t = 0, r = p.tapCount[e]; t < r; t += 1) a += p.weights[n + t] * l[i + t];
			_[r + e] = a;
		}
	}
	let v = new Float64Array(n * r);
	for (let e = 0; e < r; e += 1) {
		let t = m.tapOffset[e], r = e * n;
		for (let i = 0, a = m.tapCount[e]; i < a; i += 1) {
			let a = m.weights[t + i] * c, o = (m.firstPixel[e] + i - h) * n;
			for (let e = 0; e < n; e += 1) v[r + e] += a * _[o + e];
		}
	}
	return v;
}
function r(e, t, n) {
	let r = new Float32Array(e.length);
	for (let i = 0; i < n; i += 1) {
		let a = Math.max(0, i - 1) * t, o = Math.min(n - 1, i + 1) * t;
		for (let n = 0; n < t; n += 1) {
			let s = i * t + n, c = i * t + Math.max(0, n - 1), l = i * t + Math.min(t - 1, n + 1), u = a + n, d = o + n, f = -(e[l * 3 + 1] - e[c * 3 + 1]) / (e[l * 3] - e[c * 3]), p = -(e[d * 3 + 1] - e[u * 3 + 1]) / (e[d * 3 + 2] - e[u * 3 + 2]), m = Math.hypot(f, 1, p);
			r[s * 3] = f / m, r[s * 3 + 1] = 1 / m, r[s * 3 + 2] = p / m;
		}
	}
	return r;
}
function i({ columns: e, rows: t, eastAt: n, northAt: i, heights: a, uvBox: o, keepCell: s }) {
	if (a.length !== e * t) throw RangeError("heights must hold columns * rows values.");
	let c = new Float32Array(e * t * 3), l = new Float32Array(e * t * 2), u = o.x_max - o.x_min, d = o.y_max - o.y_min, f = new Float64Array(e);
	for (let t = 0; t < e; t += 1) f[t] = n(t);
	for (let n = 0; n < t; n += 1) {
		let t = i(n), r = (o.y_max - t) / d;
		for (let i = 0; i < e; i += 1) {
			let s = f[i], d = n * e + i;
			c[d * 3] = s, c[d * 3 + 1] = a[d], c[d * 3 + 2] = -t, l[d * 2] = (s - o.x_min) / u, l[d * 2 + 1] = r;
		}
	}
	let p = new Uint8Array((e - 1) * (t - 1)), m = 0;
	for (let n = 0; n < t - 1; n += 1) for (let t = 0; t < e - 1; t += 1) (!s || s(t, n)) && (p[n * (e - 1) + t] = 1, m += 1);
	let h = new Uint32Array(m * 6), g = 0;
	for (let n = 0; n < t - 1; n += 1) for (let t = 0; t < e - 1; t += 1) {
		if (!p[n * (e - 1) + t]) continue;
		let r = n * e + t, i = r + e;
		h[g] = r, h[g + 1] = i, h[g + 2] = r + 1, h[g + 3] = r + 1, h[g + 4] = i, h[g + 5] = i + 1, g += 6;
	}
	return {
		positions: c,
		normals: r(c, e, t),
		uvs: l,
		indices: h
	};
}
export { i as createHeightfieldGeometry, n as sampleRasterGrid };
