/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e, l as t } from "./shader-registry-DHYkwAg5.js";
// src/world-material-shader.js
var n = Object.freeze({
	lake: Object.freeze({
		absorption: Object.freeze([
			.35,
			.07,
			.04
		]),
		turbidity: .02
	}),
	sea: Object.freeze({
		absorption: Object.freeze([
			.4,
			.06,
			.02
		]),
		turbidity: .1
	}),
	river: Object.freeze({
		absorption: Object.freeze([
			.8,
			.9,
			1.6
		]),
		turbidity: .75
	})
}), r = "lake", i = 20, a = .02;
function o({ waterPreset: e, absorption: t, turbidity: r } = {}) {
	let i = e ?? "lake";
	if (!Object.hasOwn(n, i)) throw RangeError(`waterPreset must be one of ${Object.keys(n).join(", ")}.`);
	let a = t ?? n[i].absorption;
	if (!(Array.isArray(a) && a.length === 3 && a.every((e) => Number.isFinite(e) && e >= 0 && e <= 20))) throw RangeError("absorption must be three numbers from 0 to 20 (per metre).");
	let o = r ?? n[i].turbidity;
	if (!Number.isFinite(o) || o < 0 || o > 1) throw RangeError("turbidity must be within zero and one.");
	return {
		waterPreset: i,
		absorption: [...a],
		turbidity: o
	};
}
function s(e, t, n) {
	let r = [
		"waterPreset",
		"absorption",
		"turbidity"
	].filter((t) => e[t] !== void 0);
	if (t.tag !== "water") {
		if (r.length > 0) throw RangeError(`${r.join(", ")} need the water tag.`);
		return;
	}
	let i = e.absorption === void 0 ? void 0 : n(e.absorption, 3, "absorption");
	Object.assign(t, o({
		...e,
		absorption: i
	}));
}
function c(e) {
	let { positions: t } = e.geometry, { matrix: n } = e, r = [
		Infinity,
		Infinity,
		Infinity
	], i = [
		-Infinity,
		-Infinity,
		-Infinity
	];
	for (let e = 0; e < t.length; e += 3) for (let a = 0; a < 3; a++) {
		let o = n[a] * t[e] + n[4 + a] * t[e + 1] + n[8 + a] * t[e + 2] + n[12 + a];
		r[a] = Math.min(r[a], o), i[a] = Math.max(i[a], o);
	}
	return {
		minimum: r,
		maximum: i
	};
}
var l = /* @__PURE__ */ new WeakMap();
function u(e) {
	let t = l.get(e);
	if (t && t.matrix.every((t, n) => t === e.matrix[n])) return t.bounds;
	let n = c(e);
	return l.set(e, {
		matrix: Float32Array.from(e.matrix),
		bounds: n
	}), n;
}
function d(e) {
	let t = null;
	for (let n of e) {
		if (n.material.tag !== "water") continue;
		let { minimum: e, maximum: r } = u(n), i = Math.max(r[0] - e[0], r[2] - e[2]), o = (r[0] - e[0]) * (r[2] - e[2]);
		i > 0 && r[1] - e[1] <= i * a && (!t || o > t.footprint) && (t = {
			footprint: o,
			level: r[1],
			material: n.material,
			refractive: n.material.alphaMode === "blend"
		});
	}
	if (!t) return null;
	let { absorption: n, turbidity: r } = o(t.material);
	return {
		level: t.level,
		absorption: n,
		turbidity: r,
		refractive: t.refractive
	};
}
var f = /* @__PURE__ */ new WeakMap(), p = 14;
function m(e, t) {
	let n = e.context, { width: r, height: i } = e.canvas;
	n.bindFramebuffer(n.READ_FRAMEBUFFER, e.multisampleFramebuffer), n.bindFramebuffer(n.DRAW_FRAMEBUFFER, e.resolveFramebuffer), n.blitFramebuffer(0, 0, r, i, 0, 0, r, i, n.COLOR_BUFFER_BIT, n.NEAREST), n.bindFramebuffer(n.FRAMEBUFFER, e.multisampleFramebuffer), n.activeTexture(n.TEXTURE0 + p), n.bindTexture(n.TEXTURE_2D, e.frameTexture), n.uniform1i(t.scene, p);
}
function h(e) {
	if (!e.shaderFeatures?.has("water")) return;
	let t = e.context, n = f.get(e);
	n?.program !== e.program && (n = {
		program: e.program,
		body: t.getUniformLocation(e.program, "waterBody"),
		absorption: t.getUniformLocation(e.program, "waterAbsorption"),
		scene: t.getUniformLocation(e.program, "waterScene"),
		resolved: !1
	}, f.set(e, n));
	let r = d(e.batches.flatMap((e) => e.parts[0].material.tag === "water" ? e.parts : [])), i = !!r && !e.renderingPass && !e.mirrorCulling, a = i && r.refractive && !e.transparent && !e.benchmark && !!e.frameTexture;
	t.uniform4f(n.body, i ? r.level : 0, i ? r.turbidity : 0, +!!i, +!!a), t.uniform3f(n.absorption, ...i ? r.absorption : [
		0,
		0,
		0
	]), t.isEnabled(t.BLEND) ? a && !n.resolved && (m(e, n), n.resolved = !0) : n.resolved = !1;
}
var g = e.bind;
e.bind = (e, t, n, r) => {
	g?.(e, t, n, r), h(e);
};
var _ = {
	declarations: "uniform vec4 waterBody;\nuniform vec3 waterAbsorption;\nuniform sampler2D waterScene;\nuniform mat4 viewProjection;\nvec3 waterDecode(vec3 encoded) {\n  vec3 linear = encoded;\n  if (hdrEnabled < 0.5) {\n    vec3 curve = pow(encoded, vec3(2.2));\n    vec3 quadratic = 2.51 - 2.43 * curve;\n    vec3 slope = 0.03 - 0.59 * curve;\n    linear = (-slope + sqrt(max(slope * slope + 4.0 * quadratic * 0.14 * curve, 0.0))) / (2.0 * quadratic);\n  }\n  return linear / max(exposure, 0.0001);\n}\nvec3 refractedBackground(vec3 fallback, vec3 surfacePosition, vec3 normal, vec3 viewDirection) {\n  vec2 size = vec2(textureSize(waterScene, 0));\n  vec3 bent = refract(-viewDirection, normal, 0.7519);\n  vec2 uv = gl_FragCoord.xy / size;\n  float depth = 0.0;\n  for (int pass = 0; pass < 2; pass++) {\n    float stored = textureLod(waterScene, uv, 0.0).a;\n    depth = stored < 0.999 ? (stored - 0.5) / 0.498 * 8.0 : 0.0;\n    vec4 clip = viewProjection * vec4(surfacePosition + bent * (depth / max(-bent.y, 0.1)), 1.0);\n    uv = clip.xy / clip.w * 0.5 + 0.5;\n  }\n  float radius = min(waterBody.y * depth * 0.02 * size.y, 48.0);\n  vec3 seenColor = vec3(0.0);\n  float seen = 0.0;\n  for (int tap = 0; tap < 16; tap++) {\n    float angle = float(tap) * 2.39996;\n    vec2 offset = vec2(cos(angle), sin(angle)) * sqrt((float(tap) + 0.5) / 16.0) * radius / size;\n    vec2 position = uv + offset;\n    vec4 sampled = textureLod(waterScene, position, 0.0);\n    float inside = all(greaterThan(position, vec2(0.0))) && all(lessThan(position, vec2(1.0))) ? 1.0 : 0.0;\n    float below = sampled.a < 0.999 ? inside : 0.0;\n    seenColor += waterDecode(sampled.rgb) * below;\n    seen += below;\n  }\n  return seen > 0.5 ? seenColor / seen : fallback;\n}\n#ifndef shadowVisibility\nfloat softShadowVisibility(vec3 normal, float radiusTexels) {\n  vec3 projected = shadowPosition.xyz / shadowPosition.w * 0.5 + 0.5;\n  if (projected.z > 1.0 || projected.z < 0.0 || any(lessThan(projected.xy, vec2(0.0))) || any(greaterThan(projected.xy, vec2(1.0)))) return 1.0;\n  float cosine = max(dot(normal, normalize(lightDirection)), 0.05);\n  float bias = shadowBiasPerSlope * clamp(sqrt(1.0 - cosine * cosine) / cosine, 0.25, 4.0);\n  vec2 texel = 1.0 / vec2(textureSize(shadowMap, 0));\n  float lit = 0.0;\n  for (int tap = 0; tap < 12; tap++) {\n    float angle = float(tap) * 2.39996;\n    vec2 offset = vec2(cos(angle), sin(angle)) * sqrt((float(tap) + 0.5) / 12.0) * radiusTexels;\n    lit += texture(shadowMap, vec3(projected.xy + offset * texel, projected.z - bias));\n  }\n  return lit / 12.0;\n}\n#endif\nfloat underwaterVisibility(float visibility, vec3 normal, float depth) {\n  float scattering = waterBody.y * depth;\n  float filtered = visibility;\n#ifndef shadowVisibility\n  if (scattering > 0.03) filtered = softShadowVisibility(normal, 1.5 + min(scattering * 6.0, 8.0));\n#endif\n  return filtered;\n}\n",
	worldVisibility: "  float waterDepth = 0.0;\n  vec3 waterTransmittance = vec3(1.0);\n  vec3 waterSunTransmittance = vec3(1.0);\n  float waterScatterShare = 0.0;\n  float waterShadowVisibility = 1.0;\n  if (TAG_WATER) {\n    visibility = mix(visibility, 1.0, 0.7 + 0.2 * waterBody.y);\n  } else if (waterBody.z > 0.5 && worldPosition.y < waterBody.x) {\n    waterDepth = waterBody.x - worldPosition.y;\n    waterTransmittance = exp(-waterAbsorption * waterDepth);\n    visibility = underwaterVisibility(visibility, normal, waterDepth);\n    waterShadowVisibility = visibility;\n    float sunSine = sqrt(max(1.0 - pow(normalize(lightDirection).y, 2.0), 0.0)) / 1.33;\n    waterSunTransmittance = exp(-(waterAbsorption + 0.9 * waterBody.y * (1.0 - waterBody.y)) * waterDepth / sqrt(1.0 - sunSine * sunSine));\n    waterScatterShare = waterBody.y * (1.0 - exp(-0.4 * waterBody.y * waterDepth));\n  }\n  vec3 keyColor = keyColor * waterSunTransmittance;\n",
	worldVertexWind: "\nuniform float windHeading;\n\nvec3 grassWind(vec3 worldPoint, vec2 leafUv, float seconds, float strength) {\n  float tip = clamp(1.0 - leafUv.y, 0.0, 1.0);\n  float bendWeight = tip * tip;\n  float headingCos = cos(windHeading);\n  float headingSin = sin(windHeading);\n  vec2 windDirection = vec2(0.94 * headingCos - 0.34 * headingSin, 0.94 * headingSin + 0.34 * headingCos);\n  float along = dot(worldPoint.xz, windDirection);\n  float gust = 0.5 + 0.5 * sin(along * 0.32 - seconds * 1.7 + 2.0 * sin(worldPoint.x * 0.05 - worldPoint.z * 0.04 + seconds * 0.23));\n  float push = (0.3 + 0.7 * gust * gust) * strength;\n  float flutter = sin(seconds * 4.7 + worldPoint.x * 2.3 + worldPoint.z * 1.9) * strength;\n  vec2 offset = windDirection * (push * 0.42 + flutter * 0.05) + vec2(-windDirection.y, windDirection.x) * flutter * 0.04;\n  return vec3(offset.x, -push * 0.14, offset.y) * bendWeight;\n}\n\nvec3 windOffset(vec3 localPosition, vec3 worldPoint, vec2 leafUv, float surfaceTag, float seconds, float strength) {\n  if (surfaceTag == 7.0 && leafUv.x > -0.5) return grassWind(worldPoint, leafUv, seconds, strength);\n  if (surfaceTag != 4.0 && surfaceTag != 7.0) return vec3(0.0);\n  float heightReach = min(max(localPosition.y + 0.5, 0.0), 2.5);\n  float branchReach = 1.0 + 0.3 * min(length(localPosition.xz), 3.0);\n  float sway = sin(seconds * 1.2 + worldPoint.z * 0.31 + worldPoint.x * 0.17) * strength * 0.10 * heightReach * branchReach;\n  float tip = clamp(1.0 - leafUv.y, 0.0, 1.0);\n  float flutter = sin(seconds * 3.1 + worldPoint.x * 1.7 + worldPoint.z * 1.3 + localPosition.y * 2.0) * strength * 0.08 * tip;\n  vec2 heading = vec2(cos(windHeading), sin(windHeading));\n  vec2 push = heading * (sway + flutter) + vec2(-heading.y, heading.x) * (flutter * 0.6);\n  return vec3(push.x, 0.0, push.y);\n}\n",
	worldFunctions: "float terrainHash(vec2 position) {\n  vec3 seed = fract(vec3(position.xyx) * 0.1031);\n  seed += dot(seed, seed.yzx + 33.33);\n  return fract((seed.x + seed.y) * seed.z);\n}\n\nvec3 terrainNoise(vec2 position) {\n  vec2 cell = floor(position);\n  vec2 fraction = fract(position);\n  vec2 blend = fraction * fraction * (3.0 - 2.0 * fraction);\n  vec2 derivative = 6.0 * fraction * (1.0 - fraction);\n  float lowerLeft = terrainHash(cell);\n  float lowerRight = terrainHash(cell + vec2(1.0, 0.0));\n  float upperLeft = terrainHash(cell + vec2(0.0, 1.0));\n  float upperRight = terrainHash(cell + vec2(1.0, 1.0));\n  float lower = mix(lowerLeft, lowerRight, blend.x);\n  float upper = mix(upperLeft, upperRight, blend.x);\n  return vec3(mix(lower, upper, blend.y),\n    mix(lowerRight - lowerLeft, upperRight - upperLeft, blend.y) * derivative.x,\n    (upper - lower) * derivative.y);\n}\n",
	worldMossFunction: "// Moss is its own material over the base, not a tint: fully rough, a soft sheen at grazing angles and light that wraps\nvoid mossMasks(vec3 normal, float amount, out float sharpMask, out float softMask) {\n  float facing = smoothstep(0.1, 0.7, normal.y);\n  vec2 position = worldPosition.xz * 6.0 + worldPosition.y * vec2(2.3, -1.7);\n  float patches = terrainNoise(position).x * 0.6 + terrainNoise(position * 2.7 + 5.1).x * 0.4;\n  float threshold = 1.0 - amount;\n  sharpMask = facing * smoothstep(threshold - 0.035, threshold + 0.035, patches);\n  softMask = facing * smoothstep(threshold - 0.22, threshold + 0.18, patches);\n}\n\n",
	worldSurface: "  if (TAG_WATER) {\n    normal = normalize(vec3(-cos(worldPosition.x * 1.4 + time * 0.8) * 0.035, 1.0, -cos(worldPosition.z * 1.8 - time) * 0.036));\n    float radius = length(worldPosition.xz - waterRipple.xz);\n    float age = time - rippleTime;\n    float wave = sin(radius * 11.0 - age * 8.0) * exp(-abs(radius - age * 1.4) * 1.5) * exp(-age * 0.7) * step(0.0, age);\n    normal.xz += normalize(worldPosition.xz - waterRipple.xz + 0.001) * wave * 0.07;\n    normal = normalize(normal);\n    color = mix(color, vec3(0.10, 0.23, 0.25), pow(1.0 - max(dot(normal, viewDirection), 0.0), 4.0));\n    roughness = 0.16;\n  }\n  if (CANOPY_TAG) {\n    float leaves = sin(worldPosition.x * 13.0 + sin(worldPosition.y * 9.0)) * sin(worldPosition.z * 11.0 - worldPosition.y * 5.0);\n    color *= 0.78 + leaves * 0.16;\n    normal = normalize(normal + vec3(sin(worldPosition.z * 12.0), sin(worldPosition.x * 9.0), cos(worldPosition.y * 11.0)) * 0.06);\n  }\n  if (TAG_TERRAIN) {\n    vec2 terrainPosition = worldPosition.xz + worldPosition.y * vec2(0.31, 0.43);\n    float footprint = max(fwidth(terrainPosition.x), fwidth(terrainPosition.y));\n    vec3 broad = terrainNoise(terrainPosition * 0.32);\n    vec3 ridges = terrainNoise(terrainPosition * 3.2 + vec2(5.2, 11.7));\n    vec3 grains = terrainNoise(terrainPosition * 32.0 + vec2(17.1, 4.3));\n    float ridgeWeight = 1.0 - smoothstep(0.25, 0.8, footprint * 3.2);\n    float grainWeight = 1.0 - smoothstep(0.2, 0.7, footprint * 32.0);\n    float ridgeColor = 1.0 - abs(ridges.x * 2.0 - 1.0);\n    color *= 0.82 + broad.x * 0.26 + (ridgeColor - 0.5) * 0.12 * ridgeWeight + (grains.x - 0.5) * 0.1 * grainWeight;\n    vec2 relief = ridges.yz * 0.08 * ridgeWeight + grains.yz * 0.11 * grainWeight;\n    vec3 perturbation = vec3(-relief.x, 0.0, -relief.y);\n    normal = normalize(normal + perturbation - normal * dot(perturbation, normal));\n    roughness = clamp(roughness + (grains.x - 0.5) * 0.06 * grainWeight, 0.075, 1.0);\n  }\n  if (USES_MOSS) {\n    float mossSoft;\n    mossMasks(normal, materialMoss.x, mossCover, mossSoft);\n    float mossFootprint = length(fwidth(worldPosition));\n    vec3 cushion = terrainNoise(worldPosition.xz * 40.0 + worldPosition.y * 13.0);\n    float cushionDetail = 1.0 - smoothstep(0.004, 0.03, mossFootprint);\n    vec3 cushionTilt = vec3(-cushion.y, 0.0, -cushion.z) * 0.07 * mossSoft * cushionDetail;\n    normal = normalize(normal + cushionTilt - normal * dot(cushionTilt, normal));\n    mossTone = materialMoss.yzw * (0.7 + 0.6 * cushion.x);\n    color = mix(color, mossTone, mossCover);\n    roughness = mix(roughness, 1.0, mossCover);\n    metallic = mix(metallic, 0.0, mossCover);\n  }\n",
	worldLight: "  if (CANOPY_TAG) radiance += color * max(dot(gl_FrontFacing ? -normal : normal, normalize(lightDirection)), 0.0) * 0.5 * keyResponse * mix(visibility, 1.0, 0.7);\n  if (mossCover > 0.001) {\n    float sheen = pow(1.0 - max(dot(normal, viewDirection), 0.0), 4.0);\n    float wrap = max(dot(normal, normalize(lightDirection)) + 0.5, 0.0) / 1.5;\n    radiance += mossTone * (sheen * 0.8 + wrap * 0.35) * keyResponse * visibility * mossCover;\n  }\n  if (TAG_GRASS) {\n    float towardSun = pow(max(dot(-viewDirection, normalize(lightDirection)), 0.0), 3.0);\n    float thinness = textureUV.x > -0.5 ? 1.0 - textureUV.y * 0.8 : 0.6;\n    radiance += color * vec3(1.1, 1.25, 0.55) * towardSun * thinness * 1.4 * keyResponse * visibility;\n  }\n",
	worldAfterEmission: "  if (waterDepth > 0.0) {\n    vec3 scatteredLight = (keyColor * max(normalize(lightDirection).y, 0.0) * 0.1 + vec3(0.04) * ambientIntensity) * exp(-waterAbsorption * 1.5);\n    radiance = radiance * waterTransmittance + scatteredLight * (vec3(1.0) - waterTransmittance) * (0.25 + waterBody.y);\n    radiance += color * keyResponse / max(waterSunTransmittance, vec3(0.0001)) * max(dot(normal, normalize(lightDirection)), 0.0) * waterShadowVisibility * waterScatterShare * 3.4 * exp(-waterAbsorption);\n  }\n  if (TAG_WATER) {\n    float reflectivity = 0.20 + 0.65 * pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);\n    vec3 reflection = mix(vec3(0.12, 0.24, 0.28), vec3(0.40, 0.63, 0.78), clamp(reflect(-viewDirection, normal).y, 0.0, 1.0));\n    radiance = mix(radiance * 0.6, reflection * daylight * ambientIntensity, reflectivity);\n    radiance += vec3(1.0, 0.85, 0.55) * pow(max(dot(reflect(-normalize(lightDirection), normal), viewDirection), 0.0), 220.0) * 2.0 * keyResponse;\n    if (waterBody.w > 0.5 && alphaMode > 1.5) {\n      radiance = radiance * alpha + refractedBackground(radiance, worldPosition, normal, viewDirection) * (1.0 - alpha);\n      alpha = 1.0;\n    }\n  }\n",
	worldFinal: "  if (waterDepth > 0.0 && waterBody.w > 0.5 && alphaMode < 0.5) alpha = 0.5 + 0.498 * clamp(waterDepth / 8.0, 0.0, 1.0);\n  if (TAG_FIRE) {\n    float turbulence = sin(worldPosition.x * 3.0 + time * 4.0) * sin(worldPosition.y * 4.2 - time * 3.0) * sin(worldPosition.z * 3.7);\n    float heat = pow(clamp(0.55 + turbulence * 0.5 - explosionProgress * 0.12, 0.0, 1.0), 3.0);\n    radiance = mix(vec3(0.22, 0.003, 0.0002), vec3(8.0, 2.8, 0.15), heat) * max(0.2, surface.z * 0.10);\n  }\n  if (TAG_SMOKE) {\n    float turbulence = sin(worldPosition.x * 2.0 + time) * sin(worldPosition.y * 3.3 - time * 0.6);\n    radiance = color * (0.22 + turbulence * 0.12) + vec3(0.35, 0.05, 0.005) * max(0.0, 1.0 - explosionProgress) * max(0.0, -normal.y);\n  }\n"
};
t("worldMaterials", _);
function v(e, t) {
	let n = e.context;
	for (let r of [e.program, e.depthProgram]) {
		let e = n.getUniformLocation(r, "windHeading");
		e && (n.useProgram(r), n.uniform1f(e, t));
	}
	e.windHeading !== t && (e.shadowsDirty = !0), e.windHeading = t;
}
export { r as WATER_DEFAULT_PRESET, i as WATER_MAXIMUM_ABSORPTION, n as WATER_PRESETS, v as applyWindHeading, s as copyWaterFields, d as findWaterBody, o as resolveWaterMaterial, _ as worldMaterialSlots };
