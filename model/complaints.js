const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    type:{
       required:true,
       type:String
    },
    description: {
        required: true,
        type: String
    },
    imgs:{
        required:true,
        type:[String]
    },
    agentId:{
        required:false,
        type:String
    },
    agentName:{
        requireed:false,
        type:String
    },
    date: {
        required: true,
        type: Date
    }
});

module.exports = mongoose.models.complaint||mongoose.model('complaint', complaintSchema)