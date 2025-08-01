/*
game, draw_fn, anim_fn, sound_fn, add_event_listeners, button_click, prop_commands, prop_fns, display, reset_fn

*/

import _ from "lodash";
import { animation } from "../animations";
import { d_circle, d_image, d_line, d_line2, d_text } from "../canvasDrawing";
import GameDisplay from "../GameDisplay";
import { anim_fn_type, button_click_type, display_type, draw_fn_type, events_type, gamedata, init_type, point, prop_commands_type, props_to_run, reset_fn_type, sound_fn_type } from "../interfaces";
import game from "./game";
import { death_anim, explos_anim } from "./animations";
import { combine_obj, lincomb, rescale } from "../lines";
import { get_orb } from "./items_to_draw";
import { displace_command } from "../rotation";
import { globalStore_type } from "./globalStore";
const CANVAS_WIDTH=800;
const CANVAS_HEIGHT=700;
export let display : display_type = {
    "button" : [],
    "canvas" : [["main",[0,0,CANVAS_WIDTH,CANVAS_HEIGHT]], ["anim_canvas",[0,0,CANVAS_WIDTH,CANVAS_HEIGHT]]],
    "image" : [],
    "text":[] 
}


export let draw_fn : draw_fn_type = function(g : game,globalStore : globalStore_type , events : any[] , canvas : string){
    let output : draw_command[] = []; 

    if(canvas == "main"){
        for(let item of g.items){
            if(item[0].slice(0,4) == "orb_"){
                output.push(globalStore.loaded_imgs[item[0]].output(item[1][0], item[1][1]));
            }
            if(item[0].slice(0, 5) == "move_" && g.room != "demon"){
                output.push(globalStore.loaded_imgs["move"].output(item[1][0], item[1][1]))
            }
            if(item[0] == "enchantment"){
                output.push(d_image("enchantment.png", item[1][0]-83, item[1][1] - 99));
                if(_.some(events, x=>x.type == "enchantment")){
                    output.push(d_text(g.passed_traps ? "click to enchant sword" : "enchantment crystal", [100, 450]))
                } else {
                   // console.log("no draw");
                }
            }
        }
        if(g.room == "main"){
            if(_.some(events, x => x.type == "enchantment dead")){
                g.paused = true;
                globalStore.death_anim = "enchantment";
                globalStore.anim_time = g.time;
            }
            if(globalStore.death_anim == "enchantment" && globalStore.anim_time != undefined){
                let delay = g.time - globalStore.anim_time;
                if(delay >= 60 * g.n_colors){
                    g.dead = "The enchantment crystal was unstable and killed you";
                } else { 
                    let color = Math.floor(delay/60);
                    let size = delay % 60
                    output.push(combine_obj({"color":g.ench_colors[color], "fill":true, "transparency":1-size/60}, d_circle(180, 180, size*6)) as drawCircle_command)
                }
            }
        }
        if(g.room == "traps"){
            //draw the traps
            if(globalStore.death_anim != "trap" ){
                for(let i=0; i < g.n_trap_rows; i++){
                    for(let j=0; j < g.n_traps; j++){
                        let point = [35*j+10, 100*i+90];
                        output.push(d_image("trap_1.png", point));
                    }
                }
            }
            if(_.some(events, x => x.type == "trap")){
                // stepped into a trap
                g.paused = true; 
                globalStore.anim_time = g.time;
                globalStore.death_anim = "trap"
            }
            if(globalStore.death_anim == "trap" && globalStore.anim_time != undefined){
                let anim = Math.min(Math.floor((g.time - globalStore.anim_time)/20) + 2, 6);
                if(anim == 6){
                    g.dead = "Walked into a trap"
                }
                for(let i=0; i < g.n_trap_rows; i++){
                    for(let j=0; j < g.n_traps; j++){

                        let point = [35*j+10, 100*i+90];
                        output.push(d_image(`trap_${g.trap_safe_points[i] == j ? 1 : anim}.png`, point));
                    }
                }                
            }
            if(g.player[1] > 539){
                output.push(d_text("You find a sword on the ground", [100, 560]));
            }
        }
        for(let wall of g.walls){
            output.push(d_line2(wall));
        }
        if(g.room == "demon"){
            if(g.passed_traps){
                output.push(d_text("You can't defeat me with an unenchanted sword!", [100, 450]))
            }
            output.push(globalStore.loaded_imgs["demon"].output(CANVAS_WIDTH/2, 200));
            output.push(globalStore.loaded_imgs["left claw"].output(CANVAS_WIDTH/2-50, 250));
            output.push(globalStore.loaded_imgs["right claw"].output(CANVAS_WIDTH/2+50, 250));
            if(globalStore.enter_demon_room == undefined){
                globalStore.enter_demon_room = g.time;
            } else {
                let gap = g.time - globalStore.enter_demon_room; 
                if(gap > 250){
                    g.dead = "Died to the demon";
                }
                if(gap > 100 && gap <= 250){
                    // demon smash
                    g.paused = true;
                    globalStore.death_anim = "demon smash" 
                    gap = gap - 100; 
                    let y_val = Math.sin(Math.pow(gap, 1.5) * Math.PI / Math.pow(150, 1.5)*1.4) * 100
                    output[output.length-1] = displace_command(output[output.length-1], [0, -y_val]);
                    output[output.length-2] = displace_command(output[output.length-2], [0, -y_val]);
                    // show where hidden door is.
                    output.push(globalStore.loaded_imgs["move"].output(g.hidden_door[0], g.hidden_door[1]))
                    output.push(combine_obj(d_circle(lincomb(1, g.hidden_door, 20, [Math.random()-0.5,Math.random()-0.5]), Math.random()*3+3), {"fill":true, "color":`hsl(${Math.random()*360}, 100%, ${50 + Math.random() * 25}%)`}) as drawCircle_command)
                }
            }
        } else {
            globalStore.enter_demon_room = undefined; 
        }
        if(g.room == "volcano"){
            if(globalStore.death_anim.length == 0){
                globalStore.death_anim = "volcano";
                globalStore.anim_time = g.time;
                g.paused = true; 
            }
            let delay = g.time - (globalStore.anim_time ?? 0);
            let top = [600, 642]; 
            // draw at (x, y) such that [1590, 642] in image = CANVAS_WIDTH/2, CANVAS_HEIGHT/2 on screen 
            let offset = lincomb(-1, top, 1,[CANVAS_WIDTH/2, CANVAS_HEIGHT/2] ) as point;
            let fall_time = 600; 
            if(delay > 30){
                let delay_2 = delay - 30;
                offset[1] -= rescale(0, 1, 0, 2250-650, Math.pow(Math.min(1, delay_2/fall_time),1.5)) 
            }
            output.push(d_image("megacano_true.png", offset)) 
            if(delay < fall_time + 30){
                output.push(displace_command(d_image("vite.svg",[CANVAS_WIDTH/2, CANVAS_HEIGHT/2] ), [-20, -20]))
            } else { 
                g.dead = "Fell into a volcano."
            }
        }
        if(g.room != "volcano"){
            output.push(displace_command(d_image("vite.svg", g.player), [-20, -20])); 
        }
        if(g.dead.length > 0){
            output.push(d_text(g.dead, 10 , 400 ))
        }
                
    }
    return [output,true];
}

export let anim_fn : anim_fn_type = function(g: game, globalStore: globalStore_type, events: any[]) {
    let output : animation<game>[] = []; 
    if(g.dead.length > 0 && globalStore.death_anim == "demon smash"){
        globalStore.death_anim = ""
        output.push(new death_anim()); 
    }
    for(let event of events){
        if(event.type == "touched orb"){
            let color :string = event.color;
            output.push(new explos_anim(event.location, color)); 
        }
    }
    return output;
}

export let sound_fn : sound_fn_type = function(g : game, globalStore : globalStore_type ,events : events_type[]){
    return [undefined,[]]
}

export let prop_commands : prop_commands_type = function(g : game,globalStore : globalStore_type, events : events_type[]){
    let output : props_to_run = []; 
    return output; 
}

export let button_click : button_click_type = function(g : game,globalStore : globalStore_type, name : string){
    return []
}

export let reset_fn : reset_fn_type = function() {
    return ; 
}
export let init : init_type = function(g : game, globalStore : globalStore_type){
    return ;
}


export let data_obj : gamedata =  {
    draw_fn: draw_fn,
    anim_fn: anim_fn,
    sound_fn: sound_fn,
    init: init,
    button_click: button_click,
    prop_commands: prop_commands,
    display: display,
    reset_fn: reset_fn,
    prop_fns: {}
}