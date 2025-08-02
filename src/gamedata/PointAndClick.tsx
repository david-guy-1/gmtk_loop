import React, { useEffect, useRef, useState } from 'react'
import game from './game';
import { CANVAS_HEIGHT, CANVAS_WIDTH, forest_dims } from './constants';
import "./stylesheet.css"
import { draw } from '../process_draws';
import { d_image, d_rect2, d_text } from '../canvasDrawing';
import { cell_index, combine_obj, lincomb, pointInsideRectangleWH } from '../lines';
import { point } from '../interfaces';
import { displace_command } from '../rotation';
import { get_potion } from './items_to_draw';
import _ from 'lodash';

const person_size = [188,444]
const explorer_coords = [50, 300]
const magic_coords = [260, 300]
const tour_coords = [500, 300]
const bed_coords = [497, 280, 797-497, 476-280] // wh
const fire_orb_jump_coords = [50, CANVAS_HEIGHT-120, 200, 55]; 
const water_orb_jump_coords = [270, CANVAS_HEIGHT-120, 200, 55]; 
const forest_rect = [CANVAS_WIDTH-240, CANVAS_HEIGHT-60]
const temple_rect = [CANVAS_WIDTH-160, CANVAS_HEIGHT-60]
const back_rect = [CANVAS_WIDTH-80, CANVAS_HEIGHT-60]
let map_size = [CANVAS_HEIGHT-100,CANVAS_HEIGHT-100] // height for the first one since it should be square
const rect_sizes = [75, 55]

const potion_size = [50, 50]; 
const potion_start = [200, 70]
type modes = "town"|"magic"|"tour"|"explorer"|"destroyed"|"forest map"|"hero"|"night"|"explorer out"|"magic2"|"dead magician"

function PointAndClick(props : {g : game, ret : Function}) {
    let g : game = props.g;
    let ret = props.ret
    let canvasRef = useRef<HTMLCanvasElement>(null);
    let start_mode : modes = "town";
    let start_string = "Welcome to town!"
    if(g.town_destroyed) {
        start_mode = "destroyed";
        start_string = " The town has been destroyed";
    }
    if(g.monster_defeated && !g.hero_cutscene_seen){
        start_mode = "hero"
        start_string = " You're a hero! You defeated the monster!";
    }
    if(g.water_orb_found && !g.bad_potion_solved){
        start_mode = "dead magician";
        start_string = "You return to find the sorceress dead in her room."
    }
    if(g.water_orb_found && g.bad_potion_solved){
        start_mode = "magic";
        start_string = "The enchantment crystal should work now. Now go defeat the demon!"
    }
    const [mode, setMode] = useState<modes>(start_mode);
    const [messagen, setMessagen] = useState<number>(0);
    const [message, setMessage] = useState<string>(start_string);
    function click(e : MouseEvent){ 
        let [x,y] = [e.offsetX, e.offsetY];
        if(mode == "town"){
            if(pointInsideRectangleWH(x, y, explorer_coords, person_size)){
                setMode("explorer")
                if(g.monster_defeated == false || g.fire_orb_found == true){
                    setMessage("I'm an explorer")
                } else { 
                    setMessage("Can I borrow the lava resistant suit? I promise to give you what I can find. ")
                }
            }
            if(pointInsideRectangleWH(x, y, magic_coords, person_size)){
                setMode("magic")
                setMessage("I'm a magician")
                if(g.fire_orb_found && !g.temple_unlocked) {
                    setMode("magic2");
                    setMessagen(0);
                    setMessage("This fire orb can be used to build a stabilizer")
                }
            }
            if(pointInsideRectangleWH(x, y, tour_coords, person_size)){
                setMode("tour")
                if(g.forest_unlocked == false){
                    g.forest_unlocked = true; 
                    setMessage("You want to enchant a sword? Go to the forest, I'll tell you how to get there")
                } else {
                    setMessage("Do you want to spend the night here? Just go to the bed")
                }
            }
            if(g.persist_fire_orb_found && !g.fire_orb_found && pointInsideRectangleWH(x, y, fire_orb_jump_coords)){
                g.jump_fire_orb(); 
                setMessage("jumped ahead"); 
            }
            if(g.persist_water_orb_found && pointInsideRectangleWH(x, y, water_orb_jump_coords)){
                g.jump_water_orb();
                ret("dungeon");
            }
        }
        if(mode == "magic" || mode == "tour" || mode == "explorer"){
            if(pointInsideRectangleWH(x, y, CANVAS_WIDTH-100, CANVAS_HEIGHT-60, 1000, 1000)){   
                setMessage("town");
                setMode("town")
            }
        }
        // click bad potion
        if((mode == "magic" || mode == "magic2") && g.bad_potion_solved == false ){
            let result = cell_index(potion_start as point, potion_size[0], potion_size[1],6,  x, y)
            if(result != undefined){
                let index = g.potions[result[2]];
                if(_.isEqual(g.bad_combo, index)){
                    setMessage("Thanks for telling me about that potion. It's bad and I'm going to throw it away.");
                    g.bad_potion_solved = true;
                    return; // don't do anything else. 
                }
            }
        }
        if(mode == "explorer" && g.monster_defeated && !g.fire_orb_found ) {
            if(pointInsideRectangleWH(x, y, forest_rect, rect_sizes)) {
                // yes
                setMode("explorer out");
                setMessage("Awesome! I hope I can find some cool treasures");
                setMessagen(0);
            } 

            if(pointInsideRectangleWH(x, y, back_rect, back_rect)) {
                // no
                setMode("town");
                setMessage("Welcome to town");
            } 
        }
        if(mode == "tour" && pointInsideRectangleWH(x, y, bed_coords) && g.monster_defeated == false){
            setMessage("You go to sleep. At night, a monster attacks the village");
            setMode("night");
        }
        if(mode == "night"){
            g.enter_room("monster", [0,0]);
            ret("dungeon");
        }
        if(mode == "forest map"){
            setTimeout(() => g.dead = "Click to restart", 100);
            g.enter_room("nothing",[0,0]);
            ret("dungeon");
        }
        if(mode == "town"){
            if(pointInsideRectangleWH(x, y, forest_rect, rect_sizes)){
                g.enter_room("forest", lincomb(1, [0,0], 0.5, forest_dims) as point);
                ret("dungeon")
            }
            else if(pointInsideRectangleWH(x, y, temple_rect, rect_sizes)){
                g.enter_room("temple", [0,0]);
                ret("dungeon")
            }
            else if(pointInsideRectangleWH(x, y, back_rect, rect_sizes)){
                g.enter_room("main", [400,400]);
                ret("dungeon")
            }
        }
        if(mode == "destroyed"){
            if(messagen == 0){
                setMessage("A monster attacked the town and destroyed it overnight.")
                setMessagen(1)
            } 
            else if(messagen == 1){
                setMessage("You find something on the ground in the ruins. It looks like a map")
                setMessagen(0);
                setMode("forest map");
            } 
        }
        if(mode == "hero"){
            if(messagen == 0){
                setMessage("The explorer says that the monster scales can be useful...")
                setMessagen(1);
            }
            else if(messagen == 1){
                setMessage("... for making a lava resistant suit!")
                setMessagen(2);
            }
            else if(messagen == 2){
                setMessage("He quickly makes the suit and gives it to you")
                setMessagen(3);
            }
            else if(messagen == 3){
                setMessage("Welcome to town")
                setMessagen(0);
                setMode("town");
                g.hero_cutscene_seen = true;
            }
        }
        if(mode == "explorer out"){
            if(messagen == 0){
                setMessage("The explorer goes to the volcano while you stay in the town")
                setMessagen(1);
            }
            if(messagen == 1){
                setMessage("A few days later, he returns with a fire orb")
                setMessagen(2);
            }
            if(messagen == 2){
                setMessage("As promised, I'll give this orb to you.")
                setMessagen(3);
            }
            if(messagen == 3){
                setMessage("Not sure what it's used for, ask the magician.")
                setMode("town");
                setMessagen(0);
                g.fire_orb_found = true;
                g.persist_fire_orb_found = true;
            }
        }
        if(mode == "magic2"){
            if(messagen == 0){
                setMessage("But you also need a water orb");
                setMessagen(1);
            }
            if(messagen == 1){
                setMessage("Find it in a temple, here it is:");
                setMessagen(2);
            }

            if(messagen == 2){
                setMessage("She tells you where to find a temple, it's underwater.");
                setMessagen(3);
            }
            
            if(messagen == 3){
                setMessage("I'll cast a spell on you that lets you breathe underwater");
                setMessagen(4);
                g.temple_unlocked = true;
            }
            
            if(messagen == 4){
                setMessage("Good luck!");
                setMessagen(0);
                setMode("town");
            }
        }
        if(mode == "dead magician"){
            if(messagen == 0){
                setMessage("She used a bad potion and it exploded, killing her")
                setMessagen(1);
            }
            if(messagen == 1){
                setMessage(`It looks like the bad potion is ${g.bad_combo[0]} and ${g.bad_combo[1]}.`)
                setMessagen(2);
            }
            if(messagen == 2){
                setMessage(`If only I knew earlier, I could have told her about it.`)
                setMessagen(3);
            }
            if(messagen == 3){
                setTimeout(() => g.dead = "Click to restart", 100)
                g.enter_room("nothing",[0,0]);
                ret("dungeon");
            }
        }
    }
    
    function change(){
        console.log("changed " + mode +  " " + message);
        let lst : draw_command[] = []; 
        switch(mode){
            case "town":
            case "hero":
            case "explorer out":
                lst.push(d_image("town/town.png", 0, 0));
                if(mode != "explorer out" || messagen >= 2){
                    lst.push(d_image("town/explorer.png", explorer_coords));
                }
                lst.push(d_image("town/magician.png",magic_coords));
                lst.push(d_image("town/tour guide.png", tour_coords));
            break
            case "explorer":
                lst.push(d_image("town/town.png", 0, 0));
                lst.push(d_image("town/explorer.png", explorer_coords));

            break
            case "tour":
                lst.push(d_image("town/tour room.png", 0, 0));

                lst.push(d_image("town/tour guide.png", explorer_coords));
            break
            case "magic":
            case "magic2":
                lst.push(d_image("town/magic shop.png", 0, 0));
                lst.push(d_image("town/magician.png",explorer_coords));
                for(let x=0; x < 6; x ++){
                    for(let y=0; y< 4; y++){
                        let pt : point = [potion_start[0] + x * potion_size[0], potion_size[1] + y * potion_size[1]];
                        let index = x+6*y; 
                        let [color, shape]= g.potions[index];
                        let cmd = get_potion(shape, color)
                        cmd = displace_command(cmd, pt);
                        lst.push(cmd);
                    }
                }
            break
            case "destroyed":
                lst.push(d_image("town/town destroyed.png", 0, 0));
            break;
            case "night":
                lst.push(d_image("town/night.png", 0, 0));
            break
            case "forest map":
                lst.push({type:"drawRectangle2", "tlx":0, "tly":0, "height":2000, "width":3000, "fill":true, "color":"black"})
                let x_scale = forest_dims[0] / map_size[0]
                let y_scale = forest_dims[1] / map_size[1];
                let scaled :point[]= [];
                for(let item of g.large_objs){
                    scaled.push([item[0] / x_scale, item[1] / y_scale])
                }
                for(let [i,pt] of scaled.entries()){
                    let color = g.large_colors[i]
                    let x : draw_command = {"type":"drawPolygon", "points_x" : [0,-4,4], "points_y" : [6,-2,-2], "fill":true, "color": `hsl(${color}, 100%, 60%)`};
                    x = displace_command(x, pt);
                    lst.push(x);
                }
                //hut
                lst.push(d_image("forest/hut_map.png", g.hut_loc[0] / x_scale, g.hut_loc[1] / y_scale))
                //start
                lst.push(d_image("town/map_start.png", lincomb(-0.5, [40, 40], 0.5, map_size)));
            break;
            case "dead magician":
                lst.push(d_image("town/magic shop.png",0,0));
                lst.push(d_image("town/dead magician.png",100,440));
                lst.push(displace_command(get_potion(g.bad_combo[1], g.bad_combo[0]), [400, 400]));
        }
        //back button
        if(mode == "magic" || mode == "tour" || mode == "explorer" || mode == "forest map"){
            let rect = d_rect2(back_rect, rect_sizes); 
            rect.fill = true;
            rect.color = "lightgreen"
            lst.push(rect)        
            lst.push(combine_obj(JSON.parse(JSON.stringify(rect)), {"fill":false, "widthA":3, "color":"black"}) as drawRectangle2_command) 
            lst.push(combine_obj({"size":20}, d_text("Back", lincomb(1, [5, 40], 1, back_rect))) as drawText_command);            
        }

        // text 
        {
            let rect = d_rect2(50, CANVAS_HEIGHT-60, CANVAS_WIDTH-300, 50); 
            rect.fill = true;
            rect.color = "lightpink"
            lst.push(rect)
            lst.push(combine_obj(JSON.parse(JSON.stringify(rect)), {"fill":false, "widthA":3, "color":"black"}) as drawRectangle2_command) 
            lst.push(combine_obj(d_text(message, 60, CANVAS_HEIGHT-30), {"size":14}) as drawText_command)
        }
        if(mode == "town"){
            // forest 
            if(g.forest_unlocked){
                let rect = d_rect2(forest_rect, rect_sizes); 
                rect.fill = true;
                rect.color = "lightgreen"
                lst.push(rect)        
                lst.push(combine_obj(JSON.parse(JSON.stringify(rect)), {"fill":false, "widthA":3, "color":"black"}) as drawRectangle2_command) 
                lst.push(d_text("Forest", lincomb(1, [5, 40], 1, forest_rect)))
            }
            //temple
            if(g.temple_unlocked){
                let rect = d_rect2(temple_rect, rect_sizes); 
                rect.fill = true;
                rect.color = "lightgreen"
                lst.push(rect)        
                lst.push(combine_obj(JSON.parse(JSON.stringify(rect)), {"fill":false, "widthA":3, "color":"black"}) as drawRectangle2_command) 
                lst.push(d_text("Temple", lincomb(1, [5, 40], 1, temple_rect)))
            }
            //back
            {
                let rect = d_rect2(back_rect, rect_sizes); 
                rect.fill = true;
                rect.color = "lightgreen"
                lst.push(rect)        
                lst.push(combine_obj(JSON.parse(JSON.stringify(rect)), {"fill":false, "widthA":3, "color":"black"}) as drawRectangle2_command) 
                lst.push(combine_obj({"size":20}, d_text("Back", lincomb(1, [5, 40], 1, back_rect))) as drawText_command)

            }
            // fire orb
            if(g.persist_fire_orb_found && !g.fire_orb_found){
                let rect = d_rect2(fire_orb_jump_coords); 
                rect.fill = true;
                rect.color = "lightgreen"
                lst.push(rect)        
                lst.push(combine_obj(JSON.parse(JSON.stringify(rect)), {"fill":false, "widthA":3, "color":"black"}) as drawRectangle2_command) 
                lst.push(combine_obj({"size":20}, d_text("Jump to fire orb", lincomb(1, [10, 35], 1, fire_orb_jump_coords.slice(0,2)))) as drawText_command)

            }
            // water orb
            if(g.persist_water_orb_found && !g.water_orb_found){
                let rect = d_rect2(water_orb_jump_coords); 
                rect.fill = true;
                rect.color = "lightgreen"
                lst.push(rect)        
                lst.push(combine_obj(JSON.parse(JSON.stringify(rect)), {"fill":false, "widthA":3, "color":"black"}) as drawRectangle2_command) 
                lst.push(combine_obj({"size":20}, d_text("Jump to water orb", lincomb(1, [10, 35], 1, water_orb_jump_coords.slice(0,2)))) as drawText_command)

            }
            
        }
        if(mode == "explorer" && g.monster_defeated && !g.fire_orb_found ){
            {
            let rect = d_rect2(forest_rect, rect_sizes); 
            rect.fill = true;
            rect.color = "lightgreen"
            lst.push(rect)        
            lst.push(combine_obj(JSON.parse(JSON.stringify(rect)), {"fill":false, "widthA":3, "color":"black"}) as drawRectangle2_command) 
            lst.push(combine_obj({"size":20}, d_text("Yes", lincomb(1, [5, 40], 1, forest_rect))) as drawText_command)
            }{
            let rect = d_rect2(back_rect, rect_sizes); 
            rect.fill = true;
            rect.color = "lightgreen"
            lst.push(rect)        
            lst.push(combine_obj(JSON.parse(JSON.stringify(rect)), {"fill":false, "widthA":3, "color":"black"}) as drawRectangle2_command) 
            lst.push(combine_obj({"size":20}, d_text("No", lincomb(1, [5, 40], 1, back_rect))) as drawText_command)
            }
        }
        draw(lst , canvasRef)
    }

    useEffect(function(){
        //componentdidmount
        change(); 
    },[mode, message, messagen])
    return (
        <div><canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onClick={e => click(e.nativeEvent)}className="top_left" ref={canvasRef}></canvas>

        <button onClick={() => {g.enter_room("main", [400,400]); props.ret()}}> backIgo</button>
    </div>
    )
}

export default PointAndClick