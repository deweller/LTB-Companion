var bitcore = require('bitcore');

$( document ).ready(function() {

//$.ajaxSetup({
//      "error":function() {  
//      document.getElementById('loading').innerHTML = "API Error";
// 
//      }
//});

    
    
//getRate();
    
    
getStorage();
    

    
    
$( "#addressselect" ).change(function () {
    
    var addr = $(this).val();
    
    $("#xcpaddress").html(addr);
    
    getPrimaryBalance(addr);
});
    
});