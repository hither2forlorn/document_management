# -----------------------------------------------------------
# Python functions schedular ocr
# 
# INFO:
# Decrypt if data is encrypted
# 
# -----------------------------------------------------------

import fileinput
import json
from FTP import grabFile
from functions import EncryptAndDecrypt,handleOCR,pdfOCR
imageFileOptions = ["image/jpeg", "image/png", "image/jpg"];
pdfOptions = ["application/pdf"];

def ocrAllFiles(attach):
    remote_path=attach['filePath']
    fileType=attach['fileType']
    # Downlaod file from FTP 
    filename=grabFile(remote_path)
    local_path="temp/"+filename

    # Decrypt if file is encrypted
    isEncrypted=attach['isEncrypted']
    if(isEncrypted):
        attach['local']=local_path
        EncryptAndDecrypt(attach)

    #Image OCR
    for imageType in imageFileOptions:
        if imageType == fileType:
            handleOCR(local_path)

    #PDF OCR
    for pdfType in pdfOptions:
        if pdfType == fileType:    
            pdfOCR(local_path)


# Gets params from node file
for line in fileinput.input():
    ocrAllFiles(json.loads(line.rstrip()))
    pass
