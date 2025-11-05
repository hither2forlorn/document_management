from ftplib import FTP
from PyPDF4 import PdfFileWriter, PdfFileReader
from FTP import HOSTNAME, USERNAME,PASSWORD

## Variable Initialize
filename=''
ftp_server = FTP(HOSTNAME, USERNAME, PASSWORD) # Connect FTP Server
ftp_server.encoding = "utf-8" # force UTF-8 encoding


# Get location of file in FTP
def getLocation(file_path):
      #   Url of FTP
    # file_path='/document/1/1637662471264-Logo.png'

    # Split string to get array
    pathArray= file_path.split('/')

    # cd to file
    for x in range(len(pathArray)-1):
        ftp_server.cwd(pathArray[x])

    # Get file name
    filename=pathArray.pop()

    return filename

def grabFile():
    # Download in root dir
    localfile = open(filename, 'wb')
    ftp_server.retrbinary('RETR ' + filename, localfile.write, 1024)

    # Close the Connection
    # ftp_server.quit()
    localfile.close()

def placeFile():
    ftp_server.dir()
    ftp_server.storbinary('STOR '+filename, open(filename, 'rb'))
    ftp_server.quit()

def handleWatermarkAndOCR(input_pdf, watermark_pdf):
  
  result="" # ocr result

  #initialize files 
  inputPdfFile=PdfFileReader(input_pdf)
  watermarkFile= PdfFileReader(watermark_pdf)

  #get first page of watermark
  watermark= watermarkFile.getPage(0) 

  pdf_writer=PdfFileWriter()

  for page in range(inputPdfFile.getNumPages()):
    result+= inputPdfFile.getPage(page).extractText() + " "
    # Get current page and merge with watermark
    pageToWatermark= inputPdfFile.getPage(page)
    pageToWatermark.mergePage(watermark)
 
    #write or combine pdf 
    pdf_writer.addPage(pageToWatermark)

    # print result
    print('  '.join(result.split()))

  # Output the file
  with open(input_pdf, 'wb') as out:
    pdf_writer.write(out)


file_path='/document/6010/1640513137057-Cream and Green Creative Resume.pdf'

filename=getLocation(file_path)
grabFile()
handleWatermarkAndOCR(
    input_pdf=filename, 
    watermark_pdf='watermark/watermark.pdf'
)
placeFile()



# for line in fileinput.input():
#   print(line.strip())
#   filename=getLocation(line.rstrip())
#   grabFile()
#   handleWatermarkAndOCR(
#       input_pdf=json.loads(line.rstrip()), 
#       watermark_pdf='watermark/watermark.pdf'
#   )
#   placeFile()
#   pass




ftp_server.quit()
