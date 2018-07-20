/**
 * Created by jyb on 16-12-17.
 */

module.exports = function (db) {

    return db.define("orderform", {
        id:{type:"serial", key:true},
        acktime:{type:"date"},
        ordername:{type:"text"},
        remark:{type:"text"},
        state:{type:"integer"},
        // uid:{type:"integer"},
        ordernum:{type:"text"},
    });

};