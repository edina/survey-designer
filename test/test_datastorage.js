import DataStorage from '../app/data';
import {assert} from 'chai';

describe('#DataStorage', () => {
    var dataStorage = new DataStorage();
    var data = {"test": "test"};

    it('checkSaveData', () => {
        dataStorage.setData(data);
        assert.deepEqual(data, dataStorage.getData());
    });

    it('checkGetData', () => {
        assert.deepEqual(JSON.parse(localStorage.getItem('current-form')), dataStorage.getData());
    });
});
