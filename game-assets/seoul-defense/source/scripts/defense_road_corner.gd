extends RefCounted
# The imported Sejong-daero sidewalk was a rectangular slab across the existing
# rounded asphalt/curb. Rebuild that slab's real outline before static batching.
# Road, vehicles, crossings, street trees, and every other mesh remain unchanged.
const SIDEWALK_NAME = "Sejong-daero east sidewalk | paving_001"
const CURB_NAME = "Street-network granite edge | limestone_001"
const META_KEY = "sejong_turn_sidewalk_cut"
static func apply(context: Node3D) -> Dictionary:
 if context.has_meta(META_KEY): return context.get_meta(META_KEY)
 var sidewalk := context.find_child(SIDEWALK_NAME, true, false) as MeshInstance3D
 var curb := context.find_child(CURB_NAME, true, false) as MeshInstance3D
 if sidewalk == null or curb == null or sidewalk.mesh == null or curb.mesh == null:
  return {"applied":false,"reason":"Original sidewalk or curved street edge missing"}
 var to_context := context.global_transform.affine_inverse() * sidewalk.global_transform
 var bounds: AABB = to_context * sidewalk.mesh.get_aabb()
 if absf(bounds.position.x-34.65)>0.01 or absf(bounds.end.x-38.75)>0.01 or absf(bounds.position.z-5.0)>0.01 or absf(bounds.end.z-119.0)>0.01:
  return {"applied":false,"reason":"Unexpected sidewalk geometry"}
 var edge := _curb_edge(context,curb)
 if edge.size()<16:
  return {"applied":false,"reason":"Expected rounded street edge missing"}
 # Preserve the original 10 cm joint between the straight road curb and paving.
 var joint: float = bounds.position.x-edge[-1].x
 var outline := PackedVector2Array()
 var previous: Vector2 = edge[0]+Vector2(joint,0)
 for point in edge:
  var shifted: Vector2 = point+Vector2(joint,0)
  if shifted.x <= bounds.end.x:
   if outline.is_empty():
    var t: float = (bounds.end.x-previous.x)/(shifted.x-previous.x)
    outline.append(previous.lerp(shifted,t))
   outline.append(shifted)
  previous=shifted
 outline.append(Vector2(bounds.position.x,bounds.end.z))
 outline.append(Vector2(bounds.end.x,bounds.end.z))
 var indices := Geometry2D.triangulate_polygon(outline)
 if indices.is_empty(): return {"applied":false,"reason":"Invalid trimmed sidewalk outline"}
 var st := SurfaceTool.new()
 st.begin(Mesh.PRIMITIVE_TRIANGLES)
 st.set_material(sidewalk.get_active_material(0))
 var inverse := to_context.affine_inverse()
 for i in range(0,indices.size(),3):
  for top in [true,false]:
   var normal := Vector3.UP if top else Vector3.DOWN
   var height: float = bounds.end.y if top else bounds.position.y
   var a := _point(outline[indices[i]],height)
   var b := _point(outline[indices[i+1]],height)
   var c := _point(outline[indices[i+2]],height)
   _triangle(st,inverse,a,b,c,normal)
 var clockwise := Geometry2D.is_polygon_clockwise(outline)
 for i in outline.size():
  var a: Vector2=outline[i]
  var b: Vector2=outline[(i+1)%outline.size()]
  var direction: Vector2=(b-a).normalized()
  var normal:=Vector3(direction.y,0,-direction.x)
  if clockwise:normal=-normal
  _triangle(st,inverse,_point(a,bounds.position.y),_point(b,bounds.position.y),_point(b,bounds.end.y),normal)
  _triangle(st,inverse,_point(a,bounds.position.y),_point(b,bounds.end.y),_point(a,bounds.end.y),normal)
 # Static batching combines this with indexed imported paving surfaces.
 st.index()
 sidewalk.mesh=st.commit()
 var cut_area := bounds.size.x*bounds.size.z-absf(_area(outline))
 var result:Dictionary={"applied":true,"changed_meshes":1,"road_and_curb_reused":true,"outline_points":outline.size(),"removed_paving_area":cut_area,"original_front_z":bounds.position.z,"new_front_z":outline[0].y,"joint":joint}
 context.set_meta(META_KEY,result)
 return result
static func _curb_edge(context:Node3D,curb:MeshInstance3D)->PackedVector2Array:
 var transform:=context.global_transform.affine_inverse()*curb.global_transform
 var unique:Dictionary={}
 for vertex in curb.mesh.get_faces():
  var p:Vector3=transform*vertex
  if p.x>=34.4 and p.x<=42.6 and p.z>=7.7 and p.z<=16.0 and p.y>0.1:
   var key:=Vector2(snappedf(p.x,0.0001),snappedf(p.z,0.0001))
   unique[key]=true
 var points:Array=unique.keys()
 points.sort_custom(func(a:Vector2,b:Vector2):return a.y<b.y)
 return PackedVector2Array(points)
static func _point(p:Vector2,height:float)->Vector3:return Vector3(p.x,height,p.y)
static func _triangle(st:SurfaceTool,inverse:Transform3D,a:Vector3,b:Vector3,c:Vector3,normal:Vector3)->void:
 var vertices:Array=[a,b,c]
 # Godot front faces wind clockwise when viewed from their outside normal.
 if (b-a).cross(c-a).dot(normal)>0:vertices=[a,c,b]
 for p in vertices:
  st.set_normal((inverse.basis*normal).normalized())
  st.add_vertex(inverse*p)
static func _area(poly:PackedVector2Array)->float:
 var area:=0.0
 for i in poly.size():area+=poly[i].cross(poly[(i+1)%poly.size()])
 return area*0.5
