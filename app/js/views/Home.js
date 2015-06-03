import Backbone from 'backbone';
import _ from 'underscore';
import DragDropper from 'js/dragdropes6';

export class HomeView extends Backbone.View {

    initialize () {
        this.$el = $("#content");
        this.render();
    }

    render () {
        //this.$el.html(template);
        $.ajax({
            url: '/templates/home.html'
        }).done($.proxy(function(data){
            this.$el.html(_.template(data));
            var dragdropper = new DragDropper();
            dragdropper.enableDrop();
            dragdropper.enableSorting();
        }, this));
        return this;
    }

}