# blender -b -P scripts/blender/lanyard-badge.py
# Builds the DevFest badge hardware and writes registry/lanyard-badge/lanyard-badge.gltf (embedded, so shadcn can ship it as text).
# Sizes in metres, measured off the photographed badge (lanyard strap 20 mm as the scale): card 94 x 138 mm, 5.5 mm punched holes.
# Blender is Z-up with the card face toward -Y; the glTF exporter turns that into three's Y-up with the face toward +Z.
import bpy, bmesh, math, os
from mathutils import Vector

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "models", "lanyard-badge.gltf")
W, H, T, R = 0.094, 0.138, 0.0006, 0.003
HOLE_D, HOLE_X, HOLE_Z = 0.0055, W / 2 - 0.016, H / 2 - 0.008
# (x, z, diameter): the two clasp holes, plus the two stray punches the real badge has (through the left brace, in the skyline)
HOLES = ((-HOLE_X, HOLE_Z, HOLE_D), (HOLE_X, HOLE_Z, HOLE_D), (-0.0341, 0.0429, HOLE_D), (-0.0335, -0.0408, HOLE_D))

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def mat(name, color, metallic=0.0, rough=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Roughness"].default_value = rough
    return m


M_FRONT, M_BACK, M_EDGE = mat("front", (1, 1, 1)), mat("back", (1, 1, 1)), mat("edge", (0.93, 0.93, 0.9), rough=0.8)
M_GOLD = mat("gold", (0.95, 0.62, 0.24), 1.0, 0.14)  # linear: reads as warm brass gold
M_STRAP = mat("strap", (0.86, 0.84, 0.8), 0.0, 0.85)
M_INK = mat("ink", (0.05, 0.05, 0.08), 0.0, 0.8)


def link(name, bm, mats):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    return ob


# ---- card: rounded rectangle with two punched holes, extruded to its thickness
def card():
    bm = bmesh.new()
    loops = []
    pts = []
    for cx, cz, a0 in ((W / 2 - R, H / 2 - R, 0), (-W / 2 + R, H / 2 - R, 90), (-W / 2 + R, -H / 2 + R, 180), (W / 2 - R, -H / 2 + R, 270)):
        for i in range(9):
            a = math.radians(a0 + i * 90 / 8)
            pts.append((cx + R * math.cos(a), 0, cz + R * math.sin(a)))
    loops.append([bm.verts.new(p) for p in pts])
    for hx, hz, d in HOLES:
        loops.append([bm.verts.new((hx + d / 2 * math.cos(a), 0, hz + d / 2 * math.sin(a)))
                      for a in (i * math.tau / 28 for i in range(28))])
    edges = [bm.edges.new((l[i], l[(i + 1) % len(l)])) for l in loops for i in range(len(l))]
    bmesh.ops.triangle_fill(bm, use_beauty=True, edges=edges, normal=Vector((0, -1, 0)))
    for f in bm.faces:
        if f.normal.y > 0:
            f.normal_flip()
    ext = bmesh.ops.extrude_face_region(bm, geom=list(bm.faces))
    bmesh.ops.translate(bm, verts=[g for g in ext["geom"] if isinstance(g, bmesh.types.BMVert)], vec=(0, T, 0))
    bmesh.ops.translate(bm, verts=list(bm.verts), vec=(0, -T / 2, 0))
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        f.material_index = 0 if f.normal.y < -0.9 else 1 if f.normal.y > 0.9 else 2
        for l in f.loops:
            u, v = (l.vert.co.x + W / 2) / W, (l.vert.co.z + H / 2) / H
            l[uv].uv = (u if f.material_index != 1 else 1 - u, v)
    ob = link("card", bm, [M_FRONT, M_BACK, M_EDGE])
    for sx, n in ((-1, "hole_L"), (1, "hole_R")):
        e = bpy.data.objects.new(n, None)
        e.location = (sx * HOLE_X, 0, HOLE_Z)
        e.parent = ob
        scene.collection.objects.link(e)
    return ob


# ---- wire parts: a poly path swept with a round profile, converted to mesh
def wire(name, pts, radius, material, closed=False, cyclic_res=6, radii=None, order=4):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 2
    cu.use_fill_caps = True
    sp = cu.splines.new("NURBS")
    sp.points.add(len(pts) - 1)
    for i, (p, q) in enumerate(zip(sp.points, pts)):
        p.co = (*q, 1)
        p.radius = radii[i] if radii else 1
    sp.use_cyclic_u = closed
    sp.use_endpoint_u = not closed
    sp.order_u = order
    sp.resolution_u = cyclic_res
    ob = bpy.data.objects.new(name, cu)
    scene.collection.objects.link(ob)
    ob.data.materials.append(material)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target="MESH")
    ob.select_set(False)
    return ob


def join(name, parts):
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    parts[0].name = name
    parts[0].data.name = name
    return parts[0]


def cylinder(name, r, depth, z, material, verts=20):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r, depth=depth)
    bmesh.ops.translate(bm, verts=list(bm.verts), vec=(0, 0, z))
    return link(name, bm, [material])


def plate(name, outline, thick, material):
    """A flat stamped part: a polygon in the XZ plane, extruded thick along Y and centred on Y=0."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, -thick / 2, z)) for x, z in outline]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, verts=[g for g in ext["geom"] if isinstance(g, bmesh.types.BMVert)], vec=(0, thick, 0))
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    ob = link(name, bm, [material])
    m = ob.modifiers.new("bevel", "BEVEL")
    m.width, m.segments = thick * 0.2, 2
    apply_mods(ob)
    return ob


def apply_mods(ob):
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    for m in list(ob.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    ob.select_set(False)


# Swivel trigger snap hook as photographed (a stock lanyard part, traced from r66 at the D-ring's 22 mm as the scale), origin
# where its eye hangs on the D-ring, hanging along -Z, 30 mm long: a small eye at right angles to the D-ring, a wide round
# swivel housing, a flat polished body tapering down from it with a rivet and the trigger tab sticking out left in its top
# third, then an open round-wire J carrying on from the body's right edge. The J comes down in front of the card, its
# bottom (4.8 mm to the side of the eye) passes through the hole and its tip rises behind, so the card is threaded on it.
HOOK_R = 0.0009


def clasp():
    eye = wire("eye", [(0, 0.0019 * math.cos(a), 0.0019 * math.sin(a) - 0.0004) for a in (i * math.tau / 10 for i in range(10))], 0.00065, M_GOLD, closed=True)
    collar = cylinder("collar", 0.0044, 0.0033, -0.0027, M_GOLD, 28)
    lip = cylinder("lip", 0.0046, 0.0008, -0.0012, M_GOLD, 28)
    body = plate("body", [(-0.0033, -0.0043), (0.004, -0.0043), (0.0048, -0.0092), (0.0057, -0.0141), (0.0047, -0.0148), (0.0018, -0.019), (-0.0015, -0.019), (-0.0026, -0.013), (-0.0028, -0.008)], 0.0016, M_GOLD)
    rings = []
    for side in (-1, 1):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.0011, minor_radius=0.00045, major_segments=24, minor_segments=8,
                                         location=(0.0007, side * 0.0008, -0.0109), rotation=(math.radians(90), 0, 0))
        ring = bpy.context.active_object
        ring.data.materials.append(M_GOLD)
        ring.select_set(False)
        rings.append(ring)
    pin = cylinder("pin", 0.0007, 0.0019, 0, M_INK, 16)
    pin.rotation_euler = (math.radians(90), 0, 0)
    pin.location = (0.0007, 0, -0.0109)
    apply_rot(pin)
    tab = plate("tab", [(-0.0026, -0.0113), (-0.0066, -0.0117), (-0.0067, -0.0127), (-0.0025, -0.013)], 0.0012, M_GOLD)
    # the J's centreline traced from clasp_real3 at the D-ring's scale (mm: x across, depth in front of / behind the card, z
    # down): it carries on from the body's right edge, sweeps down and round a 3.8 mm bowl in front of the card, crosses
    # the card's plane at its bottom (inside the hole) and its tip rises behind
    J = [(4.3, 0, -10.0), (5.0, 0, -12.6), (6.0, 0, -15.6), (6.8, -0.2, -18.7), (7.6, -1.0, -20.6), (8.4, -2.2, -22.5), (8.7, -2.8, -24.3), (8.6, -3.0, -26.2),
         (7.9, -2.8, -27.6), (6.6, -2.0, -28.6), (4.8, 0, -29.2), (2.9, 1.8, -28.6), (1.5, 2.4, -27.3)]
    hook = wire("hook", [(x / 1000, y / 1000, z / 1000) for x, y, z in J], HOOK_R, M_GOLD, radii=[1.5, 1.5, 1.25, 1.1] + [1] * 9)
    low = min(hook.data.vertices, key=lambda v: v.co.z).co.copy()
    ob = join("clasp", [eye, collar, lip, body, *rings, pin, tab, hook])
    e = bpy.data.objects.new("clasp_hook", None)
    # the hole's centre when its top edge rests on the J's bottom
    e.location = (low.x, 0, low.z + 2 * HOOK_R - HOLE_D / 2)
    e.parent = ob
    scene.collection.objects.link(e)
    return ob


def apply_rot(ob):
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    ob.select_set(False)


# D-ring, origin at the centre of its straight bar (hidden in the strap loop); round wire, 22 mm wide, 17 mm deep.
DR_W, DR_H = 0.011, 0.017


def dring():
    pts = [(-DR_W * 0.6, 0, 0), (0, 0, 0), (DR_W * 0.6, 0, 0), (DR_W, 0, -0.0005), (DR_W * 1.04, 0, -DR_H * 0.35), (DR_W * 0.8, 0, -DR_H * 0.78),
           (0, 0, -DR_H * 1.02), (-DR_W * 0.8, 0, -DR_H * 0.78), (-DR_W * 1.04, 0, -DR_H * 0.35), (-DR_W, 0, -0.0005)]
    ob = wire("dring", pts, 0.0009, M_GOLD, closed=True)
    e = bpy.data.objects.new("dring_bottom", None)
    e.location = (0, 0, -DR_H)
    e.parent = ob
    scene.collection.objects.link(e)
    return ob


# Strap end, origin on the D-ring's bar: the white strap rolled round the bar (a soft tube with a stitch line) and above
# it the brass crimp sleeve (the same plating as the D-ring and clasp), a flattened tube about as tall as it is wide (21 x 19 mm)
# whose wrapped edges meet in a ragged, torn seam down the front with the strap showing through.
def cap():
    sleeve = cylinder("sleeve", 1, 1, 0, M_GOLD, 32)
    sleeve.scale = (0.0104, 0.0034, 0.019)
    sleeve.location = (0, 0, 0.0034 + 0.0095)
    apply_rot(sleeve)
    m = sleeve.modifiers.new("bevel", "BEVEL")
    m.width, m.segments, m.limit_method = 0.0008, 3, "ANGLE"
    apply_mods(sleeve)
    # the seam: a ragged gap down the front where the strap shows through, between two torn brass lips
    rows = [(0.0036 + i * 0.0186 / 13, 0.0004 * math.sin(i * 1.3), 0.0003 + 0.0008 * abs(math.sin(i * 2.3 + 0.4)) + (0.0005 if i % 2 else 0),
             0.0003 + 0.0008 * abs(math.sin(i * 1.7 + 1.1)) + (0 if i % 2 else 0.0005)) for i in range(14)]
    def strip(name, left, right, thick, y, material):
        ob = plate(name, [(left(r), r[0]) for r in rows] + [(right(r), r[0]) for r in reversed(rows)], thick, material)
        ob.location.y = y
        apply_rot(ob)
        return ob
    gap = strip("gap", lambda r: r[1] - r[2], lambda r: r[1] + r[3], 0.0002, -0.00335, M_STRAP)
    lip_l = strip("lip_l", lambda r: r[1] - r[2] - 0.0006, lambda r: r[1] - r[2], 0.0005, -0.0035, M_GOLD)
    lip_r = strip("lip_r", lambda r: r[1] + r[3], lambda r: r[1] + r[3] + 0.0006, 0.0005, -0.0035, M_GOLD)
    loop = cylinder("loop", 0.0026, 0.0205, 0, M_STRAP, 20)
    loop.rotation_euler = (0, math.radians(90), 0)
    loop.location = (0, 0, 0.0009)
    apply_rot(loop)
    stitch = wire("stitch", [(0, -0.0027 * math.cos(a), 0.0009 + 0.0027 * math.sin(a)) for a in (i * math.tau / 10 for i in range(10))], 0.00018, M_INK, closed=True)
    return join("cap", [sleeve, gap, lip_l, lip_r, loop, stitch])


card(), clasp(), dring(), cap()
for o in scene.objects:
    if o.type == "MESH":
        for p in o.data.polygons:
            p.use_smooth = o.name != "card"
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLTF_SEPARATE", export_yup=True, export_apply=True, export_materials="EXPORT")
# Blender 5 dropped embedded export: fold the .bin into the .gltf as a data URI so the model is one text file
import json, base64
g = json.load(open(OUT))
for b in g["buffers"]:
    bin_path = os.path.join(os.path.dirname(OUT), b["uri"])
    b["uri"] = "data:application/octet-stream;base64," + base64.b64encode(open(bin_path, "rb").read()).decode()
    os.remove(bin_path)
json.dump(g, open(OUT, "w"), separators=(",", ":"))
print("wrote", OUT)
