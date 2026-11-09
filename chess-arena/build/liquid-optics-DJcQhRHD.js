/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/liquid-optics.js
var e = {
	thickness: [
		.5,
		0,
		100
	],
	ior: [
		1.33,
		1,
		3
	],
	refraction: [
		1,
		0,
		4
	],
	scattering: [
		1,
		0,
		10
	],
	foamOpacity: [
		.55,
		0,
		1
	],
	foamSoftness: [
		1,
		0,
		1
	]
};
function t(t = {}) {
	let n = {};
	for (let t in e) n[t] = e[t][0];
	Object.assign(n, t);
	for (let t in e) {
		let [, r, i] = e[t], a = n[t];
		if (!Number.isFinite(a) || a < r || a > i) throw RangeError(`liquid.${t} must be between ${r} and ${i}.`);
	}
	return n;
}
export { t as n, e as t };
