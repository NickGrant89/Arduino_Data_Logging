$(document).ready(function(){
//On page local run every second.
    myFunction();
    function myFunction() {
        myVar = setInterval(alertFunc, 1000);

        //alertFunc();
      }
      //Alert function to update table and trigger MP3.
      function alertFunc() {
        console.log("Hello!");
        

        var reloadTable = function(employees) {
            var table = $('#mytable');
            table.find("tbody tr").remove();
            employees.forEach(function (employee) {
                table.append("<tr><th><td>" + employee.date + "</td><td>" + employee.count + "</td></th></tr>");
                //console.log(employees);
            });
        };

        $.ajax({
            type:'GET',
            //data: dataJson,
            url: '/stats',
            dataType: "json",
            contentType: "application/json",
            success: function(response){
                if(response.mp3.mp3 == 'true'){
                    $('#carteSoudCtrl')[0].play();
                    $.ajax({
                        type:'POST',
                        //data: JSON.stringify('dataJson'),
                        url: '/stats/'+response.mp3._id,
                        dataType: "json",
                        contentType: "application/json",
                        success: function(response){
                        console.log('post');
                        $.notify("New Vist" ,  { position:"bottom right" } );
                        //$('#carteSoudCtrl')[0].play();
                        },
                        error: function(err){
                               console.log(err); 
                        },
                        
                    });
                }
         
           
             reloadTable(response.arrayCount);
           
             
            },
            
            error: function(err){
                   console.log(err); 
            },
            
        });
   
       

      }

            
 
  });



