import Backbone from 'backbone';
import DragDropper from './dragdrop';
import FieldGenerator from './field_generate';
import Convertor from './convert';
import i18next from 'i18next-client';
import * as utils from './utils';
import * as cfg from './cfg';
import modal from 'bootstrap';
import './styles/app.css!';
import pcapi from 'pcapi';
import './styles/sidebar.css!';
import menuTemplate from './templates/menu.hbs!';

export class SurveyView extends Backbone.View {

    initialize () {
        this.$mainBodyEl = $("#content");
        this.renderEl = "mobile-content";
        this.$headerMenu = $("#header-menu");
        this.cfg = cfg.getConfig();
        this.render();
    }

    doLogin () {
        $(document).on('click', '.login', function(){
            var id = "login-modal";
            pcapi.getProviders().done(function(data){
                if($("#"+id).length ===0){
                    var body = [];
                    body.push('<div class="btn-group-vertical" role="group" aria-label="...">');
                    for(var key in data){
                        body.push('<div class="btn-group" role="group">');
                        body.push('<button type="button" class="btn btn-default provider" data-provider="'+key+'">'+key+' provider</button>');
                        body.push('</div>');
                    }
                    body.push('</div>');
                    $("body").append(utils.makeModalWindow("login-modal", "", body).join(""));
                }
                $("#"+id).modal("show");
            });
        });
    }

    enableEvents () {
        this.doLogin();
        this.enableLogin();
        this.enableFormEvents();
    }

    enableFormEvents() {
        let convertor = new Convertor();
        $(document).on('click', '#form-save', function(){
            var formInJSON = convertor.getForm();
            var title = formInJSON.title;
            if ("sid" in utils.getParams() && utils.getParams().sid !== undefined) {
                title = utils.getParams().sid;
            }
            var options = {
                remoteDir: "editors",
                path: encodeURIComponent(title)+".json",
                data: JSON.stringify(formInJSON)
            };
            var options2 = {
                remoteDir: "editors",
                path: encodeURIComponent(title)+".edtr",
                data: convertor.JSONtoHTML(formInJSON).join("")
            };

            if(utils.getParams().public === 'true'){
                options.urlParams = {
                    'public': 'true'
                };
                options2.urlParams = {
                    'public': 'true'
                };
            }

            pcapi.updateItem(options).then(function(result){
                utils.giveFeedback("Your form has been uploaded");
            });
            pcapi.updateItem(options2).then(function(result){
                utils.giveFeedback("Your form has been uploaded");
            });
        });

        $(document).on('click', '.get-form', $.proxy(function(e){
            var title = e.target.title.split(".")[0];
            var options = {
                "remoteDir": "editors",
                "item": e.target.title
            };

            this.getEditor(title, options);
        }, this));
    }

    enableLogin () {
        $(document).on('click', '.provider', function(){
            let provider = $(this).attr('data-provider');
            pcapi.setProvider(provider);
            if(provider === "dropbox"){
                pcapi.loginCloud();
            }
        });
    }

    getEditor (title, options) {
        let convertor = new Convertor();
        utils.loading(true);
        pcapi.getEditor(options).then($.proxy(function(data){
            utils.loading(false);

            if(data.error === 1){
                this.fieldGenerator.render('text');
            }
            else {
                var dataObj = convertor.HTMLtoJSON (data, title);
                $("."+this.renderEl).html("");
                this.fieldGenerator.render('general', {"title": dataObj.title, "geoms": dataObj.geoms})
                $.each(dataObj, $.proxy(function(k, v){
                    var type = k.split("-")[1];
                    if(type !== undefined){
                        this.fieldGenerator.render(type, v);
                    }
                }, this));
            }
        }, this));
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
        utils.loading(true);
        pcapi.getItems(options).then(function(data){
            var editors = data.metadata;
            var formList = [];

            if(editors != undefined){
                var editorTitle = "";
                var sid = "";
                for(var i=0; i<editors.length; i++){
                    //var name = editors[i].replace(/\/editors\/\000000000000/?/g, '');
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
            utils.loading(false);
        });
    }

    render () {
        pcapi.init({
            "url": this.cfg.baseurl,
            "version": this.cfg.version
        });
        var locale = utils.getParams().lang || 'en';
        localStorage.setItem('locale', locale);
        i18n.init({// jshint ignore:line
            ns: { namespaces: ['survey'], defaultNs: 'survey'},
            detectLngQS: 'lang'
        }, $.proxy(function(){
            $("html").i18n();
            this.renderSurvey();
            this.renderMenu();
        }, this));
        this.enableEvents();
    }

    renderMenu () {
        $('body').append(menuTemplate(this.cfg.options));
        //var dragdropper = new DragDropper();
        this.dragdropper.enableDrag();

        let loginHide = "", logoutHide = "hide";
        if ("oauth_token" in utils.getParams() && utils.getParams().oauth_token !== undefined) {
            loginHide = "hide";
            logoutHide = "";
        }else if ("sid" in utils.getParams() && utils.getParams().sid !== undefined) {
            loginHide = "hide";
            logoutHide = "";
            pcapi.setCloudLogin(this.cfg.userid);
        }

        if(this.cfg["forms-list"] === true && logoutHide === "" ){
            this.loadEditors();
        }

        this.$headerMenu.append('<li><a href="javascript:void(0)" class="login '+loginHide+'" data-target="#myModal">'+i18n.t("menu.login")+'</a></li>'+
                               '<li><a href="javascript:void(0)" class="logout '+logoutHide+'">'+i18n.t("menu.logout")+'</a></li>');
    }

    renderSurvey () {
        //add main content for rendering form elements
        this.$mainBodyEl.html('<div class="mobile"><button type="button" class="btn btn-default" id="form-save">'+i18n.t("menu.save")+'</button>'+
                      '<div class="'+this.renderEl+'"></div></div>'+
                      '<div id="loader"><img src="styles/images/ajax-loader.gif"></div>');
        //let dragdropper = new DragDropper(this.renderEl);
        this.dragdropper = new DragDropper(this.renderEl);
        this.dragdropper.enableDrop();
        this.dragdropper.enableSorting();
        this.fieldGenerator = new FieldGenerator("."+this.renderEl);
        if ("sid" in utils.getParams() && utils.getParams().sid !== undefined) {
            var title = decodeURIComponent(utils.getParams().survey);
            var options = {
                "remoteDir": "editors",
                "item": utils.getParams().sid+".edtr"
            };

            this.fieldGenerator.render('general', {"title": title});
            this.getEditor(title, options);
        }
        else {
            this.fieldGenerator.render('general');
            this.fieldGenerator.render('text');
        }
        return this;
    }

}