import os
import pathlib
#get all images in a target folder
extensions = [".jpg", ".png", ".webm"]
target = r"D:\Desktop\games\brackeys\public"
base = pathlib.PurePath(target)
lst = []
for path,folders,files in os.walk(target):
    for file in files:
        good = False
        for ext in extensions:
            if(ext in file):
                good = True
        if(good):
            item = pathlib.PurePath(path + "/" + file).relative_to(base)
            print(item)
            lst.append(str(item).replace("\\","/"))
print(lst)
