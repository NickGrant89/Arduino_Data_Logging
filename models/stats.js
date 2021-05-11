const mongoose = require('mongoose');

// Stats schema

const StatsSchema = mongoose.Schema({
    
    date:{
        type: String
    },
    time:{
        type: String
    },
    distance:{
        type: String
    },
    mp3:{
        type: String
    },
});


let Stats = module.exports = mongoose.model('Stats', StatsSchema);