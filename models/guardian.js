const   mongoose                = require("mongoose");

const guardianSchema = new mongoose.Schema({
    guardianID : String,
    firstName : String,
    lastName : String,
    otherName : String,
    gender : String,
    dob : Date,
    address : String,
    contact : String,
    nationality : String,
    placeOfBirth : String,
    maritalStatus : String,
    occupation : String,
    photo : String,
    childId : String,
    educationalLevel : String,
    noOfChildren : String,
    regDate : {
        type : Date,
        default : Date.now()
    }
});

module.exports = mongoose.model("Guardian", guardianSchema);