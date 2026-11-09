/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e, n as t } from "./mat4-BCZClxna.js";
import { installCoplanarDiagnostics as n } from "./coplanar-overlap.js";
import { r, t as i } from "./gl-program-KwXE3oHO.js";
import { h as a } from "./shader-registry-DHYkwAg5.js";
// src/reversed-depth.js
var o = 1e4, s = 16, c = /* @__PURE__ */ new Float32Array(4), l = .1;
function u(e, t) {
	for (let n = 0; n < 4; n++) {
		let r = n * 4 + 2, i = t[r], a = t[r + 1];
		e[n * 4] = t[n * 4], e[n * 4 + 1] = t[n * 4 + 1], e[r] = (a - i) / 2, e[r + 1] = a;
	}
	return e;
}
var d = "gl_Position = viewProjection * world;", f = "gl_Position = viewProjection * vec4(world.xyz - cameraOffset.xyz, 1.0 - cameraOffset.w) + cameraShift;", p = "uniform mat4 lightProjection;\nuniform vec4 cameraOffset;\nuniform vec4 cameraShift;", m = !1, h = !1;
function g(e) {
	return !m || !e.includes(d) ? e : e.replace("uniform mat4 lightProjection;", p).replace(d, f);
}
function _(e) {
	return e.far / (e.near ?? l) > o;
}
var v = "#version 300 es\nprecision highp float;\nuniform highp sampler2D reversedDepth;\nvoid main() {\n  gl_FragDepth = 1.0 - texelFetch(reversedDepth, ivec2(gl_FragCoord.xy), 0).r;\n}";
function y() {
	let e = null, t = null, n = null;
	function a(e) {
		n &&= (e.deleteTexture(n.texture), e.deleteFramebuffer(n.framebuffer), null);
	}
	function o(e, t, n) {
		let r = e.createTexture();
		e.bindTexture(e.TEXTURE_2D, r), e.texImage2D(e.TEXTURE_2D, 0, e.DEPTH_COMPONENT32F, t, n, 0, e.DEPTH_COMPONENT, e.FLOAT, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST);
		let i = e.createFramebuffer();
		return e.bindFramebuffer(e.FRAMEBUFFER, i), e.framebufferTexture2D(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.TEXTURE_2D, r, 0), {
			texture: r,
			framebuffer: i,
			width: t,
			height: n
		};
	}
	function s(s) {
		if (!s.depthTexture) return null;
		let c = s.context, { width: l, height: u } = s.canvas;
		return e || (e = i(c, r, v), t = c.getUniformLocation(e, "reversedDepth")), n && (n.width !== l || n.height !== u) && a(c), n ??= o(c, l, u), c.bindFramebuffer(c.READ_FRAMEBUFFER, s.resolveFramebuffer), c.bindFramebuffer(c.DRAW_FRAMEBUFFER, n.framebuffer), c.blitFramebuffer(0, 0, l, u, 0, 0, l, u, c.DEPTH_BUFFER_BIT, c.NEAREST), c.bindFramebuffer(c.FRAMEBUFFER, s.resolveFramebuffer), c.viewport(0, 0, l, u), c.useProgram(e), c.activeTexture(c.TEXTURE0), c.bindTexture(c.TEXTURE_2D, n.texture), c.uniform1i(t, 0), c.enable(c.DEPTH_TEST), c.depthFunc(c.ALWAYS), c.colorMask(!1, !1, !1, !1), c.disable(c.CULL_FACE), c.bindVertexArray(null), c.drawArrays(c.TRIANGLES, 0, 3), c.colorMask(!0, !0, !0, !0), c.depthFunc(c.LESS), c.disable(c.DEPTH_TEST), null;
	}
	function c(t) {
		a(t), e && t.deleteProgram(e), e = null;
	}
	return {
		name: "Reversed depth",
		apply: s,
		releaseTargets: a,
		dispose: c
	};
}
function b(e) {
	let t = e.context;
	if (!e.multisampleFramebuffer) return;
	let { width: n, height: r } = e.canvas;
	t.bindRenderbuffer(t.RENDERBUFFER, e.multisampleDepth), t.renderbufferStorageMultisample(t.RENDERBUFFER, e.multisampleSamples, t.DEPTH_COMPONENT32F, n, r), e.depthTexture && (t.bindTexture(t.TEXTURE_2D, e.depthTexture), t.texImage2D(t.TEXTURE_2D, 0, t.DEPTH_COMPONENT32F, n, r, 0, t.DEPTH_COMPONENT, t.FLOAT, null));
	for (let n of [e.multisampleFramebuffer, e.resolveFramebuffer]) if (t.bindFramebuffer(t.FRAMEBUFFER, n), t.checkFramebufferStatus(t.FRAMEBUFFER) !== t.FRAMEBUFFER_COMPLETE) throw Error("Reversed depth targets failed to allocate. Pass reversedDepth: false to the install.");
	t.bindFramebuffer(t.FRAMEBUFFER, null);
}
function x(n, r = "auto") {
	if (r === !1 && (n.reversedDepth ??= !1), r === !1 || n.reversedDepth !== void 0) return n;
	let i = n.context, o = {
		render: n.render,
		applyEnvironmentUniforms: n.applyEnvironmentUniforms,
		applyDepthLayer: n.applyDepthLayer,
		resolveFrame: n.resolveFrame,
		allocateFrameTargets: n.allocateFrameTargets
	}, l = t(), d = t(), f = new Float32Array([
		0,
		0,
		0,
		1
	]), p = /* @__PURE__ */ new Float32Array(4), v = null, x = r === !0, S = !1, C = !1, w = null, T = null;
	function E() {
		C && v.active !== !1 && (v.extension.clipControlEXT(v.extension.LOWER_LEFT_EXT, v.extension.NEGATIVE_ONE_TO_ONE_EXT), i.depthFunc(i.LESS), v.active = !1);
	}
	function D(e, t) {
		i.uniform4fv(i.getUniformLocation(n.program, "cameraOffset"), e), i.uniform4fv(i.getUniformLocation(n.program, "cameraShift"), t), T = n.program;
	}
	function O() {
		T === n.program && (i.useProgram(n.program), D(c, c), T = null);
	}
	function k() {
		u(l, n.projection), e(d, l, n.view), i.uniformMatrix4fv(n.uniforms.viewProjection, !1, d), f.set(w), p.set(l.subarray(12, 16)), D(f, p), i.clearDepth(0), i.clear(i.DEPTH_BUFFER_BIT), i.clearDepth(1), v.extension.clipControlEXT(v.extension.LOWER_LEFT_EXT, v.extension.ZERO_TO_ONE_EXT), i.depthFunc(i.GREATER), v.active = !0;
	}
	function A() {
		if (!n.shaderFeatures) return;
		h ||= (a.push(g), !0);
		let e = n.startMainProgram;
		n.startMainProgram = function() {
			m = !0;
			try {
				return e.call(this);
			} finally {
				m = !1;
			}
		}, n.rebuildMainProgram();
	}
	function j() {
		let e = n.benchmark ? null : i.getExtension?.("EXT_clip_control");
		return x = !1, e ? (v = {
			extension: e,
			active: !1
		}, C = !0, n.reversedDepth = !0, n.rasterProjection = l, n.rasterViewProjection = d, n.capabilities && (n.capabilities.reversedDepth = !0), n.applyEnvironmentUniforms = function(e, t) {
			o.applyEnvironmentUniforms.call(this, e, t), S && !v.active && t === void 0 && k();
		}, n.applyDepthLayer = function(e) {
			o.applyDepthLayer.call(this, e), e && v.active && i.polygonOffset(e * s, e * 4);
		}, n.resolveFrame = function(...e) {
			return E(), o.resolveFrame.apply(this, e);
		}, n.allocateFrameTargets = function(e, t) {
			o.allocateFrameTargets.call(this, e, t), b(this);
		}, n.postStages.unshift(y()), b(n), A(), !0) : (n.reversedDepth = !1, !1);
	}
	return n.requestReversedDepth = () => {
		x = !0;
	}, n.render = function(e) {
		if (!C && n.reversedDepth === void 0 && (x || _(e)) && j(), !C) return o.render.call(this, e);
		let t = w;
		w = e.eye, S = !0;
		try {
			return o.render.call(this, e);
		} finally {
			S = !1, w = t, E(), O();
		}
	}, x && j(), n;
}
var S = 40;
function C(e, t, n = 40) {
	return t ? e.some(({ smaller: e }) => {
		let [r, i, a] = e.matrix.slice(12, 15), o = t[0] * r + t[4] * i + t[8] * a + t[12], s = t[1] * r + t[5] * i + t[9] * a + t[13], c = t[2] * r + t[6] * i + t[10] * a + t[14];
		return Math.hypot(o, s, c) > n;
	}) : !1;
}
function w(e, { reversedDepth: t = "auto" } = {}) {
	return x(e, t), n(e, (t) => {
		C(t, e.view) && e.requestReversedDepth?.();
	});
}
export { o as FAR_TO_NEAR_LIMIT, S as REVERSED_DEPTH_PAIR_DISTANCE, _ as exceedsFarToNearLimit, C as hasFarOverlap, w as installDepthPrecision, x as installReversedDepth, u as reverseProjectionDepth };
