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
    var visibilityStorage = new DataStorage("visibility");
    var data = dataStorage.getData();
    let visibilityData = visibilityStorage.getData();
    //merging existing changes with the json that comes from the form
    //mostly applied on visibility rules that have been changed
    if (data !== null) {
        formInJSON = Object.assign(data, formInJSON);
    }
    formInJSON.fields.map(function(element){
        for (var id in visibilityData) {
            if(element.id === id) {
                element.properties.visibility = visibilityData[id];
            }
        }
        return element;
    });
    dataStorage.setData(formInJSON);
    return formInJSON;
}

export {saveData};
