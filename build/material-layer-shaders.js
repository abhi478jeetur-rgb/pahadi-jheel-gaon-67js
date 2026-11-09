/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e, l as t } from "./shader-registry-DHYkwAg5.js";
// src/material-layer-shaders.js
var n = "#ifndef ANISOTROPY_DECLARED\n#define ANISOTROPY_DECLARED\nuniform vec2 materialAnisotropy;\nfloat anisotropyStrength = 0.0;\nvec3 anisotropyTangent = vec3(1.0, 0.0, 0.0);\nvec3 anisotropyBitangent = vec3(0.0, 0.0, 1.0);\nvec3 anisotropyFrameTangent = vec3(1.0, 0.0, 0.0);\nvec3 anisotropyFrameBitangent = vec3(0.0, 0.0, 1.0);\nfloat anisotropicSpecular(vec3 normal, vec3 viewDirection, vec3 lightDirection, vec3 halfway, float alpha) {\n  float alphaTangent = mix(alpha, 1.0, anisotropyStrength * anisotropyStrength);\n  float alphaBitangent = alpha;\n  float normalLight = max(dot(normal, lightDirection), 0.0001);\n  float normalView = max(dot(normal, viewDirection), 0.001);\n  float normalHalf = max(dot(normal, halfway), 0.0);\n  float tangentHalf = dot(anisotropyTangent, halfway) / alphaTangent;\n  float bitangentHalf = dot(anisotropyBitangent, halfway) / alphaBitangent;\n  float shape = tangentHalf * tangentHalf + bitangentHalf * bitangentHalf + normalHalf * normalHalf;\n  float distribution = 1.0 / (PI * alphaTangent * alphaBitangent * shape * shape);\n  vec3 viewScaled = vec3(alphaTangent * dot(anisotropyTangent, viewDirection), alphaBitangent * dot(anisotropyBitangent, viewDirection), normalView);\n  vec3 lightScaled = vec3(alphaTangent * dot(anisotropyTangent, lightDirection), alphaBitangent * dot(anisotropyBitangent, lightDirection), normalLight);\n  float visibility = 0.5 / max(normalLight * length(viewScaled) + normalView * length(lightScaled), 0.00001);\n  return distribution * visibility;\n}\n\nvoid setAnisotropyFrame(vec3 normal) {\n  vec3 tangent = vec3(0.0);\n  vec2 uvX = dFdx(textureUV);\n  vec2 uvY = dFdy(textureUV);\n  float uvScale = max(max(abs(uvX.x), abs(uvX.y)), max(abs(uvY.x), abs(uvY.y)));\n  if (uvScale > 0.0) {\n    uvX /= uvScale;\n    uvY /= uvScale;\n    float determinant = uvX.x * uvY.y - uvX.y * uvY.x;\n    if (determinant != 0.0) tangent = (dFdx(worldPosition) * uvY.y - dFdy(worldPosition) * uvX.y) / determinant;\n  }\n  tangent -= normal * dot(normal, tangent);\n  float tangentScale = max(max(abs(tangent.x), abs(tangent.y)), abs(tangent.z));\n  if (tangentScale == 0.0) {\n    vec3 ringAxis = abs(normal.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);\n    tangent = cross(ringAxis, normal);\n    tangentScale = 1.0;\n  }\n  tangent = normalize(tangent / tangentScale);\n  vec3 bitangent = cross(normal, tangent);\n  anisotropyFrameTangent = tangent;\n  anisotropyFrameBitangent = bitangent;\n  anisotropyTangent = tangent * cos(materialAnisotropy.y) + bitangent * sin(materialAnisotropy.y);\n  anisotropyBitangent = cross(normal, anisotropyTangent);\n}\n#endif\n\n";
t("anisotropy", Object.freeze({
	declarations: n,
	illuminateSpecular: "  if (anisotropyStrength > 0.0) specular = anisotropicSpecular(normal, viewDirection, lightDirection, halfway, max(alpha, 0.002)) * reflectance;\n",
	coatReset: "  anisotropyStrength = 0.0;\n",
	mainSetup: "  if (materialAnisotropy.x > 0.0) {\n    anisotropyStrength = materialAnisotropy.x;\n    setAnisotropyFrame(normal);\n#ifdef ANISOTROPY_TEXTURE\n    if (anisotropyTextureOn > 0.5) applyAnisotropyTexture(normal);\n#endif\n    vec3 grainSide = cross(anisotropyBitangent, viewDirection);\n    vec3 grainNormal = cross(grainSide, anisotropyBitangent);\n    specularNormal = normalize(mix(normal, grainNormal, anisotropyStrength * clamp(5.0 * roughness, 0.0, 1.0)));\n  }\n"
})), t("iridescence", Object.freeze({
	declarations: "uniform vec3 materialIridescence;\nfloat iridescenceWeight = 0.0;\nvec3 iridescentReflectance = vec3(0.04);\n\nvec3 filmSensitivity(float pathDifference, vec3 phaseShift) {\n  float phase = 2.0 * PI * pathDifference * 1.0e-9;\n  vec3 amplitude = vec3(5.4856e-13, 4.4201e-13, 5.2481e-13);\n  vec3 position = vec3(1.6810e+06, 1.7953e+06, 2.2084e+06);\n  vec3 variance = vec3(4.3278e+09, 9.3046e+09, 6.6121e+09);\n  vec3 xyz = amplitude * sqrt(2.0 * PI * variance) * cos(position * phase + phaseShift) * exp(-phase * phase * variance);\n  xyz.x += 9.7470e-14 * sqrt(2.0 * PI * 4.5282e+09) * cos(2.2399e+06 * phase + phaseShift.x) * exp(-4.5282e+09 * phase * phase);\n  xyz /= 1.0685e-7;\n  mat3 xyzToLinearRgb = mat3(3.2404542, -0.9692660, 0.0556434, -1.5371385, 1.8760108, -0.2040259, -0.4985314, 0.0415560, 1.0572252);\n  return xyzToLinearRgb * xyz;\n}\n\nvec3 filmReflectance(float filmIor, float cosineView, float thickness, vec3 baseReflectance) {\n  float outsideIor = 1.0;\n  float filmIndex = mix(outsideIor, filmIor, smoothstep(0.0, 0.03, thickness));\n  float sineFilmSquared = pow(outsideIor / filmIndex, 2.0) * (1.0 - cosineView * cosineView);\n  if (sineFilmSquared > 1.0) return vec3(1.0);\n  float cosineFilm = sqrt(1.0 - sineFilmSquared);\n  float topNormal = pow((filmIndex - outsideIor) / (filmIndex + outsideIor), 2.0);\n  float topFresnel = topNormal + (1.0 - topNormal) * pow(1.0 - cosineView, 5.0);\n  float topTransmission = 1.0 - topFresnel;\n  float topPhase = filmIndex < outsideIor ? PI : 0.0;\n  vec3 clampedBase = clamp(baseReflectance, 0.0, 0.9999);\n  vec3 baseIor = (1.0 + sqrt(clampedBase)) / (1.0 - sqrt(clampedBase));\n  vec3 bottomNormal = pow((baseIor - filmIndex) / (baseIor + filmIndex), vec3(2.0));\n  vec3 bottomFresnel = bottomNormal + (1.0 - bottomNormal) * pow(1.0 - cosineFilm, 5.0);\n  vec3 bottomPhase = vec3(baseIor.x < filmIndex ? PI : 0.0, baseIor.y < filmIndex ? PI : 0.0, baseIor.z < filmIndex ? PI : 0.0);\n  float pathDifference = 2.0 * filmIndex * thickness * cosineFilm;\n  vec3 phase = vec3(PI - topPhase) + bottomPhase;\n  vec3 roundTrip = clamp(topFresnel * bottomFresnel, 1e-5, 0.9999);\n  vec3 roundTripRoot = sqrt(roundTrip);\n  vec3 multiple = topTransmission * topTransmission * bottomFresnel / (vec3(1.0) - roundTrip);\n  vec3 total = topFresnel + multiple;\n  vec3 term = multiple - topTransmission;\n  for (int order = 1; order <= 2; order++) {\n    term *= roundTripRoot;\n    total += term * 2.0 * filmSensitivity(float(order) * pathDifference, float(order) * phase);\n  }\n  return max(total, vec3(0.0));\n}\n\nvec3 filmReflectanceAtNormal(vec3 filmFresnel, float cosineView) {\n  float power = clamp(pow(1.0 - cosineView, 5.0), 0.0, 0.9999);\n  return clamp((filmFresnel - power) / (1.0 - power), 0.0, 1.0);\n}\n\n",
	illuminateReflectance: "  baseReflectance = mix(baseReflectance, iridescentReflectance, iridescenceWeight);\n",
	coatReset: "  iridescenceWeight = 0.0;\n",
	mainSetup: "  if (materialIridescence.x > 0.0) {\n    float cosineView = clamp(dot(normal, viewDirection), 0.001, 1.0);\n    vec3 filmFresnel = filmReflectance(materialIridescence.y, cosineView, materialIridescence.z, baseReflectance);\n    iridescentReflectance = filmReflectanceAtNormal(filmFresnel, cosineView);\n    iridescenceWeight = materialIridescence.x;\n    baseReflectance = mix(baseReflectance, iridescentReflectance, iridescenceWeight);\n  }\n"
}));
var r = "#ifndef COAT_STATE\n#define COAT_STATE\nvec2 coatState = vec2(0.0);\nvec2 coatUniform() {\n  return materialCoat;\n}\n#define materialCoat coatState\n#endif\n", i = "#ifndef COAT_STATE_SET\n#define COAT_STATE_SET\n  coatState = coatUniform();\n#endif\n", a = "#ifndef SHEEN_STATE\n#define SHEEN_STATE\nvec4 sheenState = vec4(0.0);\nvec4 sheenUniform() {\n  return materialSheen;\n}\n#define materialSheen sheenState\n#endif\n", o = "#ifndef SHEEN_STATE_SET\n#define SHEEN_STATE_SET\n  sheenState = sheenUniform();\n#endif\n";
function s(e) {
	return `uniform sampler2D ${e};
uniform float ${e}On;
`;
}
t("clearcoatTexture", Object.freeze({
	declarations: s("clearcoatTexture") + r,
	mainSetup: i + "  if (clearcoatTextureOn > 0.5) coatState.x *= (BOX_MAPPED ? sampleBox(clearcoatTexture) : texture(clearcoatTexture, textureUV)).r;\n"
})), t("clearcoatRoughnessTexture", Object.freeze({
	declarations: s("clearcoatRoughnessTexture") + r,
	mainSetup: i + "  if (clearcoatRoughnessTextureOn > 0.5) coatState.y *= texture(clearcoatRoughnessTexture, textureUV).g;\n"
})), t("clearcoatNormalTexture", Object.freeze({
	declarations: s("clearcoatNormalTexture") + "vec3 coatMappedNormal() {\n  vec3 normal = normalize(worldNormal);\n  if (doubleSided > 0.5 && !gl_FrontFacing) normal = -normal;\n  vec3 positionX = dFdx(worldPosition);\n  vec3 positionY = dFdy(worldPosition);\n  vec2 uvX = dFdx(textureUV);\n  vec2 uvY = dFdy(textureUV);\n  float uvScale = max(max(abs(uvX.x), abs(uvX.y)), max(abs(uvY.x), abs(uvY.y)));\n  if (uvScale == 0.0) return normal;\n  uvX /= uvScale;\n  uvY /= uvScale;\n  float determinant = uvX.x * uvY.y - uvX.y * uvY.x;\n  if (abs(determinant) < 1e-7) return normal;\n  vec3 tangent = (positionX * uvY.y - positionY * uvX.y) / determinant;\n  vec3 bitangent = (positionY * uvX.x - positionX * uvY.x) / determinant;\n  tangent -= normal * dot(normal, tangent);\n  float tangentScale = max(max(abs(tangent.x), abs(tangent.y)), abs(tangent.z));\n  if (tangentScale == 0.0) return normal;\n  tangent = normalize(tangent / tangentScale);\n  float handedness = dot(cross(normal, tangent), bitangent) < 0.0 ? -1.0 : 1.0;\n  bitangent = normalize(cross(normal, tangent)) * handedness;\n  vec3 mapped = mat3(tangent, bitangent, normal) * (texture(clearcoatNormalTexture, textureUV).xyz * 2.0 - 1.0);\n  return dot(mapped, mapped) > 1e-12 ? normalize(mapped) : normal;\n}\n",
	coatReset: "  if (clearcoatNormalTextureOn > 0.5) normal = coatMappedNormal();\n"
})), t("sheenColorTexture", Object.freeze({
	declarations: s("sheenColorTexture") + a,
	mainSetup: o + "  if (sheenColorTextureOn > 0.5) sheenState.rgb *= texture(sheenColorTexture, textureUV).rgb;\n"
})), t("sheenRoughnessTexture", Object.freeze({
	declarations: s("sheenRoughnessTexture") + a,
	mainSetup: o + "  if (sheenRoughnessTextureOn > 0.5) sheenState.w *= texture(sheenRoughnessTexture, textureUV).a;\n"
})), t("anisotropyTexture", Object.freeze({ declarations: n + s("anisotropyTexture") + "#define ANISOTROPY_TEXTURE\nvoid applyAnisotropyTexture(vec3 normal) {\n  vec3 sampled = texture(anisotropyTexture, textureUV).rgb;\n  vec2 direction = sampled.rg * 2.0 - 1.0;\n  float cosine = cos(materialAnisotropy.y);\n  float sine = sin(materialAnisotropy.y);\n  vec2 rotated = vec2(cosine * direction.x - sine * direction.y, sine * direction.x + cosine * direction.y);\n  anisotropyStrength = materialAnisotropy.x * sampled.b;\n  if (dot(rotated, rotated) > 1e-8) {\n    anisotropyTangent = normalize(anisotropyFrameTangent * rotated.x + anisotropyFrameBitangent * rotated.y);\n    anisotropyBitangent = cross(normal, anisotropyTangent);\n  }\n}\n" }));
var c = 11, l = 3;
function u(e) {
	if (e.layerTextureNamesFor?.size !== e.shaderFeatures.size) {
		let t = [...e.shaderFeatures].filter((e) => e.endsWith("Texture"));
		if (t.length > l || e.shaderFeatures.has("splat")) throw Error(`A renderer draws at most ${l} layer textures and none beside splat layers, got ${t.join(", ")}.`);
		e.layerTextureNames = t, e.layerTextureNamesFor = { size: e.shaderFeatures.size };
	}
	return e.layerTextureNames;
}
function d(e, t) {
	return e.uniforms[t] ??= e.context.getUniformLocation(e.program, t), e.uniforms[t];
}
t("normalMapTransform", Object.freeze({
	declarations: "uniform vec4 normalMapTransform;\n",
	normalUv: " * normalMapTransform.xy + normalMapTransform.zw"
}));
var f = [
	1,
	1,
	0,
	0
], p = 1, m = 18, h = e.bind;
e.bind = (e, t, n, r) => {
	if (h?.(e, t, n, r), !e.shaderFeatures) return;
	let i = e.context, a = t[m];
	if (e.shaderFeatures.has("normalMapTransform")) {
		let n = t[p]?.uvTransform ?? f;
		i.uniform4f(d(e, "normalMapTransform"), ...n);
	}
	u(e).forEach((t, n) => {
		let r = a?.[t];
		i.activeTexture(i.TEXTURE0 + c + n), i.bindTexture(i.TEXTURE_2D, r ? e.createTexture(r) : e.whiteTexture), i.uniform1i(d(e, t), c + n), i.uniform1f(d(e, `${t}On`), +!!r);
	});
};
