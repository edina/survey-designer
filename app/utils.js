'use strict';

function typeFromId(id){
    var s = id.indexOf('-') + 1;
    return id.substr(s, id.lastIndexOf('-') - s);
};

function numberFromId(id){
    return parseInt(id.substring(id.length, id.lastIndexOf('-')+1));
};

export {typeFromId, numberFromId}