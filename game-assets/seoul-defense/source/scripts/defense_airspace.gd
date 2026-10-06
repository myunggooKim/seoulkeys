extends RefCounted
# A conservative height field from the actual imported world geometry. Each
# touched grid cell stores the highest vertex of every triangle crossing it.
# This deliberately overestimates the surface: neither a thin ridge nor the
# rocket's nose can slip through between route samples.
const CELL := 3.0
const ENEMY_RADIUS := 1.8
const ENEMY_VERTICAL_CLEARANCE := 5.5
const INTERCEPTOR_RADIUS := 1.2
const CLEARANCE := 2.0
const Motion = preload("res://scripts/defense_motion.gd")
var heights: Dictionary = {}
var source_meshes: Array[String] = []
var triangle_count := 0

func configure(context: Node3D, landmark: Node3D) -> void:
    heights.clear(); source_meshes.clear(); triangle_count = 0
    _collect(context, false)
    _collect(landmark, true)

func _collect(node: Node, all_landmark: bool) -> void:
    if node.name == "BatchedRender": return
    var key := str(node.name).to_lower()
    var terrain := key.contains("mountain") or key.contains("northern range") or key.contains("bugaksan")
    if node is MeshInstance3D and node.mesh and (all_landmark or terrain):
        source_meshes.append(str(node.name))
        var faces: PackedVector3Array = node.mesh.get_faces()
        var transform: Transform3D = node.global_transform
        for index in range(0, faces.size(), 3):
            var a := transform * faces[index]
            var b := transform * faces[index + 1]
            var c := transform * faces[index + 2]
            var low := a.min(b).min(c)
            var high := a.max(b).max(c)
            for x in range(floori(low.x / CELL), floori(high.x / CELL) + 1):
                for z in range(floori(low.z / CELL), floori(high.z / CELL) + 1):
                    var cell := Vector2i(x, z)
                    heights[cell] = maxf(float(heights.get(cell, -1000.0)), high.y)
            triangle_count += 1
    for child in node.get_children(): _collect(child, all_landmark)

func surface_height(point: Vector3, radius: float = 0.0) -> float:
    var height := -1000.0
    for x in range(floori((point.x - radius) / CELL), floori((point.x + radius) / CELL) + 1):
        for z in range(floori((point.z - radius) / CELL), floori((point.z + radius) / CELL) + 1):
            height = maxf(height, float(heights.get(Vector2i(x, z), -1000.0)))
    return height

func incoming_start(start: Vector3, target: Vector3) -> Vector3:
    # Real altitude remains authoritative after the screen-space spawn choice.
    start.y = maxf(start.y, target.y + 58.0)
    var samples := maxi(128, ceili(Vector2(start.x, start.z).distance_to(Vector2(target.x, target.z)) * 1.5))
    for index in range(samples):
        var t := float(index) / float(samples)
        var vertical := Motion.descent_progress(t)
        var point := Motion.incoming_position(start, target, t)
        var required := surface_height(point, ENEMY_RADIUS) + CLEARANCE + ENEMY_VERTICAL_CLEARANCE
        if required <= point.y: continue
        start.y = maxf(start.y, (required - target.y * vertical) / maxf(0.001, 1.0 - vertical))
    return start

func clear_incoming(start: Vector3, target: Vector3) -> bool:
    var samples := maxi(96, ceili(start.distance_to(target) * 1.5))
    for index in range(samples + 1):
        var point := Motion.incoming_position(start, target, float(index) / samples)
        if point.y < surface_height(point, ENEMY_RADIUS) + CLEARANCE + ENEMY_VERTICAL_CLEARANCE:
            return false
    return true

func interceptor_controls(origin: Vector3, direction: Vector3, target: Vector3) -> Dictionary:
    # Keep the real tube departure tangent. A smooth loft has zero derivative at
    # each end, unlike abruptly clamping a rocket above the nearest mountain.
    return {"c1": origin + direction * 12.0, "c2": target + Vector3(0, 14, 3)}

func interceptor_loft(origin: Vector3, direction: Vector3, target: Vector3, previous: float = 0.0) -> float:
    var control := interceptor_controls(origin, direction, target)
    var lift := maxf(previous, 0.0)
    var samples := maxi(96, ceili(origin.distance_to(target)))
    for index in range(1, samples):
        var t := float(index) / float(samples)
        var point := origin.bezier_interpolate(control.c1, control.c2, target, t)
        var required := surface_height(point, INTERCEPTOR_RADIUS) + CLEARANCE + INTERCEPTOR_RADIUS
        var weight := loft_weight(t)
        if required > point.y and weight > 0.00001:
            lift = maxf(lift, (required - point.y) / weight)
    return lift

static func loft_weight(t: float) -> float:
    return 16.0 * t * t * (1.0 - t) * (1.0 - t)

func interceptor_position(origin: Vector3, direction: Vector3, target: Vector3, t: float, lift: float) -> Vector3:
    var control := interceptor_controls(origin, direction, target)
    var point := origin.bezier_interpolate(control.c1, control.c2, target, t)
    point.y += loft_weight(t) * lift
    return point
