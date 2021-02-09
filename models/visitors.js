const   mongoose                = require("mongoose");

const visitorsSchema = new mongoose.Schema({
    visitorsID : String,
    name : String,
    childID : String,
    purpose : String,
    date : {
        type : Date,
        default :Date.now()
    }
});

module.exports = mongoose.model("Visitors", visitorsSchema);