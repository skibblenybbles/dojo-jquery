define(
    [
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/promise/all",
        "dojo/string",
        "dojo/when",
        "require"
    ], function(array, lang, Deferred, all, string, when, require) {
        
        // module:
    	//	    jquery/require

    	/*=====
    	return function(){
    		// summary:
    		//		Provides functions to configure jQuery version and source
    		//      defaults and to load jQuery and its plugins asynchronously.
    	};
    	=====*/
        
        // default configuration
        var defaults = {
            
            // default version "1" will use the latest in the "1.x.x" series, e.g. "1.8.3"
            version: "1",
            
            // load minified jQuery source?
            minified: true,
            
            // URL path to the jQuery source
            srcPath: "${scheme}ajax.googleapis.com/ajax/libs/jquery/${version}/jquery.js",
            
            // URL path to the jQuery minified source
            minifiedPath: "${scheme}ajax.googleapis.com/ajax/libs/jquery/${version}/jquery.min.js",
            
            // base URL for relative-path plugin filenames
            pluginPath: null
        },
        
        // the jQuery version cache
        // maps a fully-qualified jQuery URL to a cached jQuery instance
        jQueryCache = { },
        
        // the plugin version cache
        // maps a fully-qualified jQuery URL to a map from
        // fully-qualified jQuery plugin URLs to promises,
        // which are set to true after loading has completed
        pluginCache = { },
        
        // plugins must be loaded with window.$ and window.jQuery set
        // to the correct jQuery version instance
        // this object serves as a semaphore to synchronize loading
        // plugins with different jQuery versions
        semaphore = null,
        
        resolvejQueryURL = function(version) {
            // summary:
            //      Convert the given jQuery version string to a fully-qualified
            //      jQuery URL
            //
            // version:
            //      (String) a jQuery version
            
            var protocol = window.location.protocol,
                scheme;
            
            // use the default version?
            version = version || defaults.version;
            
            // make the URL protocol-relative unless we're
            // not using http: or https:
            
            // determine the URL scheme
            if (protocol === "http:" || protocol === "https:") {
                
                // keep the same protocol for the scheme
                scheme = "//";
            
            } else {
                
                // use HTTP protocol by default
                scheme = "http://"
            }
            
            // fill in the URL path string
            return string.substitute(
                defaults.minified ? defaults.minifiedPath : defaults.srcPath,
                {
                    scheme: scheme,
                    version: version
                }
            );
        },
        
        resolvePluginURL = function(version, url) {
            // summary:
            //      Convert the given jQuery version string and plugin URL
            //      to a fully-qualified jQuery plugin URL
            //
            // version:
            //      (String) a jQuery version
            //
            // url:
            //      (String) the plugin's fully-qualified URL
            
            var protocol,
                index,
                query,
                fragment;
            
            // is the URL fully qualified?
            if (url.slice(0, 5).toLowerCase() === "http:" || 
                url.slice(0, 6).toLowerCase() === "https:") {
                
                // leave it alone
            }
            
            // is the URL protocol-relative?
            else if (url.slice(0, 2) === "//") {
                
                protocol = window.location.protocol;
                
                // use HTTP protocol by default
                if (protocol !== "http:" && protocol !== "https:") {
                    
                    url = "http:" + url;
                }
            
            // is the URL root-relative?
            } else if (url.slice(0, 1) === "/") {
                
                // leave it alone
            
            // otherwise, it must be path-relative
            } else {
                
                // if one is defined, add the default plugin path
                // otherwise, leave it alone
                if (defaults.pluginPath) {
                    
                    url = defaults.pluginPath + (defaults.pluginPath.slice(-1) !== "/" ? "/" : "") + url;
                }
            }
            
            // split out the query and fragment
            index = url.indexOf("?");
            if (index >= 0) {
                
                query = url.slice(index + 1);
                url = url.slice(0, index);
                
                index = query.indexOf("#");
                if (index >= 0) {
                    
                    fragment = query.slice(index + 1);
                    query = query.slice(0, index);
                }
                
            } else {
                
                index = url.indexOf("#");
                if (index >= 0) {
                    
                    fragment = url.slice(index + 1);
                    url = url.slice(0, index);
                }
            }
            
            // tack on the query
            if (query) {
                
                url = url + "?" + query + "&jquery=" + encodeURIComponent(version);
            
            } else {
                
                url = url + "?jquery=" + encodeURIComponent(version);
            }
            
            // tack on the fragment?
            if (fragment) {
                
                url = url + "#" + fragment;
            }
            
            // phew!
            return url;
        },
        
        loadjQuery = function(/*String*/jQueryURL) {
            // summary:
    		//      returns a promise to return the requested version
    		//      of jQuery (or the default version if not specified)
    		//      jQueryCache[jQueryURL] will also be populated with
    		//      the version of jQuery after the promise is fulfilled
    		//
    		// jQueryURL:
    		//      (String) the fully-qualified jQuery URL
    		
    		var deferred;
    		
    		// set up the promise to load jQuery?
    		if (jQueryCache[jQueryURL] === undefined) {
    		    
    		    var deferred = new Deferred();
    		    
    		    // load the jQuery version, run noConflict(), 
    		    // store it in the cache and resolve the deferred
    		    require([jQueryURL], lang.partial(
    		        
    		        function(jQueryURL, deferred) {
    		            
    		            var jQuery = window.jQuery.noConflict(true);
    		            jQueryCache[jQueryURL] = jQuery;
    		            deferred.resolve(jQuery);
    		        },
    		        
    		        jQueryURL, deferred
    		    ));
    		    
    		    // promise to return the jQuery object
    		    jQueryCache[jQueryURL] = deferred.promise;
    		}
    		
    		return when(jQueryCache[jQueryURL]);
        },
        
        loadPlugin = function(/*String*/jQueryURL, /*String*/pluginURL) {
            // summary:
            //      returns a promise to load the given jQuery plugin
            //      into the jQuery object loaded from jQueryURL
            //      assumes that the appropriate jQuery version has been
            //      locked with lockjQuery() by the caller
            //
            // jQueryURL:
            //      (String) the fully-qualified jQuery URL
            //
            // pluginURL:
            //      (String) the fully-qualified plugin URL
            
            var cache;
            
            // get the plugin cache for its jQuery version
            if (pluginCache[jQueryURL] === undefined) {
                
                pluginCache[jQueryURL] = { };
            }
            cache = pluginCache[jQueryURL];
            
            // set up the promise to load the plugin?
            if (cache[pluginURL] === undefined) {
                
                var deferred = new Deferred();
                
                // load the plugin
                require([pluginURL], lang.partial(
                    
                    function(cache, pluginURL, deferred) {
                        
                        // clear the promise out of the cache
                        // and resolve the deferred
                        cache[pluginURL] = true;
                        deferred.resolve();
                    },
                    
                    cache, pluginURL, deferred
                ));
                
                // promise to return the jQuery object with the
                // plugin installed
                cache[pluginURL] = deferred.promise;
            }
            
            return when(cache[pluginURL]);
        },
        
        loadPlugins = function(/*String*/jQueryURL, /*Array*/pluginURLs) {
            
            // summary:
            //      returns a promise to return a jQuery object
            //      loaded from jQueryURL and populated with
            //      all of the jQuery plugins from pluginURLs
            //
            // jQueryURL:
            //      (String) the fully-qualified jQuery URL
            //
            // pluginURLs:
            //      (Array) an array of fully-qualified jQuery plugin
            //      URL strings
            
            // lock the jQuery version and load the plugins
            return when(lockjQuery(jQueryURL), lang.partial(
                
                function(jQueryURL, pluginURLs, unlock) {
                    
                    return when(
                        
                        all(array.map(pluginURLs, function(pluginURL) {
                            return loadPlugin(jQueryURL, pluginURL);
                        })),
                        
                        lang.partial(
                            
                            function(jQueryURL, unlock) {
                                
                                unlock();
                                return jQueryCache[jQueryURL];
                            },
                            
                            jQueryURL, unlock
                        )
                    );
                },
                
                jQueryURL, pluginURLs
            ));
        },
        
        lockjQuery = function(/*String*/jQueryURL) {
            // summary:
            //      returns a promise to set the global $ and jQuery
            //      values to the requested version of jQuery
            //      the promise resolves to a callback that must
            //      be invoked to unlock the global $ and jQuery values
            //
            // jQueryURL:
            //      (String) the fully-qualified jQuery URL
            
            return when(loadjQuery(jQueryURL), lang.partial(
                
                function(jQueryURL, jQuery) {
                    
                    var 
                        // this Deferred will help keep the requested
                        // version of jQuery global until it gets resolved by
                        // the unlock() callback returned by this function
                        lock = new Deferred(),
                        
                        // this guarantees that the unlock() callback
                        // is only executed once
                        once = {
                            finished: false
                        };
                    
                    // set up the semaphore?
                    if (semaphore === null) {
                        
                        semaphore = {
                            url: jQueryURL,
                            count: 1,
                            finish: new Deferred(),
                            
                            // jQuery globals to restore
                            $: window.$,
                            jQuery: window.jQuery
                        };
                        
                        // set up the jQuery globals
                        window.$ = window.jQuery = jQuery;
                        
                    } else {
                    
                        // increment the semaphore or wait for the current 
                        // locked version to finish?
                        if (semaphore.url === jQueryURL) {
                            
                            semaphore.count += 1;
                            
                        } else {
                            
                            return when(semaphore.finish.promise, lang.partial(lockjQuery, jQueryURL));
                        }
                    }
                    
                    // prepare to release the lock
                    when(lock, function() {
                        
                        var finish;
                        
                        // sanity check
                        if (semaphore === null) {
                            
                            return;
                        }
                        
                        // are we finished?
                        semaphore.count -= 1;
                        if (semaphore.count <= 0) {
                            
                            finish = semaphore.finish;
                            window.$ = semaphore.$,
                            window.jQuery = semaphore.jQuery;
                            semaphore = null;
                            
                            finish.resolve();
                        }
                    });
                    
                    // return the unlock function
                    return lang.partial(
                        
                        function(lock, once) {
                            if (!once.finished) {
                                lock.resolve();
                            } else {
                                once.finished = true;
                            }
                        },
                        
                        lock, once
                    );
                },
                
                jQueryURL
            ));
        },
        
        jRequire = function(/*[String version] [Array plugins] [Function callback]*/) {
            // summary:
            //      Loads jQuery and an array of jQuery plugins and then passes
            //      the plugin-populated jQuery object to the given callback
            //
            // version:
            //      (String) the jQuery version to load, or the default if 
            //      unspecified
            //
            // plugins:
            //      (Array) an array of plugin URLs, either absolute,
            //      protocol-relative, root-relative or path-relative.
            //      Path-relative URLs will use the default setting for pluginPath
            //      to resolve the full URL.
            //
            // callback:
            //      (Function) a function to call back when jQuery and its
            //      plugins have loaded. It will be passed the jQuery object
            //      as its first two parameters. This is a convenience to
            //      allow the callback to receive parameters named
            //      "$" and "jQuery"
            
            var version =
                    arguments.length > 0 && typeof arguments[0] === "string"
                    ?
                    arguments[0]
                    :
                    defaults.version,
                
                plugins = 
                    arguments.length > 0 && arguments[0] instanceof Array
                    ?
                    arguments[0]
                    :
                        arguments.length > 1 && arguments[1] instanceof Array
                        ?
                        arguments[1]
                        :
                        [],
                
                callback =
                    arguments.length > 0 && typeof arguments[0] === "function"
                    ?
                    arguments[0]
                    :
                        arguments.length > 1 && typeof arguments[1] === "function"
                        ?
                        arguments[1]
                        :
                            arguments.length > 2 && typeof arguments[2] === "function"
                            ?
                            arguments[2]
                            :
                            function() { };
            
            // load the plugins and run the callback
            when(
                loadPlugins(
                    resolvejQueryURL(version),
                    array.map(plugins, function(plugin) {
                        return resolvePluginURL(version, plugin);
                    })
                ),
                lang.partial(
                    function(callback, jQuery) {
                        
                        callback(jQuery, jQuery);
                    },
                    callback
                )
            );
        };
        
        jRequire.setDefaults = function(/*Object*/config) {
            // summary:
    		//		Override the jRequire's default configuration.
    		//
    		// config:
    		//      (Object) an object with optional values:
    		//
    		//      version: (String) the default version to load if none is specified.
    		//
    		//      minified: (Boolean) whether to load the minified jQuery source.
    		//
    		//      srcPath: (String) the URL path to use for loading the full jQuery source.
    		//          It has two substitution strings for "${scheme}" and "${version}".
    		//
    		//      minifiedPath: (String) the URL path to use for loading the minified jQuery source.
    		//          It has two substitution strings for "${scheme}" and "${version}".
    		//
    		//      pluginPath: (String) the base URL path to use for finding plugins that use
    		//          relative paths filenames.
    		
            lang.mixin(defaults, config);
        };
        
        return jRequire;
    }
);
