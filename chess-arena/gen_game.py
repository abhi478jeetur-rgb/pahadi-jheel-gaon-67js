#!/usr/bin/env python3
"""67js game scene generator: Shatranj Akhada — do raja, beech me chess arena.
Flat nodes (har part apna node), taaki game JS har part ki matrix khud ghuma sake.
Piece sub-part ids: pc-<team>-<code>-<sub>  (team b=neela, r=laal)
"""
import json, math, os, shutil

def yaw(deg):
    r = math.radians(deg) / 2
    return [0, math.sin(r), 0, math.cos(r)]

def qx(deg):
    r = math.radians(deg) / 2
    return [math.sin(r), 0, 0, math.cos(r)]

def qz(deg):
    r = math.radians(deg) / 2
    return [0, 0, math.sin(r), math.cos(r)]

def qmul(a, b):
    ax, ay, az, aw = a; bx, by, bz, bw = b
    return [aw*bx + ax*bw + ay*bz - az*by,
            aw*by - ax*bz + ay*bw + az*bx,
            aw*bz + ax*by - ay*bx + az*bw,
            aw*bw - ax*bx - ay*by - az*bz]

Y180 = [0, 1, 0, 0]

geometries = [
    {"id": "box", "type": "box"},
    {"id": "box-soft", "type": "box", "bevel": 0.04, "subdivisions": 2},
    {"id": "cyl", "type": "cylinder", "segments": 20},
    {"id": "cyl-low", "type": "cylinder", "segments": 10},
    {"id": "sphere", "type": "sphere", "segments": 20, "rings": 14},
    {"id": "cone", "type": "cone", "segments": 20},
    {"id": "cone4", "type": "cone", "segments": 4},
    {"id": "circle", "type": "circle", "segments": 36},
    {"id": "torus", "type": "torus", "tubeRadius": 0.07, "segments": 36, "sides": 8},
]

materials = [
    {"id": "grass", "color": [0.4, 0.6, 0.29], "roughness": 1.0,
     "pattern": {"resolution": 256, "type": "noise", "size": 26, "bump": 0.1, "seed": 11}},
    {"id": "dirt", "color": [0.74, 0.64, 0.46], "roughness": 1.0,
     "pattern": {"resolution": 256, "type": "noise", "size": 3, "bump": 0.15, "seed": 17}},
    {"id": "stone", "color": [0.64, 0.62, 0.59], "roughness": 0.95,
     "pattern": {"resolution": 256, "type": "stone", "size": 1.7, "bump": 0.7, "seed": 5}},
    {"id": "stone-dark", "color": [0.45, 0.45, 0.48], "roughness": 0.95,
     "pattern": {"resolution": 256, "type": "stone", "size": 1.4, "bump": 0.6, "seed": 8}},
    {"id": "sq-light", "color": [0.93, 0.87, 0.73], "roughness": 0.55,
     "pattern": {"resolution": 256, "type": "noise", "size": 2, "bump": 0.08, "seed": 3}},
    {"id": "sq-dark", "color": [0.4, 0.34, 0.29], "roughness": 0.6,
     "pattern": {"resolution": 256, "type": "noise", "size": 2, "bump": 0.08, "seed": 4}},
    {"id": "gold", "color": [0.85, 0.62, 0.2], "metallic": 0.9, "roughness": 0.32},
    {"id": "steel", "color": [0.63, 0.66, 0.71], "metallic": 0.85, "roughness": 0.35},
    {"id": "armor-b", "color": [0.16, 0.3, 0.74], "metallic": 0.35, "roughness": 0.48},
    {"id": "armor-r", "color": [0.72, 0.16, 0.14], "metallic": 0.35, "roughness": 0.48},
    {"id": "cloth-b", "color": [0.11, 0.23, 0.62], "roughness": 0.92},
    {"id": "cloth-r", "color": [0.64, 0.11, 0.11], "roughness": 0.92},
    {"id": "skin", "color": [0.92, 0.7, 0.55], "roughness": 0.7},
    {"id": "white", "color": [0.92, 0.92, 0.94], "roughness": 0.85},
    {"id": "wood", "color": [0.9, 0.88, 0.85], "roughness": 0.88,
     "pattern": {"resolution": 256, "type": "planks", "size": 1.6, "count": 5, "bump": 0.4,
                 "colors": [[0.3, 0.2, 0.11], [0.48, 0.34, 0.19]], "seed": 8, "axis": "x"}},
    {"id": "wood-dark", "color": [0.9, 0.88, 0.85], "roughness": 0.85,
     "pattern": {"resolution": 256, "type": "wood", "size": 1.4, "count": 7, "bump": 0.35,
                 "colors": [[0.2, 0.12, 0.06], [0.38, 0.24, 0.12]], "seed": 6, "axis": "y"}},
    {"id": "tent", "color": [0.9, 0.86, 0.76], "roughness": 0.95, "doubleSided": True,
     "pattern": {"resolution": 256, "type": "fabric", "size": 0.8, "bump": 0.15, "seed": 19}},
    {"id": "leaf", "color": [0.26, 0.52, 0.21], "roughness": 1.0},
    {"id": "trunk", "color": [0.36, 0.25, 0.15], "roughness": 1.0},
    {"id": "glow-move", "color": [0.1, 0.5, 0.2], "roughness": 0.4,
     "emission": 2.0, "emissiveColor": [0.25, 1.0, 0.4]},
    {"id": "glow-cap", "color": [0.5, 0.12, 0.08], "roughness": 0.4,
     "emission": 2.2, "emissiveColor": [1.0, 0.3, 0.15]},
    {"id": "glow-sel", "color": [0.5, 0.38, 0.08], "roughness": 0.4,
     "emission": 2.2, "emissiveColor": [1.0, 0.78, 0.25]},
]

nodes = []
def N(**kw):
    nodes.append(kw)
    return kw["id"]

BASE_Y = 1.3  # board ke squares ki upari satah

def sq_x(f):  # file 0..7 -> x
    return (f - 3.5) * 4
def sq_z(r):  # rank 1..8 -> z (rank1 neeche/neela ghar)
    return (4.5 - r) * 4

# ---------------- ARENA ----------------
N(id="ground", geometry="box", material="grass", translation=[0, -0.5, 0], scale=[170, 1, 170])
for i, (dx, dz, ds) in enumerate([(0, 44, 16), (-40, 30, 11), (42, 26, 12), (30, -42, 13), (-38, -34, 10)]):
    N(id=f"dirt-{i}", geometry="circle", material="dirt", translation=[dx, 0.03, dz],
      rotation=qx(-90), scale=[ds, ds, 1])

# Board platform + frame
N(id="platform", geometry="box", material="stone-dark", translation=[0, 0.5, 0], scale=[43, 1.0, 43])
for i in range(64):
    f, rr = i % 8, i // 8  # rr 0 = rank8 (door) ... sirf rang ke liye
    r = 8 - rr
    N(id=f"sq-{f}-{r}", geometry="box", material="sq-light" if (f + r) % 2 == 0 else "sq-dark",
      translation=[sq_x(f), 1.15, sq_z(r)], scale=[3.92, 0.3, 3.92])
for i, (fx, fz, fw, fd) in enumerate([(0, -16.9, 35.6, 1.6), (0, 16.9, 35.6, 1.6),
                                      (-16.9, 0, 1.6, 35.6), (16.9, 0, 1.6, 35.6)]):
    N(id=f"frame-{i}", geometry="box", material="stone-dark", translation=[fx, 1.12, fz], scale=[fw, 0.36, fd])
    N(id=f"frame-gold-{i}", geometry="box", material="gold",
      translation=[fx, 1.32, fz], scale=[fw if fw > 2 else 0.35, 0.07, fd if fd > 2 else 0.35])
for i, (cx, cz) in enumerate([(-16.9, -16.9), (16.9, -16.9), (-16.9, 16.9), (16.9, 16.9)]):
    N(id=f"corner-gold-{i}", geometry="box", material="gold", translation=[cx, 1.3, cz], scale=[1.7, 0.5, 1.7])

# Deewarein + kangure
walls = [("n", 0, -27, 56, 1.8), ("s", 0, 27, 56, 1.8), ("w", -27, 0, 1.8, 56), ("e", 27, 0, 1.8, 56)]
for wid, wx, wz, ww, wd in walls:
    N(id=f"wall-{wid}", geometry="box", material="stone", translation=[wx, 2.5, wz], scale=[ww, 5, wd])
    n = 10
    for i in range(n + 1):
        t = -25 + i * 5
        cx, cz = (wx + t, wz) if ww > wd else (wx, wz + t)
        N(id=f"merlon-{wid}-{i}", geometry="box", material="stone", translation=[cx, 5.45, cz], scale=[2.0, 0.9, 2.0])

# Kone ke tower
for i, (tx, tz, team) in enumerate([(-27, -27, "r"), (27, -27, "r"), (-27, 27, "b"), (27, 27, "b")]):
    N(id=f"tower-{i}", geometry="cyl", material="stone", translation=[tx, 4.75, tz], scale=[3.1, 9.5, 3.1])
    N(id=f"tower-rim-{i}", geometry="cyl", material="stone-dark", translation=[tx, 9.6, tz], scale=[3.5, 0.7, 3.5])
    N(id=f"tower-roof-{i}", geometry="cone", material=f"cloth-{team}", translation=[tx, 11.5, tz], scale=[3.9, 3.4, 3.9])
    N(id=f"tower-pole-{i}", geometry="cyl-low", material="wood-dark", translation=[tx, 14.2, tz], scale=[0.09, 2.4, 0.09])
    N(id=f"tower-flag-{i}", geometry="box", material=f"cloth-{team}", translation=[tx + 0.8, 15.0, tz], scale=[1.5, 0.8, 0.08])

# ---------------- MOHRE (pieces) ----------------
def build_parts(kind, team):
    """Local parts (neele ke hisaab se, aage = -z). (sub, geo, mat, t, q, s)"""
    A = f"armor-{team}"; C = f"cloth-{team}"
    P = []
    def add(sub, geo, mat, t, q=None, s=None):
        P.append((sub, geo, mat, t, q, s))
    if kind == "p":  # pyada sainik
        add("base", "cyl", "stone-dark", [0, 0.13, 0], s=[1.12, 0.26, 1.12])
        add("ring", "cyl", A, [0, 0.05, 0], s=[1.24, 0.1, 1.24])
        add("body", "cyl", A, [0, 0.76, 0], s=[0.44, 1.0, 0.44])
        add("head", "sphere", "skin", [0, 1.62, 0], s=[0.3, 0.3, 0.3])
        add("helmet", "cone", "steel", [0, 1.87, 0], s=[0.37, 0.44, 0.37])
        add("wpn", "cyl-low", "steel", [0.58, 1.3, -0.15], q=qx(-10), s=[0.05, 2.3, 0.05])
        add("shield", "box", A, [-0.58, 1.0, -0.05], s=[0.14, 0.9, 0.62])
    elif kind == "r":  # haathi / burj
        add("base", "cyl", "stone-dark", [0, 0.13, 0], s=[1.2, 0.26, 1.2])
        add("ring", "cyl", A, [0, 0.05, 0], s=[1.32, 0.1, 1.32])
        add("body", "cyl", "stone", [0, 1.15, 0], s=[0.88, 1.8, 0.88])
        add("rim", "cyl", "stone-dark", [0, 2.2, 0], s=[1.02, 0.34, 1.02])
        for j, (mx, mz) in enumerate([(-0.62, -0.62), (0.62, -0.62), (-0.62, 0.62), (0.62, 0.62)]):
            add(f"merlon{j}", "box", "stone", [mx, 2.55, mz], s=[0.34, 0.4, 0.34])
        add("banner", "box", C, [0, 1.35, -0.92], s=[0.7, 0.9, 0.08])
    elif kind == "n":  # ghoda
        add("base", "cyl", "stone-dark", [0, 0.13, 0], s=[1.12, 0.26, 1.12])
        add("ring", "cyl", A, [0, 0.05, 0], s=[1.24, 0.1, 1.24])
        add("legf", "box", "stone-dark", [0, 0.31, -0.52], s=[1.0, 0.62, 0.24])
        add("legb", "box", "stone-dark", [0, 0.31, 0.52], s=[1.0, 0.62, 0.24])
        add("body", "box-soft", A, [0, 1.05, 0.05], s=[1.05, 0.85, 1.9])
        add("neck", "box", A, [0, 1.55, -0.95], q=qx(-32), s=[0.55, 1.0, 0.6])
        add("head", "box", A, [0, 2.0, -1.35], q=qx(18), s=[0.5, 0.55, 1.0])
        add("ear0", "cone", "steel", [-0.16, 2.32, -1.15], s=[0.09, 0.3, 0.09])
        add("ear1", "cone", "steel", [0.16, 2.32, -1.15], s=[0.09, 0.3, 0.09])
        add("mane", "box", C, [0, 1.8, -0.72], q=qx(-32), s=[0.14, 0.9, 0.5])
        add("rtorso", "cyl", A, [0, 1.85, 0.15], s=[0.34, 0.7, 0.34])
        add("rhead", "sphere", "skin", [0, 2.45, 0.15], s=[0.26, 0.26, 0.26])
        add("rhelmet", "cone", "steel", [0, 2.64, 0.15], s=[0.3, 0.36, 0.3])
        add("wpn", "cyl-low", "steel", [0.5, 1.9, -0.5], q=qx(-55), s=[0.05, 2.6, 0.05])
    elif kind == "b":  # oont / bishop
        add("base", "cyl", "stone-dark", [0, 0.13, 0], s=[1.12, 0.26, 1.12])
        add("ring", "cyl", A, [0, 0.05, 0], s=[1.24, 0.1, 1.24])
        add("robe", "cone", C, [0, 1.05, 0], s=[0.8, 1.6, 0.8])
        add("torso", "cyl", A, [0, 1.95, 0], s=[0.36, 0.6, 0.36])
        add("head", "sphere", "skin", [0, 2.5, 0], s=[0.28, 0.28, 0.28])
        add("mitre", "cone", C, [0, 2.95, 0], s=[0.34, 0.85, 0.34])
        add("wpn", "cyl-low", "wood-dark", [0.55, 1.5, -0.1], s=[0.045, 2.4, 0.045])
        add("orb", "sphere", "gold", [0.55, 2.75, -0.1], s=[0.13, 0.13, 0.13])
    elif kind == "q":  # rani
        add("base", "cyl", "stone-dark", [0, 0.13, 0], s=[1.18, 0.26, 1.18])
        add("ring", "cyl", A, [0, 0.05, 0], s=[1.3, 0.1, 1.3])
        add("robe", "cone", C, [0, 1.2, 0], s=[0.9, 1.9, 0.9])
        add("torso", "cyl", A, [0, 2.2, 0], s=[0.38, 0.7, 0.38])
        add("head", "sphere", "skin", [0, 2.85, 0], s=[0.29, 0.29, 0.29])
        add("crown", "cyl", "gold", [0, 3.12, 0], s=[0.33, 0.18, 0.33])
        add("spike", "cone", "gold", [0, 3.36, 0], s=[0.12, 0.34, 0.12])
        add("wpn", "cyl-low", "gold", [0.55, 1.9, -0.1], s=[0.045, 1.7, 0.045])
        add("orb", "sphere", "gold", [0.55, 2.8, -0.1], s=[0.15, 0.15, 0.15])
    elif kind == "k":  # raja
        add("base", "cyl", "stone-dark", [0, 0.13, 0], s=[1.3, 0.26, 1.3])
        add("ring", "cyl", A, [0, 0.05, 0], s=[1.42, 0.1, 1.42])
        add("robe", "cone", C, [0, 1.25, 0], s=[0.95, 2.0, 0.95])
        add("torso", "cyl", A, [0, 2.35, 0], s=[0.42, 0.75, 0.42])
        add("head", "sphere", "skin", [0, 3.0, 0], s=[0.31, 0.31, 0.31])
        add("beard", "cone", "white", [0, 2.7, -0.18], q=qx(180), s=[0.2, 0.5, 0.2])
        add("crown", "cyl", "gold", [0, 3.28, 0], s=[0.36, 0.2, 0.36])
        add("crossv", "box", "gold", [0, 3.56, 0], s=[0.09, 0.4, 0.09])
        add("crossh", "box", "gold", [0, 3.58, 0], s=[0.3, 0.09, 0.09])
        add("guard", "box", "gold", [0.6, 2.12, -0.15], s=[0.3, 0.07, 0.24])
        add("wpn", "box", "steel", [0.6, 1.5, -0.15], s=[0.07, 1.3, 0.16])
    return P

def place_piece(pid, kind, team, ox, oy, oz, k=1.0):
    for sub, geo, mat, t, q, s in build_parts(kind, team):
        lt = [t[0] * k, t[1] * k, t[2] * k]
        ls = [v * k for v in s] if s else None
        if team == "r":
            wt = [ox - lt[0], oy + lt[1], oz - lt[2]]
            wq = qmul(Y180, q) if q else Y180
        else:
            wt = [ox + lt[0], oy + lt[1], oz + lt[2]]
            wq = q
        kw = {"id": f"{pid}-{sub}", "geometry": geo, "material": mat, "translation": wt}
        if wq: kw["rotation"] = wq
        if ls: kw["scale"] = ls
        N(**kw)

back = ["r", "n", "b", "q", "k", "b", "n", "r"]
for f in range(8):
    place_piece(f"pc-b-{back[f]}{'0' if f < 4 else '1' if f > 4 else ''}".replace("q0", "q").replace("k0", "k"),
                back[f], "b", sq_x(f), BASE_Y, sq_z(1))
    place_piece(f"pc-b-p{f}", "p", "b", sq_x(f), BASE_Y, sq_z(2))
    place_piece(f"pc-r-p{f}", "p", "r", sq_x(f), BASE_Y, sq_z(7))
    place_piece(f"pc-r-{back[f]}{'0' if f < 4 else '1' if f > 4 else ''}".replace("q0", "q").replace("k0", "k"),
                back[f], "r", sq_x(f), BASE_Y, sq_z(8))
# Fix: upar wale naam tedhe hain — saaf naam dobara mat banao, JS isi pattern ko padhega:
# pc-b-r0 a1, pc-b-n0 b1, pc-b-b0 c1, pc-b-q d1, pc-b-k e1, pc-b-b1 f1, pc-b-n1 g1, pc-b-r1 h1

# Promotion ke liye spare raniyan (board ke neeche park)
for i in range(2):
    place_piece(f"pc-b-qx{i}", "q", "b", -70 + i * 6, -80, -70)
    place_piece(f"pc-r-qx{i}", "q", "r", 70 - i * 6, -80, -70)

# ---------------- SINHAASAN (thrones) ----------------
def throne(team, tz):
    inner = 1 if tz < 0 else -1  # board ki taraf ka direction
    C = f"cloth-{team}"
    pre = f"throne-{team}"
    N(id=f"{pre}-plat", geometry="box", material="stone-dark", translation=[0, 5.6, tz], scale=[11, 1.2, 6.5])
    N(id=f"{pre}-step", geometry="box", material="stone", translation=[0, 4.6, tz + inner * 4.2], scale=[5, 0.8, 1.8])
    for j, (px, pz) in enumerate([(-4.6, -2.6), (4.6, -2.6), (-4.6, 2.6), (4.6, 2.6)]):
        N(id=f"{pre}-pole{j}", geometry="cyl-low", material="gold", translation=[px, 8.0, tz + pz], scale=[0.14, 3.6, 0.14])
    N(id=f"{pre}-roof", geometry="cone4", material=C, translation=[0, 10.7, tz], rotation=yaw(45), scale=[5.6, 2.3, 4.4])
    N(id=f"{pre}-seat", geometry="box", material="gold", translation=[0, 6.7, tz - inner * 1.2], scale=[2.4, 0.5, 2.0])
    N(id=f"{pre}-back", geometry="box", material=C, translation=[0, 8.0, tz - inner * 2.0], scale=[2.4, 2.8, 0.45])
    N(id=f"{pre}-carpet", geometry="box", material=C, translation=[0, 6.24, tz + inner * 0.8], scale=[3.0, 0.08, 3.6])
    for j, bx in enumerate([-3.4, 3.4]):
        N(id=f"{pre}-banner{j}", geometry="box", material=C, translation=[bx, 3.4, tz + inner * 1.05], scale=[1.6, 2.6, 0.1])
        N(id=f"{pre}-emblem{j}", geometry="cyl-low", material="gold",
          translation=[bx, 3.9, tz + inner * 1.12], rotation=qx(90), scale=[0.45, 0.08, 0.45])
    # Sinhaasan par baitha bada raja (khada figure, scale 1.9)
    place_piece(f"tk-{team}", "k", team, 0, 6.2, tz + (0.6 if tz < 0 else -0.6), k=1.9)

throne("r", -27)
throne("b", 27)

# ---------------- SAJAWAT ----------------
for i, (bx, bz, ry) in enumerate([(-24.5, -8, 90), (-24.5, 8, 90), (24.5, -8, 90), (24.5, 8, 90),
                                  (-24.5, 0, 90), (24.5, 0, 90)]):
    N(id=f"bench-{i}", geometry="box", material="wood", translation=[bx, 1.0, bz], rotation=yaw(ry), scale=[4.2, 0.22, 1.0])
    N(id=f"benchbase-{i}", geometry="box", material="wood-dark", translation=[bx, 0.45, bz], rotation=yaw(ry), scale=[3.6, 0.7, 0.7])
for i, (lx, lz, ry) in enumerate([(-12, -25.8, 0), (14, -25.8, 0), (-16, 25.8, 0), (18, 25.8, 0)]):
    N(id=f"ladder-{i}", geometry="box", material="wood", translation=[lx, 2.6, lz], rotation=qx(-14), scale=[1.1, 5.6, 0.12])
for i, (tx, tz) in enumerate([(-38, 12), (40, -6), (-36, -20)]):
    N(id=f"tent-{i}", geometry="cone4", material="tent", translation=[tx, 1.6, tz], rotation=yaw(45), scale=[3.4, 3.2, 3.4])
    N(id=f"tent-pole-{i}", geometry="cyl-low", material="wood-dark", translation=[tx, 3.6, tz], scale=[0.07, 1.2, 0.07])
for i, (tx, tz) in enumerate([(-36, 26), (38, 30), (-42, -6), (44, 8), (36, -30), (-44, 16), (20, 42), (-18, -42)]):
    N(id=f"tree-{i}-trunk", geometry="cyl-low", material="trunk", translation=[tx, 1.1, tz], scale=[0.32, 2.2, 0.32])
    N(id=f"tree-{i}-top", geometry="sphere", material="leaf", translation=[tx, 3.6, tz], scale=[2.1, 1.9, 2.1])
    N(id=f"tree-{i}-top2", geometry="sphere", material="leaf", translation=[tx + 1.1, 2.8, tz + 0.5], scale=[1.3, 1.2, 1.3])
for i, (cx, cz) in enumerate([(-23.5, -20), (-22.4, -20.5), (23.8, 19), (22.8, 20.2)]):
    N(id=f"crate-{i}", geometry="box-soft", material="wood", translation=[cx, 0.5, cz], rotation=yaw(12 * i), scale=[0.95, 0.95, 0.95])
for i, (bx, bz) in enumerate([(21.5, -21), (-21.5, 21.5)]):
    N(id=f"barrel-{i}", geometry="cyl", material="wood-dark", translation=[bx, 0.6, bz], scale=[0.38, 1.2, 0.38])
for i in range(5):
    N(id=f"path-{i}", geometry="cyl-low", material="stone", translation=[-2 + i * 1.1, 0.04, 33 + i * 2.2],
      scale=[0.7, 0.1, 0.7])

# ---------------- MARKERS (game JS chalata hai) ----------------
for i in range(28):
    N(id=f"mk-{i}", geometry="cyl-low", material="glow-move", translation=[0, -80, 0], scale=[1.35, 0.07, 1.35])
for i in range(6):
    N(id=f"mkc-{i}", geometry="torus", material="glow-cap", translation=[0, -80, 0], rotation=qx(90), scale=[1.55, 1.55, 1.55])
N(id="mk-sel", geometry="torus", material="glow-sel", translation=[0, -80, 0], rotation=qx(90), scale=[1.6, 1.6, 1.6])
N(id="mk-check", geometry="torus", material="glow-cap", translation=[0, -80, 0], rotation=qx(90), scale=[1.75, 1.75, 1.75])

recipe = {
    "format": "67js.scene", "schemaVersion": 1,
    "geometries": geometries,
    "materials": materials,
    "nodes": nodes,
    "camera": {"eye": [36, 27, 46], "target": [0, 1.5, 0], "fov": 40, "near": 0.1, "far": 700},
    "environment": {
        "setup": "daylight",
        "environmentIntensity": 1.0,
        "fogColor": [0.74, 0.82, 0.92],
        "fogDensity": 0.0026,
        "skyTop": [0.3, 0.55, 0.95],
        "skyBottom": [0.78, 0.87, 0.96],
        "wind": {"strength": 0.4, "direction": 30},
    },
    "effects": {
        "exposure": 1.06, "saturation": 1.1, "contrast": 1.03, "temperature": 0.02,
        "vignette": 0.16, "grain": 0.008,
        "ambientOcclusion": 0.5,
        "bloom": {"strength": 0.25, "threshold": 0.9, "radius": 0.5},
    },
}

out_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(out_dir, "scene.json"), "w") as f:
    json.dump(recipe, f)
print("nodes:", len(nodes), "geometries:", len(geometries), "materials:", len(materials))
