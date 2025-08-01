import { drawImage, drawLine, drawCircle, drawPolygon, drawRectangle, drawRectangle2, drawText, drawEllipse, drawEllipseCR, drawEllipse2, drawBezierCurve, drawBezierShape, drawRoundedRectangle } from "./canvasDrawing";
import { point } from "./interfaces";

export function draw(lst : draw_command[], c: React.RefObject<HTMLCanvasElement>){
    if(c.current == null){
        return;
    }
    draw_wrap(lst, c.current.getContext('2d')!);
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
                drawEllipse(c, item.posx,item.posy,item.brx,item.bry,item.color,item.transparency,item.rotate,item.start,item.end, item.fill, item.stroke_width);
            break;
            case "drawEllipseCR":
                drawEllipseCR(c, item.cx,item.cy,item.rx,item.ry,item.color,item.transparency,item.rotate,item.start,item.end, item.fill, item.stroke_width);
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

export function fade(lst : draw_command[], c : React.RefObject<HTMLCanvasElement>,  callback : () => void, color : string = "black", time : number = 0.5, size : point = [1000, 1000]){
    if(c.current == null){
        return;
    }

    fade_wrap(lst, c.current.getContext('2d')!, callback, color, time, size);
}

export function fade_wrap(lst : draw_command[], c : CanvasRenderingContext2D,  callback : () => void, color : string = "black", time : number = 0.5, size : point = [1000, 1000]){
    // draw black 20 times, then draw the thing 20 times; 
    let interval = setInterval(function(this : [number]){
        this[0]++;
        if(this[0] == 40){
            clearInterval(interval);
        }
        if(this[0] < 20){
            c.globalAlpha = 0.15; 
            c.beginPath();
            c.rect(0, 0, size[0], size[1]);
            c.fillStyle = color;
            c.fill();
        } else if(this[0] <= 39){
            c.clearRect(0,0,size[0] , size[1])
            draw_wrap(lst, c);
            c.globalAlpha = 1 - 0.05*(this[0] - 20);
            c.beginPath();
            c.rect(0, 0, size[0], size[1]);
            c.fillStyle = color;
            c.fill();
        } else {
            c.clearRect(0,0,size[0] , size[1])
            draw_wrap(lst, c);
            callback();
        }
            
    }.bind([0]), time * 1000 / 40)
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

