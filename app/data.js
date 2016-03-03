class DataStorage {
    constructor(el){
        this.formKey = "current-form";
        if(el) {
            this.formKey = el;
        }
    }

    addField(key, value){
        var data = this.getData();
        data[key] = value;
        this.setData(data);
    }

    /**
    * save data on localStorage
    * @param {Object} data a json object of the data
    */
    setData(data) {
        if(localStorage) {
            localStorage.setItem(this.formKey, JSON.stringify(data));
        }
        else {
            console.log("There is no localStorage");
        }
    }

    /**
    * get data from local storage
    */
    getData() {
        if(localStorage) {
            return JSON.parse(localStorage.getItem(this.formKey));
        }
        else {
            console.log("There is no localStorage");
            return '';
        }
    }

    /**
    * search for field in data
    * @param {String} id of the field
    * @return {Object} field that was found
    */
    searchForFieldId(id) {
        return this.searchForFieldProperty("id", id);
    }

    /**
    * search for field in data
    * @param {String} key of the field
    * @param {String} value to search for in the fields
    * @return {Object} field that was found
    */
    searchForFieldProperty(key, value) {
        return this.getData().fields.find(x => x[key] === value);
    }

    searchForFieldProperties(key, value) {
        return this.getData().fields.properties.find(x => x[key] === value);
    }

    /**
    * update field in the data of localStorage
    * @param {String} id of the field
    * @param {String} key to update
    * @param {String} value to update
    */
    updateField(id, key, value) {
        var data = this.getData();
        var index = data.fields.findIndex(x => x.id === id);
        data.fields[index].properties[key] = value;
        this.setData(data);
    }
}

export default DataStorage;
