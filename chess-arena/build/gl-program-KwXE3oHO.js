/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { h as e } from "./shader-registry-DHYkwAg5.js";
// src/gl-program.js
var t = "#version 300 es\nprecision highp float;\nout vec2 textureCoordinate;\nvoid main() {\n  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));\n  textureCoordinate = position;\n  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);\n}";
function n(t, n, r) {
	let i = t.createProgram();
	t.getExtension("KHR_parallel_shader_compile");
	let a = [];
	for (let [o, s] of [[t.VERTEX_SHADER, n], [t.FRAGMENT_SHADER, r]]) {
		let n = t.createShader(o);
		t.shaderSource(n, e.reduce((e, t) => t(e), s)), t.compileShader(n), t.attachShader(i, n), a.push(n);
	}
	return t.linkProgram(i), {
		program: i,
		shaders: a
	};
}
function r(e, { program: t, shaders: n }) {
	let r = e.getProgramParameter(t, e.LINK_STATUS), i = n.find((t) => !e.getShaderParameter(t, e.COMPILE_STATUS)), a = i ? e.getShaderInfoLog(i) : e.getProgramInfoLog(t);
	if (n.forEach((t) => e.deleteShader(t)), !r) {
		if (e.deleteProgram(t), e.isContextLost()) return t;
		throw Error(i ? `Shader compilation failed: ${a}` : `Shader linking failed: ${a}`);
	}
	return t;
}
function i(e, t, i) {
	return r(e, n(e, t, i));
}
export { n as i, r as n, t as r, i as t };
