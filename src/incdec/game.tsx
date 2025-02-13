import { game_interface } from "./interfaces";
import {dist, moveTo} from "./canvasDrawing";
import _ from "lodash";


export class game implements game_interface {
    n : number = 0; 
    constructor(){

    }
    tick(){
    }
}

export function make_game(){
    let g = new game();
    return g; 
}
