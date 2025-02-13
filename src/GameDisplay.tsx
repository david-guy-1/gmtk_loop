import { useEffect, useRef, useState } from "react";
import {game, make_game} from "./gamedata/game";
import { events } from "./EventManager";
import _ from "lodash";
import { clear, draw } from "./process_draws";
import { animation, update_and_draw } from "./animations";
import {change, toggleMute, get, getMuted, play} from "./Sound"; 
import { draw_fn, anim_fn, sound_fn, add_event_listeners, button_click, prop_commands, display, reset_fn } from "./gamedata/GameFunctions";



let g : game | undefined = undefined;
let interval : number = -1; 
let last_tick : number = Date.now(); 

const FPS = 60; 

let anim_lst : animation[] = []; 

async function reset(){

    last_tick = Date.now();
    anim_lst = [];
    clearInterval(interval);
    interval = -1; 
    reset_fn(); 
    g = undefined;
    console.log("g cleared");
}

function GameDisplay(props : any){
    console.log("refreshed");
    const [r, refresh] = useState<boolean>(false);
    let refs : Record<string, React.RefObject<HTMLCanvasElement> > = {}; 
    display.canvas
    if(display.canvas.map((x) => x[0]).indexOf("anims") == -1){
        throw "canvas must include an \"anims\""
    }
    for(var item of display.canvas){
        refs[item[0]] =  useRef<HTMLCanvasElement>(null);
    }

    useEffect(function(){
        // componentDidMount;
        console.log("loading game")
        if(g == undefined){

            // create a Game object
            g = make_game(); 

            // event listener

            add_event_listeners(g)


        }
        // clear sound
        if(get() != undefined){
            change(undefined);
        }
        
        // game loop
        if(interval == -1) {  
            
            last_tick = Date.now() //
            interval = setInterval(function(){
                if(g == undefined){
                    return;
                }
                let new_tick = Date.now(); 
                let evtlst : any[] = [];
                while(last_tick < new_tick){
                    evtlst.push(g.tick());

                    for(let [s,t] of prop_commands(g)){
                        if(s == "rerender"){
                            refresh(!r);
                        }            
                        if(s == "reset"){
                            reset();
                            refresh(!r);
                        }
                        if(props[s] != undefined){
                            props[s](g, t)
                        }
                    }
                    last_tick += 1000/FPS 
                } 
                
                // handle sound
                let [newsound, playsounds] =  sound_fn(g, evtlst)
                if(get() != newsound){
                    change(newsound);
                }
                for(let item of playsounds){
                    play(item);
                }
                // drawings and animations 

                for(let [item, unused] of display.canvas){
                    let canvas = refs[item];
                    clear(canvas)
                    draw(draw_fn(g, evtlst, item), canvas);
                }
                
                // if need multiple layers, write multiple draw_fn functions and call them. 
                
                anim_lst = anim_lst.concat(anim_fn(g, evtlst));
                update_and_draw(anim_lst, refs["anims"])
            }, 1000/FPS) 


        }
        return function(){
            //componentWillUnmount
            clearInterval(interval); 
            interval = -1;
        }
    },[])

    const button_click_disp = function(s : string){
        let lst  = button_click(s, g as game);
        for(let [s,t] of lst){
            if(s == "rerender"){
                refresh(!r);
            }
            if(s == "reset"){
                reset();
                refresh(!r);
            }
            if(props[s] != undefined){
                props[s](g, t)
            }
        }
    }

    var return_lst : any[] = []
    for(let item of display.canvas){
        let name = item[0]; 
        let [x,y,w,h] = item[1]; 
        return_lst.push(<canvas style={{position:"absolute", top : y + "px", left : x + "px"}} width={w} height={h} ref={refs[name]} key={name}></canvas>)
    }
    for(let item of display.button){
        let name = item[0]; 
        let [x,y,w,h] = item[1]; 
        let text = item[2];
        let image = item[3]
        if(image !== undefined){
            //@ts-ignore
            return_lst.push(<img src={image} style={{position:"absolute", top : y + "px", left : x + "px", width:w + "px", height : h + "px"}} onClick={() =>button_click_disp(name) }  ref={refs[name]}/>)
        } else { 
            return_lst.push(<button style={{position:"absolute", top : y + "px", left : x + "px", width:w + "px", height : h + "px"}} onClick={() => button_click_disp(name)} >{text}</button>)
        }
    }
    for(let item of display.image){
        let [name,x,y] = item;
        return_lst.push(<img src={name} style={{position:"absolute", top : y + "px", left : x + "px", "zIndex" : -1}} />)
    }
    return return_lst
}

export default GameDisplay