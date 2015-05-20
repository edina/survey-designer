function init() {
    
}

function createMenu() {
    var res = [];
    for (var i=0; i<config.options.length; i++) {
        res.push('<button type="button" class="btn btn-default btn-lg" aria-label="Left Align">\n');
        res.push('<span class="glyphicon glyphicon-'+config.options[i]+'" aria-hidden="true"></span>\n');
        res.push('</button>');
    }
}