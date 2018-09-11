var mongoose = require("mongoose");

var coderoomSchema = new mongoose.Schema({
   name: String,
   image: String,
   upvote:Number,
   downVote:Number,
   rank:Number,
   description:String,
   code:[{
       type:String,
   }],
   author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
   
   
   
});

module.exports = mongoose.model("coderoom", coderoomSchema);