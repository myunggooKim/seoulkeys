extends Node3D
const JADE : = Color ( "91d3b2" )
const CORAL : = Color ( "ef786f" )
const IVORY : = Color ( "f1d7ad" )
const PLUM : = Color ( "302932" )
static func prepare_material ( source : Material ) -> Material :
    if source == null :
        return null
    var material : = source . duplicate ( ) as Material
    if not material is StandardMaterial3D :
        return material
    var m : = material as StandardMaterial3D
    var key : = source . resource_name . to_lower ( )
    if key . begins_with ( "namsan context" ) or key . begins_with ( "gwanghwamun |" ) or key . begins_with ( "chunmoo |" ) :
        return m
    m . roughness = maxf ( m . roughness , 0.35 )
    if m . emission_enabled :
        m . emission_energy_multiplier = minf ( m . emission_energy_multiplier * 0.23 , 0.68 )
    if key . contains ( "window" ) :
        if key . contains ( "unlit" ) :
            _paint ( m , Color ( "242330" ) , 0.36 , 0.25 )
        elif key . contains ( "blue" ) :
            _glow ( m , Color ( "c6c1cf" ) , 0.28 )
        else :
            _glow ( m , IVORY , 0.53 )
    elif key . contains ( "light" ) :
        if key . contains ( "cyan" ) :
            _glow ( m , JADE , 0.62 )
        elif key . contains ( "aviation" ) :
            _glow ( m , CORAL , 0.6 )
        elif key . contains ( "warm" ) :
            _glow ( m , IVORY , 0.62 )
    elif key . contains ( "glass" ) and not key . contains ( "optic" ) :
        _paint ( m , Color ( "534957" ) if key . contains ( "ocean" ) else Color ( "343444" ) , 0.38 , 0.44 )
    elif key . contains ( "city" ) :
        if key . contains ( "aluminium" ) :
            _paint ( m , Color ( "968384" ) , 0.4 , 0.48 )
        elif key . contains ( "graphite" ) :
            _paint ( m , Color ( "403943" ) , 0.72 , 0.1 )
        elif key . contains ( "concrete" ) :
            _paint ( m , Color ( "65545c" ) , 0.76 , 0.05 )
    elif key . contains ( "urban" ) :
        if key . contains ( "asphalt" ) :
            _paint ( m , Color ( "302b35" ) , 0.87 , 0.03 )
        elif key . contains ( "pavement" ) :
            _paint ( m , Color ( "65525a" ) , 0.91 , 0.0 )
        elif key . contains ( "block lots" ) :
            _paint ( m , Color ( "483c46" ) , 0.92 , 0.0 )
        elif key . contains ( "curb" ) :
            _paint ( m , Color ( "a28b83" ) , 0.85 , 0.0 )
        elif key . contains ( "amber" ) :
            _paint ( m , Color ( "ad8564" ) , 0.88 , 0.0 )
            m . emission_enabled = false
        elif key . contains ( "crossing" ) :
            _paint ( m , Color ( "af9c95" ) , 0.85 , 0.0 )
    elif key . contains ( "tower" ) :
        if key . contains ( "ivory" ) :
            _paint ( m , Color ( "e2c9b5" ) , 0.62 , 0.06 )
        elif key . contains ( "concrete shadow" ) :
            _paint ( m , Color ( "95818a" ) , 0.71 , 0.02 )
        elif key . contains ( "titanium" ) :
            _paint ( m , Color ( "877d88" ) , 0.42 , 0.56 )
        elif key . contains ( "mullions" ) :
            _paint ( m , Color ( "29252f" ) , 0.44 , 0.35 )
    elif key . contains ( "terrain" ) and key . contains ( "haze" ) :
        _paint ( m , Color ( "796172" ) , 0.95 , 0.0 )
    elif key . contains ( "roof" ) and key . contains ( "graphite" ) :
        _paint ( m , Color ( "49404d" ) , 0.86 , 0.1 )
    elif key . contains ( "facade" ) and key . contains ( "champagne" ) :
        _paint ( m , Color ( "b58b71" ) , 0.4 , 0.56 )
    elif key . contains ( "pine" ) :
        if key . contains ( "bark" ) :
            _paint ( m , Color ( "665045" ) , 0.98 , 0.0 )
        elif key . contains ( "jade" ) :
            _paint ( m , Color ( "68856f" ) , 0.92 , 0.0 )
        elif key . contains ( "blue" ) :
            _paint ( m , Color ( "426453" ) , 0.94 , 0.0 )
        else :
            _paint ( m , Color ( "354b44" ) , 0.95 , 0.0 )
    elif key . contains ( "landscape" ) :
        m . albedo_color = Color ( 1.0 , 0.96 , 0.9 )
        m . roughness = 0.98
    elif key . contains ( "namsan" ) :
        _paint ( m , Color ( "97827b" ) if key . contains ( "limestone" ) else Color ( "776b70" ) , 0.9 , 0.0 )
    elif key . contains ( "trail" ) or key . contains ( "gravel" ) :
        _paint ( m , Color ( "a18c79" ) , 0.94 , 0.0 )
    elif key . contains ( "antenna" ) :
        _paint ( m , Color ( "d7bcaa" ) if key . contains ( "porcelain" ) else Color ( "bb625d" ) , 0.6 , 0.18 )
    elif key . contains ( "launcher" ) :
        if key . contains ( "targeting" ) or key . contains ( "optic" ) :
            _glow ( m , JADE , 0.7 )
        elif key . contains ( "ceramic" ) :
            _paint ( m , Color ( "c6c2b0" ) , 0.44 , 0.35 )
        elif key . contains ( "titanium" ) :
            _paint ( m , Color ( "7d8a82" ) , 0.42 , 0.5 )
        elif key . contains ( "brass" ) :
            _paint ( m , Color ( "b99674" ) , 0.4 , 0.65 )
        else :
            _paint ( m , Color ( "34343c" ) if key . contains ( "graphite" ) else Color ( "24252c" ) , 0.56 , 0.42 )
    elif key . contains ( "missile" ) :
        if key . contains ( "cyan" ) :
            _paint ( m , Color ( "76b495" ) , 0.38 , 0.6 )
        elif key . contains ( "ion" ) :
            _glow ( m , JADE , 0.8 )
        elif key . contains ( "plasma" ) :
            _glow ( m , CORAL , 0.9 )
        elif key . contains ( "copper" ) :
            _paint ( m , Color ( "dc8a70" ) , 0.45 , 0.38 )
            m.emission_enabled = true; m.emission = Color("bc5138"); m.emission_energy_multiplier = 0.28
        elif key . contains ( "pearl" ) :
            _paint ( m , Color ( "fff0d8" ) , 0.38 , 0.3 )
            m.emission_enabled = true; m.emission = Color("f0debd"); m.emission_energy_multiplier = 0.22
        elif key . contains ( "graphite" ) :
            _paint ( m , Color ( "968b91" ) , 0.45 , 0.32 )
        elif key . contains ( "white hot" ) :
            _glow ( m , Color ( "ffe4c4" ) , 0.92 )
    elif key . contains ( "gate" ) :
        if key . contains ( "warm granite" ) :
            _paint ( m , Color ( "b6a18c" ) , 0.85 , 0.0 )
        elif key . contains ( "pale cut" ) :
            _paint ( m , Color ( "ddc7ad" ) , 0.8 , 0.0 )
        elif key . contains ( "lacquer" ) :
            _paint ( m , Color ( "913e42" ) , 0.42 , 0.05 )
        elif key . contains ( "emerald" ) :
            _paint ( m , Color ( "417b65" ) , 0.48 , 0.12 )
        elif key . contains ( "aged dark" ) :
            _paint ( m , Color ( "31464a" ) , 0.6 , 0.2 )
        elif key . contains ( "tile edges" ) :
            _paint ( m , Color ( "597768" ) , 0.5 , 0.18 )
        elif key . contains ( "brass" ) :
            _paint ( m , Color ( "c09b67" ) , 0.41 , 0.5 )
        elif key . contains ( "ivory" ) :
            _paint ( m , Color ( "e4cfaa" ) , 0.6 , 0.05 )
    return m
static func apply ( world : Node3D , environment : Environment , sun : DirectionalLight3D ,
        rim : DirectionalLight3D , ground : MeshInstance3D , add_context : bool = true ) -> Node3D :
    environment . ambient_light_source = Environment . AMBIENT_SOURCE_COLOR
    environment . ambient_light_color = Color ( "9a8ea9" )
    environment . ambient_light_energy = 0.28
    environment . tonemap_mode = Environment . TONE_MAPPER_FILMIC
    environment . tonemap_exposure = 1.0
    environment . fog_enabled = true
    environment . fog_light_color = Color ( "977482" )
    environment . fog_light_energy = 0.3
    environment . fog_density = 0.0018
    environment . fog_sky_affect = 0.0
    sun . rotation_degrees = Vector3 ( -31.0 , -67.0 , 0.0 )
    sun . light_color = Color ( "ffd2ad" )
    sun . light_energy = 0.78
    sun . shadow_enabled = true
    sun . shadow_opacity = 0.66
    sun . directional_shadow_max_distance = 115.0
    sun . directional_shadow_mode = DirectionalLight3D . SHADOW_ORTHOGONAL
    rim . rotation_degrees = Vector3 ( -36.0 , 141.0 , 0.0 )
    rim . light_color = Color ( "b8b0d6" )
    rim . light_energy = 0.24
    if ground :
        ground . material_override = _material ( PLUM , 0.9 )
    var art : = Node3D . new ( )
    art . name = "SeoulTwilightArtDirection"
    world . add_child ( art )
    if add_context :
        _build_neighborhoods ( art )
        _build_street_furniture ( art )
    return art
static func _paint ( m : StandardMaterial3D , color : Color , roughness : float , metallic : float ) -> void :
    m . albedo_color = color
    m . roughness = roughness
    m . metallic = metallic
static func _glow ( m : StandardMaterial3D , color : Color , energy : float ) -> void :
    m . albedo_color = color
    m . emission_enabled = true
    m . emission = color
    m . emission_energy_multiplier = energy
    m . roughness = 0.46
    m . metallic = 0.05
static func _material ( color : Color , roughness : float = 0.8 , glow : float = 0.0 ) -> StandardMaterial3D :
    var m : = StandardMaterial3D . new ( )
    m . albedo_color = color
    m . roughness = roughness
    if glow > 0.0 :
        _glow ( m , color , glow )
    return m
static func _instance ( at : Vector3 , dimensions : Vector3 , yaw : float = 0.0 ) -> Transform3D :
    return Transform3D ( Basis ( Vector3 . UP , yaw ) . scaled ( dimensions ) , at )
static func _batch_boxes ( parent : Node3D , title : String , transforms : Array [ Transform3D ] , material : Material , shadows : bool = true ) -> void :
    if transforms . is_empty ( ) :
        return
    var box : = BoxMesh . new ( )
    box . size = Vector3 . ONE
    var multimesh : = MultiMesh . new ( )
    multimesh . transform_format = MultiMesh . TRANSFORM_3D
    multimesh . mesh = box
    multimesh . instance_count = transforms . size ( )
    for i in transforms . size ( ) :
        multimesh . set_instance_transform ( i , transforms [ i ] )
    var node : = MultiMeshInstance3D . new ( )
    node . name = title
    node . multimesh = multimesh
    node . material_override = material
    if not shadows :
        node . cast_shadow = GeometryInstance3D . SHADOW_CASTING_SETTING_OFF
    parent . add_child ( node )
static func _build_neighborhoods ( parent : Node3D ) -> void :
    var masonry : Array [ Transform3D ] = [ ]
    var brick : Array [ Transform3D ] = [ ]
    var trims : Array [ Transform3D ] = [ ]
    var recesses : Array [ Transform3D ] = [ ]
    var windows : Array [ Transform3D ] = [ ]
    var shop_windows : Array [ Transform3D ] = [ ]
    var roof_plant : Array [ Transform3D ] = [ ]
    var rng : = RandomNumberGenerator . new ( )
    rng . seed = 78015
    var sites : Array [ Vector3 ] = [ ]
    for side in [ -1.0 , 1.0 ] :
        for row in range ( 3 ) :
            for column in range ( 5 ) :
                var street_z : float = [ -12.0 , -3.0 , 14.0 ] [ row ]
                sites . append ( Vector3 ( side * ( 30.0 + column * 5.7 ) , 0.0 , street_z ) )
    for column in range ( 15 ) :
        sites . append ( Vector3 ( -50.0 + column * 7.1 , 0.0 , -62.0 - rng . randf_range ( 0.0 , 2.0 ) ) )
    for i in sites . size ( ) :
        var at : = sites [ i ]
        var w : = rng . randf_range ( 3.4 , 4.9 )
        var d : = rng . randf_range ( 3.0 , 4.7 )
        var floors : = rng . randi_range ( 2 , 4 ) if at . z > -30.0 else rng . randi_range ( 3 , 6 )
        var h : = floors * 1.25 + 0.65
        var mass : = _instance ( at + Vector3 ( 0.0 , h * 0.5 , 0.0 ) , Vector3 ( w , h , d ) )
        if i % 3 == 0 :
            brick . append ( mass )
        else :
            masonry . append ( mass )
        recesses . append ( _instance ( at + Vector3 ( 0.0 , 0.7 , d * 0.5 + 0.026 ) , Vector3 ( w * 0.88 , 1.16 , 0.06 ) ) )
        shop_windows . append ( _instance ( at + Vector3 ( 0.0 , 1.2 , d * 0.5 + 0.065 ) , Vector3 ( w * 0.68 , 0.2 , 0.045 ) ) )
        trims . append ( _instance ( at + Vector3 ( 0.0 , 1.42 , d * 0.5 + 0.28 ) , Vector3 ( w * 0.97 , 0.11 , 0.72 ) ) )
        trims . append ( _instance ( at + Vector3 ( 0.0 , h + 0.09 , 0.0 ) , Vector3 ( w + 0.21 , 0.18 , d + 0.2 ) ) )
        roof_plant . append ( _instance ( at + Vector3 ( w * 0.22 , h + 0.41 , - d * 0.13 ) , Vector3 ( w * 0.34 , 0.66 , d * 0.3 ) ) )
        roof_plant . append ( _instance ( at + Vector3 ( - w * 0.22 , h + 0.33 , d * 0.17 ) , Vector3 ( 0.57 , 0.48 , 0.64 ) ) )
        for side in [ -1.0 , 1.0 ] :
            trims . append ( _instance ( at + Vector3 ( side * ( w * 0.5 - 0.055 ) , h + 0.25 , 0.0 ) , Vector3 ( 0.11 , 0.3 , d ) ) )
        for floor_index in range ( 1 , floors ) :
            var y : = 1.74 + ( floor_index - 1 ) * 1.25
            for column in range ( 3 ) :
                var x : = ( column - 1 ) * w * 0.285
                recesses . append ( _instance ( at + Vector3 ( x , y , d * 0.5 + 0.04 ) , Vector3 ( w * 0.205 , 0.79 , 0.07 ) ) )
                if ( i + floor_index + column ) % 4 != 0 :
                    windows . append ( _instance ( at + Vector3 ( x , y , d * 0.5 + 0.082 ) , Vector3 ( w * 0.147 , 0.6 , 0.03 ) ) )
                if column < 2 :
                    var z : = ( column - 0.5 ) * d * 0.42
                    for side in [ -1.0 , 1.0 ] :
                        recesses . append ( _instance ( at + Vector3 ( side * ( w * 0.5 + 0.027 ) , y , z ) , Vector3 ( 0.045 , 0.76 , 0.72 ) ) )
                        if ( i + column + floor_index ) % 3 != 0 :
                            windows . append ( _instance ( at + Vector3 ( side * ( w * 0.5 + 0.054 ) , y , z ) , Vector3 ( 0.025 , 0.55 , 0.49 ) ) )
    _batch_boxes ( parent , "NeighborhoodWarmMasonry" , masonry , _material ( Color ( "574550" ) ) )
    _batch_boxes ( parent , "NeighborhoodRoseBrick" , brick , _material ( Color ( "63434a" ) , 0.93 ) )
    _batch_boxes ( parent , "NeighborhoodCopperCornices" , trims , _material ( Color ( "88756e" ) , 0.64 ) )
    _batch_boxes ( parent , "NeighborhoodRecessedGlazing" , recesses , _material ( Color ( "302c3a" ) , 0.42 ) , false )
    _batch_boxes ( parent , "NeighborhoodIvoryWindows" , windows , _material ( Color ( "e2c5a2" ) , 0.5 , 0.25 ) , false )
    _batch_boxes ( parent , "NeighborhoodStorefronts" , shop_windows , _material ( Color ( "f0cd9e" ) , 0.5 , 0.44 ) , false )
    _batch_boxes ( parent , "NeighborhoodRooftopServices" , roof_plant , _material ( Color ( "4c4755" ) , 0.76 ) )
static func _build_street_furniture ( parent : Node3D ) -> void :
    var iron : Array [ Transform3D ] = [ ]
    var lamps : Array [ Transform3D ] = [ ]
    var stone : Array [ Transform3D ] = [ ]
    var foliage : Array [ Transform3D ] = [ ]
    var timber : Array [ Transform3D ] = [ ]
    for side in [ -1.0 , 1.0 ] :
        for row in range ( 8 ) :
            var x : float = side * 22.9
            var z : float = -40.0 + row * 7.0
            iron . append ( _instance ( Vector3 ( x , 1.22 , z ) , Vector3 ( 0.075 , 2.44 , 0.075 ) ) )
            iron . append ( _instance ( Vector3 ( x - side * 0.23 , 2.41 , z ) , Vector3 ( 0.54 , 0.06 , 0.065 ) ) )
            lamps . append ( _instance ( Vector3 ( x - side * 0.45 , 2.33 , z ) , Vector3 ( 0.22 , 0.13 , 0.28 ) ) )
            if row % 2 == 0 :
                stone . append ( _instance ( Vector3 ( x + side * 0.55 , 0.22 , z + 2.6 ) , Vector3 ( 0.76 , 0.44 , 1.72 ) ) )
                foliage . append ( _instance ( Vector3 ( x + side * 0.55 , 0.5 , z + 2.6 ) , Vector3 ( 0.63 , 0.33 , 1.59 ) ) )
                timber . append ( _instance ( Vector3 ( x + side * 0.3 , 0.4 , z + 4.3 ) , Vector3 ( 0.5 , 0.13 , 1.36 ) ) )
                for offset in [ -0.49 , 0.49 ] :
                    iron . append ( _instance ( Vector3 ( x + side * 0.3 , 0.2 , z + 4.3 + offset ) , Vector3 ( 0.4 , 0.4 , 0.075 ) ) )
    _batch_boxes ( parent , "BoulevardLanternIronwork" , iron , _material ( Color ( "463d48" ) , 0.61 ) , false )
    _batch_boxes ( parent , "BoulevardWarmLanterns" , lamps , _material ( IVORY , 0.4 , 0.85 ) , false )
    _batch_boxes ( parent , "StreetPlanterStone" , stone , _material ( Color ( "a18b80" ) , 0.89 ) )
    _batch_boxes ( parent , "StreetPlanterFoliage" , foliage , _material ( Color ( "4b6854" ) , 0.98 ) )
    _batch_boxes ( parent , "StreetBenchTimber" , timber , _material ( Color ( "94765b" ) , 0.88 ) )
