import Convertor from './convert';
import DataStorage from './data';

/**
 * save data on localstorage by getting them from dom and converting to JSON
 * @returns {Object} form data in JSON format
*/
function saveData(element) {
    var convertor = new Convertor();
    var formInJSON = convertor.getForm($(element));
    var dataStorage = new DataStorage();
    var data = dataStorage.getData();
    //merging existing changes with the json that comes from the form
    //mostly applied on visibility rules that have been changed
    if (data !== null) {
        formInJSON = Object.assign(formInJSON, data);
    }
    dataStorage.setData(formInJSON);
    return formInJSON;
}

export {saveData};
