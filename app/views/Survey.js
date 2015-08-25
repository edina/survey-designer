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
        return this;
    }

    enableEvents() {
        $(document).on('click', '#form-save', function(){
            let convertor = new Convertor();
            console.log(convertor.getForm());
        });
    }
}