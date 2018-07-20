/**
 * Created by jyb on 17-2-8.
 */
var express = require('express');
var router = express.Router();

router.get('/:code',function(req,res){

    var code = req.params.code;

    req.models.satellite.get(code,function(err,satellite){
        if(err) return res.send("0");
        res.send(JSON.stringify(satellite));
    })
})


module.exports = router;