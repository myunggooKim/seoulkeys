extends Node3D
const Motion = preload ( "res://scripts/defense_motion.gd" )
const Airspace = preload("res://scripts/defense_airspace.gd")
var airspace = Airspace.new()
const LabelPlacement = preload ( "res://scripts/defense_labels.gd" )
const LauncherPlacement = preload ( "res://scripts/defense_launcher_placement.gd" )
const LauncherGround = preload ( "res://scripts/defense_launcher_ground.gd" )
const LauncherAim = preload ( "res://scripts/defense_launcher_aim.gd" )
const ReloadCrew = preload("res://scripts/defense_reload_crew.gd")
const ART_DIRECTION = preload ( "res://scripts/defense_art_direction.gd" )
const CYAN = Color ( "91d3b2" )
const AMBER = Color ( "ef786f" )
const INK = Color ( 0.015 , 0.04 , 0.085 )
const Progression = preload("res://scripts/defense_progression.gd")
const ThreatAlerts = preload("res://scripts/defense_threat_alerts.gd")
var threat_alerts = ThreatAlerts.new()
const Fighter = preload("res://scripts/defense_fighter.gd")
var fighter_motion = Fighter.new()
var fighter: Dictionary = {}
var fighter_spawned := false
var wave_age := 0.0
var camera : Camera3D
var landmark : Node3D
var launcher : Node3D
var launcher_rack : Node3D
var launcher_aim = LauncherAim . new ( )
var reload_crew: Node3D
var citizen_celebration: Node3D
var launcher_rack_bounds : AABB
var launcher_bounds = AABB ( Vector3 ( -2 , 0 , -5 ) , Vector3 ( 4 , 6 , 10 ) )
var launcher_sockets : Array = [ ]
var launch_socket_index = 0
var launcher_layout_key = ""
var launch_fx : Node3D
var scenery_root : Node3D
var scene_context : Node3D
var traffic : DefenseTraffic
var city_damage : Node
var launch_apron : Node3D
var launch_light : OmniLight3D
var scene_camera_position = Vector3 ( 0 , 34 , 75 )
var scene_camera_target = Vector3 ( 0 , 12 , -15 )
var scene_camera_fov = 52.0
var launcher_home = Vector3 ( -10 , 0 , 20 )
var hud : CanvasLayer
var label_layer : CanvasLayer
var font : Font
var hangul_font : Font
var words : Array = [ ]
var deck : Array = [ ]
var missiles : Array = [ ]
var interceptors : Array = [ ]
var effects : Array = [ ]
var ruins : Array = [ ]
var phase = "briefing"
var selected_scene = "namsan"
var pace = "calm"
var score = 0
var wave = 1
var shield = 5
var catches = 0
var wave_catches = 0
var combo = 0
var charge = 0
var spawn_clock = 0.0
var pulse_left = 0.0
var elapsed = 0.0
var scene_time = 0.0
var shake = 0.0
var paused = false
var reduced_motion = false
var camera_yaw = 0.0
var camera_distance = 51.0
var typed = ""
var serial = 0
var models : Dictionary = { }
var prepared_materials : Dictionary = { }
var vehicle_templates : Dictionary = { }
var audio_director : Node
var rng = RandomNumberGenerator . new ( )
var demo = false
var demo_time = 0.0
var capture_end = 0.0
var capture_finishing = false
var demo_next = 5.2
var demo_switch = 22.0
var demo_scene_switched = false
var demo_invalid_enabled = false
var demo_invalid_done = false
var demo_keys : Array = [ ]
var demo_key_clock = 0.0
var destruction_demo = false
var destruction_stage = 0
var capture_schedule : Array = [ ]
var session_words : Dictionary = { }
var recent_target_words : Dictionary = { }
const TARGET_SUBMIT_GRACE = 1.5
var camera_base = Vector3 . ZERO
var defeat_timer : Timer
var host_suspended = false
# Keep dialog focus loss separate from explicit/manual and background pauses.
var host_dialog_suspended := false
var host_background_suspended := false
var focus_pause_owned := false
var game_sound = true
var game_music = true
var web_clock = 0.0
var applying_web_config = false
# Meanings belong to one host locale; audio updates must not reshuffle the deck.
var meaning_locale := "en"
var word_meanings: Dictionary = {}
var fighter_meanings: Dictionary = {}
var fighter_labels: Dictionary = {}
const DEFAULT_FIGHTER_MEANINGS := {
    "en": {
        "흐리멍덩하다": "vague; unfocused",
        "뒤죽박죽": "jumbled; mixed up",
        "어리둥절하다": "bewildered",
        "알쏭달쏭하다": "puzzling; unclear",
        "우왕좌왕하다": "to flounder indecisively",
        "쭈뼛쭈뼛하다": "to hesitate timidly"
    },
    "ko": {
        "흐리멍덩하다": "분명하지 않고 흐릿하다",
        "뒤죽박죽": "이것저것 마구 뒤섞인 모양",
        "어리둥절하다": "뜻밖의 일로 정신이 얼떨떨하다",
        "알쏭달쏭하다": "분명하게 알 수 없어 아리송하다",
        "우왕좌왕하다": "갈피를 못 잡고 이리저리 움직이다",
        "쭈뼛쭈뼛하다": "머뭇거리며 선뜻 나서지 못하다"
    }
}
func _ready ( ) -> void :
    get_window ( ) . size_changed . connect ( _sync_logical_viewport )
    _sync_logical_viewport ( )
    rng . seed = 71835
    seed ( 71835 )
    if RenderingServer . get_video_adapter_name ( ) . to_lower ( ) . contains ( "llvmpipe" ) and Engine . get_write_movie_path ( ) . is_empty ( ) : get_viewport ( ) . scaling_3d_scale = 0.75
    for arg in OS . get_cmdline_user_args ( ) :
        if arg == "--demo" : demo = true
        if arg == "--quick-showcase" : demo_switch = 14.0
        if arg == "--revision-showcase" : demo_invalid_enabled = true ; demo_switch = 10.0 ; demo_next = 7.2
        if arg . begins_with ( "--capture-end=" ) : capture_end = arg . get_slice ( "=" , 1 ) . to_float ( )
        if arg == "--destruction-demo" : demo = true ; destruction_demo = true
        if arg == "--gwanghwamun" : selected_scene = "gwanghwamun"
        if arg == "--reduced-motion" : reduced_motion = true
    words = JSON . parse_string ( FileAccess . get_file_as_string ( "res://assets/words.json" ) )
    for item in words: word_meanings[str(item.word)] = str(item.meaning)
    if ResourceLoader . exists ( "res://fonts/SeoulSansKR.otf" ) :
        hangul_font = load ( "res://fonts/SeoulSansKR.otf" )
        font = hangul_font . duplicate ( )
        preload ( "res://scripts/defense_font_fallbacks.gd" ) . apply_to ( font )
    for asset_name in [ "namsan" , "namsan-context" , "gwanghwamun" , "gwanghwamun-context" , "missile" , "interceptor" , "defense-launcher" , "chunmoo-launcher" ] :
        var path = "res://assets/" + asset_name . replace ( "-context" , "-city-context" ) + ".glb"
        if ResourceLoader . exists ( path ) : models [ asset_name ] = load ( path )
    city_damage = preload ( "res://scripts/defense_city_damage.gd" ) . new ( )
    add_child ( city_damage )
    _setup_world ( )
    for vehicle in [ "missile" , "interceptor" ] :
        var prototype : Node3D = models [ vehicle ] . instantiate ( )
        add_child ( prototype )
        _batch_static ( prototype )
        prototype . visible = false
        vehicle_templates [ vehicle ] = prototype
    _setup_audio ( )
    defeat_timer = Timer . new ( ) ; defeat_timer . one_shot = true ; add_child ( defeat_timer ) ; defeat_timer . timeout . connect ( _show_defeat_result )
    label_layer = CanvasLayer . new ( )
    label_layer . layer = 10
    add_child ( label_layer )
    var hud_script = load ( "res://scripts/defense_hud.gd" )
    hud = hud_script . new ( )
    add_child ( hud )
    hud . start_requested . connect ( _start )
    hud . answer_submitted . connect ( _answer )
    hud . answer_changed . connect ( func ( value ) : typed = value )
    hud . pulse_requested . connect ( _pulse )
    hud . pause_requested . connect ( _toggle_pause )
    hud . wave_continue_requested . connect ( _next_wave )
    hud . scene_selected . connect ( _build_landmark )
    hud . reduced_motion_changed . connect ( func ( enabled ) : reduced_motion = enabled )
    hud . sound_changed . connect ( _set_sound_enabled )
    hud . music_changed . connect ( _set_music_enabled )
    hud . set_sound_enabled ( game_sound )
    hud . set_music_enabled ( game_music )
    hud . set_reduced_motion ( reduced_motion )
    _build_landmark ( selected_scene )
    hud . show_briefing ( selected_scene )
    _stats ( )
    _setup_web_bridge ( )
    get_window ( ) . focus_exited . connect ( _on_focus_lost )
    if demo :
        capture_schedule = [ 3.0 , 6.3 , 8.0 , 15.0 , 24.0 , 27.4 , 33.0 ] if not destruction_demo else [ 2.0 , 4.8 , 6.8 , 10.0 , 12.8 , 16.8 ]
    print ( "SEOUL_DEFENSE_READY engine=Godot renderer=" , RenderingServer . get_current_rendering_method ( ) , " models=" , models . keys ( ) )
func _sync_logical_viewport ( ) -> void :
    var window = get_window ( )
    var logical_size : Vector2i = window . size
    if not Engine . get_write_movie_path ( ) . is_empty ( ) :
        logical_size = Vector2i ( 1280 , 720 )
    elif OS . has_feature ( "web" ) :
        var size_json = JavaScriptBridge . eval ( "(function(){const c=document.getElementById('canvas');const r=c?c.getBoundingClientRect():null;return JSON.stringify([Math.round(r?r.width:window.innerWidth),Math.round(r?r.height:window.innerHeight)]);})()" )
        if size_json is String :
            var css_size = JSON . parse_string ( size_json )
            if css_size is Array and css_size . size ( ) == 2 :
                logical_size = Vector2i ( maxi ( 1 , int ( css_size [ 0 ] ) ) , maxi ( 1 , int ( css_size [ 1 ] ) ) )
    for arg in OS . get_cmdline_user_args ( ) :
        if arg . begins_with ( "--qa-viewport=" ) :
            var requested = arg . get_slice ( "=" , 1 ) . split ( "x" )
            if requested . size ( ) == 2 : logical_size = Vector2i ( maxi ( 320 , int ( requested [ 0 ] ) ) , maxi ( 320 , int ( requested [ 1 ] ) ) )
    if logical_size . x > 0 and logical_size . y > 0 and window . content_scale_size != logical_size :
        window . content_scale_size = logical_size
func _setup_world ( ) -> void :
    var environment_node = WorldEnvironment . new ( )
    var environment = Environment . new ( )
    var sky = Sky . new ( )
    var sky_material = ProceduralSkyMaterial . new ( )
    sky_material . sky_top_color = Color ( 0.018 , 0.034 , 0.085 )
    sky_material . sky_horizon_color = Color ( 0.29 , 0.31 , 0.39 )
    sky_material . ground_bottom_color = Color ( 0.012 , 0.022 , 0.05 )
    sky_material . ground_horizon_color = Color ( 0.19 , 0.25 , 0.33 )
    sky_material . sky_curve = 0.23
    sky_material . sun_angle_max = 4.0
    var atmospheric = ShaderMaterial . new ( ) ; atmospheric . shader = load ( "res://shaders/sky.gdshader" )
    sky . sky_material = atmospheric
    environment . background_mode = Environment . BG_SKY
    environment . sky = sky
    environment . ambient_light_source = Environment . AMBIENT_SOURCE_COLOR
    environment . ambient_light_color = Color ( 0.33 , 0.44 , 0.64 )
    environment . ambient_light_energy = 0.28
    environment . tonemap_mode = Environment . TONE_MAPPER_FILMIC
    environment . fog_enabled = true
    environment . fog_light_color = Color ( 0.12 , 0.18 , 0.29 )
    environment . fog_density = 0.0025
    environment . fog_sky_affect = 0.1
    environment_node . environment = environment
    add_child ( environment_node )
    var sun = DirectionalLight3D . new ( )
    sun . rotation_degrees = Vector3 ( -38 , -34 , 0 )
    sun . light_color = Color ( 1.0 , 0.74 , 0.52 )
    sun . light_energy = 0.55
    sun . shadow_enabled = true
    sun . shadow_opacity = 0.35
    sun . directional_shadow_max_distance = 115.0
    sun . directional_shadow_mode = DirectionalLight3D . SHADOW_ORTHOGONAL
    add_child ( sun )
    var rim = DirectionalLight3D . new ( )
    rim . rotation_degrees = Vector3 ( -24 , 145 , 0 )
    rim . light_color = Color ( 0.32 , 0.62 , 1.0 )
    rim . light_energy = 0.24
    add_child ( rim )
    var plane = PlaneMesh . new ( )
    plane . size = Vector2 ( 230 , 230 )
    var ground = MeshInstance3D . new ( )
    ground . mesh = plane
    ground . material_override = _material ( Color ( 0.036 , 0.065 , 0.09 ) , 0.15 , 0.7 )
    ground . position . y = -2.0
    add_child ( ground )
    traffic = preload ( "res://scripts/defense_traffic.gd" ) . new ( )
    add_child ( traffic )
    launch_apron = Node3D . new ( ) ; add_child ( launch_apron )
    _box ( launch_apron , Vector3 ( 0 , -0.0125 , 0 ) , Vector3 ( 6 , 0.025 , 5 ) , _material ( Color ( "302b35" ) , 0.05 , 0.92 ) )
    for side in [ -1 , 1 ] :
        for index in range ( 4 ) :
            _box ( launch_apron , Vector3 ( side * 2.7 , 0.003 , -1.8 + index * 1.2 ) , Vector3 ( 0.1 , 0.006 , 0.5 ) , _emissive ( CYAN , 0.8 ) )
    launcher = models [ "chunmoo-launcher" ] . instantiate ( ) if models . has ( "chunmoo-launcher" ) else models [ "defense-launcher" ] . instantiate ( )
    add_child ( launcher )
    var chassis = launcher . find_child ( "Chassis" , true , false )
    if chassis : chassis . rotation . y = PI / 2.0
    launcher_rack = launcher . find_child ( "PodRack" , true , false )
    if launcher_rack :
        launcher_rack . position = Basis ( Vector3 . UP , PI / 2.0 ) * launcher_rack . position
    var parts : Array = [ ]
    _gather_meshes ( launcher , parts )
    var first = true
    for part in parts :
        var box = launcher . global_transform . affine_inverse ( ) * part . global_transform * part . mesh . get_aabb ( )
        launcher_bounds = box if first else launcher_bounds . merge ( box )
        first = false
    if launcher_rack :
        var rack_parts : Array = [ ]
        _gather_meshes ( launcher_rack , rack_parts )
        var rack_first = true
        for part in rack_parts :
            var local_box = launcher_rack . global_transform . affine_inverse ( ) * part . global_transform * part . mesh . get_aabb ( )
            launcher_rack_bounds = local_box if rack_first else launcher_rack_bounds . merge ( local_box )
            rack_first = false
    var socket_path = "res://assets/chunmoo-launcher-sockets.json"
    if FileAccess . file_exists ( socket_path ) :
        var data = JSON . parse_string ( FileAccess . get_file_as_string ( socket_path ) )
        if data is Dictionary : launcher_sockets = data . get ( "sockets" , [ ] )
    if chassis and launcher_rack :
        _batch_static ( chassis )
        _batch_static ( launcher_rack )
    else :
        _batch_static ( launcher )
    preload("res://scripts/defense_launcher_marking.gd").apply(chassis,font)
    launcher_aim . configure ( launcher_rack , _launch_target_valid )
    reload_crew=ReloadCrew.new()
    reload_crew.name="SymbolicStageClearCrew"
    launcher.add_child(reload_crew)
    reload_crew.configure(launcher_bounds)
    citizen_celebration=preload("res://scripts/defense_citizen_celebration.gd").new()
    add_child(citizen_celebration)
    citizen_celebration.configure(launcher)
    launch_fx = preload ( "res://scripts/defense_launch_fx.gd" ) . new ( )
    add_child ( launch_fx )
    launcher_aim . prelaunch_started . connect ( _begin_launch_smoke )
    launcher_aim . prelaunch_cancelled . connect ( _cancel_launch_smoke )
    launcher_aim . prelaunch_finished . connect ( _finish_launch_smoke )
    launch_light = OmniLight3D . new ( )
    launch_light . position = Vector3 ( -16 , 4 , 0.5 )
    launch_light . light_color = CYAN
    launch_light . light_energy = 0.3
    launch_light . omni_range = 13
    add_child ( launch_light )
    camera = Camera3D . new ( )
    camera . fov = 53
    camera . near = 0.2
    camera . far = 320
    camera . current = true
    add_child ( camera )
    _camera_update ( 0.0 )
    var post_layer = CanvasLayer . new ( )
    post_layer . layer = 3
    var post = ColorRect . new ( )
    post . set_anchors_and_offsets_preset ( Control . PRESET_FULL_RECT )
    post . mouse_filter = Control . MOUSE_FILTER_IGNORE
    var post_material = ShaderMaterial . new ( )
    post_material . shader = load ( "res://shaders/post.gdshader" )
    post_material . set_shader_parameter ( "strength" , 0.06 )
    post . material = post_material
    post . visible = not RenderingServer . get_video_adapter_name ( ) . to_lower ( ) . contains ( "llvmpipe" )
    post_layer . add_child ( post )
    add_child ( post_layer )
    scenery_root = ART_DIRECTION . apply ( self , environment , sun , rim , ground , false )
func _build_landmark ( scene_name : String ) -> void :
    threat_alerts.reset()
    _remove_fighter()
    if audio_director:
        audio_director.cancel_effect("impact_alert")
        audio_director.cancel_effect("fighter_alert")
    _clear_flight ( )
    if is_instance_valid(reload_crew):reload_crew.clear(true)
    if is_instance_valid(citizen_celebration):citizen_celebration.clear(true)
    if is_instance_valid ( landmark ) : landmark . visible = false ; landmark . queue_free ( )
    if is_instance_valid ( scene_context ) : scene_context . visible = false ; scene_context . queue_free ( )
    for ruin in ruins :
        if is_instance_valid ( ruin . node ) : ruin . node . queue_free ( )
    ruins . clear ( )
    selected_scene = scene_name
    var config_path = "res://assets/" + scene_name + "-context.json"
    var config = JSON . parse_string ( FileAccess . get_file_as_string ( config_path ) )
    if not config is Dictionary : config = { }
    var camera_config : Dictionary = config . get ( "camera" , { } )
    scene_camera_position = _vector ( camera_config . get ( "position" , [ 0 , 34 , 75 ] ) )
    scene_camera_target = _vector ( camera_config . get ( "look_at" , [ 0 , 12 , -15 ] ) )
    scene_camera_fov = float ( camera_config . get ( "fov" , 52 ) )
    # A larger real sky area keeps the higher approach visible without drawing
    # rockets over the terrain or changing their depth testing.
    scene_camera_fov += 14.0
    if scene_name == "namsan" : scene_camera_position = scene_camera_target + ( scene_camera_position - scene_camera_target ) * 0.9
    launcher_layout_key = ""
    launch_socket_index = 0
    launcher_home = _vector ( config . get ( "launcher" , [ -10 , 0 , 20 ] ) )
    launcher . position = launcher_home
    launch_apron . position = launcher_home
    launch_light . position = launcher_home + Vector3 ( 0 , 4 , 0 )
    camera_yaw = 0.0
    _camera_update ( 0 )
    scene_context = models [ scene_name + "-context" ] . instantiate ( )
    add_child ( scene_context )
    landmark = models [ scene_name ] . instantiate ( ) if models . has ( scene_name ) else Node3D . new ( )
    landmark . position = Vector3 ( 0 , 0 , -14 )
    add_child ( landmark )
    if scene_name=="gwanghwamun":preload("res://scripts/defense_gate_passages.gd").apply(landmark,scene_context)
    if scene_name == "gwanghwamun": preload("res://scripts/defense_road_corner.gd").apply(scene_context)
    _reparent_defeat_context ( scene_context )
    var cleared_triangles = LauncherGround . prepare_service_bay ( scene_context , selected_scene )
    scene_context . set_meta ( "service_bay_cleared_triangles" , cleared_triangles )
    var city_metadata = JSON . parse_string ( FileAccess . get_file_as_string ( "res://assets/" + scene_name + "-city-damage.json" ) )
    var city_configured : bool = city_damage . configure ( scene_context , city_metadata )
    assert ( city_configured , "City damage metadata/context mismatch" )
    if not city_configured : push_error ( "City damage metadata/context mismatch" ) ; return
    airspace.configure(scene_context, landmark)
    for partition in city_damage . batch_roots ( ) : _batch_static ( partition )
    _batch_static ( landmark )
    traffic . configure ( config . get ( "traffic_lanes" , [ ] ) )
    var accent = OmniLight3D . new ( )
    accent . position = Vector3 ( -4 , 8 , -6 )
    accent . light_color = CYAN if scene_name == "namsan" else Color ( 1.0 , 0.64 , 0.32 )
    accent . light_energy = 0.35
    accent . omni_range = 28
    landmark . add_child ( accent )
    if hud : hud . set_scene_name ( scene_name )
func _vector ( value : Array ) -> Vector3 :
    return Vector3 ( float ( value [ 0 ] ) , float ( value [ 1 ] ) , float ( value [ 2 ] ) )
func _reparent_defeat_context ( node : Node ) -> void :
    for child in node . get_children ( ) :
        if str ( child . name ) . to_lower ( ) . contains ( "defeat" ) :
            child . reparent ( landmark , true )
        else : _reparent_defeat_context ( child )
func _start ( scene_name : String , selected_pace : String ) -> void :
    audio_director . cancel_effect ( "invalid" )
    _clear_flight ( )
    if defeat_timer : defeat_timer . stop ( )
    _build_landmark ( scene_name )
    pace = selected_pace
    phase = "playing"
    city_damage . reset ( "playing" )
    if hud . has_method ( "set_playing" ) : hud . set_playing ( )
    paused = false
    focus_pause_owned = false
    audio_director . set_paused ( host_suspended )
    audio_director . start_music ( "playing" )
    score = 0
    wave = 1
    fighter_spawned=false;wave_age=0.0
    shield = 5
    catches = 0
    wave_catches = 0
    combo = 0
    charge = 0
    pulse_left = 0.0
    spawn_clock = 3.2
    typed = ""
    deck = words . duplicate ( true )
    deck . shuffle ( )
    session_words . clear ( )
    recent_target_words . clear ( )
    hud . clear_answer ( )
    hud . set_paused ( false )
    _spawn_missile ( 0 )
    _spawn_missile ( 1 )
    _stats ( )
    hud . flash_message ( "TYPE THE HANGUL · ENTER TO LAUNCH" , true )
    print ( "MISSION_START scene=" , scene_name , " pace=" , pace )
func _next_wave ( ) -> void :
    if phase != "wave_clear" : return
    if is_instance_valid(reload_crew):reload_crew.clear()
    if is_instance_valid(citizen_celebration):citizen_celebration.clear()
    if audio_director:audio_director.cancel_effect("cheer")
    audio_director . cancel_effect ( "invalid" )
    wave += 1
    fighter_spawned=false;wave_age=0.0
    wave_catches = 0
    recent_target_words . clear ( )
    charge = mini ( 5 , charge + 1 )
    phase = "playing"
    city_damage . set_phase ( "playing" )
    spawn_clock = 1.8
    hud . clear_answer ( )
    hud . set_paused ( false )
    _spawn_missile ( 0 )
    _stats ( )
func _spawn_missile ( slot : int = -1 ) -> void :
    if deck . is_empty ( ) : deck = words . duplicate ( true ) ; deck . shuffle ( )
    var item : Dictionary = deck . pop_back ( )
    var active_words = missiles . map ( func ( m ) : return m . word )
    for attempt in range ( words . size ( ) ) :
        var difficulty = int ( item . get ( "difficulty" , 1 if item . word . length ( ) <= 2 else 2 if item . word . length ( ) <= 3 else 3 ) )
        if not active_words . has ( item . word ) and difficulty <= mini ( 3 , wave ) : break
        deck . push_front ( item )
        item = deck . pop_back ( )
    serial += 1
    var lane = slot if slot >= 0 else serial % 4
    var compact = get_viewport ( ) . get_visible_rect ( ) . size . x < 680
    var start : Vector3 = preload ( "res://scripts/defense_approach.gd" ) . lane_start ( lane , compact , selected_scene )
    start . x += rng . randf_range ( -2.0 , 2.0 )
    var zone : Dictionary = city_damage . reserve_target ( serial )
    if zone . is_empty ( ) : return
    var target : Vector3 = zone . target
    # The long descending nose reaches the roof before the body centre does.
    target.y += 6.5
    start = preload ( "res://scripts/defense_approach.gd" ) . start_for_target ( start , target , camera , lane , hud . get_telemetry_rects ( ) if hud . has_method ( "get_telemetry_rects" ) else [ ] )
    start = airspace.incoming_start(start, target)
    var body : Node3D = vehicle_templates [ "missile" ] . duplicate ( )
    body . visible = true
    body . scale = Vector3 . ONE * 2.6
    add_child ( body )
    _batch_static ( body )
    body . position = start
    body . look_at ( start + Motion.incoming_tangent(start, target, 0.0) )
    var flare = MeshInstance3D . new ( )
    var sphere = SphereMesh . new ( )
    sphere . radius = 0.27 ; sphere . height = 0.54
    flare . mesh = sphere
    flare . material_override = _emissive ( Color("fff1ce") , 3.5 )
    flare . position = Vector3 ( 0 , 0 , 2.1 )
    body . add_child ( flare )
    var plume = MeshInstance3D . new ( )
    var cone = CylinderMesh . new ( ) ; cone . top_radius = 0.012 ; cone . bottom_radius = 0.2 ; cone . height = 4.5 ; cone . radial_segments = 12
    plume . mesh = cone ; plume . material_override = _emissive ( AMBER , 1.2 , true ) ; plume . material_override . albedo_color . a = 0.64
    plume . position = Vector3 ( 0 , 0 , 4.0 ) ; plume . rotation . x = PI * 0.5 ; body . add_child ( plume )
    var trail = MeshInstance3D . new ( )
    trail . mesh = ImmediateMesh . new ( )
    var trail_material = ShaderMaterial . new ( )
    trail_material . shader = load ( "res://shaders/trail.gdshader" )
    trail_material . set_shader_parameter ( "trail_color" , AMBER )
    trail . material_override = trail_material
    trail . cast_shadow = GeometryInstance3D . SHADOW_CASTING_SETTING_OFF
    add_child ( trail )
    var label = _missile_label ( item . word , item . meaning )
    var leader = Line2D . new ( )
    leader . width = 1.2 ; leader . antialiased = true ; leader . default_color = Color ( 0.75 , 0.56 , 0.46 , 0.65 )
    label_layer . add_child ( leader )
    label_layer . add_child ( label )
    var duration = preload ( "res://scripts/defense_approach.gd" ) . flight_duration ( pace , wave , item . word . length ( ) )
    missiles . append ( { "node" : body , "trail" : trail , "history" : [ ] , "trail_clock" : 0.0 , "label" : label , "leader" : leader , "layout" : { } , "word" : item . word , "meaning" : item . meaning , "start" : start , "target" : target , "t" : 0.0 , "duration" : duration , "locked" : false , "id" : serial , "zone_id" : zone . zone_id , "flare" : flare , "tail" : start - Motion.incoming_tangent(start, target, 0.0) * 5.1 } )
func _missile_label ( word : String , meaning : String ) -> PanelContainer :
    var panel = PanelContainer . new ( )
    panel . mouse_filter = Control . MOUSE_FILTER_IGNORE
    var compact = get_viewport ( ) . get_visible_rect ( ) . size . x < 680 or get_viewport ( ) . get_visible_rect ( ) . size . y < 500
    panel . custom_minimum_size = Vector2 ( 124 if compact else 132 , 70 )
    panel . texture_filter = CanvasItem . TEXTURE_FILTER_LINEAR
    var target_font : Font = preload ( "res://scripts/defense_approach.gd" ) . label_font ( hangul_font )
    var style = StyleBoxFlat . new ( )
    style . bg_color = Color ( 0.051 , 0.078 , 0.129 , 0.96 )
    style . border_color = Color ( "34465f" )
    style . set_border_width_all ( 1 )
    style . set_corner_radius_all ( 12 )
    style . content_margin_left = 12 ; style . content_margin_right = 12
    style . content_margin_top = 4 ; style . content_margin_bottom = 4
    panel . add_theme_stylebox_override ( "panel" , style )
    var box = VBoxContainer . new ( )
    box . add_theme_constant_override ( "separation" , -4 )
    panel . add_child ( box )
    var title = Label . new ( )
    title . text = word
    title.language = "ko"
    title.text_direction = Control.TEXT_DIRECTION_LTR
    title . horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    title . add_theme_color_override ( "font_color" , Color ( "f4f7fc" ) )
    title . add_theme_font_size_override ( "font_size" , 28 )
    if target_font : title . add_theme_font_override ( "font" , target_font )
    box . add_child ( title )
    var translation = Label . new ( )
    translation . horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    translation . add_theme_color_override ( "font_color" , Color ( "b5c4da" ) )
    translation . add_theme_font_size_override ( "font_size" , 18 )
    box . add_child ( translation )
    _set_label_meaning(panel, meaning)
    return panel
func _set_label_meaning(panel: PanelContainer, meaning: String) -> void:
    var translation: Label = panel.get_child(0).get_child(1)
    translation.text = preload("res://scripts/defense_approach.gd").meaning_text(meaning)
    translation.language = meaning_locale
    translation.text_direction = Control.TEXT_DIRECTION_RTL if meaning_locale.get_slice("-", 0) in ["ar", "fa", "ur"] else Control.TEXT_DIRECTION_LTR
    var translation_font: Font = preload("res://scripts/defense_approach.gd").label_font(font, translation.text)
    if translation_font:
        translation.add_theme_font_override("font", translation_font)
    else:
        translation.remove_theme_font_override("font")
    # Reset the previous locale's layout before measuring the new script.
    translation.autowrap_mode = TextServer.AUTOWRAP_OFF
    translation.add_theme_font_size_override("font_size", 18)
    translation.custom_minimum_size.x = 0.0
    translation.max_lines_visible = -1
    translation.text_overrun_behavior = TextServer.OVERRUN_NO_TRIMMING
    var compact: bool = get_viewport().get_visible_rect().size.x < 680 or get_viewport().get_visible_rect().size.y < 500
    var near_scale := 1.0 if compact else 1.1
    var wrap_width := minf(230.0, maxf(1.0, hud.get_playfield_rect().size.x / near_scale - 24.0))
    if translation_font and translation_font.get_string_size(translation.text, HORIZONTAL_ALIGNMENT_LEFT, -1, 18).x > wrap_width:
        translation.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
        translation.custom_minimum_size.x = wrap_width
        translation.size.x = wrap_width
        # Keep the complete gloss. Prefer at most four lines, reducing only as far
        # as 12 px; exceptionally long definitions may grow rather than vanish.
        for size in range(17, 11, -1):
            if translation.get_line_count() <= 4: break
            translation.add_theme_font_size_override("font_size", size)
    panel.reset_size()
func _refresh_fighter_meaning() -> void:
    if fighter.is_empty(): return
    fighter.meaning = _fighter_gloss(str(fighter.word))
    var panel: PanelContainer = fighter.label
    var box: VBoxContainer = panel.get_child(0)
    # Fighter cards add a third row; leave real space around the hit counter.
    box.add_theme_constant_override("separation", 2)
    var progress: Label = box.get_node_or_null("HitProgress")
    if progress == null:
        progress = Label.new()
        progress.name = "HitProgress"
        progress.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
        progress.language = "en"
        progress.text_direction = Control.TEXT_DIRECTION_LTR
        progress.add_theme_color_override("font_color", Color("ef786f"))
        progress.add_theme_font_size_override("font_size", 16)
        var progress_font: Font = preload("res://scripts/defense_approach.gd").label_font(hangul_font)
        if progress_font: progress.add_theme_font_override("font", progress_font)
        box.add_child(progress)
    # Keep numeric progress separate so RTL shaping and gloss ellipsis cannot hide it.
    progress.text = str(clampi(int(fighter.hits), 0, 2)) + "/2"
    _set_label_meaning(panel, str(fighter.meaning))
    fighter.layout.clear()
func _fighter_gloss(word: String) -> String:
    return str(fighter_meanings.get(word, DEFAULT_FIGHTER_MEANINGS.get(meaning_locale, {}).get(word, "")))
func _fighter_feedback(key: String, counter: String) -> String:
    return str(fighter_labels.get(key, counter))
func _process ( delta : float ) -> void :
    elapsed += delta
    if OS . has_feature ( "web" ) :
        web_clock += delta
        if web_clock >= 0.25 :
            web_clock = 0.0
            _sync_logical_viewport ( )
            _read_web_config ( )
    if audio_director: audio_director.set_paused(paused or host_suspended)
    _camera_update ( delta )
    _position_launcher ( )
    if city_damage :
        city_damage . set_reduced_motion ( reduced_motion )
        city_damage . set_paused ( paused or host_suspended )
        city_damage . advance ( delta )
    if not paused and not host_suspended :
        _effects_update ( delta )
        if traffic and not reduced_motion : traffic . advance ( delta , phase != "over" )
    if demo : _demo_update ( delta )
    if phase == "playing" and not paused and not host_suspended :
        scene_time += delta
        wave_age+=delta
        _advance_fighter(delta)
        pulse_left = maxf ( 0.0 , pulse_left - delta )
        spawn_clock -= delta
        if wave_catches < _wave_goal() and spawn_clock <= 0.0 and missiles.size() < _normal_threat_limit() :
            _spawn_burst()
            spawn_clock = float(_wave_profile().spawn_interval)
        for m in missiles . duplicate ( ) :
            m . t += delta / m . duration * ( 0.23 if pulse_left > 0.0 else 1.0 )
            if m . locked : m . t = minf ( m . t , 0.985 )
            if m . t >= 1.0 :
                _impact ( m )
                if phase != "playing" : break
                continue
            var t : float = m . t
            var pos : Vector3 = Motion.incoming_position(m.start, m.target, t)
            var direction : Vector3 = Motion.incoming_tangent(m.start, m.target, t)
            m . node . position = pos
            m . node . look_at ( pos + direction )
            var tail : Vector3 = pos - direction * 5.1
            Motion.advance_trail(m, m.tail, tail, delta, 0.025, 76)
            m . tail = tail
            _draw_trail ( m . trail , Motion . visible_trail ( m , tail ) , 0.52 )
            m . flare . scale = Vector3 . ONE * ( 1.0 + sin ( scene_time * 8.0 + m . id ) * 0.035 )
        if phase == "playing" :
            var ready : Variant = launcher_aim . advance ( delta )
            if ready is Dictionary : _fire_interceptor ( ready )
        _update_interceptors ( delta )
        _update_impact_warning(delta)
    if launch_fx :
        launch_fx . set_paused ( paused or host_suspended )
        launch_fx . set_reduced_motion ( reduced_motion )
        launch_fx . advance ( delta )
    if is_instance_valid(reload_crew):reload_crew.advance(delta,phase!="wave_clear" or paused or host_suspended,reduced_motion)
    if is_instance_valid(citizen_celebration):citizen_celebration.advance(delta,phase!="wave_clear" or paused or host_suspended,reduced_motion)
    _update_labels ( )
    _update_audio ( )
func _update_labels ( ) -> void :
    var targets : Array = [ ]
    var placement_requests : Array = [ ]
    var bodies : Array = [ ]
    if hud . has_method ( "get_hud_obstacle_rects" ) :
        for control_rect in hud . get_hud_obstacle_rects ( ) : bodies . append ( control_rect . grow ( 4.0 ) )
    for threat in missiles :
        if is_instance_valid ( threat . node ) : bodies . append ( _missile_screen_bounds ( threat . node ) )
    if not fighter.is_empty() and is_instance_valid(fighter.node):bodies.append(_project_fighter_bounds().grow(6.0))
    if launcher : bodies . append ( LauncherPlacement . projected_bounds ( camera , launcher . global_transform , launcher_bounds ) )
    if launcher_rack : bodies . append ( LauncherPlacement . projected_bounds ( camera , launcher_rack . global_transform , launcher_rack_bounds ) )
    if get_viewport ( ) . get_visible_rect ( ) . size . x >= 360.0 :
        if selected_scene == "namsan" :
            bodies . append ( _project_box ( Vector3 ( -3 , 12 , -18 ) , Vector3 ( 3 , 33 , -10 ) ) )
        else :
            bodies . append ( _project_box ( Vector3 ( -14 , 0 , -21 ) , Vector3 ( 14 , 14 , -7 ) ) )
            bodies . append ( _project_box ( Vector3 ( -11 , 0 , -104 ) , Vector3 ( 11 , 12 , -24 ) ) )
    var area : Rect2 = hud . get_playfield_rect ( )
    for m in missiles :
        if not is_instance_valid ( m . node ) : continue
        var panel : PanelContainer = m . label
        panel . visible = not m . locked and not camera . is_position_behind ( m . node . global_position )
        m . leader . visible = panel . visible
        if panel . visible :
            var body : Rect2 = _missile_screen_bounds ( m . node )
            var card_scale = preload ( "res://scripts/defense_approach.gd" ) . card_scale ( m . node . global_position , m . start , m . target , scene_camera_position , get_viewport ( ) . get_visible_rect ( ) . size . x < 680 or get_viewport ( ) . get_visible_rect ( ) . size . y < 500 )
            panel . scale = Vector2 . ONE * card_scale
            var display_size = panel . size * card_scale
            placement_requests . append ( { "missile" : m , "size" : display_size , "body" : body , "state" : m . layout } )
    if not fighter.is_empty() and is_instance_valid(fighter.node):
        var panel: PanelContainer=fighter.label
        panel.visible=not fighter.locked
        fighter.leader.visible=panel.visible
        if panel.visible:
            panel.scale=Vector2.ONE*(0.82 if get_viewport().get_visible_rect().size.x<680 else 1.0)
            var body: Rect2=_project_fighter_bounds()
            placement_requests.append({"missile":fighter,"size":panel.size*panel.scale,"body":body,"state":fighter.layout})
    var positions = preload ( "res://scripts/defense_approach.gd" ) . place_cards ( placement_requests , area , bodies )
    for index in range ( placement_requests . size ( ) ) :
        var request : Dictionary = placement_requests [ index ]
        var m : Dictionary = request . missile
        var panel : PanelContainer = m . label
        panel . position = positions [ index ]
        var card = Rect2 ( panel . position , request . size )
        var screen = camera . unproject_position ( m . node . global_position )
        m . leader . points = preload ( "res://scripts/defense_approach.gd" ) . leader_points ( card , screen , get_viewport ( ) . get_visible_rect ( ) )
        var selected : bool = not typed . is_empty ( ) and m . word . begins_with ( typed )
        var style : StyleBoxFlat = panel . get_theme_stylebox ( "panel" )
        style . border_color = Color ( "78a9ff" ) if selected else Color ( "ff8995" ) if m . t > 0.65 else Color ( "34465f" )
        style . set_border_width_all ( 2 if selected else 1 )
        targets . append ( { "word" : m . word , "meaning" : m . meaning , "danger" : m . t } )
    if hud : hud . set_targets ( targets )
func _project_box ( minimum : Vector3 , maximum : Vector3 ) -> Rect2 :
    var bounds = Rect2 ( camera . unproject_position ( minimum ) , Vector2 . ZERO )
    for x in [ minimum . x , maximum . x ] :
        for y in [ minimum . y , maximum . y ] :
            for z in [ minimum . z , maximum . z ] : bounds = bounds . expand ( camera . unproject_position ( Vector3 ( x , y , z ) ) )
    return bounds
func _namsan_surface_height ( x : float , z : float ) -> float :
    var by = - ( z + 14.0 )
    var angle = atan2 ( by / 12.5 , x / 19.0 )
    var radius = 1.0 + 0.105 * sin ( 3.0 * angle + 0.4 ) + 0.045 * cos ( 5.0 * angle - 0.2 ) + 0.025 * sin ( 9.0 * angle )
    var r = sqrt ( pow ( x / 19.0 , 2 ) + pow ( by / 12.5 , 2 ) ) / radius
    var t = clampf ( ( r - 0.15 ) / 1.03 , 0.0 , 1.0 )
    var ridge = ( 0.6 * sin ( 3.0 * angle + r * 5.0 ) + 0.26 * cos ( 5.0 * angle - r * 4.0 ) ) * pow ( sin ( PI * t ) , 2 )
    return 13.0 * ( 1.0 - t * t * ( 3.0 - 2.0 * t ) ) + ridge - 0.095 * t
func _missile_screen_bounds ( body : Node3D ) -> Rect2 :
    var bounds = Rect2 ( camera . unproject_position ( body . global_position ) , Vector2 . ZERO )
    for x in [ -0.65 , 0.65 ] :
        for y in [ -0.6 , 0.6 ] :
            for z in [ -2.6 , 2.4 ] :
                bounds = bounds . expand ( camera . unproject_position ( body . to_global ( Vector3 ( x , y , z ) ) ) )
    return bounds
func _answer ( answer : String ) -> void :
    if wave_catches >= _wave_goal() and fighter.is_empty(): return
    if demo : print ( "DEMO_SUBMIT answer=" , answer , " targets=" , missiles . map ( func ( m ) : return m . word ) )
    if phase != "playing" or paused or host_suspended : return
    var clean = answer . strip_edges ( )
    if clean . is_empty ( ) : return
    if not fighter.is_empty() and clean==str(fighter.word):
        _answer_fighter()
        return
    var matched : Dictionary = { }
    var already_locked = false
    var available_targets = 0
    for m in missiles :
        if not m . locked : available_targets += 1
        if m . word == clean :
            if m . locked : already_locked = true
            elif matched . is_empty ( ) or m . t > matched . t : matched = m
    if matched . is_empty ( ) :
        if already_locked : return
        if float ( recent_target_words . get ( clean , -1.0 ) ) >= scene_time :
            hud . flash_message ( "TARGET CLEARED · CHOOSE THE NEXT WORD" , true )
            return
        if available_targets == 0 : return
        _sfx ( "invalid" )
        combo = 0
        hud . flash_message ( "CHECK THE WORD · NO CITY DAMAGE" , false )
        _stats ( )
        return
    if not launcher_aim.enqueue(matched):
        if launcher_aim.pending_count()>=LauncherAim.CAPACITY:hud.flash_message("QUEUE FULL · KEEP THIS WORD AND RETRY",true)
        return
    matched . label . visible = false
    matched . leader . visible = false
    hud . clear_answer ( )
    typed = ""
    hud . flash_message ( "LOCK CONFIRMED · AIMING" , true )
func _launch_target_valid ( target : Dictionary ) -> bool :
    var node: Variant=target.get("node")
    return (missiles.has(target) or (not fighter.is_empty() and target==fighter)) and not bool(target.get("launched",false)) and is_instance_valid(node) and not node.is_queued_for_deletion()
func _begin_launch_smoke ( _target : Dictionary ) -> void :
    if phase != "playing" or paused or host_suspended : return
    launch_fx . set_paused ( false )
    launch_fx . set_reduced_motion ( reduced_motion )
    var socket = _next_launch_socket ( false )
    launch_fx . begin_prelaunch ( socket . rear , socket . forward )
func _cancel_launch_smoke ( ) -> void :
    if is_instance_valid ( launch_fx ) : launch_fx . cancel_prelaunch ( )
func _finish_launch_smoke ( ) -> void :
    if is_instance_valid ( launch_fx ) : launch_fx . finish_prelaunch ( )
func _fire_interceptor ( matched : Dictionary ) -> void :
    if phase != "playing" or paused or host_suspended or not _launch_target_valid ( matched ) : return
    launch_fx . set_paused ( false )
    launch_fx . set_reduced_motion ( reduced_motion )
    var body : Node3D = vehicle_templates [ "interceptor" ] . duplicate ( )
    body . visible = true
    body . scale = Vector3 . ONE * 1.4
    add_child ( body )
    _position_launcher ( )
    var socket = _next_launch_socket ( )
    var origin : Vector3 = socket . muzzle
    var direction : Vector3 = socket . forward
    body . position = origin
    body . look_at ( origin + direction )
    var trail = MeshInstance3D . new ( )
    trail . mesh = ImmediateMesh . new ( )
    var mat = ShaderMaterial . new ( ) ; mat . shader = load ( "res://shaders/trail.gdshader" ) ; mat . set_shader_parameter ( "trail_color" , CYAN )
    trail . material_override = mat
    add_child ( trail )
    var fx_id = launch_fx . launch ( origin , direction , socket . rear )
    var loft: float = airspace.interceptor_loft(origin, direction, matched.node.global_position)
    interceptors . append ( { "node" : body , "trail" : trail , "history" : [ ] , "from" : origin , "to" : matched . node . global_position , "launch_direction" : direction , "loft": loft, "t" : 0.0 , "enemy" : matched , "trail_clock" : 0.0 , "fx_id" : fx_id , "socket_id" : socket . id , "tail" : origin - direction * 2.1 } )
    matched["launched"]=true
    hud . flash_message ( "LOCK CONFIRMED · INTERCEPTOR AWAY" , true )
    _sfx ( "launch" )
    shake = maxf ( shake , 0.025 )
func _update_interceptors ( delta : float ) -> void :
    for shot in interceptors . duplicate ( ) :
        shot . t += delta / 1.15
        if is_instance_valid ( shot . enemy . node ) : shot . to = shot . enemy . node . global_position
        var t : float = minf ( 1.0 , shot . t )
        var old : Vector3 = shot . node . position
        shot.loft = airspace.interceptor_loft(shot.from, shot.launch_direction, shot.to, shot.loft)
        var pos: Vector3 = airspace.interceptor_position(shot.from, shot.launch_direction, shot.to, t, shot.loft)
        shot . node . position = pos
        var direction : Vector3 = ( pos - old ) . normalized ( ) if old . distance_to ( pos ) > 0.001 else shot . launch_direction
        shot . node . look_at ( pos + direction )
        var rear = pos - direction * 2.1
        launch_fx . update_rocket_rear ( shot . fx_id , rear , direction )
        if launcher_rack and not launcher_sockets . is_empty ( ) :
            var tube : Dictionary = launcher_sockets [ int ( shot . socket_id ) % launcher_sockets . size ( ) ]
            launch_fx . update_tube_socket ( shot . fx_id , launcher_rack . to_global ( _vector ( tube . rear ) ) , ( launcher_rack . global_basis * _vector ( tube . forward ) ) . normalized ( ) )
        Motion . advance_trail ( shot , shot . tail , rear , delta , 0.025 , 45 )
        shot . tail = rear
        _draw_trail ( shot . trail , Motion . visible_trail ( shot , rear ) , 0.36 )
        if shot . t >= 1.0 :
            launch_fx . release_rocket ( shot . fx_id )
            var enemy : Dictionary = shot . enemy
            _explosion ( shot . to , CYAN , 1.5 )
            _sfx ( "intercept" )
            if not fighter.is_empty() and enemy==fighter:
                score+=700;combo+=1;charge=mini(5,charge+2)
                session_words[enemy.word]=_fighter_gloss(str(enemy.word))
                hud.flash_message(_fighter_feedback("defeated", "2/2") + "  +700",true)
                _remove_fighter()
            elif missiles . has ( enemy ) :
                score += 120 + mini ( combo , 12 ) * 20
                combo += 1 ; catches += 1 ; wave_catches += 1 ; charge = mini ( 5 , charge + 1 )
                session_words [ enemy . word ] = enemy . meaning
                hud . flash_message ( enemy . word + "  ·  " + enemy . meaning + "  +" + str ( 120 + mini ( combo - 1 , 12 ) * 20 ) , true )
                _remove_missile ( enemy )
            shot . node . queue_free ( ) ; shot . trail . queue_free ( ) ; interceptors . erase ( shot )
            shake = maxf ( shake , 0.16 )
            _stats ( )
            if wave_catches >= _wave_goal() :
                for pending in missiles . duplicate ( ) :
                    if not pending . locked : _remove_missile ( pending )
    if wave_catches >= _wave_goal() and fighter.is_empty() and (wave<Fighter.FIRST_STAGE or fighter_spawned) and launcher_aim . pending_count ( ) == 0 and interceptors . is_empty ( ) and phase == "playing" :
        _clear_flight ( )
        phase = "wave_clear"
        city_damage . set_phase ( "wave_clear" )
        hud . show_wave_clear ( wave )
        if is_instance_valid(reload_crew):reload_crew.begin_stage_reload(wave,reduced_motion)
        if is_instance_valid(citizen_celebration):citizen_celebration.begin_stage(wave)
        _sfx("cheer")
        _sfx ( "success" )
func _impact ( m : Dictionary ) -> void :
    if phase != "playing" or not missiles . has ( m ) : return
    city_damage . set_reduced_motion ( reduced_motion )
    var outcome : Dictionary = city_damage . apply_impact ( str ( m . get ( "zone_id" , "" ) ) , int ( m . id ) )
    if not bool ( outcome . get ( "changed" , false ) ) : _explosion ( m . target , AMBER , 0.65 )
    _sfx ( "impact" )
    _remove_missile ( m )
    combo = 0
    shake = 0.38
    _stats ( )
    if bool ( outcome . get ( "changed" , false ) ) :
        hud . flash_message ( "CITY BLOCK HIT · REFOCUS ON THE NEXT WORD" , false )
    else :
        hud . flash_message ( "ALREADY DAMAGED · NO ADDITIONAL CITY LOSS" , true )
    if bool ( outcome . get ( "changed" , false ) ) and city_damage . is_defeated ( ) : _defeat ( )
func _defeat ( ) -> void :
    if phase == "over" : return
    phase = "over"
    city_damage . set_phase ( "over" )
    _sfx ( "defeat" )
    hud . show_defeat_animation ( )
    _clear_flight ( )
    var parts : Array = [ ]
    _gather_meshes ( landmark , parts )
    for part in parts :
        if ruins . size ( ) >= 150 : break
        var fragment = MeshInstance3D . new ( )
        fragment . mesh = part . mesh
        fragment . material_override = part . material_override
        for index in range ( part . mesh . get_surface_count ( ) ) :
            var source_material = part . get_active_material ( index )
            if source_material and prepared_materials . has ( source_material . resource_name ) : fragment . set_surface_override_material ( index , prepared_materials [ source_material . resource_name ] )
        add_child ( fragment )
        fragment . global_transform = part . global_transform
        ruins . append ( { "node" : fragment , "velocity" : Vector3 ( rng . randf_range ( -4 , 4 ) , rng . randf_range ( 1 , 7 ) , rng . randf_range ( -3 , 4 ) ) , "spin" : Vector3 ( rng . randf_range ( -1 , 1 ) , rng . randf_range ( -1 , 1 ) , rng . randf_range ( -1 , 1 ) ) , "age" : 0.0 } )
    landmark . visible = false
    for n in range ( 6 ) : _explosion ( Vector3 ( rng . randf_range ( -8 , 8 ) , rng . randf_range ( 3 , 15 ) , -14 ) , AMBER , 2.4 )
    shake = 0.7
    if reduced_motion :
        for ruin in ruins :
            ruin . node . position . y = maxf ( 0.1 , ruin . node . position . y * 0.07 )
            ruin . velocity = Vector3 . ZERO
            ruin . age = 3.0
    defeat_timer . start ( 0.15 if reduced_motion else 2.8 )
    print ( "MISSION_DEFEAT scene=" , selected_scene , " collapsed_parts=" , ruins . size ( ) )
func _show_defeat_result ( ) -> void :
    if phase == "over" : hud . show_defeat ( score , catches )
func _gather_meshes ( node : Node , results : Array ) -> void :
    if node . name == "BatchedRender" : return
    if node is MeshInstance3D and node . mesh != null : results . append ( node )
    for child in node . get_children ( ) : _gather_meshes ( child , results )
func _remove_missile ( m : Dictionary ) -> void :
    if city_damage : city_damage . release_target ( int ( m . id ) )
    for word in recent_target_words . keys ( ) :
        if float ( recent_target_words [ word ] ) < scene_time : recent_target_words . erase ( word )
    recent_target_words [ str ( m . word ) ] = scene_time + TARGET_SUBMIT_GRACE
    if is_instance_valid ( m . node ) : m . node . queue_free ( )
    if is_instance_valid ( m . trail ) : m . trail . queue_free ( )
    if is_instance_valid ( m . label ) : m . label . queue_free ( )
    if is_instance_valid ( m . leader ) : m . leader . queue_free ( )
    missiles . erase ( m )
func _clear_flight ( ) -> void :
    threat_alerts.reset()
    _remove_fighter()
    if audio_director:
        audio_director.cancel_effect("impact_alert")
        audio_director.cancel_effect("fighter_alert")
    launcher_aim . clear ( )
    if is_instance_valid(reload_crew):reload_crew.clear()
    if is_instance_valid(citizen_celebration):citizen_celebration.clear()
    if audio_director:audio_director.cancel_effect("cheer")
    if launch_fx : launch_fx . clear ( )
    for m in missiles . duplicate ( ) : _remove_missile ( m )
    for shot in interceptors :
        if is_instance_valid ( shot . node ) : shot . node . queue_free ( )
        if is_instance_valid ( shot . trail ) : shot . trail . queue_free ( )
    interceptors . clear ( )
func _exit_tree ( ) -> void :
    if is_instance_valid(launch_fx):launch_fx.clear()
    launcher_aim . clear ( )
    if is_instance_valid(reload_crew):reload_crew.clear()
    if is_instance_valid(citizen_celebration):citizen_celebration.clear()
    if audio_director:audio_director.cancel_effect("cheer")
func _pulse ( ) -> void :
    if phase != "playing" or paused or host_suspended or charge < 5 : return
    charge = 0 ; pulse_left = 5.0
    _explosion ( launcher . position + Vector3 ( 0 , 3 , 0 ) , CYAN , 5.0 )
    _sfx ( "pulse" )
    hud . flash_message ( "TIME FIELD · 5 SECONDS TO BREATHE" , true )
    _stats ( )
func _toggle_pause ( ) -> void :
    if phase != "playing" : return
    paused = not paused
    focus_pause_owned = false
    hud . set_paused ( paused or host_suspended )
func _stats ( ) -> void :
    var city : Dictionary = city_damage . stats ( ) if city_damage else { "damaged" : 0 , "total" : 20 , "percent" : 0 , "ratio" : 0.0 }
    shield = 5 - int ( ceil ( float ( city . ratio ) * 5.0 ) )
    if hud :
        hud . update_stats ( score , wave , wave_catches , 100 - int ( city . percent ) , combo , charge * 20 )
        if hud . has_method ( "set_city_damage" ) : hud . set_city_damage ( int ( city . damaged ) , int ( city . total ) )
func _draw_trail ( node : MeshInstance3D , points : Array , width : float ) -> void :
    var mesh : ImmediateMesh = node . mesh
    mesh . clear_surfaces ( )
    if points . size ( ) < 2 : return
    mesh . surface_begin ( Mesh . PRIMITIVE_TRIANGLE_STRIP )
    for i in range ( points . size ( ) ) :
        var alpha = 1.0 - float ( i ) / points . size ( )
        var tangent : Vector3 = points [ maxi ( 0 , i - 1 ) ] - points [ mini ( points . size ( ) - 1 , i + 1 ) ]
        var perpendicular : Vector3 = camera . global_basis . z . cross ( tangent ) . normalized ( )
        if perpendicular . length_squared ( ) < 0.01 : perpendicular = camera . global_basis . x
        var side = perpendicular * width * sqrt ( alpha )
        mesh . surface_set_color ( Color ( 1 , 1 , 1 , alpha * 0.75 ) )
        mesh . surface_set_uv ( Vector2 ( 0.0 , float ( i ) / points . size ( ) ) )
        mesh . surface_add_vertex ( points [ i ] - side )
        mesh . surface_set_uv ( Vector2 ( 1.0 , float ( i ) / points . size ( ) ) )
        mesh . surface_add_vertex ( points [ i ] + side )
    mesh . surface_end ( )
func _explosion ( at : Vector3 , color : Color , power : float ) -> void :
    var sphere = SphereMesh . new ( ) ; sphere . radius = 0.6 ; sphere . height = 1.2
    var core = MeshInstance3D . new ( ) ; core . mesh = sphere ; core . material_override = _emissive ( color . lightened ( 0.5 ) , 3.0 , true )
    add_child ( core ) ; core . position = at
    effects . append ( { "node" : core , "kind" : "core" , "age" : 0.0 , "life" : 0.6 , "power" : power } )
    var ring = MeshInstance3D . new ( ) ; var torus = TorusMesh . new ( ) ; torus . inner_radius = 0.92 ; torus . outer_radius = 1.0 ; torus . rings = 32 ; torus . ring_segments = 8
    ring . mesh = torus ; ring . material_override = _emissive ( color , 2.0 , true ) ; add_child ( ring ) ; ring . position = at
    ring . rotation . x = PI * 0.5
    effects . append ( { "node" : ring , "kind" : "ring" , "age" : 0.0 , "life" : 0.9 , "power" : power } )
    var flash = OmniLight3D . new ( ) ; flash . position = at ; flash . light_color = color ; flash . light_energy = 4.0 * power ; flash . omni_range = 12.0 * power ; add_child ( flash )
    effects . append ( { "node" : flash , "kind" : "light" , "age" : 0.0 , "life" : 0.35 , "power" : power } )
    for i in range ( 10 if reduced_motion else 19 ) :
        if effects . size ( ) > 220 : break
        var spark = MeshInstance3D . new ( ) ; var cube = BoxMesh . new ( ) ; cube . size = Vector3 ( 0.08 , 0.08 , 0.45 ) * rng . randf_range ( 0.6 , 1.8 )
        spark . mesh = cube ; spark . material_override = _emissive ( color , 2.0 , true ) ; add_child ( spark ) ; spark . position = at
        var velocity = Vector3 ( rng . randf_range ( -1 , 1 ) , rng . randf_range ( -0.2 , 1 ) , rng . randf_range ( -1 , 1 ) ) . normalized ( ) * rng . randf_range ( 3 , 10 ) * power
        effects . append ( { "node" : spark , "kind" : "spark" , "age" : 0.0 , "life" : rng . randf_range ( 0.45 , 1.2 ) , "velocity" : velocity , "power" : power } )
func _effects_update ( delta : float ) -> void :
    for e in effects . duplicate ( ) :
        e . age += delta
        var t : float = e . age / e . life
        if t >= 1.0 : e . node . queue_free ( ) ; effects . erase ( e ) ; continue
        match e . kind :
            "core" : e . node . scale = Vector3 . ONE * ( 0.2 + sin ( t * PI ) * e . power * 1.8 )
            "ring" : e . node . scale = Vector3 . ONE * ( 1.0 + t * e . power * 3.8 )
            "light" : e . node . light_energy = ( 1.0 - t ) * e . power * 4.0
            "spark" : e . node . position += e . velocity * delta ; e . velocity . y -= 6.0 * delta ; e . node . look_at ( e . node . position + e . velocity . normalized ( ) )
        if e . kind != "light" : e . node . material_override . albedo_color . a = ( 1.0 - t ) * 0.85
    for r in ruins :
        r . age += delta
        if r . age > 2.9 : continue
        r . velocity . y -= 13.0 * delta
        r . node . position += r . velocity * delta
        r . node . rotation += r . spin * delta
        if r . node . position . y < 0.15 : r . node . position . y = 0.15 ; r . velocity *= 0.3 ; r . spin *= 0.5
func _camera_update ( delta : float ) -> void :
    if not camera : return
    var compact = get_viewport ( ) . get_visible_rect ( ) . size . x < 680 or get_viewport ( ) . get_visible_rect ( ) . size . y < 500
    var offset = scene_camera_position - scene_camera_target
    camera . fov = scene_camera_fov + 8.0 if compact else scene_camera_fov
    camera_base = scene_camera_target + Basis ( Vector3 . UP , deg_to_rad ( camera_yaw ) ) * offset
    camera . position = camera_base
    if not reduced_motion and shake > 0.005 :
        camera . position += Motion . camera_offset ( elapsed , shake )
    shake = move_toward ( shake , 0.0 , delta * 1.0 )
    camera.look_at(LauncherGround.camera_target(scene_camera_target,selected_scene))
func _position_launcher ( ) -> void :
    if not hud or not launcher : return
    var field : Rect2 = hud . get_playfield_rect ( )
    var viewport = get_viewport ( ) . get_visible_rect ( ) . size
    var floor_pixel = hud . get_launcher_floor_pixel ( ) if hud . has_method ( "get_launcher_floor_pixel" ) else hud . _console . position . y - 12.0
    var key = str ( viewport ) + ":" + str ( floor_pixel ) + ":" + selected_scene
    if key == launcher_layout_key : return
    launcher_layout_key = key
    var shaken = camera . position
    camera . position = camera_base
    var clearance = hud . get_launcher_clearance_rect ( ) if hud . has_method ( "get_launcher_clearance_rect" ) else field
    LauncherGround . fit_scene ( camera , launcher , launcher_bounds , viewport , floor_pixel , field . size . y , clearance , selected_scene )
    camera . position = shaken
    launcher_home = launcher . position
    launch_apron . position = launcher . to_global ( Vector3 ( launcher_bounds . get_center ( ) . x , 0 , launcher_bounds . get_center ( ) . z ) )
    launch_apron . scale = Vector3 ( launcher_bounds . size . x / 6.0 * 1.04 * launcher . scale . x , 1.0 , launcher_bounds . size . z / 5.0 * 1.04 * launcher . scale . x )
    var pad : MeshInstance3D = launch_apron . get_child ( 0 )
    var thickness = 0.155 if selected_scene == "gwanghwamun" else 0.025
    pad . scale . y = thickness / 0.025
    pad . position . y = - thickness * 0.5
    launch_light . position = launcher_home + Vector3 ( 0 , 6 , 0 )
func _next_launch_socket ( consume : bool = true ) -> Dictionary :
    if launcher_sockets . is_empty ( ) :
        return { "id" : "fallback" , "muzzle" : launcher . to_global ( Vector3 ( 0 , 3 , -1 ) ) , "forward" : Vector3 ( 0 , 0.56 , -0.83 ) . normalized ( ) , "rear" : launcher . to_global ( Vector3 ( 0 , 2 , 1 ) ) }
    var socket : Dictionary = launcher_sockets [ launch_socket_index % launcher_sockets . size ( ) ]
    if consume : launch_socket_index += 1
    var frame : Node3D = launcher_rack if launcher_rack else launcher
    return { "id" : socket . id , "muzzle" : frame . to_global ( _vector ( socket . muzzle ) ) , "forward" : ( frame . global_basis * _vector ( socket . forward ) ) . normalized ( ) , "rear" : frame . to_global ( _vector ( socket . rear ) ) }
func _unhandled_input ( event : InputEvent ) -> void :
    if event is InputEventMouseMotion and Input . is_mouse_button_pressed ( MOUSE_BUTTON_RIGHT ) :
        camera_yaw = clampf ( camera_yaw - event . relative . x * 0.06 , -24 , 24 )
    if event is InputEventKey and event . pressed and not event . echo :
        if event . keycode == KEY_ESCAPE : _toggle_pause ( )
        if event . keycode == KEY_F8 : reduced_motion = not reduced_motion ; hud . set_reduced_motion ( reduced_motion ) ; hud . flash_message ( "REDUCED MOTION " + ( "ON" if reduced_motion else "OFF" ) , true )
        if event . keycode == KEY_F12 : _capture ( "manual" )
func _demo_update ( delta : float ) -> void :
    demo_time += delta
    if capture_end > 0.0 and demo_time >= capture_end and not capture_finishing :
        capture_finishing = true
        set_process ( false )
        audio_director . stop_all ( )
        var tree = get_tree ( )
        tree . create_timer ( 0.3 ) . timeout . connect ( tree . quit )
        queue_free ( )
        return
    if demo_time > 1.6 and phase == "briefing" : hud . _start_selected ( )
    if destruction_demo :
        if destruction_stage == 0 and demo_time > 3.0 :
            destruction_stage = 1 ; _accelerated_impact_test ( )
        elif destruction_stage == 1 and demo_time > 8.0 :
            destruction_stage = 2 ; _start ( "gwanghwamun" , "calm" )
        elif destruction_stage == 2 and demo_time > 11.0 :
            destruction_stage = 3 ; _accelerated_impact_test ( )
        elif destruction_stage == 3 and demo_time > 16.0 :
            destruction_stage = 4 ; _start ( "gwanghwamun" , "calm" )
    else :
        if demo_invalid_enabled and not demo_invalid_done and demo_time >= 3.8 and phase == "playing" :
            demo_invalid_done = true
            demo_keys = [ "d" , "h" , "x" , "k" , "ENTER" , "BACKSPACE" , "BACKSPACE" , "BACKSPACE" , "BACKSPACE" ]
            hud . answer_edit . grab_focus ( )
        if phase == "playing" and demo_time >= demo_next and demo_keys . is_empty ( ) and not missiles . is_empty ( ) :
            for m in missiles :
                if not m . locked :
                    demo_keys = _latin_keys ( m . word )
                    demo_keys . append ( "ENTER" )
                    hud . answer_edit . grab_focus ( )
                    break
            demo_next = demo_time + 3.8
        if not demo_keys . is_empty ( ) :
            demo_key_clock += delta
            if demo_key_clock >= 0.1 :
                demo_key_clock = 0.0
                var key : String = demo_keys . pop_front ( )
                var event = InputEventKey . new ( ) ; event . pressed = true
                if key == "ENTER" : event . keycode = KEY_ENTER ; event . physical_keycode = KEY_ENTER
                elif key == "BACKSPACE" : event . keycode = KEY_BACKSPACE ; event . physical_keycode = KEY_BACKSPACE
                else : event . keycode = key . to_upper ( ) . unicode_at ( 0 ) ; event . physical_keycode = event . keycode ; event . unicode = key . unicode_at ( 0 ) ; event . shift_pressed = key != key . to_lower ( )
                Input . parse_input_event ( event )
                var released = event . duplicate ( ) ; released . pressed = false ; Input . parse_input_event ( released )
        if phase == "wave_clear" : hud . _result_action ( )
        if demo_time > demo_switch and not demo_scene_switched :
            demo_scene_switched = true ; demo_keys . clear ( ) ; _start ( "gwanghwamun" , "adventure" ) ; demo_next = demo_time + 2.8
    if not capture_schedule . is_empty ( ) and demo_time >= capture_schedule [ 0 ] :
        capture_schedule . pop_front ( )
        _capture ( ( "destruction-" if destruction_demo else "demo-" ) + str ( snappedf ( demo_time , 0.1 ) ) )
func _accelerated_impact_test ( ) -> void :
    _clear_flight ( )
    hud . flash_message ( "DESTRUCTION / RESTORATION TEST" , false )
    for i in range ( 15 ) :
        _spawn_missile ( i % 4 )
        _impact ( missiles [ -1 ] )
    _spawn_missile ( 0 )
    missiles [ -1 ] . t = 0.78
    missiles [ -1 ] . duration = 5.0
func _latin_keys ( text : String ) -> Array :
    var leads = [ "r" , "R" , "s" , "e" , "E" , "f" , "a" , "q" , "Q" , "t" , "T" , "d" , "w" , "W" , "c" , "z" , "x" , "v" , "g" ]
    var vowels = [ "k" , "o" , "i" , "O" , "j" , "p" , "u" , "P" , "h" , "hk" , "ho" , "hl" , "y" , "n" , "nj" , "np" , "nl" , "b" , "m" , "ml" , "l" ]
    var tails = [ "" , "r" , "R" , "rt" , "s" , "sw" , "sg" , "e" , "f" , "fr" , "fa" , "fq" , "ft" , "fx" , "fv" , "fg" , "a" , "q" , "qt" , "t" , "T" , "d" , "w" , "c" , "z" , "x" , "v" , "g" ]
    var keys = ""
    for i in range ( text . length ( ) ) :
        var n = text . unicode_at ( i ) - 44032
        if n >= 0 and n < 11172 : keys += leads [ n / 588 ] + vowels [ ( n % 588 ) / 28 ] + tails [ n % 28 ]
        else : keys += text [ i ]
    var result : Array = [ ]
    for letter in keys : result . append ( letter )
    return result
func _capture ( tag : String ) -> void :
    for arg in OS . get_cmdline_user_args ( ) :
        if arg . begins_with ( "--qa-viewport=" ) : tag = "portrait-" + tag
    await RenderingServer . frame_post_draw
    var image = get_viewport ( ) . get_texture ( ) . get_image ( )
    var file = ProjectSettings . globalize_path ( "res://captures/" + tag + ".png" )
    var result = image . save_png ( file )
    print ( "CAPTURE " , file , " status=" , result , " fps=" , Engine . get_frames_per_second ( ) , " draws=" , Performance . get_monitor ( Performance . RENDER_TOTAL_DRAW_CALLS_IN_FRAME ) )
func _setup_audio ( ) -> void :
    audio_director = preload ( "res://scripts/defense_audio.gd" ) . new ( )
    add_child ( audio_director )
    audio_director . set_muted ( not game_sound )
    audio_director . set_music_enabled ( game_music )
func _sfx ( name : String ) -> void :
    if is_instance_valid ( audio_director ) : audio_director . play ( name )
func _set_sound_enabled ( enabled : bool ) -> void :
    game_sound = enabled
    if is_instance_valid ( audio_director ) : audio_director . set_muted ( not enabled )
    if hud : hud . set_sound_enabled ( enabled )
    if not applying_web_config : _notify_audio_state ( )
func _set_music_enabled ( enabled : bool ) -> void :
    game_music = enabled
    if is_instance_valid ( audio_director ) : audio_director . set_music_enabled ( enabled )
    if hud : hud . set_music_enabled ( enabled )
    if not applying_web_config : _notify_audio_state ( )
func _notify_audio_state ( ) -> void :
    if not OS . has_feature ( "web" ) : return
    var state = { "type" : "seoulkeys-defense-audio" , "soundEnabled" : game_sound , "musicEnabled" : game_music }
    JavaScriptBridge . eval ( "window.parent.postMessage(" + JSON . stringify ( state ) + ", location.origin);" )
func _update_audio ( ) -> void :
    if not is_instance_valid ( audio_director ) : return
    audio_director . set_phase ( phase )
    audio_director . set_paused ( paused or host_suspended )
    audio_director . update_combat ( missiles . size ( ) , 1.0 - city_damage . destruction_ratio ( ) , wave )
    var nearest = 0.0
    var pan = 0.0
    for missile in missiles :
        if missile . t > nearest :
            nearest = missile . t
            pan = clampf ( missile . node . global_position . x / 24.0 , -0.7 , 0.7 )
    audio_director . update_flight ( missiles . size ( ) , nearest , pan )
func _material ( color : Color , metal : float = 0.0 , rough : float = 0.6 ) -> StandardMaterial3D :
    var mat = StandardMaterial3D . new ( ) ; mat . albedo_color = color ; mat . metallic = metal ; mat . roughness = rough ; return mat
func _emissive ( color : Color , energy : float = 1.0 , transparent : bool = false ) -> StandardMaterial3D :
    var mat = _material ( color , 0.0 , 0.3 ) ; mat . emission_enabled = true ; mat . emission = color ; mat . emission_energy_multiplier = energy
    if transparent : mat . transparency = BaseMaterial3D . TRANSPARENCY_ALPHA ; mat . shading_mode = BaseMaterial3D . SHADING_MODE_UNSHADED ; mat . no_depth_test = false
    return mat
func _box ( parent : Node3D , at : Vector3 , size : Vector3 , material : Material ) -> MeshInstance3D :
    var node = MeshInstance3D . new ( ) ; var mesh = BoxMesh . new ( ) ; mesh . size = size ; node . mesh = mesh ; node . material_override = material ; parent . add_child ( node ) ; node . position = at ; return node
func _batch_static ( root_node : Node3D ) -> void :
    if root_node . has_meta ( "geometry_batched" ) : return
    root_node . set_meta ( "geometry_batched" , true )
    var parts : Array = [ ]
    _gather_meshes ( root_node , parts )
    var groups : Dictionary = { }
    var inverse = root_node . global_transform . affine_inverse ( )
    for part in parts :
        for index in range ( part . mesh . get_surface_count ( ) ) :
            var material = part . get_active_material ( index )
            if material == null : continue
            var key : String = material . resource_name
            if key . is_empty ( ) : key = str ( material . get_instance_id ( ) )
            if not groups . has ( key ) :
                var tool = SurfaceTool . new ( ) ; tool . begin ( Mesh . PRIMITIVE_TRIANGLES )
                if not prepared_materials . has ( key ) :
                    prepared_materials [ key ] = ART_DIRECTION . prepare_material ( material )
                groups [ key ] = { "tool" : tool , "material" : prepared_materials [ key ] }
            groups [ key ] . tool . append_from ( part . mesh , index , inverse * part . global_transform )
        part . visible = false
    var batch = Node3D . new ( ) ; batch . name = "BatchedRender" ; root_node . add_child ( batch )
    for key in groups :
        var mesh = groups [ key ] . tool . commit ( )
        var visual = MeshInstance3D . new ( ) ; visual . mesh = mesh ; visual . material_override = groups [ key ] . material ; batch . add_child ( visual )
func _setup_web_bridge ( ) -> void :
    if not OS . has_feature ( "web" ) : return
    JavaScriptBridge.eval("window.seoulDefenseBridge={latest:null,pending:[],backgroundPausePending:false};window.addEventListener('message',function(e){if(e.source!==window.parent||e.origin!==location.origin||!e.data||e.data.type!=='seoulkeys-defense-config')return;try{const s=JSON.stringify(e.data.payload);if(s.length<150000){const b=window.seoulDefenseBridge;b.latest=s;b.pending.push(s);if(b.pending.length>64)b.pending.shift();if(e.data.payload&&e.data.payload.backgroundSuspended===true)b.backgroundPausePending=true;}}catch(_){}});window.parent.postMessage({type:'seoulkeys-defense-ready'},location.origin);")
func _read_web_config ( ) -> void :
    var raw = JavaScriptBridge.eval("(function(){const b=window.seoulDefenseBridge;if(!b)return null;const q=b.pending.splice(0);if(b.backgroundPausePending){q.unshift(JSON.stringify({backgroundSuspended:true}));b.backgroundPausePending=false;}if(!q.length&&b.latest)q.push(b.latest);b.latest=null;return q.length?JSON.stringify(q):null;})()")
    if not raw is String: return
    var updates = JSON.parse_string(raw)
    if not updates is Array: return
    for item in updates:
        if not item is String: continue
        var config = JSON.parse_string(item)
        if config is Dictionary: _apply_web_config(config)
func _apply_web_config(config: Dictionary) -> void:
    applying_web_config = true
    if config.has("soundEnabled"): _set_sound_enabled(bool(config.soundEnabled))
    if config.has("musicEnabled"): _set_music_enabled(bool(config.musicEnabled))
    applying_web_config = false
    _notify_audio_state()
    _apply_host_suspension(config)
    var next_locale := str(config.get("locale", meaning_locale)).strip_edges()
    if next_locale.is_empty() or next_locale.length() > 20: next_locale = meaning_locale
    var locale_changed := next_locale != meaning_locale
    if locale_changed:
        meaning_locale = next_locale
        word_meanings.clear()
        fighter_meanings.clear()
        fighter_labels.clear()
        hud.set_language(meaning_locale)
    var candidate = config.get("words", [])
    var clean: Array = []
    var seen: Dictionary = {}
    if candidate is Array and candidate.size() > 0 and candidate.size() <= 300:
        for item in candidate:
            if not item is Dictionary: continue
            if not item.get("word", "") is String or not item.get("meaning", "") is String: continue
            var word: String = item.get("word", "").strip_edges()
            var meaning: String = item.get("meaning", "").strip_edges()
            if word.is_empty() or word.length() > 32 or meaning.length() > 240 or seen.has(word): continue
            seen[word] = true
            clean.append({"word": word, "meaning": meaning, "difficulty": clampi(int(item.get("difficulty", 1)), 1, 3)})
    var meanings_changed := locale_changed
    # The full host dictionary also covers active/session words outside the selected theme.
    var supplied_meanings = config.get("meanings", null)
    if supplied_meanings is Dictionary and supplied_meanings.size() <= 1000:
        var clean_meanings: Dictionary = {}
        for key in supplied_meanings:
            var value = supplied_meanings[key]
            if not key is String or not value is String: continue
            if key.is_empty() or key.length() > 32 or value.length() > 240: continue
            clean_meanings[key] = value.strip_edges()
        if clean_meanings != word_meanings:
            word_meanings = clean_meanings
            meanings_changed = true
    if not clean.is_empty() and clean != words:
        # Translation-only updates preserve the unplayed deck, its order, and game state.
        var previous_pool: Dictionary = {}
        var next_pool: Dictionary = {}
        for item in words: previous_pool[str(item.word)] = int(item.get("difficulty", 1))
        for item in clean: next_pool[str(item.word)] = int(item.difficulty)
        words = clean
        if previous_pool != next_pool:
            deck = clean.duplicate(true)
            deck.shuffle()
        meanings_changed = true
    # Always repopulate after a locale change, even if the words happen to be identical.
    if not clean.is_empty():
        for item in clean: word_meanings[str(item.word)] = str(item.meaning)
    var supplied_fighters = config.get("fighterMeanings", null)
    if supplied_fighters is Dictionary:
        var clean_fighters: Dictionary = {}
        for word in Fighter.HARD_WORDS:
            var value = supplied_fighters.get(word, "")
            if value is String and not value.strip_edges().is_empty() and value.length() <= 240:
                clean_fighters[word] = value.strip_edges()
        if clean_fighters != fighter_meanings:
            fighter_meanings = clean_fighters
            meanings_changed = true
    var supplied_labels = config.get("fighterLabels", null)
    if supplied_labels is Dictionary:
        for key in ["zeroHits", "oneHit", "defeated"]:
            var value = supplied_labels.get(key, "")
            if value is String and not value.strip_edges().is_empty() and value.length() <= 180:
                fighter_labels[key] = value.strip_edges()
    if meanings_changed: _refresh_localized_meanings()
func _apply_host_suspension(config: Dictionary) -> void:
    var was_dialog := host_dialog_suspended
    if config.get("dialogSuspended", null) is bool:
        host_dialog_suspended = config.dialogSuspended
    if config.get("backgroundSuspended", null) is bool:
        host_background_suspended = config.backgroundSuspended
    if host_background_suspended:
        # A real tab/background pause never resumes merely because focus returns.
        if not demo and phase == "playing": paused = true
        focus_pause_owned = false
    elif was_dialog and not host_dialog_suspended and focus_pause_owned:
        # Only undo a focus-induced pause, including blur before the host poll.
        # Explicit/native pause changes always revoke this temporary ownership.
        paused = false
        focus_pause_owned = false
    host_suspended = bool(config.get("suspended", host_suspended)) or host_dialog_suspended or host_background_suspended
    hud.set_paused(paused or host_suspended)
func _refresh_localized_meanings() -> void:
    for item in words: item.meaning = str(word_meanings.get(str(item.word), ""))
    for item in deck: item.meaning = str(word_meanings.get(str(item.word), ""))
    for missile in missiles:
        missile.meaning = str(word_meanings.get(str(missile.word), ""))
        if is_instance_valid(missile.label): _set_label_meaning(missile.label, str(missile.meaning))
        missile.layout.clear()
    _refresh_fighter_meaning()
    for word in session_words:
        session_words[word] = _fighter_gloss(str(word)) if Fighter.HARD_WORDS.has(word) else str(word_meanings.get(str(word), ""))
func _on_focus_lost ( ) -> void :
    if not demo and phase == "playing" :
        if not paused:
            paused = true
            focus_pause_owned = not host_background_suspended
        hud . set_paused ( true )

func _wave_profile() -> Dictionary:
    var compact: bool = get_viewport().get_visible_rect().size.x < 680
    return Progression.profile(wave,pace,compact)
func _wave_goal() -> int:
    return int(_wave_profile().wave_goal)
func _spawn_burst() -> void:
    var profile: Dictionary = _wave_profile()
    var room: int = maxi(0,_normal_threat_limit()-missiles.size())
    for index in range(mini(room,int(profile.burst))):
        _spawn_missile()
        if not missiles.is_empty():
            missiles[-1].duration += index*0.45
func _update_impact_warning(delta: float) -> void:
    if phase != "playing" or paused or host_suspended:return
    for threat in missiles:
        threat["nonthreatening"] = city_damage.is_zone_destroyed(str(threat.get("zone_id","")))
    if threat_alerts.advance(delta,missiles,pulse_left,true):
        _sfx("impact_alert")

func _advance_fighter(delta: float) -> void:
    if wave>=Fighter.FIRST_STAGE and not fighter_spawned and wave_age>=6.0:
        _spawn_fighter()
    if fighter.is_empty():return
    if fighter_motion.advance(delta) and not fighter.locked:
        # Keep the overall threat budget bounded while reserving real bomb releases.
        if missiles.size()<int(_wave_profile().max_threats):
            var before:=missiles.size()
            _spawn_missile()
            if missiles.size()>before:
                var bomb: Dictionary=missiles[-1]
                bomb.start=fighter_motion.drop_position()
                # A real belly release cannot teleport to a new sky origin.
                # Choose an unobstructed city approach from that exact mount.
                for attempt in range(city_damage.total_count()):
                    if airspace.clear_incoming(bomb.start,bomb.target):break
                    city_damage.release_target(int(bomb.id))
                    var replacement:Dictionary=city_damage.reserve_target(int(bomb.id))
                    if replacement.is_empty():break
                    bomb.target=replacement.target+Vector3(0,6.5,0)
                    bomb.zone_id=replacement.zone_id
                if not airspace.clear_incoming(bomb.start,bomb.target):
                    _remove_missile(bomb)
                    return
                bomb.node.position=bomb.start
                bomb.tail=bomb.start
                bomb.duration=maxf(8.5,float(_wave_profile().duration)*0.75)+maxi(0,str(bomb.word).length()-2)*1.4
                bomb["from_fighter"]=true
    fighter.t=0.35
func _spawn_fighter() -> void:
    if not fighter.is_empty() or fighter_spawned:return
    fighter_spawned=true
    var body: Node3D=load("res://assets/fictional_fighter.glb").instantiate()
    add_child(body)
    fighter_motion.configure(body,camera)
    var word: String=fighter_motion.word_for_stage(wave)
    var label:=_missile_label(word,_fighter_gloss(word))
    var leader:=Line2D.new()
    leader.width=1.5;leader.default_color=Color("ef786f");leader.antialiased=true
    label_layer.add_child(leader);label_layer.add_child(label)
    fighter={"kind":"fighter","node":body,"word":word,"meaning":_fighter_gloss(word),"hits":0,"locked":false,"launched":false,"label":label,"leader":leader,"layout":{},"t":0.35}
    _refresh_fighter_meaning()
    _sfx("fighter_alert")
    hud.flash_message(_fighter_feedback("zeroHits", "0/2"),false)
func _answer_fighter() -> void:
    if fighter.is_empty() or fighter.locked:return
    if int(fighter.hits)==0:
        fighter.hits=1;fighter_motion.hits=1
        _refresh_fighter_meaning()
        hud.clear_answer();typed=""
        hud.flash_message(_fighter_feedback("oneHit", "1/2"),true)
        _sfx("intercept")
    elif launcher_aim.enqueue(fighter):
        fighter.hits=2;fighter_motion.hits=2
        fighter.label.visible=false;fighter.leader.visible=false
        hud.clear_answer();typed=""
        hud.flash_message("2/2",true)
    else:
        hud.flash_message("발사 준비 중 · 입력을 유지하고 다시 시도하세요",true)
func _remove_fighter() -> void:
    fighter_motion.clear()
    if fighter.is_empty():return
    for key in ["node","label","leader"]:
        if is_instance_valid(fighter[key]):fighter[key].queue_free()
    fighter={}
func _project_fighter_bounds() -> Rect2:
    var node: Node3D=fighter.node
    var bounds:=Rect2(camera.unproject_position(node.global_position),Vector2.ZERO)
    for x in [-4.72,4.72]:
        for y in [-0.61,1.75]:
            for z in [-5.12,4.54]:bounds=bounds.expand(camera.unproject_position(node.to_global(Vector3(x,y,z))))
    return bounds

func _normal_threat_limit() -> int:
    # Reserve one of the bounded simultaneous slots for a real fighter bomb.
    return maxi(1,int(_wave_profile().max_threats)-(1 if not fighter.is_empty() else 0))
