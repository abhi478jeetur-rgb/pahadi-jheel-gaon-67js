/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e, l as t } from "./shader-registry-DHYkwAg5.js";
import { n, t as r } from "./subsurface-limits-DJNpVtVf.js";
// src/subsurface-shader.js
t("subsurface", Object.freeze({
	declarations: "uniform vec4 materialSubsurface;\nuniform vec3 materialSubsurfaceColor;\nuniform mat4 lightProjection;\n",
	libraries: "float sunThickness(float reference) {\n  vec3 projected = shadowPosition.xyz / shadowPosition.w * 0.5 + 0.5;\n  if (projected.z > 1.0 || projected.z < 0.0 || any(lessThan(projected.xy, vec2(0.0))) || any(greaterThan(projected.xy, vec2(1.0)))) return 0.0;\n  float unit = reference * abs(lightProjection[2][2]) * 0.5;\n  float depth = projected.z - shadowBiasPerSlope;\n  float thickness = 0.0;\n  thickness += (1.0 - texture(shadowMap, vec3(projected.xy, depth - 0.25 * unit))) * 0.25;\n  thickness += (1.0 - texture(shadowMap, vec3(projected.xy, depth - 0.5 * unit))) * 0.25;\n  thickness += (1.0 - texture(shadowMap, vec3(projected.xy, depth - unit))) * 0.5;\n  thickness += (1.0 - texture(shadowMap, vec3(projected.xy, depth - 2.0 * unit)));\n  thickness += (1.0 - texture(shadowMap, vec3(projected.xy, depth - 4.0 * unit))) * 2.0;\n  return thickness * reference;\n}\n\nvec3 subsurfaceLight(vec3 normal, vec3 baseColor, float visibility) {\n  vec3 mean = materialSubsurface.yzw;\n  vec3 tint = materialSubsurfaceColor.x < 0.0 ? baseColor : materialSubsurfaceColor;\n  float facing = dot(normal, normalize(lightDirection));\n  vec3 wrap = mean / (mean + 0.1);\n  vec3 spread = max((facing + wrap) / ((1.0 + wrap) * (1.0 + wrap)), 0.0) + max(-facing, 0.0) * 1.0;\n  float thickness = visibility < 1.0 ? sunThickness(max(mean.x, max(mean.y, mean.z))) : 0.0;\n  vec3 reach = max(vec3(visibility), exp(-thickness / max(mean, vec3(0.0001))));\n  vec3 gained = tint * reach * spread - baseColor * visibility * max(facing, 0.0);\n  return materialSubsurface.x * gained * keyColor / PI;\n}\n",
	worldLight: "  if (materialSubsurface.x > 0.0) radiance = max(radiance + (1.0 - metallic) * subsurfaceLight(normal, color, visibility), vec3(0.0));\n"
}));
var i = 23, a = [
	0,
	0,
	0,
	0,
	-1,
	-1,
	-1
], o = /* @__PURE__ */ new Map();
function s(e) {
	if (!o.has(e)) {
		let t = JSON.parse(e);
		n(t), o.set(e, r(t));
	}
	return o.get(e);
}
function c(e, t) {
	return n(e, t), structuredClone(e);
}
function l(e, t) {
	return e.uniforms[t] ??= e.context.getUniformLocation(e.program, t), e.uniforms[t];
}
var u = e.bind;
e.bind = (e, t, n, r) => {
	if (u?.(e, t, n, r), !e.shaderFeatures?.has("subsurface")) return;
	let o = e.context, c = n[i], [d, f, p, m, h, g, _] = c ? s(c) : a;
	o.uniform4f(l(e, "materialSubsurface"), d, f, p, m), o.uniform3f(l(e, "materialSubsurfaceColor"), h, g, _);
};
export { c as copySubsurface };
