/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { i as e } from "./probe-trace-ALKeQrQp.js";
import { t } from "./reflection-probes-Cbpx-KhD.js";
// src/agent-reflections.js
function n(n, r, i, a) {
	let o = i.keyIntensity ?? 1, s = {
		pointLights: i.pointLights,
		spotLights: i.spotLights,
		areaLights: i.areaLights,
		keyColor: Array.from(i.keyColor, (e) => e * o),
		lightDirection: i.lightDirection
	}, c = e(n, s, {
		environment: i,
		environmentMap: a,
		rotation: a?.rotation ?? 0
	});
	if (c.traced.length === 0) return {
		parts: r,
		report: {
			placed: 0,
			skipped: c.skipped
		}
	};
	let l = t(r, c, { rotation: a?.rotation ?? 0 });
	return {
		parts: l.parts,
		report: {
			placed: l.report.placed.length,
			partsWithProbe: l.report.partsWithProbe,
			seconds: c.seconds
		}
	};
}
function r(e, t, r, i, a, o) {
	let { environment: s } = t, c = r.map((e) => Array.from(a.getNode(e.name).worldMatrix)), l = JSON.stringify([
		s.pointLights,
		s.spotLights,
		s.areaLights,
		s.keyColor,
		s.keyIntensity,
		s.lightDirection,
		s.skyTop,
		s.skyBottom,
		s.setup,
		s.hdri,
		s.environmentIntensity,
		s.environmentRotation,
		t.materials,
		c
	]);
	if (e?.key === l && e.sourceParts === r && e.drawnParts === i) return e;
	let u = n(r, i, s, o);
	return {
		key: l,
		sourceParts: r,
		drawnParts: i,
		result: u.report.placed > 0 ? u : null
	};
}
export { n as placeObjectReflections, r as stageObjectReflections };
