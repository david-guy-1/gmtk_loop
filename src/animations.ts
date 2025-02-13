import { clear, draw } from "./process_draws";

export interface animation{
  update : (...a : any) => boolean; // true = remove 
  draw : (...a : any) => draw_command[]; 
}


// mutates 
export function update_all(animations : animation[], ...args : any) : void{
    for(var i = animations.length-1; i>=0; i--){
        var result = animations[i].update(args);
        if(result){
            animations.splice(i, 1);
        } 
    }
}
// mutates 

export function add_drawings(commands : draw_command[], animations:animation[], ...args : any) : void{
    for(var animation of animations){
        var new_commands=animation.draw(args);
        commands.push(...new_commands);
    }

}


export function update_and_draw(anim_lst : animation[], cRef : any, should_clear : boolean = true){
    if(should_clear){
        clear(cRef);
    }
    var lst : draw_command[] = []; 
    update_all(anim_lst); 
    add_drawings(lst, anim_lst);
     draw(lst,cRef);
}