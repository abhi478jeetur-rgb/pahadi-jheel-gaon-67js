/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { v as e } from "./shader-registry-DHYkwAg5.js";
import { AGX_CONSTANTS as t, NEUTRAL_CONSTANTS as n, namedLook as r } from "./view-transform.js";
import { n as i, t as a } from "./view-transform-names-CDWKtFlr.js";
import { i as o } from "./look-catalog-BW-KqP3u.js";
// src/view-transform-shader.js
var s = "clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0)", c = "  float alpha = POST_TRANSPARENT ? coverage : 1.0;", l = 6, u = "viewLookTexture", d = (e) => Number.isInteger(e) ? e.toFixed(1) : String(e), f = (e) => `vec3(${e.map(d).join(", ")})`, p = (e) => `mat3(${e.map(f).join(", ")})`, m = ({ scale: e, power: t }) => ({
	scale: d(e),
	power: d(t),
	inversePower: d(1 / t)
}), h = m(t.toe), g = m(t.shoulder), _ = `const mat3 agxInset = ${p(t.inset)};
const mat3 agxOutset = ${p(t.outset)};
vec3 agxCurve(vec3 x) {
  vec3 distance = ${d(t.slope)} * (x - ${d(t.pivot[0])});
  vec3 above = max(distance, 0.0) / ${g.scale};
  vec3 below = max(-distance, 0.0) / ${h.scale};
  vec3 rise = ${g.scale} * above / pow(1.0 + pow(above, vec3(${g.power})), vec3(${g.inversePower}));
  vec3 fall = ${h.scale} * below / pow(1.0 + pow(below, vec3(${h.power})), vec3(${h.inversePower}));
  return ${d(t.pivot[1])} + rise - fall;
}
vec3 selectedViewTransform(vec3 color) {
  color = agxInset * color;
  color = clamp((log2(max(color, vec3(1e-10))) - ${d(t.minimumEv)}) / ${d(t.maximumEv - t.minimumEv)}, 0.0, 1.0);
  color = pow(max(agxCurve(color), vec3(0.0)), vec3(${d(t.encodingPower)}));
  return clamp(agxOutset * color, 0.0, 1.0);
}`, v = `vec3 selectedViewTransform(vec3 color) {
  float lowest = min(color.r, min(color.g, color.b));
  float offset = lowest < 0.08 ? lowest - 6.25 * lowest * lowest : 0.04;
  color -= offset;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < ${d(n.startCompression)}) return clamp(color, 0.0, 1.0);
  float distance = ${d(1 - n.startCompression)};
  float newPeak = 1.0 - distance * distance / (peak + distance - ${d(n.startCompression)});
  color *= newPeak / peak;
  float desaturate = 1.0 - 1.0 / (${d(n.desaturation)} * (peak - newPeak) + 1.0);
  return clamp(mix(color, vec3(newPeak), desaturate), 0.0, 1.0);
}`, y = `uniform highp sampler3D ${u};
vec3 applyLook(vec3 color) {
  float size = float(textureSize(${u}, 0).x);
  return texture(${u}, clamp(color, 0.0, 1.0) * ((size - 1.0) / size) + 0.5 / size).rgb;
}`;
function b(e, t) {
	let n = "precision highp float;";
	if (!e.includes(n)) throw Error("A shader that takes a view transform needs a precision statement.");
	return e.replace(n, `${n}\n${t}`);
}
function x(e, t, n, r) {
	if (!i.includes(n)) throw RangeError(`viewTransform must be one of ${i.join(", ")}.`);
	let a = e;
	if (n !== "aces") {
		if (!a.includes(s)) throw Error(`The ${t} shader no longer holds the ACES expression that a view transform replaces.`);
		a = b(a.replaceAll(s, "selectedViewTransform(color)"), n === "agx" ? _ : v);
	}
	if (r && t === "post") {
		if (!a.includes(c)) throw Error("The post shader no longer holds the line that a look is applied before.");
		a = b(a.replace(c, `  color = applyLook(color);\n${c}`), y);
	}
	return a;
}
var S = /* @__PURE__ */ new WeakMap(), C = /* @__PURE__ */ new Map();
function w(e) {
	return typeof e == "string" ? a.includes(e) ? (C.has(e) || C.set(e, r(e)), C.get(e)) : o(e) : e;
}
function T(e, t) {
	let { size: n, data: r } = t, i = new Uint8Array(n ** 3 * 4);
	for (let e = 0; e < n ** 3; e++) {
		for (let t = 0; t < 3; t++) i[e * 4 + t] = Math.round(r[e * 3 + t] * 255);
		i[e * 4 + 3] = 255;
	}
	let a = e.createTexture();
	e.bindTexture(e.TEXTURE_3D, a), e.texImage3D(e.TEXTURE_3D, 0, e.RGBA8, n, n, n, 0, e.RGBA, e.UNSIGNED_BYTE, i), e.texParameteri(e.TEXTURE_3D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_3D, e.TEXTURE_MAG_FILTER, e.LINEAR);
	for (let t of [
		e.TEXTURE_WRAP_S,
		e.TEXTURE_WRAP_T,
		e.TEXTURE_WRAP_R
	]) e.texParameteri(e.TEXTURE_3D, t, e.CLAMP_TO_EDGE);
	return a;
}
function E(e, t) {
	let n = e.context;
	S.has(e) || S.set(e, T(n, e.look)), n.activeTexture(n.TEXTURE0 + l), n.bindTexture(n.TEXTURE_3D, S.get(e)), n.uniform1i(n.getUniformLocation(t, u), l);
}
function D(e) {
	S.has(e) && e.context.deleteTexture(S.get(e)), S.delete(e);
}
Object.assign(e, {
	apply: x,
	bindLook: E,
	dispose: D,
	resolveLook: w
});
export { x as applyViewTransformToShader };
