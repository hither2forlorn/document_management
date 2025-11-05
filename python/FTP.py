from ftplib import FTP

HOSTNAME = "localhost"
USERNAME = "yourName"
PASSWORD = "yourPass"

## Variable Initialize
filename=''
ftp_server = FTP(HOSTNAME, USERNAME, PASSWORD) # Connect FTP Server
ftp_server.encoding = "utf-8" # force UTF-8 encoding
save_to_local="temp/"

# params {path} ftp path of file
# Downlaod file from ftp
def grabFile(remote_path):
    filename= getLocation(remote_path)
    # Download in root dir
    localfile = open(save_to_local+filename, 'wb')
    ftp_server.retrbinary('RETR ' + filename, localfile.write, 1024)

    # Close the Connection
    ftp_server.quit()
    localfile.close()
    return filename

# params{local,remote} local= location of folder from root, remote = upload location
# Upload file to ftp
def placeFile(local,remote):
    filename= getLocation(remote)

    ftp_server.dir()
    ftp_server.storbinary('STOR '+filename, open(local, 'rb'))
    ftp_server.quit()


#  FTP = cd to the directory of file
#  returns filename
def getLocation(remote_path):
    # Split string to get array
    pathArray= remote_path.split('/')

    # cd to file
    for x in range(len(pathArray)-1):
        ftp_server.cwd(pathArray[x])

    # Get file name
    filename=pathArray.pop()
    return filename


# placeFile("utils/1636612483397-NMBBank_NP.jpg",'/document/1/1636612483397-NMBBank_NP.jpg')
# grabFile('/document/1/1636612483397-NMBBank_NP.jpg')