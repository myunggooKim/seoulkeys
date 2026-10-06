extends Node
class_name DefenseAudio
const MUSIC_PATH : = "res://audio/seoul-defense-ace.mp3"
const COMBAT_PATH : = ""
const FLIGHT_PATH : = "res://audio/flight.ogg"
const EFFECT_FILES : = {
    "impact_alert" : "res://audio/impact-alert.res",
    "fighter_alert" : "res://audio/fighter-alert.res",
    "cheer" : "res://audio/citizen-cheer.res",
    "launch" : "res://audio/launch.wav" ,
    "intercept" : "res://audio/intercept.wav" ,
    "impact" : "res://audio/impact.wav" ,
    "pulse" : "res://audio/pulse.wav" ,
    "success" : "res://audio/success.wav" ,
    "warning" : "res://audio/warning.ogg" ,
    "invalid" : "res://audio/invalid.ogg" ,
    "defeat" : "res://audio/defeat.ogg" ,
}
const EFFECT_LEVELS : = {
    "impact_alert" : -6.0,
    "fighter_alert" : -8.0,
    "cheer" : -7.0,
    "launch" : -5.0 , "intercept" : -4.0 , "impact" : -2.0 ,
    "pulse" : -6.0 , "success" : -7.0 , "warning" : -11.0 , "invalid" : -8.0 , "defeat" : -3.0 ,
}
const PHASE_LEVELS : = { "menu" : -12.0 , "playing" : 0.0 , "wave_clear" : -7.0 , "over" : -14.0 }
const MAX_VOICES : = 14
var _web_samples : = OS . has_feature ( "web" )
var music : AudioStreamPlayer
var combat : AudioStreamPlayer
var flight : AudioStreamPlayer
var voices : Array [ AudioStreamPlayer ] = [ ]
var muted : = false
var music_enabled : = true
var paused : = false
var music_started : = false
var phase : = "menu"
var combat_intensity : = 0.0
var music_volume_db : = -4.0
var effects_volume_db : = -1.5
var _setup_done : = false
var _music_bus : = ""
var _sfx_bus : = ""
var _mix_bus : = ""
var _flight_bus : = ""
var _bus_names : Array [ String ] = [ ]
var _streams : Dictionary = { }
var _flight_pan : AudioEffectPanner
var _target_flight_db : = -65.0
var _target_flight_pitch : = 0.86
var _intensity_smoothed : = 0.0
var _duck : = 0.0
var _duck_hold : = 0.0
var _voice_serial : = 0
var _clock : = 0.0
var _last_effect : Dictionary = { }
func _ready ( ) -> void :
    process_mode = Node . PROCESS_MODE_ALWAYS
    setup ( )
func setup ( new_music_volume_db : float = -4.0 , new_effects_volume_db : float = -1.5 ) -> void :
    music_volume_db = clampf ( new_music_volume_db , -60.0 , 3.0 )
    effects_volume_db = clampf ( new_effects_volume_db , -60.0 , 3.0 )
    if _setup_done :
        AudioServer . set_bus_volume_db ( AudioServer . get_bus_index ( _sfx_bus ) , effects_volume_db )
        _apply_mute_state ( )
        return
    _setup_done = true
    var prefix : = "Defense_%s_" % get_instance_id ( )
    _mix_bus = _add_bus ( prefix + "Mix" , "Master" )
    _music_bus = _add_bus ( prefix + "Music" , _mix_bus )
    _sfx_bus = _add_bus ( prefix + "Effects" , _mix_bus )
    _flight_bus = _add_bus ( prefix + "Flight" , _sfx_bus )
    var limiter : = AudioEffectLimiter . new ( )
    limiter . threshold_db = -1.5
    limiter . ceiling_db = -0.7
    AudioServer . add_bus_effect ( AudioServer . get_bus_index ( _mix_bus ) , limiter )
    _flight_pan = AudioEffectPanner . new ( )
    AudioServer . add_bus_effect ( AudioServer . get_bus_index ( _flight_bus ) , _flight_pan )
    AudioServer . set_bus_volume_db ( AudioServer . get_bus_index ( _sfx_bus ) , effects_volume_db )
    _apply_mute_state ( )
    music = _new_player ( "Score" , _music_bus , _load_loop ( MUSIC_PATH ) )
    combat = _new_player ( "CombatStem" , _music_bus , _load_loop ( COMBAT_PATH ) )
    flight = _new_player ( "MissileFlight" , _flight_bus , _load_loop ( FLIGHT_PATH ) )
    music . volume_db = -60.0
    combat . volume_db = -60.0
    flight . volume_db = -65.0
    for effect_name : String in EFFECT_FILES :
        _streams [ effect_name ] = load ( EFFECT_FILES [ effect_name ] )
    for index in MAX_VOICES :
        var player : = _new_player ( "Effect%02d" % index , _sfx_bus , null )
        player . set_meta ( "serial" , -1 )
        voices . append ( player )
    if _web_samples :
        JavaScriptBridge . eval ( "window.seoulDefenseSampleAudio.configure(%s, %s, '%s')" % [ AudioServer . get_bus_index ( _mix_bus ) , AudioServer . get_bus_index ( _flight_bus ) , music . stream . get_instance_id ( ) ] )
func _add_bus ( bus_name : String , send_to : String ) -> String :
    AudioServer . set_bus_count ( AudioServer . bus_count + 1 )
    var index : = AudioServer . bus_count - 1
    AudioServer . set_bus_name ( index , bus_name )
    AudioServer . set_bus_send ( index , send_to )
    _bus_names . append ( bus_name )
    return bus_name
func _new_player ( player_name : String , bus_name : String , stream : AudioStream ) -> AudioStreamPlayer :
    var player : = AudioStreamPlayer . new ( )
    player . name = player_name
    player . bus = bus_name
    player . stream = stream
    player . playback_type = AudioServer . PLAYBACK_TYPE_SAMPLE if _web_samples else AudioServer . PLAYBACK_TYPE_STREAM
    add_child ( player )
    return player
func _load_loop ( path : String ) -> AudioStream :
    if path . is_empty ( ) :
        return null
    var stream : = load ( path ) . duplicate ( ) as AudioStream
    if stream is AudioStreamOggVorbis :
        stream . loop = true
        stream . loop_offset = 0.0
    elif stream is AudioStreamMP3 :
        stream . loop = true
        stream . loop_offset = 0.0
    return stream
func start_music ( new_phase : String = "playing" , restart : bool = false ) -> void :
    if not _setup_done :
        setup ( )
    set_phase ( new_phase )
    if music_started and not restart :
        return
    music . volume_db = music_volume_db - 18.0
    combat . volume_db = -60.0
    music . play ( 0.0 )
    if combat . stream != null :
        combat . play ( 0.0 )
    music_started = true
    if paused :
        music . stream_paused = true
        if combat . stream != null :
            combat . stream_paused = true
    _apply_mute_state ( )
func set_phase ( new_phase : String ) -> void :
    phase = new_phase if PHASE_LEVELS . has ( new_phase ) else "menu"
    if phase != "playing" :
        cancel_effect ( "invalid" )
        update_flight ( 0 )
func set_combat_intensity ( value : float ) -> void :
    combat_intensity = clampf ( value , 0.0 , 1.0 )
func update_combat ( active_threats : int , shield_ratio : float = 1.0 , wave : int = 1 ) -> void :
    set_combat_intensity ( float ( active_threats ) * 0.11 + ( 1.0 - clampf ( shield_ratio , 0.0 , 1.0 ) ) * 0.32 + minf ( float ( wave - 1 ) , 6.0 ) * 0.026 )
func update_flight ( active_count : int , proximity : float = 0.0 , pan : float = 0.0 ) -> void :
    if paused or not _setup_done :
        return
    if active_count <= 0 or phase != "playing" :
        _target_flight_db = -65.0
        return
    proximity = clampf ( proximity , 0.0 , 1.0 )
    _target_flight_db = -31.0 + proximity * 11.0 + minf ( float ( active_count - 1 ) , 3.0 ) * 1.25
    _target_flight_pitch = 0.82 + proximity * 0.34
    _flight_pan . pan = clampf ( pan , -0.7 , 0.7 )
    if _web_samples :
        JavaScriptBridge . eval ( "window.seoulDefenseSampleAudio.setFlightPan(%s)" % _flight_pan . pan )
    if not flight . playing :
        flight . play ( )
        if paused :
            flight . stream_paused = true
func play ( effect_name : String , volume_offset_db : float = 0.0 ) -> void :
    if not _setup_done :
        setup ( )
    if muted or paused or not _streams . has ( effect_name ) :
        return
    var minimum_gap : = 0.85 if effect_name == "impact_alert" else 1.6 if effect_name == "warning" else 0.3 if effect_name == "invalid" else 0.065
    if effect_name == "invalid" :
        for candidate in voices :
            if candidate . playing and str ( candidate . get_meta ( "effect" , "" ) ) == "invalid" :
                return
    if _clock - float ( _last_effect . get ( effect_name , -100.0 ) ) < minimum_gap :
        return
    _last_effect [ effect_name ] = _clock
    var voice : AudioStreamPlayer = null
    for candidate in voices :
        if not candidate . playing :
            voice = candidate
            break
    if voice == null :
        voice = voices [ 0 ]
        for candidate in voices :
            if int ( candidate . get_meta ( "serial" ) ) < int ( voice . get_meta ( "serial" ) ) :
                voice = candidate
        voice . stop ( )
    _voice_serial += 1
    voice . set_meta ( "serial" , _voice_serial )
    voice . set_meta ( "effect" , effect_name )
    voice . stream = _streams [ effect_name ]
    voice . volume_db = float ( EFFECT_LEVELS . get ( effect_name , -6.0 ) ) + clampf ( volume_offset_db , -24.0 , 3.0 )
    voice . pitch_scale = randf_range ( 0.97 , 1.035 ) if effect_name in [ "launch" , "intercept" , "impact" ] else 1.0
    voice . play ( )
    _duck = maxf ( _duck , 4.5 if effect_name in [ "impact" , "defeat" , "pulse" ] else 2.6 )
    _duck_hold = maxf ( _duck_hold , 0.42 if effect_name in [ "impact" , "defeat" ] else 0.16 )
    music . volume_db = minf ( music . volume_db , music_volume_db + float ( PHASE_LEVELS [ phase ] ) - _duck )
func cancel_effect ( effect_name : String ) -> void :
    _last_effect . erase ( effect_name )
    if not _setup_done :
        return
    for voice in voices :
        if str ( voice . get_meta ( "effect" , "" ) ) == effect_name :
            voice . stop ( )
func set_paused ( value : bool ) -> void :
    if paused == value :
        return
    paused = value
    if paused :
        cancel_effect ( "invalid" )
    if not _setup_done :
        return
    for player in _all_players ( ) :
        player . stream_paused = paused
func set_muted ( value : bool ) -> void :
    muted = value
    if not _setup_done :
        return
    _apply_mute_state ( )
    if muted :
        for player in voices :
            player . stop ( )
        _duck = 0.0
        _duck_hold = 0.0
func set_music_enabled ( enabled : bool ) -> void :
    music_enabled = enabled
    if not _setup_done :
        return
    _apply_mute_state ( )
func _apply_mute_state ( ) -> void :
    AudioServer . set_bus_mute ( AudioServer . get_bus_index ( _mix_bus ) , muted )
    AudioServer . set_bus_mute ( AudioServer . get_bus_index ( _music_bus ) , not music_enabled )
func stop_all ( ) -> void :
    if not _setup_done :
        return
    for player in _all_players ( ) :
        player . stop ( )
    music_started = false
    _target_flight_db = -65.0
    _duck = 0.0
    _duck_hold = 0.0
    _last_effect . clear ( )
func _all_players ( ) -> Array [ AudioStreamPlayer ] :
    var players : Array [ AudioStreamPlayer ] = [ music , combat , flight ]
    players . append_array ( voices )
    return players
func _process ( delta : float ) -> void :
    if not _setup_done or paused :
        return
    _clock += delta
    _duck_hold = maxf ( 0.0 , _duck_hold - delta )
    if _duck_hold <= 0.0 :
        _duck = move_toward ( _duck , 0.0 , delta * 5.0 )
    var target_intensity : = combat_intensity if phase == "playing" else 0.0
    _intensity_smoothed = move_toward ( _intensity_smoothed , target_intensity , delta * 0.4 )
    var score_target : = music_volume_db + float ( PHASE_LEVELS [ phase ] ) - _duck
    music . volume_db = move_toward ( music . volume_db , score_target , delta * 18.0 )
    var combat_target : = -60.0
    if _intensity_smoothed > 0.1 :
        combat_target = music_volume_db - 17.0 + _intensity_smoothed * 14.0 - _duck
    combat . volume_db = move_toward ( combat . volume_db , combat_target , delta * 22.0 )
    flight . volume_db = move_toward ( flight . volume_db , _target_flight_db , delta * ( 60.0 if _target_flight_db > flight . volume_db else 28.0 ) )
    flight . pitch_scale = move_toward ( flight . pitch_scale , _target_flight_pitch , delta * 0.3 )
    if _target_flight_db <= -65.0 and flight . volume_db <= -64.5 and flight . playing :
        flight . stop ( )
func _exit_tree ( ) -> void :
    if not _setup_done :
        return
    stop_all ( )
    if _web_samples :
        JavaScriptBridge . eval ( "window.seoulDefenseSampleAudio.release()" )
    for index in range ( _bus_names . size ( ) - 1 , -1 , -1 ) :
        var bus_index : = AudioServer . get_bus_index ( _bus_names [ index ] )
        if bus_index > 0 :
            AudioServer . remove_bus ( bus_index )
