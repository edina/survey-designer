import Backbone from 'backbone';
import DragDropper from '../dragdrop';
import menuTemplate from '../templates/menu.hbs!';
import * as utils from '../utils';
import * as paths from '../paths';
import Convertor from '../convert';
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

        if(paths.getPaths()["forms-list"] === true){
            this.loadEditors();
        }
        this.$headerMenu.append('<li><a href="javascript:void(0)" class="login '+loginHide+'" data-target="#myModal">'+i18n.t("menu.login")+'</a></li>'+
                                '<li><a href="javascript:void(0)" class="logout '+logoutHide+'">'+i18n.t("menu.logout")+'</a></li>');

        return this;
    }

    loadEditors () {
        this.$headerMenu.append('<li class="dropdown">'+
                                '<a href="javascript:void(0)" class="dropdown-toggle" data-toggle="dropdown" rel="tooltip" data-placement="bottom"'+
                                ' data-original-title="'+i18n.t("menu.editors-btn-msg")+'">'+i18n.t("menu.editors")+'<b class="caret"></b></a>'+
                                '<ul class="dropdown-menu" id="forms"></ul></li>');

        var userId = pcapi.getUserId();
        var options = {
            "remoteDir": "editors",
            "userId": userId
        };
        pcapi.getItems(options).then(function(data){
            var editors = data.metadata;
            var formList = [];

            if(editors != undefined){
                var editorTitle = "";
                var sid = "";
                for(var i=0; i<editors.length; i++){
                    var name = editors[i].replace(/\/editors\/\/?/g, '');
                    if(name.indexOf(".edtr") > -1){
                        var nameNoExtension = name.split(".")[0];
                        sid = name;
                        if("sid" in utils.getParams() && nameNoExtension === utils.getParams().sid){
                            if("names" in data){
                                name = data.names[i];
                            }
                        }
                        formList.push('<li><a tabindex="-1" href="javascript: void(0)" class="get-form" title="'+sid+'">'+name+'</a></li>');
                    }
                }
                $("#forms").html(formList.join(""));
            }
        });
    }

}