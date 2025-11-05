# -----------------------------------------------------------
# Python functions for ocr, encryption, ftp
#
# (C) 2022 Baluwatar, Kathmandu, Nepal
# Released under GNU Public License (GPL)
# email admond@generaltechnology.com.np
# -----------------------------------------------------------

from textwrap import fill
from turtle import fillcolor
import pdf2image
from PyPDF4 import PdfFileWriter, PdfFileReader
import pytesseract
from utils import is_not_blank
from cryptography.fernet import Fernet
from reportlab.pdfgen import canvas
from PIL import Image
import os
from datetime import datetime
import platform

# check os for ocr tesseract path
def get_tesseract_path():
  if platform.system() == 'Windows':
    return 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
  elif platform.system() == 'Linux':
    return '/usr/bin/tesseract'
  elif platform.system() == 'Mac':
    return '/usr/local/bin/tesseract'
  else:
    return 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

# location of tesseract ocr
pytesseract.pytesseract.tesseract_cmd= get_tesseract_path()
# pytesseract.pytesseract.tesseract_cmd=r'/usr/bin/tesseract'
OCR_LENGTH=2000
# for mac
# pytesseract.pytesseract.tesseract_cmd=r'/usr/local/bin/tesseract'

############################
# Encryption
############################

# -----------------------------------------------------------
# {Object - path, key} as params required path from root folders
# Encryct or decrypt file
# -----------------------------------------------------------


def encrypt(data):
    """
    Given a data['local'] (str) and key (bytes), it encrypts the file and write it
    """
    key =data['key']
    f = Fernet(key)
    with open(data['local'], "rb") as file:
        # read all file data
        file_data = file.read()
        encrypted_data = f.encrypt(file_data)
        with open(data['local'], "wb") as file:
            file.write(encrypted_data)


def decrypt(data):
    key =data['key']
    f = Fernet(key)
    with open(data['local'], "rb") as file:
        # read the encrypted data
        encrypted_data = file.read()
    # decrypt data
    decrypted_data = f.decrypt(encrypted_data)
    # write the original file
    with open(data['local'], "wb") as file:
        file.write(decrypted_data)


#byte encryption
def EncryptAndDecrypt(data):
    fin = open(data['local'], 'rb')
    image = fin.read()
    fin.close()
    image = bytearray(image)

    for index, values in enumerate(image):
            image[index] = values ^ 2

    fin = open(data['local'], 'wb')
    fin.write(image)
    fin.truncate()
    fin.close()

    # print("Encryption Sucessful", path['local'])


############################
# Image
############################
""" OCR Image """
def handleImageOCR(data):
  path = data['localPath']

  result =""
  try:
    image=path
    result+=  pytesseract.image_to_string(image)

  finally:
    print("img - "+ ' '.join(result.split()))


############################
# PDF
############################

# previous : images=pdf2image.convert_from_path(pdf_file)
# dpi and poppler_path were added later
""" OCR Pdf """
def util_ocr_pdf(pdf_file):
  images=pdf2image.convert_from_path(pdf_file,500,poppler_path = r'C:\\DMSAPP\\poppler-21.11.0\\Library\\bin')
  result=""
  for pg, img in enumerate(images):
    result += pytesseract.image_to_string(img)
    if(len(result)>OCR_LENGTH):
      return result

  return result


################################
# PDF with text and image watermark
# Image Watermark with dymanic text
################################
def textWatermarkPDF(data):

  text=data['email']
  timestamp=datetime.today().strftime('%Y-%m-%d')
  input_pdf=data['local']
  # can be used but already decrypted in nodejs
  # if data['isEncrypted']:
  #       decrypt(data)

  # create watermark dir if not crated
  if not os.path.exists('temp/watermark'):
    os.makedirs('temp/watermark')

  picture_path= data['logo']
  watermark_pdf='temp/watermark/watermark_'+str(text)+'.pdf'

  c = canvas.Canvas(watermark_pdf)
# posistion
  horizontal=360/2 #-
  vertical=750/2 #|

  if picture_path:
      c.drawImage(picture_path, horizontal, vertical, height=90, width=250,mask="auto")

  if text:
      c.setFontSize(22)
      c.setFont('Helvetica-Bold', 10)
      c.drawString(horizontal+83, vertical-8, text)

  if timestamp:
      c.setFontSize(22)
      c.setFont('Helvetica-Bold', 12)
      c.drawString(horizontal+83, vertical-18, timestamp)
  c.save()


  #initialize files
  inputPdfFile=PdfFileReader(input_pdf)
  watermarkFile= PdfFileReader(watermark_pdf)

  #get first page of watermark
  watermark= watermarkFile.getPage(0)

  pdf_writer=PdfFileWriter()

  for page in range(inputPdfFile.getNumPages()):
    pageToWatermark= inputPdfFile.getPage(page)
    pageToWatermark.mergePage(watermark)

    pdf_writer.addPage(pageToWatermark)

  with open(input_pdf, 'wb') as out:
    pdf_writer.write(out)




################################
# OCR PDF
# Handles Ocr pdf
################################
def handlePdfOCR(data):
  input_pdf = data['localPath']

  result="" # ocr result

  # Results in JPT text , so not in use
  # result = util_ocr_text_pdf(input_pdf)

  result= util_ocr_pdf(input_pdf)
  print("image - "+ ' '.join(result.split()))


############################
# Future use
############################

#util text copy from pdf ocr
# Results in Random text like %$# , so not in use
def util_ocr_text_pdf(input_pdf):
  result="" # ocr result
  inputPdfFile=PdfFileReader(input_pdf)

  for page in range(inputPdfFile.getNumPages()):
    result+= inputPdfFile.getPage(page).extractText() + " "

  return result





################################
# PDF with watermark and ocr
# Handles Ocr and Watermark
################################
def handleWatermarkAndOCR(input_pdf, watermark_pdf):
  print(input_pdf,"========0")

  result="" # ocr result

  #initialize files
  inputPdfFile=PdfFileReader(input_pdf)
  watermarkFile= PdfFileReader(watermark_pdf)

  #get first page of watermark
  watermark= watermarkFile.getPage(0)

  pdf_writer=PdfFileWriter()

  # result=print_pages(input_pdf)
  # print("ressult",result)

  for page in range(inputPdfFile.getNumPages()):
    if(len(result)>=OCR_LENGTH):
      break

    result+= inputPdfFile.getPage(page).extractText() + " "
    # Get current page and merge with watermark
    pageToWatermark= inputPdfFile.getPage(page)
    pageToWatermark.mergePage(watermark)

    #write or combine pdf
    pdf_writer.addPage(pageToWatermark)

  # Perform image scan ocr
  if not is_not_blank:
    print("content - "+'  '.join(result.split()))
  else:
    result= util_ocr_pdf(input_pdf)
    print("image - "+ '  '.join(result.split()))

  # Output file
  with open(input_pdf, 'wb') as out:
    pdf_writer.write(out)

