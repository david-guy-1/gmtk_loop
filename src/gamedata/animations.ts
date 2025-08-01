import { animation } from "../animations";
import { d_circle, d_image } from "../canvasDrawing";
import { game_interface, point, point3d } from "../interfaces";
import { add_obj, combine_obj, lerp, lincomb, moveTo, point_to_color } from "../lines";
import game from "./game";
import { globalStore_type } from "./globalStore";

export class death_anim implements animation<game>{
    n : number = 0; 
    constructor(){

    }
    update(g: game, globalStore: globalStore_type) : boolean {
        this.n ++; 
        if(this.n == 30){
            return true;
        }
        return false;
    };
    draw(g: game, globalStore: globalStore_type):  draw_command[] {
        return [combine_obj({"color":"red", "fill":true} ,d_circle(400, 400, 10*Math.pow(this.n,2)) ) as drawCircle_command]
    }
    canvas = "anim_canvas";
}


export class explos_anim implements animation<game>{
    pt:point;
    color:string;
    circles : point3d[] = []
    lifespan : number = 50;
    canvas = "anim_canvas"
    constructor(pt : point,color : string){
        this.pt=pt;
        this.color=color;

    }
    update(){
        if(this.lifespan%5 == 0 && this.lifespan > 0){
            let pt = lincomb(1, this.pt, 40, [Math.random()-0.5, Math.random()-0.5]) as point;
            this.circles.push([...pt, 4]);
        }
        this.lifespan --;
        this.circles.forEach(x => x[2]+=0.1); 
        return this.lifespan < -100; 
    }
    draw (g: game, globalStore: globalStore_type){
        return this.circles.map(x => combine_obj( d_circle(x), {"fill":true,"color":this.color, "transparency":Math.max(0, 1 - 0.13*x[2])}) as drawCircle_command );
    }
}