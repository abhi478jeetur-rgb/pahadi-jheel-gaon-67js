/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/gltf-fallbacks.js
var e = "KHR_materials_pbrSpecularGlossiness";
function t(e, n = [], r = []) {
	if (!e || typeof e != "object") return r;
	for (let [i, a] of Object.entries(e)) a && typeof a == "object" && (Number.isInteger(a.index) && (a.texCoord ?? 0) === 0 ? r.push([...n, i]) : t(a, [...n, i], r));
	return r;
}
function n(t, n) {
	let r = [];
	t.materials?.forEach((t, n) => {
		let i = t?.extensions?.[e];
		if (!i) return;
		let a = {
			metallicFactor: 0,
			roughnessFactor: 1 - (i.glossinessFactor ?? 1)
		};
		i.diffuseFactor && (a.baseColorFactor = i.diffuseFactor), i.diffuseTexture && (a.baseColorTexture = i.diffuseTexture), t.pbrMetallicRoughness = a, delete t.extensions[e], Object.keys(t.extensions).length || delete t.extensions;
		let o = i.specularGlossinessTexture ? " and its specularGlossinessTexture" : "";
		r.push(`${t.name ?? `material ${n}`}${o}`);
	}), r.length && (t.extensionsUsed = t.extensionsUsed?.filter((t) => t !== e), t.extensionsRequired = t.extensionsRequired?.filter((t) => t !== e), n.push(`${e} converted to metallic-roughness (diffuse color as base color, metallic 0, roughness 1 - glossiness, specular color not read) in ${r.join(", ")}.`));
}
function r(e, n) {
	let r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
	for (let n of e.meshes ?? []) for (let a of n.primitives ?? []) {
		let n = e.materials?.[a.material];
		if (a.attributes?.TEXCOORD_0 !== void 0 || !n) continue;
		let o = t(n);
		if (o.length) {
			if (!r.has(a.material)) {
				let t = structuredClone(n);
				for (let e of o) {
					let n = e.slice(0, -1).reduce((e, t) => e[t], t);
					delete n[e.at(-1)], i.add(e.at(-1));
				}
				e.materials.push(t), r.set(a.material, e.materials.length - 1);
			}
			a.material = r.get(a.material);
		}
	}
	i.size && n.push(`Dropped ${[...i].sort().join(", ")} from primitives without TEXCOORD_0, which cannot sample a texture.`);
}
function i(e) {
	let t = [];
	return n(e, t), r(e, t), t;
}
export { i as applyGltfFallbacks };
