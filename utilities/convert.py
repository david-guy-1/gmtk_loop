import subprocess
import os
print(os.getcwd())
for item in ["canvasDrawing.js", "process_draws.js", "lines.js", "draw_stuff.js"]:
    item2 = item.replace("js", "ts")
    if(item2 == "draw_stuff.ts"):
        data = open(f"{item2}", "r").read().replace("export", "").replace("import", "//import")
    else:
        data = open(f"../src/{item2}", "r").read().replace("export", "").replace("import", "//import")
    open("a.ts", "w").write(data)
    x = subprocess.Popen(f"tsc -t esnext --module amd -outFile {item} a.ts".split(" "), shell=True,stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    out,err = x.communicate()
    os.remove("a.ts")

    
print("all done")
