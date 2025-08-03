from pydub import AudioSegment
from pydub.playback import play
import playsound
import os
import os.path
import copy

lst = os.listdir(os.getcwd())
for item in lst:
#    if(".mp3" in item and "Copy" not in item):
     if(".wav" in item):
        sound = AudioSegment.from_file(item)
        sound -= 6
        file_handle = sound.export(item, format="wav")
