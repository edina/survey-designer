import Backbone from 'backbone';
import DragDropper from '../dragdrop';
import FieldGenerator from '../field_generate'
import Convertor from '../convert';

export class SurveyView extends Backbone.View {

    initialize () {
        this.$el = $("#content");
        this.renderEl = "mobile-content";
        this.render();
    }

    render () {
        this.$el.html('<div class="mobile"><button type="button" class="btn btn-default" id="form-save">'+i18n.t("menu.save")+'</button><div class="'+this.renderEl+'"></div></div>');
        let dragdropper = new DragDropper(this.renderEl);
        dragdropper.enableDrop();
        dragdropper.enableSorting();
        let fieldGenerator = new FieldGenerator("."+this.renderEl);
        fieldGenerator.render('general');
        this.enableEvents();
        this.loadEditors();
        return this;
    }

    loadEditors () {
        var userId = pcapi.getUserId();
        console.log(userId)
        var options = {
            "remoteDir": "editors",
            "userId": userId
        };
        pcapi.getItems(options).then(function(data){
            //var form_links = new Array();
            //var by_editor = new Array();
            var editors = data.metadata;
            console.log(editors);
            
        });
    }

    enableEvents() {
        $(document).on('click', '#form-save', function(){
            let convertor = new Convertor();
            console.log(convertor.getForm());
        });
    }
}