"use strict";

/*global module, require, __dirname*/

var fs = require("fs"),
    path = require("path"),
    csv = require("csv"),
    lunr = require("lunr");

module.exports = function(errors) {
    var index = lunr(function() {
	this.field("srid");
	this.field("auth_name");
	this.field("auth_srid");
	this.field("srtext");
	this.field("proj4text");

	this.ref("srid");
    }),
	docs = {},
	
	ready = false,
	onReady;

    fs.readFile(
	path.join(__dirname, "../data/spatial_ref_sys.csv"),
	"utf8"
	, function(error, data) {
	    if (error) {
		errors(error);
	    } else {
		csv.parse(data, {}, function(error, result) {
		    if (error) {
			errors(error);
		    } else {
			var header;

			result.forEach(function(row, i) {
			    if (i === 0) {
				header = row;
				
			    } else {
				var doc = {};

				header.forEach(function(columnTitle, i) {
				    doc[columnTitle] = row[i];
				});

				if (doc.srtext.indexOf("deprecated") >= 0) {
				    // Filter out deprecated CRS.
				    return;
				}
				
				docs[doc.srid] = doc;

				index.add(doc);
			    }
			});

			ready = true;
			if (onReady) {
			    onReady();
			}
		    }
		});
	    }
	}
    );
    
    var m = function(term) {
	return index.search(term)
	    .map(function(r) {
		return {
		    doc: docs[r.ref],
		    score: r.score
		};
	    });
    };

    m.ready = function(callback) {
	if (ready) {
	    callback();
	} else {
	    onReady = callback;
	}
    };

    return m;
};
