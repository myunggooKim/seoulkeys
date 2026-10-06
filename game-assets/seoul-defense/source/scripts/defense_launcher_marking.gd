extends RefCounted
static func apply(chassis: Node3D, font: Font) -> void:
    if not is_instance_valid(chassis) or chassis.has_node('K239Marking'):return
    # Painted designation attached to the camera-facing cab side, not a HUD label.
    var mount:=Node3D.new();mount.name='K239Marking'
    chassis.add_child(mount);mount.position=Vector3(-1.628,1.93,-2.75);mount.rotation.y=-PI*0.5
    var plate:=MeshInstance3D.new();var shape:=BoxMesh.new();shape.size=Vector3(2.78,.64,.018);plate.mesh=shape
    var backing:=StandardMaterial3D.new();backing.albedo_color=Color('394234');backing.roughness=.95
    plate.material_override=backing;mount.add_child(plate)
    var text:=MeshInstance3D.new();text.name='Designation_K-239';var letters:=TextMesh.new()
    letters.text='K-239';letters.font=font;letters.font_size=96;letters.pixel_size=.009;letters.depth=.001
    letters.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;letters.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
    text.mesh=letters;text.position.z=.013
    var paint:=StandardMaterial3D.new();paint.albedo_color=Color('f1ebcb');paint.roughness=.94
    text.material_override=paint;text.cast_shadow=GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
    mount.add_child(text)
