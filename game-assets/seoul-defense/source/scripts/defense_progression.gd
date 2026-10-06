extends RefCounted
# Bounded game difficulty, independent of camera paths or typography.
static func profile(wave: int, pace: String = "calm", compact: bool = false) -> Dictionary:
    var level := clampi(wave, 1, 12)
    var fast := pace != "calm"
    # Faster first approach; retain the late-stage minimum typing budget.
    var duration := maxf(8.5 if fast else 10.5, (15.99 if fast else 19.68) * pow(0.875 if fast else 0.88, level - 1))
    var interval := maxf(1.25 if fast else 1.55, (4.6 if fast else 5.8) * pow(0.78, level - 1))
    var limit: int = [2,3,4,4,5,5,6,6,6,6,6,6][level-1]
    if compact: limit = mini(limit, 4)
    return {"wave":level,"duration":duration,"spawn_interval":interval,"max_threats":limit,
        "burst":1 if level<3 else (2 if level<7 else 3),"wave_goal":14+mini(level-1,8)}
static func flight_duration(pace: String, wave: int, word_length: int) -> float:
    # Longer learner words retain extra reading/typing time even at high stages.
    return float(profile(wave,pace).duration) + maxi(0,word_length-2)*1.85
