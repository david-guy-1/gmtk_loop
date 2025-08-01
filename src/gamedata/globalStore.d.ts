import { img_with_center } from "../process_draws";
import {point} from "../interfaces";

type globalStore_type = {
    screen : string
    death_anim : string // which death anim is currently playing?
    loaded_imgs : Record<string, img_with_center>
    enter_demon_room? : number 
    anim_time ?: number
}
