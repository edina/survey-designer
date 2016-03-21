module.exports = {
    'Demo test survey designer' : function (browser) {
        browser
            .url('http://localhost:8080/dist/#survey-designer')
            .waitForElementVisible('body', 1000)
            .waitForElementVisible('.dropdownMenu', 1000)
            .click('.dropdownMenu')
            .isVisible('.dropdown-menu')
            .isVisible('button[id=add-attribute]')
            .isVisible('button[id=define-bbox]')
            .pause(1000)
    },

    'Add an attribute': function (browser) {
        browser
            .click('button[id=add-attribute]')
            .waitForElementVisible('input[name=attribute-key]', 1000)

    },

    'Create a text field': function (browser) {
        browser
            .click('.dropdownMenu')
            .click('a[title=text]')
            .waitForElementVisible('.fieldcontain-text', 1000)
    }
};
