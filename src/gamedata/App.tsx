import React, { useState } from 'react'
import game from './game';

import { anim_fn, button_click, display, draw_fn, data_obj, init, prop_commands, reset_fn, sound_fn } from './GameData';
import { events } from '../EventManager';
import GameDisplay, { clone_gamedata } from '../GameDisplay';
import { gamedata, point } from '../interfaces';
import { all_combos, lincomb } from '../lines';
import { globalStore_type } from './globalStore';
import { img_with_center } from '../process_draws';
import { demon_cmds, door_cmds, get_orb, right_claw } from './items_to_draw';
import { loadImage } from '../canvasDrawing';
import PointAndClick from './PointAndClick';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import { load_images } from './load_images';

function move_canvas(e : MouseEvent, g:game){
    if((e.target as HTMLElement).getAttribute("data-key") == "anim_canvas"){ // topmost canvas element that is valid - prevent moving char when mouse goes over another element 
      if(g.room != "forest"){
        g.target= [e.offsetX, e.offsetY]
      } else {
        g.target= lincomb(1, g.player, 1, lincomb(1, [e.offsetX, e.offsetY] ,-1, [CANVAS_WIDTH/2, CANVAS_HEIGHT/2])) as point;
      }
    }
}


function App() {
  load_images(); 
  const [g, setG] = useState<game | undefined>(undefined);
  const [type, setType] = useState<"dungeon"|"pointandclick">("dungeon");
  const [load, setLoad]  = useState<boolean>(false);
  if(g == undefined){
    if(load == true){
      setTimeout(() => setG(new game()), 200);
      return <h1>Loading...</h1>
    }
    return <div><h1>Demon of Repetition and Failure</h1><br/>
    <h2>Oh no! There's a demon!</h2>
    <h3>It's so strong that it even ate this title page</h3>
    <p>(actually I just ran out of time to make the title page)</p>
    <p>You must go and defeat it!</p>
    <ul>
      <img src="gmtk.png" /><br />

      <li>Game created by me (TDGperson)</li>
      <li>Piano sounds form TEDAGame <a target="_blank" href="https://freesound.org/people/TEDAgame/packs/25405/">Link</a></li>
      <li> <a target="_blank" href="walkthrough.txt">Walkthrough</a></li>
      <li>Created for the <a target="_blank" href="https://itch.io/jam/gmtk-2025">GMTK Game Jam </a></li>
    </ul>
    <div style={{width:CANVAS_WIDTH, height:100, backgroundColor:"#ffcccc", fontSize:60,textAlign:"center"}} onClick={() => setLoad(true)}>    Start Game</div></div>
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
      events["click a"] = [function(e, g, s){if(g.dead.length>0){console.log("resetting");g.reset();s.death_anim = "", s.enter_demon_room = undefined; s.anim_time = undefined;s.draw_broken_crystal = false; s.draw_objs = true;  } }, g]
      
      let store : globalStore_type = {
        screen: "",
        death_anim: "",
        loaded_imgs: {},
        draw_objs : true,
        draw_broken_crystal : false
      }
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
      return <PointAndClick g={g} ret={() => setType("dungeon")} reset={() => {setG(undefined); setLoad(false); setType("dungeon")}}/>

    }
  }
}

export default App