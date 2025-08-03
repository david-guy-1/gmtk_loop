import { initial } from "lodash";


type point = [number, number];
type point3d = [number, number, number];
type rect = [number, number, number, number];


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

// finds b in a, then inserts c after it.
function insert_after<T>(a : T[], b : T, c : T) : T[]{
	for(let i=0;  i< a.length ; i++){
		if(a[i] == b){
			a.splice(i+1, 0, c); 
			break;
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
	return lst;
}

// mutates first arg
export function combine_obj(obj : Record<string,any>,obj2 : Record<string,any>){
	for(let item of Object.keys(obj2)){
		obj[item] = obj2[item];
	}
	return obj
}

// these two are used when the values in the hash table are lists
export function add_obj<K extends string | number | symbol, V>(obj : Record<K,V[]>, k : K, v : V){
	if(obj[k] == undefined){
		obj[k] = [];
	}
	obj[k].push(v); 
	return obj;
}

export function concat_obj<K extends string | number | symbol, V>(obj : Record<K,V[]>, k : K, v : V[]){
	if(obj[k] == undefined){
		obj[k] = [];
	}
	obj[k] = obj[k].concat(v); 
	return obj;
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

function get_keys(s : Set<string>, obj : any){
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
			if(dist(point, target) < epsilon){
				break;
			}	
            if(doLinesIntersect(point, target, w)){
                let intersection = getIntersection(pointToCoefficients(point, target), pointToCoefficients(w));
                // target = intersection + (start - intersection) normalized to 0.01
                target = lincomb(1, intersection, 1, normalize(lincomb(1, point, -1, intersection), epsilon)) as point; 
            }
        }
        return target
}
	
export function move_wallWH(point : point ,walls :[number,number,number,number][], target : point, amt? : number, epsilon : number = 0.001) : point{
	if(amt != undefined){
		target = moveTo(point,target,amt) as point;
	}
	
	for(let w of walls){
		if(dist(point, target) < epsilon){
			break;
		}
		if(doLinesIntersect(point, target, [w[0], w[1], w[0]+w[2], w[1]+w[3]])){
			let intersection = getIntersection(pointToCoefficients(point, target), pointToCoefficients([w[0], w[1], w[0]+w[2], w[1]+w[3]]));
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
	

type ordered_field<T> = {
	"add" : (a : T, b : T) => T
	"mul" : (a : T, b : T) => T
	"zero" : () => T
	"one" : () => T
	"ai" : (a : T )=> T
	"mi" : (a : T) => T
	"lt" : (a : T, b : T )=> boolean
	"leq" : (a : T, b : T) => boolean
	"eq" : (a : T, b : T) => boolean 
}

// max cx : Ax <= b, x >= 0
//WARNING: mutates all inputs (except obs)

let default_op : ordered_field<number> = {
	"add" : (x,y) => x+y,
	"mul" : (x,y) => x*y,
	"zero" : () => 0,
	"one" : () => 1,
	"ai" : (x) => -x,
	"mi" : (x) => 1/x,
	"lt" : (x,y) => x<y,
	"leq" : (x,y) => x <= y,  
	"eq" : (x, y) => x == y
}
/*
let fractions_op  = {
	"add" : (x,y) => x.add(y),
	"mul" : (x, y) => x.mul(y),
	"zero": () => new Fraction(0, 1),
	"one": () => new Fraction(1, 1),
	"ai" : (x) => x.neg(),
	"mi" : (x) => x.inverse(),
	"lt" : (x,y) => x.lt(y),
	"leq"  : (x,y) => x.lte(y),
	"eq" : (x , y) => x.equals(y)
}

function convert(arg ){
	for(let i=0 ; i< arg.length; i++){
		if(Array.isArray(arg[i])){
			convert(arg[i])
		} else {
			arg[i] = new Fraction(arg[i]);
		}
	}
	return arg
}

function unconvert(arg ){
	if(!Array.isArray(arg)){
		return arg;
	}
	for(let i=0 ; i< arg.length; i++){
		if(Array.isArray(arg[i])){
			unconvert(arg[i])
		} else {
			try { 
				arg[i] = arg[i].toFraction()
			} catch(e){

			}
		}
	}
	return arg
}
*/

function simplex_pivot_op<T> (ops : ordered_field<T>, entering_index : number, leaving_index : number, zero_vars : string[] ,nonzero_vars : string[], eqns : T[][]){
	let {add, mul, zero, one, ai, mi, lt, leq} = ops; 
	// now we need to change eqns (objective function doesn't change) 
	// recall eqns : nonzero var = coefficients * zero vars + constant 
	let entering_variable = zero_vars[entering_index];
	let leaving_variable = nonzero_vars[leaving_index];
	let leaving_row = eqns[leaving_index]; 
	let coef = leaving_row.splice(entering_index, 1)[0];
	leaving_row.splice(leaving_row.length-1, 0, ai(one()))
	for(let i=0; i < leaving_row.length; i++){
		leaving_row[i] = mul(leaving_row[i] , mi(ai(coef))); 
	}
	// now we have an equation for entering_variable in terms of other variables 
	// adjust the other rows
	for(let i=0; i < eqns.length; i++){
		if(i == leaving_index){
			continue; 
		}
		let row = eqns[i];
		let coef = row.splice(entering_index, 1)[0];
		row.splice(row.length-1, 0, zero());
		for(let j=0; j < row.length; j++){
			row[j] = add(row[j], mul(coef, leaving_row[j])); 
		}
	}
	zero_vars.splice(entering_index, 1);
	zero_vars.push(leaving_variable);
	nonzero_vars.splice(leaving_index, 1);
	nonzero_vars.push(entering_variable);

}

function simplex_it<T>(ops : ordered_field<T>, names : string[] , zero_vars : string[], nonzero_vars : string[], eqns : T[][], obj : (T | "large")[] , desired_enter : string | undefined = undefined ) : ["optimal", [T,T], T[]] | "unbounded" | "unbounded large" | "continue" {
// does one iteration of the simplex algorithm , mutates inputs 

// every nonzero var is a constant + something involving only zero vars 
// zero vars union nonzero vars = names , 	
// matrix coefficients : every row is a nonzero var, as in the order in the nonzero_vars list, every number is a coefficient , as in the zero_vars list. the last entry is the constant.

// assume all coefficients are >= 0 


// obj uses the names list

// do error checking 
let {add, mul, zero, one, ai, mi, lt, leq, eq} = ops; 

// choose entering variable - a zero var to make nonzero

	let entering_variable : string | undefined = undefined;
	let best_choice = [zero(), zero()];
	for(let [i, candidate] of zero_vars.entries()){
		// compute how much the objective will increase if we increase this zero variable 
		let direct_amt = obj[names.indexOf(candidate)];
		let coef : [T,T] = [zero(), zero()];
		if(direct_amt == "large"){ // "large" = a large NEGATIVE number 
			coef = [zero(), ai(one())] // but coefficients represent it as a POSITIVE number
		} else {
			coef = [ direct_amt, zero()];
		}

		for(let [j, row] of eqns.entries()){
			// increasing the candidate will also change nonzero var[j] by row[i]
			let term = obj[names.indexOf(nonzero_vars[j])]
			if(term != "large"){
				coef[0] = add(coef[0], mul(row[i] ,term ))
			} else {
				coef[1] = add(coef[1], mul(row[i] ,ai(one()) ))
			}

		}
		
		if(lt(zero(), coef[1]) || ( eq(zero(), coef[1]) && lt(zero(), coef[0])) ){ // coefficient > 0 
			if(entering_variable == undefined || lt(best_choice[1], coef[1]) || (eq(best_choice[1], coef[1]) && lt(best_choice[0], coef[0])) ){
				entering_variable = candidate
				best_choice = coef;
			}
		}
		if(candidate == desired_enter){
			if(lt(coef[1], zero()) || (eq(coef[1], zero()) && lt(coef[0], zero()))){
				throw "desired entering variable cannot be an entering variable"
			}
			else {
				entering_variable = candidate
				best_choice = coef;
			}
		}
	}
	
	if(entering_variable == undefined){
		let opt_result : T[] = [];
		for(let item of names){
			if(nonzero_vars.indexOf(item) == -1){
				opt_result.push(zero())
			} else {
				let row = eqns[nonzero_vars.indexOf(item)]
				opt_result.push(row[row.length-1])
			}
		}
		let sum = zero()
		let largesum = zero()
		for(let i=0; i < names.length; i++){
			let obj_coef = obj[i]
			if(obj_coef != "large"){
				sum = add(sum, mul(opt_result[i], obj_coef));
			} else {
				largesum = add(largesum, mul(opt_result[i], ai(one())));
			}
		}
		return ["optimal", [sum, largesum], opt_result];
	}

	let entering_index = zero_vars.indexOf(entering_variable); 
	let smallest : T | undefined = undefined;
	let leaving_variable : string | undefined = undefined
	// choose the leaving variable (nonzero to make zero)
	for(let i=0; i < eqns.length; i++){
		
		let row = eqns[i];
		if(leq( zero(), row[entering_index])){
			
			continue ; // this row will not be a problem 
		}
		let limit = mul(ai(row[row.length-1] ), mi(row[entering_index]));
		
		if(smallest == undefined || leq(limit, smallest)){
			leaving_variable = nonzero_vars[i];
			smallest = limit; 
		} 
	}
	if(smallest == undefined || leaving_variable == undefined){
		// check the current position for large values
		let large = zero();
		for(let [i, item] of names.entries()){
			if(zero_vars.indexOf(item) != -1){
				continue;
			}
			if(obj[i] != "large"){
				continue;
			}
			large = add(large, eqns[nonzero_vars.indexOf(item)][eqns[0].length-1]);
		}
		if(!eq(large, zero())){
			return "unbounded large";
		}
		return "unbounded";
	}
	let leaving_index = nonzero_vars.indexOf(leaving_variable); 
	simplex_pivot_op(ops, entering_index, leaving_index,zero_vars, nonzero_vars, eqns);
	
	let moved_row = eqns.splice(leaving_index, 1);
	eqns.push(moved_row[0]);
	return "continue"; 
}


export function simplex<T>(ops : ordered_field<T>, A : T[][], b : T[], ca : T[]) : [T, T[]] | "unbounded" | "infeasible"{
	let num_vars = A[0].length;
	let num_cons = A.length; 
	if(ca.length != num_vars ){
		throw "c.length must equal number of variables";
	}
	if(b.length != num_cons){
		throw "b.length must equal number of constraints";
	}

	let {add, mul, zero, one, ai, mi, lt, leq, eq} = ops; 
	// clone A, b, c
	A = [...A]
	for(let i=0; i < A.length; i++){
		A[i] = [...A[i]]
	}
	b = [...b]
	ca = [...ca]
	let c = ca as (T | "large")[]
	let names : string[] = []
	for(let i=0; i < num_vars; i++){
		names.push("x" + i);
	}	

	//  add slack variables	
	for(let i=0; i < num_cons; i++){
		names.push("slack" + i);
		c.push(zero())
		for(let row=0; row < num_cons; row++){
			if(row == i){
				A[row].push(one());
			} else { 
				A[row].push(zero())
			}
		}
	}
	// negate every row with a negative b
	for(let i=0; i < num_cons ; i++){
		if(lt(b[i], zero())){
			let row = A[i] 
			b[i] = ai(b[i]); 
			for(let j=0; j < row.length; j++){
				row[j] = ai(row[j]);
			}
		}
	}
	// add "initial slack" variables and start the simplex algorithm
	for(let i=0; i < num_cons; i++){
		names.push("initial slack" + i);
		c.push('large')
		for(let row=0; row < num_cons; row++){
			if(row == i){
				A[row].push(one());
			} else { 
				A[row].push(zero())
			}
		}
	}
	// the zero vars are the "old" variables and the nonzero vars are the "new" variables
	let zero_vars : string[] = []
	let nonzero_vars : string[]= []
	for(let var_ of names){
		if(var_.indexOf("initial slack") != -1){
			nonzero_vars.push(var_);
		} else {
			zero_vars.push(var_);
		}
	}
	let eqns : T[][]= []
	for(let i=0; i < nonzero_vars.length; i++){
		eqns.push([])
		for(let j=0; j < zero_vars.length; j++){
			eqns[eqns.length-1].push(ai(A[i][j]))
		}
		eqns[eqns.length-1].push(b[i]); 
	}

	while(true){
		let result = simplex_it(ops, names, zero_vars, nonzero_vars, eqns, c);
		if(result == "unbounded"){
			return "unbounded";
		}
		if(result == "unbounded large"){
			return "infeasible";
		}
		if(result != "continue"){
			// all initial variables should be zero vars 
			result
			let opt_value = result[1]
			let opt_point = result[2]
			if(!eq(opt_value[1],zero())){
				return "infeasible";
			}
			return [opt_value[0] , opt_point.slice(0, num_vars)];
		}
	}
}