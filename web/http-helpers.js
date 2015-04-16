var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var Q = require('q');

exports.headers = headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  'Content-Type': "text/html"
};

// As you progress, keep thinking about what helper functions you can put here!

exports.sendResponse = function(response, obj, status){
  status = status || 200;
  response.writeHead(status, headers);
  response.end(obj);
};

exports.collectData = function(request, callback){
  var data = "";
  request.on("data", function(chunk){
    data += chunk;
  });
  request.on("end", function(){
    callback(data);
  });
};

exports.send404 = function(response){
  exports.sendResponse(response, '404: Page not found', 404);
};

exports.sendRedirect = function(response, location, status){
  status = status || 302;
  response.writeHead(status, {Location: location});
  response.end();
};

////////////////////////////////////////////////
// Node callback pattern
////////////////////////////////////////////////

exports.serveAssets = function(res, asset, callback) {
  var encoding = {encoding: 'utf8'};

  // 1. check in public folder
  fs.readFile( archive.paths.siteAssets + asset, encoding, function(err, data){
    if(err){
      // 2. file doesn't exist in public, check archive folder
      fs.readFile( archive.paths.archivedSites + asset, encoding, function(err, data){
        if(err){
          // 3. file doesn't exist in either location
          callback ? callback() : exports.send404(res);
        } else {
          // file exists, serve it
          exports.sendResponse(res, data);
        }
      });
    } else {
      // file exists, serve it
      exports.sendResponse(res, data);
    }
  });
};

////////////////////////////////////////////////
// Basic Promise Pattern
////////////////////////////////////////////////
/*
exports.serveAssetsQ1 = function(res, asset, callback) {
  var encoding = {encoding: 'utf8'};
  var readFile = Q.denodeify(fs.readFile);

  var promise = readFile(archive.paths.siteAssets + asset, encoding);

  promise
    .then(function(contents) {
      contents && exports.sendResponse(res, contents);
    }).catch(function(err) {
      return readFile(archive.paths.archivedSites + asset, encoding);
    })
    .then(function(contents) {
      contents && exports.sendResponse(res, contents);
    }).catch(function(err) {
      callback ? callback() : exports.send404(res);
    });
};

////////////////////////////////////////////////
// Advanced promise pattern
////////////////////////////////////////////////

exports.serveAssetsQ2 = function(res, asset, callback) {
  var encoding = {encoding: 'utf8'};
  var readFile = Q.denodeify(fs.readFile);

  var assetPaths = [
    archive.paths.siteAssets,
    archive.paths.archivedSites
  ];

  var sendAsset = function(paths){
    return readFile(paths.pop()+asset, encoding)
      .then(function(contents) {
        return exports.sendResponse(res, contents);
      })
      .catch(function(err) {
        return paths.length ? sendAsset(paths) :
              (callback ? callback() : exports.send404(res));
      });
  }

  return sendAsset(assetPaths);
};
*/