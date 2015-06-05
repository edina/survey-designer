import Backbone from 'backbone';
import DragDropper from '../dragdrop';

export class SurveyView extends Backbone.View {

    initialize () {
        this.$el = $("#content");
        this.render();
    }

    render () {
        this.$el.html('<div class="mobile"><div class="mobile-content"></div></div>');
        let dragdropper = new DragDropper();
        dragdropper.enableDrop();
        dragdropper.enableSorting();
        return this;
    }

}