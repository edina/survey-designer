import modal from 'bootstrap';
import modalTemplate from './templates/modal.jst!';

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getExtension(path) {
    return path.substring(path.length, path.lastIndexOf('.')+1);
}

function getFilenameFromURL(path){
    return path.substring(path.length, path.lastIndexOf('/')+1);
}

function getParams(){
    var query = window.location.search.substring(1);
    var queryString = {};
    var params = query.split("&");
    for(var i=0; i<params.length; i++){
        var pair = params[i].split("=");
        if (typeof queryString[pair[0]] === "undefined") {
            queryString[pair[0]] = pair[1];
            // If second entry with this name
        }
        else if (typeof queryString[pair[0]] === "string") {
            var arr = [ queryString[pair[0]], pair[1] ];
            queryString[pair[0]] = arr;
            // If third or later entry with this name
        }
        else {
            queryString[pair[0]].push(pair[1]);
        }
    }
    return queryString;
}

function giveFeedback(msg){
    if($("#feedback").length ===0){
        $("body").append(makeAlertModal("feedback", msg).join(""));
    }else{
        $("#feedback").find('.alert').html(msg);
    }
    $('#feedback').modal('show');
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        console.error(e);
        return false;
    }
    return true;
}

function loading(param){
    if(param === true){
        $("#loader").css('visibility', 'visible');
    }else{
        $("#loader").css('visibility', 'hidden');
    }
}

/**
 * create a modal window with alert/feedback
 * @param id of the modal window
 * @param msg that will be contained on the body of the modal
 * @returns html of the modal window
 */
function makeAlertModal(id, msg){
    let options = {
        "id": id,
        "title": "Feedback",
        "body": msg,
        "footer": "",
        "size": ""
    };
    return makeModalWindow(options);
}

/**
 * create a modal window
 * @param options.id id of the div of the modal window
 * @param options.title of the modal
 * @param options.body body of the modal
 * @param options.footer footer of the modal
 * @param options.size the size of the modal (empty string or modal-lg)
 * @returns html of the modal window
 */
function makeModalWindow(options){
    return modalTemplate(options);
}

function numberFromId(id){
    return parseInt(id.substring(id.length, id.lastIndexOf('-')+1));
}

function typeFromId(id){
    var s = id.indexOf('-') + 1;
    return id.substr(s, id.lastIndexOf('-') - s);
}

export {
    endsWith,
    getExtension,
    getFilenameFromURL,
    getParams,
    giveFeedback,
    isJsonString,
    loading,
    makeAlertModal,
    makeModalWindow,
    numberFromId,
    typeFromId
  };
