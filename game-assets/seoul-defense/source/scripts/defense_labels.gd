extends RefCounted
static func place ( size : Vector2 , body : Rect2 , area : Rect2 , bodies : Array , cards : Array , state : Dictionary = { } ) -> Vector2 :
    var preferred = Vector2 ( body . get_center ( ) . x - size . x * 0.5 , body . position . y - size . y - 14 )
    var candidates : Array [ Vector2 ] = [ preferred ,
        Vector2 ( body . position . x - size . x - 16 , body . get_center ( ) . y - size . y * 0.5 ) ,
        Vector2 ( body . end . x + 16 , body . get_center ( ) . y - size . y * 0.5 ) ,
        Vector2 ( body . get_center ( ) . x - size . x * 0.5 , body . end . y + 16 ) ]
    for column in [ 0.0 , 0.5 , 1.0 ] :
        for row in [ 0.0 , 0.33 , 0.66 , 1.0 ] :
            candidates . append ( area . position + Vector2 ( ( area . size . x - size . x ) * column , ( area . size . y - size . y ) * row ) )
    var costs : Array [ float ] = [ ]
    var overlaps : Array [ float ] = [ ]
    var best_index = 0
    var best_cost = INF
    for index in range ( candidates . size ( ) ) :
        var candidate = candidates [ index ]
        candidate . x = clampf ( candidate . x , area . position . x , maxf ( area . position . x , area . end . x - size . x ) )
        candidate . y = clampf ( candidate . y , area . position . y , maxf ( area . position . y , area . end . y - size . y ) )
        candidates [ index ] = candidate
        var card = Rect2 ( candidate , size )
        var cost = candidate . distance_to ( preferred )
        var overlap = 0.0
        for other in bodies :
            cost += card . intersection ( other . grow ( 9 ) ) . get_area ( ) * 200.0
            overlap += card . intersection ( other . grow ( 2 ) ) . get_area ( )
        for other in cards :
            cost += card . intersection ( other . grow ( 8 ) ) . get_area ( ) * 400.0
            overlap += card . intersection ( other . grow ( 2 ) ) . get_area ( )
        costs . append ( cost ) ; overlaps . append ( overlap )
        if cost < best_cost - 0.5 :
            best_cost = cost ; best_index = index
    var same_area = state . has ( "area" ) and state . area . is_equal_approx ( area )
    var current = int ( state . get ( "anchor" , -1 ) )
    if same_area and current >= 0 and current < candidates . size ( ) :
        if overlaps [ current ] <= 0.5 or costs [ current ] - costs [ best_index ] < 24.0 or overlaps [ best_index ] >= overlaps [ current ] - 0.5 :
            best_index = current
    state . anchor = best_index
    state . area = area
    state . position = candidates [ best_index ]
    return candidates [ best_index ]
