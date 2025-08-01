import React, { useEffect, useRef, useState } from 'react'
import game from './game';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import "./stylesheet.css"
import { draw } from '../process_draws';
import { d_image, d_rect2, d_text } from '../canvasDrawing';
import { pointInsideRectangleWH } from '../lines';

const person_size = [188,444]
const explorer_coords = [50, 300]
const magic_coords = [260, 300]
const tour_coords = [500, 300]

function PointAndClick(props : {g : game, ret : Function}) {
    let g : game = props.g;
    let canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<"town"|"magic"|"tour"|"explorer"|"destroyed">("town")
    const [message, setMessage] = useState<string>("This is a town");
    function click(e : MouseEvent){
        let [x,y] = [e.offsetX, e.offsetY];
        if(mode == "town"){
            if(pointInsideRectangleWH(x, y, explorer_coords, person_size)){
                setMode("explorer")
                setMessage("I'm an explorer")
            }
            if(pointInsideRectangleWH(x, y, magic_coords, person_size)){
                setMode("magic")
                setMessage("I'm a magician")
            }
            if(pointInsideRectangleWH(x, y, tour_coords, person_size)){
                setMode("tour")
                setMessage("I'm a tour guide")
            }
        }
        if(mode == "magic" || mode == "tour" || mode == "explorer"){
            if(pointInsideRectangleWH(x, y, CANVAS_WIDTH-100, CANVAS_HEIGHT-60, 1000, 1000)){   
                setMessage("town");
                setMode("town")
            }
        }
    }
    
    function change(){
        console.log("changed " + mode);
        let lst : draw_command[] = []; 
        switch(mode){
            case "town":
                lst.push(d_image("town/town.png", 0, 0));
                lst.push(d_image("town/explorer.png", explorer_coords));
                lst.push(d_image("town/magician.png",magic_coords));
                lst.push(d_image("town/tour guide.png", tour_coords));
            break
            case "explorer":
                lst.push(d_image("town/town.png", 0, 0));
                lst.push(d_image("town/explorer.png", explorer_coords));

            break
            case "tour":
                lst.push(d_image("town/town.png", 0, 0));

                lst.push(d_image("town/tour guide.png", explorer_coords));
            break
            case "magic":
                lst.push(d_image("town/magic shop.png", 0, 0));
                lst.push(d_image("town/magician.png",explorer_coords));
            break
        }
        if(mode == "magic" || mode == "tour" || mode == "explorer"){
            let rect = d_rect2(CANVAS_WIDTH-100, CANVAS_HEIGHT-60, CANVAS_WIDTH-10, CANVAS_HEIGHT-4); 
            rect.fill = true;
            rect.color = "white"
            lst.push(rect)
            lst.push(d_text("Back", CANVAS_WIDTH-85, CANVAS_HEIGHT-30))
        }
        let rect = d_rect2(50, CANVAS_HEIGHT-60, CANVAS_WIDTH-150, CANVAS_HEIGHT-4); 
        rect.fill = true;
        rect.color = "white"
        lst.push(rect)
        lst.push(d_text(message, 60, CANVAS_HEIGHT-10))
        draw(lst , canvasRef)
    }

    useEffect(function(){
        //componentdidmount
        change(); 
    },[mode, message])
    return (
        <div><canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onClick={e => click(e.nativeEvent)}className="top_left" ref={canvasRef}></canvas>

        <button onClick={() => {g.enter_room("main", [400,400]); props.ret()}}> backIgo</button>
    </div>
    )
}

export default PointAndClick