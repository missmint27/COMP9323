var mongoose = require("mongoose");

var coderoomSchema = new mongoose.Schema({
    name: String,
    upvote: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    downvote: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    rank: Number,
    description: String,

    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },

});

// Virtual for author's URL
coderoomSchema
    .virtual('url')
    .get(function () {
        return '/coderooms/' + this._id;
    });
coderoomSchema.virtual('code').get(function() {
    return ''
});
coderoomSchema.virtual('comment').get(function() {
    return ''
});
coderoomSchema.virtual('user_list').get(function() {
    return ''
});
module.exports = mongoose.model("coderoom", coderoomSchema);