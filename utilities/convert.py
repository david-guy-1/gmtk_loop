import subprocess
import os
print(os.getcwd())
data = ""

#put all ts files into a single ts file
for item in ["../src/draw_commands.d.ts", "../src/canvasDrawing.ts", "../src/process_draws.ts","../src/rotation.ts", "../src/lines.ts", "draw_stuff.ts"]:
    data += open(item, "r").read().replace("export", "").replace("import", "//import")
    open("a.ts", "w").write(data)
#compile that one single ts file
x = subprocess.Popen(f"tsc -t esnext --module amd -outFile a.js a.ts".split(" "), shell=True,stdin=subprocess.PIPE, stdout=subprocess.PIPE)
out,err = x.communicate()
os.remove("a.ts")

def p(s):
    if(s[0:8] == "function" or s[0:4] == "type"):
        return "export " + s
    else:
        return s
    
#this is just to make vscode happy so it doesn't complain about missing stuff.
lst = []
for item in ["../src/draw_commands.d.ts", "../src/canvasDrawing.ts", "../src/process_draws.ts", "../src/rotation.ts","../src/lines.ts"]:
    lst += open(item, "r").read().splitlines()
with open("a.ts", 'w') as f:
    for i in lst:
        if(i[0:6] != "import"):
            f.write(p(i.strip()) + "\n")
print("all done")
