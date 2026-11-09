/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { l as e } from "./shader-registry-DHYkwAg5.js";
import "./material-layers-C6j9cFSS.js";
import { i as t, n, r, t as i } from "./light-link-bits-Bn3Ktwrl.js";
// src/light-linking.js
e("lightLinking", {
	declarations: "uniform int lightLinkMask;\nbool lightLinked(int bit) {\n  return ((lightLinkMask >> bit) & 1) != 0;\n}\n",
	linkSun: " * float(lightLinked(0))",
	linkPoint: "    if (!lightLinked(1 + index)) continue;\n",
	linkSpot: `      if (!lightLinked(${r} + index)) continue;\n`,
	linkArea: `      if (!lightLinked(${i} + index)) continue;\n`
});
var a = [
	["pointLights", 1],
	["spotLights", r],
	["areaLights", i]
];
function o(e, t) {
	if (e === void 0) return null;
	if (!Array.isArray(e) || e.some((e) => typeof e != "string")) throw TypeError(`${t} affects must be a list of part names`);
	return new Set(e);
}
function s(e, t) {
	let n = 0;
	for (let [r, i] of t) (i === null || i.has(e)) && (n |= 1 << r);
	return n;
}
function c(e) {
	let t = [[0, o(e.keyAffects, "environment keyAffects")]];
	for (let [n, r] of a) (e[n] ?? []).forEach((e, i) => t.push([r + i, o(e.affects, `${n}[${i}]`)]));
	return t;
}
function l(e, t) {
	let n = c(t);
	return n.every(([, e]) => e === null) ? null : e.map((e) => s(e.name, n));
}
function u(e, t) {
	let n = l(e, t);
	return n === null ? e : e.map((e, t) => n[t] === -1 ? e : {
		...e,
		material: {
			...e.material,
			lightMask: n[t]
		}
	});
}
function d(e, t) {
	let n = new Set(t.map((e) => e.id)), r = [["environment.keyAffects", e.keyAffects]];
	for (let t of [
		"pointLights",
		"spotLights",
		"areaLights"
	]) (e[t] ?? []).forEach((e, n) => r.push([`${t}[${n}].affects`, e.affects]));
	return r.flatMap(([e, t]) => (t ?? []).filter((e) => !n.has(e)).map((t) => `${e}: ${t}`));
}
export { i as AREA_FIRST_BIT, n as POINT_FIRST_BIT, r as SPOT_FIRST_BIT, t as SUN_BIT, u as applyLightLinks, s as lightMaskFor, l as lightMasksFor, d as unknownLightLinkNames };
