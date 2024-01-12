

import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import workoutType from "../enums/workoutType";


const shoeSchema = new Mongoose.Schema({
    brand: {type:String},
    model: {type:String},
    color: {type:String}, 
    point: {type:Number}, 
    attributes: {
      strength: { type: Number },
      luck: { type: Number },
      enduring: { type: Number },
      beauty: { type: Number },
      comfort: { type: Number },
  },
    workoutType: {
      type: String,
      enum: [workoutType.CYCLE,workoutType.SHOES],
    },
  },  { timestamps: true }
  );

shoeSchema.index({ location: "2dsphere" });
shoeSchema.plugin(mongooseAggregatePaginate);
shoeSchema.plugin(mongoosePaginate);

module.exports = Mongoose.model("Shoe", shoeSchema);
