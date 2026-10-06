extends Node
signal damage_changed ( state : Dictionary )
signal defeat_reached ( state : Dictionary )
const DEFEAT_PERCENT : = 80
var scene_id : = ""
var phase : = "briefing"
var _root : Node3D
var _zones : Dictionary = { }
var _ids : Array [ String ] = [ ]
var _destroyed : Dictionary = { }
var _reservations : Dictionary = { }
var _target_order : Array [ String ] = [ ]
var _cursor : = 0
var _defeat_emitted : = false
var _seed : = 71835
const COLLAPSE_SECONDS : = 1.15
const REDUCED_SECONDS : = 0.32
const ImpactFX = preload ( "res://scripts/defense_city_impact_fx.gd" )
var reduced_motion : = false
var paused : = false
var _fx : Node3D
var _collapsing : Array [ String ] = [ ]
func configure ( context_root : Node3D , metadata : Dictionary , spread_seed : int = 71835 ) -> bool :
    var candidate : Dictionary = { }
    var ids : Array [ String ] = [ ]
    var entries : Array = metadata . get ( "zones" , [ ] )
    if not is_instance_valid ( context_root ) or entries . is_empty ( ) : return false
    if int ( metadata . get ( "denominator" , -1 ) ) != entries . size ( ) : return false
    if int ( metadata . get ( "defeat_percent" , DEFEAT_PERCENT ) ) != DEFEAT_PERCENT : return false
    for entry in entries :
        if not entry is Dictionary : return false
        var id : = str ( entry . get ( "id" , "" ) )
        if id . is_empty ( ) or candidate . has ( id ) : return false
        var zone : = context_root . find_child ( id , true , false ) as Node3D
        if zone == null : return false
        var intact : = zone . get_node_or_null ( NodePath ( str ( entry . get ( "intact_name" , "" ) ) ) ) as Node3D
        var rubble : = zone . get_node_or_null ( NodePath ( str ( entry . get ( "rubble_name" , "" ) ) ) ) as Node3D
        var target : Array = entry . get ( "target" , [ ] )
        if intact == null or rubble == null or target . size ( ) != 3 : return false
        if int ( entry . get ( "weight" , 1 ) ) != 1 : return false
        var bounds : Array = entry . get ( "bounds" , [ ] )
        if bounds . size ( ) != 2 or not bounds [ 0 ] is Array or not bounds [ 1 ] is Array : return false
        if bounds [ 0 ] . size ( ) != 3 or bounds [ 1 ] . size ( ) != 3 : return false
        var low : = _vector ( bounds [ 0 ] ) ; var high : = _vector ( bounds [ 1 ] )
        if not low . is_finite ( ) or not high . is_finite ( ) or high . y <= low . y : return false
        var pivot_context : = Vector3 ( ( low . x + high . x ) * 0.5 , low . y , ( low . z + high . z ) * 0.5 )
        var rest : Transform3D = intact . transform
        if _zones . has ( id ) and _zones [ id ] . intact == intact : rest = _zones [ id ] . rest
        var rest_global : Transform3D = intact . get_parent_node_3d ( ) . global_transform * rest
        var pivot_local : = ( context_root . global_transform . affine_inverse ( ) * rest_global ) . affine_inverse ( ) * pivot_context
        candidate [ id ] = { "definition" : entry . duplicate ( true ) , "zone" : zone , "intact" : intact , "rubble" : rubble ,
            "rest" : rest , "pivot" : pivot_local , "size" : high - low , "age" : 0.0 , "duration" : COLLAPSE_SECONDS ,
            "quiet" : false , "sign" : 1.0 if ids . size ( ) % 2 == 0 else -1.0 }
        ids . append ( id )
    _restore_transforms ( )
    _ensure_fx ( )
    _fx . clear ( )
    _root = context_root
    scene_id = str ( metadata . get ( "scene" , "" ) )
    _zones = candidate
    _ids = ids
    _seed = spread_seed
    _root . set_meta ( "geometry_batched" , true )
    _root . set_meta ( "city_damage_partitioned" , true )
    reset ( "briefing" )
    return true
func batch_roots ( ) -> Array [ Node3D ] :
    var result : Array [ Node3D ] = [ ]
    if not is_instance_valid ( _root ) : return result
    var static_root : = _root . find_child ( "StaticContext" , true , false ) as Node3D
    if static_root : result . append ( static_root )
    for id in _ids :
        result . append ( _zones [ id ] . intact )
        result . append ( _zones [ id ] . rubble )
    return result
func reset ( next_phase : String = "playing" ) -> void :
    _restore_transforms ( )
    if is_instance_valid ( _fx ) : _fx . clear ( )
    _destroyed . clear ( )
    _reservations . clear ( )
    _cursor = 0
    _defeat_emitted = false
    phase = next_phase
    _target_order = _ids . duplicate ( )
    var rng : = RandomNumberGenerator . new ( )
    rng . seed = _seed
    for i in range ( _target_order . size ( ) - 1 , 0 , -1 ) :
        var j : = rng . randi_range ( 0 , i )
        var temp : = _target_order [ i ]
        _target_order [ i ] = _target_order [ j ]
        _target_order [ j ] = temp
    for id in _ids :
        _zones [ id ] . age = 0.0
        _zones [ id ] . intact . visible = true
        _zones [ id ] . rubble . visible = false
    damage_changed . emit ( stats ( ) )
func set_phase ( next_phase : String ) -> void :
    phase = next_phase
func reserve_target ( missile_id : int ) -> Dictionary :
    if phase != "playing" or is_defeated ( ) or _target_order . is_empty ( ) : return { }
    if _reservations . has ( missile_id ) : return target_for ( str ( _reservations [ missile_id ] ) )
    for allow_reserved in [ false , true ] :
        for offset in range ( _target_order . size ( ) ) :
            var index : = ( _cursor + offset ) % _target_order . size ( )
            var id : = _target_order [ index ]
            if _destroyed . has ( id ) : continue
            if not allow_reserved and _reservations . values ( ) . has ( id ) : continue
            _reservations [ missile_id ] = id
            _cursor = ( index + 1 ) % _target_order . size ( )
            return target_for ( id )
    return { }
func target_for ( zone_id : String ) -> Dictionary :
    if not _zones . has ( zone_id ) : return { }
    var info : Dictionary = _zones [ zone_id ] . definition
    var p : Array = info . target
    return { "zone_id" : zone_id , "name" : str ( info . name ) , "target" : _root . to_global ( Vector3 ( float ( p [ 0 ] ) , float ( p [ 1 ] ) , float ( p [ 2 ] ) ) ) , "floor_y" : _root . to_global ( Vector3 ( 0 , float ( info . floor_y ) , 0 ) ) . y }
func release_target ( missile_id : int ) -> void :
    _reservations . erase ( missile_id )
func apply_impact ( zone_id : String , missile_id : int = -1 ) -> Dictionary :
    if missile_id >= 0 : release_target ( missile_id )
    if phase != "playing" : return _result ( false , "inactive" )
    if not _zones . has ( zone_id ) : return _result ( false , "unknown_zone" )
    if _destroyed . has ( zone_id ) : return _result ( false , "already_destroyed" )
    _destroyed [ zone_id ] = true
    _begin_collapse ( zone_id )
    if is_defeated ( ) : phase = "over"
    var result : = _result ( true , "destroyed" )
    damage_changed . emit ( stats ( ) )
    if is_defeated ( ) and not _defeat_emitted :
        _defeat_emitted = true
        defeat_reached . emit ( stats ( ) )
    return result
func damaged_count ( ) -> int :
    return _destroyed . size ( )
func total_count ( ) -> int :
    return _ids . size ( )
func is_zone_destroyed ( zone_id : String ) -> bool :
    return _destroyed . has ( zone_id )
func destruction_ratio ( ) -> float :
    return 0.0 if _ids . is_empty ( ) else float ( _destroyed . size ( ) ) / float ( _ids . size ( ) )
static func threshold_reached ( count : int , total : int ) -> bool :
    return total > 0 and maxi ( 0 , count ) * 100 >= total * DEFEAT_PERCENT
func is_defeated ( ) -> bool :
    return threshold_reached ( _destroyed . size ( ) , _ids . size ( ) )
func stats ( ) -> Dictionary :
    var total : = total_count ( )
    var damaged : = damaged_count ( )
    return { "scene" : scene_id , "damaged" : damaged , "total" : total , "percent" : 0 if total == 0 else int ( floor ( float ( damaged * 100 ) / total ) ) , "ratio" : destruction_ratio ( ) , "defeated" : is_defeated ( ) , "phase" : phase }
func _result ( changed : bool , reason : String ) -> Dictionary :
    var result : = stats ( )
    result [ "changed" ] = changed
    result [ "reason" ] = reason
    return result
func _ensure_fx ( ) -> void :
    if is_instance_valid ( _fx ) : return
    _fx = ImpactFX . new ( )
    _fx . name = "CityImpactFX"
    add_child ( _fx )
    _fx . initialize ( )
static func _vector ( value : Array ) -> Vector3 :
    return Vector3 ( float ( value [ 0 ] ) , float ( value [ 1 ] ) , float ( value [ 2 ] ) )
func set_paused ( enabled : bool ) -> void :
    paused = enabled
    if is_instance_valid ( _fx ) : _fx . set_paused ( enabled )
func set_reduced_motion ( enabled : bool ) -> void :
    if reduced_motion == enabled : return
    reduced_motion = enabled
    if is_instance_valid ( _fx ) : _fx . set_reduced_motion ( enabled )
    if enabled :
        for id in _collapsing :
            var zone : Dictionary = _zones [ id ]
            zone . intact . transform = zone . rest
            zone . age = 0.0
            zone . duration = REDUCED_SECONDS
            zone . quiet = true
func _begin_collapse ( id : String ) -> void :
    var zone : Dictionary = _zones [ id ]
    zone . age = 0.0
    zone . duration = REDUCED_SECONDS if reduced_motion else COLLAPSE_SECONDS
    zone . quiet = reduced_motion
    zone . intact . visible = true
    zone . rubble . visible = false
    _collapsing . append ( id )
    _ensure_fx ( )
    _fx . set_reduced_motion ( reduced_motion )
    var definition : Dictionary = zone . definition
    var roof : = _vector ( definition . target )
    var low : = _vector ( definition . bounds [ 0 ] ) ; var high : = _vector ( definition . bounds [ 1 ] )
    for footprint in definition . get ( "building_footprints" , [ ] ) :
        var a : = _vector ( footprint [ 0 ] ) ; var b : = _vector ( footprint [ 1 ] )
        if roof . x >= a . x - 0.25 and roof . x <= b . x + 0.25 and roof . z >= a . z - 0.25 and roof . z <= b . z + 0.25 :
            low = a ; high = b ; break
    var effects_floor : = float ( definition . get ( "effects_floor_y" , definition . floor_y ) )
    _fx . impact ( _root . to_global ( roof ) , _root . to_global ( Vector3 ( roof . x , effects_floor , roof . z ) ) . y , _root . to_global ( low ) , _root . to_global ( high ) )
    var footprints : Array = definition . get ( "building_footprints" , [ ] )
    var secondary : = 0
    var stride : = maxi ( 1 , int ( ceil ( float ( footprints . size ( ) ) / 4.0 ) ) )
    for index in range ( 0 , footprints . size ( ) , stride ) :
        if secondary >= 3 : break
        var a : = _vector ( footprints [ index ] [ 0 ] ) ; var b : = _vector ( footprints [ index ] [ 1 ] )
        if roof . x >= a . x - 0.25 and roof . x <= b . x + 0.25 and roof . z >= a . z - 0.25 and roof . z <= b . z + 0.25 : continue
        var center : = ( a + b ) * 0.5
        var support : = maxf ( a . y , effects_floor ) if definition . has ( "effects_floor_y" ) else a . y
        _fx . collapse_site ( _root . to_global ( center ) , _root . to_global ( Vector3 ( center . x , support , center . z ) ) . y , _root . to_global ( a ) , _root . to_global ( b ) )
        secondary += 1
func advance ( delta : float ) -> void :
    if paused or delta <= 0.0 or not is_finite ( delta ) : return
    for index in range ( _collapsing . size ( ) - 1 , -1 , -1 ) :
        var id : = _collapsing [ index ]
        var zone : Dictionary = _zones [ id ]
        if not is_instance_valid ( zone . intact ) :
            _collapsing . remove_at ( index ) ; continue
        zone . age = float ( zone . age ) + delta
        var t : = clampf ( float ( zone . age ) / float ( zone . duration ) , 0.0 , 1.0 )
        if bool ( zone . quiet ) :
            var basis : = Basis . IDENTITY . scaled ( Vector3 ( 1.0 , lerpf ( 1.0 , 0.32 , t ) , 1.0 ) )
            zone . intact . transform = zone . rest * _around_pivot ( basis , zone . pivot , Vector3 . ZERO )
        else :
            var settle : = smoothstep ( 0.12 , 1.0 , t )
            var span : = maxf ( float ( zone . size . x ) , float ( zone . size . z ) )
            var lean : = minf ( 0.14 , float ( zone . size . y ) * 0.085 / maxf ( span , 1.0 ) ) * sin ( settle * PI * 0.78 )
            var shake : = sin ( t * 42.0 ) * 0.032 * ( 1.0 - settle )
            var basis : = Basis . from_euler ( Vector3 ( lean * 0.55 , 0.0 , lean * float ( zone . sign ) ) )
            basis = basis . scaled ( Vector3 ( 1.0 - settle * 0.025 , 1.0 - settle * 0.78 , 1.0 - settle * 0.025 ) )
            var shift : = Vector3 ( shake , - minf ( 0.75 , float ( zone . size . y ) * 0.055 ) * settle , 0.0 )
            zone . intact . transform = zone . rest * _around_pivot ( basis , zone . pivot , shift )
        zone . rubble . visible = t >= 0.4
        if t >= 1.0 :
            zone . intact . visible = false
            zone . intact . transform = zone . rest
            zone . rubble . visible = true
            _collapsing . remove_at ( index )
    if is_instance_valid ( _fx ) : _fx . advance ( delta )
static func _around_pivot ( basis : Basis , pivot : Vector3 , shift : Vector3 ) -> Transform3D :
    return Transform3D ( basis , pivot - basis * pivot + shift )
func _restore_transforms ( ) -> void :
    for id in _ids :
        if _zones . has ( id ) and is_instance_valid ( _zones [ id ] . intact ) :
            _zones [ id ] . intact . transform = _zones [ id ] . rest
    _collapsing . clear ( )
func is_zone_collapsing ( id : String ) -> bool :
    return _collapsing . has ( id )
func debug_visuals ( ) -> Dictionary :
    var result : Dictionary = _fx . debug_snapshot ( ) if is_instance_valid ( _fx ) else { }
    result [ "collapsing" ] = _collapsing . size ( )
    return result
func zone_visual_state ( id : String ) -> Dictionary :
    if not _zones . has ( id ) : return { }
    var zone : Dictionary = _zones [ id ]
    return { "id" : id , "destroyed" : _destroyed . has ( id ) , "collapsing" : _collapsing . has ( id ) ,
        "age" : float ( zone . age ) , "progress" : clampf ( float ( zone . age ) / float ( zone . duration ) , 0.0 , 1.0 ) ,
        "intact_visible" : zone . intact . visible , "rubble_visible" : zone . rubble . visible ,
        "intact_transform" : zone . intact . transform , "pivot_local" : zone . pivot , "rest_transform" : zone . rest }
