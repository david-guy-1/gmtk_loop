define("lines", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flatten = flatten;
    exports.flatten_all = flatten_all;
    exports.cell_index = cell_index;
    exports.move_lst = move_lst;
    exports.combine_obj = combine_obj;
    exports.add_obj = add_obj;
    exports.concat_obj = concat_obj;
    exports.noNaN = noNaN;
    exports.lerp = lerp;
    exports.scalar_multiple = scalar_multiple;
    exports.lincomb = lincomb;
    exports.unit_vector = unit_vector;
    exports.num_diffs = num_diffs;
    exports.len = len;
    exports.moveTo = moveTo;
    exports.dist = dist;
    exports.taxicab_dist = taxicab_dist;
    exports.inf_norm = inf_norm;
    exports.cross = cross;
    exports.dot = dot;
    exports.angle_between = angle_between;
    exports.rescale = rescale;
    exports.normalize = normalize;
    exports.latlong_to_xyz = latlong_to_xyz;
    exports.xyz_to_latlong = xyz_to_latlong;
    exports.move3d = move3d;
    exports.point_to_color = point_to_color;
    exports.number_to_hex = number_to_hex;
    exports.json_alphabetical = json_alphabetical;
    exports.all_choices = all_choices;
    exports.all_combos = all_combos;
    exports.pointInsideRectangleWH = pointInsideRectangleWH;
    exports.pointInsideRectangleBR = pointInsideRectangleBR;
    exports.vector_angle = vector_angle;
    exports.moveIntoRectangleWH = moveIntoRectangleWH;
    exports.moveIntoRectangleBR = moveIntoRectangleBR;
    exports.max = max;
    exports.getIntersection = getIntersection;
    exports.pointToCoefficients = pointToCoefficients;
    exports.pointClosestToLine = pointClosestToLine;
    exports.pointClosestToSegment = pointClosestToSegment;
    exports.between = between;
    exports.doLinesIntersect = doLinesIntersect;
    exports.move_wall = move_wall;
    exports.pointInsidePolygon = pointInsidePolygon;
    exports.getLineEndWH = getLineEndWH;
    exports.getLineEndBR = getLineEndBR;
    exports.testCases = testCases;
    exports.bfs = bfs;
    exports.corners = corners;
    function flatten(lst) {
        let x = [];
        for (let item of lst) {
            for (let item2 of item) {
                x.push(item2);
            }
        }
        return x;
    }
    function flatten_all(lst) {
        let x = [];
        for (let item of lst) {
            if (Array.isArray(item)) {
                x = x.concat(flatten_all(item));
            }
            else {
                x.push(item);
            }
        }
        return x;
    }
    // consider a grid starting at top_left, where each cell has given width and height, and the specified number of cells per row. Returns the (x, y, index) (NOT row, col) of the clicked cell, or undefined otherwise 
    function cell_index(top_left, w, h, amt_per_row, x, y) {
        if (x < top_left[0] || y < top_left[1]) {
            return undefined;
        } // clicked outside
        let [p, q] = [Math.floor((x - top_left[0]) / w), Math.floor((y - top_left[1]) / h)];
        if (p >= amt_per_row) {
            return undefined;
        }
        return [p, q, q * amt_per_row + p];
    }
    // mutates
    function move_lst(a, b) {
        for (let i = 0; i < a.length; i++) {
            if (b[i] != undefined) {
                a[i] = b[i];
            }
        }
        return a;
    }
    // mutates
    function combine_obj(obj, obj2) {
        for (let item of Object.keys(obj2)) {
            obj[item] = obj2[item];
        }
    }
    // these two are used when the values in the hash table are lists
    function add_obj(obj, k, v) {
        if (obj[k] == undefined) {
            obj[k] = [];
        }
        obj[k].push(v);
    }
    function concat_obj(obj, k, v) {
        if (obj[k] == undefined) {
            obj[k] = [];
        }
        obj[k] = obj[k].concat(v);
    }
    function noNaN(lst) {
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
    function lerp(start, end, t) {
        noNaN(arguments);
        if (start.length != end.length) {
            throw "lerp with different lengths";
        }
        let out = [];
        for (let i = 0; i < start.length; i++) {
            out.push(start[i] * t + (1 - t) * end[i]);
        }
        return out;
    }
    // av + bw
    function scalar_multiple(a, v) {
        let x = [];
        for (let i = 0; i < v.length; i++) {
            x[i] = a * v[i];
        }
        return x;
    }
    function lincomb(a, v, b, w) {
        if (v.length != w.length) {
            throw "lincomb with different lengths";
        }
        let x = [];
        for (let i = 0; i < v.length; i++) {
            x[i] = a * v[i] + b * w[i];
        }
        return x;
    }
    function unit_vector(angle) {
        return [Math.cos(angle), Math.sin(angle)];
    }
    function num_diffs(x, y) {
        let s = 0;
        for (let i = 0; i < Math.max(x.length, y.length); i++) {
            if (x[i] != y[i]) {
                s++;
            }
        }
        return s;
    }
    // vector magnitude
    function len(v) {
        noNaN(arguments);
        let l = 0;
        for (let item of v) {
            l += item * item;
        }
        return Math.sqrt(l);
    }
    // start at v, end at w
    function moveTo(v, w, dist_) {
        noNaN(arguments);
        var lst = [];
        if (v.length != w.length) {
            throw "moveTo with uneven lengths";
        }
        for (var i = 0; i < v.length; i++) {
            lst.push(w[i] - v[i]);
        }
        if (len(lst) < dist_) {
            return JSON.parse(JSON.stringify(w));
        }
        else {
            lst = normalize(lst, dist_);
            for (var i = 0; i < v.length; i++) {
                lst[i] += v[i];
            }
            return lst;
        }
    }
    function dist(v, w) {
        noNaN(arguments);
        if (v.length != w.length) {
            throw "dist with uneven lengths";
        }
        let s = 0;
        for (let i = 0; i < v.length; i++) {
            s += Math.pow((w[i] - v[i]), 2);
        }
        return Math.sqrt(s);
    }
    function taxicab_dist(v, w) {
        if (v.length != w.length) {
            throw "taxicab_dist with uneven lengths";
        }
        let s = 0;
        for (let i = 0; i < v.length; i++) {
            s += Math.abs(v[i] - w[i]);
        }
        return s;
    }
    function inf_norm(v, w) {
        if (v.length != w.length) {
            throw "inf_norm with uneven lengths";
        }
        let s = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < v.length; i++) {
            s = max([s, Math.abs(v[i] - w[i])]);
        }
        return s;
    }
    function cross(a, b) {
        if (a.length !== 3 || 3 !== b.length) {
            throw "cross product not 3d";
        }
        noNaN(arguments);
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }
    function dot(a, b) {
        if (a.length != b.length) {
            throw "dot with uneven lengths";
        }
        noNaN(arguments);
        let s = 0;
        for (let i = 0; i < a.length; i++) {
            s += a[i] * b[i];
        }
        return s;
    }
    function angle_between(v1, v2) {
        return Math.acos(dot(normalize(v1, 1), normalize(v2, 1)));
    }
    function rescale(source_start, source_end, dest_start, dest_end, value) {
        let source_length = source_end - source_start;
        let dest_length = dest_end - dest_start;
        if (source_length == 0 || dest_length == 0) {
            throw "rescale with zero length";
        }
        let ratio = (value - source_start) / source_length;
        return ratio * dest_length + dest_start;
    }
    function normalize(v, amt = 1) {
        noNaN(arguments);
        let l = len(v);
        if (l == 0) {
            if (amt != 0) {
                throw "normalizing a zero vector to nonzero length";
            }
            else {
                return JSON.parse(JSON.stringify(v));
            }
        }
        let out = [];
        for (let item of v) {
            out.push(item / l * amt);
        }
        return out;
    }
    // x = left/right, y = up/down, z = forwards/backwards
    // lat/long starts at right (1,0,0) and lat goes up (positive y), long goes forwards (positive z) 
    function latlong_to_xyz(lat, long) {
        noNaN(arguments);
        let r = Math.cos(lat);
        let y = Math.sin(lat);
        let x = Math.cos(long) * r;
        let z = Math.sin(long) * r;
        return [x, y, z];
    }
    // positive z is prime meridian, eastwards (left when facing positive z, with upwards as positive y and right as positive x ) is positive longitude 
    function xyz_to_latlong(x, y, z) {
        noNaN(arguments);
        let r = Math.sqrt(x * x + y * y + z * z);
        let lat = Math.asin(y / r);
        let long = Math.atan2(z, x) - Math.PI / 2;
        return [lat, long];
    }
    function move3d(x, y, z, lat, long, dist) {
        noNaN(arguments);
        let [dx, dy, dz] = latlong_to_xyz(lat, long);
        return [x + dx * dist, y + dy * dist, z + dz * dist];
    }
    function point_to_color(n) {
        return `rgb(${n[0]}, ${n[1]}, ${n[2]})`;
    }
    function number_to_hex(n) {
        noNaN(arguments);
        if (n == 0) {
            return "";
        }
        return number_to_hex(Math.floor(n / 16)) + "0123456789abcdef"[n % 16];
    }
    function get_keys(s, obj) {
        // mutates s
        if (Array.isArray(obj)) {
            for (let item of obj) {
                get_keys(s, item);
            }
        }
        else if (typeof (obj) == "object" && obj != null) {
            for (let item of Object.keys(obj)) {
                s.add(item);
                get_keys(s, obj[item]);
            }
        }
    }
    function json_alphabetical(obj) {
        let keys = new Set();
        get_keys(keys, obj);
        let keys_lst = [...keys];
        keys_lst.sort();
        return JSON.stringify(obj, keys_lst);
    }
    function all_choices(x, amt) {
        if (amt == 0) {
            return [[]];
        }
        if (amt == x.length) {
            return [[...x]];
        }
        else {
            let no_take = all_choices(x.slice(1), amt);
            let yes_take = all_choices(x.slice(1), amt - 1);
            yes_take.forEach((y) => y.splice(0, 0, x[0]));
            return no_take.concat(yes_take);
        }
    }
    function all_combos(x) {
        if (arguments.length != 1) {
            throw "call all_combos with a single list please!";
        }
        let index = [];
        for (let i = 0; i < x.length; i++) {
            index.push(0);
            if (!Array.isArray(x[i])) {
                throw "call all_combos with array of arrays, not " + x[i].toString();
            }
        }
        let carry = function (i) {
            if (index[i] >= x[i].length) {
                index[i] -= x[i].length;
                if (i != 0) {
                    index[i - 1]++;
                    return carry(i - 1);
                }
                else {
                    // stop iteration
                    return true;
                }
            }
            return false;
        };
        let out = [];
        while (true) {
            let new_element = [];
            for (let i = 0; i < x.length; i++) {
                new_element.push(x[i][index[i]]);
            }
            out.push(new_element);
            index[index.length - 1]++;
            if (carry(index.length - 1)) {
                break;
            }
        }
        return out;
    }
    function pointInsideRectangleWH(...args) {
        noNaN(arguments);
        let lst = flatten_all(args);
        if (lst.length != 6) {
            throw "pointInsideRectangle must have 6 points";
        }
        let [px, py, tlx, tly, width, height] = lst;
        if (px < tlx || px > tlx + width || py < tly || py > tly + height) {
            return false;
        }
        return true;
    }
    function pointInsideRectangleBR(...args) {
        noNaN(arguments);
        let lst = flatten_all(args);
        if (lst.length != 6) {
            throw "pointInsideRectangleBR must have 6 points";
        }
        let [px, py, tlx, tly, brx, bry] = lst;
        return pointInsideRectangleWH(px, py, tlx, tly, brx - tlx, bry - tly);
    }
    function vector_angle(v1, v2) {
        v1 = normalize(v1, 1);
        v2 = normalize(v2, 1);
        return Math.acos(dot(v1, v2));
    }
    function moveIntoRectangleWH(...args) {
        noNaN(arguments);
        let lst = flatten_all(args);
        if (lst.length != 6) {
            throw "moveIntoRectangleWH must have 6 points";
        }
        let [px, py, tlx, tly, w, h] = lst;
        if (px < tlx) {
            px = tlx;
        }
        if (px > tlx + w) {
            px = tlx + w;
        }
        if (py < tly) {
            py = tly;
        }
        if (py > tly + h) {
            py = tly + h;
        }
        return [px, py];
    }
    function moveIntoRectangleBR(...args) {
        noNaN(arguments);
        let lst = flatten_all(args);
        if (lst.length != 6) {
            throw "moveIntoRectangleWH must have 6 points";
        }
        let [px, py, tlx, tly, brx, bry] = lst;
        return moveIntoRectangleWH(px, py, tlx, tly, brx - tlx, bry - tly);
    }
    function max(x) {
        noNaN(arguments);
        let m = -Infinity;
        for (let i of x) {
            if (i > m) {
                m = i;
            }
        }
        return m;
    }
    // line is given as 3 numbers [a,b,c], representing ax+by=c
    function getIntersection(line1, line2) {
        noNaN(arguments);
        // lines are to be in the form of "ax + by = c", the lines are coefficients.
        let a = line1[0], b = line1[1], c = line2[0], d = line2[1];
        let determinant = a * d - b * c;
        if (Math.abs(determinant) < 0.000001) {
            throw "lines are too close to parallel";
        }
        // get the inverse matrix
        let ai = d / determinant, bi = -b / determinant, ci = -c / determinant, di = a / determinant;
        // now multiply
        return [ai * line1[2] + bi * line2[2], ci * line1[2] + di * line2[2]];
    }
    //given points (p1, p2), output the a,b,c coefficients that go through them
    function pointToCoefficients(...args) {
        let lst = flatten_all(args);
        if (lst.length != 4) {
            throw "pointToCoefficients must have 6 points";
        }
        let [p1x, p1y, p2x, p2y] = lst;
        noNaN(arguments);
        if (p1x == p2x) { // vertical line
            return [1, 0, p1x]; // x = p1x
        }
        else {
            let m = (p2y - p1y) / (p2x - p1x); // slope
            let b = p1y - m * p1x;
            // y = mx + b -> y - mx = b
            return [-m, 1, b];
        }
    }
    // [x, y] : point , [a,b,c] : line
    function pointClosestToLine(...args) {
        let lst = flatten_all(args);
        if (lst.length != 5) {
            throw "pointClosestToLine must have 5 points";
        }
        noNaN(arguments);
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
        let [p1, p2, a, b, c] = lst;
        if (b == 0) {
            // line is of the form x = c/a
            return [c / a, p2, dist([p1, p2], [c / a, p2])];
        }
        let lambda = (p2 - (c - a * p1) / b) / (-b / 2 - a * a / (2 * b));
        let y = ((c - a * p1) - lambda * a * a / 2) / b;
        let x = p1 + a / 2 * lambda;
        return [x, y, dist([p1, p2], [x, y])];
    }
    function pointClosestToSegment(...args) {
        let lst = flatten_all(args);
        if (lst.length != 6) {
            throw "pointClosestToSegment must have 6 points";
        }
        noNaN(arguments);
        let [x, y, l1x, l1y, l2x, l2y] = lst;
        let closest_point = pointClosestToLine(x, y, pointToCoefficients(l1x, l1y, l2x, l2y));
        let between_ = false;
        if (l1x == l2x) {
            // vertical line, test x value
            between_ = between(closest_point[0], l1x, l2x);
        }
        else {
            // test y value
            between_ = between(closest_point[1], l1y, l2y);
        }
        if (between_) {
            return closest_point;
        }
        else {
            // check endpoints
            let d1 = dist([x, y], [l1x, l1y]);
            let d2 = dist([x, y], [l2x, l2y]);
            if (d1 < d2) {
                return [l1x, l1y, d1];
            }
            else {
                return [l2x, l2y, d2];
            }
        }
    }
    function between(x, b1, b2) {
        noNaN(arguments);
        if (b1 <= x && x <= b2) {
            return true;
        }
        if (b1 >= x && x >= b2) {
            return true;
        }
        return false;
    }
    // lines are P = (p1x, p1y, p2x, p2y) and Q = (q1x, q1y, q2x, q2y)
    // intersection must be between endpoints
    function doLinesIntersect(...args) {
        noNaN(arguments);
        let lst = flatten_all(args);
        if (lst.length != 8) {
            throw "doLinesIntersect must have 8 points";
        }
        let [p1x, p1y, p2x, p2y, q1x, q1y, q2x, q2y] = lst;
        let line1 = pointToCoefficients(p1x, p1y, p2x, p2y);
        let line2 = pointToCoefficients(q1x, q1y, q2x, q2y);
        let intersectionPoint = [0, 0];
        try {
            intersectionPoint = getIntersection(line1, line2);
        }
        catch (err) {
            if (err == "lines are too close to parallel") {
                return false;
            }
            else {
                throw err;
            }
        }
        return (between(intersectionPoint[0], p1x, p2x) &&
            between(intersectionPoint[0], q1x, q2x) &&
            between(intersectionPoint[1], p1y, p2y) &&
            between(intersectionPoint[1], q1y, q2y));
    }
    // walls are given px, py, qx, qy
    // move point towards target, stopping epsilon units right before the first wall 
    function move_wall(point, walls, target, amt, epsilon = 0.001) {
        if (amt != undefined) {
            target = moveTo(point, target, amt);
        }
        for (let w of walls) {
            if (doLinesIntersect(point, target, w)) {
                let intersection = getIntersection(pointToCoefficients(point, target), pointToCoefficients(w));
                // target = intersection + (start - intersection) normalized to 0.01
                target = lincomb(1, intersection, 1, normalize(lincomb(1, point, -1, intersection), epsilon));
            }
        }
        return target;
    }
    // doLinesIntersect(412, 666, 620 , 434, 689, 675, 421, 514) = true
    // doLinesIntersect(412, 666, 620 , 434, 498 ,480 ,431 ,609 ) = false 
    // doLinesIntersect(100, 100, 200, 100, 100, 200, 200, 200) = false
    // cast a ray , and count number of intersections
    function pointInsidePolygon(x, y, points) {
        noNaN(arguments);
        let dx = Math.random() + 1;
        let dy = Math.random();
        let max_x = max(points.map((x) => x[0])) - x;
        let line = [x, y, x + dx * max_x, y + dy * max_x];
        let counter = 0;
        for (let i = 0; i < points.length; i++) {
            let next_point = i == points.length - 1 ? points[0] : points[i + 1];
            if (doLinesIntersect(line, points[i], next_point)) {
                counter++;
            }
        }
        return counter % 2 == 1;
    }
    // find where a line segment (given by two points) intersects the rectangle. the first point is inside the rectangle and the second point is outside.
    function getLineEndWH(...args) {
        noNaN(arguments);
        let lst = flatten_all(args);
        if (lst.length != 8) {
            throw "getLineEndWH must have 8 points";
        }
        let [p1x, p1y, p2x, p2y, tlx, tly, width, height] = lst;
        // ensure p1 is inside and 
        if (!pointInsideRectangleWH(p1x, p1y, tlx, tly, width, height)) {
            throw "p1 outside of rectangle";
        }
        if (pointInsideRectangleWH(p2x, p2y, tlx, tly, width, height)) {
            throw "p2 inside rectangle";
        }
        //convert the line to ax+by=c
        // a (p2x - p1x) = -b (p2y - p1y)
        let a, b, c;
        if (p2y - p1y != 0) { // a is not 0, set a = 1 (use this chart)
            // if a = 0 then b = 0 as well, we have 0 = c, so c = 0. This gives [0,0,0] which is not a point in P^2
            // a (p2x - p1x)/(p2y - p1y) = -b 
            a = 1;
            b = -(p2x - p1x) / (p2y - p1y);
            c = a * p1x + b * p1y;
        }
        else {
            //p2y = p1y, so subtracting the equations gives a  = 0/(p2x - p1x) = 0
            // now we are in P^1 with b and c. We are solving by=c in P^1. 
            // so if y = 0 then we have [0,1,0]. Else, we have [0,?,1]
            a = 0;
            if (p2y == 0) {
                b = 0;
                c = 0;
            }
            else {
                c = 1;
                b = c / p2y;
            }
        }
        let lineCoefficients = [a, b, c];
        let topLine = [0, 1, tly]; // y = top left y
        let leftLine = [1, 0, tlx]; // x = tlx
        let rightLine = [1, 0, tlx + width]; // x = tlx+width
        let bottomLine = [0, 1, tly + height]; // y = top left y + height
        let lines = [topLine, leftLine, rightLine, bottomLine];
        for (let i = 0; i < 4; i++) {
            let line = lines[i];
            try {
                let intersection = getIntersection(lineCoefficients, line);
                // intersection must be inside the rectangle
                if (pointInsideRectangleWH(intersection[0], intersection[1], tlx, tly, width, height)) {
                    // and must also be in the correct direction of the second line:
                    if ((intersection[0] - p1x) * (p2x - p1x) + (intersection[1] - p1y) * (p2y - p1y) >= 0) {
                        return intersection;
                    }
                }
            }
            catch (e) {
                if (e == "lines are too close to parallel") {
                    ;
                }
                else {
                    throw e;
                }
            }
        }
    }
    function getLineEndBR(...args) {
        noNaN(arguments);
        let lst = flatten_all(args);
        if (lst.length != 8) {
            throw "getLineEndBR must have 6 points";
        }
        let [p1x, p1y, p2x, p2y, tlx, tly, brx, bry] = lst;
        return getLineEndWH(p1x, p1y, p2x, p2y, tlx, tly, brx - tlx, bry - tly);
    }
    function testCases() {
        //getLineEnd(p1x, p1y, p2x, p2y, tlx, tly, height, width){
        console.log("This should be 5,5");
        console.log(getLineEndWH(0, 0, 100, 100, -10, -5, 20, 10)); // output should be 5,5, line is [1,-1,0]	
        console.log("This should be 166.216, 390");
        console.log(getLineEndWH(159.1, 337.34, 207.9, 689.46, 133, 260, 150, 130)); // output should be 166.216, 390, line is [3.7,-0.5,420]
        console.log("This should be 207.407, 260");
        console.log(getLineEndWH(242, 291.133, 80, 145.333, 133, 260, 150, 130)); // output should be 207.407, 260, line is [2.7,-3,-220]
        console.log("This should be 283, 328.033");
        console.log(getLineEndWH(242, 291.133, 445, 473.833, 133, 260, 150, 130)); // output should be 283, 328.033, line is [2.7,-3,-220]  
        console.log("This should be 174, 390 (vertical line)");
        console.log(getLineEndWH(174, 300, 174, 600, 133, 260, 150, 130)); // output should be 174, 390, line is [1,0,174] 
        console.log("This should be 133, 290 (horizontal line)");
        console.log(getLineEndWH(211, 290, 1, 290, 133, 260, 150, 130)); // output should be 133, 290, line is [0,1,290] 
        console.log("all done");
    }
    // returns the list of vertices visited, in order 
    // neighbors is given as an oracle function
    // note that neighbors is  NOT required to be symmetric (that is: the graph can be directed); 
    function bfs(neighbors, u, halting_condition) {
        let visited = new Set();
        let queue = [u];
        let result = [];
        while (queue.length > 0) {
            let vertex = queue.shift();
            if (vertex == undefined) { // empty list 
                break;
            }
            // visit the vertex
            if (!visited.has(vertex)) {
                visited.add(vertex);
                result.push(vertex);
                if (halting_condition != undefined) {
                    if (halting_condition(vertex)) {
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
    function corners(tlx, tly, width, height, angle) {
        //console.log([tlx, tly, width, height, angle]);
        let cornersLst = [[tlx, tly]];
        // travel "rightward" (width) units along (angle)
        cornersLst.push([cornersLst[0][0] + width * Math.cos(angle), cornersLst[0][1] + width * Math.sin(angle)]);
        //travel "upwards" (height) units along angle- 90 degrees
        cornersLst.push([cornersLst[1][0] + height * Math.cos(angle + Math.PI / 2), cornersLst[1][1] + height * Math.sin(angle + Math.PI / 2)]);
        //travel "upwards" from the start
        cornersLst.push([cornersLst[0][0] + height * Math.cos(angle + Math.PI / 2), cornersLst[0][1] + height * Math.sin(angle + Math.PI / 2)]);
        return cornersLst;
    }
});
// put this into get_type.py, enter "DONE" (no quotes).
define("canvasDrawing", ["require", "exports", "lines"], function (require, exports, lines_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.make_style = make_style;
    exports.loadImage = loadImage;
    exports.drawImage = drawImage;
    exports.drawLine = drawLine;
    exports.drawCircle = drawCircle;
    exports.drawPolygon = drawPolygon;
    exports.drawRectangle = drawRectangle;
    exports.drawRectangle2 = drawRectangle2;
    exports.drawText = drawText;
    exports.drawEllipse = drawEllipse;
    exports.drawEllipseCR = drawEllipseCR;
    exports.drawEllipse2 = drawEllipse2;
    exports.drawBezierCurve = drawBezierCurve;
    exports.drawBezierShape = drawBezierShape;
    exports.drawRoundedRectangle = drawRoundedRectangle;
    exports.d_rect = d_rect;
    exports.d_rect2 = d_rect2;
    exports.d_ellipse = d_ellipse;
    exports.d_ellipse2 = d_ellipse2;
    exports.d_line = d_line;
    exports.d_circle = d_circle;
    exports.d_image = d_image;
    exports.d_text = d_text;
    exports.d_bezier = d_bezier;
    exports.add_com = add_com;
    var imgStrings = {};
    function make_style(ctx, style) {
        if (typeof (style) == "string") {
            return style;
        }
        if (style.type == "fill_linear") {
            var x = ctx.createLinearGradient(style.x0, style.y0, style.x1, style.y1);
        }
        else if (style.type == "fill_radial") {
            var x = ctx.createRadialGradient(style.x0, style.y0, style.r0, style.x1, style.y1, style.r1);
        }
        else if (style.type == "fill_conic") {
            var x = ctx.createConicGradient(style.theta, style.x, style.y);
        }
        else {
            throw "1";
        }
        for (var item of style.colorstops) {
            x.addColorStop(item[0], item[1]);
        }
        return x;
    }
    function loadImage(img) {
        if (imgStrings[img] == undefined) {
            return new Promise(function (x, y) {
                let im = new Image();
                im.src = img;
                im.onload = function () {
                    imgStrings[img] = im;
                    x();
                };
            });
        }
    }
    function drawImage(context, img, x, y) {
        if (imgStrings[img] == undefined) {
            console.log("load the image first " + img);
            var im = new Image();
            im.src = img;
            im.onload = function () {
                if (context) {
                    context.drawImage(im, x, y);
                }
                imgStrings[img] = im;
            };
        }
        else {
            var im = imgStrings[img];
            if (context) {
                context.drawImage(im, x, y);
            }
        }
    }
    function drawLine(context, x0, y0, x1, y1, color = "black", width = 1) {
        (0, lines_1.noNaN)(arguments);
        //	////console.log(x0, y0, x1, y1)
        context.strokeStyle = color;
        context.lineWidth = width;
        context.beginPath();
        context.stroke();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
    }
    //draws a circle with the given coordinates (as center) and color
    function drawCircle(context, x, y, r, color = "black", width = 1, fill = false, transparency = 1, start = 0, end = 2 * Math.PI) {
        (0, lines_1.noNaN)(arguments);
        //////console.log(x,y,r)
        context.lineWidth = width;
        context.beginPath();
        context.arc(x, y, r, start, end);
        if (fill) {
            context.globalAlpha = transparency;
            context.fillStyle = make_style(context, color);
            context.fill();
            context.globalAlpha = 1;
        }
        else {
            context.strokeStyle = make_style(context, color);
            context.stroke();
        }
    }
    function drawPolygon(context, points_x, points_y, color = "black", width = 1, fill = false, transparency = 1) {
        (0, lines_1.noNaN)(arguments);
        (0, lines_1.noNaN)(points_x);
        (0, lines_1.noNaN)(points_y);
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(points_x[0], points_y[0]);
        for (var i = 1; i < points_x.length; i++) {
            context.lineTo(points_x[i], points_y[i]);
        }
        context.closePath();
        if (fill) {
            context.globalAlpha = transparency;
            context.fillStyle = make_style(context, color);
            context.fill();
            context.globalAlpha = 1;
        }
        else {
            context.strokeStyle = make_style(context, color);
            context.stroke();
        }
    }
    //draws a rectangle with the given coordinates and color
    function drawRectangle(context, tlx, tly, brx, bry, color = "black", width = 1, fill = false, transparency = 1) {
        (0, lines_1.noNaN)(arguments);
        if (fill) {
            context.globalAlpha = transparency;
            context.fillStyle = make_style(context, color);
            context.fillRect(tlx, tly, brx - tlx, bry - tly);
            context.globalAlpha = 1;
        }
        else {
            context.lineWidth = width;
            context.strokeStyle = make_style(context, color);
            context.beginPath();
            context.rect(tlx, tly, brx - tlx, bry - tly);
            context.stroke();
        }
    }
    // uses width and height instead of bottom right coordinates
    function drawRectangle2(context, tlx, tly, width, height, color = "black", widthA = 1, fill = false, transparency = 1) {
        (0, lines_1.noNaN)(arguments);
        drawRectangle(context, tlx, tly, tlx + width, tly + height, color, widthA, fill, transparency);
    }
    // coords are bottom left of text
    function drawText(context, text_, x, y, width = undefined, color = "black", size = 20, font = "Arial") {
        (0, lines_1.noNaN)(arguments);
        context.font = size + `px ${font}`;
        context.fillStyle = color;
        if (width == undefined) {
            context.fillText(text_, x, y);
        }
        else {
            context.fillText(text_, x, y, width);
        }
    }
    // see drawRectangle
    function drawEllipse(context, posx, posy, brx, bry, color = "black", transparency = 1, rotate = 0, start = 0, end = 2 * Math.PI) {
        (0, lines_1.noNaN)(arguments);
        drawEllipse2(context, posx, posy, brx - posx, bry - posy, color, transparency, rotate, start, end);
    }
    //draw ellipse with center and radii
    function drawEllipseCR(context, cx, cy, rx, ry, color = "black", transparency = 1, rotate = 0, start = 0, end = 2 * Math.PI) {
        (0, lines_1.noNaN)(arguments);
        drawEllipse2(context, cx - rx, cy - ry, 2 * rx, 2 * ry, color, transparency, rotate, start, end);
    }
    function drawEllipse2(context, posx, posy, width, height, color = "black", transparency = 1, rotate = 0, start = 0, end = 2 * Math.PI) {
        (0, lines_1.noNaN)(arguments);
        context.beginPath();
        context.fillStyle = make_style(context, color);
        context.globalAlpha = transparency;
        context.ellipse(posx + width / 2, posy + height / 2, width / 2, height / 2, rotate, start, end);
        context.fill();
        context.globalAlpha = 1;
    }
    function drawBezierCurve(context, x, y, p1x, p1y, p2x, p2y, p3x, p3y, color = "black", width = 1) {
        (0, lines_1.noNaN)(arguments);
        //	////console.log(x0, y0, x1, y1)
        context.strokeStyle = make_style(context, color);
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(x, y);
        context.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
        context.stroke();
    }
    function drawBezierShape(context, x, y, curves, color = "black", width = 1) {
        (0, lines_1.noNaN)(arguments);
        for (var item of curves) {
            (0, lines_1.noNaN)(item);
        }
        // curves are lists of 6 points 
        context.strokeStyle = make_style(context, color);
        context.beginPath();
        context.moveTo(x, y);
        for (let curve of curves) {
            let [a, b, c, d, e, f] = curve;
            context.bezierCurveTo(a, b, c, d, e, f);
        }
        context.closePath();
        context.fillStyle = make_style(context, color);
        context.fill();
    }
    function drawRoundedRectangle(context, x0, y0, x1, y1, r1, r2, color = "black", width = 1, fill = false) {
        var perp_vector = [y1 - y0, x0 - x1];
        perp_vector = (0, lines_1.normalize)(perp_vector, r1);
        var perp_vector2 = [y1 - y0, x0 - x1];
        perp_vector2 = (0, lines_1.normalize)(perp_vector, r2);
        context.beginPath();
        context.moveTo(x0 + perp_vector[0], y0 + perp_vector[1]);
        context.lineTo(x1 + perp_vector[0], y1 + perp_vector2[1]);
        var angle = Math.atan2(perp_vector[1], perp_vector[0]);
        // add pi/2 and see if it points in the same direction as p1 -> p0 
        var ccw = Math.cos(angle + Math.PI / 2) * (x0 - x1) + Math.sin(angle + Math.PI / 2) * (y0 - y1) > 0;
        context.arc(x1, y1, r2, angle, angle + Math.PI, ccw);
        context.lineTo(x0 - perp_vector[0], y0 - perp_vector[1]);
        context.arc(x0, y0, r1, Math.PI + angle, angle, ccw);
        context.closePath();
        if (fill) {
            context.fillStyle = make_style(context, color);
            context.fill();
        }
        else {
            context.strokeStyle = make_style(context, color),
                context.lineWidth = width;
            context.stroke();
        }
    }
    // QUICKLY make stuff 
    function d_rect(...args) {
        let x = (0, lines_1.flatten_all)(args);
        if (x.length != 4) {
            throw "draw Rectangle without enough arguments";
        }
        return { "type": "drawRectangle", "tlx": x[0], "tly": x[1], "brx": x[2], "bry": x[3] };
    }
    function d_rect2(...args) {
        let x = (0, lines_1.flatten_all)(args);
        if (x.length != 4) {
            throw "draw Rectangle 2 without enough arguments";
        }
        return { "type": "drawRectangle2", "tlx": x[0], "tly": x[1], "width": x[2], "height": x[3] };
    }
    function d_ellipse(...args) {
        let x = (0, lines_1.flatten_all)(args);
        if (x.length != 4) {
            throw "draw ellipse without enough arguments";
        }
        return { "type": "drawEllipse", "posx": x[0], "posy": x[1], "brx": x[2], "bry": x[3] };
    }
    function d_ellipse2(...args) {
        let x = (0, lines_1.flatten_all)(args);
        if (x.length != 4) {
            throw "draw ellipse 2 without enough arguments";
        }
        return { "type": "drawEllipseCR", "cx": x[0], "cy": x[1], "rx": x[2], "ry": x[3] };
    }
    function d_line(...args) {
        let x = (0, lines_1.flatten_all)(args);
        if (x.length != 4) {
            throw "draw line without enough arguments";
        }
        return { "type": "drawLine", "x0": x[0], "y0": x[1], "x1": x[2], "y1": x[3] };
    }
    function d_circle(...args) {
        let x = (0, lines_1.flatten_all)(args);
        if (x.length != 3) {
            throw "draw circle without enough arguments";
        }
        return { "type": "drawCircle", "x": x[0], "y": x[1], "r": x[2] };
    }
    function d_image(name, ...args) {
        let x = (0, lines_1.flatten_all)(args);
        if (x.length != 2) {
            throw "draw image without enough arguments";
        }
        return { "type": "drawImage", "x": x[0], "y": x[1], "img": name };
    }
    function d_text(text, ...args) {
        let x = (0, lines_1.flatten_all)(args);
        if (x.length != 2) {
            throw "draw text without enough arguments";
        }
        return { "type": "drawText", "x": x[0], "y": x[1], "text_": text };
    }
    function d_bezier(points, shape = false) {
        if (typeof (points[0]) == "number") {
            if (points.length % 2 != 0) {
                throw "d_bezier with odd number of numbers";
            }
            let p = [];
            for (let i = 0; i < points.length; i += 2) {
                p.push([points[i], points[i + 1]]);
            }
            return d_bezier(p);
        }
        points = points;
        if (points.length % 3 != 1) {
            throw "d_bezier must have length 1 mod 3";
        }
        let output = [];
        let current_point = points[0];
        if (shape == false) {
            for (let i = 1; i < points.length; i += 3) {
                output.push({ "type": "drawBezierCurve", "x": current_point[0], "y": current_point[1], "p1x": points[i][0], "p1y": points[i][1], "p2x": points[i + 1][0], "p2y": points[i + 1][1], "p3x": points[i + 2][0], "p3y": points[i + 2][1] });
                current_point = points[i + 2];
            }
        }
        else {
            let curves = [];
            for (let i = 1; i < points.length; i += 3) {
                curves.push([points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], points[i + 2][0], points[i + 2][1]]);
            }
            output.push({ "type": "drawBezierShape", x: points[0][0], y: points[0][1], curves: curves });
        }
        return output;
    }
    function add_com(x, y) {
        (0, lines_1.combine_obj)(x, y); // calls lines.ts 
        return x;
    }
});
