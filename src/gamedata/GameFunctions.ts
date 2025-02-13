import _ from "lodash";
import { animation } from "../animations";
import {game} from "./game";

import star from "../star_anim";
import { anim_fn_type, draw_fn_type, sound_fn_type } from "../interfaces";
import { events } from "../EventManager";
import { toggleMute } from "../Sound";
import { useContext } from "react";


type event = number[] 

let orig_disp = ` {"canvas" : [["display",[ 50, 10, 600, 600 ]],["anims",[ 50, 10, 600, 600 ]]],
    "button" : [["pause", [0, 620, 55, 25], "PAUSE"], ["mute", [100, 620, 55, 25], "MUTE"]],
    "image" : [["bg.png", 50, 10]]}`

export let display : display_type = JSON.parse(orig_disp); 


export function reset_fn(){
    display = JSON.parse(orig_disp); 
}

export function add_event_listeners(g : game) {
    events["mousemove mover" ] = [function(e : MouseEvent, g : game){
        g.target_x = e.offsetX;
        g.target_y = e.offsetY; 
    }, g]

    events["keyup mute" ] = [function(e : KeyboardEvent) { if(e.key == "m" || e.key == "M"){toggleMute()} }, undefined];

}


export const  draw_fn : draw_fn_type = function(g :game, e : event[], canvas : string = "") {
    let draws : draw_command[] = [];
    
    if(g.win > 0){
        draws.push({type:"drawText", x : 0, y : 100, 'text_': "You win!"})
    } else { 
        for(let i=0; i < g.coins.length; i++){
            if(!g.collected[i]){
                draws.push({type:"drawCircle", x : g.coins[i][0], y : g.coins[i][1] , r : 22, color:"yellow", fill:true})
            }
        }
        // player
        draws.push({type:"drawCircle", x : g.x ,y : g.y, r : 3, color:"red", fill:true});

        if(_.every(g.collected, (x : boolean) => x == true)){
            draws.push({type:"drawCircle", x : g.exit[0],y :  g.exit[1], r : 3, color:"blue", fill:true});
        };    
    }
    return draws; 
}

export const  anim_fn : anim_fn_type = function(g :game, e : event[])  {
    let anim_lst : animation[] = []; 
    for(let item of e){
        for(let p of item){
            let [cx, cy] = g.coins[p]
            for(var i=0; i<50; i++){
                let new_star = new star(7,15,cx,cy,Math.random() * 2-1, Math.random() * 2-1, Math.random() * 2 * Math.PI, Math.random()/10, [Math.random() * 256,Math.random() * 256,Math.random() * 256], 60); 
                anim_lst.push(new_star);
            }
        }
    }
    return anim_lst; 
}
export const  sound_fn : sound_fn_type = function(g :game, e : event[])  {
    let sound = _.some(e, (x) => x.length != 0) ? ["bang.mp3"] : []
    return [_.every(g.collected) ? "b.ogg" : "a.ogg", sound]
}


// button presses and game's prop_commands function) such as mouse and key presses return a list of pairs of strings ([s1, t1], ..., [sn , tn])

// For each i, if si is not "rerender", then GameDisplay calls props[si], with the game as the first arg,a and ti as the second arg 
// if si is "rerender", then GameDisplay re-renders. This is necessary if you change the display variable
// if si is "reset", then reset is called, which should clear everything


export function prop_commands(g : game) : [string, string][]{
        if(g.win > 0 && g.time > g.win + 100){
            return [["win", ""], ["reset", ""]] as [string, string][];
        }
        if(_.every(g.collected) && display.image[0][0] == "bg.png"){
            display.image[0][0] = "bg2.png"
            return [["rerender", ""]]; 
        }
        return [];
    }


export function button_click(name : string, g : game): [string, string][]{
    if(name == "mute"){
        toggleMute();
    }
    if(name == "pause"){
        return [["pause",""]] as [string, string][]
    }
    return [];
}
