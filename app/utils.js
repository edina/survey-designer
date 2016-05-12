import modal from 'bootstrap';
import modalTemplate from './templates/modal.jst!';

/**
 * check if string ends with suffix
 * @param {string} str - the string that needs to be checked if ends with
 * @param {string} suffix - the string with which the string ends with
 * @returns {boolean} true|false
 */
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * @param {string} path - filename
 * @returns {string} the extension of the filename
 */
function getExtension(path) {
    return path.substring(path.length, path.lastIndexOf('.')+1);
}

/**
 * @param {string} path - filename/url
 * @returns {string} name without extension of the path/url
 */
function getFilenameFromURL(path){
    return path.substring(path.length, path.lastIndexOf('/')+1);
}

/**
 * @returns {object} with all the parameters of the url
 */
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

/**
 * create and show modal window with some feedback message
 * @param {string} msg - message that is needed to be displayed
 */
function giveFeedback(msg){
    if($("#feedback").length ===0){
        $("body").append(makeAlertModal("feedback", msg));
    }else{
        $("#feedback").find('.alert').html(msg);
    }
    $('#feedback').modal('show');
}

/**
 * check if a sting is JSON compliant
 * @param {string} str - string that needs to be checked
 * @returns {boolean} true|false
 */
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        console.error(e);
        return false;
    }
    return true;
}

/**
 * show/hide loading icon
 * @param {boolean} param - boolean for showing or not the loading icon
 */
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

/**
 * extract number from id e.g. text-2 --> extract 2
 * @param {string} id
 * @returns {integer} number that is part of the id
 */
function numberFromId(id){
    return parseInt(id.substring(id.length, id.lastIndexOf('-')+1));
}

/**
 * extract type from id e.g. text-2 --> text
 * @param {string} id
 * @returns {string} type of the field
 */
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
