extends Node3D
## Presentation only. Add beside the launcher under the world root, configure it
## after launcher setup, begin on stage clear, and clear BEFORE the next wave.
## There are no independent clocks, timers, input handlers or physics objects.
const CROWD_CAP := 12
const APPROACH_SECONDS := 1.15
const MODEL_NAMES := ["citizen_teal", "citizen_coral", "citizen_gold"]
const JOINT_NAMES := ["hips", "torso", "head", "left_arm", "right_arm", "left_forearm", "right_forearm", "left_hand", "right_hand", "left_leg", "right_leg", "left_shin", "right_shin", "left_foot", "right_foot"]
var _launcher: Node3D
var _actors: Array[Dictionary] = []
var _bounds := AABB(Vector3(-3, 0, -3), Vector3(6, 4, 6))
var _configured := false
var _active := false
var _age := 0.0
var _stage_id := -1
var _last_stage_id := -1

func configure(launcher: Node3D) -> bool:
    clear(true)
    for child in get_children():
        remove_child(child)
        child.queue_free()
    _actors.clear()
    _configured = false
    _launcher = launcher
    if not is_instance_valid(_launcher): return false
    var boxes: Array[AABB] = []
    _collect_bounds(_launcher, boxes)
    if not boxes.is_empty():
        _bounds = boxes[0]
        for box in boxes: _bounds = _bounds.merge(box)
    var scenes: Array[PackedScene] = []
    for model_name in MODEL_NAMES:
        var path := "res://assets/" + str(model_name) + ".glb"
        if not ResourceLoader.exists(path):
            push_warning("Citizen celebration asset missing: " + path)
            return false
        var scene := load(path) as PackedScene
        if scene == null: return false
        scenes.append(scene)
    for index in range(CROWD_CAP):
        var actor := scenes[index % scenes.size()].instantiate() as Node3D
        if actor == null:
            _discard_actors()
            return false
        add_child(actor)
        actor.visible = false
        _disable_shadows(actor)
        var joints: Dictionary = {}
        var rest: Dictionary = {}
        for suffix in JOINT_NAMES:
            var joint := actor.find_child(str(MODEL_NAMES[index % 3]) + "_" + str(suffix), true, false) as Node3D
            if joint == null:
                _discard_actors()
                return false
            joints[suffix] = joint
            rest[suffix] = joint.transform
        _actors.append({"node": actor, "joints": joints, "rest": rest, "phase": float(index) * 1.73})
    _configured = true
    return true

func begin_stage(stage_id: int) -> bool:
    if not _configured or not is_instance_valid(_launcher) or stage_id < 0 or stage_id == _last_stage_id: return false
    clear()
    _last_stage_id = stage_id
    _stage_id = stage_id
    _age = 0.0
    _active = true
    # No actor is exposed until the first authorized simulation advance. An
    # immediate Continue can therefore skip the presentation without a flash.
    visible = true
    return true

func advance(delta: float, suspended: bool = false, reduced_motion: bool = false) -> void:
    if not _active or suspended or delta <= 0.0 or not is_finite(delta): return
    if not is_instance_valid(_launcher):
        clear()
        return
    var camera := get_viewport().get_camera_3d()
    if camera == null: return
    _age += minf(delta, 0.1)
    var viewport := get_viewport().get_visible_rect().size
    var truck := _projected_bounds(camera)
    var ground_y := _launcher.global_position.y + 0.015
    # The east side is a live road in Gwanghwamun and the bridge in Namsan.
    # Keep civilians on the west pedestrian approach, in TWO shallow rows:
    # deeper rows previously reached the river, and symmetric lanes hit traffic.
    # The service crew retains the entire right-hand side of the chassis.
    var left_edge := 16.0
    var lane_right := truck.position.x - 20.0
    var lane_width := lane_right - left_edge
    var person_pixels := minf(clampf(truck.size.y * 0.20, 12.0, 26.0), lane_width / 7.6)
    if person_pixels < 8.0:
        for entry in _actors: entry.node.visible = false
        return
    var spacing := person_pixels * 1.25
    var row_spacing := person_pixels * 1.55
    for index in range(_actors.size()):
        var entry: Dictionary = _actors[index]
        var actor: Node3D = entry.node
        var column := index % 6
        var row := index / 6
        # Alternate outfits and a slight row stagger make each adult legible.
        var stagger := spacing * 0.22 if row == 1 else 0.0
        var target_pixel := Vector2(lane_right - float(5 - column) * spacing - stagger, truck.end.y - 6.0 - float(row) * row_spacing)
        var elapsed := maxf(0.0, _age - float(index) * 0.045)
        var progress := clampf(elapsed / APPROACH_SECONDS, 0.0, 1.0)
        if reduced_motion: progress = 1.0
        actor.visible = reduced_motion or elapsed > 0.0
        # Short lateral emergence stays on the same pavement/riverbank band.
        var entrance := target_pixel + Vector2(-person_pixels * 0.65, -person_pixels * 0.10)
        entrance.x = maxf(entrance.x, left_edge + person_pixels * 0.5)
        var pixel := entrance.lerp(target_pixel, smoothstep(0.0, 1.0, progress))
        var foot := _ground_at(camera, pixel, ground_y)
        actor.global_position = foot
        var projected_height := absf(camera.unproject_position(foot + Vector3.UP * 1.835).y - pixel.y)
        var size := clampf(person_pixels / maxf(1.0, projected_height), 0.1, 3.5)
        actor.global_basis = Basis.IDENTITY.scaled(Vector3.ONE * size)
        var facing := camera.global_position - foot
        facing.y = 0.0
        if progress < 1.0:
            facing = _ground_at(camera, target_pixel, ground_y) - foot
            facing.y = 0.0
        if facing.length_squared() > 0.0001:
            actor.global_basis = Basis.looking_at(facing.normalized(), Vector3.UP).scaled(Vector3.ONE * size)
        _pose(entry, progress < 1.0, reduced_motion, index)

func clear(reset_history: bool = false) -> void:
    visible = false
    _active = false
    _age = 0.0
    _stage_id = -1
    for entry in _actors:
        if is_instance_valid(entry.node): entry.node.visible = false
    if reset_history: _last_stage_id = -1

func state() -> Dictionary:
    var shown := 0
    if visible:
        for entry in _actors:
            if is_instance_valid(entry.node) and entry.node.visible: shown += 1
    return {"configured": _configured, "active": _active and _configured, "stage_id": _stage_id, "elapsed": _age, "actor_count": _actors.size(), "visible_count": shown, "cap": CROWD_CAP}

func _pose(entry: Dictionary, running: bool, reduced_motion: bool, index: int) -> void:
    var joints: Dictionary = entry.joints
    for key in joints: joints[key].transform = entry.rest[key]
    var phase := _age * (9.0 if running else 5.5) + float(entry.phase)
    var swing := 0.0 if reduced_motion else sin(phase)
    if running and not reduced_motion:
        joints.left_leg.rotation.x = 0.62 * swing
        joints.right_leg.rotation.x = -0.62 * swing
        joints.left_shin.rotation.x = -0.55 * maxf(0.0, -swing)
        joints.right_shin.rotation.x = -0.55 * maxf(0.0, swing)
        joints.left_arm.rotation.x = -0.5 * swing
        joints.right_arm.rotation.x = 0.5 * swing
        joints.left_forearm.rotation.x = 1.0
        joints.right_forearm.rotation.x = 1.0
        joints.torso.rotation.x = -0.12
        joints.hips.position.y += 0.045 * absf(sin(phase * 2.0))
    elif index % 3 == 0:
        joints.right_arm.rotation = Vector3(0.18, 0.0, 2.45)
        joints.right_forearm.rotation.z = 0.36 - 0.28 * swing
        joints.right_hand.rotation.z = -0.3 * swing
        joints.left_arm.rotation.z = -0.17
        joints.head.rotation.y = 0.1 * swing
    else:
        joints.left_arm.rotation.z = -2.55
        joints.right_arm.rotation.z = 2.55
        joints.left_forearm.rotation.z = -0.3
        joints.right_forearm.rotation.z = 0.3
        joints.left_leg.rotation.z = -0.1
        joints.right_leg.rotation.z = 0.1
        joints.torso.rotation.y = 0.07 * swing
        if not reduced_motion: joints.hips.position.y += 0.035 * (0.5 + 0.5 * sin(phase * 2.0))

func _collect_bounds(node: Node, boxes: Array[AABB]) -> void:
    if node == self or node.name == "SymbolicStageClearCrew": return
    if node is MeshInstance3D and node.mesh != null:
        boxes.append(_launcher.global_transform.affine_inverse() * node.global_transform * node.mesh.get_aabb())
    for child in node.get_children(): _collect_bounds(child, boxes)

func _projected_bounds(camera: Camera3D) -> Rect2:
    var result := Rect2(camera.unproject_position(_launcher.to_global(_bounds.position)), Vector2.ZERO)
    for x in [_bounds.position.x, _bounds.end.x]:
        for y in [_bounds.position.y, _bounds.end.y]:
            for z in [_bounds.position.z, _bounds.end.z]:
                result = result.expand(camera.unproject_position(_launcher.to_global(Vector3(x, y, z))))
    return result

func _ground_at(camera: Camera3D, pixel: Vector2, level: float) -> Vector3:
    var origin := camera.project_ray_origin(pixel)
    var direction := camera.project_ray_normal(pixel)
    if absf(direction.y) < 0.0001: return _launcher.global_position
    return origin + direction * ((level - origin.y) / direction.y)

func _disable_shadows(node: Node) -> void:
    if node is GeometryInstance3D: node.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
    for child in node.get_children(): _disable_shadows(child)

func _discard_actors() -> void:
    for child in get_children():
        remove_child(child)
        child.queue_free()
    _actors.clear()
    _configured = false
    clear()
