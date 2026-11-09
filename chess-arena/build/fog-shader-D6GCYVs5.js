/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { l as e } from "./shader-registry-DHYkwAg5.js";
import { t } from "./volumetric-D8WftbY1.js";
var n = {
	detailOctaves: 1,
	detailAmount: .5,
	warp: 0,
	contrast: 1,
	profileSoftness: .5,
	keyScattering: 1,
	scatterOctaves: 1,
	multiScatter: .5,
	multiExtinction: .5,
	multiAnisotropy: .5,
	keyTransmittance: 0,
	surfaceTransmittance: 0
}, r = {
	detailOctaves: [
		1,
		3,
		"Volume detail octaves"
	],
	detailAmount: [
		0,
		1,
		"Volume detail amount"
	],
	warp: [
		0,
		4,
		"Volume warp"
	],
	contrast: [
		0,
		4,
		"Volume contrast"
	],
	profileSoftness: [
		0,
		.95,
		"Volume profile softness"
	],
	keyScattering: [
		0,
		10,
		"Volume key scattering"
	],
	scatterOctaves: [
		1,
		4,
		"Volume scatter octaves"
	],
	multiScatter: [
		0,
		1,
		"Volume multi scatter"
	],
	multiExtinction: [
		0,
		1,
		"Volume multi extinction"
	],
	multiAnisotropy: [
		0,
		1,
		"Volume multi anisotropy"
	],
	keyTransmittance: [
		0,
		1,
		"Volume key transmittance"
	],
	surfaceTransmittance: [
		0,
		1,
		"Volume surface transmittance"
	]
};
function i(e) {
	let i = { ...n };
	for (let [n, [a, o, s]] of Object.entries(r)) e[n] !== void 0 && (i[n] = t(e[n], a, o, s));
	if (!Number.isInteger(i.detailOctaves)) throw RangeError("Volume detail octaves must be an integer");
	if (!Number.isInteger(i.scatterOctaves)) throw RangeError("Volume scatter octaves must be an integer");
	return i;
}
function a(e) {
	let t = i(e);
	return t.detailOctaves > 1 || t.warp > 0 || t.contrast !== 1;
}
var o = .1;
function s() {
	return {
		count: 0,
		positions: /* @__PURE__ */ new Float32Array(32),
		colors: /* @__PURE__ */ new Float32Array(32),
		directions: /* @__PURE__ */ new Float32Array(32),
		cones: /* @__PURE__ */ new Float32Array(32)
	};
}
function c(e, t, n, r) {
	let i = t * 4, a = r * 4;
	e.positions.set(n.positions.subarray(a, a + 4), i);
	let s = n.colors[a + 3];
	for (let t = 0; t < 3; t++) e.colors[i + t] = n.colors[a + t] * s;
	e.colors[i + 3] = Math.max(n.radii[r], o), e.directions.fill(0, i, i + 4), e.cones.fill(0, i, i + 4);
}
function l(e, t, n, r) {
	let i = t * 4, a = r * 4;
	e.positions.set(n.spotPositions.subarray(a, a + 4), i);
	let s = n.spotColors[a + 3];
	for (let t = 0; t < 3; t++) e.colors[i + t] = n.spotColors[a + t] * s;
	e.colors[i + 3] = Math.max(n.spotParameters[a], o), e.directions.set(n.spotDirections.subarray(a, a + 4), i), e.cones[i] = n.spotParameters[a + 1], e.cones[i + 1] = 1, e.cones[i + 2] = 0, e.cones[i + 3] = 0;
}
function u(e, t) {
	let n = 0;
	for (let r = 0; r < Math.min(e.pointCount, 16) && n < 8; r++) e.colors[r * 4 + 3] !== 0 && c(t, n++, e, r);
	for (let r = 0; r < Math.min(e.spotCount, 8) && n < 8; r++) e.spotColors[r * 4 + 3] !== 0 && l(t, n++, e, r);
	return t.count = n, n;
}
var d = class {
	constructor(e) {
		this.context = e, this.texture = null, this.width = 0, this.height = 0;
	}
	upload(e) {
		let t = this.context;
		this.texture ? t.bindTexture(t.TEXTURE_2D, this.texture) : (this.texture = t.createTexture(), t.bindTexture(t.TEXTURE_2D, this.texture), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE)), e.width === this.width && e.height === this.height ? t.texSubImage2D(t.TEXTURE_2D, 0, 0, 0, e.width, e.height, t.RGBA, t.FLOAT, e.data) : (t.texImage2D(t.TEXTURE_2D, 0, t.RGBA16F, e.width, e.height, 0, t.RGBA, t.FLOAT, e.data), this.width = e.width, this.height = e.height);
	}
	dispose() {
		this.texture && this.context.deleteTexture(this.texture), this.texture = null, this.width = 0, this.height = 0;
	}
}, f = /* @__PURE__ */ new WeakMap();
function p(e, t, n) {
	if (e.shadowAmbient !== void 0) return e.shadowAmbient;
	let r = `${e.minimum}|${e.maximum}`, i = f.get(t);
	if (i?.key === r) return i.value;
	let a = e.minimum.map((t, n) => (t + e.maximum[n]) / 2), o = .15 + .85 * (n?.(t, a) ?? 0);
	return f.set(t, {
		key: r,
		value: o
	}), o;
}
// src/fog-shader.js
function m(e, t, n, r, i) {
	let a = e.context;
	a.activeTexture(a.TEXTURE3), a.bindTexture(a.TEXTURE_2D, e.shadowTexture), a.uniform1i(t.uniforms.volumeShadowMap, 3), a.uniformMatrix4fv(t.uniforms.volumeLightProjection, !1, e.lightProjection), a.uniform3fv(t.uniforms.volumeLightDirection, r.lightDirection), a.uniform3fv(t.uniforms.volumeLightColor, e.lighting.keyColor), a.uniform1f(t.uniforms.volumeDensity, n.density), a.uniform3fv(t.uniforms.volumeMinimum, n.minimum), a.uniform3fv(t.uniforms.volumeMaximum, n.maximum), a.uniform3fv(t.uniforms.volumeColor, n.color), a.uniform3fv(t.uniforms.volumeAmbient, n.ambient), a.uniform3fv(t.uniforms.volumeDrift, n.drift), a.uniform1i(t.uniforms.volumeSteps, n.steps), a.uniform1f(t.uniforms.volumeAnisotropy, n.anisotropy), a.uniform1f(t.uniforms.volumeShadowAmbient, p(n, e.sceneParts, e.skyOpenness)), a.uniform1f(t.uniforms.volumeNoiseAmount, n.noiseAmount), a.uniform1f(t.uniforms.volumeNoiseScale, n.noiseScale), a.uniform1f(t.uniforms.volumeMaxDistance, n.maxDistance), a.uniform1f(t.uniforms.volumeHeightFalloff, n.heightFalloff), g(e, t, n), h(a, t, n), a.uniform1f(t.uniforms.orthographic, +(i.projection === "orthographic")), a.uniform1i(t.uniforms.fogSkyVisibility, 5), a.uniform1f(t.uniforms.volumeGridFog, +!!e.sceneParts.some((e) => e.material?.irradianceGrid));
}
function h(e, t, n) {
	let r = i(n), a = (n) => t.uniforms[n] ??= e.getUniformLocation(t.program, n);
	e.uniform1i(a("volumeDetailOctaves"), r.detailOctaves), e.uniform1f(a("volumeDetailAmount"), r.detailAmount), e.uniform1f(a("volumeWarp"), r.warp), e.uniform1f(a("volumeContrast"), r.contrast), e.uniform1f(a("volumeProfileStart"), r.profileSoftness), e.uniform1f(a("volumeKeyScattering"), r.keyScattering), e.uniform1i(a("volumeScatterOctaves"), r.scatterOctaves), e.uniform1f(a("volumeMultiScatter"), r.multiScatter), e.uniform1f(a("volumeMultiExtinction"), r.multiExtinction), e.uniform1f(a("volumeMultiAnisotropy"), r.multiAnisotropy), e.uniform1f(a("volumeKeyTransmittance"), r.keyTransmittance), e.uniform1f(a("volumeSurfaceTransmittance"), r.surfaceTransmittance);
}
function g(e, t, n) {
	let r = e.context;
	n.field && (e.fogFieldTexture ??= new d(r), r.activeTexture(r.TEXTURE6), e.fogFieldTexture.upload(n.field), r.uniform1i(t.uniforms.volumeField, 6), r.uniform1f(t.uniforms.volumeProfile, +(n.profile === "smoothstep")), r.uniform1f(t.uniforms.volumeFlowStrength, n.flowStrength ?? 1), r.uniform1f(t.uniforms.volumeFlowPeriod, n.flowPeriod ?? 2));
	let i = e.fogLightBuffers;
	r.uniform1i(t.uniforms.volumeLightCount, i.count), i.count !== 0 && (r.uniform4fv(t.uniforms["volumeLightPositions[0]"], i.positions), r.uniform4fv(t.uniforms["volumeLightColors[0]"], i.colors), r.uniform4fv(t.uniforms["volumeLightDirections[0]"], i.directions), r.uniform4fv(t.uniforms["volumeLightCones[0]"], i.cones));
}
function _(e) {
	e.fogLightBuffers ??= s(), u(e.lighting, e.fogLightBuffers);
}
e("volumeFog", {
	support: {
		packLights: _,
		bindUniforms: m,
		usesDetail: a
	},
	postDeclarations: "\nuniform highp sampler2DShadow volumeShadowMap;\nuniform mat4 volumeLightProjection;\nuniform vec3 volumeLightDirection;\nuniform vec3 volumeLightColor;\nuniform float volumeDensity;\nuniform vec3 volumeMinimum;\nuniform vec3 volumeMaximum;\nuniform vec3 volumeColor;\nuniform vec3 volumeAmbient;\nuniform vec3 volumeDrift;\nuniform int volumeSteps;\nuniform float volumeAnisotropy;\nuniform float volumeShadowAmbient;\nuniform float volumeGridFog;\nuniform float volumeNoiseAmount;\nuniform float volumeNoiseScale;\nuniform float volumeMaxDistance;\nuniform float volumeHeightFalloff;\nuniform sampler2D volumeField;\nuniform float volumeProfile;\nuniform float volumeFlowStrength;\nuniform float volumeFlowPeriod;\nuniform int volumeDetailOctaves;\nuniform float volumeDetailAmount;\nuniform float volumeWarp;\nuniform float volumeContrast;\nuniform float volumeProfileStart;\nuniform float volumeKeyScattering;\nuniform int volumeScatterOctaves;\nuniform float volumeMultiScatter;\nuniform float volumeMultiExtinction;\nuniform float volumeMultiAnisotropy;\nuniform float volumeKeyTransmittance;\nuniform float volumeSurfaceTransmittance;\nuniform int volumeLightCount;\nuniform vec4 volumeLightPositions[8];\nuniform vec4 volumeLightColors[8];\nuniform vec4 volumeLightDirections[8];\nuniform vec4 volumeLightCones[8];\nuniform float orthographic;\nuniform highp sampler3D fogSkyVisibility;\n",
	postFunctions: "\nfloat henyeyGreenstein(float cosine, float anisotropy) {\n  return (1.0 - anisotropy * anisotropy) / (12.5663706 * pow(1.0 + anisotropy * anisotropy - 2.0 * anisotropy * cosine, 1.5));\n}\nfloat fogLightAttenuation(float distanceSquared, float range, float radius) {\n  float cutoff = 1.0;\n  if (range > 0.0) {\n    float squaredRatio = distanceSquared / (range * range);\n    float fade = max(1.0 - squaredRatio * squaredRatio, 0.0);\n    cutoff = fade * fade;\n  }\n  return cutoff / max(distanceSquared, radius * radius);\n}\nvec3 fogLightScattering(vec3 position, vec3 direction) {\n  vec3 total = vec3(0);\n  for (int index = 0; index < 8; index++) {\n    if (index >= volumeLightCount) break;\n    vec3 offset = volumeLightPositions[index].xyz - position;\n    float distanceSquared = dot(offset, offset);\n    if (distanceSquared < 1e-12) continue;\n    vec3 toLight = offset * inversesqrt(distanceSquared);\n    float attenuation = fogLightAttenuation(distanceSquared, volumeLightPositions[index].w, volumeLightColors[index].w);\n    if (volumeLightCones[index].y > 0.5) attenuation *= smoothstep(volumeLightDirections[index].w, volumeLightCones[index].x, dot(-toLight, volumeLightDirections[index].xyz));\n    if (attenuation <= 0.0) continue;\n    float denominator = 1.0 + volumeAnisotropy * volumeAnisotropy - 2.0 * volumeAnisotropy * dot(direction, toLight);\n    total += volumeLightColors[index].rgb * (attenuation * (1.0 - volumeAnisotropy * volumeAnisotropy) / (12.5663706 * denominator * sqrt(denominator)));\n  }\n  return total;\n}\nfloat flowedNoise(vec3 samplePosition, vec2 velocity, float noiseScale) {\n  float firstPhase = fract(time / volumeFlowPeriod);\n  float secondPhase = fract(time / volumeFlowPeriod + 0.5);\n  vec3 travel = vec3(velocity.x, 0.0, velocity.y) * volumeFlowStrength * volumeFlowPeriod;\n  float first = cloudNoise((samplePosition - travel * firstPhase) * noiseScale);\n  float second = cloudNoise((samplePosition - travel * secondPhase) * noiseScale);\n  return mix(first, second, abs(2.0 * firstPhase - 1.0));\n}\nfloat noiseAt(vec3 samplePosition, vec2 velocity, float noiseScale) {\n  return POST_FIELD ? flowedNoise(samplePosition, velocity, noiseScale) : cloudNoise(samplePosition * noiseScale);\n}\nfloat densityNoise(vec3 samplePosition, vec2 velocity) {\n  vec3 warped = samplePosition;\n  if (POST_DETAIL && volumeWarp > 0.0) {\n    vec3 seed = samplePosition * volumeNoiseScale * 0.5;\n    vec3 offset = vec3(cloudNoise(seed + 17.0), cloudNoise(seed + 43.0), cloudNoise(seed + 71.0)) - 0.5;\n    warped += offset * (2.0 * volumeWarp / volumeNoiseScale);\n  }\n  float lookup = noiseAt(warped, velocity, volumeNoiseScale);\n  if (POST_DETAIL) {\n    float total = 1.0;\n    float sum = lookup;\n    if (volumeDetailOctaves > 1) {\n      float weight = 0.5 * volumeDetailAmount;\n      sum += weight * noiseAt(warped, velocity, volumeNoiseScale * 2.0);\n      total += weight;\n    }\n    if (volumeDetailOctaves > 2) {\n      float weight = 0.25 * volumeDetailAmount;\n      sum += weight * noiseAt(warped, velocity, volumeNoiseScale * 4.0);\n      total += weight;\n    }\n    lookup = clamp(0.5 + (sum / total - 0.5) * volumeContrast, 0.0, 1.0);\n  }\n  return lookup;\n}\nfloat layerProfile(float relativeHeight) {\n  return volumeProfile > 0.5 ? 1.0 - smoothstep(volumeProfileStart, 1.0, relativeHeight) : exp(-relativeHeight);\n}\nfloat fogDensityFactor(vec3 position) {\n  float noise = 1.0;\n  vec4 field = POST_FIELD ? texture(volumeField, (position.xz - volumeMinimum.xz) / (volumeMaximum.xz - volumeMinimum.xz)) : vec4(1);\n  if (volumeNoiseAmount > 0.0) {\n    float lookup = densityNoise(position - volumeDrift * time, field.zw);\n    noise = mix(1.0, lookup * 2.0, volumeNoiseAmount);\n  }\n  if (POST_FIELD) noise *= field.r * layerProfile((position.y - volumeMinimum.y) / max(field.g, 0.0001));\n  else if (volumeHeightFalloff > 0.0) noise *= exp((volumeMinimum.y - position.y) / volumeHeightFalloff);\n  return noise;\n}\nfloat keyVisibility(vec3 position) {\n  vec4 lightPosition = volumeLightProjection * vec4(position, 1);\n  vec3 shadow = lightPosition.xyz / lightPosition.w * 0.5 + 0.5;\n  if (all(greaterThanEqual(shadow, vec3(0))) && all(lessThanEqual(shadow, vec3(1)))) {\n    return texture(volumeShadowMap, vec3(shadow.xy, shadow.z - 0.0008));\n  }\n  return 1.0;\n}\nfloat sunOpticalDepth(vec3 position, vec3 towardSun) {\n  float exitDistance = volumeMaxDistance;\n  for (int axis = 0; axis < 3; axis++) {\n    if (towardSun[axis] == 0.0) continue;\n    float first = (volumeMinimum[axis] - position[axis]) / towardSun[axis];\n    float second = (volumeMaximum[axis] - position[axis]) / towardSun[axis];\n    exitDistance = min(exitDistance, max(first, second));\n  }\n  exitDistance = max(exitDistance, 0.0);\n  float sum = 0.0;\n  for (int tap = 0; tap < 3; tap++) sum += fogDensityFactor(position + towardSun * (exitDistance * (float(tap) + 0.5) / 3.0));\n  return volumeDensity * sum * exitDistance / 3.0;\n}\nfloat keyInScatter(float cosine, float opticalDepth) {\n  float total = 0.0;\n  float weight = 1.0;\n  float extinction = 1.0;\n  float anisotropy = volumeAnisotropy;\n  for (int octave = 0; octave < 4; octave++) {\n    if (octave >= volumeScatterOctaves) break;\n    total += weight * henyeyGreenstein(cosine, anisotropy) * exp(-opticalDepth * volumeKeyTransmittance * extinction);\n    weight *= volumeMultiScatter;\n    extinction *= volumeMultiExtinction;\n    anisotropy *= volumeMultiAnisotropy;\n  }\n  return total;\n}\nvec3 volumeFog(vec3 background) {\n  vec2 clipXY = textureCoordinate * 2.0 - 1.0;\n  vec4 farPoint = inverseViewProjection * vec4(clipXY, 1.0, 1.0);\n  vec4 nearPoint = inverseViewProjection * vec4(clipXY, -1.0, 1.0);\n  vec3 origin = orthographic > 0.5 ? nearPoint.xyz / nearPoint.w : eye;\n  vec3 direction = normalize(farPoint.xyz - origin * farPoint.w);\n  float depth = texture(sceneDepth, textureCoordinate).r;\n  vec4 surfacePoint = inverseViewProjection * vec4(clipXY, depth * 2.0 - 1.0, 1.0);\n  float surfaceDistance = volumeMaxDistance;\n  if (surfacePoint.w > 0.0) surfaceDistance = max(0.0, dot(surfacePoint.xyz - origin * surfacePoint.w, direction) / surfacePoint.w);\n  float exitDistance = min(volumeMaxDistance, surfaceDistance);\n  float boxExit = volumeMaxDistance;\n  float entry = 0.0;\n  for (int axis = 0; axis < 3; axis++) {\n    if (direction[axis] == 0.0) {\n      if (origin[axis] < volumeMinimum[axis] || origin[axis] > volumeMaximum[axis]) return background;\n    } else {\n      float first = (volumeMinimum[axis] - origin[axis]) / direction[axis];\n      float second = (volumeMaximum[axis] - origin[axis]) / direction[axis];\n      entry = max(entry, min(first, second));\n      exitDistance = min(exitDistance, max(first, second));\n      boxExit = min(boxExit, max(first, second));\n    }\n  }\n  if (entry >= exitDistance) return background;\n  float stepSize = (exitDistance - entry) / float(volumeSteps);\n  vec3 lightDirection = normalize(volumeLightDirection);\n  float cosine = dot(direction, lightDirection);\n  float anisotropy = volumeAnisotropy;\n  vec3 towardSun = lightDirection;\n  bool sunTransmittance = volumeKeyTransmittance > 0.0 || volumeScatterOctaves > 1;\n  float jitter = hash(vec3(gl_FragCoord.xy, 0));\n  float transmittance = 1.0;\n  vec3 accumulated = vec3(0);\n  for (int index = 0; index < 48; index++) {\n    if (index >= volumeSteps) break;\n    vec3 position = origin + direction * (entry + (float(index) + jitter) * stepSize);\n    float noise = fogDensityFactor(position);\n    float opacity = 1.0 - exp(-volumeDensity * noise * stepSize);\n    float visibility = keyVisibility(position);\n    vec4 skyCell = POST_SKY ? texture(fogSkyVisibility, (position - volumeMinimum) / (volumeMaximum - volumeMinimum)) : vec4(0);\n    float shadowShare = POST_SKY ? 0.1 + 0.9 * min(1.0, 30.0 * skyCell.r) : volumeShadowAmbient;\n    float ambientShare = mix(shadowShare, 1.0, visibility);\n    if (volumeGridFog > 0.5) ambientShare = min(1.0, 30.0 * skyCell.r);\n    float opticalDepth = 0.0;\n    if (sunTransmittance && visibility > 0.001) opticalDepth = sunOpticalDepth(position, towardSun);\n    float phase = keyInScatter(cosine, opticalDepth);\n    vec3 scattering = volumeColor * (volumeAmbient * ambientShare + 0.6 * skyCell.gba + volumeLightColor * (phase * visibility * volumeKeyScattering));\n    if (POST_LIGHTS) scattering += volumeColor * fogLightScattering(position, direction);\n    accumulated += transmittance * opacity * scattering;\n    transmittance *= 1.0 - opacity;\n    if (transmittance < 0.001) break;\n  }\n  for (int tap = 0; tap < 24; tap++) {\n    float index = float(tap) + 0.5;\n    float radius = 0.03 + 0.0002 * index * index;\n    vec2 offset = vec2(cos(index * 2.4) * resolution.y / resolution.x, sin(index * 2.4)) * radius;\n    accumulated += textureLod(frameTexture, textureCoordinate + offset, log2(0.7 * radius * resolution.y)).rgb * volumeColor * (0.009 * (1.0 - transmittance) / (1.0 + 0.04 * index));\n  }\n  float surfaceSun = 1.0;\n  if (volumeSurfaceTransmittance > 0.0 && surfacePoint.w > 0.0 && surfaceDistance <= boxExit) {\n    vec3 surfacePosition = origin + direction * surfaceDistance + towardSun * 0.05;\n    float surfaceVisibility = keyVisibility(surfacePosition);\n    if (surfaceVisibility > 0.001) surfaceSun = mix(1.0, exp(-sunOpticalDepth(surfacePosition, towardSun) * volumeSurfaceTransmittance), surfaceVisibility);\n  }\n  return accumulated + background * transmittance * surfaceSun;\n}\n"
});
