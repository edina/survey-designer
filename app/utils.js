'use strict';

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

function giveFeedback(msg){
    if($("#feedback").length ===0){
        $("body").append(makeAlertModal("feedback", msg).join(""));
    }else{
        $("#feedback").find('.alert').html(msg);
    }
    $('#feedback').modal('show');
}

function loading(param){
    $("#loader").toggle(param);
}

function makeAlertModal(id, msg){
    var body = [];
    body.push('<div class="alert">');
    body.push(msg);
    body.push('</div>');
    return makeModalWindow(id, 'Feedback', body);
}

function makeModalWindow(id, title, body, footer){
    var form = new Array();
    form.push('<div class="modal fade" id="'+id+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">');
    form.push('<div class="modal-dialog" role="document">');
    form.push('<div class="modal-content">');
    form.push('<div class="modal-header">');
    form.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
    form.push('<h4 class="modal-title" id="myModalLabel">'+title+'</h4>');
    form.push('</div>');
    form.push('<div class="modal-body">')
    form = form.concat(body);
    form.push('</div>');
    form = form.concat(footer);
    form.push('</div></div></div>');
    return form;
}

function numberFromId(id){
    return parseInt(id.substring(id.length, id.lastIndexOf('-')+1));
};

function typeFromId(id){
    var s = id.indexOf('-') + 1;
    return id.substr(s, id.lastIndexOf('-') - s);
};

export {getParams, giveFeedback, loading, makeAlertModal, makeModalWindow, numberFromId, typeFromId};