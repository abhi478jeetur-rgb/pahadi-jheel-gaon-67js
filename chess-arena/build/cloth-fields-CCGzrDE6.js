/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { bakeCloth as e } from "./cloth.js";
import { t } from "./force-fields-DH4YNmiz.js";
// src/cloth-fields.js
function n(e) {
	let n = [
		0,
		0,
		0
	], r = [
		0,
		0,
		0
	], i = [
		0,
		0,
		0
	];
	return (a, o, s, c) => {
		for (let l = 0; l < a.length / 3; l++) {
			for (let e = 0; e < 3; e++) n[e] = a[l * 3 + e], r[e] = o[l * 3 + e], i[e] = 0;
			for (let a of e) t(a, n, r, s, i);
			for (let e = 0; e < 3; e++) o[l * 3 + e] += i[e] * c;
		}
	};
}
function r(t, r, i) {
	return e(t, r, i.fields?.length ? {
		...i,
		applyFields: n(i.fields)
	} : i);
}
export { r as t };
