const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

//load input validation
const validateCarInput = require('../../validation/car');

// Load Profile Model
const Car = require('../../models/Car');
// Load User Model
const User = require('../../models/User'); 

/* --------------------------for image uploads------------------------ */
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage'); 
const Grid = require('gridfs-stream');
const mongoURI = 'mongodb://localhost:27017/dell';
const conn = mongoose.createConnection(mongoURI);
let gfs; 
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
}); 
// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = { 
                    filename: filename,
                    bucketName: 'uploads',
                    metadata: {
                        carid: req.body.carid, 
                        primeImg: "",
                     } 
                };
                console.log("METATDATA-------------------: ", fileInfo.metadata)
                if (fileInfo.metadata.carid === undefined) return ("carid not set properly");
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });
/* --------------------------for image uploads------------------------ */


 

// @route POST /toggleCarSold
// @desc toggle the car sold
router.post('/toggleCarSold', (req, res) => {
    //console.log(req.body.car_id)

    Car.findOne({_id: req.body.car_id }).then(car => {
        if (car) { // Edit - if car exists
            var tsold = '';
            if (car.sold == "sold") tsold = "sale";
            else if (car.sold == "sale") tsold = "sold"; 

            Car.findOneAndUpdate( { _id: req.body.car_id }, {$set:{"sold":tsold}} ).then(car => res.json(car));
            //return res.json(tsold);
        }
    });  

});


// @route POST /makePrime
// @desc set primeImg filename on image files and cars
router.post('/makePrime', (req, res) => {
    //console.log(req.body.car_id)

    gfs.files.update( {"metadata.carid" : req.body.car_id}, {$set:{"metadata.primeImg":"no"}}, {multi:true} , function(err, doc){ 
        if(err) console.log("Something wrong when updating data!"); 
    });

    gfs.files.findOneAndUpdate( {filename : req.body.filename}, {$set:{"metadata.primeImg":"yes"}}, function(err, doc){ 
        if(err) console.log("Something wrong when updating data!");
    });

    Car.findOne({_id: req.body.car_id}).then(car => {
        console.log(req.body.filename);
        if (car) {
            Car.findOneAndUpdate({ _id: req.body.car_id }, { $set:{primeImg:req.body.filename} }, function(err, doc){ 
                if(err) console.log("Something wrong when updating data!");
            });
        }
    });

    return res.json("success");
});

// @route GET /files
// @desc  Display all files in JSON
router.get('/getImgs', (req, res) => {
    //console.log(req.query.car_id)  
  
    gfs.files.find({ "metadata.carid" : req.query.car_id }).toArray((err, files) => {
      // Check if files
        if (!files || files.length === 0) {
            /* return res.status(404).json({
                err: 'No files exist'
            }); */
            console.log("no images");
        } 
        // Files exist
        return res.json(files);
    });
});
// @route GET /files/:filename
// @desc  Display single file object
/* router.get('/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
      // File exists
      return res.json(file);
    });
});
   */
// @route GET /image/:filename
// @desc Display Image
router.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});
// @route DELETE /files/:id
// @desc  Delete file
router.delete('/removeImg/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err) => {
        if (err) {
            return res.status(404).json({ err: err });
        }
        return res.json("success");
    });
});
// @route POST /addCarImg
// @desc  add car image file to DB
router.post('/addCarImg', upload.single('file'), async (req, res) => {
        //req.file.car_id = req.body.id;
        //console.log(req.file); 
        res.json("success"); 
});  



 

// @route       GET api/cars/deleteFullCar
// @desc        remove full car data and images related
// @access      Private
router.post('/deleteFullCar', (req, res) => {
    const errors = {};
    //console.log(req.body)

    // remove the car images
    gfs.files.find({ "metadata.carid" : req.body.car_id }).toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            }); 
        }
        for (var i=0; i<files.length;i++) {
            console.log(files[i]._id)
            gfs.remove({ _id: files[i]._id, root: 'uploads' }, (err) => {
                if (err) return res.json(err);
            });
        }
        return res.json(files);   
      });

    // remove the car info
    Car.remove({ _id: req.body.car_id }) 
    .then(cars => {
        if (!cars) {
            errors.noprofile = "There was no car with this id";
            return res.status(404).json(errors);
        } 
        //res.json(cars);
    })
    .catch(err=>res.status(404).json({cars: 'There are no cars'}));
}); 


// @route       GET api/cars/editCar
// @desc        get specific car for form data
// @access      Public
router.get('/getCarData', (req, res) => {
    const errors = {};

    //console.log(req.query)
    Car.find({ _id: req.query.car_id }) 
    .then(cars => {
        if (!cars) {
            errors.noprofile = "There are no cars";
            return res.status(404).json(errors);
        }
        res.json(cars);
    })
    .catch(err=>res.status(404).json({cars: 'There are no cars'}));
}); 
// @route       GET api/cars/cars
// @desc        Cars route
// @access      Public
router.get('/carList', (req, res) => {
    const errors = {};

    Car.find( {"sold" : "sale"} ) 
    .then(cars => {
        if (!cars) {
            errors.noprofile = "There are no cars";
            return res.status(404).json(errors);
        }
        res.json(cars);
    })
    .catch(err=>res.status(404).json({cars: 'There are no cars'}));
});
// @route       GET api/cars/cars
// @desc        Cars route
// @access      Public
router.get('/carSoldList', (req, res) => {
    const errors = {}; 

    Car.find( {"sold" : "sold"} ) 
    .then(cars => {
        if (!cars) {
            errors.noprofile = "There are no SOLD cars";
            return res.status(404).json(errors);
        }
        res.json(cars);
    })
    .catch(err=>res.status(404).json({cars: 'There are no cars'}));
});




// @route       POST api/car/addCar
// @desc        Create || Edit car
// @access      Private
router.post('/addCar', passport.authenticate('jwt', { session: false }), (req, res) => { 
    const { errors, isValid } = validateCarInput(req.body);
    //check Validation
    if(!isValid) {
        console.log(errors);
        return res.status(400).json(errors);
    }
    //console.log(req.user) 

    const carFields = {};
    //carFields.user = req.user.id; //we have the user in the header when requesting
    if(req.body.make) carFields.make = req.body.make;
    if(req.body.model) carFields.model = req.body.model;
    if(req.body.price) carFields.price = req.body.price;

    if(req.body.year) carFields.year = req.body.year;
    if(req.body.in_color) carFields.in_color = req.body.in_color;
    if(req.body.ex_color) carFields.ex_color = req.body.ex_color;
    if(req.body.km) carFields.km = req.body.km;
    if(req.body.body_type) carFields.body_type = req.body.body_type;
    if(req.body.transmission) carFields.transmission = req.body.transmission;
    if(req.body.drivetrain) carFields.drivetrain = req.body.drivetrain;
    if(req.body.fuel_type) carFields.fuel_type = req.body.fuel_type;
    if(req.body.engine) carFields.engine = req.body.engine;
    if(req.body.doors) carFields.doors = req.body.doors;
    if(req.body.cylinders) carFields.cylinders = req.body.cylinders;
    if(req.body.VIN) carFields.VIN = req.body.VIN;
    if(req.body.description) carFields.description = req.body.description;
    if(req.body.sold) carFields.sold = req.body.sold; 
 
    // Save Car, and return the response (car) 
    // Find specfic id
    
    Car.findOne({_id: req.body.car_id}).then(car => {
        if (car) { // Edit - if car exists
            Car.findOneAndUpdate(
                { _id: req.body.car_id }, 
                { $set: carFields },  
            ).then(car => res.json(car));
        } else { // Create - if car doesnt exist 
            //dont need to because it should already be created
            //new Car(carFields).save().then(car => { res.json(car) });
        }
    });     
});
router.post('/addCar_temp', passport.authenticate('jwt', { session: false }), (req, res) => {
        const carFields = {};
        carFields.make = "tmp";
        carFields.model = "tmp";
        carFields.price = "tmp";
        new Car(carFields).save().then(car => { res.json(car) });
});

module.exports = router;