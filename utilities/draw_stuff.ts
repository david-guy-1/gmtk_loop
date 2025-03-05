
import { add_com, d_bezier, d_circle, d_line, d_smoothbezier, d_text, drawLine, drawPolygon, dist, flatten, lincomb, draw_wrap, draw_command, drawBezierCurve_command, drawBezierShape_command, drawCircle_command, drawPolygon_command, fillstyle, point3d, displace_command, scale_command, Mv, scalar_multiple } from "./a"
import * as _ from "lodash"

/* zod : 
convert.py
copy this file to a.ts 
ts-to-zod a.ts draw_commands_zod.zod.ts
remove all import/export
z -> window.z 
put into js file

*/

//https://poshmark.com/listing/Eva-Franco-Anthropologie-Bow-Tie-Tube-Mini-Strapless-Metallic-Party-Dress-654533bbfe2504f59ac3b453
//https://in.pinterest.com/pin/strapless-pink-taffeta-aline-short-party-dress-with-bow-video-video--750553094185287060/


type point = [number, number]
type named_point = [string,number,number]
type rect = [number, number, number, number]

type point_fill_linear  = {
    "type":"fill_linear",
    "p0" : string,
    "p1" : string,
    "colorstops" : [number , string][]   
 }
 type point_fill_radial  = {
    "type":"fill_radial",
    "p0" : string,
    "p1" : string,
    "r0" : number,
    "r1" : number,
    "colorstops" : [number , string][]   
 }
 
 type point_fill_conic  = {
    "type":"fill_conic",
    "p0" : string,
    "theta" : number,
    "colorstops" : [number , string][]   
 }
 
 type point_fill = string | point_fill_linear | point_fill_radial | point_fill_conic

function point_fill_to_fill(f: point_fill, points : named_point[]) : string | fillstyle{
    if(typeof(f) == "string"){
        return f; 
    }
    if(f.type == "fill_conic"){
        let p = get_point(points,f.p0)
        if(p == undefined){
            throw "no point exists " + f.p0
        }
        return  {
            "type":"fill_conic",
            "x" : p[0],
            "y" : p[1], 
            "theta" : f.theta,
            "colorstops" : f.colorstops
         }
    }
    if(f.type == "fill_linear"){
        let p = [get_point(points,f.p0),get_point(points,f.p1)]
        if(p[0] == undefined){
            throw "no point exists " + f.p0;
        }
        if(p[1] == undefined){
            throw "no point exists " + f.p1;
        }
        return {
            "type":"fill_linear",
            "x0" : p[0][0], 
            "y0" : p[0][1], 
            "x1" : p[1][0], 
            "y1" : p[1][1], 
            "colorstops" : f.colorstops  
         }
    }
    if(f.type == "fill_radial"){
        let p = [get_point(points,f.p0),get_point(points,f.p1)]
        if(p[0] == undefined){
            throw "no point exists " + f.p0;
        }
        if(p[1] == undefined){
            throw "no point exists " + f.p1;
        }
        return {
            "type":"fill_radial",
            "x0" : p[0][0], 
            "y0" : p[0][1], 
            "x1" : p[1][0], 
            "y1" : p[1][1], 
            "r0" : f.r0,
            "r1": f.r1,
            "colorstops" : f.colorstops  
         }
    }
    return "";
}

type outline = {"thickness" : number, "color":string}

//"line"|"bezier"|"smooth bezier" are curve-like and cannot have interiors
type shape_types = "line"|"bezier"|"smooth bezier"|"polygon"|"circle"|"bezier shape"|"smooth bezier shape"
type shape = {
    "parent_layer" : string 
    "points" : string[] // just the names 
    "name":string
    "type": shape_types
    "fill" ?: string|point_fill
    "outline"?:outline  
    "visible" : boolean
    "outline_visible" : boolean
}

type layer = {
    "name" : string
    "shapes" : shape[]
}

type display_total  = {
    points : named_point[]
    layers : layer[]
    zoom : point3d // top left, and zoom factor
    layer_visibility : Record<string,boolean> // true = visible
    show_points : "none" | "shape" | "layer" | "all"
    show_labels : boolean // true = show 

    selected_point ?: string
    selected_shape ?: string
    selected_layer : string // there must be a selected layer at all times, that's where new shapes get drawn
    
    total_points : number  
    total_shapes : number
    message : string 
}

function get_layer(layers : layer[], name : string ) : layer| undefined{
    for(let item of layers){
        if(item.name == name){
            return item;
        }
    }
    return undefined;
}

function get_shape(shapes : shape[], name : string ) : shape| undefined{
    for(let item of shapes){
        if(item.name == name){
            return item;
        }
    }
    return undefined;
}

function get_point(point : named_point[], name : string ) : point| undefined{
    for(let item of point){
        if(item[0] == name){
            return [item[1], item[2]];
        }
    }
    return undefined;
}

function verify_uniq(s :(string | {name:string})[]){
    let seen : Set<string> = new Set();
    for(let item of s){
        let the_s = typeof(item) == "string" ? item : item.name; 
        if(seen.has(the_s)){
            throw "name is not unique " + item;
        }
        seen.add(the_s);
    }
}


function verify(d : display_total){
    // layer and point names
    verify_uniq(d.layers);
    let points = d.points.map(x => x[0]);
    let points_set = new Set(points);
    verify_uniq(points); 
    let shapes = [] 
    for(let item of Object.keys(d.layer_visibility)){
        //verify all layers are in visible dict
        let layer = get_layer(d.layers, item);
        if(layer == undefined){
            throw "layer is undefined " + item;
        }
        for(let shape of layer.shapes){
            if(shape.parent_layer != layer.name){
                throw "shape parent layer incorrect " + shape.name ; 
            }
            shapes.push(shape);
        }
    }
    
    //verify shapes 
    verify_uniq(shapes); 
    for(let shape of shapes){
        for(let point of get_points(shape)){
            if(!points_set.has(point)){
                throw "shape has invalid point " + point;
            }
        }
    }
}

// for displaying in game
// this is really ugly / duplicated code and could be cleaned up but I'm too lazy
function output(d : display_total, ignore_exceptions = false) : draw_command[]{
    let result : draw_command[] =  [];
    for(let layer of d.layers){
        
        let layer_name = layer.name
        if(layer == undefined || d.layer_visibility[layer_name] == false){
            continue;
        }
        for(let shape of layer.shapes){
            let points : point[] = shape.points.map((x,y,z) => get_point(d.points, x) ?? [0,0])
            if(shape.visible == false){
                continue;
            }
            switch (shape.type ){
                case "line":
                    if(shape.outline_visible == false){
                        continue;
                    }
                    if(shape.outline == undefined){
                        if(ignore_exceptions == true){
                            continue
                        } else {
                            throw "shape must have an outline"; 
                        }
                    }
                    for(let i=0; i<points.length-1; i++){                        
                        let pt1 = points[i];
                        let pt2 = points[i+1];
                        result.push(add_com(d_line(pt1, pt2), {"color" : shape.outline.color, "width" : shape.outline.thickness}))
                    }
                break  
                case "bezier":
                    if(shape.outline_visible == false){
                        continue;
                    }

                    if(shape.outline == undefined){
                        if(ignore_exceptions == true){
                            continue
                        } else {
                            throw "shape must have an outline"; 
                        }
                    }
                    if(points.length == 0){
                        continue;
                    }
                    while(points.length%3 != 1){
                        points.pop();
                    }
                    result = result.concat(d_bezier(points, false).map(x => add_com(x, {"color" : shape.outline!.color, "width" : shape.outline!.thickness})))
                break  
                case "smooth bezier":
                    if(shape.outline_visible == false){
                        continue;
                    }

                    if(shape.outline == undefined){
                        if(ignore_exceptions == true){
                            continue
                        } else {
                            throw "shape must have an outline"; 
                        }
                    }
                    if(points.length == 0){
                        continue;
                    }
                    while(points.length%2 != 0){
                        points.pop();
                    }
                    result = result.concat(d_smoothbezier(points, false, false).map(x => add_com(x, {"color" : shape.outline!.color, "width" : shape.outline!.thickness})))
                break
                case "polygon":
                    // color, fill, type, width , points_x, points_y

                    if(shape.fill == undefined && shape.outline == undefined){
                        if(ignore_exceptions == true){
                            continue
                        } else {
                            throw "fill and color are both undefined;"
                        }
                    }

                    let cmd :drawPolygon_command= {type:"drawPolygon",points_x : points.map(x => x[0]), points_y : points.map(x => x[1])}
                    let cmd2 = JSON.parse(JSON.stringify(cmd)) as drawPolygon_command; 
                    if(shape.fill){
                        cmd.fill = true;
                        cmd.color = point_fill_to_fill(shape.fill, d.points);
                        result.push(cmd);
                    };
                    if(shape.outline && shape.outline_visible){
                        cmd2.width = shape.outline.thickness;
                        cmd2.color = shape.outline.color
                        result.push(cmd2);
                    }

                break
                case "circle":
                    if(shape.fill == undefined && shape.outline == undefined){
                        if(ignore_exceptions == true){
                            continue
                        } else {
                            throw "fill and color are both undefined;"
                        }
                    }
                    
                    if(points.length != 2){
                        if(ignore_exceptions == true){
                            continue
                        } else {
                            throw "must have 2 points;"
                        }
                    }
                    let cmd3 : drawCircle_command = d_circle(points[0], dist(points[0] , points[1])); 
                    let cmd4 : drawCircle_command = d_circle(points[0], dist(points[0] , points[1])); 
                    if(shape.fill){
                        cmd3.fill = true;
                        cmd3.color = point_fill_to_fill(shape.fill,d.points);
                        result.push(cmd3);
                    };
                    if(shape.outline&& shape.outline_visible){
                        cmd4.width = shape.outline.thickness;
                        cmd4.color = shape.outline.color
                        result.push(cmd4);
                    }
                    // center = points[0], radius = dist(points[0], points[1])
                break;
                case "bezier shape":
                    // color, fill, type, width , points_x, points_y

                    if(shape.fill == undefined && shape.outline == undefined){
                        if(ignore_exceptions == true){
                            continue
                        } else {
                            throw "fill and color are both undefined;"
                        }
                    }
                    let pts  = JSON.parse(JSON.stringify(points)) as point[]
                    if(pts.length  == 0){
                        continue
                    } 
                    while(pts.length % 3 != 1){
                        pts.pop();
                    }

                    let cmd5 :drawBezierShape_command= d_bezier(pts, true)[0] as drawBezierShape_command
                    let cmd6 =  d_bezier(pts, false) as drawBezierCurve_command[]; 
                    if(cmd5  == undefined || cmd6 == undefined){
                        continue
                    }
                    if(shape.fill){
                        cmd5.color = point_fill_to_fill(shape.fill,d.points);
                        result.push(cmd5);
                    };
                    if(shape.outline&& shape.outline_visible){
                        for(let c of cmd6){
                            c.width = shape.outline.thickness;
                            c.color = shape.outline.color
                            result.push(c);
                        }
                    }

                break
                case "smooth bezier shape":
                    // color, fill, type, width , points_x, points_y

                    if(shape.fill == undefined && shape.outline == undefined){
                        if(ignore_exceptions == true){
                            continue
                        } else {
                            throw "fill and color are both undefined;"
                        }
                    }
                    let pts2  = JSON.parse(JSON.stringify(points)) as point[]
                    if(pts2.length  == 0){
                        continue
                    } 
                    while(pts2.length % 2 != 0){
                        pts2.pop();
                    }

                    let cmd7 :drawBezierShape_command= d_smoothbezier(pts2, true, true)[0] as drawBezierShape_command
                    let cmd8 = d_smoothbezier(pts2, false, true) as drawBezierCurve_command[]; 
                    if(cmd7  == undefined || cmd8 == undefined){
                        continue
                    }

                    if(shape.fill){
                        cmd7.color = point_fill_to_fill(shape.fill,d.points);
                        result.push(cmd7);
                    };
                    if(shape.outline&& shape.outline_visible){
                        for(let c of cmd8){
                            c.width = shape.outline.thickness;
                            c.color = shape.outline.color
                            result.push(c);
                        }
                    }

                break
            }
        }
    }
    return result
}
//get points of shape
function get_points(s : shape) : Set<string>{
    let set = new Set(s.points)
    if(s.fill && typeof(s.fill) != "string"){
        if(s.fill.p0 != undefined){
            set.add(s.fill.p0);
        }
        if(s.fill.type != "fill_conic"){
            set.add(s.fill.p1);
        }
    }
    return set
}
function get_visible_points (d : display_total) : Set<string>{
    if(d.show_points == "none"){
        return new Set();
    }
    if(d.show_points == "shape"){
        let [shape, layer] = list_shapes(d)[d.selected_shape ?? Math.random().toString()] ?? [undefined, undefined]
        if(shape != undefined && shape.visible){
            return get_points(shape); 
        }
    }
    if(d.show_points == "layer"){
        let layer = get_layer(d.layers, d.selected_layer);
        if(layer == undefined){
            return new Set();
        }
        return layer.shapes.filter(x => x.visible).map(x => get_points(x)).reduce((x : Set<string>, y : Set<string>) => {x  = x.union(y); return x}, new Set());
    }

    if(d.show_points == "all"){
        return flatten(d.layers.filter(x => d.layer_visibility[x.name] == true).map(x => x.shapes)).filter(x => x.visible).reduce((x : Set<string>, y :shape) => {x  = x.union(get_points(y)); return x}, new Set());
    }
    return new Set();

}


function output_draw(d : display_total, ignore_zoom = false) : draw_command[]{
    // draw the shapes
    let shapes = output(d, true);
    let points_dict = d.points.reduce((prev : Record<string ,point>, next :named_point) => { prev[next[0]] = [next[1], next[2]]; return prev} , {}); 

    //draw the points 
    if(d.show_points){
        for(let p of get_visible_points(d)){
            let selected = d.selected_point == p; 
            shapes.push(add_com(d_circle(points_dict[p], selected ? 4/d.zoom[2] : 2/d.zoom[2]), {"color": selected ? "red" : "black", "fill":true}));
            if(d.show_labels){
                shapes.push(add_com(d_text(p, lincomb(1/d.zoom[2], [4,4],1,points_dict[p])), {"size":15}));
            }
        }
    }
    if(ignore_zoom){
        return shapes;
    }
    shapes = shapes.map(x => scale_command(displace_command(x, [-d.zoom[0], -d.zoom[1]]), [0,0], d.zoom[2],d.zoom[2]) )

    return shapes

}

function list_shapes(d : display_total) : Record<string, [shape,string]>{
    let x : Record<string, [shape,string]>= {}
    for(let item of d.layers){
        for(let item2 of item.shapes){
            x[item2.name] = [item2, item.name];
        }
    }
    return x
}

function layer_exists(d : display_total, s : string){
    return d.layers.map(x => x.name).indexOf(s) != -1;
}

function shape_exists(d : display_total, s : string){
    return list_shapes(d)[s] != undefined;
}


function selected_shape_visible(d : display_total){
    if(display.selected_shape == undefined){
        return false; // if the shape doesn't exist, it's not visible
    }
    let shape = list_shapes(display)[display.selected_shape][0]
    if(!shape.visible){
        return false; 
    }
    return display.layer_visibility[ shape.parent_layer];
}

function get_closest_point(d : display_total, p : point, visible: boolean = true) : string{
    let check_points : Set<string> | undefined = undefined;
    if(visible){
        check_points = get_visible_points(d);
    }
    let min = Number.POSITIVE_INFINITY;
    let closest = "";
    for(let [name,x,y] of d.points){
        if(check_points == undefined || check_points.has(name)){
            let distance = dist(p, [x,y]);
            if(distance < min){
                min = distance;
                closest = name;
            }
        }
    }
    return closest; 
}

// MUTATE DISPLAY TOTAL

//create a new point and add it to the current shape
function rename_layer(d : display_total, layer_orig : string, layer_new : string){
    if(layer_orig == layer_new){
        return;
    }
    if(layer_exists(d, layer_new)){
        d.message = "layer with that name already exists";
        return;
    }
    for(let layer of d.layers){
        if(layer.name == layer_orig){
            layer.name = layer_new;
            d.layer_visibility[layer_new] = d.layer_visibility[layer_orig];
            delete d.layer_visibility[layer_orig]; 
            if(d.selected_layer == layer_orig){
                d.selected_layer = layer_new;
            }
        }
    }
}
function add_unassociated_point(d : display_total, p : point){
    let name = d.total_points.toString();
    d.points.push([name, p[0], p[1]]);
    d.total_points++;    
    return name;
}

function add_point(d : display_total, p : point){
    if(d.selected_shape == undefined){
        d.message = "selected shape is not visible";
        return
    }
    if(!selected_shape_visible(d)){
        d.message = "selected shape is not visible";
        return;
    }
    let shape = list_shapes(d)[d.selected_shape][0]
    let name = d.total_points.toString();
    d.points.push([name, p[0], p[1]]);
    d.total_points++;
    shape.points.push(name);
    return name
}

// add existing point to shape
function add_point_s(d : display_total , layer : string, shape : string, point : string){
    if(!selected_shape_visible(d)){
        d.message = "selected shape is not visible";
        return;
    }
    let layer_obj = get_layer(d.layers, layer);
    if(layer_obj != undefined){
        let shape_obj = get_shape(layer_obj.shapes, shape);
        if(shape_obj != undefined){
            shape_obj.points.push(point);
        }
    }
}

// pop point from shape
function pop_point_s(d : display_total , layer : string, shape : string){
    if(!selected_shape_visible(d)){
        d.message = "selected shape is not visible";
        return;
    }
    let layer_obj = get_layer(d.layers, layer);
    if(layer_obj != undefined){
        let shape_obj = get_shape(layer_obj.shapes, shape);
        if(shape_obj != undefined){
            shape_obj.points.pop();
        }
    }
}

function move_point(d : display_total, point : string, new_point : point){
    if(!get_visible_points(d).has(point)){
        d.message = "point is not in a visible layer"; 
        return;
    }
    for(let p of d.points){
        if(p[0] == point){
            p[1] = new_point[0]
            p[2] = new_point[1]
        }
    }
}

function set_fillstyle(d : display_total,name : string, data  :  point_fill | undefined){

    let [shape, layer] = list_shapes(d)[name]
    if(d.layer_visibility[layer] == false){
        d.message = "shape is not in visible layer";
        return
    }
    if(data == "default1"){
        data =  { "type":"fill_linear", "p0" : shape.points[0], "p1" :  shape.points[1], "colorstops" : [[0,"blue"], [1, "red"]] }
    }
    if(data == "default2"){
        data =  { "type":"fill_radial", "p0" : shape.points[0], "p1" : shape.points[0], "r0" : 0, "r1" : 100, "colorstops" :  [[0,"blue"], [1, "red"]]}
    }
    if(data == "default3"){
        data =  { "type":"fill_conic", "p0" : shape.points[0], "theta" : 0, "colorstops" : [[0,"blue"], [1, "red"]] }
    }
    shape.fill = data;
}

function set_outline(d : display_total, name : string , data  : outline  | undefined){
    let [shape, layer] = list_shapes(d)[name]
    if(d.layer_visibility[layer] == false){
        d.message = "shape is not in visible layer";
        return
    }
    shape.outline = data;
}
// the new shape is automatically selected and any points are deselected
// also adds a point if there is no selected point
function add_new_shape(d : display_total, layer : string,type : shape_types , p : point ){
    if(d.layer_visibility[d.selected_layer] == false){
        d.message = "add shape when selected layer not visible";
        return;
    }
    let new_point = "";

    let name = "shape " + d.total_shapes;
    while(shape_exists(d, name)){
        name = "shape " + d.total_shapes;
        d.total_shapes++;
    }
    d.total_shapes++;
    let shape : shape = {"parent_layer" : layer, "type":type, "points" : [], "name" : name, "outline_visible":true, "visible":true}
    if(type == "line" || type == "bezier" || type == "smooth bezier"){
        shape.outline = {"color":"black" , "thickness" : 1}
    } else {
        shape.fill = "black";
    }
    get_layer(d.layers, layer)?.shapes.push(shape)
    d.selected_shape = name;

    if(d.selected_point == undefined){
        new_point = add_point(d, p) ?? "";
    } else {
        new_point = d.selected_point;
        shape.points.push(new_point);
    }
    d.selected_point = undefined
    return name;

}
function clone_layer(d : display_total, l : string){
    let layer = get_layer(d.layers,l);
    let layers = new Set(d.layers.map(x => x.name));
    if(layer != undefined){
        let new_name = l + " (clone)";
        while(layers.has(new_name )){
            new_name += ",";
        }
        let new_layer : layer = {"name" : new_name, "shapes": []};
        for(let shape of layer.shapes){
            let new_shape = clone_shape(d, shape.name, false);
            if(new_shape != undefined){
                new_layer.shapes.push(new_shape);
                new_shape.parent_layer = new_name;
            }
        }
        d.layers.push(new_layer);
        d.layer_visibility[new_name] = true;
        return new_layer;
    }
}

// returns the shape
function clone_shape(d : display_total, shape_name : string, add_to_layer : boolean = true){
    let s=  list_shapes(d)[shape_name];
    let points_dict = d.points.reduce((prev : Record<string, point>, next : named_point) => { prev[next[0]] = [next[1], next[2]]; return prev} , {}); 
    if(s != undefined){
        let [shape, layer] = s;
        let layer_obj = get_layer(d.layers, layer); 
        if(layer_obj != undefined){
            let new_shape = JSON.parse(JSON.stringify(shape)) as shape;
            new_shape.name = new_shape.name + " (clone)";
            while(list_shapes(d)[new_shape.name] != undefined){
                new_shape.name = new_shape.name + ",";
            }
            if(add_to_layer){
                layer_obj.shapes.push(new_shape);
            }
            // clone the points
            for(let [i, p] of new_shape.points.entries()){
                new_shape.points[i] = add_unassociated_point(d, points_dict[p]);
            }
            if(new_shape.fill && typeof(new_shape.fill) != "string"){
                new_shape.fill.p0 = add_unassociated_point(d, points_dict[new_shape.fill.p0]);
                if(new_shape.fill.type != "fill_conic"){
                    new_shape.fill.p1 = add_unassociated_point(d, points_dict[new_shape.fill.p1]);
                    
                }
            }
            d.selected_shape = new_shape.name;
            return new_shape; 
        }
    } 
}

type matrix3 = [point3d,point3d,point3d]
// applies to selected shape or layer
function apply_matrix3(d :display_total, mat : matrix3, scope : "shape" | "layer" | "all" | string[]){
    // don't question it
    let points_to_affect = scope == "shape" ? get_points(list_shapes(d)[d.selected_shape ?? Math.random().toString()]?.[0]  ?? {type:"line", points:[]}) : (scope == "layer" ? (get_layer(d.layers, d.selected_layer)?.shapes ?? []).reduce((x : Set<string> , y : shape) => {x=x.union(get_points(y)); return x;} , new Set()) : (scope == "all" ? new Set(d.points.map(x => x[0])) : flatten(scope.map(x => get_layer(d.layers, x)?.shapes ?? [])).map(x => get_points(x)).reduce((x : Set<string>, y : Set<string>) => {x = x.union(y); return x}, new Set()) ))

    for(let [i, pt] of d.points.entries()){
        if(points_to_affect.has(pt[0])){
            let result = Mv(mat,  [pt[1], pt[2], 1]);
            result = scalar_multiple(1/result[2], result) as point3d; 
            d.points[i][1] = result[0];
            d.points[i][2] = result[1];
        }
    }
}

function move_shape(d : display_total, shape_name : string, target_layer : string){
    let s=  list_shapes(d)[shape_name];
    if(s != undefined){
        let [shape, layer] = s;
        let layer_obj = get_layer(d.layers, layer);
        let new_layer_obj = get_layer(d.layers, target_layer); 
        if(layer_obj == undefined || new_layer_obj == undefined){
            return; 
        }
        // remove from old layer  
        layer_obj.shapes = layer_obj.shapes.filter(x => x.name != shape_name); 
        // add to new layer
        shape.parent_layer = target_layer;
        new_layer_obj.shapes.push(shape);
    } 
}


function add_layer(d : display_total, layer : string){
    if(layer_exists(d, layer)){
        d.message = "a layer with that name already exists"
        return ; // layer alread exists
    }
    d.layers.push({name : layer, shapes : []})
    d.layer_visibility[layer] = true;
    d.selected_layer = layer;
}   

function select_layer(d : display_total, layer : string){
    let layer_obj = get_layer(d.layers, layer) 
    if(layer_obj != undefined){
        d.selected_layer = layer;
        d.selected_shape = layer_obj.shapes[0]?.name ?? undefined;
        d.selected_point = undefined;
    }
}

function select_shape(d : display_total, shape : string){
    let layer = get_layer(d.layers, d.selected_layer); 
    
    if(layer != undefined && get_shape(layer.shapes, shape)){
        d.selected_shape = shape;
        d.selected_point = undefined;
    }
}

// from current layer - must be visible
function remove_shape(d : display_total, shape : string){
    if(d.layer_visibility[d.selected_layer] == false){
        d.message = "selected layer not visible";
        return;
    }
    let layer = get_layer(d.layers, d.selected_layer); 
    if(layer == undefined){
        d.message = "selected layer doesn't exist";
        return
    }
    for(let i=0; i < layer.shapes.length; i++){
        if(layer.shapes[i].name == shape){
            layer.shapes.splice(i, 1);
        }
    }
    d.selected_point = undefined;
    d.selected_shape= undefined;
}

function rename_shape(d : display_total, shape_orig : string, shape_new : string){
    if(shape_orig == shape_new){
        return;
    }
    if(shape_exists(d, shape_new)){
        d.message = "shape with that name already exists";
        return;
    }
    let layer = get_layer(d.layers, d.selected_layer); 
    if(layer == undefined){
        d.message = "selected layer doesn't exist";
        return
    }
    for(let i=0; i < layer.shapes.length; i++){
        if(layer.shapes[i].name == shape_orig){
            layer.shapes[i].name = shape_new
            if(d.selected_shape == shape_orig){
                d.selected_shape = shape_new
            }
        }
    }
}
// takes in a SCREEN point
function zoom_scale(d : display_total, scale_factor : number, p : point){

    let world_point = screen_to_world(p, d.zoom)
    // do some changes
    // world_to_screen(world_point, d.zoom) = p  

    // let x and y be the old top left, and X, Y be the new ones
    // p[0] / d.zoom[2] + x, p[1] / d.zoom[2] + 1 
    // (p[0] / d.zoom[2] + x - X) * scale_factor * d.zoom[2] = p[0], (p[1] / d.zoom[2] + 1 - Y) * scale_factor * d.zoom[2] = p[1] 
    // solve for X and Y
    //p[0] / d.zoom[2] + x  -p[0]/(scale_factor * d.zoom[2])= 
    let x = d.zoom[0]
    let y = d.zoom[1]
    d.zoom = [p[0] / d.zoom[2] + x  -p[0]/(scale_factor * d.zoom[2]) , p[1] / d.zoom[2] + y  -p[1]/(scale_factor * d.zoom[2]), d.zoom[2] * scale_factor];
}
/*
let base_display : display_total = {
    "points" : [["a", 0,0],[ "b",0, 50]],
    "layers" : [{"name":"base", "shapes":[{"parent_layer":"base", "name":"a", "type":"circle","fill":"white","points":["a","b"]}]}],
    "zoom" : [0,0,1],
    "layer_visibility" : {"base":true},
    show_points : "all",
    show_labels : false, 
    selected_layer : "base",
    total_points : 0,
    total_shapes : 0,
    message : ""
}
*/

let base_display : display_total = {
    "points" : [],
    "layers" : [{"name":"base", "shapes":[]}],
    "zoom" : [0,0,1],
    "layer_visibility" : {"base":true},
    show_points : "all",
    show_labels : false, 
    selected_layer : "base",
    total_points : 0,
    total_shapes : 0,
    message : ""
}

let display = JSON.parse(JSON.stringify(base_display)) as display_total;

let history  : display_total[] = []
let redo_lst : display_total[] = []; 

function undo(){
    let zoom = JSON.parse(JSON.stringify(display.zoom));
    if(history.length == 0){
        return;
    }
    redo_lst.push(history.pop()!);
    display = history[history.length-1]
    display = JSON.parse(JSON.stringify(display));
    display.zoom = zoom;
}
function redo(){
    if(redo_lst.length == 0){
        return;
    }
    let zoom = JSON.parse(JSON.stringify(display.zoom));
    display = redo_lst.pop()!; 
    history.push(display);
    display = JSON.parse(JSON.stringify(display));
    display.zoom = zoom;
}

function change(){
    

    history.push(JSON.parse(JSON.stringify(display)));  
    if(history.length > 100){
        history.shift();
    }
    redo_lst = [] ; 
    draw_all();
}

function draw_all(canvas_only  : boolean = false ){
    verify(display);
    (document.getElementById("bigc") as HTMLCanvasElement).getContext("2d")?.clearRect(0,0,3333,3333);
    draw_wrap(output_draw(display), (document.getElementById("bigc") as HTMLCanvasElement).getContext("2d")!);
    if(canvas_only){
        return;
    }
    (document.getElementById("data") as HTMLTextAreaElement).value = JSON.stringify(display);
    //side stuff
    (document.getElementById("frames") as HTMLDivElement).innerHTML = "";
    (document.getElementById("frames2") as HTMLDivElement).innerHTML = "";
    (document.getElementById("frames3") as HTMLDivElement).innerHTML = "";

    // layers 
    (document.getElementById("frames") as HTMLDivElement).innerHTML = "<b>LAYER</b><br />"
    for(let [i, layer] of display.layers.entries()){
        (document.getElementById("frames") as HTMLDivElement).innerHTML += `<div ${layer.name
             == display.selected_layer ? "style=\"background-color:lightblue;\"" : ""}><input type="text" value="${layer.name}" onChange="rename_layer(display, '${layer.name}', arguments[0].target.value);change();" /><button onClick="select_layer(display,'${layer.name}');change();">Select</button>
<button onClick="display.layer_visibility['${layer.name}'] = !display.layer_visibility['${layer.name}'] ;change();">${display.layer_visibility[layer.name] ? "vis" : "invis"}</button>${layer.shapes.length}
<br /><button onClick="shift_lst(display.layers, ${i}, false);change()">up</button>
<button onClick="shift_lst(display.layers, ${i}, true);change()">down</button>
<button onClick="move_shape(display, display.selected_shape, '${layer.name}'); display.selected_shape= get_layer(display.layers, display.selected_layer).shapes[${i}]?.name; change(); ">Move shape</button>
<button onClick="display.layers.splice(${i}, 1);delete display.layer_visibility['${layer.name}'];change();">Delete</button>
<button onClick="clone_layer(display, '${layer.name}');change();">Clone</button>
<br /></div>
`;
    }
    (document.getElementById("frames") as HTMLDivElement).innerHTML += `<br />.<br /><input type="text" id="add_new" /> <button onClick="add_layer(display, document.getElementById('add_new').value);change(); ">Add</button>
<br />`;

    //SHAPES IN LAYER
    (document.getElementById("frames2") as HTMLDivElement).innerHTML += `<b>SHAPES IN LAYER ${display.selected_layer}</b>`
    for(let [i, shape] of (get_layer(display.layers, display.selected_layer)?.shapes ?? []).entries() ) {
        (document.getElementById("frames2") as HTMLDivElement).innerHTML += `<div ${shape.name
             == display.selected_shape ? "style=\"background-color:lightblue;\"" : ""}>${shape.name} : ${shape.type} <button onClick="select_shape(display, '${shape.name}') ; change();">Select</button>
<button onClick="clone_shape(display, '${shape.name}');change();">Clone</button>
<button onClick="remove_shape(display, '${shape.name}'); change();">Delete</button>
 
<button onClick="shift_lst(get_layer(display.layers, display.selected_layer)?.shapes, ${i}, false);change()">  up</button>
<button onClick="shift_lst(get_layer(display.layers, display.selected_layer).shapes, ${i}, true);change()">  down</button><button onClick="let x = list_shapes(display)['${shape.name}'][0]; x.visible = !x.visible; change();">${shape.visible ? "visible" : "invisible"}</button> </div><br />`
    }   
    //SELECTED SHAPE
    let points_dict : Record<string, point> = display.points.reduce((prev : Record<string, point>, curr : named_point) => {prev[curr[0]]= [curr[1], curr[2]]; return prev }, {})

    if(display.selected_shape != undefined){
        let selected_shape : shape  =list_shapes(display)[display.selected_shape][0];
        if(selected_shape != undefined){
            (document.getElementById("frames3") as HTMLDivElement).innerHTML = `<div><input type="text" id="shape_name" value="${selected_shape.name}" onChange="rename_shape(display, display.selected_shape, document.getElementById('shape_name').value);change();"/> <br /> ${selected_shape.type} <select id="shape_types_dropdown" onChange ="list_shapes(display)[display.selected_shape][0].type = document.getElementById('shape_types_dropdown').selectedOptions[0].innerText; change()" ><option>line</option>
<option>bezier</option>
<option>smooth bezier</option>
<option>polygon</option>
<option>circle</option>
<option>bezier shape</option>
<option>smooth bezier shape</option> </select> <br /> ${selected_shape.visible ? "visible" : "invisible"} <button onClick="let x = list_shapes(display)['${selected_shape.name}'][0]; x.visible =!x.visible;change()">Toggle visible</button><br />`;
            
            (document.getElementById("frames3") as HTMLDivElement).innerHTML  +=`<br /><b> OUTLINE ${selected_shape.outline_visible ? "" : " (invis)"}</b><br />`
            if(selected_shape.outline != undefined){
                (document.getElementById("frames3") as HTMLDivElement).innerHTML  += `<textarea id="${selected_shape.name} outline">${JSON.stringify(selected_shape.outline)}</textarea><br /><button onClick="set_outline(display, '${selected_shape.name}', JSON.parse(document.getElementById('${selected_shape.name} outline').value));change();">Set outline</button>
<br /><button onClick="let x = list_shapes(display)['${selected_shape.name}'][0]; x.outline_visible = !x.outline_visible; change();">Toggle outline</button><button onClick="set_outline(display, '${selected_shape.name}', undefined);change();">Remove outline</button>
`
            } else {
                (document.getElementById("frames3") as HTMLDivElement).innerHTML  += `<button onClick="set_outline(display,'${selected_shape.name}', {'thickness':1,'color':'black'});change();">Add outline</button>
`
            }
            (document.getElementById("frames3") as HTMLDivElement).innerHTML  +="<br /><b> FILLSTYLE</b><br />"
            if(selected_shape.fill != undefined){
                (document.getElementById("frames3") as HTMLDivElement).innerHTML  += `<textarea id="${selected_shape.name} fillstyle">${JSON.stringify(selected_shape.fill)}</textarea><br /><button onClick="fillstyle_check('${selected_shape.name}', document.getElementById('${selected_shape.name} fillstyle').value);">Set fillstyle</button>
<br /><button onClick="set_fillstyle(display, '${selected_shape.name}', undefined);change();">Remove fillstyle</button>
`
            } else {
                (document.getElementById("frames3") as HTMLDivElement).innerHTML  += `<button onClick="set_fillstyle(display,'${selected_shape.name}', 'black');change();">Add fillstyle</button>
<br />`;
                (document.getElementById("frames3") as HTMLDivElement).innerHTML  += `<button onClick="set_fillstyle(display,'${selected_shape.name}', 'default1');change();">Add linear fillstyle</button>
<br />`;
                (document.getElementById("frames3") as HTMLDivElement).innerHTML  += `<button onClick="set_fillstyle(display,'${selected_shape.name}', 'default2');change();">Add radial fillstyle</button>
<br />`;
                (document.getElementById("frames3") as HTMLDivElement).innerHTML  += `<button onClick="set_fillstyle(display,'${selected_shape.name}', 'default3');change();">Add conic fillstyle</button>
<br />`;
            }
            (document.getElementById("frames3") as HTMLDivElement).innerHTML  += "<br />";

            for(let [i, point] of selected_shape.points.entries()){
                (document.getElementById("frames3") as HTMLDivElement).innerHTML  += `${point} (${points_dict[point][0].toString().substring(0,6)}, ${points_dict[point][1].toString().substring(0,6)}) <button onClick="display.selected_point = '${point}';change();">Select</button>
 <button onClick="list_shapes(display)['${selected_shape.name}'][0].points.splice(${i},1);display.selected_point=undefined;change();">Pop</button>
<br />` 
            }
            (document.getElementById("frames3") as HTMLDivElement).innerHTML += "</div>";
        }
    
    }

    (document.getElementById("message") as HTMLDivElement).innerHTML = display.message 
}

function screen_to_world (p : point, factor : point3d) : point{
    return [p[0] / factor[2] + factor[0], p[1] / factor[2] + factor[1]]
}

function world_to_screen (p : point, factor : point3d): point{
    return [(p[0] - factor[0]) * factor[2],(p[1] - factor[1]) * factor[2]]
}

function click(point : point){
    point = screen_to_world(point, display.zoom);
    
    // move a point
    if(display.selected_point != undefined){
        move_point(display, display.selected_point, point);
    }
    // add a point
    if(display.selected_shape != undefined && display.selected_point == undefined){
        add_point(display, point);
    } else {
        display.message = "no shape selected"
    }
    change();
}



//WASD is for scrolling, 123456 is for adding new shapes
//Q : select a point, E : unselect points;
function keypress(point : point, key : string){
    key = key.toLowerCase();
    point = screen_to_world(point, display.zoom);
    display.message = "";
    if(key == "`"){
        document.getElementById("bigc")!.focus();
    }
    else if(key == "q"){//select point
        let closest = get_closest_point(display, point, true)
        if(closest != ""){
            display.selected_point = closest; 
        }
    }
    else if(key == "e"){//unselect point 
        if(display.selected_point == undefined){
            display.selected_shape = undefined;
        }
        display.selected_point = undefined;
        
        
    }
    else if(key == "r"){// add existing point to shape
        if(!selected_shape_visible(display)){
            display.message = "no shape selected or selected shape is not visible";
            return ; // don't do anything if shape is not visible 
        }
        let closest = display.selected_point ?? get_closest_point(display, point, true)
        if(closest != ""){
            if(display.selected_shape != undefined){
                let [shape, layer] = list_shapes(display)[display.selected_shape];
                shape.points.push(closest);
            }
        }
    }
    else if(key == "f"){// pop point from shape
        if(display.selected_shape != undefined){
            pop_point_s(display, display.selected_layer, display.selected_shape);
        }
    }
    else if(key == " "){
        let points_dict : Record<string, point> = display.points.reduce((prev :Record<string, point> , curr : named_point) => {prev[curr[0]]= [curr[1], curr[2]]; return prev }, {})
        if(display.selected_shape == undefined){
            return;
        }
        let shape = list_shapes(display)[display.selected_shape]?.[0];

        if(shape != undefined){
            let pts = shape.points.map(x => points_dict[x]);
            display.zoom = [_.min(pts.map(x => x[0])) ?? 0, _.min(pts.map(x => x[1])) ?? 0, display.zoom[2]];
        }
    }
    // fillstyle points
    else if("zxcv".indexOf(key) != -1){
        if(!selected_shape_visible(display)){
            display.message = "selected shape is not visible";
            return;
        }
        if(display.selected_shape == undefined){
            display.message = "no shape selected";
            return;
        }
    
        let [shape, layer] = list_shapes(display)[display.selected_shape]
        if(shape.fill == undefined || typeof(shape.fill) == "string" ){
            display.message = "selected shape fillstyle does not support points";
        } else {
            // end of error checking
            if(key == "z"){
                shape.fill.p0 = add_unassociated_point(display, point);
            }
            if(key == "x"){
                shape.fill.p0 = get_closest_point(display, point);
            }
            if(shape.fill.type != "fill_conic"){
                if(key == "c"){
                    shape.fill.p1 = add_unassociated_point(display, point);
                }
                if(key == "v"){
                    shape.fill.p1 = get_closest_point(display, point);
                }
            }
        }

    }
    // add shapes : 
    else if(key == "1"){
        add_new_shape(display, display.selected_layer,  "line", point)
    }
    else if(key == "2"){
        add_new_shape(display, display.selected_layer,  "bezier", point)
    }
    else if(key == "3"){
        add_new_shape(display, display.selected_layer,  "smooth bezier", point)
    }
    else if(key == "4"){
        add_new_shape(display, display.selected_layer,  "polygon", point)
    }
    else if(key == "5"){
        add_new_shape(display, display.selected_layer,  "circle", point)
    }
    else if(key == "6"){
        add_new_shape(display, display.selected_layer,  "bezier shape", point)
    }
    else if(key == "7"){
        add_new_shape(display, display.selected_layer,  "smooth bezier shape", point)
    }
    else { 
        // nothing changed, don't call change
        return;
    }
    change(); 
}

// takes in screen point
function scroll_wheel( point : point ,up : boolean){
    let world_point = screen_to_world([point[0], point[1]], display.zoom);
    zoom_scale( display, up ? 1.2 : 1/1.2 , point);
    let new_point = world_to_screen(world_point, display.zoom)
    if(dist(point, new_point)> 3){
        throw "scrolling failed, not a fixed point";
    }
    draw_all(true);
}

function move_points_in_shape(d : display_total, shape : string, amt : point){
    let shape_obj = list_shapes(d)[shape][0];
    let to_move = get_points(shape_obj)
    for(let [i, pt ] of display.points.entries()){
        if(to_move.has(pt[0])){
            display.points[i][1] += amt[0];
            display.points[i][2] += amt[1];
        }
    }
}

function scroll_key(what : "screen" | "layer" | "shape", direction : point){
    if(what == "screen"){
        display.zoom = lincomb(1, display.zoom, 1, [direction[0], direction[1], 0]) as point3d;
    }
    if(what == "layer"){
        for(let shape of get_layer(display.layers, display.selected_layer)!.shapes){
            move_points_in_shape(display, shape.name, direction);
        }
    }
    if(what == "shape" && display.selected_shape != undefined){
        move_points_in_shape(display, display.selected_shape, direction);
    }
    draw_all(true);
}

