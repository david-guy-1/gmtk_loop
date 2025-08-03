/*
game, draw_fn, anim_fn, sound_fn, add_event_listeners, button_click, prop_commands, prop_fns, display, reset_fn

*/

import _, { random } from "lodash";
import { animation } from "../animations";
import { d_circle, d_image, d_line, d_line2, d_rect, d_rect2, d_text } from "../canvasDrawing";
import GameDisplay from "../GameDisplay";
import { anim_fn_type, button_click_type, display_type, draw_fn_type, events_type, gamedata, init_type, point, prop_commands_type, props_to_run, reset_fn_type, sound_fn_type } from "../interfaces";
import game from "./game";
import { death_anim, explos_anim } from "./animations";
import { combine_obj, dist, lincomb, rescale } from "../lines";
import { get_orb } from "./items_to_draw";
import { displace_command, scale_command } from "../rotation";
import { globalStore_type } from "./globalStore";
import { CANVAS_WIDTH, CANVAS_HEIGHT, n_colors, n_trap_rows, n_traps, forest_time_limit, monster_time_limit, temple_time_limit } from "./constants";
import { choice, randint } from "../random";

export let display : display_type = {
    "button" : [],
    "canvas" : [["main",[0,0,CANVAS_WIDTH,CANVAS_HEIGHT]], ["anim_canvas",[0,0,CANVAS_WIDTH,CANVAS_HEIGHT]]],
    "image" : [],
    "text":[] 
}


export let draw_fn : draw_fn_type = function(g : game,globalStore : globalStore_type , events : any[] , canvas : string){
    let output : draw_command[] = []; 
    if(canvas == "main"){

        if(g.room == "main"){
            output.push(d_image("main room.png", [0,0]));
            if(_.some(events, x => x.type == "enchantment dead")){
                g.paused = true;
                globalStore.death_anim = "enchantment";
                globalStore.anim_time = g.time;
            }
            if(globalStore.death_anim == "enchantment" && globalStore.anim_time != undefined){
                let delay = g.time - globalStore.anim_time;
                if(delay >= 60 *(n_colors+1)){
                    g.dead = "The enchantment crystal was unstable and killed you";
                    globalStore.draw_objs = true;
                } else { 
                    let color = Math.floor(delay/60);
                    let size = delay % 60
                    if(g.ench_colors[color] != undefined){
                        output.push(combine_obj({"color":g.ench_colors[color], "fill":true, "transparency":1-size/60}, d_circle(180, 180, size*6)) as drawCircle_command)
                    } else {
                        globalStore.draw_objs = false ;
                        if(size > 30){
                            globalStore.draw_objs = true ;
                        }
                        globalStore.draw_broken_crystal = true;
                        output.push(combine_obj({"color":g.ench_colors[color], "fill":true, "transparency":size < 30 ? 1  :1-(size-30)/30}, d_circle(180, 180, 3000)) as drawCircle_command)
                    }

                }
            }
            if(_.some(events, x => x.type == "enchanted")){
                output.push(d_text("Your sword has been enchanted.", [100, 450]))
            }
        }
        if(g.room == "traps"){
            
            output.push(d_image("traps room.png", [0,0]));
            //draw the traps
            if(globalStore.death_anim != "trap" ){
                for(let i=0; i <n_trap_rows; i++){
                    for(let j=0; j <n_traps; j++){
                        let point = [35*j+10, 120*i+190];
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
                for(let i=0; i <n_trap_rows; i++){
                    for(let j=0; j <n_traps; j++){

                        let point = [35*j+10, 120*i+190];
                        output.push(d_image(`trap_${g.trap_safe_points[i] == j ? 1 : anim}.png`, point));
                    }
                }                
            }
            if(g.player[1] > CANVAS_HEIGHT-70){
                output.push(d_text("You find a sword on the ground", [100, 560]));
            }
        }
        /*
        for(let wall of g.walls){
            output.push(d_line2(wall));
        }
        */
        if(g.room == "demon"){
            output.push(d_image("demon room.png", [0,0]));
            if(g.passed_traps && !g.sword_enchanted){
                output.push(d_text("You can't defeat me with an unenchanted sword!", [100, 450]))
            }
            if(g.sword_enchanted){
                output.push(d_text("Uh oh...", [100, 450]))
            }
            output.push(globalStore.loaded_imgs["demon"].output(CANVAS_WIDTH/2, 200));
            output.push(globalStore.loaded_imgs["left claw"].output(CANVAS_WIDTH/2-50, 250));
            output.push(globalStore.loaded_imgs["right claw"].output(CANVAS_WIDTH/2+50, 250));
            if(globalStore.enter_demon_room == undefined){
                globalStore.enter_demon_room = g.time;
            } else {
                let gap = g.time - globalStore.enter_demon_room; 
                if(g.sword_enchanted){
                    gap = gap/3; 
                }
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
                output.push(displace_command(d_image(g.facing == "left" ? "playerL.png" : "playerR.png" ,[CANVAS_WIDTH/2, CANVAS_HEIGHT/2] ), [-20, -20]))
            } else { 
                g.dead = g.monster_defeated ? "You have a lava resistant suit but no way to get out of the volcano, so you still die" : "Fell into a volcano."
            }
        }

        if(g.room == "forest"){
            output.push(d_image("forest_bg.png", [0,0])) 
            if(g.enter_forest_room == undefined){
                g.enter_forest_room = g.time;
            }
            let forest_time = g.time - g.enter_forest_room; 
            output.push(displace_command(d_image(g.facing == "left" ? "playerL.png" : "playerR.png" , [CANVAS_WIDTH/2, CANVAS_HEIGHT/2]), [-20, -20]));
            // displace + player loc = middle of canvas
            let displace = lincomb(1,[CANVAS_WIDTH/2, CANVAS_HEIGHT/2], -1, g.player) // add to each object  
            for(let [i,item] of g.large_objs.entries()){
                let draw_at = lincomb(1, displace, 1, item);
                output.push(g.large_draws[i].output(draw_at[0], draw_at[1])); 
            }
            // hut and treasure - actually moving the player takes place in game class
            let draw_at = lincomb(1, displace, 1, g.hut_loc);
            output.push(d_image("forest/hut.png", lincomb(1, draw_at, -1, [150, 150]))); 
            
            draw_at = lincomb(1, displace, 1, g.treasure_loc);
            output.push(d_image("forest/treasure.png", lincomb(1, draw_at, -1, [50, 50])));
            // darkness
            output.push(combine_obj(d_rect2(0,0, 3000, 3000), {"fill":true, "color":"black", "transparency" : rescale(0, forest_time_limit,0,1, forest_time)}) as drawRectangle2_command)
            if(forest_time > forest_time_limit){
                g.paused = true; 
                let extra = forest_time - forest_time_limit;
                if(extra > 100){
                    extra = 100
                } 
                (output[output.length-1] as drawRectangle2_command).transparency = 0.3;
                // player starts out at 100, 591
                let displacement = lincomb(1, [CANVAS_WIDTH/2, CANVAS_HEIGHT/2],-1,[100, 591 ])
                displacement[0] -= (extra*extra)/20
                output.push(d_image("monster.png", displacement))
                if(extra == 100){
                    g.dead = "A monster attacked the forest at night and killed everyone";
                }
            }
        }
        if(g.room == "monster"){
            // fighting monster in town
            output.push(d_image("monster_bg.png", [0,0])); 
            
            if(g.enter_monster_room == undefined){
                g.enter_monster_room = g.time; 
            }
            let monster_time = g.time - g.enter_monster_room

            
            if(g.monster_health == undefined){
                g.monster_health = 100;
            }

            if(g.monster_weakness != undefined && dist(g.target, g.monster_weakness )< 20){
                g.monster_health -= g.treasure_found ? 10 :  1
                g.monster_weakness = undefined
                if(g.monster_health < 0){
                    g.monster_defeated = true; 

                }
            }

            if(g.monster_weakness == undefined && monster_time % 30 == 0){
                g.monster_weakness = [Math.random() * (CANVAS_WIDTH - 100 )+50, Math.random() * (CANVAS_HEIGHT - 200 )+50]; 
            }

            if(monster_time > monster_time_limit){
                g.monster_weakness = undefined; 
                monster_time = monster_time_limit;

            }


            // monster
            let draw_obj = d_image("monster.png", [CANVAS_WIDTH-200, -200]);
            draw_obj.x -= rescale(0, monster_time_limit, 0, CANVAS_WIDTH+200, monster_time);
            //health bar
            let health_bar = d_rect2(50, CANVAS_HEIGHT-100, CANVAS_WIDTH-100, 50);
            health_bar = scale_command(health_bar, [50, CANVAS_HEIGHT - 75], g.monster_health/100, 1) as drawRectangle2_command; 
            health_bar.fill = true;
            health_bar.color = "#007700";
            
            output.push(draw_obj);
            output.push(health_bar)
            if(g.monster_weakness != undefined){
                output.push(combine_obj(d_circle(g.monster_weakness, 30), {color:"red", width:"4", fill:false}) as drawCircle_command); 
            }
            if(monster_time >= monster_time_limit){
                output.push(combine_obj(d_text("You couldn't defeat the monster in time and it destroyed the entire city" , 100 , CANVAS_HEIGHT-200), {"color":"white"}) as drawText_command);
                g.town_destroyed = true; 
            }


        }
        if(g.room == "dream"){
            g.hut_found = true; 
            g.town_destroyed = true; 
            if(globalStore.death_anim == ""){
                globalStore.death_anim = "dream";
                globalStore.anim_time = g.time; 
            }
            // prop commands trigger returning 
            let time = g.time - (globalStore.anim_time ?? 0);
            output.push(d_image("forest/forest hut.png", 0, 0)); 
            output.push(combine_obj(d_rect(0, 0, 3000, 3000) , {"color":"black", "fill":"true", "transparency":1 - Math.max(0, 1 - time/60) } )as drawRectangle_command);
            if(time < 100){
                output.push(combine_obj(d_text("You get into the hut and go to sleep", 10, CANVAS_HEIGHT-50), {"color":"white"} ) as drawText_command)

            } else if(time < 250){
                // random circles
                for(let i=0; i<20; i++){
                    let circ = d_circle(Math.random() * CANVAS_WIDTH,Math.random() * CANVAS_HEIGHT-200, 3+Math.random()*5);
                    circ.fill = true;
                    let color = 120 + Math.random()*90
                    circ.color = `hsl(${color}, 100%, 75%)`
                    output.push(circ);
                }
                output.push(combine_obj(d_text("You have a dream... some kind of treasure...", 10, CANVAS_HEIGHT-50), {"color":"white"} ) as drawText_command)
            }else if(time < 400){
                // random larger , circles
                for(let i=0; i<20; i++){
                    let circ = d_circle(Math.random() * CANVAS_WIDTH,Math.random() * CANVAS_HEIGHT-200, 5+Math.random()*7);
                    circ.fill = true;
                    let color = 120+180 + Math.random()*90
                    circ.color = `hsl(${color}, 100%, 75%)`
                    output.push(circ);
                }
                output.push(combine_obj(d_text("trees.... reverse.... color.... ", 10, CANVAS_HEIGHT-50), {"color":"white"} ) as drawText_command)
            }

        }

      
        // this is not a death 
        if(g.room == "treasure"){
            if(globalStore.anim_time == undefined){
                globalStore.anim_time = g.time; 
                console.log("it behgins");
            }
            let time = g.time - globalStore.anim_time; 
            output.push(d_image("forest/treasure_cutscene.png", 330, 430-time*2));
            if(time < 100){
                output.push(d_text("You find a treasure. It's a bottle of Monster-B-Gone!" , 10, 450 ));
            } else if (time < 200){
                output.push(d_text("Time to defeat that monster!" , 10, 450 ));
            } else { 
                g.enter_room("monster", [0,0]);
                globalStore.anim_time = undefined; 
            }
            g.treasure_found = true; 

        }
        if(g.room == "temple"){
            if(g.enter_temple == undefined){
                g.enter_temple = g.time; 
            }
            let time = g.time - g.enter_temple; 
            output.push(d_image("temple_bg.png",[0,0]))
            for(let i=0; i<3; i++){
                let seed = JSON.stringify(g.current_temple_point) + g.seed + "_"+ i  
                let pt : point= [randint(70, CANVAS_WIDTH-70, seed + " c1"),randint(70, CANVAS_HEIGHT-70, seed+" c2")]
                let image = choice(["temple/grass.png", "temple/rock.png"], seed + "c3");
                output.push(d_image(image, pt));
            }
            // correct x 
            if(g.current_temple_point[0] == g.dest_point?.[0]){
                for(let i=0; i<3; i++){
                    let seed = JSON.stringify(g.current_temple_point) + g.seed + "_(correct x)"+ i  
                    let pt : point= [randint(70, CANVAS_WIDTH-70, seed + " c1"),randint(70, CANVAS_HEIGHT-70, seed+" c2")]
                    let image = "temple/red thing.png"
                    output.push(d_image(image, pt));
                }   
            }
            // correct y
            if(g.current_temple_point[1] == g.dest_point?.[1]){
                for(let i=0; i<3; i++){
                    let seed = JSON.stringify(g.current_temple_point) + g.seed + "_(correct y)"+ i  
                    let pt : point= [randint(70, CANVAS_WIDTH-70, seed + " c1"),randint(70, CANVAS_HEIGHT-70, seed+" c2")]
                    let image = "temple/yellow thing.png"
                    output.push(d_image(image, pt));
                }   
            }

            // clue point 
            if(_.isEqual(g.current_temple_point , g.clue_point)){
                output.push(d_image("temple/book.png", [300, 300]));
                if(dist(g.player, [350, 350]) < 50){
                    output.push(combine_obj(d_text("The inscription says : " + g.x_clue, 50, CANVAS_HEIGHT-80),{"color":"white"}) as drawText_command);
                    output.push(combine_obj(d_text(g.y_clue, 50, CANVAS_HEIGHT-50),{"color":"white"}) as drawText_command);
                }
            }
            // clue point 
            if(_.isEqual(g.current_temple_point , g.dest_point)){
                output.push(d_image("temple/water orb.png", [300, 300]));
                
                if(dist(g.player, [350, 350]) < 50){
                    g.water_orb_found = true;
                    g.persist_water_orb_found = true;
                    // prop command will take it away
                }
            }
            //drowning
            if(time < temple_time_limit){
                output.push(combine_obj(d_rect2(0, 0, 3000, 3000), {"transparency": rescale(0, temple_time_limit, 0, 0.7, time), "color":"#0000ff", "fill":true}) as drawRectangle2_command)
            } else { 
                g.paused = true;
                output.push(combine_obj(d_rect2(0, 0, 3000, 3000), {"transparency": 0.8, "fill":true}) as drawRectangle2_command);
                g.dead = "The enchantress's spell wore off and you drown. Go faster next time ok?"
            }

        }
        // items
        if(globalStore.draw_objs){
            for(let item of g.items){
                if(item[0].slice(0,4) == "orb_"){
                    output.push(globalStore.loaded_imgs[item[0]].output(item[1][0], item[1][1]));
                }

                if(item[0] == "enchantment"){
                    output.push(d_image(globalStore.draw_broken_crystal ? "enchantment_b.png" : "enchantment.png", item[1][0]-83, item[1][1] - 99));
                    if(_.some(events, x=>x.type == "enchantment")){
                        let message = "enchantment crystal";
                        if(g.passed_traps){
                            message = "click to enchant sword";
                        }
                        if(g.water_orb_found && !g.passed_traps){
                            message = "Don't forget to get the sword!"
                        }
                        output.push(d_text(message, [100, 450]))
                    } else {
                    // console.log("no draw");
                    }
                }
                if(item[0].indexOf("move_volcano") != -1){
                    output.push(d_image("volcano_door.png", lincomb(1, item[1], -0.5, [30, 30]) as point));
                }
                if(item[0].indexOf("move_town") != -1){
                    //
                    output.push(d_image("town_door.png", lincomb(1, item[1], -0.5, [30, 30]) as point));
                }
            }
        }
        if(g.dead.length > 0){
            let text =  d_text(g.dead, 10 , 450 )
            if(g.room == "traps"){
                text.y += 50;
            }
            if(g.room == "temple" || g.room == "forest" || g.room == "main" || g.room == "demon"){
                text.color = "white";
            }
            output.push(text)
        }

        if(g.dead.length == 0 && g.room != "volcano" && g.room != "forest" && g.room != "dream" && g.room != "monster" && g.room != "treasure"){
            output.push(displace_command(d_image(g.facing == "left" ? "playerL.png" : "playerR.png" , g.player), [-20, -20])); 
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
    // rooms are : main, traps, demon, win, volcano, forest , monster, dream, treasure, temple. 
    // town are : town, (NPC rooms can have the same), night, destroyed, dead enchantress 
    if(g.room == "monster"){
        return ["sounds/monster.wav", []];
    }
    if(g.room == "volcano"){
        return ["sounds/volcano.mp3", []];
    }
    if(g.room == "traps"){
        return ["sounds/traps.mp3", []];
    }
    if(g.room == "demon"){
        return ["sounds/demon.mp3", []];
    }
    if(g.room == "win"){
        return ["sounds/win.mp3", []];
    }
    if(g.room == "treasure"){
        return ["sounds/treasure.mp3", []];
    }
    if(g.room == "dream"){
        return ["sounds/dream.mp3", []];
    }
    if(g.room == "main"){
        return ["sounds/main.mp3", []];
    }
    if(g.room == "forest"){
        return ["sounds/forest.mp3", []];
    }  
    if(g.room == "temple"){
        return ["sounds/temple.mp3", []];
    }  
    return [undefined,[]]
}

export let prop_commands : prop_commands_type = function(g : game,globalStore : globalStore_type, events : events_type[]){
    let output : props_to_run = []; 
    if(g.room == "town"){
        output.push(["swap", "pointandclick"]);
    }
    if(g.room == "dream" &&globalStore.death_anim =="dream" && g.time - (globalStore.anim_time ?? 0) > 400){
        output.push(["swap", "pointandclick"]);
    }
    if(g.room == "monster" && g.enter_monster_room != undefined &&  g.time - g.enter_monster_room > monster_time_limit + 150 ){
        output.push(["swap", "pointandclick"]);
    }   
    if(g.room == "monster" && g.monster_defeated == true){
        output.push(["swap", "pointandclick"]);
    }
    if(g.room == "temple" && g.water_orb_found == true){
        output.push(["swap", "pointandclick"]);
    }
    if(g.room == "win"){
        output.push(["swap", "pointandclick"]);
    }
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