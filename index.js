var express = require('express');
var app = express();
var fs = require('fs');
var Jimp = require("jimp");

app.get('/scp/:number', function(req, res){
  var request = require('request');
  var cheerio = require('cheerio');
  url = 'http://www.scp-wiki.net/scp-'+req.params.number;

  // The structure of our request call
  // The first parameter is our URL
  // The callback function takes 3 parameters, an error, response status code and the html

  request(url, function(error, response, html) {
    // First we'll check to make sure no errors occurred when making the request

    if (!error) {
      var $ = cheerio.load(html);
      var tags = []
      var taglist = $('.page-tags').children().children();
      var a = taglist.first();
      tags[0] = a.text();
      for (var i = 0; i < taglist.length; i++) {
        a = a.next();
        tags[i+1] = a.text();
      }
      console.log(tags)
      new Jimp(1080, 1080, 0x00FFFFFF, (err, image) => {
        Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font => {
          image.print(
            font,
            10,
            10,
            'SCP-' + req.params.number,
            1080,
            (err, image, { x, y }) => {
              print(function(image){
                image.getBuffer(Jimp.MIME_PNG, function(err, buffer){
                  res.write(buffer)
                });
              }, image, tags, font, x, y);
            }
          );
        });
      });
    }
  });
});

var i = 0;
function print(cb, image, tags, font, x, y){
  if(i < tags.length) {
    if(tags[i].charAt(0) !== "_") {
      image.print(font, 10, y + 20, tags[i], 1080, (err, image, { x, y }) => {
        i += 1;
        print(cb, image, tags, font, x, y);
      });
    } else {
      i += 1;
      print(cb, image, tags, font, x, y);
    }
  } else if(i >= tags.length) {
    cb(image);
  }
}

app.listen(3000);
