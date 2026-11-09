/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/film-timeline.js
var e = Object.freeze({
	maxShots: 64,
	maxTotalSeconds: 60,
	minShotSeconds: .1,
	maxShotSeconds: 30,
	maxDipSeconds: 4,
	maxMotionStart: 3600
}), t = /^[A-Za-z0-9_-]{1,24}$/, n = [
	"name",
	"duration",
	"motionStart",
	"camera",
	"dip",
	"focusDistance",
	"blur"
], r = 1e5;
function i(e, t) {
	if (!e || typeof e != "object" || Array.isArray(e) || Object.getPrototypeOf(e) !== Object.prototype) throw TypeError(`${t} must be a plain object.`);
}
function a(e, t, n) {
	for (let r of Object.keys(e)) if (!t.includes(r)) throw TypeError(`${n} has unsupported field ${JSON.stringify(r.slice(0, 48))}.`);
}
function o(e, t, n, r) {
	if (typeof e != "number" || !Number.isFinite(e) || e < t || e > n) throw RangeError(`${r} must be a number from ${t} to ${n}.`);
	return e;
}
function s(e) {
	return !!(e?.motion || e?.physics || e?.cloth);
}
function c(c, l, { checkCamera: u } = {}) {
	i(c, "timeline"), a(c, ["shots"], "timeline");
	let { shots: d } = c;
	if (!Array.isArray(d) || d.length < 1 || d.length > e.maxShots) throw RangeError(`timeline.shots must list 1 to ${e.maxShots} shots.`);
	let f = s(l), p = /* @__PURE__ */ new Set(), m = 0, h = d.map((s, c) => {
		if (i(s, `Shot ${c}`), a(s, n, `Shot ${c}`), typeof s.name != "string" || !t.test(s.name)) throw TypeError(`Shot ${c} name must be 1 to 24 letters, digits, - or _.`);
		if (p.has(s.name)) throw RangeError(`Shot name ${s.name} is used twice.`);
		p.add(s.name);
		let h = o(s.duration, e.minShotSeconds, e.maxShotSeconds, `Shot ${s.name} duration`), g = {
			name: s.name,
			duration: h
		};
		if (s.motionStart !== void 0) {
			if (!f) throw RangeError(`Shot ${s.name} sets motionStart but the recipe has no motion, physics or cloth.`);
			g.motionStart = o(s.motionStart, 0, e.maxMotionStart, `Shot ${s.name} motionStart`);
		}
		if (f && l.motion && !l.motion.loop) {
			let e = g.motionStart ?? m;
			if (e + h > l.motion.duration) throw RangeError(`Shot ${s.name} reads motion up to ${e + h} s but the motion lasts ${l.motion.duration} s. Set motionStart, or make the motion loop.`);
		}
		if (s.dip !== void 0) {
			g.dip = o(s.dip, .05, e.maxDipSeconds, `Shot ${s.name} dip`);
			let t = c === 0 ? Infinity : d[c - 1].duration;
			if (g.dip / 2 > h || g.dip / 2 > t) throw RangeError(`Shot ${s.name} dip is longer than twice the shots on either side of the cut.`);
		}
		return s.camera !== void 0 && (i(s.camera, `Shot ${s.name} camera`), g.camera = u ? u(s.camera) : { ...s.camera }), s.focusDistance !== void 0 && (g.focusDistance = o(s.focusDistance, .01, r, `Shot ${s.name} focusDistance`)), s.blur !== void 0 && (g.blur = o(s.blur, 0, 1, `Shot ${s.name} blur`)), m += h, g;
	});
	if (m > e.maxTotalSeconds) throw RangeError(`The timeline lasts ${m} s; the most is ${e.maxTotalSeconds} s.`);
	return { shots: h };
}
function l(e) {
	let t = 0;
	for (let n of e.shots) t += n.duration;
	return t;
}
function u(e) {
	let t = 0;
	return e.shots.map((e) => {
		let n = {
			name: e.name,
			start: t,
			duration: e.duration
		};
		return t += e.duration, n;
	});
}
function d(e, t, n, r) {
	let i = 1, a = e.shots[n];
	a.dip !== void 0 && (i = Math.min(i, r / (a.dip / 2)));
	let o = e.shots[n + 1];
	if (o?.dip !== void 0) {
		let e = t[n].duration - r;
		i = Math.min(i, e / (o.dip / 2));
	}
	return Math.max(0, Math.min(1, i));
}
function f(e) {
	let t = {};
	return e.focusDistance !== void 0 && (t.focusDistance = e.focusDistance), e.blur !== void 0 && (t.blur = e.blur), Object.keys(t).length > 0 ? t : null;
}
function p(e, t, n) {
	let r = u(e), i = l(e);
	if (!Number.isFinite(n) || n < 0 || n > i) throw RangeError(`Timeline time ${n} is outside 0 to ${i} s.`);
	let a = r.length - 1;
	for (let e = 0; e < r.length; e++) if (n < r[e].start + r[e].duration) {
		a = e;
		break;
	}
	let o = e.shots[a], c = n - r[a].start, p = s(t) ? (o.motionStart ?? r[a].start) + c : null;
	return {
		shotIndex: a,
		shotName: o.name,
		shotTime: c,
		motionTime: p,
		camera: o.camera ?? null,
		depthOfField: f(o),
		brightness: d(e, r, a, c)
	};
}
export { e as FILM_TIMELINE_LIMITS, l as filmTimelineDuration, u as filmTimelineShotStarts, c as normalizeFilmTimeline, p as sampleFilmTimeline };
