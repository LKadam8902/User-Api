const mongoose = require('mongoose');


const dataSchema = new mongoose.Schema({
    userId:{
        required:true,
        type:String
    },
    userName: {
        required: true,
        type: String
    },
    userEmail: {
        required: false,
        type: String
    },
    userPhone:{
        required:false,
        type:Number
    },
    userMethod:{
        required:true,
        type:String
    },
    complaints:{
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'complaint' }], // An array of complaintSchema objects
        required: false
    }

});

module.exports = mongoose.model('Data', dataSchema)