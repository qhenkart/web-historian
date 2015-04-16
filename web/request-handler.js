var path = require('path');
var archive = require('../helpers/archive-helpers');
var urlParser = require('url');
var utils = require('./http-helpers');

var actions = {
  'GET': function(request, response){
    var parts = urlParser.parse(request.url);
    var urlPath = parts.pathname === '/' ? '/index.html' : parts.pathname;
    utils.serveAssets(response, urlPath, function(){
      archive.isUrlInList(urlPath.slice(1), function(found){
        if( found ){ // yes:
          // redirect to loading
          utils.sendRedirect(response, '/loading.html');
        } else {
          // 404
          utils.send404(response);
        }
      });
    });
  },
  
  'POST': function(request, response){
    utils.collectData(request, function(data){
      var url = data.split('=')[1]; // www.google.com
      // in sites.txt ?
      archive.isUrlInList(url, function(found){
        if( found ){ // yes:
          // is archived ?
          archive.isURLArchived(url, function(exists){
            if( exists ){ // yes:
              // redirect to page
              utils.sendRedirect(response, '/'+url);
            } else { // no:
              // redirect to loading
              utils.sendRedirect(response, '/loading.html');
            }
          });
        } else { // no:
          // append to sites
          archive.addUrlToList(url, function(){
            // redirect to loading
            utils.sendRedirect(response, '/loading.html');
          });
        }
      });
    });
  }
};

exports.handleRequest = function(request, response) {
  var action = actions[request.method];
  if( action ){
    action(request, response);
  } else {
    utils.sendResponse(response, "Not Found", 404);
  }
};