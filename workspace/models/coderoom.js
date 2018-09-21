var mongoose = require("mongoose");

var coderoomSchema = new mongoose.Schema({
    name: String,
    upvote: Number,
    downVote: Number,
    rank: Number,
    description: String,
    permitted_user: String,
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    users: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String
        }
    ]
});

module.exports = mongoose.model("coderoom", coderoomSchema);