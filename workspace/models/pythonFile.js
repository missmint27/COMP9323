var mongoose = require("mongoose");

var pythonFileSchema = new mongoose.Schema({
    name: String,
    code: String,
    created_date: {type: Date},
    last_modified: {type: Date},
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
});
// Virtual for author's URL
pythonFileSchema
    .virtual('url')
    .get(function () {
        return '/api/python_files/' + this._id;
    });
module.exports = mongoose.model("PythonFile", pythonFileSchema);