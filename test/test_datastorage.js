import DataStorage from '../app/data';
import chai from 'chai';
var assert = chai.assert;
import testJSON  from './test.json!';

describe('#DataStorage', () => {
    var dataStorage = new DataStorage();
    var data = testJSON;

    it('checkSaveData', () => {
        dataStorage.setData(data);
        assert.deepEqual(data, dataStorage.getData());
    });

    it('checkGetData', () => {
        assert.deepEqual(JSON.parse(localStorage.getItem('current-form')), dataStorage.getData());
    });

    it('searchFieldId', () => {
        var id = "checkbox-3";
        assert.equal(dataStorage.searchForFieldId(id).id, id);
    });

    it('searchForFieldProperty', () => {
        var type = "checkbox";
        console.log(dataStorage.searchForFieldProperty("type", type));
    });

    it('addField', () => {
        var geometry = {
		    "type": "Polygon"
        };
        dataStorage.addField("geometry", geometry);
        var data = dataStorage.getData();
        assert.deepEqual(data.geometry, geometry);
    });

    it('removeField', () => {
        dataStorage.removeField("geometry");
        var data = dataStorage.getData();
        assert.isUndefined(data.geometry, "No geometry is defined");
    });
});
