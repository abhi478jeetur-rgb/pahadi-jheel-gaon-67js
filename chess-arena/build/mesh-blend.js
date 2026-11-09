/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, l as t } from "./shader-registry-DHYkwAg5.js";
// src/mesh-blend.js
var n = Object.freeze({ radius: Object.freeze([.005, 2]) }), r = Object.freeze({
	count: 24,
	angleStep: 2.39996323
}), i = r.count, a = 40, o = 1024;
function s() {
	return Array.from({ length: i }, (e, t) => {
		let n = Math.sqrt((t + .5) / i), a = t * r.angleStep;
		return [
			Math.cos(a) * n,
			Math.sin(a) * n,
			1 - n
		];
	});
}
var c = (e) => Number.isInteger(e) ? `${e}.0` : String(Math.fround(e)), l = s(), u = l.map((e) => `vec3(${e.map(c).join(", ")})`).join(", "), d = c(l.reduce((e, t) => e + t[2], 0)), f = "#version 300 es\nprecision highp float;\nvoid main() {\n  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\n  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);\n}";
function p(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) throw TypeError("blend must be an object such as { \"radius\": 0.15 }.");
	for (let t of Object.keys(e)) if (t !== "radius") throw RangeError(`blend has no field ${t}. Fix: use { "radius": metres }.`);
	let [t, r] = n.radius;
	if (typeof e.radius != "number" || !(e.radius >= t && e.radius <= r)) throw RangeError(`blend.radius must be a number of metres between ${t} and ${r}.`);
	return { radius: e.radius };
}
function m(e, t = /* @__PURE__ */ new Map()) {
	let n = new Float32Array(e.length + 1);
	return e.forEach((e, r) => {
		n[r + 1] = e.blend?.radius ?? t.get(e.name) ?? 0;
	}), n;
}
var h = "nodes[].blend {radius: metres 0.005-2} softens seams; needs depth; docs/mesh-blend.md", g = `#version 300 es
precision highp float;
uniform sampler2D sourceTexture;
uniform sampler2D sceneDepth;
uniform sampler2D partTexture;
uniform sampler2D radiusTexture;
uniform mat4 inverseViewProjection;
uniform vec3 eye;
uniform float pixelsPerMetre;
uniform float orthographic;
out vec4 outputColor;
const vec3 tapOffsets[${i}] = vec3[${i}](${u});
ivec2 lastPixel;
int partAt(ivec2 pixel) {
  ivec2 clamped = clamp(pixel, ivec2(0), lastPixel);
  ivec4 bytes = ivec4(texelFetch(partTexture, clamped, 0) * 255.0 + 0.5);
  if (bytes.w == 0) return 0;
  if (bytes.w != (bytes.x * 3 + bytes.y * 5 + bytes.z * 11) % 251 + 1) return -1;
  return bytes.x + bytes.y * 256 + bytes.z * 65536;
}
float radiusOf(int part) {
  return part > 0 ? texelFetch(radiusTexture, ivec2(part & 1023, part / ${o}), 0).r : 0.0;
}
vec3 positionAt(ivec2 pixel) {
  ivec2 clamped = clamp(pixel, ivec2(0), lastPixel);
  float depth = texelFetch(sceneDepth, clamped, 0).r;
  vec4 ndc = vec4((vec2(clamped) + 0.5) / vec2(lastPixel + 1) * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 world = inverseViewProjection * ndc;
  return world.xyz / world.w;
}
vec3 shorterStep(vec3 first, vec3 second) {
  float firstLength = dot(first, first);
  float secondLength = dot(second, second);
  return (secondLength < 1e-14 || (firstLength >= 1e-14 && firstLength < secondLength)) ? first : second;
}
vec3 stepAlong(ivec2 pixel, ivec2 delta, vec3 center, int part) {
  vec3 forward = positionAt(pixel + delta) - center;
  vec3 backward = center - positionAt(pixel - delta);
  bool forwardSame = partAt(pixel + delta) == part;
  bool backwardSame = partAt(pixel - delta) == part;
  if (forwardSame != backwardSame) return forwardSame ? forward : backward;
  return shorterStep(forward, backward);
}
vec3 normalAt(ivec2 pixel, vec3 center, int part) {
  vec3 raw = cross(stepAlong(pixel, ivec2(1, 0), center, part), stepAlong(pixel, ivec2(0, 1), center, part));
  vec3 toEye = normalize(eye - center);
  if (dot(raw, raw) < 1e-20) return toEye;
  vec3 normal = normalize(raw);
  return dot(normal, toEye) < 0.0 ? -normal : normal;
}
void main() {
  ivec2 pixel = ivec2(gl_FragCoord.xy);
  lastPixel = textureSize(sourceTexture, 0) - 1;
  vec4 source = texelFetch(sourceTexture, pixel, 0);
  outputColor = source;
  int part = partAt(pixel);
  if (part == 0) return;
  ivec2 normalPixel = pixel;
  float radius = radiusOf(part);
  if (part < 0) {
    const ivec2 neighbours[4] = ivec2[4](ivec2(1, 0), ivec2(-1, 0), ivec2(0, 1), ivec2(0, -1));
    for (int side = 0; side < 4; side++) {
      ivec2 neighbour = pixel + neighbours[side];
      int candidate = partAt(neighbour);
      float candidateRadius = radiusOf(candidate);
      if (candidateRadius > radius) {
        part = candidate;
        radius = candidateRadius;
        normalPixel = neighbour;
      }
    }
  }
  if (radius <= 0.0) return;
  vec3 center = positionAt(normalPixel);
  float pixelRadius = radius * pixelsPerMetre / (orthographic > 0.5 ? 1.0 : length(center - eye));
  pixelRadius = clamp(pixelRadius, 1.0, ${a}.0);
  float reach = radius * 3.0;
  vec3 colorSum = vec3(0.0);
  float otherWeight = 0.0;
  ivec2 nearestTap = pixel;
  vec3 nearestPosition = center;
  int nearestPart = 0;
  bool found = false;
  for (int index = 0; index < ${i}; index++) {
    vec3 tapOffset = tapOffsets[index];
    ivec2 tap = pixel + ivec2(round(tapOffset.xy * pixelRadius));
    int tapPart = partAt(tap);
    if (tapPart <= 0 || tapPart == part || radiusOf(tapPart) > 0.0) continue;
    vec3 tapPosition = positionAt(tap);
    if (distance(tapPosition, center) > reach) continue;
    if (!found) {
      nearestTap = tap;
      nearestPosition = tapPosition;
      nearestPart = tapPart;
    }
    found = true;
    colorSum += tapOffset.z * texelFetch(sourceTexture, clamp(tap, ivec2(0), lastPixel), 0).rgb;
    otherWeight += tapOffset.z;
  }
  if (!found) return;
  float creased = smoothstep(0.05, 0.4, 1.0 - dot(normalAt(normalPixel, center, part), normalAt(nearestTap, nearestPosition, nearestPart)));
  float amount = smoothstep(0.0, 0.5, otherWeight / ${d}) * creased;
  outputColor.rgb = mix(source.rgb, colorSum / otherWeight, amount);
}`;
function _(e, t, n) {
	let r = e.createShader(t);
	if (e.shaderSource(r, n), e.compileShader(r), !e.getShaderParameter(r, e.COMPILE_STATUS)) throw Error(`Mesh blend shader compilation failed: ${e.getShaderInfoLog(r)}`);
	return r;
}
function v(e, t, n) {
	let r = e.createProgram();
	if (e.attachShader(r, _(e, e.VERTEX_SHADER, t)), e.attachShader(r, _(e, e.FRAGMENT_SHADER, n)), e.linkProgram(r), !e.getProgramParameter(r, e.LINK_STATUS)) throw Error(`Mesh blend shader linking failed: ${e.getProgramInfoLog(r)}`);
	return r;
}
function y(e, t, n, r, i) {
	let a = e.createTexture();
	e.bindTexture(e.TEXTURE_2D, a), e.texImage2D(e.TEXTURE_2D, 0, r ? e.RGBA16F : e.RGBA8, t, n, 0, e.RGBA, r ? e.HALF_FLOAT : e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE);
	let o = e.createFramebuffer();
	if (e.bindFramebuffer(e.FRAMEBUFFER, o), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, a, 0), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw Error("Mesh blend framebuffer allocation failed. Choose a lower quality preset.");
	return {
		texture: a,
		framebuffer: o
	};
}
function b(e, t) {
	return e?.length === t.length && e.every((e, n) => e === t[n]);
}
t("meshBlend", Object.freeze({
	declarations: "layout(location = 1) out highp vec4 partIdentifier;\n",
	surfaceHook: "  uint partNumber = canopyShaded || TAG_WATER || alphaMode > 1.5 ? 0u : uint(renderPassObjectBase + instanceEmission.w + 1.0);\n  uvec3 partBytes = uvec3(partNumber & 255u, (partNumber >> 8) & 255u, partNumber >> 16);\n  partIdentifier = vec4(vec3(partBytes), float((partBytes.x * 3u + partBytes.y * 5u + partBytes.z * 11u) % 251u + 1u)) / 255.0;\n"
})), e.push((e) => e.includes("partIdentifier") ? e.replace("\nout vec4 outputColor;", "\nlayout(location = 0) out vec4 outputColor;") : e);
function x(e, t, n) {
	let r = e.createTexture();
	e.bindTexture(e.TEXTURE_2D, r), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA8, t, n, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST);
	let i = e.createFramebuffer();
	if (e.bindFramebuffer(e.FRAMEBUFFER, i), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, r, 0), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw Error("Mesh blend framebuffer allocation failed. Choose a lower quality preset.");
	return {
		texture: r,
		framebuffer: i
	};
}
function S(e) {
	if (e.meshBlend) return e;
	let t = {
		active: !1,
		table: null
	}, r = null, i = null, a = null, s = null, c = null, l = null, u = null;
	function d() {
		return e.batches.filter((t) => e.drawsInOpaqueLoop(t));
	}
	function p(n) {
		let { context: r } = e;
		if (b(t.table, n)) return;
		t.table = n;
		let i = Math.ceil(n.length / o), a = new Float32Array(i * o);
		a.set(n), u ??= r.createTexture(), r.bindTexture(r.TEXTURE_2D, u), r.texImage2D(r.TEXTURE_2D, 0, r.R32F, o, i, 0, r.RED, r.FLOAT, a), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MIN_FILTER, r.NEAREST), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_MAG_FILTER, r.NEAREST);
	}
	function h(e) {
		s && e.deleteRenderbuffer(s), a && (e.deleteTexture(a.texture), e.deleteFramebuffer(a.framebuffer)), s = null, a = null, c = null;
	}
	function _() {
		let { context: t, canvas: n } = e;
		c !== e.multisampleFramebuffer && (h(t), s = t.createRenderbuffer(), t.bindRenderbuffer(t.RENDERBUFFER, s), t.renderbufferStorageMultisample(t.RENDERBUFFER, e.multisampleSamples, t.RGBA8, n.width, n.height), t.bindFramebuffer(t.FRAMEBUFFER, e.multisampleFramebuffer), t.framebufferRenderbuffer(t.FRAMEBUFFER, t.COLOR_ATTACHMENT1, t.RENDERBUFFER, s), t.drawBuffers([t.COLOR_ATTACHMENT0, t.NONE]), t.bindFramebuffer(t.FRAMEBUFFER, null), a = x(t, n.width, n.height), e.renderTargets.record("partId", {
			width: n.width,
			height: n.height,
			format: "RGBA8",
			samples: e.multisampleSamples
		}), e.renderTargets.record("partIdResolved", {
			width: n.width,
			height: n.height,
			format: "RGBA8"
		}), c = e.multisampleFramebuffer);
	}
	function S() {
		let { context: t } = e;
		t.bindFramebuffer(t.FRAMEBUFFER, e.multisampleFramebuffer), t.drawBuffers([t.NONE, t.COLOR_ATTACHMENT1]), t.clearBufferfv(t.COLOR, 1, [
			0,
			0,
			0,
			0
		]), t.drawBuffers([t.COLOR_ATTACHMENT0, t.NONE]);
	}
	function C() {
		let { context: t, canvas: n } = e;
		t.bindFramebuffer(t.READ_FRAMEBUFFER, e.multisampleFramebuffer), t.readBuffer(t.COLOR_ATTACHMENT1), t.bindFramebuffer(t.DRAW_FRAMEBUFFER, a.framebuffer), t.blitFramebuffer(0, 0, n.width, n.height, 0, 0, n.width, n.height, t.COLOR_BUFFER_BIT, t.NEAREST), t.readBuffer(t.COLOR_ATTACHMENT0);
	}
	function w(n, o, s, c) {
		if (!t.active) return null;
		if (!e.depthTexture) throw Error("Mesh blend requires depth:true on the renderer.");
		let { context: d, canvas: p } = e;
		return C(), r || (r = v(d, f, g), i = Object.fromEntries([
			"sourceTexture",
			"sceneDepth",
			"partTexture",
			"radiusTexture",
			"inverseViewProjection",
			"eye",
			"pixelsPerMetre",
			"orthographic"
		].map((e) => [e, d.getUniformLocation(r, e)]))), l ??= y(d, p.width, p.height, e.hdr, d.LINEAR), d.bindFramebuffer(d.FRAMEBUFFER, l.framebuffer), d.viewport(0, 0, p.width, p.height), d.disable(d.DEPTH_TEST), d.disable(d.CULL_FACE), d.bindVertexArray(null), d.useProgram(r), [
			[c, "sourceTexture"],
			[e.depthTexture, "sceneDepth"],
			[a.texture, "partTexture"],
			[u, "radiusTexture"]
		].forEach(([e, t], n) => {
			d.activeTexture(d.TEXTURE0 + n), d.bindTexture(d.TEXTURE_2D, e), d.uniform1i(i[t], n);
		}), d.uniformMatrix4fv(i.inverseViewProjection, !1, e.inverseViewProjection), d.uniform3fv(i.eye, o.eye), d.uniform1f(i.pixelsPerMetre, e.projection[5] * p.height / 2), d.uniform1f(i.orthographic, +(e.projection[15] === 1)), d.drawArrays(d.TRIANGLES, 0, 3), l.texture;
	}
	function T(t) {
		l && (t.deleteTexture(l.texture), t.deleteFramebuffer(l.framebuffer)), l = null, h(t), e.renderTargets.release("partId", "partIdResolved");
	}
	function E(e) {
		T(e), r && e.deleteProgram(r), u && e.deleteTexture(u), r = null, u = null, t.table = null;
	}
	function D(e, t) {
		return e.some((e) => e > 0) ? (t.levelErrors?.length ?? 1) > 1 || e.some((t) => t !== e[0]) : !1;
	}
	function O(e) {
		let t = [], n = 1;
		for (let r of d()) r.cullable && D(e.subarray(n, n + r.parts.length), r) && (r.cullable = !1, t.push(r)), n += r.parts.length;
		return t;
	}
	let { context: k } = e, A = k.useProgram.bind(k);
	k.useProgram = (n) => {
		A(n), t.active && k.getParameter(k.DRAW_FRAMEBUFFER_BINDING) === e.multisampleFramebuffer && k.drawBuffers([k.COLOR_ATTACHMENT0, n === e.program ? k.COLOR_ATTACHMENT1 : k.NONE]);
	}, e.postStages.push({
		name: "Mesh blend",
		apply: w,
		releaseTargets: T,
		dispose: E
	});
	let j = e.render.bind(e);
	return e.render = (n) => {
		t.active = !1;
		let r = [];
		if (n.pass === void 0 && !n.reflectionTarget && !e.benchmark) {
			let n = m(d().flatMap((e) => e.parts), e.meshBlend.radii);
			n.some((e) => e > 0) && (p(n), e.requireFeatureNames(["meshBlend"]), _(), S(), r = O(n), t.active = !0);
		}
		try {
			j(n);
		} finally {
			t.active = !1;
			for (let e of r) e.cullable = !0;
		}
	}, e.meshBlend = {
		limits: n,
		radii: /* @__PURE__ */ new Map()
	}, e;
}
export { h as MESH_BLEND_CAPABILITIES, n as MESH_BLEND_LIMITS, r as MESH_BLEND_TAPS, g as blendFragment, m as blendRadiusTable, S as installMeshBlend, p as normalizeBlend };
