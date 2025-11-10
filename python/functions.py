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

# location of tesseract ocr
pytesseract.pytesseract.tesseract_cmd=r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

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

# Image ocR
def handleOCR(path):
  image= Image.open(path)
  config = ('-l eng --oem 1 --psm 1')
  result=  pytesseract.image_to_string(image, lang="eng")
  print(result)

############################
# PDF
############################

""" OCR Pdf """
def handleOCRPDF(pdf_file):
  images=pdf2image.convert_from_path(pdf_file)
  for pg, img in enumerate(images):
    result = pytesseract.image_to_string(img)
  return result

# Watermark with dymanic text
def textWatermarkPDF(data):
    text = data.get('email', '')
    # Example: data might contain 'createdAt'
    # created_at_str = data.get('createdAt')
 
    # if created_at_str:
    #  # Parse ISO format and format as "YYYY-MM-DD HH:MM"
    #   dt = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
    #   timestamp = dt.strftime('%Y-%m-%d %H:%M')  # includes time
    # else:
    timestamp = datetime.today().strftime('%Y-%m-%d %H: %M')  # only date    input_pdf = data['local']
 
    input_pdf = data['local']
    picture_path = data.get('logo', None)
 
    os.makedirs('temp/watermark', exist_ok=True)
    watermark_pdf = f'temp/watermark/watermark_{text}.pdf'
 
    # Define page size (A4)
    page_width = 595
    page_height = 842
    c = canvas.Canvas(watermark_pdf, pagesize=(page_width, page_height))
 
    # --------------------------
    # Rotated logo (unchanged)
    # --------------------------
    if picture_path:
        c.saveState()
        c.setFillAlpha(0.59)
        c.rotate(45)
        horizontal = 900 / 2 - 200
        vertical = 365 / 2 - 150
        c.drawImage(
            picture_path,
            horizontal,
            vertical,
            width=500,
            height=150,
            mask="auto"
        )
        c.restoreState()
 
    # --------------------------
    # Email + timestamp at bottom-most safe line
    # --------------------------
    if text or timestamp:
        c.setFillAlpha(0.7)
        c.setFont('Helvetica-Bold', 11)
        c.setFillColorRGB(1, 0, 0)
 
        # Place them together on one line, as low as possible
        # Typical printable margin ≈ 10 pts from edge
        bottom_margin = 12  # lower this if you want *even closer* to edge
        line_text = f"{text}  |  {timestamp}"
        c.drawCentredString(page_width / 2, bottom_margin, line_text)
 
    c.save()
 
    # --------------------------
    # Merge watermark with original PDF
    # --------------------------
    inputPdfFile = PdfFileReader(input_pdf)
    watermarkFile = PdfFileReader(watermark_pdf)
    watermark = watermarkFile.getPage(0)
 
    pdf_writer = PdfFileWriter()
 
    for page in range(inputPdfFile.getNumPages()):
        pageToWatermark = inputPdfFile.getPage(page)
        pageToWatermark.mergePage(watermark)
        pdf_writer.addPage(pageToWatermark)
 
    with open(input_pdf, 'wb') as out:
        pdf_writer.write(out)
# Handles Ocr and Watermark
def handleWatermarkAndOCR(input_pdf, watermark_pdf):
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
      result= handleOCRPDF(input_pdf)
      print("image - "+ '  '.join(result.split()))

  # Output file
  with open(input_pdf, 'wb') as out:
    pdf_writer.write(out)



#handle pyOCR
def pdfOCR(input_pdf):
  result="" # ocr result
  inputPdfFile=PdfFileReader(input_pdf)

  for page in range(inputPdfFile.getNumPages()):
    result+= inputPdfFile.getPage(page).extractText() + " "

  # Perform image scan ocr
  if not is_not_blank:
    print("content - "+'  '.join(result.split()))
  else:
    result= handleOCRPDF(input_pdf)
    print("image - "+ '  '.join(result.split()))




