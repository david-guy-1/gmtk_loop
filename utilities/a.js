// put this into get_type.py, enter "DONE" (no quotes).
//import { add_obj, combine_obj, flatten, flatten_all, lincomb, noNaN, normalize } from "./lines";
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
    noNaN(arguments);
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
    noNaN(arguments);
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
    noNaN(arguments);
    noNaN(points_x);
    noNaN(points_y);
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
    noNaN(arguments);
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
    noNaN(arguments);
    drawRectangle(context, tlx, tly, tlx + width, tly + height, color, widthA, fill, transparency);
}
// coords are bottom left of text
function drawText(context, text_, x, y, width = undefined, color = "black", size = 20, font = "Arial") {
    noNaN(arguments);
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
    noNaN(arguments);
    drawEllipse2(context, posx, posy, brx - posx, bry - posy, color, transparency, rotate, start, end);
}
//draw ellipse with center and radii
function drawEllipseCR(context, cx, cy, rx, ry, color = "black", transparency = 1, rotate = 0, start = 0, end = 2 * Math.PI) {
    noNaN(arguments);
    drawEllipse2(context, cx - rx, cy - ry, 2 * rx, 2 * ry, color, transparency, rotate, start, end);
}
function drawEllipse2(context, posx, posy, width, height, color = "black", transparency = 1, rotate = 0, start = 0, end = 2 * Math.PI) {
    noNaN(arguments);
    context.beginPath();
    context.fillStyle = make_style(context, color);
    context.globalAlpha = transparency;
    context.ellipse(posx + width / 2, posy + height / 2, width / 2, height / 2, rotate, start, end);
    context.fill();
    context.globalAlpha = 1;
}
function drawBezierCurve(context, x, y, p1x, p1y, p2x, p2y, p3x, p3y, color = "black", width = 1) {
    noNaN(arguments);
    //	////console.log(x0, y0, x1, y1)
    context.strokeStyle = make_style(context, color);
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(p1x, p1y, p2x, p2y, p3x, p3y);
    context.stroke();
}
function drawBezierShape(context, x, y, curves, color = "black", width = 1) {
    noNaN(arguments);
    for (var item of curves) {
        noNaN(item);
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
    perp_vector = normalize(perp_vector, r1);
    var perp_vector2 = [y1 - y0, x0 - x1];
    perp_vector2 = normalize(perp_vector, r2);
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
    let x = flatten_all(args);
    if (x.length != 4) {
        throw "draw Rectangle without enough arguments";
    }
    return { "type": "drawRectangle", "tlx": x[0], "tly": x[1], "brx": x[2], "bry": x[3] };
}
function d_rect2(...args) {
    let x = flatten_all(args);
    if (x.length != 4) {
        throw "draw Rectangle 2 without enough arguments";
    }
    return { "type": "drawRectangle2", "tlx": x[0], "tly": x[1], "width": x[2], "height": x[3] };
}
function d_ellipse(...args) {
    let x = flatten_all(args);
    if (x.length != 4) {
        throw "draw ellipse without enough arguments";
    }
    return { "type": "drawEllipse", "posx": x[0], "posy": x[1], "brx": x[2], "bry": x[3] };
}
function d_ellipse2(...args) {
    let x = flatten_all(args);
    if (x.length != 4) {
        throw "draw ellipse 2 without enough arguments";
    }
    return { "type": "drawEllipseCR", "cx": x[0], "cy": x[1], "rx": x[2], "ry": x[3] };
}
function d_line(...args) {
    let x = flatten_all(args);
    if (x.length != 4) {
        throw "draw line without enough arguments";
    }
    return { "type": "drawLine", "x0": x[0], "y0": x[1], "x1": x[2], "y1": x[3] };
}
function d_circle(...args) {
    let x = flatten_all(args);
    if (x.length != 3) {
        throw "draw circle without enough arguments";
    }
    return { "type": "drawCircle", "x": x[0], "y": x[1], "r": x[2] };
}
function d_image(name, ...args) {
    let x = flatten_all(args);
    if (x.length != 2) {
        throw "draw image without enough arguments";
    }
    return { "type": "drawImage", "x": x[0], "y": x[1], "img": name };
}
function d_text(text, ...args) {
    let x = flatten_all(args);
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
//number of points must be even
function d_smoothbezier(points, shape = false, closed = false) {
    if (typeof (points[0]) == "number") {
        if (points.length % 2 != 0) {
            throw "d_smoothbezier with odd number of numbers";
        }
        let p = [];
        for (let i = 0; i < points.length; i += 2) {
            p.push([points[i], points[i + 1]]);
        }
        return d_bezier(p);
    }
    points = points;
    if (points.length % 2 != 0) {
        throw "d_smoothbezier : number of points must be even ";
    }
    if (points.length <= 3) {
        return [];
    }
    // if 10 points: points = 0, 1, 2, 2.5, 3, 4, 4.5, 5, 6, 6.5, 7, 8, (last point is rounded up) 9
    let bezier_points = [];
    if (!closed) {
        bezier_points.push(points[0]);
        bezier_points.push(points[1]);
        bezier_points.push(points[2]);
        let i = 3;
        while (i <= points.length - 2) {
            bezier_points.push(lincomb(0.5, points[i - 1], 0.5, points[i]));
            bezier_points.push(points[i]);
            bezier_points.push(points[i + 1]);
            i += 2;
        }
        bezier_points.push(points[i]);
        return d_bezier(bezier_points, shape);
    }
    else {
        let new_points = JSON.parse(JSON.stringify(points));
        new_points.push(new_points[0]);
        new_points.push(new_points[1]);
        bezier_points.push(lincomb(0.5, new_points[0], 0.5, new_points[1]));
        bezier_points.push(points[1]);
        bezier_points.push(points[2]);
        let i = 3;
        while (i <= points.length) {
            bezier_points.push(lincomb(0.5, new_points[i - 1], 0.5, new_points[i]));
            bezier_points.push(new_points[i]);
            bezier_points.push(new_points[i + 1]);
            i += 2;
        }
        bezier_points.push(lincomb(0.5, new_points[i - 1], 0.5, new_points[i]));
        return d_bezier(bezier_points, shape);
    }
}
function add_com(x, y) {
    combine_obj(x, y); // calls lines.ts 
    return x;
}
//import { drawImage, drawLine, drawCircle, drawPolygon, drawRectangle, drawRectangle2, drawText, drawEllipse, drawEllipseCR, drawEllipse2, drawBezierCurve, drawBezierShape, drawRoundedRectangle } from "./canvasDrawing";
function draw(lst, c) {
    if (c.current == null) {
        return;
    }
    draw_wrap(lst, c.current.getContext('2d'));
}
function clear(c) {
    if (c.current == null) {
        return;
    }
    //@ts-ignore
    c.current.getContext('2d').clearRect(0, 0, c.current?.width, c.current?.height);
}
function draw_wrap(lst, c) {
    for (let item of lst) {
        switch (item.type) {
            case "drawImage":
                drawImage(c, item.img, item.x, item.y);
                break;
            case "drawLine":
                drawLine(c, item.x0, item.y0, item.x1, item.y1, item.color, item.width);
                break;
            case "drawCircle":
                drawCircle(c, item.x, item.y, item.r, item.color, item.width, item.fill, item.transparency, item.start, item.end);
                break;
            case "drawPolygon":
                drawPolygon(c, item.points_x, item.points_y, item.color, item.width, item.fill, item.transparency);
                break;
            case "drawRectangle":
                drawRectangle(c, item.tlx, item.tly, item.brx, item.bry, item.color, item.width, item.fill, item.transparency);
                break;
            case "drawRectangle2":
                drawRectangle2(c, item.tlx, item.tly, item.width, item.height, item.color, item.widthA, item.fill, item.transparency);
                break;
            case "drawText":
                drawText(c, item.text_, item.x, item.y, item.width, item.color, item.size, item.font);
                break;
            case "drawEllipse":
                drawEllipse(c, item.posx, item.posy, item.brx, item.bry, item.color, item.transparency, item.rotate, item.start, item.end);
                break;
            case "drawEllipseCR":
                drawEllipseCR(c, item.cx, item.cy, item.rx, item.ry, item.color, item.transparency, item.rotate, item.start, item.end);
                break;
            case "drawEllipse2":
                drawEllipse2(c, item.posx, item.posy, item.width, item.height, item.color, item.transparency, item.rotate, item.start, item.end);
                break;
            case "drawBezierCurve":
                drawBezierCurve(c, item.x, item.y, item.p1x, item.p1y, item.p2x, item.p2y, item.p3x, item.p3y, item.color, item.width);
                break;
            case "drawBezierShape":
                drawBezierShape(c, item.x, item.y, item.curves, item.color, item.width);
                break;
            case "drawRoundedRectangle":
                drawRoundedRectangle(c, item.x0, item.y0, item.x1, item.y1, item.r1, item.r2, item.color, item.width, item.fill);
                break;
        }
    }
}
function fade(lst, c, callback, color = "black", time = 0.5, size = [1000, 1000]) {
    if (c.current == null) {
        return;
    }
    fade_wrap(lst, c.current.getContext('2d'), callback, color, time, size);
}
function fade_wrap(lst, c, callback, color = "black", time = 0.5, size = [1000, 1000]) {
    // draw black 20 times, then draw the thing 20 times; 
    let interval = setInterval(function () {
        this[0]++;
        if (this[0] == 40) {
            clearInterval(interval);
        }
        if (this[0] < 20) {
            c.globalAlpha = 0.15;
            c.beginPath();
            c.rect(0, 0, size[0], size[1]);
            c.fillStyle = color;
            c.fill();
        }
        else if (this[0] <= 39) {
            c.clearRect(0, 0, size[0], size[1]);
            draw_wrap(lst, c);
            c.globalAlpha = 1 - 0.05 * (this[0] - 20);
            c.beginPath();
            c.rect(0, 0, size[0], size[1]);
            c.fillStyle = color;
            c.fill();
        }
        else {
            c.clearRect(0, 0, size[0], size[1]);
            draw_wrap(lst, c);
            callback();
        }
    }.bind([0]), time * 1000 / 40);
}
class img_with_center {
    commands;
    x;
    y;
    img;
    constructor(commands, x, y, width, height) {
        this.commands = commands;
        this.x = x;
        this.y = y;
        this.img = save_image(commands, width, height);
    }
    output(x, y) {
        return { type: "drawImage", x: x - this.x, y: y - this.y, img: this.img };
    }
}
function save_image(commands, width, height) {
    var c = document.createElement("canvas");
    c.setAttribute("width", width.toString());
    c.setAttribute("height", height.toString());
    var ctx = c.getContext("2d");
    if (ctx == null) {
        throw 1;
    }
    draw_wrap(commands, ctx);
    return c.toDataURL('image/png');
}
//import { point } from "./interfaces";
function rotate(p, origin, amt) {
    var dx = p[0] - origin[0];
    var dy = p[1] - origin[1];
    var r = Math.sqrt(dx * dx + dy * dy);
    var theta = Math.atan2(dy, dx);
    theta += amt;
    return [r * Math.cos(theta) + origin[0], r * Math.sin(theta) + origin[1]];
}
function displace_fillstyle(style, amt) {
    var x = JSON.parse(JSON.stringify(style));
    if (typeof (x) == "string") {
        return x;
    }
    switch (x.type) {
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
function rotate_fillstyle(style, origin, amt) {
    var x = JSON.parse(JSON.stringify(style));
    if (typeof (x) == "string") {
        return x;
    }
    switch (x.type) {
        case "fill_conic":
            [x.x, x.y] = rotate([x.x, x.y], origin, amt);
            style;
            x.theta += amt;
            break;
        case "fill_linear":
        case "fill_radial":
            [x.x1, x.y1] = rotate([x.x1, x.y1], origin, amt);
            [x.x0, x.y0] = rotate([x.x0, x.y0], origin, amt);
            break;
    }
    return x;
}
function scale_fillstyle(style, center, x_amt, y_amt) {
    var x = JSON.parse(JSON.stringify(style));
    if (typeof (x) == "string") {
        return x;
    }
    switch (x.type) {
        case "fill_conic":
            x.x = scale_number(x.x, center[0], x_amt);
            x.y = scale_number(x.y, center[1], y_amt);
            break;
        case "fill_radial":
            if (x_amt != y_amt) {
                throw "scaling fill_radial with non-uniform scaling";
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
function displace_command(command, amt) {
    var new_command = JSON.parse(JSON.stringify(command)); // copy it
    switch (new_command.type) {
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
            if (new_command.color) {
                new_command.color = displace_fillstyle(new_command.color, amt);
            }
    }
    switch (command.type) {
        case "drawBezierCurve":
            new_command = new_command;
            new_command.x += amt[0];
            new_command.p1x += amt[0];
            new_command.p2x += amt[0];
            new_command.p3x += amt[0];
            new_command.y += amt[1];
            new_command.p1y += amt[1];
            new_command.p2y += amt[1];
            new_command.p3y += amt[1];
            break;
        case "drawImage":
            new_command = new_command;
            new_command.x += amt[0];
            new_command.y += amt[1];
            break;
        case "drawBezierShape":
            new_command = new_command;
            new_command.x += amt[0];
            new_command.y += amt[1];
            for (var curve of new_command.curves) {
                for (var i = 0; i < 6; i++) {
                    curve[i] += amt[i % 2];
                }
            }
            break;
        case "drawText":
        case "drawCircle":
            new_command = new_command;
            new_command.x += amt[0];
            new_command.y += amt[1];
            break;
        case "drawEllipse": // all ellipses are converted into CR format 
            new_command = new_command;
            new_command.posx += amt[0];
            new_command.posy += amt[1];
            new_command.brx += amt[0];
            new_command.bry += amt[1];
            break;
        case "drawEllipse2":
            new_command = new_command;
            new_command.posx += amt[0];
            new_command.posy += amt[1];
            break;
        case "drawEllipseCR":
            new_command = new_command;
            new_command.cx += amt[0];
            new_command.cy += amt[1];
            break;
        case "drawRoundedRectangle":
        case "drawLine":
            new_command = new_command;
            new_command.x0 += amt[0];
            new_command.x1 += amt[0];
            new_command.y0 += amt[1];
            new_command.y1 += amt[1];
            break;
        case "drawPolygon":
            new_command = new_command;
            new_command.points_x = new_command.points_x.map((x) => x + amt[0]);
            new_command.points_y = new_command.points_y.map((x) => x + amt[1]);
            break;
        case "drawRectangle":
            new_command = new_command;
            new_command.brx += amt[0];
            new_command.bry += amt[1];
            new_command.tlx += amt[0];
            new_command.tly += amt[1];
            break;
        case "drawRectangle2":
            new_command = new_command;
            new_command.tlx += amt[0];
            new_command.tly += amt[1];
            break;
    }
    return new_command;
}
function scale_number(number, center, factor) {
    return (number - center) * factor + center;
}
function scale_command(command, center, x_amt, y_amt) {
    var new_command = JSON.parse(JSON.stringify(command)); // copy it
    switch (new_command.type) {
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
            if (new_command.color) {
                new_command.color = scale_fillstyle(new_command.color, center, x_amt, y_amt);
            }
    }
    switch (command.type) {
        case "drawBezierCurve":
            new_command = new_command;
            new_command.x = scale_number(new_command.x, center[0], x_amt);
            new_command.p1x = scale_number(new_command.p1x, center[0], x_amt);
            new_command.p2x = scale_number(new_command.p2x, center[0], x_amt);
            new_command.p3x = scale_number(new_command.p3x, center[0], x_amt);
            new_command.y = scale_number(new_command.y, center[1], y_amt);
            new_command.p1y = scale_number(new_command.p1y, center[1], y_amt);
            new_command.p2y = scale_number(new_command.p2y, center[1], y_amt);
            new_command.p3y = scale_number(new_command.p3y, center[1], y_amt);
            break;
        case "drawBezierShape":
            new_command = new_command;
            new_command.x = scale_number(new_command.x, center[0], x_amt);
            new_command.y = scale_number(new_command.y, center[1], y_amt);
            for (var curve of new_command.curves) {
                for (var i = 0; i < 6; i++) {
                    if (i % 2 == 0) {
                        curve[i] = scale_number(curve[i], center[0], x_amt);
                    }
                    else {
                        curve[i] = scale_number(curve[i], center[1], y_amt);
                    }
                }
            }
            break;
        case "drawText":
            new_command = new_command;
            new_command.x = scale_number(new_command.x, center[0], x_amt);
            new_command.y = scale_number(new_command.y, center[1], y_amt);
            break;
        case "drawCircle": // converted into drawEllipse
            var command_c = { type: "drawEllipseCR", cx: command.x, cy: command.y, rx: command.r, ry: command.r, color: command.color, transparency: command.transparency, start: command.start, end: command.end };
            return scale_command(command_c, center, x_amt, y_amt);
            break;
        case "drawEllipse": // all ellipses are converted into CR format 
            var rx = (command.brx - command.posx) / 2;
            var ry = (command.bry - command.posy) / 2;
            var centerE = [command.posx + rx, command.posy + ry];
            return scale_command({ type: "drawEllipseCR", cx: centerE[0], cy: centerE[1], rx: rx, ry: ry, color: command.color, transparency: command.transparency, rotate: command.rotate, start: command.start, end: command.end }, center, x_amt, y_amt); // check the last 3 
            break;
        case "drawEllipse2":
            var rx = command.width / 2;
            var ry = command.height / 2;
            var centerE = [command.posx + rx, command.posy + ry];
            return scale_command({ type: "drawEllipseCR", cx: centerE[0], cy: centerE[1], rx: rx, ry: ry, color: command.color, transparency: command.transparency, rotate: command.rotate, start: command.start, end: command.end }, center, x_amt, y_amt);
            break;
        case "drawEllipseCR":
            new_command = new_command;
            new_command.cx = scale_number(new_command.cx, center[0], x_amt);
            new_command.cy = scale_number(new_command.cy, center[1], y_amt);
            new_command.rx *= Math.abs(x_amt);
            new_command.ry *= Math.abs(y_amt);
            break;
        case "drawRoundedRectangle":
            new_command = new_command;
            new_command.r1 *= x_amt;
            new_command.r2 *= x_amt;
        //fall through
        case "drawLine":
            new_command = new_command;
            new_command.x0 = scale_number(new_command.x0, center[0], x_amt);
            new_command.x1 = scale_number(new_command.x1, center[0], x_amt);
            new_command.y0 = scale_number(new_command.y0, center[1], y_amt);
            new_command.y1 = scale_number(new_command.y1, center[1], y_amt);
            break;
        case "drawPolygon":
            new_command = new_command;
            new_command.points_x = new_command.points_x.map((x) => scale_number(x, center[0], x_amt));
            new_command.points_y = new_command.points_y.map((x) => scale_number(x, center[1], y_amt));
            break;
        case "drawRectangle":
            new_command = new_command;
            new_command.brx = scale_number(new_command.brx, center[0], x_amt);
            new_command.bry = scale_number(new_command.bry, center[1], y_amt);
            new_command.tlx = scale_number(new_command.tlx, center[0], x_amt);
            new_command.tly = scale_number(new_command.tly, center[1], y_amt);
            break;
        case "drawRectangle2":
            new_command = new_command;
            new_command.tlx = scale_number(new_command.tlx, center[0], x_amt);
            new_command.tly = scale_number(new_command.tly, center[1], y_amt);
            new_command.width *= x_amt;
            new_command.height *= y_amt;
            break;
    }
    return new_command;
}
function rotate_command(command, origin, amt) {
    var new_command = JSON.parse(JSON.stringify(command)); // copy it
    switch (new_command.type) {
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
            if (new_command.color) {
                new_command.color = rotate_fillstyle(new_command.color, origin, amt);
            }
    }
    switch (command.type) {
        case "drawBezierCurve":
            new_command = new_command;
            [new_command.x, new_command.y] = rotate([command.x, command.y], origin, amt);
            [new_command.p1x, new_command.p1y] = rotate([command.p1x, command.p1y], origin, amt);
            [new_command.p2x, new_command.p2y] = rotate([command.p2x, command.p2y], origin, amt);
            [new_command.p3x, new_command.p3y] = rotate([command.p3x, command.p3y], origin, amt);
            break;
        case "drawBezierShape":
            new_command = new_command;
            [new_command.x, new_command.y] = rotate([command.x, command.y], origin, amt);
            new_command.curves = [];
            for (var curve of command.curves) {
                var p1 = [curve[0], curve[1]];
                var p2 = [curve[2], curve[3]];
                var p3 = [curve[4], curve[5]];
                var q1 = rotate(p1, origin, amt);
                var q2 = rotate(p2, origin, amt);
                var q3 = rotate(p3, origin, amt);
                new_command.curves.push([q1[0], q1[1], q2[0], q2[1], q3[0], q3[1]]);
            }
            break;
        case "drawText":
        case "drawCircle":
            new_command = new_command;
            [new_command.x, new_command.y] = rotate([command.x, command.y], origin, amt);
            break;
        case "drawEllipse": // all ellipses are converted into CR format 
            var rx = (command.brx - command.posx) / 2;
            var ry = (command.bry - command.posy) / 2;
            var center = [command.posx + rx, command.posy + ry];
            return rotate_command({ type: "drawEllipseCR", cx: center[0], cy: center[1], rx: rx, ry: ry, color: command.color, transparency: command.transparency, rotate: command.rotate, start: command.start, end: command.end }, origin, amt); // check the last 3 
            break;
        case "drawEllipse2":
            var rx = command.width / 2;
            var ry = command.height / 2;
            var center = [command.posx + rx, command.posy + ry];
            return rotate_command({ type: "drawEllipseCR", cx: center[0], cy: center[1], rx: rx, ry: ry, color: command.color, transparency: command.transparency, rotate: command.rotate, start: command.start, end: command.end }, origin, amt);
            break;
        case "drawEllipseCR":
            new_command = new_command;
            [new_command.cx, new_command.cy] = rotate([command.cx, command.cy], origin, amt);
            if (new_command.rotate == undefined) {
                new_command.rotate = 0;
            }
            new_command.rotate += amt;
            // check this one, and also if we need to change some others 
            break;
        case "drawRoundedRectangle":
        case "drawLine":
            new_command = new_command;
            [new_command.x0, new_command.y0] = rotate([command.x0, command.y0], origin, amt);
            [new_command.x1, new_command.y1] = rotate([command.x1, command.y1], origin, amt);
            break;
        case "drawPolygon":
            new_command = new_command;
            new_command.points_x = [];
            new_command.points_y = [];
            for (var i = 0; i < command.points_x.length; i++) {
                var next_point = rotate([command.points_x[i], command.points_y[i]], origin, amt);
                new_command.points_x.push(next_point[0]);
                new_command.points_y.push(next_point[1]);
            }
            break;
        case "drawRectangle":
            new_command = new_command;
            return rotate_command({ "type": "drawPolygon", "color": command.color, "fill": command.fill, "transparency": command.transparency, points_x: [command.tlx, command.tlx, command.brx, command.brx], points_y: [command.tly, command.bry, command.bry, command.tly] }, origin, amt);
            break;
        case "drawRectangle2":
            new_command = new_command;
            return rotate_command({ "type": "drawPolygon", "color": command.color, "fill": command.fill, "transparency": command.transparency, points_x: [command.tlx, command.tlx, command.tlx + command.width, command.tlx + command.width], points_y: [command.tly, command.tlx + command.height, command.tlx + command.height, command.tly] }, origin, amt);
            break;
    }
    return new_command;
}
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
// finds b in a, then inserts c after it.
function insert_after(a, b, c) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] == b) {
            a.splice(i + 1, 0, c);
            break;
        }
    }
    return a;
}
//mutates
function shift_lst(lst, n, way) {
    if (way == false) {
        if (n != 0) {
            let tmp = lst[n - 1];
            let tmp2 = lst[n];
            lst[n - 1] = tmp2;
            lst[n] = tmp;
        }
    }
    else {
        if (n != lst.length - 1) {
            let tmp = lst[n];
            let tmp2 = lst[n + 1];
            lst[n + 1] = tmp;
            lst[n] = tmp2;
        }
    }
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
function matmul(M, N) {
    //M[i][j] = row i, column j 
    // so M.length = number of rows = size of columns
    // and M[0].length = number of columns = size of rows
    if (M[0].length != N.length) {
        throw "matrix multiplication with incorrect dimensions";
    }
    // number of rows = M's number of rows, number of columns is N's number of columns. 
    // initialize P
    let P = [];
    for (let i = 0; i < M.length; i++) {
        P.push([]);
        for (let j = 0; j < N[0].length; j++) {
            P[i].push(0);
        }
    }
    for (let rown = 0; rown < M.length; rown++) {
        for (let coln = 0; coln < N[0].length; coln++) {
            for (let i = 0; i < M[0].length; i++) {
                P[rown][coln] += M[rown][i] * N[i][coln];
            }
        }
    }
    return P;
}
function Mv(M, N) {
    let P = matmul(M, N.map(x => [x]));
    return flatten(P);
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
// max cx : Ax <= b, x >= 0
//WARNING: mutates all inputs (except obs)
let default_op = {
    "add": (x, y) => x + y,
    "mul": (x, y) => x * y,
    "zero": () => 0,
    "one": () => 1,
    "ai": (x) => -x,
    "mi": (x) => 1 / x,
    "lt": (x, y) => x < y,
    "leq": (x, y) => x <= y,
    "eq": (x, y) => x == y
};
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
function simplex_pivot_op(ops, entering_index, leaving_index, zero_vars, nonzero_vars, eqns) {
    let { add, mul, zero, one, ai, mi, lt, leq } = ops;
    // now we need to change eqns (objective function doesn't change) 
    // recall eqns : nonzero var = coefficients * zero vars + constant 
    let entering_variable = zero_vars[entering_index];
    let leaving_variable = nonzero_vars[leaving_index];
    let leaving_row = eqns[leaving_index];
    let coef = leaving_row.splice(entering_index, 1)[0];
    leaving_row.splice(leaving_row.length - 1, 0, ai(one()));
    for (let i = 0; i < leaving_row.length; i++) {
        leaving_row[i] = mul(leaving_row[i], mi(ai(coef)));
    }
    // now we have an equation for entering_variable in terms of other variables 
    // adjust the other rows
    for (let i = 0; i < eqns.length; i++) {
        if (i == leaving_index) {
            continue;
        }
        let row = eqns[i];
        let coef = row.splice(entering_index, 1)[0];
        row.splice(row.length - 1, 0, zero());
        for (let j = 0; j < row.length; j++) {
            row[j] = add(row[j], mul(coef, leaving_row[j]));
        }
    }
    zero_vars.splice(entering_index, 1);
    zero_vars.push(leaving_variable);
    nonzero_vars.splice(leaving_index, 1);
    nonzero_vars.push(entering_variable);
}
function simplex_it(ops, names, zero_vars, nonzero_vars, eqns, obj, desired_enter = undefined) {
    // does one iteration of the simplex algorithm , mutates inputs 
    // every nonzero var is a constant + something involving only zero vars 
    // zero vars union nonzero vars = names , 	
    // matrix coefficients : every row is a nonzero var, as in the order in the nonzero_vars list, every number is a coefficient , as in the zero_vars list. the last entry is the constant.
    // assume all coefficients are >= 0 
    // obj uses the names list
    // do error checking 
    let { add, mul, zero, one, ai, mi, lt, leq, eq } = ops;
    // choose entering variable - a zero var to make nonzero
    let entering_variable = undefined;
    let best_choice = [zero(), zero()];
    for (let [i, candidate] of zero_vars.entries()) {
        // compute how much the objective will increase if we increase this zero variable 
        let direct_amt = obj[names.indexOf(candidate)];
        let coef = [zero(), zero()];
        if (direct_amt == "large") { // "large" = a large NEGATIVE number 
            coef = [zero(), ai(one())]; // but coefficients represent it as a POSITIVE number
        }
        else {
            coef = [direct_amt, zero()];
        }
        for (let [j, row] of eqns.entries()) {
            // increasing the candidate will also change nonzero var[j] by row[i]
            let term = obj[names.indexOf(nonzero_vars[j])];
            if (term != "large") {
                coef[0] = add(coef[0], mul(row[i], term));
            }
            else {
                coef[1] = add(coef[1], mul(row[i], ai(one())));
            }
        }
        if (lt(zero(), coef[1]) || (eq(zero(), coef[1]) && lt(zero(), coef[0]))) { // coefficient > 0 
            if (entering_variable == undefined || lt(best_choice[1], coef[1]) || (eq(best_choice[1], coef[1]) && lt(best_choice[0], coef[0]))) {
                entering_variable = candidate;
                best_choice = coef;
            }
        }
        if (candidate == desired_enter) {
            if (lt(coef[1], zero()) || (eq(coef[1], zero()) && lt(coef[0], zero()))) {
                throw "desired entering variable cannot be an entering variable";
            }
            else {
                entering_variable = candidate;
                best_choice = coef;
            }
        }
    }
    if (entering_variable == undefined) {
        let opt_result = [];
        for (let item of names) {
            if (nonzero_vars.indexOf(item) == -1) {
                opt_result.push(zero());
            }
            else {
                let row = eqns[nonzero_vars.indexOf(item)];
                opt_result.push(row[row.length - 1]);
            }
        }
        let sum = zero();
        let largesum = zero();
        for (let i = 0; i < names.length; i++) {
            let obj_coef = obj[i];
            if (obj_coef != "large") {
                sum = add(sum, mul(opt_result[i], obj_coef));
            }
            else {
                largesum = add(largesum, mul(opt_result[i], ai(one())));
            }
        }
        return ["optimal", [sum, largesum], opt_result];
    }
    let entering_index = zero_vars.indexOf(entering_variable);
    let smallest = undefined;
    let leaving_variable = undefined;
    // choose the leaving variable (nonzero to make zero)
    for (let i = 0; i < eqns.length; i++) {
        let row = eqns[i];
        if (leq(zero(), row[entering_index])) {
            continue; // this row will not be a problem 
        }
        let limit = mul(ai(row[row.length - 1]), mi(row[entering_index]));
        if (smallest == undefined || leq(limit, smallest)) {
            leaving_variable = nonzero_vars[i];
            smallest = limit;
        }
    }
    if (smallest == undefined || leaving_variable == undefined) {
        // check the current position for large values
        let large = zero();
        for (let [i, item] of names.entries()) {
            if (zero_vars.indexOf(item) != -1) {
                continue;
            }
            if (obj[i] != "large") {
                continue;
            }
            large = add(large, eqns[nonzero_vars.indexOf(item)][eqns[0].length - 1]);
        }
        if (!eq(large, zero())) {
            return "unbounded large";
        }
        return "unbounded";
    }
    let leaving_index = nonzero_vars.indexOf(leaving_variable);
    simplex_pivot_op(ops, entering_index, leaving_index, zero_vars, nonzero_vars, eqns);
    let moved_row = eqns.splice(leaving_index, 1);
    eqns.push(moved_row[0]);
    return "continue";
}
function simplex(ops, A, b, ca) {
    let num_vars = A[0].length;
    let num_cons = A.length;
    if (ca.length != num_vars) {
        throw "c.length must equal number of variables";
    }
    if (b.length != num_cons) {
        throw "b.length must equal number of constraints";
    }
    let { add, mul, zero, one, ai, mi, lt, leq, eq } = ops;
    // clone A, b, c
    A = [...A];
    for (let i = 0; i < A.length; i++) {
        A[i] = [...A[i]];
    }
    b = [...b];
    ca = [...ca];
    let c = ca;
    let names = [];
    for (let i = 0; i < num_vars; i++) {
        names.push("x" + i);
    }
    //  add slack variables	
    for (let i = 0; i < num_cons; i++) {
        names.push("slack" + i);
        c.push(zero());
        for (let row = 0; row < num_cons; row++) {
            if (row == i) {
                A[row].push(one());
            }
            else {
                A[row].push(zero());
            }
        }
    }
    // negate every row with a negative b
    for (let i = 0; i < num_cons; i++) {
        if (lt(b[i], zero())) {
            let row = A[i];
            b[i] = ai(b[i]);
            for (let j = 0; j < row.length; j++) {
                row[j] = ai(row[j]);
            }
        }
    }
    // add "initial slack" variables and start the simplex algorithm
    for (let i = 0; i < num_cons; i++) {
        names.push("initial slack" + i);
        c.push('large');
        for (let row = 0; row < num_cons; row++) {
            if (row == i) {
                A[row].push(one());
            }
            else {
                A[row].push(zero());
            }
        }
    }
    // the zero vars are the "old" variables and the nonzero vars are the "new" variables
    let zero_vars = [];
    let nonzero_vars = [];
    for (let var_ of names) {
        if (var_.indexOf("initial slack") != -1) {
            nonzero_vars.push(var_);
        }
        else {
            zero_vars.push(var_);
        }
    }
    let eqns = [];
    for (let i = 0; i < nonzero_vars.length; i++) {
        eqns.push([]);
        for (let j = 0; j < zero_vars.length; j++) {
            eqns[eqns.length - 1].push(ai(A[i][j]));
        }
        eqns[eqns.length - 1].push(b[i]);
    }
    while (true) {
        let result = simplex_it(ops, names, zero_vars, nonzero_vars, eqns, c);
        if (result == "unbounded") {
            return "unbounded";
        }
        if (result == "unbounded large") {
            return "infeasible";
        }
        if (result != "continue") {
            // all initial variables should be zero vars 
            result;
            let opt_value = result[1];
            let opt_point = result[2];
            if (!eq(opt_value[1], zero())) {
                return "infeasible";
            }
            return [opt_value[0], opt_point.slice(0, num_vars)];
        }
    }
}
function point_fill_to_fill(f, points) {
    if (typeof (f) == "string") {
        return f;
    }
    if (f.type == "fill_conic") {
        let p = get_point(points, f.p0);
        if (p == undefined) {
            throw "no point exists " + f.p0;
        }
        return {
            "type": "fill_conic",
            "x": p[0],
            "y": p[1],
            "theta": f.theta,
            "colorstops": f.colorstops
        };
    }
    if (f.type == "fill_linear") {
        let p = [get_point(points, f.p0), get_point(points, f.p1)];
        if (p[0] == undefined) {
            throw "no point exists " + f.p0;
        }
        if (p[1] == undefined) {
            throw "no point exists " + f.p1;
        }
        return {
            "type": "fill_linear",
            "x0": p[0][0],
            "y0": p[0][1],
            "x1": p[1][0],
            "y1": p[1][1],
            "colorstops": f.colorstops
        };
    }
    if (f.type == "fill_radial") {
        let p = [get_point(points, f.p0), get_point(points, f.p1)];
        if (p[0] == undefined) {
            throw "no point exists " + f.p0;
        }
        if (p[1] == undefined) {
            throw "no point exists " + f.p1;
        }
        return {
            "type": "fill_radial",
            "x0": p[0][0],
            "y0": p[0][1],
            "x1": p[1][0],
            "y1": p[1][1],
            "r0": f.r0,
            "r1": f.r1,
            "colorstops": f.colorstops
        };
    }
    return "";
}
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
        let the_s = typeof (item) == "string" ? item : item.name;
        if (seen.has(the_s)) {
            throw "name is not unique " + item;
        }
        seen.add(the_s);
    }
}
function verify(d) {
    // layer and point names
    verify_uniq(d.layers);
    let points = d.points.map(x => x[0]);
    let points_set = new Set(points);
    verify_uniq(points);
    let shapes = [];
    for (let item of Object.keys(d.layer_visibility)) {
        //verify all layers are in visible dict
        let layer = get_layer(d.layers, item);
        if (layer == undefined) {
            throw "layer is undefined " + item;
        }
        for (let shape of layer.shapes) {
            if (shape.parent_layer != layer.name) {
                throw "shape parent layer incorrect " + shape.name;
            }
            shapes.push(shape);
        }
    }
    //verify shapes 
    verify_uniq(shapes);
    for (let shape of shapes) {
        for (let point of get_points(shape)) {
            if (!points_set.has(point)) {
                throw "shape has invalid point " + point;
            }
        }
    }
}
// for displaying in game
// this is really ugly / duplicated code and could be cleaned up but I'm too lazy
function output(d, ignore_exceptions = false) {
    let result = [];
    for (let layer of d.layers) {
        let layer_name = layer.name;
        if (layer == undefined || d.layer_visibility[layer_name] == false) {
            continue;
        }
        for (let shape of layer.shapes) {
            let points = shape.points.map(([p, o1, o2]) => lincomb(1, get_point(d.points, p) ?? [0, 0], 1, [o1, o2]));
            if (shape.visible == false) {
                continue;
            }
            switch (shape.type) {
                case "line":
                    if (shape.outline_visible == false) {
                        continue;
                    }
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
                    if (shape.outline_visible == false) {
                        continue;
                    }
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
                    if (shape.outline_visible == false) {
                        continue;
                    }
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
                    result = result.concat(d_smoothbezier(points, false, false).map(x => add_com(x, { "color": shape.outline.color, "width": shape.outline.thickness })));
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
                        cmd.color = point_fill_to_fill(shape.fill, d.points);
                        result.push(cmd);
                    }
                    ;
                    if (shape.outline && shape.outline_visible) {
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
                        cmd3.color = point_fill_to_fill(shape.fill, d.points);
                        result.push(cmd3);
                    }
                    ;
                    if (shape.outline && shape.outline_visible) {
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
                        cmd5.color = point_fill_to_fill(shape.fill, d.points);
                        result.push(cmd5);
                    }
                    ;
                    if (shape.outline && shape.outline_visible) {
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
                    let cmd7 = d_smoothbezier(pts2, true, true)[0];
                    let cmd8 = d_smoothbezier(pts2, false, true);
                    if (cmd7 == undefined || cmd8 == undefined) {
                        continue;
                    }
                    if (shape.fill) {
                        cmd7.color = point_fill_to_fill(shape.fill, d.points);
                        result.push(cmd7);
                    }
                    ;
                    if (shape.outline && shape.outline_visible) {
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
//get points of shape
// TODO: maybe we don't need this function
function get_points(s) {
    let set = new Set(s.points.map(x => x[0]));
    if (s.fill && typeof (s.fill) != "string") {
        if (s.fill.p0 != undefined) {
            set.add(s.fill.p0);
        }
        if (s.fill.type != "fill_conic") {
            set.add(s.fill.p1);
        }
    }
    return set;
}
function get_visible_points(d) {
    if (d.show_points == "none") {
        return new Set();
    }
    if (d.show_points == "shape") {
        let [shape, layer] = list_shapes(d)[d.selected_shape ?? Math.random().toString()] ?? [undefined, undefined];
        if (shape != undefined && shape.visible) {
            return get_points(shape);
        }
    }
    if (d.show_points == "layer") {
        let layer = get_layer(d.layers, d.selected_layer);
        if (layer == undefined) {
            return new Set();
        }
        return layer.shapes.filter(x => x.visible).map(x => get_points(x)).reduce((x, y) => { x = x.union(y); return x; }, new Set());
    }
    if (d.show_points == "all") {
        return flatten(d.layers.filter(x => d.layer_visibility[x.name] == true).map(x => x.shapes)).filter(x => x.visible).reduce((x, y) => { x = x.union(get_points(y)); return x; }, new Set());
    }
    return new Set();
}
function output_draw(d, ignore_zoom = false) {
    // draw the shapes
    let shapes = output(d, true);
    let points_dict = d.points.reduce((prev, next) => { prev[next[0]] = [next[1], next[2]]; return prev; }, {});
    let visible_points = get_visible_points(d);
    //draw the points 
    if (d.show_points) {
        for (let l of d.layers) {
            if (d.layer_visibility[l.name] == false) {
                continue;
            }
            for (let s of l.shapes) {
                if (s.visible == false) {
                    continue;
                }
                // black darkyellow green  : shape points
                // selected : red
                // fillstyle : blue
                // color, position , name of point (for selection purposes)
                let points_lst = [];
                for (let [i, [p, o1, o2]] of s.points.entries()) {
                    points_lst.push([["black", "#cccc00", "green"][i % 3], points_dict[p][0], points_dict[p][1], p]);
                    if (o1 != 0 || o2 != 0) {
                        if (d.true_points) {
                            // draw true point location 
                            points_lst.push(["purple", points_dict[p][0] + o1, points_dict[p][1] + o2, p]);
                            shapes.push(add_com(d_line(points_dict[p], lincomb(1, points_dict[p], 1, [o1, o2])), { "color": "purple" }));
                        }
                    }
                }
                if (s.fill && typeof (s.fill) != "string") {
                    let p = s.fill.p0;
                    points_lst.push(["blue", points_dict[p][0], points_dict[p][1], p]);
                    if (s.fill.type != "fill_conic") {
                        let p = s.fill.p1;
                        points_lst.push(["blue", points_dict[p][0], points_dict[p][1], p]);
                    }
                }
                let i = 1;
                for (let [color, x, y, name] of points_lst) {
                    if (!visible_points.has(name)) {
                        continue;
                    }
                    let selected = (name == d.selected_point);
                    shapes.push(add_com(d_circle([x, y], selected ? 5 / d.zoom[2] : 3 / d.zoom[2]), { "color": selected ? "red" : color, "fill": true }));
                    if (d.show_labels) {
                        // for shapes , show in increasing orde 
                        if (d.show_points == "shape") {
                            shapes.push(add_com(d_text(i.toString(), lincomb(1 / d.zoom[2], [4, 4], 1, [x, y])), { "color": "black", "size": 15 }));
                            i++;
                        }
                    }
                }
            }
        }
    }
    if (ignore_zoom) {
        return shapes;
    }
    shapes = shapes.map(x => scale_command(displace_command(x, [-d.zoom[0], -d.zoom[1]]), [0, 0], d.zoom[2], d.zoom[2]));
    return shapes;
}
// returns (shape, layer)
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
    let shape = list_shapes(display)[display.selected_shape][0];
    if (!shape.visible) {
        return false;
    }
    return display.layer_visibility[shape.parent_layer];
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
            let tcdist = taxicab_dist(p, [x, y]);
            if (tcdist > min) {
                continue; // minor optimization
            }
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
function change_tags(d, shape, tags) {
    let shape_obj = list_shapes(d)[shape];
    if (shape_obj != undefined) {
        shape_obj[0].tag = tags.split("|").map(x => x.trim());
    }
}
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
            for (let shape of layer.shapes) {
                shape.parent_layer = layer_new;
            }
        }
    }
}
function add_unassociated_point(d, p) {
    let name = d.total_points.toString();
    d.points.push([name, p[0], p[1]]);
    d.total_points++;
    return name;
}
//create a new point and add it to the current shape
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
    if (shape.insertion_point == undefined) {
        shape.points.push([name, 0, 0]);
    }
    else {
        let index = shape.points.map(x => x[0]).indexOf(shape.insertion_point);
        if (index != -1) {
            shape.points.splice(index + 1, 0, [name, 0, 0]);
        }
        shape.insertion_point = name;
    }
    return name;
}
// add existing point to selected shape 
function add_point_s(d, layer, shape, point) {
    if (!selected_shape_visible(d)) {
        d.message = "selected shape is not visible";
        return;
    }
    let layer_obj = get_layer(d.layers, layer);
    if (layer_obj != undefined) {
        let shape_obj = get_shape(layer_obj.shapes, shape);
        if (shape_obj != undefined) {
            if (shape_obj.insertion_point == undefined) {
                shape_obj.points.push([point, 0, 0]);
            }
            else {
                let index = shape_obj.points.map(x => x[0]).indexOf(shape_obj.insertion_point);
                if (index != -1) {
                    shape_obj.points.splice(index + 1, 0, [point, 0, 0]);
                }
                shape_obj.insertion_point = point;
            }
        }
    }
}
function set_points_s(d, shape, points) {
    let points_dict = d.points.reduce((prev, next) => { prev[next[0]] = [next[1], next[2]]; return prev; }, {});
    for (let point of points) {
        if (points_dict[point[0]] == undefined) {
            throw "no point exists ";
        }
    }
    list_shapes(d)[shape][0].points = points;
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
    if (data == "default1") {
        data = { "type": "fill_linear", "p0": shape.points[0][0], "p1": shape.points[1][0], "colorstops": [[0, "blue"], [1, "red"]] };
    }
    if (data == "default2") {
        data = { "type": "fill_radial", "p0": shape.points[0][0], "p1": shape.points[0][0], "r0": 0, "r1": 100, "colorstops": [[0, "blue"], [1, "red"]] };
    }
    if (data == "default3") {
        data = { "type": "fill_conic", "p0": shape.points[0][0], "theta": 0, "colorstops": [[0, "blue"], [1, "red"]] };
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
    let shape = { "parent_layer": layer, "type": type, "points": [], "name": name, "outline_visible": true, "visible": true, tag: [] };
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
        shape.points.push([new_point, 0, 0]);
    }
    d.selected_point = undefined;
    return name;
}
function clone_layer(d, l) {
    let layer = get_layer(d.layers, l);
    let layers = new Set(d.layers.map(x => x.name));
    if (layer != undefined) {
        let new_name = l + " (clone)";
        while (layers.has(new_name)) {
            new_name += ",";
        }
        let new_layer = { "name": new_name, "shapes": [] };
        for (let shape of layer.shapes) {
            let new_shape = clone_shape(d, shape.name, false);
            if (new_shape != undefined) {
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
function clone_shape(d, shape_name, add_to_layer = true) {
    let s = list_shapes(d)[shape_name];
    let points_dict = d.points.reduce((prev, next) => { prev[next[0]] = [next[1], next[2]]; return prev; }, {});
    if (s != undefined) {
        let [shape, layer] = s;
        let layer_obj = get_layer(d.layers, layer);
        if (layer_obj != undefined) {
            let new_shape = JSON.parse(JSON.stringify(shape));
            new_shape.name = new_shape.name + " (clone)";
            while (list_shapes(d)[new_shape.name] != undefined) {
                new_shape.name = new_shape.name + ",";
            }
            if (add_to_layer) {
                layer_obj.shapes.push(new_shape);
            }
            // clone the points
            for (let [i, p] of new_shape.points.entries()) {
                new_shape.points[i] = [add_unassociated_point(d, points_dict[p[0]]), p[1], p[2]];
            }
            if (new_shape.fill && typeof (new_shape.fill) != "string") {
                new_shape.fill.p0 = add_unassociated_point(d, points_dict[new_shape.fill.p0]);
                if (new_shape.fill.type != "fill_conic") {
                    new_shape.fill.p1 = add_unassociated_point(d, points_dict[new_shape.fill.p1]);
                }
            }
            d.selected_shape = new_shape.name;
            return new_shape;
        }
    }
}
// applies to selected shape or layer
function apply_matrix3(d, mat, scope) {
    let points_to_affect;
    if (scope === "shape") {
        const selectedShapeKey = d.selected_shape ?? Math.random().toString();
        const shapeEntry = list_shapes(d)[selectedShapeKey]?.[0] ?? { type: "line", points: [] };
        points_to_affect = get_points(shapeEntry);
    }
    else if (scope === "layer") {
        const layer = get_layer(d.layers, d.selected_layer);
        const shapes = layer?.shapes ?? [];
        points_to_affect = shapes.reduce((acc, shape) => {
            return acc.union(get_points(shape));
        }, new Set());
    }
    else if (scope === "all") {
        points_to_affect = new Set(d.points.map(x => x[0]));
    }
    else if (scope[1] === "layer") {
        const layers = scope[0].map(x => get_layer(d.layers, x.trim())?.shapes ?? []);
        const shapes = flatten(layers);
        points_to_affect = shapes.map(get_points).reduce((acc, pts) => {
            return acc.union(pts);
        }, new Set());
    }
    else if (scope[1] === "tag") {
        const allShapes = Object.values(list_shapes(d));
        const matchingShapes = allShapes.filter(([shape, _]) => scope[0].map(x => x.trim()).some(tag => shape.tag.indexOf(tag) !== -1));
        points_to_affect = matchingShapes.reduce((acc, [shape, _]) => {
            return acc.union(get_points(shape));
        }, new Set());
    }
    else {
        points_to_affect = new Set(scope[0].map(x => x.trim()));
    }
    // don't question it
    //    let points_to_affect : Set<string> = scope == "shape" ? get_points(list_shapes(d)[d.selected_shape ?? Math.random().toString()]?.[0]  ?? {type:"line", points:[]}) : (scope == "layer" ? (get_layer(d.layers, d.selected_layer)?.shapes ?? []).reduce((x : Set<string> , y : shape) => {x=x.union(get_points(y)); return x;} , new Set()) : (scope == "all" ? new Set(d.points.map(x => x[0])) : (scope[1] == "layer" ? flatten(scope[0].map(x => get_layer(d.layers, x)?.shapes ?? [])).map(x => get_points(x)).reduce((x : Set<string>, y : Set<string>) => {x = x.union(y); return x}, new Set()) : ( scope[1] == "tag" ? Object.values(list_shapes(d)).filter(x => _.some(scope[0], y =>  x[0].tag.indexOf(y) != -1)).reduce((x : Set<string>,y:[shape, string]) => x = x.union(get_points(y[0])), new Set()) : new Set(scope[0]))   )));
    for (let [i, pt] of d.points.entries()) {
        if (points_to_affect.has(pt[0])) {
            let result = Mv(mat, [pt[1], pt[2], 1]);
            result = scalar_multiple(1 / result[2], result);
            d.points[i][1] = result[0];
            d.points[i][2] = result[1];
        }
    }
}
function move_shape(d, shape_name, target_layer) {
    let s = list_shapes(d)[shape_name];
    if (s != undefined) {
        let [shape, layer] = s;
        if (layer == target_layer) {
            return;
        }
        let layer_obj = get_layer(d.layers, layer);
        let new_layer_obj = get_layer(d.layers, target_layer);
        if (layer_obj == undefined || new_layer_obj == undefined) {
            return;
        }
        // remove from old layer  
        layer_obj.shapes = layer_obj.shapes.filter(x => x.name != shape_name);
        // add to new layer
        shape.parent_layer = target_layer;
        new_layer_obj.shapes.push(shape);
    }
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
    let layer_obj = get_layer(d.layers, layer);
    if (layer_obj != undefined) {
        d.selected_layer = layer;
        d.selected_shape = layer_obj.shapes[0]?.name ?? undefined;
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
    if (shape_orig == shape_new) {
        return;
    }
    if (shape_exists(d, shape_new)) {
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
            layer.shapes[i].name = shape_new;
            if (d.selected_shape == shape_orig) {
                d.selected_shape = shape_new;
            }
        }
    }
}
// takes in a SCREEN point
function zoom_scale(d, scale_factor, p) {
    let world_point = screen_to_world(p, d.zoom);
    // do some changes
    // world_to_screen(world_point, d.zoom) = p  
    // let x and y be the old top left, and X, Y be the new ones
    // p[0] / d.zoom[2] + x, p[1] / d.zoom[2] + 1 
    // (p[0] / d.zoom[2] + x - X) * scale_factor * d.zoom[2] = p[0], (p[1] / d.zoom[2] + 1 - Y) * scale_factor * d.zoom[2] = p[1] 
    // solve for X and Y
    //p[0] / d.zoom[2] + x  -p[0]/(scale_factor * d.zoom[2])= 
    let x = d.zoom[0];
    let y = d.zoom[1];
    d.zoom = [p[0] / d.zoom[2] + x - p[0] / (scale_factor * d.zoom[2]), p[1] / d.zoom[2] + y - p[1] / (scale_factor * d.zoom[2]), d.zoom[2] * scale_factor];
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
let base_display = {
    "points": [],
    "layers": [{ "name": "base", "shapes": [] }],
    "zoom": [0, 0, 1],
    "layer_visibility": { "base": true },
    show_points: "all",
    show_labels: false,
    selected_layer: "base",
    total_points: 0,
    total_shapes: 0,
    message: "",
    true_points: true
};
let display = JSON.parse(JSON.stringify(base_display));
let history = [];
let redo_lst = [];
function undo() {
    let zoom = JSON.parse(JSON.stringify(display.zoom));
    if (history.length == 0) {
        return;
    }
    redo_lst.push(history.pop());
    display = history[history.length - 1];
    display = JSON.parse(JSON.stringify(display));
    display.zoom = zoom;
}
function redo() {
    if (redo_lst.length == 0) {
        return;
    }
    let zoom = JSON.parse(JSON.stringify(display.zoom));
    display = redo_lst.pop();
    history.push(display);
    display = JSON.parse(JSON.stringify(display));
    display.zoom = zoom;
}
function change(canvas_only = false) {
    history.push(JSON.parse(JSON.stringify(display)));
    if (history.length > 100) {
        history.shift();
    }
    redo_lst = [];
    draw_all(canvas_only);
}
function draw_all(canvas_only = false) {
    verify(display);
    document.getElementById("bigc").getContext("2d")?.clearRect(0, 0, 3333, 3333);
    draw_wrap(output_draw(display), document.getElementById("bigc").getContext("2d"));
    if (canvas_only) {
        return;
    }
    document.getElementById("outputted total").value = JSON.stringify(display);
    //side stuff
    document.getElementById("frames").innerHTML = "";
    document.getElementById("frames2").innerHTML = "";
    document.getElementById("frames3").innerHTML = "";
    // layers 
    document.getElementById("frames").innerHTML = "<b>LAYER</b><br />";
    for (let [i, layer] of display.layers.entries()) {
        document.getElementById("frames").innerHTML += `<div ${layer.name
            == display.selected_layer ? "style=\"background-color:lightblue;\"" : ""}><input type="text" style="width:110" value="${layer.name}" onChange="rename_layer(display, '${layer.name}', arguments[0].target.value);change();" /><button onClick="select_layer(display,'${layer.name}');change();">Select</button>
<button onClick="display.layer_visibility['${layer.name}'] = !display.layer_visibility['${layer.name}'] ;change();">${display.layer_visibility[layer.name] ? "vis" : "invis"}</button>${layer.shapes.length}
<br /><button onClick="shift_lst(display.layers, ${i}, false);change()">up</button>
<button onClick="shift_lst(display.layers, ${i}, true);change()">down</button>
<button onClick="move_shape(display, display.selected_shape, '${layer.name}'); display.selected_shape= get_layer(display.layers, display.selected_layer).shapes[${i}]?.name; change(); ">Move shape</button>
<button onClick="display.layers.splice(${i}, 1);delete display.layer_visibility['${layer.name}'];change();">Delete</button>
<button onClick="clone_layer(display, '${layer.name}');change();">Clone</button>
<br /></div>
`;
    }
    document.getElementById("frames").innerHTML += `<br />.<br /><input type="text" id="add_new" /> <button onClick="add_layer(display, document.getElementById('add_new').value);change(); ">Add</button>
<br />`;
    //SHAPES IN LAYER
    document.getElementById("frames2").innerHTML += `<b>SHAPES IN LAYER ${display.selected_layer}</b>`;
    for (let [i, shape] of (get_layer(display.layers, display.selected_layer)?.shapes ?? []).entries()) {
        document.getElementById("frames2").innerHTML += `<div ${shape.name
            == display.selected_shape ? "style=\"background-color:lightblue;\"" : ""}>${shape.name} : ${shape.type} <br /><button onClick="select_shape(display, '${shape.name}') ; change();">Select</button>
<button onClick="clone_shape(display, '${shape.name}');change();">Clone</button>
<button onClick="remove_shape(display, '${shape.name}'); change();">Delete</button>
 
<button onClick="shift_lst(get_layer(display.layers, display.selected_layer)?.shapes, ${i}, false);change()">  up</button>
<button onClick="shift_lst(get_layer(display.layers, display.selected_layer).shapes, ${i}, true);change()">  down</button><button onClick="let x = list_shapes(display)['${shape.name}'][0]; x.visible = !x.visible; change();">${shape.visible ? "visible" : "invisible"}</button> </div><br />`;
    }
    //SELECTED SHAPE
    let points_dict = display.points.reduce((prev, curr) => { prev[curr[0]] = [curr[1], curr[2]]; return prev; }, {});
    if (display.selected_shape != undefined) {
        let selected_shape = list_shapes(display)[display.selected_shape][0];
        if (selected_shape != undefined) {
            //shape stuff
            document.getElementById("frames3").innerHTML = `<div><input type="text" id="shape_name" value="${selected_shape.name}" onChange="rename_shape(display, display.selected_shape, document.getElementById('shape_name').value);change();"/> <br /> ${selected_shape.type} <select id="shape_types_dropdown" onChange ="list_shapes(display)[display.selected_shape][0].type = document.getElementById('shape_types_dropdown').selectedOptions[0].innerText; change()" ><option>line</option>
<option>bezier</option>
<option>smooth bezier</option>
<option>polygon</option>
<option>circle</option>
<option>bezier shape</option>
<option>smooth bezier shape</option> </select> <br /> ${selected_shape.visible ? "visible" : "invisible"} <button onClick="let x = list_shapes(display)['${selected_shape.name}'][0]; x.visible =!x.visible;change()">Toggle visible</button><br />`;
            //outline
            document.getElementById("frames3").innerHTML += `<br /><b> OUTLINE ${selected_shape.outline_visible ? "" : " (invis)"}</b><br />`;
            if (selected_shape.outline != undefined) {
                document.getElementById("frames3").innerHTML += `<textarea id="${selected_shape.name} outline">${JSON.stringify(selected_shape.outline)}</textarea><br /><button onClick="set_outline(display, '${selected_shape.name}', JSON.parse(document.getElementById('${selected_shape.name} outline').value));change();">Set outline</button>
<br /><button onClick="let x = list_shapes(display)['${selected_shape.name}'][0]; x.outline_visible = !x.outline_visible; change();">Toggle outline</button><button onClick="set_outline(display, '${selected_shape.name}', undefined);change();">Remove outline</button>
`;
            }
            else {
                document.getElementById("frames3").innerHTML += `<button onClick="set_outline(display,'${selected_shape.name}', {'thickness':1,'color':'black'});change();">Add outline</button>
`;
            }
            // fillstyle
            document.getElementById("frames3").innerHTML += "<br /><b> FILLSTYLE</b><br />";
            if (selected_shape.fill != undefined) {
                document.getElementById("frames3").innerHTML += `<textarea id="${selected_shape.name} fillstyle">${JSON.stringify(selected_shape.fill)}</textarea><br /><button onClick="fillstyle_check('${selected_shape.name}', document.getElementById('${selected_shape.name} fillstyle').value);">Set fillstyle</button>
<br /><button onClick="set_fillstyle(display, '${selected_shape.name}', undefined);change();">Remove fillstyle</button>
`;
            }
            else {
                document.getElementById("frames3").innerHTML += `<button onClick="set_fillstyle(display,'${selected_shape.name}', 'black');change();">Add fillstyle</button>
<br />`;
                document.getElementById("frames3").innerHTML += `<button onClick="set_fillstyle(display,'${selected_shape.name}', 'default1');change();">Add linear fillstyle</button>
<br />`;
                document.getElementById("frames3").innerHTML += `<button onClick="set_fillstyle(display,'${selected_shape.name}', 'default2');change();">Add radial fillstyle</button>
<br />`;
                document.getElementById("frames3").innerHTML += `<button onClick="set_fillstyle(display,'${selected_shape.name}', 'default3');change();">Add conic fillstyle</button>
<br />`;
            }
            document.getElementById("frames3").innerHTML += "<br /><b> TAGS</b><br />";
            //tags
            document.getElementById("frames3").innerHTML += "<br />Separate tags by \"|\"<br />";
            document.getElementById("frames3").innerHTML += `<textarea onChange="change_tags(display, '${selected_shape.name}', document.getElementById('tags_obj').value)" id="tags_obj">${selected_shape.tag.join("|")}</textarea>`;
            document.getElementById("frames3").innerHTML += "<br /><b> POINTS</b><br />";
            // points
            document.getElementById("frames3").innerHTML += `<br /><textarea id=\"points_text\">${JSON.stringify(selected_shape.points)}</textarea><button onClick="try { let x = JSON.parse(document.getElementById('points_text').value); if(window.z.array(window.z.tuple([window.z.string(),window.z.number(), window.z.number()])).safeParse(x).success == false){throw 'not valid points';}; set_points_s(display,'${selected_shape.name}', x); } catch(e){ display.message = e}; change(); ">Set points</button>`;
            document.getElementById("frames3").innerHTML += "<br />";
            for (let [i, [point, o1, o2]] of selected_shape.points.entries()) {
                document.getElementById("frames3").innerHTML += `<span ${selected_shape.insertion_point == point ? "style=\"background-color:lightblue;\"" : (display.selected_point == point ? "style=\"background-color:lightgreen;\"" : "")}>${point} (${points_dict[point][0].toString().substring(0, 6)}, ${points_dict[point][1].toString().substring(0, 6)}) </span> <button onClick="display.selected_point = '${point}';change();">Select</button>
 <button onClick="list_shapes(display)['${selected_shape.name}'][0].points.splice(${i},1);display.selected_point=undefined;change();">Pop</button>`;
                if (point == selected_shape.insertion_point) {
                    document.getElementById("frames3").innerHTML += `<button onClick="list_shapes(display)['${selected_shape.name}'][0].insertion_point = undefined;change();">Clear</button>`;
                }
                else {
                    document.getElementById("frames3").innerHTML += `<button onClick="list_shapes(display)['${selected_shape.name}'][0].insertion_point = '${point}';change();">Insert</button>`;
                }
                document.getElementById("frames3").innerHTML += "<br />";
            }
            document.getElementById("frames3").innerHTML += "</div>";
        }
    }
    document.getElementById("message").innerHTML = display.message;
}
function screen_to_world(p, factor) {
    return [p[0] / factor[2] + factor[0], p[1] / factor[2] + factor[1]];
}
function world_to_screen(p, factor) {
    return [(p[0] - factor[0]) * factor[2], (p[1] - factor[1]) * factor[2]];
}
function click(point, control_flag = false) {
    point = screen_to_world(point, display.zoom);
    // move a point
    if (display.selected_point != undefined) {
        if (control_flag == false) {
            move_point(display, display.selected_point, point);
        }
        else {
            // displace without moving
            let base_point = get_point(display.points, display.selected_point);
            if (base_point == undefined) {
                return;
            }
            let shape = list_shapes(display)[display.selected_shape ?? "adjlkadjaklsdjaslkdj"];
            if (shape == undefined) {
                return;
            }
            let index = shape[0].points.map(x => x[0]).indexOf(display.selected_point);
            if (index == -1) {
                return undefined;
            }
            shape[0].points[index][1] = lincomb(1, point, -1, base_point)[0];
            shape[0].points[index][2] = lincomb(1, point, -1, base_point)[1];
        }
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
    key = key.toLowerCase();
    point = screen_to_world(point, display.zoom);
    display.message = "";
    let canvas_only = false;
    if (key == "`") {
        document.getElementById("bigc").focus();
        canvas_only = true;
    }
    else if (key == "q") { //select point
        let closest = get_closest_point(display, point, true);
        if (closest != "") {
            display.selected_point = closest;
        }
    }
    else if (key == "e") { //unselect point 
        if (display.selected_point == undefined) {
            display.selected_shape = undefined;
        }
        display.selected_point = undefined;
        canvas_only = true;
    }
    else if (key == "r") { // add existing point to shape
        if (!selected_shape_visible(display)) {
            display.message = "no shape selected or selected shape is not visible";
            return; // don't do anything if shape is not visible 
        }
        let closest = display.selected_point ?? get_closest_point(display, point, true);
        if (closest != "") {
            if (display.selected_shape != undefined) {
                let [shape, layer] = list_shapes(display)[display.selected_shape];
                shape.points.push([closest, 0, 0]);
            }
        }
    }
    else if (key == "f") { // pop point from shape
        if (display.selected_shape != undefined) {
            pop_point_s(display, display.selected_layer, display.selected_shape);
        }
    }
    else if (key == " ") { // focus
        let points_dict = display.points.reduce((prev, curr) => { prev[curr[0]] = [curr[1], curr[2]]; return prev; }, {});
        if (display.selected_shape == undefined) {
            return;
        }
        let shape = list_shapes(display)[display.selected_shape]?.[0];
        if (shape != undefined) {
            let pts = shape.points.map(x => points_dict[x[0]]);
            display.zoom = [_.min(pts.map(x => x[0])) ?? 0, _.min(pts.map(x => x[1])) ?? 0, display.zoom[2]];
        }
        canvas_only = true;
    }
    else if (key == "t" && display.selected_point != undefined && display.selected_shape != undefined) {
        list_shapes(display)[display.selected_shape][0].insertion_point = display.selected_point;
    }
    else if (key == "g" && display.selected_shape != undefined) {
        list_shapes(display)[display.selected_shape][0].insertion_point = undefined;
    }
    // fillstyle points
    else if ("zxcv".indexOf(key) != -1) {
        if (!selected_shape_visible(display)) {
            display.message = "selected shape is not visible";
            return;
        }
        if (display.selected_shape == undefined) {
            display.message = "no shape selected";
            return;
        }
        let [shape, layer] = list_shapes(display)[display.selected_shape];
        if (shape.fill == undefined || typeof (shape.fill) == "string") {
            display.message = "selected shape fillstyle does not support points";
        }
        else {
            // end of error checking
            if (key == "z") {
                shape.fill.p0 = add_unassociated_point(display, point);
            }
            if (key == "x") {
                shape.fill.p0 = get_closest_point(display, point);
            }
            if (shape.fill.type != "fill_conic") {
                if (key == "c") {
                    shape.fill.p1 = add_unassociated_point(display, point);
                }
                if (key == "v") {
                    shape.fill.p1 = get_closest_point(display, point);
                }
            }
        }
    }
    // add shapes : 
    else if (key == "1") {
        add_new_shape(display, display.selected_layer, "line", point);
    }
    else if (key == "2") {
        add_new_shape(display, display.selected_layer, "bezier", point);
    }
    else if (key == "3") {
        add_new_shape(display, display.selected_layer, "smooth bezier", point);
    }
    else if (key == "4") {
        add_new_shape(display, display.selected_layer, "polygon", point);
    }
    else if (key == "5") {
        add_new_shape(display, display.selected_layer, "circle", point);
    }
    else if (key == "6") {
        add_new_shape(display, display.selected_layer, "bezier shape", point);
    }
    else if (key == "7") {
        add_new_shape(display, display.selected_layer, "smooth bezier shape", point);
    }
    else {
        // nothing changed, don't call change
        return;
    }
    change(canvas_only);
}
// takes in screen point
function scroll_wheel(point, up) {
    let world_point = screen_to_world([point[0], point[1]], display.zoom);
    zoom_scale(display, up ? 1.2 : 1 / 1.2, point);
    let new_point = world_to_screen(world_point, display.zoom);
    if (dist(point, new_point) > 3) {
        throw "scrolling failed, not a fixed point";
    }
    draw_all(true);
}
function move_points_in_shape(d, shape, amt) {
    let shape_obj = list_shapes(d)[shape][0];
    let to_move = get_points(shape_obj);
    for (let [i, pt] of display.points.entries()) {
        if (to_move.has(pt[0])) {
            display.points[i][1] += amt[0];
            display.points[i][2] += amt[1];
        }
    }
}
function scroll_key(what, direction) {
    if (what == "screen") {
        display.zoom = lincomb(1, display.zoom, 1, [direction[0], direction[1], 0]);
    }
    if (what == "layer") {
        for (let shape of get_layer(display.layers, display.selected_layer).shapes) {
            move_points_in_shape(display, shape.name, direction);
        }
    }
    if (what == "shape" && display.selected_shape != undefined) {
        move_points_in_shape(display, display.selected_shape, direction);
    }
    draw_all(true);
}
