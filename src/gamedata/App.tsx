import React, { useState } from 'react'
import game from './game';

import { anim_fn, button_click, display, draw_fn, data_obj, init, prop_commands, reset_fn, sound_fn } from './GameData';
import { events } from '../EventManager';
import GameDisplay, { clone_gamedata } from '../GameDisplay';
import { gamedata } from '../interfaces';
import { all_combos } from '../lines';
import { globalStore_type } from './globalStore';
import { img_with_center } from '../process_draws';
import { demon_cmds, door_cmds, get_orb, right_claw } from './items_to_draw';
import { loadImage } from '../canvasDrawing';
import PointAndClick from './pointandclick';

function move_canvas(e : MouseEvent, g:game){
    if((e.target as HTMLElement).getAttribute("data-key") == "anim_canvas"){ // topmost canvas element that is valid - prevent moving char when mouse goes over another element 
        g.target= [e.offsetX, e.offsetY]
    }
}


function App() {

  const [g, setG] = useState<game | undefined>(undefined);
  const [type, setType] = useState<"dungeon"|"pointandclick">("dungeon");
  if(g == undefined){
    
    return <button onClick={() => setG(new game())}>Click to start</button>
  } else {
    if(type == "dungeon"){
      // get gameData
      let data = clone_gamedata(data_obj); 
      data.g = g;
      data.prop_fns["new_game"] =  function(){setG(undefined)};
      data.prop_fns["swap"] = (x,y,z) => setType(z); 
      // register event listener;
      
      events["mousemove a"] = [move_canvas, g];
      events["touchstart a"] = [(e,g) =>{g.tap = true} ,g]
      events["mousedown a"] = [(e,g) =>{g.tap = true} ,g]
      events["touchend a"] = [(e,g) =>{g.tap = false} ,g]
      events["mouseup a"] = [(e,g) =>{g.tap = false} ,g]
      
      let store : globalStore_type = {
        screen: "",
        death_anim: "",
        loaded_imgs: {}
      }
      for(let i =1; i<=6; i++){
        loadImage(`trap_${i}.png`);
      }
      loadImage("town/town.png");
      loadImage("town/explorer.png");
      loadImage("town/magician.png");
      loadImage("town/dead magician.png");
      loadImage("town/magic shop.png");
      loadImage("town/town destroyed.png");
      loadImage("town/tour guide.png");
      for(let i of ["red","yellow","green","blue"]){
        store.loaded_imgs["orb_"+i] = new img_with_center(get_orb({"red":0, "yellow":60, "blue":250,"green":125}[i] ?? 0), 100, 100, 200, 200); 
      }
      store.loaded_imgs["demon"] = new img_with_center(demon_cmds, 276,128,600,600);
      store.loaded_imgs["right claw"] = new img_with_center(right_claw, 79,165,300,300);
      store.loaded_imgs["left claw"] = new img_with_center(right_claw, 250,165,300,300);
      store.loaded_imgs["move"] = new img_with_center(door_cmds, 23, 11, 50, 50) 



      //DEBUG
      //@ts-ignore
      window.g = g; 
      return <GameDisplay data={data} globalStore={store} />
    } else { 
      // clear all events
      for(let x of ["mousemove a","touchstart a", "mousedown a","touchend a" ,"mouseup a" ] ){
        delete events[x]; 
      }
      return <PointAndClick g={g} ret={() => setType("dungeon")}/>

    }
  }
}

export default App