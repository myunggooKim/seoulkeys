extends RefCounted
signal prelaunch_started ( target : Dictionary )
signal prelaunch_cancelled
signal prelaunch_finished
const PRELAUNCH_TIME = 0.28
const CAPACITY = 8
const MIN_AIM_TIME = 0.1
const TURN_GAIN = 25.0
const MAX_TURN_RATE = 14.0
const ALIGN_TOLERANCE = 0.012
var _rack : Node3D
var _rest_basis = Basis . IDENTITY
var _validator = Callable ( )
var _targets : Array = [ null , null , null , null , null , null , null , null ]
var _head = 0
var _count = 0
var _age = 0.0
var _yaw = 0.0
var _prelaunch = false
var _prelaunch_age = 0.0
func configure ( rack : Node3D , validator : Callable = Callable ( ) ) -> void :
    clear ( )
    _rack = rack
    _validator = validator
    if is_instance_valid ( _rack ) : _rest_basis = _rack . basis
func pending_count ( ) -> int :
    return _count
func is_prelaunch ( ) -> bool :
    return _prelaunch
func prelaunch_elapsed ( ) -> float :
    return _prelaunch_age
func enqueue ( target : Variant ) -> bool :
    if _count >= CAPACITY or not _rack_available ( ) or not _valid ( target ) : return false
    if bool ( target . get ( "locked" , false ) ) or bool ( target . get ( "launched" , false ) ) : return false
    for offset in range ( _count ) :
        var pending : Variant = _targets [ ( _head + offset ) % CAPACITY ]
        if pending is Dictionary and pending . get ( "node" ) == target . node : return false
    _targets [ ( _head + _count ) % CAPACITY ] = target
    _count += 1
    target . locked = true
    return true
func advance ( delta : float , suspended : bool = false ) -> Variant :
    if suspended or delta <= 0.0 or not is_finite ( delta ) or _count == 0 : return null
    if not _rack_available ( ) :
        clear ( )
        return null
    while _count > 0 and not _valid ( _targets [ _head ] ) :
        _cancel_prelaunch ( )
        _release_lock ( _pop ( ) )
    if _count == 0 : return null
    var target : Dictionary = _targets [ _head ]
    var step = minf ( delta , 0.1 )
    if _prelaunch :
        _prelaunch_age += step
        if _prelaunch_age + 1e-06 < PRELAUNCH_TIME : return null
        _prelaunch = false
        _prelaunch_age = 0.0
        prelaunch_finished . emit ( )
        return _pop ( )
    _age += step
    var goal = _target_yaw ( target . node . global_position )
    var difference = wrapf ( goal - _yaw , - PI , PI )
    var turn = clampf ( difference * ( 1.0 - exp ( - TURN_GAIN * step ) ) ,
        - MAX_TURN_RATE * step , MAX_TURN_RATE * step )
    _yaw = wrapf ( _yaw + turn , - PI , PI )
    _rack . basis = Basis ( Vector3 . UP , _yaw ) * _rest_basis
    if _age < MIN_AIM_TIME or absf ( wrapf ( goal - _yaw , - PI , PI ) ) > ALIGN_TOLERANCE :
        return null
    _yaw = _target_yaw ( target . node . global_position )
    _rack . basis = Basis ( Vector3 . UP , _yaw ) * _rest_basis
    _prelaunch = true
    _prelaunch_age = 0.0
    prelaunch_started . emit ( target )
    return null
func _cancel_prelaunch ( ) -> void :
    if _prelaunch : prelaunch_cancelled . emit ( )
    _prelaunch = false
    _prelaunch_age = 0.0
func clear ( unlock_pending : bool = true , reset_pose : bool = true ) -> void :
    _cancel_prelaunch ( )
    while _count > 0 :
        var target : Variant = _pop ( )
        if unlock_pending : _release_lock ( target )
    _head = 0
    _age = 0.0
    if reset_pose :
        _yaw = 0.0
        if is_instance_valid ( _rack ) : _rack . basis = _rest_basis
func _pop ( ) -> Variant :
    var target : Variant = _targets [ _head ]
    _targets [ _head ] = null
    _head = ( _head + 1 ) % CAPACITY
    _count -= 1
    _age = 0.0
    return target
func _release_lock ( target : Variant ) -> void :
    if target is Dictionary : target [ "locked" ] = false
func _rack_available ( ) -> bool :
    return is_instance_valid ( _rack ) and not _rack . is_queued_for_deletion ( ) and _rack . is_inside_tree ( )
func _valid ( target : Variant ) -> bool :
    if not target is Dictionary or bool ( target . get ( "launched" , false ) ) : return false
    var node : Variant = target . get ( "node" )
    if not is_instance_valid ( node ) or not node is Node3D : return false
    if node . is_queued_for_deletion ( ) or not node . is_inside_tree ( ) or not node . global_position . is_finite ( ) : return false
    return not _validator . is_valid ( ) or bool ( _validator . call ( target ) )
func _target_yaw ( position_world : Vector3 ) -> float :
    var parent = _rack . get_parent_node_3d ( )
    var direction = position_world - _rack . global_position
    if parent : direction = parent . global_basis . inverse ( ) * direction
    if direction . x * direction . x + direction . z * direction . z < 1e-06 : return _yaw
    var rest_forward = _rest_basis * Vector3 . FORWARD
    return wrapf ( atan2 ( - direction . x , - direction . z ) - atan2 ( - rest_forward . x , - rest_forward . z ) , - PI , PI )
