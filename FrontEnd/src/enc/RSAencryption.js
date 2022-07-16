var iv;
var chars = "0123456789ABCDEF";
var cryptoObj = window.crypto || window.msCrypto;
var cryptoSubtle = cryptoObj.subtle || cryptoSubtle.webkitSubtle;

function setPublicKeyMap(publicMap) {
	publicKeyMap = publicMap;
}

function setPrivateKeyMap(privateMap) {
	privateKeyMap = privateMap;
}

var testPublicKeyMap = {};
var testPrivateKeyMap = {};
var keysSize = 15;
var generated = keysSize;
function generateKey()
{
	cryptoSubtle.generateKey({
                name: "RSA-OAEP",
                modulusLength: 2048, //can be 1024, 2048, or 4096
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: {
                    name: "SHA-256"
                }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
            },
            true, //whether the key is extractable (i.e. can be used in exportKey)
            ["encrypt", "decrypt"] //must be ["encrypt", "decrypt"] or ["wrapKey", "unwrapKey"]
        )
        .then(function(key) {
            //returns a keypair object
            var publicKey = key.publicKey;
           var privateKey = key.privateKey;

           var exportPublicKeyPromise =  cryptoSubtle.exportKey("jwk", publicKey)
           exportPublicKeyPromise.then(
                function(keydata) {
                    sessionStorage.setItem("ITEM1",JSON.stringify(keydata));
                }
            );
           
           var exportPrivateKeyPromise =  cryptoSubtle.exportKey("jwk", privateKey)
           exportPrivateKeyPromise.then(
                function(keydata) {
                    sessionStorage.setItem("ITEM2",JSON.stringify(keydata));
                }
            );
           
           //importKey("PUBLIC");
           

           
           
        });
}

function generateKeyForIE(counter)
{
		var generateOp = subtle.generateKey({
	        name: "RSA-OAEP",
	        modulusLength: 2048, // can be 1024, 2048, or 4096
	        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
	        hash: {
	            name: "SHA-256"
	        }, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
	    },
	    true, // whether the key is extractable (i.e. can be used in
				// exportKey)
	    ["encrypt", "decrypt"] // must be ["encrypt", "decrypt"] or ["wrapKey",
								// "unwrapKey"]
	);
	generateOp.oncomplete = function (e) 
	{ 
		var key = e.target.result; //
		var publicKey = key.publicKey; 
		var privateKey =key.privateKey;
		
		
		var exportPublicKeyPromise = subtle.exportKey("jwk", publicKey);
		var publicKeyString = "Public Key"; 
		exportPublicKeyPromise.oncomplete =	function(e1) { 
			var keydata = e1.target.result; 
			
			publicKeyString =	String.fromCharCode.apply(null, new Uint8Array(keydata)); //
			//testPublicKeyMap.set("Key_"+counter,JSON.stringify(publicKeyString).replace(/\\"/g, '"'));
			
			testPublicKeyMap["Key_"+counter] = publicKeyString; 
		}
	
		var exportPrivateKeyPromise = subtle.exportKey("jwk",	privateKey); 
		var privateKeyString = "Private Key";
		exportPrivateKeyPromise.oncomplete = function(e1) { 
			var keydata = e1.target.result; 
			privateKeyString = String.fromCharCode.apply(null, new Uint8Array(keydata)); 
			//testPrivateKeyMap.set("Key_"+counter,JSON.stringify(privateKeyString).replace(/\\"/g,'"')); 
			testPrivateKeyMap["Key_"+counter] = privateKeyString; 
			generated--;
			if(generated == 0) 
			{ 
				writeKeysToFile();
				//makeTextFile(JSON.stringify(testPrivateKeyMap).replace(/\\"/g, '"')) 
			} 
		}
	 }
	 
}

function writeKeysToFile()
{
	
	var finalKeyBlob = "Public Key \n\n";
	var myPublicKeyJson = {};
	// myPublicKeyJson.KeyType = "Public Key";
	myPublicKeyJson.myMap = testPublicKeyMap;
	var publicKeyJSON = JSON.stringify(testPublicKeyMap,null,'\t');
	finalKeyBlob = finalKeyBlob+publicKeyJSON;
	
	finalKeyBlob = finalKeyBlob+"\n\n Private Key \n\n";
	
	var myPrivateKeyJson = {};
	// myPrivateKeyJson.KeyType = "Private Key";
	myPrivateKeyJson.myMap = testPrivateKeyMap;
	var privateKeyJSON = JSON.stringify(testPrivateKeyMap,null,'\t');
	finalKeyBlob = finalKeyBlob+privateKeyJSON;
	
	makeTextFile(finalKeyBlob);
	
}


function makeTextFile(text) {
	var textFile = null;
	    var data = new Blob([text], {type: 'text/plain'});

	    // If we are replacing a previously generated file we need to
	    // manually revoke the object URL to avoid memory leaks.
	    if (textFile !== null) {
	      window.URL.revokeObjectURL(textFile);
	    }
	    // textFile = window.URL.createObjectURL(data);  //For browsers except from IE
	    textFile = window.navigator.msSaveBlob(data, 'file.txt');
	    return textFile;
	  };
	  

/*if(sessionStorage.getItem("ITEM1") == null && sessionStorage.getItem("ITEM2") == null)
{
	generateKey();
}*/


function test()
{
	var string = '{"dataMap":{"loginId":"ideamaker","corporateCode":"5001"}}';
	RSA_encrypt("Key_1",string,function(encryptedData){
	})
}



function RSA_encrypt(refPointer,data,callback)
{
	 var importPromise = importKey("PUBLIC",refPointer);
	 if(!importPromise.then){
		importPromise.oncomplete = function (e) {
			var cryptoKey = e.target.result;
	    	try {
	    		var encOp = encrypt(cryptoKey,data);
	    		encOp.oncomplete = function (e) {
					var encrypted = e.target.result;
					callbackEncryptedData(encrypted,callback);

	    		};
	    		encOp.onerror = function (e) {
	    	        console.log(e);
	    	    };
	    	 } catch (err) {
	             console.log(err);
	         }
	     }
	 }
	 else{
		 importPromise.then(function(cryptoKey){

			 var encOp = encrypt(cryptoKey,data);
			 encOp.then(function(encrypted) {
				 	callbackEncryptedData(encrypted,callback);
	    		})
	    		.catch(function(err) {
	    			console.error(err);
	    		});
		     }, function(e){
		     	console.log(e.message)
		     } );
	 }


}

function encrypt(cryptoKey,data)
{
	var encOp = cryptoSubtle.encrypt({
		name: "RSA-OAEP",
		 hash: { name: "SHA-256" }
	},
	cryptoKey, // from generateKey or importKey above
	asciiToUint8Array(data) // ArrayBuffer of data you want to encrypt
	);
	return encOp;
}

function callbackEncryptedData(encrypted,callback)
{
	var encryptedData = bytesToHexString(encrypted);
	callback(encryptedData);
}


function exportKey(keyObj)
{
	 var exportPublicKeyPromise =  cryptoSubtle.exportKey("jwk", keyObj)
     exportPublicKeyPromise.then(
          function(keydata) {
              sessionStorage.setItem("ITEM1",JSON.stringify(keydata));
          }
      );
     
}

function RSA_decrypt(data,refPointer,callback)
{
	 var importPromise = importKey("PRIVATE",refPointer);
     
	 if(!importPromise.then){
		 importPromise.oncomplete = function (e) {
				var cryptoKey = e.target.result;
	    	 try{
		    	 var decOp = decrypt(cryptoKey,data);
		    	 decOp.oncomplete = function (e) {
					var decrypted = e.target.result;
					callBackDecryptedData(decrypted, callback);
		        };
		    	decOp.onerror = function (e) {
			            console.error(e);
		        };
	    	 }
	    	 catch (err) {
	             console.log(err);
	         }
		 }
	 }
	 else{
		 importPromise.then(function(cryptoKey){
	    	 var decryptedData = "";
	    	 var decOp = decrypt(cryptoKey,data);
	    	 decOp.then(function(decrypted) {
		        	decryptedData = decryptedData + bytesToASCIIString(decrypted);
		        	callBackDecryptedData(decrypted, callback);
		        })
		        .catch(function(err) {
		            console.error(err);
		        });
	     });
	 }
	
}

function decrypt(cryptoKey,data)
{
	var decOp =cryptoSubtle.decrypt({
        name: "RSA-OAEP",
        hash: { name: "SHA-256" }
	    },
	    cryptoKey, // from generateKey or importKey above
	    byteToUint8Array(data) // ArrayBuffer of the data
	);
	return decOp;
}

function callBackDecryptedData(decrypted, callback)
{
	var decryptedData = bytesToASCIIString(decrypted);
	callback(decryptedData);
}

function bytesToASCIIString(bytes) {
    return String.fromCharCode.apply(null, new Uint8Array(bytes));
}

function bytesToHexString(bytes) {
    if (!bytes)
        return null;

    bytes = new Uint8Array(bytes);
    var hexBytes = [];

    for (var i = 0; i < bytes.length; ++i) {
        var byteString = bytes[i].toString(16);
        if (byteString.length < 2)
            byteString = "0" + byteString;
        hexBytes.push(byteString);
    }

    return hexBytes.join("");
}

function hexStringToUint8Array(hexString) {
    if (hexString.length % 2 != 0)
        throw "Invalid hexString";
    var arrayBuffer = new Uint8Array(hexString.length / 2);

    for (var i = 0; i < hexString.length; i += 2) {
        var byteValue = parseInt(hexString.substr(i, 2), 16);
        if (byteValue == NaN)
            throw "Invalid hexString";
        arrayBuffer[i / 2] = byteValue;
    }

    return arrayBuffer;
}

function hexToUint8Array(hexData)
{
	var bytes = new Uint8Array(Math.ceil(hexData.length / 2));
	for (var i = 0; i < bytes.length; i++)
	{
		bytes[i] = parseInt(hexData.substr(i * 2, 2), 16);
	}
	return bytes;
}

function byteToUint8Array(byteArray) {
    var uint8Array = new Uint8Array(byteArray.length);
    for(var i = 0; i < uint8Array.length; i++) {
        uint8Array[i] = byteArray[i];
    }

    return uint8Array;
}


function failAndLog(error) {
    console.log(error);
}

function asciiToUint8Array(str) {
    var chars = [];
    for (var i = 0; i < str.length; ++i)
        chars.push(str.charCodeAt(i));
    return new Uint8Array(chars);
}


function importKey(keyType,refPointer)
{
	var cryptoKey_RAW = null;
	
	var importKeyType = "";
	if(keyType == "PUBLIC"){
		importKeyType = ['encrypt'];
		cryptoKey_RAW = publicKeyMap[refPointer];
	}
	else{
		importKeyType = ['decrypt'];
		cryptoKey_RAW = privateKeyMap[refPointer];
	}
	var cryptoKey;
	if(window.msCrypto)
	{
		cryptoKey = asciiToUint8Array(cryptoKey_RAW);
	}
	else
	{
		cryptoKey = JSON.parse(cryptoKey_RAW);
	}
	
	var importPromise = cryptoSubtle.importKey('jwk', cryptoKey, {   // these are the algorithm options
				name: "RSA-OAEP",
				hash: {name: "SHA-256"}, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
				},false,  importKeyType);
	
    return importPromise;
}


function cryptoRand()
{
	const randomBuffer = new Uint32Array(1);
	(window.crypto || window.msCrypto).getRandomValues(randomBuffer);
	return ( randomBuffer[0] / (0xffffffff + 1) );
}

function generateAESKey(keyLength){
	  var randomstring = Math.floor(cryptoRand() * 9);
	  
	  for (var i=0; i < (keyLength-1); i++) {
	    var rnum = Math.floor(cryptoRand() * chars.length);
	    randomstring += chars.substring(rnum,rnum+1);
	  }
	  return randomstring;
	};


// export {RSA_encrypt, RSA_decrypt, generateAESKey};
// module.exports = {RSA_encrypt, RSA_decrypt, generateAESKey}
// exports = {
// 	RSA_encrypt: RSA_encrypt,
// 	RSA_decrypt: RSA_decrypt,
// 	generateAESKey: generateAESKey
// };

