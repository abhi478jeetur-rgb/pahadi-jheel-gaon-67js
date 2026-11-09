/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, s as t } from "./material-layers-C6j9cFSS.js";
// src/gltf-layers.js
var n = Object.freeze([
	"KHR_materials_clearcoat",
	"KHR_materials_transmission",
	"KHR_materials_volume",
	"KHR_materials_ior",
	"KHR_materials_specular",
	"KHR_materials_sheen",
	"KHR_materials_anisotropy",
	"KHR_materials_iridescence"
]), r = Object.freeze([
	["KHR_materials_clearcoat", {
		clearcoat: "clearcoatFactor",
		clearcoatRoughness: "clearcoatRoughnessFactor"
	}],
	["KHR_materials_transmission", { transmission: "transmissionFactor" }],
	["KHR_materials_volume", {
		thickness: "thicknessFactor",
		attenuationDistance: "attenuationDistance",
		attenuationColor: "attenuationColor"
	}],
	["KHR_materials_ior", { ior: "ior" }],
	["KHR_materials_specular", {
		specular: "specularFactor",
		specularColor: "specularColorFactor"
	}],
	["KHR_materials_sheen", {
		sheenColor: "sheenColorFactor",
		sheenRoughness: "sheenRoughnessFactor"
	}],
	["KHR_materials_anisotropy", {
		anisotropy: "anisotropyStrength",
		anisotropyRotation: "anisotropyRotation"
	}],
	["KHR_materials_iridescence", {
		iridescence: "iridescenceFactor",
		iridescenceIor: "iridescenceIor",
		iridescenceThickness: "iridescenceThicknessMaximum"
	}]
]), i = Object.freeze([
	[
		"KHR_materials_clearcoat",
		"clearcoatTexture",
		"linear"
	],
	[
		"KHR_materials_clearcoat",
		"clearcoatRoughnessTexture",
		"linear"
	],
	[
		"KHR_materials_clearcoat",
		"clearcoatNormalTexture",
		"linear"
	],
	[
		"KHR_materials_anisotropy",
		"anisotropyTexture",
		"linear"
	],
	[
		"KHR_materials_sheen",
		"sheenColorTexture",
		"srgb"
	],
	[
		"KHR_materials_sheen",
		"sheenRoughnessTexture",
		"linear"
	]
]);
function a(e) {
	let t = [];
	for (let [n, r, a] of i) {
		let i = e?.extensions?.[n]?.[r];
		i && t.push([
			r,
			i,
			a
		]);
	}
	return t;
}
function o(e) {
	let n = {};
	for (let [t, i] of r) {
		let r = e?.extensions?.[t];
		if (r) for (let [e, t] of Object.entries(i)) r[t] !== void 0 && (n[e] = r[t]);
	}
	return t(n), n;
}
function s(t, n) {
	return JSON.stringify(n) !== JSON.stringify(e[t]);
}
function c(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(t)) e[r] !== void 0 && s(r, e[r]) && (n[i] = Array.isArray(e[r]) ? [...e[r]] : e[r]);
	return n;
}
function l(e) {
	t(e);
	let n = {};
	for (let [t, i] of r) {
		let r = c(e, i);
		Object.keys(r).length > 0 && (n[t] = r);
	}
	return n;
}
export { o as a, a as i, i as n, l as r, n as t };
