extends RefCounted

# Converts the launcher visual from K-239 Chunmoo (rectangular MLRS box pods)
# to KM-SAM Cheongung (천궁 8연장 원통형 수직발사관 요격체계) and applies the KM-SAM designation plate.
static func apply(chassis: Node3D, font: Font) -> void:
	if not is_instance_valid(chassis) or chassis.has_node('K239Marking'):
		return

	# 1. Cab-side painted designation plate: 'KM-SAM' (replaces 'K-239')
	var mount := Node3D.new()
	mount.name = 'K239Marking'
	chassis.add_child(mount)
	mount.position = Vector3(-1.628, 1.93, -2.75)
	mount.rotation.y = -PI * 0.5

	var plate := MeshInstance3D.new()
	var shape := BoxMesh.new()
	shape.size = Vector3(3.16, 0.64, 0.018)
	plate.mesh = shape
	var backing := StandardMaterial3D.new()
	backing.albedo_color = Color('394234')
	backing.roughness = 0.95
	plate.material_override = backing
	mount.add_child(plate)

	var text := MeshInstance3D.new()
	text.name = 'Designation_KM-SAM'
	var letters := TextMesh.new()
	letters.text = 'KM-SAM'
	letters.font = font
	letters.font_size = 86
	letters.pixel_size = 0.0085
	letters.depth = 0.001
	letters.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	letters.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	text.mesh = letters
	text.position.z = 0.013
	var paint := StandardMaterial3D.new()
	paint.albedo_color = Color('f1ebcb')
	paint.roughness = 0.94
	text.material_override = paint
	text.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mount.add_child(text)

	# 2. Convert rectangular Chunmoo PodRack into KM-SAM Cheongung 8-cell cylindrical canisters
	var launcher := chassis.get_parent()
	if not is_instance_valid(launcher):
		return
	var pod_rack := launcher.find_child('PodRack', true, false) as Node3D
	if is_instance_valid(pod_rack):
		_apply_cheongung_canisters(pod_rack, font)


static func _apply_cheongung_canisters(pod_rack: Node3D, font: Font) -> void:
	if pod_rack.has_node('CheongungAssembly'):
		return

	for child in pod_rack.get_children():
		if child is VisualInstance3D:
			child.visible = false
		for sub in child.find_children('*', 'VisualInstance3D', true, false):
			if sub is VisualInstance3D:
				sub.visible = false

	var assembly := Node3D.new()
	assembly.name = 'CheongungAssembly'
	assembly.rotation.x = deg_to_rad(-24.0)
	pod_rack.add_child(assembly)

	var olive_mat := StandardMaterial3D.new()
	olive_mat.albedo_color = Color('3b4635')
	olive_mat.roughness = 0.78
	olive_mat.metallic = 0.16

	var dark_ring_mat := StandardMaterial3D.new()
	dark_ring_mat.albedo_color = Color('232a20')
	dark_ring_mat.roughness = 0.68
	dark_ring_mat.metallic = 0.28

	var cap_mat := StandardMaterial3D.new()
	cap_mat.albedo_color = Color('4c5845')
	cap_mat.roughness = 0.72

	var cradle := MeshInstance3D.new()
	var cradle_box := BoxMesh.new()
	cradle_box.size = Vector3(2.36, 0.22, 4.30)
	cradle.mesh = cradle_box
	cradle.position = Vector3(0.0, 0.05, 0.0)
	cradle.material_override = dark_ring_mat
	assembly.add_child(cradle)

	for z_offset in [-1.55, 0.0, 1.55]:
		var frame := MeshInstance3D.new()
		var frame_box := BoxMesh.new()
		frame_box.size = Vector3(2.44, 1.24, 0.18)
		frame.mesh = frame_box
		frame.position = Vector3(0.0, 0.68, z_offset)
		frame.material_override = dark_ring_mat
		assembly.add_child(frame)

	var x_offsets := [-0.84, -0.28, 0.28, 0.84]
	var y_offsets := [0.40, 0.96]
	var tube_length := 4.40
	var tube_radius := 0.245

	for row_y in y_offsets:
		for col_x in x_offsets:
			var tube_root := Node3D.new()
			tube_root.position = Vector3(col_x, row_y, 0.0)
			assembly.add_child(tube_root)

			var cyl_inst := MeshInstance3D.new()
			var cyl := CylinderMesh.new()
			cyl.top_radius = tube_radius
			cyl.bottom_radius = tube_radius
			cyl.height = tube_length
			cyl.radial_segments = 20
			cyl_inst.mesh = cyl
			cyl_inst.rotation.x = PI * 0.5
			cyl_inst.material_override = olive_mat
			tube_root.add_child(cyl_inst)

			for ring_z in [-1.85, -0.95, 0.0, 0.95, 1.85]:
				var ring_inst := MeshInstance3D.new()
				var ring_cyl := CylinderMesh.new()
				ring_cyl.top_radius = tube_radius + 0.016
				ring_cyl.bottom_radius = tube_radius + 0.016
				ring_cyl.height = 0.12
				ring_cyl.radial_segments = 20
				ring_inst.mesh = ring_cyl
				ring_inst.rotation.x = PI * 0.5
				ring_inst.position.z = ring_z
				ring_inst.material_override = dark_ring_mat
				tube_root.add_child(ring_inst)

			var front_cap := MeshInstance3D.new()
			var cap_mesh := CylinderMesh.new()
			cap_mesh.top_radius = tube_radius * 0.92
			cap_mesh.bottom_radius = tube_radius * 0.98
			cap_mesh.height = 0.08
			cap_mesh.radial_segments = 20
			front_cap.mesh = cap_mesh
			front_cap.rotation.x = PI * 0.5
			front_cap.position.z = -tube_length * 0.5 - 0.02
			front_cap.material_override = cap_mat
			tube_root.add_child(front_cap)

	if font:
		for side_sign in [-1.0, 1.0]:
			var badge := MeshInstance3D.new()
			var badge_text := TextMesh.new()
			badge_text.text = '천궁 KM-SAM'
			badge_text.font = font
			badge_text.font_size = 56
			badge_text.pixel_size = 0.0075
			badge_text.depth = 0.001
			badge.mesh = badge_text
			badge.position = Vector3(side_sign * 1.24, 0.68, 0.0)
			badge.rotation.y = -PI * 0.5 if side_sign < 0.0 else PI * 0.5
			var stencil := StandardMaterial3D.new()
			stencil.albedo_color = Color('f1ebcb')
			stencil.roughness = 0.92
			badge.material_override = stencil
			badge.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			assembly.add_child(badge)
