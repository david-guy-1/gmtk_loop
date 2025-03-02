//import { add_com, d_bezier, d_circle, d_line, d_smoothbezier, d_text, drawLine, drawPolygon } from "./canvasDrawing"
//import { dist, flatten, lincomb } from "./lines"
//import {draw_wrap} from "./process_draws";
function get_layer(layers, name) {
    for (let item of layers) {
        if (item.name == name) {
            return item;
        }
    }
    return undefined;
}
function get_shape(shapes, name) {
    for (let item of shapes) {
        if (item.name == name) {
            return item;
        }
    }
    return undefined;
}
function get_point(point, name) {
    for (let item of point) {
        if (item[0] == name) {
            return [item[1], item[2]];
        }
    }
    return undefined;
}
function verify_uniq(s) {
    let seen = new Set();
    for (let item of s) {
        if (seen.has(item.name)) {
            throw "name is not unique " + item;
        }
        seen.add(item.name);
    }
}
function verify(d) {
    verify_uniq(d.layers);
    for (let item of Object.keys(d.layer_visibility)) {
        let layer = get_layer(d.layers, item);
        if (layer == undefined) {
            throw "layer is undefined " + item;
        }
        verify_uniq(layer.shapes);
        for (let shape of layer.shapes) {
            for (let point of shape.points) {
                if (get_point(d.points, point) == undefined) {
                    throw "point is undefined " + point;
                }
            }
        }
    }
    verify_uniq(d.points.map(x => { return { name: x[0] }; }));
}
// for displaying in game
// this is really ugly / duplicated code and could be cleaned up but I'm too lazy
function output(d, ignore_exceptions = false) {
    let result = [];
    for (let layer_name of Object.keys(d.layer_visibility)) {
        let layer = get_layer(d.layers, layer_name);
        if (layer == undefined || d.layer_visibility[layer_name] == false) {
            continue;
        }
        for (let shape of layer.shapes) {
            let points = shape.points.map((x, y, z) => get_point(d.points, x) ?? [0, 0]);
            switch (shape.type) {
                case "line":
                    if (shape.outline == undefined) {
                        if (ignore_exceptions == true) {
                            continue;
                        }
                        else {
                            throw "shape must have an outline";
                        }
                    }
                    for (let i = 0; i < points.length - 1; i++) {
                        let pt1 = points[i];
                        let pt2 = points[i + 1];
                        result.push(add_com(d_line(pt1, pt2), { "color": shape.outline.color, "width": shape.outline.thickness }));
                    }
                    break;
                case "bezier":
                    if (shape.outline == undefined) {
                        if (ignore_exceptions == true) {
                            continue;
                        }
                        else {
                            throw "shape must have an outline";
                        }
                    }
                    if (points.length == 0) {
                        continue;
                    }
                    while (points.length % 3 != 1) {
                        points.pop();
                    }
                    result = result.concat(d_bezier(points, false).map(x => add_com(x, { "color": shape.outline.color, "width": shape.outline.thickness })));
                    break;
                case "smooth bezier":
                    if (shape.outline == undefined) {
                        if (ignore_exceptions == true) {
                            continue;
                        }
                        else {
                            throw "shape must have an outline";
                        }
                    }
                    if (points.length == 0) {
                        continue;
                    }
                    while (points.length % 2 != 0) {
                        points.pop();
                    }
                    result = result.concat(d_smoothbezier(points, false).map(x => add_com(x, { "color": shape.outline.color, "width": shape.outline.thickness })));
                    break;
                case "polygon":
                    // color, fill, type, width , points_x, points_y
                    if (shape.fill == undefined && shape.outline == undefined) {
                        if (ignore_exceptions == true) {
                            continue;
                        }
                        else {
                            throw "fill and color are both undefined;";
                        }
                    }
                    let cmd = { type: "drawPolygon", points_x: points.map(x => x[0]), points_y: points.map(x => x[1]) };
                    let cmd2 = JSON.parse(JSON.stringify(cmd));
                    if (shape.fill) {
                        cmd.fill = true;
                        cmd.color = shape.fill;
                        result.push(cmd);
                    }
                    ;
                    if (shape.outline) {
                        cmd2.width = shape.outline.thickness;
                        cmd2.color = shape.outline.color;
                        result.push(cmd2);
                    }
                    break;
                case "circle":
                    if (shape.fill == undefined && shape.outline == undefined) {
                        if (ignore_exceptions == true) {
                            continue;
                        }
                        else {
                            throw "fill and color are both undefined;";
                        }
                    }
                    if (points.length != 2) {
                        if (ignore_exceptions == true) {
                            continue;
                        }
                        else {
                            throw "must have 2 points;";
                        }
                    }
                    let cmd3 = d_circle(points[0], dist(points[0], points[1]));
                    let cmd4 = d_circle(points[0], dist(points[0], points[1]));
                    if (shape.fill) {
                        cmd3.fill = true;
                        cmd3.color = shape.fill;
                        result.push(cmd3);
                    }
                    ;
                    if (shape.outline) {
                        cmd4.width = shape.outline.thickness;
                        cmd4.color = shape.outline.color;
                        result.push(cmd4);
                    }
                    // center = points[0], radius = dist(points[0], points[1])
                    break;
                case "bezier shape":
                    // color, fill, type, width , points_x, points_y
                    if (shape.fill == undefined && shape.outline == undefined) {
                        if (ignore_exceptions == true) {
                            continue;
                        }
                        else {
                            throw "fill and color are both undefined;";
                        }
                    }
                    let pts = JSON.parse(JSON.stringify(points));
                    if (pts.length == 0) {
                        continue;
                    }
                    while (pts.length % 3 != 1) {
                        pts.pop();
                    }
                    let cmd5 = d_bezier(pts, true)[0];
                    let cmd6 = d_bezier(pts, false);
                    if (cmd5 == undefined || cmd6 == undefined) {
                        continue;
                    }
                    if (shape.fill) {
                        cmd5.color = shape.fill;
                        result.push(cmd5);
                    }
                    ;
                    if (shape.outline) {
                        for (let c of cmd6) {
                            c.width = shape.outline.thickness;
                            c.color = shape.outline.color;
                            result.push(c);
                        }
                    }
                    break;
                case "smooth bezier shape":
                    // color, fill, type, width , points_x, points_y
                    if (shape.fill == undefined && shape.outline == undefined) {
                        if (ignore_exceptions == true) {
                            continue;
                        }
                        else {
                            throw "fill and color are both undefined;";
                        }
                    }
                    let pts2 = JSON.parse(JSON.stringify(points));
                    if (pts2.length == 0) {
                        continue;
                    }
                    while (pts2.length % 2 != 0) {
                        pts2.pop();
                    }
                    let cmd7 = d_smoothbezier(pts2, true)[0];
                    let cmd8 = d_smoothbezier(pts2, false);
                    if (cmd7 == undefined || cmd8 == undefined) {
                        continue;
                    }
                    if (shape.fill) {
                        cmd7.color = shape.fill;
                        result.push(cmd7);
                    }
                    ;
                    if (shape.outline) {
                        for (let c of cmd8) {
                            c.width = shape.outline.thickness;
                            c.color = shape.outline.color;
                            result.push(c);
                        }
                    }
                    break;
            }
        }
    }
    return result;
}
function get_visible_points(d) {
    if (d.show_points == "none") {
        return new Set();
    }
    if (d.show_points == "shape") {
        let [shape, layer] = list_shapes(d)[d.selected_shape ?? Math.random().toString()] ?? [undefined, undefined];
        if (shape != undefined) {
            return new Set(shape.points);
        }
    }
    if (d.show_points == "layer") {
        let layer = get_layer(d.layers, d.selected_layer);
        if (layer == undefined) {
            return new Set();
        }
        return new Set(flatten(layer.shapes.map(x => x.points)));
    }
    if (d.show_points == "all") {
        return new Set(flatten(flatten(d.layers.filter(x => d.layer_visibility[x.name] == true).map(x => x.shapes)).map(x => x.points)));
    }
    return new Set();
}
function output_draw(d) {
    // draw the shapes
    let shapes = output(d, true);
    let points_dict = d.points.reduce((prev, next) => { prev[next[0]] = [next[1], next[2]]; return prev; }, {});
    //draw the points 
    if (d.show_points) {
        for (let p of get_visible_points(d)) {
            let selected = d.selected_point == p;
            shapes.push(add_com(d_circle(points_dict[p], selected ? 4 : 2), { "color": selected ? "red" : "black", "fill": true }));
            if (d.show_labels) {
                shapes.push(add_com(d_text(p, lincomb(1, [4, 4], 1, points_dict[p])), { "size": 15 }));
            }
        }
    }
    return shapes;
}
function list_shapes(d) {
    let x = {};
    for (let item of d.layers) {
        for (let item2 of item.shapes) {
            x[item2.name] = [item2, item.name];
        }
    }
    return x;
}
function layer_exists(d, s) {
    return d.layers.map(x => x.name).indexOf(s) != -1;
}
function shape_exists(d, s) {
    return list_shapes(d)[s] != undefined;
}
function selected_shape_visible(d) {
    if (display.selected_shape == undefined) {
        return false; // if the shape doesn't exist, it's not visible
    }
    return display.layer_visibility[list_shapes(display)[display.selected_shape][0].parent_layer];
}
function get_closest_point(d, p, visible = true) {
    let check_points = undefined;
    if (visible) {
        check_points = get_visible_points(d);
    }
    let min = Number.POSITIVE_INFINITY;
    let closest = "";
    for (let [name, x, y] of d.points) {
        if (check_points == undefined || check_points.has(name)) {
            let distance = dist(p, [x, y]);
            if (distance < min) {
                min = distance;
                closest = name;
            }
        }
    }
    return closest;
}
// MUTATE DISPLAY TOTAL
//create a new point and add it to the current shape
function rename_layer(d, layer_orig, layer_new) {
    if (layer_orig == layer_new) {
        return;
    }
    if (layer_exists(d, layer_new)) {
        d.message = "layer with that name already exists";
        return;
    }
    for (let layer of d.layers) {
        if (layer.name == layer_orig) {
            layer.name = layer_new;
            d.layer_visibility[layer_new] = d.layer_visibility[layer_orig];
            delete d.layer_visibility[layer_orig];
            if (d.selected_layer == layer_orig) {
                d.selected_layer = layer_new;
            }
        }
    }
}
function add_point(d, p) {
    if (d.selected_shape == undefined) {
        d.message = "selected shape is not visible";
        return;
    }
    if (!selected_shape_visible(d)) {
        d.message = "selected shape is not visible";
        return;
    }
    let shape = list_shapes(d)[d.selected_shape][0];
    let name = d.total_points.toString();
    d.points.push([name, p[0], p[1]]);
    d.total_points++;
    shape.points.push(name);
    return name;
}
// add existing point to shape
function add_point_s(d, layer, shape, point) {
    if (!selected_shape_visible(d)) {
        d.message = "selected shape is not visible";
        return;
    }
    let layer_obj = get_layer(d.layers, layer);
    if (layer_obj != undefined) {
        let shape_obj = get_shape(layer_obj.shapes, shape);
        if (shape_obj != undefined) {
            shape_obj.points.push(point);
        }
    }
}
// pop point from shape
function pop_point_s(d, layer, shape) {
    if (!selected_shape_visible(d)) {
        d.message = "selected shape is not visible";
        return;
    }
    let layer_obj = get_layer(d.layers, layer);
    if (layer_obj != undefined) {
        let shape_obj = get_shape(layer_obj.shapes, shape);
        if (shape_obj != undefined) {
            shape_obj.points.pop();
        }
    }
}
function move_point(d, point, new_point) {
    if (!get_visible_points(d).has(point)) {
        d.message = "point is not in a visible layer";
        return;
    }
    for (let p of d.points) {
        if (p[0] == point) {
            p[1] = new_point[0];
            p[2] = new_point[1];
        }
    }
}
function set_fillstyle(d, name, data) {
    let [shape, layer] = list_shapes(d)[name];
    if (d.layer_visibility[layer] == false) {
        d.message = "shape is not in visible layer";
        return;
    }
    shape.fill = data;
}
function set_outline(d, name, data) {
    let [shape, layer] = list_shapes(d)[name];
    if (d.layer_visibility[layer] == false) {
        d.message = "shape is not in visible layer";
        return;
    }
    shape.outline = data;
}
// the new shape is automatically selected and any points are deselected
// also adds a point if there is no selected point
function add_new_shape(d, layer, type, p) {
    if (d.layer_visibility[d.selected_layer] == false) {
        d.message = "add shape when selected layer not visible";
        return;
    }
    let new_point = "";
    let name = "shape " + d.total_shapes;
    while (shape_exists(d, name)) {
        name = "shape " + d.total_shapes;
        d.total_shapes++;
    }
    d.total_shapes++;
    let shape = { "parent_layer": layer, "type": type, "points": [], "name": name };
    if (type == "line" || type == "bezier" || type == "smooth bezier") {
        shape.outline = { "color": "black", "thickness": 1 };
    }
    else {
        shape.fill = "black";
    }
    get_layer(d.layers, layer)?.shapes.push(shape);
    d.selected_shape = name;
    if (d.selected_point == undefined) {
        new_point = add_point(d, p) ?? "";
    }
    else {
        new_point = d.selected_point;
        shape.points.push(new_point);
    }
    d.selected_point = undefined;
    return name;
}
function add_layer(d, layer) {
    if (layer_exists(d, layer)) {
        d.message = "a layer with that name already exists";
        return; // layer alread exists
    }
    d.layers.push({ name: layer, shapes: [] });
    d.layer_visibility[layer] = true;
    d.selected_layer = layer;
}
function select_layer(d, layer) {
    if (get_layer(d.layers, layer) != undefined) {
        d.selected_layer = layer;
        d.selected_shape = undefined;
        d.selected_point = undefined;
    }
}
function select_shape(d, shape) {
    let layer = get_layer(d.layers, d.selected_layer);
    if (layer != undefined && get_shape(layer.shapes, shape)) {
        d.selected_shape = shape;
        d.selected_point = undefined;
    }
}
// from current layer - must be visible
function remove_shape(d, shape) {
    if (d.layer_visibility[d.selected_layer] == false) {
        d.message = "selected layer not visible";
        return;
    }
    let layer = get_layer(d.layers, d.selected_layer);
    if (layer == undefined) {
        d.message = "selected layer doesn't exist";
        return;
    }
    for (let i = 0; i < layer.shapes.length; i++) {
        if (layer.shapes[i].name == shape) {
            layer.shapes.splice(i, 1);
        }
    }
    d.selected_point = undefined;
    d.selected_shape = undefined;
}
function rename_shape(d, shape_orig, shape_new) {
    if (shape_orig == shape_orig) {
        return;
    }
    if (shape_exists(d, shape_orig)) {
        d.message = "shape with that name already exists";
        return;
    }
    let layer = get_layer(d.layers, d.selected_layer);
    if (layer == undefined) {
        d.message = "selected layer doesn't exist";
        return;
    }
    for (let i = 0; i < layer.shapes.length; i++) {
        if (layer.shapes[i].name == shape_orig) {
            layer.shapes[i].name == shape_new;
        }
    }
}
let base_display = {
    "points": [],
    "layers": [{ "name": "base", "shapes": [] }],
    "zoom": [0, 0, 600, 600],
    "layer_visibility": { "base": true },
    show_points: "all",
    show_labels: false,
    selected_layer: "base",
    total_points: 0,
    total_shapes: 0,
    message: ""
};
let display = JSON.parse(JSON.stringify(base_display));
let history = [];
function change() {
    document.getElementById("bigc").getContext("2d")?.clearRect(0, 0, 3333, 3333);
    verify(display);
    history.push(JSON.parse(JSON.stringify(display)));
    if (history.length > 100) {
        history.shift();
    }
    draw_wrap(output_draw(display), document.getElementById("bigc").getContext("2d"));
    document.getElementById("data").value = JSON.stringify(display);
    //side stuff
    document.getElementById("frames").innerHTML = "";
    document.getElementById("frames2").innerHTML = "";
    document.getElementById("frames3").innerHTML = "";
    // layers 
    document.getElementById("frames").innerHTML = "<b>LAYER</b><br />";
    for (let layer of display.layers) {
        document.getElementById("frames").innerHTML += `<div ${layer.name
            == display.selected_layer ? "style=\"background-color:lightblue;\"" : ""}><input type="text" value="${layer.name}" onChange="rename_layer(display, '${layer.name}', arguments[0].target.value);change();" /><button onClick="select_layer('${layer.name}');change();">Select</button><button onClick="display.layer_visibility['${layer.name}'] = !display.layer_visibility['${layer.name}'] ;change();">${display.layer_visibility[layer.name] ? "vis" : "invis"}</button><br /> .<br /></div>`;
    }
    document.getElementById("frames").innerHTML += `<input type="text" id="add_new" /> <button onClick="add_layer(display, document.getElementById('add_new').value);change(); ">Add</button>`;
    //SHAPES IN LAYER
    document.getElementById("frames2").innerHTML += "<b>SHAPES</b>";
    for (let shape of get_layer(display.layers, display.selected_layer)?.shapes ?? []) {
        document.getElementById("frames2").innerHTML += `<div ${shape.name
            == display.selected_shape ? "style=\"background-color:lightblue;\"" : ""}>${shape.name} : ${shape.type} <button onClick="select_shape(display, '${shape.name}') ; change();">Select</button><button onClick="remove_shape(display, '${shape.name}'); change();">Delete</button> </div><br />`;
    }
    //SELECTED SHAPE
    let points_dict = display.points.reduce((prev, curr) => { prev[curr[0]] = [curr[1], curr[2]]; return prev; }, {});
    if (display.selected_shape != undefined) {
        let selected_shape = list_shapes(display)[display.selected_shape][0];
        if (selected_shape != undefined) {
            document.getElementById("frames3").innerHTML = `<div>${selected_shape.name} <br /> ${selected_shape.type} <br /> `;
            document.getElementById("frames3").innerHTML += "<br /><b> OUTLINE</b><br />";
            if (selected_shape.outline != undefined) {
                document.getElementById("frames3").innerHTML += `<textarea id="${selected_shape.name} outline">${JSON.stringify(selected_shape.outline)}</textarea><br /><button onClick="set_outline(display, '${selected_shape.name}', JSON.parse(document.getElementById('${selected_shape.name} outline').value));change();">Set outline</button><br /><button onClick="set_outline(display, '${selected_shape.name}', undefined);change();">Remove outline</button>`;
            }
            else {
                document.getElementById("frames3").innerHTML += `<button onClick="set_outline(display,'${selected_shape.name}', {'thickness':1,'color':'black'});change();">Add outline</button>`;
            }
            document.getElementById("frames3").innerHTML += "<br /><b> FILLSTYLE</b><br />";
            if (selected_shape.fill != undefined) {
                document.getElementById("frames3").innerHTML += `<textarea id="${selected_shape.name} fillstyle">${JSON.stringify(selected_shape.fill)}</textarea><br /><button onClick="set_fillstyle(display, '${selected_shape.name}', JSON.parse(document.getElementById('${selected_shape.name} fillstyle').value));change();">Set fillstyle</button><br /><button onClick="set_fillstyle(display, '${selected_shape.name}', undefined);change();">Remove fillstyle</button>`;
            }
            else {
                document.getElementById("frames3").innerHTML += `<button onClick="set_fillstyle(d,'${selected_shape.name}', 'black');change();">Add fillstyle</button>`;
            }
            document.getElementById("frames3").innerHTML += "<br />";
            for (let [i, point] of selected_shape.points.entries()) {
                document.getElementById("frames3").innerHTML += `${point} (${points_dict[point][0]}, ${points_dict[point][1]}) <button onClick="display.selected_point = '${point}';change();">Select</button> <button onClick="list_shapes(display)['${selected_shape.name}'][0].points.splice(${i});display.selected_point=undefined;change();">Pop</button><br />`;
            }
            document.getElementById("frames3").innerHTML += "</div>";
        }
    }
    document.getElementById("message").innerHTML = display.message;
}
function click(point) {
    // move a point
    if (display.selected_point != undefined) {
        move_point(display, display.selected_point, point);
    }
    // add a point
    if (display.selected_shape != undefined && display.selected_point == undefined) {
        add_point(display, point);
    }
    else {
        display.message = "no shape selected";
    }
    change();
}
//WASD is for scrolling, 123456 is for adding new shapes
//Q : select a point, E : unselect points;
function keypress(point, key) {
    display.message = "";
    if (key == "q") { //select point
        let closest = get_closest_point(display, point, true);
        if (closest != "") {
            display.selected_point = closest;
        }
    }
    if (key == "e") { //unselect point 
        display.selected_point = undefined;
        display.selected_shape = undefined;
    }
    if (key == "r") { // add existing point to shape
        if (!selected_shape_visible(display)) {
            display.message = "no shape selected or selected shape is not visible";
            return; // don't do anything if shape is not visible 
        }
        let closest = display.selected_point ?? get_closest_point(display, point, true);
        if (closest != "") {
            if (display.selected_shape != undefined) {
                let [shape, layer] = list_shapes(display)[display.selected_shape];
                shape.points.push(closest);
            }
        }
    }
    if (key == "f") { // pop point from shape
        if (display.selected_shape != undefined) {
            pop_point_s(display, display.selected_layer, display.selected_shape);
        }
    }
    // add shapes : 
    if (key == "1") {
        add_new_shape(display, display.selected_layer, "line", point);
    }
    if (key == "2") {
        add_new_shape(display, display.selected_layer, "bezier", point);
    }
    if (key == "3") {
        add_new_shape(display, display.selected_layer, "smooth bezier", point);
    }
    if (key == "4") {
        add_new_shape(display, display.selected_layer, "polygon", point);
    }
    if (key == "5") {
        add_new_shape(display, display.selected_layer, "circle", point);
    }
    if (key == "6") {
        add_new_shape(display, display.selected_layer, "bezier shape", point);
    }
    if (key == "7") {
        add_new_shape(display, display.selected_layer, "smooth bezier shape", point);
    }
    change();
}
function button_click(string) {
}
