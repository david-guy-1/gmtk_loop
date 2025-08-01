import _, { first } from "lodash";
import { events_type, game_interface, point, rect } from "../interfaces";
import { dist, move_wallWH, moveTo, pointInsideRectangleWH } from "../lines";
import { choice, randint } from "../random";

class game implements game_interface{
    player : point = [400,400];
    target : point = [400,400];

    room : string = "";
    walls : rect[] = []; 
    items : [string, point | rect][] = [] // always WH 
    paused : boolean = false;
    n_trap_rows : number = 5;
    n_traps : number = 20 
    n_colors : number = 5; 
    //constant data 

    seed : string = "a";
    hidden_door : point = [0,0];
    trap_safe_points : number[] = []; 
    ench_colors : string[] = []; 

    // variable data 
    state : string = ""; 
    dead : string = "" // if not dead, this is empty
    // string. Otherwise, it shows cause of death
    tap : boolean = false; 

    // orb colors
    touched_colors : string[] = []; 
    //traps
    passed_traps : boolean = false; 

    time = 0;



    constructor(){
        this.enter_room("main", [400,400]);
        this.hidden_door = choice([[405,553],[431,554],[464,553],[482,549],[503,549],[524,549],[564,547],[576,519],[576,494],[577,457],[580,435],[583,399],[583,363],[581,334],[582,289],[580,254],[580,206],[580,180],[373,544],[326,552],[285,552]], this.seed + " hidden door") as point
        for(let i=0; i < this.n_trap_rows; i++){
            this.trap_safe_points.push(randint(0, this.n_traps, this.seed + " safe point " + i)); 
        }
        for(let i=0; this.ench_colors.length <this.n_colors; i++){
            let c = choice(["red","yellow","blue","green"], this.seed + " color" + i );
            if(c != this.ench_colors[this.ench_colors.length-1]){
                if(!(this.ench_colors.length == this.n_colors-1 && c == this.ench_colors[0])){
                    this.ench_colors.push(c);
                }
            }
        }
    }
    touch(name : string, obj : [string, number[]]) : events_type | undefined{
        if(name == "delete me"){
            return;
        }
        if(name == "trap"){
            return {"type":"trap"}
        }
        if(name == "enchantment"){
            return {"type": this.tap && this.passed_traps ? "enchantment dead" : "enchantment"}
        }
        // orbs and portal stuff
        if(name.slice(0, 4) == "orb_" && name.slice(4) != this.touched_colors[this.touched_colors.length-1]){
            this.touched_colors.push(name.slice(4))
            // check portal
            let first_good = true; 
            for(let i=0; i < this.n_colors; i++){
                if(this.touched_colors[this.touched_colors.length -this.n_colors+ i] != this.ench_colors[i]){
                    first_good = false;
                    break;
                }
            }
            let second_good = first_good;
            for(let i=0; i < this.n_colors; i++){
                if(this.touched_colors[this.touched_colors.length -2*this.n_colors+ i] != this.ench_colors[i]){
                    second_good=false;
                    break;
                }
            }
            if(first_good && !second_good){
                this.items.push(["move_volcano|400|400", [400,200]]);
            } else {
                this.items.forEach(function(x){ if(x[0].indexOf("move_volcano") != -1){ x[0] = "delete me";}  }); 
            }
            if(second_good){
                this.items.push(["move_town|400|400", [400,200]]);
            } else {
                this.items.forEach(function(x){ if(x[0].indexOf("move_town") != -1){ x[0] = "delete me";}  }); 
            }
            return {"type":"touched orb" , "color": name.slice(4), "location" : obj[1]} ;
        }
        if(name.slice(0,5) == "move_"){// name|X|Y
            let [name_, x, y] = name.slice(5).split("|")
            this.enter_room(name_, [parseInt(x), parseInt(y)])
        }
    }
    tick(){
        this.time++; 
        if(this.paused){
            return []
        }
        let lst : events_type[] = [] ; 
        this.player = move_wallWH(this.player, this.walls, this.target, 10) as point;

        if(this.room == "traps" && this.player[1] > 539){
            this.passed_traps = true;
            
        }
        for(let item of this.items){
            let touched =false; 
            let detection_radius = 20;
            if(item[0]== "enchantment"){
                detection_radius = 100; 
            }
            if(item[1].length == 2) {
                touched = dist(this.player, item[1]) < detection_radius
            } else { 
                touched = pointInsideRectangleWH(this.player, item[1]);
            }
            if(touched){
                let touch = this.touch(item[0], item);
                if(touch!=undefined){
                    lst.push(touch)
                };
            }
        }
        this.items = this.items.filter(x => x[0] != "delete me");
        return lst;
    }

    reset(){
        this.touched_colors = []; 
        this.time = 0;
        this.passed_traps = false;
        this.enter_room("main", [400, 400]); 
    }
    enter_room(room : string, pos : point){
        this.player = pos;
        this.items = []; 
        this.walls = []
        this.room = room

        if(room == "main"){
            this.items.push(["orb_red", [200,450]]);
            this.items.push(["orb_yellow", [300,520]]);
            this.items.push(["orb_blue", [400,520]]);
            this.items.push(["orb_green", [500,450]]);
            this.items.push(["move_demon|10|300", [550, 200]]);
            this.items.push(["enchantment",[200,200]])
        }
        if(room == "demon"){
            this.items.push(["move_traps|300|10", this.hidden_door]);
        }
        if(room == "traps"){
            this.walls.push([50, 50, 800, 0])
            for(let i=0; i < this.n_trap_rows; i++){
                for(let j=0; j < this.n_traps; j++){
                    if(this.trap_safe_points[i] == j){
                        continue;
                    }
                    this.items.push(["trap",[35*j+20, 100*i+100]])
                }
            }
            this.items.push(["move_main|400|400", [500, 580]]);
        }
    
    
    }

    
}


export default game; 