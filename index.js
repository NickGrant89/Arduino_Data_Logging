const express = require('express');
var moment = require('moment');

const app = express();
var SerialPort = require("serialport");
const Readline = require('@serialport/parser-readline')
const fs = require('fs');
const path = require('path');
const config = require('./config/database')

var port = 3000;

let Stats = require('./models/stats');

// Call Moongoose connection
const mongoose = require('mongoose');
mongoose.connect(config.database,{ useNewUrlParser: true, useUnifiedTopology: true  });

// Starting DB connection

let db = mongoose.connection;

db.once('open', function(){
    console.log('MongoDB Live');

})

db.on('error', function(err){
    console.log(err);

});

//Selecting USB port
var arduinoCOMPort = "/dev/cu.usbmodem1433201";

//Import HTML
app.set("view engine", "pug");

app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, 'public')))

//GET Home page

app.get('/', function(req, res){

    var m = new Date();
    var dateString =  m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()); 
    var a = moment(); 
    var b = a.subtract(7, 'day'); 
    //console.log(b.format('DD/MM/YYYY'));
    var j = [];
    Promise.all([
        Stats.countDocuments({'date': dateString}),
        Stats.countDocuments({'date': m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()-1)}),
        Stats.countDocuments({'date': m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()-2)}),
        Stats.countDocuments({'date': m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()-3)}),
        Stats.countDocuments({'date': m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()-4)}),
        
      
      ])
      .then(results=>{
      
        //results return an array
      
        const [stats, stats2, stats3, stats4, stats5, mp3] = results;
      
        //console.log("users",stats);
        //console.log("users",stats2);

       //console.log(arr);
       res.render('index', {
        title:'Dashboard',
        //dayOne: {x: dateString, y:count},
        arrayCount: [],
        Date:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()), 'count': stats},
        Date1:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()-1), 'count': stats2},
        Date2:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()-2), 'count': stats3},
        Date3:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()-3), 'count': stats4},
        Date4:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()-4), 'count': stats5},
        arrayCount: [{"date":(m.getUTCDate()) +"/"+ (m.getUTCMonth()+1) +"/"+  m.getUTCFullYear(), 'count': stats}, 
                    {"date":(m.getUTCDate()-1) +"/"+ (m.getUTCMonth()+1) +"/"+  m.getUTCFullYear(), 'count': stats2}, 
                    {"date":(m.getUTCDate()-2)  +"/"+ (m.getUTCMonth()+1) +"/"+ m.getUTCFullYear(), 'count': stats3}, 
                    {"date":(m.getUTCDate()-3)  +"/"+ (m.getUTCMonth()+1) +"/"+ m.getUTCFullYear(), 'count': stats4}, 
                    {"date":(m.getUTCDate()-4)  +"/"+ (m.getUTCMonth()+1) +"/"+ m.getUTCFullYear(), 'count': stats5} ],
    });
      
      })
      .catch(err=>{
        console.error("Something went wrong",err);
      })




 

});

function getConnectedArduino() {
  SerialPort.list(function(err, ports) {
    var allports = ports.length;
    var count = 0;
    var done = false
    ports.forEach(function(port) {
      count += 1;
      pm = port['manufacturer'];
      if (typeof pm !== 'undefined' && pm.includes('arduino')) {
        arduinoport = port.comName.toString();
        var serialPort = require('serialport');
        sp = new serialPort(arduinoport, {
          buadRate: 9600
        })
        sp.on('open', function() {
          console.log('done! arduino is now connected at port: ' + arduinoport)
        })
        done = true;
      }
      if (count === allports && done === false) {
         console.log('cant find arduino')
      }
    });

  });
}

var arduinoSerialPort = new SerialPort(arduinoCOMPort, {  
 baudRate: 9600
});

const parser = arduinoSerialPort.pipe(new Readline({ delimiter: '\r\n' }))

parser.on('data', function(data, err){
    console.log(data);
    
    var m = new Date() ;
    var dateString = m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ m.getUTCDate();
    var timeString =  m.getUTCHours() + ":" + m.getUTCMinutes() + ":" + m.getUTCSeconds();

    console.log(dateString);
    

    let stats = new Stats();
    stats.date = dateString;
    stats.time = timeString;
    stats.distance = data;
    stats.mp3 = 'true';


  stats.save(function(err){
    if(err){
        console.log(err);
        return;
    }else{
       console.log('saved');
       console.log(stats);
    }
});
});


//Stats Page
app.get('/stats', function (req, res) {

  var a = moment(); 
  var b = a; 
  //console.log(b.format('DD/MM/YYYY'));

    var m = new Date();
    var dateString =  m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()); 
    //console.log(dateString);

    Promise.all([
        Stats.countDocuments({'date': dateString}),
        Stats.countDocuments({'date': m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()-1)}),
        Stats.countDocuments({'date': m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()-2)}),
        Stats.countDocuments({'date': m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()-3)}),
        Stats.countDocuments({'date': m.getUTCFullYear() +","+ (m.getUTCMonth()+1) +","+ (m.getUTCDate()-4)}),
        Stats.findOne({'mp3':'true'}),
      
      ])
      .then(results=>{
      
        //results return an array
      
        var [stats, stats2, stats3, stats4, stats5, mp3] = results;
      
        if(mp3 == null){
          mp3 = {_id:''};
        }
        //console.log("users",dateString);
        //console.log("users",mp3);
       

        var data2 = {
       _id:mp3._id,   
       mp3:mp3,     
       Date:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()), 'count': stats},
       Date1:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()-1), 'count': stats2},
       Date2:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()-2), 'count': stats3},
       Date3:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()-3), 'count': stats4},
       Date4:{"date":m.getUTCFullYear() +","+ (m.getUTCMonth()) +","+ (m.getUTCDate()-4), 'count': stats5},
       arrayCount: [{"date":b.format('DD/MM/YYYY'), 'count': stats}, 
                   {"date":b.subtract(1, 'day').format('DD/MM/YYYY'), 'count': stats2}, 
                   {"date":b.subtract(1, 'day').format('DD/MM/YYYY'), 'count': stats3}, 
                   {"date":b.subtract(1, 'day').format('DD/MM/YYYY'), 'count': stats4}, 
                   {"date":b.subtract(1, 'day').format('DD/MM/YYYY'), 'count': stats5} ],
        }

       //console.log(arr);
       //res.json('success', data2);
       res.status(200).json(data2);
      
       

      
      })
      .catch(err=>{
        console.error("Something went wrong",err);
      })



    
 
})

//Update & Play MP3 
app.post('/stats/:id', function(req, res){
  console.log(req.params);
  let stat = {};
    stat.mp3 = 'false';
    
  
    let query = {_id:req.params.id}
 
    Stats.updateOne(query, stat, function(err){
         if(err){
             console.log(err);
             return;
         }
         else{
          res.status(200).json('data2');
         }
    });
    console.log('')
})

//First Test function.
app.get('/:action', function (req, res) {
    
   var action = req.params.action || req.param('action');
    
    if(action == 'led'){
        arduinoSerialPort.write("w");
        return res.send('Led light is on!');
    } 
    if(action == 'off') {
        arduinoSerialPort.write("t");
        return res.send("Led light is off!");
    }
    
    return res.send('Action: ' + action);
 
});

app.listen(port, function () {
  console.log('Example app listening on port http://0.0.0.0:' + port + '!');
});