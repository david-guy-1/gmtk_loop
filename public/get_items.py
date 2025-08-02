import os
lst = []
for [path, dirnames, filenames] in os.walk(os.getcwd()):
    for name in filenames:
        if(".png" in name or ".jpg" in name or ".svg" in name):
            lst.append(path.replace("\\", "/") + "/" + name)
for item in lst:           
    print('loadImage("-");'.replace("-", item).replace(os.getcwd().replace("\\", "/") + "/", ""))