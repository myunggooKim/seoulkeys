extends RefCounted
static func lane_start ( lane : int , compact : bool = false , scene_name : String = "namsan" ) -> Vector3 :
    var starts = [ Vector3 ( -57 , 40 , -150 ) , Vector3 ( 60 , 44 , -172 ) , Vector3 ( -28 , 38 , -193 ) , Vector3 ( 31 , 46 , -211 ) ]
    var point : Vector3 = starts [ posmod ( lane , 4 ) ]
    if scene_name == "gwanghwamun" : point . y += 24.0
    if compact : point . x *= 0.42
    return point
static func start_for_target ( start : Vector3 , target : Vector3 , camera : Camera3D = null , lane : int = 0 , telemetry : Array = [ ] ) -> Vector3 :
    start . z = minf ( start . z , target . z - 75.0 )
    if camera :
        var viewport : Vector2 = camera . get_viewport ( ) . get_visible_rect ( ) . size
        var sky_y = viewport . y * [ 0.12 , 0.1 , 0.14 , 0.11 ] [ posmod ( lane , 4 ) ]
        var spans : Array = [ Vector2 ( 20.0 , viewport . x - 20.0 ) ]
        for rect in telemetry :
            var obstacle : Rect2 = rect . grow ( 8.0 )
            if sky_y < obstacle . position . y or sky_y > obstacle . end . y : continue
            var remaining : Array = [ ]
            for span in spans :
                if obstacle . end . x <= span . x or obstacle . position . x >= span . y : remaining . append ( span ) ; continue
                if obstacle . position . x > span . x : remaining . append ( Vector2 ( span . x , obstacle . position . x ) )
                if obstacle . end . x < span . y : remaining . append ( Vector2 ( obstacle . end . x , span . y ) )
            spans = remaining
        var open_sky = Vector2 ( viewport . x * 0.3 , viewport . x * 0.7 )
        var widest = 0.0
        for span in spans :
            if span . y - span . x > widest : open_sky = span ; widest = span . y - span . x
        var preferred = [ 0.22 , 0.78 , 0.4 , 0.61 ] [ posmod ( lane , 4 ) ]
        var choices : Array = [ preferred , 0.02 , 0.12 , 0.28 , 0.44 , 0.6 , 0.76 , 0.92 , 0.98 ]
        choices . sort_custom ( func ( a , b ) : return absf ( a - preferred ) < absf ( b - preferred ) )
        var best_score = INF
        for fraction in choices :
            var pixel = Vector2 ( lerpf ( open_sky . x , open_sky . y , fraction ) , sky_y )
            var candidate = _sky_origin ( camera , pixel , start . z , target . y + 16.0 )
            var score = _early_telemetry_overlap ( candidate , target , camera , telemetry )
            if score < best_score : best_score = score ; start = candidate
            if score <= 0.001 : break
        if best_score > 0.001 and viewport . x < 360.0 :
            var lower_y = viewport . y * 0.2
            for rect in telemetry : lower_y = maxf ( lower_y , rect . end . y + 18.0 )
            lower_y = minf ( lower_y , viewport . y * 0.25 )
            for fraction in choices :
                var pixel = Vector2 ( lerpf ( open_sky . x , open_sky . y , fraction ) , lower_y )
                var candidate = _sky_origin ( camera , pixel , start . z , target . y + 16.0 )
                var score = _early_telemetry_overlap ( candidate , target , camera , telemetry )
                if score < best_score : best_score = score ; start = candidate
                if score <= 0.001 : break
    start . y = maxf ( start . y , target . y + 16.0 )
    return start
static func _sky_origin ( camera : Camera3D , pixel : Vector2 , north_z : float , minimum_y : float ) -> Vector3 :
    var ray_origin = camera . project_ray_origin ( pixel )
    var ray_direction = camera . project_ray_normal ( pixel )
    var point = ray_origin + ray_direction * ( ( north_z - ray_origin . z ) / ray_direction . z )
    point . z = north_z
    point . y = maxf ( point . y , minimum_y )
    return point
static func _early_telemetry_overlap ( start : Vector3 , target : Vector3 , camera : Camera3D , telemetry : Array ) -> float :
    var score = 0.0
    var viewport = camera . get_viewport ( ) . get_visible_rect ( )
    for step in range ( 11 ) :
        var t = float ( step ) * 0.05
        var point = start . lerp ( target , t ) ; point . y += sin ( t * PI ) * 3.5
        var tangent = target - start ; tangent . y += cos ( t * PI ) * PI * 3.5
        var pose = Transform3D ( Basis . looking_at ( tangent . normalized ( ) ) . scaled ( Vector3 . ONE * 1.9 ) , point )
        var bounds = Rect2 ( camera . unproject_position ( point ) , Vector2 . ZERO )
        for x in [ -0.65 , 0.65 ] :
            for y in [ -0.6 , 0.6 ] :
                for z in [ -2.6 , 2.4 ] : bounds = bounds . expand ( camera . unproject_position ( pose * Vector3 ( x , y , z ) ) )
        if t <= 0.25 : score += maxf ( 0.0 , bounds . get_area ( ) - bounds . intersection ( viewport ) . get_area ( ) )
        for rect in telemetry : score += bounds . intersection ( rect . grow ( 2.0 ) ) . get_area ( )
    return score
static func flight_duration ( pace : String , wave : int , word_length : int ) -> float :
    return preload("res://scripts/defense_progression.gd").flight_duration(pace,wave,word_length)
static func card_scale ( position : Vector3 , start : Vector3 , target : Vector3 , camera_position : Vector3 , compact : bool = false ) -> float :
    var far_distance = camera_position . distance_to ( start )
    var near_distance = camera_position . distance_to ( target )
    var distance = camera_position . distance_to ( position )
    var far_inverse = 1.0 / maxf ( far_distance , 0.001 )
    var near_inverse = 1.0 / maxf ( near_distance , 0.001 )
    var inverse = 1.0 / maxf ( distance , 0.001 )
    var amount = clampf ( ( inverse - far_inverse ) / maxf ( 1e-06 , near_inverse - far_inverse ) , 0.0 , 1.0 )
    amount = amount * amount * ( 3.0 - 2.0 * amount )
    return lerpf ( 0.75 , 1.0 if compact else 1.1 , amount )
static func meaning_text ( meaning : String ) -> String :
    for character in meaning :
        if character . unicode_at ( 0 ) > 127 : return meaning
    return meaning . to_upper ( )
static var _font_clones : Dictionary = { }
static var _label_fonts : Dictionary = { }
static var _font_coverage : Dictionary = { }
static func _msdf_clone ( source : Font ) -> Font :
    var key = source . get_instance_id ( )
    if _font_clones . has ( key ) : return _font_clones [ key ]
    var result = source . duplicate ( ) as FontFile
    if result == null : return source
    result . fallbacks = [ ]
    result . multichannel_signed_distance_field = true
    result . msdf_pixel_range = 8
    result . msdf_size = 64
    var cloned_fallbacks : Array [ Font ] = [ ]
    for fallback in source . fallbacks : cloned_fallbacks . append ( _msdf_clone ( fallback ) )
    result . fallbacks = cloned_fallbacks
    _font_clones [ key ] = result
    return result
static func _supports ( source : Font , character : String ) -> bool :
    var key = source . get_instance_id ( )
    if not _font_coverage . has ( key ) :
        var primary = source . duplicate ( ) as FontFile
        if primary :
            primary . fallbacks = [ ] ; primary . allow_system_fallback = false
            _font_coverage [ key ] = primary
        else : _font_coverage [ key ] = source
    return _font_coverage [ key ] . has_char ( character . unicode_at ( 0 ) )
static func label_font ( source : Font , text : String = "" ) -> Font :
    if source == null : return null
    var full_font = _msdf_clone ( source )
    if text . is_empty ( ) or source . fallbacks . is_empty ( ) : return full_font
    var required : Dictionary = { }
    for character in text :
        if _supports ( source , character ) : continue
        for index in range ( source . fallbacks . size ( ) ) :
            if _supports ( source . fallbacks [ index ] , character ) :
                required [ index ] = true ; break
    var required_indices = required . keys ( )
    required_indices . sort ( )
    var key = str ( source . get_instance_id ( ) ) + ":" + str ( required_indices )
    if _label_fonts . has ( key ) : return _label_fonts [ key ]
    var selected = full_font . duplicate ( ) as FontFile
    var selected_fallbacks : Array [ Font ] = [ ]
    for index in range ( source . fallbacks . size ( ) ) :
        if required . has ( index ) : selected_fallbacks . append ( _msdf_clone ( source . fallbacks [ index ] ) )
    selected . fallbacks = selected_fallbacks
    _label_fonts [ key ] = selected
    return selected
static func clear_font_cache ( ) -> void :
    _label_fonts . clear ( ) ; _font_clones . clear ( ) ; _font_coverage . clear ( )
static func place_card ( size : Vector2 , body : Rect2 , area : Rect2 , bodies : Array , cards : Array , state : Dictionary ) -> Vector2 :
    if area.size.x <= 0.5 or area.size.y <= 0.5: return area.position
    var safe_area = area . grow ( -0.25 )
    var available = ( safe_area . size - size ) . max ( Vector2 . ZERO )
    if state . has ( "approach_anchor" ) and state . get ( "approach_area" , Rect2 ( ) ) == area :
        var anchored : Vector2 = safe_area . position + available * state . approach_anchor
        if _clear_card ( Rect2 ( anchored , size ) , bodies , cards ) and _anchor_near_body ( Rect2 ( anchored , size ) , body , area ) : return anchored
    var prior_state = state . duplicate ( )
    var preferred : Vector2 = preload ( "res://scripts/defense_labels.gd" ) . place ( size , body , safe_area , bodies , cards , prior_state )
    if _clear_card ( Rect2 ( preferred , size ) , bodies , cards ) and _anchor_near_body ( Rect2 ( preferred , size ) , body , area ) :
        state . merge ( prior_state , true )
        state . erase ( "approach_anchor" )
        return preferred
    var body_preferred = Vector2 ( body . get_center ( ) . x - size . x * 0.5 , body . position . y - size . y - 14.0 )
    var best = preferred
    var best_cost = INF
    var found = false
    for row in range ( 17 ) :
        for column in range ( 9 ) :
            var anchor = Vector2 ( float ( column ) / 8.0 , float ( row ) / 16.0 )
            var candidate = safe_area . position + available * anchor
            if not _clear_card ( Rect2 ( candidate , size ) , bodies , cards ) : continue
            var cost = candidate . distance_squared_to ( body_preferred )
            if cost < best_cost :
                best = candidate ; best_cost = cost ; found = true
    if found :
        state . approach_anchor = ( best - safe_area . position ) / available . max ( Vector2 . ONE )
        state . approach_area = area
    else :
        state . merge ( prior_state , true )
        state . erase ( "approach_anchor" )
    return best
static func _anchor_near_body ( card : Rect2 , body : Rect2 , area : Rect2 ) -> bool :
    var center = body . get_center ( )
    if not area . has_point ( center ) : return true
    var nearest = Vector2 ( clampf ( center . x , card . position . x , card . end . x ) , clampf ( center . y , card . position . y , card . end . y ) )
    return nearest . distance_to ( center ) <= 180.0
static func _clear_card ( card : Rect2 , bodies : Array , cards : Array ) -> bool :
    for other in bodies :
        if card . intersects ( other . grow ( 2.0 ) ) : return false
    for other in cards :
        if card . intersects ( other . grow ( 4.0 ) ) : return false
    return true
static func place_cards ( requests : Array , area : Rect2 , bodies : Array ) -> Array :
    var positions : Array = [ ]
    if area.size.x <= 0.5 or area.size.y <= 0.5:
        for request in requests: positions.append(area.position)
        return positions
    var cards : Array = [ ]
    var clear = true
    for request in requests :
        var point = place_card ( request . size , request . body , area , bodies , cards , request . state )
        positions . append ( point )
        var card = Rect2 ( point , request . size )
        if not _clear_card ( card , bodies , cards ) : clear = false
        cards . append ( card )
    if clear : return positions
    var candidates : Array = [ ]
    var safe_area = area . grow ( -0.25 )
    for index in range ( requests . size ( ) ) :
        var request : Dictionary = requests [ index ]
        var available : Vector2 = ( safe_area . size - request . size ) . max ( Vector2 . ZERO )
        var options : Array = [ ]
        for row in range ( 17 ) :
            for column in range ( 9 ) :
                var candidate = safe_area . position + available * Vector2 ( float ( column ) / 8.0 , float ( row ) / 16.0 )
                if _clear_card ( Rect2 ( candidate , request . size ) , bodies , [ ] ) : options . append ( candidate )
        var xs : Array = [ safe_area . position . x , safe_area . end . x - request . size . x ]
        var ys : Array = [ safe_area . position . y , safe_area . end . y - request . size . y ]
        for other in requests :
            xs . append ( safe_area . position . x + other . size . x + 4.5 )
            xs . append ( safe_area . end . x - request . size . x - other . size . x - 4.5 )
            ys . append ( safe_area . position . y + other . size . y + 4.5 )
            ys . append ( safe_area . end . y - request . size . y - other . size . y - 4.5 )
        for obstacle in bodies :
            xs . append ( obstacle . position . x - request . size . x - 2.5 ) ; xs . append ( obstacle . end . x + 2.5 )
            ys . append ( obstacle . position . y - request . size . y - 2.5 ) ; ys . append ( obstacle . end . y + 2.5 )
        for y in ys :
            for x in xs :
                var candidate = Vector2 ( x , y )
                var card = Rect2 ( candidate , request . size )
                if safe_area . encloses ( card ) and _clear_card ( card , bodies , [ ] ) : options . append ( candidate )
        var unique : Dictionary = { }
        for point in options : unique [ Vector2 ( roundf ( point . x * 4.0 ) , roundf ( point . y * 4.0 ) ) ] = point
        options = unique . values ( )
        options . sort_custom ( func ( a , b ) : return roundi ( a . y * 2.0 ) < roundi ( b . y * 2.0 ) if roundi ( a . y * 2.0 ) != roundi ( b . y * 2.0 ) else a . x < b . x )
        candidates . append ( options )
    var packed : Array = [ ]
    packed . resize ( requests . size ( ) )
    if _pack_next ( requests , candidates , packed , [ ] , { "steps" : 0 } ) :
        for index in range ( requests . size ( ) ) :
            var available : Vector2 = ( safe_area . size - requests [ index ] . size ) . max ( Vector2 . ONE )
            requests [ index ] . state . approach_anchor = ( packed [ index ] - safe_area . position ) / available
            requests [ index ] . state . approach_area = area
        return packed
    return positions
static func _pack_next ( requests : Array , candidates : Array , positions : Array , cards : Array , budget : Dictionary ) -> bool :
    var index = -1
    var options : Array = [ ]
    for candidate_index in range ( requests . size ( ) ) :
        if positions [ candidate_index ] != null : continue
        var available_options : Array = [ ]
        for point in candidates [ candidate_index ] :
            if _clear_card ( Rect2 ( point , requests [ candidate_index ] . size ) , [ ] , cards ) : available_options . append ( point )
        if available_options . is_empty ( ) : return false
        if index == -1 or available_options . size ( ) < options . size ( ) :
            index = candidate_index ; options = available_options
    if index == -1 : return true
    for point in options :
        budget . steps += 1
        if budget . steps > 12000 : return false
        positions [ index ] = point ; cards . append ( Rect2 ( point , requests [ index ] . size ) )
        if _pack_next ( requests , candidates , positions , cards , budget ) : return true
        positions [ index ] = null ; cards . pop_back ( )
    return false
static func leader_points ( card : Rect2 , screen : Vector2 , viewport : Rect2 ) -> PackedVector2Array :
    if viewport . has_point ( screen ) :
        var link = Vector2 ( clampf ( screen . x , card . position . x , card . end . x ) , clampf ( screen . y , card . position . y , card . end . y ) )
        return PackedVector2Array ( [ link , screen ] )
    var direction = Vector2 . ZERO
    var anchor = card . get_center ( )
    if screen . x < viewport . position . x :
        direction = Vector2 . LEFT ; anchor . x = card . position . x - 1.0
    elif screen . x >= viewport . end . x :
        direction = Vector2 . RIGHT ; anchor . x = card . end . x + 1.0
    elif screen . y < viewport . position . y :
        direction = Vector2 . UP ; anchor . y = card . position . y - 1.0
    else :
        direction = Vector2 . DOWN ; anchor . y = card . end . y + 1.0
    var tip = anchor + direction * 7.0
    var side = Vector2 ( - direction . y , direction . x ) * 3.0
    return PackedVector2Array ( [ anchor , tip , tip - direction * 3.0 + side , tip , tip - direction * 3.0 - side ] )
