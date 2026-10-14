extends RefCounted

# ============================================================================
# 천궁-II (KM-SAM Block-II) 통합 방공포대 3D 비주얼 · 다기능레이더(MFR) · 교전통제소(ECS)
# · 콜드런치(Cold-Launch) & 측면추력기(DACS) & 주엔진 점화 · 레이더 전파/사이렌/비상등 시스템
# ============================================================================

static func apply(chassis: Node3D, font: Font) -> void:
	if not is_instance_valid(chassis) or chassis.has_node("K239Marking"):
		return

	# 1. 조종석 측면 제식 명판: 'KM-SAM' (기존 K-239 완전 교체)
	var mount: Node3D = Node3D.new()
	mount.name = "K239Marking"
	chassis.add_child(mount)
	mount.position = Vector3(-1.63, 1.93, -2.75)
	mount.rotation.y = -PI * 0.5

	var plate: MeshInstance3D = MeshInstance3D.new()
	var shape: BoxMesh = BoxMesh.new()
	shape.size = Vector3(3.18, 0.66, 0.022)
	plate.mesh = shape
	var backing: StandardMaterial3D = StandardMaterial3D.new()
	backing.albedo_color = Color("2b3424")
	backing.roughness = 0.72
	backing.metallic = 0.25
	plate.material_override = backing
	mount.add_child(plate)

	var text: MeshInstance3D = MeshInstance3D.new()
	text.name = "Designation_KM-SAM"
	var letters: TextMesh = TextMesh.new()
	letters.text = "KM-SAM"
	if font:
		letters.font = font
	letters.font_size = 86
	letters.pixel_size = 0.0085
	letters.depth = 0.002
	letters.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	letters.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	text.mesh = letters
	text.position.z = 0.015
	var paint: StandardMaterial3D = StandardMaterial3D.new()
	paint.albedo_color = Color("f4eed2")
	paint.roughness = 0.65
	paint.emission_enabled = true
	paint.emission = Color("f4eed2")
	paint.emission_energy_multiplier = 0.18
	text.material_override = paint
	text.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mount.add_child(text)

	# 2. 천궁-II 통합 방공포대 실시간 3D 컨트롤러 장착
	var launcher: Node3D = chassis.get_parent() as Node3D
	if not is_instance_valid(launcher):
		return
	if not launcher.has_node("CheongungBatteryController"):
		var ctrl: Node3D = CheongungBatteryController.new()
		ctrl.name = "CheongungBatteryController"
		ctrl.setup(launcher, chassis, font)
		launcher.add_child(ctrl)


class CheongungBatteryController extends Node3D:
	var launcher_root: Node3D
	var tel_chassis: Node3D
	var pod_rack: Node3D
	var ui_font: Font
	var main_scene: Node

	# 포대 주요 3D 노드
	var vertical_erector: Node3D
	var mfr_vehicle: Node3D
	var mfr_radar_head: Node3D
	var mfr_emitter_origin: Node3D
	var ecs_vehicle: Node3D

	# 8연장 수직발사관 상단 포구 노드 (Cold-Launch 사출 위치)
	var vertical_muzzles: Array[Node3D] = []
	var next_tube_idx: int = 0

	# 비상 경광등 (TEL 2기 + MFR 2기 + ECS 2기)
	var strobe_lights: Array[OmniLight3D] = []
	var strobe_domes: Array[MeshInstance3D] = []
	var strobe_rotors: Array[Node3D] = []

	# 레이더 전파 링 & 데이터링크 펄스 & 미사일 감지 링 풀
	var radar_waves: Array[Dictionary] = []
	var datalink_dots: Array[Dictionary] = []
	var target_lock_rings: Dictionary = {}
	var tracked_interceptors: Dictionary = {}
	var active_fx_items: Array[Dictionary] = []

	# 타이머 및 경보 상태
	var elapsed: float = 0.0
	var wave_spawn_timer: float = 0.0
	var lock_beam_timer: float = 0.0
	var prev_threat_count: int = 0
	var siren_active_timer: float = 0.0
	var siren_phase: float = 0.0

	# 사운드 합성기 (방공 사이렌 & 레이더 핑)
	var audio_player: AudioStreamPlayer
	var audio_playback: AudioStreamGeneratorPlayback

	# 공용 PBR 재질
	var mat_camo_olive: StandardMaterial3D
	var mat_camo_dark: StandardMaterial3D
	var mat_camo_brown: StandardMaterial3D
	var mat_camo_black: StandardMaterial3D
	var mat_chrome: StandardMaterial3D
	var mat_rubber: StandardMaterial3D
	var mat_glass: StandardMaterial3D
	var mat_radar_face: StandardMaterial3D
	var mat_strobe_on: StandardMaterial3D
	var mat_strobe_off: StandardMaterial3D

	func setup(p_launcher: Node3D, p_chassis: Node3D, p_font: Font) -> void:
		launcher_root = p_launcher
		tel_chassis = p_chassis
		ui_font = p_font
		process_priority = 1000

	func _ready() -> void:
		main_scene = get_tree().current_scene
		if is_instance_valid(launcher_root):
			pod_rack = launcher_root.find_child("PodRack", true, false) as Node3D

		_init_pbr_materials()
		_upgrade_3d_environment_and_lighting()
		_build_tel_vertical_launcher()
		_build_mfr_radar_vehicle()
		_build_ecs_command_vehicle()
		_build_datalink_network()
		_init_siren_audio()
		_override_launcher_sockets()

	func _init_pbr_materials() -> void:
		mat_camo_olive = StandardMaterial3D.new()
		mat_camo_olive.albedo_color = Color("435238")
		mat_camo_olive.roughness = 0.66
		mat_camo_olive.metallic = 0.22

		mat_camo_dark = StandardMaterial3D.new()
		mat_camo_dark.albedo_color = Color("273121")
		mat_camo_dark.roughness = 0.70
		mat_camo_dark.metallic = 0.25

		mat_camo_brown = StandardMaterial3D.new()
		mat_camo_brown.albedo_color = Color("5c4530")
		mat_camo_brown.roughness = 0.74
		mat_camo_brown.metallic = 0.15

		mat_camo_black = StandardMaterial3D.new()
		mat_camo_black.albedo_color = Color("1b2019")
		mat_camo_black.roughness = 0.58
		mat_camo_black.metallic = 0.35

		mat_chrome = StandardMaterial3D.new()
		mat_chrome.albedo_color = Color("dce6ef")
		mat_chrome.roughness = 0.14
		mat_chrome.metallic = 0.94

		mat_rubber = StandardMaterial3D.new()
		mat_rubber.albedo_color = Color("171a18")
		mat_rubber.roughness = 0.88
		mat_rubber.metallic = 0.08

		mat_glass = StandardMaterial3D.new()
		mat_glass.albedo_color = Color(0.38, 0.62, 0.78, 0.85)
		mat_glass.roughness = 0.12
		mat_glass.metallic = 0.65
		mat_glass.emission_enabled = true
		mat_glass.emission = Color("2a587a")
		mat_glass.emission_energy_multiplier = 0.35

		mat_radar_face = StandardMaterial3D.new()
		mat_radar_face.albedo_color = Color("3a6b6e")
		mat_radar_face.roughness = 0.28
		mat_radar_face.metallic = 0.55
		mat_radar_face.emission_enabled = true
		mat_radar_face.emission = Color("00e5ff")
		mat_radar_face.emission_energy_multiplier = 0.65

		mat_strobe_on = StandardMaterial3D.new()
		mat_strobe_on.albedo_color = Color("ff2a10")
		mat_strobe_on.emission_enabled = true
		mat_strobe_on.emission = Color("ff3814")
		mat_strobe_on.emission_energy_multiplier = 6.5

		mat_strobe_off = StandardMaterial3D.new()
		mat_strobe_off.albedo_color = Color("551810")
		mat_strobe_off.roughness = 0.35

	func _upgrade_3d_environment_and_lighting() -> void:
		if not is_instance_valid(main_scene):
			return
		var world_env: WorldEnvironment = main_scene.find_child("*", "WorldEnvironment", true, false) as WorldEnvironment
		if is_instance_valid(world_env) and is_instance_valid(world_env.environment):
			var env: Environment = world_env.environment
			env.tonemap_mode = Environment.TONE_MAPPER_ACES
			env.tonemap_exposure = 1.14
			env.glow_enabled = true
			env.glow_intensity = 1.22
			env.glow_strength = 1.06
			env.glow_bloom = 0.22
			env.glow_blend_mode = Environment.GLOW_BLEND_MODE_SOFTLIGHT

		# 포대 입체감을 살리는 전술 조명 (Key + Rim + Ground Fill)
		var key_light: OmniLight3D = OmniLight3D.new()
		key_light.light_color = Color("d8ecff")
		key_light.light_energy = 2.6
		key_light.omni_range = 24.0
		key_light.position = Vector3(0.0, 7.5, 6.0)
		add_child(key_light)

		var rim_light: OmniLight3D = OmniLight3D.new()
		rim_light.light_color = Color("66d8ff")
		rim_light.light_energy = 2.2
		rim_light.omni_range = 22.0
		rim_light.position = Vector3(-5.0, 5.5, -5.0)
		add_child(rim_light)

	func _build_tel_vertical_launcher() -> void:
		if not is_instance_valid(tel_chassis):
			return

		# 기존 천무 사각 포드(PodRack) 영구 숨김
		if is_instance_valid(pod_rack):
			pod_rack.visible = false
			for ch in pod_rack.get_children():
				if ch is VisualInstance3D:
					ch.visible = false

		vertical_erector = Node3D.new()
		vertical_erector.name = "CheongungVerticalErector"
		tel_chassis.add_child(vertical_erector)

		# A. 차체 중앙 전원/사격통제 쉘터 박스 & 수직 스페어 타이어 (실물 사진 고증)
		var gen_box: MeshInstance3D = _make_box(Vector3(2.28, 1.48, 1.52), mat_camo_olive, Vector3(0.0, 1.98, -0.58))
		vertical_erector.add_child(gen_box)
		var gen_camo: MeshInstance3D = _make_box(Vector3(2.30, 0.55, 0.82), mat_camo_brown, Vector3(0.0, 2.05, -0.45))
		vertical_erector.add_child(gen_camo)
		var gen_louver: MeshInstance3D = _make_box(Vector3(2.32, 0.46, 0.42), mat_camo_black, Vector3(0.0, 2.15, -0.95))
		vertical_erector.add_child(gen_louver)

		# 수직 스페어 타이어 (조종석과 발전기 사이)
		var spare_tire: MeshInstance3D = _make_cyl(0.52, 0.52, 0.34, mat_rubber, Vector3(-0.85, 1.82, -1.55), Vector3(0.0, 0.0, PI * 0.5))
		vertical_erector.add_child(spare_tire)

		# B. 90° 완전 수직 기립 8연장 원통형 발사관 어셈블리 (2행 x 4열, 사진 image_3f56ba.jpg 완벽 고증)
		var rack_root: Node3D = Node3D.new()
		rack_root.name = "VerticalCanisterRack"
		rack_root.position = Vector3(0.0, 1.30, 2.15)
		vertical_erector.add_child(rack_root)

		# 하단 기립 힌지 크래들 & 지지 베이스
		var base_pedestal: MeshInstance3D = _make_box(Vector3(2.54, 0.34, 1.56), mat_camo_black, Vector3(0.0, 0.15, 0.0))
		rack_root.add_child(base_pedestal)

		var x_cols: Array[float] = [-0.84, -0.28, 0.28, 0.84]
		var z_rows: Array[float] = [-0.32, 0.32]
		var tube_h: float = 4.55
		var tube_r: float = 0.235

		vertical_muzzles.clear()
		for rz in z_rows:
			for cx in x_cols:
				var t_node: Node3D = Node3D.new()
				t_node.position = Vector3(cx, 0.32, rz)
				rack_root.add_child(t_node)

				# 수직 원통형 발사관 본체 (국군 4색 위장무늬 다단 슬리브)
				var main_tube: MeshInstance3D = _make_cyl(tube_r, tube_r, tube_h, mat_camo_olive, Vector3(0.0, tube_h * 0.5, 0.0))
				t_node.add_child(main_tube)

				var band_brown: MeshInstance3D = _make_cyl(tube_r + 0.004, tube_r + 0.004, 1.05, mat_camo_brown, Vector3(0.0, tube_h * 0.32, 0.0))
				t_node.add_child(band_brown)

				var band_dark: MeshInstance3D = _make_cyl(tube_r + 0.004, tube_r + 0.004, 1.10, mat_camo_dark, Vector3(0.0, tube_h * 0.72, 0.0))
				t_node.add_child(band_dark)

				# 하단 가스발생기 사출 노즐 반구
				var breech: MeshInstance3D = _make_cyl(tube_r * 0.95, tube_r * 0.72, 0.26, mat_camo_black, Vector3(0.0, -0.10, 0.0))
				t_node.add_child(breech)

				# 상단 콜드런치 밀봉 돔 캡
				var top_cap: MeshInstance3D = _make_cyl(tube_r * 0.90, tube_r * 1.02, 0.12, mat_camo_dark, Vector3(0.0, tube_h + 0.05, 0.0))
				t_node.add_child(top_cap)

				# 포구 소켓 마커 (수직 발사 시작점)
				var muzzle: Node3D = Node3D.new()
				muzzle.position = Vector3(0.0, tube_h + 0.15, 0.0)
				t_node.add_child(muzzle)
				vertical_muzzles.append(muzzle)

		# C. 8연장 수직 원통을 감싸는 5단 사각 트러스 케이지 프레임 (실물 사진 핵심 디테일)
		for tier_y in [0.55, 1.48, 2.42, 3.36, 4.32]:
			var collar: MeshInstance3D = _make_box(Vector3(2.48, 0.16, 1.34), mat_camo_dark, Vector3(0.0, tier_y, 0.0))
			rack_root.add_child(collar)

		# 전면·후면·측면 수직 격자 기둥
		for sx in [-1.20, -0.56, 0.0, 0.56, 1.20]:
			for sz in [-0.62, 0.62]:
				var strut: MeshInstance3D = _make_box(Vector3(0.09, 4.35, 0.09), mat_camo_black, Vector3(sx, 2.45, sz))
				rack_root.add_child(strut)

		# 전면 사다리형 격자 트러스 케이지 (유압 실린더가 연결되는 면)
		for side_x in [-1.21, 1.21]:
			var side_plate: MeshInstance3D = _make_box(Vector3(0.06, 3.40, 1.28), mat_camo_olive, Vector3(side_x, 2.05, 0.0))
			rack_root.add_child(side_plate)

		# 수직 발사관 측면 제식 표기: '천궁-II KM-SAM'
		if ui_font:
			for s_dir in [-1.0, 1.0]:
				var r_badge: MeshInstance3D = MeshInstance3D.new()
				var r_tm: TextMesh = TextMesh.new()
				r_tm.text = "천궁-II KM-SAM"
				r_tm.font = ui_font
				r_tm.font_size = 52
				r_tm.pixel_size = 0.0068
				r_tm.depth = 0.002
				r_badge.mesh = r_tm
				r_badge.position = Vector3(s_dir * 1.26, 2.88, 0.0)
				r_badge.rotation.y = -PI * 0.5 if s_dir < 0.0 else PI * 0.5
				rack_root.add_child(r_badge)

		# D. 대각선 트윈 유압 기립 실린더 피스톤 (실물 사진의 은색 크롬 유압 실린더 고증!)
		for px in [-0.68, 0.68]:
			# 하단 외통 (올리브)
			var barrel: MeshInstance3D = _make_cyl(0.11, 0.11, 1.75, mat_camo_olive, Vector3(px, 2.05, 0.62), Vector3(deg_to_rad(38.0), 0.0, 0.0))
			vertical_erector.add_child(barrel)
			# 상단 내통 크롬 피스톤 로드 (은백색 고광택 금속)
			var chrome_rod: MeshInstance3D = _make_cyl(0.075, 0.075, 1.95, mat_chrome, Vector3(px, 2.95, 1.32), Vector3(deg_to_rad(38.0), 0.0, 0.0))
			vertical_erector.add_child(chrome_rod)

		# E. 4기 유압식 지면 고정 아웃트리거 지지대 & 측면 탑승 사다리 (실물 사진 고증)
		for jack_z in [-0.55, 2.82]:
			for jack_x in [-1.42, 1.42]:
				var leg_housing: MeshInstance3D = _make_box(Vector3(0.22, 1.15, 0.22), mat_camo_dark, Vector3(jack_x, 0.88, jack_z))
				vertical_erector.add_child(leg_housing)
				var leg_ram: MeshInstance3D = _make_cyl(0.07, 0.07, 0.65, mat_chrome, Vector3(jack_x, 0.32, jack_z))
				vertical_erector.add_child(leg_ram)
				var foot_pad: MeshInstance3D = _make_cyl(0.26, 0.28, 0.08, mat_camo_black, Vector3(jack_x, 0.04, jack_z))
				vertical_erector.add_child(foot_pad)

		# 측면 탑승 사다리 (후방 바퀴 앞쪽)
		for side_s in [-1.0, 1.0]:
			var lad_root: Node3D = Node3D.new()
			lad_root.position = Vector3(side_s * 1.38, 0.68, 0.85)
			lad_root.rotation.z = side_s * deg_to_rad(14.0)
			vertical_erector.add_child(lad_root)
			for rail_z in [-0.18, 0.18]:
				lad_root.add_child(_make_box(Vector3(0.04, 1.25, 0.04), mat_camo_black, Vector3(0.0, 0.0, rail_z)))
			for rung_i in range(5):
				var ry: float = -0.48 + float(rung_i) * 0.24
				lad_root.add_child(_make_box(Vector3(0.04, 0.03, 0.36), mat_chrome, Vector3(0.0, ry, 0.0)))

		# F. 조종석 루프 쌍열 비상 경광등 장착
		_add_emergency_strobe(vertical_erector, Vector3(-0.58, 3.02, -2.65), true)
		_add_emergency_strobe(vertical_erector, Vector3(0.58, 3.02, -2.65), false)

	func _build_mfr_radar_vehicle() -> void:
		# 좌측 후방에 다기능레이더(MFR) 8x8 차량 배치 (화면 좌측에 선명히 노출)
		mfr_vehicle = Node3D.new()
		mfr_vehicle.name = "CheongungMFRRadarVehicle"
		mfr_vehicle.position = Vector3(-5.8, 0.0, -1.4)
		mfr_vehicle.rotation.y = deg_to_rad(68.0)
		mfr_vehicle.scale = Vector3(0.82, 0.82, 0.82)
		add_child(mfr_vehicle)

		# 8x8 차체 프레임 및 조종석
		mfr_vehicle.add_child(_make_box(Vector3(2.35, 0.55, 6.20), mat_camo_dark, Vector3(0.0, 0.85, 0.0)))
		mfr_vehicle.add_child(_make_box(Vector3(2.30, 1.45, 1.75), mat_camo_olive, Vector3(0.0, 1.85, -2.15)))
		mfr_vehicle.add_child(_make_box(Vector3(2.10, 0.62, 0.08), mat_glass, Vector3(0.0, 2.02, -3.03)))
		# 레이더 전원/냉각 쉘터
		mfr_vehicle.add_child(_make_box(Vector3(2.32, 1.38, 3.60), mat_camo_olive, Vector3(0.0, 1.82, 0.85)))
		mfr_vehicle.add_child(_make_box(Vector3(2.34, 0.65, 1.60), mat_camo_brown, Vector3(0.0, 1.85, 0.60)))

		# 8륜 전술 타이어
		for wz in [-2.25, -0.95, 0.95, 2.25]:
			for wx in [-1.18, 1.18]:
				mfr_vehicle.add_child(_make_cyl(0.52, 0.52, 0.36, mat_rubber, Vector3(wx, 0.52, wz), Vector3(0.0, 0.0, PI * 0.5)))

		# 360도 회전 다기능 위상배열 레이더 안테나 (Planar Phased-Array Radar)
		mfr_radar_head = Node3D.new()
		mfr_radar_head.name = "MFRRotatingHead"
		mfr_radar_head.position = Vector3(0.0, 2.65, 1.25)
		mfr_vehicle.add_child(mfr_radar_head)

		# 회전 턴테이블 페데스탈
		mfr_radar_head.add_child(_make_cyl(0.78, 0.88, 0.45, mat_camo_black, Vector3(0.0, 0.22, 0.0)))
		# 후방 카운터웨이트 송수신 모듈 박스
		mfr_radar_head.add_child(_make_box(Vector3(1.65, 1.15, 1.20), mat_camo_olive, Vector3(0.0, 1.05, 0.45)))

		# 경사형 평면 위상배열 레이더 패널 (하늘을 향해 25도 젖혀진 대형 AESA 안테나)
		var array_pivot: Node3D = Node3D.new()
		array_pivot.position = Vector3(0.0, 1.55, -0.25)
		array_pivot.rotation.x = deg_to_rad(-28.0)
		mfr_radar_head.add_child(array_pivot)

		array_pivot.add_child(_make_box(Vector3(2.25, 2.55, 0.28), mat_camo_dark, Vector3.ZERO))
		array_pivot.add_child(_make_box(Vector3(2.05, 2.35, 0.06), mat_radar_face, Vector3(0.0, 0.0, -0.16)))

		# 전파 발사 원점 및 회전 스캔 빔 콘
		mfr_emitter_origin = Node3D.new()
		mfr_emitter_origin.position = Vector3(0.0, 0.2, -0.25)
		array_pivot.add_child(mfr_emitter_origin)

		var beam_mat: StandardMaterial3D = StandardMaterial3D.new()
		beam_mat.albedo_color = Color(0.0, 0.92, 1.0, 0.16)
		beam_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		beam_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		beam_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		beam_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
		var sweep_cone: MeshInstance3D = _make_cyl(2.8, 0.25, 11.0, beam_mat, Vector3(0.0, 0.0, -5.6), Vector3(PI * 0.5, 0.0, 0.0))
		mfr_emitter_origin.add_child(sweep_cone)

		# MFR 비상 경광등
		_add_emergency_strobe(mfr_vehicle, Vector3(-0.62, 2.72, -2.55), true)
		_add_emergency_strobe(mfr_vehicle, Vector3(0.62, 2.72, -2.55), false)

	func _build_ecs_command_vehicle() -> void:
		# 우측 후방에 교전통제소(ECS) 지휘차량 + 4연장 통신 안테나 배치 (그림 image_3f52a3.jpg 완벽 고증)
		ecs_vehicle = Node3D.new()
		ecs_vehicle.name = "CheongungECSCommandVehicle"
		ecs_vehicle.position = Vector3(5.8, 0.0, -1.4)
		ecs_vehicle.rotation.y = deg_to_rad(-68.0)
		ecs_vehicle.scale = Vector3(0.80, 0.80, 0.80)
		add_child(ecs_vehicle)

		ecs_vehicle.add_child(_make_box(Vector3(2.35, 0.55, 6.10), mat_camo_dark, Vector3(0.0, 0.85, 0.0)))
		ecs_vehicle.add_child(_make_box(Vector3(2.30, 1.45, 1.75), mat_camo_olive, Vector3(0.0, 1.85, -2.10)))
		ecs_vehicle.add_child(_make_box(Vector3(2.10, 0.62, 0.08), mat_glass, Vector3(0.0, 2.02, -2.98)))

		# 대형 교전통제 쉘터 컨테이너
		ecs_vehicle.add_child(_make_box(Vector3(2.42, 1.95, 3.85), mat_camo_olive, Vector3(0.0, 2.10, 0.90)))
		ecs_vehicle.add_child(_make_box(Vector3(2.44, 0.85, 1.85), mat_camo_brown, Vector3(0.0, 2.05, 0.80)))

		# 4연장 수직 다중대역 통신 안테나 (그림 좌측 하단 교전통제소 고증!)
		for az in [-0.65, 0.35, 1.35, 2.35]:
			ecs_vehicle.add_child(_make_cyl(0.025, 0.045, 3.40, mat_chrome, Vector3(-1.05, 4.75, az)))
			var tip_glow: MeshInstance3D = _make_sphere(0.09, mat_radar_face, Vector3(-1.05, 6.48, az))
			ecs_vehicle.add_child(tip_glow)

		for wz in [-2.20, -0.90, 0.90, 2.20]:
			for wx in [-1.18, 1.18]:
				ecs_vehicle.add_child(_make_cyl(0.52, 0.52, 0.36, mat_rubber, Vector3(wx, 0.52, wz), Vector3(0.0, 0.0, PI * 0.5)))

		# ECS 비상 경광등
		_add_emergency_strobe(ecs_vehicle, Vector3(-0.62, 2.72, -2.50), false)
		_add_emergency_strobe(ecs_vehicle, Vector3(0.62, 2.72, -2.50), true)

	func _build_datalink_network() -> void:
		# 다기능레이더(MFR) -> 교전통제소(ECS) -> 유도탄발사대(TEL) 전술 데이터링크 광파 펄스
		var link_mat: StandardMaterial3D = StandardMaterial3D.new()
		link_mat.albedo_color = Color(0.0, 0.95, 1.0, 0.9)
		link_mat.emission_enabled = true
		link_mat.emission = Color("00f0ff")
		link_mat.emission_energy_multiplier = 4.0

		for i in range(10):
			var dot1: MeshInstance3D = _make_sphere(0.11, link_mat, Vector3.ZERO)
			add_child(dot1)
			datalink_dots.append({
				"node": dot1,
				"from": Vector3(-5.2, 1.6, -1.2),
				"to": Vector3(5.2, 1.8, -1.2),
				"phase": float(i) / 10.0
			})
			var dot2: MeshInstance3D = _make_sphere(0.11, link_mat, Vector3.ZERO)
			add_child(dot2)
			datalink_dots.append({
				"node": dot2,
				"from": Vector3(5.2, 1.8, -1.2),
				"to": Vector3(0.0, 1.8, 0.0),
				"phase": float(i) / 10.0
			})

	func _add_emergency_strobe(parent_node: Node3D, pos: Vector3, phase_offset: bool) -> void:
		var base_cyl: MeshInstance3D = _make_cyl(0.12, 0.14, 0.08, mat_camo_black, pos)
		parent_node.add_child(base_cyl)

		var dome: MeshInstance3D = _make_cyl(0.09, 0.11, 0.18, mat_strobe_off, pos + Vector3(0.0, 0.12, 0.0))
		parent_node.add_child(dome)
		strobe_domes.append(dome)

		var light: OmniLight3D = OmniLight3D.new()
		light.light_color = Color("ff2600") if phase_offset else Color("ff8800")
		light.light_energy = 0.0
		light.omni_range = 14.0
		light.position = pos + Vector3(0.0, 0.25, 0.0)
		parent_node.add_child(light)
		strobe_lights.append(light)

		# 회전하는 경광등 불빛 콘 (비상 경보 시 회전)
		var rotor: Node3D = Node3D.new()
		rotor.position = pos + Vector3(0.0, 0.14, 0.0)
		if phase_offset:
			rotor.rotation.y = PI
		parent_node.add_child(rotor)

		var cone_mat: StandardMaterial3D = StandardMaterial3D.new()
		cone_mat.albedo_color = Color(1.0, 0.18, 0.05, 0.28) if phase_offset else Color(1.0, 0.58, 0.05, 0.28)
		cone_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		cone_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		cone_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		var cone_beam: MeshInstance3D = _make_cyl(0.85, 0.06, 3.2, cone_mat, Vector3(0.0, 0.0, 1.65), Vector3(PI * 0.5, 0.0, 0.0))
		rotor.add_child(cone_beam)
		rotor.visible = false
		strobe_rotors.append(rotor)

	func _init_siren_audio() -> void:
		audio_player = AudioStreamPlayer.new()
		var gen: AudioStreamGenerator = AudioStreamGenerator.new()
		gen.mix_rate = 22050.0
		gen.buffer_length = 0.25
		audio_player.stream = gen
		audio_player.volume_db = -9.5
		add_child(audio_player)
		audio_player.play()
		audio_playback = audio_player.get_stream_playback() as AudioStreamGeneratorPlayback

	func _override_launcher_sockets() -> void:
		if not is_instance_valid(main_scene) or vertical_muzzles.is_empty():
			return
		var new_sockets: Array = []
		for m in vertical_muzzles:
			new_sockets.append(launcher_root.to_local(m.global_position))
		if "launcher_sockets" in main_scene:
			main_scene.set("launcher_sockets", new_sockets)

	func _process(delta: float) -> void:
		elapsed += delta

		# 1. 천무 사각 포드(PodRack) 강제 숨김 및 8x8 TEL 차체 회전 고정 (90° 수직발사 자세 유지!)
		if is_instance_valid(pod_rack):
			pod_rack.visible = false
		if is_instance_valid(tel_chassis):
			tel_chassis.rotation = Vector3(0.0, PI * 0.5, 0.0)

		# 2. 다기능레이더(MFR) 360도 회전 및 전파 파장(Radar Wave Rings) 발사
		if is_instance_valid(mfr_radar_head):
			mfr_radar_head.rotation.y += delta * 2.35

		wave_spawn_timer += delta
		if wave_spawn_timer >= 0.42:
			wave_spawn_timer = 0.0
			_spawn_radar_wave_ring()

		_update_radar_waves(delta)
		_update_datalink_dots(delta)

		# 3. 적 미사일 실시간 감지 -> 감지 파장 링 + 비상 경광등 번쩍임 + 방공 사이렌 가동
		var threats: Array = _get_active_threats()
		var has_threats: bool = not threats.is_empty()
		if threats.size() > prev_threat_count:
			siren_active_timer = 2.8
		prev_threat_count = threats.size()

		_update_threat_radar_detection(threats, delta)
		_update_emergency_strobes(has_threats, delta)
		_update_siren_audio(has_threats, delta)

		# 4. 요격미사일 발사 시: 1) 수직 콜드런치 사출 -> 2) 측면 추력기(DACS) 점화 -> 3) 주 엔진 분사 및 폭발 고증!
		_update_interceptors_cold_launch(delta)
		_update_custom_fx(delta)

	func _spawn_radar_wave_ring() -> void:
		if not is_instance_valid(mfr_emitter_origin):
			return
		var ring_mesh: MeshInstance3D = MeshInstance3D.new()
		var torus: TorusMesh = TorusMesh.new()
		torus.inner_radius = 0.42
		torus.outer_radius = 0.54
		torus.rings = 28
		torus.ring_segments = 12
		ring_mesh.mesh = torus

		var mat: StandardMaterial3D = StandardMaterial3D.new()
		mat.albedo_color = Color(0.0, 0.94, 1.0, 0.85)
		mat.emission_enabled = true
		mat.emission = Color("00f2ff")
		mat.emission_energy_multiplier = 4.2
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		ring_mesh.material_override = mat

		main_scene.add_child(ring_mesh)
		ring_mesh.global_position = mfr_emitter_origin.global_position
		var forward_dir: Vector3 = (-mfr_emitter_origin.global_transform.basis.z + Vector3(0.0, 0.85, 0.0)).normalized()
		ring_mesh.rotation = Vector3(deg_to_rad(25.0), mfr_radar_head.rotation.y, 0.0)

		radar_waves.append({
			"node": ring_mesh,
			"mat": mat,
			"vel": forward_dir * 16.5,
			"age": 0.0,
			"max_age": 1.65
		})

	func _update_radar_waves(delta: float) -> void:
		var alive: Array[Dictionary] = []
		for w in radar_waves:
			var node: MeshInstance3D = w["node"]
			if not is_instance_valid(node):
				continue
			var age: float = float(w["age"]) + delta
			var max_age: float = float(w["max_age"])
			if age >= max_age:
				node.queue_free()
				continue
			w["age"] = age
			var t: float = age / max_age
			node.global_position += (w["vel"] as Vector3) * delta
			var sc: float = 1.0 + t * 9.5
			node.scale = Vector3(sc, 1.0, sc)
			var mat: StandardMaterial3D = w["mat"]
			mat.albedo_color.a = (1.0 - t) * 0.78
			alive.append(w)
		radar_waves = alive

	func _update_datalink_dots(delta: float) -> void:
		for d in datalink_dots:
			var node: MeshInstance3D = d["node"]
			if not is_instance_valid(node):
				continue
			var ph: float = fmod(float(d["phase"]) + delta * 1.35, 1.0)
			d["phase"] = ph
			var p0: Vector3 = d["from"]
			var p1: Vector3 = d["to"]
			node.position = p0.lerp(p1, ph) + Vector3(0.0, sin(ph * PI) * 0.45, 0.0)

	func _get_active_threats() -> Array:
		var result: Array = []
		if not is_instance_valid(main_scene):
			return result
		var raw = main_scene.get("missiles")
		if raw is Array:
			for item in raw:
				var m_node: Node3D = _extract_node3d(item)
				if is_instance_valid(m_node) and m_node.visible:
					result.append(m_node)
		return result

	func _extract_node3d(item) -> Node3D:
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

	func _update_threat_radar_detection(threats: Array, delta: float) -> void:
		var current_ids: Dictionary = {}
		lock_beam_timer += delta

		for m_node in threats:
			var id: int = m_node.get_instance_id()
			current_ids[id] = true
			if not target_lock_rings.has(id):
				# 적 미사일 주변에 생성되는 3D 레이더 전파 감지 파장 링 (적색 경보 링 + 청록색 스캔 링)
				var holder: Node3D = Node3D.new()
				main_scene.add_child(holder)

				var r_mat1: StandardMaterial3D = StandardMaterial3D.new()
				r_mat1.albedo_color = Color(1.0, 0.18, 0.22, 0.88)
				r_mat1.emission_enabled = true
				r_mat1.emission = Color("ff2233")
				r_mat1.emission_energy_multiplier = 4.5
				r_mat1.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
				r_mat1.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
				r_mat1.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

				var ring1: MeshInstance3D = MeshInstance3D.new()
				var t1: TorusMesh = TorusMesh.new()
				t1.inner_radius = 0.85
				t1.outer_radius = 1.02
				ring1.mesh = t1
				ring1.rotation.x = PI * 0.5
				ring1.material_override = r_mat1
				holder.add_child(ring1)

				var r_mat2: StandardMaterial3D = StandardMaterial3D.new()
				r_mat2.albedo_color = Color(0.0, 0.95, 1.0, 0.75)
				r_mat2.emission_enabled = true
				r_mat2.emission = Color("00f0ff")
				r_mat2.emission_energy_multiplier = 3.8
				r_mat2.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
				r_mat2.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
				r_mat2.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

				var ring2: MeshInstance3D = MeshInstance3D.new()
				var t2: TorusMesh = TorusMesh.new()
				t2.inner_radius = 1.35
				t2.outer_radius = 1.48
				ring2.mesh = t2
				ring2.rotation.x = PI * 0.5
				ring2.material_override = r_mat2
				holder.add_child(ring2)

				target_lock_rings[id] = {"holder": holder, "ring1": ring1, "ring2": ring2, "phase": 0.0}

			var entry: Dictionary = target_lock_rings[id]
			var holder_node: Node3D = entry["holder"]
			if is_instance_valid(holder_node):
				holder_node.global_position = m_node.global_position
				var ph: float = float(entry["phase"]) + delta * 5.2
				entry["phase"] = ph
				var s1: float = 0.85 + 0.35 * (0.5 + 0.5 * sin(ph))
				var s2: float = 1.35 - 0.35 * (0.5 + 0.5 * sin(ph))
				(entry["ring1"] as Node3D).scale = Vector3(s1, 1.0, s1)
				(entry["ring2"] as Node3D).scale = Vector3(s2, 1.0, s2)

		# 다기능레이더(MFR)에서 감지된 적 미사일로 수시로 발사되는 전파 스캔 락온 빔
		if not threats.is_empty() and lock_beam_timer >= 0.55 and is_instance_valid(mfr_emitter_origin):
			lock_beam_timer = 0.0
			var target_m: Node3D = threats[randi() % threats.size()]
			_spawn_radar_lock_beam(mfr_emitter_origin.global_position, target_m.global_position)

		var stale_ids: Array = []
		for id in target_lock_rings.keys():
			if not current_ids.has(id):
				var h: Node3D = target_lock_rings[id]["holder"]
				if is_instance_valid(h):
					# 미사일이 사라진 위치(요격 성공 지점)에 고고도 요격 폭발 이펙트 생성!
					if h.global_position.y > 2.5:
						_spawn_aerial_interception_explosion(h.global_position)
					h.queue_free()
				stale_ids.append(id)
		for id in stale_ids:
			target_lock_rings.erase(id)

	func _spawn_radar_lock_beam(from_pos: Vector3, to_pos: Vector3) -> void:
		var dist: float = from_pos.distance_to(to_pos)
		if dist < 0.5:
			return
		var beam: MeshInstance3D = MeshInstance3D.new()
		var cyl: CylinderMesh = CylinderMesh.new()
		cyl.top_radius = 0.08
		cyl.bottom_radius = 0.18
		cyl.height = dist
		beam.mesh = cyl

		var mat: StandardMaterial3D = StandardMaterial3D.new()
		mat.albedo_color = Color(0.0, 0.96, 1.0, 0.65)
		mat.emission_enabled = true
		mat.emission = Color("00f5ff")
		mat.emission_energy_multiplier = 5.0
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		beam.material_override = mat

		main_scene.add_child(beam)
		beam.global_position = (from_pos + to_pos) * 0.5
		beam.look_at_from_position(beam.global_position, to_pos, Vector3.UP)
		beam.rotate_object_local(Vector3.RIGHT, PI * 0.5)

		active_fx_items.append({
			"node": beam,
			"mat": mat,
			"age": 0.0,
			"max_age": 0.28,
			"scale_rate": 0.0
		})

	func _update_emergency_strobes(alert_on: bool, delta: float) -> void:
		for i in range(strobe_lights.size()):
			var l: OmniLight3D = strobe_lights[i]
			var d: MeshInstance3D = strobe_domes[i]
			var r: Node3D = strobe_rotors[i]
			if not is_instance_valid(l):
				continue
			if alert_on:
				var pulse: float = sin(elapsed * 18.0 + float(i) * PI)
				var is_bright: bool = pulse > 0.0
				l.light_energy = 11.5 if is_bright else 1.2
				d.material_override = mat_strobe_on if is_bright else mat_strobe_off
				r.visible = true
				r.rotation.y += delta * 11.0
			else:
				l.light_energy = 0.0
				d.material_override = mat_strobe_off
				r.visible = false

	func _update_siren_audio(alert_on: bool, delta: float) -> void:
		if siren_active_timer > 0.0:
			siren_active_timer -= delta
		if not is_instance_valid(audio_player) or audio_playback == null:
			return
		if not alert_on or siren_active_timer <= 0.0:
			return
		var frames: int = audio_playback.get_frames_available()
		if frames <= 0:
			return
		var mix_rate: float = 22050.0
		for _i in range(min(frames, 512)):
			siren_phase += 1.0 / mix_rate
			# 방공 경보 사이렌 (520Hz ~ 880Hz 주기적 상승·하강 + 레이더 락온 삐빅 펄스)
			var lfo: float = 0.5 + 0.5 * sin(siren_phase * TAU * 1.45)
			var freq: float = lerp(520.0, 880.0, lfo)
			var sample: float = sin(siren_phase * TAU * freq) * 0.14
			if fmod(siren_phase, 0.65) < 0.055:
				sample += sin(siren_phase * TAU * 1680.0) * 0.12
			audio_playback.push_frame(Vector2(sample, sample))

	func _update_interceptors_cold_launch(delta: float) -> void:
		if not is_instance_valid(main_scene):
			return
		var raw_list = main_scene.get("interceptors")
		var current_int_ids: Dictionary = {}

		if raw_list is Array:
			for item in raw_list:
				var i_node: Node3D = _extract_node3d(item)
				if not is_instance_valid(i_node):
					continue
				var id: int = i_node.get_instance_id()
				current_int_ids[id] = true

				if not tracked_interceptors.has(id):
					# 신규 요격미사일 발사 감지! -> 8연장 수직발사관 중 현재 포구에서 수직 콜드런치 시작!
					var muzzle_pos: Vector3 = launcher_root.global_position + Vector3(0.0, 5.8, 0.0)
					if not vertical_muzzles.is_empty():
						var m_node: Node3D = vertical_muzzles[next_tube_idx % vertical_muzzles.size()]
						next_tube_idx += 1
						if is_instance_valid(m_node):
							muzzle_pos = m_node.global_position

					_attach_cheongung_missile_visual(i_node)
					_spawn_cold_launch_plume(muzzle_pos)

					tracked_interceptors[id] = {
						"node": i_node,
						"muzzle_pos": muzzle_pos,
						"age": 0.0,
						"dacs_fired": false,
						"booster_fired": false,
						"trail_timer": 0.0,
						"last_pos": muzzle_pos
					}

				var st: Dictionary = tracked_interceptors[id]
				var age: float = float(st["age"]) + delta
				st["age"] = age
				var m_pos: Vector3 = st["muzzle_pos"]
				var engine_target_pos: Vector3 = i_node.global_position

				if age < 0.20:
					# [1단계: 수직 콜드런치 사출] 90도 수직으로 하늘을 향해 솟구침 (주 엔진 점화 전)
					var rise_t: float = age / 0.20
					var cold_pos: Vector3 = m_pos + Vector3(0.0, rise_t * 4.6, 0.0)
					i_node.global_position = cold_pos
					i_node.rotation = Vector3(-PI * 0.5, 0.0, 0.0)
				elif age < 0.34:
					# [2단계: 측면 추력기(DACS) 초기 방향전환!] 공중에서 측면 화염 스파크를 뿜으며 표적 쪽으로 기수 회전
					if not bool(st["dacs_fired"]):
						st["dacs_fired"] = true
						var apex_pos: Vector3 = m_pos + Vector3(0.0, 4.6, 0.0)
						_spawn_side_thruster_dacs_burst(apex_pos, engine_target_pos - apex_pos)
					var blend_t: float = (age - 0.20) / 0.14
					var apex: Vector3 = m_pos + Vector3(0.0, 4.6, 0.0)
					i_node.global_position = apex.lerp(engine_target_pos, blend_t)
				else:
					# [3단계: 주 로켓 추진기관 폭발 점화 및 비행 유도]
					if not bool(st["booster_fired"]):
						st["booster_fired"] = true
						_spawn_main_booster_ignition_ring(i_node.global_position)
						var plume: Node3D = i_node.find_child("CheongungMainPlume", true, false) as Node3D
						if is_instance_valid(plume):
							plume.visible = true

					var tt: float = float(st["trail_timer"]) + delta
					if tt >= 0.028:
						tt = 0.0
						_spawn_contrail_smoke(i_node.global_position)
					st["trail_timer"] = tt

				st["last_pos"] = i_node.global_position

		var finished_ids: Array = []
		for id in tracked_interceptors.keys():
			if not current_int_ids.has(id):
				var last_p: Vector3 = tracked_interceptors[id]["last_pos"]
				_spawn_aerial_interception_explosion(last_p)
				finished_ids.append(id)
		for id in finished_ids:
			tracked_interceptors.erase(id)

	func _attach_cheongung_missile_visual(i_node: Node3D) -> void:
		if i_node.has_node("CheongungMissileBody"):
			return
		var body_root: Node3D = Node3D.new()
		body_root.name = "CheongungMissileBody"
		i_node.add_child(body_root)

		# 천궁-II 유도탄 실물 고증 (백색 레이돔 노즈콘 + 적색 측면추력기 링 + 다크 건메탈 동체 + 스트레이크 날개)
		var white_mat: StandardMaterial3D = StandardMaterial3D.new()
		white_mat.albedo_color = Color("f5f8fc")
		white_mat.roughness = 0.30

		var red_mat: StandardMaterial3D = StandardMaterial3D.new()
		red_mat.albedo_color = Color("e62e1f")
		red_mat.emission_enabled = true
		red_mat.emission = Color("ff3b28")
		red_mat.emission_energy_multiplier = 0.8

		body_root.add_child(_make_cyl(0.0, 0.13, 0.55, white_mat, Vector3(0.0, 0.0, -1.15), Vector3(PI * 0.5, 0.0, 0.0)))
		body_root.add_child(_make_cyl(0.132, 0.132, 0.24, red_mat, Vector3(0.0, 0.0, -0.76), Vector3(PI * 0.5, 0.0, 0.0)))
		body_root.add_child(_make_cyl(0.13, 0.13, 1.55, mat_camo_black, Vector3(0.0, 0.0, 0.12), Vector3(PI * 0.5, 0.0, 0.0)))

		# 주 로켓 엔진 다중 화염 플룸 (초기 콜드런치 단계에서는 숨겨두었다가 주 엔진 점화 시 활성화!)
		var plume_root: Node3D = Node3D.new()
		plume_root.name = "CheongungMainPlume"
		plume_root.position = Vector3(0.0, 0.0, 0.95)
		plume_root.visible = false
		body_root.add_child(plume_root)

		var core_mat: StandardMaterial3D = StandardMaterial3D.new()
		core_mat.albedo_color = Color(1.0, 0.98, 0.85, 0.95)
		core_mat.emission_enabled = true
		core_mat.emission = Color("fff6cc")
		core_mat.emission_energy_multiplier = 8.0
		core_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

		var outer_mat: StandardMaterial3D = StandardMaterial3D.new()
		outer_mat.albedo_color = Color(1.0, 0.42, 0.08, 0.80)
		outer_mat.emission_enabled = true
		outer_mat.emission = Color("ff5500")
		outer_mat.emission_energy_multiplier = 5.5
		outer_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		outer_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		outer_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

		plume_root.add_child(_make_cyl(0.11, 0.01, 1.15, core_mat, Vector3(0.0, 0.0, 0.58), Vector3(PI * 0.5, 0.0, 0.0)))
		plume_root.add_child(_make_cyl(0.24, 0.02, 2.25, outer_mat, Vector3(0.0, 0.0, 1.12), Vector3(PI * 0.5, 0.0, 0.0)))

		var tail_light: OmniLight3D = OmniLight3D.new()
		tail_light.light_color = Color("ff8822")
		tail_light.light_energy = 6.5
		tail_light.omni_range = 12.0
		plume_root.add_child(tail_light)

	func _spawn_cold_launch_plume(muzzle_pos: Vector3) -> void:
		# 수직 발사관 상단에서 솟구치는 콜드런치 가스 사출 연기 기둥 및 화염 광원
		var flash: OmniLight3D = OmniLight3D.new()
		flash.light_color = Color("ffaa44")
		flash.light_energy = 9.0
		flash.omni_range = 14.0
		flash.position = muzzle_pos + Vector3(0.0, 0.6, 0.0)
		main_scene.add_child(flash)
		var tw: Tween = main_scene.create_tween()
		tw.tween_property(flash, "light_energy", 0.0, 0.32)
		tw.tween_callback(flash.queue_free)

		for i in range(14):
			var puff_mat: StandardMaterial3D = StandardMaterial3D.new()
			puff_mat.albedo_color = Color(0.84, 0.87, 0.90, 0.78)
			puff_mat.emission_enabled = true
			puff_mat.emission = Color("ffaa55") if i < 4 else Color("cfd8e0")
			puff_mat.emission_energy_multiplier = 2.2 if i < 4 else 0.45
			puff_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

			var puff: MeshInstance3D = _make_sphere(0.32 + float(i % 3) * 0.12, puff_mat, muzzle_pos + Vector3(randf_range(-0.22, 0.22), float(i) * 0.28, randf_range(-0.22, 0.22)))
			main_scene.add_child(puff)
			active_fx_items.append({
				"node": puff,
				"mat": puff_mat,
				"vel": Vector3(randf_range(-1.2, 1.2), 3.5 + float(i) * 0.35, randf_range(-1.2, 1.2)),
				"age": 0.0,
				"max_age": 0.75 + randf() * 0.35,
				"scale_rate": 2.4
			})

	func _spawn_side_thruster_dacs_burst(apex_pos: Vector3, target_dir: Vector3) -> void:
		# ④ 측면 추력기(DACS) 초기 방향전환! 공중에서 좌우로 뿜어져 나오는 강렬한 측면 추력 스파크 화염
		var dacs_light: OmniLight3D = OmniLight3D.new()
		dacs_light.light_color = Color("ffaa22")
		dacs_light.light_energy = 12.0
		dacs_light.omni_range = 16.0
		dacs_light.position = apex_pos
		main_scene.add_child(dacs_light)
		var tw: Tween = main_scene.create_tween()
		tw.tween_property(dacs_light, "light_energy", 0.0, 0.22)
		tw.tween_callback(dacs_light.queue_free)

		var side_dirs: Array[Vector3] = [
			Vector3.LEFT, Vector3.RIGHT, Vector3.FORWARD, Vector3.BACK,
			(-target_dir.normalized() + Vector3(0.3, 0.2, 0.0)).normalized()
		]
		for sdir in side_dirs:
			var jet_mat: StandardMaterial3D = StandardMaterial3D.new()
			jet_mat.albedo_color = Color(1.0, 0.68, 0.15, 0.92)
			jet_mat.emission_enabled = true
			jet_mat.emission = Color("ff9911")
			jet_mat.emission_energy_multiplier = 6.5
			jet_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
			jet_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
			jet_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

			var jet: MeshInstance3D = _make_cyl(0.04, 0.36, 1.85, jet_mat, apex_pos + sdir * 0.95)
			main_scene.add_child(jet)
			jet.look_at_from_position(jet.global_position, apex_pos + sdir * 3.0, Vector3.UP)
			jet.rotate_object_local(Vector3.RIGHT, PI * 0.5)

			active_fx_items.append({
				"node": jet,
				"mat": jet_mat,
				"vel": sdir * 4.5,
				"age": 0.0,
				"max_age": 0.22,
				"scale_rate": 1.8
			})

	func _spawn_main_booster_ignition_ring(pos: Vector3) -> void:
		# ⑤ 주 추진기관 점화 시 공중에 퍼지는 초음속 마하 충격파 링
		var ring_mat: StandardMaterial3D = StandardMaterial3D.new()
		ring_mat.albedo_color = Color(1.0, 0.82, 0.42, 0.90)
		ring_mat.emission_enabled = true
		ring_mat.emission = Color("ffbb44")
		ring_mat.emission_energy_multiplier = 5.5
		ring_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		ring_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		ring_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

		var ring: MeshInstance3D = MeshInstance3D.new()
		var torus: TorusMesh = TorusMesh.new()
		torus.inner_radius = 0.35
		torus.outer_radius = 0.52
		ring.mesh = torus
		ring.material_override = ring_mat
		main_scene.add_child(ring)
		ring.global_position = pos

		active_fx_items.append({
			"node": ring,
			"mat": ring_mat,
			"vel": Vector3.ZERO,
			"age": 0.0,
			"max_age": 0.38,
			"scale_rate": 7.5
		})

	func _spawn_contrail_smoke(pos: Vector3) -> void:
		var sm_mat: StandardMaterial3D = StandardMaterial3D.new()
		sm_mat.albedo_color = Color(0.90, 0.92, 0.96, 0.62)
		sm_mat.emission_enabled = true
		sm_mat.emission = Color("ffbb77")
		sm_mat.emission_energy_multiplier = 0.65
		sm_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

		var puff: MeshInstance3D = _make_sphere(0.24, sm_mat, pos)
		main_scene.add_child(puff)
		active_fx_items.append({
			"node": puff,
			"mat": sm_mat,
			"vel": Vector3(randf_range(-0.4, 0.4), randf_range(-0.2, 0.5), randf_range(-0.4, 0.4)),
			"age": 0.0,
			"max_age": 0.65,
			"scale_rate": 2.2
		})

	func _spawn_aerial_interception_explosion(pos: Vector3) -> void:
		# ⑥ 목표물 타격! 고고도 다중 충격파 및 파편 폭발 이펙트
		var exp_light: OmniLight3D = OmniLight3D.new()
		exp_light.light_color = Color("ff7722")
		exp_light.light_energy = 16.0
		exp_light.omni_range = 30.0
		exp_light.position = pos
		main_scene.add_child(exp_light)
		var tw: Tween = main_scene.create_tween()
		tw.tween_property(exp_light, "light_energy", 0.0, 0.55)
		tw.tween_callback(exp_light.queue_free)

		# 중심 코어 화구
		var core_mat: StandardMaterial3D = StandardMaterial3D.new()
		core_mat.albedo_color = Color(1.0, 0.85, 0.35, 0.95)
		core_mat.emission_enabled = true
		core_mat.emission = Color("ffaa22")
		core_mat.emission_energy_multiplier = 7.5
		core_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		core_mat.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
		core_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

		var fireball: MeshInstance3D = _make_sphere(0.85, core_mat, pos)
		main_scene.add_child(fireball)
		active_fx_items.append({
			"node": fireball,
			"mat": core_mat,
			"vel": Vector3.ZERO,
			"age": 0.0,
			"max_age": 0.48,
			"scale_rate": 6.8
		})

		# 초음속 충격파 링 2겹
		for r_rot in [Vector3.ZERO, Vector3(PI * 0.35, 0.0, PI * 0.25)]:
			var sw_mat: StandardMaterial3D = core_mat.duplicate() as StandardMaterial3D
			var sw_ring: MeshInstance3D = MeshInstance3D.new()
			var torus: TorusMesh = TorusMesh.new()
			torus.inner_radius = 0.55
			torus.outer_radius = 0.72
			sw_ring.mesh = torus
			sw_ring.rotation = r_rot
			sw_ring.material_override = sw_mat
			main_scene.add_child(sw_ring)
			sw_ring.global_position = pos
			active_fx_items.append({
				"node": sw_ring,
				"mat": sw_mat,
				"vel": Vector3.ZERO,
				"age": 0.0,
				"max_age": 0.52,
				"scale_rate": 9.5
			})

		# 사방으로 튀는 고열 파편 스파크 16개
		for _i in range(16):
			var dir: Vector3 = Vector3(randf_range(-1.0, 1.0), randf_range(-0.8, 1.0), randf_range(-1.0, 1.0)).normalized()
			var sp_mat: StandardMaterial3D = core_mat.duplicate() as StandardMaterial3D
			var spark: MeshInstance3D = _make_sphere(0.16, sp_mat, pos)
			main_scene.add_child(spark)
			active_fx_items.append({
				"node": spark,
				"mat": sp_mat,
				"vel": dir * randf_range(9.0, 18.0),
				"age": 0.0,
				"max_age": 0.45 + randf() * 0.25,
				"scale_rate": -0.5
			})

	func _update_custom_fx(delta: float) -> void:
		var alive: Array[Dictionary] = []
		for item in active_fx_items:
			var node: Node3D = item["node"]
			if not is_instance_valid(node):
				continue
			var age: float = float(item["age"]) + delta
			var max_age: float = float(item["max_age"])
			if age >= max_age:
				node.queue_free()
				continue
			item["age"] = age
			var t: float = age / max_age
			if item.has("vel"):
				node.global_position += (item["vel"] as Vector3) * delta
			var sr: float = float(item.get("scale_rate", 0.0))
			if sr != 0.0:
				var sc: float = max(0.05, 1.0 + t * sr)
				node.scale = Vector3.ONE * sc
			var mat: StandardMaterial3D = item.get("mat") as StandardMaterial3D
			if is_instance_valid(mat):
				mat.albedo_color.a = max(0.0, (1.0 - t) * 0.90)
			alive.append(item)
		active_fx_items = alive

	func _make_box(sz: Vector3, mat: Material, pos: Vector3, rot: Vector3 = Vector3.ZERO) -> MeshInstance3D:
		var mi: MeshInstance3D = MeshInstance3D.new()
		var bm: BoxMesh = BoxMesh.new()
		bm.size = sz
		mi.mesh = bm
		mi.material_override = mat
		mi.position = pos
		mi.rotation = rot
		return mi

	func _make_cyl(top_r: float, bot_r: float, h: float, mat: Material, pos: Vector3, rot: Vector3 = Vector3.ZERO) -> MeshInstance3D:
		var mi: MeshInstance3D = MeshInstance3D.new()
		var cm: CylinderMesh = CylinderMesh.new()
		cm.top_radius = top_r
		cm.bottom_radius = bot_r
		cm.height = h
		cm.radial_segments = 20
		mi.mesh = cm
		mi.material_override = mat
		mi.position = pos
		mi.rotation = rot
		return mi

	func _make_sphere(r: float, mat: Material, pos: Vector3) -> MeshInstance3D:
		var mi: MeshInstance3D = MeshInstance3D.new()
		var sm: SphereMesh = SphereMesh.new()
		sm.radius = r
		sm.height = r * 2.0
		sm.radial_segments = 14
		sm.rings = 8
		mi.mesh = sm
		mi.material_override = mat
		mi.position = pos
		return mi
