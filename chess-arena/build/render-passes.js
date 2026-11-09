/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { r as e, t } from "./gl-program-KwXE3oHO.js";
import { l as n } from "./shader-registry-DHYkwAg5.js";
// src/lighting-pass-shader.js
n("lightingPass", {
	declarations: "#define USES_LIGHTING_PASS (renderPassMode > 5.5)\nvec3 glossyLight = vec3(0.0);\n",
	illuminateSpecular: "  if (USES_LIGHTING_PASS) glossyLight += specular * radiance * normalLight;\n",
	probeReflection: "  if (USES_LIGHTING_PASS && ENVIRONMENT_ENABLED) glossyLight += environmentLighting(normal, specularNormal, baseReflectance, viewDirection, reflected, vec3(0.0), metallic, roughness, occlusion, ambientIntensity, skyReflection);\n",
	probeSurroundings: "    if (USES_LIGHTING_PASS) glossyLight += surroundings * reflectance * skyReflection * (1.0 - roughness * 0.55) * mix(1.0, 0.5 * daylight, worldMode) * occlusion * ambientIntensity;\n",
	worldFinal: "  if (USES_LIGHTING_PASS) {\n    float mist = 1.0 - exp(-length(worldPosition - eye) * fogDensity);\n    vec3 passValue = renderPassMode < 6.5 ? (radiance - glossyLight - emission) * exposure\n      : renderPassMode < 7.5 ? glossyLight * exposure\n      : vec3(renderPassMode < 8.5 ? visibility : renderPassMode < 9.5 ? occlusion : mist);\n    outputColor = vec4(passValue, 1.0);\n    return;\n  }\n"
});
// src/render-passes.js
var r = Object.freeze({
	albedo: 1,
	normal: 2,
	emission: 3,
	depth: 4,
	objectId: 5,
	diffuse: 6,
	glossy: 7,
	shadow: 8,
	ao: 9,
	mist: 10
}), i = Object.freeze({
	depth: [
		1,
		1,
		0,
		1
	],
	shadow: [
		1,
		1,
		1,
		1
	],
	ao: [
		1,
		1,
		1,
		1
	],
	mist: [
		1,
		1,
		1,
		1
	]
}), a = 5, o = Object.freeze([
	0,
	0,
	0,
	1
]), s = "#version 300 es\nprecision highp float;\nuniform sampler2D sourceTexture;\nout vec4 outputColor;\nvoid main() { outputColor = vec4(texelFetch(sourceTexture, ivec2(gl_FragCoord.xy), 0).rgb, 1.0); }";
function c(e, t, n, r = !1) {
	if (r && !e.getExtension("EXT_color_buffer_float")) throw Error("16-bit PNG and EXR output need EXT_color_buffer_float. Use format png.");
	let i = e.createTexture();
	e.bindTexture(e.TEXTURE_2D, i), r ? e.texImage2D(e.TEXTURE_2D, 0, e.RGBA16F, t, n, 0, e.RGBA, e.HALF_FLOAT, null) : e.texImage2D(e.TEXTURE_2D, 0, e.RGBA8, t, n, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST);
	let a = e.createRenderbuffer();
	e.bindRenderbuffer(e.RENDERBUFFER, a), e.renderbufferStorage(e.RENDERBUFFER, e.DEPTH_COMPONENT24, t, n);
	let o = e.createFramebuffer();
	if (e.bindFramebuffer(e.FRAMEBUFFER, o), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, i, 0), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.RENDERBUFFER, a), e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE) throw Error("Render pass framebuffer allocation failed. Choose a lower quality preset.");
	return {
		texture: i,
		depth: a,
		framebuffer: o,
		float: r
	};
}
function l(n) {
	if (n.passSupport) return n;
	let l = null, u = null, d = null;
	function f(e) {
		l &&= (e.deleteTexture(l.texture), e.deleteRenderbuffer(l.depth), e.deleteFramebuffer(l.framebuffer), n.renderTargets.release("passColor", "passDepth"), null);
	}
	function p(e) {
		f(e), u && e.deleteProgram(u), u = null;
	}
	function m(i) {
		let o = r[i.pass];
		if (!o) throw RangeError(`Unknown render pass: ${i.pass}. Use ${Object.keys(r).join(", ")}.`);
		if (n.benchmark) throw Error("Render passes are unavailable in benchmark mode.");
		let p = i.passDepthRange ?? 1;
		if (!Number.isFinite(p) || p <= 0) throw RangeError("Pass depth range must be positive and finite.");
		let m = n.context;
		n.requireFeatureNames(o > a ? ["renderPass", "lightingPass"] : ["renderPass"]), u || (u = t(m, e, s), d = m.getUniformLocation(u, "sourceTexture"));
		let h = i.passFloat === !0;
		if (l && l.float !== h && f(m), !l) {
			let { width: e, height: t } = n.canvas;
			l = c(m, e, t, h), n.renderTargets.record("passColor", {
				width: e,
				height: t,
				format: h ? "RGBA16F" : "RGBA8"
			}), n.renderTargets.record("passDepth", {
				width: e,
				height: t,
				format: "DEPTH_COMPONENT24"
			});
		}
		return o;
	}
	function h() {
		let e = n.context;
		e.bindFramebuffer(e.FRAMEBUFFER, null), e.viewport(0, 0, n.canvas.width, n.canvas.height), e.disable(e.DEPTH_TEST), e.disable(e.CULL_FACE), e.bindVertexArray(null), e.useProgram(u), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, l.texture), e.uniform1i(d, 0), e.drawArrays(e.TRIANGLES, 0, 3);
	}
	function g() {
		return n.batches.filter((e) => n.drawsInOpaqueLoop(e)).flatMap((e) => e.parts.map((e) => e.name));
	}
	return n.passSupport = {
		prepare: m,
		get framebuffer() {
			return l.framebuffer;
		},
		get texture() {
			return l.texture;
		},
		background: (e) => i[e] ?? o,
		copyToCanvas: h,
		objectNames: g,
		releaseTargets: f,
		dispose: p
	}, n;
}
export { r as RENDER_PASS_MODES, l as installRenderPasses };
