'use strict';

function typeFromId(id){
    var s = id.indexOf('-') + 1;
    return id.substr(s, id.lastIndexOf('-') - s);
};

function numberFromId(id){
    return parseInt(id.substring(id.length, id.lastIndexOf('-')+1));
};

function getParams(){
    var query = window.location.search.substring(1);
    var query_string = {};
    var params = query.split("&");
    for(var i=0; i<params.length; i++){
        var pair = params[i].split("=");
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        }
        else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        }
        else {
            query_string[pair[0]].push(pair[1]);
        }
    }
    return query_string;
}

export {typeFromId, numberFromId, getParams};