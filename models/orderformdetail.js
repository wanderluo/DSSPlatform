/**
 * Created by jyb on 16-12-17.
 */
module.exports = function (db) {

    return db.define("orderformdetail", {
        ofid:{type:"number",key:true},
        rstate:{type:"number",key:true},
        rsid:{type:"number",key:true}
    });
};