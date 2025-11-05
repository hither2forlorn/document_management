# Handles Ocr and Watermark

import fileinput
import json
from functions import handleWatermarkAndOCR


# # Gets params from node file
for line in fileinput.input():
    handleWatermarkAndOCR(
        input_pdf=json.loads(line.rstrip()), 
        watermark_pdf='watermark/watermark.pdf'
    )
    pass


# handleWatermarkAndOCR(
#         input_pdf='temp/sample.pdf', 
#         watermark_pdf='watermark/watermark.pdf'
#     )