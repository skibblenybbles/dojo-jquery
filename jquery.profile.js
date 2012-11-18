var 
    // files to exlude from the mini build
    miniExcludes = {
		"README.md": 1,
		"LICENSE": 1,
		"package.json": 1,
		"jquery.profile.js": 1,
		"jquery.profile-standalone.js": 1
	},
	
	// regular expression for test modules (here for future-readiness)
	testRx = /tests\//,
	
	// regular expression for built files
	buildRx = /^jquery\/build\//,
	
	// regular expression for excluding dojo in a subdirectory
	// (included for development convenience, where dojo is in a subdirectory)
	dojoRx = /^jquery\/dojo\//,
	
	// regular expression for JavaScript filenames
	jsRx = /\.js$/
	
	// the build profile
    profile = {
    
	    resourceTags: {
	        
	        ignore: function(filename, mid) {
	            
	            return buildRx.test(mid) || dojoRx.test(mid);
	        },
	        
    		test: function(filename, mid){
    			return testRx.test(filename);
    		},
            
    		miniExclude: function(filename, mid){
    			return testRx.test(mid) || mid in miniExcludes;
    		},
            
    		amd: function(filename, mid){
    		    return jsRx.test(filename);
    		}
    	}
    };
