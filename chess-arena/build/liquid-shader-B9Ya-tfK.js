/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { t as e } from "./environment-shading-BFHO3WeH.js";
import { l as t } from "./shader-registry-DHYkwAg5.js";
import { i as n, n as r } from "./gl-program-KwXE3oHO.js";
import { n as i } from "./liquid-optics-DJcQhRHD.js";
// src/liquid-renderer.js
var a = /* @__PURE__ */ "viewProjection.lightProjection.eye.sceneColor.resolution.exposure.hdrEnabled.worldMode.daylight.lightDirection.keyColor.ambientIntensity.fogColor.fogDensity.glassState.glassTint.liquidOptics.foamShape.environmentSpecular.environmentEnabled.environmentIntensity.environmentRotation.environmentLevelMax.time.wind.explosionProgress.explosionCenter.assemblyAmount.skinEnabled.skinInfluences.jointPalette.morphEnabled.morphVertexCount.morphTargetCount.morphWeights[0].morphTargets".split(".");
function o(e, t, i, o) {
	if (e.liquidProgram) return;
	let s = e.context;
	e.liquidProgram = r(s, n(s, i, e.withViewTransform(o, "liquid"))), e.liquidUniforms = Object.fromEntries(a.map((t) => [t, s.getUniformLocation(e.liquidProgram, t)])), s.useProgram(e.liquidProgram), s.uniform1i(e.liquidUniforms.skinInfluences, 6), s.uniform1i(e.liquidUniforms.jointPalette, 7), s.uniform1i(e.liquidUniforms.morphTargets, 8), s.uniform1i(e.liquidUniforms.environmentSpecular, t);
}
function s(e, { frame: t, environment: n, assemblyAmount: r, environmentMap: a, liquids: s, foams: c, environmentSpecularUnit: l, maximumDistance: u, vertexSource: d, fragmentSource: f }) {
	let p = i({
		...n.liquid,
		...t.liquid
	});
	o(e, l, d, f);
	let m = e.context, h = e.canvas.width, g = e.canvas.height;
	m.bindFramebuffer(m.READ_FRAMEBUFFER, e.multisampleFramebuffer), m.bindFramebuffer(m.DRAW_FRAMEBUFFER, e.resolveFramebuffer), m.blitFramebuffer(0, 0, h, g, 0, 0, h, g, m.COLOR_BUFFER_BIT, m.NEAREST), m.bindFramebuffer(m.FRAMEBUFFER, e.multisampleFramebuffer), m.viewport(0, 0, h, g), m.enable(m.DEPTH_TEST), m.enable(m.CULL_FACE), m.useProgram(e.liquidProgram);
	let _ = e.liquidUniforms;
	m.uniformMatrix4fv(_.viewProjection, !1, e.rasterViewProjection ?? e.viewProjection), m.uniformMatrix4fv(_.lightProjection, !1, e.lightProjection), m.uniform3fv(_.eye, t.eye), m.uniform2f(_.resolution, h, g), m.uniform1f(_.exposure, t.exposure ?? 1), m.uniform1f(_.hdrEnabled, +!!e.hdr), m.uniform1f(_.worldMode, +!!e.world), m.uniform1f(_.daylight, n.daylight), m.uniform3fv(_.lightDirection, n.lightDirection), m.uniform3fv(_.keyColor, e.lighting.keyColor), m.uniform1f(_.ambientIntensity, e.lighting.ambientIntensity), m.uniform3fv(_.fogColor, n.fogColor), m.uniform1f(_.fogDensity, n.fogDensity), m.uniform4f(_.liquidOptics, p.thickness, p.ior, p.refraction, p.scattering), m.uniform2f(_.foamShape, p.foamOpacity, p.foamSoftness), e.applyEnvironmentUniforms(a, _), m.uniform1f(_.time, t.time ?? 0), m.uniform1f(_.wind, t.wind ?? .3), m.uniform1f(_.explosionProgress, t.explosionProgress ?? 1), m.uniform3fv(_.explosionCenter, n.explosionCenter), m.uniform1f(_.assemblyAmount, r), _.skinEnabled && m.uniform1f(_.skinEnabled, 0), _.morphEnabled && m.uniform1f(_.morphEnabled, 0), m.activeTexture(m.TEXTURE0), m.bindTexture(m.TEXTURE_2D, e.frameTexture), m.uniform1i(_.sceneColor, 0);
	for (let e of s) {
		let t = e.layerState;
		m.uniform4f(_.glassState, t[9], t[10], t[11], Math.min(t[12], u)), m.uniform3f(_.glassTint, t[13], t[14], t[15]), m.bindVertexArray(e.vertexArray), m.drawElementsInstanced(m.TRIANGLES, e.indexCount, m.UNSIGNED_INT, 0, e.instanceCount);
	}
	if (c.length > 0) {
		m.enable(m.BLEND), m.blendFuncSeparate(m.SRC_ALPHA, m.ONE_MINUS_SRC_ALPHA, m.ONE, m.ONE_MINUS_SRC_ALPHA), m.depthMask(!1);
		for (let e of c) m.bindVertexArray(e.vertexArray), m.drawElementsInstanced(m.TRIANGLES, e.indexCount, m.UNSIGNED_INT, 0, e.instanceCount);
		m.depthMask(!0), m.disable(m.BLEND);
	}
	m.bindVertexArray(null);
}
// src/liquid-shader.js
var c = `#version 300 es
precision highp float;
in vec3 worldPosition;
in vec3 worldNormal;
flat in vec3 baseColor;
flat in vec4 surface;
in vec4 shadowPosition;
in vec2 textureUV;
in vec3 vertexTint;
uniform vec3 eye;
uniform mat4 viewProjection;
uniform sampler2D sceneColor;
uniform vec2 resolution;
uniform float exposure;
uniform float hdrEnabled;
uniform float worldMode;
uniform float daylight;
uniform vec3 lightDirection;
uniform vec3 keyColor;
uniform float ambientIntensity;
uniform vec3 fogColor;
uniform float fogDensity;
uniform vec4 liquidOptics;
uniform vec4 glassState;
uniform vec3 glassTint;
uniform vec2 foamShape;
out vec4 outputColor;
const float PI = 3.14159265359;

vec3 toneMap(vec3 color) {
  return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
}

${e}
uniform float environmentEnabled;

vec3 environmentColor(vec3 direction, float roughness) {
  if (environmentEnabled > 0.5) return environmentRadiance(direction, roughness * environmentLevelMax);
  if (worldMode > 0.5) {
    vec3 zenith = vec3(0.20, 0.38, 0.52) * max(daylight, 0.08);
    return mix(fogColor * 0.75, zenith, smoothstep(-0.15, 0.7, direction.y));
  }
  vec3 color = mix(vec3(0.025, 0.035, 0.045), vec3(0.22, 0.25, 0.27), smoothstep(-0.3, 0.8, direction.y));
  float blur = roughness * 0.35;
  float key = smoothstep(0.80 - blur, 0.87, dot(direction, normalize(vec3(-3.0, 5.0, 4.0))));
  float rim = smoothstep(0.90 - blur, 0.97, dot(direction, normalize(vec3(4.0, 2.0, -3.0))));
  float strip = exp(-pow((direction.x + 0.6) / (0.035 + blur), 2.0)) * smoothstep(-0.1, 0.6, direction.y);
  return color + key * vec3(2.8, 2.2, 1.6) + rim * vec3(0.5, 1.6, 1.5) + strip * vec3(0.7);
}

float specularLobe(vec3 normal, vec3 viewDirection, vec3 light, float roughness) {
  float normalLight = max(dot(normal, light), 0.0);
  if (normalLight == 0.0) return 0.0;
  vec3 halfway = normalize(viewDirection + light);
  float normalView = max(dot(normal, viewDirection), 0.001);
  float normalHalf = max(dot(normal, halfway), 0.0);
  float alpha = roughness * roughness;
  float denominator = normalHalf * normalHalf * (alpha * alpha - 1.0) + 1.0;
  float distribution = alpha * alpha / max(PI * denominator * denominator, 0.00001);
  float masking = pow(roughness + 1.0, 2.0) / 8.0;
  float geometry = normalView / (normalView * (1.0 - masking) + masking) * normalLight / (normalLight * (1.0 - masking) + masking);
  return distribution * geometry / max(4.0 * normalView * normalLight, 0.001) * normalLight;
}

vec3 ambientLight(vec3 normal) {
  vec3 studioAmbient = vec3(0.16, 0.20, 0.22) * (0.45 + 0.55 * max(normal.y, 0.0));
  vec3 worldAmbient = vec3(0.19, 0.25, 0.30) * max(daylight, 0.08) * (0.45 + 0.55 * max(normal.y, 0.0));
  return mix(studioAmbient, worldAmbient, worldMode) * ambientIntensity;
}

vec3 displayed(vec3 radiance) {
  return hdrEnabled > 0.5 ? clamp(radiance * exposure, vec3(0), vec3(65504.0)) : pow(toneMap(radiance * exposure), vec3(1.0 / 2.2));
}

void main() {
  vec3 normal = normalize(worldNormal);
  if (!gl_FrontFacing) normal = -normal;
  vec3 viewDirection = normalize(eye - worldPosition);
  float facing = max(dot(normal, viewDirection), 0.0);
  vec3 light = normalize(lightDirection);
  vec3 color = baseColor * vertexTint;
  float fog = (1.0 - exp(-length(worldPosition - eye) * fogDensity)) * worldMode;

  if (surface.w == 12.0) {
    float alpha = foamShape.x * smoothstep(0.0, max(foamShape.y, 0.001), facing);
    if (alpha < 0.004) discard;
    float wrapped = max(dot(normal, light) * 0.5 + 0.5, 0.0);
    vec3 radiance = color * (ambientLight(normal) * 1.6 + keyColor * wrapped * 0.32);
    radiance = mix(radiance, fogColor, fog);
    outputColor = vec4(displayed(radiance), alpha);
    return;
  }

  float roughness = clamp(surface.y, 0.02, 1.0);
  vec2 screen = gl_FragCoord.xy / resolution;
  bool glass = glassState.x > 0.0;
  float indexOfRefraction = glass ? glassState.y : liquidOptics.y;
  float thickness = (glass ? glassState.z : liquidOptics.x) * mix(0.15, 1.0, facing);
  vec3 bent = refract(-viewDirection, normal, 1.0 / indexOfRefraction);
  vec4 projected = viewProjection * vec4(worldPosition + bent * thickness, 1.0);
  vec2 refracted = projected.w > 0.0 ? projected.xy / projected.w * 0.5 + 0.5 : screen;
  refracted = clamp(mix(screen, refracted, glass ? 1.0 : liquidOptics.z), vec2(0.001), vec2(0.999));
  vec3 behind = texture(sceneColor, refracted).rgb;
  vec3 absorption = pow(clamp(glass ? glassTint : color, vec3(0.001), vec3(1.0)), vec3(glass ? thickness / glassState.w : thickness));
  vec3 transmittance = glass ? color * absorption : absorption;
  float surfaceReflectance = pow((indexOfRefraction - 1.0) / (indexOfRefraction + 1.0), 2.0);
  float reflectance = surfaceReflectance + (1.0 - surfaceReflectance) * pow(1.0 - facing, 5.0);
  vec3 inScatter = color * (ambientLight(normal) + keyColor * max(dot(normal, light), 0.0) * 0.2) * (glass ? 0.0 : liquidOptics.w) * (1.0 - transmittance);
  vec3 diffuseShare = glass ? color * (1.0 - glassState.x) * (ambientLight(normal) + keyColor * max(dot(normal, light), 0.0) / PI) : vec3(0.0);
  vec3 reflection = environmentColor(reflect(-viewDirection, normal), roughness) * ambientIntensity;
  vec3 highlight = keyColor * specularLobe(normal, viewDirection, light, roughness);
  vec3 surfaceLight = (inScatter + diffuseShare) * (1.0 - reflectance) + reflection * reflectance + highlight;
  surfaceLight = mix(surfaceLight, fogColor, fog);
  float transmitted = glass ? glassState.x : 1.0;
  outputColor = vec4(behind * transmittance * transmitted * (1.0 - reflectance) * (1.0 - fog) + displayed(surfaceLight), 1.0);
}`;
t("liquid", {
	fragment: c,
	draw: s
});
export { c as t };
