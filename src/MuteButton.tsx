import { useState } from "react";
import { getMuted, setMuted } from "./Sound";

function MuteButton(props : {x : number, y : number}){
    let [mute, setMute] = useState(getMuted()); 
    return <img src={mute ? "mute2.png" : "mute.png"} style={{zIndex:999, position:"absolute", top:props.y , left:props.x}} onClick={() => {setMuted(!mute); setMute(!mute);} }></img>
}

export default MuteButton;