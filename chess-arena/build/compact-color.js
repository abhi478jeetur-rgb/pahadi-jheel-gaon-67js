/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/compact-color.js
var e = "R11F_G11F_B10F";
function t(t) {
	let n = t.context;
	if (!t.multisampleFramebuffer) return;
	let { width: r, height: i } = t.canvas;
	n.bindRenderbuffer(n.RENDERBUFFER, t.multisampleColor), n.renderbufferStorageMultisample(n.RENDERBUFFER, t.multisampleSamples, n[e], r, i), n.bindTexture(n.TEXTURE_2D, t.frameTexture), n.texImage2D(n.TEXTURE_2D, 0, n[e], r, i, 0, n.RGB, n.HALF_FLOAT, null);
	for (let e of [t.multisampleFramebuffer, t.resolveFramebuffer]) if (n.bindFramebuffer(n.FRAMEBUFFER, e), n.checkFramebufferStatus(n.FRAMEBUFFER) !== n.FRAMEBUFFER_COMPLETE) throw Error("Compact colour targets failed to allocate. Do not install compact colour on this device.");
	n.bindFramebuffer(n.FRAMEBUFFER, null), t.renderTargets.record("multisampleColor", {
		width: r,
		height: i,
		format: e,
		samples: t.multisampleSamples
	}), t.renderTargets.record("frameColor", {
		width: r,
		height: i,
		format: e
	});
}
function n(n) {
	if (!n.hdr || n.transparent) throw Error("Compact colour needs hdr: true with negotiated HDR support and an opaque canvas, because it has no alpha.");
	if (n.colorFormat === e) return n;
	let r = n.context, i = r.getInternalformatParameter(r.RENDERBUFFER, r[e], r.SAMPLES);
	if (n.multisampleSamples > 0 && !Array.from(i).includes(n.multisampleSamples)) throw Error(`Compact colour does not support ${n.multisampleSamples} samples on this device.`);
	let a = n.allocateFrameTargets;
	return n.allocateFrameTargets = function(e, n) {
		a.call(this, e, n), t(this);
	}, n.colorFormat = e, t(n), n;
}
export { n as useCompactColor };
