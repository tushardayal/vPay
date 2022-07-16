var fs = require('fs');
var path = require('path');
var rootdir = "";
var permissionsPlatformsJSFile = path.join(rootdir, "platforms/android/platform_www/plugins/cordova-plugin-android-permissions/www/permissions.js");
var permissionsWWWJSFile = path.join(rootdir, "www/plugins/cordova-plugin-android-permissions/www/permissions.js");

module.exports = function(ctx) {
    console.log('Removing permission SET_DEBUG_APP');
    var permissionFilesPaths = [permissionsPlatformsJSFile,permissionsWWWJSFile];
    for(let path of permissionFilesPaths){
        fs.readFile( path, "utf8", function( err, data )
        {
            if (err)
                return console.log( err );
            var result = data;
            var lineToReplace= `this.SET_DEBUG_APP = 'android.permission.SET_DEBUG_APP';`;
            result = result.replace( lineToReplace, "" );
            fs.writeFile( path, result, "utf8", function( err )
            {
                if (err)
                    return console.log( 'permissionsJSFile ',err );
                console.log('Removed permission SET_DEBUG_APP from',path);
            } );
        } );
    }
  
};
