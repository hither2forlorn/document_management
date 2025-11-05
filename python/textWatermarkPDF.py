
import fileinput
import json
from functions import textWatermarkPDF

# # Gets params from node file
for line in fileinput.input():
    textWatermarkPDF(
        data=json.loads(line.rstrip())
    )
    pass
