var mongoose = require("mongoose");

var projectSchema = new mongoose.Schema({
    name: String,
    file: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PythonFile"
    }
    ],
});

module.exports = mongoose.model("project", projectSchema);