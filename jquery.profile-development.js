var 
	// development build profile
	// assumes Dojo's dojo and utils packages
	// are subdirectories of this project
	profile = {
        
        basePath: ".",
        
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
                location: "."
            }
        ]
    };


// turn off INFO and TRACE output for the Closure Compiler
Packages.com.google.javascript.jscomp.Compiler.setLoggingLevel(Packages.java.util.logging.Level.WARNING);
