const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
//const fs = require('fs');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkID = (req, res, next, value) => {
//     // eslint-disable-next-line no-console
//     console.log(`The ID is ${value}`);
//     if(req.params.id * 1 > tours.length){
//         res.status(404).json({
//             status: "fail",
//             message: "Invalid Id"
//         });
//     }
//     next();
// }

// exports.checkBody = (req,res, next) => {
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             success: "Failed",
//             message: "Name or Price is Missing "
//         });
//     }
//     next();
// }

exports.aliasTopTours = async (req,res,next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}

exports.getAllTours = async (req,res) => { 
    try{
         const features = new APIFeatures(Tour.find(), req.query)
         .filter()
         .sort()
         .limitFields()
         .pagination();

        const tours = await features.query; // EXECUTE QUERY   

        res.status(200).json({
            status: "success",
            results: tours.length,
            data: {
                tours
            }
        });

    }catch(err){
        res.status(400).json({
            status: "failed",
            message: err
       });

    }
   
}

exports.getTour = async (req,res) => {
    try {
    const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        });
    }catch(err){
        res.status(400).json({
            status: "failed",
            message: err
       });


    }
    
 }

 exports.createTour = async (req,res) => {
    //const newID = tours[tours.length-1].id + 1;
    // eslint-disable-next-line prefer-object-spread
    // const newTour = Object.assign({id: newID},req.body);

    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
       
    // }
    // );
    try{
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    });

    }catch (err){
          res.status(400).json({
               status: "failed",
               message: err
          });
    }

}

exports.updateTour = async(req,res) => {
    try{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        });
    } catch (err){
        res.status(400).json({
            status: "failed",
            message: err
       });

    }
   
    
}

exports.deleteTour = async (req,res) => {
    try {
    await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: "success",
            data: null
        });

    } catch (err) {
            res.status(400).json({
                status: "failed",
                message: err
           });

    }
   
}