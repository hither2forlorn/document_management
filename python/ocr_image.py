
import fileinput
import json
from functions import handleImageOCR

# # Gets params from node file
for line in fileinput.input():
    handleImageOCR(
        json.loads(line.rstrip())
    )
    pass
