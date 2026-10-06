class_name DefenseLaunchFX
extends Node3D

# Fictional game choreography. All geometry and materials are allocated once.
const MAX_PUFFS = 128
const MAX_ROCKETS = 4
const MAX_FLAMES = MAX_ROCKETS * 6 + 3 # Dedicated, fixed prelaunch layers.
const ROCKET_LIFETIME = 1.6
const TUBE_FLAME_LIFETIME = 0.72
const TUBE_SMOKE_LIFETIME = 0.58
const TUBE_SMOKE_INTERVAL = 0.065
const SMOKE_INTERVAL = 0.095
const REDUCED_SMOKE_INTERVAL = 0.36
const SMOKE_SHADER = """
shader_type spatial;
render_mode unshaded, blend_mix, cull_back, depth_draw_never;
varying vec4 puff;
varying vec2 cloud;
void vertex() { puff = INSTANCE_CUSTOM; cloud = UV2; }
void fragment() {
    float facing = max(0.0, dot(normalize(NORMAL), normalize(VIEW)));
    float edge = pow(facing, 0.86);
    float shade = clamp(NORMAL.y * 0.24 + 0.57 + cloud.r * 0.17, 0.0, 1.0);
    vec3 smoke = mix(vec3(0.22, 0.25, 0.29), vec3(0.66, 0.68, 0.68), shade);
    vec3 dust = mix(vec3(0.32, 0.29, 0.25), vec3(0.67, 0.61, 0.49), shade);
    ALBEDO = mix(mix(smoke, dust, puff.b), vec3(0.95, 0.49, 0.15), puff.g * 0.27);
    EMISSION = vec3(0.18, 0.045, 0.003) * puff.g;
    ALPHA = puff.r * edge * (0.75 + cloud.g * 0.25);
}
"""
const FLAME_SHADER = """
shader_type spatial;
render_mode unshaded, blend_add, cull_back, depth_draw_never;
varying vec4 flame;
varying vec2 jet;
void vertex() { flame = INSTANCE_CUSTOM; jet = UV2; }
void fragment() {
    float facing = max(0.0, dot(normalize(NORMAL), normalize(VIEW)));
    float edge = pow(facing, 0.62);
    // UV2 is baked into the mesh. COLOR is unreliable on this compatibility
    // MultiMesh path. No TIME means pause freezes the complete effect.
    float heat = clamp(flame.g * 0.63 + (1.0 - jet.r) * 0.29 + jet.g * 0.18, 0.0, 1.0);
    vec3 orange = vec3(1.0, 0.18, 0.012);
    vec3 gold = vec3(1.0, 0.62, 0.10);
    vec3 hot = vec3(1.0, 0.93, 0.64);
    vec3 color = mix(orange, gold, smoothstep(0.18, 0.66, heat));
    color = mix(color, hot, smoothstep(0.62, 0.98, heat));
    ALBEDO = color;
    EMISSION = color * 0.42;
    ALPHA = flame.r * edge * (0.76 + jet.g * 0.24) * (1.0 - smoothstep(0.78, 1.0, jet.r));
}
"""

var smoke_batch: MultiMeshInstance3D
var flame_batch: MultiMeshInstance3D
var reduced_motion = false
var paused = false
var _puffs: Array[Dictionary] = []
var _rockets: Array[Dictionary] = []
var _smoke_transforms: Array[Transform3D] = []
var _flame_transforms: Array[Transform3D] = []
var _flame_opacities: Array[float] = []
var _clock = 0.0
var _next_id = 1
var _puff_cursor = 0
var _serial = 0
var _initialized = false
var _prelaunch_born = 0.0
var _prelaunch_next_emit = 0.0
var _prelaunch_active = false
var _prelaunch_rear = Vector3.ZERO
var _prelaunch_forward = Vector3.FORWARD

func _ready() -> void:
    _initialize_pool()

func _initialize_pool() -> void:
    if _initialized: return
    _initialized = true
    smoke_batch = _make_batch("LaunchSmoke", _smoke_mesh(), SMOKE_SHADER, MAX_PUFFS)
    flame_batch = _make_batch("LaunchFlames", _jet_mesh(), FLAME_SHADER, MAX_FLAMES)
    for _i in range(MAX_PUFFS):
        _smoke_transforms.append(Transform3D.IDENTITY)
        _puffs.append({"active": false, "born": 0.0, "life": 1.0,
            "origin": Vector3.ZERO, "velocity": Vector3.ZERO, "axis": Vector3.FORWARD,
            "radius": 0.1, "growth": 0.0, "seed": 0.0, "warmth": 0.0,
            "dust": 0.0, "opacity": 0.0, "still": false, "prelaunch": false})
    for _i in range(MAX_ROCKETS):
        _rockets.append({"active": false, "id": -1, "born": 0.0,
            "tail": Vector3.ZERO, "previous_tail": Vector3.ZERO,
            "forward": Vector3.FORWARD, "tube_rear": Vector3.ZERO,
            "previous_tube_rear": Vector3.ZERO, "tube_forward": Vector3.FORWARD,
            "previous_tube_forward": Vector3.FORWARD,
            "next_emit": 0.0, "next_tube_emit": 0.0, "rocket_alive": false})
    for _i in range(MAX_FLAMES):
        _flame_transforms.append(Transform3D.IDENTITY)
        _flame_opacities.append(0.0)
    _render()

func _smoke_mesh() -> ArrayMesh:
    var source = SphereMesh.new()
    source.radius = 1.0
    source.height = 2.0
    source.radial_segments = 12
    source.rings = 7
    var arrays: Array = source.surface_get_arrays(0)
    var vertices: PackedVector3Array = arrays[Mesh.ARRAY_VERTEX]
    var baked = PackedVector2Array()
    baked.resize(vertices.size())
    for i in range(vertices.size()):
        var point = vertices[i].normalized()
        var broad = sin(point.x * 5.1 + point.y * 2.7) * cos(point.z * 5.8 - point.y * 3.8)
        var fine = sin(point.y * 8.4 + point.z * 5.7 + point.x * 2.5)
        vertices[i] *= 0.95 + broad * 0.17 + fine * 0.07
        baked[i] = Vector2(clampf(0.5 + broad * 0.4, 0.0, 1.0), clampf(0.5 + fine * 0.42, 0.0, 1.0))
    arrays[Mesh.ARRAY_VERTEX] = vertices
    arrays[Mesh.ARRAY_TEX_UV2] = baked
    var result = ArrayMesh.new()
    result.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
    return result

func _jet_mesh() -> ArrayMesh:
    # Reuse a closed sphere's valid winding, then reshape it into a long,
    # root-anchored taper along local -Z. It is never rendered as a sphere.
    var source = SphereMesh.new()
    source.radius = 1.0
    source.height = 2.0
    source.radial_segments = 12
    source.rings = 12
    var arrays: Array = source.surface_get_arrays(0)
    var vertices: PackedVector3Array = arrays[Mesh.ARRAY_VERTEX]
    var normals: PackedVector3Array = arrays[Mesh.ARRAY_NORMAL]
    var baked = PackedVector2Array()
    baked.resize(vertices.size())
    for i in range(vertices.size()):
        var point = vertices[i]
        var axial = clampf((point.y + 1.0) * 0.5, 0.0, 1.0)
        var angle = atan2(point.z, point.x)
        var radius = _jet_radius(axial)
        var ripple = 1.0 + sin(angle * 3.0 + axial * 13.0) * 0.075
        if axial < 0.0001 or axial > 0.9999: radius = 0.0
        vertices[i] = Vector3(cos(angle) * radius * ripple, sin(angle) * radius * ripple, -axial)
        var slope = (_jet_radius(minf(1.0, axial + 0.01)) - _jet_radius(maxf(0.0, axial - 0.01))) / 0.02
        normals[i] = Vector3(cos(angle), sin(angle), slope).normalized()
        if axial < 0.0001: normals[i] = Vector3.BACK
        elif axial > 0.9999: normals[i] = Vector3.FORWARD
        baked[i] = Vector2(axial, clampf(0.5 + sin(axial * 25.0 + angle * 2.0) * 0.29 + cos(angle * 5.0 + axial * 8.0) * 0.12, 0.0, 1.0))
    arrays[Mesh.ARRAY_VERTEX] = vertices
    arrays[Mesh.ARRAY_NORMAL] = normals
    # Source tangents no longer describe the reshaped mesh; these untextured
    # materials do not need them.
    arrays[Mesh.ARRAY_TANGENT] = null
    arrays[Mesh.ARRAY_TEX_UV2] = baked
    var result = ArrayMesh.new()
    result.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
    return result

static func _jet_radius(axial: float) -> float:
    if axial < 0.12: return lerpf(0.18, 0.86, axial / 0.12)
    return pow(maxf(0.0, 1.0 - (axial - 0.12) / 0.88), 1.14) * 0.86

func _make_batch(node_name: String, mesh: Mesh, shader_code: String, capacity: int) -> MultiMeshInstance3D:
    var shader = Shader.new()
    shader.code = shader_code
    var material = ShaderMaterial.new()
    material.shader = shader
    var instances = MultiMesh.new()
    instances.transform_format = MultiMesh.TRANSFORM_3D
    instances.use_custom_data = true
    instances.mesh = mesh
    instances.instance_count = capacity
    instances.visible_instance_count = 0
    var display = MultiMeshInstance3D.new()
    display.name = node_name
    display.multimesh = instances
    display.material_override = material
    display.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
    display.gi_mode = GeometryInstance3D.GI_MODE_DISABLED
    add_child(display)
    return display

func begin_prelaunch(rear: Vector3, forward: Vector3) -> bool:
    _initialize_pool()
    if paused or not rear.is_finite() or not forward.is_finite(): return false
    cancel_prelaunch()
    _prelaunch_active = true
    _prelaunch_born = _clock
    _prelaunch_next_emit = _clock + _tube_emission_interval()
    _prelaunch_rear = rear
    _prelaunch_forward = _direction(forward)
    # Ignite at the real rear socket before the projectile exists. The same
    # hot, directional wake continues into the post-launch thrust phase.
    _emit_tube_wake(rear, _prelaunch_forward, _clock, 0.0, true)
    _render()
    return true

func cancel_prelaunch() -> void:
    _prelaunch_active = false
    for puff in _puffs:
        if puff.prelaunch:
            puff.active = false
            puff.prelaunch = false
    if _initialized: _render()

func finish_prelaunch() -> void:
    _prelaunch_active = false
    for puff in _puffs: puff.prelaunch = false
    if _initialized: _render()

func launch(muzzle: Vector3, forward: Vector3, rear: Vector3) -> int:
    _initialize_pool()
    if paused or not muzzle.is_finite() or not rear.is_finite() or not forward.is_finite(): return -1
    finish_prelaunch()
    var direction = _direction(forward)
    var slot = 0
    for i in range(MAX_ROCKETS):
        if not _rockets[i].active:
            slot = i
            break
        if int(_rockets[i].id) < int(_rockets[slot].id): slot = i
    var rocket = _rockets[slot]
    rocket.active = true
    rocket.rocket_alive = true
    rocket.id = _next_id
    _next_id += 1
    rocket.born = _clock
    rocket.tail = muzzle
    rocket.previous_tail = muzzle
    rocket.forward = direction
    rocket.tube_forward = direction
    rocket.previous_tube_forward = direction
    rocket.tube_rear = rear
    rocket.previous_tube_rear = rear
    rocket.next_emit = _clock + _emission_interval()
    rocket.next_tube_emit = _clock + _tube_emission_interval()
    var axis = -direction
    # A narrow initial wake gives immediate direction; repeated emissions below
    # maintain the thrust instead of relying on this one launch event.
    for i in range(2 if reduced_motion else 5):
        _spawn_puff(rear + axis * (0.08 + float(i) * 0.30), axis * (2.9 + float(i) * 0.22),
            _clock, 0.19 + float(i) * 0.045, 0.9, false, 0.24, 0.39)
    _render()
    return int(rocket.id)

func update_rocket_rear(id: int, position_world: Vector3, forward_world: Vector3) -> bool:
    if paused or not position_world.is_finite() or not forward_world.is_finite(): return false
    for rocket in _rockets:
        if rocket.active and rocket.rocket_alive and int(rocket.id) == id:
            rocket.tail = position_world
            rocket.forward = _direction(forward_world)
            return true
    return false

func update_tube_socket(id: int, rear_world: Vector3, forward_world: Vector3) -> bool:
    if paused or not rear_world.is_finite() or not forward_world.is_finite(): return false
    for rocket in _rockets:
        if rocket.active and int(rocket.id) == id:
            rocket.tube_rear = rear_world
            rocket.tube_forward = _direction(forward_world)
            return true
    return false

func release_rocket(id: int) -> void:
    for rocket in _rockets:
        if rocket.active and int(rocket.id) == id:
            rocket.rocket_alive = false
            break
    if _initialized: _render()

func set_paused(enabled: bool) -> void:
    paused = enabled

func set_reduced_motion(enabled: bool) -> void:
    if reduced_motion == enabled: return
    reduced_motion = enabled
    for puff in _puffs: puff.active = false
    for rocket in _rockets:
        rocket.next_emit = _clock + _emission_interval()
        rocket.next_tube_emit = _clock + _tube_emission_interval()
    # Preserve ignition time when this preference changes, including on pause.
    _prelaunch_next_emit = _clock + _tube_emission_interval()
    if _prelaunch_active:
        _emit_tube_wake(_prelaunch_rear, _prelaunch_forward, _clock, 0.0, true)
    if _initialized: _render()

func advance(delta: float) -> void:
    _initialize_pool()
    if paused or delta <= 0.0 or not is_finite(delta): return
    var end = _clock + delta
    if _prelaunch_active:
        # A stalled frame must not replay an unbounded history of smoke that
        # would already have expired. Eight emissions cover its longest life.
        _prelaunch_next_emit = maxf(_prelaunch_next_emit, end - 0.48)
        for _emission in range(8):
            if _prelaunch_next_emit > end + 0.000001: break
            _emit_tube_wake(_prelaunch_rear, _prelaunch_forward, _prelaunch_next_emit, 0.0, true)
            _prelaunch_next_emit += _tube_emission_interval()
    for rocket in _rockets:
        if not rocket.active: continue
        var expiry = float(rocket.born) + ROCKET_LIFETIME
        while rocket.rocket_alive and float(rocket.next_emit) <= minf(end, expiry) + 0.000001:
            var born: float = rocket.next_emit
            var fraction = clampf((born - _clock) / delta, 0.0, 1.0)
            var point: Vector3 = rocket.previous_tail.lerp(rocket.tail, fraction)
            _spawn_puff(point, -rocket.forward * 1.12, born, 0.17, 0.58, false, 0.0, 0.32)
            rocket.next_emit = born + _emission_interval()
        var tube_expiry = float(rocket.born) + TUBE_SMOKE_LIFETIME
        while float(rocket.next_tube_emit) <= minf(end, tube_expiry) + 0.000001:
            var born: float = rocket.next_tube_emit
            var fraction = clampf((born - _clock) / delta, 0.0, 1.0)
            var rear: Vector3 = rocket.previous_tube_rear.lerp(rocket.tube_rear, fraction)
            var forward: Vector3 = _direction(rocket.previous_tube_forward.lerp(rocket.tube_forward, fraction))
            _emit_tube_wake(rear, forward, born, born - float(rocket.born))
            rocket.next_tube_emit = born + _tube_emission_interval()
        rocket.previous_tail = rocket.tail
        rocket.previous_tube_rear = rocket.tube_rear
        rocket.previous_tube_forward = rocket.tube_forward
        if end >= expiry: rocket.rocket_alive = false
        if not rocket.rocket_alive and end - float(rocket.born) >= TUBE_FLAME_LIFETIME:
            rocket.active = false
    _clock = end
    for puff in _puffs:
        if puff.active and _clock - float(puff.born) >= float(puff.life): puff.active = false
    _render()

func _emit_tube_wake(rear: Vector3, forward: Vector3, born: float, age: float, prelaunch_cue: bool = false) -> void:
    var axis = -forward
    var side = _side(axis)
    var spread = sin(float(_serial) * 2.399963) * 0.14
    var strength = 1.0 - clampf((age - 0.36) / 0.40, 0.0, 1.0)
    _spawn_puff(rear + axis * 0.14 + side * spread, axis * 3.9 + side * spread * 1.4,
        born, 0.27, 0.78 * strength, prelaunch_cue, 0.20, 0.41 * strength)
    if not reduced_motion:
        # The cooler, wider edge stays behind the rear opening, never radiating
        # around the whole launcher or obscuring its front/aiming silhouette.
        _spawn_puff(rear + axis * 0.72 - side * spread * 1.6, axis * 3.2 - side * spread * 2.0,
            born, 0.34, 0.25 * strength, prelaunch_cue, 0.72, 0.28 * strength)

func clear() -> void:
    _prelaunch_active = false
    _clock = 0.0
    _puff_cursor = 0
    _serial = 0
    for puff in _puffs:
        puff.active = false
        puff.prelaunch = false
    for rocket in _rockets:
        rocket.active = false
        rocket.rocket_alive = false
    if _initialized: _render()

func _emission_interval() -> float:
    return REDUCED_SMOKE_INTERVAL if reduced_motion else SMOKE_INTERVAL

func _tube_emission_interval() -> float:
    return 0.24 if reduced_motion else TUBE_SMOKE_INTERVAL

static func _direction(value: Vector3) -> Vector3:
    return value.normalized() if value.length_squared() > 0.000001 else Vector3.FORWARD

static func _side(axis: Vector3) -> Vector3:
    var side = axis.cross(Vector3.UP).normalized()
    return Vector3.RIGHT if side.length_squared() < 0.01 else side

func _spawn_puff(origin: Vector3, velocity: Vector3, born: float, radius: float, warmth: float,
        prelaunch_cue: bool = false, dust: float = 0.0, opacity: float = 0.36) -> void:
    var puff = _puffs[_puff_cursor]
    _puff_cursor = (_puff_cursor + 1) % MAX_PUFFS
    var seed = fposmod(float(_serial) * 2.399963, TAU)
    _serial += 1
    puff.active = true
    puff.born = born
    puff.life = 0.48 if reduced_motion else (0.43 if prelaunch_cue else 1.05 + (sin(seed) + 1.0) * 0.12)
    puff.origin = origin
    puff.axis = _direction(velocity)
    var side = _side(puff.axis)
    puff.velocity = Vector3.ZERO if reduced_motion else velocity + side * sin(seed) * 0.16 + Vector3.UP * (0.24 + cos(seed) * 0.09)
    puff.radius = radius * (0.8 if reduced_motion else 1.0)
    puff.growth = 0.08 if reduced_motion else (0.18 if prelaunch_cue else 0.38 + (cos(seed) + 1.0) * 0.09)
    puff.seed = seed
    puff.warmth = warmth
    puff.dust = dust
    puff.opacity = opacity
    puff.still = reduced_motion
    puff.prelaunch = prelaunch_cue

func _render() -> void:
    if not _initialized: return
    var inverse = global_transform.affine_inverse() if is_inside_tree() else transform.affine_inverse()
    var count = 0
    for puff in _puffs:
        if not puff.active: continue
        var age = maxf(0.0, _clock - float(puff.born))
        var fraction = clampf(age / float(puff.life), 0.0, 1.0)
        # Analytic drag and fixed seed keep the wake frame-rate independent.
        var travel = (1.0 - exp(-age * 1.3)) / 1.3
        var point: Vector3 = puff.origin + puff.velocity * travel
        if not puff.still: point += Vector3.UP * (0.14 * age * age)
        var radius = float(puff.radius) + float(puff.growth) * age
        var axis: Vector3 = puff.axis
        var up = Vector3.RIGHT if absf(axis.dot(Vector3.UP)) > 0.98 else Vector3.UP
        var basis = Basis.looking_at(axis, up) * Basis(Vector3.FORWARD, float(puff.seed))
        var stretch = 1.0 if puff.still else lerpf(1.65, 1.08, fraction)
        basis = basis * Basis.from_scale(Vector3(radius, radius * 0.84, radius * stretch))
        _smoke_transforms[count] = inverse * Transform3D(basis, point)
        smoke_batch.multimesh.set_instance_transform(count, _smoke_transforms[count])
        var opacity = float(puff.opacity) * (0.62 if puff.still else 1.0) * pow(1.0 - fraction, 1.15)
        var warmth = float(puff.warmth) * maxf(0.0, 1.0 - age * 3.2)
        smoke_batch.multimesh.set_instance_custom_data(count, Color(opacity, warmth, float(puff.dust), 0.0))
        count += 1
    smoke_batch.multimesh.visible_instance_count = count
    smoke_batch.visible = count > 0
    count = 0
    for rocket in _rockets:
        if not rocket.active: continue
        var age = _clock - float(rocket.born)
        if rocket.rocket_alive:
            var fade = clampf((ROCKET_LIFETIME - age) / 0.14, 0.0, 1.0)
            var breathing = 1.0 if reduced_motion else 1.0 + sin(age * 16.0) * 0.025
            count = _render_flame(count, rocket.tail, -rocket.forward, 2.35 * breathing,
                0.32, fade * 0.82, inverse)
        if age < TUBE_FLAME_LIFETIME:
            # Hold a readable thrust phase, then taper smoothly. Root position
            # never moves with the small length modulation.
            var fade = 1.0 - smoothstep(0.38, TUBE_FLAME_LIFETIME, age)
            var breathing = 1.0 if reduced_motion else 1.0 + sin(age * 18.0) * 0.025
            count = _render_flame(count, rocket.tube_rear, -rocket.tube_forward,
                3.8 * (0.84 + fade * 0.16) * breathing, 0.51, fade, inverse)
    if _prelaunch_active:
        # A short rise reads as ignition, then holds exactly the initial tube
        # dimensions/opacity. launch() hands off without a size or light pop.
        var strength = 0.80 + 0.20 * smoothstep(0.0, 0.055, _clock - _prelaunch_born)
        count = _render_flame(count, _prelaunch_rear, -_prelaunch_forward,
            3.8 * strength, 0.51, strength, inverse)
    flame_batch.multimesh.visible_instance_count = count
    flame_batch.visible = count > 0

func _render_flame(index: int, origin: Vector3, direction: Vector3, length: float,
        width: float, opacity: float, inverse: Transform3D) -> int:
    var axis = _direction(direction)
    var up = Vector3.RIGHT if absf(axis.dot(Vector3.UP)) > 0.98 else Vector3.UP
    var orientation = Basis.looking_at(axis, up)
    var motion_scale = 0.64 if reduced_motion else 1.0
    for layer in range(3):
        var length_scale = 1.0 if layer == 0 else (0.72 if layer == 1 else 0.40)
        var width_scale = 1.0 if layer == 0 else (0.57 if layer == 1 else 0.25)
        var strength = 0.57 if layer == 0 else (0.72 if layer == 1 else 0.83)
        var basis = orientation * Basis.from_scale(Vector3(width * motion_scale * width_scale,
            width * motion_scale * width_scale, length * motion_scale * length_scale))
        _flame_transforms[index] = inverse * Transform3D(basis, origin)
        flame_batch.multimesh.set_instance_transform(index, _flame_transforms[index])
        _flame_opacities[index] = opacity * strength * (0.58 if reduced_motion else 1.0)
        flame_batch.multimesh.set_instance_custom_data(index, Color(_flame_opacities[index], float(layer) * 0.5, 0.0, 0.0))
        index += 1
    return index

func debug_snapshot() -> Dictionary:
    var positions: Array[Vector3] = []
    var flames: Array[Transform3D] = []
    var handles: Array[int] = []
    var opacities: Array[float] = []
    var puffs = 0
    var tube_jets = 0
    for puff in _puffs:
        if puff.active: puffs += 1
    for rocket in _rockets:
        if rocket.active and rocket.rocket_alive: handles.append(int(rocket.id))
        if rocket.active and _clock - float(rocket.born) < TUBE_FLAME_LIFETIME: tube_jets += 1
    if _initialized:
        for i in range(smoke_batch.multimesh.visible_instance_count):
            positions.append(global_transform * _smoke_transforms[i].origin)
        for i in range(flame_batch.multimesh.visible_instance_count):
            flames.append(global_transform * _flame_transforms[i])
            opacities.append(_flame_opacities[i])
    return {"time": _clock, "puffs": puffs, "rocket_ids": handles,
        "prelaunch_active": _prelaunch_active, "tube_jets": tube_jets,
        "flames": flame_batch.multimesh.visible_instance_count if _initialized else 0,
        "positions": positions, "flame_transforms": flames, "flame_opacities": opacities, "nodes": get_child_count(),
        "puff_capacity": _puffs.size(), "rocket_capacity": _rockets.size()}
