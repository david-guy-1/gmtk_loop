import _ from "lodash";
import { events_type, game_interface, point, rect } from "../interfaces";
import { all_combos, dist, inf_norm, len, lincomb, move_wallWH, moveIntoRectangleWH, moveTo, pointInsideRectangleWH } from "../lines";
import { n_trap_rows, n_traps, n_colors, forest_dims, cell_size, forest_dist_limit, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { string, number } from "zod";
import { img_with_center } from "../process_draws";
import { get_tree } from "./items_to_draw";
import { choice } from "../random";

// avoid slow hashing 
class simple_rand {
    seed : number 
    constructor(seed : number){
        this.seed = seed 
    }
    get(n : number){
        this.seed = this.seed*this.seed
        this.seed = Math.floor(this.seed / 100);
        this.seed = this.seed+314159
        this.seed = this.seed*271828
        if(this.seed % 3 == 0){
            this.seed = this.seed + 161802
        }
        this.seed = this.seed % 141421
        return this.seed%n
    }
}
class game implements game_interface{
    player : point = [400,400];
    target : point = [400,400];

    room : string = "";
    walls : rect[] = []; 
    items : [string, point | rect][] = [] // always WH 
    paused : boolean = false;

    //constant data 

    seed : string = "a";
    rand : simple_rand 

    hidden_door : point = [0,0];
    trap_safe_points : number[] = []; 
    ench_colors : string[] = []; 

    //forest 
    large_objs : point[] = []
    large_draws : img_with_center[] = [];
    large_colors : number[] = [];
    treasure_loc : point = [forest_dims[0]/2,forest_dims[1]/2]
    hut_loc : point = [forest_dims[0]/2,forest_dims[1]/2]

    // persistent data
    persist_fire_orb_found = false; 
    persist_water_orb_found = false; 
        
    // variable data 
    dead : string = "" // if not dead, this is empty
    // string. Otherwise, it shows cause of death
    tap : boolean = false; 

    // orb colors
    touched_colors : string[] = []; 
    //traps
    passed_traps : boolean = false; 


    //town and forest
    enter_forest_room ?: number;
    monster_health ?: number; 
    monster_weakness ?: point; 
    enter_monster_room ?: number;
    forest_unlocked : boolean = false;
    temple_unlocked : boolean = false;
    suit_unlocked : boolean = false;
    hut_found : boolean = false; 
    treasure_found : boolean = false;
    monster_defeated : boolean = false; 
    town_destroyed : boolean = false; 
    fire_orb_found : boolean = false; 
    water_orb_found : boolean = false; 
    hero_cutscene_seen : boolean = false;
    sword_enchanted : boolean = false; 
    
    // magic potion 
    potions : string[][] = []
    bad_combo : string[] = [];
    bad_potion_solved : boolean = false;
    //water temple
    enter_temple ?: number
    current_temple_point : point = [0,0];
    // the rest are semi-permanent and should not be reset
    clue_point ?: point = undefined; 
    dest_point ?: point = undefined;
    x_clue : string = "";
    y_clue : string = "";

    time = 0;



    constructor(){
        this.seed = Math.random().toString();
        this.rand = new simple_rand(Math.floor(Math.random() * 99999));
        let choices : point[] = [[405,553],[431,554],[464,553],[482,549],[503,549],[524,549],[564,547],[576,519],[576,494],[577,457],[580,435],[583,399],[583,363],[581,334],[582,289],[580,254],[580,206],[580,180],[373,544],[326,552],[285,552]];

        this.hidden_door =choices[ Math.floor(Math.random()*choices.length)];
        for(let i=0; i < n_trap_rows; i++){
            this.trap_safe_points.push(Math.floor(Math.random() * n_traps)); 
        }
        for(let i=0; this.ench_colors.length <n_colors; i++){
            let c =["red","yellow","blue","green"][Math.floor(Math.random()*4)];
            if(c != this.ench_colors[this.ench_colors.length-1]){
                if(!(this.ench_colors.length == n_colors-1 && c == this.ench_colors[0])){
                    this.ench_colors.push(c);
                }
            }
        }
        //forest 
        let x_cells = forest_dims[0]/cell_size[0];
        let y_cells = forest_dims[1]/cell_size[1];
        while(inf_norm(this.hut_loc , [forest_dims[0]/2,forest_dims[1]/2]) < forest_dims[0]*0.4){
            this.hut_loc = [Math.random() * forest_dims[0],Math.random() * forest_dims[1]]
        }

        while(inf_norm(this.treasure_loc , [forest_dims[0]/2,forest_dims[1]/2]) < forest_dims[0]*0.4){
            this.treasure_loc = [Math.random() * forest_dims[0],Math.random() * forest_dims[1]]
        }
        // start off placing some stuff 
        for(let i=0; i < x_cells; i++){
            for (let j=0; j < y_cells; j++){
                let coord = [i*cell_size[0] , j * cell_size[1]]
                let new_pt = [this.rand.get(cell_size[0]), this.rand.get(cell_size[1])]
                this.large_objs.push(lincomb(1, coord, 1, new_pt) as point);
            }
        }
        
        for(let i=0; i < x_cells * y_cells /5; i++){
            let new_point = [Math.random() * forest_dims[0], Math.random() * forest_dims[1]] as point
            if(!_.some(this.large_objs, x => inf_norm(x, new_point) < forest_dist_limit)){
                this.large_objs.push(new_point);
            }
        }
        for(let item of this.large_objs){
            let disp = lincomb(1, item, -0.5, forest_dims);
            let angle = Math.atan2(disp[1], disp[0]);
            let disp_ratio = len(disp) / (len(forest_dims)/2); 
            let reversal = 0
            let treasure_ratio = len(lincomb(1, item, -1, this.treasure_loc)) / (len(forest_dims)/2); 
            if(treasure_ratio < 0.2){
                reversal = treasure_ratio * 5
            }
            let [tree,colors] = get_tree(angle, disp_ratio, reversal);
            this.large_colors.push(colors)
            this.large_draws.push(new img_with_center(tree, 70, 70, 200, 200));
        }
        // potions
        let colors = ["red", "blue", "green", "yellow", "purple", "black"];
        let shapes = ["rectangle", "oval", "circle", "crescent"];
        let combos = all_combos([colors, shapes])
        combos = _.shuffle(combos); 
        this.potions = combos; 
        this.bad_combo = choice(combos, this.seed + " bad combo");
        
        this.enter_room("main", [400,400]);

    }
    touch(name : string, obj : [string, number[]]) : events_type | undefined{
        if(name == "delete me"){
            return;
        }
        if(name == "trap"){
            return {"type":"trap"}
        }
        if(name == "enchantment"){
            if(this.tap == false){
                return {"type": "enchantment"}; 
            } else {
                if(this.water_orb_found == false || this.fire_orb_found == false){
                    return {"type": "enchantment dead"}; 
                } else { 
                    this.sword_enchanted = true;
                    return {"type":"enchanted"};                    
                }
            }
        }
        // orbs and portal stuff
        if(name.slice(0, 4) == "orb_" && name.slice(4) != this.touched_colors[this.touched_colors.length-1]){
            this.touched_colors.push(name.slice(4))
            // check portal
            let first_good = true; 
            for(let i=0; i < n_colors; i++){
                if(this.touched_colors[this.touched_colors.length -n_colors+ i] != this.ench_colors[i]){
                    first_good = false;
                    break;
                }
            }
            let second_good = first_good;
            for(let i=0; i < n_colors; i++){
                if(this.touched_colors[this.touched_colors.length -2*n_colors+ i] != this.ench_colors[i]){
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
        if(this.room == "forest"){
            this.player = moveIntoRectangleWH(this.player,[0,0], forest_dims) as point
            let old_player = JSON.parse(JSON.stringify(this.player));
            this.player = move_wallWH(this.player, this.walls, this.target, 10) as point;
            this.target = lincomb(1,this.target,1, lincomb(1, this.player, -1, old_player)) as point

            if(dist(this.player, this.hut_loc) < 150){
                this.enter_room("dream",[0,0]);
            }
            
            if(dist(this.player, this.treasure_loc) < 100){
                this.enter_room("treasure",[0,0]);
            }
        } else { 
            this.player = move_wallWH(this.player, this.walls, this.target, 10) as point;
        }
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
        if(this.room == "temple"){
            if(this.player[0] < 50){
                this.player[0] = CANVAS_WIDTH - 60;
                this.current_temple_point[0]--;
            }
            if(this.player[0] > CANVAS_WIDTH-50){
                this.player[0] = 60;
                this.current_temple_point[0]++;
            }
            
            if(this.player[1] < 50){
                this.player[1] = CANVAS_HEIGHT - 60;
                this.current_temple_point[1]--;
            }
            if(this.player[1] > CANVAS_HEIGHT-50){
                this.player[1] = 60;
                this.current_temple_point[1]++;
            }
            if(this.clue_point == undefined && (_.max(this.current_temple_point.map(x => Math.abs(x))) ?? 0) >= 7){ 
                this.clue_point = JSON.parse(JSON.stringify(this.current_temple_point)) as point;
                this.dest_point = [Math.floor(Math.random()*3 + 10),Math.floor(Math.random()*3 + 10)]
                if(this.dest_point[0] * this.clue_point[0] > 0){
                    this.dest_point[0] *= -1;
                }
                if(this.dest_point[1] * this.clue_point[1] > 0){
                    this.dest_point[1] *= -1;
                }
                if(this.dest_point[0] < 0) { 
                    this.x_clue = "move west until you see a green thing";
                } else {
                    this.x_clue = "move east until you see a green thing";
                }
                
                if(this.dest_point[1] < 0) { 
                    this.y_clue = "then move north until you see a yellow thing";
                } else {
                    this.y_clue = "then move south until you see a yellow thing";
                }

            }
        }
        this.items = this.items.filter(x => x[0] != "delete me");

        return lst;
    }

    reset(){
        this.dead = "";
        this.tap = false; 
        this.touched_colors = []; 
        this.passed_traps = false;
        this.enter_forest_room = undefined
        this.monster_health = undefined;
        this.monster_weakness = undefined
        this.enter_monster_room = undefined;
        this.forest_unlocked  = false;
        this.temple_unlocked  = false;
        this.suit_unlocked  = false;
        this.hut_found = false; 
        this.treasure_found  = false;
        this.monster_defeated  = false; 
        this.town_destroyed = false; 
        this.fire_orb_found = false;
        this.water_orb_found = false;
        this.hero_cutscene_seen = false; 
        this.enter_temple = undefined;
        this.current_temple_point = [0,0];
        this.bad_potion_solved = false;
        this.sword_enchanted = false; 
        this.time = 0;
        this.paused = false; 
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
            for(let i=0; i < n_trap_rows; i++){
                for(let j=0; j < n_traps; j++){
                    if(this.trap_safe_points[i] == j){
                        continue;
                    }
                    this.items.push(["trap",[35*j+20, 100*i+100]])
                }
            }
            this.items.push(["move_main|400|400", [500, 580]]);
        }
    }
    jump_fire_orb(){
        this.forest_unlocked = true;
        this.suit_unlocked = true;
        this.hut_found = true;
        this.treasure_found = true;
        this.monster_defeated = true;
        this.fire_orb_found = true;
        this.hero_cutscene_seen = true; 
    }
    jump_water_orb(){
        if(this.dest_point == undefined){
            return;
        }
        this.jump_fire_orb(); 
        this.temple_unlocked = true;
        this.current_temple_point = JSON.parse(JSON.stringify(this.dest_point)); 
        this.enter_room("temple", [400,400]);
    }

    
}


export default game; 