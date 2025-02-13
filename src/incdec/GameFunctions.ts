import _ from "lodash";
import { animation } from "./animations";
import {game} from "./game";

import star from "./star_anim";
import { anim_fn_type, draw_fn_type, sound_fn_type } from "./interfaces";
import { events } from "./EventManager";
import { toggleMute } from "./Sound";
import { useContext } from "react";


type event = number[] 

let orig_disp = {"canvas" : [["display",[ 50, 10, 600, 600 ]],["anims",[ 50, 10, 600, 600 ]]],
    "button" : [["INC", [0, 620, 55, 25], "INC"], ["DEC", [100, 620, 55, 25], "DEC"]], "image":[]}

export let display : display_type = JSON.parse(JSON.stringify(orig_disp)); 


export function reset_fn(){
    display = JSON.parse(JSON.stringify(orig_disp));
}

export function add_event_listeners(g : game) {

}


export const  draw_fn : draw_fn_type = function(g :game, e : event[], canvas : string = "") {
    let draws : draw_command[] = [];
    draws.push({type:"drawText", x : 0, y : 100, 'text_': g.n.toString()})
    return draws; 
}

export const  anim_fn : anim_fn_type = function(g :game, e : event[])  {
    return []
}
export const  sound_fn : sound_fn_type = function(g :game, e : event[])  {
    return [undefined, []]; 
}


// button presses and game's prop_commands function) such as mouse and key presses return a list of pairs of strings ([s1, t1], ..., [sn , tn])

// For each i, if si is not "rerender", then GameDisplay calls props[si], with the game as the first arg,a and ti as the second arg 
// if si is "rerender", then GameDisplay re-renders. This is necessary if you change the display variable
// if si is "reset", then reset is called, which should clear everything


export function prop_commands(g : game) : [string, string][]{
        return []
    }


export function button_click(name : string, g : game): [string, string][]{
    if(name == "INC"){
        g.n++;
    }
    if(name == "DEC"){
        g.n--;
    }
    return [];
}
