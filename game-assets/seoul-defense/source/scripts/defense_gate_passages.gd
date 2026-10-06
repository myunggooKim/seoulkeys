extends RefCounted
# Repairs the actual threshold geometry, before static batching. Does not replace
# the imported gate, touch city damage partitions, change traffic or add decals.
const LANES = [Vector2(-8.69, -6.11), Vector2(-1.59, 1.59), Vector2(6.11, 8.69)]
const KEEPS = [Vector2(-14.0,-8.69), Vector2(-6.11,-1.59), Vector2(1.59,6.11), Vector2(8.69,14.0)]
static func apply(gate: Node3D, context: Node3D) -> Dictionary:
 if gate.has_meta("open_passage_thresholds"):
  return gate.get_meta("open_passage_thresholds")
 var steps = gate.get_node_or_null("Plaza_Steps") as MeshInstance3D
 var court = context.find_child("Palace outer court | limestone_001", true, false) as MeshInstance3D
 if steps == null or steps.mesh == null or court == null:
  return {"applied":false, "reason":"Required original gate/court geometry not found"}
 var box: AABB = steps.transform * steps.mesh.get_aabb()
 if absf(box.position.x + 13.3) > 0.01 or absf(box.end.y - 0.42) > 0.01:
  return {"applied":false, "reason":"Unexpected threshold geometry"}
 var original: Mesh = steps.mesh
 var replacement := ArrayMesh.new()
 var original_triangles := 0
 var remaining_triangles := 0
 for surface in original.get_surface_count():
  var arrays = original.surface_get_arrays(surface)
  var vertices: PackedVector3Array = arrays[Mesh.ARRAY_VERTEX]
  var normals: PackedVector3Array = arrays[Mesh.ARRAY_NORMAL]
  var indices: PackedInt32Array = arrays[Mesh.ARRAY_INDEX]
  if indices.is_empty():
   for i in vertices.size(): indices.append(i)
  var st := SurfaceTool.new()
  st.begin(Mesh.PRIMITIVE_TRIANGLES)
  st.set_material(original.surface_get_material(surface))
  var surface_triangles := 0
  for tri in range(0, indices.size(), 3):
   original_triangles += 1
   var poly: Array = []
   for corner in 3:
    var index: int = indices[tri+corner]
    poly.append({"v":steps.transform * vertices[index], "n":normals[index]})
   for interval in KEEPS:
    var clipped := _clip(_clip(poly,interval.x,true),interval.y,false)
    for i in range(1,clipped.size()-1):
     for point in [clipped[0],clipped[i],clipped[i+1]]:
      st.set_normal(point.n)
      st.add_vertex(steps.transform.affine_inverse() * point.v)
     surface_triangles += 1
  if surface_triangles:
   st.commit(replacement)
   remaining_triangles += surface_triangles
 # Close the new vertical cut faces with the original granite material.
 var caps := SurfaceTool.new()
 caps.begin(Mesh.PRIMITIVE_TRIANGLES)
 caps.set_material(original.surface_get_material(0))
 var section := PackedVector2Array([Vector2(5.7,0.0),Vector2(5.7,0.14),Vector2(5.22,0.14),Vector2(5.22,0.28),Vector2(4.74,0.28),Vector2(4.74,0.42),Vector2(3.76,0.42),Vector2(3.76,0.0)])
 var faces := Geometry2D.triangulate_polygon(section)
 for lane in LANES:
  for side in [0,1]:
   var x: float = lane.x if side==0 else lane.y
   var normal := Vector3.RIGHT if side==0 else Vector3.LEFT
   for t in range(0,faces.size(),3):
    var order := [0,1,2] if side==0 else [0,2,1]
    for j in order:
     var p: Vector2 = section[faces[t+j]]
     caps.set_normal(normal)
     caps.add_vertex(steps.transform.affine_inverse()*Vector3(x,p.y,p.x))
 caps.commit(replacement)
 remaining_triangles += (faces.size()/3)*6
 steps.mesh = replacement
 var material := court.get_active_material(0)
 var lanes_root := Node3D.new()
 lanes_root.name = "OpenStonePassages"
 gate.add_child(lanes_root)
 for i in LANES.size():
  var span: Vector2 = LANES[i]
  var path := SurfaceTool.new()
  path.begin(Mesh.PRIMITIVE_TRIANGLES)
  path.set_material(material)
  # Local z is world z + 14. The ramp removes the former 0.42-unit
  # continuous stair barrier. The rear slab overlaps the real outer court.
  _quad(path,Vector3(span.x,0.102,7.0),Vector3(span.y,0.102,7.0),Vector3(span.y,0.147,3.45),Vector3(span.x,0.147,3.45))
  _quad(path,Vector3(span.x,0.147,3.45),Vector3(span.y,0.147,3.45),Vector3(span.y,0.147,-6.5),Vector3(span.x,0.147,-6.5))
  var floor_mesh := MeshInstance3D.new()
  floor_mesh.name = "StonePassage_%d" % i
  floor_mesh.mesh = path.commit()
  lanes_root.add_child(floor_mesh)
 var result := {"applied":true,"original_step_triangles":original_triangles,"new_step_triangles":remaining_triangles,"passages":3,"floor_triangles":12,"other_meshes_changed":0}
 gate.set_meta("open_passage_thresholds",result)
 return result
static func _clip(poly: Array, x: float, keep_right: bool) -> Array:
 var result: Array = []
 if poly.is_empty(): return result
 var previous: Dictionary = poly[-1]
 var previous_inside: bool = previous.v.x >= x if keep_right else previous.v.x <= x
 for point in poly:
  var inside: bool = point.v.x >= x if keep_right else point.v.x <= x
  if inside != previous_inside:
   var t: float = (x-previous.v.x)/(point.v.x-previous.v.x)
   result.append({"v":previous.v.lerp(point.v,t),"n":previous.n.lerp(point.n,t).normalized()})
  if inside: result.append(point)
  previous=point
  previous_inside=inside
 return result
static func _quad(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, d: Vector3) -> void:
 # Clockwise when seen from above, as required by Godot's front-face winding.
 var n := (b-a).cross(c-a).normalized()
 for v in [a,c,b,a,d,c]:
  st.set_normal(n)
  st.add_vertex(v)
