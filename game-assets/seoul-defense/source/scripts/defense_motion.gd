class_name DefenseMotion
extends RefCounted
static func descent_progress(progress: float) -> float:
    var t := clampf(progress, 0.0, 1.0)
    return 0.48 * t + 0.52 * t * t
static func incoming_position(start: Vector3, target: Vector3, progress: float) -> Vector3:
    var t := clampf(progress, 0.0, 1.0)
    # The approach closes the horizontal distance first, then steepens into a
    # terminal dive. This keeps the late descent over its roof, not inside a
    # mountain immediately north of a low city target.
    var p := start.lerp(target, 1.0 - (1.0 - t) * (1.0 - t))
    p.y = lerpf(start.y, target.y, descent_progress(t))
    return p
static func incoming_tangent(start: Vector3, target: Vector3, progress: float) -> Vector3:
    var t := clampf(progress, 0.0, 1.0)
    var tangent := (target - start) * (2.0 - 2.0 * t)
    tangent.y = (target.y - start.y) * (0.48 + 1.04 * t)
    return tangent.normalized()
static func position_at ( start : Vector3 , target : Vector3 , progress : float , arc : float ) -> Vector3 :
    var p = start . lerp ( target , progress )
    p . y += sin ( progress * PI ) * arc
    return p
static func tangent_at ( start : Vector3 , target : Vector3 , progress : float , arc : float ) -> Vector3 :
    var tangent = target - start
    tangent . y += cos ( progress * PI ) * PI * arc
    return tangent . normalized ( )
static func advance_trail ( state : Dictionary , previous : Vector3 , current : Vector3 , delta : float , interval : float = 0.025 , capacity : int = 60 ) -> void :
    var residual : float = state . get ( "trail_clock" , 0.0 )
    var next : float = interval - residual
    var emitted = 0
    while next <= delta + 1e-06 :
        state . history . push_front ( previous . lerp ( current , clampf ( next / maxf ( delta , 1e-06 ) , 0.0 , 1.0 ) ) )
        if state . history . size ( ) > capacity : state . history . pop_back ( )
        emitted += 1
        next += interval
    state . trail_clock = maxf ( 0.0 , residual + delta - emitted * interval )
static func visible_trail ( state : Dictionary , current : Vector3 ) -> Array :
    var result : Array = [ current ]
    result . append_array ( state . history )
    return result
static func camera_offset ( time : float , strength : float ) -> Vector3 :
    return Vector3 ( sin ( time * 23.0 ) , sin ( time * 17.0 + 0.8 ) , 0 ) * strength * 0.23
