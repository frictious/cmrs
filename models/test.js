const   mongoose            = require("mongoose");

const testSchema = new mongoose.Schema({
    type : String,//Type of test
    requestedBy : String,//The person that requested the test results
    labResult : String, //Should be a pdf file or image of the test result
    childID : String,//ID of the child that took the test
    done :{
        type : Date,
        default : Date.now()
    }
});

module.exports = mongoose.model("Test", testSchema);