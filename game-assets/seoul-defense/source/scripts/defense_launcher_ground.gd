extends "res://scripts/defense_launcher_placement.gd"
# Reframe downward without translating the camera or changing its field of view.
# The full launcher can then stand on the promenade south of Admiral Yi.
const GWANGHWAMUN_TARGET_DROP = 6.0
# Bounds measured from the retained live-11 Admiral Yi limestone mesh.
# Positive Z is toward the camera: reserve a real gap beyond the pedestal,
# including the entire truck footprint rather than just its center pivot.
const ADMIRAL_YI_PEDESTAL_FRONT_Z = 31.1
const STATUE_GROUND_CLEARANCE = 0.8
const GWANGHWAMUN_BAY_NEAR = ADMIRAL_YI_PEDESTAL_FRONT_Z + STATUE_GROUND_CLEARANCE
const GWANGHWAMUN_BAY_FAR = 52.5
static func camera_target ( original : Vector3 , scene_name : String ) -> Vector3 :
 return original - Vector3 ( 0 , GWANGHWAMUN_TARGET_DROP , 0 ) if scene_name == "gwanghwamun" else original
static func fit_ground ( camera : Camera3D , launcher : Node3D , bounds : AABB , viewport : Vector2 , floor_pixel : float , playfield_height : float , ground_y : float , center_fraction : float = 0.5 ) -> Rect2 :
 var desired_bottom = minf ( floor_pixel , viewport . y - 8.0 )
 var portrait = viewport . x < 680
 var desired_height = clampf ( playfield_height * 0.38 , 70.0 , 202.0 ) if not portrait else clampf ( playfield_height * 0.32 , 65.0 , 162.0 )
 if viewport . y < 500 : desired_height = minf ( 105.0 , viewport . y * 0.3 )
 var desired_width = viewport . x * ( 0.54 if portrait else 0.32 )
 var center_x = viewport . x * center_fraction
 launcher . scale = Vector3 . ONE
 launcher . position = ground_at ( camera , Vector2 ( center_x , desired_bottom ) , ground_y )
 for i in range ( 12 ) :
  var box = projected_bounds ( camera , launcher . global_transform , bounds )
  var ratio = minf ( desired_height / maxf ( 1.0 , box . size . y ) , desired_width / maxf ( 1.0 , box . size . x ) )
  launcher . scale = Vector3 . ONE * clampf ( launcher . scale . x * ratio , 0.45 , 4.5 )
  box = projected_bounds ( camera , launcher . global_transform , bounds )
  var pivot = camera . unproject_position ( launcher . global_position )
  var correction = Vector2 ( center_x - box . get_center ( ) . x , desired_bottom - box . end . y )
  launcher . position = ground_at ( camera , pivot + correction , ground_y )
  launcher . position . y = ground_y
 return projected_bounds ( camera , launcher . global_transform , bounds )
static func fit_scene ( camera : Camera3D , launcher : Node3D , bounds : AABB , viewport : Vector2 , floor_pixel : float , playfield_height : float , clearance : Rect2 , scene_name : String ) -> Rect2 :
 # The two statues and road stay in place. Fit inside the real open promenade,
 # rather than translating the truck sideways or repeatedly shrinking an invalid fit.
 var ground_y = 0.275 if scene_name == "gwanghwamun" else -0.065
 var bay_near = GWANGHWAMUN_BAY_NEAR if scene_name == "gwanghwamun" else 46.5
 var bay_far = GWANGHWAMUN_BAY_FAR if scene_name == "gwanghwamun" else 63.0
 var center = Vector2 ( viewport . x * 0.5 , minf ( floor_pixel , clearance . end . y ) )
 fit_ground ( camera , launcher , bounds , viewport , center . y , playfield_height , ground_y )
 var high = launcher . scale . x
 var low = 0.01
 var best_scale = low
 # Include three crew members standing on the right of the truck. This is
 # clearance only: the launcher itself remains centered over the typing bar.
 var assembly_bounds = bounds
 assembly_bounds . size . x += 2.6
 var safe_left = clearance . position . x
 var safe_right = clearance . end . x
 if viewport . x < 760 :
  safe_left = maxf ( safe_left , 78.0 )
  safe_right = minf ( safe_right , viewport . x - 66.0 )
 for iteration in range ( 28 ) :
  var scale_value = ( low + high ) * 0.5
  launcher . scale = Vector3 . ONE * scale_value
  _align_assembly_ground ( camera , launcher , bounds , assembly_bounds , center , ground_y )
  var footprint : AABB = launcher . global_transform * bounds
  if footprint . end . z > bay_far :
   launcher . position . z -= footprint . end . z - bay_far
  _align_horizontal ( camera , launcher , bounds , center . x , ground_y )
  footprint = launcher . global_transform * bounds
  var group_rect = projected_bounds ( camera , launcher . global_transform , assembly_bounds )
  var okay = footprint . position . z >= bay_near and group_rect . position . x >= safe_left and group_rect . end . x <= safe_right and group_rect . end . y <= center . y + 0.5 and group_rect . position . y >= clearance . position . y
  if okay :
   best_scale = scale_value
   low = scale_value
  else :
   high = scale_value
 launcher . scale = Vector3 . ONE * best_scale
 _align_assembly_ground ( camera , launcher , bounds , assembly_bounds , center , ground_y )
 var footprint : AABB = launcher . global_transform * bounds
 if footprint . end . z > bay_far :
  launcher . position . z -= footprint . end . z - bay_far
 if footprint . position . z < bay_near :
  launcher . position . z += bay_near - footprint . position . z
 _align_horizontal ( camera , launcher , bounds , center . x , ground_y )
 return projected_bounds ( camera , launcher . global_transform , bounds )
static func _align_assembly_ground ( camera : Camera3D , launcher : Node3D , bounds : AABB , assembly_bounds : AABB , center : Vector2 , ground_y : float ) -> void :
 for iteration in range ( 8 ) :
  var truck = projected_bounds ( camera , launcher . global_transform , bounds )
  var assembly = projected_bounds ( camera , launcher . global_transform , assembly_bounds )
  var pivot = camera . unproject_position ( launcher . global_position )
  launcher . position = ground_at ( camera , pivot + Vector2 ( center . x - truck . get_center ( ) . x , center . y - assembly . end . y ) , ground_y )
  launcher . position . y = ground_y
static func _align_horizontal ( camera : Camera3D , launcher : Node3D , bounds : AABB , center_x : float , ground_y : float ) -> void :
 for iteration in range ( 3 ) :
  var box = projected_bounds ( camera , launcher . global_transform , bounds )
  var pivot = camera . unproject_position ( launcher . global_position )
  var aligned = ground_at ( camera , pivot + Vector2 ( center_x - box . get_center ( ) . x , 0 ) , ground_y )
  launcher . position . x = aligned . x
static func _align_ground ( camera : Camera3D , launcher : Node3D , bounds : AABB , desired : Vector2 , ground_y : float ) -> Rect2 :
 for i in range ( 5 ) :
  var box = projected_bounds ( camera , launcher . global_transform , bounds )
  var pivot = camera . unproject_position ( launcher . global_position )
  launcher . position = ground_at ( camera , pivot + Vector2 ( desired . x - box . get_center ( ) . x , desired . y - box . end . y ) , ground_y )
  launcher . position . y = ground_y
 return projected_bounds ( camera , launcher . global_transform , bounds )
static func prepare_service_bay ( context : Node3D , scene_name : String ) -> int :
 var region = Rect2 ( -23 , 21.5 , 20 , 16.5 ) if scene_name == "gwanghwamun" else Rect2 ( -12 , 46 , 31 , 18 )
 var removed = 0
 var static_root = context . find_child ( "StaticContext" , true , false )
 if not static_root : return 0
 for child in static_root . find_children ( "*" , "MeshInstance3D" , true , false ) :
  if not child is MeshInstance3D or child . mesh == null : continue
  var label = str ( child . name ) . to_lower ( )
  var selected = ( label . contains ( "square avenue trees" ) or label . contains ( "western benches" ) ) if scene_name == "gwanghwamun" else ( label . contains ( "forest_and_river_parks" ) or label . contains ( "tree_trunks" ) )
  if not selected : continue
  var replacement = ArrayMesh . new ( )
  for surface in range ( child . mesh . get_surface_count ( ) ) :
   var arrays = child . mesh . surface_get_arrays ( surface )
   var vertices : PackedVector3Array = arrays [ Mesh . ARRAY_VERTEX ]
   var indices : PackedInt32Array = arrays [ Mesh . ARRAY_INDEX ]
   var kept = PackedInt32Array ( )
   for offset in range ( 0 , indices . size ( ) , 3 ) :
    var center = context . global_transform . affine_inverse ( ) * child . global_transform * ( ( vertices [ indices [ offset ] ] + vertices [ indices [ offset + 1 ] ] + vertices [ indices [ offset + 2 ] ] ) / 3.0 )
    if region . has_point ( Vector2 ( center . x , center . z ) ) :
     removed += 1
    else :
     kept . append ( indices [ offset ] ) ; kept . append ( indices [ offset + 1 ] ) ; kept . append ( indices [ offset + 2 ] )
   if kept . is_empty ( ) : continue
   arrays [ Mesh . ARRAY_INDEX ] = kept
   replacement . add_surface_from_arrays ( Mesh . PRIMITIVE_TRIANGLES , arrays )
   replacement . surface_set_material ( replacement . get_surface_count ( ) - 1 , child . mesh . surface_get_material ( surface ) )
  child . mesh = replacement
 return removed
