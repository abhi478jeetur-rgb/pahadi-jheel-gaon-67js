/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/environment-shading.js
var e = "\nvec3 directionFromEquirectangular(vec2 coordinates) {\n  float azimuth = (coordinates.x - 0.5) * 6.28318530718;\n  float polar = coordinates.y * 3.14159265359;\n  return vec3(sin(polar) * sin(azimuth), cos(polar), -sin(polar) * cos(azimuth));\n}\nvec2 equirectangularFromDirection(vec3 direction) {\n  return vec2(atan(direction.x, -direction.z) * 0.15915494309 + 0.5, acos(clamp(direction.y, -1.0, 1.0)) * 0.31830988618);\n}\n", t = `
uniform sampler2D environmentSpecular;
uniform vec2 environmentRotation;
uniform float environmentIntensity;
uniform float environmentLevelMax;
${e}
vec3 environmentDirection(vec3 direction) {
  return vec3(environmentRotation.x * direction.x - environmentRotation.y * direction.z, direction.y, environmentRotation.y * direction.x + environmentRotation.x * direction.z);
}
vec3 environmentRadiance(vec3 direction, float level) {
  return textureLod(environmentSpecular, equirectangularFromDirection(environmentDirection(direction)), level).rgb * environmentIntensity;
}
`, n = "\nuniform sampler2D environmentBrdf;\nuniform float environmentEnabled;\nuniform vec3 environmentIrradiance[9];\nvec3 environmentDiffuse(vec3 normal) {\n  vec3 mapped = environmentDirection(normal);\n  if (LIGHT_SHADING) {\n    vec3 firstOrder = environmentIrradiance[0] + environmentIrradiance[1] * mapped.y + environmentIrradiance[2] * mapped.z + environmentIrradiance[3] * mapped.x;\n    return max(firstOrder, vec3(0.0)) * environmentIntensity;\n  }\n  vec3 result = environmentIrradiance[0]\n    + environmentIrradiance[1] * mapped.y\n    + environmentIrradiance[2] * mapped.z\n    + environmentIrradiance[3] * mapped.x\n    + environmentIrradiance[4] * (mapped.x * mapped.y)\n    + environmentIrradiance[5] * (mapped.y * mapped.z)\n    + environmentIrradiance[6] * (3.0 * mapped.z * mapped.z - 1.0)\n    + environmentIrradiance[7] * (mapped.x * mapped.z)\n    + environmentIrradiance[8] * (mapped.x * mapped.x - mapped.y * mapped.y);\n  return max(result, vec3(0.0)) * environmentIntensity;\n}\nvec3 multipleScatterGain(vec2 lookup, vec3 baseReflectance) {\n  float missingEnergy = 1.0 - (lookup.x + lookup.y);\n  vec3 averageFresnel = baseReflectance + (1.0 - baseReflectance) / 21.0;\n  return 1.0 / (1.0 - missingEnergy * averageFresnel);\n}\nvec2 environmentBrdfFit(float normalView, float roughness) {\n  vec4 terms = roughness * vec4(-1.0, -0.0275, -0.572, 0.022) + vec4(1.0, 0.0425, 1.04, -0.04);\n  float edge = min(terms.x * terms.x, exp2(-9.28 * normalView)) * terms.x + terms.y;\n  return vec2(-1.04, 1.04) * edge + terms.zw;\n}\nvec3 environmentLighting(vec3 normal, vec3 specularNormal, vec3 baseReflectance, vec3 viewDirection, vec3 reflected, vec3 color, float metallic, float roughness, float occlusion, float ambient, float specularWeight) {\n  if (LIGHT_SHADING) {\n    vec2 fitted = environmentBrdfFit(clamp(dot(normal, viewDirection), 0.001, 1.0), roughness);\n    vec3 fittedColor = (baseReflectance * fitted.x + fitted.y) * specularWeight;\n    vec3 irradiance = environmentDiffuse(normal);\n    return irradiance * (fittedColor + color * (1.0 - metallic) * (1.0 - fittedColor)) * occlusion * ambient;\n  }\n  float normalView = clamp(dot(normal, viewDirection), 0.001, 1.0);\n  vec2 lookup = texture(environmentBrdf, vec2(normalView, roughness)).rg;\n  vec3 singleScatter = baseReflectance * lookup.x + lookup.y;\n  vec3 specularColor = singleScatter * multipleScatterGain(lookup, baseReflectance) * specularWeight;\n  vec3 specular = environmentRadiance(reflected, roughness * environmentLevelMax) * specularColor;\n  vec3 diffuse = environmentDiffuse(normal) * color * (1.0 - metallic) * (1.0 - specularColor);\n  return (specular + diffuse) * occlusion * ambient;\n}\n\n", r = {};
function i(e) {
	Object.assign(r, e);
}
function a() {
	if (!r.createResources) throw Error("An environment map needs its code: add import '@codepawlhq/67js/addons/hdri' or import createEnvironmentMap from the package entry.");
	return r;
}
export { a, i, n, e as r, t };
