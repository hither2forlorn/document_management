import fileinput
import json
from functions import decrypt 

# Gets params from node file
for line in fileinput.input():
    decrypt(json.loads(line.rstrip()))
    pass


# path={
#       "remote": "/document/11009/1640851572885-N5ArRHEN7gJRtU87gK1MPE1J.jpg",
#       "local": "temp\\1640851572850-N5ArRHEN7gJRtU87gK1MPE1J.jpg",
#     }

# EncryptAndDecrypt(path)
