/**
 * Created by jyb on 17-1-17.
 */
var express = require('express');
var shp = require("shp");
var multiparty = require('multiparty');
var router = express.Router();
var fs=require("fs");
var tar = require('tar');
var zlib = require('zlib');
var path = require('path');
var util = require('util');
var Promise = require("bluebird");
var dateformat = require("dateformat")();
var shpOriginalfileFormat = ".tar.gz";

Promise.promisifyAll(fs);

function deleteDirectory(dir){

    fs.readdir(dir,function(err,fileList){

        if(err) return console.log(err.message);
        if(!fileList || fileList.length == 0) return fs.rmdir(dir,function(err){if(err)console.log(err.message)});
        Promise.all(fileList.map(file => fs.unlinkAsync(path.join(dir,file)))).then(function(){
            fs.rmdir(dir,function(err){if(err)console.log(err.message)});
        }).catch(err => console.log(err));
    })
}


router.post('/', function (req,res){

    var form = new multiparty.Form({uploadDir:global.cfg.tempDir,
        allocate:1000 * 1024 * 1024});

    form.parse(req, function(err, fields, files) {

        if(err) return res.json({status:0});
        var file = files.fileUpload[0];
        // console.log(file);
        var originalFilename = file.originalFilename;
        var extraPath = path.join(global.cfg.tempDir,originalFilename.replace(shpOriginalfileFormat,""));
        var extractor = tar.Extract({path:extraPath});
        console.log(extractor);
        fs.createReadStream(file.path).pipe(zlib.Gunzip()).pipe(extractor).on("close",function(){

            fs.readdir(extraPath,function(err,fileList){

                if(err || fileList.length <= 1) return res.json({status:0});
                var shpName = "";
                for(var index = 0,len = fileList.length;index < len;index++){

                    if(fileList[index].indexOf("shp") !== -1){

                        shpName = fileList[index];
                        break;
                    }
                }

                if(!shpName) return res.json({status:0});

                shp.readFile(path.join(extraPath + "/",shpName.replace(".shp","")),function(error, data){
                    fs.unlink(file.path,function(err){if(err)console.log(err)});
                    deleteDirectory(extraPath);
                    if(error) res.json({status:0});
                    else res.json({status:1,data:data})
                })
            })
        })
    })
})

module.exports = router;