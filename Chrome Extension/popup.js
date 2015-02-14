function getStorage()
{
    chrome.storage.local.get(["passphrase"], function (data)
    {
        if ( data.passphrase != undefined)
            {
                existingPassphrase(data.passphrase);
            } else {
                newPassphrase();
            }
    });
}


function getPrimaryBalance(pubkey){
    
    var source_html = "http://xcp.blockscan.com/api2?module=address&action=balance&btc_address="+pubkey;
    
    $.getJSON( source_html, function( data ) {       

        $.each(data.data, function(i, item) {
            var assetname = data.data[i].asset;   
            if (assetname == "LTBCOIN"){                
                var assetbalance = data.data[i].balance;   
                $("#xcpbalance").html(assetbalance + " LTBc");
            }
        });
               
        
        
    });
    
    if (typeof assetbalance === 'undefined') {
            $("#xcpbalance").html("0 LTBc");
    }
}


//function getRate(){
//    
//    $.getJSON( "http://joelooney.org/ltbcoin/ltb.php", function( data ) {
//  
//        document.getElementById('ltbPrice').innerHTML = data.usd_ltb;
//
//    });
//    
//}

function convertPassphrase(m){
    var HDPrivateKey = bitcore.HDPrivateKey.fromSeed(m.toHex(), bitcore.Networks.livenet);
    var derived = HDPrivateKey.derive("m/0'/0/" + 0);
    var address1 = new bitcore.Address(derived.publicKey, bitcore.Networks.livenet);
    var pubkey = address1.toString();    
    
    $("#xcpaddressTitle").show();
    $("#xcpaddress").html(pubkey);
    
    getPrimaryBalance(pubkey);
    
}

function assetDropdown(m)
{
    $("#addressselect").html("");
    
    var HDPrivateKey = bitcore.HDPrivateKey.fromSeed(m.toHex(), bitcore.Networks.livenet);
                
                 
    for (var i = 0; i < 5; i++) {
                            
        var derived = HDPrivateKey.derive("m/0'/0/" + i);
        var address1 = new bitcore.Address(derived.publicKey, bitcore.Networks.livenet);
                           
        var pubkey = address1.toString();
                            
        $("#addressselect").append("<option label='"+pubkey.slice(0,8)+"...'>"+pubkey+"</option>");
    }
}

function newPassphrase()
{
    
    
    m = new Mnemonic(128);
    m.toWords();
    var str = m.toWords().toString();
    var res = str.replace(/,/gi, " ");
    var phraseList = res; 
    
    $("#newpassphrase").html(phraseList);
    
    chrome.storage.local.set(
                    {
                        'passphrase': phraseList
                    }, function () {
                    
                        convertPassphrase(m);
                        assetDropdown(m);
                        $("#walletTab").click();
                    
                    });

   
}

function existingPassphrase(string) {
    
    string = string.replace(/\s{2,}/g, ' ');
    var array = string.split(" ");
    m2 = new Mnemonic(array);
    
    $("#newpassphrase").html(string);
       
    convertPassphrase(m2);
    assetDropdown(m2);
    
    $("#walletTab").click();
}



function manualPassphrase() {
    var string = $('#manualMnemonic').val().trim().toLowerCase();
    string = string.replace(/\s{2,}/g, ' ');
    var array = string.split(" ");
    m2 = new Mnemonic(array);
    
    $("#newpassphrase").html(string);
       
    
    
    
    chrome.storage.local.set(
                    {
                        'passphrase': string
                    }, function () {
                    
                        convertPassphrase(m2);
                        assetDropdown(m2);
    
                        $("#manualPassBox").hide();
                        $("#walletTab").click();
                    
                    });
}


function loadAssets(add) {
    
    var source_html = "http://xcp.blockscan.com/api2?module=address&action=balance&btc_address="+add;
    
    $.getJSON( source_html, function( data ) {
        $( "#allassets" ).html("");

        $.each(data.data, function(i, item) {
            var assetname = data.data[i].asset;
            var assetbalance = data.data[i].balance;
    
            var assethtml = "<div class='singleasset'><div class='assetname'>"+assetname+"</div><div class='assetqty'>Balance: "+assetbalance+"</div></div>";
    
            $( "#allassets" ).append( assethtml );

        });
             
    });
}

function setMsg(str)
{
  $("#errorBox").show().html(str);
}

function setSettingsMsg(str)
{
  $("#settingsErrorBox").show().html(str);
}

function setGPGMsg(str)
{
  str = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2');
  $("#gpgErrorBox").show().html(str);
}




var unique = function (origArr)
{
    var dict = {},
    newArr = []
    for (var i = 0; i < origArr.length; i++) {
        if (!dict[origArr[i]]) {
            newArr.push(origArr[i])
            dict[origArr[i]] = true
        }
    }
    return newArr;
};

chrome.extension.onRequest.addListener(function (object)
{

  var addresses = object.addresses;


  if (object.msgCount)
  {
    $("#msgCount").html("(" + object.msgCount + ")");
  }

  if (addresses)
  {
    
    var cleanAddresses = Array();

    for (var index in addresses)
    {
      str = addresses[index];

      removeChars = "<>&:?\".()|' \n";

      for (var c in removeChars)
          str = str.replace(removeChars[c],'')

      cleanAddresses.push(str);
    }

    cleanAddresses = unique(cleanAddresses);

    cleanAddresses.sort();

    var addressCount = 0;

    
    uris = object.uris;

    var usedUris = [];

    for ( var index in uris )
    {

      if ( usedUris.indexOf( uris[index].address ) > -1 )
      {
        break;
      }

      usedUris.push( uris[index].address );

      if ( rush.checkAddress( uris[index].address ) )
      {
        $("#addresses").prepend("<input type='radio' name='addy' value='" + uris[index].address + "' amount='" + uris[index].amount + "'><span class='address' address='" + uris[index].address + "'>" + uris[index].address + " <b>(฿" + uris[index].amount + ")</b></span> <br/>");   
        addressCount++;     
      }

      if ( cleanAddresses.indexOf( uris[index].address ) > -1  )
      {
        cleanAddresses.splice( cleanAddresses.indexOf( uris[index].address ), 1 );
      }
    }


    for (var index in cleanAddresses)
    {
      str = cleanAddresses[index];

      if ( rush.checkAddress( str ) )
      {
        $("#addresses").append("<input type='radio' name='addy' value='" + str + "'><span class='address' address='" + str + "'>" + str + "</span> <br/>");   
        addressCount++;     
      }
    }

    

    if ( addressCount )
    {
      $("#addresses").show().css(
      {
        "border-bottom": "1px solid #DDD"
      });

      $("#foundTitle").show();
    }
  }


});




window.onload = function ()
{

 
  //document.getElementById('resetAddress').onclick = rush.prepareReset;
    
    document.getElementById('resetAddress').onclick = newPassphrase;
    
    $(document).on("click", '#revealPassphrase', function (event)
  {
    if($("#newpassphrase").is(":visible")) {
       $("#passphrasebox").hide();
       $("#revealPassphrase").html("Reveal Passphrase");
    } else {
       $("#passphrasebox").show(); 
       $("#revealPassphrase").html("Hide Passphrase");
    }
    
  });
    
    $(document).on("click", '#manualPassphrase', function (event)
  {
    if($("#manualPassBox").is(":visible")) {
       $("#manualPassBox").hide();
       //$("#revealPassphrase").html("Reveal Passphrase");
    } else {
       $("#manualPassBox").show(); 
       //$("#newpassphrase").hide();
       //$("#revealPassphrase").html("Hide Passphrase");
    }
    
  });
    
    $(document).on("click", '#manualAddressButton', function (event)
  {
    manualPassphrase();
  });

  $(document).on("click", '#send', function (event)
  {
    rush.send();
  });

  $(document).on("click", '#confirmReset', function (event)
  {
    rush.reset();
  });

  $(document).on("click", '#showSettings', function (event)
  {
    rush.showSettings();
  });
    
  $(document).on("click", '#refreshWallet', function (event)
  {
    getRate();
  });

  $(document).on("click", '#gpgShowSettings', function (event)
  {
    rush.gpgShowSettings();
  });

  $(document).on("click", '#preparePassword', function (event)
  {
    rush.preparePassword();
  });

  $(document).on("click", '#setPasswordBtn', function (event)
  {
    rush.setPassword();
  });

  $(document).on("click", '#noReset', function (event)
  {
    $("#errorBox").hide();
  });

  $(document).on("click", '#export', function (event)
  {
    rush.exportWallet();
  });

  $(document).on("click", '#import', function (event)
  {
    rush.importWallet();
  });

  $(document).on("click", '#qrLink', function (event)
  {
    if ($(this).html() == '<img src="qr.png" id="qr">')
    {
      $("#address").html("<img id='qrImage' src='https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=bitcoin%3A" + rush.address + "&chld=H|0'>");
      $(this).html("[Close QR]");
    }
    else
    {
      $("#address").html(rush.address);
      $(this).html('<img src="qr.png" id="qr">');
    }
  });

  $(document).on("click", '#txHistory', function (event)
  {
    var address = $("#xcpaddress").html();
    chrome.tabs.create(
    {
      url: "http://blockscan.com/address/" + address
    });
  });

  $(document).on("click", '.donateSiteLink', function (event)
  {
    chrome.tabs.create(
    {
      url: $(this).attr("link")
    });
  });

  $(document).on("click", '#addresses input', function (event)
  {
    $("#txtAddress").val($(this).val());

    if ( $(this).attr("amount") )
    {
      $("#txtAmount").val( $(this).attr("amount") );
      rush.amountFiatValue( $(this).attr("amount") );
    }      

  });

  $(document).on("click", '#confirmImport', function (event)
  {
    rush.confirmImport();
  });

  $(document).on("click", '#gpgCreate', function (event)
  {
    rush.gpgCreate();
  });

  $(document).on("click", '#gpgBox', function (event)
  {
    this.select();
  });

  $(document).on("click", '#gpgCreate2', function (event)
  {
    rush.gpgCreate();
  });

  $(document).on("click", '#shareKey', function (event)
  {
    chrome.tabs.create({ url: $(this).attr("share") });
  });

  $(document).on("click", '#contact', function (event)
  {
    chrome.tabs.create({ url: "mailto:support@letstalkbitcoin.com" });
  });

  $(document).on("click", '#confirmGPGCreate', function (event)
  {
    if ($("#confirmGPGCreate").attr("confirmed"))
    {
      $("#confirmGPGCreate").html("Generating...").attr("disabled", "disabled");

      $("#clearBox").hide();

      setTimeout( function () { rush.confirmGPGCreate(); }, 100 );
    }
    else
    {
      rush.confirmGPGCreate();
    }

  });

  $(document).on("click", '#gpgImport', function (event)
  {
    rush.gpgImport();
  });

  $(document).on("click", '#confirmGPGImport', function (event)
  {
    rush.confirmGPGImport();
  });

  $(document).on("click", '#gpgEncrypt', function (event)
  {
    rush.gpgEncrypt();
  });

  $(document).on("click", '#gpgSendEncrypted', function (event)
  {
    rush.gpgSendEncrypted();
  });

  $(document).on("click", '#gpgConfirmSendEncrypted', function (event)
  {
    rush.gpgConfirmSendEncrypted();
  });

  $(document).on("click", '#gpgConfirmEncrypt', function (event)
  {
    rush.gpgConfirmEncrypt();
  });

  $(document).on("click", '#gpgDecrypt', function (event)
  {
    rush.gpgDecrypt();
  });

  $(document).on("click", '#gpgConfirmDecrypt', function (event)
  {
    rush.gpgConfirmDecrypt();
  });

  $(document).on("click", '#gpgGetMessages', function (event)
  {
    rush.gpgGetMessages();
  });

  $(document).on("click", '#gpgVerifyGetMessages', function (event)
  {
    rush.gpgVerifyGetMessages($(this).attr("secret"));
  });


  $(document).on("click", '#gpgManage', function (event)
  {
    rush.gpgManage();
  });

  $(document).on("click", '#gpgDelete', function (event)
  {
    rush.gpgDelete();
  });

  $(document).on("click", '#msgRead', function (event)
  {
    rush.msgRead();
  });

  $(document).on("click", '#msgReply', function (event)
  {
    rush.msgReply( $(this).attr("msgID") );
  });

  $(document).on("click", '#msgDel', function (event)
  {
    rush.msgDel();
  });


  $(document).on("click", '#gpgExport', function (event)
  {
    rush.gpgExport();
  });

  $(document).on("click", '#setCurrency', function (event)
  {
    rush.setCurrency();
  }); 

  $(document).on("click", '#setNews', function (event)
  {
    rush.setNews();
  });

  $(document).on("click", '#backup', function (event)
  {
    rush.backup();
  });

  $(document).on("click", '#restore', function (event)
  {
    rush.prepareRestore();
  });

  $(document).on("click", '#help', function (event)
  {
    rush.help();
  });

  $(document).on("click", '#userManual', function (event)
  {
    rush.userManual();
  });

  $(document).on("click", '#gpgExportPrivate', function (event)
  {
    rush.gpgExportPrivate();
  });

  $(document).on("click", '#gpgImportPrivate', function (event)
  {
    rush.gpgImportPrivate();
  });

  $(document).on("click", '#gpgConfirmImportPrivate', function (event)
  {
    rush.gpgConfirmImportPrivate();
  });

  $(document).on("change", '#gpgSavePassword', function (event)
  {
    rush.gpgSavePassword();
  });

  $(document).on("change", '#currencies', function (event)
  {
    rush.setCurrencyConfirm();
  });

  $(document).on("change", '#newsType', function (event)
  {
    rush.setNewsConfirm();
  });

  $(document).on("click", '#gpgExportPublic', function (event)
  {
    rush.gpgExportPublic();
  });

  $(document).on("click", '#removePassword', function (event)
  {
    rush.removePassword();
  });

  $(document).on("dblclick", '#messageList', function (event)
  {
    rush.msgRead();
  });
  
  $(document).on("dblclick", '.address', function (event)
  {
    chrome.tabs.create({
      'url': "http://blockscan.com/address/" + $(this).attr("address") }, function(tab) {
      });
  });

  $(document).on("click", '.newsItem', function (event)
  {
    chrome.tabs.create({
      'url': $(this).attr("link") }, function(tab) {
      });
  });

  $(document).on("click", '.newsItemReddit', function (event)
  {
    chrome.tabs.create({
      'url': "http://reddit.com" + $(this).attr("link") }, function(tab) {
      });
  });
    
  $(document).on("click", '#gotoForum', function (event)
  {    
      chrome.tabs.create({
      'url': "https://letstalkbitcoin.com" }, function(tab) {
      });
  });

  $(document).on("click", '#confirmRemovePassword', function (event)
  {
    rush.confirmRemovePassword();
  });

  $(document).on("click", '#restoreConfirm', function (event)
  {
    rush.restore();
  });

  $(document).on("click", '#clearBox', function (event)
  {
    $("#errorBox").hide();
    $("#gpgErrorBox").hide();
  });

  $(document).on("click", '#settings', function (event)
  {
    rush.openTab("settings");
  });  

  $(document).on("click", '#donate', function (event)
  {
    rush.loadDonateOptions();
  });

  $(document).on("click", '.donateLink', function (event)
  {
    rush.prepareDonate( $(this).attr("donateID") );
  });  

  $(document).on("click", '.donateNow', function (event)
  {
    rush.donate( this );
  });

  $(document).on("click", '#gpgTab', function (event)
  {
    rush.openGpgTab();

  });

  $(document).on("click", '#walletTab', function (event)
  {
    rush.openWalletTab();
  });

  $(document).on("click", '#newsTab', function (event)
  {
    rush.openNewsTab();
    
    var address = $("#xcpaddress").html();
      
    loadAssets(address);
  });  

  $(document).on("click", '#chartTab', function (event)
  {
    rush.openChartTab();
  });

  var background = chrome.extension.getBackgroundPage();

  addEventListener("unload", function (event)
  {
    background.saveMsg($("#gpgEncryptTxt").val());
  }, true);




  $(document).on("keypress", '.getMessages', function (e)
  {
    var p = e.keyCode;
    if (p == 13)
    {
      rush.gpgVerifyGetMessages($("#gpgVerifyGetMessages").attr("secret"));
    }
  });

  $(document).on("keyup", '#txtAmount', function (event)
  {
    rush.amountFiatValue($(this).val());
  });

  chrome.windows.getCurrent(function (currentWindow)
  {
    chrome.tabs.query(
      {
        active: true,
        windowId: currentWindow.id
      },
      function (activeTabs)
      {
        chrome.tabs.executeScript(
          activeTabs[0].id,
          {
            file: 'find_addresses.js',
            allFrames: true
          });
      });
  });

  // $( document ).tooltip( 
  //     { 
  //       position: 
  //       {
  //         at: "top+30",
  //         my: "top"
  //       }
  //     }

  // );

};

function showMessages()
{
  return;
}