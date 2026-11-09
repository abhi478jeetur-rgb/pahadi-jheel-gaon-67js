/*! 67js, MIT License, Copyright (c) 2026 CodePawl. Bundled gl-matrix: Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV, MIT License. Complete license texts and third-party notices: LICENSE and THIRD-PARTY-NOTICES.md at the package root. */
import { n as e, t } from "./view-transform-names-CDWKtFlr.js";
import { n, t as r } from "./look-catalog-BW-KqP3u.js";
import { a as i, i as a, l as o, m as s, o as c, r as l, s as u, v as d } from "./field-error-DPtscRqU.js";
import { i as f, r as p, t as m } from "./material-layers-C6j9cFSS.js";
// src/agent-scene-capabilities.js
var h = Object.freeze({
	maxNodes: 4096,
	maxDepth: 256,
	maxGeometries: 256,
	maxMaterials: 256,
	maxVertices: 25e4,
	maxGeometryBytes: 33554432,
	maxOperations: 256,
	maxCheckpoints: 8,
	maxRecipeBytes: 1048576
}), g = Object.freeze({
	lake: Object.freeze({
		absorption: Object.freeze([
			.35,
			.07,
			.04
		]),
		turbidity: .02
	}),
	sea: Object.freeze({
		absorption: Object.freeze([
			.4,
			.06,
			.02
		]),
		turbidity: .1
	}),
	river: Object.freeze({
		absorption: Object.freeze([
			.8,
			.9,
			1.6
		]),
		turbidity: .75
	})
}), _ = Object.freeze({
	clearcoat: "Lacquer lobe over the base, surface tag.",
	clearcoatRoughness: "Coat roughness.",
	transmission: "Refracts the opaque scene behind it, surface or liquid tag; blended parts do not show through; no anisotropy, iridescence, sheen or coat.",
	thickness: "Metres crossed; 0 does not bend the view.",
	ior: "Glass 1.5, water 1.33, diamond 2.42; sets the base reflectance.",
	attenuationColor: "Linear RGB kept after attenuationDistance.",
	attenuationDistance: "Metres to reach attenuationColor; omit for none.",
	sheenColor: "Linear RGB glow at grazing angles; black is off.",
	sheenRoughness: "Glow width.",
	specular: "Non-metal reflection, 1 is normal.",
	specularColor: "Linear RGB tint.",
	anisotropy: "Stretches highlights along the grain; the grain follows the UV direction, or rings the up axis without UVs.",
	anisotropyRotation: "Turns the grain around the normal, radians.",
	iridescence: "Thin-film colour shift on reflections.",
	iridescenceIor: "Film index of refraction.",
	iridescenceThickness: "Film nanometres; colours cycle as it grows.",
	toon: "Light steps (toon); 0 off."
}), v = Object.freeze([
	"noise",
	"wood",
	"planks",
	"bricks",
	"tiles",
	"marble",
	"stone",
	"concrete",
	"metal",
	"rust",
	"fabric"
]), y = Object.freeze([
	"color",
	"roughness",
	"metallic",
	"emission",
	"height",
	"opacity",
	"clearcoat",
	"transmission"
]), b = Object.freeze(/* @__PURE__ */ "uv.vec.ramp.noise.voronoi.wave.checker.gradient.add.sub.mul.div.min.max.pow.abs.floor.fract.sqrt.invert.clamp.smoothstep.mix.layer.hue.curve".split(".")), x = Object.freeze({
	maxNodes: 64,
	maxDepth: 12,
	maxStops: 8,
	maxWork: 3e7
}), S = Object.freeze({
	maxCurvePoints: 1024,
	maxProfilePoints: 256,
	maxTextCharacters: 256,
	maxTextLines: 16,
	verticesPerCharacterSegment: 640,
	verticesPerCustomCharacterSegment: 2400,
	maxPointsPerGlyph: 128
}), C = Object.freeze({
	curve: "bends along path, 2-64 points [x,y,z] (Catmull-Rom); the coordinate along axis (x) is the distance from the path start, so model from 0.",
	text: "Extruded text, baseline y=0 along +X, facing +Z. text (\n for lines), size (1), depth (0.2), align left|center|right, curveSegments, font. See docs/modeling.md."
}), w = Object.freeze(["box", "uv"]), T = Object.freeze({
	outputs: "color (linear RGB; a number is grey), roughness, metallic, emission (defaults to 1), height (normal map), opacity (alpha), clearcoat, transmission (masks).",
	textures: Object.freeze({
		noise: "{\"noise\":{\"scale\":8,\"seed\":1,\"octaves\":4}}",
		voronoi: "{\"voronoi\":{\"scale\":6,\"output\":\"distance\"|\"edge\"|\"cell\"}}",
		wave: "{\"wave\":{\"frequency\":4,\"direction\":\"u\"|\"v\"|\"diagonal\",\"shape\":\"sine\"|\"saw\"|\"triangle\"}}",
		checker: "{\"checker\":{\"count\":8}} (even)",
		gradient: "{\"gradient\":{\"type\":\"u\"|\"v\"|\"radial\"}}",
		note: "Each takes \"at\", a vector such as {\"uv\":\"both\"}. Scales are whole numbers 1-64."
	}),
	uv: "{\"uv\":\"u\"|\"v\"|\"both\"} coordinates.",
	ramp: "{\"ramp\":{\"value\":node,\"stops\":[[0,[r,g,b]],[1,[r,g,b]]]}} 2-8 stops rising from 0 to 1.",
	mixing: "{\"layer\":{\"base\",\"top\",\"mask\",\"edge\",\"softness\"}}; {\"hue\":{\"color\",\"shift\",\"saturation\",\"value\"}}; {\"curve\":{\"value\",\"points\":[[x,y]]}}.",
	maths: "add sub mul div min max pow take [a,b]; abs floor fract sqrt invert take one node; clamp smoothstep mix take [a,b,c]; {\"vec\":[r,g,b]}.",
	mapping: "box (default) projects along object axes, no UVs; uv follows geometry UVs. size and axis only apply to box."
}), E = Object.freeze([
	"opaque",
	"blend",
	"add"
]), D = Object.freeze([
	"daylight",
	"overcast",
	"sunset",
	"studio"
]), O = "daylight", k = Object.freeze([
	"albedo",
	"normal",
	"emission",
	"depth",
	"objectId",
	"diffuse",
	"glossy",
	"shadow",
	"ao",
	"mist"
]);
Object.freeze(["cpu", "nvenc"]), Object.freeze([
	"png",
	"png16",
	"exr"
]);
var A = Object.freeze({
	draft: Object.freeze({
		samples: 32,
		bounces: 1,
		texelsPerUnit: 3
	}),
	standard: Object.freeze({
		samples: 128,
		bounces: 3,
		texelsPerUnit: 6
	}),
	fine: Object.freeze({
		samples: 128,
		bounces: 3,
		texelsPerUnit: 6
	})
}), j = Object.freeze({
	samples: [1, 256],
	bounces: [1, 8],
	texelsPerUnit: [1, 12]
}), M = 5e6, N = 24e6, P = Object.freeze({
	weld: "distance 0.001: merge closer vertices.",
	triangulate: "minVertices 4: split faces with that many corners or more.",
	edge_split: "angle 30: split edges bending more than this many degrees.",
	smooth: "factor 0.5 (-2 to 2) steps toward the neighbour mean; iterations 1 to 64.",
	simple_deform: "mode twist or bend use angle (45 degrees), taper or stretch use factor (0.5); axis x, y or z (z).",
	cast: "sphere about the origin: factor 0 to 1 (0.5), size radius (0 = mean vertex distance).",
	screw: "revolves every edge about axis x, y or z (z) through the origin, dropping faces: angle 360, steps 16 (1-256) and iterations 1-64, lift 0 per iteration. A whole number of turns with no lift closes the ring.",
	wireframe: "rim of thickness 0.02 on each face: offset -1..1 (0) moves the strut inside..outside, evenOffset true, replace true drops the faces.",
	skin: "closed square tube per edge: radius 0.1 or a scalar field per vertex (above 0). Simple: tubes overlap, no branch solver.",
	lattice: "divisions [2,2,2] (2-8) control points over the mesh bounds; moves up to 64 of {point:[i,j,k], offset:[x,y,z]}; trilinear blend.",
	curve: "bends the mesh along path, 2 to 64 points [x,y,z] through a Catmull-Rom spline. The coordinate along axis (x) is the distance from the path start, the other two become offsets in a twist-free frame; past the ends the mesh continues straight. Model the mesh along the axis starting at 0.",
	hook: "vertices within radius 1 of center [0,0,0] move by translation [0,0,0] times strength 0-1 (1); falloff smooth, linear or constant.",
	wave: "a gaussian ripple of height 0.5 along z (normal true: along the vertex normal) that travels from start [0,0] over axes xy (default), x or y; width 1.5, narrowness 0 to 50 (1.5), speed 0.25 per frame, time 0 (a frame number), timeOffset 0, cyclic true repeats it. Matches Blender Wave at the same frame.",
	weighted_normal: "corner normals weighted by face area ^ (weight/50), weight 1-100 (50), smoothed across edges under angle 30 that are not sharp. Put it last in the stack.",
	smooth_by_angle: "edges bending over angle 30 (0-180) become sharp, others smooth, over smoothAngle; ignoreSharp true also clears hand-made sharp edges.",
	bounding_box: "becomes its axis-aligned box.",
	convex_hull: "becomes its convex hull, up to 8192 vertices."
}), F = Object.freeze({
	vertex_group: "name (required) sets the weights 0-1 of the vertices of the selected faces; the rest keep theirs (0 in a new group). One of weight (1), field (number expression) or gradient { axis x|y|z, range [low, high], weights [atLow, atHigh] }. Max 32 groups. displace takes group: name and scales each move by the weight; cloth takes pinGroup. Put it after shape edits: a stack node that rebuilds the mesh drops groups.",
	vertex_color: "sets the corner colors (0-1, linear, white until set) of the selected faces. One of color [r, g, b], field (vector expression of the vertex) or gradient { axis, range [low, high], colors [[r,g,b] atLow, [r,g,b] atHigh] }. Drawn, written as COLOR_0 in a GLB, and multiplies the material color."
}), I = Object.freeze({ shapeKeys: "On a mesh geometry, at most 16: { name, offsets, value } or { name, edits, value }. offsets is a list of { select, offset: [x,y,z], falloff } moves like the translate edit; edits are mesh edits that only move vertices run on the finished mesh, after the stack. value (0, from 0 to 1) is the weight without motion. Each key becomes a glTF morph target. Animate it with a motion track { kind: \"morph\", id: <key name>, property: \"weight\", keyframes }; a GLB export writes targets, names (mesh.extras.targetNames) and weights." }), L = Object.freeze({
	sculpt: "strokes run in order on the vertices of the selected faces; other vertices stay, so a tag confines them. A stroke has type inflate (along the vertex normal), displace (along direction, needed) or smooth (strength 0 to 1), center and radius, strength in mesh units (negative pushes in). Falloff is smooth to zero at the radius.",
	shrinkwrap: "target is a primitive record placed by translation, rotation and scale. mode nearest (default) moves each selected vertex to the closest point; project moves it along direction (needed) to the first hit. offset (default 0) stands it off along the normal, on the side it came from. maxDistance limits the search; onMiss error (default) or keep. For a decal, use enough grid cells to follow the curve, then solidify."
}), R = Object.freeze({
	format: "67js.scene",
	schemaVersion: 1,
	geometryTypes: Object.freeze([
		"box",
		"cylinder",
		"sphere",
		"cone",
		"icoSphere",
		"torus",
		"lathe",
		"extrude",
		"tube",
		"curve",
		"text",
		"grid",
		"plane",
		"circle",
		"line",
		"terrain",
		"mesh"
	]),
	camera: "eye, target, up, near, far, then fov (vertical degrees) or focalLength (mm, with sensorWidth mm, default 36; not both). projection orthographic with orthoScale (view height in m, default 4). shift [x, y] moves the frame by a fraction of its width and height. fStop (0.7 to 64) turns on depth of field focused on target; 1.4 or lower is full blur, and effects.depthOfField.blur must stay 0. Orthographic and shifted cameras render with the rasterizer, not the path tracer.",
	terrain: "One mesh, x and z from -size/2 to size/2, hills about y = 0. size 40 m (1-2000), resolution 64 cells (2-256), seed 1, amplitude 1 m (0-200), holes up to 16 of {center:[x,z],radius} with no surface inside; radius a few cells or more.",
	placedAssets: "Node field asset:{id,materials?,clip?,drive?} turns a group node into a catalog GLB (id from asset_catalog). Its transform places it. materials:[{name,color,metallic,roughness,opacity,emission,emissiveColor}] override source materials by name. clip:{index,start=0,speed=1,loop=true} plays that clip from scene time start on a decoded copy of its own; set-motion tracks move the node and scene time seeks the clip. drive:{path | legs, cruiseSpeed | speed, wheels, lights} drives a car along a path in the placement frame on a decoded copy (fields as motion.drive in an asset recipe, docs/vehicle.md). scene_inspect assets adds wheels, rejectedNames and light signals. At most 512 placements, 16 assets, 16 playing a clip or driving.",
	navigation: "scene_inspect path:{ground,from:[x,z],to:[x,z]} returns a route over the ground node around its holes, steep slopes and the nodes in avoid:[ids] (box footprints), as keyframes [{time,value:[x,y,z]}] for a translation track with interpolation LINEAR. radius 0.3 m keeps the walker off holes and avoided nodes; maxSlope 40 degrees; cellSize defaults to radius; give seconds for the whole walk or speed (1.4 m/s); lift raises y.",
	meshEdits: Object.freeze({
		operations: Object.freeze(Object.keys(s)),
		maxEdits: 64
	}),
	meshStack: Object.freeze({
		operations: d,
		maxNodes: 16
	}),
	meshModifiers: P,
	meshSculpt: L,
	meshAttributes: F,
	meshShapeKeys: I,
	fieldExpressions: Object.freeze({
		operators: a,
		attributes: l,
		maxNodes: 64,
		maxDepth: 12,
		maxElements: u,
		rotation: "rotate [v, axis, rad]; align [dir]: Euler of +Y to dir; transform [p, move, euler, size].",
		surfaces: "nearest {surface, at, read distance|point|normal}; raycast {surface, at, direction, read hit|distance|point|normal, miss}. at defaults to position; rays go forward. surface: geometry id (instances where) or record (mesh edits). attr group + name reads a vertex group."
	}),
	instancing: Object.freeze({
		sources: c,
		maxCandidatePoints: o
	}),
	operations: Object.freeze([
		"set-node",
		"set-material",
		"set-camera",
		"add-node",
		"remove-node",
		"add-geometry",
		"remove-geometry",
		"add-material",
		"remove-material",
		"set-environment",
		"set-effects",
		"set-shadow",
		"set-motion",
		"set-armatures",
		"set-physics",
		"set-cloth",
		"set-timeline",
		"set-particles",
		"set-bake",
		"set-post-passes",
		"edit-mesh",
		"set-mesh-stack"
	]),
	materialTags: Object.freeze([
		"surface",
		"unlit",
		"liquid",
		"foam",
		"foliage",
		"grass",
		"water"
	]),
	water: Object.freeze({
		presets: g,
		default: "lake",
		note: "absorption 0..20, turbidity 0..1 softens shadows below; opacity under 1 shows the bed."
	}),
	materialLayers: Object.freeze(Object.fromEntries(p.map((e) => [e, Object.freeze({
		range: f[e] ?? m[e] ?? "above 0",
		note: _[e]
	})]))),
	materialSubsurface: "material.subsurface { weight, radius, scale, color } as Blender Principled BSDF Subsurface; surface tag, rasterizer only. Ranges in scene_create.",
	alphaModes: E,
	materialPatterns: v,
	maxMaterialPatterns: 16,
	materialMappings: w,
	renderPasses: Object.freeze({
		names: k,
		files: "render-<pass>.png or frame-N-<pass>.png, raw and unantialiased; opaque and cutout geometry only",
		depth: "16 bits in red and green over 100 m",
		objectId: "24 bits in RGB; the job result lists the part names"
	}),
	filmTimeline: Object.freeze({
		maxShots: 64,
		maxTotalSeconds: 60,
		maxShotSeconds: 30,
		shot: "name (unique), duration, motionStart (default: the shot start, so non-looping motion must cover it), camera (partial: eye target up fov near far), focusDistance (m) and blur (0 to 1) for the depth of field of the shot, dip (s; fades through black at the cut into this shot).",
		notSupported: "layers, overlaps, crossfades, markers, events, imported assets"
	}),
	curveText: Object.freeze({
		maxCurvePoints: S.maxCurvePoints,
		maxProfilePoints: S.maxProfilePoints,
		maxTextCharacters: S.maxTextCharacters,
		maxTextLines: S.maxTextLines,
		verticesPerCharacterSegment: S.verticesPerCharacterSegment,
		details: C
	}),
	materialGraph: Object.freeze({
		outputs: y,
		operators: b,
		...x,
		nodes: T
	}),
	importedMeshEdits: Object.freeze({
		...i,
		transfer: "New vertices take skin weights, morph deltas and colours from the nearest original surface point; faces left without UVs read the nearest original UV island. Not supported: mesh_stack, relations, instancing.",
		rejects: "On a skinned or morphed part an edit farther than maxTransferFraction of the part bounds diagonal from the original surface; booleans on open parts (fill_holes first)."
	}),
	fixedResources: !1,
	dynamicTopology: !0,
	checkpoints: !0,
	positiveScaleOnly: !0,
	gltfImport: "Optional extensions and line primitives load with a warning; unlit and punctual lights are read.",
	authoredLook: !0,
	maxPointLights: 16,
	catalogLooks: Object.freeze({
		hdri: "environment.hdri",
		hdris: n,
		cubeLooks: r,
		look: "environment.look",
		catalogId: "64-hex ID of a .hdr or .cube in scene_asset_catalog",
		note: "environmentIntensity and environmentRotation apply; keyIntensity 0 if the HDRI has a sun"
	}),
	lightingSetups: D,
	defaultLightingSetup: O,
	ambientOcclusion: Object.freeze({
		default: 0,
		defaultRadius: .5,
		off: 0
	}),
	maxSpotLights: 8,
	maxAreaLights: 7,
	localShadows: Object.freeze({
		lights: Object.freeze(["pointLights", "spotLights"]),
		atlasTiles: 24,
		pointLightTiles: 6,
		spotLightTiles: 1,
		tileSize: 512
	}),
	lightLinking: Object.freeze({
		fields: Object.freeze([
			"environment.keyAffects",
			"pointLights[].affects",
			"spotLights[].affects",
			"areaLights[].affects"
		]),
		unlisted: "a light without affects lights every node",
		unknownNode: "rejected",
		bake: "honoured",
		pathTracer: "ignored, named in report.ignored"
	}),
	shadowCascades: Object.freeze({
		field: "environment.shadowCascades",
		counts: Object.freeze([
			0,
			1,
			2,
			3,
			4
		]),
		zero: "one shadow map",
		automatic: "three cascades when shadow.extent is above 40 and the field is unset",
		maximumDistance: 150,
		note: "volume fog and water read the single map"
	}),
	lineArt: Object.freeze({
		field: "environment.lines",
		fields: "width px 0.25-16 (1.5), color, boundaries, creaseAngle deg (35), depthJump (0.08), toon steps 0-8, polylines [{points [x,y,z] 2-256, color, width, depthTest, closed}] max 64; {} turns on, null clears; material toon 0-8",
		note: "docs/line-art.md"
	}),
	viewTransform: Object.freeze({
		field: "environment.viewTransform",
		names: e,
		default: "aces",
		look: "environment.look",
		looks: t,
		choose: "agx for lit scenes and Blender comparisons, neutral for product and brand colour, aces for contrast; needs loadAgentSceneModules"
	}),
	renderFlags: Object.freeze({
		nodeFields: Object.freeze([
			"visible",
			"castShadow",
			"receiveShadow",
			"holdout",
			"shadowCatcher"
		]),
		motion: "node track property visible: 1 or 0, STEP",
		note: "visible:false hides a node and children; holdout and shadowCatcher need a transparent canvas (Renderer67 transparent:true); flags split batches."
	}),
	depthBias: Object.freeze({
		nodeFields: Object.freeze(["decal", "depthLayer"]),
		maxDepthLayer: 4,
		environment: "environment.resolveCoplanar",
		modes: Object.freeze(["offset"]),
		warning: "coplanar-overlap",
		note: "decal wins over the surface below; depthLayer stacks decals; resolveCoplanar offset biases the smaller part of a flagged pair."
	}),
	proceduralMotion: !0,
	motionIk: Object.freeze(["two-bone", "aim"]),
	relations: Object.freeze({
		maxPerNode: 8,
		maxNodes: 256,
		sides: Object.freeze([
			"+x",
			"-x",
			"+y",
			"-y",
			"+z",
			"-z"
		]),
		kinds: Object.freeze({
			attach: "to, side, offset: touch the face of the target on side and centre on the other axes; offset is the distance, negative sinks in",
			gap: "to, side, offset: as attach on that axis only",
			flush: "to, side, offset: own face on side level with the same face of the target",
			align: "to, axis, at (min, center, max), offset: anchor on one axis",
			centered: "to, axes (default x, y, z): centre on those axes"
		}),
		notes: "Region (mesh tag): target faces only. One relation per axis, no loops, mesh nodes only. A relation sets translation on its axes. set-node with relations [] removes them."
	}),
	rigging: Object.freeze({
		presets: Object.freeze(["humanoid", "quadruped"]),
		maxArmatures: 16,
		maxBones: 128,
		maxInfluences: 4,
		weights: "bone-distance"
	}),
	motionConstraints: Object.freeze([
		"copy_location",
		"copy_rotation",
		"copy_scale",
		"limit_location",
		"limit_rotation",
		"track_to",
		"child_of",
		"floor",
		"copy_transforms",
		"limit_distance",
		"limit_scale",
		"stretch_to",
		"locked_track",
		"transformation",
		"action"
	]),
	motionDrivers: Object.freeze({
		maxDrivers: 32,
		maxConstraints: 32,
		maxExpressionParts: 64,
		maxExpressionDepth: 8
	}),
	physics: Object.freeze({
		bodyTypes: Object.freeze([
			"dynamic",
			"fixed",
			"kinematic"
		]),
		shapes: Object.freeze([
			"box",
			"ball",
			"capsule",
			"convex",
			"trimesh"
		]),
		jointTypes: Object.freeze([
			"spherical",
			"revolute",
			"prismatic",
			"fixed"
		]),
		sensors: !0,
		collisionLayers: 16,
		ragdoll: "physics.ragdoll {armature}: limp capsule per bone; needs a floor",
		limits: Object.freeze({
			maxBodies: 64,
			maxJoints: 64,
			maxDuration: 10,
			framesPerSecond: 60,
			maxTrimeshTriangles: 2e4,
			maxHullPoints: 2048
		})
	}),
	cloth: Object.freeze({
		sheetGeometry: "grid { segments 1-64 }: unit sheet in XY facing +Z, sized by node scale; any triangle mesh works",
		defaults: Object.freeze({
			stiffness: .9,
			bend: .1,
			density: .2,
			damping: .3,
			friction: .3,
			thickness: .01,
			colliderShape: "box"
		}),
		notes: "density kg/m2, damping 1/s, thickness m, wind m/s steady. Pin edges are of the local bounds. Colliders { node, shape ball|box } are fixed fits to geometry bounds and, like sheets, root nodes without a motion track or body. Moving: { attach, shape ball|capsule, radius, offset, to, toOffset } or { armature, radiusFraction, exclude }. Sheet pinGroup names a sheet vertex group whose vertices (weight 0.5 or more) are held. Sheet pinTo { node, weight } rides pinned edges on a node. No self collision.",
		limits: Object.freeze({
			maxSheets: 8,
			maxColliders: 16,
			maxMovingColliders: 64,
			maxDuration: 10,
			maxParticles: 5e3,
			framesPerSecond: 60,
			substeps: 4,
			iterations: 8
		})
	}),
	particles: Object.freeze({
		emitter: "System node keeps its geometry as the particle shape; node transform does not move particles. Fields (defaults): node, seed (1), count (100), rate (per second; omit for a burst at 0), lifetime, speed, size (number or [min, max]; 1, 1, 0.05), direction ([0,1,0]), spread (cone degrees, 30), emitter { shape point|box|sphere|disc, position, halfExtents, radius }, scale constant|shrink|grow, drag (1/s, 0), floor (world y particles land on).",
		hair: "type hair grows strands from a read-only root surface node into node (its own geometry is ignored). Fields (defaults): surface, seed, count, length (m, number or [min, max], 0.1), segments (1-8, 4), width (m, 0.004), droop (0.5), lean (0.2), sway (tip travel m, off), swayRate (Hz, 0.5). Tapering tubes, no UVs.",
		sectionFields: "systems, gravity ([0,-9.81,0]), wind (m/s; moves emitter particles only with drag > 0, and sets the hair sway direction), fields (also cloth; wind, turbulence, vortex, drag, magnet: docs/physics.md)",
		collision: "colliders [node ids], bounce 0-1 (0.3 with colliders), friction 0-1 (0.5), spin deg/s, color [[r,g,b] birth, [r,g,b] death], alpha [birth, death].",
		notes: "Pure function of seed, index and time; raising count keeps earlier ones. No hair collision.",
		limits: Object.freeze({
			maxSystems: 4,
			maxParticlesPerSystem: 2e3,
			maxParticles: 4e3,
			maxVertices: 1e5,
			maxLifetime: 60
		})
	}),
	bake: Object.freeze({
		fields: "preset, or samples (1-256), bounces (1-8), texelsPerUnit (1-12) over it; irradianceGrid true or 8-48 nodes: a baked grid of bounced diffuse light in place of lightmaps (opt in, static); gridFog true adds the fog (sunlit closed rooms; dark shafts too bright); probes room by default, false for none, or up to 4 {position, radius?}; rebake true bakes each sampled pose (4 kept).",
		presets: A,
		notes: "Bounced light from point, spot, area and key lights. Reruns when parts, lights, materials or bake change. Skips alpha, skin, morph, hair, cloth (bake.skipped). A preset shrinks to fit (bake.used, bake.reduction); explicit settings fail over maxPathWork or past maxSeconds. No environment map or specular; probes are specular, not in glTF.",
		limits: Object.freeze({
			maxSeconds: 20,
			workerMaxSeconds: 90,
			maxPathWork: N,
			maxPointLights: 16
		})
	}),
	motionLook: Object.freeze({
		light: "id point:N, spot:N or area:N (index in its list): position, color, intensity; direction on spot and area",
		sun: "direction, color, intensity (lightDirection, keyColor, keyIntensity)",
		environment: "skyTop, skyBottom, fogColor, fogDensity, volumeFogDensity, ambientIntensity, fillIntensity, environmentIntensity, environmentRotation",
		effects: "exposure, focusDistance (needs effects.depthOfField.blur above 0; an fStop camera focuses on its target)",
		note: "Same keyframes and easing as other tracks. After sampleMotion, scene.environment and scene.effects hold the sampled values; the recipe keeps its authored ones. Baked light (bake) does not follow."
	}),
	motionLimits: Object.freeze({
		maxTracks: 128,
		maxKeyframesPerTrack: 64,
		maxKeyframes: 2048,
		maxDuration: 30
	})
});
export { M as a, O as c, b as d, y as f, E as h, A as i, D as l, v as m, h as n, j as o, w as p, N as r, S as s, R as t, x as u };
