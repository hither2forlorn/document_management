# Installation

PaperBank requires [Nodejs 14.4.0](https://nodejs.org/) to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd general-dms-api
$ npm install
```

Create `.env` file similar to `.env.example` and update the credentials before running below command

```sh
$ npm start
```

## Python Encryption

**Python dependencies**

```sh
$ pip install -U -r requirements.txt   or pip3 install -U -r requirements.txt
```

````You might need to update the version of the pip by using
pip install --upgrade pip

**Need to install for OCR**

- ghost script
- tesseract
- pdf2image depends upon poppler python library. Also need to add in window environment.
    (pdf2image is a python library)

    # For placing poppler
        1.  extract the file named Release-21.11.0-0-poppler (which is in Gentech hard disk drive)
        2.  Copy the extracted file and paste it to program file.
        3.  After that navigate to (poppler-21.11.0 > Library > bin) folder and copy the path.
        4.  Paste the copied path to an enviournment variable of windows under the path directory.
        5.  If it doesnot work restart your pc.
 [Downlaod Poppler](https://github.com/oschwartz10612/poppler-windows/releases/)

```sh
$ C:\Program Files\poppler-0.68.0\bin
in some case we can find bin folder  inside the library folder
Release-22.01.0-0\poppler-22.01.0\Library\bin
````

## Download Redis server

- Used for OTP verification.
  [Click to download redis Server](https://github.com/MicrosoftArchive/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.msi)

**For production environments...**
Similar to above but you have to add one extra variable during production i.e.`NODE_ENV = production`

Also, instead of using `npm start` to run the server you'll have to follow some production standard library like `pm2`

[![pm2](https://nodei.co/npm/pm2.png?downloads=true&downloadRank=true)](https://www.npmjs.com/package/pm2)

```sh
$ pm2 start index.js --name <YOUR_PROJECT_NAME|gdms>
```

After the completion of the above tasks you can go to the setup route as below, and set necessary values in the tables

```sh
http://localhost:<PORT>/setup/initial
```
