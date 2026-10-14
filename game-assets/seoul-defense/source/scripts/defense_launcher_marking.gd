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

	# 공용 PBR 고품질 재질
	var mat_olive = StandardMaterial3D.new()
	mat_olive.albedo_color = Color("45543a")
	mat_olive.roughness = 0.62
	mat_olive.metallic = 0.24

	var mat_dark = StandardMaterial3D.new()
	mat_dark.albedo_color = Color("263020")
	mat_dark.roughness = 0.68
	mat_dark.metallic = 0.28

	var mat_brown = StandardMaterial3D.new()
	mat_brown.albedo_color = Color("5e4630")
	mat_brown.roughness = 0.72
	mat_brown.metallic = 0.16

	var mat_black = StandardMaterial3D.new()
	mat_black.albedo_color = Color("1a1f18")
	mat_black.roughness = 0.52
	mat_black.metallic = 0.38

	var mat_chrome = StandardMaterial3D.new()
	mat_chrome.albedo_color = Color("e2ecf5")
	mat_chrome.roughness = 0.12
	mat_chrome.metallic = 0.95

	var mat_rubber = StandardMaterial3D.new()
	mat_rubber.albedo_color = Color("151816")
	mat_rubber.roughness = 0.88

	var mat_pad = StandardMaterial3D.new()
	mat_pad.albedo_color = Color("283038")
	mat_pad.roughness = 0.82
	mat_pad.metallic = 0.12

	var mat_pad_line = StandardMaterial3D.new()
	mat_pad_line.albedo_color = Color("d8a020")
	mat_pad_line.roughness = 0.55

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

	# 3D 월드 HDR Glow/Bloom 및 ACES 필름 톤매핑 상향
	if is_instance_valid(main_scene):
		var wenv = main_scene.find_child("*", "WorldEnvironment", true, false)
		if is_instance_valid(wenv) and wenv is WorldEnvironment and is_instance_valid(wenv.environment):
			wenv.environment.tonemap_mode = Environment.TONE_MAPPER_ACES
			wenv.environment.tonemap_exposure = 1.15
			wenv.environment.glow_enabled = true
			wenv.environment.glow_intensity = 1.25
			wenv.environment.glow_strength = 1.08
			wenv.environment.glow_bloom = 0.24

	var key_light = OmniLight3D.new()
	key_light.light_color = Color("dceeff")
	key_light.light_energy = 2.8
	key_light.omni_range = 28.0
	key_light.position = Vector3(-4.5, 7.5, 1.0)
	chassis.add_child(key_light)

	# ========================================================================
	# A. 천궁-II (KM-SAM) 90° 완전 수직 8연장 발사대 (실물 사진 완벽 고증)
	# ========================================================================
	var erector = Node3D.new()
	erector.name = "CheongungVerticalErector"
	chassis.add_child(erector)

	# 1) 차체 중앙 전원/사격통제 쉘터 박스 & 수직 스페어 타이어
	erector.add_child(_box(Vector3(2.38, 1.58, 1.55), mat_olive, Vector3(0.0, 2.04, -0.62)))
	erector.add_child(_box(Vector3(2.42, 0.58, 0.82), mat_brown, Vector3(0.0, 2.12, -0.48)))
	erector.add_child(_box(Vector3(2.44, 0.48, 0.42), mat_black, Vector3(0.0, 2.20, -0.98)))
	erector.add_child(_cyl(0.54, 0.54, 0.36, mat_rubber, Vector3(-1.12, 1.88, -1.62), Vector3(0.0, 0.0, PI * 0.5)))

	# 2) 후방(Z = +2.15) 90° 완전 수직 기립 8연장 원통형 발사관 어셈블리
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

	# 3) 8연장 수직 원통을 감싸는 5단 사각 격자 트러스 케이지 프레임
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

	# 4) 대각선 트윈 유압 기립 실린더 피스톤 2기 (은빛 크롬 로드 + 올리브 실린더)
	for px in [-0.62, 0.62]:
		erector.add_child(_cyl(0.13, 0.13, 1.85, mat_olive, Vector3(px, 2.02, 0.42), Vector3(deg_to_rad(38.0), 0.0, 0.0)))
		erector.add_child(_cyl(0.085, 0.085, 2.15, mat_chrome, Vector3(px, 3.05, 1.22), Vector3(deg_to_rad(38.0), 0.0, 0.0)))

	# 5) 4기 유압식 아웃트리거 지지대 & 후방 측면 탑승 사다리
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
	# B. 주변 레이더 시스템 여유 있는 배치 + 남산 도로 겹침 방지용 독립 방공진지 패드!
	#    (기존 X = ±7.6, Z = -0.8 -> X = ±11.6, Z = +0.65, Y = +0.28 로 넓고 쾌적하게 이격!)
	# ========================================================================
	var strobe_list = []
	_build_strobe(erector, Vector3(-0.58, 3.04, -2.65), mat_black, mat_strobe_red, mat_strobe_off, true, strobe_list)
	_build_strobe(erector, Vector3(0.58, 3.04, -2.65), mat_black, mat_strobe_amber, mat_strobe_off, false, strobe_list)

	# 1) 좌측 다기능레이더(MFR) 차량 (X = -11.6, Z = +0.65, Y = +0.28 -> 발사대와 충분한 여유 거리 확보 및 도로 겹침 완전 해소)
	var mfr = Node3D.new()
	mfr.name = "CheongungMFRVehicle"
	mfr.position = Vector3(-5.80, 0.08, -0.35)
	mfr.rotation.y = deg_to_rad(55.0)
	mfr.scale = Vector3(0.36, 0.36, 0.36)
	launcher.add_child(mfr)

	# MFR 전용 방공진지 콘크리트 플랫폼 패드 (남산 경사로/도로와 겹치지 않도록 받쳐줌)
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
	array_panel.rotation.x = deg_to_rad(-28.0)
	radar_head.add_child(array_panel)
	array_panel.add_child(_box(Vector3(2.35, 2.65, 0.28), mat_dark, Vector3.ZERO))
	array_panel.add_child(_box(Vector3(2.12, 2.42, 0.08), mat_radar, Vector3(0.0, 0.0, -0.16)))

	var beam_mat = StandardMaterial3D.new()
	beam_mat.albedo_color = Color(0.0, 0.92, 1.0, 0.20)
	beam_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	beam_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	beam_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	beam_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	array_panel.add_child(_cyl(3.0, 0.25, 13.0, beam_mat, Vector3(0.0, 0.2, -6.6), Vector3(PI * 0.5, 0.0, 0.0)))

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

	# 2) 우측 교전통제소(ECS) 지휘차량 + 4연장 통신 안테나 (X = +11.6, Z = +0.65, Y = +0.28 -> 남산 우측 도로와 절대 겹치지 않는 전면 방공패드 위치!)
	var ecs = Node3D.new()
	ecs.name = "CheongungECSVehicle"
	ecs.position = Vector3(1.85, 0.08, -0.35)
	ecs.rotation.y = deg_to_rad(-55.0)
	ecs.scale = Vector3(0.36, 0.36, 0.36)
	launcher.add_child(ecs)

	# ECS 전용 방공진지 콘크리트 플랫폼 패드
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

	# 3) 다기능레이더(MFR) -> 교전통제소(ECS) -> 유도탄발사대(TEL) 데이터링크 광파 펄스
	for di in range(6):
		var pulse_a = _sphere(0.12, mat_radar, Vector3(-10.8, 1.8, 0.5))
		launcher.add_child(pulse_a)
		var tw_a = pulse_a.create_tween().set_loops()
		tw_a.tween_interval(float(di) * 0.18)
		tw_a.tween_property(pulse_a, "position", Vector3(10.8, 1.9, 0.5), 1.15).from(Vector3(-10.8, 1.8, 0.5))

		var pulse_b = _sphere(0.12, mat_radar, Vector3(10.8, 1.9, 0.5))
		launcher.add_child(pulse_b)
		var tw_b = pulse_b.create_tween().set_loops()
		tw_b.tween_interval(float(di) * 0.18)
		tw_b.tween_property(pulse_b, "position", Vector3(0.0, 1.8, 0.0), 0.78).from(Vector3(10.8, 1.9, 0.5))

	# 4) 방공 경보 사이렌 오디오 스트림 생성
	var audio_player = AudioStreamPlayer.new()
	var gen = AudioStreamGenerator.new()
	gen.mix_rate = 22050.0
	gen.buffer_length = 0.25
	audio_player.stream = gen
	audio_player.volume_db = -9.0
	launcher.add_child(audio_player)
	audio_player.play()

	# main.gd의 launcher_sockets도 수직발사관 상단 좌표로 교체
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
		"main": main_scene,
		"muzzles": muzzles,
		"mfr_head": array_panel,
		"strobes": strobe_list,
		"mat_black": mat_black,
		"audio_player": audio_player,
		"next_tube": 0,
		"time": 0.0,
		"beam_timer": 0.0,
		"siren_timer": 0.0,
		"siren_phase": 0.0,
		"prev_threats": 0,
		"lock_rings": {},
		"interceptors": {}
	}
	if tree:
		# 1) process_frame (main.gd._process 실행 직전): 엔진 원래 위치 복원 및 PodRack 수직 고정
		tree.process_frame.connect(_on_pre_process.bind(state))
		# 2) RenderingServer.frame_pre_draw (main.gd._process 실행 직후, 화면 그리기 직전!):
		#    사각 발사 궤적을 완벽히 가로채서 '90° 수직 콜드런치 상승 -> 공중 정점 측면추력기(DACS) 회전 -> 주엔진 고각 점화' 모션그래픽 적용!
		RenderingServer.frame_pre_draw.connect(_on_pre_draw.bind(state))


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
	# main.gd._process가 돌기 직전에 요격미사일의 엔진 내부 좌표를 복원해 주어 타격 판정이 정확히 유지되게 함
	var tracked = state["interceptors"]
	for iid in tracked.keys():
		var st = tracked[iid]
		var inode = st.get("node")
		if is_instance_valid(inode) and st.has("engine_pos"):
			inode.global_position = st["engine_pos"]
			inode.global_rotation = st["engine_rot"]

	# PodRack을 90도 수직 발사관 상단에 고정하여 main.gd의 기본 발사 이펙트도 수직으로 나가도록 강제
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
	var delta = chassis.get_process_delta_time()
	var t = float(state["time"]) + delta
	state["time"] = t

	# 1. 차체 측면 고정 및 천무 포드 숨김/수직 고정 (main.gd._process 이후 최종 덮어쓰기!)
	chassis.rotation = Vector3(0.0, PI * 0.5, 0.0)
	var pod_rack = state["pod_rack"]
	var rack = state["rack"]
	if is_instance_valid(pod_rack) and is_instance_valid(rack):
		pod_rack.visible = false
		pod_rack.global_position = rack.global_position + Vector3(0.0, 4.8, 0.0)
		pod_rack.rotation = Vector3(deg_to_rad(89.0), 0.0, 0.0)

	var main_scene = state.get("main")
	if not is_instance_valid(main_scene):
		return

	# 2. 씬 전체에서 적 미사일(threats) 및 아군 요격미사일(interceptors) 자동 수집
	var threats = []
	var active_int_nodes = []
	_collect_missiles_and_interceptors(main_scene, state["launcher"], threats, active_int_nodes)

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
			l.light_energy = 12.0 if on_now else 1.0
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

	# 적 미사일 주변 2중 레이더 감지 파장 링 업데이트
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
				if old_h.global_position.y > 2.5:
					_spawn_interception_explosion(main_scene, old_h.global_position)
				old_h.queue_free()
			lock_rings.erase(tid)

	# ========================================================================
	# 3. 천궁-II 3단계 콜드런치(Cold-Launch) 발사 모션그래픽 완벽 구현!
	#    (RenderingServer.frame_pre_draw 단계에서 사각 직선 궤적을 완전히 대체)
	# ========================================================================
	var tracked = state["interceptors"]
	var active_i_ids = {}

	for i_node in active_int_nodes:
		if not is_instance_valid(i_node):
			continue
		var iid = i_node.get_instance_id()
		active_i_ids[iid] = true

		# main.gd가 방금 계산한 원래(사각) 좌표와 회전값 저장
		var eng_pos = i_node.global_position
		var eng_rot = i_node.global_rotation

		if not tracked.has(iid):
			var muzzles = state["muzzles"]
			var m_pos = chassis.global_position + Vector3(0.0, 5.2, 0.0)
			if muzzles.size() > 0:
				var idx = int(state["next_tube"]) % muzzles.size()
				state["next_tube"] = idx + 1
				if is_instance_valid(muzzles[idx]):
					m_pos = muzzles[idx].global_position

			_upgrade_interceptor_mesh(i_node, state["mat_black"])
			_spawn_cold_launch_fx(main_scene, m_pos)
			tracked[iid] = {
				"node": i_node,
				"muzzle": m_pos,
				"spawn_eng_pos": eng_pos,
				"engine_pos": eng_pos,
				"engine_rot": eng_rot,
				"age": 0.0,
				"dacs": false,
				"booster": false,
				"trail": 0.0,
				"prev_draw_pos": m_pos
			}

		var st = tracked[iid]
		st["node"] = i_node
		st["engine_pos"] = eng_pos
		st["engine_rot"] = eng_rot

		var age = float(st["age"]) + delta
		st["age"] = age
		var m_pos = st["muzzle"]
		# 콜드런치 수직 상승 정점 (발사관 상단에서 수직으로 +4.6m 위 상공!)
		var apex_pos = m_pos + Vector3(0.0, 4.6, 0.0)
		var prev_draw = st["prev_draw_pos"]
		var draw_pos = eng_pos

		if age < 0.24:
			# [1단계: 90° 수직 콜드런치 사출 (0.00s ~ 0.24s)]
			# 사각으로 날아가지 않고 발사관 상단(m_pos)에서 하늘(+Y)로 90도 완전 수직 사출 후 정점(apex_pos)에서 감속 호버링!
			var u1 = clampf(age / 0.24, 0.0, 1.0)
			var ease_u1 = 1.0 - pow(1.0 - u1, 2.6)
			draw_pos = m_pos.lerp(apex_pos, ease_u1)
			i_node.global_position = draw_pos
			# 기수가 하늘(+Y)을 향해 90도 완전 수직으로 서 있음
			_orient_missile_along(i_node, Vector3.UP)
		elif age < 0.38:
			# [2단계: 공중 정점 측면 추력기(DACS) 점화 및 급격한 기수 방향전환 (0.24s ~ 0.38s)]
			# 정점(apex_pos) 부근 공중에 멈춰 선 채 전방 측면 추력기가 좌우로 폭발하며 기수만 표적 쪽으로 휙 꺾음!
			if not bool(st["dacs"]):
				st["dacs"] = true
				_spawn_dacs_side_thrusters(main_scene, apex_pos)
			var u2 = clampf((age - 0.24) / 0.14, 0.0, 1.0)
			draw_pos = apex_pos.lerp(eng_pos, u2 * u2 * 0.22)
			i_node.global_position = draw_pos
			var target_dir = (eng_pos - apex_pos).normalized()
			if target_dir.length_squared() < 0.01:
				target_dir = Vector3(0.0, 0.7, -0.7).normalized()
			var snap_dir = Vector3.UP.lerp(target_dir, ease(u2, -2.2)).normalized()
			_orient_missile_along(i_node, snap_dir)
		else:
			# [3단계: 주 로켓 추진기관 공중 점화 및 고각 아치형 비행 유도 (0.38s ~ 명중)]
			if not bool(st["booster"]):
				st["booster"] = true
				_spawn_booster_ring(main_scene, i_node.global_position)
				var pl = i_node.find_child("CheongungPlume", true, false)
				if is_instance_valid(pl):
					pl.visible = true

			var u3 = clampf((age - 0.38) / 0.32, 0.0, 1.0)
			var smooth_u3 = u3 * u3 * (3.0 - 2.0 * u3)
			# 정점(apex_pos)에서 실제 타격 위치(eng_pos)까지 고고도 아치 궤적으로 부드럽게 합류!
			var arc_lift := 0.0
			draw_pos = apex_pos.lerp(eng_pos, smooth_u3) + arc_lift
			i_node.global_position = draw_pos

			var vel_dir = (draw_pos - prev_draw)
			if vel_dir.length_squared() > 0.0001:
				_orient_missile_along(i_node, vel_dir.normalized())

			var tr = float(st["trail"]) + delta
			if tr >= 0.024:
				tr = 0.0
				_spawn_smoke_puff(main_scene, draw_pos)
			st["trail"] = tr

		st["prev_draw_pos"] = draw_pos

	for iid in tracked.keys():
		if not active_i_ids.has(iid):
			_spawn_interception_explosion(main_scene, tracked[iid]["prev_draw_pos"])
			tracked.erase(iid)


static func _orient_missile_along(i_node: Node3D, dir: Vector3) -> void:
	if dir.length_squared() < 0.0001:
		return
	var d = dir.normalized()
	var up_ref = Vector3.FORWARD if absf(d.dot(Vector3.UP)) > 0.96 else Vector3.UP
	i_node.look_at(i_node.global_position + d, up_ref)


static func _collect_missiles_and_interceptors(main_scene: Node, launcher: Node3D, threats: Array, interceptors: Array) -> void:
	var seen_t = {}
	var seen_i = {}

	# 1) main_scene의 알려진 프로퍼티(missiles, interceptors 등) 확인
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
				if is_instance_valid(n) and n.visible and not seen_t.has(n.get_instance_id()) and not seen_i.has(n.get_instance_id()):
					seen_i[n.get_instance_id()] = true
					interceptors.append(n)

	# 2) 만약 프로퍼티 이름이 다르더라도 main_scene의 모든 Array 프로퍼티에서 발사체 Node3D 자동 탐지!
	if interceptors.is_empty():
		for p_info in main_scene.get_property_list():
			var pname = p_info["name"]
			if pname == "missiles" or pname == "vehicle_templates" or pname == "models":
				continue
			var val = main_scene.get(pname)
			if val is Array and val.size() > 0:
				for item in val:
					var n = _find_node3d(item)
					if is_instance_valid(n) and n.visible and n != launcher and not launcher.is_ancestor_of(n):
						var nid = n.get_instance_id()
						if not seen_t.has(nid) and not seen_i.has(nid):
							# 요격미사일인지 확인 (이름에 interceptor가 있거나 발사대 근처에서 출발한 노드)
							if "intercept" in n.name.to_lower() or n.has_node("CheongungBody") or n.global_position.distance_to(launcher.global_position) < 28.0:
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
	main_scene.add_child(pivot)
	pivot.global_position = (p0 + p1) * 0.5
	pivot.look_at(p1, Vector3.UP)
	pivot.add_child(_cyl(0.07, 0.16, d, mat, Vector3.ZERO, Vector3(PI * 0.5, 0.0, 0.0)))

	var tw = pivot.create_tween()
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.26)
	tw.tween_callback(pivot.queue_free)


static func _upgrade_interceptor_mesh(i_node: Node3D, mat_body: Material) -> void:
	if i_node.has_node("CheongungBody"):
		return
	var root = Node3D.new()
	root.name = "CheongungBody"
	i_node.add_child(root)

	var mat_w = StandardMaterial3D.new()
	mat_w.albedo_color = Color("f5f8fc")
	var mat_r = StandardMaterial3D.new()
	mat_r.albedo_color = Color("e62e1f")
	mat_r.emission_enabled = true
	mat_r.emission = Color("ff3b28")
	mat_r.emission_energy_multiplier = 1.4

	root.add_child(_cyl(0.0, 0.14, 0.60, mat_w, Vector3(0.0, 0.0, -1.20), Vector3(PI * 0.5, 0.0, 0.0)))
	root.add_child(_cyl(0.145, 0.145, 0.26, mat_r, Vector3(0.0, 0.0, -0.78), Vector3(PI * 0.5, 0.0, 0.0)))
	root.add_child(_cyl(0.14, 0.14, 1.65, mat_body, Vector3(0.0, 0.0, 0.15), Vector3(PI * 0.5, 0.0, 0.0)))

	var plume = Node3D.new()
	plume.name = "CheongungPlume"
	plume.position = Vector3(0.0, 0.0, 0.98)
	plume.visible = false
	root.add_child(plume)

	var c_mat = StandardMaterial3D.new()
	c_mat.albedo_color = Color(1.0, 0.98, 0.85, 0.98)
	c_mat.emission_enabled = true
	c_mat.emission = Color("fff6cc")
	c_mat.emission_energy_multiplier = 9.0
	c_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var o_mat = StandardMaterial3D.new()
	o_mat.albedo_color = Color(1.0, 0.42, 0.08, 0.85)
	o_mat.emission_enabled = true
	o_mat.emission = Color("ff5500")
	o_mat.emission_energy_multiplier = 6.5
	o_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	o_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	o_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	plume.add_child(_cyl(0.13, 0.01, 1.35, c_mat, Vector3(0.0, 0.0, 0.68), Vector3(PI * 0.5, 0.0, 0.0)))
	plume.add_child(_cyl(0.28, 0.02, 2.55, o_mat, Vector3(0.0, 0.0, 1.28), Vector3(PI * 0.5, 0.0, 0.0)))

	var tl = OmniLight3D.new()
	tl.light_color = Color("ff8822")
	tl.light_energy = 7.5
	tl.omni_range = 14.0
	plume.add_child(tl)


static func _spawn_cold_launch_fx(main_scene: Node, m_pos: Vector3) -> void:
	# ③ 수직 콜드런치 사출! 발사관 상단에서 하늘(+Y)로 수직 분출되는 고압 가스 연기 기둥 & 사출 압력 링
	var fl = OmniLight3D.new()
	fl.light_color = Color("ffaa44")
	fl.light_energy = 10.5
	fl.omni_range = 15.0
	main_scene.add_child(fl)
	fl.global_position = m_pos + Vector3(0.0, 0.6, 0.0)
	var tw_l = fl.create_tween()
	tw_l.tween_property(fl, "light_energy", 0.0, 0.38)
	tw_l.tween_callback(fl.queue_free)

	# 수직 사출구 충격파 링
	var ring_mat = StandardMaterial3D.new()
	ring_mat.albedo_color = Color(0.92, 0.95, 1.0, 0.85)
	ring_mat.emission_enabled = true
	ring_mat.emission = Color("ffbb66")
	ring_mat.emission_energy_multiplier = 3.5
	ring_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	var ring = MeshInstance3D.new()
	var torus = TorusMesh.new()
	torus.inner_radius = 0.22
	torus.outer_radius = 0.36
	ring.mesh = torus
	ring.material_override = ring_mat
	main_scene.add_child(ring)
	ring.global_position = m_pos
	var tw_r = ring.create_tween()
	tw_r.tween_property(ring, "scale", Vector3(4.2, 1.0, 4.2), 0.35)
	tw_r.parallel().tween_property(ring_mat, "albedo_color:a", 0.0, 0.35)
	tw_r.tween_callback(ring.queue_free)

	for i in range(14):
		var p_mat = StandardMaterial3D.new()
		p_mat.albedo_color = Color(0.86, 0.89, 0.93, 0.84)
		p_mat.emission_enabled = true
		p_mat.emission = Color("ffaa55") if i < 4 else Color("d5dee6")
		p_mat.emission_energy_multiplier = 2.6 if i < 4 else 0.55
		p_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

		var start_p = m_pos + Vector3(randf_range(-0.18, 0.18), float(i) * 0.28, randf_range(-0.18, 0.18))
		var puff = _sphere(0.32 + float(i % 3) * 0.12, p_mat, start_p)
		main_scene.add_child(puff)
		puff.global_position = start_p

		var tw = puff.create_tween()
		tw.tween_property(puff, "global_position", start_p + Vector3(randf_range(-0.45, 0.45), 3.4 + float(i) * 0.28, randf_range(-0.45, 0.45)), 0.78)
		tw.parallel().tween_property(puff, "scale", Vector3(2.6, 2.6, 2.6), 0.78)
		tw.parallel().tween_property(p_mat, "albedo_color:a", 0.0, 0.78)
		tw.tween_callback(puff.queue_free)


static func _spawn_dacs_side_thrusters(main_scene: Node, apex_pos: Vector3) -> void:
	# ④ 측면 추력기(DACS) 초기 방향전환! 상공 정점에서 좌우로 강렬하게 뿜어져 나오는 십자형 측면 스파크 화염
	var dl = OmniLight3D.new()
	dl.light_color = Color("ffaa22")
	dl.light_energy = 14.0
	dl.omni_range = 18.0
	main_scene.add_child(dl)
	dl.global_position = apex_pos
	var tw_l = dl.create_tween()
	tw_l.tween_property(dl, "light_energy", 0.0, 0.26)
	tw_l.tween_callback(dl.queue_free)

	var rot_list = [
		Vector3(0.0, 0.0, PI * 0.5),
		Vector3(0.0, 0.0, -PI * 0.5),
		Vector3(PI * 0.5, 0.0, 0.0),
		Vector3(-PI * 0.5, 0.0, 0.0)
	]
	for rot_v in rot_list:
		var j_mat = StandardMaterial3D.new()
		j_mat.albedo_color = Color(1.0, 0.72, 0.18, 0.96)
		j_mat.emission_enabled = true
		j_mat.emission = Color("ff9911")
		j_mat.emission_energy_multiplier = 7.5
		j_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		j_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		j_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

		var jet = _cyl(0.05, 0.44, 2.35, j_mat, apex_pos, rot_v)
		main_scene.add_child(jet)
		jet.global_position = apex_pos
		var tw = jet.create_tween()
		tw.tween_property(jet, "scale", Vector3(2.1, 2.1, 2.1), 0.24)
		tw.parallel().tween_property(j_mat, "albedo_color:a", 0.0, 0.24)
		tw.tween_callback(jet.queue_free)


static func _spawn_booster_ring(main_scene: Node, pos: Vector3) -> void:
	var r_mat = StandardMaterial3D.new()
	r_mat.albedo_color = Color(1.0, 0.85, 0.45, 0.92)
	r_mat.emission_enabled = true
	r_mat.emission = Color("ffbb44")
	r_mat.emission_energy_multiplier = 6.5
	r_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	r_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	r_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var ring = MeshInstance3D.new()
	var torus = TorusMesh.new()
	torus.inner_radius = 0.40
	torus.outer_radius = 0.58
	ring.mesh = torus
	ring.material_override = r_mat
	main_scene.add_child(ring)
	ring.global_position = pos

	var tw = ring.create_tween()
	tw.tween_property(ring, "scale", Vector3(7.2, 7.2, 7.2), 0.38)
	tw.parallel().tween_property(r_mat, "albedo_color:a", 0.0, 0.38)
	tw.tween_callback(ring.queue_free)


static func _spawn_smoke_puff(main_scene: Node, pos: Vector3) -> void:
	var s_mat = StandardMaterial3D.new()
	s_mat.albedo_color = Color(0.92, 0.94, 0.98, 0.65)
	s_mat.emission_enabled = true
	s_mat.emission = Color("ffbb77")
	s_mat.emission_energy_multiplier = 0.70
	s_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var puff = _sphere(0.26, s_mat, pos)
	main_scene.add_child(puff)
	puff.global_position = pos

	var tw = puff.create_tween()
	tw.tween_property(puff, "scale", Vector3(2.6, 2.6, 2.6), 0.65)
	tw.parallel().tween_property(s_mat, "albedo_color:a", 0.0, 0.65)
	tw.tween_callback(puff.queue_free)


static func _spawn_interception_explosion(main_scene: Node, pos: Vector3) -> void:
	var el = OmniLight3D.new()
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

	var fb = _sphere(0.85, c_mat, pos)
	main_scene.add_child(fb)
	fb.global_position = pos
	var tw_f = fb.create_tween()
	tw_f.tween_property(fb, "scale", Vector3(6.5, 6.5, 6.5), 0.45)
	tw_f.parallel().tween_property(c_mat, "albedo_color:a", 0.0, 0.45)
	tw_f.tween_callback(fb.queue_free)

	for r_rot in [Vector3.ZERO, Vector3(PI * 0.35, 0.0, PI * 0.25)]:
		var sw_mat = c_mat.duplicate()
		var sw = MeshInstance3D.new()
		var torus = TorusMesh.new()
		torus.inner_radius = 0.55
		torus.outer_radius = 0.72
		sw.mesh = torus
		sw.rotation = r_rot
		sw.material_override = sw_mat
		main_scene.add_child(sw)
		sw.global_position = pos
		var tw_s = sw.create_tween()
		tw_s.tween_property(sw, "scale", Vector3(9.5, 9.5, 9.5), 0.50)
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
