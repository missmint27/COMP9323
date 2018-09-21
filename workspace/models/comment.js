var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    upvote: Number,
    downVote:Number,
    rank:Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    start: Number,
    end: Number,
});
// Virtual for author's URL
commentSchema
    .virtual('url')
    .get(function () {
        return '/api/comments/' + this._id;
    });
module.exports = mongoose.model("Comment", commentSchema);