/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, n as t, p as n, t as r } from "./mat4-BCZClxna.js";
import { MAXIMUM_STREAK as i, createStage as a, previousViewProjectionOf as o, sharedFragmentHeader as s } from "./camera-effects.js";
// src/object-motion-blur.js
var c = 256, l = c * 4, u = "Object motion blur", d = `${s}
uniform sampler2D objectIds;
uniform sampler2D objectDeltas;
uniform mat4 previousViewProjection;
uniform float objectAmount;
uniform int objectCount;
vec2 screenPointOf(vec3 world) {
  vec4 previousClip = previousViewProjection * vec4(world, 1.0);
  if (previousClip.w <= 0.0) return textureCoordinate;
  return previousClip.xy / previousClip.w * 0.5 + 0.5;
}
mat4 deltaOf(int identifier) {
  int row = (identifier - 1) / ${c};
  int column = ((identifier - 1) - row * ${c}) * 4;
  return mat4(texelFetch(objectDeltas, ivec2(column, row), 0), texelFetch(objectDeltas, ivec2(column + 1, row), 0),
    texelFetch(objectDeltas, ivec2(column + 2, row), 0), texelFetch(objectDeltas, ivec2(column + 3, row), 0));
}
void main() {
  vec3 idBytes = floor(texelFetch(objectIds, ivec2(gl_FragCoord.xy), 0).rgb * 255.0 + 0.5);
  int identifier = int(idBytes.r + idBytes.g * 256.0 + idBytes.b * 65536.0);
  vec3 world = worldPointAt(textureCoordinate);
  vec2 velocity = screenPointOf(world) - textureCoordinate;
  if (identifier > 0 && identifier <= objectCount) {
    vec2 objectVelocity = screenPointOf((deltaOf(identifier) * vec4(world, 1.0)).xyz) - textureCoordinate;
    velocity += (objectVelocity - velocity) * objectAmount;
  }
  float streak = length(velocity);
  if (streak > ${i}) velocity *= ${i} / streak;
  if (length(velocity * resolution) < 0.5) {
    outputColor = texture(sourceTexture, textureCoordinate);
    return;
  }
  float jitter = pixelRotation() / 6.2831853;
  vec4 sum = vec4(0.0);
  for (int index = 0; index < 16; index++) {
    float along = (float(index) + jitter) / 16.0;
    sum += texture(sourceTexture, textureCoordinate + velocity * along);
  }
  outputColor = sum / 16.0;
}`;
function f(e) {
	return new Map(e.map((e) => [e.name, r(e.matrix)]));
}
function p(r, i, a) {
	let o = r.batches.filter((e) => r.drawsInOpaqueLoop(e)).flatMap((e) => e.parts.map((e) => e.name)), s = Math.max(1, Math.ceil(o.length / c)), u = new Float32Array(l * s * 4), d = t(), f = t();
	o.forEach((r, o) => {
		let s = u.subarray(o * 16, o * 16 + 16), c = i.get(r), l = a.get(r);
		c && l && n(d, c) ? (e(f, l, d), s.set(f)) : s.set(t());
	});
	for (let e = o.length; e < c * s; e++) u.set(t(), e * 16);
	return {
		matrices: u,
		rows: s,
		count: o.length
	};
}
function m() {
	let e = null, t = a({
		name: u,
		fragment: d,
		uniformNames: [
			"objectIds",
			"objectDeltas",
			"previousViewProjection",
			"objectAmount",
			"objectCount"
		],
		isActive: (e, t) => e.motionBlur.shutter > 0 && e.motionBlur.objects > 0 && !!t.objectMotion,
		setUniforms(t, n, r, i, a) {
			let { matrices: s, rows: c, count: u } = i.objectMotion;
			e ??= t.createTexture(), t.activeTexture(t.TEXTURE3), t.bindTexture(t.TEXTURE_2D, e), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA32F, l, c, 0, t.RGBA, t.FLOAT, s), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST), t.uniform1i(n.objectDeltas, 3), t.activeTexture(t.TEXTURE2), t.bindTexture(t.TEXTURE_2D, r.passSupport.texture), t.uniform1i(n.objectIds, 2), t.uniform1i(n.objectCount, u), t.uniform1f(n.objectAmount, a.motionBlur.objects);
			let d = i.previousCamera ? o(r, i) : r.viewProjection;
			t.uniformMatrix4fv(n.previousViewProjection, !1, d), t.activeTexture(t.TEXTURE1);
		}
	});
	function n(t) {
		e && t.deleteTexture(e), e = null;
	}
	return {
		...t,
		releaseTargets(e) {
			t.releaseTargets(e), n(e);
		},
		dispose(e) {
			t.dispose(e), n(e);
		}
	};
}
function h(e) {
	if (!e.passSupport) throw Error("Object motion blur needs installRenderPasses(renderer).");
	return e.postStages.some((e) => e.name === u) || e.postStages.push(m()), e;
}
export { h as installObjectMotionBlur, d as objectMotionBlurFragment, p as packObjectMotion, f as sampleWorldMatrices };
