extends Node3D
## Readable symbolic service action beside the chassis. No ammunition geometry,
## tube interaction, or real-world loading procedure is represented.
const MODEL_PATHS = {
    "carrier": "res://assets/crew_carrier.glb",
    "helper": "res://assets/crew_helper.glb",
    "signal": "res://assets/crew_signal.glb",
    "crate": "res://assets/service_crate.glb",
}
var _actors: Dictionary = {}
var _joints: Dictionary = {}
var _rest: Dictionary = {}
var _crate: Node3D
var _service = Vector3.ZERO
var _progress = 0.0
var _cycle_id = -1
var _configured = false
const RELOAD_SECONDS = 3.0
var _active = false
var _age = 0.0
var _last_stage_id = -1

func configure(bounds: AABB, supplied_models: Dictionary = {}) -> bool:
    clear()
    for child in get_children():
        remove_child(child)
        child.queue_free()
    _actors.clear()
    _joints.clear()
    _rest.clear()
    _crate = null
    _configured = false
    # The caller passes the bounds after the existing chassis orientation fix.
    # Root follows chassis translation/scale, never the yawing launch rack.
    _service = Vector3(bounds.end.x + 0.70, 0.0, bounds.get_center().z)
    for role in ["carrier", "helper", "signal", "crate"]:
        var scene: PackedScene = supplied_models.get(role)
        if scene == null and ResourceLoader.exists(MODEL_PATHS[role]):
            scene = load(MODEL_PATHS[role]) as PackedScene
        if scene == null:
            push_warning("Reload crew model missing: " + str(MODEL_PATHS[role]))
            return false
        var instance = scene.instantiate() as Node3D
        add_child(instance)
        if role == "crate":
            _crate = instance
        else:
            _actors[role] = instance
            var pivots: Dictionary = {}
            for limb in ["hips", "torso", "head", "left_arm", "right_arm", "left_forearm", "right_forearm", "left_leg", "right_leg", "left_shin", "right_shin"]:
                var pivot = instance.find_child("crew_" + role + "_" + limb, true, false) as Node3D
                if pivot:
                    pivots[limb] = pivot
                    _rest[pivot.get_instance_id()] = pivot.transform
            _joints[role] = pivots
    _configured = true
    visible = false
    return true

func begin_stage_reload(stage_id: int, reduced_motion: bool = false) -> bool:
    # One optional presentation beat per completed stage. Never blocks firing.
    if not _configured or stage_id < 0 or stage_id == _last_stage_id: return false
    _last_stage_id = stage_id
    _cycle_id = stage_id
    _active = true
    _age = 0.0
    _progress = 0.0
    visible = true
    _pose(0.0, reduced_motion)
    return true

func advance(delta: float, suspended: bool = false, reduced_motion: bool = false) -> void:
    if not _active or suspended or delta <= 0.0 or not is_finite(delta): return
    _age = minf(RELOAD_SECONDS, _age + minf(delta, 0.1))
    _progress = clampf(_age / RELOAD_SECONDS, 0.0, 1.0)
    _pose(_progress, reduced_motion)
    if _age + 0.000001 >= RELOAD_SECONDS:
        _active = false
        visible = false

func clear(reset_history: bool = false) -> void:
    visible = false
    _active = false
    _age = 0.0
    _progress = 0.0
    _cycle_id = -1
    if reset_history: _last_stage_id = -1

func state() -> Dictionary:
    return {"active": _active and _configured, "progress": _progress, "stage_id": _cycle_id, "configured": _configured}

func _pose(p: float, reduced_motion: bool) -> void:
    _restore_joints()
    # 0–30% approach; 30–73% place ordinary service crate + friendly check;
    # 73–100% return. Every pose derives only from stage-clear progress.
    var approach = smoothstep(0.0, 0.30, p)
    var retreat = smoothstep(0.73, 1.0, p)
    var travel = approach * (1.0 - retreat)
    var working = smoothstep(0.30, 0.40, p) * (1.0 - smoothstep(0.63, 0.73, p))
    var gait_weight = (1.0 - smoothstep(0.25, 0.32, p)) if p < 0.5 else smoothstep(0.72, 0.78, p)
    var gait = sin(p * TAU * 3.5) * 0.42 * gait_weight
    if reduced_motion: gait = 0.0
    var carrier: Node3D = _actors.carrier
    var helper: Node3D = _actors.helper
    var signaler: Node3D = _actors.signal
    carrier.position = _service + Vector3(0.0, 0.0, lerpf(2.4, 0.35, travel))
    helper.position = _service + Vector3(0.32, 0.0, lerpf(-2.0, -1.1, travel))
    signaler.position = _service + Vector3(1.18, 0.0, 0.48)
    carrier.rotation.y = lerp_angle(PI if p > 0.73 else 0.0, PI / 2.0, working)
    helper.rotation.y = lerp_angle(0.0 if p > 0.73 else PI, PI / 2.0, working)
    signaler.rotation.y = PI / 2.0
    _joint("carrier", "left_leg", Vector3(gait, 0.0, 0.0))
    _joint("carrier", "right_leg", Vector3(-gait, 0.0, 0.0))
    _joint("carrier", "left_shin", Vector3(maxf(0.0, -gait) * 0.55, 0.0, 0.0))
    _joint("carrier", "right_shin", Vector3(maxf(0.0, gait) * 0.55, 0.0, 0.0))
    _joint("helper", "left_leg", Vector3(-gait * 0.8, 0.0, 0.0))
    _joint("helper", "right_leg", Vector3(gait * 0.8, 0.0, 0.0))
    _joint("helper", "left_arm", Vector3(gait * 0.5 + working * 0.45, 0.0, 0.0))
    _joint("helper", "right_arm", Vector3(-gait * 0.5 + working * 0.65, 0.0, 0.0))
    # Bent elbows hold a sealed generic crate. At center it briefly rests beside
    # the truck; no object enters or touches the launch tubes.
    _joint("carrier", "left_arm", Vector3(0.12 + working * 0.35, 0.0, -0.12))
    _joint("carrier", "right_arm", Vector3(0.12 + working * 0.35, 0.0, 0.12))
    _joint("carrier", "left_forearm", Vector3(1.40 - working * 0.75, 0.0, 0.0))
    _joint("carrier", "right_forearm", Vector3(1.40 - working * 0.75, 0.0, 0.0))
    _joint("carrier", "torso", Vector3(-working * 0.18, 0.0, 0.0))
    var gesture = sin(smoothstep(0.28, 0.78, p) * PI)
    _joint("signal", "right_arm", Vector3(gesture * 1.1, 0.0, -gesture * 0.25))
    _joint("signal", "right_forearm", Vector3(gesture * 0.65, 0.0, 0.0))
    _joint("helper", "head", Vector3(-working * 0.14, 0.0, 0.0))
    var carried = carrier.position + carrier.basis * Vector3(0.0, 0.69, -0.43)
    var resting = _service + Vector3(-0.18, 0.0, 0.38)
    _crate.position = carried.lerp(resting, working)
    _crate.rotation.y = carrier.rotation.y

func _restore_joints() -> void:
    for role in _joints:
        for pivot in _joints[role].values():
            if is_instance_valid(pivot): pivot.transform = _rest[pivot.get_instance_id()]

func _joint(role: String, limb: String, angle: Vector3) -> void:
    var pivot: Node3D = _joints.get(role, {}).get(limb)
    if pivot: pivot.basis = pivot.basis * Basis.from_euler(angle)
