//import chai, { expect } from 'chai';
//import sinon from 'sinon';
//import sinonChai from 'sinon-chai';
//import System from 'systemjs';
//import '../config.js';
//import testForm  from './test.edtr!';

let chai = require('chai'),
    path = require('path'),
    fs = require('fs');

//console.log(testForm)
chai.should();

console.log(__dirname)

let Convertor = require(path.join(__dirname, '..', 'convert'));

describe('Converter', ()=> {
    describe('#getForm', () => {
        let converter;

        beforeEach(() => {
            fs.readFile('./test.edtr', function(err, html){
                if (err){
                    throw err;
                }
                console.log(html);
                $('body').append(html);
                converter = new Convertor();
            })
        })

        it('returns form', () => {
            console.log(converter.getForm())
        })
    })
});