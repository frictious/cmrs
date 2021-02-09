const   mongoose                = require("mongoose");

const deceasedSchema = new mongoose.Schema({
    deceasedID : String,
    timeOfDeath : String,
    date : {
        type : Date,
        default : Date.now()
    },
    reportedBy : String, //Name of person that reported the death case
    causeOfDeath : String, //Use CKEDITOR to enter the cause of death
    childId : String,
    residenceAddress : String,
    assumedAreaOfIncident : String,
    areaOfIncident : String,
    tribe : String,
    nationality : String,
    gender : String,
    lastName : String,
    otherName : String,
    firstName : String
});

module.exports = mongoose.model("Deceased", deceasedSchema);