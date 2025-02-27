import subprocess
for item in ["canvasDrawing.js", "process_draws.js", "lines.js"]:
    item2 = item.replace("js", "ts")
    x = subprocess.Popen(f"tsc -t esnext --module amd -outFile {item} ../src/{item2}".split(" "), shell=True,stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    out,err = x.communicate()
input("all done")
