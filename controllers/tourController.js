const Tours = require('../models/tourModel');
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

exports.checkBody = (req,res, next) => {
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            success: "Failed",
            message: "Name or Price is Missing "
        });
    }
    next();
}

exports.getAllTours =  (req,res) => { 
    //console.log(req.requestedTime);
    res.status(200).json({
        status: "success",
        // results: tours.length,
        // data: {
        //     tours
        // }
    });
}

exports.getTour = (req,res) => {
 
    const id = req.params.id * 1;
    //const tour = tours.find(el => el.id === id);
 

     res.status(200).json({
         status: "success",
        //  data: {
        //      tour
        //  }
     });
 }

 exports.createTour = (req,res) => {
    //const newID = tours[tours.length-1].id + 1;
    // eslint-disable-next-line prefer-object-spread
    // const newTour = Object.assign({id: newID},req.body);

    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
       
    // }
    // );

    res.status(201).json({
        status: "success",
        // data: {
        //     tour: newTour
        // }
    });
}

exports.updateTour = (req,res) => {
   
    res.status(200).json({
        status: "success",
        data: {
            tour: "Data updated"
        }
    });
}

exports.deleteTour = (req,res) => {
    res.status(204).json({
        status: "success",
        data: null
    });
}