const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
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

exports.getAllTours = catchAsync(async (req,res,next) => { 
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
});

exports.getTour = catchAsync(async (req,res,next) => {

    const tour = await Tour.findById(req.params.id);
    if (!tour) {
        return next(new AppError('No Tour found with that ID', 404));
    }
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        });
 });

 exports.createTour = catchAsync(async (req,res,next) => {

    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    });
});

exports.updateTour = catchAsync(async(req,res,next) => {
 
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!tour) {
        return next(new AppError('No Tour found with that ID', 404));
    }
      
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        });

});

exports.deleteTour = catchAsync(async (req,res,next) => {
    
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
        return next(new AppError('No Tour found with that ID', 404));
    }
      
        res.status(204).json({
            status: "success",
            data: null
        });

});

exports.getTourStats = catchAsync(async (req,res,next) => {
  
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: {$gte:4.5}}
            },
            {
                $group: {
                    _id: '$difficulty',
                    numTours: {$sum:1},
                    numRatings: {$avg: '$ratingsAverage'},
                    avgRating: {$avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'},
                } 
            },
                {
                    $sort: {avgPrice: 1}
                },
                // {
                //     $match: { _id: {$ne: 'EASY'}}
                // }
            
        ]);
        res.status(201).json({
            status: "success",
            data: {
                stats
            }
        });
  
});

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
    
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: { 
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-3`)
                    }
                }
            },
            {
                  $group: { 
                      _id: {$month: '$startDates'},
                      newTourStarts: {$sum: 1},
                      tours: {$push: '$name'}
                  }
            },
            {
                $addFields: {$month: '$_id'}
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1}
            },
            {
                $limit: 6
            }
             
        ]);
        res.status(201).json({
            status: "success",
            data: {
                plan
            }
        });
 
});
