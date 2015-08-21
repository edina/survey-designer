import Backbone from 'backbone';
import DragDropper from '../dragdrop';
import menuTemplate from '../templates/menu.hbs!';
import * as utils from '../utils';
import '../styles/sidebar.css!';

export class MenuView extends Backbone.View {

    initialize () {
        this.$el = $("body");
        this.$headerMenu = $("#header-menu");
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

        let loginHide = "", logoutHide = "hide";
        if ("oauth_token" in utils.getParams() && utils.getParams().oauth_token !== undefined) {
            loginHide = "hide";
            logoutHide = "";
        }else if ("sid" in utils.getParams() && utils.getParams().sid !== undefined) {
            
        }

        this.$headerMenu.append('<li><a href="javascript:void(0)" class="login '+loginHide+'" data-target="#myModal">'+i18n.t("menu.login")+'</a></li>'+
                                '<li><a href="javascript:void(0)" class="logout '+logoutHide+'">'+i18n.t("menu.logout")+'</a></li>');

        return this;
    }

}