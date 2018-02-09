/* Copyright 2017-present Samsung Electronics Co., Ltd. and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var http = require('http');
var port = 8080;
var path = '/light';

var Blinkt = require('blinkt');
var leds = new Blinkt();

var fs = require('fs');
var netiface = require('dns');

var lightcontrol = require('./lightcontrol.js');

var numPixels = 8;

var server = http.createServer(function(req, res) {
  // The path for onoff.html is relevant. Here I assume that it's in the same directory of
  // the server file and iotjs binary. Change it in relevant to your iotjs binary path
  // Otherwise, put server_html.js and onoff.html in the same directory and have a symoblic
  // link of iotjs binary in that directory as well.

  console.log(req.url);
  var myval = req.url.split('/');
  console.log(myval[1]);
  //console.log()

  //netiface.lookupService('127.0.0.1', 22, (err, hostname, service), console.log(hostname, service));

  netiface.lookup('Zenbook-UX32A', function(err, address) {
    console.log(address);
  });

  //console.log(netiface.localName())

  if (myval[1] == 'light') {
    console.log('yahoo');
    fs.readFile('onoff.html', function(err, data) {
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': data.length
      });
      res.write(data);
      res.end();
    });

  } else {
    console.log('no way jose');
    res.writeHead(200, {
      "Content-Type": "text/plain"
    });
    res.write(req.url);
    res.end();

  }
 if (req.method == 'POST') {
    receive(req, function(data) {
      console.log(data);
      if (data.indexOf("Rainbow") >= 0) {
        //showRainbowLight();
        lightcontrol.showRainbowLight();
      }
      else if (data.indexOf("Single") >= 0) {
      //  singleLightOn();
      lightcontrol.singleLightOn();
      }
    });
  }
}).listen(port);

function receive(incoming, callback) {
  var data = '';

  incoming.on('data', function(chunk) {
    data += chunk;
  });

  incoming.on('end', function() {
    callback ? callback(data) : '';
  });
}

function status(res, data) {
  var isJson = (typeof data === 'object');

  if (isJson) {
    data = JSON.stringify(data);
  }

  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Content-Type': isJson ? 'application/json' : 'text/plain',
  };

  res.writeHead(200, headers);
  res.end(data);
};

