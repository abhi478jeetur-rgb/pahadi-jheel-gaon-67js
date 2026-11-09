/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, t } from "./view-transform-names-CDWKtFlr.js";
// src/view-transform.js
var n = (e) => e[0].map((t, n) => e.map((e) => e[n])), r = Object.freeze({
	inset: n([
		[
			.57215,
			.33216,
			.09569
		],
		[
			.12368,
			.74091,
			.13541
		],
		[
			.09814,
			.19729,
			.70457
		]
	]),
	outset: n([
		[
			1.84762,
			-.70741,
			-.14021
		],
		[
			-.2341,
			1.3225,
			-.0884
		],
		[
			-.19713,
			-.30062,
			1.49775
		]
	]),
	minimumEv: -12.47393,
	maximumEv: 4.026069,
	pivot: [.60608, .48834],
	slope: 2.39013,
	toe: {
		scale: .56474,
		power: 1.50159
	},
	shoulder: {
		scale: .70613,
		power: 1.53357
	},
	encodingPower: 2.4
}), i = Object.freeze({
	startCompression: .76,
	desaturation: .15
});
function a(e, t) {
	let n = [
		0,
		0,
		0
	];
	for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) n[i] += e[r][i] * t[r];
	return n;
}
var o = (e) => Math.min(1, Math.max(0, e));
function s(e) {
	let t = Math.max(e, 0);
	return o(t * (2.51 * t + .03) / (t * (2.43 * t + .59) + .14));
}
function c(e, t) {
	let n = e / t.scale;
	return t.scale * n / (1 + n ** t.power) ** (1 / t.power);
}
function l(e) {
	let { pivot: t, slope: n, toe: i, shoulder: a } = r, o = n * (e - t[0]);
	return t[1] + (o >= 0 ? c(o, a) : -c(-o, i));
}
function u(e) {
	let { inset: t, outset: n, minimumEv: i, maximumEv: s, encodingPower: c } = r;
	return a(n, a(t, e).map((e) => {
		let t = (Math.log2(Math.max(e, 1e-10)) - i) / (s - i);
		return Math.max(0, l(o(t))) ** c;
	})).map(o);
}
function d(e) {
	let { startCompression: t, desaturation: n } = i, r = Math.min(...e), a = r < .08 ? r - 6.25 * r * r : .04, s = e.map((e) => e - a), c = Math.max(...s);
	if (c < t) return s.map(o);
	let l = 1 - t, u = 1 - l * l / (c + l - t), d = 1 - 1 / (n * (c - u) + 1);
	return s.map((e) => o(e * u / c * (1 - d) + u * d));
}
function f(t, n) {
	if (t === "agx") return u(n);
	if (t === "neutral") return d(n);
	if (t === "aces" || t === void 0) return n.map(s);
	throw RangeError(`viewTransform must be one of ${e.join(", ")}.`);
}
var p = 65, m = 16777216;
function h(e) {
	if (typeof e != "string" || e.length > m) throw RangeError("A .cube look must be text of at most 16 MiB.");
	let t = 0, n = [
		0,
		0,
		0
	], r = [
		1,
		1,
		1
	], i = [];
	for (let a of e.split(/\r?\n/)) {
		let e = a.replace(/#.*/, "").trim();
		if (e === "" || e.startsWith("TITLE")) continue;
		let [o, ...s] = e.split(/\s+/);
		if (o === "LUT_3D_SIZE") t = Number(s[0]);
		else if (o === "LUT_1D_SIZE") throw RangeError("Only 3D .cube looks are supported (LUT_3D_SIZE).");
		else if (o === "DOMAIN_MIN") n = s.map(Number);
		else if (o === "DOMAIN_MAX") r = s.map(Number);
		else if (/^[-+0-9.]/.test(o)) i.push(Number(o), Number(s[0]), Number(s[1]));
		else throw RangeError(`Unknown .cube line: ${o}`);
	}
	if (!Number.isInteger(t) || t < 2 || t > 65) throw RangeError("LUT_3D_SIZE must be an integer from 2 to 65.");
	if (i.length !== t ** 3 * 3 || i.some((e) => !Number.isFinite(e))) throw RangeError(`A ${t}x${t}x${t} .cube look needs ${t ** 3} finite RGB rows.`);
	let a = new Float32Array(i.length);
	for (let e = 0; e < i.length; e++) {
		let t = e % 3, s = r[t] - n[t];
		a[e] = o((i[e] - n[t]) / (s || 1));
	}
	return {
		size: t,
		data: a
	};
}
function g(e, t) {
	let n = new Float32Array(e ** 3 * 3), r = 0;
	for (let i = 0; i < e; i++) for (let a = 0; a < e; a++) for (let s = 0; s < e; s++) n.set(t([
		s / (e - 1),
		a / (e - 1),
		i / (e - 1)
	]).map(o), r), r += 3;
	return {
		size: e,
		data: n
	};
}
var _ = (e) => e * e * (3 - 2 * e), v = {
	warm: ([e, t, n]) => [
		e * 1.06 + .01,
		t,
		n * .92
	],
	cool: ([e, t, n]) => [
		e * .93,
		t,
		n * 1.07 + .01
	],
	contrast: (e) => e.map((e) => e * .5 + _(e) * .5),
	faded: (e) => {
		let t = e[0] * .2126 + e[1] * .7152 + e[2] * .0722;
		return e.map((e) => .06 + .88 * (e * .85 + t * .15));
	}
};
function y(e) {
	if (!t.includes(e)) throw RangeError(`look must be one of ${t.join(", ")}.`);
	return g(17, v[e]);
}
function b(e, t) {
	let { size: n, data: r } = e, i = t.map((e) => o(e) * (n - 1)), a = i.map((e) => Math.min(Math.floor(e), n - 2)), s = [
		0,
		0,
		0
	];
	for (let e = 0; e < 8; e++) {
		let t = [
			e & 1,
			e >> 1 & 1,
			e >> 2 & 1
		], o = 1;
		for (let e = 0; e < 3; e++) {
			let n = i[e] - a[e];
			o *= t[e] ? n : 1 - n;
		}
		let c = ((a[2] + t[2]) * n * n + (a[1] + t[1]) * n + a[0] + t[0]) * 3;
		for (let e = 0; e < 3; e++) s[e] += r[c + e] * o;
	}
	return s;
}
function x(e, { viewTransform: t = "aces", look: n = null } = {}) {
	let r = f(t, e).map((e) => e ** (1 / 2.2));
	return n ? b(n, r) : r;
}
export { r as AGX_CONSTANTS, p as MAXIMUM_LOOK_SIZE, i as NEUTRAL_CONSTANTS, s as acesChannel, u as agxColor, f as applyViewTransform, x as displayColor, y as namedLook, d as neutralColor, h as parseCube, b as sampleLook };
