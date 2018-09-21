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
// Virtual for author's URL
projectSchema
    .virtual('url')
    .get(function () {
        return '/api/projects/' + this._id;
    });
module.exports = mongoose.model("project", projectSchema);