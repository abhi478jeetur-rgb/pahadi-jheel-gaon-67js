/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { a as e, l as t } from "./shader-registry-DHYkwAg5.js";
import { a as n, i as r, n as i, r as a, t as o } from "./light-profile-BGXnJOGo.js";
// src/light-shapes.js
var s = -1, c = -1, l = 24, u = 15, d = .05, f = 30;
function p(e) {
	let t = e.search(/^TILT=/im);
	if (t < 0) throw RangeError("The file has no TILT line, so it is not an IES file.");
	let r = e.slice(t), i = r.indexOf("\n");
	if (!/^TILT=NONE/i.test(r)) throw RangeError("IES files with TILT=INCLUDE or TILT=filename are not supported.");
	let a = r.slice(i + 1).split(/[\s,]+/).filter(Boolean).map(Number);
	if (a.some((e) => !Number.isFinite(e))) throw RangeError("The IES file holds text where numbers belong.");
	let o = a[2], s = a[3], c = a[4];
	if (!(s >= 2) || !(c >= 1) || a.length < 13 + s + c + s * c) throw RangeError("The IES file is shorter than its header says.");
	let l = a.slice(13, 13 + s), u = 13 + s + c, d = l.map((e, t) => {
		let n = 0;
		for (let e = 0; e < c; e++) n += a[u + e * s + t];
		return n / c * o;
	});
	return n({
		angles: l,
		candela: d
	}, "IES file");
}
var m = `
float areaShadowNoise() {
  return 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
}
vec2 areaShadowDisk(int index, int count, float rotation) {
  float angle = float(index) * 2.399963 + rotation;
  return sqrt((float(index) + 0.5) / float(count)) * vec2(cos(angle), sin(angle));
}
float areaShadowLinearDepth(float stored) {
  return 2.0 * ${d.toFixed(2)} * ${f.toFixed(1)} / (${f.toFixed(1)} + ${d.toFixed(2)} - (stored * 2.0 - 1.0) * (${f.toFixed(1)} - ${d.toFixed(2)}));
}
float softLocalShadow(float tile, vec3 position, vec3 normal, float lightDistance, float lightHalfSize) {
  int tileIndex = int(tile);
  float texelAngle = localShadowTexelAngles[tileIndex];
  vec4 clip = localShadowMatrices[tileIndex] * vec4(position + normal * (lightDistance * texelAngle * 2.0), 1.0);
  if (clip.w <= 0.0) return 1.0;
  vec3 projected = clip.xyz / clip.w * 0.5 + 0.5;
  if (projected.z > 1.0 || any(lessThan(projected.xy, vec2(0.0))) || any(greaterThan(projected.xy, vec2(1.0)))) return 1.0;
  ivec2 tileOrigin = ivec2(tileIndex % 4, tileIndex / 4) * 512;
  vec2 pixel = projected.xy * 512.0;
  float receiverDepth = projected.z - 0.00002;
  float rotation = areaShadowNoise();
  float texelSize = texelAngle * clip.w;
  float searchTexels = clamp(lightHalfSize * 2.0 / texelSize, 2.0, 20.0);
  float blockerSum = 0.0;
  float blockers = 0.0;
  for (int tap = 0; tap < 16; tap++) {
    ivec2 texel = clamp(ivec2(floor(pixel + areaShadowDisk(tap, 16, rotation) * searchTexels)), ivec2(0), ivec2(511));
    float stored = texelFetch(localShadowAtlas, tileOrigin + texel, 0).r;
    if (stored < receiverDepth) {
      blockerSum += areaShadowLinearDepth(stored);
      blockers += 1.0;
    }
  }
  if (blockers == 0.0) return 1.0;
  float blockerDepth = blockerSum / blockers;
  float penumbraTexels = clamp(lightHalfSize * (clip.w - blockerDepth) / (blockerDepth * texelSize), 1.0, 24.0);
  float lit = 0.0;
  for (int tap = 0; tap < 32; tap++) {
    ivec2 texel = clamp(ivec2(floor(pixel + areaShadowDisk(tap, 32, rotation) * penumbraTexels)), ivec2(0), ivec2(511));
    lit += step(receiverDepth, texelFetch(localShadowAtlas, tileOrigin + texel, 0).r);
  }
  return lit / 32.0;
}
`, h = `
uniform float lightProfileTable[${u * 16}];
float lightProfileGain(int light, vec3 fromLight, vec3 axis) {
  float cosine = dot(fromLight, axis);
  if (cosine <= 0.0) return 0.0;
  float position = acos(min(cosine, 1.0)) * ${(15 / (Math.PI / 2)).toFixed(7)};
  int lower = int(floor(position));
  int upper = min(lower + 1, 15);
  return mix(lightProfileTable[light * 16 + lower], lightProfileTable[light * 16 + upper], fract(position));
}
`;
t("areaShadows", {
	declarations: m,
	areaRadiance: "      if (USES_LOCAL_SHADOWS && areaLightPositions[index].w >= 0.0) lightRadiance *= shadowBlind > 0.5 ? 1.0 : softLocalShadow(areaLightPositions[index].w, worldPosition, normal, length(fromCenter), max(halfSize.x, halfSize.y));\n"
}), t("lightProfiles", {
	declarations: h,
	linkSpot: "      attenuation *= lightProfileGain(index, -toLight, spotLightDirections[index].xyz);\n",
	areaRadiance: "      lightRadiance *= lightProfileGain(8 + index, -toLight, lightNormal);\n"
});
var g = new Float32Array(u * 16), _ = /* @__PURE__ */ new WeakMap();
function v(e) {
	g.fill(1);
	let t = [...(e.spotLights ?? []).map((e, t) => [t, e]), ...(e.areaLights ?? []).map((e, t) => [8 + t, e])];
	for (let [e, i] of t) i.ies !== void 0 && g.set(r(n(i.ies, "ies")), e * 16);
}
function y(e) {
	let t = e.context;
	_.has(e.program) || _.set(e.program, t.getUniformLocation(e.program, "lightProfileTable[0]")), v(e.environment), t.uniform1fv(_.get(e.program), g);
}
e.update = (e, t, n) => {
	let r = [];
	n.forEach((t, n) => {
		if (t.castShadow !== void 0 && typeof t.castShadow != "boolean") throw TypeError("Area light castShadow must be true or false");
		if (e.areaPositions[n * 4 + 3] = s, !t.castShadow) return;
		if (e.shadowCasters.length >= l) throw RangeError(`Shadow casting lights need more than the ${l} atlas tiles (a point light uses 6, a spot or area light one)`);
		e.areaPositions[n * 4 + 3] = e.shadowCasters.length;
		let i = e.areaNormals.slice(n * 4, n * 4 + 3);
		e.shadowCasters.push({
			light: {
				position: t.position,
				direction: i,
				range: 0,
				angle: Math.PI / 2 - .01
			},
			face: c
		}), r.includes("areaShadows") || r.push("areaShadows");
	}), [...t, ...n].some((e) => e.ies !== void 0) ? (r.push("lightProfiles"), e.bind = y) : e.bind = void 0, e.extraFeatures = r;
};
function b(e, t) {
	if (e.castShadow !== void 0 && typeof e.castShadow != "boolean") throw TypeError(`${t} castShadow must be boolean.`);
	return e.ies === void 0 ? void 0 : n(e.ies, `${t} ies`);
}
e.normalize = (e, t) => {
	let n = e.sunAngularRadius;
	if (n !== void 0) {
		if (typeof n != "number" || !Number.isFinite(n) || n < 5e-4 || n > .2) throw RangeError("sunAngularRadius must be between 0.0005 and 0.2");
		t.sunAngularRadius = n;
	}
	for (let [n, r] of [["spotLights", "spot light"], ["areaLights", "area light"]]) (e[n] ?? []).forEach((e, i) => {
		let a = b(e, r);
		a !== void 0 && (t[n][i].ies = a), n === "areaLights" && e.castShadow && (t[n][i].castShadow = !0);
	});
};
export { o as IES_PROFILE_NAMES, i as PROFILE_SAMPLE_COUNT, p as parseIesPhotometry, a as profileGain, r as profileSamples, n as resolveIesProfile };
