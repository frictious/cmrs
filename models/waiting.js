const   mongoose                = require("mongoose");

const waitingSchema = new mongoose.Schema({
    waitingID : String,
    childID : String,
    specialist : String,
    status : String,//Status of the waiting patient
    waitingFor : String,//What the patient is on the waiting list for
    waitingDate : String//When the patients information was entered into the waiting list
});

module.exports = mongoose.model("Waiting", waitingSchema);