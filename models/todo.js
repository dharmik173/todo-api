const mongoose = require("mongoose")

const todoSchema = new mongoose.Schema({
    todoTitle:{
        type:String,
        required: true,
    },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
},{timestamps:true})

module.exports = mongoose.model("Todo", todoSchema);
