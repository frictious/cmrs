const   mongoose                = require("mongoose");

const emergencySchema = new mongoose.Schema({
    emergencyID : String,
    childID : String,
    regDate : String,
    emergencyDescription : String,
    broughtBy : String,
    bringersContact : String,
    relationship : String
});

module.exports = mongoose.model("Emergency", emergencySchema);