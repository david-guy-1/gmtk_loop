
/*
 top left, top right, width, height
*/

type rect = [number, number, number, number]
type display_type = {
    "canvas" : [string, rect][]
    "button" : [string, rect, string, string?][] // third arg is text to display, fourth is image on button
    "image" : [string, number, number][] // images are displayed under all buttons and canvases  
}