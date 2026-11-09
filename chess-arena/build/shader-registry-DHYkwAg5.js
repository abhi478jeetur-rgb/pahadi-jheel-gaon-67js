/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/shader-registry.js
var e = /* @__PURE__ */ new Map(), t = {}, n = {}, r = {}, i = { fields: [] }, a = {}, o = {}, s = {}, c = Object.freeze({
	splatColor: 11,
	splatNormal: 12,
	splatPacked: 13,
	splatMask: 14
});
function l(e) {
	Object.assign(s, e);
}
function u() {
	if (!s.validate) throw Error("Splat layers need their code: add import '@codepawlhq/67js/addons/splat-shader'.");
	return s;
}
function d(t, n) {
	e.set(t, n);
}
var f = {
	splat: "splat-shader",
	liquid: "liquid-shader",
	worldMaterials: "world-material-shader",
	subsurface: "subsurface-shader",
	volumeFog: "fog-shader"
};
function p(t) {
	let n = e.get(t);
	if (!n) {
		let e = f[t] ?? "material-layer-shaders";
		throw Error(`The ${t} feature needs its shader code: add import '@codepawlhq/67js/addons/${e}' (a recipe: await loadAgentSceneModules(recipe)).`);
	}
	return n;
}
var m = {
	armor: 1,
	floor: 2,
	water: 3,
	foliage: 4,
	terrain: 5,
	grass: 7,
	fire: 8,
	smoke: 9,
	unlit: 10,
	liquid: 11,
	foam: 12
}, h = [], g = 64, _ = {};
function v(e) {
	Object.assign(_, e);
}
function y(e, t) {
	if (!_[e]) throw Error(`Skinned and morphed parts need their code: import ${t}, or a module that makes the pose (createSkinPose, createMorphPose, the glTF loader).`);
	return _;
}
export { o as _, r as a, v as c, e as d, y as f, a as g, h, t as i, d as l, u as m, c as n, m as o, p, _ as r, i as s, g as t, l as u, n as v };
