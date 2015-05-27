var $                   = require('jquery'),
    Backbone            = require('backbone'),
    template            = require("../templates/home.html"),
    DragDropper         = require("../js/dragdrop"),
    dragdropper         = new DragDropper();

Backbone.$ = $;

module.exports = Backbone.View.extend({
    el: "#content",

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(template);
        dragdropper.enableDrag();
        dragdropper.enableDrop();
        dragdropper.enableSorting();
        return this;
    }

});