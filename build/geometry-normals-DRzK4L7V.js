/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/geometry-normals.js
function e(e, t, n = e.normals) {
	let r = /* @__PURE__ */ new Map(), i = Array(t.length / 3), a = new Float32Array(t.length);
	for (let n = 0; n < t.length / 3; n++) {
		let t = n * 3, a = `${e.positions.subarray(t, t + 3).join(",")}:${e.normals.subarray(t, t + 3).join(",")}`, o = r.get(a);
		o || (o = {
			vertices: [],
			normal: [
				0,
				0,
				0
			],
			referenced: !1
		}, r.set(a, o)), o.vertices.push(n), i[n] = o;
	}
	for (let n = 0; n < e.indices.length; n += 3) {
		let r = e.indices[n] * 3, a = e.indices[n + 1] * 3, o = e.indices[n + 2] * 3, s = [
			0,
			1,
			2
		].map((e) => t[a + e] - t[r + e]), c = [
			0,
			1,
			2
		].map((e) => t[o + e] - t[r + e]), l = [
			s[1] * c[2] - s[2] * c[1],
			s[2] * c[0] - s[0] * c[2],
			s[0] * c[1] - s[1] * c[0]
		];
		if (Math.hypot(...l) !== 0) for (let t = 0; t < 3; t++) {
			let r = i[e.indices[n + t]];
			r.referenced = !0;
			for (let e = 0; e < 3; e++) r.normal[e] += l[e];
		}
	}
	for (let e of r.values()) {
		let t = Math.hypot(...e.normal);
		if (e.referenced && (!Number.isFinite(t) || t === 0)) throw RangeError("Sculpt normals cancel at a referenced vertex. Reduce the stroke or repair topology.");
		for (let r of e.vertices) {
			let i = r * 3;
			for (let r = 0; r < 3; r++) a[i + r] = e.referenced ? e.normal[r] / t : n[i + r];
		}
	}
	return a;
}
export { e as t };
