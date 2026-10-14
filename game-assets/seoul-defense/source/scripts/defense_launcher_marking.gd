extends RefCounted

# 천궁-II (KM-SAM Block-II) 통합 방공 포대 (v7.0 - v3 검증 엔진 코어 + 남산 도로 겹침 0% + 3단 직각 콜드런치)
static func apply(chassis: Node3D, font: Font) -> void:
	if not is_instance_valid(chassis) or chassis.has_node("K239Marking"):
		return

	var launcher := chassis.get_parent() as Node3D
	if not is_instance_valid(launcher):
		return

	# 남산 스테이지 건물·버스 스케일과 조화되도록 발사대 축소(0.55x) 및 한강대교 왼쪽 강변 잔디공원으로 이동 (다리 도로 겹침 0%)
	chassis.position = Vector3(-1.45, 0.0, -0.25)
	chassis.scale = Vector3(0.55, 0.55, 0.55)

	# 1. 캡 측면 'KM-SAM' 명판 (기존 'K-239' 완전 대체)
	var mount := Node3D.new()
	mount.name = "K239Marking"
	chassis.add_child(mount)
	mount.position = Vector3(-1.628, 1.93, -2.75)
	mount.rotation.y = -PI * 0.5

	var plate := MeshInstance3D.new()
	var shape := BoxMesh.new()
	shape.size = Vector3(3.16, 0.64, 0.022)
	plate.mesh = shape
	var backing := StandardMaterial3D.new()
	backing.albedo_color = Color("2b3527")
	backing.roughness = 0.62
	backing.metallic = 0.25
	plate.material_override = backing
	mount.add_child(plate)

	var border := MeshInstance3D.new()
	var border_box := BoxMesh.new()
	border_box.size = Vector3(3.24, 0.72, 0.012)
	border.mesh = border_box
	border.position.z = -0.004
	var border_mat := StandardMaterial3D.new()
	border_mat.albedo_color = Color("c8b88a")
	border_mat.roughness = 0.45
	border_mat.metallic = 0.55
	border.material_override = border_mat
	mount.add_child(border)

	var text := MeshInstance3D.new()
	text.name = "Designation_KM-SAM"
	var letters := TextMesh.new()
	letters.text = "KM-SAM"
	letters.font = font
	letters.font_size = 86
	letters.pixel_size = 0.0085
	letters.depth = 0.004
	letters.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	letters.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	text.mesh = letters
	text.position.z = 0.015
	var paint := StandardMaterial3D.new()
	paint.albedo_color = Color("f6f1d5")
	paint.roughness = 0.45
	paint.emission_enabled = true
	paint.emission = Color("f6f1d5")
	paint.emission_energy_multiplier = 0.35
	text.material_override = paint
	text.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mount.add_child(text)

	# 2. 발사대 차량 지붕 적색 방공 경광등 & 하부 네온 패드 및 아웃리거
	_build_tel_details(chassis)

	# 3. 천무 사각형 포드(PodRack) 숨김 후 천궁-II 8연장 90도 수직 원통형 콜드런치 발사관 장착
	var pod_rack := launcher.find_child("PodRack", true, false) as Node3D
	if is_instance_valid(pod_rack):
		_apply_cheongung_canisters(pod_rack, font)

	# 4. 좌측 다기능레이더(MFR) 차량 + 우측 교전통제소(ECS) 차량 (남산 다리 왼쪽 잔디공원에 배치해 도로 겹침 0%)
	_apply_radar_and_ecs(launcher, font)

	# 5. 실시간 애니메이션 드라이버 (레이더 회전·탐지 링·경광등·사이렌·3단 직각 콜드런치)
	_ensure_runtime_driver(launcher)


static func _mat(col: String, rough: float = 0.65, metal: float = 0.25, emis: String = "", emis_e: float = 0.0, alpha: float = 1.0) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	var c := Color(col)
	c.a = alpha
	m.albedo_color = c
	m.roughness = rough
	m.metallic = metal
	if alpha < 0.999:
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		m.cull_mode = BaseMaterial3D.CULL_DISABLED
	if emis != "":
		m.emission_enabled = true
		m.emission = Color(emis)
		m.emission_energy_multiplier = emis_e
	return m


static func _box(parent: Node3D, sz: Vector3, pos: Vector3, mat: Material, rot_deg: Vector3 = Vector3.ZERO, nm: String = "") -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	if nm != "":
		mi.name = nm
	var bm := BoxMesh.new()
	bm.size = sz
	mi.mesh = bm
	mi.position = pos
	mi.rotation_degrees = rot_deg
	mi.material_override = mat
	parent.add_child(mi)
	return mi


static func _cyl(parent: Node3D, r_top: float, r_bot: float, h: float, pos: Vector3, mat: Material, rot_deg: Vector3 = Vector3.ZERO, segs: int = 24, nm: String = "") -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	if nm != "":
		mi.name = nm
	var cm := CylinderMesh.new()
	cm.top_radius = r_top
	cm.bottom_radius = r_bot
	cm.height = h
	cm.radial_segments = segs
	mi.mesh = cm
	mi.position = pos
	mi.rotation_degrees = rot_deg
	mi.material_override = mat
	parent.add_child(mi)
	return mi


static func _sphere(parent: Node3D, r: float, h: float, pos: Vector3, mat: Material, nm: String = "") -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	if nm != "":
		mi.name = nm
	var sm := SphereMesh.new()
	sm.radius = r
	sm.height = h
	mi.mesh = sm
	mi.position = pos
	mi.material_override = mat
	parent.add_child(mi)
	return mi


static func _torus(parent: Node3D, inner_r: float, outer_r: float, pos: Vector3, mat: Material, rot_deg: Vector3 = Vector3.ZERO, nm: String = "") -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	if nm != "":
		mi.name = nm
	var tm := TorusMesh.new()
	tm.inner_radius = inner_r
	tm.outer_radius = outer_r
	mi.mesh = tm
	mi.position = pos
	mi.rotation_degrees = rot_deg
	mi.material_override = mat
	parent.add_child(mi)
	return mi


static func _build_tel_details(chassis: Node3D) -> void:
	if chassis.has_node("TelDetails"):
		return
	var det := Node3D.new()
	det.name = "TelDetails"
	chassis.add_child(det)

	var dark_metal := _mat("1e241b", 0.50, 0.65)
	var chrome_mat := _mat("d8e2dc", 0.20, 0.90)
	var warn_mat := _mat("e89923", 0.40, 0.20, "e89923", 0.65)
	var pad_mat := _mat("14202e", 0.75, 0.30, "1c6ea4", 0.45)
	var pad_line_mat := _mat("38bdf8", 0.30, 0.20, "38bdf8", 1.85)

	_box(det, Vector3(4.50, 0.05, 8.80), Vector3(0.0, 0.02, 0.0), pad_mat)
	_box(det, Vector3(4.62, 0.06, 0.10), Vector3(0.0, 0.03, -4.40), pad_line_mat)
	_box(det, Vector3(4.62, 0.06, 0.10), Vector3(0.0, 0.03, 4.40), pad_line_mat)
	_box(det, Vector3(0.10, 0.06, 8.80), Vector3(-2.26, 0.03, 0.0), pad_line_mat)
	_box(det, Vector3(0.10, 0.06, 8.80), Vector3(2.26, 0.03, 0.0), pad_line_mat)

	for sx in [-1.0, 1.0]:
		for sz in [-2.65, 2.55]:
			_box(det, Vector3(0.75, 0.18, 0.28), Vector3(sx * 1.72, 0.52, sz), dark_metal)
			_cyl(det, 0.09, 0.09, 0.56, Vector3(sx * 2.02, 0.28, sz), chrome_mat)
			_cyl(det, 0.24, 0.28, 0.08, Vector3(sx * 2.02, 0.04, sz), dark_metal)
			_box(det, Vector3(0.18, 0.08, 0.30), Vector3(sx * 2.02, 0.56, sz), warn_mat)

	var gen_olive := _mat("333e2c", 0.68, 0.28)
	_box(det, Vector3(2.50, 1.45, 1.38), Vector3(0.0, 1.68, -1.05), gen_olive)
	_box(det, Vector3(2.56, 0.12, 1.44), Vector3(0.0, 2.42, -1.05), dark_metal)

	var beacon_root := Node3D.new()
	beacon_root.name = "TelStrobeBeacon"
	beacon_root.position = Vector3(0.0, 2.88, -2.95)
	det.add_child(beacon_root)
	_cyl(beacon_root, 0.22, 0.26, 0.10, Vector3.ZERO, dark_metal)

	var dome_mat := _mat("ff2a1a", 0.15, 0.10, "ff3b1f", 3.8, 0.92)
	_sphere(beacon_root, 0.22, 0.44, Vector3(0.0, 0.16, 0.0), dome_mat, "StrobeDome")

	var beam_pivot := Node3D.new()
	beam_pivot.name = "StrobeBeamPivot"
	beacon_root.add_child(beam_pivot)
	var cone_mat := _mat("ff3b1f", 0.20, 0.0, "ff2a1a", 2.6, 0.28)
	_cyl(beam_pivot, 0.06, 0.95, 2.40, Vector3(0.0, 0.18, 1.25), cone_mat, Vector3(90.0, 0.0, 0.0), 16, "StrobeConeA")
	_cyl(beam_pivot, 0.06, 0.95, 2.40, Vector3(0.0, 0.18, -1.25), cone_mat, Vector3(-90.0, 0.0, 0.0), 16, "StrobeConeB")


static func _apply_cheongung_canisters(pod_rack: Node3D, font: Font) -> void:
	if pod_rack.has_node("CheongungAssembly"):
		return

	for child in pod_rack.get_children():
		if child is VisualInstance3D:
			child.visible = false
		for sub in child.find_children("*", "VisualInstance3D", true, false):
			if sub is VisualInstance3D:
				sub.visible = false

	var assembly := Node3D.new()
	assembly.name = "CheongungAssembly"
	# 천궁-II 실물과 동일한 90도 완전 수직 기립 발사 자세
	assembly.rotation.x = deg_to_rad(-90.0)
	assembly.position = Vector3(0.0, -0.35, 1.15)
	pod_rack.add_child(assembly)

	var olive_mat := _mat("3a4733", 0.62, 0.24)
	var camo_tan := _mat("6e6249", 0.68, 0.18)
	var camo_dark := _mat("22291f", 0.58, 0.35)
	var cap_mat := _mat("57654e", 0.52, 0.32)
	var chrome_mat := _mat("dce5df", 0.18, 0.92)
	var gold_accent := _mat("d4a843", 0.35, 0.70, "d4a843", 0.45)

	_box(assembly, Vector3(2.52, 0.28, 4.75), Vector3(0.0, 0.02, 0.0), camo_dark)
	for sx in [-0.72, 0.72]:
		_cyl(assembly, 0.13, 0.15, 2.25, Vector3(sx, -0.45, 0.85), camo_dark, Vector3(35.0, 0.0, 0.0))
		_cyl(assembly, 0.09, 0.09, 2.15, Vector3(sx, -0.25, 1.25), chrome_mat, Vector3(35.0, 0.0, 0.0))

	for z_offset in [-1.95, -0.65, 0.65, 1.95]:
		_box(assembly, Vector3(2.64, 1.38, 0.22), Vector3(0.0, 0.72, z_offset), camo_dark)
		_box(assembly, Vector3(2.70, 0.14, 0.26), Vector3(0.0, 1.38, z_offset), gold_accent)

	var x_offsets := [-0.87, -0.29, 0.29, 0.87]
	var y_offsets := [0.42, 1.00]
	var tube_length := 4.75
	var tube_radius := 0.258

	for r_idx in range(y_offsets.size()):
		var row_y: float = y_offsets[r_idx]
		for c_idx in range(x_offsets.size()):
			var col_x: float = x_offsets[c_idx]
			var tube_root := Node3D.new()
			tube_root.name = "Canister_%d_%d" % [r_idx, c_idx]
			tube_root.position = Vector3(col_x, row_y, 0.0)
			assembly.add_child(tube_root)

			_cyl(tube_root, tube_radius, tube_radius, tube_length, Vector3.ZERO, olive_mat, Vector3(90.0, 0.0, 0.0), 28)
			_cyl(tube_root, tube_radius + 0.004, tube_radius + 0.004, 1.15, Vector3(0.0, 0.0, -0.85), camo_tan, Vector3(90.0, 0.0, 0.0), 28)
			_cyl(tube_root, tube_radius + 0.004, tube_radius + 0.004, 0.95, Vector3(0.0, 0.0, 1.05), camo_tan, Vector3(90.0, 0.0, 0.0), 28)

			for ring_z in [-2.15, -1.42, -0.70, 0.0, 0.70, 1.42, 2.15]:
				_cyl(tube_root, tube_radius + 0.020, tube_radius + 0.020, 0.13, Vector3(0.0, 0.0, ring_z), camo_dark, Vector3(90.0, 0.0, 0.0), 28)

			_cyl(tube_root, tube_radius * 0.90, tube_radius * 1.02, 0.12, Vector3(0.0, 0.0, -tube_length * 0.5 - 0.05), cap_mat, Vector3(90.0, 0.0, 0.0), 28)
			_box(tube_root, Vector3(tube_radius * 1.65, 0.03, 0.03), Vector3(0.0, 0.0, -tube_length * 0.5 - 0.11), camo_dark)
			_box(tube_root, Vector3(0.03, tube_radius * 1.65, 0.03), Vector3(0.0, 0.0, -tube_length * 0.5 - 0.11), camo_dark)
			_cyl(tube_root, tube_radius * 1.03, tube_radius * 0.96, 0.16, Vector3(0.0, 0.0, tube_length * 0.5 + 0.05), camo_dark, Vector3(90.0, 0.0, 0.0), 28)

	var muzzle_flash := Node3D.new()
	muzzle_flash.name = "ColdLaunchMuzzlePlume"
	muzzle_flash.position = Vector3(0.0, 0.72, -tube_length * 0.5 - 0.30)
	muzzle_flash.visible = false
	assembly.add_child(muzzle_flash)
	var plume_mat := _mat("ffaa22", 0.20, 0.0, "ff7711", 4.5, 0.80)
	var smoke_ring_mat := _mat("e2e8f0", 0.85, 0.0, "94a3b8", 0.6, 0.55)
	_sphere(muzzle_flash, 0.85, 1.70, Vector3.ZERO, plume_mat, "PlumeCore")
	_torus(muzzle_flash, 0.55, 1.25, Vector3(0.0, 0.0, -0.25), smoke_ring_mat, Vector3(90.0, 0.0, 0.0), "PlumeRing")

	if font:
		var stencil := _mat("f8f3dc", 0.45, 0.10, "f8f3dc", 0.45)
		for side_sign in [-1.0, 1.0]:
			var badge := MeshInstance3D.new()
			var badge_text := TextMesh.new()
			badge_text.text = "천궁-II KM-SAM"
			badge_text.font = font
			badge_text.font_size = 54
			badge_text.pixel_size = 0.0072
			badge_text.depth = 0.003
			badge.mesh = badge_text
			badge.position = Vector3(side_sign * 1.35, 0.72, 0.0)
			badge.rotation.y = -PI * 0.5 if side_sign < 0.0 else PI * 0.5
			badge.material_override = stencil
			badge.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			assembly.add_child(badge)

		var rear_badge := MeshInstance3D.new()
		var rear_text := TextMesh.new()
		rear_text.text = "천궁-II KM-SAM"
		rear_text.font = font
		rear_text.font_size = 50
		rear_text.pixel_size = 0.0072
		rear_text.depth = 0.003
		rear_badge.mesh = rear_text
		rear_badge.position = Vector3(0.0, 1.44, -0.35)
		rear_badge.rotation.x = PI * 0.5
		rear_badge.material_override = stencil
		rear_badge.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		assembly.add_child(rear_badge)


static func _build_tactical_truck_base(root: Node3D, pad_glow_col: String) -> void:
	var olive := _mat("384531", 0.65, 0.25)
	var camo_tan := _mat("6b5f47", 0.70, 0.18)
	var dark_metal := _mat("1c2219", 0.52, 0.60)
	var glass_mat := _mat("38bdf8", 0.15, 0.85, "0ea5e9", 0.65, 0.75)
	var tire_mat := _mat("141715", 0.88, 0.10)
	var rim_mat := _mat("4a5546", 0.45, 0.75)
	var head_mat := _mat("fef08a", 0.15, 0.10, "fde047", 3.2)
	var pad_mat := _mat("111b27", 0.80, 0.30, pad_glow_col, 0.35)
	var line_mat := _mat(pad_glow_col, 0.25, 0.20, pad_glow_col, 2.1)

	_box(root, Vector3(3.40, 0.05, 6.90), Vector3(0.0, -0.02, 0.0), pad_mat)
	_box(root, Vector3(3.48, 0.06, 0.09), Vector3(0.0, 0.0, -3.45), line_mat)
	_box(root, Vector3(3.48, 0.06, 0.09), Vector3(0.0, 0.0, 3.45), line_mat)
	_box(root, Vector3(0.09, 0.06, 6.90), Vector3(-1.72, 0.0, 0.0), line_mat)
	_box(root, Vector3(0.09, 0.06, 6.90), Vector3(1.72, 0.0, 0.0), line_mat)

	_box(root, Vector3(2.36, 0.38, 6.10), Vector3(0.0, 0.56, 0.0), dark_metal)
	_box(root, Vector3(2.42, 0.24, 0.18), Vector3(0.0, 0.52, -3.08), dark_metal)

	_box(root, Vector3(2.32, 1.48, 1.72), Vector3(0.0, 1.42, -2.12), olive)
	_box(root, Vector3(2.34, 0.52, 0.82), Vector3(0.0, 1.15, -1.55), camo_tan)
	_box(root, Vector3(2.08, 0.58, 0.06), Vector3(0.0, 1.66, -2.99), glass_mat)
	_box(root, Vector3(0.04, 0.60, 0.08), Vector3(0.0, 1.66, -3.00), dark_metal)

	for sx in [-0.82, 0.82]:
		_box(root, Vector3(0.32, 0.16, 0.06), Vector3(sx, 0.88, -3.00), head_mat)

	for sx in [-1.0, 1.0]:
		for wz in [-2.22, -1.02, 1.02, 2.22]:
			_cyl(root, 0.46, 0.46, 0.36, Vector3(sx * 1.18, 0.46, wz), tire_mat, Vector3(0.0, 0.0, 90.0), 20)
			_cyl(root, 0.24, 0.24, 0.38, Vector3(sx * 1.18, 0.46, wz), rim_mat, Vector3(0.0, 0.0, 90.0), 16)
		for sz in [-2.05, 2.05]:
			_box(root, Vector3(0.55, 0.14, 0.22), Vector3(sx * 1.38, 0.38, sz), dark_metal)
			_cyl(root, 0.16, 0.20, 0.06, Vector3(sx * 1.60, 0.03, sz), dark_metal)

	var stb := Node3D.new()
	stb.name = "VehicleStrobe"
	stb.position = Vector3(0.0, 2.22, -2.35)
	root.add_child(stb)
	var dome_mat := _mat("ff3b1f", 0.15, 0.10, "ff2a1a", 3.6, 0.92)
	_sphere(stb, 0.16, 0.32, Vector3.ZERO, dome_mat, "Dome")
	var pivot := Node3D.new()
	pivot.name = "BeamPivot"
	stb.add_child(pivot)
	var cone_mat := _mat("ff3b1f", 0.20, 0.0, "ff2a1a", 2.2, 0.25)
	_cyl(pivot, 0.04, 0.68, 1.75, Vector3(0.0, 0.0, 0.90), cone_mat, Vector3(90.0, 0.0, 0.0), 14)
	_cyl(pivot, 0.04, 0.68, 1.75, Vector3(0.0, 0.0, -0.90), cone_mat, Vector3(-90.0, 0.0, 0.0), 14)


static func _apply_radar_and_ecs(launcher: Node3D, font: Font) -> void:
	if launcher.has_node("CheongungMFR"):
		return

	var olive := _mat("384531", 0.62, 0.26)
	var camo_tan := _mat("6e6249", 0.68, 0.20)
	var dark_metal := _mat("1e251b", 0.48, 0.62)
	var radar_face_mat := _mat("264653", 0.28, 0.72, "2dd4bf", 0.75)
	var radar_grid_mat := _mat("5eead4", 0.22, 0.80, "5eead4", 1.95)
	var wave_mat := _mat("2dd4bf", 0.20, 0.10, "14b8a6", 2.8, 0.30)
	var ring_mat := _mat("38bdf8", 0.20, 0.10, "0ea5e9", 3.2, 0.72)
	var label_mat := _mat("e2f1ff", 0.35, 0.10, "38bdf8", 0.85)

	# 1) 좌측 다기능레이더(MFR) 차량 (X = -5.80, Z = -0.35, scale = 0.36)
	var mfr := Node3D.new()
	mfr.name = "CheongungMFR"
	mfr.position = Vector3(-5.80, 0.08, -0.35)
	mfr.scale = Vector3(0.36, 0.36, 0.36)
	mfr.rotation_degrees = Vector3(0.0, 14.0, 0.0)
	launcher.add_child(mfr)

	_build_tactical_truck_base(mfr, "14b8a6")
	_box(mfr, Vector3(2.24, 1.16, 3.65), Vector3(0.0, 1.32, 0.85), olive)
	_box(mfr, Vector3(2.28, 0.45, 1.45), Vector3(0.0, 1.35, 1.55), camo_tan)

	var radar_head := Node3D.new()
	radar_head.name = "MFRRadarHead"
	radar_head.position = Vector3(0.0, 2.10, 1.05)
	mfr.add_child(radar_head)

	_cyl(radar_head, 0.68, 0.78, 0.42, Vector3(0.0, 0.0, 0.0), dark_metal)
	_box(radar_head, Vector3(1.12, 0.78, 0.92), Vector3(0.0, 0.52, 0.15), olive)

	var array_pivot := Node3D.new()
	array_pivot.name = "PhasedArrayPanel"
	array_pivot.position = Vector3(0.0, 1.25, 0.0)
	array_pivot.rotation_degrees = Vector3(-22.0, 0.0, 0.0)
	radar_head.add_child(array_pivot)

	_box(array_pivot, Vector3(2.15, 2.38, 0.34), Vector3.ZERO, olive)
	_box(array_pivot, Vector3(1.92, 2.14, 0.06), Vector3(0.0, 0.0, -0.19), radar_face_mat)
	for gx in [-0.65, 0.0, 0.65]:
		_box(array_pivot, Vector3(0.04, 2.10, 0.08), Vector3(gx, 0.0, -0.20), radar_grid_mat)
	for gy in [-0.72, 0.0, 0.72]:
		_box(array_pivot, Vector3(1.88, 0.04, 0.08), Vector3(0.0, gy, -0.20), radar_grid_mat)

	var wave_emitter := Node3D.new()
	wave_emitter.name = "RadarWaveEmitter"
	wave_emitter.position = Vector3(0.0, 0.0, -0.25)
	array_pivot.add_child(wave_emitter)

	_cyl(wave_emitter, 0.08, 1.85, 5.20, Vector3(0.0, 0.0, -2.65), wave_mat, Vector3(90.0, 0.0, 0.0), 24, "ScanBeamCone")

	for idx in range(3):
		var pulse_ring := _torus(wave_emitter, 0.35 + idx * 0.25, 0.44 + idx * 0.25, Vector3(0.0, 0.0, -0.8 - idx * 1.3), ring_mat, Vector3(90.0, 0.0, 0.0), "RadarPulse_%d" % idx)
		pulse_ring.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF

	var sky_dome := Node3D.new()
	sky_dome.name = "SkyLockRings"
	sky_dome.position = Vector3(0.0, 4.40, 0.0)
	mfr.add_child(sky_dome)
	_torus(sky_dome, 2.10, 2.24, Vector3(0.0, 0.0, 0.0), ring_mat, Vector3(12.0, 0.0, -8.0), "SkyRingOuter")
	_torus(sky_dome, 1.25, 1.36, Vector3(0.0, 0.85, 0.0), radar_grid_mat, Vector3(-10.0, 0.0, 12.0), "SkyRingInner")

	if font:
		var mfr_lbl := MeshInstance3D.new()
		var mfr_tm := TextMesh.new()
		mfr_tm.text = "다기능레이더 MFR"
		mfr_tm.font = font
		mfr_tm.font_size = 46
		mfr_tm.pixel_size = 0.0080
		mfr_tm.depth = 0.003
		mfr_lbl.mesh = mfr_tm
		mfr_lbl.position = Vector3(0.0, 4.15, 0.0)
		mfr_lbl.material_override = label_mat
		mfr_lbl.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		mfr.add_child(mfr_lbl)

	# 2) 우측 교전통제소(ECS) 지휘차량 (X = +1.85, Z = -0.35, scale = 0.36 -> 남산 다리 왼쪽 잔디공원에 배치되어 다리 도로 겹침 0%!)
	var ecs := Node3D.new()
	ecs.name = "CheongungECS"
	ecs.position = Vector3(1.85, 0.08, -0.35)
	ecs.scale = Vector3(0.36, 0.36, 0.36)
	ecs.rotation_degrees = Vector3(0.0, -14.0, 0.0)
	launcher.add_child(ecs)

	_build_tactical_truck_base(ecs, "38bdf8")

	_box(ecs, Vector3(2.34, 1.72, 3.95), Vector3(0.0, 1.62, 0.82), olive)
	_box(ecs, Vector3(2.38, 0.56, 1.65), Vector3(0.0, 1.55, 1.25), camo_tan)
	_box(ecs, Vector3(1.55, 0.32, 1.85), Vector3(0.0, 2.58, 0.65), dark_metal)

	var ant_mat := _mat("cbd5e1", 0.25, 0.88)
	var tip_mat := _mat("38bdf8", 0.15, 0.20, "38bdf8", 3.5)
	for az in [-0.65, 0.35, 1.35, 2.35]:
		var side_x := -1.06 if (az < 0.8) else 1.06
		_cyl(ecs, 0.025, 0.045, 2.65, Vector3(side_x, 3.65, az), ant_mat)
		_sphere(ecs, 0.075, 0.15, Vector3(side_x, 5.00, az), tip_mat, "AntTip_%d" % int((az + 1.0) * 10.0))

	var sat_pivot := Node3D.new()
	sat_pivot.name = "ECSSatDish"
	sat_pivot.position = Vector3(0.0, 2.85, 2.05)
	ecs.add_child(sat_pivot)
	_cyl(sat_pivot, 0.52, 0.14, 0.22, Vector3(0.0, 0.15, 0.0), ant_mat, Vector3(-38.0, 0.0, 0.0), 20)

	if font:
		var ecs_lbl := MeshInstance3D.new()
		var ecs_tm := TextMesh.new()
		ecs_tm.text = "교전통제소 ECS"
		ecs_tm.font = font
		ecs_tm.font_size = 46
		ecs_tm.pixel_size = 0.0080
		ecs_tm.depth = 0.003
		ecs_lbl.mesh = ecs_tm
		ecs_lbl.position = Vector3(0.0, 4.15, 0.0)
		ecs_lbl.material_override = label_mat
		ecs_lbl.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		ecs.add_child(ecs_lbl)

	# 3) 다기능레이더(MFR) -> 유도탄발사대(TEL) -> 교전통제소(ECS) 데이터링크 광파 펄스
	var dl_root := Node3D.new()
	dl_root.name = "DataLinkPulses"
	launcher.add_child(dl_root)
	for i in range(8):
		var dot := _sphere(dl_root, 0.048, 0.096, Vector3(-5.20 + i * 0.95, 0.55, -0.35), tip_mat, "LinkDot_%d" % i)
		dot.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF

	# 4) 방공 경보 사이렌 오디오 스트림 생성
	_create_siren_player(launcher)


static func _create_siren_player(launcher: Node3D) -> void:
	if launcher.has_node("AirDefenseSiren"):
		return
	var player := AudioStreamPlayer.new()
	player.name = "AirDefenseSiren"
	player.volume_db = -11.5

	var mix_rate := 22050
	var duration_sec := 1.6
	var total_samples := int(mix_rate * duration_sec)
	var pcm := PackedByteArray()
	pcm.resize(total_samples * 2)

	for i in range(total_samples):
		var t := float(i) / float(mix_rate)
		var sweep := 0.5 - 0.5 * cos(t * TAU / duration_sec)
		var freq := 520.0 + 420.0 * sweep
		var phase := t * freq * TAU
		var env := sin( clampf(t / duration_sec, 0.0, 1.0) * PI )
		var val := (sin(phase) * 0.65 + sin(phase * 2.0) * 0.22) * env
		var sample_int := clampi(int(val * 14000.0), -32767, 32767)
		pcm.encode_s16(i * 2, sample_int)

	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = mix_rate
	wav.stereo = false
	wav.data = pcm
	player.stream = wav
	launcher.add_child(player)


static func _ensure_runtime_driver(launcher: Node3D) -> void:
	if launcher.has_meta("cheongung_v7_driver"):
		return
	launcher.set_meta("cheongung_v7_driver", true)

	var cb := Callable(DefenseLauncherMarking, "_on_pre_draw").bind(launcher)
	if not RenderingServer.frame_pre_draw.is_connected(cb):
		RenderingServer.frame_pre_draw.connect(cb)


static func _find_battlefield(node: Node) -> Node3D:
	var cur := node
	while cur != null:
		if cur is Node3D and cur.get("_missile_node") != null:
			return cur as Node3D
		cur = cur.get_parent()
	return null


static func _ensure_cold_launch_vfx(battlefield: Node3D) -> void:
	if battlefield.has_node("CheongungColdLaunchVFX"):
		return

	var vfx := Node3D.new()
	vfx.name = "CheongungColdLaunchVFX"
	battlefield.add_child(vfx)

	var body_mat := _mat("f8fafc", 0.30, 0.45)
	var nose_mat := _mat("ef4444", 0.25, 0.30, "ef4444", 1.25)
	var fin_mat := _mat("1e293b", 0.50, 0.70)
	var dacs_mat := _mat("ffaa1d", 0.15, 0.0, "ff6b00", 5.5, 0.90)
	var plume_mat := _mat("38bdf8", 0.15, 0.0, "0ea5e9", 5.2, 0.88)
	var core_mat := _mat("ffffff", 0.10, 0.0, "fffbeb", 6.5, 0.96)
	var smoke_mat := _mat("e2e8f0", 0.85, 0.0, "94a3b8", 0.8, 0.38)
	var lock_mat := _mat("ff3b30", 0.20, 0.10, "ff2d55", 4.2, 0.82)

	var dart := Node3D.new()
	dart.name = "InterceptorDart"
	dart.visible = false
	vfx.add_child(dart)

	_cyl(dart, 0.11, 0.13, 1.65, Vector3(0.0, 0.0, 0.0), body_mat, Vector3(90.0, 0.0, 0.0), 20)
	_cyl(dart, 0.01, 0.11, 0.52, Vector3(0.0, 0.0, -1.08), nose_mat, Vector3(90.0, 0.0, 0.0), 20)
	_box(dart, Vector3(0.58, 0.03, 0.36), Vector3(0.0, 0.0, 0.55), fin_mat)
	_box(dart, Vector3(0.03, 0.58, 0.36), Vector3(0.0, 0.0, 0.55), fin_mat)

	var dacs := Node3D.new()
	dacs.name = "DACSThrusterRing"
	dacs.position = Vector3(0.0, 0.0, -0.52)
	dart.add_child(dacs)
	_box(dacs, Vector3(1.35, 0.10, 0.10), Vector3.ZERO, dacs_mat)
	_box(dacs, Vector3(0.10, 1.35, 0.10), Vector3.ZERO, dacs_mat)

	var booster := Node3D.new()
	booster.name = "MainBoosterPlume"
	booster.position = Vector3(0.0, 0.0, 1.35)
	dart.add_child(booster)
	_cyl(booster, 0.18, 0.02, 1.45, Vector3.ZERO, plume_mat, Vector3(90.0, 0.0, 0.0), 16)
	_cyl(booster, 0.09, 0.01, 0.95, Vector3(0.0, 0.0, -0.20), core_mat, Vector3(90.0, 0.0, 0.0), 14)

	var trail := _cyl(vfx, 0.10, 0.24, 1.0, Vector3.ZERO, smoke_mat, Vector3.ZERO, 14, "VerticalSmokeColumn")
	trail.visible = false

	var reticle := Node3D.new()
	reticle.name = "TargetLockReticle"
	reticle.visible = false
	vfx.add_child(reticle)
	_torus(reticle, 0.72, 0.82, Vector3.ZERO, lock_mat, Vector3(90.0, 0.0, 0.0), "LockRingOuter")
	_torus(reticle, 0.38, 0.45, Vector3.ZERO, dacs_mat, Vector3(90.0, 0.0, 0.0), "LockRingInner")


static func _on_pre_draw(launcher: Node3D) -> void:
	if not is_instance_valid(launcher):
		return

	var t_sec := float(Time.get_ticks_msec()) * 0.001

	# 남산 다리 왼쪽 강변 잔디공원 배치 및 스케일 유지 (도로 겹침 0% 보장)
	var chassis := launcher.get_node_or_null("Chassis") as Node3D
	if is_instance_valid(chassis):
		chassis.scale = Vector3(0.55, 0.55, 0.55)
		if absf(chassis.position.x - (-1.45)) > 0.35:
			chassis.position = Vector3(-1.45, 0.0, -0.25)

	# 1. 다기능레이더(MFR) 위상배열 안테나 360도 회전 및 전파 파동 확산
	var mfr := launcher.get_node_or_null("CheongungMFR") as Node3D
	if is_instance_valid(mfr):
		mfr.position = Vector3(-5.80, 0.08, -0.35)
		mfr.scale = Vector3(0.36, 0.36, 0.36)
		var r_head := mfr.get_node_or_null("MFRRadarHead") as Node3D
		if is_instance_valid(r_head):
			r_head.rotation.y = t_sec * 2.55
			var emitter := r_head.find_child("RadarWaveEmitter", true, false) as Node3D
			if is_instance_valid(emitter):
				for idx in range(3):
					var pr := emitter.get_node_or_null("RadarPulse_%d" % idx) as Node3D
					if is_instance_valid(pr):
						var cyc := fmod(t_sec * 1.45 + float(idx) * 0.33, 1.0)
						pr.position.z = -0.45 - cyc * 4.65
						var sc := 0.45 + cyc * 1.75
						pr.scale = Vector3(sc, 1.0, sc)

		var sky_dome := mfr.get_node_or_null("SkyLockRings") as Node3D
		if is_instance_valid(sky_dome):
			sky_dome.rotation.y = -t_sec * 1.35
			var pulse_s := 1.0 + 0.14 * sin(t_sec * 4.2)
			sky_dome.scale = Vector3(pulse_s, 1.0, pulse_s)

		var mfr_stb := mfr.find_child("BeamPivot", true, false) as Node3D
		if is_instance_valid(mfr_stb):
			mfr_stb.rotation.y = t_sec * 9.5

	# 2. 교전통제소(ECS) 위성 안테나 및 경광등 회전
	var ecs := launcher.get_node_or_null("CheongungECS") as Node3D
	if is_instance_valid(ecs):
		ecs.position = Vector3(1.85, 0.08, -0.35)
		ecs.scale = Vector3(0.36, 0.36, 0.36)
		var dish := ecs.get_node_or_null("ECSSatDish") as Node3D
		if is_instance_valid(dish):
			dish.rotation.y = sin(t_sec * 1.8) * 0.85
		var ecs_stb := ecs.find_child("BeamPivot", true, false) as Node3D
		if is_instance_valid(ecs_stb):
			ecs_stb.rotation.y = -t_sec * 9.5

	# 3. 발사대(TEL) 경광등 회전 및 데이터링크 펄스 이동
	var tel_stb := launcher.find_child("StrobeBeamPivot", true, false) as Node3D
	if is_instance_valid(tel_stb):
		tel_stb.rotation.y = t_sec * 10.5

	var dl := launcher.get_node_or_null("DataLinkPulses") as Node3D
	if is_instance_valid(dl):
		for i in range(8):
			var dot := dl.get_node_or_null("LinkDot_%d" % i) as Node3D
			if is_instance_valid(dot):
				var wave := fmod(t_sec * 2.4 + float(i) * 0.125, 1.0)
				dot.position.x = -5.45 + wave * 7.10
				var s_dot := 0.85 + 0.45 * sin(wave * PI)
				dot.scale = Vector3(s_dot, s_dot, s_dot)

	# 4. 천궁-II 3단계 직각 콜드런치(수직 사출 -> 공중 정점 정지·측면추력기 방향 전환 -> 곡률 0% 일직선 고속 타격)
	var battlefield := _find_battlefield(launcher)
	if not is_instance_valid(battlefield):
		return

	_ensure_cold_launch_vfx(battlefield)
	var vfx := battlefield.get_node_or_null("CheongungColdLaunchVFX") as Node3D
	var dart := vfx.get_node_or_null("InterceptorDart") as Node3D if is_instance_valid(vfx) else null
	var trail := vfx.get_node_or_null("VerticalSmokeColumn") as Node3D if is_instance_valid(vfx) else null
	var reticle := vfx.get_node_or_null("TargetLockReticle") as Node3D if is_instance_valid(vfx) else null
	var muzzle := launcher.find_child("ColdLaunchMuzzlePlume", true, false) as Node3D

	var orig_missile := battlefield.get("_missile_node") as Node3D
	var orig_smoke := battlefield.get("_missile_smoke_node") as Node3D
	var flight = battlefield.get("_missile_flight")

	if flight is Dictionary and not flight.is_empty():
		if is_instance_valid(orig_missile):
			orig_missile.visible = false
		if is_instance_valid(orig_smoke):
			orig_smoke.visible = false

		var start_pos: Vector3 = flight.get("start", Vector3.ZERO)
		var target_pos: Vector3 = flight.get("target", Vector3.ZERO)
		var elapsed: float = float(flight.get("elapsed", 0.0))
		var duration: float = maxf(float(flight.get("duration", 0.36)), 0.001)

		if elapsed < 0.05:
			var siren := launcher.get_node_or_null("AirDefenseSiren") as AudioStreamPlayer
			if is_instance_valid(siren) and not siren.playing:
				siren.play()

		var launch_base := launcher.global_position + Vector3(-1.45, 2.35, -0.25)
		var apex_pos := launch_base + Vector3(0.0, 4.85, 0.0)
		var to_target := target_pos - apex_pos
		var flat_dir := Vector3(to_target.x, 0.0, to_target.z)
		if flat_dir.length() > 0.001:
			flat_dir = flat_dir.normalized()
		else:
			flat_dir = Vector3(0.0, 0.0, -1.0)
		var aim_dir := to_target.normalized() if to_target.length() > 0.001 else flat_dir

		var draw_pos := launch_base
		var draw_dir := Vector3.UP
		var dacs_active := false
		var booster_active := false

		if elapsed < 0.15:
			# 1단계: 90도 수직 콜드런치 가스 사출 (하늘로 수직 치솟음)
			var u1 := clampf(elapsed / 0.15, 0.0, 1.0)
			var ease_u1 := 1.0 - pow(1.0 - u1, 2.2)
			draw_pos = launch_base.lerp(apex_pos, ease_u1)
			draw_dir = Vector3.UP
		elif elapsed < 0.27:
			# 2단계: 공중 정점(apex_pos)에 멈춰 서서 측면추력기(DACS) 점화로 탄두 방향만 표적으로 꺾기
			var u2 := clampf((elapsed - 0.15) / 0.12, 0.0, 1.0)
			draw_pos = apex_pos + Vector3(0.0, 0.10 * sin(u2 * PI), 0.0)
			draw_dir = Vector3.UP.lerp(aim_dir, u2).normalized()
			dacs_active = true
		else:
			# 3단계: 주 로켓 점화 후 표적까지 포물선 곡률 0% 일직선 초고속 타격
			var u3 := clampf((elapsed - 0.27) / maxf(duration - 0.27, 0.04), 0.0, 1.0)
			var smooth_u3 := 1.0 - pow(1.0 - u3, 2.15)
			draw_pos = apex_pos.lerp(target_pos, smooth_u3)
			draw_dir = aim_dir
			booster_active = true

		if is_instance_valid(dart):
			dart.visible = true
			dart.global_position = draw_pos
			var up_vec := Vector3.FORWARD if absf(draw_dir.dot(Vector3.UP)) > 0.96 else Vector3.UP
			dart.look_at(draw_pos + draw_dir, up_vec)

			var dacs_node := dart.get_node_or_null("DACSThrusterRing") as Node3D
			if is_instance_valid(dacs_node):
				dacs_node.visible = dacs_active
				if dacs_active:
					dacs_node.rotation.z = t_sec * 28.0
					var ds := 0.85 + 0.55 * sin(t_sec * 45.0)
					dacs_node.scale = Vector3(ds, ds, ds)

			var booster_node := dart.get_node_or_null("MainBoosterPlume") as Node3D
			if is_instance_valid(booster_node):
				booster_node.visible = booster_active
				if booster_active:
					var bs := 0.90 + 0.30 * sin(t_sec * 50.0)
					booster_node.scale = Vector3(bs, bs, 1.0 + 0.35 * sin(t_sec * 40.0))

		if is_instance_valid(muzzle):
			muzzle.visible = elapsed < 0.24
			if muzzle.visible:
				var ms := 0.70 + elapsed * 3.5
				muzzle.scale = Vector3(ms, ms, ms)

		if is_instance_valid(trail):
			trail.visible = true
			var col_top := draw_pos if elapsed < 0.27 else apex_pos
			var col_h := maxf(col_top.y - launch_base.y, 0.25)
			trail.global_position = Vector3(launch_base.x, launch_base.y + col_h * 0.5, launch_base.z)
			trail.scale = Vector3(1.0, col_h, 1.0)

		if is_instance_valid(reticle):
			reticle.visible = true
			reticle.global_position = target_pos
			reticle.rotation.y = t_sec * 6.0
			var rs := 0.85 + 0.25 * sin(t_sec * 18.0)
			reticle.scale = Vector3(rs, rs, rs)
	else:
		if is_instance_valid(dart):
			dart.visible = false
		if is_instance_valid(trail):
			trail.visible = false
		if is_instance_valid(reticle):
			reticle.visible = false
		if is_instance_valid(muzzle):
			muzzle.visible = false
