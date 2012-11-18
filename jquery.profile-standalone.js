var 
	// the build profile
	// assumes that this application is in a folder named
	// "jquery" with its neighbors "dojo", "dijit" and "dojox",
	// i.e. the standard way to set up Dojo projects as per
	// https://dojotoolkit.org/documentation/tutorials/1.8/build/
	profile = {
        
        basePath: "..",
        
        releaseDir: "./production",

        action: "release",
        
        cssOptimize: "comments",
        
        mini: true,
        
        optimize: "closure",
        
        layerOptimize: "closure",
        
        stripConsole: "all",
        
        layers: {
            
            // Dojo loader with the jquery package baked in
            "dojo/dojo": {
                include: [
                    "dojo/_base/kernel",
                    "dojo/i18n",
                    "jquery/require"
                ],
                customBase: true,
                boot: true
            }
        },
        
        packages: [

            {
                name: "dojo",
                location: "./dojo"
            },

            {
                name: "jquery",
                location: "./jquery"
            }
        ]
    };


// turn off INFO and TRACE output for the Closure Compiler
Packages.com.google.javascript.jscomp.Compiler.setLoggingLevel(Packages.java.util.logging.Level.WARNING);
