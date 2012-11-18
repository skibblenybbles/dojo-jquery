var 
    // files to exlude from the mini build
    miniExcludes = {
		"README.md": 1,
		"LICENSE": 1,
		"package.json": 1,
		"jquery.profile.js": 1,
		"jquery.profile-standalone.js": 1
	},
	
	// regular expression for test modules
	testRx = /tests\//,
	
	// regular expression for ignoring dojo and util
	// module ids (for author's development setup)
	ignoreRx = /^jquery\/(dojo|util)\//,
	
	// regular expression for JavaScript filenames
	jsRx = /\.js$/
	
	// the build profile
    profile = {
    
	    resourceTags: {
	        
	        ignore: function(filename, mid) {
	            
	            return ignoreRx.test(mid);
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
