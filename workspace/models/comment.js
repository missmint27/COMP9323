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

module.exports = mongoose.model("Comment", commentSchema);