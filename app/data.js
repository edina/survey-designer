class DataStorage {
    constructor(el){
        this.formKey = "current-form";
        if(el) {
            this.formKey = el;
        }
    }

    setData(data){
        if(localStorage) {
            localStorage.setItem(this.formKey, JSON.stringify(data));
        }
        else {
            console.log("There is no localStorage");
        }
    }

    getData(){
        if(localStorage) {
            return JSON.parse(localStorage.getItem(this.formKey));
        }
        else {
            console.log("There is no localStorage");
            return '';
        }
    }
}

export default DataStorage;
