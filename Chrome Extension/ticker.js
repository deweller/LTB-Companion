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
    
//    chrome.storage.local.set(
//                    {
//                        'lastAddress': addr
//                    }, function () {
                    
                        $("#xcpaddress").html(addr);
    
                        getPrimaryBalance(addr);
                    
//                    });
    
    
});
    
});