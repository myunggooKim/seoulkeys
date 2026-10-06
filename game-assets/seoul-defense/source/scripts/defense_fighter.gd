extends RefCounted
# Fictional arcade encounter. A new arrival occurs once per stage from stage 5.
const FIRST_STAGE := 5
const HARD_WORDS := ["흐리멍덩하다", "뒤죽박죽", "어리둥절하다", "알쏭달쏭하다", "우왕좌왕하다", "쭈뼛쭈뼛하다"]
const PERIOD := 13.0
var age := 0.0
var drops := 0
var hits := 0
var active := false
var model: Node3D
var mount: Node3D
var camera: Camera3D
var _next_drop := 2.3
func configure(body: Node3D, view: Camera3D) -> void:
 model=body;camera=view;mount=model.find_child("fighter_missile_mount",true,false)
 age=0.0;drops=0;hits=0;active=true;_next_drop=2.3
 _pose()
func word_for_stage(stage: int) -> String:
 return HARD_WORDS[posmod(stage-FIRST_STAGE,HARD_WORDS.size())]
func advance(delta: float, suspended: bool=false) -> bool:
 if not active or suspended or delta<=0 or not is_finite(delta):return false
 age+=delta;_pose()
 if age>=_next_drop:
  _next_drop+=PERIOD/2.0;drops+=1;return true
 return false
func _world_at(t: float) -> Vector3:
 var size: Vector2=camera.get_viewport().get_visible_rect().size
 # Broad, continuous oval in the upper playfield, wholly within the screen.
 var angle: float=t*TAU/PERIOD
 var pixel:=Vector2(size.x*(0.5+0.24*sin(angle)),size.y*(0.235+0.025*cos(angle)))
 var ray:=camera.project_ray_normal(pixel)
 return camera.project_ray_origin(pixel)+ray*(65.0 if size.x>=680 else 60.0)
func _pose() -> void:
 if not is_instance_valid(model) or not is_instance_valid(camera):return
 var p:=_world_at(age);var ahead:=_world_at(age+0.025)
 model.global_position=p
 if p.distance_squared_to(ahead)>0.00001:model.look_at(ahead,Vector3.UP)
 model.rotate_object_local(Vector3.FORWARD,deg_to_rad(26.0)*cos(age*TAU/PERIOD))
 var viewport: Vector2=camera.get_viewport().get_visible_rect().size
 var size: float=0.85 if viewport.x>=680 else 0.55
 model.scale=Vector3.ONE*size
func drop_position() -> Vector3:
 return mount.global_position if is_instance_valid(mount) else model.global_position
func clear() -> void:
 active=false;model=null;mount=null;camera=null
func state() -> Dictionary:
 return {"active":active,"age":age,"drops":drops,"hits":hits,"pass":int(age/(PERIOD/2.0))}
