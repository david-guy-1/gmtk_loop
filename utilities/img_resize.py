#resize images in lst by amount, renames them _resized, in the same folder

import cv2

lst = []
for i in range(5):
    lst.append(rf"D:\Desktop\games\brackeys\public\trees\{i}resized.png")
target_size = (40, 40)

def rename(s):
    index = s.rindex(".")
    return s[0:index] + "trans" + s[index:]
for item in lst:
    image = cv2.imread(item, cv2.IMREAD_UNCHANGED)
    image[...,3] = image[...,3] * 0.5

    cv2.imwrite(rename(item),image)
