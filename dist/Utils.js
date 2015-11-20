
(function(__root__, __define__){
  var define = function define(dependencies, factory) {

    var factory = factory || dependencies;
    var dependencies = (Array.isArray(dependencies) && dependencies) || [];

    if ( typeof __define__ === 'function' && __define__.amd){
      __define__(dependencies, factory);
    } else if ( typeof __define__ === 'function' && __define__.cmd){
      __define__(dependencies, function(require, exports, module){
        module.exports = factory.apply(__root__, dependencies.map(function(m){
          return require(m);
        }));
      });
    } else if (typeof exports === 'object'){
      module.exports = factory.apply(__root__, dependencies.map(function(m){
        return require(m);
      }));
    } else{
      var name = document.currentScript.src.replace(/(^.*?)([^\/]+)\.(js)(\?.*$|$)/, '$2');
      name = name.replace('.min', '');
      __root__[name] = factory.apply(__root__, dependencies.map(function(m){
        return __root__[m.replace(/^.*\//, '')];
      }));
    }
  };

  define(function(){

  var Utils = {};

  Utils.indent =  (function(){
    var indentStr = function indentStr(n, s){
      var n = n || 0;
      var s = s || ' ';
      var str = '';
      for (var i=0; i<n; i++){
        str += s;
      }
      return str;
    }
    return function indentBlock(n, b, s){
      var indent_str = indentStr(n, s);
      return b.replace(/^/g, indent_str).replace(/\n/g, '\n'+indent_str);
    };
  })();

  Utils.indent.skipFirstLine = function skipFirstLine (n, b, s){
    return Utils.indent(n, b, s).substr(n);
  };

  Utils.attrs =(function(){
    var dontEnums = [
      '__defineGetter__',
      '__lookupSetter__',
      'hasOwnProperty',
      'toLocaleString',
      '__defineSetter__',
      '__proto__',
      'isPrototypeOf',
      'toString',
      '__lookupGetter__',
      'constructor',
      'propertyIsEnumerable',
      'valueOf'
    ];

    var hasOwnProperty = (function(){
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      return function (obj, key){
        return hasOwnProperty.call(obj, key);
      };
    })();

    return function attrs(obj){
      var self = [];
      var proto = [];
      var all = [];

      for (var key in obj){
        if (hasOwnProperty(obj, key)){
          self.push(key);
          all.push(key);
        }
        else if(dontEnums.indexOf(key) < 0){
          proto.push(key);
          all.push(key);
        }
      }
      return {
        self: self,
        proto: proto,
        all: all
      };
    }

  })(); 

  Utils.slice = function slice(obj){
    return Utils.attrs(obj).self.map(function(key){return [key, obj[key]]});
  };

  Utils.sliceStr = function(string){
    return Array.prototype.slice.call(string);
  };

  Utils.render = function render(template, values, hook){
    var hook = hook || function(i){return i};
    return template.split('%>').map(function(piece){
      var p  = piece.split('<%');
      return (p[0] || '') + ((p[1] && hook(values[p[1].replace(/^\s*(\w+)\s*$/,'$1')])) || '');
    }).join('');
  };

  Utils.inspect = function inspect(obj, depth){
    var indent = Utils.indent;
    var inspect = Utils.inspect;
    var attrs = Utils.attrs;

    if (typeof depth !== 'number')
      var depth = 3;

    if ( obj && typeof obj.inspect === 'function'){
      return obj.inspect(depth);
    }
    var t = typeof obj;
    if (t === 'undefined' ){
      return 'undefined'
    }
    else if (t === 'boolean' || t === 'number'){
      return obj.toString();
    }
    else if (t === 'string'){
      return JSON.stringify(obj);
    }
    else if (t === 'function'){
      if (obj.name){
        return '[Function: ' + obj.name + ']';
      }
      else {
        return '[Function]';
      }
    }
    else if (t === 'object'){
      if (obj === null){
        return 'null'
      }
      else if (obj instanceof RegExp || obj instanceof Date){
        return obj.toString();
      }
      else if (obj instanceof Array){
        if (depth < 0){
          return '[Array]';
        }
        else if (obj.length <= 0){
          return '[]';
        }
        else {
          var content = obj.map(function(item){
            return inspect(item, depth-1);
          });
          var content_str = content.join(',\n');
          if (content_str.length < 80){
            content_str = content.join(', ');
          }
          return '[ ' + indent.skipFirstLine(2, content_str) +' ]';
        }
      }
      else{
        if (depth < 0){
          return '[Object]';
        }
        else {
          var keys = attrs(obj).self; 
          if (keys.length <= 0){
            return '{}';
          }
          else {
            var content = keys.map(function(key){
              if (/[a-zA-Z_$][a-zA-Z-$0-9]*/.test(key)){
                var key_str = key;
              }
              else {
                var key_str = inspect(key);
              }
              return  key_str + ': ' + inspect(obj[key], depth-1);
            });
            var content_str = content.join(',\n');
            if (content_str.length < 80){
              content_str = content.join(', ');
            }
            return '{ ' + indent.skipFirstLine(2, content_str) +' }';
          }
        }
      }
    }
  };

  Utils.color = (function(){
    var render = Utils.render;
    var colors = {
      'bold' : [1, 22],
      'italic' : [3, 23],
      'underline' : [4, 24],
      'inverse' : [7, 27],
      'white' : [37, 39],
      'grey' : [90, 39],
      'black' : [30, 39],
      'blue' : [34, 39],
      'cyan' : [36, 39],
      'green' : [32, 39],
      'magenta' : [35, 39],
      'red' : [31, 39],
      'yellow' : [33, 39]
    };
    return function color(c, str){
      return render(
        '\u001b[<%left%>m<%str%>\u001b[<%right%>m',
        { left: colors[c][0], right: colors[c][1], str: str}
      )
    };
  })();

  Utils.surround = function surround(pair, str){
    var left = pair.substr(0, pair.length/2);
    var right = pair.substr(pair.length/2);
    return left + str + right;
  }

  Utils.merge = function merge(target, obj){
    var attrs = Utils.attrs;
    var result = {};

    var target_keys = attrs(target).self;
    var obj_keys = attrs(obj).self;

    target_keys.forEach(function(key){
      result[key] = target[key];
    });
    obj_keys.forEach(function(key){
      result[key] = obj[key];
    });
    return result;
  };

  Utils.kv = function(key, value){
    var obj = {};
    obj[key] = value;
    return obj
  }

  Utils.importScope = function importScope(name){
    return Utils.render(
      'for (this.__inject_key__ in <%name%>){ eval("var "+this.__inject_key__+"="+"<%name%>"+"."+this.__inject_key__)}; delete this.__inject_key__;'
      ,{name: name}
    );
  };

  Utils.uniqueId = (function(){
    var count = 0;
    return function uniqueId(){
      return count++;
    }
  })();

  Utils.uniqueId.own = function(){
    return (function(){
      var count = 0;
      return function uniqueId(){
        return count++;
      }
    })()
  };

  Utils.equal = function equal(a, b){
    return (
      (typeof a === typeof b) && (
        (a === b) || (
          (typeof a.equal === 'function') 
          && (!!(a.equal(b)))
        ) || (
          (a instanceof Array) && (b instanceof Array) && (Utils.equal.array(a, b))
        )
      )
    );
  };

  Utils.equal.array = function equalArray(a, b){
    return a.map(function(e, i){
      return [e, b[i]];
    }).reduce(function(last, item){
      return last && Utils.equal(item[0], item[1]);
    }, a.length === b.length);
  };

  return Utils;
});


})(this, typeof define !== 'undefined' && define);
