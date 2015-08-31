import Backbone from 'backbone';
import DragDropper from '../dragdrop';
import FieldGenerator from '../field_generate'
import Convertor from '../convert';
import * as utils from '../utils';

export class SurveyView extends Backbone.View {

    initialize () {
        this.$el = $("#content");
        this.renderEl = "mobile-content";
        this.render();
    }

    render () {
        //add main content for rendering form elements
        this.$el.html('<div class="mobile"><button type="button" class="btn btn-default" id="form-save">'+i18n.t("menu.save")+'</button>'+
                      '<div class="'+this.renderEl+'"></div></div>'+
                      '<div id="loader"><img src="styles/images/ajax-loader.gif"></div>');
        $("#loader").hide();
        let dragdropper = new DragDropper(this.renderEl);
        dragdropper.enableDrop();
        dragdropper.enableSorting();
        this.fieldGenerator = new FieldGenerator("."+this.renderEl);
        this.fieldGenerator.render('general');
        this.enableEvents();
        return this;
    }

    enableEvents() {
        let convertor = new Convertor();
        $(document).on('click', '#form-save', function(){
            var formInJSON = convertor.getForm();
            var options = {
                remoteDir: "editors",
                path: encodeURIComponent(formInJSON.title)+".json",
                data: JSON.stringify(formInJSON)
            };
            var options2 = {
                remoteDir: "editors",
                path: encodeURIComponent(formInJSON.title)+".edtr",
                data: convertor.JSONtoHTML(formInJSON).join("")
            };
            console.log(convertor.JSONtoHTML(formInJSON))

            if(utils.getParams().public === true){
                options.urlParams = {
                    'public': 'true'
                };
                options2.urlParams = {
                    'public': 'true'
                };
            }

            pcapi.saveItem(options).then(function(result){
                utils.giveFeedback("Your form has been uploaded");
            });
            pcapi.saveItem(options2).then(function(result){
                utils.giveFeedback("Your form has been uploaded");
            });
        });

        //var fieldGenerator = this.fieldGenerator;
        $(document).on('click', '.get-form', $.proxy(function(e){
            var title = e.target.title.split(".")[0];
            var options = {
                "remoteDir": "editors",
                "item": e.target.title
            };

            utils.loading(true);
            pcapi.getEditor(options).then($.proxy(function(data){
                utils.loading(false);

                var dataObj = convertor.HTMLtoJSON (data, title);
                $("."+this.renderEl).html("");
                this.fieldGenerator.render('general', {"title": dataObj.title, "geoms": dataObj.geoms})
                $.each(dataObj, $.proxy(function(k, v){
                    var type = k.split("-")[1];
                    if(type !== undefined){
                        this.fieldGenerator.render(type, v);
                    }
                }, this));
            }, this));
        }, this));
    }
}