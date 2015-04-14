"use strict";

/*global require, process, JSON*/

var search = require("./js/srid-search.js")(
    function(error) {
	process.stderr.write(error);
    }
);

search.ready(function() {
    process.argv.forEach(function(value, i) {
	if (i > 1) {
	    console.log();
	    console.log(value);
	    console.log("=========");
	    
	    search(value).forEach(function(result) {
		console.log("Score: " + result.score);
		console.log(result.doc);
		console.log();
	    });
	}
    });
});
