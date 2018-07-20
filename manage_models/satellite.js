/**
 * Created by jyb on 17-2-8.
 */
module.exports = function (db) {

    return db.define("satellite", {
         code:{type:"text",key:true},
         description:{type:"text"}
    });
};
