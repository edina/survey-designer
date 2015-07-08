import Backbone from 'backbone';
import DragDropper from '../dragdrop';
import menuTemplate from '../templates/menu.hbs!';
import '../styles/sidebar.css!';

export class MenuView extends Backbone.View {

    initialize () {
        this.$el = $("body");
        this.render();
    }

    render () {
        //this.$el.html(template);
        var options = [
            "text",
            "range",
            "textarea",
            "checkbox",
            "radio",
            "select",
            "image",
            "audio",
            "warning",
            "gps",
            "help",
            "dtree"
        ];
        this.$el.append(menuTemplate(options));
        var dragdropper = new DragDropper();
        dragdropper.enableDrag();

        return this;
    }

}