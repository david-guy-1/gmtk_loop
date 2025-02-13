import { animation } from "./animations";

export type events =  any 

export interface game_interface{ // just the model
    tick : () => events,
}



export type draw_fn_type = (g : any, events : any[] , canvas : string) => draw_command[];
export type anim_fn_type = (g : any, events : any[] ) => animation[];
export type sound_fn_type = (g : any, events : any[] ) => [string | undefined, string[]]; // undefined = do not change, "mute" : nothing 


