extends RefCounted

static func apply(chassis: Node3D, font: Font) -> void:
	if not is_instance_valid(chassis) or chassis.has_node("K239Marking"):
		return

	# 1. 조종석 카메라 정면(-X면) 제식 명판: 'KM-SAM'
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
	backing.roughness = 0.68
	backing.metallic = 0.25
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
	paint.roughness = 0.55
	paint.emission_enabled = true
	paint.emission = Color("f4eed2")
	paint.emission_energy_multiplier = 0.25
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
		tree.create_timer(0.05).timeout.connect(_build_full_cheongung_battery.bind(chassis, font, paint))
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

	# 기존 천무(Chunmoo) 대각선 사각 포드(PodRack)의 모든 메시를 완전히 제거
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

	var mat_olive = StandardMaterial3D.new()
	mat_olive.albedo_color = Color("45543a")
	mat_olive.roughness = 0.58
	mat_olive.metallic = 0.28

	var mat_dark = StandardMaterial3D.new()
	mat_dark.albedo_color = Color("263020")
	mat_dark.roughness = 0.64
	mat_dark.metallic = 0.30

	var mat_brown = StandardMaterial3D.new()
	mat_brown.albedo_color = Color("5e4630")
	mat_brown.roughness = 0.68
	mat_brown.metallic = 0.18

	var mat_black = StandardMaterial3D.new()
	mat_black.albedo_color = Color("1a1f18")
	mat_black.roughness = 0.48
	mat_black.metallic = 0.42

	var mat_chrome = StandardMaterial3D.new()
	mat_chrome.albedo_color = Color("e2ecf5")
	mat_chrome.roughness = 0.12
	mat_chrome.metallic = 0.95

	var mat_rubber = StandardMaterial3D.new()
	mat_rubber.albedo_color = Color("151816")
	mat_rubber.roughness = 0.88

	var mat_pad = StandardMaterial3D.new()
	mat_pad.albedo_color = Color("283038")
	mat_pad.roughness = 0.78
	mat_pad.metallic = 0.16

	var mat_pad_line = StandardMaterial3D.new()
	mat_pad_line.albedo_color = Color("d8a020")
	mat_pad_line.roughness = 0.50

	var mat_glass = StandardMaterial3D.new()
	mat_glass.albedo_color = Color(0.40, 0.68, 0.88, 0.88)
	mat_glass.roughness = 0.10
	mat_glass.metallic = 0.70
	mat_glass.emission_enabled = true
	mat_glass.emission = Color("2b6088")
	mat_glass.emission_energy_multiplier = 0.45

	var mat_radar = StandardMaterial3D.new()
	mat_radar.albedo_color = Color("2c686e")
	mat_radar.roughness = 0.22
	mat_radar.metallic = 0.60
	mat_radar.emission_enabled = true
	mat_radar.emission = Color("00f0ff")
	mat_radar.emission_energy_multiplier = 1.25

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

	if is_instance_valid(main_scene):
		var wenv = main_scene.find_child("*", "WorldEnvironment", true, false)
		if is_instance_valid(wenv) and wenv is WorldEnvironment and is_instance_valid(wenv.environment):
			wenv.environment.tonemap_mode = Environment.TONE_MAPPER_ACES
			wenv.environment.tonemap_exposure = 1.16
			wenv.environment.glow_enabled = true
			wenv.environment.glow_intensity = 1.28
			wenv.environment.glow_strength = 1.08
			wenv.environment.glow_bloom = 0.22

	var key_light = OmniLight3D.new()
	key_light.light_color = Color("dceeff")
	key_light.light_energy = 2.8
	key_light.omni_range = 28.0
	key_light.position = Vector3(-4.5, 7.5, 1.0)
	chassis.add_child(key_light)

	# ========================================================================
	# A. 천궁-II (KM-SAM) 90° 완전 수직 8연장 발사대
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
	var tube_h = 4.85
	var tube_r = 0.245
	var muzzles = []

	for rx in x_rows:
		for cz in z_cols:
			var t_node = Node3D.new()
			t_node.position = Vector3(rx, 0.34, cz)
			rack.add_child(t_node)

			t_node.add_child(_cyl(tube_r, tube_r, tube_h, mat_olive, Vector3(0.0, tube_h * 0.5, 0.0)))
			t_node.add_child(_cyl(tube_r + 0.006, tube_r + 0.006, 1.18, mat_brown, Vector3(0.0, tube_h * 0.30, 0.0)))
			t_node.add_child(_cyl(tube_r + 0.006, tube_r + 0.006, 1.18, mat_dark, Vector3(0.0, tube_h * 0.70, 0.0)))
			t_node.add_child(_cyl(tube_r * 0.96, tube_r * 0.70, 0.28, mat_black, Vector3(0.0, -0.10, 0.0)))
			t_node.add_child(_cyl(tube_r * 0.92, tube_r * 1.04, 0.15, mat_dark, Vector3(0.0, tube_h + 0.06, 0.0)))

			var muz = Node3D.new()
			muz.position = Vector3(0.0, tube_h + 0.20, 0.0)
			t_node.add_child(muz)
			muzzles.append(muz)

	for tier_y in [0.58, 1.58, 2.58, 3.58, 4.58]:
		rack.add_child(_box(Vector3(1.72, 0.18, 2.34), mat_dark, Vector3(0.0, tier_y, 0.0)))

	for sz in [-1.12, -0.54, 0.0, 0.54, 1.12]:
		for sx in [-0.82, 0.82]:
			rack.add_child(_box(Vector3(0.10, 4.65, 0.10), mat_black, Vector3(sx, 2.60, sz)))

	rack.add_child(_box(Vector3(1.64, 3.70, 0.08), mat_olive, Vector3(0.0, 2.18, -1.14)))

	if font:
		var r_badge = MeshInstance3D.new()
		var r_tm = TextMesh.new()
		r_tm.text = "천궁-II KM-SAM"
		r_tm.font = font
		r_tm.font_size = 56
		r_tm.pixel_size = 0.0075
		r_tm.depth = 0.002
		r_badge.mesh = r_tm
		r_badge.position = Vector3(-0.90, 3.10, 0.0)
		r_badge.rotation.y = -PI * 0.5
		r_badge.material_override = paint
		rack.add_child(r_badge)

	for px in [-0.62, 0.62]:
		erector.add_child(_cyl(0.13, 0.13, 1.85, mat_olive, Vector3(px, 2.02, 0.42), Vector3(deg_to_rad(38.0), 0.0, 0.0)))
		erector.add_child(_cyl(0.085, 0.085, 2.15, mat_chrome, Vector3(px, 3.05, 1.22), Vector3(deg_to_rad(38.0), 0.0, 0.0)))

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
	# B. 좌측 다기능레이더(MFR) 및 우측 교전통제소(ECS) — 광화문 발사대와 여유 배치(±8.8m 대칭) & 도로 침범 0%!
	# ========================================================================
	var strobe_list = []
	_build_strobe(erector, Vector3(-0.58, 3.04, -2.65), mat_black, mat_strobe_red, mat_strobe_off, true, strobe_list)
	_build_strobe(erector, Vector3(0.58, 3.04, -2.65), mat_black, mat_strobe_amber, mat_strobe_off, false, strobe_list)

	# 1) 좌측 다기능레이더(MFR) 차량 (광화문 X = -8.80 / 남산 X = -9.60)
	var mfr = Node3D.new()
	mfr.name = "CheongungMFRVehicle"
	mfr.position = Vector3(-8.80, 0.08, -0.25)
	mfr.rotation.y = deg_to_rad(28.0)
	mfr.scale = Vector3(0.74, 0.74, 0.74)
	launcher.add_child(mfr)

	mfr.add_child(_box(Vector3(3.60, 0.42, 7.40), mat_pad, Vector3(0.0, -0.21, 0.0)))
	mfr.add_child(_box(Vector3(3.66, 0.08, 7.46), mat_pad_line, Vector3(0.0, -0.02, 0.0)))
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
	array_panel.rotation.x = deg_to_rad(32.0)
	radar_head.add_child(array_panel)
	array_panel.add_child(_box(Vector3(2.35, 2.65, 0.28), mat_dark, Vector3.ZERO))
	array_panel.add_child(_box(Vector3(2.12, 2.42, 0.08), mat_radar, Vector3(0.0, 0.0, -0.16)))

	var r_tw = radar_head.create_tween().set_loops()
	r_tw.tween_property(radar_head, "rotation:y", TAU, 2.6).from(0.0)

	for wi in range(4):
		var w_ring = MeshInstance3D.new()
		var w_torus = TorusMesh.new()
		w_torus.inner_radius = 0.58
		w_torus.outer_radius = 0.76
		w_ring.mesh = w_torus
		var w_mat = StandardMaterial3D.new()
		w_mat.albedo_color = Color(0.0, 0.95, 1.0, 0.85)
		w_mat.emission_enabled = true
		w_mat.emission = Color("00f2ff")
		w_mat.emission_energy_multiplier = 4.8
		w_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		w_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		w_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		w_ring.material_override = w_mat
		mfr.add_child(w_ring)
		_animate_radar_wave(w_ring, w_mat, float(wi) * 0.45)

	_build_strobe(mfr, Vector3(-0.62, 2.72, -2.50), mat_black, mat_strobe_red, mat_strobe_off, true, strobe_list)
	_build_strobe(mfr, Vector3(0.62, 2.72, -2.50), mat_black, mat_strobe_amber, mat_strobe_off, false, strobe_list)

	# 2) 우측 교전통제소(ECS) 지휘차량 (광화문 X = +8.80 대칭 배치: 발사대와 8.8m 여유 간격 확보 및 도로 침범 0%)
	var ecs = Node3D.new()
	ecs.name = "CheongungECSVehicle"
	ecs.position = Vector3(8.80, 0.08, -0.25)
	ecs.rotation.y = deg_to_rad(-28.0)
	ecs.scale = Vector3(0.74, 0.74, 0.74)
	launcher.add_child(ecs)

	ecs.add_child(_box(Vector3(3.60, 0.42, 7.40), mat_pad, Vector3(0.0, -0.21, 0.0)))
	ecs.add_child(_box(Vector3(3.66, 0.08, 7.46), mat_pad_line, Vector3(0.0, -0.02, 0.0)))
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

	# 3) 데이터링크 광파 펄스 (광장 내부 X = -8.2 ~ +8.2)
	for di in range(6):
		var pulse_a = _sphere(0.12, mat_radar, Vector3(-8.2, 1.8, 0.5))
		launcher.add_child(pulse_a)
		var tw_a = pulse_a.create_tween().set_loops()
		tw_a.tween_interval(float(di) * 0.18)
		tw_a.tween_property(pulse_a, "position", Vector3(8.2, 1.9, 0.5), 1.25).from(Vector3(-8.2, 1.8, 0.5))

		var pulse_b = _sphere(0.12, mat_radar, Vector3(8.2, 1.9, 0.5))
		launcher.add_child(pulse_b)
		var tw_b = pulse_b.create_tween().set_loops()
		tw_b.tween_interval(float(di) * 0.18)
		tw_b.tween_property(pulse_b, "position", Vector3(0.0, 1.8, 0.0), 0.78).from(Vector3(8.2, 1.9, 0.5))

	# 4) 방공 경보 사이렌
	var audio_player = AudioStreamPlayer.new()
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

	var cg_dart = Node3D.new()
	cg_dart.name = "CheongungColdLaunchDart"
	cg_dart.visible = false
	if is_instance_valid(main_scene):
		main_scene.add_child(cg_dart)
	else:
		launcher.add_child(cg_dart)
	_upgrade_interceptor_mesh(cg_dart, mat_black)

	var state = {
		"launcher": launcher,
		"chassis": chassis,
		"pod_rack": pod_rack,
		"rack": rack,
		"mfr": mfr,
		"ecs": ecs,
		"main": main_scene,
		"muzzles": muzzles,
		"mfr_head": array_panel,
		"strobes": strobe_list,
		"mat_black": mat_black,
		"audio_player": audio_player,
		"cg_dart": cg_dart,
		"next_tube": 0,
		"time": 0.0,
		"beam_timer": 0.0,
		"siren_timer": 0.0,
		"siren_phase": 0.0,
		"prev_threats": 0,
		"stage_chk_t": -99.0,
		"is_namsan": false,
		"flight_active": false,
		"prev_flight_elapsed": 999.0,
		"flight_muzzle_pos": Vector3.ZERO,
		"flight_dacs_done": false,
		"flight_booster_done": false,
		"flight_trail_t": 0.0,
		"last_flight_target": Vector3.ZERO,
		"lock_rings": {},
		"interceptors": {},
		"gwang_scenery": null,
		"namsan_scenery": null
	}

	if is_instance_valid(main_scene):
		_build_authentic_seoul_landmarks(main_scene, state)

	if tree:
		tree.process_frame.connect(_on_pre_process.bind(state))
		RenderingServer.frame_pre_draw.connect(_on_pre_draw.bind(state))


# ============================================================================
# C. 광화문(경복궁·청와대·북악산·인왕산·북한산 삼각산 화강암 암벽 실경 파노라마) &
#    남산(N서울타워보다 확연히 낮은 보조 적백 송신타워·팔각정·봉수대·케이블카·성곽) 고증 3D 디테일 빌더
# ============================================================================
static func _build_authentic_seoul_landmarks(main_scene: Node, state: Dictionary) -> void:
	if main_scene.has_node("CheongungAuthenticLandmarks"):
		return
	var root = Node3D.new()
	root.name = "CheongungAuthenticLandmarks"
	main_scene.add_child(root)

	# 1. 광화문 스테이지 전용 고증 전경 노드 (뭉툭한 원뿔대 _cyl을 100% 배제하고 각진 화강암 다면체 슬랩으로 정밀 조각!)
	var gw_root = Node3D.new()
	gw_root.name = "GwanghwamunAuthenticScenery"
	root.add_child(gw_root)
	state["gwang_scenery"] = gw_root

	var mat_pine_near = StandardMaterial3D.new()
	mat_pine_near.albedo_color = Color("2d4228")
	mat_pine_near.roughness = 0.78

	var mat_pine_mid = StandardMaterial3D.new()
	mat_pine_mid.albedo_color = Color("263b34")
	mat_pine_mid.roughness = 0.82

	var mat_pine_far = StandardMaterial3D.new()
	mat_pine_far.albedo_color = Color("213038")
	mat_pine_far.roughness = 0.85

	var mat_granite = StandardMaterial3D.new()
	mat_granite.albedo_color = Color("c0c4c8")
	mat_granite.roughness = 0.52
	mat_granite.metallic = 0.12

	var mat_granite_lit = StandardMaterial3D.new()
	mat_granite_lit.albedo_color = Color("e8ecf0")
	mat_granite_lit.roughness = 0.45
	mat_granite_lit.metallic = 0.15
	mat_granite_lit.emission_enabled = true
	mat_granite_lit.emission = Color("dce5ed")
	mat_granite_lit.emission_energy_multiplier = 0.22

	var mat_granite_shadow = StandardMaterial3D.new()
	mat_granite_shadow.albedo_color = Color("767a80")
	mat_granite_shadow.roughness = 0.65

	var mat_cwd_blue = StandardMaterial3D.new()
	mat_cwd_blue.albedo_color = Color("19587a")
	mat_cwd_blue.roughness = 0.32
	mat_cwd_blue.metallic = 0.35
	mat_cwd_blue.emission_enabled = true
	mat_cwd_blue.emission = Color("1f6f99")
	mat_cwd_blue.emission_energy_multiplier = 0.28

	var mat_cwd_wall = StandardMaterial3D.new()
	mat_cwd_wall.albedo_color = Color("f0ece1")
	mat_cwd_wall.roughness = 0.45

	var mat_dancheong = StandardMaterial3D.new()
	mat_dancheong.albedo_color = Color("8c2d22")
	mat_dancheong.roughness = 0.55

	var mat_fortress = StandardMaterial3D.new()
	mat_fortress.albedo_color = Color("9e988c")
	mat_fortress.roughness = 0.72

	var mat_warm_gold = StandardMaterial3D.new()
	mat_warm_gold.albedo_color = Color("ffcf70")
	mat_warm_gold.emission_enabled = true
	mat_warm_gold.emission = Color("ffaa33")
	mat_warm_gold.emission_energy_multiplier = 2.4

	# [레이어 1 - 근경 좌측] 인왕산(338m) 화강암 바위 능선(기차바위·치마바위) 및 한양도성 성곽길
	var inwang = Node3D.new()
	inwang.position = Vector3(-34.0, 0.0, -72.0)
	gw_root.add_child(inwang)
	inwang.add_child(_box(Vector3(26.0, 18.0, 18.0), mat_pine_near, Vector3(0.0, 9.0, 0.0), Vector3(deg_to_rad(6.0), deg_to_rad(15.0), deg_to_rad(-8.0))))
	inwang.add_child(_box(Vector3(12.0, 11.0, 8.0), mat_granite, Vector3(2.5, 14.5, 3.5), Vector3(deg_to_rad(18.0), deg_to_rad(15.0), deg_to_rad(-12.0))))
	inwang.add_child(_box(Vector3(9.5, 9.0, 6.0), mat_granite_lit, Vector3(-3.5, 17.0, 1.5), Vector3(deg_to_rad(12.0), deg_to_rad(-10.0), deg_to_rad(14.0))))
	for wi in range(10):
		var wx = -8.0 + float(wi) * 3.2
		var wy = 10.5 + sin(float(wi) * 0.45) * 6.5
		inwang.add_child(_box(Vector3(3.4, 1.8, 0.9), mat_fortress, Vector3(wx, wy, 6.2), Vector3(0.0, 0.0, deg_to_rad(12.0))))
		inwang.add_child(_box(Vector3(3.4, 0.35, 1.0), mat_warm_gold, Vector3(wx, wy + 1.0, 6.2), Vector3(0.0, 0.0, deg_to_rad(12.0))))

	# [레이어 1.5 - 근경 중앙] 북악산(백악산 342m) 소나무 숲 능선 & 백악마루 화강암 바위
	var bugak = Node3D.new()
	bugak.position = Vector3(0.0, 0.0, -76.0)
	gw_root.add_child(bugak)
	bugak.add_child(_box(Vector3(32.0, 20.0, 22.0), mat_pine_near, Vector3(0.0, 10.0, 0.0), Vector3(deg_to_rad(4.0), 0.0, 0.0)))
	bugak.add_child(_box(Vector3(12.0, 12.0, 9.0), mat_granite, Vector3(0.0, 18.0, 1.5), Vector3(deg_to_rad(10.0), deg_to_rad(15.0), deg_to_rad(-6.0))))
	bugak.add_child(_box(Vector3(8.5, 8.0, 6.0), mat_granite_lit, Vector3(1.8, 21.0, 2.2), Vector3(deg_to_rad(14.0), deg_to_rad(22.0), deg_to_rad(-10.0))))

	# [레이어 2 - 중경 능선] 북한산 비봉·문수봉·보현봉 중첩 능선
	var mid_ridge = Node3D.new()
	mid_ridge.position = Vector3(0.0, 0.0, -94.0)
	gw_root.add_child(mid_ridge)
	var mid_peaks = [
		Vector3(-42.0, 15.0, 4.0),
		Vector3(-22.0, 19.5, 0.0),
		Vector3(18.0, 20.5, -2.0),
		Vector3(38.0, 16.5, 3.0)
	]
	for mp in mid_peaks:
		mid_ridge.add_child(_box(Vector3(24.0, 18.0, 16.0), mat_pine_mid, Vector3(mp.x, mp.y, mp.z), Vector3(deg_to_rad(8.0), deg_to_rad(14.0), deg_to_rad(-5.0))))
		mid_ridge.add_child(_box(Vector3(10.0, 9.0, 7.0), mat_granite_shadow, Vector3(mp.x, mp.y + 7.5, mp.z + 1.5), Vector3(deg_to_rad(15.0), deg_to_rad(25.0), deg_to_rad(10.0))))

	# [레이어 3 - 원경 최고봉] 북한산 삼각산(백운대 836m · 인수봉 810m · 만경대 799m · 노적봉) 거대 화강암 암벽 파노라마!
	var bukhan = Node3D.new()
	bukhan.position = Vector3(2.0, 0.0, -118.0)
	gw_root.add_child(bukhan)

	# 1) 북한산 기저부 짙은 소나무림 산림 베이스
	for f_i in range(8):
		var fx = -48.0 + float(f_i) * 14.0
		var fy = 8.0 + sin(float(f_i) * 0.8) * 3.5
		bukhan.add_child(_box(Vector3(18.0, 14.0, 16.0), mat_pine_far, Vector3(fx, fy, float(f_i % 3) * 2.0), Vector3(deg_to_rad(8.0), deg_to_rad(12.0 * float(f_i)), deg_to_rad(4.0))))

	# 2) 백운대(Baegundae 836m 중앙 주봉) — 웅장한 백색 화강암 돔(Rock Dome)과 단애 절벽
	var baegundae = Node3D.new()
	baegundae.position = Vector3(-3.5, 14.0, 0.0)
	bukhan.add_child(baegundae)
	baegundae.add_child(_box(Vector3(16.0, 18.0, 12.0), mat_granite, Vector3(0.0, 9.0, 0.0), Vector3(deg_to_rad(12.0), deg_to_rad(15.0), deg_to_rad(-8.0))))
	baegundae.add_child(_box(Vector3(13.0, 16.0, 10.0), mat_granite_lit, Vector3(-1.8, 14.5, 1.2), Vector3(deg_to_rad(16.0), deg_to_rad(-10.0), deg_to_rad(12.0))))
	baegundae.add_child(_box(Vector3(9.5, 12.0, 8.0), mat_granite_lit, Vector3(1.2, 20.0, 0.5), Vector3(deg_to_rad(-10.0), deg_to_rad(22.0), deg_to_rad(-14.0))))
	baegundae.add_child(_box(Vector3(5.5, 7.5, 5.0), mat_granite_lit, Vector3(0.0, 24.5, 0.2), Vector3(deg_to_rad(6.0), deg_to_rad(8.0), deg_to_rad(-5.0))))

	# 3) 인수봉(Insubong 810m 우측 최고 수직 암벽) — 깎아지른 순백 화강암 거벽(Sheer Vertical Monolith)
	var insubong = Node3D.new()
	insubong.position = Vector3(16.0, 13.5, -4.0)
	bukhan.add_child(insubong)
	insubong.add_child(_box(Vector3(12.0, 22.0, 10.0), mat_granite, Vector3(0.0, 11.0, 0.0), Vector3(deg_to_rad(8.0), deg_to_rad(-18.0), deg_to_rad(6.0))))
	insubong.add_child(_box(Vector3(9.0, 19.0, 8.0), mat_granite_lit, Vector3(-0.6, 15.0, 1.0), Vector3(deg_to_rad(4.0), deg_to_rad(12.0), deg_to_rad(-7.0))))
	insubong.add_child(_box(Vector3(6.5, 14.0, 6.0), mat_granite_lit, Vector3(0.5, 21.0, 0.5), Vector3(deg_to_rad(10.0), deg_to_rad(-14.0), deg_to_rad(9.0))))
	insubong.add_child(_box(Vector3(3.8, 8.0, 3.8), mat_granite_lit, Vector3(0.0, 25.0, 0.0), Vector3(deg_to_rad(-6.0), deg_to_rad(5.0), deg_to_rad(-4.0))))

	# 4) 만경대(Mangyeongdae 799m 좌측 암릉) — 톱니바퀴형 기암괴석 피너클(Sawtooth Pinnacles)
	var mangyeong = Node3D.new()
	mangyeong.position = Vector3(-21.0, 12.0, 2.0)
	bukhan.add_child(mangyeong)
	for m_i in range(5):
		var mx = -7.0 + float(m_i) * 3.8
		var my = 12.0 + float(m_i % 2) * 3.5
		var m_mat = mat_granite_lit if (m_i % 2 == 0) else mat_granite_shadow
		mangyeong.add_child(_box(Vector3(5.2, 11.0, 4.8), m_mat, Vector3(mx, my, float(m_i) * 0.5), Vector3(deg_to_rad(14.0), deg_to_rad(15.0 * float(m_i)), deg_to_rad(-16.0 + float(m_i) * 8.0))))
		mangyeong.add_child(_box(Vector3(2.8, 6.0, 2.8), mat_granite_lit, Vector3(mx, my + 6.0, float(m_i) * 0.5), Vector3(deg_to_rad(-8.0), deg_to_rad(12.0), deg_to_rad(10.0))))

	# 5) 노적봉(Nojeokbong 716m 중앙 전면 거대 암괴)
	var nojeok = Node3D.new()
	nojeok.position = Vector3(-8.0, 9.0, 8.0)
	bukhan.add_child(nojeok)
	nojeok.add_child(_box(Vector3(14.0, 12.0, 10.0), mat_granite_lit, Vector3(0.0, 6.0, 0.0), Vector3(deg_to_rad(15.0), deg_to_rad(8.0), deg_to_rad(-12.0))))
	nojeok.add_child(_box(Vector3(10.0, 9.0, 7.5), mat_granite, Vector3(1.5, 10.5, -0.5), Vector3(deg_to_rad(-10.0), deg_to_rad(-15.0), deg_to_rad(14.0))))

	var cliff_sun = OmniLight3D.new()
	cliff_sun.light_color = Color("ffbb88")
	cliff_sun.light_energy = 5.5
	cliff_sun.omni_range = 75.0
	cliff_sun.position = Vector3(0.0, 44.0, -100.0)
	gw_root.add_child(cliff_sun)

	# [청와대(Blue House) 고증 건축물 보강]
	var cwd_root = Node3D.new()
	cwd_root.position = Vector3(0.0, 5.2, -56.0)
	gw_root.add_child(cwd_root)
	cwd_root.add_child(_box(Vector3(16.0, 1.2, 7.0), mat_granite, Vector3(0.0, 0.6, 0.0)))
	cwd_root.add_child(_box(Vector3(13.5, 3.2, 5.4), mat_cwd_wall, Vector3(0.0, 2.8, 0.0)))
	for col_i in range(7):
		var col_x = -5.4 + float(col_i) * 1.8
		cwd_root.add_child(_cyl(0.22, 0.24, 3.2, mat_cwd_wall, Vector3(col_x, 2.8, 2.75)))
	cwd_root.add_child(_box(Vector3(15.2, 0.45, 6.4), mat_dancheong, Vector3(0.0, 4.5, 0.0)))
	cwd_root.add_child(_cyl(4.8, 9.2, 1.8, mat_cwd_blue, Vector3(0.0, 5.5, 0.0), Vector3(0.0, PI * 0.25, 0.0)))
	cwd_root.add_child(_box(Vector3(9.6, 1.8, 4.2), mat_cwd_wall, Vector3(0.0, 6.2, 0.0)))
	cwd_root.add_child(_cyl(3.2, 6.4, 1.6, mat_cwd_blue, Vector3(0.0, 7.6, 0.0), Vector3(0.0, PI * 0.25, 0.0)))
	for side_s in [-1.0, 1.0]:
		var wing = Node3D.new()
		wing.position = Vector3(side_s * 11.5, -0.4, 1.2)
		cwd_root.add_child(wing)
		wing.add_child(_box(Vector3(6.8, 2.4, 4.2), mat_cwd_wall, Vector3(0.0, 1.2, 0.0)))
		wing.add_child(_cyl(2.6, 4.8, 1.3, mat_cwd_blue, Vector3(0.0, 3.0, 0.0), Vector3(0.0, PI * 0.25, 0.0)))
	var cwd_light = OmniLight3D.new()
	cwd_light.light_color = Color("bfeaff")
	cwd_light.light_energy = 4.2
	cwd_light.omni_range = 28.0
	cwd_light.position = Vector3(0.0, 6.5, 4.5)
	cwd_root.add_child(cwd_light)

	for hx in [-7.2, 7.2]:
		var haechi = Node3D.new()
		haechi.position = Vector3(hx, 0.0, -23.5)
		gw_root.add_child(haechi)
		haechi.add_child(_box(Vector3(1.1, 0.9, 1.4), mat_granite, Vector3(0.0, 0.45, 0.0)))
		haechi.add_child(_box(Vector3(0.75, 1.05, 1.05), mat_granite_lit, Vector3(0.0, 1.35, 0.0)))
		haechi.add_child(_sphere(0.45, mat_granite_lit, Vector3(0.0, 2.05, 0.25)))


	# ========================================================================
	# 2. 남산 스테이지 전용 고증 전경 노드 (N서울타워보다 확연히 낮은 송신철탑·팔각정·봉수대·케이블카·성곽)
	# ========================================================================
	var ns_root = Node3D.new()
	ns_root.name = "NamsanAuthenticScenery"
	root.add_child(ns_root)
	state["namsan_scenery"] = ns_root

	var mat_tower_red = StandardMaterial3D.new()
	mat_tower_red.albedo_color = Color("d92b2b")
	mat_tower_red.roughness = 0.35
	mat_tower_red.metallic = 0.65
	mat_tower_red.emission_enabled = true
	mat_tower_red.emission = Color("ff3322")
	mat_tower_red.emission_energy_multiplier = 0.35

	var mat_tower_white = StandardMaterial3D.new()
	mat_tower_white.albedo_color = Color("f4f6fa")
	mat_tower_white.roughness = 0.30
	mat_tower_white.metallic = 0.65
	mat_tower_white.emission_enabled = true
	mat_tower_white.emission = Color("ffffff")
	mat_tower_white.emission_energy_multiplier = 0.25

	var mat_beacon_red = StandardMaterial3D.new()
	mat_beacon_red.albedo_color = Color("ff1100")
	mat_beacon_red.emission_enabled = true
	mat_beacon_red.emission = Color("ff2200")
	mat_beacon_red.emission_energy_multiplier = 7.5
	mat_beacon_red.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var tower_pos = Vector3(0.0, 15.0, -32.0)
	for mi in main_scene.find_children("*", "MeshInstance3D", true, false):
		if mi is MeshInstance3D and mi.global_position.y > 14.0 and mi.global_position.z < -12.0 and absf(mi.global_position.x) < 12.0:
			tower_pos = Vector3(mi.global_position.x, 14.5, mi.global_position.z)
			break

	# ① 남산 보조 송신철탑(KBS/통합방송 적백 격자 송신타워) — N서울타워보다 확연히 낮게(남산타워 높이의 약 40%) 건립!
	var tx_tower = Node3D.new()
	tx_tower.name = "NamsanBroadcastLatticeTower"
	tx_tower.position = tower_pos + Vector3(6.5, -3.2, 1.2)
	ns_root.add_child(tx_tower)

	# 송신국 기단 콘크리트 건물 (저상 구조)
	tx_tower.add_child(_box(Vector3(2.8, 1.0, 2.8), mat_granite, Vector3(0.0, 0.5, 0.0)))
	# 4단 적백(Red/White) 사각 트러스 철탑 기둥 (단당 1.1m -> 4.4m, 남산타워보다 확연히 낮은 아담한 고증 높이)
	var tier_h = 1.1
	for ti in range(4):
		var t_mat = mat_tower_red if (ti % 2 == 0) else mat_tower_white
		var y0 = 1.0 + float(ti) * tier_h
		var w0 = lerpf(0.95, 0.32, float(ti) / 4.0)
		var w1 = lerpf(0.95, 0.32, float(ti + 1) / 4.0)
		var wm = (w0 + w1) * 0.5
		for cx in [-1.0, 1.0]:
			for cz in [-1.0, 1.0]:
				tx_tower.add_child(_cyl(0.05, 0.07, tier_h + 0.05, t_mat, Vector3(cx * wm, y0 + tier_h * 0.5, cz * wm)))
		tx_tower.add_child(_box(Vector3(w1 * 2.05, 0.06, w1 * 2.05), t_mat, Vector3(0.0, y0 + tier_h, 0.0)))
		tx_tower.add_child(_box(Vector3(wm * 2.08, 0.05, 0.05), t_mat, Vector3(0.0, y0 + tier_h * 0.5, wm), Vector3(0.0, 0.0, deg_to_rad(32.0))))
		tx_tower.add_child(_box(Vector3(wm * 2.08, 0.05, 0.05), t_mat, Vector3(0.0, y0 + tier_h * 0.5, -wm), Vector3(0.0, 0.0, deg_to_rad(-32.0))))
		if ti == 1 or ti == 2:
			for dx in [-1.0, 1.0]:
				tx_tower.add_child(_cyl(0.28, 0.08, 0.12, mat_tower_white, Vector3(dx * (w1 + 0.22), y0 + tier_h * 0.65, 0.15), Vector3(PI * 0.5, 0.0, 0.0)))

	# 상단 첨탑 마스트(1.6m) 및 적색 항공장애등 (총고 7.0m, 지표 상대고 tower_pos.y + 3.8m로 남산타워보다 확연히 낮음)
	var top_y = 1.0 + 4.0 * tier_h
	tx_tower.add_child(_cyl(0.03, 0.08, 1.6, mat_tower_white, Vector3(0.0, top_y + 0.8, 0.0)))
	tx_tower.add_child(_sphere(0.16, mat_beacon_red, Vector3(0.0, top_y + 1.65, 0.0)))
	tx_tower.add_child(_sphere(0.12, mat_beacon_red, Vector3(-0.55, top_y - 0.8, 0.55)))
	tx_tower.add_child(_sphere(0.12, mat_beacon_red, Vector3(0.55, top_y - 0.8, 0.55)))

	# ② 남산 팔각정 & 남산 봉수대
	var palgak = Node3D.new()
	palgak.position = tower_pos + Vector3(-4.2, -0.6, 2.2)
	ns_root.add_child(palgak)
	palgak.add_child(_cyl(1.6, 1.8, 0.6, mat_granite, Vector3(0.0, 0.3, 0.0)))
	palgak.add_child(_cyl(1.2, 1.2, 1.4, mat_dancheong, Vector3(0.0, 1.2, 0.0)))
	palgak.add_child(_cyl(0.2, 2.1, 1.1, mat_cwd_blue, Vector3(0.0, 2.2, 0.0)))
	palgak.add_child(_sphere(0.22, mat_warm_gold, Vector3(0.0, 1.4, 1.25)))

	for bi in range(5):
		var bx = -9.5 - float(bi) * 1.35
		var by = -1.2 - float(bi) * 0.25
		var bongsu = Node3D.new()
		bongsu.position = tower_pos + Vector3(bx, by, 3.2)
		ns_root.add_child(bongsu)
		bongsu.add_child(_cyl(0.45, 0.68, 1.1, mat_fortress, Vector3(0.0, 0.55, 0.0)))
		bongsu.add_child(_sphere(0.20, mat_warm_gold, Vector3(0.0, 1.2, 0.0)))

	# ③ 남산 케이블카 상부 승강장 & 한양도성 성곽길
	var cable_st = Node3D.new()
	cable_st.position = tower_pos + Vector3(-14.5, -3.5, 4.5)
	ns_root.add_child(cable_st)
	cable_st.add_child(_box(Vector3(3.2, 1.8, 2.4), mat_cwd_wall, Vector3(0.0, 0.9, 0.0)))
	cable_st.add_child(_box(Vector3(2.8, 0.6, 0.2), mat_warm_gold, Vector3(0.0, 1.1, 1.22)))
	for nwi in range(12):
		var nwx = -16.0 + float(nwi) * 2.8
		var nwy = -2.8 + sin(float(nwi) * 0.35) * 2.2
		ns_root.add_child(_box(Vector3(2.9, 1.2, 0.7), mat_fortress, tower_pos + Vector3(nwx, nwy, 5.2)))
		ns_root.add_child(_box(Vector3(2.9, 0.25, 0.8), mat_warm_gold, tower_pos + Vector3(nwx, nwy + 0.7, 5.2)))


static func _detect_is_namsan(main_scene: Node, launcher: Node3D) -> bool:
	if not is_instance_valid(main_scene):
		return false
	for p_info in main_scene.get_property_list():
		var pname = str(p_info["name"])
		var plower = pname.to_lower()
		if plower.ends_with("s") or plower == "script":
			continue
		var raw_v = main_scene.get(pname)
		if typeof(raw_v) == TYPE_STRING or typeof(raw_v) == TYPE_STRING_NAME:
			var sv = str(raw_v).to_lower()
			if "gwang" in sv or "광화" in sv or "palace" in sv or "sejong" in sv:
				return false
			if "namsan" in sv or "남산" in sv or "tower" in sv or "river" in sv:
				return true
		elif raw_v is Dictionary and ("stage" in plower or "map" in plower or "scene" in plower or "location" in plower):
			var dstr = str(raw_v).to_lower()
			if "gwang" in dstr or "광화" in dstr:
				return false
			if "namsan" in dstr or "남산" in dstr:
				return true
	var has_han_river = false
	var has_high_tower = false
	for ch in main_scene.find_children("*", "Node3D", true, false):
		if not (ch is Node3D) or not ch.is_visible_in_tree():
			continue
		if ch.name.begins_with("Cheongung") or ch.name.begins_with("GwanghwamunAuthentic") or ch.name.begins_with("NamsanAuthentic"):
			continue
		var cn = (ch.name + " " + ch.scene_file_path).to_lower()
		if "gwang" in cn or "광화" in cn or "palace" in cn or "sejong" in cn or "gyeongbok" in cn or "statue" in cn:
			return false
		if "namsan" in cn or "남산" in cn:
			return true
		if ch is MeshInstance3D and is_instance_valid(ch.mesh):
			var gpos = ch.global_position
			var aabb = ch.get_aabb()
			var wmax = maxf(aabb.size.x, aabb.size.z)
			if gpos.y > 16.5 and gpos.z < -12.0 and absf(gpos.x) < 12.0:
				has_high_tower = true
			if wmax > 22.0 and gpos.y < 1.5 and gpos.z < -3.0 and gpos.z > -22.0:
				var m = ch.get_active_material(0)
				if m is StandardMaterial3D and m.albedo_color.b > m.albedo_color.r * 1.25:
					has_han_river = true
	if has_han_river or has_high_tower:
		return true
	return false


static func _on_scene_node_added(node: Node, state: Dictionary) -> void:
	if not (node is Node3D) or not is_instance_valid(node):
		return
	if node.name.begins_with("Cheongung") or node.name.begins_with("GwanghwamunAuthentic") or node.name.begins_with("NamsanAuthentic"):
		return
	var launcher = state.get("launcher")
	if is_instance_valid(launcher) and (node == launcher or launcher.is_ancestor_of(node)):
		return
	if not state.has("pending_nodes"):
		state["pending_nodes"] = []
	state["pending_nodes"].append({"node": node, "frames": 0})


# 엔진 기본 투사체/연기를 scale=0, visible=false, 지하 격리로 100% 완전 박멸
static func _hide_engine_projectile_visuals(node: Node3D) -> void:
	if not is_instance_valid(node):
		return
	var nname = node.name.to_lower()
	if "label" in nname or "text" in nname or "word" in nname:
		return
	node.visible = false
	node.scale = Vector3.ZERO
	node.global_position = Vector3(0, -9999, 0)
	for ch in node.find_children("*", "Node", true, false):
		var cn = ch.name.to_lower()
		if "label" in cn or "text" in cn or "word" in cn:
			continue
		if ch is VisualInstance3D:
			ch.visible = false
		if ch is CPUParticles3D or ch is GPUParticles3D:
			ch.emitting = false
			ch.visible = false
		if ch is Node3D:
			ch.scale = Vector3.ZERO
			ch.visible = false


static func _animate_radar_wave(w_ring: MeshInstance3D, w_mat: StandardMaterial3D, delay_sec: float) -> void:
	var tw = w_ring.create_tween().set_loops()
	if delay_sec > 0.0:
		tw.tween_interval(delay_sec)
	tw.tween_callback(func():
		w_ring.position = Vector3(0.0, 4.2, 0.8)
		w_ring.scale = Vector3(0.5, 1.0, 0.5)
		w_mat.albedo_color.a = 0.85
	)
	tw.tween_property(w_ring, "position", Vector3(0.0, 18.0, -6.5), 1.8)
	tw.parallel().tween_property(w_ring, "scale", Vector3(14.0, 1.0, 14.0), 1.8)
	tw.parallel().tween_property(w_mat, "albedo_color:a", 0.0, 1.8)


static func _build_strobe(parent: Node3D, pos: Vector3, mat_base: Material, mat_on: Material, mat_off: Material, is_red: bool, list: Array) -> void:
	parent.add_child(_cyl(0.12, 0.14, 0.08, mat_base, pos))
	var dome = _cyl(0.09, 0.11, 0.18, mat_off, pos + Vector3(0.0, 0.12, 0.0))
	parent.add_child(dome)

	var light = OmniLight3D.new()
	light.light_color = Color("ff2200") if is_red else Color("ff9900")
	light.light_energy = 0.0
	light.omni_range = 15.0
	light.position = pos + Vector3(0.0, 0.26, 0.0)
	parent.add_child(light)

	var rotor = Node3D.new()
	rotor.position = pos + Vector3(0.0, 0.14, 0.0)
	if is_red:
		rotor.rotation.y = PI
	parent.add_child(rotor)

	var cone_mat = StandardMaterial3D.new()
	cone_mat.albedo_color = Color(1.0, 0.18, 0.05, 0.30) if is_red else Color(1.0, 0.62, 0.05, 0.30)
	cone_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	cone_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	cone_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	rotor.add_child(_cyl(0.90, 0.06, 3.4, cone_mat, Vector3(0.0, 0.0, 1.75), Vector3(PI * 0.5, 0.0, 0.0)))
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
		pod_rack.global_position = rack.global_position + Vector3(0.0, 4.8, 0.0)
		pod_rack.rotation = Vector3(deg_to_rad(89.0), 0.0, 0.0)


static func _on_pre_draw(state: Dictionary) -> void:
	var chassis = state["chassis"]
	if not is_instance_valid(chassis):
		return
	var launcher = state["launcher"]
	var main_scene = state.get("main")
	var delta = chassis.get_process_delta_time()
	var t = float(state["time"]) + delta
	state["time"] = t

	if not state.has("node_hooked") and chassis.get_tree():
		state["node_hooked"] = true
		state["pending_nodes"] = []
		state["hidden_projectiles"] = {}
		state["doglegs"] = []
		state["last_dogleg_time"] = -10.0
		chassis.get_tree().node_added.connect(_on_scene_node_added.bind(state))

	# 1. 스테이지(광화문 vs 남산) 감지 및 차량 위치(광화문 ±8.80 대칭)·스케일(남산 0.46) 동기화
	if is_instance_valid(launcher) and is_instance_valid(main_scene):
		if t - float(state["stage_chk_t"]) >= 0.20:
			state["stage_chk_t"] = t
			state["is_namsan"] = _detect_is_namsan(main_scene, launcher)
		var is_namsan = bool(state["is_namsan"])
		launcher.scale = Vector3(0.46, 0.46, 0.46) if is_namsan else Vector3(1.0, 1.0, 1.0)

		var mfr_node = state.get("mfr")
		var ecs_node = state.get("ecs")
		if is_instance_valid(mfr_node):
			mfr_node.position = Vector3(-9.60 if is_namsan else -8.80, 0.08, -0.25)
			mfr_node.rotation.y = deg_to_rad(45.0 if is_namsan else 28.0)
		if is_instance_valid(ecs_node):
			ecs_node.position = Vector3(9.60 if is_namsan else 8.80, 0.08, -0.25)
			ecs_node.rotation.y = deg_to_rad(-45.0 if is_namsan else -28.0)

		var gw_sc = state.get("gwang_scenery")
		var ns_sc = state.get("namsan_scenery")
		if is_instance_valid(gw_sc):
			gw_sc.visible = not is_namsan
		if is_instance_valid(ns_sc):
			ns_sc.visible = is_namsan

	chassis.rotation = Vector3(0.0, PI * 0.5, 0.0)
	var pod_rack = state["pod_rack"]
	var rack = state["rack"]
	if is_instance_valid(pod_rack) and is_instance_valid(rack):
		pod_rack.visible = false
		pod_rack.global_position = rack.global_position + Vector3(0.0, 4.8, 0.0)
		pod_rack.rotation = Vector3(deg_to_rad(89.0), 0.0, 0.0)

	if not is_instance_valid(main_scene):
		return

	# 2. 적 미사일(threats) 및 아군 발사체(active_int_nodes) 전방위 수집
	var threats = []
	var active_int_nodes = []
	_collect_missiles_and_interceptors(main_scene, launcher, threats, active_int_nodes)

	var has_threats = threats.size() > 0
	if threats.size() > int(state["prev_threats"]):
		state["siren_timer"] = 2.6
	state["prev_threats"] = threats.size()

	# 비상 경광등 6기 점멸
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
			l.light_energy = 12.0 if on_now else 1.0
			d.material_override = sb["mat_on"] if on_now else sb["mat_off"]
			r.visible = true
			r.rotation.y += delta * 12.0
		else:
			l.light_energy = 0.0
			d.material_override = sb["mat_off"]
			r.visible = false

	# 방공 사이렌
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

	# 3. [핵심] 엔진 기본 곡사 미사일 및 연기/궤적 100% 박멸 (scale=0, visible=false, 지하 이동)
	var orig_missile = main_scene.get("_missile_node")
	var orig_smoke = main_scene.get("_missile_smoke_node")
	if is_instance_valid(orig_smoke):
		orig_smoke.visible = false
		orig_smoke.scale = Vector3.ZERO
		orig_smoke.global_position = Vector3(0, -9999, 0)
	if is_instance_valid(orig_missile):
		_hide_engine_projectile_visuals(orig_missile)
		orig_missile.scale = Vector3.ZERO
		orig_missile.global_position = Vector3(0, -9999, 0)

	var pending = state.get("pending_nodes", [])
	var still_pending = []
	if pending.size() > 0:
		var ch_gpos = chassis.global_position
		for item in pending:
			var pnode = item["node"]
			var fcnt = int(item["frames"]) + 1
			if is_instance_valid(pnode) and pnode is Node3D:
				var d_l = pnode.global_position.distance_to(ch_gpos)
				var dy = pnode.global_position.y - ch_gpos.y
				if d_l < 18.0 and dy > -1.5 and dy < 11.0 and pnode.global_position.length_squared() > 0.001:
					_hide_engine_projectile_visuals(pnode)
					state["hidden_projectiles"][pnode.get_instance_id()] = pnode
					if t - float(state.get("last_dogleg_time", -10.0)) > 0.10:
						state["last_dogleg_time"] = t
						_spawn_dogleg_cold_launch(main_scene, state, threats, pnode)
				elif fcnt < 5:
					still_pending.append({"node": pnode, "frames": fcnt})
		state["pending_nodes"] = still_pending

	var hidden_map = state.get("hidden_projectiles", {})
	for inode in active_int_nodes:
		if is_instance_valid(inode):
			var iid = inode.get_instance_id()
			_hide_engine_projectile_visuals(inode)
			if not hidden_map.has(iid):
				hidden_map[iid] = inode
				if t - float(state.get("last_dogleg_time", -10.0)) > 0.10:
					state["last_dogleg_time"] = t
					_spawn_dogleg_cold_launch(main_scene, state, threats, inode)

	for hid in hidden_map.keys():
		var hnode = hidden_map[hid]
		if is_instance_valid(hnode):
			_hide_engine_projectile_visuals(hnode)
		else:
			hidden_map.erase(hid)

	# 4. main.gd _missile_flight 프로퍼티 기반 단일 발사 연동
	var flight = main_scene.get("_missile_flight")
	if flight is Dictionary and not flight.is_empty():
		var elapsed = float(flight.get("elapsed", 0.0))
		if not bool(state["flight_active"]) or elapsed < float(state["prev_flight_elapsed"]) - 0.001:
			state["flight_active"] = true
			if t - float(state.get("last_dogleg_time", -10.0)) > 0.10:
				state["last_dogleg_time"] = t
				var dummy_tgt = Node3D.new()
				dummy_tgt.name = "CheongungTargetLockRing"
				main_scene.add_child(dummy_tgt)
				dummy_tgt.global_position = flight.get("target", chassis.global_position + Vector3(0.0, 9.0, -15.0))
				_spawn_dogleg_cold_launch(main_scene, state, threats, dummy_tgt)
				dummy_tgt.queue_free()
		state["prev_flight_elapsed"] = elapsed
	else:
		state["flight_active"] = false

	# 레이더 락온 링 동기화
	var lock_rings = state["lock_rings"]
	var active_t_ids = {}
	for m_node in threats:
		var tid = m_node.get_instance_id()
		active_t_ids[tid] = true
		if not lock_rings.has(tid):
			lock_rings[tid] = _create_target_lock_rings(main_scene)
		var h_node = lock_rings[tid]
		if is_instance_valid(h_node):
			h_node.global_position = m_node.global_position
			var s_pulse = 0.85 + 0.35 * (0.5 + 0.5 * sin(t * 7.5))
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
				if old_h.global_position.y > 2.0:
					if t - float(state.get("last_dogleg_time", -10.0)) > 0.16:
						state["last_dogleg_time"] = t
						_spawn_dogleg_cold_launch(main_scene, state, [], old_h)
					_spawn_interception_explosion(main_scene, old_h.global_position)
				old_h.queue_free()
			lock_rings.erase(tid)

	# 5. 활성 직각 콜드런치(Dogleg Cold-Launch) 단일 미사일 프레임 업데이트
	var doglegs = state.get("doglegs", [])
	var remaining_doglegs = []
	for dl in doglegs:
		if _update_dogleg_missile(main_scene, dl, delta):
			remaining_doglegs.append(dl)
	state["doglegs"] = remaining_doglegs


static func _spawn_dogleg_cold_launch(main_scene: Node, state: Dictionary, threats: Array, eng_node: Node3D) -> void:
	var muzzles = state["muzzles"]
	var chassis = state["chassis"]
	var launcher = state["launcher"]
	var is_namsan = bool(state["is_namsan"])
	var l_scale = 0.46 if is_namsan else 1.0

	var m_pos = chassis.global_position + Vector3(0.0, 5.2 * l_scale, 0.0)
	if muzzles.size() > 0:
		var idx = int(state["next_tube"]) % muzzles.size()
		state["next_tube"] = idx + 1
		if is_instance_valid(muzzles[idx]):
			m_pos = muzzles[idx].global_position

	var rise_h = 4.0 if is_namsan else 6.5
	var apex_pos = m_pos + Vector3(0.0, rise_h, 0.0)

	var tgt_node = null
	var tgt_pos = apex_pos + Vector3(0.0, 5.0, -16.0)
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

	var m_scale = 0.58 if is_namsan else 0.95
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
	elif is_instance_valid(eng_node) and eng_node.name != "CheongungTargetLockRing" and eng_node.global_position.distance_to(m_pos) > 4.5:
		dl["target_pos"] = eng_node.global_position
	var target_pos = dl["target_pos"]

	if age < 0.28:
		# [1단계: 90° 완전 수직 사출 (0.00s ~ 0.28s)]
		var u1 = clampf(age / 0.28, 0.0, 1.0)
		var ease_u1 = 1.0 - pow(1.0 - u1, 2.8)
		m_node.global_position = Vector3(m_pos.x, lerpf(m_pos.y, apex_pos.y, ease_u1), m_pos.z)
		_orient_missile_along(m_node, Vector3.UP)
		return true

	elif age < 0.44:
		# [2단계: 공중 정점(apex_pos) 호버링 정지 & 측면 추력기(DACS) 4방향 폭발로 기수 90° 직각 꺾기! (0.28s ~ 0.44s)]
		var aim_dir = (target_pos - apex_pos).normalized()
		if aim_dir.length_squared() < 0.01:
			aim_dir = Vector3(0.0, 0.4, -0.9).normalized()
		if not bool(dl["dacs_done"]):
			dl["dacs_done"] = true
			_spawn_dacs_side_thrusters(main_scene, apex_pos, m_scale)
		m_node.global_position = apex_pos
		var u2 = clampf((age - 0.28) / 0.16, 0.0, 1.0)
		var snap_u = 1.0 - pow(1.0 - u2, 3.2)
		var cur_dir = Vector3.UP.lerp(aim_dir, snap_u).normalized()
		_orient_missile_along(m_node, cur_dir)
		return true

	elif age < 0.75:
		# [3단계: 주 로켓 모터 공중 점화 폭풍 링 & 표적까지 곡률 0% 일직선(직사) 초음속 타격! (0.44s ~ 0.75s)]
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

		var u3 = clampf((age - 0.44) / 0.31, 0.0, 1.0)
		var accel_u3 = u3 * u3
		var cur_pos = apex_pos.lerp(target_pos, accel_u3)
		m_node.global_position = cur_pos
		_orient_missile_along(m_node, aim_dir)

		var tr = float(dl["trail_timer"]) + delta
		if tr >= 0.018:
			tr = 0.0
			_spawn_smoke_puff(main_scene, cur_pos)
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
	_upgrade_interceptor_mesh(root, mat_body)
	return root


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

	for prop_name in ["interceptors","active_interceptors","shots","rockets","projectiles","_missile_node","missiles"]:
		var raw_i = main_scene.get(prop_name)
		if raw_i is Array:
			for item in raw_i:
				var n = _find_node3d(item)
				if is_instance_valid(n) and not seen_t.has(n.get_instance_id()) and not seen_i.has(n.get_instance_id()):
					seen_i[n.get_instance_id()] = true
					interceptors.append(n)
		else:
			var n_single = _find_node3d(raw_i)
			if is_instance_valid(n_single) and n_single.visible and not seen_t.has(n_single.get_instance_id()) and not seen_i.has(n_single.get_instance_id()):
				seen_i[n_single.get_instance_id()] = true
				interceptors.append(n_single)

	for p_info in main_scene.get_property_list():
		var pname = str(p_info["name"])
		if pname == "missiles" or pname == "vehicle_templates" or pname == "models":
			continue
		var val = main_scene.get(pname)
		if val is Array and val.size() > 0:
			for item in val:
				var n = _find_node3d(item)
				if is_instance_valid(n) and n != launcher and not launcher.is_ancestor_of(n) and not n.name.begins_with("Cheongung"):
					var nid = n.get_instance_id()
					if not seen_t.has(nid) and not seen_i.has(nid):
						if "intercept" in n.name.to_lower() or "rocket" in n.name.to_lower() or "missile" in n.name.to_lower() or "shot" in n.name.to_lower() or n.global_position.distance_to(launcher.global_position) < 22.0:
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
	t1.outer_radius = 1.02
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
	t2.inner_radius = 1.35
	t2.outer_radius = 1.48
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
	mat.albedo_color = Color(0.0, 0.96, 1.0, 0.70)
	mat.emission_enabled = true
	mat.emission = Color("00f5ff")
	mat.emission_energy_multiplier = 5.0
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var pivot = Node3D.new()
	pivot.name = "CheongungLockBeam"
	main_scene.add_child(pivot)
	pivot.global_position = (p0 + p1) * 0.5
	pivot.look_at(p1, Vector3.UP)
	pivot.add_child(_cyl(0.07, 0.16, d, mat, Vector3.ZERO, Vector3(PI * 0.5, 0.0, 0.0)))

	var tw = pivot.create_tween()
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.26)
	tw.tween_callback(pivot.queue_free)


static func _spawn_straight_contrail_beam(main_scene: Node, p0: Vector3, p1: Vector3, m_scale: float = 1.0) -> void:
	var d = p0.distance_to(p1)
	if d < 0.5:
		return
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.95, 0.98, 1.0, 0.78)
	mat.emission_enabled = true
	mat.emission = Color("ffddaa")
	mat.emission_energy_multiplier = 2.8
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var pivot = Node3D.new()
	pivot.name = "CheongungStraightTrail"
	main_scene.add_child(pivot)
	pivot.global_position = (p0 + p1) * 0.5
	pivot.look_at(p1, Vector3.UP)
	pivot.add_child(_cyl(0.09 * m_scale, 0.16 * m_scale, d, mat, Vector3.ZERO, Vector3(PI * 0.5, 0.0, 0.0)))

	var tw = pivot.create_tween()
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.55)
	tw.tween_callback(pivot.queue_free)


static func _upgrade_interceptor_mesh(i_node: Node3D, mat_body: Material) -> void:
	if i_node.has_node("CheongungBody"):
		return
	var root = Node3D.new()
	root.name = "CheongungBody"
	i_node.add_child(root)

	var mat_w = StandardMaterial3D.new()
	mat_w.albedo_color = Color("f5f8fc")
	mat_w.emission_enabled = true
	mat_w.emission = Color("dceeff")
	mat_w.emission_energy_multiplier = 0.65
	var mat_r = StandardMaterial3D.new()
	mat_r.albedo_color = Color("e62e1f")
	mat_r.emission_enabled = true
	mat_r.emission = Color("ff3b28")
	mat_r.emission_energy_multiplier = 2.2

	root.add_child(_cyl(0.0, 0.15, 0.65, mat_w, Vector3(0.0, 0.0, -1.25), Vector3(PI * 0.5, 0.0, 0.0)))
	root.add_child(_cyl(0.155, 0.155, 0.28, mat_r, Vector3(0.0, 0.0, -0.80), Vector3(PI * 0.5, 0.0, 0.0)))
	root.add_child(_cyl(0.15, 0.15, 1.70, mat_w, Vector3(0.0, 0.0, 0.15), Vector3(PI * 0.5, 0.0, 0.0)))
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


static func _spawn_cold_launch_fx(main_scene: Node, m_pos: Vector3, apex_pos: Vector3 = Vector3.ZERO, m_scale: float = 1.0) -> void:
	var fl = OmniLight3D.new()
	fl.name = "CheongungColdLight"
	fl.light_color = Color("ffaa44")
	fl.light_energy = 10.5
	fl.omni_range = 15.0
	main_scene.add_child(fl)
	fl.global_position = m_pos + Vector3(0.0, 0.6, 0.0)
	var tw_l = fl.create_tween()
	tw_l.tween_property(fl, "light_energy", 0.0, 0.38)
	tw_l.tween_callback(fl.queue_free)

	var top_p = apex_pos if apex_pos.length_squared() > 0.001 else (m_pos + Vector3(0.0, 5.5, 0.0))
	var col_h = m_pos.distance_to(top_p)
	var col_mat = StandardMaterial3D.new()
	col_mat.albedo_color = Color(0.90, 0.94, 0.98, 0.78)
	col_mat.emission_enabled = true
	col_mat.emission = Color("d8e6f2")
	col_mat.emission_energy_multiplier = 1.8
	col_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	col_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var v_col = _cyl(0.15 * m_scale, 0.30 * m_scale, col_h, col_mat, (m_pos + top_p) * 0.5)
	v_col.name = "CheongungVerticalSmokeColumn"
	main_scene.add_child(v_col)
	v_col.global_position = (m_pos + top_p) * 0.5
	var tw_c = v_col.create_tween()
	tw_c.tween_property(v_col, "scale", Vector3(2.2, 1.0, 2.2), 0.65)
	tw_c.parallel().tween_property(col_mat, "albedo_color:a", 0.0, 0.65)
	tw_c.tween_callback(v_col.queue_free)


static func _spawn_dacs_side_thrusters(main_scene: Node, apex_pos: Vector3, m_scale: float = 1.0) -> void:
	var dl = OmniLight3D.new()
	dl.name = "CheongungDACSLight"
	dl.light_color = Color("ffaa22")
	dl.light_energy = 15.0
	dl.omni_range = 18.0
	main_scene.add_child(dl)
	dl.global_position = apex_pos
	var tw_l = dl.create_tween()
	tw_l.tween_property(dl, "light_energy", 0.0, 0.28)
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

		var jet = _cyl(0.05 * m_scale, 0.45 * m_scale, 2.50 * m_scale, j_mat, apex_pos, rot_v)
		jet.name = "CheongungDACSJet"
		main_scene.add_child(jet)
		jet.global_position = apex_pos
		var tw = jet.create_tween()
		tw.tween_property(jet, "scale", Vector3(2.4, 2.4, 2.4), 0.26)
		tw.parallel().tween_property(j_mat, "albedo_color:a", 0.0, 0.26)
		tw.tween_callback(jet.queue_free)


static func _spawn_booster_ring(main_scene: Node, pos: Vector3, m_scale: float = 1.0) -> void:
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
	torus.inner_radius = 0.36 * m_scale
	torus.outer_radius = 0.54 * m_scale
	ring.mesh = torus
	ring.material_override = r_mat
	main_scene.add_child(ring)
	ring.global_position = pos

	var tw = ring.create_tween()
	tw.tween_property(ring, "scale", Vector3(6.5, 6.5, 6.5), 0.36)
	tw.parallel().tween_property(r_mat, "albedo_color:a", 0.0, 0.36)
	tw.tween_callback(ring.queue_free)


static func _spawn_smoke_puff(main_scene: Node, pos: Vector3) -> void:
	var s_mat = StandardMaterial3D.new()
	s_mat.albedo_color = Color(0.92, 0.94, 0.98, 0.65)
	s_mat.emission_enabled = true
	s_mat.emission = Color("ffbb77")
	s_mat.emission_energy_multiplier = 0.70
	s_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var puff = _sphere(0.22, s_mat, pos)
	puff.name = "CheongungSmokePuff"
	main_scene.add_child(puff)
	puff.global_position = pos

	var tw = puff.create_tween()
	tw.tween_property(puff, "scale", Vector3(2.2, 2.2, 2.2), 0.50)
	tw.parallel().tween_property(s_mat, "albedo_color:a", 0.0, 0.50)
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

	var fb = _sphere(0.80, c_mat, pos)
	fb.name = "CheongungExpFireball"
	main_scene.add_child(fb)
	fb.global_position = pos
	var tw_f = fb.create_tween()
	tw_f.tween_property(fb, "scale", Vector3(6.2, 6.2, 6.2), 0.45)
	tw_f.parallel().tween_property(c_mat, "albedo_color:a", 0.0, 0.45)
	tw_f.tween_callback(fb.queue_free)

	for r_rot in [Vector3.ZERO, Vector3(PI * 0.35, 0.0, PI * 0.25)]:
		var sw_mat = c_mat.duplicate()
		var sw = MeshInstance3D.new()
		sw.name = "CheongungExpShockwave"
		var torus = TorusMesh.new()
		torus.inner_radius = 0.52
		torus.outer_radius = 0.68
		sw.mesh = torus
		sw.rotation = r_rot
		sw.material_override = sw_mat
		main_scene.add_child(sw)
		sw.global_position = pos
		var tw_s = sw.create_tween()
		tw_s.tween_property(sw, "scale", Vector3(9.0, 9.0, 9.0), 0.50)
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
