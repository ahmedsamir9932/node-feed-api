const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const multer = require('multer')
const helmet = require('helmet')
const morgan = require('morgan')
const fs = require('fs');

const feedRouter = require('./routes/feed')
const authRouter = require('./routes/auth')

const app = express()

// for fileUpload some configration for multer
// middleware to detect any file come from requests
// send it to distination
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
        // replace for : by - beacause window doesn't accespt file with : character
    }
});
// to detect file format
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}


// app.use(bodyParser.urlencoded())   // x-www-form-urlencoded   <form>
app.use(bodyParser.json())

// use multer for images
// use middleware for ant field coming from request called (file)
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use('/feed', feedRouter)
app.use('/auth', authRouter)

const accessLogStreams = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})  // for append not overwrite

app.use(helmet())
// compress assets middleware if building MVC node application
// app.use(compression())
// you can also morgan libray to set logs for every request coming but not need managed auto by providers
// app.use(morgan('combined', {stream: accessLogStreams}))

// generic error handling middleware
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data
    res.status(status).json({ message: message, data: data });
})

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cijc95i.mongodb.net/${process.env.DB_NAME}`).then(() => {
    app.listen(process.env.PORT || 4300, () => {
        console.log('Connected to server successfully');
        console.log('Connected to Databse successfully');
    })
}).catch(error => {
    console.log(error);
})
