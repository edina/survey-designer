import Convertor from './convert';
import DataStorage from './data';

/**
 * save data on localstorage by getting them from dom and converting to JSON
 * @returns {Object} form data in JSON format
*/
function saveData(element) {
    var formData = $(element).html();
    var convertor = new Convertor();
    var formInJSON = convertor.getForm(formData);
    var dataStorage = new DataStorage();
    var data = dataStorage.getData();
    if (data !== null) {
        //formInJSON = Object.assign(formInJSON, data);
    }
    dataStorage.setData(formInJSON);
    return formInJSON;
}

export {saveData};
