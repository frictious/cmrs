const   mongoose                = require("mongoose");

const childSchema = new mongoose.Schema({
    childID : String,
    firstName : String,
    lastName : String,
    otherName : String,
    dob : String,
    gender : String,
    address : String,
    photo : String,
    ethnicity : String,
    religion : String,
    nationality : String,
    registrationType : String,
    regDate : Date,
    mother : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Mother"
    },
    father : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Father"
    },
    guardian : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Guardian"
    }
});

module.exports = mongoose.model("Child", childSchema);