const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        unique: true,
        trim: true,
        maxlength: [40, 'Tour name must be less or equal to 40 characters'],
        minlength: [10,'Tour name must be greater than 10 characters']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have gtoup size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult'
        }
    }, 
        ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have price']

    },
    priceDiscount: {
        type:Number,
        validate: {
            validator: function(val){
                return val < this.price;
            },
            message: "Discount ({VALUE}) should be less than actual price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have summary"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date]
}, 
{
  toJSON:{virtual:true},
  toObject: {virtual:true}
}
);

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;