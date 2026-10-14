extends RefCounted

static func apply(chassis: Node3D, font: Font) -> void:
	if not is_instance_valid(chassis) or chassis.has_node("K239Marking"):
		return

	# 1. 조종석 카메라 정면(-X면) 제식 명판: 'KM-SAM' (기존 K-239 완전 교체)
	var mount = Node3D.new()
	mount.name = "K239Marking"
	chassis.add_child(mount)
	mount.position = Vector3(-1.63, 1.93, -2.75)
	mount.rotation.y = -PI * 0.5

	var plate = MeshInstance3D.new()
	var shape = BoxMesh.new()
	shape.size = Vector3(3.18, 0.66, 0.024)
	plate.mesh = shape
	var backing = StandardMaterial3D.new()
	backing.albedo_color = Color("2b3424")
	backing.roughness = 0.52
	backing.metallic = 0.35
	plate.material_override = backing
	mount.add_child(plate)

	var text = MeshInstance3D.new()
	text.name = "Designation_KM-SAM"
	var letters = TextMesh.new()
	letters.text = "KM-SAM"
	if font:
		letters.font = font
	letters.font_size = 86
	letters.pixel_size = 0.0085
	letters.depth = 0.002
	letters.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	letters.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	text.mesh = letters
	text.position.z = 0.016
	var paint = StandardMaterial3D.new()
	paint.albedo_color = Color("f4eed2")
	paint.roughness = 0.42
	paint.emission_enabled = true
	paint.emission = Color("f4eed2")
	paint.emission_energy_multiplier = 0.35
	text.material_override = paint
	text.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mount.add_child(text)

	if chassis.is_inside_tree():
		_on_chassis_entered_tree.call_deferred(chassis, font, paint)
	else:
		chassis.tree_entered.connect(_on_chassis_entered_tree.bind(chassis, font, paint), CONNECT_ONE_SHOT)


static func _on_chassis_entered_tree(chassis: Node3D, font: Font, paint: StandardMaterial3D) -> void:
	if not is_instance_valid(chassis):
		return
	var tree = chassis.get_tree()
	if tree:
		tree.create_timer(0.04).timeout.connect(_build_full_cheongung_battery.bind(chassis, font, paint))
	else:
		_build_full_cheongung_battery(chassis, font, paint)


static func _build_full_cheongung_battery(chassis: Node3D, font: Font, paint: StandardMaterial3D) -> void:
	if not is_instance_valid(chassis) or chassis.has_node("CheongungVerticalErector"):
		return
	var launcher = chassis.get_parent()
	if not is_instance_valid(launcher):
		return
	var tree = chassis.get_tree()
	var main_scene = tree.current_scene if tree else launcher.get_parent()

	# 기존 천무(Chunmoo) 대각선 사각 포드(PodRack)의 모든 메시를 완전히 제거(mesh = null)
	var pod_rack = launcher.find_child("PodRack", true, false)
	if is_instance_valid(pod_rack):
		if pod_rack is MeshInstance3D:
			pod_rack.mesh = null
		pod_rack.visible = false
		for ch in pod_rack.get_children():
			if ch is MeshInstance3D:
				ch.mesh = null
			if ch is VisualInstance3D:
				ch.visible = false
			for sub in ch.find_children("*", "VisualInstance3D", true, false):
				if sub is MeshInstance3D:
					sub.mesh = null
				if sub is VisualInstance3D:
					sub.visible = false

	# 공용 PBR 고품질 재질 (Clearcoat & Specular Rim 적용)
	var mat_olive = StandardMaterial3D.new()
	mat_olive.albedo_color = Color("3d4c33")
	mat_olive.roughness = 0.42
	mat_olive.metallic = 0.36
	mat_olive.rim_enabled = true
	mat_olive.rim = 0.28

	var mat_dark = StandardMaterial3D.new()
	mat_dark.albedo_color = Color("222b1d")
	mat_dark.roughness = 0.46
	mat_dark.metallic = 0.42
	mat_dark.rim_enabled = true
	mat_dark.rim = 0.25

	var mat_brown = StandardMaterial3D.new()
	mat_brown.albedo_color = Color("553e2a")
	mat_brown.roughness = 0.50
	mat_brown.metallic = 0.24

	var mat_black = StandardMaterial3D.new()
	mat_black.albedo_color = Color("161a15")
	mat_black.roughness = 0.36
	mat_black.metallic = 0.52

	var mat_chrome = StandardMaterial3D.new()
	mat_chrome.albedo_color = Color("e6f0fa")
	mat_chrome.roughness = 0.10
	mat_chrome.metallic = 0.96

	var mat_rubber = StandardMaterial3D.new()
	mat_rubber.albedo_color = Color("141715")
	mat_rubber.roughness = 0.78

	var mat_pad = StandardMaterial3D.new()
	mat_pad.albedo_color = Color("1f262e")
	mat_pad.roughness = 0.38
	mat_pad.metallic = 0.35
	mat_pad.clearcoat_enabled = true
	mat_pad.clearcoat = 0.55

	var mat_pad_line = StandardMaterial3D.new()
	mat_pad_line.albedo_color = Color("f0b428")
	mat_pad_line.roughness = 0.32
	mat_pad_line.emission_enabled = true
	mat_pad_line.emission = Color("ffaa11")
	mat_pad_line.emission_energy_multiplier = 0.65

	var mat_glass = StandardMaterial3D.new()
	mat_glass.albedo_color = Color(0.35, 0.72, 0.95, 0.90)
	mat_glass.roughness = 0.08
	mat_glass.metallic = 0.82
	mat_glass.emission_enabled = true
	mat_glass.emission = Color("2e78b0")
	mat_glass.emission_energy_multiplier = 0.75

	var mat_radar = StandardMaterial3D.new()
	mat_radar.albedo_color = Color("226872")
	mat_radar.roughness = 0.18
	mat_radar.metallic = 0.72
	mat_radar.emission_enabled = true
	mat_radar.emission = Color("00f2ff")
	mat_radar.emission_energy_multiplier = 1.65

	var mat_strobe_red = StandardMaterial3D.new()
	mat_strobe_red.albedo_color = Color("ff2200")
	mat_strobe_red.emission_enabled = true
	mat_strobe_red.emission = Color("ff3311")
	mat_strobe_red.emission_energy_multiplier = 6.5

	var mat_strobe_amber = StandardMaterial3D.new()
	mat_strobe_amber.albedo_color = Color("ff9900")
	mat_strobe_amber.emission_enabled = true
	mat_strobe_amber.emission = Color("ffaa11")
	mat_strobe_amber.emission_energy_multiplier = 6.5

	var mat_strobe_off = StandardMaterial3D.new()
	mat_strobe_off.albedo_color = Color("3a1810")
	mat_strobe_off.roughness = 0.40

	# 차체(Chassis) 기존 트럭 메시들도 고품질 PBR 밀리터리 클리어코트로 리마스터링
	for ch_mi in chassis.find_children("*", "MeshInstance3D", true, false):
		if ch_mi.name != "Designation_KM-SAM" and is_instance_valid(ch_mi.mesh) and not (ch_mi.mesh is TextMesh):
			var c_mat = ch_mi.get_active_material(0)
			if c_mat is StandardMaterial3D:
				var nm = c_mat.duplicate()
				nm.roughness = clampf(nm.roughness * 0.55, 0.18, 0.48)
				nm.metallic = clampf(maxf(nm.metallic, 0.35), 0.28, 0.85)
				nm.rim_enabled = true
				nm.rim = 0.32
				ch_mi.material_override = nm

	var key_light = OmniLight3D.new()
	key_light.name = "CheongungKeyLight"
	key_light.light_color = Color("dceeff")
	key_light.light_energy = 2.6
	key_light.omni_range = 26.0
	key_light.position = Vector3(-3.5, 6.8, 2.0)
	chassis.add_child(key_light)

	# ========================================================================
	# A. 천궁-II (KM-SAM) 90° 완전 수직 8연장 발사대 (실물 고증)
	# ========================================================================
	var erector = Node3D.new()
	erector.name = "CheongungVerticalErector"
	chassis.add_child(erector)

	erector.add_child(_box(Vector3(2.38, 1.58, 1.55), mat_olive, Vector3(0.0, 2.04, -0.62)))
	erector.add_child(_box(Vector3(2.42, 0.58, 0.82), mat_brown, Vector3(0.0, 2.12, -0.48)))
	erector.add_child(_box(Vector3(2.44, 0.48, 0.42), mat_black, Vector3(0.0, 2.20, -0.98)))
	erector.add_child(_cyl(0.54, 0.54, 0.36, mat_rubber, Vector3(-1.12, 1.88, -1.62), Vector3(0.0, 0.0, PI * 0.5)))

	var rack = Node3D.new()
	rack.name = "VerticalCanisterRack90"
	rack.position = Vector3(0.0, 1.28, 2.15)
	erector.add_child(rack)

	rack.add_child(_box(Vector3(2.60, 0.38, 2.15), mat_black, Vector3(0.0, 0.16, 0.0)))

	var z_cols = [-0.81, -0.27, 0.27, 0.81]
	var x_rows = [-0.52, 0.52]
	var tube_h = 4.65
	var tube_r = 0.24
	var muzzles = []

	for rx in x_rows:
		for cz in z_cols:
			var t_node = Node3D.new()
			t_node.position = Vector3(rx, 0.34, cz)
			rack.add_child(t_node)

			t_node.add_child(_cyl(tube_r, tube_r, tube_h, mat_olive, Vector3(0.0, tube_h * 0.5, 0.0)))
			t_node.add_child(_cyl(tube_r + 0.006, tube_r + 0.006, 1.12, mat_brown, Vector3(0.0, tube_h * 0.30, 0.0)))
			t_node.add_child(_cyl(tube_r + 0.006, tube_r + 0.006, 1.12, mat_dark, Vector3(0.0, tube_h * 0.70, 0.0)))

			t_node.add_child(_cyl(tube_r * 0.96, tube_r * 0.70, 0.26, mat_black, Vector3(0.0, -0.10, 0.0)))
			t_node.add_child(_cyl(tube_r * 0.92, tube_r * 1.04, 0.14, mat_dark, Vector3(0.0, tube_h + 0.05, 0.0)))

			var muz = Node3D.new()
			muz.position = Vector3(0.0, tube_h + 0.18, 0.0)
			t_node.add_child(muz)
			muzzles.append(muz)

	for tier_y in [0.55, 1.50, 2.45, 3.40, 4.38]:
		rack.add_child(_box(Vector3(1.70, 0.17, 2.32), mat_dark, Vector3(0.0, tier_y, 0.0)))

	for sz in [-1.10, -0.54, 0.0, 0.54, 1.10]:
		for sx in [-0.80, 0.80]:
			rack.add_child(_box(Vector3(0.10, 4.45, 0.10), mat_black, Vector3(sx, 2.50, sz)))

	rack.add_child(_box(Vector3(1.62, 3.55, 0.08), mat_olive, Vector3(0.0, 2.10, -1.12)))

	if font:
		var r_badge = MeshInstance3D.new()
		var r_tm = TextMesh.new()
		r_tm.text = "천궁-II KM-SAM"
		r_tm.font = font
		r_tm.font_size = 54
		r_tm.pixel_size = 0.0072
		r_tm.depth = 0.002
		r_badge.mesh = r_tm
		r_badge.position = Vector3(-0.88, 2.98, 0.0)
		r_badge.rotation.y = -PI * 0.5
		r_badge.material_override = paint
		rack.add_child(r_badge)

	for px in [-0.62, 0.62]:
		erector.add_child(_cyl(0.13, 0.13, 1.80, mat_olive, Vector3(px, 1.98, 0.42), Vector3(deg_to_rad(38.0), 0.0, 0.0)))
		erector.add_child(_cyl(0.085, 0.085, 2.05, mat_chrome, Vector3(px, 2.98, 1.20), Vector3(deg_to_rad(38.0), 0.0, 0.0)))

	for jz in [-0.55, 2.95]:
		for jx in [-1.52, 1.52]:
			erector.add_child(_box(Vector3(0.26, 1.20, 0.26), mat_dark, Vector3(jx, 0.88, jz)))
			erector.add_child(_cyl(0.08, 0.08, 0.70, mat_chrome, Vector3(jx, 0.32, jz)))
			erector.add_child(_cyl(0.30, 0.32, 0.10, mat_black, Vector3(jx, 0.04, jz)))

	var lad = Node3D.new()
	lad.position = Vector3(-1.50, 0.68, 0.92)
	lad.rotation.z = -deg_to_rad(14.0)
	erector.add_child(lad)
	lad.add_child(_box(Vector3(0.04, 1.32, 0.04), mat_black, Vector3(0.0, 0.0, -0.18)))
	lad.add_child(_box(Vector3(0.04, 1.32, 0.04), mat_black, Vector3(0.0, 0.0, 0.18)))
	for ri in range(5):
		lad.add_child(_box(Vector3(0.04, 0.035, 0.36), mat_chrome, Vector3(0.0, -0.48 + float(ri) * 0.24, 0.0)))

	# ========================================================================
	# B. 다기능레이더(MFR) 및 교전통제소(ECS) — 스테이지별 자동 비율 스케일링 & 남산 도로 겹침 원천 차단!
	# ========================================================================
	var strobe_list = []
	_build_strobe(erector, Vector3(-0.58, 3.04, -2.65), mat_black, mat_strobe_red, mat_strobe_off, true, strobe_list)
	_build_strobe(erector, Vector3(0.58, 3.04, -2.65), mat_black, mat_strobe_amber, mat_strobe_off, false, strobe_list)

	# 1) 다기능레이더(MFR) 차량
	var mfr = Node3D.new()
	mfr.name = "CheongungMFRVehicle"
	mfr.position = Vector3(-6.2, 0.10, -0.45)
	mfr.rotation.y = deg_to_rad(52.0)
	mfr.scale = Vector3(0.30, 0.30, 0.30)
	launcher.add_child(mfr)

	mfr.add_child(_box(Vector3(3.40, 0.36, 7.00), mat_pad, Vector3(0.0, -0.18, 0.0)))
	mfr.add_child(_box(Vector3(3.48, 0.08, 7.08), mat_pad_line, Vector3(0.0, -0.02, 0.0)))

	mfr.add_child(_box(Vector3(2.35, 0.55, 6.10), mat_dark, Vector3(0.0, 0.85, 0.0)))
	mfr.add_child(_box(Vector3(2.30, 1.45, 1.75), mat_olive, Vector3(0.0, 1.85, -2.10)))
	mfr.add_child(_box(Vector3(2.10, 0.62, 0.08), mat_glass, Vector3(0.0, 2.02, -2.98)))
	mfr.add_child(_box(Vector3(2.32, 1.40, 3.55), mat_olive, Vector3(0.0, 1.82, 0.85)))
	mfr.add_child(_box(Vector3(2.34, 0.65, 1.55), mat_brown, Vector3(0.0, 1.85, 0.60)))
	for wz in [-2.20, -0.90, 0.90, 2.20]:
		for wx in [-1.18, 1.18]:
			mfr.add_child(_cyl(0.52, 0.52, 0.36, mat_rubber, Vector3(wx, 0.52, wz), Vector3(0.0, 0.0, PI * 0.5)))

	var radar_head = Node3D.new()
	radar_head.name = "MFRRotatingAntenna"
	radar_head.position = Vector3(0.0, 2.65, 1.20)
	mfr.add_child(radar_head)
	radar_head.add_child(_cyl(0.78, 0.88, 0.45, mat_black, Vector3(0.0, 0.22, 0.0)))
	radar_head.add_child(_box(Vector3(1.65, 1.15, 1.20), mat_olive, Vector3(0.0, 1.05, 0.45)))

	var array_panel = Node3D.new()
	array_panel.position = Vector3(0.0, 1.60, -0.25)
	array_panel.rotation.x = deg_to_rad(-28.0)
	radar_head.add_child(array_panel)
	array_panel.add_child(_box(Vector3(2.35, 2.65, 0.28), mat_dark, Vector3.ZERO))
	array_panel.add_child(_box(Vector3(2.12, 2.42, 0.08), mat_radar, Vector3(0.0, 0.0, -0.16)))

	var beam_mat = StandardMaterial3D.new()
	beam_mat.albedo_color = Color(0.0, 0.92, 1.0, 0.18)
	beam_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	beam_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	beam_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	beam_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	array_panel.add_child(_cyl(2.2, 0.20, 10.5, beam_mat, Vector3(0.0, 0.2, -5.3), Vector3(PI * 0.5, 0.0, 0.0)))

	var r_tw = radar_head.create_tween().set_loops()
	r_tw.tween_property(radar_head, "rotation:y", TAU, 2.6).from(0.0)

	for wi in range(4):
		var w_ring = MeshInstance3D.new()
		var w_torus = TorusMesh.new()
		w_torus.inner_radius = 0.62
		w_torus.outer_radius = 0.72
		w_ring.mesh = w_torus
		var w_mat = StandardMaterial3D.new()
		w_mat.albedo_color = Color(0.0, 0.95, 1.0, 0.78)
		w_mat.emission_enabled = true
		w_mat.emission = Color("00f2ff")
		w_mat.emission_energy_multiplier = 4.2
		w_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		w_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		w_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		w_ring.material_override = w_mat
		mfr.add_child(w_ring)
		_animate_radar_wave(w_ring, w_mat, float(wi) * 0.45)

	_build_strobe(mfr, Vector3(-0.62, 2.72, -2.50), mat_black, mat_strobe_red, mat_strobe_off, true, strobe_list)
	_build_strobe(mfr, Vector3(0.62, 2.72, -2.50), mat_black, mat_strobe_amber, mat_strobe_off, false, strobe_list)

	# 2) 교전통제소(ECS) 지휘차량 + 4연장 통신 안테나
	var ecs = Node3D.new()
	ecs.name = "CheongungECSVehicle"
	ecs.position = Vector3(2.35, 0.10, -0.45)
	ecs.rotation.y = deg_to_rad(-52.0)
	ecs.scale = Vector3(0.30, 0.30, 0.30)
	launcher.add_child(ecs)

	ecs.add_child(_box(Vector3(3.40, 0.36, 7.00), mat_pad, Vector3(0.0, -0.18, 0.0)))
	ecs.add_child(_box(Vector3(3.48, 0.08, 7.08), mat_pad_line, Vector3(0.0, -0.02, 0.0)))

	ecs.add_child(_box(Vector3(2.35, 0.55, 6.10), mat_dark, Vector3(0.0, 0.85, 0.0)))
	ecs.add_child(_box(Vector3(2.30, 1.45, 1.75), mat_olive, Vector3(0.0, 1.85, -2.10)))
	ecs.add_child(_box(Vector3(2.10, 0.62, 0.08), mat_glass, Vector3(0.0, 2.02, -2.98)))
	ecs.add_child(_box(Vector3(2.42, 1.95, 3.85), mat_olive, Vector3(0.0, 2.10, 0.90)))
	ecs.add_child(_box(Vector3(2.44, 0.85, 1.85), mat_brown, Vector3(0.0, 2.05, 0.80)))
	for az in [-0.65, 0.35, 1.35, 2.35]:
		ecs.add_child(_cyl(0.03, 0.05, 3.55, mat_chrome, Vector3(-1.05, 4.80, az)))
		ecs.add_child(_sphere(0.10, mat_radar, Vector3(-1.05, 6.60, az)))
	for wz in [-2.20, -0.90, 0.90, 2.20]:
		for wx in [-1.18, 1.18]:
			ecs.add_child(_cyl(0.52, 0.52, 0.36, mat_rubber, Vector3(wx, 0.52, wz), Vector3(0.0, 0.0, PI * 0.5)))

	_build_strobe(ecs, Vector3(-0.62, 2.72, -2.50), mat_black, mat_strobe_amber, mat_strobe_off, false, strobe_list)
	_build_strobe(ecs, Vector3(0.62, 2.72, -2.50), mat_black, mat_strobe_red, mat_strobe_off, true, strobe_list)

	# 3) 데이터링크 광파 펄스 노드 (스테이지별 MFR/ECS/TEL 위치에 맞춰 실시간 이동)
	var pulses_a = []
	var pulses_b = []
	for di in range(5):
		var pulse_a = _sphere(0.08, mat_radar, Vector3.ZERO)
		pulse_a.name = "CheongungPulseA_" + str(di)
		launcher.add_child(pulse_a)
		pulses_a.append(pulse_a)

		var pulse_b = _sphere(0.08, mat_radar, Vector3.ZERO)
		pulse_b.name = "CheongungPulseB_" + str(di)
		launcher.add_child(pulse_b)
		pulses_b.append(pulse_b)

	# 4) 방공 경보 사이렌 오디오 스트림 생성
	var audio_player = AudioStreamPlayer.new()
	audio_player.name = "CheongungSirenPlayer"
	var gen = AudioStreamGenerator.new()
	gen.mix_rate = 22050.0
	gen.buffer_length = 0.25
	audio_player.stream = gen
	audio_player.volume_db = -9.0
	launcher.add_child(audio_player)
	audio_player.play()

	if is_instance_valid(main_scene) and muzzles.size() > 0:
		var new_socks = []
		for m_node in muzzles:
			new_socks.append(launcher.to_local(m_node.global_position))
		if "launcher_sockets" in main_scene:
			main_scene.set("launcher_sockets", new_socks)

	var state = {
		"launcher": launcher,
		"chassis": chassis,
		"pod_rack": pod_rack,
		"rack": rack,
		"mfr": mfr,
		"ecs": ecs,
		"pulses_a": pulses_a,
		"pulses_b": pulses_b,
		"main": main_scene,
		"muzzles": muzzles,
		"mfr_head": array_panel,
		"strobes": strobe_list,
		"mat_black": mat_black,
		"mat_radar": mat_radar,
		"audio_player": audio_player,
		"next_tube": 0,
		"time": 0.0,
		"beam_timer": 0.0,
		"siren_timer": 0.0,
		"siren_phase": 0.0,
		"prev_threats": 0,
		"remaster_timer": 0.0,
		"is_namsan": true,
		"last_dogleg_time": -10.0,
		"styled_meshes": {},
		"searchlights": [],
		"lock_rings": {},
		"doglegs": [],
		"hidden_projectiles": {},
		"pending_nodes": []
	}

	# 5) 3D 월드 전체 고퀄리티 그래픽 리마스터링 (하늘/조명/한강수면/빌딩/남산타워/광화문/대공탐조등/별자리) 즉시 실행!
	if is_instance_valid(main_scene):
		_setup_world_3d_overhaul(main_scene, state)
		_remaster_all_scene_meshes(main_scene, state)

	if tree:
		tree.node_added.connect(_on_scene_node_added.bind(state))
		tree.process_frame.connect(_on_pre_process.bind(state))
		RenderingServer.frame_pre_draw.connect(_on_pre_draw.bind(state))


# ============================================================================
# C. 전반적인 3D 그래픽 고퀄리티 리마스터링 엔진
#    (HDR 환경 · 3점 조명 · 한강 거울수면 · 고층빌딩 유리커튼월 & 야간창문 · 랜드마크 조명 · 대공탐조등)
# ============================================================================
static func _setup_world_3d_overhaul(main_scene: Node, state: Dictionary) -> void:
	if main_scene.has_node("CheongungWorld3DOverhaul"):
		return
	var env_root = Node3D.new()
	env_root.name = "CheongungWorld3DOverhaul"
	main_scene.add_child(env_root)

	# 1) 시네마틱 3점 조명: 골든 호라이즌 림라이트 + 문라이트 키라이트 + 도시 스카이라인 업라이트
	for dlight in main_scene.find_children("*", "DirectionalLight3D", true, false):
		if dlight is DirectionalLight3D:
			dlight.shadow_enabled = true
			dlight.shadow_bias = 0.03
			dlight.shadow_normal_bias = 1.2
			dlight.shadow_blur = 1.35
			dlight.light_energy = maxf(dlight.light_energy, 1.35)
			dlight.light_color = Color("e4f0ff")

	var rim_sun = DirectionalLight3D.new()
	rim_sun.name = "CheongungRimSun"
	rim_sun.light_color = Color("ff9e58")
	rim_sun.light_energy = 0.88
	rim_sun.shadow_enabled = false
	rim_sun.rotation_degrees = Vector3(-24.0, 142.0, 0.0)
	env_root.add_child(rim_sun)

	# 2) 랜드마크(남산서울타워 / 광화문) 및 한강 수면 하이라이트 포인트 광원
	var tower_light = OmniLight3D.new()
	tower_light.name = "CheongungLandmarkLight"
	tower_light.light_color = Color("00f5ff")
	tower_light.light_energy = 6.5
	tower_light.omni_range = 42.0
	tower_light.position = Vector3(0.0, 16.5, -24.0)
	env_root.add_child(tower_light)

	var palace_light = OmniLight3D.new()
	palace_light.name = "CheongungPalaceWarmLight"
	palace_light.light_color = Color("ffbb55")
	palace_light.light_energy = 5.2
	palace_light.omni_range = 38.0
	palace_light.position = Vector3(0.0, 8.5, -18.0)
	env_root.add_child(palace_light)

	for rx in [-16.0, 0.0, 16.0]:
		var river_glow = OmniLight3D.new()
		river_glow.light_color = Color("2299ff") if rx != 0.0 else Color("ffaa44")
		river_glow.light_energy = 3.2
		river_glow.omni_range = 24.0
		river_glow.position = Vector3(rx, 3.2, -6.5)
		env_root.add_child(river_glow)

	# 3) 도심 후방 대공 탐조등(Anti-Aircraft Sky Searchlights) 4기 — 밤하늘을 가로지르는 입체 볼류메트릭 서치라이트
	var sl_mat = StandardMaterial3D.new()
	sl_mat.albedo_color = Color(0.55, 0.88, 1.0, 0.11)
	sl_mat.emission_enabled = true
	sl_mat.emission = Color("88ddff")
	sl_mat.emission_energy_multiplier = 2.2
	sl_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	sl_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	sl_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	sl_mat.cull_mode = BaseMaterial3D.CULL_DISABLED

	var sl_positions = [
		Vector3(-24.0, 1.5, -22.0),
		Vector3(-11.0, 1.5, -25.0),
		Vector3(11.0, 1.5, -25.0),
		Vector3(24.0, 1.5, -22.0)
	]
	var sl_list = []
	for si in range(sl_positions.size()):
		var sl_pivot = Node3D.new()
		sl_pivot.name = "CheongungSearchlight_" + str(si)
		sl_pivot.position = sl_positions[si]
		env_root.add_child(sl_pivot)
		var beam = _cyl(3.2, 0.18, 36.0, sl_mat, Vector3(0.0, 18.0, 0.0))
		sl_pivot.add_child(beam)
		sl_list.append(sl_pivot)
	state["searchlights"] = sl_list

	# 4) 입체 3D 밤하늘 별자리 & 고고도 대기 네온 성운(Starfield)
	var star_mat_a = StandardMaterial3D.new()
	star_mat_a.albedo_color = Color("ffffff")
	star_mat_a.emission_enabled = true
	star_mat_a.emission = Color("d8ecff")
	star_mat_a.emission_energy_multiplier = 5.5
	star_mat_a.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var star_mat_b = StandardMaterial3D.new()
	star_mat_b.albedo_color = Color("ffe8b0")
	star_mat_b.emission_enabled = true
	star_mat_b.emission = Color("ffcc66")
	star_mat_b.emission_energy_multiplier = 4.8
	star_mat_b.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	for idx in range(42):
		var sx = -44.0 + fmod(float(idx) * 17.3, 88.0)
		var sy = 16.0 + fmod(float(idx) * 7.9, 22.0)
		var sz = -34.0 - fmod(float(idx) * 5.7, 18.0)
		var sr = 0.06 + fmod(float(idx) * 0.03, 0.08)
		var smat = star_mat_a if (idx % 3 != 0) else star_mat_b
		var star = _sphere(sr, smat, Vector3(sx, sy, sz))
		env_root.add_child(star)


static func _enforce_world_environment(main_scene: Node, t: float) -> void:
	var wenv = main_scene.find_child("*", "WorldEnvironment", true, false)
	var env = null
	if is_instance_valid(wenv) and wenv is WorldEnvironment and is_instance_valid(wenv.environment):
		env = wenv.environment
	elif main_scene.get_viewport() and main_scene.get_viewport().world_3d:
		env = main_scene.get_viewport().world_3d.environment

	if is_instance_valid(env):
		env.tonemap_mode = Environment.TONE_MAPPER_ACES
		env.tonemap_exposure = 1.18
		env.tonemap_white = 5.2
		env.glow_enabled = true
		env.glow_intensity = 1.45
		env.glow_strength = 1.14
		env.glow_bloom = 0.30
		env.glow_blend_mode = Environment.GLOW_BLEND_MODE_SCREEN
		env.adjustment_enabled = true
		env.adjustment_brightness = 1.03
		env.adjustment_contrast = 1.22
		env.adjustment_saturation = 1.28
		env.fog_enabled = true
		env.fog_light_color = Color("182c52")
		env.fog_light_energy = 0.58
		env.fog_density = 0.0030
		env.fog_aerial_perspective = 0.45


static func _remaster_all_scene_meshes(main_scene: Node, state: Dictionary) -> void:
	var styled = state["styled_meshes"]
	var launcher = state["launcher"]
	var all_meshes = main_scene.find_children("*", "MeshInstance3D", true, false)

	var win_gold = StandardMaterial3D.new()
	win_gold.albedo_color = Color("ffe6a3")
	win_gold.emission_enabled = true
	win_gold.emission = Color("ffbb44")
	win_gold.emission_energy_multiplier = 3.6

	var win_cyan = StandardMaterial3D.new()
	win_cyan.albedo_color = Color("a8f5ff")
	win_cyan.emission_enabled = true
	win_cyan.emission = Color("00e5ff")
	win_cyan.emission_energy_multiplier = 3.4

	var beacon_mat = StandardMaterial3D.new()
	beacon_mat.albedo_color = Color("ff2211")
	beacon_mat.emission_enabled = true
	beacon_mat.emission = Color("ff2200")
	beacon_mat.emission_energy_multiplier = 6.0
	beacon_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	for mi in all_meshes:
		if not (mi is MeshInstance3D) or not is_instance_valid(mi) or not is_instance_valid(mi.mesh):
			continue
		var mid = mi.get_instance_id()
		if styled.has(mid):
			continue
		if is_instance_valid(launcher) and (mi == launcher or launcher.is_ancestor_of(mi)):
			styled[mid] = true
			continue
		if mi.name.begins_with("Cheongung") or (mi.get_parent() and mi.get_parent().name.begins_with("Cheongung")):
			styled[mid] = true
			continue
		if mi.mesh is TextMesh:
			styled[mid] = true
			continue
		var mname = mi.name.to_lower()
		if "label" in mname or "text" in mname or "word" in mname or "hud" in mname or "prompt" in mname:
			styled[mid] = true
			continue

		var src_mat = mi.material_override
		if not is_instance_valid(src_mat) and mi.mesh.get_surface_count() > 0:
			src_mat = mi.get_active_material(0)
		if not (src_mat is StandardMaterial3D):
			styled[mid] = true
			continue
		if src_mat.transparency != BaseMaterial3D.TRANSPARENCY_DISABLED:
			styled[mid] = true
			continue

		styled[mid] = true
		var mat = src_mat.duplicate()
		var c = mat.albedo_color
		var lum = c.r * 0.299 + c.g * 0.587 + c.b * 0.114
		var aabb = mi.get_aabb()
		var gscale = mi.global_transform.basis.get_scale()
		var wx = absf(aabb.size.x * gscale.x)
		var wy = absf(aabb.size.y * gscale.y)
		var wz = absf(aabb.size.z * gscale.z)
		var wmax = maxf(wx, wz)
		var gpos = mi.global_position

		# 1) 한강 수면 (Han River Water Surface — 거울 반사 & 딥 사파이어 클리어코트)
		if c.b > c.r * 1.25 and c.g > c.r * 1.10 and wmax > 18.0 and wy < 2.5:
			mat.albedo_color = Color("0b2844")
			mat.metallic = 0.88
			mat.roughness = 0.07
			mat.metallic_specular = 1.0
			mat.clearcoat_enabled = true
			mat.clearcoat = 1.0
			mat.clearcoat_roughness = 0.04
			mat.rim_enabled = true
			mat.rim = 0.45
			mat.emission_enabled = true
			mat.emission = Color("08223a")
			mat.emission_energy_multiplier = 0.42
			mi.material_override = mat
			continue

		# 2) 빌딩 창문 / 가로등 / 타워 조명 / 차량 라이트 (작은 메쉬 또는 발광 메쉬 -> 고휘도 야간 네온/골드 창문으로 변환!)
		if mat.emission_enabled or (gpos.z < -4.5 and wy < 0.95 and wmax < 1.35 and gpos.y > 0.6):
			mat.emission_enabled = true
			if (mid % 3) == 0:
				mat.albedo_color = Color("99f2ff")
				mat.emission = Color("00e5ff")
			else:
				mat.albedo_color = Color("ffe699")
				mat.emission = Color("ffbb33")
			mat.emission_energy_multiplier = maxf(mat.emission_energy_multiplier * 2.5, 3.4)
			mat.roughness = 0.12
			mat.metallic = 0.40
			mi.material_override = mat
			continue

		# 3) 도로 아스팔트 및 한강 대교 상판 (젖은 아스팔트 스페큘러 반사광 PBR)
		if gpos.y < 2.2 and wy < 1.1 and wmax > 3.8 and lum < 0.46 and absf(c.r - c.b) < 0.12:
			mat.albedo_color = c.darkened(0.26)
			mat.roughness = 0.18
			mat.metallic = 0.42
			mat.metallic_specular = 0.92
			mat.clearcoat_enabled = true
			mat.clearcoat = 0.82
			mat.clearcoat_roughness = 0.14
			mat.rim_enabled = true
			mat.rim = 0.30
			mi.material_override = mat
			continue

		# 4) 남산서울타워 상단 전망대 및 안테나 첨탑 (고고도 랜드마크 네온 발광)
		if gpos.y > 8.5 and gpos.z < -14.0 and absf(gpos.x) < 6.5:
			mat.roughness = 0.18
			mat.metallic = 0.72
			mat.clearcoat_enabled = true
			mat.clearcoat = 0.75
			if gpos.y > 12.5:
				mat.emission_enabled = true
				mat.emission = Color("00f5ff") if (mid % 2 == 0) else Color("ff3366")
				mat.emission_energy_multiplier = 2.8
			mi.material_override = mat
			continue

		# 5) 도심 빌딩 본체 (세련된 다크 사파이어/스틸 유리 커튼월 PBR + 옥상 네온 크라운 & 항공장애등 부착)
		if gpos.z < -5.5 and wy >= 1.4 and wx >= 0.8 and wz >= 0.8 and not (c.g > c.r * 1.25 and c.g > c.b * 1.15):
			var tint = Color(0.76, 0.86, 1.06, 1.0) if (mid % 2 == 0) else Color(0.88, 0.90, 0.98, 1.0)
			mat.albedo_color = c.darkened(0.32) * tint
			mat.roughness = 0.16
			mat.metallic = 0.74
			mat.metallic_specular = 0.92
			mat.clearcoat_enabled = true
			mat.clearcoat = 0.68
			mat.clearcoat_roughness = 0.15
			mat.rim_enabled = true
			mat.rim = 0.45
			mat.rim_tint = 0.35
			mi.material_override = mat

			# 일정 높이 이상 빌딩에 옥상 네온 라인 및 적색 항공장애등 추가
			if mi.mesh is BoxMesh and wy >= 2.6 and not mi.has_node("CheongungRoofTrim"):
				var bsz = mi.mesh.size
				var trim_holder = Node3D.new()
				trim_holder.name = "CheongungRoofTrim"
				mi.add_child(trim_holder)
				var crown_mat = win_cyan if (mid % 2 == 0) else win_gold
				trim_holder.add_child(_box(Vector3(bsz.x * 1.02, bsz.y * 0.045, bsz.z * 1.02), crown_mat, Vector3(0.0, bsz.y * 0.46, 0.0)))
				if wy >= 3.8:
					trim_holder.add_child(_sphere(minf(bsz.x, bsz.z) * 0.08, beacon_mat, Vector3(0.0, bsz.y * 0.54, 0.0)))
			continue

		# 6) 남산 산자락 / 잔디 공원 / 가로수 (입체 포레스트 림 셰이딩)
		if c.g > c.r * 1.10 and c.g > c.b * 1.08:
			mat.albedo_color = c.darkened(0.10)
			mat.roughness = 0.56
			mat.metallic = 0.14
			mat.rim_enabled = true
			mat.rim = 0.38
			mat.rim_tint = 0.45
			mi.material_override = mat
			continue

		# 7) 기타 모든 3D 오브젝트 (주행 버스/승용차, 교량 난간, 광화문 성벽/기와 등 — 고광택 PBR 리마스터)
		mat.roughness = clampf(mat.roughness * 0.48, 0.14, 0.48)
		mat.metallic = clampf(maxf(mat.metallic, 0.42), 0.30, 0.88)
		mat.metallic_specular = 0.85
		mat.clearcoat_enabled = true
		mat.clearcoat = 0.55
		mat.rim_enabled = true
		mat.rim = 0.32
		mi.material_override = mat


# ============================================================================
# D. 남산/광화문 스테이지 자동 감지 및 비율·배치 보정 + 3단계 직각 콜드런치(Dogleg) 엔진
# ============================================================================
static func _detect_is_namsan(main_scene: Node) -> bool:
	if not is_instance_valid(main_scene):
		return true
	for p in main_scene.get_property_list():
		var raw_v = main_scene.get(p["name"])
		if typeof(raw_v) == TYPE_STRING or typeof(raw_v) == TYPE_STRING_NAME:
			var val = str(raw_v).to_lower()
			if "namsan" in val:
				return true
			if "gwang" in val:
				return false
	for ch in main_scene.find_children("*", "Node3D", true, false):
		if ch is Node3D and ch.is_visible_in_tree():
			var cn = ch.name.to_lower()
			if "namsan" in cn:
				return true
			if "gwanghwamun" in cn:
				return false
	return true


static func _apply_stage_scale_and_layout(state: Dictionary) -> void:
	var main_scene = state.get("main")
	var launcher = state.get("launcher")
	var chassis = state.get("chassis")
	var mfr = state.get("mfr")
	var ecs = state.get("ecs")
	if not is_instance_valid(launcher) or not is_instance_valid(chassis) or not is_instance_valid(mfr) or not is_instance_valid(ecs):
		return

	var is_namsan = _detect_is_namsan(main_scene)
	state["is_namsan"] = is_namsan

	if is_namsan:
		# [남산 스테이지]:
		# 1) 주변 건물 및 다리 위 차량/버스와 완벽한 비례를 이루도록 발사대(0.42배) 및 레이더/통제소(0.30배) 축소!
		# 2) 우측 한강대교 도로(X ≈ +4.8 ~ +11.0)와 절대 겹치지 않도록,
		#    강변 좌측 넓고 평탄한 잔디 공원 구역(X = -6.2 ~ +2.35, Z = -0.45) 안에 여유 있는 간격으로 배치!
		chassis.position = Vector3(-1.65, 0.0, -0.25)
		chassis.scale = Vector3(0.42, 0.42, 0.42)
		mfr.position = Vector3(-6.20, 0.08, -0.45)
		mfr.scale = Vector3(0.30, 0.30, 0.30)
		ecs.position = Vector3(2.35, 0.08, -0.45)
		ecs.scale = Vector3(0.30, 0.30, 0.30)

		# 발사대 하단 기본 붉은 바닥 패드(GroundPad 등)도 남산 비율(0.42배)에 맞춰 함께 축소·정렬
		for ch in launcher.get_children():
			if ch is Node3D and ch != chassis and ch != mfr and ch != ecs and ch != state.get("pod_rack") and not ch.name.begins_with("Cheongung"):
				ch.position.x = -1.65
				ch.position.z = -0.25
				ch.scale = Vector3(0.42, 0.42, 0.42)
	else:
		# [광화문 스테이지]:
		# 광화문 광장 스케일에 맞춰 발사대(0.82배)와 좌우 레이더/교전통제소(0.46배, X = ±9.2m)를 여유 있게 배치!
		chassis.position = Vector3(0.0, 0.0, 0.0)
		chassis.scale = Vector3(0.82, 0.82, 0.82)
		mfr.position = Vector3(-9.20, 0.14, -0.35)
		mfr.scale = Vector3(0.46, 0.46, 0.46)
		ecs.position = Vector3(9.20, 0.14, -0.35)
		ecs.scale = Vector3(0.46, 0.46, 0.46)

		for ch in launcher.get_children():
			if ch is Node3D and ch != chassis and ch != mfr and ch != ecs and ch != state.get("pod_rack") and not ch.name.begins_with("Cheongung"):
				ch.position.x = 0.0
				ch.position.z = 0.0
				ch.scale = Vector3(0.82, 0.82, 0.82)


static func _on_scene_node_added(node: Node, state: Dictionary) -> void:
	if not (node is Node3D) or not is_instance_valid(node):
		return
	if node.name.begins_with("Cheongung"):
		return
	var launcher = state.get("launcher")
	if is_instance_valid(launcher) and (node == launcher or launcher.is_ancestor_of(node)):
		return
	state["pending_nodes"].append({"node": node, "frames": 0})


static func _hide_engine_projectile_visuals(node: Node3D) -> void:
	if not is_instance_valid(node):
		return
	var nname = node.name.to_lower()
	if "label" in nname or "text" in nname or "word" in nname:
		return
	if node is MeshInstance3D and not (node.mesh is TextMesh):
		node.visible = false
	for ch in node.find_children("*", "VisualInstance3D", true, false):
		var cn = ch.name.to_lower()
		if "label" in cn or "text" in cn or "word" in cn:
			continue
		if ch is MeshInstance3D and not (ch.mesh is TextMesh):
			ch.visible = false
		elif not (ch is Label3D):
			ch.visible = false


static func _animate_radar_wave(w_ring: MeshInstance3D, w_mat: StandardMaterial3D, delay_sec: float) -> void:
	var tw = w_ring.create_tween().set_loops()
	if delay_sec > 0.0:
		tw.tween_interval(delay_sec)
	tw.tween_callback(func():
		w_ring.position = Vector3(0.0, 4.2, 0.8)
		w_ring.scale = Vector3(0.5, 1.0, 0.5)
		w_mat.albedo_color.a = 0.78
	)
	tw.tween_property(w_ring, "position", Vector3(0.0, 14.0, -5.5), 1.8)
	tw.parallel().tween_property(w_ring, "scale", Vector3(6.8, 1.0, 6.8), 1.8)
	tw.parallel().tween_property(w_mat, "albedo_color:a", 0.0, 1.8)


static func _build_strobe(parent: Node3D, pos: Vector3, mat_base: Material, mat_on: Material, mat_off: Material, is_red: bool, list: Array) -> void:
	parent.add_child(_cyl(0.12, 0.14, 0.08, mat_base, pos))
	var dome = _cyl(0.09, 0.11, 0.18, mat_off, pos + Vector3(0.0, 0.12, 0.0))
	parent.add_child(dome)

	var light = OmniLight3D.new()
	light.light_color = Color("ff2200") if is_red else Color("ff9900")
	light.light_energy = 0.0
	light.omni_range = 12.0
	light.position = pos + Vector3(0.0, 0.26, 0.0)
	parent.add_child(light)

	var rotor = Node3D.new()
	rotor.position = pos + Vector3(0.0, 0.14, 0.0)
	if is_red:
		rotor.rotation.y = PI
	parent.add_child(rotor)

	var cone_mat = StandardMaterial3D.new()
	cone_mat.albedo_color = Color(1.0, 0.18, 0.05, 0.28) if is_red else Color(1.0, 0.62, 0.05, 0.28)
	cone_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	cone_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	cone_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	rotor.add_child(_cyl(0.85, 0.06, 3.0, cone_mat, Vector3(0.0, 0.0, 1.55), Vector3(PI * 0.5, 0.0, 0.0)))
	rotor.visible = false

	list.append({"dome": dome, "light": light, "rotor": rotor, "mat_on": mat_on, "mat_off": mat_off, "is_red": is_red})


static func _on_pre_process(state: Dictionary) -> void:
	var chassis = state["chassis"]
	if not is_instance_valid(chassis):
		return
	var pod_rack = state["pod_rack"]
	var rack = state["rack"]
	if is_instance_valid(pod_rack) and is_instance_valid(rack):
		pod_rack.visible = false
		pod_rack.global_position = rack.global_position + Vector3(0.0, 3.2, 0.0)
		pod_rack.rotation = Vector3(deg_to_rad(89.0), 0.0, 0.0)


static func _on_pre_draw(state: Dictionary) -> void:
	var chassis = state["chassis"]
	if not is_instance_valid(chassis):
		return
	var delta = chassis.get_process_delta_time()
	var t = float(state["time"]) + delta
	state["time"] = t

	# 1. 차체 회전 고정 및 스테이지(남산/광화문)별 스케일·좌표 완벽 동기화
	chassis.rotation = Vector3(0.0, PI * 0.5, 0.0)
	_apply_stage_scale_and_layout(state)

	var pod_rack = state["pod_rack"]
	var rack = state["rack"]
	if is_instance_valid(pod_rack) and is_instance_valid(rack):
		pod_rack.visible = false
		pod_rack.global_position = rack.global_position + Vector3(0.0, 3.2, 0.0)
		pod_rack.rotation = Vector3(deg_to_rad(89.0), 0.0, 0.0)

	var main_scene = state.get("main")
	if not is_instance_valid(main_scene):
		return

	# 2. 3D 월드 HDR 환경 유지, 대공 탐조등 스윕 애니메이션 및 주기적 PBR 메쉬 리마스터링
	_enforce_world_environment(main_scene, t)

	var sl_list = state["searchlights"]
	for si in range(sl_list.size()):
		var sl = sl_list[si]
		if is_instance_valid(sl):
			var phase = t * (0.55 + float(si) * 0.12) + float(si) * 1.4
			sl.rotation.z = deg_to_rad(sin(phase) * 28.0)
			sl.rotation.x = deg_to_rad(12.0 + cos(phase * 0.8) * 10.0)

	var rt = float(state["remaster_timer"]) + delta
	if rt >= 0.45:
		rt = 0.0
		_remaster_all_scene_meshes(main_scene, state)
	state["remaster_timer"] = rt

	# 데이터링크 광파 펄스 애니메이션 (MFR -> ECS -> TEL)
	var mfr = state["mfr"]
	var ecs = state["ecs"]
	var pa_list = state["pulses_a"]
	var pb_list = state["pulses_b"]
	if is_instance_valid(mfr) and is_instance_valid(ecs):
		var p_mfr = mfr.position + Vector3(0.0, 0.75, 0.0)
		var p_ecs = ecs.position + Vector3(0.0, 0.75, 0.0)
		var p_tel = chassis.position + Vector3(0.0, 0.85, 0.0)
		for di in range(pa_list.size()):
			var u_a = fmod(t * 0.95 + float(di) * 0.20, 1.0)
			var u_b = fmod(t * 1.15 + float(di) * 0.20, 1.0)
			if is_instance_valid(pa_list[di]):
				pa_list[di].position = p_mfr.lerp(p_ecs, u_a)
			if is_instance_valid(pb_list[di]):
				pb_list[di].position = p_ecs.lerp(p_tel, u_b)

	# 3. 적 위협 미사일(threats) 및 아군 발사체 수집
	var threats = []
	var active_int_nodes = []
	_collect_missiles_and_interceptors(main_scene, state["launcher"], threats, active_int_nodes)

	# 새로 추가된 씬 노드(최대 4프레임 추적) 중 발사대 근처에서 생성된 기본 곡사포(Chunmoo) 미사일/연기 노드를 즉시 감지하여 숨기고 직각 콜드런치 미사일 발사!
	var pending = state["pending_nodes"]
	var still_pending = []
	if pending.size() > 0:
		var ch_gpos = chassis.global_position
		for item in pending:
			var pnode = item["node"]
			var fcnt = int(item["frames"]) + 1
			if is_instance_valid(pnode) and pnode is Node3D:
				var d_l = pnode.global_position.distance_to(ch_gpos)
				var dy = pnode.global_position.y - ch_gpos.y
				if d_l < 16.0 and dy > -1.0 and dy < 9.5 and pnode.global_position.length_squared() > 0.001:
					_hide_engine_projectile_visuals(pnode)
					state["hidden_projectiles"][pnode.get_instance_id()] = pnode
					if t - float(state["last_dogleg_time"]) > 0.07:
						state["last_dogleg_time"] = t
						_spawn_dogleg_cold_launch(main_scene, state, threats, pnode)
				elif fcnt < 4:
					still_pending.append({"node": pnode, "frames": fcnt})
		state["pending_nodes"] = still_pending

	# 엔진 프로퍼티에서 감지된 기본 요격미사일도 곡사포 메쉬를 숨기고 직각 콜드런치 발사 트리거!
	var hidden_map = state["hidden_projectiles"]
	for inode in active_int_nodes:
		if is_instance_valid(inode):
			var iid = inode.get_instance_id()
			_hide_engine_projectile_visuals(inode)
			if not hidden_map.has(iid):
				hidden_map[iid] = inode
				if t - float(state["last_dogleg_time"]) > 0.07:
					state["last_dogleg_time"] = t
					_spawn_dogleg_cold_launch(main_scene, state, threats, inode)

	for hid in hidden_map.keys():
		var hnode = hidden_map[hid]
		if is_instance_valid(hnode):
			_hide_engine_projectile_visuals(hnode)
		else:
			hidden_map.erase(hid)

	var has_threats = threats.size() > 0
	if threats.size() > int(state["prev_threats"]):
		state["siren_timer"] = 2.6
	state["prev_threats"] = threats.size()

	# 비상 경광등 6기 점멸 및 회전
	var strobes = state["strobes"]
	for i in range(strobes.size()):
		var sb = strobes[i]
		var l = sb["light"]
		var d = sb["dome"]
		var r = sb["rotor"]
		if not is_instance_valid(l):
			continue
		if has_threats:
			var on_now = sin(t * 18.0 + float(i) * PI) > 0.0
			l.light_energy = 10.0 if on_now else 0.8
			d.material_override = sb["mat_on"] if on_now else sb["mat_off"]
			r.visible = true
			r.rotation.y += delta * 12.0
		else:
			l.light_energy = 0.0
			d.material_override = sb["mat_off"]
			r.visible = false

	# 방공 사이렌 및 레이더 감지음 합성
	var s_timer = float(state["siren_timer"])
	if s_timer > 0.0:
		state["siren_timer"] = s_timer - delta
		var ap = state.get("audio_player")
		if has_threats and is_instance_valid(ap) and ap.playing:
			var pb = ap.get_stream_playback()
			if pb:
				var avail = pb.get_frames_available()
				var ph = float(state["siren_phase"])
				for _k in range(min(avail, 512)):
					ph += 1.0 / 22050.0
					var lfo = 0.5 + 0.5 * sin(ph * TAU * 1.5)
					var freq = lerp(520.0, 880.0, lfo)
					var smp = sin(ph * TAU * freq) * 0.13
					if fmod(ph, 0.60) < 0.05:
						smp += sin(ph * TAU * 1720.0) * 0.11
					pb.push_frame(Vector2(smp, smp))
				state["siren_phase"] = ph

	# 적 탄도미사일 3D 플라즈마 탄두 업그레이드 & 2중 레이더 감지 파장 링 업데이트
	var lock_rings = state["lock_rings"]
	var active_t_ids = {}
	var ring_scale_base = 0.52 if bool(state["is_namsan"]) else 0.85
	for m_node in threats:
		var tid = m_node.get_instance_id()
		active_t_ids[tid] = true
		_upgrade_threat_missile_visuals(m_node)
		if not lock_rings.has(tid):
			lock_rings[tid] = _create_target_lock_rings(main_scene)
		var h_node = lock_rings[tid]
		if is_instance_valid(h_node):
			h_node.global_position = m_node.global_position
			var s_pulse = ring_scale_base * (0.85 + 0.30 * (0.5 + 0.5 * sin(t * 7.5)))
			h_node.scale = Vector3(s_pulse, 1.0, s_pulse)

	var bt = float(state["beam_timer"]) + delta
	var mfr_head = state.get("mfr_head")
	if has_threats and bt >= 0.50 and is_instance_valid(mfr_head):
		bt = 0.0
		var tgt = threats[randi() % threats.size()]
		_spawn_lock_beam(main_scene, mfr_head.global_position, tgt.global_position)
	state["beam_timer"] = bt

	for tid in lock_rings.keys():
		if not active_t_ids.has(tid):
			var old_h = lock_rings[tid]
			if is_instance_valid(old_h):
				if old_h.global_position.y > 2.5:
					# 만약 엔진이 발사체 노드 없이 즉시 타격 처리했더라도 직각 콜드런치 모션그래픽이 반드시 보이도록 보장!
					if t - float(state["last_dogleg_time"]) > 0.25:
						state["last_dogleg_time"] = t
						_spawn_dogleg_cold_launch(main_scene, state, [], old_h)
					_spawn_interception_explosion(main_scene, old_h.global_position)
				old_h.queue_free()
			lock_rings.erase(tid)

	# ========================================================================
	# 4. 천궁-II 직각 콜드런치(Dogleg Cold-Launch) 미사일 업데이트!
	#    (절대 곡사포처럼 휘어지지 않고: ① 90° 수직 치솟음 │ -> ② 공중 정지 및 DACS 직각 방향 꺾기 ┌ -> ③ 일직선 초음속 타격 ─>)
	# ========================================================================
	var doglegs = state["doglegs"]
	var remaining_doglegs = []
	for dl in doglegs:
		if _update_dogleg_missile(main_scene, dl, delta):
			remaining_doglegs.append(dl)
	state["doglegs"] = remaining_doglegs


static func _spawn_dogleg_cold_launch(main_scene: Node, state: Dictionary, threats: Array, eng_node: Node3D) -> void:
	var muzzles = state["muzzles"]
	var chassis = state["chassis"]
	var m_pos = chassis.global_position + Vector3(0.0, 2.6, 0.0)
	if muzzles.size() > 0:
		var idx = int(state["next_tube"]) % muzzles.size()
		state["next_tube"] = idx + 1
		if is_instance_valid(muzzles[idx]):
			m_pos = muzzles[idx].global_position

	var is_namsan = bool(state["is_namsan"])
	# 수직 콜드런치 사출 높이: 발사관 직상방(+Y)으로만 수직 상승!
	var rise_h = 3.8 if is_namsan else 6.2
	var apex_pos = m_pos + Vector3(0.0, rise_h, 0.0)

	# 타격할 목표 적 미사일 탐색
	var tgt_node = null
	var tgt_pos = apex_pos + Vector3(0.0, 6.0, -14.0)
	if is_instance_valid(eng_node) and eng_node.name == "CheongungTargetLockRing":
		tgt_pos = eng_node.global_position
	elif threats.size() > 0:
		var best_d = 999999.0
		var ref_p = eng_node.global_position if is_instance_valid(eng_node) else m_pos
		for th in threats:
			if is_instance_valid(th):
				var d = th.global_position.distance_to(ref_p)
				if d < best_d:
					best_d = d
					tgt_node = th
		if is_instance_valid(tgt_node):
			tgt_pos = tgt_node.global_position

	var m_scale = 0.55 if is_namsan else 0.90
	var missile_root = _create_cheongung_missile_node(main_scene, state["mat_black"], m_scale)
	missile_root.global_position = m_pos
	_orient_missile_along(missile_root, Vector3.UP)

	_spawn_cold_launch_fx(main_scene, m_pos, apex_pos, m_scale)

	state["doglegs"].append({
		"node": missile_root,
		"eng_node": eng_node,
		"tgt_node": tgt_node,
		"muzzle": m_pos,
		"apex": apex_pos,
		"target_pos": tgt_pos,
		"scale": m_scale,
		"age": 0.0,
		"dacs_done": false,
		"booster_done": false,
		"trail_timer": 0.0
	})


static func _update_dogleg_missile(main_scene: Node, dl: Dictionary, delta: float) -> bool:
	var m_node = dl["node"]
	if not is_instance_valid(m_node):
		return false

	var age = float(dl["age"]) + delta
	dl["age"] = age
	var m_pos = dl["muzzle"]
	var apex_pos = dl["apex"]
	var m_scale = float(dl["scale"])

	var tgt_node = dl.get("tgt_node")
	var eng_node = dl.get("eng_node")
	if is_instance_valid(tgt_node):
		dl["target_pos"] = tgt_node.global_position
	elif is_instance_valid(eng_node) and eng_node.global_position.distance_to(m_pos) > 3.5:
		dl["target_pos"] = eng_node.global_position
	var target_pos = dl["target_pos"]

	if age < 0.15:
		# [1단계: 90° 완전 수직 치솟음 (0.00s ~ 0.15s) — X, Z 이동 0%! 오직 하늘(+Y)로만 일직선 사출 후 정점 감속!]
		var u1 = clampf(age / 0.15, 0.0, 1.0)
		var ease_u1 = 1.0 - pow(1.0 - u1, 2.8)
		m_node.global_position = Vector3(m_pos.x, lerpf(m_pos.y, apex_pos.y, ease_u1), m_pos.z)
		_orient_missile_along(m_node, Vector3.UP)
		return true

	elif age < 0.27:
		# [2단계: 상공 정점(apex_pos) 완전 정지 호버링 & 측면 추력기(DACS) 직각 방향 꺾기 (0.15s ~ 0.27s)]
		# 공중 한 점(apex_pos)에 멈춰 서서 측추력기 화염을 뿜으며 기수 각도를 수직(UP)에서 표적 직선 방향으로 휙 꺾음!
		if not bool(dl["dacs_done"]):
			dl["dacs_done"] = true
			_spawn_dacs_side_thrusters(main_scene, apex_pos, m_scale)
		m_node.global_position = apex_pos
		var u2 = clampf((age - 0.15) / 0.12, 0.0, 1.0)
		var aim_dir = (target_pos - apex_pos).normalized()
		if aim_dir.length_squared() < 0.01:
			aim_dir = Vector3(0.0, 0.4, -0.9).normalized()
		var turn_u = clampf(u2 * 1.35, 0.0, 1.0)
		var cur_dir = Vector3.UP.lerp(aim_dir, turn_u).normalized()
		_orient_missile_along(m_node, cur_dir)
		return true

	elif age < 0.44:
		# [3단계: 주 로켓 엔진 공중 점화 & 표적까지 100% 일직선(곡률 0%) 초음속 직격! (0.27s ~ 0.44s)]
		var aim_dir = (target_pos - apex_pos).normalized()
		if aim_dir.length_squared() < 0.01:
			aim_dir = Vector3(0.0, 0.4, -0.9).normalized()
		if not bool(dl["booster_done"]):
			dl["booster_done"] = true
			_spawn_booster_ring(main_scene, apex_pos, m_scale)
			_spawn_straight_contrail_beam(main_scene, apex_pos, target_pos, m_scale)
			var pl = m_node.find_child("CheongungPlume", true, false)
			if is_instance_valid(pl):
				pl.visible = true

		var u3 = clampf((age - 0.27) / 0.17, 0.0, 1.0)
		var accel_u3 = u3 * u3
		# 곡사포 곡률(arc_lift)을 완전히 배제한 100% 직선 궤적!
		var cur_pos = apex_pos.lerp(target_pos, accel_u3)
		m_node.global_position = cur_pos
		_orient_missile_along(m_node, aim_dir)

		var tr = float(dl["trail_timer"]) + delta
		if tr >= 0.022:
			tr = 0.0
			_spawn_smoke_puff(main_scene, cur_pos, m_scale)
		dl["trail_timer"] = tr
		return true

	else:
		_spawn_interception_explosion(main_scene, target_pos)
		m_node.queue_free()
		return false


static func _create_cheongung_missile_node(main_scene: Node, mat_body: Material, m_scale: float) -> Node3D:
	var root = Node3D.new()
	root.name = "CheongungDoglegMissile"
	root.scale = Vector3(m_scale, m_scale, m_scale)
	main_scene.add_child(root)

	var mat_w = StandardMaterial3D.new()
	mat_w.albedo_color = Color("f5f8fc")
	mat_w.roughness = 0.22
	mat_w.metallic = 0.45
	mat_w.emission_enabled = true
	mat_w.emission = Color("dceeff")
	mat_w.emission_energy_multiplier = 0.65

	var mat_r = StandardMaterial3D.new()
	mat_r.albedo_color = Color("ff2e1f")
	mat_r.emission_enabled = true
	mat_r.emission = Color("ff3b28")
	mat_r.emission_energy_multiplier = 2.4

	root.add_child(_cyl(0.0, 0.15, 0.65, mat_w, Vector3(0.0, 0.0, -1.25), Vector3(PI * 0.5, 0.0, 0.0)))
	root.add_child(_cyl(0.155, 0.155, 0.28, mat_r, Vector3(0.0, 0.0, -0.80), Vector3(PI * 0.5, 0.0, 0.0)))
	root.add_child(_cyl(0.15, 0.15, 1.70, mat_w, Vector3(0.0, 0.0, 0.15), Vector3(PI * 0.5, 0.0, 0.0)))
	# 십자형 조종 날개 4매
	root.add_child(_box(Vector3(0.68, 0.03, 0.38), mat_body, Vector3(0.0, 0.0, 0.72)))
	root.add_child(_box(Vector3(0.03, 0.68, 0.38), mat_body, Vector3(0.0, 0.0, 0.72)))

	var plume = Node3D.new()
	plume.name = "CheongungPlume"
	plume.position = Vector3(0.0, 0.0, 1.02)
	plume.visible = false
	root.add_child(plume)

	var c_mat = StandardMaterial3D.new()
	c_mat.albedo_color = Color(1.0, 0.98, 0.85, 0.98)
	c_mat.emission_enabled = true
	c_mat.emission = Color("fff6cc")
	c_mat.emission_energy_multiplier = 9.5
	c_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var o_mat = StandardMaterial3D.new()
	o_mat.albedo_color = Color(1.0, 0.45, 0.08, 0.88)
	o_mat.emission_enabled = true
	o_mat.emission = Color("ff5500")
	o_mat.emission_energy_multiplier = 7.0
	o_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	o_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	o_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	plume.add_child(_cyl(0.14, 0.01, 1.45, c_mat, Vector3(0.0, 0.0, 0.72), Vector3(PI * 0.5, 0.0, 0.0)))
	plume.add_child(_cyl(0.30, 0.02, 2.75, o_mat, Vector3(0.0, 0.0, 1.38), Vector3(PI * 0.5, 0.0, 0.0)))

	var tl = OmniLight3D.new()
	tl.light_color = Color("ff8822")
	tl.light_energy = 7.5
	tl.omni_range = 14.0
	plume.add_child(tl)
	return root


static func _upgrade_threat_missile_visuals(m_node: Node3D) -> void:
	if not is_instance_valid(m_node) or m_node.has_node("CheongungThreatUpgrade"):
		return
	var tag = Node3D.new()
	tag.name = "CheongungThreatUpgrade"
	m_node.add_child(tag)

	var t_light = OmniLight3D.new()
	t_light.light_color = Color("ff3311")
	t_light.light_energy = 3.6
	t_light.omni_range = 9.0
	tag.add_child(t_light)

	for mi in m_node.find_children("*", "MeshInstance3D", true, false):
		if mi is MeshInstance3D and is_instance_valid(mi.mesh) and not (mi.mesh is TextMesh):
			var nm = mi.name.to_lower()
			if "label" in nm or "text" in nm or "word" in nm:
				continue
			var smat = mi.get_active_material(0)
			if smat is StandardMaterial3D:
				var dup = smat.duplicate()
				dup.metallic = 0.78
				dup.roughness = 0.18
				dup.emission_enabled = true
				dup.emission = Color("ff3311")
				dup.emission_energy_multiplier = 1.45
				mi.material_override = dup


static func _orient_missile_along(i_node: Node3D, dir: Vector3) -> void:
	if dir.length_squared() < 0.0001:
		return
	var d = dir.normalized()
	var up_ref = Vector3.FORWARD if absf(d.dot(Vector3.UP)) > 0.96 else Vector3.UP
	i_node.look_at(i_node.global_position + d, up_ref)


static func _collect_missiles_and_interceptors(main_scene: Node, launcher: Node3D, threats: Array, interceptors: Array) -> void:
	var seen_t = {}
	var seen_i = {}

	var raw_m = main_scene.get("missiles")
	if raw_m is Array:
		for item in raw_m:
			var n = _find_node3d(item)
			if is_instance_valid(n) and n.visible:
				seen_t[n.get_instance_id()] = true
				threats.append(n)

	for prop_name in ["interceptors", "active_interceptors", "shots", "rockets", "projectiles"]:
		var raw_i = main_scene.get(prop_name)
		if raw_i is Array:
			for item in raw_i:
				var n = _find_node3d(item)
				if is_instance_valid(n) and not seen_t.has(n.get_instance_id()) and not seen_i.has(n.get_instance_id()):
					seen_i[n.get_instance_id()] = true
					interceptors.append(n)

	if interceptors.is_empty():
		for p_info in main_scene.get_property_list():
			var pname = p_info["name"]
			if pname == "missiles" or pname == "vehicle_templates" or pname == "models":
				continue
			var val = main_scene.get(pname)
			if val is Array and val.size() > 0:
				for item in val:
					var n = _find_node3d(item)
					if is_instance_valid(n) and n != launcher and not launcher.is_ancestor_of(n) and not n.name.begins_with("Cheongung"):
						var nid = n.get_instance_id()
						if not seen_t.has(nid) and not seen_i.has(nid):
							if "intercept" in n.name.to_lower() or "rocket" in n.name.to_lower() or "shot" in n.name.to_lower() or n.global_position.distance_to(launcher.global_position) < 22.0:
								seen_i[nid] = true
								interceptors.append(n)


static func _find_node3d(item) -> Node3D:
	if item is Node3D:
		return item
	if item is Dictionary:
		for k in ["node", "mesh", "instance", "root", "visual", "missile", "interceptor", "rocket", "body"]:
			if item.has(k) and item[k] is Node3D:
				return item[k]
		for v in item.values():
			if v is Node3D:
				return v
	if item is Object:
		for k in ["node", "mesh", "instance", "root", "visual", "missile", "interceptor"]:
			var val = item.get(k)
			if val is Node3D:
				return val
	return null


static func _create_target_lock_rings(main_scene: Node) -> Node3D:
	var holder = Node3D.new()
	holder.name = "CheongungTargetLockRing"
	main_scene.add_child(holder)

	var m1 = StandardMaterial3D.new()
	m1.albedo_color = Color(1.0, 0.18, 0.22, 0.88)
	m1.emission_enabled = true
	m1.emission = Color("ff2233")
	m1.emission_energy_multiplier = 4.5
	m1.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m1.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	m1.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var r1 = MeshInstance3D.new()
	var t1 = TorusMesh.new()
	t1.inner_radius = 0.85
	t1.outer_radius = 0.98
	r1.mesh = t1
	r1.rotation.x = PI * 0.5
	r1.material_override = m1
	holder.add_child(r1)

	var m2 = StandardMaterial3D.new()
	m2.albedo_color = Color(0.0, 0.95, 1.0, 0.78)
	m2.emission_enabled = true
	m2.emission = Color("00f0ff")
	m2.emission_energy_multiplier = 3.8
	m2.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m2.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	m2.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var r2 = MeshInstance3D.new()
	var t2 = TorusMesh.new()
	t2.inner_radius = 1.28
	t2.outer_radius = 1.38
	r2.mesh = t2
	r2.rotation.x = PI * 0.5
	r2.material_override = m2
	holder.add_child(r2)
	return holder


static func _spawn_lock_beam(main_scene: Node, p0: Vector3, p1: Vector3) -> void:
	var d = p0.distance_to(p1)
	if d < 0.5:
		return
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.0, 0.96, 1.0, 0.65)
	mat.emission_enabled = true
	mat.emission = Color("00f5ff")
	mat.emission_energy_multiplier = 4.8
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var pivot = Node3D.new()
	pivot.name = "CheongungLockBeam"
	main_scene.add_child(pivot)
	pivot.global_position = (p0 + p1) * 0.5
	pivot.look_at(p1, Vector3.UP)
	pivot.add_child(_cyl(0.05, 0.12, d, mat, Vector3.ZERO, Vector3(PI * 0.5, 0.0, 0.0)))

	var tw = pivot.create_tween()
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.24)
	tw.tween_callback(pivot.queue_free)


static func _spawn_cold_launch_fx(main_scene: Node, m_pos: Vector3, apex_pos: Vector3, m_scale: float) -> void:
	# 1단계: 90° 수직 콜드런치 가스 기둥 (발사관에서 정점까지 수직 연기 기둥 생성!)
	var fl = OmniLight3D.new()
	fl.name = "CheongungColdLight"
	fl.light_color = Color("ffaa44")
	fl.light_energy = 9.5
	fl.omni_range = 14.0
	main_scene.add_child(fl)
	fl.global_position = m_pos + Vector3(0.0, 0.5, 0.0)
	var tw_l = fl.create_tween()
	tw_l.tween_property(fl, "light_energy", 0.0, 0.35)
	tw_l.tween_callback(fl.queue_free)

	var col_h = m_pos.distance_to(apex_pos)
	var col_mat = StandardMaterial3D.new()
	col_mat.albedo_color = Color(0.88, 0.92, 0.96, 0.72)
	col_mat.emission_enabled = true
	col_mat.emission = Color("d8e6f2")
	col_mat.emission_energy_multiplier = 1.6
	col_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var v_col = _cyl(0.14 * m_scale, 0.28 * m_scale, col_h, col_mat, (m_pos + apex_pos) * 0.5)
	v_col.name = "CheongungVerticalSmokeColumn"
	main_scene.add_child(v_col)
	v_col.global_position = (m_pos + apex_pos) * 0.5
	var tw_c = v_col.create_tween()
	tw_c.tween_property(v_col, "scale", Vector3(2.2, 1.0, 2.2), 0.55)
	tw_c.parallel().tween_property(col_mat, "albedo_color:a", 0.0, 0.55)
	tw_c.tween_callback(v_col.queue_free)

	for i in range(8):
		var p_mat = StandardMaterial3D.new()
		p_mat.albedo_color = Color(0.88, 0.91, 0.95, 0.82)
		p_mat.emission_enabled = true
		p_mat.emission = Color("ffaa55") if i < 2 else Color("d5dee6")
		p_mat.emission_energy_multiplier = 2.4 if i < 2 else 0.65
		p_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

		var start_p = m_pos.lerp(apex_pos, float(i) / 8.0)
		var puff = _sphere((0.22 + float(i % 2) * 0.08) * m_scale, p_mat, start_p)
		puff.name = "CheongungColdPuff"
		main_scene.add_child(puff)
		puff.global_position = start_p

		var tw = puff.create_tween()
		tw.tween_property(puff, "scale", Vector3(2.4, 2.4, 2.4), 0.52)
		tw.parallel().tween_property(p_mat, "albedo_color:a", 0.0, 0.52)
		tw.tween_callback(puff.queue_free)


static func _spawn_dacs_side_thrusters(main_scene: Node, apex_pos: Vector3, m_scale: float) -> void:
	# 2단계: 상공 정점(apex_pos)에서 직각 방향 전환 시 폭발하는 십자형 DACS 측추력 노즐 화염!
	var dl = OmniLight3D.new()
	dl.name = "CheongungDACSLight"
	dl.light_color = Color("ffaa22")
	dl.light_energy = 14.0
	dl.omni_range = 18.0
	main_scene.add_child(dl)
	dl.global_position = apex_pos
	var tw_l = dl.create_tween()
	tw_l.tween_property(dl, "light_energy", 0.0, 0.25)
	tw_l.tween_callback(dl.queue_free)

	var rot_list = [
		Vector3(0.0, 0.0, PI * 0.5),
		Vector3(0.0, 0.0, -PI * 0.5),
		Vector3(PI * 0.5, 0.0, 0.0),
		Vector3(-PI * 0.5, 0.0, 0.0)
	]
	for rot_v in rot_list:
		var j_mat = StandardMaterial3D.new()
		j_mat.albedo_color = Color(1.0, 0.76, 0.20, 0.96)
		j_mat.emission_enabled = true
		j_mat.emission = Color("ff9911")
		j_mat.emission_energy_multiplier = 8.5
		j_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		j_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		j_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

		var jet = _cyl(0.04 * m_scale, 0.38 * m_scale, 2.10 * m_scale, j_mat, apex_pos, rot_v)
		jet.name = "CheongungDACSJet"
		main_scene.add_child(jet)
		jet.global_position = apex_pos
		var tw = jet.create_tween()
		tw.tween_property(jet, "scale", Vector3(2.2, 2.2, 2.2), 0.22)
		tw.parallel().tween_property(j_mat, "albedo_color:a", 0.0, 0.22)
		tw.tween_callback(jet.queue_free)


static func _spawn_booster_ring(main_scene: Node, pos: Vector3, m_scale: float) -> void:
	var r_mat = StandardMaterial3D.new()
	r_mat.albedo_color = Color(1.0, 0.85, 0.45, 0.92)
	r_mat.emission_enabled = true
	r_mat.emission = Color("ffbb44")
	r_mat.emission_energy_multiplier = 7.0
	r_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	r_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	r_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var ring = MeshInstance3D.new()
	ring.name = "CheongungBoosterRing"
	var torus = TorusMesh.new()
	torus.inner_radius = 0.32 * m_scale
	torus.outer_radius = 0.48 * m_scale
	ring.mesh = torus
	ring.material_override = r_mat
	main_scene.add_child(ring)
	ring.global_position = pos

	var tw = ring.create_tween()
	tw.tween_property(ring, "scale", Vector3(5.8, 5.8, 5.8), 0.34)
	tw.parallel().tween_property(r_mat, "albedo_color:a", 0.0, 0.34)
	tw.tween_callback(ring.queue_free)


static func _spawn_straight_contrail_beam(main_scene: Node, p0: Vector3, p1: Vector3, m_scale: float) -> void:
	# 3단계: 정점(apex_pos)에서 표적(target_pos)까지 꺾인 뒤 뻗어나가는 일직선 부스터 궤적 라인!
	var d = p0.distance_to(p1)
	if d < 0.5:
		return
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.95, 0.97, 1.0, 0.68)
	mat.emission_enabled = true
	mat.emission = Color("ffddaa")
	mat.emission_energy_multiplier = 2.5
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var pivot = Node3D.new()
	pivot.name = "CheongungStraightTrail"
	main_scene.add_child(pivot)
	pivot.global_position = (p0 + p1) * 0.5
	pivot.look_at(p1, Vector3.UP)
	pivot.add_child(_cyl(0.08 * m_scale, 0.14 * m_scale, d, mat, Vector3.ZERO, Vector3(PI * 0.5, 0.0, 0.0)))

	var tw = pivot.create_tween()
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.48)
	tw.tween_callback(pivot.queue_free)


static func _spawn_smoke_puff(main_scene: Node, pos: Vector3, m_scale: float) -> void:
	var s_mat = StandardMaterial3D.new()
	s_mat.albedo_color = Color(0.94, 0.96, 1.0, 0.68)
	s_mat.emission_enabled = true
	s_mat.emission = Color("ffbb77")
	s_mat.emission_energy_multiplier = 0.85
	s_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var puff = _sphere(0.20 * m_scale, s_mat, pos)
	puff.name = "CheongungSmokePuff"
	main_scene.add_child(puff)
	puff.global_position = pos

	var tw = puff.create_tween()
	tw.tween_property(puff, "scale", Vector3(2.2, 2.2, 2.2), 0.48)
	tw.parallel().tween_property(s_mat, "albedo_color:a", 0.0, 0.48)
	tw.tween_callback(puff.queue_free)


static func _spawn_interception_explosion(main_scene: Node, pos: Vector3) -> void:
	var el = OmniLight3D.new()
	el.name = "CheongungExpLight"
	el.light_color = Color("ff7722")
	el.light_energy = 16.0
	el.omni_range = 30.0
	main_scene.add_child(el)
	el.global_position = pos
	var tw_l = el.create_tween()
	tw_l.tween_property(el, "light_energy", 0.0, 0.55)
	tw_l.tween_callback(el.queue_free)

	var c_mat = StandardMaterial3D.new()
	c_mat.albedo_color = Color(1.0, 0.85, 0.35, 0.95)
	c_mat.emission_enabled = true
	c_mat.emission = Color("ffaa22")
	c_mat.emission_energy_multiplier = 7.5
	c_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	c_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	c_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var fb = _sphere(0.75, c_mat, pos)
	fb.name = "CheongungExpFireball"
	main_scene.add_child(fb)
	fb.global_position = pos
	var tw_f = fb.create_tween()
	tw_f.tween_property(fb, "scale", Vector3(5.8, 5.8, 5.8), 0.45)
	tw_f.parallel().tween_property(c_mat, "albedo_color:a", 0.0, 0.45)
	tw_f.tween_callback(fb.queue_free)

	for r_rot in [Vector3.ZERO, Vector3(PI * 0.35, 0.0, PI * 0.25)]:
		var sw_mat = c_mat.duplicate()
		var sw = MeshInstance3D.new()
		sw.name = "CheongungExpShockwave"
		var torus = TorusMesh.new()
		torus.inner_radius = 0.48
		torus.outer_radius = 0.62
		sw.mesh = torus
		sw.rotation = r_rot
		sw.material_override = sw_mat
		main_scene.add_child(sw)
		sw.global_position = pos
		var tw_s = sw.create_tween()
		tw_s.tween_property(sw, "scale", Vector3(8.2, 8.2, 8.2), 0.50)
		tw_s.parallel().tween_property(sw_mat, "albedo_color:a", 0.0, 0.50)
		tw_s.tween_callback(sw.queue_free)


static func _box(sz: Vector3, mat: Material, pos: Vector3, rot: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mi = MeshInstance3D.new()
	var bm = BoxMesh.new()
	bm.size = sz
	mi.mesh = bm
	mi.material_override = mat
	mi.position = pos
	mi.rotation = rot
	return mi


static func _cyl(top_r: float, bot_r: float, h: float, mat: Material, pos: Vector3, rot: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mi = MeshInstance3D.new()
	var cm = CylinderMesh.new()
	cm.top_radius = top_r
	cm.bottom_radius = bot_r
	cm.height = h
	cm.radial_segments = 20
	mi.mesh = cm
	mi.material_override = mat
	mi.position = pos
	mi.rotation = rot
	return mi


static func _sphere(r: float, mat: Material, pos: Vector3) -> MeshInstance3D:
	var mi = MeshInstance3D.new()
	var sm = SphereMesh.new()
	sm.radius = r
	sm.height = r * 2.0
	sm.radial_segments = 14
	sm.rings = 8
	mi.mesh = sm
	mi.material_override = mat
	mi.position = pos
	return mi
