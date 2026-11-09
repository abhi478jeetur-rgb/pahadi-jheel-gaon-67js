/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, m as t, n } from "./mat4-BCZClxna.js";
import { n as r } from "./camera-DqWdI22s.js";
import { r as i, t as a } from "./gl-program-KwXE3oHO.js";
// src/camera-effects.js
var o = 32, s = 16, c = .05, l = .1, u = "#version 300 es\nprecision highp float;\nin vec2 textureCoordinate;\nuniform sampler2D sourceTexture;\nuniform sampler2D sceneDepth;\nuniform mat4 inverseViewProjection;\nuniform vec2 resolution;\nout vec4 outputColor;\nfloat pixelRotation() {\n  return 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));\n}\nvec3 worldPointAt(vec2 coordinate) {\n  float depth = texture(sceneDepth, coordinate).r;\n  vec4 point = inverseViewProjection * vec4(coordinate * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);\n  return point.xyz / point.w;\n}\n", d = `${u}
uniform vec3 eye;
uniform vec3 forward;
uniform float focusDistance;
uniform float blurPixels;
float blurRadius(vec2 coordinate) {
  float distanceAlongView = max(dot(worldPointAt(coordinate) - eye, forward), 0.001);
  return blurPixels * clamp(abs(distanceAlongView - focusDistance) / distanceAlongView, 0.0, 1.0);
}
void main() {
  float centerRadius = blurRadius(textureCoordinate);
  vec4 center = texture(sourceTexture, textureCoordinate);
  if (centerRadius < 0.5) {
    outputColor = center;
    return;
  }
  float rotation = pixelRotation();
  vec4 sum = center;
  float weightSum = 1.0;
  for (int index = 0; index < ${o}; index++) {
    float ring = sqrt((float(index) + 0.5) / ${o}.0);
    float angle = float(index) * 2.3999632 + rotation;
    vec2 offsetPixels = vec2(cos(angle), sin(angle)) * ring * centerRadius;
    vec2 coordinate = textureCoordinate + offsetPixels / resolution;
    float reach = clamp(blurRadius(coordinate) - length(offsetPixels) + 1.0, 0.0, 1.0);
    sum += texture(sourceTexture, coordinate) * reach;
    weightSum += reach;
  }
  outputColor = sum / weightSum;
}`, f = `${u}
uniform mat4 previousViewProjection;
void main() {
  vec3 world = worldPointAt(textureCoordinate);
  vec4 previousClip = previousViewProjection * vec4(world, 1.0);
  vec2 velocity = vec2(0.0);
  if (previousClip.w > 0.0) velocity = (previousClip.xy / previousClip.w * 0.5 + 0.5) - textureCoordinate;
  float streak = length(velocity);
  if (streak > ${l}) velocity *= ${l} / streak;
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
function p(e) {
	let t = e.context, { width: n, height: r } = e.canvas, i = t.createTexture();
	t.bindTexture(t.TEXTURE_2D, i), t.texImage2D(t.TEXTURE_2D, 0, e.hdr ? t.RGBA16F : t.RGBA8, n, r, 0, t.RGBA, e.hdr ? t.HALF_FLOAT : t.UNSIGNED_BYTE, null), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE);
	let a = t.createFramebuffer();
	if (t.bindFramebuffer(t.FRAMEBUFFER, a), t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, i, 0), t.checkFramebufferStatus(t.FRAMEBUFFER) !== t.FRAMEBUFFER_COMPLETE) throw Error("Camera effect framebuffer allocation failed. Choose a lower quality preset.");
	return {
		texture: i,
		framebuffer: a
	};
}
function m({ name: e, fragment: t, uniformNames: n, isActive: r, setUniforms: o }) {
	let s = null, c = null, l = null;
	function u(e) {
		l &&= (e.deleteTexture(l.texture), e.deleteFramebuffer(l.framebuffer), null);
	}
	function d(u, d, f, m) {
		if (!r(f, d)) return null;
		if (!u.depthTexture) throw Error(`${e} requires depth:true on the renderer.`);
		let h = u.context;
		if (!s) {
			s = a(h, i, t);
			let e = [
				"sourceTexture",
				"sceneDepth",
				"inverseViewProjection",
				"resolution",
				...n
			];
			c = Object.fromEntries(e.map((e) => [e, h.getUniformLocation(s, e)]));
		}
		return l ??= p(u), h.bindFramebuffer(h.FRAMEBUFFER, l.framebuffer), h.viewport(0, 0, u.canvas.width, u.canvas.height), h.disable(h.DEPTH_TEST), h.disable(h.CULL_FACE), h.bindVertexArray(null), h.useProgram(s), h.activeTexture(h.TEXTURE0), h.bindTexture(h.TEXTURE_2D, m), h.uniform1i(c.sourceTexture, 0), h.activeTexture(h.TEXTURE1), h.bindTexture(h.TEXTURE_2D, u.depthTexture), h.uniform1i(c.sceneDepth, 1), h.uniformMatrix4fv(c.inverseViewProjection, !1, u.inverseViewProjection), h.uniform2f(c.resolution, u.canvas.width, u.canvas.height), o(h, c, u, d, f), h.drawArrays(h.TRIANGLES, 0, 3), l.texture;
	}
	function f(e) {
		u(e), s && e.deleteProgram(s), s = null;
	}
	return {
		name: e,
		apply: d,
		releaseTargets: u,
		dispose: f
	};
}
function h() {
	return m({
		name: "Depth of field",
		fragment: d,
		uniformNames: [
			"eye",
			"forward",
			"focusDistance",
			"blurPixels"
		],
		isActive: (e) => e.depthOfField.blur > 0,
		setUniforms(e, t, n, r, i) {
			e.uniform3fv(t.eye, r.eye), e.uniform3fv(t.forward, n.viewForward), e.uniform1f(t.focusDistance, i.depthOfField.focusDistance), e.uniform1f(t.blurPixels, i.depthOfField.blur * c * n.canvas.height);
		}
	});
}
function g() {
	return m({
		name: "Motion blur",
		fragment: f,
		uniformNames: ["previousViewProjection"],
		isActive: (e, t) => e.motionBlur.shutter > 0 && !!t.previousCamera && !t.objectMotion,
		setUniforms(e, t, n, r) {
			e.uniformMatrix4fv(t.previousViewProjection, !1, _(n, r));
		}
	});
}
function _(i, a) {
	let o = {
		...a,
		...a.previousCamera
	}, s = i.canvas.width / i.canvas.height, c = r(n(), o, s, { world: i.world }), l = t(n(), o.eye, o.target ?? [
		0,
		1.2,
		0
	], o.up ?? [
		0,
		1,
		0
	]);
	return e(n(), c, l);
}
function v(e) {
	return e.postStages.some((e) => e.name === "Depth of field") || e.postStages.push(h(), g()), e;
}
var y = 1.4;
function b(e, t) {
	if (t.fStop === void 0 || e.depthOfField.blur > 0) return e;
	let n = Math.max(.01, Math.hypot(...t.target.map((e, n) => e - t.eye[n])));
	return {
		...e,
		depthOfField: {
			blur: Math.min(1, y / t.fStop),
			focusDistance: n
		}
	};
}
export { l as MAXIMUM_STREAK, s as MOTION_BLUR_SAMPLES, m as createStage, d as depthOfFieldFragment, b as effectsWithFStop, v as installCameraEffects, f as motionBlurFragment, _ as previousViewProjectionOf, u as sharedFragmentHeader };
