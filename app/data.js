class DataStorage {
    constructor(el){
        this.formKey = "current-form";
        if(el) {
            this.formKey = el;
        }
    }

    /**
    * save data on localStorage
    *
    */
    setData(data) {
        if(localStorage) {
            localStorage.setItem(this.formKey, JSON.stringify(data));
        }
        else {
            console.log("There is no localStorage");
        }
    }

    getData() {
        if(localStorage) {
            return JSON.parse(localStorage.getItem(this.formKey));
        }
        else {
            console.log("There is no localStorage");
            return '';
        }
    }

    searchForFieldId(id) {
        return this.searchForFieldProperty("id", id);
    }

    searchForFieldProperty(key, value) {
        return this.getData().fields.find(x => x[key] === value);
    }

    searchForFieldProperties(key, value) {
        return this.getData().fields.properties.find(x => x[key] === value);
    }
}

export default DataStorage;
