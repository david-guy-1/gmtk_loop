type eventCall = [(e : any, lst : any ) => any , any]

// register events by putting things in this :
// strings must have mousemove, click, keydown, or keyup in them. 
export var events : Record<string, eventCall> = {};


export var globalStore : Record<string, any> = {};

export function call_mousemove(e : MouseEvent){
    for(var item of Object.keys(events)){
        if(item.indexOf("mousemove") != -1){
            var [fn, params] = events[item];
            fn(e, params); 
        }
    }
}

export function call_click(e : MouseEvent){
    for(var item of Object.keys(events)){
        if(item.indexOf("click") != -1){
            var [fn, params] = events[item];
            fn(e, params); 
        }
    }
}
export function call_keydown(e : KeyboardEvent){
    for(var item of Object.keys(events)){
        if(item.indexOf("keydown") != -1){
            var [fn, params] = events[item];
            fn(e, params); 
        }
    }
}
export function call_keyup(e : KeyboardEvent){
    for(var item of Object.keys(events)){
        if(item.indexOf("keyup") != -1){
            var [fn, params] = events[item];
            fn(e, params); 
        }
    }
}

// call this once
var added = false; 
export function set_events() {
    if(added == false){
        document.addEventListener("mousemove", (e) => call_mousemove(e));
        document.addEventListener("click", (e) => call_click(e));
        document.addEventListener("keydown", (e) => call_keydown(e));
        document.addEventListener("keyup", (e) => call_keyup(e));
    } 
    added = true;
}