
import fileinput
import json
from functions import handlePdfOCR

# # Gets params from node file
for line in fileinput.input():
    handlePdfOCR(
        json.loads(line.rstrip())
    )
    pass
