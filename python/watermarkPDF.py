
import fileinput
import json
from functions import handleWatermarkPDF

# # Gets params from node file
for line in fileinput.input():
    handleWatermarkPDF(
       data=json.loads(line.rstrip())
    )
    pass
