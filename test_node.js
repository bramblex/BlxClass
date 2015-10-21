#!/usr/bin/env node

var Class = require('./dist/Class');

var A = Class('A', Object)
  .method('constructor', function(){
    this.name = 'a';
  });

var B = Class('B', A);
B.method('run', function(){
  console.log('run');
});

var C = B.extend('C')
  .method('run', function(a){
    console.log('run a: ', a);
  })
  .method('run', function(a,b){
    console.log('run a, b: ', a, b);
  });

var c = C();
c.run();
c.run(1);
c.run(1,2);
