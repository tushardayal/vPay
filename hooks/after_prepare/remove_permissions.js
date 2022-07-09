#!/usr/bin/env node
//
// This hook removes specific permissions from the AndroidManifest.xml
// The AndroidManifest is re-generated during the prepare stage,
// so this must be run on the "after_prepare" hook.
//


// Configure the permissions to be forcefully removed.
// NOTE: These permissions will be removed regardless of how many plugins
//       require the permission. You can check the permission is only required
//       by the plugin you *think* needs it, by looking at the "count" shown in
//       your /plugins/android.json file.
//       If the count is more than 1, you should search through
//       the /plugins/&lt;plugin-name&gt;/plugin.xml files for &lt;uses-permission&gt; tags.

var permissionsToRemove = [ "REQUEST_INSTALL_PACKAGES"];


var fs = require('fs');
var path = require('path');
var rootdir = "";
var manifestFile = path.join(rootdir, "platforms/android/app/src/main/AndroidManifest.xml");

fs.readFile( manifestFile, "utf8", function( err, data )
{
    if (err)
        return console.log( err );

    var result = data;
    for (var i=0; i<permissionsToRemove.length; i++)
        // result = result.replace( "&lt;uses-permission android:name=\"android.permission." + permissionsToRemove[i] + "\" /&gt;", "" );
        var lineToReplace= `<uses-permission android:name="android.permission.${permissionsToRemove[i]}" />`;
        result = result.replace( lineToReplace, "" );

    fs.writeFile( manifestFile, result, "utf8", function( err )
    {
        if (err)
            return console.log( err );
    } );
} );
