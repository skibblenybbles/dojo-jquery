dojo-jquery
===========

Tools for using jQuery in Dojo applications

##Motivation

`<script>` tags block the browser from processing the remainder of an HTML
document's content until the referenced JavaScript file has loaded.
Asynchronous script loading techniques work around this problem by fetching
JavaScript files without blocking and running them immediately after they load.

Dojo gives you great tools for loading JavaScript asynchronously with its
`require()` function. jQuery has fairly basic tools for loading JavaScript
asynchronously with its `$.getScript()` function.

The purpose of this project is to provide advanced asynchronous script loading
capabilities to existing jQuery apps with minimal required code changes. The
project is also useful for Dojo applications that wish to mix in some jQuery
code.

##Usage

_For basic information on using Dojo, check out [the Dojo toolkit](http://dojotoolkit.org/)._

Set up the `<head>` of your HTML document with a `window.dojoConfig` setting
and load the Dojo JavaScript file:

```html
<!DOCTYPE html>
<html>
    <head>
        
        <meta charset="UTF-8" />
        
        <title>dojo-jquery demo</title>
        
        <!-- set up the dojoConfig and load Dojo -->
        <!-- ideally, this should be the only <script> tag on the page -->
        <script>
            window.dojoConfig = { async: true };
        </script>
        <script src="js/dojo/dojo.js"></script>
        
        <!-- asynchronous script loading code will go here -->
        
    </head>
    <body>
    
    ...
    
    </body>
</head>
```

Use Dojo's `require()` to load the `jquery/require` module. You can now use
these tools to load different versions of jQuery and per-version plugins.

```html
<script>
require(["jquery/require"], function(jRequire) {
    
    // load jQuery 1.8.3 and some plugins and then run a callback
    // function that will receive the loaded jQuery populated
    // with the loaded plugins
    jRequire(
        "1.8.3", 
        [
            "js/lib/jquery-plugin1.min.js",
            "js/lib/jquery-plugin2.min.js"
            // etc...
        ],
        function($) {
            
            $(document).ready(function() {
                
                // do something with jQuery and the plugins loaded above
            });
        }
    );
});
</script>
```

Perhaps you have plugins that depend on each other and have to be loaded in
order. You can pass several plugin arrays to `jRequire` and it will load 
each in sequence and then run any callbacks you've passed it.

```html
<script>
require(["jquery/require"], function(jRequire) {
    
    jRequire(
        "1.8.3", 
        [
            "js/lib/jquery-plugin1.min.js",
            "js/lib/jquery-plugin2.min.js"
        ],
        [
            "js/lib/jquery-depends-on-plugin1.min.js"
        ]
        function($) {
            
            $(document).ready(function() {
                
                // do something with jQuery and the plugins loaded above
            });
        }
    );
});
</script>
```

With this methodology, you can transform the existing `<script>` tags in the
`<head>` of your HTML document to be loaded asynchronously. The following code
is the "traditional" way to write the last example.

```html
<head>
    
    ...
    
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script src="js/lib/jquery-plugin1.min.js"></script>
    <script src="js/lib/jquery-plugin2.min.js"></script>
    <script src="js/lib/jquery-depends-on-plugin1.min.js"></script>
    
</head>
```

If you are loading any JavaScript files that depend on jQuery (and potentially
other plugins) but that aren't written as proper jQuery plugins, you may need
to update the files.

The problem is that the jRequire function sets the global `jQuery` and `$` 
values to the requested jQuery version with the requested plugins installed during
the duration of time it takes to load all of the requested plugins. `jQuery` 
and `$` are set back to their previous global values
afterwards.

If your JavaScript files are written as proper jQuery plugins, then they likely
already contain a wrapping closure that captures the current `jQuery` global
in their scope, e.g.

```javascript
(function($) {
    
    // set up my jQuery plugin
    $.fn.myAwesomePlugin = function() {
        
        // ...
        return this;
    };
    
})(jQuery);
```

This will work correctly with the system, because the `jQuery` argument passed
to the closure will be correct at the point that the loaded JavaScript file is
executed. A script like this would fail:

```javascript
function usefulGlobalFunction() {
    
    $('.useful').doSomethingUseful();
}
```

The problem is that the script does not use a closure to capture the global
value of `jQuery` or `$`, so when `usefulGlobalFunction()` gets called,
`$` will not be defined (or may be defined to another version of jQuery)
and havoc will ensue.

JavaScript files like the previous example will need to be modified by
wrapping their content in a closure that captures the `jQuery` global. If any
functions or variables you define in the JavaScript need to be used globally
by other JavaScript code, be sure to export them. The previous example
would become:

```javascript
(function($) {
    
    function usefulGlobalFunction() {

        $('.useful').doSomethingUseful();
    }
    
    // export the global
    window.usefulGlobalFunction = usefulGlobalFunction;
    
})(jQuery);
```

Using globals that are required by independent scripts can be very error-prone
and difficult to debug and maintain, especially when using asynchronous
script loading, so consider whether you can eliminate the need for globals
by combining similar functionality into the closure of a single script.

Finally, when using asynchronous script loading, scripts will finish loading
at random points in time. The document may or may not have completed loading.
Be careful to use jQuery's `$(document).ready()` in scripts that modify
the DOM or create event listeners.

##Installation

_More detailed installation instructions coming soon._

For now, I'll assume that you are familiar with Dojo and the Dojo build system.
`git clone` this project into a directory named `jquery` as a sibling to your
other Dojo applications or 
[download the .zip](https://github.com/skibblenybbles/dojo-jquery/archive/master.zip)
and extract it to the same destination.
