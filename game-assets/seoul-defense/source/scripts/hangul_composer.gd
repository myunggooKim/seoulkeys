class_name HangulComposer
extends RefCounted
const INITIALS : Array [ String ] = [ "ㄱ" , "ㄲ" , "ㄴ" , "ㄷ" , "ㄸ" , "ㄹ" , "ㅁ" , "ㅂ" , "ㅃ" , "ㅅ" , "ㅆ" , "ㅇ" , "ㅈ" , "ㅉ" , "ㅊ" , "ㅋ" , "ㅌ" , "ㅍ" , "ㅎ" ]
const MEDIALS : Array [ String ] = [ "ㅏ" , "ㅐ" , "ㅑ" , "ㅒ" , "ㅓ" , "ㅔ" , "ㅕ" , "ㅖ" , "ㅗ" , "ㅘ" , "ㅙ" , "ㅚ" , "ㅛ" , "ㅜ" , "ㅝ" , "ㅞ" , "ㅟ" , "ㅠ" , "ㅡ" , "ㅢ" , "ㅣ" ]
const FINALS : Array [ String ] = [ "" , "ㄱ" , "ㄲ" , "ㄳ" , "ㄴ" , "ㄵ" , "ㄶ" , "ㄷ" , "ㄹ" , "ㄺ" , "ㄻ" , "ㄼ" , "ㄽ" , "ㄾ" , "ㄿ" , "ㅀ" , "ㅁ" , "ㅂ" , "ㅄ" , "ㅅ" , "ㅆ" , "ㅇ" , "ㅈ" , "ㅊ" , "ㅋ" , "ㅌ" , "ㅍ" , "ㅎ" ]
const MEDIAL_PAIRS : Dictionary = { "ㅗㅏ" : "ㅘ" , "ㅗㅐ" : "ㅙ" , "ㅗㅣ" : "ㅚ" , "ㅜㅓ" : "ㅝ" , "ㅜㅔ" : "ㅞ" , "ㅜㅣ" : "ㅟ" , "ㅡㅣ" : "ㅢ" }
const FINAL_PAIRS : Dictionary = { "ㄱㅅ" : "ㄳ" , "ㄴㅈ" : "ㄵ" , "ㄴㅎ" : "ㄶ" , "ㄹㄱ" : "ㄺ" , "ㄹㅁ" : "ㄻ" , "ㄹㅂ" : "ㄼ" , "ㄹㅅ" : "ㄽ" , "ㄹㅌ" : "ㄾ" , "ㄹㅍ" : "ㄿ" , "ㄹㅎ" : "ㅀ" , "ㅂㅅ" : "ㅄ" }
const KEY_JAMO : Dictionary = {
    KEY_Q : "ㅂ" , KEY_W : "ㅈ" , KEY_E : "ㄷ" , KEY_R : "ㄱ" , KEY_T : "ㅅ" , KEY_Y : "ㅛ" , KEY_U : "ㅕ" , KEY_I : "ㅑ" , KEY_O : "ㅐ" , KEY_P : "ㅔ" ,
    KEY_A : "ㅁ" , KEY_S : "ㄴ" , KEY_D : "ㅇ" , KEY_F : "ㄹ" , KEY_G : "ㅎ" , KEY_H : "ㅗ" , KEY_J : "ㅓ" , KEY_K : "ㅏ" , KEY_L : "ㅣ" ,
    KEY_Z : "ㅋ" , KEY_X : "ㅌ" , KEY_C : "ㅊ" , KEY_V : "ㅍ" , KEY_B : "ㅠ" , KEY_N : "ㅜ" , KEY_M : "ㅡ"
}
const SHIFTED : Dictionary = { "ㅂ" : "ㅃ" , "ㅈ" : "ㅉ" , "ㄷ" : "ㄸ" , "ㄱ" : "ㄲ" , "ㅅ" : "ㅆ" , "ㅐ" : "ㅒ" , "ㅔ" : "ㅖ" }
static func syllable ( initial : String , medial : String , final_jamo : String = "" ) -> String :
    var i : int = INITIALS . find ( initial )
    var m : int = MEDIALS . find ( medial )
    var f : int = FINALS . find ( final_jamo )
    if i < 0 or m < 0 or f < 0 :
        return initial + medial + final_jamo
    return String . chr ( 44032 + ( i * 21 + m ) * 28 + f )
static func parts_of ( character : String ) -> Dictionary :
    if character . is_empty ( ) :
        return { }
    var code : int = character . unicode_at ( 0 )
    if code < 44032 or code > 55203 :
        return { }
    var index : int = code - 44032
    return { "initial" : INITIALS [ index / 588 ] , "medial" : MEDIALS [ ( index % 588 ) / 28 ] , "final" : FINALS [ index % 28 ] }
static func split_pair ( pairs : Dictionary , combined : String ) -> String :
    for pair : String in pairs :
        if pairs [ pair ] == combined :
            return pair
    return ""
static func append_jamo ( text : String , jamo : String ) -> String :
    var head : String = text . left ( text . length ( ) - 1 ) if not text . is_empty ( ) else ""
    var last : String = text . right ( 1 )
    var parts : Dictionary = parts_of ( last )
    if jamo in MEDIALS :
        if not parts . is_empty ( ) :
            if not parts . final . is_empty ( ) :
                var split : String = split_pair ( FINAL_PAIRS , parts . final )
                var moved : String = split . right ( 1 ) if not split . is_empty ( ) else parts . final
                var kept : String = split . left ( 1 ) if not split . is_empty ( ) else ""
                return head + syllable ( parts . initial , parts . medial , kept ) + syllable ( moved , jamo )
            var fused : String = MEDIAL_PAIRS . get ( parts . medial + jamo , "" )
            return head + syllable ( parts . initial , fused ) if not fused . is_empty ( ) else text + jamo
        if last in INITIALS :
            return head + syllable ( last , jamo )
        return text + jamo
    if jamo in INITIALS or jamo in FINALS :
        if not parts . is_empty ( ) :
            if parts . final . is_empty ( ) and jamo in FINALS :
                return head + syllable ( parts . initial , parts . medial , jamo )
            if not parts . final . is_empty ( ) :
                var fused : String = FINAL_PAIRS . get ( parts . final + jamo , "" )
                if not fused . is_empty ( ) :
                    return head + syllable ( parts . initial , parts . medial , fused )
    return text + jamo
static func delete_jamo ( text : String ) -> String :
    if text . is_empty ( ) :
        return text
    var head : String = text . left ( text . length ( ) - 1 )
    var parts : Dictionary = parts_of ( text . right ( 1 ) )
    if parts . is_empty ( ) :
        return head
    if not parts . final . is_empty ( ) :
        var split : String = split_pair ( FINAL_PAIRS , parts . final )
        return head + syllable ( parts . initial , parts . medial , split . left ( 1 ) if not split . is_empty ( ) else "" )
    var split : String = split_pair ( MEDIAL_PAIRS , parts . medial )
    return head + syllable ( parts . initial , split . left ( 1 ) ) if not split . is_empty ( ) else head + parts . initial
static func jamo_for_key ( event : InputEventKey ) -> String :
    if event . ctrl_pressed or event . meta_pressed or event . alt_pressed :
        return ""
    if not ( ( event . unicode >= 65 and event . unicode <= 90 ) or ( event . unicode >= 97 and event . unicode <= 122 ) ) :
        return ""
    var key : int = event . physical_keycode if event . physical_keycode != 0 else event . keycode
    var base : String = KEY_JAMO . get ( key , "" )
    return SHIFTED . get ( base , base ) if event . shift_pressed else base
static func insert_at ( text : String , from : int , to : int , jamo : String ) -> Dictionary :
    from = clampi ( from , 0 , text . length ( ) )
    to = clampi ( to , from , text . length ( ) )
    var prefix : String = text . left ( from )
    var edited : String = append_jamo ( prefix , jamo ) if from == to else prefix + append_jamo ( "" , jamo )
    return { "text" : edited + text . substr ( to ) , "caret" : edited . length ( ) }
static func backspace_at ( text : String , from : int , to : int ) -> Dictionary :
    from = clampi ( from , 0 , text . length ( ) )
    to = clampi ( to , from , text . length ( ) )
    var prefix : String = text . left ( from )
    var edited : String = delete_jamo ( prefix ) if from == to else prefix
    return { "text" : edited + text . substr ( to ) , "caret" : edited . length ( ) }
