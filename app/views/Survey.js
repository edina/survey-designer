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
        this.$el.html('<div class="mobile"><button type="button" class="btn btn-default" id="form-save">'+i18n.t("menu.save")+'</button><div class="'+this.renderEl+'"></div></div>');
        let dragdropper = new DragDropper(this.renderEl);
        dragdropper.enableDrop();
        dragdropper.enableSorting();
        var fieldGenerator = new FieldGenerator("."+this.renderEl);
        fieldGenerator.render('general');
        this.enableEvents();
        return this;
    }

    enableEvents() {
        let convertor = new Convertor();
        $(document).on('click', '#form-save', function(){
            console.log(convertor.getForm());
        });

        $(document).on('click', '.get-form', function(){
            var title = this.title.split(".")[0];
            var options = {
                "remoteDir": "editors",
                "item": this.title
            };

            utils.loading(true);
            pcapi.getEditor(options).then(function(data){
                utils.loading(false);
                $("."+this.renderEl).append(convertor.renderExistingForm(data, title));
            });
        });
    }
}