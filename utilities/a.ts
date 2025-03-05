export type fill_linear  = {
"type":"fill_linear",
"x0" : number,
"y0" : number,
"x1" : number,
"y1" : number,
"colorstops" : [number , string][]
}
export type fill_radial  = {
"type":"fill_radial",
"x0" : number,
"y0" : number,
"x1" : number,
"y1" : number,
"r0" : number,
"r1" : number,
"colorstops" : [number , string][]
}

export type fill_conic  = {
"type":"fill_conic",
"x" : number,
"y" : number,
"theta" : number,
"colorstops" : [number , string][]
}

export type fillstyle = string | fill_linear | fill_radial | fill_conic

export type bezier = [number, number, number, number, number, number];

// start replacing HERE
export type drawImage_command = {
"type" : "drawImage",
"img" : string,
"x" : number,
"y" : number,
}

export type drawLine_command = {
"type" : "drawLine",
"x0" : number,
"y0" : number,
"x1" : number,
"y1" : number,
"color" ?: string,
"width" ?: number,
}

export type drawCircle_command = {
"type" : "drawCircle",
"x" : number,
"y" : number,
"r" : number,
"color" ?: fillstyle,
"width" ?: number,
"fill" ?: boolean,
"transparency" ?: number,
"start" ?: number,
"end" ?: number,
}

export type drawPolygon_command = {
"type" : "drawPolygon",
"points_x" : number[],
"points_y" : number[],
"color" ?: fillstyle,
"width" ?: number,
"fill" ?: boolean,
"transparency" ?: number,
}

export type drawRectangle_command = {
"type" : "drawRectangle",
"tlx" : number,
"tly" : number,
"brx" : number,
"bry" : number,
"color" ?: fillstyle,
"width" ?: number,
"fill" ?: boolean,
"transparency" ?: number,
}

export type drawRectangle2_command = {
"type" : "drawRectangle2",
"tlx" : number,
"tly" : number,
"width" : number,
"height" : number,
"color" ?: fillstyle,
"widthA" ?: number,
"fill" ?: boolean,
"transparency" ?: number,
}

export type drawText_command = {
"type" : "drawText",
"text_" : string,
"x" : number,
"y" : number,
"width" ?: number | undefined,
"color" ?: string,
"size" ?: number,
font ?: string
}

export type drawEllipse_command = {
"type" : "drawEllipse",
"posx" : number,
"posy" : number,
"brx" : number,
"bry" : number,
"color" ?: fillstyle,
"transparency" ?: number,
"rotate" ?: number,
"start" ?: number,
"end" ?: number,
}

export type drawEllipseCR_command = {
"type" : "drawEllipseCR",
"cx" : number,
"cy" : number,
"rx" : number,
"ry" : number,
"color" ?: fillstyle,
"transparency" ?: number,
"rotate" ?: number,
"start" ?: number,
"end" ?: number,
}

export type drawEllipse2_command = {
"type" : "drawEllipse2",
"posx" : number,
"posy" : number,
"width" : number,
"height" : number,
"color" ?: fillstyle,
"transparency" ?: number,
"rotate" ?: number,
"start" ?: number,
"end" ?: number,
}

export type drawBezierCurve_command = {
"type" : "drawBezierCurve",
"x" : number,
"y" : number,
"p1x" : number,
"p1y" : number,
"p2x" : number,
"p2y" : number,
"p3x" : number,
"p3y" : number,
"color" ?: fillstyle,
"width" ?: number,
}

export type drawBezierShape_command = {
"type" : "drawBezierShape",
"x" : number,
"y" : number,
"curves" : bezier[],
"color" ?: fillstyle,
"width" ?: number,
}

export type drawRoundedRectangle_command = {
"type" : "drawRoundedRectangle",
"x0" : number,
"y0" : number,
"x1" : number,
"y1" : number,
"r1" : number,
"r2" : number,
"color" ?: fillstyle,
"width" ?: number,
"fill" ?: boolean,
}

export type draw_command = drawImage_command|drawLine_command|drawCircle_command|drawPolygon_command|drawRectangle_command|drawRectangle2_command|drawText_command|drawEllipse_command|drawEllipseCR_command|drawEllipse2_command|drawBezierCurve_command|drawBezierShape_command|drawRoundedRectangle_command
// put this into get_type.py, enter "DONE" (no quotes).




var imgStrings : any = {};

export function make_style(ctx : CanvasRenderingContext2D, style : fillstyle ) : string | CanvasGradient {
if(typeof(style) == "string"){
return style;
}
if(style.type == "fill_linear"){
var x = ctx.createLinearGradient(style.x0, style.y0, style.x1, style.y1);
}
else if(style.type == "fill_radial"){
var x = ctx.createRadialGradient(style.x0, style.y0, style.r0, style.x1, style.y1, style.r1);
}
else if(style.type == "fill_conic"){
var x = ctx.createConicGradient(style.theta, style.x, style.y);
} else{
throw "1";
}
for(var item of style.colorstops){
x.addColorStop(item[0], item[1]);
}
return x;
}

export function loadImage(img : string){
if(imgStrings[img] == undefined){
return new Promise<void>(function(x,y){
let im = new Image();
im.src = img;
im.onload = function(){
imgStrings[img] = im;
x();
}
})
}
}

export function drawImage(context :CanvasRenderingContext2D | undefined, img : string, x : number, y : number) {
if(imgStrings[img] == undefined){
console.log("load the image first " + img);
var im = new Image();
im.src = img;
im.onload = function(){
if(context){
context.drawImage(im, x, y);
}
imgStrings[img] = im;
}
} else {
var im = imgStrings[img] as HTMLImageElement;
if(context){
context.drawImage(im, x, y);
}
}
}


export function drawLine(context :CanvasRenderingContext2D, x0 : number, y0: number, x1: number, y1: number, color :string = "black", width: number = 1) {
noNaN(arguments as any as any[][]);
//	////console.log(x0, y0, x1, y1)
context.strokeStyle = color
context.lineWidth = width;
context.beginPath();
context.stroke();
context.moveTo(x0, y0);
context.lineTo(x1, y1);
context.stroke();
}

//draws a circle with the given coordinates (as center) and color
export function drawCircle(context :CanvasRenderingContext2D, x : number, y : number, r : number, color : fillstyle =  "black", width : number = 1, fill : boolean = false, transparency : number =1, start:number = 0 , end :number= 2*Math.PI) {
noNaN(arguments as any as any[][]);
//////console.log(x,y,r)

context.lineWidth = width;
context.beginPath();
context.arc(x, y, r, start,end);
if(fill){

context.globalAlpha = transparency;
context.fillStyle = make_style(context, color);
context.fill();
context.globalAlpha = 1;
} else {
context.strokeStyle = make_style(context, color);
context.stroke();
}
}

export function drawPolygon(context :CanvasRenderingContext2D, points_x : number[] , points_y  : number[], color : fillstyle = "black", width : number = 1, fill : boolean = false,transparency : number =1){
noNaN(arguments as any as any[][]);
noNaN(points_x);
noNaN(points_y);
context.lineWidth = width;
context.beginPath();
context.moveTo(points_x[0], points_y[0]);
for(var i=1; i< points_x.length; i++){
context.lineTo(points_x[i], points_y[i]);
}
context.closePath();
if(fill){

context.globalAlpha = transparency;
context.fillStyle = make_style(context, color)
context.fill();
context.globalAlpha = 1;
} else {
context.strokeStyle = make_style(context, color)
context.stroke();
}

}


//draws a rectangle with the given coordinates and color
export function drawRectangle(context :CanvasRenderingContext2D, tlx : number, tly : number, brx : number, bry : number, color : fillstyle =  "black", width : number = 1, fill : boolean = false,  transparency : number =1) {
noNaN(arguments as any as any[][]);
if(fill){
context.globalAlpha = transparency;
context.fillStyle = make_style(context, color)
context.fillRect(tlx, tly, brx - tlx, bry - tly);
context.globalAlpha = 1;
}
else{
context.lineWidth = width;
context.strokeStyle = make_style(context, color)
context.beginPath();
context.rect(tlx, tly, brx - tlx, bry - tly);
context.stroke();
}
}
// uses width and height instead of bottom right coordinates
export function drawRectangle2(context :CanvasRenderingContext2D, tlx : number, tly : number, width : number, height : number, color : fillstyle =  "black", widthA : number = 1, fill : boolean = false,  transparency : number =1){
noNaN(arguments as any as any[][]);
drawRectangle(context, tlx, tly, tlx+width, tly+height, color, widthA, fill,  transparency)

}
// coords are bottom left of text
export function drawText(context :CanvasRenderingContext2D, text_ : string, x : number, y : number, width : number | undefined =undefined, color : string =  "black", size : number= 20, font :string = "Arial") {
noNaN(arguments as any as any[][]);
context.font = size + `px ${font}`;
context.fillStyle = color
if(width == undefined){
context.fillText(text_, x,y);
} else{
context.fillText(text_, x,y,width);
}
}

// see drawRectangle
export function drawEllipse(context :CanvasRenderingContext2D, posx : number, posy : number, brx : number, bry : number ,color : fillstyle="black", transparency : number =1, rotate : number = 0, start :number= 0 , end :number= 2*Math.PI){
noNaN(arguments as any as any[][]);
drawEllipse2( context, posx, posy, brx-posx, bry-posy ,color, transparency, rotate, start, end)
}
//draw ellipse with center and radii
export function drawEllipseCR(context :CanvasRenderingContext2D, cx : number, cy : number, rx : number, ry  : number,color : fillstyle="black", transparency : number =1, rotate : number = 0, start :number= 0 , end :number= 2*Math.PI){
noNaN(arguments as any as any[][]);
drawEllipse2(context, cx-rx, cy-ry, 2*rx, 2*ry ,color, transparency, rotate, start, end)
}

export function drawEllipse2(context :CanvasRenderingContext2D, posx : number, posy : number, width : number, height : number ,color : fillstyle="black", transparency : number =1,rotate : number = 0, start :number= 0 , end :number= 2*Math.PI){
noNaN(arguments as any as any[][]);
context.beginPath();
context.fillStyle=make_style(context, color)
context.globalAlpha = transparency;
context.ellipse(posx+width/2, posy+height/2, width/2, height/2,rotate, start, end);
context.fill();
context.globalAlpha = 1;
}


export function drawBezierCurve(context :CanvasRenderingContext2D, x : number, y : number, p1x : number, p1y : number, p2x : number, p2y : number, p3x : number, p3y : number, color : fillstyle =  "black", width : number = 1){
noNaN(arguments as any as any[][]);
//	////console.log(x0, y0, x1, y1)
context.strokeStyle = make_style(context,color);
context.lineWidth = width;
context.beginPath();
context.moveTo(x, y);
context.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
context.stroke();
}

export function drawBezierShape(context :CanvasRenderingContext2D, x : number, y : number, curves : bezier[], color : fillstyle =  "black", width : number = 1){
noNaN(arguments as any as any[][]);
for(var item of curves){
noNaN(item);
}
// curves are lists of 6 points
context.strokeStyle = make_style(context, color)
context.beginPath();
context.moveTo(x, y);
for (let curve of curves){
let [a,b,c,d,e,f] = curve
context.bezierCurveTo(a,b,c,d,e,f);
}
context.closePath();
context.fillStyle=make_style(context, color)
context.fill();
}

export function drawRoundedRectangle(context :CanvasRenderingContext2D, x0 : number, y0: number, x1: number, y1: number, r1 : number,r2 : number,  color :fillstyle = "black", width: number = 1, fill : boolean = false){
var perp_vector = [y1-y0, x0-x1]
perp_vector = normalize(perp_vector, r1);
var perp_vector2 = [y1-y0, x0-x1]
perp_vector2 = normalize(perp_vector, r2);
context.beginPath();
context.moveTo(x0 + perp_vector[0], y0 + perp_vector[1]);
context.lineTo(x1 + perp_vector[0], y1 + perp_vector2[1]);
var angle = Math.atan2(perp_vector[1], perp_vector[0]);
// add pi/2 and see if it points in the same direction as p1 -> p0
var ccw = Math.cos(angle + Math.PI/2) * (x0-x1) +  Math.sin(angle + Math.PI/2) * (y0-y1) > 0 ;
context.arc(x1, y1, r2, angle, angle + Math.PI, ccw);
context.lineTo(x0 - perp_vector[0], y0- perp_vector[1]);
context.arc(x0, y0, r1,Math.PI+ angle, angle, ccw);
context.closePath();
if(fill){
context.fillStyle= make_style(context, color);
context.fill()
} else {
context.strokeStyle=make_style(context, color),
context.lineWidth = width;
context.stroke();
}
}


// QUICKLY make stuff

export function d_rect(...args : (number | number[])[] ) : drawRectangle_command{
let x = flatten_all(args) as number[] ;
if(x.length != 4){
throw "draw Rectangle without enough arguments"
}
return {"type":"drawRectangle", "tlx" : x[0], "tly" : x[1], "brx" : x[2], "bry" : x[3]}

}

export function d_rect2(...args : (number | number[])[] ) : drawRectangle2_command{
let x = flatten_all(args) as number[] ;
if(x.length != 4){
throw "draw Rectangle 2 without enough arguments"
}
return {"type":"drawRectangle2", "tlx" : x[0], "tly" : x[1], "width" : x[2], "height" : x[3]}
}

export function d_ellipse(...args : (number | number[])[] ) : drawEllipse_command{
let x = flatten_all(args) as number[] ;
if(x.length != 4){
throw "draw ellipse without enough arguments"
}
return {"type":"drawEllipse", "posx" : x[0], "posy" : x[1], "brx" : x[2], "bry" : x[3]}

}

export function d_ellipse2(...args : (number | number[])[] ) : drawEllipseCR_command{
let x = flatten_all(args) as number[] ;
if(x.length != 4){
throw "draw ellipse 2 without enough arguments"
}
return {"type":"drawEllipseCR", "cx" : x[0], "cy" : x[1], "rx" : x[2], "ry" : x[3]}
}



export function d_line(...args : (number | number[])[] ) : drawLine_command{
let x = flatten_all(args) as number[] ;
if(x.length != 4){
throw "draw line without enough arguments"
}
return {"type":"drawLine", "x0" : x[0], "y0" : x[1], "x1" : x[2], "y1" : x[3]}
}


export function d_circle(...args : (number | number[])[] ) : drawCircle_command{
let x = flatten_all(args) as number[] ;
if(x.length != 3){
throw "draw circle without enough arguments"
}
return {"type":"drawCircle", "x" : x[0], "y" : x[1], "r" : x[2]}
}

export function d_image(name : string , ...args : ( number | number[])[] ) : drawImage_command{
let x = flatten_all(args) as number[] ;
if(x.length != 2){
throw "draw image without enough arguments"
}
return {"type":"drawImage", "x" : x[0], "y" : x[1], "img" : name};
}


export function d_text(text : string , ...args : ( number | number[])[] ) : drawText_command{
let x = flatten_all(args) as number[] ;
if(x.length != 2){
throw "draw text without enough arguments"
}
return {"type":"drawText", "x" : x[0], "y" : x[1], "text_" : text};
}


export function d_bezier(points  : point[] | number[], shape : boolean = false) : draw_command[]{
if(typeof(points[0]) == "number"){
if(points.length %2 != 0){
throw "d_bezier with odd number of numbers";
}
let p : point[] = [];
for(let i=0; i<points.length; i+=2){
p.push([points[i] as number, points[i+1] as number]);
}
return d_bezier(p)
}

points = points as point[];
if(points.length % 3 != 1 ){
throw "d_bezier must have length 1 mod 3";
}
let output : draw_command[] = [];
let current_point = points[0];
if(shape == false ){
for(let i=1; i < points.length; i+=3){
output.push({"type":"drawBezierCurve", "x" : current_point[0], "y":current_point[1], "p1x" : points[i][0] , "p1y":points[i][1], "p2x" : points[i+1][0], "p2y" : points[i+1][1], "p3x" : points[i+2][0], "p3y" : points[i+2][1]});
current_point = points[i+2];
}
} else {
let curves : bezier[] = [];
for(let i=1; i < points.length; i+=3){
curves.push([points[i][0], points[i][1], points[i+1][0],points[i+1][1], points[i+2][0], points[i+2][1]]);
}
output.push({"type":"drawBezierShape", x : points[0][0], y : points[0][1], curves : curves});
}
return output;
}


//number of points must be even
export function d_smoothbezier(points  : point[] | number[], shape : boolean = false, closed : boolean = false) : draw_command[]{
if(typeof(points[0]) == "number"){
if(points.length %2 != 0){
throw "d_smoothbezier with odd number of numbers";
}
let p : point[] = [];
for(let i=0; i<points.length; i+=2){
p.push([points[i] as number, points[i+1] as number]);
}
return d_bezier(p)
}

points = points as point[];
if(points.length % 2 != 0 ){
throw  "d_smoothbezier : number of points must be even ";
}
if(points.length <=3 ){
return [];
}
// if 10 points: points = 0, 1, 2, 2.5, 3, 4, 4.5, 5, 6, 6.5, 7, 8, (last point is rounded up) 9
let bezier_points : point[] = []
if(!closed){
bezier_points.push(points[0]);
bezier_points.push(points[1]);
bezier_points.push(points[2]);
let i=3;
while(i <= points.length-2){
bezier_points.push(lincomb(0.5, points[i-1], 0.5, points[i]) as point);
bezier_points.push(points[i]);
bezier_points.push(points[i+1]);
i+=2
}
bezier_points.push(points[i]);
return d_bezier(bezier_points, shape);
} else {
let new_points = JSON.parse(JSON.stringify(points)) as point[];
new_points.push(new_points[0])
new_points.push(new_points[1])
bezier_points.push(lincomb(0.5, new_points[0], 0.5, new_points[1]) as point);
bezier_points.push(points[1]);
bezier_points.push(points[2]);
let i=3;
while(i <= points.length){
bezier_points.push(lincomb(0.5, new_points[i-1], 0.5, new_points[i]) as point);
bezier_points.push(new_points[i]);
bezier_points.push(new_points[i+1]);
i+=2
}
bezier_points.push(lincomb(0.5, new_points[i-1], 0.5, new_points[i]) as point);
return d_bezier(bezier_points, shape);
}
}


export function add_com(x : draw_command, y : Record<string, any>) : draw_command{
combine_obj(x,y); // calls lines.ts
return x;
}



export function draw(lst : draw_command[], c: React.RefObject<HTMLCanvasElement>){
if(c.current == null){
return;
}
//@ts-ignore
draw_wrap(lst, c.current.getContext('2d'));
}
export function clear(c: React.RefObject<HTMLCanvasElement>){
if(c.current == null){
return;
}
//@ts-ignore
c.current.getContext('2d').clearRect(0, 0, c.current?.width, c.current?.height);
}
export function draw_wrap(lst : draw_command[], c: CanvasRenderingContext2D){
for (let item of lst){
switch(item.type){
case "drawImage":
drawImage(c, item.img,item.x,item.y);
break;
case "drawLine":
drawLine(c, item.x0,item.y0,item.x1,item.y1,item.color,item.width);
break;
case "drawCircle":
drawCircle(c, item.x,item.y,item.r,item.color,item.width,item.fill,item.transparency,item.start,item.end);
break;
case "drawPolygon":
drawPolygon(c, item.points_x,item.points_y,item.color,item.width,item.fill,item.transparency);
break;
case "drawRectangle":
drawRectangle(c, item.tlx,item.tly,item.brx,item.bry,item.color,item.width,item.fill,item.transparency);
break;
case "drawRectangle2":
drawRectangle2(c, item.tlx,item.tly,item.width,item.height,item.color,item.widthA,item.fill,item.transparency);
break;
case "drawText":
drawText(c, item.text_,item.x,item.y,item.width,item.color,item.size, item.font);
break;
case "drawEllipse":
drawEllipse(c, item.posx,item.posy,item.brx,item.bry,item.color,item.transparency,item.rotate,item.start,item.end);
break;
case "drawEllipseCR":
drawEllipseCR(c, item.cx,item.cy,item.rx,item.ry,item.color,item.transparency,item.rotate,item.start,item.end);
break;
case "drawEllipse2":
drawEllipse2(c, item.posx,item.posy,item.width,item.height,item.color,item.transparency,item.rotate,item.start,item.end);
break;
case "drawBezierCurve":
drawBezierCurve(c, item.x,item.y,item.p1x,item.p1y,item.p2x,item.p2y,item.p3x,item.p3y,item.color,item.width);
break;
case "drawBezierShape":
drawBezierShape(c, item.x,item.y,item.curves,item.color,item.width);
break;
case "drawRoundedRectangle":
drawRoundedRectangle(c, item.x0,item.y0,item.x1,item.y1,item.r1, item.r2,item.color,item.width,item.fill);
break;

}
}
}


export class img_with_center{
commands : draw_command[];
x : number;
y : number;
img : string;
constructor(commands : draw_command[], x : number, y : number, width : number, height : number ) {
this.commands = commands;
this.x = x;
this.y = y;
this.img = save_image(commands, width, height)
}
output(x : number , y : number) : draw_command{
return {type:"drawImage", x : x-this.x, y:y-this.y, img:this.img};
}
}

export function save_image(commands : draw_command[] , width : number, height : number) : string  {
var c = document.createElement("canvas");
c.setAttribute("width", width.toString());
c.setAttribute("height", height.toString());
var ctx = c.getContext("2d") ;
if(ctx == null){
throw 1;
}
draw_wrap(commands, ctx);
return c.toDataURL('image/png');
}


export function rotate(p : point, origin : point, amt : number) : point {  // clockwise rotation programming convention, ccw math convention
var dx = p[0] - origin[0];
var dy = p[1] - origin[1];
var r = Math.sqrt(dx*dx + dy*dy);
var theta = Math.atan2(dy,dx);
theta += amt;
return [r * Math.cos(theta) + origin[0], r * Math.sin(theta) + origin[1]];
}

export function displace_fillstyle(style : fillstyle, amt : point ) : fillstyle {

var x = JSON.parse(JSON.stringify(style)) as fillstyle;
if(typeof(x) == "string"){
return x;
}

switch(x.type){
case "fill_conic":
x.x += amt[0];
x.y += amt[1];
break;
case "fill_linear":
case "fill_radial":
x.x1 += amt[0];
x.y1 += amt[1];
x.x0 += amt[0];
x.y0 += amt[1];
break;
}
return x;
}
export function rotate_fillstyle(style : fillstyle,origin : point, amt : number) : fillstyle {
var x = JSON.parse(JSON.stringify(style)) as fillstyle;
if(typeof(x) == "string"){
return x;
}

switch(x.type){
case "fill_conic":
[x.x, x.y]  = rotate([x.x, x.y], origin, amt);
style;
x.theta += amt;
break;
case "fill_linear":
case "fill_radial":
[x.x1, x.y1]  = rotate([x.x1, x.y1], origin, amt);
[x.x0, x.y0]  = rotate([x.x0, x.y0], origin, amt);
break;
}
return x;
}
export function scale_fillstyle(style : fillstyle,center : point, x_amt : number, y_amt : number) : fillstyle {
var x = JSON.parse(JSON.stringify(style)) as fillstyle;
if(typeof(x) == "string"){
return x;
}

switch(x.type){
case "fill_conic":
x.x = scale_number(x.x, center[0], x_amt);
x.y = scale_number(x.y, center[1], y_amt);
break;
case "fill_radial":
if(x_amt != y_amt){
throw "scaling fill_radial with non-uniform scaling"
}
x.r0 *= x_amt;
x.r1 *= x_amt;
// fall through
case "fill_linear":
x.x0 = scale_number(x.x0, center[0], x_amt);
x.x1 = scale_number(x.x1, center[0], x_amt);
x.y0 = scale_number(x.y0, center[1], y_amt);
x.y1 = scale_number(x.y1, center[1], y_amt);
break;
}
return x;
}
export function displace_command(command : draw_command, amt : point) : draw_command {
var new_command : draw_command = JSON.parse(JSON.stringify(command)); // copy it
switch(new_command.type){
case "drawCircle":
case "drawPolygon":
case "drawRectangle":
case "drawRectangle2":
case "drawEllipse":
case "drawEllipseCR":
case "drawEllipse2":
case "drawBezierCurve":
case "drawBezierShape":
case "drawRoundedRectangle":
if(new_command.color){
new_command.color = displace_fillstyle(new_command.color, amt);
}
}
switch(command.type){
case "drawBezierCurve":
new_command = new_command as drawBezierCurve_command;
new_command.x+= amt[0]
new_command.p1x+= amt[0]
new_command.p2x+= amt[0]
new_command.p3x+= amt[0]
new_command.y+= amt[1]
new_command.p1y+= amt[1]
new_command.p2y+= amt[1]
new_command.p3y+= amt[1]
break;
case "drawImage":
new_command = new_command as drawImage_command;
new_command.x+= amt[0]
new_command.y+= amt[1]
break;
case "drawBezierShape":
new_command = new_command as drawBezierShape_command;
new_command.x+= amt[0]
new_command.y+= amt[1]
for(var curve of new_command.curves){
for(var i=0;i<6;i++){
curve[i] += amt[i%2];
}
}
break;
case "drawText":
case "drawCircle":
new_command = new_command as drawCircle_command | drawText_command;
new_command.x+= amt[0]
new_command.y+= amt[1]
break;
case "drawEllipse": // all ellipses are converted into CR format
new_command = new_command as drawEllipse_command;
new_command.posx += amt[0];
new_command.posy += amt[1];
new_command.brx += amt[0];
new_command.bry += amt[1];
break;
case "drawEllipse2":
new_command = new_command as drawEllipse2_command;
new_command.posx += amt[0];
new_command.posy += amt[1];
break;
case "drawEllipseCR":
new_command = new_command as drawEllipseCR_command;
new_command.cx += amt[0];
new_command.cy += amt[1];
break;
case "drawRoundedRectangle":
case "drawLine":
new_command = new_command as drawLine_command;
new_command.x0 += amt[0];
new_command.x1 += amt[0];
new_command.y0 += amt[1];
new_command.y1 += amt[1];
break;
case "drawPolygon":
new_command = new_command as drawPolygon_command;
new_command.points_x = new_command.points_x.map((x) => x+amt[0]);
new_command.points_y = new_command.points_y.map((x) => x+amt[1]);
break;
case "drawRectangle":
new_command = new_command as drawRectangle_command;
new_command.brx += amt[0];
new_command.bry += amt[1];
new_command.tlx += amt[0];
new_command.tly += amt[1];
break;
case "drawRectangle2":
new_command = new_command as drawRectangle2_command;
new_command.tlx += amt[0];
new_command.tly += amt[1];
break;

}
return new_command;
}
export function scale_number(number : number, center : number, factor:number ): number{
return (number - center) * factor + center;
}

export function scale_command(command : draw_command, center : point, x_amt : number, y_amt : number) : draw_command {
var new_command : draw_command = JSON.parse(JSON.stringify(command)); // copy it
switch(new_command.type){
case "drawCircle":
case "drawPolygon":
case "drawRectangle":
case "drawRectangle2":
case "drawEllipse":
case "drawEllipseCR":
case "drawEllipse2":
case "drawBezierCurve":
case "drawBezierShape":
case "drawRoundedRectangle":
if(new_command.color){
new_command.color = scale_fillstyle(new_command.color, center, x_amt, y_amt);
}
}
switch(command.type){
case "drawBezierCurve":
new_command = new_command as drawBezierCurve_command;
new_command.x = scale_number(new_command.x, center[0], x_amt)
new_command.p1x= scale_number(new_command.p1x, center[0], x_amt)
new_command.p2x= scale_number(new_command.p2x, center[0], x_amt)
new_command.p3x= scale_number(new_command.p3x, center[0], x_amt)
new_command.y = scale_number(new_command.y, center[1], y_amt)
new_command.p1y= scale_number(new_command.p1y, center[1], y_amt)
new_command.p2y= scale_number(new_command.p2y, center[1], y_amt)
new_command.p3y= scale_number(new_command.p3y, center[1], y_amt)
break;
case "drawBezierShape":
new_command = new_command as drawBezierShape_command;
new_command.x = scale_number(new_command.x, center[0], x_amt)
new_command.y = scale_number(new_command.y, center[1], y_amt)
for(var curve of new_command.curves){
for(var i=0;i<6;i++){
if(i%2 == 0){
curve[i] = scale_number(curve[i], center[0], x_amt)
} else {
curve[i] = scale_number(curve[i], center[1], y_amt)
}
}
}
break;
case "drawText":
new_command = new_command as drawText_command;
new_command.x = scale_number(new_command.x, center[0], x_amt);
new_command.y = scale_number(new_command.y, center[1], y_amt);
break;
case "drawCircle": // converted into drawEllipse
var command_c : draw_command = {type:"drawEllipseCR", cx  : command.x, cy : command.y , rx : command.r, ry : command.r, color : command.color, transparency : command.transparency, start : command.start, end : command.end }
return scale_command(command_c, center, x_amt, y_amt);
break;
case "drawEllipse": // all ellipses are converted into CR format
var rx = (command.brx - command.posx)/2
var ry = (command.bry - command.posy)/2
var centerE :point = [command.posx + rx,command.posy + ry];
return scale_command({type:"drawEllipseCR", cx  : centerE[0], cy : centerE[1] , rx : rx, ry : ry, color : command.color, transparency : command.transparency, rotate : command.rotate, start : command.start, end : command.end }, center, x_amt, y_amt) // check the last 3
break;
case "drawEllipse2":
var rx = command.width /2
var ry = command.height/2
var centerE :point = [command.posx + rx,command.posy + ry];
return scale_command({type:"drawEllipseCR", cx  : centerE[0], cy : centerE[1] , rx : rx, ry : ry, color : command.color, transparency : command.transparency, rotate : command.rotate, start : command.start, end : command.end },  center, x_amt, y_amt)
break;
case "drawEllipseCR":
new_command = new_command as drawEllipseCR_command;
new_command.cx = scale_number(new_command.cx, center[0], x_amt)
new_command.cy = scale_number(new_command.cy, center[1], y_amt)
new_command.rx *= Math.abs(x_amt);
new_command.ry *= Math.abs(y_amt);
break;
case "drawRoundedRectangle":
new_command = new_command as drawRoundedRectangle_command
new_command.r1 *= x_amt;
new_command.r2 *= x_amt;
//fall through
case "drawLine":
new_command = new_command as drawLine_command;
new_command.x0 =scale_number(new_command.x0, center[0], x_amt)
new_command.x1 =scale_number(new_command.x1, center[0], x_amt)
new_command.y0 =scale_number(new_command.y0, center[1], y_amt)
new_command.y1 =scale_number(new_command.y1, center[1], y_amt)
break;
case "drawPolygon":
new_command = new_command as drawPolygon_command;
new_command.points_x = new_command.points_x.map((x) => scale_number(x, center[0], x_amt));
new_command.points_y = new_command.points_y.map((x) => scale_number(x, center[1], y_amt));
break;
case "drawRectangle":
new_command = new_command as drawRectangle_command;
new_command.brx =scale_number(new_command.brx, center[0], x_amt)
new_command.bry =scale_number(new_command.bry, center[1], y_amt)
new_command.tlx =scale_number(new_command.tlx, center[0], x_amt)
new_command.tly = scale_number(new_command.tly, center[1], y_amt);
break;
case "drawRectangle2":
new_command = new_command as drawRectangle2_command;
new_command.tlx =scale_number(new_command.tlx, center[0], x_amt)
new_command.tly = scale_number(new_command.tly, center[1], y_amt);
new_command.width *= x_amt;
new_command.height *= y_amt;
break;
}
return new_command;
}

export function rotate_command(command : draw_command, origin : point, amt : number) : draw_command{
var new_command : draw_command = JSON.parse(JSON.stringify(command)); // copy it
switch(new_command.type){
case "drawCircle":
case "drawPolygon":
case "drawRectangle":
case "drawRectangle2":
case "drawEllipse":
case "drawEllipseCR":
case "drawEllipse2":
case "drawBezierCurve":
case "drawBezierShape":
case "drawRoundedRectangle":
if(new_command.color){
new_command.color = rotate_fillstyle(new_command.color, origin, amt);
}
}
switch(command.type){
case "drawBezierCurve":
new_command = new_command as drawBezierCurve_command;
[new_command.x,new_command.y] = rotate([command.x, command.y], origin, amt);
[new_command.p1x,new_command.p1y] = rotate([command.p1x, command.p1y], origin, amt);
[new_command.p2x,new_command.p2y] = rotate([command.p2x, command.p2y], origin, amt);
[new_command.p3x,new_command.p3y] = rotate([command.p3x, command.p3y], origin, amt);
break;
case "drawBezierShape":
new_command = new_command as drawBezierShape_command;
[new_command.x,new_command.y] = rotate([command.x, command.y], origin, amt);
new_command.curves = [];
for(var curve of command.curves){
var p1:point = [curve[0],curve[1]] ;
var p2:point = [curve[2],curve[3]] ;
var p3:point = [curve[4],curve[5]] ;
var q1:point = rotate(p1, origin, amt);
var q2:point = rotate(p2, origin, amt);
var q3:point = rotate(p3, origin, amt);
new_command.curves.push([q1[0], q1[1], q2[0], q2[1], q3[0], q3[1]]) ;
}
break;
case "drawText":
case "drawCircle":
new_command = new_command as drawCircle_command | drawText_command;
[new_command.x,new_command.y] = rotate([command.x, command.y], origin, amt);
break;
case "drawEllipse": // all ellipses are converted into CR format
var rx = (command.brx - command.posx)/2
var ry = (command.bry - command.posy)/2
var center :point = [command.posx + rx,command.posy + ry];
return rotate_command({type:"drawEllipseCR", cx  : center[0], cy : center[1] , rx : rx, ry : ry, color : command.color, transparency : command.transparency, rotate : command.rotate, start : command.start, end : command.end }, origin, amt) // check the last 3
break;
case "drawEllipse2":
var rx = command.width /2
var ry = command.height/2
var center :point = [command.posx + rx,command.posy + ry];
return rotate_command({type:"drawEllipseCR", cx  : center[0], cy : center[1] , rx : rx, ry : ry, color : command.color, transparency : command.transparency, rotate : command.rotate, start : command.start, end : command.end }, origin, amt)
break;
case "drawEllipseCR":
new_command = new_command as drawEllipseCR_command;
[new_command.cx,new_command.cy] = rotate([command.cx, command.cy], origin, amt);
if(new_command.rotate == undefined){
new_command.rotate = 0;
}
new_command.rotate += amt;
// check this one, and also if we need to change some others
break;
case "drawRoundedRectangle":
case "drawLine":
new_command = new_command as drawLine_command;
[new_command.x0,new_command.y0] = rotate([command.x0, command.y0], origin, amt);
[new_command.x1,new_command.y1] = rotate([command.x1, command.y1], origin, amt);
break;
case "drawPolygon":
new_command = new_command as drawPolygon_command;
new_command.points_x = [];
new_command.points_y = [];
for(var i=0; i<command.points_x.length; i++){
var next_point = rotate([command.points_x[i],command.points_y[i]], origin, amt );
new_command.points_x.push(next_point[0]);
new_command.points_y.push(next_point[1]);
}
break;
case "drawRectangle":
new_command = new_command as drawRectangle_command;
return rotate_command({"type":"drawPolygon","color": command.color, "fill":command.fill, "transparency":command.transparency, points_x : [command.tlx, command.tlx, command.brx, command.brx], points_y : [command.tly, command.bry,command.bry, command.tly]}, origin, amt);
break;
case "drawRectangle2":
new_command = new_command as drawRectangle2_command;
return rotate_command({"type":"drawPolygon","color": command.color, "fill":command.fill, "transparency":command.transparency,  points_x : [command.tlx, command.tlx, command.tlx + command.width, command.tlx + command.width], points_y : [command.tly, command.tlx + command.height,command.tlx + command.height, command.tly]}, origin, amt);
break;
}
return new_command;
}


export type point = [number, number];
export type point3d = [number, number, number];
export type rect = [number, number, number, number];


export function flatten<T>(lst : T[][]) : T[] {
let x  : T[] = [];
for(let item of lst){
for(let item2 of item){
x.push(item2);
}
}
return x;
}
export function flatten_all<T>(lst :  (T | T[])[]) : T[]{
let x : T[] = [];
for(let item of lst){
if(Array.isArray(item)){
x = x.concat(flatten_all(item));
}
else {
x.push(item);
}
}
return x;
}



// consider a grid starting at top_left, where each cell has given width and height, and the specified number of cells per row. Returns the (x, y, index) (NOT row, col) of the clicked cell, or undefined otherwise
export function cell_index(top_left : point, w : number, h : number, amt_per_row : number,  x : number , y : number ) : [number, number, number] | undefined{
if(x < top_left[0] || y < top_left[1]){
return undefined
} // clicked outside
let [p, q] = [Math.floor((x - top_left[0])/w) , Math.floor((y - top_left[1])/h)];
if(p >= amt_per_row){
return undefined;
}
return [p, q, q*amt_per_row + p];
}

// mutates
export function move_lst<T>(a : T[] , b : T[]) : T[]{
for(let i=0; i < a.length; i++){
if(b[i] != undefined){
a[i] = b[i]
}
}
return a;
}


//mutates
export function shift_lst<T>(lst : T[], n : number, way : boolean){ // true : forwards, false :backwards
if(way == false){
if(n != 0){
let tmp = lst[n-1]
let tmp2 = lst[n]
lst[n-1] = tmp2;
lst[n] = tmp;
}
}
else{
if(n != lst.length-1){
let tmp = lst[n]
let tmp2 = lst[n+1]
lst[n+1] = tmp;
lst[n] = tmp2;
}
}
}

// mutates
export function combine_obj(obj : Record<string,any>,obj2 : Record<string,any>){
for(let item of Object.keys(obj2)){
obj[item] = obj2[item];
}
}

// these two are used when the values in the hash table are lists
export function add_obj<K extends string | number | symbol, V>(obj : Record<K,V[]>, k : K, v : V){
if(obj[k] == undefined){
obj[k] = [];
}
obj[k].push(v);
}

export function concat_obj<K extends string | number | symbol, V>(obj : Record<K,V[]>, k : K, v : V[]){
if(obj[k] == undefined){
obj[k] = [];
}
obj[k] = obj[k].concat(v);
}

export function noNaN(lst : any[]) {
for (let f of lst) {
if (typeof (f) == "number" && isNaN(f)) {
throw "noNaN but is NaN";
}
if (Array.isArray(f)) {
noNaN(f);
}
}
}

// 0 = end , 1 = start
export function lerp(start : number[], end : number[], t : number) : number[] {
noNaN(arguments as any as any[][]);
if(start.length != end.length){
throw "lerp with different lengths"
}
let out : number[] = [];
for(let i=0; i<start.length; i++){
out.push(start[i]*t + (1-t)*end[i]);
}
return out;
}


// av + bw
export function scalar_multiple(a : number, v : number[] ) : number[]  {
let x : number[] = [];
for(let i=0; i<v.length; i++){
x[i] = a * v[i];
}
return x;
}

export function matmul(M : number[][], N : number[][] ){
//M[i][j] = row i, column j
// so M.length = number of rows = size of columns
// and M[0].length = number of columns = size of rows
if(M[0].length != N.length){
throw "matrix multiplication with incorrect dimensions"
}
// number of rows = M's number of rows, number of columns is N's number of columns.
// initialize P
let P : number[][] = [];
for(let i=0; i < M.length; i++){
P.push([]);
for(let j=0; j < N[0].length; j++){
P[i].push(0);
}
}
for(let rown = 0; rown < M.length; rown ++){
for(let coln = 0; coln < N[0].length; coln ++){
for(let i=0; i < M[0].length; i++){
P[rown][coln] += M[rown][i] * N[i][coln]
}
}
}
return P;
}
export function Mv(M : number[][], N : number[]){
let P = matmul(M, N.map(x => [x]));
return flatten(P)

}

export function lincomb(a : number, v : number[], b : number, w : number[] ) : number[]  {
if(v.length != w.length){
throw "lincomb with different lengths"
}
let x : number[] = [];
for(let i=0; i<v.length; i++){
x[i] = a * v[i] + b * w[i];
}
return x;
}
export function unit_vector(angle : number) : point{
return [Math.cos(angle), Math.sin(angle)]
}


export function num_diffs<T>(x : T[], y : T[]) : number{
let s= 0;
for(let i=0; i < Math.max(x.length, y.length); i++){
if(x[i] != y[i]){
s++;
}
}
return s;
}

// vector magnitude
export function len(v: number[] ) : number{
noNaN(arguments as any as any[][]);
let l = 0;
for(let item of v){
l += item*item;
}
return  Math.sqrt(l);
}

// start at v, end at w
export function moveTo(v: number[], w : number[], dist_ : number) : number[]{
noNaN(arguments as any as any[][]);
var lst: number[] = [];
if(v.length != w.length){
throw "moveTo with uneven lengths";
}
for(var i=0; i < v.length; i++){
lst.push(w[i] - v[i]);
}
if(len(lst) < dist_){
return JSON.parse(JSON.stringify(w)) as number[];
} else {
lst = normalize(lst, dist_);
for(var i=0; i < v.length; i++){
lst[i] += v[i];
}
return lst
}
}


export function dist(v : number[], w : number[]) : number {
noNaN(arguments as any as any[][]);
if(v.length != w.length){
throw "dist with uneven lengths";
}
let s = 0;
for(let i=0; i < v.length; i++){
s += Math.pow((w[i] - v[i]),2);
}
return Math.sqrt(s);
}
export function taxicab_dist(v  : number[], w : number[]){
if(v.length != w.length){
throw "taxicab_dist with uneven lengths";
}
let s = 0;
for(let i=0; i<v.length; i++){
s+=Math.abs(v[i] - w[i])
}
return s;

}

export function inf_norm(v  : number[], w : number[]){
if(v.length != w.length){
throw "inf_norm with uneven lengths";
}
let s = Number.NEGATIVE_INFINITY;
for(let i=0; i<v.length; i++){
s=max([s, Math.abs(v[i] - w[i])]);
}
return s;

}



export function cross(a : number[], b : number[]){
if(a.length !== 3 || 3 !== b.length){
throw "cross product not 3d";
}
noNaN(arguments as any as any[][]);
return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function dot(a : number[],b : number[]){
if(a.length != b.length){
throw "dot with uneven lengths";
}
noNaN(arguments as any as any[][]);
let s = 0;
for(let i=0; i<a.length; i++){
s += a[i] * b[i];
}
return s;
}

export function angle_between(v1 : number[],  v2 : number[]){
return Math.acos(dot(normalize(v1, 1), normalize(v2, 1)))
}

export function rescale(source_start : number, source_end : number, dest_start : number, dest_end : number, value : number) : number{
let source_length = source_end - source_start
let dest_length = dest_end - dest_start
if(source_length == 0 || dest_length == 0){
throw "rescale with zero length"
}
let ratio = (value - source_start)/ source_length;
return ratio*dest_length + dest_start
}


export function normalize(v : number[], amt : number=1) : number[]{
noNaN(arguments as any as any[][]);

let l =  len(v);
if(l == 0 ){
if(amt != 0){
throw "normalizing a zero vector to nonzero length"
} else {
return JSON.parse(JSON.stringify(v));
}
}
let out : number[] = [];
for(let item of v){
out.push(item /l * amt);
}
return out;
}


// x = left/right, y = up/down, z = forwards/backwards
// lat/long starts at right (1,0,0) and lat goes up (positive y), long goes forwards (positive z)
export function latlong_to_xyz(lat : number, long : number){
noNaN(arguments as any as any[][]);
let r = Math.cos(lat);
let y = Math.sin(lat);
let x = Math.cos(long)*r;
let z = Math.sin(long)*r;
return [x,y,z];
}

// positive z is prime meridian, eastwards (left when facing positive z, with upwards as positive y and right as positive x ) is positive longitude
export function xyz_to_latlong(x:number , y:number, z:number ){
noNaN(arguments as any as any[][]);
let r = Math.sqrt(x*x + y*y + z*z);
let lat = Math.asin(y / r);
let long =  Math.atan2(z, x) - Math.PI/2;
return [lat, long];

}
export function move3d(x :number,y :number,z :number,lat :number,long :number, dist :number) : point3d{
noNaN(arguments as any as any[][]);
let [dx,dy,dz] = latlong_to_xyz(lat, long);
return [x+dx*dist, y+dy*dist, z+dz*dist];
}

export function point_to_color(n : point3d) : string {
return `rgb(${n[0]}, ${n[1]}, ${n[2]})`;
}

export function number_to_hex(n : number) : string {
noNaN(arguments as any as any[][]);
if(n == 0){
return "";
}
return number_to_hex(Math.floor(n/16)) + "0123456789abcdef"[n%16]
}

export function get_keys(s : Set<string>, obj : any){
// mutates s
if(Array.isArray(obj)){
for(let item of obj){
get_keys(s, item);
}
} else if (typeof(obj) == "object" && obj != null){
for(let item of Object.keys(obj)){
s.add(item)
get_keys(s, obj[item]);
}
}
}


export function json_alphabetical(obj : any) : string{
let keys = new Set<string>();
get_keys(keys, obj);
let keys_lst = [...keys]
keys_lst.sort()
return JSON.stringify(obj, keys_lst)

}

export function all_choices<T>(x : T[], amt : number) : T[][]{
if(amt == 0 ){
return [[]];
}
if(amt == x.length){
return [[...x]];
}
else {
let no_take = all_choices(x.slice(1), amt)
let yes_take = all_choices(x.slice(1), amt-1);
yes_take.forEach((y) => y.splice(0, 0, x[0]));
return no_take.concat(yes_take);
}
}
export function all_combos<T>(x : T[][]) : T[][]{
if(arguments.length != 1){
throw "call all_combos with a single list please!";
}


let index : number[] = [];
for(let i=0; i < x.length; i++){
index.push(0);
if(!Array.isArray(x[i])){
throw "call all_combos with array of arrays, not " + x[i].toString();
}
}
let carry : (x : number) => boolean =  function(i : number){
if(index[i] >= x[i].length){
index[i] -= x[i].length;
if(i != 0){
index[i-1]++;
return carry(i-1);
} else {
// stop iteration
return true;
}
}
return false;
}
let out : T[][] = [];
while(true){
let new_element: T[] = [];
for(let i=0; i < x.length; i++){
new_element.push(x[i][index[i]]);
}
out.push(new_element);
index[index.length-1]++;
if(carry(index.length-1) ){
break;
}
}
return out;
}


export function pointInsideRectangleWH(...args : (number | number[])[]){
noNaN(arguments as any);
let lst = flatten_all(args);
if(lst.length != 6){
throw "pointInsideRectangle must have 6 points";
}
let [px, py, tlx, tly, width, height]  = lst;

if(px < tlx || px > tlx+width || py < tly || py > tly+height){
return false;
}
return true;
}

export function pointInsideRectangleBR(...args : (number | number[])[]){
noNaN(arguments as any);
let lst = flatten_all(args);
if(lst.length != 6){
throw "pointInsideRectangleBR must have 6 points";
}
let [px, py, tlx, tly, brx, bry]  = lst;
return pointInsideRectangleWH(px, py, tlx, tly, brx-tlx, bry-tly);
}

export function vector_angle(v1 : point, v2 : point){
v1 = normalize(v1, 1) as point;
v2 = normalize(v2, 1) as point;
return Math.acos(dot(v1, v2));
}

export function moveIntoRectangleWH(...args : (number | number[])[]){
noNaN(arguments as any);
let lst = flatten_all(args);
if(lst.length != 6){
throw "moveIntoRectangleWH must have 6 points";
}
let [px, py, tlx, tly, w, h]  = lst;
if(px < tlx){
px = tlx;
}
if(px > tlx + w){
px = tlx + w;
}
if(py < tly){
py = tly;
}
if(py > tly+ h){
py = tly + h;
}
return [px, py];
}

export function moveIntoRectangleBR(...args : (number | number[])[]){
noNaN(arguments as any);
let lst = flatten_all(args);
if(lst.length != 6){
throw "moveIntoRectangleWH must have 6 points";
}
let [px, py, tlx, tly, brx, bry]  = lst;
return moveIntoRectangleWH(px, py, tlx, tly, brx-tlx, bry-tly);
}



export function max(x : number[]){
noNaN(arguments as any as any[][]);
let m = -Infinity;
for(let i of x){
if(i > m){
m = i;
}
}
return m;
}

// line is given as 3 numbers [a,b,c], representing ax+by=c
export function getIntersection(line1:point3d , line2:point3d) : point{
noNaN(arguments as any as any[][]);
// lines are to be in the form of "ax + by = c", the lines are coefficients.
let a = line1[0] , b = line1[1], c = line2[0], d = line2[1];
let determinant = a*d-b*c;
if (Math.abs(determinant) < 0.000001){
throw "lines are too close to parallel";
}
// get the inverse matrix
let ai = d/determinant, bi = -b/determinant, ci = -c/determinant, di = a/determinant;
// now multiply
return [ai * line1[2] + bi * line2[2], 	ci * line1[2] + di * line2[2]];

}
//given points (p1, p2), output the a,b,c coefficients that go through them
export function pointToCoefficients(...args : (number | number[])[] ) : point3d{
let lst = flatten_all(args);
if(lst.length !=4){
throw "pointToCoefficients must have 6 points";
}
let [p1x, p1y, p2x , p2y] = lst;
noNaN(arguments as any);
if (p1x == p2x){ // vertical line
return [1, 0, p1x]; // x = p1x
}  else {
let m = (p2y - p1y) / (p2x - p1x); // slope
let b = p1y - m*p1x;
// y = mx + b -> y - mx = b
return [-m, 1, b];
}
}

// [x, y] : point , [a,b,c] : line
export function pointClosestToLine(...args : (number | number[])[] ) : point3d{
let lst = flatten_all(args);
if(lst.length !=5){
throw "pointClosestToLine must have 5 points";
}
noNaN(arguments as any);

// want to minimize (x -p1)^2 + (y-p2)^2 subject to ax+by=c, use lagrange multipliers
// L(x, y) = f(x,y) - \lambda g(x,y) - take partials and set them all to zero
// (x - p1)^2 + (y - p2)^2 - \lambda (ax + by - c)
// dx = 2 (x-p1) - a \lambda
// dy = 2 (y-p2) - b \lambda
// d \lambda = ax + by - c
// expand, we get the system of linear equations:
// 2x - 2 p1 - a \lambda
// 2y - 2 p2 - b \lambda
// ax + by - c
// [2, 0, -a] 2p1
// [0, 2, -b] 2p2
// [a, b, 0] c
// do Gaussian elimination :
// [2, 0, -a] 2p1
// [a, b, 0] c
// [0, 2, -b] 2p2
// r1 / 2
// [1, 0, -a/2] p1
// [a, b, 0] c
// [0, 2, -b] 2p2
// r2 = r2 -a* r1
// [1, 0, -a/2] p1
// [0, b, a^2/2] c - a*p1
// [0, 2, -b] 2p2
// r3 = r3 / 2
// [1, 0, -a/2] p1
// [0, b, a^2/2] c - a*p1
// [0, 1, -b/2] p2

// assume b != 0 , if b = 0, we have y = p2, lambda = (c - a *p1)/(a^2/2), and x = p1 - lambda * (-a/2) = c/a
// otherwise:

// r3 = r3 -(1/b)* r2
// [1, 0, -a/2] p1
// [0, b, a^2/2] c - a*p1
// [0, 0, -b/2 - a^2/(2b)] p2 - (c - a*p1)/b


let [p1, p2,a,b,c] = lst;
if(b == 0){
// line is of the form x = c/a
return [c/a, p2, dist([p1, p2], [c/a, p2])];
}
let lambda = (p2 - (c - a*p1)/b)/ (-b/2 - a*a/(2*b));
let y= ((c - a*p1) -  lambda * a*a/2)/b
let x = p1 + a/2 * lambda
return [x,y, dist([p1, p2], [x,y])];
}

export function pointClosestToSegment(...args : (number | number[])[] ) : point3d{
let lst = flatten_all(args);
if(lst.length !=6){
throw "pointClosestToSegment must have 6 points";
}
noNaN(arguments as any);

let [x, y, l1x, l1y, l2x, l2y] = lst;
let closest_point = pointClosestToLine(x,y,pointToCoefficients(l1x, l1y, l2x, l2y));
let between_ = false;
if(l1x == l2x) {
// vertical line, test x value
between_ = between(closest_point[0], l1x, l2x);
} else{
// test y value
between_ = between(closest_point[1], l1y, l2y);
}
if(between_){
return closest_point;
} else {
// check endpoints
let d1 = dist([x,y], [l1x, l1y])
let d2 = dist([x,y], [l2x, l2y])
if(d1 < d2){
return [l1x, l1y, d1];
} else {
return [l2x, l2y, d2];
}
}
}



export function between(x:number ,b1:number , b2:number){ // returns if x is between b1 and b2  (inclusive:number)
noNaN(arguments as any);
if (b1 <= x && x <= b2){
return true;
}
if (b1 >= x && x >= b2){
return true;
}
return false
}
// lines are P = (p1x, p1y, p2x, p2y) and Q = (q1x, q1y, q2x, q2y)
// intersection must be between endpoints
export function doLinesIntersect(...args : (number | number[])[] ){

noNaN(arguments as any);
let lst = flatten_all(args);
if(lst.length !=8){
throw "doLinesIntersect must have 8 points";
}
let [p1x, p1y, p2x, p2y, q1x, q1y, q2x, q2y] = lst;

let line1=pointToCoefficients(p1x, p1y, p2x, p2y);
let line2=pointToCoefficients(q1x, q1y, q2x, q2y);
let intersectionPoint : point = [0,0];
try{
intersectionPoint = getIntersection(line1, line2)
} catch(err){
if(err == "lines are too close to parallel"){
return false;
} else {
throw err;
}
}
return (between(intersectionPoint[0]  , p1x, p2x) &&
between(intersectionPoint[0]  , q1x, q2x) &&
between(intersectionPoint[1]  , p1y, p2y) &&
between(intersectionPoint[1]  , q1y, q2y));
}

// walls are given px, py, qx, qy
// move point towards target, stopping epsilon units right before the first wall
export function move_wall(point : point ,walls :[number,number,number,number][], target : point, amt? : number, epsilon : number = 0.001) : point{
if(amt != undefined){
target = moveTo(point,target,amt) as point;
}
for(let w of walls){
if(doLinesIntersect(point, target, w)){
let intersection = getIntersection(pointToCoefficients(point, target), pointToCoefficients(w));
// target = intersection + (start - intersection) normalized to 0.01
target = lincomb(1, intersection, 1, normalize(lincomb(1, point, -1, intersection), epsilon)) as point;
}
}
return target
}



// doLinesIntersect(412, 666, 620 , 434, 689, 675, 421, 514) = true
// doLinesIntersect(412, 666, 620 , 434, 498 ,480 ,431 ,609 ) = false
// doLinesIntersect(100, 100, 200, 100, 100, 200, 200, 200) = false

// cast a ray , and count number of intersections
export function pointInsidePolygon(x : number, y : number , points : [number, number][]) {
noNaN(arguments as any);
let dx = Math.random() + 1;
let dy = Math.random();
let max_x = max(points.map((x) => x[0])) - x;
let line = [x, y, x + dx * max_x, y + dy * max_x] ;
let counter = 0;
for(let i=0; i < points.length; i++){
let next_point = i == points.length-1 ? points[0] : points[i+1]
if(doLinesIntersect(line, points[i], next_point)){
counter ++;
}
}
return counter % 2 == 1
}

// find where a line segment (given by two points) intersects the rectangle. the first point is inside the rectangle and the second point is outside.



export function getLineEndWH(...args : (number | number[])[] ){
noNaN(arguments as any);
let lst = flatten_all(args);
if(lst.length !=8){
throw "getLineEndWH must have 8 points";
}
let [p1x , p1y , p2x , p2y , tlx , tly , width ,height] = lst;
// ensure p1 is inside and
if(!pointInsideRectangleWH(p1x, p1y, tlx, tly,  width,height)){
throw "p1 outside of rectangle";
}
if(pointInsideRectangleWH(p2x, p2y, tlx, tly, width,height)){
throw "p2 inside rectangle";
}
//convert the line to ax+by=c
// a (p2x - p1x) = -b (p2y - p1y)
let a,b,c
if(p2y - p1y != 0){ // a is not 0, set a = 1 (use this chart)
// if a = 0 then b = 0 as well, we have 0 = c, so c = 0. This gives [0,0,0] which is not a point in P^2
// a (p2x - p1x)/(p2y - p1y) = -b
a = 1;
b = -(p2x - p1x)/(p2y - p1y);
c = a*p1x + b*p1y ;
} else {
//p2y = p1y, so subtracting the equations gives a  = 0/(p2x - p1x) = 0
// now we are in P^1 with b and c. We are solving by=c in P^1.
// so if y = 0 then we have [0,1,0]. Else, we have [0,?,1]
a = 0;
if(p2y == 0){
b = 0;
c = 0;
} else{
c = 1;
b = c/p2y;
}
}
let lineCoefficients : point3d= [a,b,c];
let topLine : point3d= [0, 1, tly];// y = top left y
let leftLine : point3d= [1, 0, tlx] // x = tlx
let rightLine : point3d=[1, 0, tlx+width] // x = tlx+width
let bottomLine : point3d= [0, 1, tly+height];// y = top left y + height
let lines : point3d[]= [topLine, leftLine, rightLine, bottomLine]
for(let i=0; i<4; i++){
let line = lines[i]
try {
let intersection = getIntersection(lineCoefficients, line);
// intersection must be inside the rectangle
if(pointInsideRectangleWH(intersection[0], intersection[1],  tlx, tly,  width,height)){
// and must also be in the correct direction of the second line:
if((intersection[0] - p1x) * (p2x-p1x) + (intersection[1] - p1y) * (p2y-p1y) >= 0){
return intersection;
}
}
}catch (e){
if(e == "lines are too close to parallel"){
;
} else {
throw e;
}
}
}
}

export function getLineEndBR(...args : (number | number[])[] ){
noNaN(arguments as any);
let lst = flatten_all(args);
if(lst.length !=8){
throw "getLineEndBR must have 6 points";
}
let [p1x , p1y , p2x , p2y , tlx , tly , brx ,bry] = lst;
return getLineEndWH(p1x, p1y, p2x, p2y, tlx, tly, brx-tlx, bry-tly) ;
}


export function testCases(){
//getLineEnd(p1x, p1y, p2x, p2y, tlx, tly, height, width){
console.log("This should be 5,5")
console.log(getLineEndWH(0,0,100,100,-10,-5,20,10)); // output should be 5,5, line is [1,-1,0]

console.log("This should be 166.216, 390")
console.log(getLineEndWH(159.1,337.34,207.9,689.46,133,260,150,130)); // output should be 166.216, 390, line is [3.7,-0.5,420]


console.log("This should be 207.407, 260")
console.log(getLineEndWH(242,291.133,80,145.333,133,260,150,130)); // output should be 207.407, 260, line is [2.7,-3,-220]


console.log("This should be 283, 328.033")
console.log(getLineEndWH(242,291.133,445, 473.833,133,260,150,130)); // output should be 283, 328.033, line is [2.7,-3,-220]

console.log("This should be 174, 390 (vertical line)")
console.log(getLineEndWH(174 ,300,174, 600,133,260,150,130)); // output should be 174, 390, line is [1,0,174]


console.log("This should be 133, 290 (horizontal line)")
console.log(getLineEndWH(211 ,290,1, 290,133,260,150,130)); // output should be 133, 290, line is [0,1,290]

console.log("all done")
}



// returns the list of vertices visited, in order
// neighbors is given as an oracle function
// note that neighbors is  NOT required to be symmetric (that is: the graph can be directed);
export function bfs<T>(neighbors: (vertex: T) => T[], u: T, halting_condition ?: (vertex : T) => boolean ): T[] {
let visited: Set<T> = new Set();
let queue: T[] = [u];
let result: T[] = [];

while (queue.length > 0) {
let vertex = queue.shift();
if(vertex == undefined){ // empty list
break;
}
// visit the vertex
if (!visited.has(vertex)) {
visited.add(vertex);
result.push(vertex);
if(halting_condition != undefined){
if(halting_condition(vertex)){
break;
}
}
// add neighbors to the end of the list
for (let neighbor of neighbors(vertex)) {
if (!visited.has(neighbor)) {
queue.push(neighbor);
}
}
}
}
return result;
}

// given the coordinates of the top left (x and y smallest) corner of a rectangle, and its width and height, find the coordinates of the others.
// angle is  : look at rectangle's right, how much do you have to turn to look straight right?

// the same as the other one : (positive x) is 0, and for angles close to 0, increasing is positive y.

//note this is different from the angle that angleToRadians returns. To convert from angleToRadians to our angle, add pi/2

// returns the corners in a cyclic order.
export function corners(tlx:number , tly:number , width:number , height:number , angle:number) {
//console.log([tlx, tly, width, height, angle]);
let cornersLst = [[tlx, tly]]
// travel "rightward" (width) units along (angle)
cornersLst.push([cornersLst [0][0]+ width * Math.cos(angle), cornersLst[0][1] + width * Math.sin(angle)])

//travel "upwards" (height) units along angle- 90 degrees
cornersLst.push([cornersLst[1][0] + height * Math.cos(angle + Math.PI / 2), cornersLst[1][1]+ height * Math.sin(angle + Math.PI / 2)])

//travel "upwards" from the start
cornersLst.push([cornersLst[0][0] + height * Math.cos(angle + Math.PI / 2), cornersLst[0][1] + height * Math.sin(angle +Math.PI / 2)])


return cornersLst
}

