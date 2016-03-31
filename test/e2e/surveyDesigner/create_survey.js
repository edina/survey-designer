var fs = require('fs');
var editor = JSON.parse(fs.readFileSync('test/test.json').toString('utf8'));
var http = require("http");

module.exports = {
    'Demo test survey designer' : function (browser) {
        browser
            .url('http://localhost:8080/dist/?sid=test#survey-designer')
            .waitForElementVisible('body', 1000)
            .waitForElementVisible('.dropdownMenu', 1000)
            .click('.dropdownMenu')
            .isVisible('.dropdown-menu')
            .isVisible('button[id=add-attribute]')
            .isVisible('button[id=define-bbox]')
            .pause(1000);
    },

    'Add an attribute': function (browser) {
        browser
            .click('button[id=add-attribute]')
            .waitForElementVisible('input[name=attribute-key]', 1000);
        for (var key in editor.extra) {
            browser
                .setValue('input[name=attribute-key]', key)
                .setValue('input[name=attribute-value]', editor.extra[key])
                .verify.valueContains('input[name=attribute-key]', key)
                .verify.valueContains('input[name=attribute-value]', editor.extra[key]);
        }
    },

    'Create text field': function (browser) {
        var field = editor.fields[0];
        var type = field.type;
        browser
            .click('.dropdownMenu')
            .click('a[title='+field.type+']')
            .waitForElementVisible('.fieldcontain-'+field.type, 1000)
            .clearValue('#'+type+'-1 input[name=label]')
            .setValue('#'+type+'-1 input[name=label]', field.label)
            .verify.valueContains('#'+type+'-1 input[name=label]', field.label)
            .clearValue('#'+type+'-1 input[name=prefix]')
            .setValue('#'+type+'-1 input[name=prefix]', field.properties.prefix)
            .verify.valueContains('#'+type+'-1 input[name=prefix]', field.properties.prefix)
            .clearValue('#'+type+'-1 input[name=placeholder]')
            .setValue('#'+type+'-1 input[name=placeholder]', field.properties.placeholder)
            .verify.valueContains('#'+type+'-1 input[name=placeholder]', field.properties.placeholder)
            .clearValue('#'+type+'-1 input[name=max-chars]')
            .setValue('#'+type+'-1 input[name=max-chars]', field.properties["max-chars"])
            .verify.valueContains('#'+type+'-1 input[name=max-chars]', field.properties["max-chars"]);

        if(field.required){
            browser
                .click('#text-1 input[name=required]')
                .assert.attributeEquals("#text-1 input[name=required]", "checked", "true");
        }

        if(field.persistent){
            browser
                .click('#text-1 input[name=persistent]')
                .assert.attributeEquals("#text-1 input[name=persistent]", "checked", "true");
        }
    },

    'Create range field': function (browser) {
        var field = editor.fields[5];
        var type = field.type;
        browser
            .click('.dropdownMenu')
            .click('a[title='+type+']')
            .waitForElementVisible('.fieldcontain-'+type, 1000)
            .clearValue('#'+type+'-1 input[name=label]')
            .setValue('#'+type+'-1 input[name=label]', field.label)
            .verify.valueContains('#'+type+'-1 input[name=label]', field.label)
            .clearValue('#'+type+'-1 input[name=step]')
            .setValue('#'+type+'-1 input[name=step]', field.properties.step)
            .verify.valueContains('#'+type+'-1 input[name=step]', field.properties.step)
            .clearValue('#'+type+'-1 input[name=min]')
            .setValue('#'+type+'-1 input[name=min]', field.properties.min)
            .verify.valueContains('#'+type+'-1 input[name=min]', field.properties.min)
            .clearValue('#'+type+'-1 input[name=max]')
            .setValue('#'+type+'-1 input[name=max]', field.properties.max)
            .verify.valueContains('#'+type+'-1 input[name=max]', field.properties.max);

        if(field.required){
            browser
                .click('#'+type+'-1 input[name=required]')
                .assert.attributeEquals("#"+type+"-1 input[name=required]", "checked", "true");
        }

        if(field.persistent){
            browser
                .click('#'+type+'-1 input[name=persistent]')
                .assert.attributeEquals("#"+type+"-1 input[name=persistent]", "checked", "true");
        }

    },

    'Create radio field': function (browser) {
        var field = editor.fields[7];
        var type = field.type;
        browser
            .click('.dropdownMenu')
            .click('a[title='+type+']')
            .waitForElementVisible('.fieldcontain-'+type, 1000)
            .clearValue('#'+type+'-1 input[name=label]')
            .setValue('#'+type+'-1 input[name=label]', field.label)
            .verify.valueContains('#'+type+'-1 input[name=label]', field.label);

        field.properties.options.forEach(function(element, index){
            var i = index + 1;
            browser
                .click('.add-radio')
                .clearValue('#'+type+'-1-'+i)
                .setValue('#'+type+'-1-'+i, element.value)
                .verify.valueContains('#'+type+'-1-'+i, element.value);
        });
        /*console.log(require('path').resolve(__dirname))
        browser
            .click('#'+type+'-1 .upload-image')
            .setValue('input#upload-radio-1', require('path').resolve(__dirname + '/upload.jpg'))*/


        if(field.required){
            browser
                .click('#'+type+'-1 input[name=required]')
                .assert.attributeEquals("#"+type+"-1 input[name=required]", "checked", "true");
        }

        if(field.persistent){
            browser
                .click('#'+type+'-1 input[name=persistent]')
                .assert.attributeEquals("#"+type+"-1 input[name=persistent]", "checked", "true");
        }

    },

    'Create checkbox field': function (browser) {
        var field = editor.fields[26];
        var type = field.type;
        browser
            .click('.dropdownMenu')
            .click('a[title='+type+']')
            .waitForElementVisible('.fieldcontain-'+type, 1000)
            .clearValue('#'+type+'-1 input[name=label]')
            .setValue('#'+type+'-1 input[name=label]', field.label)
            .verify.valueContains('#'+type+'-1 input[name=label]', field.label);

        field.properties.options.forEach(function(element, index){
            var i = index + 1;
            browser
                .click('.add-checkbox')
                .clearValue('#'+type+'-1-'+i)
                .setValue('#'+type+'-1-'+i, element.value)
                .verify.valueContains('#'+type+'-1-'+i, element.value);
        });

        if(field.required){
            browser
                .click('#'+type+'-1 input[name=required]')
                .assert.attributeEquals("#"+type+"-1 input[name=required]", "checked", "true");
        }

        if(field.persistent){
            browser
                .click('#'+type+'-1 input[name=persistent]')
                .assert.attributeEquals("#"+type+"-1 input[name=persistent]", "checked", "true");
        }
    },

    'Create textarea field': function (browser) {
        var field = editor.fields[32];
        var type = field.type;
        browser
            .click('.dropdownMenu')
            .click('a[title='+type+']')
            .waitForElementVisible('.fieldcontain-'+type, 1000)
            .clearValue('#'+type+'-1 input[name=label]')
            .setValue('#'+type+'-1 input[name=label]', field.label)
            .verify.valueContains('#'+type+'-1 input[name=label]', field.label)
            .clearValue('#'+type+'-1 input[name=placeholder]')
            .setValue('#'+type+'-1 input[name=placeholder]', field.properties.placeholder)
            .verify.valueContains('#'+type+'-1 input[name=placeholder]', field.properties.placeholder);

        if(field.required){
            browser
                .click('#'+type+'-1 input[name=required]')
                .assert.attributeEquals("#"+type+"-1 input[name=required]", "checked", "true");
        }

        if(field.persistent){
            browser
                .click('#'+type+'-1 input[name=persistent]')
                .assert.attributeEquals("#"+type+"-1 input[name=persistent]", "checked", "true");
        }
    },

    'Create decision tree field': function (browser) {
        var field = editor.fields[33];
        var type = field.type;
        var url = "http://129.215.169.95:8150/1.3/pcapi/editors/local/00000000-0000-0000-0000-000000000000/test/test-1.json";
        browser
            .click('.dropdownMenu')
            .click('a[title='+type+']')
            .waitForElementVisible('.fieldcontain-'+type, 1000)
            .clearValue('#'+type+'-1 input[name=label]')
            .setValue('#'+type+'-1 input[name=label]', field.label)
            .verify.valueContains('#'+type+'-1 input[name=label]', field.label);

        browser
            .setValue('input.add-dtree', require('path').resolve(__dirname + '/dtree.json'))
            .click('#'+type+'-1 .upload-dtree')
            .click('.close')
            .assert.attributeContains('#'+type+'-1 .dtree-url', 'href', url);

        if(field.required){
            browser
                .click('#'+type+'-1 input[name=required]')
                .assert.attributeEquals("#"+type+"-1 input[name=required]", "checked", "true");
        }

        if(field.persistent){
            browser
                .click('#'+type+'-1 input[name=persistent]')
                .assert.attributeEquals("#"+type+"-1 input[name=persistent]", "checked", "true");
        }

        browser.pause(5000, function () {
            console.log('yyyyyyyyyyyyy')
        var request = http.request({
            host: "129.215.169.95",
            port: 8150,
            path: "/1.3/pcapi/editors/local/00000000-0000-0000-0000-000000000000/test/test-1.json",
            method: "GET"
        }, function (response) {
            console.log('xxxxxxxxxxxxxx')
            console.log(response)
            browser.end();
            //browser
            //    .assert.equal(response.headers["content-length"], 14022, 'Same file size');
        }).on("error", function (err) {
            console.log(err);
        });
        });
    }
};
