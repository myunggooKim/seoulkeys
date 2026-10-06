extends Node3D
const PUFF_CAPACITY : = 144
const DEBRIS_CAPACITY : = 112
const FIRE_CAPACITY : = 12
const FLAMES_PER_FIRE : = 6
const BLAST_CAPACITY : = 8
const FLAME_CAPACITY : = FIRE_CAPACITY * FLAMES_PER_FIRE
const BLAST_VOLUMES : = BLAST_CAPACITY * 5
const LIGHT_CAPACITY : = 2
const PUFF_SHADER : = "\nshader_type spatial;\nrender_mode unshaded, blend_mix, cull_back, depth_draw_never;\nvarying vec4 data;\nvarying vec3 local_pos;\nvoid vertex() { data = INSTANCE_CUSTOM; local_pos = VERTEX; }\nvoid fragment() {\n    float facing = max(0.0, dot(normalize(NORMAL), normalize(VIEW)));\n    float lobes = 0.82 + 0.18 * sin(local_pos.x * 7.0 + data.b * 6.0) * sin(local_pos.y * 6.0 + local_pos.z * 5.0);\n    vec3 dust = mix(vec3(0.23,0.19,0.18), vec3(0.62,0.47,0.35), clamp(NORMAL.y*0.30+0.62,0.0,1.0));\n    vec3 soot = mix(vec3(0.075,0.070,0.080),vec3(0.22,0.20,0.22),clamp(NORMAL.y*0.3+0.5,0.0,1.0));\n    ALBEDO = mix(dust,soot,data.g);\n    ALPHA = data.r * pow(facing,0.72) * lobes;\n}\n"
const FIRE_SHADER : = "\nshader_type spatial;\nrender_mode unshaded, blend_mix, cull_back, depth_draw_never;\nvarying vec4 data;\nvarying vec3 local_pos;\nvoid vertex() {\n    data=INSTANCE_CUSTOM; local_pos=VERTEX;\n    // Phase is advanced by the CPU game clock; paused effects never animate.\n    VERTEX.x += sin(VERTEX.y*5.0+data.b)*VERTEX.y*0.10*data.a;\n    VERTEX.z += cos(VERTEX.y*4.0+data.b*0.8)*VERTEX.y*0.08*data.a;\n}\nvoid fragment() {\n    float facing=max(0.0,dot(normalize(NORMAL),normalize(VIEW)));\n    float filament=0.72+0.28*sin(local_pos.y*17.0+local_pos.x*9.0+data.b);\n    float center=pow(facing,0.65);\n    vec3 orange=vec3(0.92,0.105,0.009);\n    vec3 gold=vec3(1.0,0.53,0.045);\n    vec3 color=mix(orange,gold,clamp(data.g*0.65+center*0.25-local_pos.y*0.18,0.0,1.0));\n    ALBEDO=color; EMISSION=color*0.78;\n    ALPHA=data.r*center*(0.82+filament*0.18);\n}\n"
const BLAST_SHADER : = "\nshader_type spatial;\nrender_mode unshaded, blend_mix, cull_back, depth_draw_never;\nvarying vec4 data;\nvarying vec2 baked_cloud;\nvoid vertex() { data=INSTANCE_CUSTOM; baked_cloud=UV2; }\nvoid fragment() {\n    float facing=max(0.0,dot(normalize(NORMAL),normalize(VIEW)));\n    // Turbulence is baked once into the original mesh. No time-based noise,\n    // texture samples, trigonometry or added per-frame work is needed here.\n    float heat=clamp(0.24+baked_cloud.r*0.68+baked_cloud.g*0.12,0.0,1.0);\n    vec3 soot=vec3(0.28,0.042,0.008);\n    vec3 ember=vec3(0.36,0.048,0.008);\n    vec3 orange=vec3(1.0,0.215,0.017);\n    vec3 core=vec3(1.0,0.64,0.135);\n    vec3 color=mix(soot,ember,smoothstep(0.13,0.38,heat));\n    color=mix(color,orange,smoothstep(0.35,0.65,heat));\n    color=mix(color,core,smoothstep(0.64,0.88,heat)*(0.72+data.g*0.28));\n    ALBEDO=color; EMISSION=color*(0.24+heat*0.54);\n    ALPHA=data.r*pow(facing,0.46)*(0.82+heat*0.18);\n}\n"
var reduced_motion : = false
var paused : = false
var puff_batch : MultiMeshInstance3D
var fire_batch : MultiMeshInstance3D
var blast_batch : MultiMeshInstance3D
var debris_batch : MultiMeshInstance3D
var _puffs : Array [ Dictionary ] = [ ]
var _debris : Array [ Dictionary ] = [ ]
var _fires : Array [ Dictionary ] = [ ]
var _blasts : Array [ Dictionary ] = [ ]
var _lights : Array [ Dictionary ] = [ ]
var _light_cursor : = 0
var _clock : = 0.0
var _puff_cursor : = 0
var _debris_cursor : = 0
var _fire_cursor : = 0
var _blast_cursor : = 0
var _initialized : = false
var _dirty : = false
var _visible_puffs : = 0
var _visible_flames : = 0
var _visible_blasts : = 0
var _visible_debris : = 0
func _ready ( ) -> void :
    initialize ( )
func initialize ( ) -> void :
    if _initialized : return
    _initialized = true
    var sphere : = SphereMesh . new ( )
    sphere . radius = 1.0 ; sphere . height = 2.0
    sphere . radial_segments = 12 ; sphere . rings = 7
    puff_batch = _batch ( "CityDustAndSmoke" , sphere , _shader ( PUFF_SHADER ) , PUFF_CAPACITY , true )
    fire_batch = _batch ( "CityTaperedFire" , _flame_mesh ( ) , _shader ( FIRE_SHADER ) , FLAME_CAPACITY , true )
    blast_batch = _batch ( "CityLayeredBlast" , _billowed_blast_mesh ( ) , _shader ( BLAST_SHADER ) , BLAST_VOLUMES , true )
    var shard : = PrismMesh . new ( )
    shard . size = Vector3 . ONE
    var concrete : = StandardMaterial3D . new ( )
    concrete . albedo_color = Color ( "867466" )
    concrete . vertex_color_use_as_albedo = true
    concrete . roughness = 0.95
    debris_batch = _batch ( "CityMasonryDebris" , shard , concrete , DEBRIS_CAPACITY , false )
    for i in range ( PUFF_CAPACITY ) :
        _puffs . append ( { "active" : false , "born" : 0.0 , "life" : 1.0 , "origin" : Vector3 . ZERO , "velocity" : Vector3 . ZERO , "radius" : 1.0 , "growth" : 0.0 , "soot" : 0.0 , "seed" : float ( i ) * 0.618 , "opacity" : 0.5 } )
    for i in range ( DEBRIS_CAPACITY ) :
        _debris . append ( { "active" : false , "born" : 0.0 , "life" : 1.0 , "origin" : Vector3 . ZERO , "velocity" : Vector3 . ZERO , "floor" : 0.0 , "size" : Vector3 . ONE , "spin" : Vector3 . ZERO , "seed" : float ( i ) * 0.618 , "low" : Vector3 . ZERO , "high" : Vector3 . ZERO } )
    for i in range ( FIRE_CAPACITY ) :
        _fires . append ( { "active" : false , "born" : 0.0 , "origin" : Vector3 . ZERO , "radius" : 1.0 , "height" : 1.0 , "next_smoke" : 0.0 , "seed" : float ( i ) * 2.39996 } )
    for i in range ( BLAST_CAPACITY ) :
        _blasts . append ( { "active" : false , "born" : 0.0 , "origin" : Vector3 . ZERO , "radius" : 1.0 } )
    for i in range ( LIGHT_CAPACITY ) :
        var light : = OmniLight3D . new ( )
        light . name = "ImpactLight" + str ( i )
        light . light_color = Color ( 1.0 , 0.31 , 0.055 )
        light . light_energy = 0.0
        light . shadow_enabled = false
        light . omni_attenuation = 1.25
        light . visible = false
        add_child ( light )
        _lights . append ( { "node" : light , "active" : false , "born" : 0.0 } )
    clear ( )
func _billowed_blast_mesh ( ) -> ArrayMesh :
    var source : = SphereMesh . new ( )
    source . radius = 1.0 ; source . height = 2.0
    source . radial_segments = 16 ; source . rings = 10
    var arrays : Array = source . surface_get_arrays ( 0 )
    var vertices : PackedVector3Array = arrays [ Mesh . ARRAY_VERTEX ]
    var heat_uv : = PackedVector2Array ( ) ; heat_uv . resize ( vertices . size ( ) )
    for i in range ( vertices . size ( ) ) :
        var point : = vertices [ i ] . normalized ( )
        var broad : = sin ( point . x * 5.6 + point . y * 2.4 ) * cos ( point . z * 5.2 - point . y * 4.7 )
        var fine : = sin ( point . y * 9.0 + point . z * 6.6 + point . x * 3.1 )
        var lobe : = clampf ( 0.94 + broad * 0.23 + fine * 0.095 , 0.65 , 1.28 )
        vertices [ i ] *= lobe
        var heat : = clampf ( 0.49 + broad * 0.39 + fine * 0.18 , 0.04 , 0.98 )
        heat_uv [ i ] = Vector2 ( heat , clampf ( 0.5 + fine * 0.45 , 0.0 , 1.0 ) )
    arrays [ Mesh . ARRAY_VERTEX ] = vertices
    arrays [ Mesh . ARRAY_TEX_UV2 ] = heat_uv
    var result : = ArrayMesh . new ( )
    result . add_surface_from_arrays ( Mesh . PRIMITIVE_TRIANGLES , arrays )
    return result
func _flame_mesh ( ) -> ArrayMesh :
    var surface : = SurfaceTool . new ( )
    surface . begin ( Mesh . PRIMITIVE_TRIANGLES )
    var levels : = [ 0.0 , 0.16 , 0.36 , 0.59 , 0.79 , 1.0 ]
    var radii : = [ 0.48 , 0.75 , 0.62 , 0.39 , 0.16 , 0.005 ]
    for ring in range ( levels . size ( ) - 1 ) :
        for side in range ( 10 ) :
            var a : = float ( side ) * TAU / 10.0
            var b : = float ( side + 1 ) * TAU / 10.0
            var p0 : = Vector3 ( cos ( a ) * float ( radii [ ring ] ) , float ( levels [ ring ] ) , sin ( a ) * float ( radii [ ring ] ) )
            var p1 : = Vector3 ( cos ( b ) * float ( radii [ ring ] ) , float ( levels [ ring ] ) , sin ( b ) * float ( radii [ ring ] ) )
            var p2 : = Vector3 ( cos ( b ) * float ( radii [ ring + 1 ] ) , float ( levels [ ring + 1 ] ) , sin ( b ) * float ( radii [ ring + 1 ] ) )
            var p3 : = Vector3 ( cos ( a ) * float ( radii [ ring + 1 ] ) , float ( levels [ ring + 1 ] ) , sin ( a ) * float ( radii [ ring + 1 ] ) )
            for point in [ p0 , p1 , p2 , p0 , p2 , p3 ] : surface . add_vertex ( point )
    surface . generate_normals ( )
    return surface . commit ( )
func _shader ( code : String ) -> ShaderMaterial :
    var shader : = Shader . new ( ) ; shader . code = code
    var material : = ShaderMaterial . new ( ) ; material . shader = shader
    return material
func _batch ( label : String , mesh : Mesh , material : Material , capacity : int , custom : bool ) -> MultiMeshInstance3D :
    var mm : = MultiMesh . new ( )
    mm . transform_format = MultiMesh . TRANSFORM_3D
    mm . use_custom_data = custom
    mm . use_colors = not custom
    mm . mesh = mesh ; mm . instance_count = capacity ; mm . visible_instance_count = 0
    var node : = MultiMeshInstance3D . new ( )
    node . name = label ; node . multimesh = mm ; node . material_override = material
    node . cast_shadow = GeometryInstance3D . SHADOW_CASTING_SETTING_OFF
    node . gi_mode = GeometryInstance3D . GI_MODE_DISABLED
    add_child ( node )
    return node
func set_reduced_motion ( enabled : bool ) -> void :
    if reduced_motion == enabled : return
    reduced_motion = enabled
    for puff in _puffs : puff . active = false
    for shard in _debris : shard . active = false
    for blast in _blasts : blast . active = false
    for light in _lights : light . active = false ; light . node . visible = false
    _dirty = true
func set_paused ( enabled : bool ) -> void :
    paused = enabled
func impact ( roof : Vector3 , floor_y : float , bounds_low : Vector3 , bounds_high : Vector3 ) -> void :
    initialize ( )
    if not roof . is_finite ( ) or not bounds_low . is_finite ( ) or not bounds_high . is_finite ( ) : return
    var width : = maxf ( 0.5 , minf ( bounds_high . x - bounds_low . x , bounds_high . z - bounds_low . z ) )
    var height : = maxf ( 1.0 , roof . y - floor_y )
    var radius : = clampf ( width * 0.38 , 1.35 , 4.0 )
    _burn_site ( Vector3 ( roof . x , floor_y + 0.12 , roof . z ) , radius , clampf ( height * 0.64 , 3.1 , 8.5 ) , 1.0 )
    var blast : = _blasts [ _blast_cursor ]
    _blast_cursor = ( _blast_cursor + 1 ) % BLAST_CAPACITY
    blast . active = true ; blast . born = _clock ; blast . origin = roof
    blast . radius = clampf ( radius * 1.85 , 2.6 , 7.0 )
    if not reduced_motion :
        var light : Dictionary = _lights [ _light_cursor ]
        _light_cursor = ( _light_cursor + 1 ) % LIGHT_CAPACITY
        light . active = true ; light . born = _clock
        light . node . position = roof + Vector3 . UP * 0.7
        light . node . omni_range = clampf ( height + float ( blast . radius ) * 1.5 , 12.0 , 27.0 )
        light . node . visible = true
        _emit_ground_dust ( Vector3 ( roof . x , floor_y , roof . z ) , radius , 1.0 )
        for i in range ( 7 ) :
            var angle : = float ( i ) * 2.399963
            var side : = Vector3 ( cos ( angle ) , 0 , sin ( angle ) )
            _emit_puff ( roof + side * float ( blast . radius ) * 0.25 , side * float ( blast . radius ) * 0.28 + Vector3 . UP * ( 0.7 + float ( i % 3 ) * 0.18 ) , _clock + 0.13 + float ( i % 3 ) * 0.07 , 2.8 , float ( blast . radius ) * ( 0.42 + float ( i % 2 ) * 0.1 ) , 1.0 , 0.66 )
        for i in range ( 16 ) :
            var shard : = _debris [ _debris_cursor ]
            _debris_cursor = ( _debris_cursor + 1 ) % DEBRIS_CAPACITY
            var angle : = float ( i ) * 2.399963
            var speed : = radius * ( 0.72 + float ( i % 4 ) * 0.17 )
            shard . active = true ; shard . born = _clock + float ( i % 4 ) * 0.065 ; shard . life = 3.8
            shard . origin = roof + Vector3 ( cos ( angle ) * radius * 0.3 , - float ( i % 4 ) * height * 0.12 , sin ( angle ) * radius * 0.3 )
            shard . velocity = Vector3 ( cos ( angle ) * speed , 1.5 + float ( i % 5 ) * 0.52 , sin ( angle ) * speed )
            shard . floor = floor_y + 0.13 ; shard . low = bounds_low ; shard . high = bounds_high
            var size : = clampf ( width * 0.055 , 0.12 , 0.66 )
            shard . size = Vector3 ( size * ( 1.0 + float ( i % 3 ) * 0.7 ) , size * 0.45 , size * 0.75 )
            shard . spin = Vector3 ( 1.1 + float ( i % 3 ) , float ( i % 4 ) * 0.7 , 0.8 + float ( i % 5 ) * 0.4 )
    _dirty = true
    _render ( )
func collapse_site ( origin : Vector3 , floor_y : float , bounds_low : Vector3 , bounds_high : Vector3 ) -> void :
    initialize ( )
    var width : = maxf ( 0.5 , minf ( bounds_high . x - bounds_low . x , bounds_high . z - bounds_low . z ) )
    var height : = maxf ( 1.0 , bounds_high . y - floor_y )
    var radius : = clampf ( width * 0.34 , 1.1 , 2.9 )
    _burn_site ( Vector3 ( origin . x , floor_y + 0.12 , origin . z ) , radius , clampf ( height * 0.72 , 2.8 , 6.0 ) , 0.85 )
    if not reduced_motion : _emit_ground_dust ( Vector3 ( origin . x , floor_y , origin . z ) , radius , 0.85 )
    _dirty = true
func _burn_site ( origin : Vector3 , radius : float , height : float , strength : float ) -> void :
    var fire : = _fires [ _fire_cursor ]
    _fire_cursor = ( _fire_cursor + 1 ) % FIRE_CAPACITY
    fire . active = true ; fire . born = _clock ; fire . origin = origin
    fire . radius = radius ; fire . height = height * strength ; fire . next_smoke = _clock + 0.2
func _emit_ground_dust ( origin : Vector3 , radius : float , strength : float ) -> void :
    for i in range ( 10 ) :
        var angle : = float ( i ) * 2.399963
        var side : = Vector3 ( cos ( angle ) , 0 , sin ( angle ) )
        var point : = origin + Vector3 . UP * 0.25 + side * radius * 0.48
        _emit_puff ( point , side * radius * 0.62 + Vector3 . UP * ( 1.05 + float ( i % 3 ) * 0.25 ) , _clock + float ( i % 4 ) * 0.055 , 3.2 + float ( i % 3 ) * 0.2 , radius * ( 0.65 + float ( i % 3 ) * 0.09 ) , 0.0 , 0.72 * strength )
func _emit_puff ( origin : Vector3 , velocity : Vector3 , born : float , life : float , radius : float , soot : float , opacity : float ) -> void :
    var puff : = _puffs [ _puff_cursor ]
    _puff_cursor = ( _puff_cursor + 1 ) % PUFF_CAPACITY
    puff . active = true ; puff . born = born ; puff . life = life ; puff . origin = origin
    puff . velocity = velocity ; puff . radius = radius ; puff . soot = soot
    puff . growth = 0.48 if soot > 0.5 else 0.8 ; puff . opacity = opacity
func advance ( delta : float ) -> void :
    initialize ( )
    if paused or delta <= 0.0 or not is_finite ( delta ) : return
    _clock += delta
    var active : = false
    for fire in _fires :
        if not fire . active : continue
        if _clock - float ( fire . born ) > 8.5 : fire . active = false ; _dirty = true ; continue
        active = true
        if not reduced_motion and _clock >= float ( fire . next_smoke ) :
            var age : = _clock - float ( fire . born )
            var side : = Vector3 ( sin ( age * 2.0 + float ( fire . seed ) ) , 0 , cos ( age * 1.7 + float ( fire . seed ) ) )
            _emit_puff ( fire . origin + side * float ( fire . radius ) * 0.35 , Vector3 ( 0.32 , 1.7 , 0.08 ) , _clock , 3.5 , float ( fire . radius ) * 0.76 , 1.0 , 0.55 * minf ( 1.0 , ( 8.5 - age ) * 0.4 ) )
            fire . next_smoke = _clock + 0.27
    for puff in _puffs :
        if puff . active :
            if _clock - float ( puff . born ) >= float ( puff . life ) : puff . active = false ; _dirty = true
            else : active = true
    for shard in _debris :
        if shard . active :
            if _clock - float ( shard . born ) >= float ( shard . life ) : shard . active = false ; _dirty = true
            else : active = true
    for blast in _blasts :
        if blast . active :
            if _clock - float ( blast . born ) >= 1.1 : blast . active = false ; _dirty = true
            else : active = true
    for light in _lights :
        if light . active :
            if _clock - float ( light . born ) >= 0.64 : light . active = false ; light . node . visible = false ; light . node . light_energy = 0.0
            else : active = true
    if active or _dirty : _render ( )
func _render ( ) -> void :
    var p : = 0
    for puff in _puffs :
        if not puff . active : continue
        var age : = _clock - float ( puff . born )
        if age < 0.0 : continue
        var t : = clampf ( age / float ( puff . life ) , 0.0 , 1.0 )
        var radius : = float ( puff . radius ) * ( 1.0 + age * float ( puff . growth ) )
        var location : Vector3 = puff . origin + puff . velocity * age
        var size : = Vector3 ( radius , radius * ( 1.06 if float ( puff . soot ) > 0.5 else 0.66 ) , radius )
        puff_batch . multimesh . set_instance_transform ( p , Transform3D ( Basis . IDENTITY . scaled ( size ) , location ) )
        puff_batch . multimesh . set_instance_custom_data ( p , Color ( float ( puff . opacity ) * minf ( 1.0 , age / 0.12 + 0.12 ) * pow ( 1.0 - t , 0.8 ) , float ( puff . soot ) , float ( puff . seed ) , 0 ) )
        p += 1
    puff_batch . multimesh . visible_instance_count = p
    _visible_puffs = p
    var b : = 0
    for blast in _blasts :
        if not blast . active : continue
        var t : = clampf ( ( _clock - float ( blast . born ) ) / 1.1 , 0.0 , 1.0 )
        for i in range ( 5 ) :
            var radius : = float ( blast . radius ) * ( 0.58 + sin ( t * PI * 0.68 ) * 0.98 ) * ( 0.75 + float ( i % 3 ) * 0.13 )
            if reduced_motion : radius *= 0.48
            var theta : = float ( i ) * 2.399963
            var offset : = Vector3 ( sin ( theta ) , 0.15 + float ( i % 3 ) * 0.18 , cos ( theta ) ) * float ( blast . radius ) * ( 0.2 + t * 0.24 )
            var strength : = ( 0.16 if reduced_motion else 0.78 ) * pow ( 1.0 - t , 1.05 )
            blast_batch . multimesh . set_instance_transform ( b , Transform3D ( Basis . IDENTITY . scaled ( Vector3 ( radius , radius * ( 0.82 + float ( i % 2 ) * 0.16 ) , radius ) ) , blast . origin + offset ) )
            blast_batch . multimesh . set_instance_custom_data ( b , Color ( strength , 0.15 + float ( i % 3 ) * 0.26 , t * 9.0 + theta , 0 ) )
            b += 1
    blast_batch . multimesh . visible_instance_count = b
    _visible_blasts = b
    var f : = 0
    for fire in _fires :
        if not fire . active : continue
        var age : = _clock - float ( fire . born )
        var strength : = minf ( 1.0 , age * 2.0 + 0.1 ) * clampf ( ( 8.5 - age ) / 3.0 , 0.0 , 1.0 )
        for i in range ( FLAMES_PER_FIRE ) :
            var theta : = float ( i ) * 2.399963 + float ( fire . seed )
            var oscillation : = 1.0 if reduced_motion else 0.88 + 0.12 * sin ( age * 6.0 + theta )
            var radius : = float ( fire . radius ) * ( 0.4 + float ( i % 3 ) * 0.08 )
            var height : = float ( fire . height ) * ( 0.67 + float ( i % 3 ) * 0.23 ) * oscillation
            if reduced_motion : height *= 0.32 ; radius *= 0.75
            var pos : Vector3 = fire . origin + Vector3 ( cos ( theta ) * float ( fire . radius ) * 0.52 , 0.0 , sin ( theta ) * float ( fire . radius ) * 0.52 )
            _set_flame ( f , pos , Vector3 ( radius , height , radius ) , strength * ( 0.26 if reduced_motion else 0.86 ) , 0.15 + float ( i % 3 ) * 0.29 , theta + ( 0.0 if reduced_motion else age * 4.8 ) )
            f += 1
    fire_batch . multimesh . visible_instance_count = f
    _visible_flames = f
    for light in _lights :
        if light . active :
            var t : = clampf ( ( _clock - float ( light . born ) ) / 0.64 , 0.0 , 1.0 )
            light . node . light_energy = 1.85 * pow ( 1.0 - t , 1.3 )
    var d : = 0
    for shard in _debris :
        if not shard . active : continue
        var age : = _clock - float ( shard . born )
        if age < 0.0 : continue
        var location : Vector3 = shard . origin + shard . velocity * age + Vector3 . DOWN * 6.2 * age * age
        location . y = maxf ( float ( shard . floor ) , location . y )
        location . x = clampf ( location . x , float ( shard . low . x ) + 0.1 , float ( shard . high . x ) - 0.1 )
        location . z = clampf ( location . z , float ( shard . low . z ) + 0.1 , float ( shard . high . z ) - 0.1 )
        var fall_time : = ( float ( shard . velocity . y ) + sqrt ( float ( shard . velocity . y ) * float ( shard . velocity . y ) + 24.8 * maxf ( 0.0 , float ( shard . origin . y ) - float ( shard . floor ) ) ) ) / 12.4
        var spin : Vector3 = shard . spin * minf ( age , fall_time )
        var size : Vector3 = shard . size * clampf ( ( float ( shard . life ) - age ) / 0.8 , 0.0 , 1.0 )
        debris_batch . multimesh . set_instance_transform ( d , Transform3D ( Basis . from_euler ( spin ) . scaled ( size ) , location ) )
        var tint : = 0.68 + float ( d % 4 ) * 0.1
        debris_batch . multimesh . set_instance_color ( d , Color ( tint , tint * 0.92 , tint * 0.83 ) )
        d += 1
    debris_batch . multimesh . visible_instance_count = d
    _visible_debris = d
    _dirty = false
func _set_flame ( index : int , pos : Vector3 , size : Vector3 , alpha : float , heat : float , seed : float ) -> void :
    fire_batch . multimesh . set_instance_transform ( index , Transform3D ( Basis . IDENTITY . scaled ( size ) , pos ) )
    fire_batch . multimesh . set_instance_custom_data ( index , Color ( alpha , heat , seed , 0.0 if reduced_motion else 1.0 ) )
func clear ( ) -> void :
    _clock = 0.0 ; _puff_cursor = 0 ; _debris_cursor = 0 ; _fire_cursor = 0 ; _blast_cursor = 0 ; _light_cursor = 0
    for item in _puffs : item . active = false
    for item in _debris : item . active = false
    for item in _fires : item . active = false
    for item in _blasts : item . active = false
    for item in _lights : item . active = false ; item . node . visible = false ; item . node . light_energy = 0.0
    if _initialized : _render ( )
func debug_snapshot ( ) -> Dictionary :
    var lights : = 0
    var sites : = 0
    for fire in _fires :
        if fire . active : sites += 1
    for light in _lights :
        if light . active : lights += 1
    return { "clock" : _clock , "puffs" : _visible_puffs , "flames" : _visible_flames , "blast_volumes" : _visible_blasts , "debris" : _visible_debris , "lights" : lights , "nodes" : get_child_count ( ) , "render_batches" : 4 , "puff_capacity" : PUFF_CAPACITY , "flame_capacity" : FLAME_CAPACITY , "blast_capacity" : BLAST_VOLUMES , "debris_capacity" : DEBRIS_CAPACITY , "fire_sites" : sites , "fire_capacity" : FIRE_CAPACITY }
