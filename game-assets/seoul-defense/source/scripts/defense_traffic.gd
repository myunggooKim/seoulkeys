extends Node3D
class_name DefenseTraffic
const MODEL_NAMES = [ "sedan" , "taxi" , "bus-green" , "bus-blue" ]
const MAX_VEHICLES = 32
var vehicles : Array = [ ]
var lanes : Array = [ ]
var batches : Dictionary = { }
var mesh_cache : Dictionary = { }
var clock = 0.0
var speed_factor = 1.0
func configure ( routes : Array ) -> void :
    for node in batches . values ( ) : node . queue_free ( )
    batches . clear ( ) ; vehicles . clear ( ) ; lanes . clear ( ) ; clock = 0.0 ; speed_factor = 1.0
    var counts = { "sedan" : 0 , "taxi" : 0 , "bus-green" : 0 , "bus-blue" : 0 }
    for route in routes :
        if not route is Dictionary : continue
        var points : Array [ Vector3 ] = [ ]
        for p in route . get ( "points" , [ ] ) :
            if p is Array and p . size ( ) == 3 : points . append ( Vector3 ( float ( p [ 0 ] ) , float ( p [ 1 ] ) , float ( p [ 2 ] ) ) )
        if points . size ( ) < 2 : continue
        var cumulative : Array [ float ] = [ 0.0 ]
        for i in range ( 1 , points . size ( ) ) : cumulative . append ( cumulative [ -1 ] + points [ i - 1 ] . distance_to ( points [ i ] ) )
        if cumulative [ -1 ] < 1.0 : continue
        var lane = { "id" : str ( route . get ( "id" , "lane" ) ) , "points" : points , "cumulative" : cumulative , "length" : cumulative [ -1 ] , "speed" : clampf ( float ( route . get ( "speed" , 3.5 ) ) , 0.5 , 7.0 ) }
        lanes . append ( lane )
        var count = mini ( int ( route . get ( "count" , 4 ) ) , mini ( 7 , int ( lane . length / 9.0 ) ) )
        for index in range ( count ) :
            if vehicles . size ( ) >= MAX_VEHICLES : break
            var kind : String = MODEL_NAMES [ ( index + lanes . size ( ) * 2 ) % MODEL_NAMES . size ( ) ]
            if str ( route . get ( "kind" , "mixed" ) ) == "car" : kind = "taxi" if index % 4 == 0 else "sedan"
            if str ( route . get ( "kind" , "mixed" ) ) == "bus" : kind = "bus-green" if index % 2 == 0 else "bus-blue"
            vehicles . append ( { "lane" : lane , "kind" : kind , "slot" : counts [ kind ] , "offset" : lane . length * ( float ( index ) + 0.35 ) / maxi ( 1 , count ) , "position" : Vector3 . ZERO } )
            counts [ kind ] += 1
    for kind in MODEL_NAMES :
        if counts [ kind ] == 0 : continue
        if not mesh_cache . has ( kind ) : mesh_cache [ kind ] = _vehicle_mesh ( kind )
        var mm = MultiMesh . new ( ) ; mm . transform_format = MultiMesh . TRANSFORM_3D ; mm . mesh = mesh_cache [ kind ] ; mm . instance_count = counts [ kind ]
        var display = MultiMeshInstance3D . new ( ) ; display . name = "Traffic_" + kind ; display . multimesh = mm ; display . cast_shadow = GeometryInstance3D . SHADOW_CASTING_SETTING_OFF
        add_child ( display ) ; batches [ kind ] = display
    advance ( 0.0 )
func advance ( delta : float , running : bool = true ) -> void :
    speed_factor = move_toward ( speed_factor , 1.0 if running else 0.0 , delta * 1.8 )
    clock += delta * speed_factor
    for car in vehicles :
        var lane : Dictionary = car . lane
        var distance = fposmod ( float ( car . offset ) + clock * float ( lane . speed ) , float ( lane . length ) )
        var pose = sample_lane ( lane , distance )
        var transform = vehicle_transform ( pose )
        car . position = transform . origin
        batches [ car . kind ] . multimesh . set_instance_transform ( int ( car . slot ) , transform )
static func vehicle_transform ( pose : Dictionary ) -> Transform3D :
    var basis = Basis . looking_at ( pose . direction , Vector3 . UP ) . scaled ( Vector3 . ONE * 0.75 )
    return Transform3D ( basis , pose . position + Vector3 ( 0 , 0.045 , 0 ) )
static func sample_lane ( lane : Dictionary , distance : float ) -> Dictionary :
    var points : Array = lane . points
    var cumulative : Array = lane . cumulative
    var segment = 1
    var lo = 1 ; var hi = cumulative . size ( ) - 1
    while lo < hi :
        var mid = ( lo + hi ) / 2
        if float ( cumulative [ mid ] ) < distance : lo = mid + 1
        else : hi = mid
    segment = lo
    var start : Vector3 = points [ segment - 1 ] ; var end : Vector3 = points [ segment ]
    var span = maxf ( 0.0001 , float ( cumulative [ segment ] ) - float ( cumulative [ segment - 1 ] ) )
    var t = clampf ( ( distance - float ( cumulative [ segment - 1 ] ) ) / span , 0.0 , 1.0 )
    return { "position" : start . lerp ( end , t ) , "direction" : ( end - start ) . normalized ( ) }
func _vehicle_mesh ( kind : String ) -> ArrayMesh :
    var scene = load ( "res://assets/traffic-" + kind + ".glb" ) . instantiate ( )
    var groups : Dictionary = { }
    _collect_mesh ( scene , Transform3D . IDENTITY , groups )
    var result = ArrayMesh . new ( )
    for item in groups . values ( ) :
        var index = result . get_surface_count ( )
        item . tool . commit ( result )
        result . surface_set_material ( index , item . material )
    scene . free ( )
    return result
func _collect_mesh ( node : Node , parent_transform : Transform3D , groups : Dictionary ) -> void :
    var transform = parent_transform
    if node is Node3D : transform = parent_transform * node . transform
    if node is MeshInstance3D and node . mesh :
        for index in range ( node . mesh . get_surface_count ( ) ) :
            var material = node . get_active_material ( index )
            var key = material . resource_name if material else "plain"
            if not groups . has ( key ) :
                var tool = SurfaceTool . new ( ) ; tool . begin ( Mesh . PRIMITIVE_TRIANGLES )
                groups [ key ] = { "tool" : tool , "material" : material }
            groups [ key ] . tool . append_from ( node . mesh , index , transform )
    for child in node . get_children ( ) : _collect_mesh ( child , transform , groups )
