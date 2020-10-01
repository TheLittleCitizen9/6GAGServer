const express = require('express');
const app = express();
const multer = require("multer");
const path = require("path");
const cors = require("cors")
const testFolder = './upload/images/';
const fs = require('fs');

const url = "http://localhost:3001/profile/"

var allImages = []
var imageToUser = {}

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
  }

app.use(cors(corsOptions));

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    }
})
app.use('/profile', express.static('upload/images'));
app.post("/upload", upload.single('profile'), (req, res) => {

    res.json({
        success: 1,
        profile_url: `${url}${req.file.filename}`
    })
    imageToUser[req.body['name']] = `${url}${req.file.filename}`
})

var getAllImages = function(req, res, next){
    fs.readdirSync(testFolder).forEach(file => {
        if(!allImages.includes(`${url}${file}`)){
                allImages.push(`${url}${file}`)
            }
    })
      next()
}

app.use("/getAll", getAllImages)
app.get("/getAll", (req, res) => {
    res.send(allImages)
})

function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.json({
            success: 0,
            message: err.message
        })
    }
}
app.use(errHandler);
app.listen(3001, () => {
    console.log("server up and running");
})