const express = require('express');
const app = express();
const multer = require("multer");
const path = require("path");
const cors = require("cors")
const testFolder = './upload/images/';
const fs = require('fs');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const url = "http://localhost:3001/profile/"

var imageToUser = {}
var imageToVotes = {}

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
  }

const swaggerOptions = {
swaggerDefinition: {
    info: {
    version: "1.0.0",
    title: "Images API",
    description: "Images API Information",
    contact: {
        name: "Amazing Developer"
    },
    servers: ["http://localhost:3001"]
    }
},
apis: ["app.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

const addLike = function(req, res, next){
    for(var key in imageToVotes){
        if(req.body['img'] === key){
            imageToVotes[key]  += 1
        }
    }
      next()
}

/**
 * @swagger
 * /like:
 *  put:
 *    description: Use to increase the votes by 1
 *    parameters:
 *      - in: query
 *        name: img
 *        description: Url of the image
 *        required: true
 *        schema:
 *           type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.use(express.json());
app.use(express.urlencoded());
app.use('/like', addLike)
app.put("/like", (req, res) =>{
    res.json({
        success: 1
    })
})

const addDislike = function(req, res, next){
    for(var key in imageToVotes){
        if(req.body['img'] === key){
            imageToVotes[key]  = imageToVotes[key] -1
        }
    }
      next()
}

/**
 * @swagger
 * /dislike:
 *  put:
 *    description: Use to decrease the votes by 1
 *    parameters:
 *      - in: query
 *        name: img
 *        description: Url of the image
 *        required: true
 *        schema:
 *           type: string
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.use(express.json());
app.use(express.urlencoded());
app.use('/dislike', addDislike)
app.put("/dislike", (req, res) =>{
    res.json({
        success: 1
    })
})

/**
 * @swagger
 * /upload:
 *  post:
 *    description: Use to request all images
 *    parameters:
 *      - in: query
 *        name: name
 *        description: Name of the user
 *        required: true
 *        schema:
 *           type: string
 *      - in: formData
 *        name: profile
 *        description: Image to upload
 *        required: true
 *        type: file
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.use('/profile', express.static('upload/images'));
app.post("/upload", upload.single('profile'), (req, res) => {
    imageToUser[req.body['name']] = `${url}${req.file.filename}`
    imageToVotes[`${url}${req.file.filename}`] = 0

    res.json({
        success: 1,
        profile_url: `${url}${req.file.filename}`
    })
})

const getAllImages = function(req, res, next){
    fs.readdirSync(testFolder).forEach(file => {
        if(imageToVotes === {}){
                imageToVotes[`${url}${file}`] = 0
            }
    })
      next()
}

/**
 * @swagger
 * /getAll:
 *  get:
 *    description: Use to request all images
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.use("/getAll", getAllImages)
app.get("/getAll", (req, res) => {
    res.send(imageToVotes)
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