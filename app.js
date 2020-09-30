const express = require('express');
const app = express();
const multer = require("multer");
const path = require("path");
const cors = require("cors")

var allImages = []
var imageToUser = {}
// storage engine 

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
        profile_url: `http://localhost:3001/profile/${req.file.filename}`
    })
    imageToUser[req.body['name']] = `http://localhost:3001/profile/${req.file.filename}`
    allImages.push(`http://localhost:3001/profile/${req.file.filename}`)
})

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