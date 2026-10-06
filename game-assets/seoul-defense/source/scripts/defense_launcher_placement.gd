extends RefCounted
static func projected_bounds ( camera : Camera3D , world_transform : Transform3D , bounds : AABB ) -> Rect2 :
    var result = Rect2 ( camera . unproject_position ( world_transform * bounds . position ) , Vector2 . ZERO )
    for x in [ bounds . position . x , bounds . end . x ] :
        for y in [ bounds . position . y , bounds . end . y ] :
            for z in [ bounds . position . z , bounds . end . z ] :
                result = result . expand ( camera . unproject_position ( world_transform * Vector3 ( x , y , z ) ) )
    return result
static func ground_at ( camera : Camera3D , pixel : Vector2 , level : float ) -> Vector3 :
    var origin = camera . project_ray_origin ( pixel )
    var direction = camera . project_ray_normal ( pixel )
    if absf ( direction . y ) < 0.001 : return origin + direction * 40.0
    return origin + direction * ( ( level - origin . y ) / direction . y )
static func fit ( camera : Camera3D , launcher : Node3D , bounds : AABB , viewport : Vector2 , floor_pixel : float , playfield_height : float , foreground_depth : float = 34.0 ) -> Rect2 :
    var desired_bottom = clampf ( floor_pixel , viewport . y * 0.48 , viewport . y - 8.0 )
    var desired_height = clampf ( playfield_height * 0.29 , 62.0 , 155.0 )
    var desired_width = viewport . x * ( 0.43 if viewport . x < 680 else 0.25 )
    launcher . scale = Vector3 . ONE
    launcher . position = camera . project_position ( Vector2 ( viewport . x * 0.5 , desired_bottom ) , foreground_depth )
    for i in range ( 5 ) :
        var box = projected_bounds ( camera , launcher . global_transform , bounds )
        var ratio = minf ( desired_height / maxf ( 1.0 , box . size . y ) , desired_width / maxf ( 1.0 , box . size . x ) )
        launcher . scale = Vector3 . ONE * clampf ( launcher . scale . x * ratio , 0.65 , 3.2 )
        box = projected_bounds ( camera , launcher . global_transform , bounds )
        var pivot = camera . unproject_position ( launcher . global_position )
        var correction = Vector2 ( viewport . x * 0.5 - box . get_center ( ) . x , desired_bottom - box . end . y )
        launcher . position = camera . project_position ( pivot + correction , foreground_depth )
    return projected_bounds ( camera , launcher . global_transform , bounds )
