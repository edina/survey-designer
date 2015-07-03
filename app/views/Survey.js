import Backbone from 'backbone';
import DragDropper from '../dragdrop';

export class SurveyView extends Backbone.View {

    initialize () {
        this.$el = $("#content");
        this.renderEl = "mobile-content";
        this.render();
    }

    render () {
        this.$el.html('<div class="mobile"><div class="'+this.renderEl+'"></div></div>');
        let dragdropper = new DragDropper(this.renderEl);
        dragdropper.enableDrop();
        dragdropper.enableSorting();
        return this;
    }

}