'use strict';
class DataStorage {
    constructor(){
        this.formKey = "current-form";
    }

    setForm(data){
        if(localStorage) {
            localStorage.setItem(this.formKey, JSON.stringify(data));
        }
        else {
            console.log("There is no sessionStorage");
        }
    }

    getForm(){
        if(localStorage) {
            return JSON.parse(localStorage.getItem(this.formKey));
        }
        else {
            console.log("There is no sessionStorage");
            return '';
        }
    }
}

export default DataStorage;