/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
// src/assembly.js
function e(e) {
	let t = e.startsWith("Left ") ? -1 : 1, n = e.replace(/^(Left|Right) /, ""), r = {
		"Structural frame": {
			axis: 1,
			sign: 1,
			spread: .9,
			tier: .14,
			lift: 0
		},
		"Battery cassette": {
			axis: 1,
			sign: 1,
			spread: 1.6,
			tier: .14,
			lift: 0
		},
		"Control electronics": {
			axis: 1,
			sign: 1,
			spread: 1.7,
			tier: .14,
			lift: .1
		},
		"Differential drive": {
			axis: 2,
			sign: -1,
			spread: 1.2,
			tier: .14,
			lift: .55
		},
		"Front compactor panel": {
			axis: 2,
			sign: 1,
			spread: 1,
			tier: .05,
			lift: .2
		},
		"Rear service panel": {
			axis: 2,
			sign: -1,
			spread: 1,
			tier: .08,
			lift: .2
		},
		"Roof panel": {
			axis: 1,
			sign: 1,
			spread: 1,
			tier: .18,
			lift: 0
		},
		"body panel": {
			axis: 0,
			sign: t,
			spread: 1,
			tier: .12,
			lift: .4
		},
		"track assembly": {
			axis: 0,
			sign: t,
			spread: 1.7,
			tier: .1,
			lift: .72
		},
		"arm and claw": {
			axis: 0,
			sign: t,
			spread: 1.3,
			tier: .1,
			lift: .5
		},
		"Neck linkage": {
			axis: 1,
			sign: 1,
			spread: 1.4,
			tier: .14,
			lift: 0
		},
		"eye housing": {
			axis: 2,
			sign: -1,
			spread: 1.4,
			tier: .14,
			lift: .08
		},
		"optical mechanism": {
			axis: 2,
			sign: 1,
			spread: 1.4,
			tier: .14,
			lift: .15
		},
		"lens assembly": {
			axis: 2,
			sign: 1,
			spread: 1.8,
			tier: .14,
			lift: .1
		}
	}[n];
	if (!r) throw Error(`No detail layout for assembly section: ${e}`);
	return r;
}
var t = {
	"Caterpillar steel shoe": .18,
	"Caterpillar rubber traction pad": .65,
	"Track sprocket drum": .12,
	"Track exposed wheel disc": .49,
	"Track wheel rim": .58,
	"Track wheel hub": .72,
	"Track hub retaining bolt": .86,
	"Track wheel bolt": 1,
	"Track tension beam": 1.2
};
function n(e, t = 0) {
	if (!Number.isFinite(t)) throw TypeError("Assembly amount must be finite");
	let n = Math.max(0, Math.min(1, t));
	if (n === 0) return [
		0,
		0,
		0
	];
	let r = Math.max(0, Math.min(1, (n - .3) / .7)), i = r * r * (3 - 2 * r), a = e.assembly?.offset ?? [
		0,
		0,
		0
	], o = e.assembly?.detailOffset ?? [
		0,
		0,
		0
	];
	return a.map((e, t) => e * n + o[t] * i);
}
function r(n) {
	let r = /* @__PURE__ */ new Map();
	for (let t of n) {
		let n = t.assembly.section;
		r.has(n) || r.set(n, {
			minimum: [
				Infinity,
				Infinity,
				Infinity
			],
			maximum: [
				-Infinity,
				-Infinity,
				-Infinity
			],
			families: /* @__PURE__ */ new Map(),
			layout: e(n)
		});
		let i = r.get(n);
		for (let e = 0; e < 3; e++) i.minimum[e] = Math.min(i.minimum[e], t.matrix[12 + e]), i.maximum[e] = Math.max(i.maximum[e], t.matrix[12 + e]);
	}
	return n.map((e) => {
		let n = r.get(e.assembly.section), { layout: i } = n;
		n.families.has(e.name) || n.families.set(e.name, {
			tier: n.families.size,
			count: 0
		});
		let a = n.families.get(e.name), o = [
			0,
			0,
			0
		];
		for (let t = 0; t < 3; t++) if (t !== i.axis) {
			let r = (n.minimum[t] + n.maximum[t]) / 2;
			o[t] = (e.matrix[12 + t] - r) * i.spread;
		}
		let s = e.assembly.section.endsWith("track assembly") ? t[e.name] : void 0;
		return o[i.axis] = i.sign * ((s ?? .12 + a.tier * i.tier) + a.count * .018), o[1] += i.lift, a.count++, {
			...e,
			assembly: {
				...e.assembly,
				detailOffset: o
			}
		};
	});
}
export { n, r as t };
