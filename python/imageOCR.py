# import os
import fileinput
import json
from PIL import Image
from functions import handleImageOCR
import pytesseract

# Gets params from node file
for line in fileinput.input():

    path=json.loads(line.rstrip())
    print(path,"========0")
    # handleImageOCR(json.loads(line.rstrip()))
    
    # result =path  +"=="

    # try:
    #   image= Image.open(path)
    #   result+=  pytesseract.image_to_string(image)

    # finally:
    #   print(result)

    pass

# handleOCR("temp/document/6002/1639462175021-123.jpg")
