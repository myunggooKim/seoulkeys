class_name DefenseHUD
extends CanvasLayer
signal start_requested ( scene : String , pace : String )
signal scene_selected ( scene : String )
signal answer_submitted ( text : String )
signal answer_changed ( text : String )
signal pulse_requested
signal pause_requested
signal wave_continue_requested
signal reduced_motion_changed ( enabled : bool )
signal sound_changed ( enabled : bool )
signal music_changed ( enabled : bool )
const Composer = preload ( "res://scripts/hangul_composer.gd" )
const LOCAL_FONT = preload ( "res://fonts/SeoulSansKR.otf" )
const INK : = Color ( "0d1422" )
const PANEL : = Color ( 0.051 , 0.078 , 0.129 , 0.96 )
const LINE : = Color ( "2c3a4e" )
const WHITE : = Color ( "f4f7fc" )
const MUTED : = Color ( "aab8cc" )
const CYAN : = Color ( "78a9ff" )
const AMBER : = Color ( "ffb785" )
const RED : = Color ( "ff8995" )
var reduced_motion : bool = false
var sound_enabled : bool = true
var music_enabled : bool = true
var _music_buttons : Array [ Button ] = [ ]
var _sound_buttons : Array [ Button ] = [ ]
var _narrow : bool = false
var _short : bool = false
var _result_actions : BoxContainer
var _layout_pending : bool = false
var _header_body : Control
var _telemetry_status : PanelContainer
var _telemetry_status_body : HBoxContainer
var _identity : VBoxContainer
var _header_stats : Array [ VBoxContainer ] = [ ]
var _shield_caption : Label
var _damage_rule_label : Label
var _city_damaged : int = 0
var _city_total : int = 20
var _result_score : int = 0
var _result_words : int = 0
var _console_top : HBoxContainer
var _console_title : Label
var _console_hint : Label
var _console_feedback : VBoxContainer
var _command : BoxContainer
var _actions : HBoxContainer
var _fire_button : Button
var _pulse_box : VBoxContainer
var _motion_button : Button
var _motion_pause_button : Button
var _brief_scroll : ScrollContainer
var _brief_box : VBoxContainer
var _brief_title : Label
var _brief_body : Label
var _brief_hint : Label
var _brief_paces : BoxContainer
var _result_scroll : ScrollContainer
var _result_box : VBoxContainer
var _keyboard_heading : HBoxContainer
var _keyboard_shift_hint : Label
var _keyboard_rows : Array [ HBoxContainer ] = [ ]
var _keyboard_keys : Array [ Dictionary ] = [ ]
var language : String = "en"
var answer_edit : LineEdit
var _root : Control
var _header : PanelContainer
var _console : PanelContainer
var _briefing : PanelContainer
var _result : PanelContainer
var _pause_card : PanelContainer
var _keyboard : PanelContainer
var _targets_panel : PanelContainer
var _target_rows : Array [ Dictionary ] = [ ]
var _labels : Array [ Dictionary ] = [ ]
var _score_label : Label
var _wave_label : Label
var _shield_label : Label
var _combo_label : Label
var _sector_label : Label
var _status_label : Label
var _feedback_label : Label
var _pulse_button : Button
var _pause_button : Button
var _keyboard_button : Button
var _language_button : Button
var _start_button : Button
var _scene_buttons : Dictionary = { }
var _pace_buttons : Dictionary = { }
var _result_title : Label
var _result_kicker : Label
var _result_body : Label
var _result_button : Button
var _shield_bar : ProgressBar
var _charge_bar : ProgressBar
var _selected_scene : String = "namsan"
var _selected_pace : String = "calm"
var _screen : String = "briefing"
var _started : bool = false
var _paused : bool = false
var _last_was_composer : bool = false
var _feedback_timer : float = 0.0
var _current_charge : int = 0
var _last_wave : int = 1
var _last_kills : int = 0
var _ready_built : bool = false
var _native_composing : bool = false
var _ime_commit_pending : bool = false
var _ime_pointer_commit : bool = false
var _ime_key_released : bool = false
var _enter_down : bool = false
var _enter_blocked : bool = false
var _wave_enter_armed : bool = false
var _wave_continuing : bool = false
var _wave_release_required : bool = false
var _wave_wait_native_release : bool = false
var _wave_replay_floor : int = 0
var _last_web_intent_id : int = 0
var _play_web_epoch : bool = false
var _play_replay_floor : int = 0
var _web_composing : bool = false
var _window_input_active : bool = true
var _web_ime_guard : JavaScriptObject
var _web_ime_callback : JavaScriptObject
var _commit_generation : int = 0
var _text_revision : int = 0
var _ime_base_generation : int = 0
var _ime_base_revision : int = 0
var _ime_base_text : String = ""
var _ime_delivery_pending : bool = false
var _ime_cancelled : bool = false
var _pending_submit : bool = false
var _submit_requires_commit : bool = false
var _submit_has_expected : bool = false
var _submit_expected_text : String = ""
var _submit_snapshot : String = ""
var _submit_stable_frames : int = 0
func _ready ( ) -> void :
    layer = 20
    process_mode = Node . PROCESS_MODE_ALWAYS
    _root = Control . new ( )
    _root . name = "DefenseInterface"
    _root . set_anchors_and_offsets_preset ( Control . PRESET_FULL_RECT )
    _root . mouse_filter = Control . MOUSE_FILTER_IGNORE
    var theme : = Theme . new ( )
    theme . default_font = LOCAL_FONT
    theme . default_font_size = 14
    theme . set_color ( "font_color" , "Label" , WHITE )
    theme . set_color ( "font_color" , "Button" , WHITE )
    theme . set_color ( "font_hover_color" , "Button" , WHITE )
    theme . set_color ( "font_pressed_color" , "Button" , CYAN )
    theme . set_color ( "font_disabled_color" , "Button" , Color ( "6d7d94" ) )
    theme . set_stylebox ( "normal" , "Button" , _style ( Color ( "1b293d" ) , LINE , 10 , 14 , 9 ) )
    theme . set_stylebox ( "hover" , "Button" , _style ( Color ( "293b54" ) , CYAN , 10 , 14 , 9 ) )
    theme . set_stylebox ( "pressed" , "Button" , _style ( Color ( "243c61" ) , CYAN , 10 , 14 , 9 ) )
    theme . set_stylebox ( "disabled" , "Button" , _style ( Color ( "131e2e" ) , Color ( "27354a" ) , 10 , 14 , 9 ) )
    theme . set_stylebox ( "focus" , "Button" , _style ( Color ( 0 , 0 , 0 , 0 ) , CYAN , 10 , 14 , 9 ) )
    _root . theme = theme
    add_child ( _root )
    _build_header ( )
    _build_targets ( )
    _build_console ( )
    _build_briefing ( )
    _build_result ( )
    _build_pause ( )
    _build_keyboard ( )
    _ready_built = true
    if OS . has_feature ( "web" ) :
        _web_ime_guard = JavaScriptBridge . get_interface ( "seoulDefenseIMEGuard" )
        if _web_ime_guard != null :
            _web_ime_callback = JavaScriptBridge . create_callback ( _on_web_ime_event )
            _web_ime_guard . setCompositionObserver ( _web_ime_callback )
    get_window ( ) . focus_exited . connect ( _on_window_focus_lost )
    get_window ( ) . focus_entered . connect ( _on_window_focus_returned )
    answer_edit . focus_exited . connect ( _reset_enter_latch )
    _root . resized . connect ( _queue_layout )
    for panel : PanelContainer in [ _briefing , _result , _targets_panel , _console , _pause_card ] :
        panel . minimum_size_changed . connect ( _queue_layout )
    _layout ( )
    update_stats ( 0 , 1 , 0 , 100 , 0 , 0 )
    show_briefing ( _selected_scene )
func _style ( fill : Color , border : Color = LINE , radius : int = 12 , horizontal : int = 18 , vertical : int = 14 ) -> StyleBoxFlat :
    var box : = StyleBoxFlat . new ( )
    box . bg_color = fill
    box . border_color = border
    box . set_border_width_all ( 1 )
    box . set_corner_radius_all ( radius )
    box . content_margin_left = horizontal
    box . content_margin_right = horizontal
    box . content_margin_top = vertical
    box . content_margin_bottom = vertical
    return box
func _panel ( parent : Node , panel_name : String ) -> PanelContainer :
    var panel : = PanelContainer . new ( )
    panel . name = panel_name
    var surface : = _style ( PANEL )
    surface . shadow_color = Color ( 0.0 , 0.0 , 0.0 , 0.16 )
    surface . shadow_size = 12
    surface . shadow_offset = Vector2 ( 0 , 4 )
    panel . add_theme_stylebox_override ( "panel" , surface )
    parent . add_child ( panel )
    return panel
func _label ( parent : Node , text : String , font_size : int = 14 , color : Color = WHITE ) -> Label :
    var node : = Label . new ( )
    node . text = text
    node . add_theme_font_size_override ( "font_size" , font_size )
    node . add_theme_color_override ( "font_color" , color )
    node . mouse_filter = Control . MOUSE_FILTER_IGNORE
    parent . add_child ( node )
    return node
func _localized ( node : Control , english : String , korean : String ) -> void :
    _labels . append ( { "node" : node , "en" : english , "ko" : korean } )
    node . set ( "text" , korean if language == "ko" else english )
func _text ( english : String , korean : String ) -> String :
    return korean if language == "ko" else english
func _button ( parent : Node , text : String , callback : Callable ) -> Button :
    var button : = Button . new ( )
    button . text = text
    button . focus_mode = Control . FOCUS_ALL
    button . mouse_default_cursor_shape = Control . CURSOR_POINTING_HAND
    button . pressed . connect ( callback )
    parent . add_child ( button )
    return button
func _vbox ( parent : Node , spacing : int = 8 ) -> VBoxContainer :
    var box : = VBoxContainer . new ( )
    box . add_theme_constant_override ( "separation" , spacing )
    parent . add_child ( box )
    return box
func _hbox ( parent : Node , spacing : int = 12 ) -> HBoxContainer :
    var box : = HBoxContainer . new ( )
    box . add_theme_constant_override ( "separation" , spacing )
    parent . add_child ( box )
    return box
func _spacer ( parent : Node ) -> Control :
    var space : = Control . new ( )
    space . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    space . mouse_filter = Control . MOUSE_FILTER_IGNORE
    parent . add_child ( space )
    return space
func _bar ( parent : Node , color : Color ) -> ProgressBar :
    var bar : = ProgressBar . new ( )
    bar . show_percentage = false
    bar . custom_minimum_size = Vector2 ( 0 , 4 )
    bar . add_theme_stylebox_override ( "background" , _style ( Color ( "28374b" ) , Color ( "28374b" ) , 2 , 0 , 0 ) )
    bar . add_theme_stylebox_override ( "fill" , _style ( color , color , 2 , 0 , 0 ) )
    parent . add_child ( bar )
    return bar
func _build_header ( ) -> void :
    _header = _panel ( _root , "TopTelemetry" )
    _header_body = Control . new ( )
    _header . add_child ( _header_body )
    _identity = _vbox ( _header_body , 0 )
    _label ( _identity , "SEOUL / 서울" , 21 )
    _sector_label = _label ( _identity , "NAMSAN DEFENSE · 남산" , 14 , CYAN )
    _sector_label . text_overrun_behavior = TextServer . OVERRUN_TRIM_ELLIPSIS
    var shield : = _vbox ( _header_body , 1 )
    _shield_caption = _label ( shield , "" , 14 , MUTED )
    _localized ( _shield_caption , "CITY DAMAGE · 0/20" , "도시 피해 · 0/20" )
    _shield_label = _label ( shield , "0%" , 21 )
    _shield_bar = _bar ( shield , CYAN )
    var wave : = _vbox ( _header_body , 1 )
    _localized ( _label ( wave , "" , 14 , MUTED ) , "Stage" , "단계" )
    _wave_label = _label ( wave , "01" , 18 )
    var score : = _vbox ( _header_body , 1 )
    _localized ( _label ( score , "" , 14 , MUTED ) , "Score" , "점수" )
    _score_label = _label ( score , "00000" , 18 )
    var combo : = _vbox ( _header_body , 1 )
    _localized ( _label ( combo , "" , 14 , MUTED ) , "CHAIN" , "연속" )
    _combo_label = _label ( combo , "0×" , 21 , CYAN )
    _header_stats = [ shield , wave , score , combo ]
    _identity . hide ( )
    combo . hide ( )
    _telemetry_status = _panel ( _root , "WaveScoreTelemetry" )
    _telemetry_status_body = _hbox ( _telemetry_status , 12 )
    wave . reparent ( _telemetry_status_body )
    score . reparent ( _telemetry_status_body )
    wave . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    score . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _pause_button = _button ( _root , "II" , func ( ) -> void : pause_requested . emit ( ) )
    _pause_button . tooltip_text = "Pause / Resume · Esc"
    _pause_button . custom_minimum_size = Vector2 ( 44 , 44 )
func _build_targets ( ) -> void :
    _targets_panel = _panel ( _root , "ThreatQueue" )
    var list : = _vbox ( _targets_panel , 9 )
    var heading : = _hbox ( list )
    _localized ( _label ( heading , "" , 10 , AMBER ) , "INBOUND / 접근 중" , "접근 중인 미사일" )
    _spacer ( heading )
    _label ( heading , "LIVE" , 10 , MUTED )
    for index : int in range ( 3 ) :
        var row : = _vbox ( list , 0 )
        var line : = _hbox ( row , 8 )
        var dot : = _label ( line , "●" , 10 , AMBER )
        var word : = _label ( line , "" , 21 )
        _spacer ( line )
        var danger : = _label ( line , "" , 10 , AMBER )
        var meaning : = _label ( row , "" , 14 , MUTED )
        _target_rows . append ( { "row" : row , "word" : word , "meaning" : meaning , "danger" : danger , "dot" : dot } )
        row . hide ( )
    _status_label = _label ( list , "AIRSPACE CLEAR" , 12 , CYAN )
func _build_console ( ) -> void :
    _console = _panel ( _root , "CommandConsole" )
    _console . add_theme_stylebox_override ( "panel" , _style ( Color ( 0.051 , 0.078 , 0.129 , 0.98 ) , LINE , 10 , 20 , 12 ) )
    var box : = _vbox ( _console , 6 )
    _console_top = _hbox ( box , 8 )
    _console_title = _label ( _console_top , "" , 14 , CYAN )
    _localized ( _console_title , "INTERCEPT COMMAND" , "요격 명령" )
    _console_feedback = _vbox ( _console_top , 1 )
    _console_feedback . custom_minimum_size . x = 130
    _console_feedback . size_flags_vertical = Control . SIZE_SHRINK_CENTER
    _feedback_label = _label ( _console_top , "" , 16 , MUTED )
    _feedback_label . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _feedback_label . text_overrun_behavior = TextServer . OVERRUN_TRIM_ELLIPSIS
    _keyboard_button = _button ( _console_top , "KEYS" , _toggle_keyboard )
    _keyboard_button . add_theme_font_size_override ( "font_size" , 14 )
    _keyboard_button . toggle_mode = true
    _keyboard_button . tooltip_text = "Show Korean two-set keyboard · F1"
    _language_button = _button ( _console_top , "EN / 한" , func ( ) -> void : set_language ( "ko" if language == "en" else "en" ) )
    _language_button . add_theme_font_size_override ( "font_size" , 14 )
    _motion_button = _button ( _console_top , "REDUCE FX" , _toggle_reduced_motion )
    _motion_button . add_theme_font_size_override ( "font_size" , 14 )
    _motion_button . tooltip_text = "Reduce camera shake and motion"
    _command = BoxContainer . new ( )
    _command . add_theme_constant_override ( "separation" , 12 )
    box . add_child ( _command )
    answer_edit = LineEdit . new ( )
    answer_edit . name = "HangulCommandInput"
    answer_edit . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    answer_edit . custom_minimum_size = Vector2 ( 84 , 44 )
    answer_edit . max_length = 32
    answer_edit . add_theme_font_size_override ( "font_size" , 21 )
    answer_edit . add_theme_color_override ( "font_color" , WHITE )
    answer_edit . add_theme_color_override ( "font_placeholder_color" , MUTED )
    answer_edit . add_theme_color_override ( "caret_color" , CYAN )
    answer_edit . add_theme_color_override ( "selection_color" , Color ( "294d7b" ) )
    answer_edit . add_theme_stylebox_override ( "normal" , _style ( Color ( "162337" ) , LINE , 10 , 14 , 7 ) )
    answer_edit . add_theme_stylebox_override ( "focus" , _style ( Color ( "182a43" ) , CYAN , 10 , 14 , 7 ) )
    answer_edit . placeholder_text = _text ( "Type the Korean word..." , "한글 단어 입력" )
    answer_edit . virtual_keyboard_type = LineEdit . KEYBOARD_TYPE_DEFAULT
    answer_edit . keep_editing_on_text_submit = true
    answer_edit . text_changed . connect ( _on_lineedit_text_changed )
    _command . add_child ( answer_edit )
    _actions = _hbox ( _command , 8 )
    _fire_button = _button ( _actions , "ENTER" , _submit_clicked )
    _localized ( _fire_button , "INTERCEPT" , "요격 / Enter" )
    _fire_button . add_theme_color_override ( "font_color" , CYAN )
    _fire_button . custom_minimum_size = Vector2 ( 110 , 44 )
    _fire_button . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _pulse_box = _vbox ( _actions , 4 )
    _pulse_box . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _pulse_button = _button ( _pulse_box , "FIELD  0%" , _request_pulse )
    _pulse_button . custom_minimum_size = Vector2 ( 112 , 44 )
    _pulse_button . add_theme_font_size_override ( "font_size" , 14 )
    _pulse_button . tooltip_text = "Slow incoming threats for 5 seconds when fully charged · F2"
    _charge_bar = _bar ( _pulse_box , CYAN )
    _charge_bar . hide ( )
    _console_hint = _label ( box , "" , 14 , MUTED )
    _console_hint . text_overrun_behavior = TextServer . OVERRUN_TRIM_ELLIPSIS
    _localized ( _console_hint , "Enter to intercept   ·   F1 Korean keyboard   ·   Esc pause" , "Enter 요격   ·   F1 한글 자판   ·   Esc 일시 정지" )
func _build_briefing ( ) -> void :
    _briefing = _panel ( _root , "MissionBriefing" )
    _briefing . add_theme_stylebox_override ( "panel" , _style ( PANEL , LINE , 14 , 24 , 20 ) )
    var shell : = _vbox ( _briefing , 10 )
    _brief_scroll = ScrollContainer . new ( )
    _brief_scroll . size_flags_vertical = Control . SIZE_EXPAND_FILL
    _brief_scroll . horizontal_scroll_mode = ScrollContainer . SCROLL_MODE_DISABLED
    _brief_scroll . vertical_scroll_mode = ScrollContainer . SCROLL_MODE_AUTO
    shell . add_child ( _brief_scroll )
    var box : = _vbox ( _brief_scroll , 8 )
    box . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _brief_box = box
    _brief_box . minimum_size_changed . connect ( _queue_layout )
    _localized ( _label ( box , "" , 14 , CYAN ) , "Seoul Defense" , "서울 방어전" )
    _brief_title = _label ( box , "" , 31 )
    _brief_title . autowrap_mode = TextServer . AUTOWRAP_WORD_SMART
    _localized ( _brief_title , "Words are your shield." , "한글로 지키는 서울" )
    var body : = _label ( box , "" , 14 , MUTED )
    _brief_body = body
    body . size . x = 366
    body . autowrap_mode = TextServer . AUTOWRAP_WORD_SMART
    _localized ( body , "Type the Hangul and press Enter. Defend 20 city zones; damage to 16 zones (80%) ends the run. Each zone counts once." , "한글을 입력하고 Enter로 요격하세요. 도시 20구역 중 16구역(80%)이 파괴되면 종료됩니다. 같은 구역은 한 번만 집계됩니다." )
    _localized ( _label ( box , "" , 14 , MUTED ) , "Choose your landmark" , "지킬 장소" )
    var sites : = _hbox ( box , 8 )
    for data : Array in [ [ "namsan" , "남산\nNamsan Tower" ] , [ "gwanghwamun" , "광화문\nGwanghwamun" ] ] :
        var id : String = data [ 0 ]
        var button : = _button ( sites , data [ 1 ] , _select_scene . bind ( id ) )
        button . size_flags_horizontal = Control . SIZE_EXPAND_FILL
        button . add_theme_font_size_override ( "font_size" , 14 )
        _scene_buttons [ id ] = button
    _localized ( _label ( box , "" , 14 , MUTED ) , "Choose your pace" , "진행 속도" )
    var paces : = BoxContainer . new ( )
    paces . add_theme_constant_override ( "separation" , 8 )
    box . add_child ( paces )
    _brief_paces = paces
    for data : Array in [ [ "calm" , "Calm / 차분하게" , "Calm / 차분하게" ] , [ "adventure" , "Adventure / 도전" , "Adventure / 도전" ] ] :
        var id : String = data [ 0 ]
        var button : = _button ( paces , data [ 1 ] , _select_pace . bind ( id ) )
        button . size_flags_horizontal = Control . SIZE_EXPAND_FILL
        button . add_theme_font_size_override ( "font_size" , 14 )
        _pace_buttons [ id ] = button
    _create_audio_toggles ( box )
    _start_button = _button ( shell , "" , _start_selected )
    _start_button . custom_minimum_size . y = 44
    _primary_button ( _start_button )
    _start_button . add_theme_font_size_override ( "font_size" , 16 )
    _localized ( _start_button , "Begin defense  →" , "방어 시작  →" )
    _brief_hint = _label ( box , "" , 14 , MUTED )
    _brief_hint . autowrap_mode = TextServer . AUTOWRAP_WORD_SMART
    _localized ( _brief_hint , "No Korean keyboard? Type gksrmf to write 한글." , "영문 키보드도 한글 자판으로 자동 변환됩니다." )
func _build_result ( ) -> void :
    _result = _panel ( _root , "MissionResult" )
    _result . add_theme_stylebox_override ( "panel" , _style ( PANEL , LINE , 14 , 24 , 22 ) )
    var shell : = _vbox ( _result , 10 )
    _result_scroll = ScrollContainer . new ( )
    _result_scroll . size_flags_vertical = Control . SIZE_EXPAND_FILL
    _result_scroll . horizontal_scroll_mode = ScrollContainer . SCROLL_MODE_DISABLED
    _result_scroll . vertical_scroll_mode = ScrollContainer . SCROLL_MODE_AUTO
    shell . add_child ( _result_scroll )
    var box : = _vbox ( _result_scroll , 14 )
    _result_box = box
    box . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _result_kicker = _label ( box , "" , 14 , CYAN )
    _result_title = _label ( box , "" , 30 )
    _result_title . autowrap_mode = TextServer . AUTOWRAP_WORD_SMART
    _result_body = _label ( box , "" , 15 , MUTED )
    _result_body . size . x = 334
    _result_body . autowrap_mode = TextServer . AUTOWRAP_WORD_SMART
    _result_box . minimum_size_changed . connect ( _queue_layout )
    _result_actions = BoxContainer . new ( )
    _result_actions . vertical = true
    _result_actions . add_theme_constant_override ( "separation" , 10 )
    shell . add_child ( _result_actions )
    _result_button = _button ( _result_actions , "" , _result_action )
    _result_button . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _result_button . custom_minimum_size . y = 48
    _primary_button ( _result_button )
    var choose : = _button ( _result_actions , "" , func ( ) -> void : show_briefing ( _selected_scene ) )
    choose . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _localized ( choose , "Choose landmark" , "장소 선택" )
    choose . add_theme_font_size_override ( "font_size" , 14 )
    _result . hide ( )
func _build_pause ( ) -> void :
    _pause_card = _panel ( _root , "PauseCard" )
    var box : = _vbox ( _pause_card , 12 )
    _damage_rule_label = _label ( box , "" , 14 , CYAN )
    _localized ( _damage_rule_label , "Defeat: 16/20 zones (80%)" , "종료: 16/20구역 피해 (80%)" )
    _localized ( _label ( box , "" , 28 ) , "Take a breath." , "잠시 쉬어 가세요" )
    var resume : = _button ( box , "" , func ( ) -> void : pause_requested . emit ( ) )
    _localized ( resume , "Resume  →" , "계속하기  →" )
    _primary_button ( resume )
    var preferences : = _hbox ( box , 8 )
    _motion_pause_button = _switch ( preferences , _toggle_reduced_motion )
    _motion_pause_button . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _language_button . reparent ( preferences )
    _language_button . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    _motion_button . hide ( )
    _create_audio_toggles ( box )
    _pause_card . hide ( )
func _build_keyboard ( ) -> void :
    _keyboard = _panel ( _root , "TwoSetKeyboard" )
    _keyboard . add_theme_stylebox_override ( "panel" , _style ( Color ( 0.051 , 0.078 , 0.129 , 0.98 ) , LINE , 8 , 12 , 10 ) )
    var box : = _vbox ( _keyboard , 5 )
    var heading : = _hbox ( box )
    _keyboard_heading = heading
    _localized ( _label ( heading , "" , 14 , CYAN ) , "두벌식 / TWO-SET KEYBOARD" , "두벌식 한글 자판" )
    _spacer ( heading )
    _keyboard_shift_hint = _label ( heading , "" , 14 , MUTED )
    _localized ( _keyboard_shift_hint , "Shift: ㄲ ㄸ ㅃ ㅆ ㅉ ㅒ ㅖ" , "Shift: ㄲ ㄸ ㅃ ㅆ ㅉ ㅒ ㅖ" )
    for keys : String in [ "QWERTYUIOP" , "ASDFGHJKL" , "ZXCVBNM" ] :
        var row : = _hbox ( box , 5 )
        row . alignment = BoxContainer . ALIGNMENT_CENTER
        _keyboard_rows . append ( row )
        for key : String in keys :
            var jamo : String = Composer . KEY_JAMO . get ( key . unicode_at ( 0 ) , "" )
            var button : = _button ( row , jamo + "  " + key , _virtual_jamo . bind ( jamo ) )
            button . custom_minimum_size = Vector2 ( 57 , 31 )
            button . add_theme_font_size_override ( "font_size" , 14 )
            _keyboard_keys . append ( { "button" : button , "jamo" : jamo , "key" : key } )
            button . size_flags_horizontal = Control . SIZE_EXPAND_FILL
        if keys == "ZXCVBNM" :
            var back : = _button ( row , "←" , _virtual_backspace )
            back . custom_minimum_size . x = 44
            _keyboard_keys . append ( { "button" : back , "jamo" : "←" , "key" : "" } )
    _keyboard . hide ( )
func _queue_layout ( ) -> void :
    if _layout_pending or not _ready_built :
        return
    _layout_pending = true
    call_deferred ( "_layout" )
func _layout ( ) -> void :
    _layout_pending = false
    if not _ready_built :
        return
    var width : float = floorf ( _root . size . x )
    var height : float = floorf ( _root . size . y )
    if width < 1 or height < 1 :
        return
    _narrow = width <= 680
    _short = height < 520 and not _narrow
    var compact_overlay : bool = height < 420 and ( _screen != "playing" or _paused )
    _header . visible = not compact_overlay
    _telemetry_status . visible = not compact_overlay
    var margin : float = 10.0 if _short else ( 12.0 if _narrow else ( 24.0 if width >= 1000 else 14.0 ) )
    var full : float = width - margin * 2.0
    _identity . hide ( )
    _header_stats [ 3 ] . hide ( )
    _refresh_city_damage_view ( )
    var damage_w : float = 140.0 if _narrow else 190.0
    var damage_body_h : float = _header_stats [ 0 ] . get_combined_minimum_size ( ) . y
    _header . add_theme_stylebox_override ( "panel" , _style ( PANEL , LINE , 12 , 12 , 10 ) )
    _header . position = Vector2 ( margin , margin )
    _header_body . custom_minimum_size = Vector2 ( 0 , ceilf ( damage_body_h ) )
    _header . size = Vector2 ( damage_w , ceilf ( damage_body_h ) + 16.0 )
    _header_stats [ 0 ] . position = Vector2 . ZERO
    _header_stats [ 0 ] . size = Vector2 ( damage_w - 20.0 , ceilf ( damage_body_h ) )
    _telemetry_status . add_theme_stylebox_override ( "panel" , _style ( PANEL , LINE , 12 , 12 , 8 ) )
    var status_w : float = 140.0 if _narrow else 174.0
    var status_h : float = ceilf ( _telemetry_status_body . get_combined_minimum_size ( ) . y ) + 12.0
    _telemetry_status . size = Vector2 ( status_w , status_h )
    if _narrow and width < 480.0 and not ( _screen == "wave_clear" and height < 420.0 ) :
        _telemetry_status . position = Vector2 ( margin , _header . get_rect ( ) . end . y + 8.0 )
    else :
        _telemetry_status . position = Vector2 ( width - margin - status_w - ( 0.0 if _screen == "wave_clear" and height < 420.0 else 52.0 ) , margin )
    _pause_button . position = Vector2 ( width - margin - 44.0 , margin )
    _pause_button . size = Vector2 ( 44 , 44 )
    _command . vertical = false
    _command . add_theme_constant_override ( "separation" , 6 )
    _actions . add_theme_constant_override ( "separation" , 6 )
    _actions . size_flags_horizontal = Control . SIZE_FILL
    _console_title . hide ( )
    _console_hint . hide ( )
    _motion_button . hide ( )
    _console_top . hide ( )
    if _console_feedback . get_parent ( ) != _command . get_parent ( ) :
        _console_feedback . reparent ( _command . get_parent ( ) )
    if _feedback_label . get_parent ( ) != _console_feedback :
        _feedback_label . reparent ( _console_feedback )
    _feedback_label . visible = height >= 420.0
    _feedback_label . add_theme_font_size_override ( "font_size" , 12 )
    _console_feedback . custom_minimum_size . x = 0
    _console_feedback . visible = height >= 420.0
    _feedback_label . horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    if _keyboard_button . get_parent ( ) != _root :
        _keyboard_button . reparent ( _root )
    if _pulse_box . get_parent ( ) != _root :
        _pulse_box . reparent ( _root )
    _keyboard_button . size_flags_horizontal = Control . SIZE_FILL
    _keyboard_button . custom_minimum_size = Vector2 ( 44 if _narrow else 58 , 44 )
    _keyboard_button . text = "한" if _narrow else _text ( "Keys" , "자판" )
    _keyboard_button . set_pressed_no_signal ( _keyboard . visible )
    _fire_button . custom_minimum_size = Vector2 ( 52 if _narrow else 72 , 44 )
    _fire_button . text = _text ( "Send" , "요격" )
    _pulse_button . custom_minimum_size = Vector2 ( 54 if _narrow else 96 , 44 )
    _pulse_button . text = _pulse_text ( )
    for button : Button in [ _keyboard_button , _fire_button , _pulse_button ] :
        button . add_theme_font_size_override ( "font_size" , 16 )
        button . add_theme_stylebox_override ( "normal" , _style ( Color ( "1b293d" ) , LINE , 10 , 8 , 9 ) )
        button . add_theme_stylebox_override ( "hover" , _style ( Color ( "293b54" ) , CYAN , 10 , 8 , 9 ) )
        button . add_theme_stylebox_override ( "pressed" , _style ( Color ( "243c61" ) , CYAN , 10 , 8 , 9 ) )
        button . add_theme_stylebox_override ( "disabled" , _style ( Color ( "131e2e" ) , Color ( "27354a" ) , 10 , 8 , 9 ) )
    _primary_button ( _fire_button )
    _console_top . alignment = BoxContainer . ALIGNMENT_BEGIN
    _console . add_theme_stylebox_override ( "panel" , _style ( Color ( 0.051 , 0.078 , 0.129 , 0.98 ) , LINE , 14 , 8 , 8 ) )
    var console_w : float = minf ( 480.0 , full )
    var console_h : float = maxf ( 60.0 if height < 420.0 else 82.0 , _console . get_combined_minimum_size ( ) . y )
    _console . position = Vector2 ( roundf ( ( width - console_w ) * 0.5 ) , height - ( 0.0 if height < 420.0 else 8.0 ) - console_h )
    _console . size = Vector2 ( console_w , console_h )
    answer_edit . placeholder_text = _text ( "Type 한글..." , "한글 단어 입력" ) if _narrow else _text ( "Type the Korean word..." , "한글 단어 입력" )
    _console . visible = _screen == "playing" and not _paused
    _keyboard_button . visible = _console . visible
    _pulse_box . visible = _console . visible
    var auxiliary_y : float = _console . position . y + 6.0
    if width < 760.0 :
        auxiliary_y = _console . position . y - 56.0
    _keyboard_button . position = Vector2 ( _console . get_rect ( ) . end . x + 8.0 if width >= 760.0 else width - margin - _keyboard_button . custom_minimum_size . x , auxiliary_y )
    _keyboard_button . size = _keyboard_button . custom_minimum_size
    var pulse_size : Vector2 = _pulse_box . get_combined_minimum_size ( ) . max ( Vector2 ( _pulse_button . custom_minimum_size . x , 44.0 ) )
    _pulse_box . position = Vector2 ( _console . position . x - pulse_size . x - 8.0 if width >= 760.0 else margin , auxiliary_y )
    _pulse_box . size = pulse_size
    var card_top : float = maxf ( _header . get_rect ( ) . end . y , _telemetry_status . get_rect ( ) . end . y if _narrow and width < 480.0 else 0.0 ) + 14.0
    if compact_overlay :
        card_top = margin
    var card_bottom : float = ( height - margin ) if not _console . visible else _console . position . y - 12
    var available : float = maxf ( 130 , card_bottom - card_top )
    var brief_width : float = minf ( 415 , full )
    _briefing . add_theme_stylebox_override ( "panel" , _style ( PANEL , LINE , 14 , 16 if _narrow else 24 , 16 if _narrow else 20 ) )
    _briefing . position = Vector2 ( margin if _narrow else margin + 8 , card_top )
    var brief_content_h : float = _brief_box . get_combined_minimum_size ( ) . y
    var brief_needed : float = brief_content_h + _start_button . get_combined_minimum_size ( ) . y + 10.0 + ( 32.0 if _narrow else 40.0 )
    _briefing . size = Vector2 ( brief_width , minf ( available , maxf ( 360.0 , brief_needed ) ) )
    _brief_title . add_theme_font_size_override ( "font_size" , 25 if _narrow else 31 )
    _brief_paces . vertical = _narrow and width < 380
    var brief_inner : float = brief_width - ( 32 if _narrow else 48 ) - 12
    for label : Label in [ _brief_title , _brief_body , _brief_hint ] :
        label . custom_minimum_size . x = minf ( brief_inner , 200 )
        label . size . x = brief_inner
    var result_w : float = minf ( 430.0 , full )
    var compact_clear : bool = _screen == "wave_clear" and height < 420.0
    _result_actions . vertical = not ( _short or compact_clear )
    _result_kicker . visible = not compact_clear
    _result_body . visible = not compact_clear
    _result_actions . get_child ( 1 ) . visible = not ( compact_clear and width < 480.0 )
    _result . add_theme_stylebox_override ( "panel" , _style ( PANEL , LINE , 14 , 12 if compact_clear else 24 , 8 if compact_clear else 22 ) )
    var result_padding : float = 16.0 if compact_clear else 44.0
    var result_needed : float = _result_box . get_combined_minimum_size ( ) . y + _result_actions . get_combined_minimum_size ( ) . y + 10.0 + result_padding
    var result_top : float = card_top if _narrow or compact_clear else minf ( 156.0 , maxf ( card_top , card_bottom - result_needed ) )
    var result_bottom : float = card_bottom
    # Use the actual available height; a fractional viewport cap can leave only
    # the result kicker visible while pushing the title/body behind the buttons.
    _result . position = Vector2 ( margin if _narrow else margin + 8 , result_top )
    _result . size = Vector2 ( result_w , minf ( result_bottom - result_top , maxf ( 100.0 if compact_clear else 180.0 , result_needed ) ) )
    _result_title . add_theme_font_size_override ( "font_size" , 21 if compact_clear else ( 25 if _narrow else 30 ) )
    _result_body . custom_minimum_size . x = minf ( 180 , full - 60 )
    _result_title . custom_minimum_size . x = minf ( 180 , full - 60 )
    var pause_w : float = minf ( 330 , full )
    _pause_card . position = Vector2 ( roundf ( ( width - pause_w ) * 0.5 ) , roundf ( card_top + maxf ( 0 , ( available - 280 ) * 0.5 ) ) )
    _pause_card . size = Vector2 ( pause_w , minf ( 280 , available ) )
    _targets_panel . visible = false
    _targets_panel . position = Vector2 ( width - margin - 225 , 125 )
    _targets_panel . size = Vector2 ( 225 , 0 )
    _keyboard_shift_hint . visible = not _narrow
    _keyboard_heading . visible = not _short
    _keyboard . add_theme_stylebox_override ( "panel" , _style ( Color ( 0.051 , 0.078 , 0.129 , 0.98 ) , LINE , 8 , 12 , 8 if _short else 10 ) )
    var keyboard_h : float = 191 if _narrow else ( 154 if _short else 166 )
    # Below 760 px the auxiliary controls occupy their own row above input.
    # Reserve that row instead of drawing the lower keyboard keys underneath it.
    var keyboard_auxiliary_space : float = 56.0 if width < 760.0 else 0.0
    _keyboard . position = Vector2 ( roundf ( margin if _narrow else maxf ( margin , width * 0.5 - 350 ) ) , roundf ( _console . position . y - keyboard_h - 10 - keyboard_auxiliary_space ) )
    _keyboard . size = Vector2 ( minf ( 700 , full ) , keyboard_h )
    # At the minimum 320 px square viewport, keep Pause reachable too: the
    # auxiliary row has a free centre while the expanded keyboard covers the top.
    if _keyboard.visible and _pause_button.visible and _keyboard.get_rect().intersects(_pause_button.get_rect()):
        _pause_button.position = Vector2(roundf((width - 44.0) * 0.5), auxiliary_y)
    for row : HBoxContainer in _keyboard_rows :
        row . add_theme_constant_override ( "separation" , 2 if _narrow else 5 )
    for data : Dictionary in _keyboard_keys :
        var button : Button = data . button
        button . text = data . jamo if _narrow else data . jamo + ( "  " + data . key if not data . key . is_empty ( ) else "" )
        button . custom_minimum_size = Vector2 ( 0 if _narrow else 57 , 44 if _narrow else ( 42 if _short else 31 ) )
        button . add_theme_stylebox_override ( "normal" , _style ( Color ( "1b293d" ) , LINE , 5 , 2 if _narrow else 8 , 5 ) )
        button . add_theme_stylebox_override ( "hover" , _style ( Color ( "293b54" ) , CYAN , 5 , 2 if _narrow else 8 , 5 ) )
        button . add_theme_stylebox_override ( "pressed" , _style ( Color ( "243c61" ) , CYAN , 5 , 2 if _narrow else 8 , 5 ) )
func get_playfield_rect ( ) -> Rect2 :
    if not _ready_built :
        return Rect2 ( )
    if _layout_pending :
        _layout ( )
    var top : float = 12.0
    var bottom : float = _console . position . y - 12.0 if _console . visible else floorf ( _root . size . y ) - 12.0
    return Rect2 ( Vector2 ( 12.0 , top ) , Vector2 ( maxf ( 0.0 , floorf ( _root . size . x ) - 24.0 ) , maxf ( 0.0 , bottom - top ) ) )
func get_telemetry_rects ( ) -> Array [ Rect2 ] :
    var rects : Array [ Rect2 ] = [ ]
    if not _ready_built :
        return rects
    if _layout_pending :
        _layout ( )
    for control : Control in [ _header , _telemetry_status , _pause_button ] :
        if control . is_visible_in_tree ( ) :
            rects . append ( control . get_global_rect ( ) )
    return rects
func get_hud_obstacle_rects ( ) -> Array [ Rect2 ] :
    var rects : Array [ Rect2 ] = get_telemetry_rects ( )
    for control : Control in [ _console , _keyboard , _keyboard_button , _pulse_box ] :
        if is_instance_valid ( control ) and control . is_visible_in_tree ( ) :
            rects . append ( control . get_global_rect ( ) )
    return rects
func get_launcher_floor_pixel ( ) -> float :
    if not _ready_built :
        return 0.0
    if _layout_pending :
        _layout ( )
    return _console . position . y - ( 4.0 if _root . size . y < 420.0 else 12.0 )
func get_launcher_clearance_rect ( ) -> Rect2 :
    if not _ready_built :
        return Rect2 ( )
    if _layout_pending :
        _layout ( )
    var right : float = floorf ( _root . size . x ) - 12.0
    return Rect2 ( Vector2 ( 12.0 , 12.0 ) , Vector2 ( maxf ( 0.0 , right - 12.0 ) , maxf ( 0.0 , get_launcher_floor_pixel ( ) - 12.0 ) ) )
func _switch_icon ( enabled : bool , disabled : bool = false ) -> Texture2D :
    var fill : String = "78a9ff" if enabled else "45546b"
    var thumb : String = "ffffff" if enabled else "dce5f2"
    if disabled :
        fill = "293548"
        thumb = "728098"
    var svg : String = '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="22" viewBox="0 0 38 22"><rect width="38" height="22" rx="11" fill="#%s"/><circle cx="%d" cy="11" r="8" fill="#%s"/></svg>' % [ fill , 27 if enabled else 11 , thumb ]
    var icon_image : = Image . new ( )
    icon_image . load_svg_from_string ( svg , 1.0 )
    var texture : = ImageTexture . create_from_image ( icon_image )
    return texture
func _switch ( parent : Node , callback : Callable ) -> CheckButton :
    var button : = CheckButton . new ( )
    button . focus_mode = Control . FOCUS_ALL
    button . mouse_default_cursor_shape = Control . CURSOR_POINTING_HAND
    button . custom_minimum_size . y = 44
    button . size_flags_horizontal = Control . SIZE_EXPAND_FILL
    button . add_theme_font_size_override ( "font_size" , 13 )
    for state : String in [ "font_color" , "font_hover_color" , "font_pressed_color" , "font_hover_pressed_color" ] :
        button . add_theme_color_override ( state , WHITE )
    button . add_theme_constant_override ( "h_separation" , 10 )
    button . add_theme_constant_override ( "icon_max_width" , 38 )
    for state : String in [ "checked" , "unchecked" , "checked_disabled" , "unchecked_disabled" ] :
        button . add_theme_icon_override ( state , _switch_icon ( state . begins_with ( "checked" ) , state . ends_with ( "disabled" ) ) )
    for state : String in [ "normal" , "pressed" , "hover" , "hover_pressed" , "disabled" ] :
        button . add_theme_stylebox_override ( state , _style ( Color ( "1b293d" ) if state != "hover" and state != "hover_pressed" else Color ( "293b54" ) , Color ( "1b293d" ) , 10 , 10 , 8 ) )
    button . add_theme_stylebox_override ( "focus" , _focus_style ( ) )
    button . pressed . connect ( callback )
    parent . add_child ( button )
    return button
func _focus_style ( ) -> StyleBoxFlat :
    var box : = _style ( Color ( 0 , 0 , 0 , 0 ) , CYAN , 10 , 0 , 0 )
    box . set_border_width_all ( 2 )
    return box
func _primary_button ( button : Button ) -> void :
    button . add_theme_color_override ( "font_color" , INK )
    button . add_theme_color_override ( "font_hover_color" , INK )
    button . add_theme_color_override ( "font_pressed_color" , INK )
    button . add_theme_stylebox_override ( "normal" , _style ( CYAN , CYAN , 10 , 12 , 9 ) )
    button . add_theme_stylebox_override ( "hover" , _style ( CYAN . lightened ( 0.12 ) , CYAN . lightened ( 0.12 ) , 10 , 12 , 9 ) )
    button . add_theme_stylebox_override ( "pressed" , _style ( CYAN . darkened ( 0.1 ) , CYAN . darkened ( 0.1 ) , 10 , 12 , 9 ) )
func _create_audio_toggles ( parent : Node ) -> void :
    var row : = _hbox ( parent , 8 )
    var sound : = _switch ( row , _toggle_sound )
    var music : = _switch ( row , _toggle_music )
    _sound_buttons . append ( sound )
    _music_buttons . append ( music )
    set_sound_enabled ( sound_enabled )
    set_music_enabled ( music_enabled )
func _toggle_sound ( ) -> void :
    set_sound_enabled ( not sound_enabled , true )
func _toggle_music ( ) -> void :
    set_music_enabled ( not music_enabled , true )
func set_sound_enabled ( enabled : bool , emit_change : bool = false ) -> void :
    sound_enabled = enabled
    for button : Button in _sound_buttons :
        button . text = _text ( "Sound" , "전체 소리" )
        button . tooltip_text = _text ( "Master audio: music and sound effects" , "전체 음소거: 배경 음악과 모든 효과음" )
        button . set_pressed_no_signal ( enabled )
        button . add_theme_color_override ( "font_color" , WHITE )
    if emit_change :
        sound_changed . emit ( enabled )
func set_music_enabled ( enabled : bool , emit_change : bool = false ) -> void :
    music_enabled = enabled
    for button : Button in _music_buttons :
        button . text = _text ( "Music" , "배경음악" )
        button . tooltip_text = _text ( "Music only; sound effects stay unchanged" , "배경 음악만 변경하며 효과음은 유지합니다" )
        button . set_pressed_no_signal ( enabled )
        button . add_theme_color_override ( "font_color" , WHITE )
    if emit_change :
        music_changed . emit ( enabled )
func _toggle_reduced_motion ( ) -> void :
    set_reduced_motion ( not reduced_motion , true )
func set_reduced_motion ( enabled : bool , emit_change : bool = false ) -> void :
    reduced_motion = enabled
    _motion_button . text = "REDUCED FX" if reduced_motion else "REDUCE FX"
    _motion_button . add_theme_color_override ( "font_color" , CYAN if reduced_motion else WHITE )
    _motion_pause_button . text = _text ( "Less motion" , "모션 줄이기" )
    _motion_pause_button . set_pressed_no_signal ( enabled )
    if emit_change :
        reduced_motion_changed . emit ( reduced_motion )
func _process ( delta : float ) -> void :
    if _ready_built :
        if _window_input_active :
            _observe_ime_state ( _ime_active ( ) )
        _flush_submit_intent ( )
        if _screen == "wave_clear" :
            _update_wave_enter_arming ( )
    if _feedback_timer > 0.0 :
        _feedback_timer -= delta
        if _feedback_timer <= 0.0 :
            _feedback_label . text = _text ( "Match an inbound word to lock on" , "다가오는 단어를 입력해 조준하세요" ) if _started else _text ( "Protect the skyline. Learn 한글." , "서울을 지키며 한글을 배워요" )
            _feedback_label . add_theme_color_override ( "font_color" , MUTED )
func _ime_active ( ) -> bool :
    return _web_composing or ( DisplayServer . has_feature ( DisplayServer . FEATURE_IME ) and not DisplayServer . ime_get_text ( ) . is_empty ( ) )
func _notification ( what : int ) -> void :
    if what == MainLoop . NOTIFICATION_OS_IME_UPDATE and _ready_built and _window_input_active :
        _observe_ime_state ( _ime_active ( ) )
func _observe_ime_state ( active : bool ) -> void :
    if active and not _native_composing :
        _pending_submit = false
        _ime_delivery_pending = true
        _ime_cancelled = false
        _ime_base_generation = _commit_generation
        _ime_base_revision = _text_revision
        _ime_base_text = answer_edit . text if is_instance_valid ( answer_edit ) else ""
        _ime_commit_pending = false
        _ime_pointer_commit = false
        _ime_key_released = false
    elif not active and _native_composing :
        _ime_commit_pending = not _ime_cancelled and not _ime_pointer_commit and not _ime_key_released
    _native_composing = active
func _input ( event : InputEvent ) -> void :
    if event is InputEventMouseButton and event . pressed and event . button_index == MOUSE_BUTTON_LEFT or event is InputEventScreenTouch and event . pressed :
        _ime_pointer_commit = true
        _ime_commit_pending = false
        return
    if not event is InputEventKey :
        return
    var key : = event as InputEventKey
    var is_enter : bool = key . keycode == KEY_ENTER or key . keycode == KEY_KP_ENTER
    var web_intent : Dictionary = { }
    if is_enter and key . pressed and not key . echo and not _enter_down :
        web_intent = _consume_web_submit_intent ( )
        _last_web_intent_id = maxi ( _last_web_intent_id , int ( web_intent . get ( "id" , 0 ) ) )
    # Consume the web intent even for controls, so it cannot replay as a later answer.
    var focused : Control = get_viewport ( ) . gui_get_focus_owner ( )
    if is_enter and focused is BaseButton and not ( focused == _result_button and _screen == "wave_clear" ) :
        return
    if key . pressed and key . keycode == KEY_NONE and key . unicode >= 32 :
        _commit_generation += 1
    if _window_input_active :
        _observe_ime_state ( _ime_active ( ) )
    if _screen == "wave_clear" and is_enter :
        _handle_wave_clear_enter ( key , web_intent )
        get_viewport ( ) . set_input_as_handled ( )
        return
    if _play_web_epoch and _screen == "playing" and is_enter and key . pressed and ( web_intent . is_empty ( ) or int ( web_intent . get ( "id" , 0 ) ) <= _play_replay_floor or bool ( web_intent . get ( "cancelled" , false ) ) ) :
        get_viewport ( ) . set_input_as_handled ( )
        return
    if not key . pressed :
        if is_enter :
            if _native_composing or _enter_blocked :
                _ime_key_released = true
            _enter_down = false
            _enter_blocked = false
            _ime_commit_pending = false
        elif not _native_composing :
            _ime_commit_pending = false
        return
    if is_enter :
        if key . echo or _enter_down :
            get_viewport ( ) . set_input_as_handled ( )
            return
        _enter_down = true
        _enter_blocked = _native_composing or _ime_commit_pending
        if answer_edit . has_focus ( ) and answer_edit . editable and not _paused :
            _queue_submit_intent ( true , web_intent )
        get_viewport ( ) . set_input_as_handled ( )
        return
    if _native_composing :
        if key . keycode == KEY_ESCAPE :
            _cancel_composition_intent ( )
        return
    if key . keycode == KEY_ESCAPE and _started and _screen == "playing" :
        pause_requested . emit ( )
        get_viewport ( ) . set_input_as_handled ( )
        return
    if key . keycode == KEY_F1 :
        _toggle_keyboard ( )
        get_viewport ( ) . set_input_as_handled ( )
        return
    if key . keycode == KEY_F2 and _started and not _paused :
        _request_pulse ( )
        get_viewport ( ) . set_input_as_handled ( )
        return
    if not answer_edit . has_focus ( ) or not answer_edit . editable or _paused :
        return
    if key . keycode != KEY_NONE and key . unicode <= 127 :
        if _pending_submit and ( key . unicode >= 32 or key . keycode == KEY_BACKSPACE or key . keycode == KEY_DELETE ) :
            _pending_submit = false
        _ime_commit_pending = false
        _ime_pointer_commit = false
    var jamo : String = Composer . jamo_for_key ( key )
    if not jamo . is_empty ( ) :
        _insert_jamo ( jamo )
        get_viewport ( ) . set_input_as_handled ( )
    elif key . keycode == KEY_BACKSPACE and _last_was_composer and not key . ctrl_pressed and not key . meta_pressed and not key . alt_pressed :
        _apply_backspace ( )
        get_viewport ( ) . set_input_as_handled ( )
    elif key . unicode > 127 :
        _last_was_composer = false
func _wave_web_state ( ) -> Dictionary :
    if _web_ime_guard == null :
        return { }
    var state : Variant = _web_ime_guard . snapshot ( )
    if state == null :
        return { "available" : true , "blocked" : true }
    return { "available" : true , "composing" : bool ( state . composing ) ,
        "enterDown" : bool ( state . enterDown ) , "pending" : bool ( state . pending ) ,
        "delivered" : int ( state . delivered ) }
func _advance_wave_web_epoch ( ) -> Dictionary :
    if _web_ime_guard == null :
        return { }
    var encoded : Variant = _web_ime_guard . advanceStageJSON ( )
    var state : Variant = JSON . parse_string ( str ( encoded ) )
    return state if state is Dictionary else { }
func _begin_wave_input_epoch ( ) -> void :
    var state : Dictionary = _advance_wave_web_epoch ( )
    if not state . is_empty ( ) :
        _play_web_epoch = true
        _play_replay_floor = maxi ( _last_web_intent_id , int ( state . get ( "latestIntentId" , 0 ) ) )
    _cancel_composition_intent ( )
    _web_composing = false
    _native_composing = false
    if answer_edit . has_ime_text ( ) :
        answer_edit . cancel_ime ( )
func _wave_input_idle ( web : Dictionary ) -> bool :
    if _wave_wait_native_release or not _window_input_active or _enter_down or _native_composing or _ime_active ( ) or _ime_commit_pending or _pending_submit :
        return false
    if Input . is_key_pressed ( KEY_ENTER ) or Input . is_key_pressed ( KEY_KP_ENTER ) :
        return false
    if bool ( web . get ( "blocked" , false ) ) or bool ( web . get ( "composing" , false ) ) or bool ( web . get ( "enterDown" , false ) ) or bool ( web . get ( "pending" , false ) ) or int ( web . get ( "delivered" , 0 ) ) > 0 :
        return false
    return true
func _refresh_wave_enter_prompt ( ) -> void :
    if _screen != "wave_clear" :
        return
    _result_button . text = _text ( "Next stage · Enter" , "다음 단계 · Enter" )
    _result_kicker . text = _text ( "Press Enter to continue" , "Enter로 다음 단계" ) if _wave_enter_armed else _text ( "Release Enter first" , "Enter를 놓아 주세요" )
func _update_wave_enter_arming ( ) -> void :
    if _screen != "wave_clear" :
        return
    var web : Dictionary = _wave_web_state ( )
    if not _window_input_active or _native_composing or _ime_active ( ) or bool ( web . get ( "composing" , false ) ) :
        _wave_enter_armed = false
        _wave_release_required = true
    elif not _wave_continuing and not _wave_enter_armed and _wave_input_idle ( web ) :
        _wave_release_required = false
        _wave_enter_armed = true
        _wave_replay_floor = _last_web_intent_id
    _refresh_wave_enter_prompt ( )
func _handle_wave_clear_enter ( key : InputEventKey , web_intent : Dictionary ) -> void :
    if not key . pressed :
        _wave_wait_native_release = false
        _enter_down = false
        _enter_blocked = false
        _ime_commit_pending = false
        _wave_release_required = false
        _update_wave_enter_arming ( )
        return
    if _wave_continuing :
        return
    if key . echo or _enter_down :
        _wave_wait_native_release = true
        _wave_enter_armed = false
        _wave_release_required = true
        _refresh_wave_enter_prompt ( )
        return
    var armed : bool = _wave_enter_armed and not _wave_release_required
    _wave_wait_native_release = true
    _wave_enter_armed = false
    _wave_release_required = true
    _enter_down = true
    var web : Dictionary = _wave_web_state ( )
    var stale_web_replay : bool = bool ( web . get ( "available" , false ) ) and ( web_intent . is_empty ( ) or int ( web_intent . get ( "id" , 0 ) ) <= _wave_replay_floor )
    var composition_replay : bool = bool ( web_intent . get ( "composition" , false ) )
    if armed and _window_input_active and not stale_web_replay and not composition_replay and not _native_composing and not _ime_active ( ) and not _ime_commit_pending :
        _result_action ( )
    else :
        _refresh_wave_enter_prompt ( )
func _selection ( ) -> Vector2i :
    if answer_edit . has_selection ( ) :
        return Vector2i ( answer_edit . get_selection_from_column ( ) , answer_edit . get_selection_to_column ( ) )
    return Vector2i ( answer_edit . caret_column , answer_edit . caret_column )
func _insert_jamo ( jamo : String ) -> void :
    var selected : Vector2i = _selection ( )
    var edit : Dictionary = Composer . insert_at ( answer_edit . text , selected . x , selected . y , jamo )
    if String ( edit . text ) . length ( ) > answer_edit . max_length :
        return
    answer_edit . text = edit . text
    answer_edit . deselect ( )
    answer_edit . caret_column = edit . caret
    _last_was_composer = true
    answer_changed . emit ( answer_edit . text )
func _apply_backspace ( ) -> void :
    var selected : Vector2i = _selection ( )
    var edit : Dictionary = Composer . backspace_at ( answer_edit . text , selected . x , selected . y )
    answer_edit . text = edit . text
    answer_edit . deselect ( )
    answer_edit . caret_column = edit . caret
    answer_changed . emit ( answer_edit . text )
func _virtual_jamo ( jamo : String ) -> void :
    if not answer_edit . editable or _paused :
        return
    var shifted : String = Composer . SHIFTED . get ( jamo , jamo ) if Input . is_key_pressed ( KEY_SHIFT ) else jamo
    _insert_jamo ( shifted )
    answer_edit . grab_focus ( )
func _virtual_backspace ( ) -> void :
    if answer_edit . editable and not _paused :
        _apply_backspace ( )
        answer_edit . grab_focus ( )
func _on_lineedit_text_changed ( value : String ) -> void :
    _text_revision += 1
    answer_changed . emit ( value )
func _on_web_ime_event ( args : Array ) -> void :
    if args . is_empty ( ) :
        return
    var stage : String = str ( args [ 0 ] )
    if stage == "blur" :
        _on_window_focus_lost ( )
        return
    if stage == "focus" :
        _on_window_focus_returned ( )
        return
    if stage == "cancel" :
        _web_composing = false
        _cancel_composition_intent ( )
        _native_composing = false
        return
    if not _window_input_active :
        return
    _web_composing = stage == "start" or stage == "update"
    _observe_ime_state ( _web_composing )
func _cancel_composition_intent ( ) -> void :
    _ime_cancelled = true
    _pending_submit = false
    _ime_delivery_pending = false
    _ime_commit_pending = false
func _reset_enter_latch ( ) -> void :
    _enter_down = false
    _enter_blocked = false
func _on_window_focus_lost ( ) -> void :
    if _screen == "wave_clear" :
        _wave_enter_armed = false
        _wave_release_required = true
        _wave_wait_native_release = false
    _window_input_active = false
    _reset_enter_latch ( )
    _pending_submit = false
    _web_composing = false
    _native_composing = false
    _ime_commit_pending = false
    _ime_delivery_pending = false
    _ime_key_released = false
    _ime_pointer_commit = false
    if is_instance_valid ( answer_edit ) and answer_edit . has_ime_text ( ) :
        answer_edit . cancel_ime ( )
func _on_window_focus_returned ( ) -> void :
    _window_input_active = true
    _reset_enter_latch ( )
func _native_commit_delivered ( ) -> bool :
    return _commit_generation > _ime_base_generation or _text_revision > _ime_base_revision or answer_edit . text != _ime_base_text
func _commit_delivered ( ) -> bool :
    if _submit_has_expected :
        return answer_edit . text == _submit_expected_text
    return _native_commit_delivered ( )
func _consume_web_submit_intent ( ) -> Dictionary :
    if _web_ime_guard != null :
        var encoded : Variant = _web_ime_guard . consumeIntentJSON ( )
        var intent : Variant = JSON . parse_string ( str ( encoded ) )
        if intent is Dictionary :
            return intent
    return { }
func _queue_submit_intent ( from_keyboard : bool = false , web_intent : Dictionary = { } ) -> void :
    if not _window_input_active :
        return
    if _paused or not _started or _screen != "playing" :
        return
    _submit_requires_commit = _native_composing or _ime_commit_pending or ( _ime_delivery_pending and not _native_commit_delivered ( ) )
    _submit_has_expected = false
    _submit_expected_text = ""
    if from_keyboard and not web_intent . is_empty ( ) :
        _submit_requires_commit = _submit_requires_commit or bool ( web_intent . get ( "composition" , false ) )
        _submit_has_expected = bool ( web_intent . get ( "hasExpectedText" , false ) )
        _submit_expected_text = str ( web_intent . get ( "expectedText" , "" ) )
    _pending_submit = true
    _submit_snapshot = answer_edit . text
    _submit_stable_frames = 0
func _flush_submit_intent ( ) -> void :
    if not _pending_submit :
        return
    if _paused or not _started or _screen != "playing" :
        _pending_submit = false
        return
    if _native_composing or _ime_active ( ) or ( ( _submit_requires_commit or _submit_has_expected ) and not _commit_delivered ( ) ) :
        _submit_stable_frames = 0
        return
    if answer_edit . text != _submit_snapshot :
        _submit_snapshot = answer_edit . text
        _submit_stable_frames = 0
        return
    _submit_stable_frames += 1
    if _submit_stable_frames < 2 :
        return
    _pending_submit = false
    _ime_commit_pending = false
    _ime_delivery_pending = false
    _submit_answer ( answer_edit . text )
    if _screen == "playing" and not _paused and answer_edit . editable :
        answer_edit . grab_focus ( )
func _submit_clicked ( ) -> void :
    _observe_ime_state ( _ime_active ( ) )
    _queue_submit_intent ( )
    if answer_edit . has_ime_text ( ) :
        answer_edit . apply_ime ( )
func _submit_answer ( value : String ) -> void :
    if _paused or not _started or _screen != "playing" or _ime_active ( ) or _ime_commit_pending :
        return
    var clean : String = value . strip_edges ( )
    if clean . is_empty ( ) :
        return
    answer_submitted . emit ( clean )
func _toggle_keyboard ( ) -> void :
    _keyboard . visible = not _keyboard . visible
    _keyboard_button . set_pressed_no_signal ( _keyboard . visible )
    _queue_layout ( )
    if _started and not _paused :
        answer_edit . grab_focus ( )
func _request_pulse ( ) -> void :
    if _started and not _paused and _screen == "playing" and _current_charge >= 100 :
        pulse_requested . emit ( )
        answer_edit . grab_focus ( )
func _select_scene ( scene : String ) -> void :
    _selected_scene = scene
    _refresh_choices ( )
    scene_selected . emit ( scene )
func _select_pace ( pace : String ) -> void :
    _selected_pace = pace
    _refresh_choices ( )
func _refresh_choices ( ) -> void :
    for id : String in _scene_buttons :
        var button : Button = _scene_buttons [ id ]
        button . toggle_mode = true
        button . set_pressed_no_signal ( id == _selected_scene )
        button . add_theme_stylebox_override ( "normal" , _style ( Color ( "243c61" ) if id == _selected_scene else Color ( "1b293d" ) , CYAN if id == _selected_scene else LINE , 10 , 10 , 10 ) )
    for id : String in _pace_buttons :
        var button : Button = _pace_buttons [ id ]
        button . toggle_mode = true
        button . set_pressed_no_signal ( id == _selected_pace )
        button . add_theme_stylebox_override ( "normal" , _style ( Color ( "243c61" ) if id == _selected_pace else Color ( "1b293d" ) , CYAN if id == _selected_pace else LINE , 10 , 10 , 10 ) )
func _start_selected ( ) -> void :
    set_playing ( )
    start_requested . emit ( _selected_scene , _selected_pace )
func set_playing ( ) -> void :
    _pending_submit = false
    _enter_down = false
    _enter_blocked = false
    _ime_commit_pending = false
    _queue_layout ( )
    _screen = "playing"
    _started = true
    _paused = false
    _briefing . hide ( )
    _result . hide ( )
    _pause_card . hide ( )
    _targets_panel . hide ( )
    _pause_button . show ( )
    answer_edit . editable = true
    clear_answer ( )
    set_scene_name ( _selected_scene )
    flash_message ( _text ( "Defense online. Match a word to intercept." , "방어 준비 완료. 단어를 입력해 요격하세요." ) )
    answer_edit . grab_focus ( )
func _result_action ( ) -> void :
    if _screen == "wave_clear" :
        if _wave_continuing :
            return
        _wave_continuing = true
        _begin_wave_input_epoch ( )
        _wave_enter_armed = false
        _wave_release_required = true
        _pending_submit = false
        Input . flush_buffered_events ( )
        _queue_layout ( )
        _screen = "playing"
        _result . hide ( )
        _pause_button . show ( )
        answer_edit . editable = true
        clear_answer ( )
        wave_continue_requested . emit ( )
        call_deferred ( "_focus_answer_after_continue" )
    elif _screen == "defeat" :
        _start_selected ( )
func _focus_answer_after_continue ( ) -> void :
    if _screen == "playing" and not _paused and answer_edit . editable :
        if _layout_pending :
            _layout ( )
        answer_edit . grab_focus ( )
func _pulse_text ( ) -> String :
    if _narrow :
        return _text ( "Slow" , "감속" ) if _current_charge >= 100 else "%d%%" % _current_charge
    if _current_charge >= 100 :
        return _text ( "Slow ready" , "감속 준비" )
    return "Slow  %d%%" % _current_charge
func set_city_damage ( damaged : int , total : int ) -> void :
    _city_total = maxi ( 1 , total )
    _city_damaged = clampi ( damaged , 0 , _city_total )
    if not _ready_built :
        return
    _refresh_city_damage_view ( )
    _queue_layout ( )
func _refresh_city_damage_view ( ) -> void :
    if not is_instance_valid ( _shield_caption ) :
        return
    var percent : int = roundi ( 100.0 * _city_damaged / _city_total )
    var limit : int = ceili ( _city_total * 0.8 )
    var compact : bool = is_instance_valid ( _root ) and _root . size . x <= 680
    var caption : String = _text ( "Damage %d/%d" , "도시피해 %d/%d" ) if compact else _text ( "City damage · %d/%d" , "도시 피해 · %d/%d" )
    _shield_caption . text = caption % [ _city_damaged , _city_total ]
    _shield_label . text = "%d%%" % percent
    var danger : bool = _city_damaged >= limit
    var color : Color = RED if danger else ( AMBER if percent >= 60 else CYAN )
    _shield_label . add_theme_color_override ( "font_color" , RED if danger else ( AMBER if percent >= 60 else WHITE ) )
    _shield_bar . max_value = 100.0
    _shield_bar . value = percent
    _shield_bar . add_theme_stylebox_override ( "fill" , _style ( color , color , 2 , 0 , 0 ) )
    _shield_caption . tooltip_text = _text ( "Each zone counts once. Defeat at %d of %d zones (80%%)." , "구역당 한 번만 집계합니다. %d/%d구역(80%%) 피해 시 종료됩니다." ) % [ limit , _city_total ]
    if is_instance_valid ( _damage_rule_label ) :
        _damage_rule_label . text = _text ( "Defeat: %d/%d zones (80%%)" , "종료: %d/%d구역 피해 (80%%)" ) % [ limit , _city_total ]
    if not is_instance_valid ( _result_body ) :
        return
    if _screen == "wave_clear" :
        _result_body . text = _text ( "%d words intercepted.\nCity damage: %d/%d zones (%d%%).\nDefeat at %d/%d zones (80%%)." , "%d개 단어 요격.\n도시 피해: %d/%d구역(%d%%).\n%d/%d구역(80%%) 피해 시 종료됩니다." ) % [ _last_kills , _city_damaged , _city_total , percent , limit , _city_total ]
    elif _screen == "defeat" :
        _result_body . text = _text ( "%05d points / %d words defended\nCity damage: %d/%d zones (%d%%).\nDefeat threshold: %d/%d zones (80%%)." , "%05d점 / %d개 단어 요격\n도시 피해: %d/%d구역(%d%%).\n종료 기준: %d/%d구역(80%%) 피해." ) % [ _result_score , _result_words , _city_damaged , _city_total , percent , limit , _city_total ]
func set_ammo_state ( _state : Dictionary ) -> void :
    # Compatibility with an older host. Combat has no ammunition restriction;
    # the crew service sequence belongs only to the stage-clear presentation.
    pass
func update_stats ( score : int , wave : int , kills : int , shield : int , combo : int , charge : int ) -> void :
    if not _ready_built :
        return
    _score_label . text = str ( score )
    _wave_label . text = str ( wave )
    _refresh_city_damage_view ( )
    _combo_label . text = "%d×" % combo
    _current_charge = clampi ( charge , 0 , 100 )
    _charge_bar . value = _current_charge
    var pulse_caption : String = _pulse_text ( )
    if _pulse_button . text != pulse_caption :
        _pulse_button . text = pulse_caption
        _queue_layout ( )
    _pulse_button . disabled = _current_charge < 100 or not _started or _paused
    _last_wave = wave
    _last_kills = kills
func flash_message ( text : String , good : bool = true ) -> void :
    if not _ready_built :
        return
    _feedback_label . text = text
    _feedback_label . tooltip_text = text
    _feedback_label . add_theme_color_override ( "font_color" , CYAN if good else AMBER )
    _feedback_timer = 3.0
func show_briefing ( scene : String = "namsan" ) -> void :
    _queue_layout ( )
    _selected_scene = scene
    if not _ready_built :
        return
    _screen = "briefing"
    _started = false
    _briefing . show ( )
    _result . hide ( )
    _pause_card . hide ( )
    _targets_panel . hide ( )
    _pause_button . hide ( )
    answer_edit . editable = false
    set_scene_name ( scene )
    _refresh_choices ( )
    flash_message ( _text ( "Protect the skyline. Learn 한글." , "서울을 지키며 한글을 배워요." ) )
func show_wave_clear ( wave : int ) -> void :
    _wave_continuing = false
    _queue_layout ( )
    _wave_wait_native_release = _enter_down or Input . is_key_pressed ( KEY_ENTER ) or Input . is_key_pressed ( KEY_KP_ENTER )
    _screen = "wave_clear"
    _pending_submit = false
    _wave_enter_armed = false
    _wave_release_required = true
    _wave_replay_floor = _last_web_intent_id
    _pause_button . hide ( )
    _result_kicker . text = _text ( "Stage complete" , "공역 확보 완료" )
    _result_kicker . add_theme_color_override ( "font_color" , CYAN )
    _result_title . text = _text ( "Wave %02d cleared." % wave , "%d단계 방어 성공" % wave )
    _refresh_city_damage_view ( )
    _result . show ( )
    answer_edit . editable = false
    _keyboard . hide ( )
    _update_wave_enter_arming ( )
    flash_message ( _text ( "A quiet moment above Seoul." , "서울의 하늘이 잠시 고요해졌어요." ) )
func show_defeat ( score : int , words : int ) -> void :
    _queue_layout ( )
    _screen = "defeat"
    _result_score = score
    _result_words = words
    _pause_button . hide ( )
    _result_kicker . text = _text ( "Defense complete" , "방어 신호 끊김" )
    _result_kicker . add_theme_color_override ( "font_color" , AMBER )
    _result_title . text = _text ( "A city worth protecting." , "다시 지킬 수 있어요" )
    _refresh_city_damage_view ( )
    _result_button . text = _text ( "Defend again  →" , "다시 방어하기  →" )
    _result . show ( )
    _pause_card . hide ( )
    _targets_panel . hide ( )
    _keyboard . hide ( )
    answer_edit . editable = false
    _pulse_button . disabled = true
    flash_message ( _text ( "City damage reached 80%. Your 한글 progress stays with you." , "도시 피해가 80%에 도달했어요. 배운 한글은 남아요." ) , false )
func set_paused ( paused : bool ) -> void :
    _paused = paused
    if paused :
        _pending_submit = false
    _queue_layout ( )
    if not _ready_built :
        return
    _pause_card . visible = paused
    _targets_panel . visible = false
    answer_edit . editable = not paused and _screen == "playing"
    _pulse_button . disabled = paused or _current_charge < 100 or not _started
    if paused :
        answer_edit . release_focus ( )
        _keyboard . hide ( )
    elif _screen == "playing" :
        answer_edit . grab_focus ( )
func clear_answer ( ) -> void :
    if not is_instance_valid ( answer_edit ) :
        return
    answer_edit . clear ( )
    _last_was_composer = false
    answer_changed . emit ( "" )
func set_targets ( targets : Array ) -> void :
    if not _ready_built :
        return
    for i : int in range ( _target_rows . size ( ) ) :
        var row : Dictionary = _target_rows [ i ]
        row . row . visible = i < targets . size ( )
        if i >= targets . size ( ) :
            continue
        var target : Dictionary = targets [ i ]
        row . word . text = str ( target . get ( "word" , "" ) )
        row . meaning . text = str ( target . get ( "meaning" , "" ) )
        var danger : float = float ( target . get ( "danger" , 0.0 ) )
        if danger > 1.0 :
            danger /= 100.0
        row . danger . text = _text ( "CLOSE" , "위험" ) if danger > 0.72 else "%02d" % ( i + 1 )
        row . dot . add_theme_color_override ( "font_color" , RED if danger > 0.72 else AMBER )
    _status_label . visible = targets . is_empty ( )
    _status_label . text = _text ( "AIRSPACE CLEAR" , "접근 중인 미사일 없음" )
func set_scene_name ( scene : String ) -> void :
    _selected_scene = scene
    if not _ready_built :
        return
    _sector_label . text = "GWANGHWAMUN · 광화문" if scene == "gwanghwamun" else "NAMSAN DEFENSE · 남산"
func set_language ( locale : String ) -> void :
    language = "ko" if locale == "ko" else "en"
    set_sound_enabled ( sound_enabled )
    set_music_enabled ( music_enabled )
    set_reduced_motion ( reduced_motion )
    for entry : Dictionary in _labels :
        if is_instance_valid ( entry . node ) :
            entry . node . set ( "text" , entry [ language ] )
    if is_instance_valid ( answer_edit ) :
        answer_edit . placeholder_text = _text ( "Type the Korean word..." , "미사일의 한글 단어를 입력하세요" )
    _refresh_city_damage_view ( )
    _refresh_wave_enter_prompt ( )
    _queue_layout ( )
    flash_message ( _text ( "English interface / Korean words" , "한국어 인터페이스" ) )
func set_answer ( text : String ) -> void :
    if not is_instance_valid ( answer_edit ) :
        return
    answer_edit . text = text
    answer_edit . caret_column = text . length ( )
    _last_was_composer = false
    answer_changed . emit ( text )
func show_defeat_animation ( ) -> void :
    _queue_layout ( )
    _screen = "defeat_pending"
    _paused = false
    answer_edit . editable = false
    _pause_button . hide ( )
    _pulse_button . disabled = true
    _pause_card . hide ( )
    _result . hide ( )
    _keyboard . hide ( )
    flash_message ( _text ( "Defense lost. The city can be rebuilt." , "방어막이 무너졌어요. 도시는 다시 세울 수 있어요." ) , false )
