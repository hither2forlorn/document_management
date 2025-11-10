# import os
import fileinput
import json
from functions import handleOCR

# Gets params from node file
for line in fileinput.input():
    handleOCR(json.loads(line.rstrip()))
    pass

# handleOCR("temp/document/6002/1639462175021-123.jpg")
