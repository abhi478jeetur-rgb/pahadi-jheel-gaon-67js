/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e } from "./environment-H0LjiCAj.js";
// src/hdri.js
var t = 256 * 1024 ** 2, n = 8, r = 32767;
function i(e, t) {
	let n = t;
	for (; n < e.length && e[n] !== 10;) n++;
	if (n >= e.length) throw Error("Radiance HDR header is truncated.");
	return {
		text: String.fromCharCode(...e.subarray(t, Math.min(n, t + 256))).replace(/\r$/, ""),
		next: n + 1
	};
}
function a(e) {
	let t = i(e, 0);
	if (!t.text.startsWith("#?")) throw Error("Not a Radiance HDR file: missing #? signature.");
	let n = !1, r = t.next;
	for (; t = i(e, r), r = t.next, t.text !== "";) if (t.text.startsWith("FORMAT=")) {
		if (t.text !== "FORMAT=32-bit_rle_rgbe") throw Error(`Unsupported Radiance HDR format: ${t.text}.`);
		n = !0;
	}
	if (!n) throw Error("Radiance HDR header has no FORMAT=32-bit_rle_rgbe line.");
	t = i(e, r);
	let a = /^-Y (\d+) \+X (\d+)$/.exec(t.text);
	if (!a) throw Error("Unsupported Radiance HDR orientation. Only \"-Y height +X width\" is supported.");
	let o = Number(a[1]), s = Number(a[2]);
	if (s < 1 || o < 1 || s > 16384 || o > 16384) throw RangeError("Radiance HDR dimensions are outside the supported range.");
	return {
		width: s,
		height: o,
		dataStart: t.next
	};
}
function o(e, t, n, r) {
	let i = t + 4;
	for (let t = 0; t < 4; t++) {
		let a = 0;
		for (; a < n;) {
			if (i >= e.length) throw Error("Radiance HDR pixel data is truncated.");
			let o = e[i++], s = o > 128, c = s ? o - 128 : o;
			if (c === 0 || a + c > n) throw Error("Radiance HDR run length is invalid.");
			if (s) {
				if (i >= e.length) throw Error("Radiance HDR pixel data is truncated.");
				let n = e[i++];
				for (let e = 0; e < c; e++) r[(a + e) * 4 + t] = n;
			} else {
				if (i + c > e.length) throw Error("Radiance HDR pixel data is truncated.");
				for (let n = 0; n < c; n++) r[(a + n) * 4 + t] = e[i + n];
				i += c;
			}
			a += c;
		}
	}
	return i;
}
function s(e, t, i) {
	return i >= n && i <= r && e[t] === 2 && e[t + 1] === 2 && (e[t + 2] << 8 | e[t + 3]) === i;
}
function c(e) {
	let n = e instanceof Uint8Array ? e : new Uint8Array(e);
	if (n.length > t) throw RangeError("Radiance HDR file is larger than 256 MiB.");
	let { width: r, height: i, dataStart: c } = a(n), l = new Float32Array(r * i * 3), u = new Uint8Array(r * 4), d = c;
	for (let e = 0; e < i; e++) {
		if (s(n, d, r)) d = o(n, d, r, u);
		else {
			if (d + r * 4 > n.length) throw Error("Radiance HDR pixel data is truncated.");
			u.set(n.subarray(d, d + r * 4)), d += r * 4;
		}
		for (let t = 0; t < r; t++) {
			let n = u[t * 4 + 3], i = (e * r + t) * 3;
			if (n === 0) continue;
			let a = 2 ** (n - 136);
			l[i] = u[t * 4] * a, l[i + 1] = u[t * 4 + 1] * a, l[i + 2] = u[t * 4 + 2] * a;
		}
	}
	return {
		width: r,
		height: i,
		data: l
	};
}
async function l(t, { intensity: n, rotation: r, showBackground: i, backgroundBlur: a, signal: o, fetchImplementation: s = globalThis.fetch } = {}) {
	let l = await s(t, { signal: o });
	if (!l.ok) throw Error(`HDRI download failed: HTTP ${l.status}.`);
	let u = c(await l.arrayBuffer());
	return e({
		...u,
		intensity: n,
		rotation: r,
		showBackground: i,
		backgroundBlur: a
	});
}
var u = 20, d = Math.PI / 18;
function f(e, t) {
	return .2126 * e[t] + .7152 * e[t + 1] + .0722 * e[t + 2];
}
function p(e, t, n, r) {
	let i = ((e + .5) / n - .5) * 2 * Math.PI, a = (t + .5) / r * Math.PI;
	return [
		Math.sin(a) * Math.sin(i),
		Math.cos(a),
		-Math.sin(a) * Math.cos(i)
	];
}
function m([e, t, n], r) {
	let i = Math.cos(r), a = Math.sin(r);
	return [
		i * e + a * n,
		t,
		-a * e + i * n
	];
}
function h(e) {
	let { width: t, height: n, channels: r, data: i } = e, a = Float64Array.from({ length: n }, (e, t) => Math.sin((t + .5) / n * Math.PI)), o = new Float32Array(t * n), s = 0;
	for (let e = 0; e < n; e++) for (let n = 0; n < t; n++) {
		let c = f(i, (e * t + n) * r);
		o[e * t + n] = c, s += c * a[e];
	}
	let c = s / (a.reduce((e, t) => e + t, 0) * t), l = 0, h = 0, g = 0;
	for (let e = 1; e < n - 1; e++) for (let n = 0; n < t; n++) {
		let r = 0;
		for (let i = -1; i <= 1; i++) for (let a = -1; a <= 1; a++) r += o[(e + i) * t + (n + a + t) % t];
		r / 9 > l && (l = r / 9, h = n, g = e);
	}
	if (!(l > u * c)) return null;
	let _ = p(h, g, t, n), v = Math.cos(d), y = 2 * Math.PI / t * (Math.PI / n), b = [
		0,
		0,
		0
	], x = [
		0,
		0,
		0
	], S = 0;
	for (let e = 0; e < n; e++) for (let s = 0; s < t; s++) {
		let c = o[e * t + s];
		if (c < l * .5) continue;
		let u = p(s, e, t, n), d = u[0] * _[0] + u[1] * _[1] + u[2] * _[2];
		if (d < v) continue;
		let f = c * a[e];
		for (let n = 0; n < 3; n++) b[n] += u[n] * f, x[n] += i[(e * t + s) * r + n] * f;
		S += c * a[e] * y * Math.max(d, 0);
	}
	let C = Math.hypot(...b), w = Math.max(...x);
	return {
		lightDirection: m(b.map((e) => e / C), e.rotation),
		keyColor: x.map((e) => e / w),
		keyIntensity: S * e.intensity / Math.PI
	};
}
function g(e, t) {
	let n = h(e);
	if (!n) return null;
	let r = t.min.map((e, n) => (e + t.max[n]) / 2), i = Math.max(Math.hypot(...t.max.map((e, n) => e - t.min[n])) / 2, .001), a = r.map((e, t) => e + n.lightDirection[t] * i * 2), { lightDirection: o, keyColor: s, keyIntensity: c } = n;
	return {
		environment: {
			lightDirection: o,
			keyColor: s,
			keyIntensity: c
		},
		shadowBounds: {
			target: r,
			eye: a,
			extent: i,
			near: i * .5,
			far: i * 3.5
		}
	};
}
export { e as createEnvironmentMap, g as keyLightFromHdri, l as loadHdri, c as parseRadianceHdr, h as sunFromEnvironmentMap };
