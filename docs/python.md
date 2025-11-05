# Python files

## How python files word

- **server side** => dms pull files from server and then perform tasks contains in **functions.py**
- **direct to ftp** => Directly modify in FTP. used for watermark and encryption.

**schedular.js**
[RBB] after document expires document need to be encrypted.

encryptFile.py => call from nodejs application

| S/N | file           | Description                                                                                                                                                                                      |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | function.py    | all execution python script run from function except from ftp files. For example, it doesnot contains file that need to encrypt in ftp server directly. **It is only used on server-side files** |
| 2   | encryptFile.py | call from nodejs application                                                                                                                                                                     |
|     |                |                                                                                                                                                                                                  |
