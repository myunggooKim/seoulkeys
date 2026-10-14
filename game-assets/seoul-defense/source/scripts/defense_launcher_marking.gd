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

	# 2. main.gd가 기본 차체 AABB 기준으로 큼직하게 스케일을 잡은 직후(SceneTree 진입 후 0.05초),
	#    천무 사각 포드를 지우고 90° 수직발사대(TEL) + 다기능레이더(MFR) + 교전통제소(ECS)를 풀스케일로 생성!
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

	# 공용 PBR 고품질 재질 (국군 4색 위장무늬 + 고광택 크롬 유압실린더 + AESA 레이더 발광면)
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
	key_light.omni_range = 26.0
	key_light.position = Vector3(-4.5, 7.5, 1.0)
	chassis.add_child(key_light)

	# ========================================================================
	# A. 천궁-II (KM-SAM) 90° 완전 수직 8연장 발사대 (실물 사진 image_3f56ba.jpg 완벽 고증)
	#    (참고: chassis 로컬 좌표에서 -X가 카메라 정면, -Z가 운전석(좌측), +Z가 후방 발사대(우측))
	# ========================================================================
	var erector = Node3D.new()
	erector.name = "CheongungVerticalErector"
	chassis.add_child(erector)

	# 1) 차체 중앙 전원/사격통제 쉘터 박스 & 수직 스페어 타이어 (운전석 바로 뒤 Z = -0.65)
	erector.add_child(_box(Vector3(2.38, 1.58, 1.55), mat_olive, Vector3(0.0, 2.04, -0.62)))
	erector.add_child(_box(Vector3(2.42, 0.58, 0.82), mat_brown, Vector3(0.0, 2.12, -0.48)))
	erector.add_child(_box(Vector3(2.44, 0.48, 0.42), mat_black, Vector3(0.0, 2.20, -0.98)))
	# 카메라를 바라보는 -X면에 수직 스페어 타이어 장착
	erector.add_child(_cyl(0.54, 0.54, 0.36, mat_rubber, Vector3(-1.12, 1.88, -1.62), Vector3(0.0, 0.0, PI * 0.5)))

	# 2) 후방(Z = +2.15) 90° 완전 수직 기립 8연장 원통형 발사관 어셈블리
	var rack = Node3D.new()
	rack.name = "VerticalCanisterRack90"
	rack.position = Vector3(0.0, 1.28, 2.15)
	erector.add_child(rack)

	rack.add_child(_box(Vector3(2.60, 0.38, 2.15), mat_black, Vector3(0.0, 0.16, 0.0)))

	# 카메라(-X)에서 봤을 때 가로(Z)로 4열 원통이 나란히 우뚝 서 있고 깊이(X)로 2열 배치되어 8연장이 한눈에 보이도록 구성!
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

			# 하늘(+Y)을 향해 90도 완전 수직으로 서 있는 원통형 발사관 (국군 4색 위장무늬)
			t_node.add_child(_cyl(tube_r, tube_r, tube_h, mat_olive, Vector3(0.0, tube_h * 0.5, 0.0)))
			t_node.add_child(_cyl(tube_r + 0.006, tube_r + 0.006, 1.18, mat_brown, Vector3(0.0, tube_h * 0.30, 0.0)))
			t_node.add_child(_cyl(tube_r + 0.006, tube_r + 0.006, 1.18, mat_dark, Vector3(0.0, tube_h * 0.70, 0.0)))

			# 하단 가스 사출 노즐 & 상단 콜드런치 밀봉 캡
			t_node.add_child(_cyl(tube_r * 0.96, tube_r * 0.70, 0.28, mat_black, Vector3(0.0, -0.10, 0.0)))
			t_node.add_child(_cyl(tube_r * 0.92, tube_r * 1.04, 0.15, mat_dark, Vector3(0.0, tube_h + 0.06, 0.0)))

			var muz = Node3D.new()
			muz.position = Vector3(0.0, tube_h + 0.20, 0.0)
			t_node.add_child(muz)
			muzzles.append(muz)

	# 3) 8연장 수직 원통을 감싸는 5단 사각 격자 트러스 케이지 프레임 (사진 image_3f56ba.jpg 완벽 고증)
	for tier_y in [0.58, 1.58, 2.58, 3.58, 4.58]:
		rack.add_child(_box(Vector3(1.72, 0.18, 2.34), mat_dark, Vector3(0.0, tier_y, 0.0)))

	for sz in [-1.12, -0.54, 0.0, 0.54, 1.12]:
		for sx in [-0.82, 0.82]:
			rack.add_child(_box(Vector3(0.10, 4.65, 0.10), mat_black, Vector3(sx, 2.60, sz)))

	# 전면(-Z, 유압실린더 연결면) 사각 격자 케이지 프레임
	rack.add_child(_box(Vector3(1.64, 3.70, 0.08), mat_olive, Vector3(0.0, 2.18, -1.14)))

	# 카메라 정면(-X)을 향하는 수직발사관 제식 마킹: '천궁-II KM-SAM'
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

	# 4) 대각선 트윈 유압 기립 실린더 피스톤 2기 (은빛 고광택 크롬 로드 + 올리브 실린더, 사진 완벽 고증!)
	for px in [-0.62, 0.62]:
		erector.add_child(_cyl(0.13, 0.13, 1.85, mat_olive, Vector3(px, 2.02, 0.42), Vector3(deg_to_rad(38.0), 0.0, 0.0)))
		erector.add_child(_cyl(0.085, 0.085, 2.15, mat_chrome, Vector3(px, 3.05, 1.22), Vector3(deg_to_rad(38.0), 0.0, 0.0)))

	# 5) 4기 유압식 아웃트리거 지지대 & 후방 측면 탑승 사다리 (카메라 정면 -X쪽에 선명히 노출!)
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
	# B. 주변 레이더 시스템 배치: 좌측 다기능레이더(MFR) 차량 + 우측 교전통제소(ECS) 차량
	# ========================================================================
	var strobe_list = []
	_build_strobe(erector, Vector3(-0.58, 3.04, -2.65), mat_black, mat_strobe_red, mat_strobe_off, true, strobe_list)
	_build_strobe(erector, Vector3(0.58, 3.04, -2.65), mat_black, mat_strobe_amber, mat_strobe_off, false, strobe_list)

	# 1) 좌측 다기능레이더(MFR) 차량 (X = -7.6, 360도 회전 위상배열 레이더 + 전파 파장 발사!)
	var mfr = Node3D.new()
	mfr.name = "CheongungMFRVehicle"
	mfr.position = Vector3(-7.6, 0.0, -0.8)
	mfr.rotation.y = deg_to_rad(62.0)
	mfr.scale = Vector3(0.84, 0.84, 0.84)
	launcher.add_child(mfr)

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

	# 2) 우측 교전통제소(ECS) 지휘차량 + 4연장 통신 안테나 (X = +7.6)
	var ecs = Node3D.new()
	ecs.name = "CheongungECSVehicle"
	ecs.position = Vector3(7.6, 0.0, -0.8)
	ecs.rotation.y = deg_to_rad(-62.0)
	ecs.scale = Vector3(0.82, 0.82, 0.82)
	launcher.add_child(ecs)

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
		var pulse_a = _sphere(0.12, mat_radar, Vector3(-7.0, 1.6, -0.8))
		launcher.add_child(pulse_a)
		var tw_a = pulse_a.create_tween().set_loops()
		tw_a.tween_interval(float(di) * 0.18)
		tw_a.tween_property(pulse_a, "position", Vector3(7.0, 1.8, -0.8), 1.10).from(Vector3(-7.0, 1.6, -0.8))

		var pulse_b = _sphere(0.12, mat_radar, Vector3(7.0, 1.8, -0.8))
		launcher.add_child(pulse_b)
		var tw_b = pulse_b.create_tween().set_loops()
		tw_b.tween_interval(float(di) * 0.18)
		tw_b.tween_property(pulse_b, "position", Vector3(0.0, 1.8, 0.0), 0.75).from(Vector3(7.0, 1.8, -0.8))

	# 4) 방공 경보 사이렌 오디오 스트림 생성
	var audio_player = AudioStreamPlayer.new()
	var gen = AudioStreamGenerator.new()
	gen.mix_rate = 22050.0
	gen.buffer_length = 0.25
	audio_player.stream = gen
	audio_player.volume_db = -9.0
	launcher.add_child(audio_player)
	audio_player.play()

	var state = {
		"launcher": launcher,
		"chassis": chassis,
		"pod_rack": pod_rack,
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
		tree.process_frame.connect(_on_battery_frame.bind(state))


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


static func _on_battery_frame(state: Dictionary) -> void:
	var chassis = state["chassis"]
	if not is_instance_valid(chassis):
		return
	var delta = chassis.get_process_delta_time()
	var t = float(state["time"]) + delta
	state["time"] = t

	# 1. 천무 사각 포드 숨김 유지 & 8x8 TEL 트럭 측면 고정 (90° 수직발사관이 항상 정면에 우뚝 서 있도록 유지!)
	var pod_rack = state["pod_rack"]
	if is_instance_valid(pod_rack):
		pod_rack.visible = false
	chassis.rotation = Vector3(0.0, PI * 0.5, 0.0)

	var main_scene = state.get("main")
	if not is_instance_valid(main_scene):
		return

	# 2. 적 미사일(missiles) 실시간 감지 -> 전파 감지 파장 링 + 추적 광선 + 비상등 번쩍임 + 방공 사이렌
	var threats = []
	var raw_missiles = main_scene.get("missiles")
	if raw_missiles is Array:
		for item in raw_missiles:
			var m_node = _find_node3d(item)
			if is_instance_valid(m_node) and m_node.visible:
				threats.append(m_node)

	var has_threats = threats.size() > 0
	if threats.size() > int(state["prev_threats"]):
		state["siren_timer"] = 2.6
	state["prev_threats"] = threats.size()

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

	var lock_rings = state["lock_rings"]
	var active_t_ids = {}
	for m_node in threats:
		var tid = m_node.get_instance_id()
		active_t_ids[tid] = true
		if not lock_rings.has(tid):
			var holder = _create_target_lock_rings(main_scene)
			lock_rings[tid] = holder
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

	# 3. 요격미사일(interceptors) 3단계 발사 고증
	var raw_ints = main_scene.get("interceptors")
	var tracked = state["interceptors"]
	var active_i_ids = {}

	if raw_ints is Array:
		for item in raw_ints:
			var i_node = _find_node3d(item)
			if not is_instance_valid(i_node):
				continue
			var iid = i_node.get_instance_id()
			active_i_ids[iid] = true

			if not tracked.has(iid):
				var muzzles = state["muzzles"]
				var m_pos = chassis.global_position + Vector3(0.0, 5.8, 0.0)
				if muzzles.size() > 0:
					var idx = int(state["next_tube"]) % muzzles.size()
					state["next_tube"] = idx + 1
					if is_instance_valid(muzzles[idx]):
						m_pos = muzzles[idx].global_position

				_upgrade_interceptor_mesh(i_node, state["mat_black"])
				_spawn_cold_launch_fx(main_scene, m_pos)
				tracked[iid] = {
					"muzzle": m_pos,
					"age": 0.0,
					"dacs": false,
					"booster": false,
					"trail": 0.0,
					"last_pos": m_pos
				}

			var st = tracked[iid]
			var age = float(st["age"]) + delta
			st["age"] = age
			var m_pos = st["muzzle"]
			var orig_pos = i_node.global_position

			if age < 0.20:
				var u = age / 0.20
				i_node.global_position = m_pos + Vector3(0.0, u * 4.5, 0.0)
				i_node.rotation = Vector3(-PI * 0.5, 0.0, 0.0)
			elif age < 0.34:
				var apex = m_pos + Vector3(0.0, 4.5, 0.0)
				if not bool(st["dacs"]):
					st["dacs"] = true
					_spawn_dacs_side_thrusters(main_scene, apex)
				var u2 = (age - 0.20) / 0.14
				i_node.global_position = apex.lerp(orig_pos, u2)
			else:
				if not bool(st["booster"]):
					st["booster"] = true
					_spawn_booster_ring(main_scene, i_node.global_position)
					var pl = i_node.find_child("CheongungPlume", true, false)
					if is_instance_valid(pl):
						pl.visible = true
				var tr = float(st["trail"]) + delta
				if tr >= 0.03:
					tr = 0.0
					_spawn_smoke_puff(main_scene, i_node.global_position)
				st["trail"] = tr

			st["last_pos"] = i_node.global_position

	for iid in tracked.keys():
		if not active_i_ids.has(iid):
			_spawn_interception_explosion(main_scene, tracked[iid]["last_pos"])
			tracked.erase(iid)


static func _find_node3d(item) -> Node3D:
	if item is Node3D:
		return item
	if item is Dictionary:
		for k in ["node", "mesh", "instance", "root", "visual", "missile", "interceptor"]:
			if item.has(k) and item[k] is Node3D:
				return item[k]
		for v in item.values():
			if v is Node3D:
				return v
	if item is Object:
		for k in ["node", "mesh", "instance", "root", "visual"]:
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

	root.add_child(_cyl(0.0, 0.13, 0.55, mat_w, Vector3(0.0, 0.0, -1.15), Vector3(PI * 0.5, 0.0, 0.0)))
	root.add_child(_cyl(0.134, 0.134, 0.24, mat_r, Vector3(0.0, 0.0, -0.76), Vector3(PI * 0.5, 0.0, 0.0)))
	root.add_child(_cyl(0.13, 0.13, 1.55, mat_body, Vector3(0.0, 0.0, 0.12), Vector3(PI * 0.5, 0.0, 0.0)))

	var plume = Node3D.new()
	plume.name = "CheongungPlume"
	plume.position = Vector3(0.0, 0.0, 0.95)
	plume.visible = false
	root.add_child(plume)

	var c_mat = StandardMaterial3D.new()
	c_mat.albedo_color = Color(1.0, 0.98, 0.85, 0.95)
	c_mat.emission_enabled = true
	c_mat.emission = Color("fff6cc")
	c_mat.emission_energy_multiplier = 8.0
	c_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var o_mat = StandardMaterial3D.new()
	o_mat.albedo_color = Color(1.0, 0.42, 0.08, 0.82)
	o_mat.emission_enabled = true
	o_mat.emission = Color("ff5500")
	o_mat.emission_energy_multiplier = 5.5
	o_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	o_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	o_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	plume.add_child(_cyl(0.11, 0.01, 1.15, c_mat, Vector3(0.0, 0.0, 0.58), Vector3(PI * 0.5, 0.0, 0.0)))
	plume.add_child(_cyl(0.24, 0.02, 2.25, o_mat, Vector3(0.0, 0.0, 1.12), Vector3(PI * 0.5, 0.0, 0.0)))

	var tl = OmniLight3D.new()
	tl.light_color = Color("ff8822")
	tl.light_energy = 6.5
	tl.omni_range = 12.0
	plume.add_child(tl)


static func _spawn_cold_launch_fx(main_scene: Node, m_pos: Vector3) -> void:
	var fl = OmniLight3D.new()
	fl.light_color = Color("ffaa44")
	fl.light_energy = 9.5
	fl.omni_range = 14.0
	main_scene.add_child(fl)
	fl.global_position = m_pos + Vector3(0.0, 0.6, 0.0)
	var tw_l = fl.create_tween()
	tw_l.tween_property(fl, "light_energy", 0.0, 0.35)
	tw_l.tween_callback(fl.queue_free)

	for i in range(12):
		var p_mat = StandardMaterial3D.new()
		p_mat.albedo_color = Color(0.85, 0.88, 0.92, 0.80)
		p_mat.emission_enabled = true
		p_mat.emission = Color("ffaa55") if i < 4 else Color("cfd8e0")
		p_mat.emission_energy_multiplier = 2.4 if i < 4 else 0.5
		p_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

		var start_p = m_pos + Vector3(randf_range(-0.22, 0.22), float(i) * 0.26, randf_range(-0.22, 0.22))
		var puff = _sphere(0.32 + float(i % 3) * 0.12, p_mat, start_p)
		main_scene.add_child(puff)
		puff.global_position = start_p

		var tw = puff.create_tween()
		tw.tween_property(puff, "global_position", start_p + Vector3(randf_range(-0.8, 0.8), 2.8 + float(i) * 0.25, randf_range(-0.8, 0.8)), 0.75)
		tw.parallel().tween_property(puff, "scale", Vector3(2.6, 2.6, 2.6), 0.75)
		tw.parallel().tween_property(p_mat, "albedo_color:a", 0.0, 0.75)
		tw.tween_callback(puff.queue_free)


static func _spawn_dacs_side_thrusters(main_scene: Node, apex_pos: Vector3) -> void:
	var dl = OmniLight3D.new()
	dl.light_color = Color("ffaa22")
	dl.light_energy = 12.0
	dl.omni_range = 16.0
	main_scene.add_child(dl)
	dl.global_position = apex_pos
	var tw_l = dl.create_tween()
	tw_l.tween_property(dl, "light_energy", 0.0, 0.24)
	tw_l.tween_callback(dl.queue_free)

	var rot_list = [
		Vector3(0.0, 0.0, PI * 0.5),
		Vector3(0.0, 0.0, -PI * 0.5),
		Vector3(PI * 0.5, 0.0, 0.0),
		Vector3(-PI * 0.5, 0.0, 0.0)
	]
	for rot_v in rot_list:
		var j_mat = StandardMaterial3D.new()
		j_mat.albedo_color = Color(1.0, 0.68, 0.15, 0.94)
		j_mat.emission_enabled = true
		j_mat.emission = Color("ff9911")
		j_mat.emission_energy_multiplier = 6.5
		j_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		j_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		j_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

		var jet = _cyl(0.04, 0.38, 1.9, j_mat, apex_pos, rot_v)
		main_scene.add_child(jet)
		jet.global_position = apex_pos
		var tw = jet.create_tween()
		tw.tween_property(jet, "scale", Vector3(1.8, 1.8, 1.8), 0.22)
		tw.parallel().tween_property(j_mat, "albedo_color:a", 0.0, 0.22)
		tw.tween_callback(jet.queue_free)


static func _spawn_booster_ring(main_scene: Node, pos: Vector3) -> void:
	var r_mat = StandardMaterial3D.new()
	r_mat.albedo_color = Color(1.0, 0.82, 0.42, 0.90)
	r_mat.emission_enabled = true
	r_mat.emission = Color("ffbb44")
	r_mat.emission_energy_multiplier = 5.5
	r_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	r_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	r_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	var ring = MeshInstance3D.new()
	var torus = TorusMesh.new()
	torus.inner_radius = 0.35
	torus.outer_radius = 0.52
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
	s_mat.albedo_color = Color(0.90, 0.92, 0.96, 0.60)
	s_mat.emission_enabled = true
	s_mat.emission = Color("ffbb77")
	s_mat.emission_energy_multiplier = 0.65
	s_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var puff = _sphere(0.24, s_mat, pos)
	main_scene.add_child(puff)
	puff.global_position = pos

	var tw = puff.create_tween()
	tw.tween_property(puff, "scale", Vector3(2.4, 2.4, 2.4), 0.60)
	tw.parallel().tween_property(s_mat, "albedo_color:a", 0.0, 0.60)
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
