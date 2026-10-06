extends RefCounted
const THRESHOLD := 3.0
const COALESCE_SECONDS := 0.85
var clock := 0.0
var last_alert := -100.0
var emitted := 0
func reset() -> void:
    clock=0.0;last_alert=-100.0;emitted=0
static func remaining_seconds(threat: Dictionary, field_seconds: float = 0.0) -> float:
    if bool(threat.get("locked",false)) or bool(threat.get("nonthreatening",false)): return INF
    var ordinary := maxf(0.0,(1.0-float(threat.get("t",0.0)))*float(threat.get("duration",0.0)))
    var field := maxf(0.0,field_seconds)
    var slowed_distance := field*0.23
    return ordinary/0.23 if field>0 and ordinary<=slowed_distance else ordinary + field*0.77
func advance(delta: float, threats: Array, field_seconds: float = 0.0, active: bool = true) -> bool:
    if not active or delta<=0.0 or not is_finite(delta): return false
    clock+=delta
    var crossed := false
    for threat: Dictionary in threats:
        if bool(threat.get("impact_alerted",false)):continue
        var remaining := remaining_seconds(threat,field_seconds)
        if remaining>0.0 and remaining<=THRESHOLD+0.000001:
            # Mark every simultaneous crossing, even when the cue is coalesced.
            threat["impact_alerted"]=true
            crossed=true
    if not crossed or clock-last_alert<COALESCE_SECONDS:return false
    last_alert=clock;emitted+=1
    return true
