import { game_interface } from "../interfaces";
import {dist, moveTo} from "../canvasDrawing";
import _ from "lodash";


export class game implements game_interface {
    x:number;
    y:number;
    target_x:number;
    target_y:number;
    coins:[number, number][];
    exit:[number, number];
    collected : boolean[] = [];
    win : number = -1; 
    time = 0;
    constructor(x : number,y : number,target_x : number,target_y : number,coins : [number, number][],exit : [number, number]){
        this.x=x;
        this.y=y;
        this.target_x=target_x;
        this.target_y=target_y;
        this.coins=coins;
        this.exit=exit;
        for(let i=0; i < coins.length; i++){
            this.collected.push(false); 
        }
    }
    tick(){
        this.time++; 
        [this.x,this.y] = moveTo([this.x,this.y],[this.target_x,this.target_y], 10);
        var collected_indices : number[] = []
        for(let i=0; i < this.coins.length; i++){
            if(this.collected[i]){
                continue;
            }
            if(dist([this.x,this.y], this.coins[i]) < 25){
                this.collected[i] = true;
                collected_indices.push(i);
            }
        }
        if(_.every(this.collected) &&  dist([this.x, this.y] , this.exit ) < 20 ){
            this.win = this.time;
        }
        return collected_indices; 
    }

}

export function make_game(){
    let lst:[number, number][] = [];
    for(let i=0; i < 10; i++){
        lst.push([Math.random() * 500, Math.random() * 500])
    }
    let g = new game(0, 0, 0, 0, lst, [Math.random() * 500, Math.random() * 500]);
    return g; 
}
