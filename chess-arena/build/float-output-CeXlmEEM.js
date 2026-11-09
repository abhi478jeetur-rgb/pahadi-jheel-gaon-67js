/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
function e(e) {
	if (!e.getExtension("EXT_color_buffer_float")) throw Error("16-bit PNG and EXR output need EXT_color_buffer_float, which this browser or GPU does not offer. Use format png.");
}
function t(t, n, r) {
	e(t);
	let i = t.createTexture();
	t.bindTexture(t.TEXTURE_2D, i), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA16F, n, r, 0, t.RGBA, t.HALF_FLOAT, null), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.NEAREST);
	let a = t.createFramebuffer();
	t.bindFramebuffer(t.FRAMEBUFFER, a), t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, i, 0);
	let o = t.checkFramebufferStatus(t.FRAMEBUFFER) === t.FRAMEBUFFER_COMPLETE;
	if (t.bindFramebuffer(t.FRAMEBUFFER, null), !o) throw t.deleteFramebuffer(a), t.deleteTexture(i), Error("The float output framebuffer could not be allocated. Use format png.");
	return {
		width: n,
		height: r,
		framebuffer: a,
		dispose() {
			t.deleteFramebuffer(a), t.deleteTexture(i);
		}
	};
}
function n(e, t, n, r, i = {
	x: 0,
	y: 0,
	width: n,
	height: r
}) {
	if (i.x < 0 || i.y < 0 || i.width < 1 || i.height < 1 || i.x + i.width > n || i.y + i.height > r) throw RangeError("The region lies outside the rendered frame.");
	let a = new Float32Array(i.width * i.height * 4);
	return e.bindFramebuffer(e.READ_FRAMEBUFFER, t), e.readPixels(i.x, r - i.y - i.height, i.width, i.height, e.RGBA, e.FLOAT, a), e.bindFramebuffer(e.READ_FRAMEBUFFER, null), a;
}
function r(e, n) {
	let r = e.floatOutput;
	if (r && r.renderer === e.renderer && r.output.width === n.width && r.output.height === n.height) return r.output;
	r?.output.dispose();
	let i = t(e.renderer.context, n.width, n.height);
	return e.floatOutput = {
		renderer: e.renderer,
		output: i
	}, i;
}
function i(e, t, i, a) {
	let o = i === "pass" ? e.renderer.passSupport.framebuffer : r(e, t).framebuffer, s = n(e.renderer.context, o, t.width, t.height, a), c = new Uint8Array(s.buffer), l = "";
	for (let e = 0; e < c.length; e += 32768) l += String.fromCharCode(...c.subarray(e, e + 32768));
	return {
		width: a?.width ?? t.width,
		height: a?.height ?? t.height,
		data: btoa(l)
	};
}
export { t as createFloatOutput, r as outputFor, n as readFloatPixels, i as readFrame, e as requireFloatTargets };
