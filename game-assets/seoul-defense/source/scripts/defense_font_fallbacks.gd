extends RefCounted
static func apply_to ( font : Font ) -> void :
    if font == null :
        return
    var bundled : Array [ Font ] = [
        preload ( "res://fonts/fallback-latin-cyrillic.ttf" ) ,
        preload ( "res://fonts/fallback-cjk.otf" ) ,
        preload ( "res://fonts/fallback-arabic.ttf" ) ,
        preload ( "res://fonts/fallback-thai.ttf" ) ,
        preload ( "res://fonts/fallback-myanmar.ttf" ) ,
        preload ( "res://fonts/fallback-khmer.ttf" ) ,
        preload ( "res://fonts/fallback-lao.ttf" ) ,
        preload ( "res://fonts/fallback-devanagari.ttf" ) ,
        preload ( "res://fonts/fallback-bengali.ttf" ) ,
        preload ( "res://fonts/fallback-tamil.ttf" ) ,
        preload ( "res://fonts/fallback-sinhala.ttf" ) ,
        preload ( "res://fonts/fallback-georgian.ttf" ) ,
        preload ( "res://fonts/fallback-symbols.ttf" ) ,
        preload ( "res://fonts/fallback-symbols2.ttf" ) ,
        preload ( "res://fonts/fallback-math.ttf" ) ,
    ]
    font . fallbacks = bundled
