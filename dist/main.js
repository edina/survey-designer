"format global";
(function(){ var curSystem = typeof System != 'undefined' ? System : undefined;
/* */ 
"format global";
"exports $traceurRuntime";
(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return ;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  var $apply = Function.prototype.call.bind(Function.prototype.apply);
  function $bind(operand, thisArg, args) {
    var argArray = [thisArg];
    for (var i = 0; i < args.length; i++) {
      argArray[i + 1] = args[i];
    }
    var func = $apply(Function.prototype.bind, operand, argArray);
    return func;
  }
  function $construct(func, argArray) {
    var object = new ($bind(func, null, argArray));
    return object;
  }
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var privateNames = $create(null);
  function isPrivateName(s) {
    return privateNames[s];
  }
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  var CONTINUATION_TYPE = Object.create(null);
  function createContinuation(operand, thisArg, argsArray) {
    return [CONTINUATION_TYPE, operand, thisArg, argsArray];
  }
  function isContinuation(object) {
    return object && object[0] === CONTINUATION_TYPE;
  }
  var isTailRecursiveName = null;
  function setupProperTailCalls() {
    isTailRecursiveName = createPrivateName();
    Function.prototype.call = initTailRecursiveFunction(function call(thisArg) {
      var result = tailCall(function(thisArg) {
        var argArray = [];
        for (var i = 1; i < arguments.length; ++i) {
          argArray[i - 1] = arguments[i];
        }
        var continuation = createContinuation(this, thisArg, argArray);
        return continuation;
      }, this, arguments);
      return result;
    });
    Function.prototype.apply = initTailRecursiveFunction(function apply(thisArg, argArray) {
      var result = tailCall(function(thisArg, argArray) {
        var continuation = createContinuation(this, thisArg, argArray);
        return continuation;
      }, this, arguments);
      return result;
    });
  }
  function initTailRecursiveFunction(func) {
    if (isTailRecursiveName === null) {
      setupProperTailCalls();
    }
    func[isTailRecursiveName] = true;
    return func;
  }
  function isTailRecursive(func) {
    return !!func[isTailRecursiveName];
  }
  function tailCall(func, thisArg, argArray) {
    var continuation = argArray[0];
    if (isContinuation(continuation)) {
      continuation = $apply(func, thisArg, continuation[3]);
      return continuation;
    }
    continuation = createContinuation(func, thisArg, argArray);
    while (true) {
      if (isTailRecursive(func)) {
        continuation = $apply(func, continuation[2], [continuation]);
      } else {
        continuation = $apply(func, continuation[2], continuation[3]);
      }
      if (!isContinuation(continuation)) {
        return continuation;
      }
      func = continuation[1];
    }
  }
  function construct() {
    var object;
    if (isTailRecursive(this)) {
      object = $construct(this, [createContinuation(null, null, arguments)]);
    } else {
      object = $construct(this, arguments);
    }
    return object;
  }
  var $traceurRuntime = {
    initTailRecursiveFunction: initTailRecursiveFunction,
    call: tailCall,
    continuation: createContinuation,
    construct: construct
  };
  (function() {
    function nonEnum(value) {
      return {
        configurable: true,
        enumerable: false,
        value: value,
        writable: true
      };
    }
    var method = nonEnum;
    var symbolInternalProperty = newUniqueString();
    var symbolDescriptionProperty = newUniqueString();
    var symbolDataProperty = newUniqueString();
    var symbolValues = $create(null);
    function isShimSymbol(symbol) {
      return typeof symbol === 'object' && symbol instanceof SymbolValue;
    }
    function typeOf(v) {
      if (isShimSymbol(v))
        return 'symbol';
      return typeof v;
    }
    function Symbol(description) {
      var value = new SymbolValue(description);
      if (!(this instanceof Symbol))
        return value;
      throw new TypeError('Symbol cannot be new\'ed');
    }
    $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
    $defineProperty(Symbol.prototype, 'toString', method(function() {
      var symbolValue = this[symbolDataProperty];
      return symbolValue[symbolInternalProperty];
    }));
    $defineProperty(Symbol.prototype, 'valueOf', method(function() {
      var symbolValue = this[symbolDataProperty];
      if (!symbolValue)
        throw TypeError('Conversion from symbol to string');
      if (!getOption('symbols'))
        return symbolValue[symbolInternalProperty];
      return symbolValue;
    }));
    function SymbolValue(description) {
      var key = newUniqueString();
      $defineProperty(this, symbolDataProperty, {value: this});
      $defineProperty(this, symbolInternalProperty, {value: key});
      $defineProperty(this, symbolDescriptionProperty, {value: description});
      freeze(this);
      symbolValues[key] = this;
    }
    $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
    $defineProperty(SymbolValue.prototype, 'toString', {
      value: Symbol.prototype.toString,
      enumerable: false
    });
    $defineProperty(SymbolValue.prototype, 'valueOf', {
      value: Symbol.prototype.valueOf,
      enumerable: false
    });
    var hashProperty = createPrivateName();
    var hashPropertyDescriptor = {value: undefined};
    var hashObjectProperties = {
      hash: {value: undefined},
      self: {value: undefined}
    };
    var hashCounter = 0;
    function getOwnHashObject(object) {
      var hashObject = object[hashProperty];
      if (hashObject && hashObject.self === object)
        return hashObject;
      if ($isExtensible(object)) {
        hashObjectProperties.hash.value = hashCounter++;
        hashObjectProperties.self.value = object;
        hashPropertyDescriptor.value = $create(null, hashObjectProperties);
        $defineProperty(object, hashProperty, hashPropertyDescriptor);
        return hashPropertyDescriptor.value;
      }
      return undefined;
    }
    function freeze(object) {
      getOwnHashObject(object);
      return $freeze.apply(this, arguments);
    }
    function preventExtensions(object) {
      getOwnHashObject(object);
      return $preventExtensions.apply(this, arguments);
    }
    function seal(object) {
      getOwnHashObject(object);
      return $seal.apply(this, arguments);
    }
    freeze(SymbolValue.prototype);
    function isSymbolString(s) {
      return symbolValues[s] || privateNames[s];
    }
    function toProperty(name) {
      if (isShimSymbol(name))
        return name[symbolInternalProperty];
      return name;
    }
    function removeSymbolKeys(array) {
      var rv = [];
      for (var i = 0; i < array.length; i++) {
        if (!isSymbolString(array[i])) {
          rv.push(array[i]);
        }
      }
      return rv;
    }
    function getOwnPropertyNames(object) {
      return removeSymbolKeys($getOwnPropertyNames(object));
    }
    function keys(object) {
      return removeSymbolKeys($keys(object));
    }
    function getOwnPropertySymbols(object) {
      var rv = [];
      var names = $getOwnPropertyNames(object);
      for (var i = 0; i < names.length; i++) {
        var symbol = symbolValues[names[i]];
        if (symbol) {
          rv.push(symbol);
        }
      }
      return rv;
    }
    function getOwnPropertyDescriptor(object, name) {
      return $getOwnPropertyDescriptor(object, toProperty(name));
    }
    function hasOwnProperty(name) {
      return $hasOwnProperty.call(this, toProperty(name));
    }
    function getOption(name) {
      return global.$traceurRuntime.options[name];
    }
    function defineProperty(object, name, descriptor) {
      if (isShimSymbol(name)) {
        name = name[symbolInternalProperty];
      }
      $defineProperty(object, name, descriptor);
      return object;
    }
    function polyfillObject(Object) {
      $defineProperty(Object, 'defineProperty', {value: defineProperty});
      $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
      $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
      $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
      $defineProperty(Object, 'freeze', {value: freeze});
      $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
      $defineProperty(Object, 'seal', {value: seal});
      $defineProperty(Object, 'keys', {value: keys});
    }
    function exportStar(object) {
      for (var i = 1; i < arguments.length; i++) {
        var names = $getOwnPropertyNames(arguments[i]);
        for (var j = 0; j < names.length; j++) {
          var name = names[j];
          if (name === '__esModule' || isSymbolString(name))
            continue;
          (function(mod, name) {
            $defineProperty(object, name, {
              get: function() {
                return mod[name];
              },
              enumerable: true
            });
          })(arguments[i], names[j]);
        }
      }
      return object;
    }
    function isObject(x) {
      return x != null && (typeof x === 'object' || typeof x === 'function');
    }
    function toObject(x) {
      if (x == null)
        throw $TypeError();
      return $Object(x);
    }
    function checkObjectCoercible(argument) {
      if (argument == null) {
        throw new TypeError('Value cannot be converted to an Object');
      }
      return argument;
    }
    function polyfillSymbol(global, Symbol) {
      if (!global.Symbol) {
        global.Symbol = Symbol;
        Object.getOwnPropertySymbols = getOwnPropertySymbols;
      }
      if (!global.Symbol.iterator) {
        global.Symbol.iterator = Symbol('Symbol.iterator');
      }
      if (!global.Symbol.observer) {
        global.Symbol.observer = Symbol('Symbol.observer');
      }
    }
    function setupGlobals(global) {
      polyfillSymbol(global, Symbol);
      global.Reflect = global.Reflect || {};
      global.Reflect.global = global.Reflect.global || global;
      polyfillObject(global.Object);
    }
    setupGlobals(global);
    global.$traceurRuntime = {
      call: tailCall,
      checkObjectCoercible: checkObjectCoercible,
      construct: construct,
      continuation: createContinuation,
      createPrivateName: createPrivateName,
      defineProperties: $defineProperties,
      defineProperty: $defineProperty,
      exportStar: exportStar,
      getOwnHashObject: getOwnHashObject,
      getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
      getOwnPropertyNames: $getOwnPropertyNames,
      initTailRecursiveFunction: initTailRecursiveFunction,
      isObject: isObject,
      isPrivateName: isPrivateName,
      isSymbolString: isSymbolString,
      keys: $keys,
      options: {},
      setupGlobals: setupGlobals,
      toObject: toObject,
      toProperty: toProperty,
      typeof: typeOf
    };
  })();
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__1 = $traceurRuntime,
      canonicalizeUrl = $__1.canonicalizeUrl,
      resolveUrl = $__1.resolveUrl,
      isAbsolute = $__1.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  }
  function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  }
  ModuleEvaluationError.prototype = Object.create(Error.prototype);
  ModuleEvaluationError.prototype.constructor = ModuleEvaluationError;
  ModuleEvaluationError.prototype.stripError = function(message) {
    return message.replace(/.*Error:/, this.constructor.name + ':');
  };
  ModuleEvaluationError.prototype.stripCause = function(cause) {
    if (!cause)
      return '';
    if (!cause.message)
      return cause + '';
    return this.stripError(cause.message);
  };
  ModuleEvaluationError.prototype.loadedBy = function(moduleName) {
    this.stack += '\n loaded by ' + moduleName;
  };
  ModuleEvaluationError.prototype.stripStack = function(causeStack) {
    var stack = [];
    causeStack.split('\n').some((function(frame) {
      if (/UncoatedModuleInstantiator/.test(frame))
        return true;
      stack.push(frame);
    }));
    stack[0] = this.stripError(stack[0]);
    return stack.join('\n');
  };
  function beforeLines(lines, number) {
    var result = [];
    var first = number - 3;
    if (first < 0)
      first = 0;
    for (var i = first; i < number; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function afterLines(lines, number) {
    var last = number + 1;
    if (last > lines.length - 1)
      last = lines.length - 1;
    var result = [];
    for (var i = number; i <= last; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function columnSpacing(columns) {
    var result = '';
    for (var i = 0; i < columns - 1; i++) {
      result += '-';
    }
    return result;
  }
  function UncoatedModuleInstantiator(url, func) {
    UncoatedModuleEntry.call(this, url, null);
    this.func = func;
  }
  UncoatedModuleInstantiator.prototype = Object.create(UncoatedModuleEntry.prototype);
  UncoatedModuleInstantiator.prototype.getUncoatedModule = function() {
    var $__0 = this;
    if (this.value_)
      return this.value_;
    try {
      var relativeRequire;
      if (typeof $traceurRuntime !== undefined && $traceurRuntime.require) {
        relativeRequire = $traceurRuntime.require.bind(null, this.url);
      }
      return this.value_ = this.func.call(global, relativeRequire);
    } catch (ex) {
      if (ex instanceof ModuleEvaluationError) {
        ex.loadedBy(this.url);
        throw ex;
      }
      if (ex.stack) {
        var lines = this.func.toString().split('\n');
        var evaled = [];
        ex.stack.split('\n').some((function(frame, index) {
          if (frame.indexOf('UncoatedModuleInstantiator.getUncoatedModule') > 0)
            return true;
          var m = /(at\s[^\s]*\s).*>:(\d*):(\d*)\)/.exec(frame);
          if (m) {
            var line = parseInt(m[2], 10);
            evaled = evaled.concat(beforeLines(lines, line));
            if (index === 1) {
              evaled.push(columnSpacing(m[3]) + '^ ' + $__0.url);
            } else {
              evaled.push(columnSpacing(m[3]) + '^');
            }
            evaled = evaled.concat(afterLines(lines, line));
            evaled.push('= = = = = = = = =');
          } else {
            evaled.push(frame);
          }
        }));
        ex.stack = evaled.join('\n');
      }
      throw new ModuleEvaluationError(this.url, ex);
    }
  };
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return ;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== 'string')
        throw new TypeError('module name must be a string, not ' + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, deps, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, deps, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  var moduleStoreModule = new Module({ModuleStore: ModuleStore});
  ModuleStore.set('@traceur/src/runtime/ModuleStore.js', moduleStoreModule);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    registerModule: ModuleStore.registerModule.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
System.registerModule("traceur-runtime@0.0.88/src/runtime/async.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/async.js";
  if (typeof $traceurRuntime !== 'object') {
    throw new Error('traceur runtime not found.');
  }
  var $createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $create = Object.create;
  var thisName = $createPrivateName();
  var argsName = $createPrivateName();
  var observeName = $createPrivateName();
  function AsyncGeneratorFunction() {}
  function AsyncGeneratorFunctionPrototype() {}
  AsyncGeneratorFunction.prototype = AsyncGeneratorFunctionPrototype;
  AsyncGeneratorFunctionPrototype.constructor = AsyncGeneratorFunction;
  $defineProperty(AsyncGeneratorFunctionPrototype, 'constructor', {enumerable: false});
  var AsyncGeneratorContext = (function() {
    function AsyncGeneratorContext(observer) {
      var $__0 = this;
      this.decoratedObserver = $traceurRuntime.createDecoratedGenerator(observer, (function() {
        $__0.done = true;
      }));
      this.done = false;
      this.inReturn = false;
    }
    return ($traceurRuntime.createClass)(AsyncGeneratorContext, {
      throw: function(error) {
        if (!this.inReturn) {
          throw error;
        }
      },
      yield: function(value) {
        if (this.done) {
          this.inReturn = true;
          throw undefined;
        }
        var result;
        try {
          result = this.decoratedObserver.next(value);
        } catch (e) {
          this.done = true;
          throw e;
        }
        if (result === undefined) {
          return ;
        }
        if (result.done) {
          this.done = true;
          this.inReturn = true;
          throw undefined;
        }
        return result.value;
      },
      yieldFor: function(observable) {
        var ctx = this;
        return $traceurRuntime.observeForEach(observable[$traceurRuntime.toProperty(Symbol.observer)].bind(observable), function(value) {
          if (ctx.done) {
            this.return();
            return ;
          }
          var result;
          try {
            result = ctx.decoratedObserver.next(value);
          } catch (e) {
            ctx.done = true;
            throw e;
          }
          if (result === undefined) {
            return ;
          }
          if (result.done) {
            ctx.done = true;
          }
          return result;
        });
      }
    }, {});
  }());
  AsyncGeneratorFunctionPrototype.prototype[Symbol.observer] = function(observer) {
    var observe = this[observeName];
    var ctx = new AsyncGeneratorContext(observer);
    $traceurRuntime.schedule((function() {
      return observe(ctx);
    })).then((function(value) {
      if (!ctx.done) {
        ctx.decoratedObserver.return(value);
      }
    })).catch((function(error) {
      if (!ctx.done) {
        ctx.decoratedObserver.throw(error);
      }
    }));
    return ctx.decoratedObserver;
  };
  $defineProperty(AsyncGeneratorFunctionPrototype.prototype, Symbol.observer, {enumerable: false});
  function initAsyncGeneratorFunction(functionObject) {
    functionObject.prototype = $create(AsyncGeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = AsyncGeneratorFunctionPrototype;
    return functionObject;
  }
  function createAsyncGeneratorInstance(observe, functionObject) {
    for (var args = [],
        $__2 = 2; $__2 < arguments.length; $__2++)
      args[$__2 - 2] = arguments[$__2];
    var object = $create(functionObject.prototype);
    object[thisName] = this;
    object[argsName] = args;
    object[observeName] = observe;
    return object;
  }
  function observeForEach(observe, next) {
    return new Promise((function(resolve, reject) {
      var generator = observe({
        next: function(value) {
          return next.call(generator, value);
        },
        throw: function(error) {
          reject(error);
        },
        return: function(value) {
          resolve(value);
        }
      });
    }));
  }
  function schedule(asyncF) {
    return Promise.resolve().then(asyncF);
  }
  var generator = Symbol();
  var onDone = Symbol();
  var DecoratedGenerator = (function() {
    function DecoratedGenerator(_generator, _onDone) {
      this[generator] = _generator;
      this[onDone] = _onDone;
    }
    return ($traceurRuntime.createClass)(DecoratedGenerator, {
      next: function(value) {
        var result = this[generator].next(value);
        if (result !== undefined && result.done) {
          this[onDone].call(this);
        }
        return result;
      },
      throw: function(error) {
        this[onDone].call(this);
        return this[generator].throw(error);
      },
      return: function(value) {
        this[onDone].call(this);
        return this[generator].return(value);
      }
    }, {});
  }());
  function createDecoratedGenerator(generator, onDone) {
    return new DecoratedGenerator(generator, onDone);
  }
  $traceurRuntime.initAsyncGeneratorFunction = initAsyncGeneratorFunction;
  $traceurRuntime.createAsyncGeneratorInstance = createAsyncGeneratorInstance;
  $traceurRuntime.observeForEach = observeForEach;
  $traceurRuntime.schedule = schedule;
  $traceurRuntime.createDecoratedGenerator = createDecoratedGenerator;
  return {};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/classes.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/classes.js";
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $__0 = Object,
      getOwnPropertyNames = $__0.getOwnPropertyNames,
      getOwnPropertySymbols = $__0.getOwnPropertySymbols;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superConstructor(ctor) {
    return ctor.__proto__;
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError(("super has no setter '" + name + "'."));
  }
  function forEachPropertyKey(object, f) {
    getOwnPropertyNames(object).forEach(f);
    getOwnPropertySymbols(object).forEach(f);
  }
  function getDescriptors(object) {
    var descriptors = {};
    forEachPropertyKey(object, (function(key) {
      descriptors[key] = $getOwnPropertyDescriptor(object, key);
      descriptors[key].enumerable = false;
    }));
    return descriptors;
  }
  var nonEnum = {enumerable: false};
  function makePropertiesNonEnumerable(object) {
    forEachPropertyKey(object, (function(key) {
      $defineProperty(object, key, nonEnum);
    }));
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      makePropertiesNonEnumerable(object);
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null)
      return null;
    throw new $TypeError(("Super expression must either be null or a function, not " + typeof superClass + "."));
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.superConstructor = superConstructor;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
  return {};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/destructuring.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/destructuring.js";
  function iteratorToArray(iter) {
    var rv = [];
    var i = 0;
    var tmp;
    while (!(tmp = iter.next()).done) {
      rv[i++] = tmp.value;
    }
    return rv;
  }
  $traceurRuntime.iteratorToArray = iteratorToArray;
  return {};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/generators.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/generators.js";
  if (typeof $traceurRuntime !== 'object') {
    throw new Error('traceur runtime not found.');
  }
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  var RETURN_SENTINEL = {};
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.oldReturnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    maybeUncatchable: function() {
      if (this.storedException === RETURN_SENTINEL) {
        throw RETURN_SENTINEL;
      }
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    },
    wrapYieldStar: function(iterator) {
      var ctx = this;
      return {
        next: function(v) {
          return iterator.next(v);
        },
        throw: function(e) {
          var result;
          if (e === RETURN_SENTINEL) {
            if (iterator.return) {
              result = iterator.return(ctx.returnValue);
              if (!result.done) {
                ctx.returnValue = ctx.oldReturnValue;
                return result;
              }
              ctx.returnValue = result.value;
            }
            throw e;
          }
          if (iterator.throw) {
            return iterator.throw(e);
          }
          iterator.return && iterator.return();
          throw $TypeError('Inner iterator does not have a throw method');
        }
      };
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        if (x === RETURN_SENTINEL) {
          return {
            value: ctx.returnValue,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          if (x === RETURN_SENTINEL) {
            return {
              value: ctx.returnValue,
              done: true
            };
          }
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value;
        try {
          value = moveNext(ctx);
        } catch (ex) {
          if (ex === RETURN_SENTINEL) {
            value = ctx;
          } else {
            throw ex;
          }
        }
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    },
    return: function(v) {
      this[ctxName].oldReturnValue = this[ctxName].returnValue;
      this[ctxName].returnValue = v;
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', RETURN_SENTINEL);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false},
    return: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return ;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
  return {};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/relativeRequire.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/relativeRequire.js";
  var path;
  function relativeRequire(callerPath, requiredPath) {
    path = path || typeof require !== 'undefined' && require('path');
    function isDirectory(path) {
      return path.slice(-1) === '/';
    }
    function isAbsolute(path) {
      return path[0] === '/';
    }
    function isRelative(path) {
      return path[0] === '.';
    }
    if (isDirectory(requiredPath) || isAbsolute(requiredPath))
      return ;
    return isRelative(requiredPath) ? require(path.resolve(path.dirname(callerPath), requiredPath)) : require(requiredPath);
  }
  $traceurRuntime.require = relativeRequire;
  return {};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/spread.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/spread.js";
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
  return {};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/template.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/template.js";
  var $__0 = Object,
      defineProperty = $__0.defineProperty,
      freeze = $__0.freeze;
  var slice = Array.prototype.slice;
  var map = Object.create(null);
  function getTemplateObject(raw) {
    var cooked = arguments[1];
    var key = raw.join('${}');
    var templateObject = map[key];
    if (templateObject)
      return templateObject;
    if (!cooked) {
      cooked = slice.call(raw);
    }
    return map[key] = freeze(defineProperty(cooked, 'raw', {value: freeze(raw)}));
  }
  $traceurRuntime.getTemplateObject = getTemplateObject;
  return {};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/type-assertions.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/type-assertions.js";
  var types = {
    any: {name: 'any'},
    boolean: {name: 'boolean'},
    number: {name: 'number'},
    string: {name: 'string'},
    symbol: {name: 'symbol'},
    void: {name: 'void'}
  };
  var GenericType = (function() {
    function GenericType(type, argumentTypes) {
      this.type = type;
      this.argumentTypes = argumentTypes;
    }
    return ($traceurRuntime.createClass)(GenericType, {}, {});
  }());
  var typeRegister = Object.create(null);
  function genericType(type) {
    for (var argumentTypes = [],
        $__1 = 1; $__1 < arguments.length; $__1++)
      argumentTypes[$__1 - 1] = arguments[$__1];
    var typeMap = typeRegister;
    var key = $traceurRuntime.getOwnHashObject(type).hash;
    if (!typeMap[key]) {
      typeMap[key] = Object.create(null);
    }
    typeMap = typeMap[key];
    for (var i = 0; i < argumentTypes.length - 1; i++) {
      key = $traceurRuntime.getOwnHashObject(argumentTypes[i]).hash;
      if (!typeMap[key]) {
        typeMap[key] = Object.create(null);
      }
      typeMap = typeMap[key];
    }
    var tail = argumentTypes[argumentTypes.length - 1];
    key = $traceurRuntime.getOwnHashObject(tail).hash;
    if (!typeMap[key]) {
      typeMap[key] = new GenericType(type, argumentTypes);
    }
    return typeMap[key];
  }
  $traceurRuntime.GenericType = GenericType;
  $traceurRuntime.genericType = genericType;
  $traceurRuntime.type = types;
  return {};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/runtime-modules.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/runtime-modules.js";
  System.get("traceur-runtime@0.0.88/src/runtime/relativeRequire.js");
  System.get("traceur-runtime@0.0.88/src/runtime/spread.js");
  System.get("traceur-runtime@0.0.88/src/runtime/destructuring.js");
  System.get("traceur-runtime@0.0.88/src/runtime/classes.js");
  System.get("traceur-runtime@0.0.88/src/runtime/async.js");
  System.get("traceur-runtime@0.0.88/src/runtime/generators.js");
  System.get("traceur-runtime@0.0.88/src/runtime/template.js");
  System.get("traceur-runtime@0.0.88/src/runtime/type-assertions.js");
  return {};
});
System.get("traceur-runtime@0.0.88/src/runtime/runtime-modules.js" + '');
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/utils.js";
  var $ceil = Math.ceil;
  var $floor = Math.floor;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $pow = Math.pow;
  var $min = Math.min;
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x >>> 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function isNumber(x) {
    return typeof x === 'number';
  }
  function toInteger(x) {
    x = +x;
    if ($isNaN(x))
      return 0;
    if (x === 0 || !$isFinite(x))
      return x;
    return x > 0 ? $floor(x) : $ceil(x);
  }
  var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
  }
  function checkIterable(x) {
    return !isObject(x) ? undefined : x[Symbol.iterator];
  }
  function isConstructor(x) {
    return isCallable(x);
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function maybeDefine(object, name, descr) {
    if (!(name in object)) {
      Object.defineProperty(object, name, descr);
    }
  }
  function maybeDefineMethod(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  function maybeDefineConst(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function maybeAddConsts(object, consts) {
    for (var i = 0; i < consts.length; i += 2) {
      var name = consts[i];
      var value = consts[i + 1];
      maybeDefineConst(object, name, value);
    }
  }
  function maybeAddIterator(object, func, Symbol) {
    if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
      return ;
    if (object['@@iterator'])
      func = object['@@iterator'];
    Object.defineProperty(object, Symbol.iterator, {
      value: func,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  var polyfills = [];
  function registerPolyfill(func) {
    polyfills.push(func);
  }
  function polyfillAll(global) {
    polyfills.forEach((function(f) {
      return f(global);
    }));
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get isNumber() {
      return isNumber;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    },
    get checkIterable() {
      return checkIterable;
    },
    get isConstructor() {
      return isConstructor;
    },
    get createIteratorResultObject() {
      return createIteratorResultObject;
    },
    get maybeDefine() {
      return maybeDefine;
    },
    get maybeDefineMethod() {
      return maybeDefineMethod;
    },
    get maybeDefineConst() {
      return maybeDefineConst;
    },
    get maybeAddFunctions() {
      return maybeAddFunctions;
    },
    get maybeAddConsts() {
      return maybeAddConsts;
    },
    get maybeAddIterator() {
      return maybeAddIterator;
    },
    get registerPolyfill() {
      return registerPolyfill;
    },
    get polyfillAll() {
      return polyfillAll;
    }
  };
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/Map.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/Map.js";
  var $__0 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = (function() {
    function Map() {
      var $__10,
          $__11;
      var iterable = arguments[0];
      if (!isObject(this))
        throw new TypeError('Map called on incompatible type');
      if ($hasOwnProperty.call(this, 'entries_')) {
        throw new TypeError('Map can not be reentrantly initialised');
      }
      initMap(this);
      if (iterable !== null && iterable !== undefined) {
        var $__5 = true;
        var $__6 = false;
        var $__7 = undefined;
        try {
          for (var $__3 = void 0,
              $__2 = (iterable)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
            var $__9 = $__3.value,
                key = ($__10 = $__9[$traceurRuntime.toProperty(Symbol.iterator)](), ($__11 = $__10.next()).done ? void 0 : $__11.value),
                value = ($__11 = $__10.next()).done ? void 0 : $__11.value;
            {
              this.set(key, value);
            }
          }
        } catch ($__8) {
          $__6 = true;
          $__7 = $__8;
        } finally {
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
        }
      }
    }
    return ($traceurRuntime.createClass)(Map, {
      get size() {
        return this.entries_.length / 2 - this.deletedCount_;
      },
      get: function(key) {
        var index = lookupIndex(this, key);
        if (index !== undefined)
          return this.entries_[index + 1];
      },
      set: function(key, value) {
        var objectMode = isObject(key);
        var stringMode = typeof key === 'string';
        var index = lookupIndex(this, key);
        if (index !== undefined) {
          this.entries_[index + 1] = value;
        } else {
          index = this.entries_.length;
          this.entries_[index] = key;
          this.entries_[index + 1] = value;
          if (objectMode) {
            var hashObject = getOwnHashObject(key);
            var hash = hashObject.hash;
            this.objectIndex_[hash] = index;
          } else if (stringMode) {
            this.stringIndex_[key] = index;
          } else {
            this.primitiveIndex_[key] = index;
          }
        }
        return this;
      },
      has: function(key) {
        return lookupIndex(this, key) !== undefined;
      },
      delete: function(key) {
        var objectMode = isObject(key);
        var stringMode = typeof key === 'string';
        var index;
        var hash;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          if (hashObject) {
            index = this.objectIndex_[hash = hashObject.hash];
            delete this.objectIndex_[hash];
          }
        } else if (stringMode) {
          index = this.stringIndex_[key];
          delete this.stringIndex_[key];
        } else {
          index = this.primitiveIndex_[key];
          delete this.primitiveIndex_[key];
        }
        if (index !== undefined) {
          this.entries_[index] = deletedSentinel;
          this.entries_[index + 1] = undefined;
          this.deletedCount_++;
          return true;
        }
        return false;
      },
      clear: function() {
        initMap(this);
      },
      forEach: function(callbackFn) {
        var thisArg = arguments[1];
        for (var i = 0; i < this.entries_.length; i += 2) {
          var key = this.entries_[i];
          var value = this.entries_[i + 1];
          if (key === deletedSentinel)
            continue;
          callbackFn.call(thisArg, value, key, this);
        }
      },
      entries: $traceurRuntime.initGeneratorFunction(function $__12() {
        var i,
            key,
            value;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                i = 0;
                $ctx.state = 12;
                break;
              case 12:
                $ctx.state = (i < this.entries_.length) ? 8 : -2;
                break;
              case 4:
                i += 2;
                $ctx.state = 12;
                break;
              case 8:
                key = this.entries_[i];
                value = this.entries_[i + 1];
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = (key === deletedSentinel) ? 4 : 6;
                break;
              case 6:
                $ctx.state = 2;
                return [key, value];
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              default:
                return $ctx.end();
            }
        }, $__12, this);
      }),
      keys: $traceurRuntime.initGeneratorFunction(function $__13() {
        var i,
            key,
            value;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                i = 0;
                $ctx.state = 12;
                break;
              case 12:
                $ctx.state = (i < this.entries_.length) ? 8 : -2;
                break;
              case 4:
                i += 2;
                $ctx.state = 12;
                break;
              case 8:
                key = this.entries_[i];
                value = this.entries_[i + 1];
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = (key === deletedSentinel) ? 4 : 6;
                break;
              case 6:
                $ctx.state = 2;
                return key;
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              default:
                return $ctx.end();
            }
        }, $__13, this);
      }),
      values: $traceurRuntime.initGeneratorFunction(function $__14() {
        var i,
            key,
            value;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                i = 0;
                $ctx.state = 12;
                break;
              case 12:
                $ctx.state = (i < this.entries_.length) ? 8 : -2;
                break;
              case 4:
                i += 2;
                $ctx.state = 12;
                break;
              case 8:
                key = this.entries_[i];
                value = this.entries_[i + 1];
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = (key === deletedSentinel) ? 4 : 6;
                break;
              case 6:
                $ctx.state = 2;
                return value;
              case 2:
                $ctx.maybeThrow();
                $ctx.state = 4;
                break;
              default:
                return $ctx.end();
            }
        }, $__14, this);
      })
    }, {});
  }());
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__9 = global,
        Object = $__9.Object,
        Symbol = $__9.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries === undefined)
      global.Map = Map;
    if (mapPrototype.entries) {
      maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillMap);
  return {
    get Map() {
      return Map;
    },
    get polyfillMap() {
      return polyfillMap;
    }
  };
});
System.get("traceur-runtime@0.0.88/src/runtime/polyfills/Map.js" + '');
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/Set.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/Set.js";
  var $__0 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/Map.js").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = (function() {
    function Set() {
      var iterable = arguments[0];
      if (!isObject(this))
        throw new TypeError('Set called on incompatible type');
      if ($hasOwnProperty.call(this, 'map_')) {
        throw new TypeError('Set can not be reentrantly initialised');
      }
      initSet(this);
      if (iterable !== null && iterable !== undefined) {
        var $__7 = true;
        var $__8 = false;
        var $__9 = undefined;
        try {
          for (var $__5 = void 0,
              $__4 = (iterable)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__7 = ($__5 = $__4.next()).done); $__7 = true) {
            var item = $__5.value;
            {
              this.add(item);
            }
          }
        } catch ($__10) {
          $__8 = true;
          $__9 = $__10;
        } finally {
          try {
            if (!$__7 && $__4.return != null) {
              $__4.return();
            }
          } finally {
            if ($__8) {
              throw $__9;
            }
          }
        }
      }
    }
    return ($traceurRuntime.createClass)(Set, {
      get size() {
        return this.map_.size;
      },
      has: function(key) {
        return this.map_.has(key);
      },
      add: function(key) {
        this.map_.set(key, key);
        return this;
      },
      delete: function(key) {
        return this.map_.delete(key);
      },
      clear: function() {
        return this.map_.clear();
      },
      forEach: function(callbackFn) {
        var thisArg = arguments[1];
        var $__2 = this;
        return this.map_.forEach((function(value, key) {
          callbackFn.call(thisArg, key, key, $__2);
        }));
      },
      values: $traceurRuntime.initGeneratorFunction(function $__12() {
        var $__13,
            $__14;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $__13 = $ctx.wrapYieldStar(this.map_.keys()[Symbol.iterator]());
                $ctx.sent = void 0;
                $ctx.action = 'next';
                $ctx.state = 12;
                break;
              case 12:
                $__14 = $__13[$ctx.action]($ctx.sentIgnoreThrow);
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = ($__14.done) ? 3 : 2;
                break;
              case 3:
                $ctx.sent = $__14.value;
                $ctx.state = -2;
                break;
              case 2:
                $ctx.state = 12;
                return $__14.value;
              default:
                return $ctx.end();
            }
        }, $__12, this);
      }),
      entries: $traceurRuntime.initGeneratorFunction(function $__15() {
        var $__16,
            $__17;
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $__16 = $ctx.wrapYieldStar(this.map_.entries()[Symbol.iterator]());
                $ctx.sent = void 0;
                $ctx.action = 'next';
                $ctx.state = 12;
                break;
              case 12:
                $__17 = $__16[$ctx.action]($ctx.sentIgnoreThrow);
                $ctx.state = 9;
                break;
              case 9:
                $ctx.state = ($__17.done) ? 3 : 2;
                break;
              case 3:
                $ctx.sent = $__17.value;
                $ctx.state = -2;
                break;
              case 2:
                $ctx.state = 12;
                return $__17.value;
              default:
                return $ctx.end();
            }
        }, $__15, this);
      })
    }, {});
  }());
  Object.defineProperty(Set.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  Object.defineProperty(Set.prototype, 'keys', {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  function polyfillSet(global) {
    var $__11 = global,
        Object = $__11.Object,
        Symbol = $__11.Symbol;
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    if (setPrototype.values) {
      maybeAddIterator(setPrototype, setPrototype.values, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillSet);
  return {
    get Set() {
      return Set;
    },
    get polyfillSet() {
      return polyfillSet;
    }
  };
});
System.get("traceur-runtime@0.0.88/src/runtime/polyfills/Set.js" + '');
System.registerModule("traceur-runtime@0.0.88/node_modules/rsvp/lib/rsvp/asap.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/node_modules/rsvp/lib/rsvp/asap.js";
  var len = 0;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
      callback(arg);
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
    len = 0;
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/Promise.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/Promise.js";
  var async = System.get("traceur-runtime@0.0.88/node_modules/rsvp/lib/rsvp/asap.js").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js").registerPolyfill;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = (function() {
    function Promise(resolver) {
      if (resolver === promiseRaw)
        return ;
      if (typeof resolver !== 'function')
        throw new TypeError;
      var promise = promiseInit(this);
      try {
        resolver((function(x) {
          promiseResolve(promise, x);
        }), (function(r) {
          promiseReject(promise, r);
        }));
      } catch (e) {
        promiseReject(promise, e);
      }
    }
    return ($traceurRuntime.createClass)(Promise, {
      catch: function(onReject) {
        return this.then(undefined, onReject);
      },
      then: function(onResolve, onReject) {
        if (typeof onResolve !== 'function')
          onResolve = idResolveHandler;
        if (typeof onReject !== 'function')
          onReject = idRejectHandler;
        var that = this;
        var constructor = this.constructor;
        return chain(this, function(x) {
          x = promiseCoerce(constructor, x);
          return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
        }, onReject);
      }
    }, {
      resolve: function(x) {
        if (this === $Promise) {
          if (isPromise(x)) {
            return x;
          }
          return promiseSet(new $Promise(promiseRaw), +1, x);
        } else {
          return new this(function(resolve, reject) {
            resolve(x);
          });
        }
      },
      reject: function(r) {
        if (this === $Promise) {
          return promiseSet(new $Promise(promiseRaw), -1, r);
        } else {
          return new this((function(resolve, reject) {
            reject(r);
          }));
        }
      },
      all: function(values) {
        var deferred = getDeferred(this);
        var resolutions = [];
        try {
          var makeCountdownFunction = function(i) {
            return (function(x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            });
          };
          var count = 0;
          var i = 0;
          var $__6 = true;
          var $__7 = false;
          var $__8 = undefined;
          try {
            for (var $__4 = void 0,
                $__3 = (values)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
              var value = $__4.value;
              {
                var countdownFunction = makeCountdownFunction(i);
                this.resolve(value).then(countdownFunction, (function(r) {
                  deferred.reject(r);
                }));
                ++i;
                ++count;
              }
            }
          } catch ($__9) {
            $__7 = true;
            $__8 = $__9;
          } finally {
            try {
              if (!$__6 && $__3.return != null) {
                $__3.return();
              }
            } finally {
              if ($__7) {
                throw $__8;
              }
            }
          }
          if (count === 0) {
            deferred.resolve(resolutions);
          }
        } catch (e) {
          deferred.reject(e);
        }
        return deferred.promise;
      },
      race: function(values) {
        var deferred = getDeferred(this);
        try {
          for (var i = 0; i < values.length; i++) {
            this.resolve(values[i]).then((function(x) {
              deferred.resolve(x);
            }), (function(r) {
              deferred.reject(r);
            }));
          }
        } catch (e) {
          deferred.reject(e);
        }
        return deferred.promise;
      }
    });
  }());
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return ;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  registerPolyfill(polyfillPromise);
  return {
    get Promise() {
      return Promise;
    },
    get polyfillPromise() {
      return polyfillPromise;
    }
  };
});
System.get("traceur-runtime@0.0.88/src/runtime/polyfills/Promise.js" + '');
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/StringIterator.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/StringIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js"),
      createIteratorResultObject = $__0.createIteratorResultObject,
      isObject = $__0.isObject;
  var toProperty = $traceurRuntime.toProperty;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = (function() {
    var $__2;
    function StringIterator() {}
    return ($traceurRuntime.createClass)(StringIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
      value: function() {
        var o = this;
        if (!isObject(o) || !hasOwnProperty.call(o, iteratedString)) {
          throw new TypeError('this must be a StringIterator object');
        }
        var s = o[toProperty(iteratedString)];
        if (s === undefined) {
          return createIteratorResultObject(undefined, true);
        }
        var position = o[toProperty(stringIteratorNextIndex)];
        var len = s.length;
        if (position >= len) {
          o[toProperty(iteratedString)] = undefined;
          return createIteratorResultObject(undefined, true);
        }
        var first = s.charCodeAt(position);
        var resultString;
        if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
          resultString = String.fromCharCode(first);
        } else {
          var second = s.charCodeAt(position + 1);
          if (second < 0xDC00 || second > 0xDFFF) {
            resultString = String.fromCharCode(first);
          } else {
            resultString = String.fromCharCode(first) + String.fromCharCode(second);
          }
        }
        o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
        return createIteratorResultObject(resultString, false);
      },
      configurable: true,
      enumerable: true,
      writable: true
    }), Object.defineProperty($__2, Symbol.iterator, {
      value: function() {
        return this;
      },
      configurable: true,
      enumerable: true,
      writable: true
    }), $__2), {});
  }());
  function createStringIterator(string) {
    var s = String(string);
    var iterator = Object.create(StringIterator.prototype);
    iterator[toProperty(iteratedString)] = s;
    iterator[toProperty(stringIteratorNextIndex)] = 0;
    return iterator;
  }
  return {get createStringIterator() {
      return createStringIterator;
    }};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/String.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/String.js";
  var createStringIterator = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/StringIterator.js").createStringIterator;
  var $__1 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill;
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function includes(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    if (search && $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (pos != pos) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    if (searchLength + start > stringLength) {
      return false;
    }
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint(_) {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  function stringPrototypeIterator() {
    var o = $traceurRuntime.checkObjectCoercible(this);
    var s = String(o);
    return createStringIterator(s);
  }
  function polyfillString(global) {
    var String = global.String;
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'endsWith', endsWith, 'includes', includes, 'repeat', repeat, 'startsWith', startsWith]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
  }
  registerPolyfill(polyfillString);
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get includes() {
      return includes;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    },
    get stringPrototypeIterator() {
      return stringPrototypeIterator;
    },
    get polyfillString() {
      return polyfillString;
    }
  };
});
System.get("traceur-runtime@0.0.88/src/runtime/polyfills/String.js" + '');
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/ArrayIterator.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/ArrayIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js"),
      toObject = $__0.toObject,
      toUint32 = $__0.toUint32,
      createIteratorResultObject = $__0.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = (function() {
    var $__2;
    function ArrayIterator() {}
    return ($traceurRuntime.createClass)(ArrayIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
      value: function() {
        var iterator = toObject(this);
        var array = iterator.iteratorObject_;
        if (!array) {
          throw new TypeError('Object is not an ArrayIterator');
        }
        var index = iterator.arrayIteratorNextIndex_;
        var itemKind = iterator.arrayIterationKind_;
        var length = toUint32(array.length);
        if (index >= length) {
          iterator.arrayIteratorNextIndex_ = Infinity;
          return createIteratorResultObject(undefined, true);
        }
        iterator.arrayIteratorNextIndex_ = index + 1;
        if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
          return createIteratorResultObject(array[index], false);
        if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
          return createIteratorResultObject([index, array[index]], false);
        return createIteratorResultObject(index, false);
      },
      configurable: true,
      enumerable: true,
      writable: true
    }), Object.defineProperty($__2, Symbol.iterator, {
      value: function() {
        return this;
      },
      configurable: true,
      enumerable: true,
      writable: true
    }), $__2), {});
  }());
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/Array.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/Array.js";
  var $__0 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/ArrayIterator.js"),
      entries = $__0.entries,
      keys = $__0.keys,
      jsValues = $__0.values;
  var $__1 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js"),
      checkIterable = $__1.checkIterable,
      isCallable = $__1.isCallable,
      isConstructor = $__1.isConstructor,
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill,
      toInteger = $__1.toInteger,
      toLength = $__1.toLength,
      toObject = $__1.toObject;
  function from(arrLike) {
    var mapFn = arguments[1];
    var thisArg = arguments[2];
    var C = this;
    var items = toObject(arrLike);
    var mapping = mapFn !== undefined;
    var k = 0;
    var arr,
        len;
    if (mapping && !isCallable(mapFn)) {
      throw TypeError();
    }
    if (checkIterable(items)) {
      arr = isConstructor(C) ? new C() : [];
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (items)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var item = $__3.value;
          {
            if (mapping) {
              arr[k] = mapFn.call(thisArg, item, k);
            } else {
              arr[k] = item;
            }
            k++;
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
      arr.length = k;
      return arr;
    }
    len = toLength(items.length);
    arr = isConstructor(C) ? new C(len) : new Array(len);
    for (; k < len; k++) {
      if (mapping) {
        arr[k] = typeof thisArg === 'undefined' ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
    }
    arr.length = len;
    return arr;
  }
  function of() {
    for (var items = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      items[$__9] = arguments[$__9];
    var C = this;
    var len = items.length;
    var arr = isConstructor(C) ? new C(len) : new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = items[k];
    }
    arr.length = len;
    return arr;
  }
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      var value = object[i];
      if (predicate.call(thisArg, value, i, object)) {
        return returnIndex ? i : value;
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__10 = global,
        Array = $__10.Array,
        Object = $__10.Object,
        Symbol = $__10.Symbol;
    var values = jsValues;
    if (Symbol && Symbol.iterator && Array.prototype[Symbol.iterator]) {
      values = Array.prototype[Symbol.iterator];
    }
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from, 'of', of]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(Object.getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  registerPolyfill(polyfillArray);
  return {
    get from() {
      return from;
    },
    get of() {
      return of;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    },
    get polyfillArray() {
      return polyfillArray;
    }
  };
});
System.get("traceur-runtime@0.0.88/src/runtime/polyfills/Array.js" + '');
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/Object.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/Object.js";
  var $__0 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill;
  var $__1 = $traceurRuntime,
      defineProperty = $__1.defineProperty,
      getOwnPropertyDescriptor = $__1.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__1.getOwnPropertyNames,
      isPrivateName = $__1.isPrivateName,
      keys = $__1.keys;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = source == null ? [] : keys(source);
      var p = void 0,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (isPrivateName(name))
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (isPrivateName(name))
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  function polyfillObject(global) {
    var Object = global.Object;
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  registerPolyfill(polyfillObject);
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    },
    get polyfillObject() {
      return polyfillObject;
    }
  };
});
System.get("traceur-runtime@0.0.88/src/runtime/polyfills/Object.js" + '');
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/Number.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/Number.js";
  var $__0 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js"),
      isNumber = $__0.isNumber,
      maybeAddConsts = $__0.maybeAddConsts,
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill,
      toInteger = $__0.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
  function isSafeInteger(number) {
    if (NumberIsFinite(number)) {
      var integral = toInteger(number);
      if (integral === number)
        return $abs(integral) <= MAX_SAFE_INTEGER;
    }
    return false;
  }
  function polyfillNumber(global) {
    var Number = global.Number;
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', NumberIsFinite, 'isInteger', isInteger, 'isNaN', NumberIsNaN, 'isSafeInteger', isSafeInteger]);
  }
  registerPolyfill(polyfillNumber);
  return {
    get MAX_SAFE_INTEGER() {
      return MAX_SAFE_INTEGER;
    },
    get MIN_SAFE_INTEGER() {
      return MIN_SAFE_INTEGER;
    },
    get EPSILON() {
      return EPSILON;
    },
    get isFinite() {
      return NumberIsFinite;
    },
    get isInteger() {
      return isInteger;
    },
    get isNaN() {
      return NumberIsNaN;
    },
    get isSafeInteger() {
      return isSafeInteger;
    },
    get polyfillNumber() {
      return polyfillNumber;
    }
  };
});
System.get("traceur-runtime@0.0.88/src/runtime/polyfills/Number.js" + '');
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/fround.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/fround.js";
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $__0 = Math,
      LN2 = $__0.LN2,
      abs = $__0.abs,
      floor = $__0.floor,
      log = $__0.log,
      min = $__0.min,
      pow = $__0.pow;
  function packIEEE754(v, ebits, fbits) {
    var bias = (1 << (ebits - 1)) - 1,
        s,
        e,
        f,
        ln,
        i,
        bits,
        str,
        bytes;
    function roundToEven(n) {
      var w = floor(n),
          f = n - w;
      if (f < 0.5)
        return w;
      if (f > 0.5)
        return w + 1;
      return w % 2 ? w + 1 : w;
    }
    if (v !== v) {
      e = (1 << ebits) - 1;
      f = pow(2, fbits - 1);
      s = 0;
    } else if (v === Infinity || v === -Infinity) {
      e = (1 << ebits) - 1;
      f = 0;
      s = (v < 0) ? 1 : 0;
    } else if (v === 0) {
      e = 0;
      f = 0;
      s = (1 / v === -Infinity) ? 1 : 0;
    } else {
      s = v < 0;
      v = abs(v);
      if (v >= pow(2, 1 - bias)) {
        e = min(floor(log(v) / LN2), 1023);
        f = roundToEven(v / pow(2, e) * pow(2, fbits));
        if (f / pow(2, fbits) >= 2) {
          e = e + 1;
          f = 1;
        }
        if (e > bias) {
          e = (1 << ebits) - 1;
          f = 0;
        } else {
          e = e + bias;
          f = f - pow(2, fbits);
        }
      } else {
        e = 0;
        f = roundToEven(v / pow(2, 1 - bias - fbits));
      }
    }
    bits = [];
    for (i = fbits; i; i -= 1) {
      bits.push(f % 2 ? 1 : 0);
      f = floor(f / 2);
    }
    for (i = ebits; i; i -= 1) {
      bits.push(e % 2 ? 1 : 0);
      e = floor(e / 2);
    }
    bits.push(s ? 1 : 0);
    bits.reverse();
    str = bits.join('');
    bytes = [];
    while (str.length) {
      bytes.push(parseInt(str.substring(0, 8), 2));
      str = str.substring(8);
    }
    return bytes;
  }
  function unpackIEEE754(bytes, ebits, fbits) {
    var bits = [],
        i,
        j,
        b,
        str,
        bias,
        s,
        e,
        f;
    for (i = bytes.length; i; i -= 1) {
      b = bytes[i - 1];
      for (j = 8; j; j -= 1) {
        bits.push(b % 2 ? 1 : 0);
        b = b >> 1;
      }
    }
    bits.reverse();
    str = bits.join('');
    bias = (1 << (ebits - 1)) - 1;
    s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
    e = parseInt(str.substring(1, 1 + ebits), 2);
    f = parseInt(str.substring(1 + ebits), 2);
    if (e === (1 << ebits) - 1) {
      return f !== 0 ? NaN : s * Infinity;
    } else if (e > 0) {
      return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
    } else if (f !== 0) {
      return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
    } else {
      return s < 0 ? -0 : 0;
    }
  }
  function unpackF32(b) {
    return unpackIEEE754(b, 8, 23);
  }
  function packF32(v) {
    return packIEEE754(v, 8, 23);
  }
  function fround(x) {
    if (x === 0 || !$isFinite(x) || $isNaN(x)) {
      return x;
    }
    return unpackF32(packF32(Number(x)));
  }
  return {get fround() {
      return fround;
    }};
});
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/Math.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/Math.js";
  var jsFround = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/fround.js").fround;
  var $__1 = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      registerPolyfill = $__1.registerPolyfill,
      toUint32 = $__1.toUint32;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $__2 = Math,
      abs = $__2.abs,
      ceil = $__2.ceil,
      exp = $__2.exp,
      floor = $__2.floor,
      log = $__2.log,
      pow = $__2.pow,
      sqrt = $__2.sqrt;
  function clz32(x) {
    x = toUint32(+x);
    if (x == 0)
      return 32;
    var result = 0;
    if ((x & 0xFFFF0000) === 0) {
      x <<= 16;
      result += 16;
    }
    ;
    if ((x & 0xFF000000) === 0) {
      x <<= 8;
      result += 8;
    }
    ;
    if ((x & 0xF0000000) === 0) {
      x <<= 4;
      result += 4;
    }
    ;
    if ((x & 0xC0000000) === 0) {
      x <<= 2;
      result += 2;
    }
    ;
    if ((x & 0x80000000) === 0) {
      x <<= 1;
      result += 1;
    }
    ;
    return result;
  }
  function imul(x, y) {
    x = toUint32(+x);
    y = toUint32(+y);
    var xh = (x >>> 16) & 0xffff;
    var xl = x & 0xffff;
    var yh = (y >>> 16) & 0xffff;
    var yl = y & 0xffff;
    return xl * yl + (((xh * yl + xl * yh) << 16) >>> 0) | 0;
  }
  function sign(x) {
    x = +x;
    if (x > 0)
      return 1;
    if (x < 0)
      return -1;
    return x;
  }
  function log10(x) {
    return log(x) * 0.434294481903251828;
  }
  function log2(x) {
    return log(x) * 1.442695040888963407;
  }
  function log1p(x) {
    x = +x;
    if (x < -1 || $isNaN(x)) {
      return NaN;
    }
    if (x === 0 || x === Infinity) {
      return x;
    }
    if (x === -1) {
      return -Infinity;
    }
    var result = 0;
    var n = 50;
    if (x < 0 || x > 1) {
      return log(1 + x);
    }
    for (var i = 1; i < n; i++) {
      if ((i % 2) === 0) {
        result -= pow(x, i) / i;
      } else {
        result += pow(x, i) / i;
      }
    }
    return result;
  }
  function expm1(x) {
    x = +x;
    if (x === -Infinity) {
      return -1;
    }
    if (!$isFinite(x) || x === 0) {
      return x;
    }
    return exp(x) - 1;
  }
  function cosh(x) {
    x = +x;
    if (x === 0) {
      return 1;
    }
    if ($isNaN(x)) {
      return NaN;
    }
    if (!$isFinite(x)) {
      return Infinity;
    }
    if (x < 0) {
      x = -x;
    }
    if (x > 21) {
      return exp(x) / 2;
    }
    return (exp(x) + exp(-x)) / 2;
  }
  function sinh(x) {
    x = +x;
    if (!$isFinite(x) || x === 0) {
      return x;
    }
    return (exp(x) - exp(-x)) / 2;
  }
  function tanh(x) {
    x = +x;
    if (x === 0)
      return x;
    if (!$isFinite(x))
      return sign(x);
    var exp1 = exp(x);
    var exp2 = exp(-x);
    return (exp1 - exp2) / (exp1 + exp2);
  }
  function acosh(x) {
    x = +x;
    if (x < 1)
      return NaN;
    if (!$isFinite(x))
      return x;
    return log(x + sqrt(x + 1) * sqrt(x - 1));
  }
  function asinh(x) {
    x = +x;
    if (x === 0 || !$isFinite(x))
      return x;
    if (x > 0)
      return log(x + sqrt(x * x + 1));
    return -log(-x + sqrt(x * x + 1));
  }
  function atanh(x) {
    x = +x;
    if (x === -1) {
      return -Infinity;
    }
    if (x === 1) {
      return Infinity;
    }
    if (x === 0) {
      return x;
    }
    if ($isNaN(x) || x < -1 || x > 1) {
      return NaN;
    }
    return 0.5 * log((1 + x) / (1 - x));
  }
  function hypot(x, y) {
    var length = arguments.length;
    var args = new Array(length);
    var max = 0;
    for (var i = 0; i < length; i++) {
      var n = arguments[i];
      n = +n;
      if (n === Infinity || n === -Infinity)
        return Infinity;
      n = abs(n);
      if (n > max)
        max = n;
      args[i] = n;
    }
    if (max === 0)
      max = 1;
    var sum = 0;
    var compensation = 0;
    for (var i = 0; i < length; i++) {
      var n = args[i] / max;
      var summand = n * n - compensation;
      var preliminary = sum + summand;
      compensation = (preliminary - sum) - summand;
      sum = preliminary;
    }
    return sqrt(sum) * max;
  }
  function trunc(x) {
    x = +x;
    if (x > 0)
      return floor(x);
    if (x < 0)
      return ceil(x);
    return x;
  }
  var fround,
      f32;
  if (typeof Float32Array === 'function') {
    f32 = new Float32Array(1);
    fround = function(x) {
      f32[0] = Number(x);
      return f32[0];
    };
  } else {
    fround = jsFround;
  }
  function cbrt(x) {
    x = +x;
    if (x === 0)
      return x;
    var negate = x < 0;
    if (negate)
      x = -x;
    var result = pow(x, 1 / 3);
    return negate ? -result : result;
  }
  function polyfillMath(global) {
    var Math = global.Math;
    maybeAddFunctions(Math, ['acosh', acosh, 'asinh', asinh, 'atanh', atanh, 'cbrt', cbrt, 'clz32', clz32, 'cosh', cosh, 'expm1', expm1, 'fround', fround, 'hypot', hypot, 'imul', imul, 'log10', log10, 'log1p', log1p, 'log2', log2, 'sign', sign, 'sinh', sinh, 'tanh', tanh, 'trunc', trunc]);
  }
  registerPolyfill(polyfillMath);
  return {
    get clz32() {
      return clz32;
    },
    get imul() {
      return imul;
    },
    get sign() {
      return sign;
    },
    get log10() {
      return log10;
    },
    get log2() {
      return log2;
    },
    get log1p() {
      return log1p;
    },
    get expm1() {
      return expm1;
    },
    get cosh() {
      return cosh;
    },
    get sinh() {
      return sinh;
    },
    get tanh() {
      return tanh;
    },
    get acosh() {
      return acosh;
    },
    get asinh() {
      return asinh;
    },
    get atanh() {
      return atanh;
    },
    get hypot() {
      return hypot;
    },
    get trunc() {
      return trunc;
    },
    get fround() {
      return fround;
    },
    get cbrt() {
      return cbrt;
    },
    get polyfillMath() {
      return polyfillMath;
    }
  };
});
System.get("traceur-runtime@0.0.88/src/runtime/polyfills/Math.js" + '');
System.registerModule("traceur-runtime@0.0.88/src/runtime/polyfills/polyfills.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.88/src/runtime/polyfills/polyfills.js";
  var polyfillAll = System.get("traceur-runtime@0.0.88/src/runtime/polyfills/utils.js").polyfillAll;
  polyfillAll(Reflect.global);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.88/src/runtime/polyfills/polyfills.js" + '');

System = curSystem; })();
(function(global) {

  var defined = {};

  // indexOf polyfill for IE8
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var getOwnPropertyDescriptor = true;
  try {
    Object.getOwnPropertyDescriptor({ a: 0 }, 'a');
  }
  catch(e) {
    getOwnPropertyDescriptor = false;
  }

  var defineProperty;
  (function () {
    try {
      if (!!Object.defineProperty({}, 'a', {}))
        defineProperty = Object.defineProperty;
    }
    catch (e) {
      defineProperty = function(obj, prop, opt) {
        try {
          obj[prop] = opt.value || opt.get.call(obj);
        }
        catch(e) {}
      }
    }
  })();

  function register(name, deps, declare) {
    if (arguments.length === 4)
      return registerDynamic.apply(this, arguments);
    doRegister(name, {
      declarative: true,
      deps: deps,
      declare: declare
    });
  }

  function registerDynamic(name, deps, executingRequire, execute) {
    doRegister(name, {
      declarative: false,
      deps: deps,
      executingRequire: executingRequire,
      execute: execute
    });
  }

  function doRegister(name, entry) {
    entry.name = name;

    // we never overwrite an existing define
    if (!(name in defined))
      defined[name] = entry;

    // we have to normalize dependencies
    // (assume dependencies are normalized for now)
    // entry.normalizedDeps = entry.deps.map(normalize);
    entry.normalizedDeps = entry.deps;
  }


  function buildGroups(entry, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, groups);
    }
  }

  function link(name) {
    var startEntry = defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry);
        else
          linkDynamicModule(entry);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(global, function(name, value) {
      module.locked = true;

      if (typeof name == 'object') {
        for (var p in name)
          exports[p] = name[p];
      }
      else {
        exports[name] = value;
      }

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          for (var j = 0; j < importerModule.dependencies.length; ++j) {
            if (importerModule.dependencies[j] === module) {
              importerModule.setters[j](exports);
            }
          }
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      else if (depEntry && !depEntry.declarative) {
        depExports = depEntry.esModule;
      }
      // in the module registry
      else if (!depEntry) {
        depExports = load(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else
        module.dependencies.push(null);

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name) {
    var exports;
    var entry = defined[name];

    if (!entry) {
      exports = load(name);
      if (!exports)
        throw new Error("Unable to load dependency " + name + ".");
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, []);

      else if (!entry.evaluated)
        linkDynamicModule(entry);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry) {
    if (entry.module)
      return;

    var exports = {};

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i]);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;

    // create the esModule object, which allows ES6 named imports of dynamics
    exports = module.exports;
 
    if (exports && exports.__esModule) {
      entry.esModule = exports;
    }
    else {
      entry.esModule = {};
      
      // don't trigger getters/setters in environments that support them
      if ((typeof exports == 'object' || typeof exports == 'function') && exports !== global) {
        if (getOwnPropertyDescriptor) {
          var d;
          for (var p in exports)
            if (d = Object.getOwnPropertyDescriptor(exports, p))
              defineProperty(entry.esModule, p, d);
        }
        else {
          var hasOwnProperty = exports && exports.hasOwnProperty;
          for (var p in exports) {
            if (!hasOwnProperty || exports.hasOwnProperty(p))
              entry.esModule[p] = exports[p];
          }
         }
       }
      entry.esModule['default'] = exports;
      defineProperty(entry.esModule, '__useDefault', {
        value: true
      });
    }
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen) {
    var entry = defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!defined[depName])
          load(depName);
        else
          ensureEvaluated(depName, seen);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(global);
  }

  // magical execution function
  var modules = {};
  function load(name) {
    if (modules[name])
      return modules[name];

    // node core modules
    if (name.substr(0, 6) == '@node/')
      return require(name.substr(6));

    var entry = defined[name];

    // first we check if this module has already been defined in the registry
    if (!entry)
      throw "Module " + name + " not present.";

    // recursively ensure that the module and all its 
    // dependencies are linked (with dependency group handling)
    link(name);

    // now handle dependency execution in correct order
    ensureEvaluated(name, []);

    // remove from the registry
    defined[name] = undefined;

    // exported modules get __esModule defined for interop
    if (entry.declarative)
      defineProperty(entry.module.exports, '__esModule', { value: true });

    // return the defined module object
    return modules[name] = entry.declarative ? entry.module.exports : entry.esModule;
  };

  return function(mains, depNames, declare) {
    return function(formatDetect) {
      formatDetect(function(deps) {
        var System = {
          _nodeRequire: typeof require != 'undefined' && require.resolve && typeof process != 'undefined' && require,
          register: register,
          registerDynamic: registerDynamic,
          get: load, 
          set: function(name, module) {
            modules[name] = module; 
          },
          newModule: function(module) {
            return module;
          }
        };
        System.set('@empty', {});

        // register external dependencies
        for (var i = 0; i < depNames.length; i++) (function(depName, dep) {
          if (dep && dep.__esModule)
            System.register(depName, [], function(_export) {
              return {
                setters: [],
                execute: function() {
                  for (var p in dep)
                    if (p != '__esModule' && !(typeof p == 'object' && p + '' == 'Module'))
                      _export(p, dep[p]);
                }
              };
            });
          else
            System.registerDynamic(depName, [], false, function() {
              return dep;
            });
        })(depNames[i], arguments[i]);

        // register modules in this bundle
        declare(System);

        // load mains
        var firstLoad = load(mains[0]);
        if (mains.length > 1)
          for (var i = 1; i < mains.length; i++)
            load(mains[i]);

        if (firstLoad.__useDefault)
          return firstLoad['default'];
        else
          return firstLoad;
      });
    };
  };

})(typeof self != 'undefined' ? self : global)
/* (['mainModule'], ['external-dep'], function($__System) {
  System.register(...);
})
(function(factory) {
  if (typeof define && define.amd)
    define(['external-dep'], factory);
  // etc UMD / module pattern
})*/

(['1'], [], function($__System) {

(function(__global) {
  var loader = $__System;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  function readMemberExpression(p, value) {
    var pParts = p.split('.');
    while (pParts.length)
      value = value[pParts.shift()];
    return value;
  }

  // bare minimum ignores for IE8
  var ignoredGlobalProps = ['_g', 'sessionStorage', 'localStorage', 'clipboardData', 'frames', 'external', 'mozAnimationStartTime', 'webkitStorageInfo', 'webkitIndexedDB'];

  var globalSnapshot;

  function forEachGlobal(callback) {
    if (Object.keys)
      Object.keys(__global).forEach(callback);
    else
      for (var g in __global) {
        if (!hasOwnProperty.call(__global, g))
          continue;
        callback(g);
      }
  }

  function forEachGlobalValue(callback) {
    forEachGlobal(function(globalName) {
      if (indexOf.call(ignoredGlobalProps, globalName) != -1)
        return;
      try {
        var value = __global[globalName];
      }
      catch (e) {
        ignoredGlobalProps.push(globalName);
      }
      callback(globalName, value);
    });
  }

  loader.set('@@global-helpers', loader.newModule({
    prepareGlobal: function(moduleName, exportName, globals) {
      // disable module detection
      var curDefine = __global.define;
       
      __global.define = undefined;
      __global.exports = undefined;
      if (__global.module && __global.module.exports)
        __global.module = undefined;

      // set globals
      var oldGlobals;
      if (globals) {
        oldGlobals = {};
        for (var g in globals) {
          oldGlobals[g] = globals[g];
          __global[g] = globals[g];
        }
      }

      // store a complete copy of the global object in order to detect changes
      if (!exportName) {
        globalSnapshot = {};

        forEachGlobalValue(function(name, value) {
          globalSnapshot[name] = value;
        });
      }

      // return function to retrieve global
      return function() {
        var globalValue;

        if (exportName) {
          globalValue = readMemberExpression(exportName, __global);
        }
        else {
          var singleGlobal;
          var multipleExports;
          var exports = {};

          forEachGlobalValue(function(name, value) {
            if (globalSnapshot[name] === value)
              return;
            if (typeof value == 'undefined')
              return;
            exports[name] = value;

            if (typeof singleGlobal != 'undefined') {
              if (!multipleExports && singleGlobal !== value)
                multipleExports = true;
            }
            else {
              singleGlobal = value;
            }
          });
          globalValue = multipleExports ? exports : singleGlobal;
        }

        // revert globals
        if (oldGlobals) {
          for (var g in oldGlobals)
            __global[g] = oldGlobals[g];
        }
        __global.define = curDefine;

        return globalValue;
      };
    }
  }));

})(typeof self != 'undefined' ? self : global);

(function(__global) {
  var loader = $__System;
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
  var cjsRequirePre = "(?:^|[^$_a-zA-Z\\xA0-\\uFFFF.])";
  var cjsRequirePost = "\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)')\\s*\\)";
  var fnBracketRegEx = /\(([^\)]*)\)/;
  var wsRegEx = /^\s+|\s+$/g;
  
  var requireRegExs = {};

  function getCJSDeps(source, requireIndex) {

    // remove comments
    source = source.replace(commentRegEx, '');

    // determine the require alias
    var params = source.match(fnBracketRegEx);
    var requireAlias = (params[1].split(',')[requireIndex] || 'require').replace(wsRegEx, '');

    // find or generate the regex for this requireAlias
    var requireRegEx = requireRegExs[requireAlias] || (requireRegExs[requireAlias] = new RegExp(cjsRequirePre + requireAlias + cjsRequirePost, 'g'));

    requireRegEx.lastIndex = 0;

    var deps = [];

    var match;
    while (match = requireRegEx.exec(source))
      deps.push(match[2] || match[3]);

    return deps;
  }

  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = loader.amdRequire
  */
  function require(names, callback, errback, referer) {
    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

    // amd require
    if (typeof names == 'string' && typeof callback == 'function')
      names = [names];
    if (names instanceof Array) {
      var dynamicRequires = [];
      for (var i = 0; i < names.length; i++)
        dynamicRequires.push(loader['import'](names[i], referer));
      Promise.all(dynamicRequires).then(function(modules) {
        if (callback)
          callback.apply(null, modules);
      }, errback);
    }

    // commonjs require
    else if (typeof names == 'string') {
      var module = loader.get(names);
      return module.__useDefault ? module['default'] : module;
    }

    else
      throw new TypeError('Invalid require');
  }

  function define(name, deps, factory) {
    if (typeof name != 'string') {
      factory = deps;
      deps = name;
      name = null;
    }
    if (!(deps instanceof Array)) {
      factory = deps;
      deps = ['require', 'exports', 'module'].splice(0, factory.length);
    }

    if (typeof factory != 'function')
      factory = (function(factory) {
        return function() { return factory; }
      })(factory);

    // in IE8, a trailing comma becomes a trailing undefined entry
    if (deps[deps.length - 1] === undefined)
      deps.pop();

    // remove system dependencies
    var requireIndex, exportsIndex, moduleIndex;
    
    if ((requireIndex = indexOf.call(deps, 'require')) != -1) {
      
      deps.splice(requireIndex, 1);

      // only trace cjs requires for non-named
      // named defines assume the trace has already been done
      if (!name)
        deps = deps.concat(getCJSDeps(factory.toString(), requireIndex));
    }

    if ((exportsIndex = indexOf.call(deps, 'exports')) != -1)
      deps.splice(exportsIndex, 1);
    
    if ((moduleIndex = indexOf.call(deps, 'module')) != -1)
      deps.splice(moduleIndex, 1);

    var define = {
      name: name,
      deps: deps,
      execute: function(req, exports, module) {

        var depValues = [];
        for (var i = 0; i < deps.length; i++)
          depValues.push(req(deps[i]));

        module.uri = module.id;

        module.config = function() {};

        // add back in system dependencies
        if (moduleIndex != -1)
          depValues.splice(moduleIndex, 0, module);
        
        if (exportsIndex != -1)
          depValues.splice(exportsIndex, 0, exports);
        
        if (requireIndex != -1) 
          depValues.splice(requireIndex, 0, function(names, callback, errback) {
            if (typeof names == 'string' && typeof callback != 'function')
              return req(names);
            return require.call(loader, names, callback, errback, module.id);
          });

        var output = factory.apply(exportsIndex == -1 ? __global : exports, depValues);

        if (typeof output == 'undefined' && module)
          output = module.exports;

        if (typeof output != 'undefined')
          return output;
      }
    };

    // anonymous define
    if (!name) {
      // already defined anonymously -> throw
      if (lastModule.anonDefine)
        throw new TypeError('Multiple defines for anonymous module');
      lastModule.anonDefine = define;
    }
    // named define
    else {
      // if we don't have any other defines,
      // then let this be an anonymous define
      // this is just to support single modules of the form:
      // define('jquery')
      // still loading anonymously
      // because it is done widely enough to be useful
      if (!lastModule.anonDefine && !lastModule.isBundle) {
        lastModule.anonDefine = define;
      }
      // otherwise its a bundle only
      else {
        // if there is an anonDefine already (we thought it could have had a single named define)
        // then we define it now
        // this is to avoid defining named defines when they are actually anonymous
        if (lastModule.anonDefine && lastModule.anonDefine.name)
          loader.registerDynamic(lastModule.anonDefine.name, lastModule.anonDefine.deps, false, lastModule.anonDefine.execute);

        lastModule.anonDefine = null;
      }

      // note this is now a bundle
      lastModule.isBundle = true;

      // define the module through the register registry
      loader.registerDynamic(name, define.deps, false, define.execute);
    }
  }
  define.amd = {};

  // adds define as a global (potentially just temporarily)
  function createDefine(loader) {
    lastModule.anonDefine = null;
    lastModule.isBundle = false;

    // ensure no NodeJS environment detection
    var oldModule = __global.module;
    var oldExports = __global.exports;
    var oldDefine = __global.define;

    __global.module = undefined;
    __global.exports = undefined;
    __global.define = define;

    return function() {
      __global.define = oldDefine;
      __global.module = oldModule;
      __global.exports = oldExports;
    };
  }

  var lastModule = {
    isBundle: false,
    anonDefine: null
  };

  loader.set('@@amd-helpers', loader.newModule({
    createDefine: createDefine,
    require: require,
    define: define,
    lastModule: lastModule
  }));
  loader.amdDefine = define;
  loader.amdRequire = require;
})(typeof self != 'undefined' ? self : global);

"bundle";
$__System.registerDynamic("2", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<div class="panel panel-default">\n    <div class="panel-heading">\n        <h3 class="panel-title">Features</h3>\n    </div>\n    <div class="panel-body">\n        <div class="row">\n            <div class="col-xs-12 col-md-12">\n                <button type="file" class="btn btn-default btn-sm upload-layer" aria-label="Upload radio">\n                    <span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>Upload a layer\n                </button>\n                <input type="file" class="layer-upload" style="display: none;">\n            </div>\n        </div>\n        <div class="row">\n            <div class="col-xs-8 col-md-8">\n                <input type="text" class="form-control search" placeholder="Filter">\n                </div>\n            <div class="col-xs-4 col-md-4">\n                <button type="button" class="btn btn-primary pull-right sort asc" data-sort="feature-name" id="sort-btn"><i class="fa fa-sort"></i>&nbsp;&nbsp;Sort</button>\n            </div>\n        </div>\n    </div>\n    <div id="features"></div>\n</div>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.register("3", ["4", "5", "6", "7", "2"], function($__export) {
  "use strict";
  var __moduleName = "3";
  var Backbone,
      utils,
      pcapi,
      Mapper,
      sidePanelTemplate,
      UploadLayerView;
  return {
    setters: [function($__m) {
      Backbone = $__m.default;
    }, function($__m) {
      utils = $__m;
    }, function($__m) {
      pcapi = $__m.default;
    }, function($__m) {
      Mapper = $__m.default;
    }, function($__m) {
      sidePanelTemplate = $__m.default;
    }],
    execute: function() {
      UploadLayerView = function($__super) {
        function UploadLayerView() {
          $traceurRuntime.superConstructor(UploadLayerView).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(UploadLayerView, {
          initialize: function() {
            var params = utils.getParams();
            this.options = {};
            if (params) {
              this.options.copyToPublic = (params.public === 'true');
            }
            pcapi.init({
              "url": cfg.baseurl,
              "version": cfg.version
            });
            pcapi.setCloudLogin(cfg.userid);
            $('#header-menu li').removeClass('active');
            $('#header-menu li a[href="#/upload-layer"]').parent().addClass('active');
            this.mapper = new Mapper({id: 'mapLayer'});
            this.render();
          },
          createLayersList: function() {
            utils.loading(true);
            var options = {"remoteDir": "features"};
            pcapi.getItems(options).then($.proxy(function(data) {
              utils.loading(false);
              var list = '<ul class="list-group">';
              data.metadata.forEach(function(element, index) {
                var layerName = element.replace("/features//", "");
                list += '<li class="list-group-item"> ' + '<input type="checkbox" class="map-layer" value="' + layerName + '">' + layerName + '</li>';
              });
              list += '</ul>';
              $("#features").html(list);
            }, this));
          },
          render: function() {
            var mapId = 'mapLayer';
            $("#content").html('<div id="sidebar"></div>' + '<div id="' + mapId + '">' + '<button type="button" class="btn-custom btn btn-default popover-hover" ' + 'id="showHidePanel" data-content="Hide/Reveal Search Panel">' + '<span class="glyphicon glyphicon-chevron-left"></span>' + '</button>' + '</div>');
            this.map = this.mapper.initMap();
            this.enableEvents();
            $("#sidebar").html(sidePanelTemplate());
            this.createLayersList();
          },
          displayLayer: function() {
            $(document).off('change', '.map-layer');
            $(document).on('change', '.map-layer', $.proxy(function(event) {
              var $currentTarget = $(event.currentTarget);
              var layerName = $currentTarget.val();
              if ($currentTarget.is(":checked")) {
                this.mapper.addKMLLayer(layerName, pcapi.buildUrl('features', layerName));
              } else {
                this.mapper.removeLayer(layerName);
              }
            }, this));
          },
          enableEvents: function() {
            this.showHidePanel();
            this.uploadLayer();
            this.displayLayer();
          },
          showHidePanel: function() {
            $(document).off('click', "#showHidePanel");
            $(document).on('click', "#showHidePanel", $.proxy(function() {
              $('#sidebar').toggle();
              $("#showHidePanel span").toggleClass("glyphicon-chevron-left glyphicon-chevron-right");
              this.map.invalidateSize();
              return false;
            }, this));
          },
          uploadLayer: function() {
            $(document).off("click", ".upload-layer");
            $(document).on("click", ".upload-layer", function() {
              $(this).next().trigger('click');
            });
            $(document).off("change", ".layer-upload");
            $(document).on("change", ".layer-upload", $.proxy(function(e) {
              var files = e.target.files || e.dataTransfer.files;
              var file = files[0];
              var path = "";
              var options = {
                "remoteDir": "features",
                "path": path + file.name,
                "file": file,
                "contentType": false
              };
              if (this.options.copyToPublic) {
                options.urlParams = {'public': 'true'};
              }
              utils.loading(true);
              pcapi.uploadFile(options, "PUT").then($.proxy(function(data) {
                utils.loading(false);
                utils.giveFeedback(data.msg);
                var name = utils.getFilenameFromURL(data.path);
                console.log(name);
              }, this));
            }, this));
          }
        }, {}, $__super);
      }(Backbone.View);
      $__export("UploadLayerView", UploadLayerView);
    }
  };
});

$__System.register("8", ["9"], function($__export) {
  "use strict";
  var __moduleName = "8";
  var $,
      Convertor;
  return {
    setters: [function($__m) {
      $ = $__m.default;
    }],
    execute: function() {
      Convertor = function() {
        function Convertor() {
          this.form = {};
        }
        return ($traceurRuntime.createClass)(Convertor, {
          encodeEntities: function(text) {
            return $('<div />').text(text).html();
          },
          JSONtoHTML: function(form) {
            var self = this;
            if (form) {
              this.form = form;
            }
            var html = [];
            this.form.title = this.form.title.replace('"', '&quot;');
            html.push('<form data-title=\"' + this.form.title + '\" data-ajax=\"false\" novalidate>\n');
            html.push('<div class="fieldcontain fieldcontain-geometryType"' + ' id="fieldcontain-geometryType" data-cobweb-type="geometryType">\n');
            html.push('<input type="hidden" data-record-geometry="' + this.form.geoms.join(",") + '" value="' + this.form.geoms.join(",") + '">\n');
            html.push('</div>\n');
            this.form = this.form || [];
            this.form.fields.forEach(function(value) {
              var key = value.id;
              var properties = value.properties;
              var splits = key.split("-");
              var type = splits[1];
              var n = splits[2];
              var required = "";
              if (value.required) {
                required = 'required="required"';
              }
              var persistent = "";
              if (value.persistent) {
                persistent = 'data-persistent="on"';
              }
              var visibility = "";
              if (properties.visibility) {
                visibility = 'data-visibility="' + properties.visibility.id.replace("fieldcontain-", "") + ' ' + properties.visibility.operator + ' \'' + properties.visibility.answer + '\'"';
              }
              value.label = self.encodeEntities(value.label);
              switch (type) {
                case 'text':
                  html.push('<div class="fieldcontain" id="' + key + '" data-fieldtrip-type="' + type + '" ' + persistent + ' ' + visibility + '>\n');
                  html.push('<label for="form-' + type + '-' + n + '">' + value.label + '</label>\n');
                  html.push('<input name="form-' + type + '-' + n + '" id="form-' + type + '-' + n + '" type="text" ' + required + ' placeholder="' + properties.placeholder + '" maxlength="' + properties["max-chars"] + '" value="' + properties.prefix + '">\n');
                  html.push('</div>\n');
                  break;
                case 'textarea':
                  html.push('<div class="fieldcontain" id="' + key + '" data-fieldtrip-type="' + type + '" ' + persistent + ' ' + visibility + '>\n');
                  html.push('<label for="form-' + type + '-' + n + '">' + value.label + '</label>\n');
                  html.push('<textarea name="form-' + type + '-' + n + '" id="form-' + type + '-' + n + '" ' + required + ' placeholder="' + properties.placeholder + '"></textarea>\n');
                  html.push('</div>\n');
                  break;
                case 'range':
                  html.push('<div class="fieldcontain" id="' + key + '" data-fieldtrip-type="' + type + '" ' + persistent + ' ' + visibility + '>\n');
                  html.push('<label for="form-' + type + '-' + n + '">' + (value.label) + '</label>\n');
                  html.push('<input name="form-' + type + '-' + n + '" id="form-' + type + '-' + n + '" type="range" ' + required + ' placeholder="' + properties.placeholder + '" step="' + properties.step + '" min="' + properties.min + '" max="' + properties.max + '">\n');
                  html.push('</div>\n');
                  break;
                case 'checkbox':
                  html.push('<div class="fieldcontain" id="' + key + '" data-fieldtrip-type="' + type + '" ' + persistent + ' ' + visibility + '>\n');
                  html.push('<fieldset>\n<legend>' + value.label + '</legend>\n');
                  properties.options.forEach(function(v, k) {
                    if ("image" in v) {
                      html.push('<label for="' + key + '-' + k + '">\n');
                      html.push('<div class="ui-grid-a grids">\n');
                      html.push('<div class="ui-block-a"><p>' + v.value + '</p></div>\n');
                      html.push('<div class="ui-block-b"><img src="' + self.getFilenameFromURL(v.image.src) + '"></div>\n');
                      html.push('</div>\n');
                      html.push('</label>');
                      html.push('<input name="' + key + '-' + k + '" id="' + key + '-' + k + '" value="' + v.value + '" type="' + type + '" ' + required + '>\n');
                    } else {
                      html.push('<label for="' + key + '-' + k + '">' + v.value + '</label>\n');
                      html.push('<input name="' + key + '-' + k + '" id="' + key + '-' + k + '" value="' + v.value + '" type="' + type + '" ' + required + '>\n');
                    }
                  });
                  if (value.other === true) {
                    html.push('<label for="' + key + '-' + properties.options.length + '" class="other">' + i18n.t('checkbox.other') + '</label>\n');
                    html.push('<input name="' + key + '" id="' + key + '-' + properties.options.length + '" value="other"' + ' class="other" type="' + type + '" ' + required + '>\n');
                  }
                  html.push('</fieldset>\n</div>\n');
                  break;
                case 'radio':
                  html.push('<div class="fieldcontain" id="' + key + '" data-fieldtrip-type="' + type + '" ' + persistent + ' ' + visibility + '>\n');
                  html.push('<fieldset>\n<legend>' + value.label + '</legend>\n');
                  properties.options.forEach(function(v, k) {
                    if ("image" in v) {
                      html.push('<label for="' + key + '-' + k + '">\n');
                      html.push('<div class="ui-grid-a grids">\n');
                      html.push('<div class="ui-block-a"><p>' + v.value + '</p></div>\n');
                      html.push('<div class="ui-block-b"><img src="' + self.getFilenameFromURL(v.image.src) + '"></div>\n');
                      html.push('</div>\n');
                      html.push('</label>');
                      html.push('<input name="' + key + '" id="' + key + '-' + k + '" value="' + v.value + '" type="' + type + '" ' + required + '>\n');
                    } else {
                      html.push('<label for="' + key + '-' + k + '">' + v.value + '</label>\n');
                      html.push('<input name="' + key + '" id="' + key + '-' + k + '" value="' + v.value + '" type="' + type + '" ' + required + '>\n');
                    }
                  });
                  if (value.other === true) {
                    html.push('<label for="' + key + '-' + properties.options.length + '" class="other">' + i18n.t('radio.other') + '</label>\n');
                    html.push('<input name="' + key + '" id="' + key + '-' + properties.options.length + '" value="other" class="other" type="' + type + '" ' + required + '>\n');
                  }
                  html.push('</fieldset>\n</div>\n');
                  break;
                case 'select':
                  html.push('<div class="fieldcontain" id="' + key + '"' + ' data-fieldtrip-type="' + type + '" ' + persistent + ' ' + visibility + '>\n');
                  html.push('<fieldset>\n<legend>' + value.label + '</legend>\n');
                  if (required !== "") {
                    html.push('<select name="' + key + '" required="required">\n');
                    html.push('<option value=""></option>\n');
                  } else {
                    html.push('<select id="' + key + '">\n');
                  }
                  properties.options.forEach(function(v, k) {
                    html.push('<option value="' + v + '">' + v + '</option>\n');
                  });
                  html.push('</select>\n</fieldset>\n</div>\n');
                  break;
                case 'dtree':
                  html.push('<div class="fieldcontain" id="' + key + '" data-fieldtrip-type="' + type + '" ' + visibility + '>\n');
                  html.push('<fieldset>\n<label for="fieldcontain-' + type + '-' + n + '">' + value.label + '</label>\n');
                  html.push('<div class="button-wrapper button-dtree"></div>\n');
                  html.push('</fieldset>\n');
                  html.push('<input type="hidden" data-dtree="' + properties.filename + '" value="' + properties.filename + '">\n');
                  html.push('</div>\n');
                  break;
                case 'multiimage':
                case 'image':
                  var cl = "camera";
                  if (properties["multi-image"] === true) {
                    type = 'multiimage';
                  }
                  if (properties.los === true) {
                    cl = "camera-va";
                  }
                  html.push('<div class="fieldcontain" id="fieldcontain-' + type + '-1" data-fieldtrip-type="' + cl + '" ' + visibility + '>\n');
                  html.push('<div class="button-wrapper button-' + cl + '">\n');
                  html.push('<input name="form-image-1" id="form-image-1"' + ' type="file" accept="image/png" capture="' + cl + '" ' + required + ' class="' + cl + '">\n');
                  html.push('<label for="form-image-1">' + value.label + '</label>\n');
                  if (properties.blur) {
                    html.push('<div style="display:none;" id="blur-threshold" value="' + properties.blur + '"></div>');
                  }
                  html.push('</div>\n</div>\n');
                  break;
                case 'audio':
                  html.push('<div class="fieldcontain" id="fieldcontain-audio-1" data-fieldtrip-type="microphone" ' + visibility + '>\n');
                  html.push('<div class="button-wrapper button-microphone">\n');
                  html.push('<input name="form-audio-1" id="form-audio-1" type="file" accept="audio/*" capture="microphone" ' + required + ' class="microphone">\n');
                  html.push('<label for="form-audio-1">' + value.label + '</label>\n');
                  html.push('</div>\n</div>\n');
                  break;
                case 'gps':
                  break;
                case 'warning':
                  html.push('<div class="fieldcontain" id="' + key + '" data-fieldtrip-type="' + type + '">\n');
                  html.push('<label for="form-' + type + '-' + n + '">' + value.label + '</label>\n');
                  html.push('<textarea name="form-' + type + '-' + n + '" id="form-' + type + '-' + n + '" ' + required + ' placeholder="' + properties.placeholder + '"></textarea>\n');
                  html.push('</div>\n');
                  break;
                case 'section':
                  html.push('<div class="fieldcontain" id="' + key + '" data-fieldtrip-type="' + type + '">\n');
                  html.push('<h3>' + value.label + '</h3>\n');
                  html.push('</div>\n');
                  break;
              }
            });
            html.push('<div id="save-cancel-editor-buttons" class="fieldcontain ui-grid-a">\n');
            html.push('<div class="ui-block-a">\n');
            html.push('<input type="submit" name="record" value="Save">\n');
            html.push('</div>\n');
            html.push('<div class="ui-block-b">\n');
            html.push('<input type="button" name="cancel" value="Cancel">\n');
            html.push('</div>\n');
            html.push('</div>\n');
            html.push('</form>');
            return html;
          },
          getFilenameFromURL: function(path) {
            return path.substring(path.length, path.lastIndexOf('/') + 1);
          }
        }, {});
      }();
      $__export('default', Convertor);
    }
  };
});

$__System.register("a", ["8"], function($__export) {
  "use strict";
  var __moduleName = "a";
  var $__exportNames = {undefined: true};
  return {
    setters: [function($__m) {
      $__export({default: $__m.default});
      var exportObj = Object.create(null);
      Object.keys($__m).forEach(function(p) {
        if (p !== 'default' && !$__exportNames[p])
          exportObj[p] = $__m[p];
      });
      $__export(exportObj);
    }],
    execute: function() {}
  };
});

$__System.registerDynamic("b", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  !function(t, e) {
    L.drawVersion = "0.2.4-dev", L.drawLocal = {
      draw: {
        toolbar: {
          actions: {
            title: "Cancel drawing",
            text: "Cancel"
          },
          undo: {
            title: "Delete last point drawn",
            text: "Delete last point"
          },
          buttons: {
            polyline: "Draw a polyline",
            polygon: "Draw a polygon",
            rectangle: "Draw a rectangle",
            circle: "Draw a circle",
            marker: "Draw a marker"
          }
        },
        handlers: {
          circle: {tooltip: {start: "Click and drag to draw circle."}},
          marker: {tooltip: {start: "Click map to place marker."}},
          polygon: {tooltip: {
              start: "Click to start drawing shape.",
              cont: "Click to continue drawing shape.",
              end: "Click first point to close this shape."
            }},
          polyline: {
            error: "<strong>Error:</strong> shape edges cannot cross!",
            tooltip: {
              start: "Click to start drawing line.",
              cont: "Click to continue drawing line.",
              end: "Click last point to finish line."
            }
          },
          rectangle: {tooltip: {start: "Click and drag to draw rectangle."}},
          simpleshape: {tooltip: {end: "Release mouse to finish drawing."}}
        }
      },
      edit: {
        toolbar: {
          actions: {
            save: {
              title: "Save changes.",
              text: "Save"
            },
            cancel: {
              title: "Cancel editing, discards all changes.",
              text: "Cancel"
            }
          },
          buttons: {
            edit: "Edit layers.",
            editDisabled: "No layers to edit.",
            remove: "Delete layers.",
            removeDisabled: "No layers to delete."
          }
        },
        handlers: {
          edit: {tooltip: {
              text: "Drag handles, or marker to edit feature.",
              subtext: "Click cancel to undo changes."
            }},
          remove: {tooltip: {text: "Click on a feature to remove"}}
        }
      }
    }, L.Draw = {}, L.Draw.Feature = L.Handler.extend({
      includes: L.Mixin.Events,
      initialize: function(t, e) {
        this._map = t, this._container = t._container, this._overlayPane = t._panes.overlayPane, this._popupPane = t._panes.popupPane, e && e.shapeOptions && (e.shapeOptions = L.Util.extend({}, this.options.shapeOptions, e.shapeOptions)), L.setOptions(this, e);
      },
      enable: function() {
        this._enabled || (this.fire("enabled", {handler: this.type}), this._map.fire("draw:drawstart", {layerType: this.type}), L.Handler.prototype.enable.call(this));
      },
      disable: function() {
        this._enabled && (L.Handler.prototype.disable.call(this), this._map.fire("draw:drawstop", {layerType: this.type}), this.fire("disabled", {handler: this.type}));
      },
      addHooks: function() {
        var t = this._map;
        t && (L.DomUtil.disableTextSelection(), t.getContainer().focus(), this._tooltip = new L.Tooltip(this._map), L.DomEvent.on(this._container, "keyup", this._cancelDrawing, this));
      },
      removeHooks: function() {
        this._map && (L.DomUtil.enableTextSelection(), this._tooltip.dispose(), this._tooltip = null, L.DomEvent.off(this._container, "keyup", this._cancelDrawing, this));
      },
      setOptions: function(t) {
        L.setOptions(this, t);
      },
      _fireCreatedEvent: function(t) {
        this._map.fire("draw:created", {
          layer: t,
          layerType: this.type
        });
      },
      _cancelDrawing: function(t) {
        27 === t.keyCode && this.disable();
      }
    }), L.Draw.Polyline = L.Draw.Feature.extend({
      statics: {TYPE: "polyline"},
      Poly: L.Polyline,
      options: {
        allowIntersection: !0,
        repeatMode: !1,
        drawError: {
          color: "#b00b00",
          timeout: 2500
        },
        icon: new L.DivIcon({
          iconSize: new L.Point(8, 8),
          className: "leaflet-div-icon leaflet-editing-icon"
        }),
        guidelineDistance: 20,
        maxGuideLineLength: 4e3,
        shapeOptions: {
          stroke: !0,
          color: "#f06eaa",
          weight: 4,
          opacity: .5,
          fill: !1,
          clickable: !0
        },
        metric: !0,
        showLength: !0,
        zIndexOffset: 2e3
      },
      initialize: function(t, e) {
        this.options.drawError.message = L.drawLocal.draw.handlers.polyline.error, e && e.drawError && (e.drawError = L.Util.extend({}, this.options.drawError, e.drawError)), this.type = L.Draw.Polyline.TYPE, L.Draw.Feature.prototype.initialize.call(this, t, e);
      },
      addHooks: function() {
        L.Draw.Feature.prototype.addHooks.call(this), this._map && (this._markers = [], this._markerGroup = new L.LayerGroup, this._map.addLayer(this._markerGroup), this._poly = new L.Polyline([], this.options.shapeOptions), this._tooltip.updateContent(this._getTooltipText()), this._mouseMarker || (this._mouseMarker = L.marker(this._map.getCenter(), {
          icon: L.divIcon({
            className: "leaflet-mouse-marker",
            iconAnchor: [20, 20],
            iconSize: [40, 40]
          }),
          opacity: 0,
          zIndexOffset: this.options.zIndexOffset
        })), this._mouseMarker.on("mousedown", this._onMouseDown, this).addTo(this._map), this._map.on("mousemove", this._onMouseMove, this).on("mouseup", this._onMouseUp, this).on("zoomend", this._onZoomEnd, this));
      },
      removeHooks: function() {
        L.Draw.Feature.prototype.removeHooks.call(this), this._clearHideErrorTimeout(), this._cleanUpShape(), this._map.removeLayer(this._markerGroup), delete this._markerGroup, delete this._markers, this._map.removeLayer(this._poly), delete this._poly, this._mouseMarker.off("mousedown", this._onMouseDown, this).off("mouseup", this._onMouseUp, this), this._map.removeLayer(this._mouseMarker), delete this._mouseMarker, this._clearGuides(), this._map.off("mousemove", this._onMouseMove, this).off("zoomend", this._onZoomEnd, this);
      },
      deleteLastVertex: function() {
        if (!(this._markers.length <= 1)) {
          var t = this._markers.pop(),
              e = this._poly,
              i = this._poly.spliceLatLngs(e.getLatLngs().length - 1, 1)[0];
          this._markerGroup.removeLayer(t), e.getLatLngs().length < 2 && this._map.removeLayer(e), this._vertexChanged(i, !1);
        }
      },
      addVertex: function(t) {
        var e = this._markers.length;
        return e > 0 && !this.options.allowIntersection && this._poly.newLatLngIntersects(t) ? (this._showErrorTooltip(), void 0) : (this._errorShown && this._hideErrorTooltip(), this._markers.push(this._createMarker(t)), this._poly.addLatLng(t), 2 === this._poly.getLatLngs().length && this._map.addLayer(this._poly), this._vertexChanged(t, !0), void 0);
      },
      _finishShape: function() {
        var t = this._poly.newLatLngIntersects(this._poly.getLatLngs()[0], !0);
        return !this.options.allowIntersection && t || !this._shapeIsValid() ? (this._showErrorTooltip(), void 0) : (this._fireCreatedEvent(), this.disable(), this.options.repeatMode && this.enable(), void 0);
      },
      _shapeIsValid: function() {
        return !0;
      },
      _onZoomEnd: function() {
        this._updateGuide();
      },
      _onMouseMove: function(t) {
        var e = t.layerPoint,
            i = t.latlng;
        this._currentLatLng = i, this._updateTooltip(i), this._updateGuide(e), this._mouseMarker.setLatLng(i), L.DomEvent.preventDefault(t.originalEvent);
      },
      _vertexChanged: function(t, e) {
        this._updateFinishHandler(), this._updateRunningMeasure(t, e), this._clearGuides(), this._updateTooltip();
      },
      _onMouseDown: function(t) {
        var e = t.originalEvent;
        this._mouseDownOrigin = L.point(e.clientX, e.clientY);
      },
      _onMouseUp: function(e) {
        if (this._mouseDownOrigin) {
          var i = L.point(e.originalEvent.clientX, e.originalEvent.clientY).distanceTo(this._mouseDownOrigin);
          Math.abs(i) < 9 * (t.devicePixelRatio || 1) && this.addVertex(e.latlng);
        }
        this._mouseDownOrigin = null;
      },
      _updateFinishHandler: function() {
        var t = this._markers.length;
        t > 1 && this._markers[t - 1].on("click", this._finishShape, this), t > 2 && this._markers[t - 2].off("click", this._finishShape, this);
      },
      _createMarker: function(t) {
        var e = new L.Marker(t, {
          icon: this.options.icon,
          zIndexOffset: 2 * this.options.zIndexOffset
        });
        return this._markerGroup.addLayer(e), e;
      },
      _updateGuide: function(t) {
        var e = this._markers.length;
        e > 0 && (t = t || this._map.latLngToLayerPoint(this._currentLatLng), this._clearGuides(), this._drawGuide(this._map.latLngToLayerPoint(this._markers[e - 1].getLatLng()), t));
      },
      _updateTooltip: function(t) {
        var e = this._getTooltipText();
        t && this._tooltip.updatePosition(t), this._errorShown || this._tooltip.updateContent(e);
      },
      _drawGuide: function(t, e) {
        var i,
            o,
            a,
            s = Math.floor(Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2))),
            r = this.options.guidelineDistance,
            n = this.options.maxGuideLineLength,
            l = s > n ? s - n : r;
        for (this._guidesContainer || (this._guidesContainer = L.DomUtil.create("div", "leaflet-draw-guides", this._overlayPane)); s > l; l += this.options.guidelineDistance)
          i = l / s, o = {
            x: Math.floor(t.x * (1 - i) + i * e.x),
            y: Math.floor(t.y * (1 - i) + i * e.y)
          }, a = L.DomUtil.create("div", "leaflet-draw-guide-dash", this._guidesContainer), a.style.backgroundColor = this._errorShown ? this.options.drawError.color : this.options.shapeOptions.color, L.DomUtil.setPosition(a, o);
      },
      _updateGuideColor: function(t) {
        if (this._guidesContainer)
          for (var e = 0,
              i = this._guidesContainer.childNodes.length; i > e; e++)
            this._guidesContainer.childNodes[e].style.backgroundColor = t;
      },
      _clearGuides: function() {
        if (this._guidesContainer)
          for (; this._guidesContainer.firstChild; )
            this._guidesContainer.removeChild(this._guidesContainer.firstChild);
      },
      _getTooltipText: function() {
        var t,
            e,
            i = this.options.showLength;
        return 0 === this._markers.length ? t = {text: L.drawLocal.draw.handlers.polyline.tooltip.start} : (e = i ? this._getMeasurementString() : "", t = 1 === this._markers.length ? {
          text: L.drawLocal.draw.handlers.polyline.tooltip.cont,
          subtext: e
        } : {
          text: L.drawLocal.draw.handlers.polyline.tooltip.end,
          subtext: e
        }), t;
      },
      _updateRunningMeasure: function(t, e) {
        var i,
            o,
            a = this._markers.length;
        1 === this._markers.length ? this._measurementRunningTotal = 0 : (i = a - (e ? 2 : 1), o = t.distanceTo(this._markers[i].getLatLng()), this._measurementRunningTotal += o * (e ? 1 : -1));
      },
      _getMeasurementString: function() {
        var t,
            e = this._currentLatLng,
            i = this._markers[this._markers.length - 1].getLatLng();
        return t = this._measurementRunningTotal + e.distanceTo(i), L.GeometryUtil.readableDistance(t, this.options.metric);
      },
      _showErrorTooltip: function() {
        this._errorShown = !0, this._tooltip.showAsError().updateContent({text: this.options.drawError.message}), this._updateGuideColor(this.options.drawError.color), this._poly.setStyle({color: this.options.drawError.color}), this._clearHideErrorTimeout(), this._hideErrorTimeout = setTimeout(L.Util.bind(this._hideErrorTooltip, this), this.options.drawError.timeout);
      },
      _hideErrorTooltip: function() {
        this._errorShown = !1, this._clearHideErrorTimeout(), this._tooltip.removeError().updateContent(this._getTooltipText()), this._updateGuideColor(this.options.shapeOptions.color), this._poly.setStyle({color: this.options.shapeOptions.color});
      },
      _clearHideErrorTimeout: function() {
        this._hideErrorTimeout && (clearTimeout(this._hideErrorTimeout), this._hideErrorTimeout = null);
      },
      _cleanUpShape: function() {
        this._markers.length > 1 && this._markers[this._markers.length - 1].off("click", this._finishShape, this);
      },
      _fireCreatedEvent: function() {
        var t = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);
        L.Draw.Feature.prototype._fireCreatedEvent.call(this, t);
      }
    }), L.Draw.Polygon = L.Draw.Polyline.extend({
      statics: {TYPE: "polygon"},
      Poly: L.Polygon,
      options: {
        showArea: !1,
        shapeOptions: {
          stroke: !0,
          color: "#f06eaa",
          weight: 4,
          opacity: .5,
          fill: !0,
          fillColor: null,
          fillOpacity: .2,
          clickable: !0
        }
      },
      initialize: function(t, e) {
        L.Draw.Polyline.prototype.initialize.call(this, t, e), this.type = L.Draw.Polygon.TYPE;
      },
      _updateFinishHandler: function() {
        var t = this._markers.length;
        1 === t && this._markers[0].on("click", this._finishShape, this), t > 2 && (this._markers[t - 1].on("dblclick", this._finishShape, this), t > 3 && this._markers[t - 2].off("dblclick", this._finishShape, this));
      },
      _getTooltipText: function() {
        var t,
            e;
        return 0 === this._markers.length ? t = L.drawLocal.draw.handlers.polygon.tooltip.start : this._markers.length < 3 ? t = L.drawLocal.draw.handlers.polygon.tooltip.cont : (t = L.drawLocal.draw.handlers.polygon.tooltip.end, e = this._getMeasurementString()), {
          text: t,
          subtext: e
        };
      },
      _getMeasurementString: function() {
        var t = this._area;
        return t ? L.GeometryUtil.readableArea(t, this.options.metric) : null;
      },
      _shapeIsValid: function() {
        return this._markers.length >= 3;
      },
      _vertexChanged: function(t, e) {
        var i;
        !this.options.allowIntersection && this.options.showArea && (i = this._poly.getLatLngs(), this._area = L.GeometryUtil.geodesicArea(i)), L.Draw.Polyline.prototype._vertexChanged.call(this, t, e);
      },
      _cleanUpShape: function() {
        var t = this._markers.length;
        t > 0 && (this._markers[0].off("click", this._finishShape, this), t > 2 && this._markers[t - 1].off("dblclick", this._finishShape, this));
      }
    }), L.SimpleShape = {}, L.Draw.SimpleShape = L.Draw.Feature.extend({
      options: {repeatMode: !1},
      initialize: function(t, e) {
        this._endLabelText = L.drawLocal.draw.handlers.simpleshape.tooltip.end, L.Draw.Feature.prototype.initialize.call(this, t, e);
      },
      addHooks: function() {
        L.Draw.Feature.prototype.addHooks.call(this), this._map && (this._mapDraggable = this._map.dragging.enabled(), this._mapDraggable && this._map.dragging.disable(), this._container.style.cursor = "crosshair", this._tooltip.updateContent({text: this._initialLabelText}), this._map.on("mousedown", this._onMouseDown, this).on("mousemove", this._onMouseMove, this));
      },
      removeHooks: function() {
        L.Draw.Feature.prototype.removeHooks.call(this), this._map && (this._mapDraggable && this._map.dragging.enable(), this._container.style.cursor = "", this._map.off("mousedown", this._onMouseDown, this).off("mousemove", this._onMouseMove, this), L.DomEvent.off(e, "mouseup", this._onMouseUp, this), this._shape && (this._map.removeLayer(this._shape), delete this._shape)), this._isDrawing = !1;
      },
      _onMouseDown: function(t) {
        this._isDrawing = !0, this._startLatLng = t.latlng, L.DomEvent.on(e, "mouseup", this._onMouseUp, this).preventDefault(t.originalEvent);
      },
      _onMouseMove: function(t) {
        var e = t.latlng;
        this._tooltip.updatePosition(e), this._isDrawing && (this._tooltip.updateContent({text: this._endLabelText}), this._drawShape(e));
      },
      _onMouseUp: function() {
        this._shape && this._fireCreatedEvent(), this.disable(), this.options.repeatMode && this.enable();
      }
    }), L.Draw.Rectangle = L.Draw.SimpleShape.extend({
      statics: {TYPE: "rectangle"},
      options: {shapeOptions: {
          stroke: !0,
          color: "#f06eaa",
          weight: 4,
          opacity: .5,
          fill: !0,
          fillColor: null,
          fillOpacity: .2,
          clickable: !0
        }},
      initialize: function(t, e) {
        this.type = L.Draw.Rectangle.TYPE, this._initialLabelText = L.drawLocal.draw.handlers.rectangle.tooltip.start, L.Draw.SimpleShape.prototype.initialize.call(this, t, e);
      },
      _drawShape: function(t) {
        this._shape ? this._shape.setBounds(new L.LatLngBounds(this._startLatLng, t)) : (this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, t), this.options.shapeOptions), this._map.addLayer(this._shape));
      },
      _fireCreatedEvent: function() {
        var t = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, t);
      }
    }), L.Draw.Circle = L.Draw.SimpleShape.extend({
      statics: {TYPE: "circle"},
      options: {
        shapeOptions: {
          stroke: !0,
          color: "#f06eaa",
          weight: 4,
          opacity: .5,
          fill: !0,
          fillColor: null,
          fillOpacity: .2,
          clickable: !0
        },
        showRadius: !0,
        metric: !0
      },
      initialize: function(t, e) {
        this.type = L.Draw.Circle.TYPE, this._initialLabelText = L.drawLocal.draw.handlers.circle.tooltip.start, L.Draw.SimpleShape.prototype.initialize.call(this, t, e);
      },
      _drawShape: function(t) {
        this._shape ? this._shape.setRadius(this._startLatLng.distanceTo(t)) : (this._shape = new L.Circle(this._startLatLng, this._startLatLng.distanceTo(t), this.options.shapeOptions), this._map.addLayer(this._shape));
      },
      _fireCreatedEvent: function() {
        var t = new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);
        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, t);
      },
      _onMouseMove: function(t) {
        var e,
            i = t.latlng,
            o = this.options.showRadius,
            a = this.options.metric;
        this._tooltip.updatePosition(i), this._isDrawing && (this._drawShape(i), e = this._shape.getRadius().toFixed(1), this._tooltip.updateContent({
          text: this._endLabelText,
          subtext: o ? "Radius: " + L.GeometryUtil.readableDistance(e, a) : ""
        }));
      }
    }), L.Draw.Marker = L.Draw.Feature.extend({
      statics: {TYPE: "marker"},
      options: {
        icon: new L.Icon.Default,
        repeatMode: !1,
        zIndexOffset: 2e3
      },
      initialize: function(t, e) {
        this.type = L.Draw.Marker.TYPE, L.Draw.Feature.prototype.initialize.call(this, t, e);
      },
      addHooks: function() {
        L.Draw.Feature.prototype.addHooks.call(this), this._map && (this._tooltip.updateContent({text: L.drawLocal.draw.handlers.marker.tooltip.start}), this._mouseMarker || (this._mouseMarker = L.marker(this._map.getCenter(), {
          icon: L.divIcon({
            className: "leaflet-mouse-marker",
            iconAnchor: [20, 20],
            iconSize: [40, 40]
          }),
          opacity: 0,
          zIndexOffset: this.options.zIndexOffset
        })), this._mouseMarker.on("click", this._onClick, this).addTo(this._map), this._map.on("mousemove", this._onMouseMove, this));
      },
      removeHooks: function() {
        L.Draw.Feature.prototype.removeHooks.call(this), this._map && (this._marker && (this._marker.off("click", this._onClick, this), this._map.off("click", this._onClick, this).removeLayer(this._marker), delete this._marker), this._mouseMarker.off("click", this._onClick, this), this._map.removeLayer(this._mouseMarker), delete this._mouseMarker, this._map.off("mousemove", this._onMouseMove, this));
      },
      _onMouseMove: function(t) {
        var e = t.latlng;
        this._tooltip.updatePosition(e), this._mouseMarker.setLatLng(e), this._marker ? (e = this._mouseMarker.getLatLng(), this._marker.setLatLng(e)) : (this._marker = new L.Marker(e, {
          icon: this.options.icon,
          zIndexOffset: this.options.zIndexOffset
        }), this._marker.on("click", this._onClick, this), this._map.on("click", this._onClick, this).addLayer(this._marker));
      },
      _onClick: function() {
        this._fireCreatedEvent(), this.disable(), this.options.repeatMode && this.enable();
      },
      _fireCreatedEvent: function() {
        var t = new L.Marker(this._marker.getLatLng(), {icon: this.options.icon});
        L.Draw.Feature.prototype._fireCreatedEvent.call(this, t);
      }
    }), L.Edit = L.Edit || {}, L.Edit.Poly = L.Handler.extend({
      options: {icon: new L.DivIcon({
          iconSize: new L.Point(8, 8),
          className: "leaflet-div-icon leaflet-editing-icon"
        })},
      initialize: function(t, e) {
        this._poly = t, L.setOptions(this, e);
      },
      addHooks: function() {
        this._poly._map && (this._markerGroup || this._initMarkers(), this._poly._map.addLayer(this._markerGroup));
      },
      removeHooks: function() {
        this._poly._map && (this._poly._map.removeLayer(this._markerGroup), delete this._markerGroup, delete this._markers);
      },
      updateMarkers: function() {
        this._markerGroup.clearLayers(), this._initMarkers();
      },
      _initMarkers: function() {
        this._markerGroup || (this._markerGroup = new L.LayerGroup), this._markers = [];
        var t,
            e,
            i,
            o,
            a = this._poly._latlngs;
        for (t = 0, i = a.length; i > t; t++)
          o = this._createMarker(a[t], t), o.on("click", this._onMarkerClick, this), this._markers.push(o);
        var s,
            r;
        for (t = 0, e = i - 1; i > t; e = t++)
          (0 !== t || L.Polygon && this._poly instanceof L.Polygon) && (s = this._markers[e], r = this._markers[t], this._createMiddleMarker(s, r), this._updatePrevNext(s, r));
      },
      _createMarker: function(t, e) {
        var i = new L.Marker(t, {
          draggable: !0,
          icon: this.options.icon
        });
        return i._origLatLng = t, i._index = e, i.on("drag", this._onMarkerDrag, this), i.on("dragend", this._fireEdit, this), this._markerGroup.addLayer(i), i;
      },
      _removeMarker: function(t) {
        var e = t._index;
        this._markerGroup.removeLayer(t), this._markers.splice(e, 1), this._poly.spliceLatLngs(e, 1), this._updateIndexes(e, -1), t.off("drag", this._onMarkerDrag, this).off("dragend", this._fireEdit, this).off("click", this._onMarkerClick, this);
      },
      _fireEdit: function() {
        this._poly.edited = !0, this._poly.fire("edit");
      },
      _onMarkerDrag: function(t) {
        var e = t.target;
        L.extend(e._origLatLng, e._latlng), e._middleLeft && e._middleLeft.setLatLng(this._getMiddleLatLng(e._prev, e)), e._middleRight && e._middleRight.setLatLng(this._getMiddleLatLng(e, e._next)), this._poly.redraw();
      },
      _onMarkerClick: function(t) {
        var e = L.Polygon && this._poly instanceof L.Polygon ? 4 : 3,
            i = t.target;
        this._poly._latlngs.length < e || (this._removeMarker(i), this._updatePrevNext(i._prev, i._next), i._middleLeft && this._markerGroup.removeLayer(i._middleLeft), i._middleRight && this._markerGroup.removeLayer(i._middleRight), i._prev && i._next ? this._createMiddleMarker(i._prev, i._next) : i._prev ? i._next || (i._prev._middleRight = null) : i._next._middleLeft = null, this._fireEdit());
      },
      _updateIndexes: function(t, e) {
        this._markerGroup.eachLayer(function(i) {
          i._index > t && (i._index += e);
        });
      },
      _createMiddleMarker: function(t, e) {
        var i,
            o,
            a,
            s = this._getMiddleLatLng(t, e),
            r = this._createMarker(s);
        r.setOpacity(.6), t._middleRight = e._middleLeft = r, o = function() {
          var o = e._index;
          r._index = o, r.off("click", i, this).on("click", this._onMarkerClick, this), s.lat = r.getLatLng().lat, s.lng = r.getLatLng().lng, this._poly.spliceLatLngs(o, 0, s), this._markers.splice(o, 0, r), r.setOpacity(1), this._updateIndexes(o, 1), e._index++, this._updatePrevNext(t, r), this._updatePrevNext(r, e), this._poly.fire("editstart");
        }, a = function() {
          r.off("dragstart", o, this), r.off("dragend", a, this), this._createMiddleMarker(t, r), this._createMiddleMarker(r, e);
        }, i = function() {
          o.call(this), a.call(this), this._fireEdit();
        }, r.on("click", i, this).on("dragstart", o, this).on("dragend", a, this), this._markerGroup.addLayer(r);
      },
      _updatePrevNext: function(t, e) {
        t && (t._next = e), e && (e._prev = t);
      },
      _getMiddleLatLng: function(t, e) {
        var i = this._poly._map,
            o = i.project(t.getLatLng()),
            a = i.project(e.getLatLng());
        return i.unproject(o._add(a)._divideBy(2));
      }
    }), L.Polyline.addInitHook(function() {
      this.editing || (L.Edit.Poly && (this.editing = new L.Edit.Poly(this), this.options.editable && this.editing.enable()), this.on("add", function() {
        this.editing && this.editing.enabled() && this.editing.addHooks();
      }), this.on("remove", function() {
        this.editing && this.editing.enabled() && this.editing.removeHooks();
      }));
    }), L.Edit = L.Edit || {}, L.Edit.SimpleShape = L.Handler.extend({
      options: {
        moveIcon: new L.DivIcon({
          iconSize: new L.Point(8, 8),
          className: "leaflet-div-icon leaflet-editing-icon leaflet-edit-move"
        }),
        resizeIcon: new L.DivIcon({
          iconSize: new L.Point(8, 8),
          className: "leaflet-div-icon leaflet-editing-icon leaflet-edit-resize"
        })
      },
      initialize: function(t, e) {
        this._shape = t, L.Util.setOptions(this, e);
      },
      addHooks: function() {
        this._shape._map && (this._map = this._shape._map, this._markerGroup || this._initMarkers(), this._map.addLayer(this._markerGroup));
      },
      removeHooks: function() {
        if (this._shape._map) {
          this._unbindMarker(this._moveMarker);
          for (var t = 0,
              e = this._resizeMarkers.length; e > t; t++)
            this._unbindMarker(this._resizeMarkers[t]);
          this._resizeMarkers = null, this._map.removeLayer(this._markerGroup), delete this._markerGroup;
        }
        this._map = null;
      },
      updateMarkers: function() {
        this._markerGroup.clearLayers(), this._initMarkers();
      },
      _initMarkers: function() {
        this._markerGroup || (this._markerGroup = new L.LayerGroup), this._createMoveMarker(), this._createResizeMarker();
      },
      _createMoveMarker: function() {},
      _createResizeMarker: function() {},
      _createMarker: function(t, e) {
        var i = new L.Marker(t, {
          draggable: !0,
          icon: e,
          zIndexOffset: 10
        });
        return this._bindMarker(i), this._markerGroup.addLayer(i), i;
      },
      _bindMarker: function(t) {
        t.on("dragstart", this._onMarkerDragStart, this).on("drag", this._onMarkerDrag, this).on("dragend", this._onMarkerDragEnd, this);
      },
      _unbindMarker: function(t) {
        t.off("dragstart", this._onMarkerDragStart, this).off("drag", this._onMarkerDrag, this).off("dragend", this._onMarkerDragEnd, this);
      },
      _onMarkerDragStart: function(t) {
        var e = t.target;
        e.setOpacity(0), this._shape.fire("editstart");
      },
      _fireEdit: function() {
        this._shape.edited = !0, this._shape.fire("edit");
      },
      _onMarkerDrag: function(t) {
        var e = t.target,
            i = e.getLatLng();
        e === this._moveMarker ? this._move(i) : this._resize(i), this._shape.redraw();
      },
      _onMarkerDragEnd: function(t) {
        var e = t.target;
        e.setOpacity(1), this._fireEdit();
      },
      _move: function() {},
      _resize: function() {}
    }), L.Edit = L.Edit || {}, L.Edit.Rectangle = L.Edit.SimpleShape.extend({
      _createMoveMarker: function() {
        var t = this._shape.getBounds(),
            e = t.getCenter();
        this._moveMarker = this._createMarker(e, this.options.moveIcon);
      },
      _createResizeMarker: function() {
        var t = this._getCorners();
        this._resizeMarkers = [];
        for (var e = 0,
            i = t.length; i > e; e++)
          this._resizeMarkers.push(this._createMarker(t[e], this.options.resizeIcon)), this._resizeMarkers[e]._cornerIndex = e;
      },
      _onMarkerDragStart: function(t) {
        L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, t);
        var e = this._getCorners(),
            i = t.target,
            o = i._cornerIndex;
        this._oppositeCorner = e[(o + 2) % 4], this._toggleCornerMarkers(0, o);
      },
      _onMarkerDragEnd: function(t) {
        var e,
            i,
            o = t.target;
        o === this._moveMarker && (e = this._shape.getBounds(), i = e.getCenter(), o.setLatLng(i)), this._toggleCornerMarkers(1), this._repositionCornerMarkers(), L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this, t);
      },
      _move: function(t) {
        for (var e,
            i = this._shape.getLatLngs(),
            o = this._shape.getBounds(),
            a = o.getCenter(),
            s = [],
            r = 0,
            n = i.length; n > r; r++)
          e = [i[r].lat - a.lat, i[r].lng - a.lng], s.push([t.lat + e[0], t.lng + e[1]]);
        this._shape.setLatLngs(s), this._repositionCornerMarkers();
      },
      _resize: function(t) {
        var e;
        this._shape.setBounds(L.latLngBounds(t, this._oppositeCorner)), e = this._shape.getBounds(), this._moveMarker.setLatLng(e.getCenter());
      },
      _getCorners: function() {
        var t = this._shape.getBounds(),
            e = t.getNorthWest(),
            i = t.getNorthEast(),
            o = t.getSouthEast(),
            a = t.getSouthWest();
        return [e, i, o, a];
      },
      _toggleCornerMarkers: function(t) {
        for (var e = 0,
            i = this._resizeMarkers.length; i > e; e++)
          this._resizeMarkers[e].setOpacity(t);
      },
      _repositionCornerMarkers: function() {
        for (var t = this._getCorners(),
            e = 0,
            i = this._resizeMarkers.length; i > e; e++)
          this._resizeMarkers[e].setLatLng(t[e]);
      }
    }), L.Rectangle.addInitHook(function() {
      L.Edit.Rectangle && (this.editing = new L.Edit.Rectangle(this), this.options.editable && this.editing.enable());
    }), L.Edit = L.Edit || {}, L.Edit.Circle = L.Edit.SimpleShape.extend({
      _createMoveMarker: function() {
        var t = this._shape.getLatLng();
        this._moveMarker = this._createMarker(t, this.options.moveIcon);
      },
      _createResizeMarker: function() {
        var t = this._shape.getLatLng(),
            e = this._getResizeMarkerPoint(t);
        this._resizeMarkers = [], this._resizeMarkers.push(this._createMarker(e, this.options.resizeIcon));
      },
      _getResizeMarkerPoint: function(t) {
        var e = this._shape._radius * Math.cos(Math.PI / 4),
            i = this._map.project(t);
        return this._map.unproject([i.x + e, i.y - e]);
      },
      _move: function(t) {
        var e = this._getResizeMarkerPoint(t);
        this._resizeMarkers[0].setLatLng(e), this._shape.setLatLng(t);
      },
      _resize: function(t) {
        var e = this._moveMarker.getLatLng(),
            i = e.distanceTo(t);
        this._shape.setRadius(i);
      }
    }), L.Circle.addInitHook(function() {
      L.Edit.Circle && (this.editing = new L.Edit.Circle(this), this.options.editable && this.editing.enable()), this.on("add", function() {
        this.editing && this.editing.enabled() && this.editing.addHooks();
      }), this.on("remove", function() {
        this.editing && this.editing.enabled() && this.editing.removeHooks();
      });
    }), L.LatLngUtil = {
      cloneLatLngs: function(t) {
        for (var e = [],
            i = 0,
            o = t.length; o > i; i++)
          e.push(this.cloneLatLng(t[i]));
        return e;
      },
      cloneLatLng: function(t) {
        return L.latLng(t.lat, t.lng);
      }
    }, L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
      geodesicArea: function(t) {
        var e,
            i,
            o = t.length,
            a = 0,
            s = L.LatLng.DEG_TO_RAD;
        if (o > 2) {
          for (var r = 0; o > r; r++)
            e = t[r], i = t[(r + 1) % o], a += (i.lng - e.lng) * s * (2 + Math.sin(e.lat * s) + Math.sin(i.lat * s));
          a = 6378137 * a * 6378137 / 2;
        }
        return Math.abs(a);
      },
      readableArea: function(t, e) {
        var i;
        return e ? i = t >= 1e4 ? (1e-4 * t).toFixed(2) + " ha" : t.toFixed(2) + " m&sup2;" : (t *= .836127, i = t >= 3097600 ? (t / 3097600).toFixed(2) + " mi&sup2;" : t >= 4840 ? (t / 4840).toFixed(2) + " acres" : Math.ceil(t) + " yd&sup2;"), i;
      },
      readableDistance: function(t, e) {
        var i;
        return e ? i = t > 1e3 ? (t / 1e3).toFixed(2) + " km" : Math.ceil(t) + " m" : (t *= 1.09361, i = t > 1760 ? (t / 1760).toFixed(2) + " miles" : Math.ceil(t) + " yd"), i;
      }
    }), L.Util.extend(L.LineUtil, {
      segmentsIntersect: function(t, e, i, o) {
        return this._checkCounterclockwise(t, i, o) !== this._checkCounterclockwise(e, i, o) && this._checkCounterclockwise(t, e, i) !== this._checkCounterclockwise(t, e, o);
      },
      _checkCounterclockwise: function(t, e, i) {
        return (i.y - t.y) * (e.x - t.x) > (e.y - t.y) * (i.x - t.x);
      }
    }), L.Polyline.include({
      intersects: function() {
        var t,
            e,
            i,
            o = this._originalPoints,
            a = o ? o.length : 0;
        if (this._tooFewPointsForIntersection())
          return !1;
        for (t = a - 1; t >= 3; t--)
          if (e = o[t - 1], i = o[t], this._lineSegmentsIntersectsRange(e, i, t - 2))
            return !0;
        return !1;
      },
      newLatLngIntersects: function(t, e) {
        return this._map ? this.newPointIntersects(this._map.latLngToLayerPoint(t), e) : !1;
      },
      newPointIntersects: function(t, e) {
        var i = this._originalPoints,
            o = i ? i.length : 0,
            a = i ? i[o - 1] : null,
            s = o - 2;
        return this._tooFewPointsForIntersection(1) ? !1 : this._lineSegmentsIntersectsRange(a, t, s, e ? 1 : 0);
      },
      _tooFewPointsForIntersection: function(t) {
        var e = this._originalPoints,
            i = e ? e.length : 0;
        return i += t || 0, !this._originalPoints || 3 >= i;
      },
      _lineSegmentsIntersectsRange: function(t, e, i, o) {
        var a,
            s,
            r = this._originalPoints;
        o = o || 0;
        for (var n = i; n > o; n--)
          if (a = r[n - 1], s = r[n], L.LineUtil.segmentsIntersect(t, e, a, s))
            return !0;
        return !1;
      }
    }), L.Polygon.include({intersects: function() {
        var t,
            e,
            i,
            o,
            a,
            s = this._originalPoints;
        return this._tooFewPointsForIntersection() ? !1 : (t = L.Polyline.prototype.intersects.call(this)) ? !0 : (e = s.length, i = s[0], o = s[e - 1], a = e - 2, this._lineSegmentsIntersectsRange(o, i, a, 1));
      }}), L.Control.Draw = L.Control.extend({
      options: {
        position: "topleft",
        draw: {},
        edit: !1
      },
      initialize: function(t) {
        if (L.version < "0.7")
          throw new Error("Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/");
        L.Control.prototype.initialize.call(this, t);
        var e,
            i;
        this._toolbars = {}, L.DrawToolbar && this.options.draw && (i = new L.DrawToolbar(this.options.draw), e = L.stamp(i), this._toolbars[e] = i, this._toolbars[e].on("enable", this._toolbarEnabled, this)), L.EditToolbar && this.options.edit && (i = new L.EditToolbar(this.options.edit), e = L.stamp(i), this._toolbars[e] = i, this._toolbars[e].on("enable", this._toolbarEnabled, this));
      },
      onAdd: function(t) {
        var e,
            i = L.DomUtil.create("div", "leaflet-draw"),
            o = !1,
            a = "leaflet-draw-toolbar-top";
        for (var s in this._toolbars)
          this._toolbars.hasOwnProperty(s) && (e = this._toolbars[s].addToolbar(t), e && (o || (L.DomUtil.hasClass(e, a) || L.DomUtil.addClass(e.childNodes[0], a), o = !0), i.appendChild(e)));
        return i;
      },
      onRemove: function() {
        for (var t in this._toolbars)
          this._toolbars.hasOwnProperty(t) && this._toolbars[t].removeToolbar();
      },
      setDrawingOptions: function(t) {
        for (var e in this._toolbars)
          this._toolbars[e] instanceof L.DrawToolbar && this._toolbars[e].setOptions(t);
      },
      _toolbarEnabled: function(t) {
        var e = "" + L.stamp(t.target);
        for (var i in this._toolbars)
          this._toolbars.hasOwnProperty(i) && i !== e && this._toolbars[i].disable();
      }
    }), L.Map.mergeOptions({
      drawControlTooltips: !0,
      drawControl: !1
    }), L.Map.addInitHook(function() {
      this.options.drawControl && (this.drawControl = new L.Control.Draw, this.addControl(this.drawControl));
    }), L.Toolbar = L.Class.extend({
      includes: [L.Mixin.Events],
      initialize: function(t) {
        L.setOptions(this, t), this._modes = {}, this._actionButtons = [], this._activeMode = null;
      },
      enabled: function() {
        return null !== this._activeMode;
      },
      disable: function() {
        this.enabled() && this._activeMode.handler.disable();
      },
      addToolbar: function(t) {
        var e,
            i = L.DomUtil.create("div", "leaflet-draw-section"),
            o = 0,
            a = this._toolbarClass || "",
            s = this.getModeHandlers(t);
        for (this._toolbarContainer = L.DomUtil.create("div", "leaflet-draw-toolbar leaflet-bar"), this._map = t, e = 0; e < s.length; e++)
          s[e].enabled && this._initModeHandler(s[e].handler, this._toolbarContainer, o++, a, s[e].title);
        return o ? (this._lastButtonIndex = --o, this._actionsContainer = L.DomUtil.create("ul", "leaflet-draw-actions"), i.appendChild(this._toolbarContainer), i.appendChild(this._actionsContainer), i) : void 0;
      },
      removeToolbar: function() {
        for (var t in this._modes)
          this._modes.hasOwnProperty(t) && (this._disposeButton(this._modes[t].button, this._modes[t].handler.enable, this._modes[t].handler), this._modes[t].handler.disable(), this._modes[t].handler.off("enabled", this._handlerActivated, this).off("disabled", this._handlerDeactivated, this));
        this._modes = {};
        for (var e = 0,
            i = this._actionButtons.length; i > e; e++)
          this._disposeButton(this._actionButtons[e].button, this._actionButtons[e].callback, this);
        this._actionButtons = [], this._actionsContainer = null;
      },
      _initModeHandler: function(t, e, i, o, a) {
        var s = t.type;
        this._modes[s] = {}, this._modes[s].handler = t, this._modes[s].button = this._createButton({
          title: a,
          className: o + "-" + s,
          container: e,
          callback: this._modes[s].handler.enable,
          context: this._modes[s].handler
        }), this._modes[s].buttonIndex = i, this._modes[s].handler.on("enabled", this._handlerActivated, this).on("disabled", this._handlerDeactivated, this);
      },
      _createButton: function(t) {
        var e = L.DomUtil.create("a", t.className || "", t.container);
        return e.href = "#", t.text && (e.innerHTML = t.text), t.title && (e.title = t.title), L.DomEvent.on(e, "click", L.DomEvent.stopPropagation).on(e, "mousedown", L.DomEvent.stopPropagation).on(e, "dblclick", L.DomEvent.stopPropagation).on(e, "click", L.DomEvent.preventDefault).on(e, "click", t.callback, t.context), e;
      },
      _disposeButton: function(t, e) {
        L.DomEvent.off(t, "click", L.DomEvent.stopPropagation).off(t, "mousedown", L.DomEvent.stopPropagation).off(t, "dblclick", L.DomEvent.stopPropagation).off(t, "click", L.DomEvent.preventDefault).off(t, "click", e);
      },
      _handlerActivated: function(t) {
        this.disable(), this._activeMode = this._modes[t.handler], L.DomUtil.addClass(this._activeMode.button, "leaflet-draw-toolbar-button-enabled"), this._showActionsToolbar(), this.fire("enable");
      },
      _handlerDeactivated: function() {
        this._hideActionsToolbar(), L.DomUtil.removeClass(this._activeMode.button, "leaflet-draw-toolbar-button-enabled"), this._activeMode = null, this.fire("disable");
      },
      _createActions: function(t) {
        var e,
            i,
            o,
            a,
            s = this._actionsContainer,
            r = this.getActions(t),
            n = r.length;
        for (i = 0, o = this._actionButtons.length; o > i; i++)
          this._disposeButton(this._actionButtons[i].button, this._actionButtons[i].callback);
        for (this._actionButtons = []; s.firstChild; )
          s.removeChild(s.firstChild);
        for (var l = 0; n > l; l++)
          "enabled" in r[l] && !r[l].enabled || (e = L.DomUtil.create("li", "", s), a = this._createButton({
            title: r[l].title,
            text: r[l].text,
            container: e,
            callback: r[l].callback,
            context: r[l].context
          }), this._actionButtons.push({
            button: a,
            callback: r[l].callback
          }));
      },
      _showActionsToolbar: function() {
        var t = this._activeMode.buttonIndex,
            e = this._lastButtonIndex,
            i = this._activeMode.button.offsetTop - 1;
        this._createActions(this._activeMode.handler), this._actionsContainer.style.top = i + "px", 0 === t && (L.DomUtil.addClass(this._toolbarContainer, "leaflet-draw-toolbar-notop"), L.DomUtil.addClass(this._actionsContainer, "leaflet-draw-actions-top")), t === e && (L.DomUtil.addClass(this._toolbarContainer, "leaflet-draw-toolbar-nobottom"), L.DomUtil.addClass(this._actionsContainer, "leaflet-draw-actions-bottom")), this._actionsContainer.style.display = "block";
      },
      _hideActionsToolbar: function() {
        this._actionsContainer.style.display = "none", L.DomUtil.removeClass(this._toolbarContainer, "leaflet-draw-toolbar-notop"), L.DomUtil.removeClass(this._toolbarContainer, "leaflet-draw-toolbar-nobottom"), L.DomUtil.removeClass(this._actionsContainer, "leaflet-draw-actions-top"), L.DomUtil.removeClass(this._actionsContainer, "leaflet-draw-actions-bottom");
      }
    }), L.Tooltip = L.Class.extend({
      initialize: function(t) {
        this._map = t, this._popupPane = t._panes.popupPane, this._container = t.options.drawControlTooltips ? L.DomUtil.create("div", "leaflet-draw-tooltip", this._popupPane) : null, this._singleLineLabel = !1;
      },
      dispose: function() {
        this._container && (this._popupPane.removeChild(this._container), this._container = null);
      },
      updateContent: function(t) {
        return this._container ? (t.subtext = t.subtext || "", 0 !== t.subtext.length || this._singleLineLabel ? t.subtext.length > 0 && this._singleLineLabel && (L.DomUtil.removeClass(this._container, "leaflet-draw-tooltip-single"), this._singleLineLabel = !1) : (L.DomUtil.addClass(this._container, "leaflet-draw-tooltip-single"), this._singleLineLabel = !0), this._container.innerHTML = (t.subtext.length > 0 ? '<span class="leaflet-draw-tooltip-subtext">' + t.subtext + "</span><br />" : "") + "<span>" + t.text + "</span>", this) : this;
      },
      updatePosition: function(t) {
        var e = this._map.latLngToLayerPoint(t),
            i = this._container;
        return this._container && (i.style.visibility = "inherit", L.DomUtil.setPosition(i, e)), this;
      },
      showAsError: function() {
        return this._container && L.DomUtil.addClass(this._container, "leaflet-error-draw-tooltip"), this;
      },
      removeError: function() {
        return this._container && L.DomUtil.removeClass(this._container, "leaflet-error-draw-tooltip"), this;
      }
    }), L.DrawToolbar = L.Toolbar.extend({
      options: {
        polyline: {},
        polygon: {},
        rectangle: {},
        circle: {},
        marker: {}
      },
      initialize: function(t) {
        for (var e in this.options)
          this.options.hasOwnProperty(e) && t[e] && (t[e] = L.extend({}, this.options[e], t[e]));
        this._toolbarClass = "leaflet-draw-draw", L.Toolbar.prototype.initialize.call(this, t);
      },
      getModeHandlers: function(t) {
        return [{
          enabled: this.options.polyline,
          handler: new L.Draw.Polyline(t, this.options.polyline),
          title: L.drawLocal.draw.toolbar.buttons.polyline
        }, {
          enabled: this.options.polygon,
          handler: new L.Draw.Polygon(t, this.options.polygon),
          title: L.drawLocal.draw.toolbar.buttons.polygon
        }, {
          enabled: this.options.rectangle,
          handler: new L.Draw.Rectangle(t, this.options.rectangle),
          title: L.drawLocal.draw.toolbar.buttons.rectangle
        }, {
          enabled: this.options.circle,
          handler: new L.Draw.Circle(t, this.options.circle),
          title: L.drawLocal.draw.toolbar.buttons.circle
        }, {
          enabled: this.options.marker,
          handler: new L.Draw.Marker(t, this.options.marker),
          title: L.drawLocal.draw.toolbar.buttons.marker
        }];
      },
      getActions: function(t) {
        return [{
          enabled: t.deleteLastVertex,
          title: L.drawLocal.draw.toolbar.undo.title,
          text: L.drawLocal.draw.toolbar.undo.text,
          callback: t.deleteLastVertex,
          context: t
        }, {
          title: L.drawLocal.draw.toolbar.actions.title,
          text: L.drawLocal.draw.toolbar.actions.text,
          callback: this.disable,
          context: this
        }];
      },
      setOptions: function(t) {
        L.setOptions(this, t);
        for (var e in this._modes)
          this._modes.hasOwnProperty(e) && t.hasOwnProperty(e) && this._modes[e].handler.setOptions(t[e]);
      }
    }), L.EditToolbar = L.Toolbar.extend({
      options: {
        edit: {selectedPathOptions: {
            color: "#fe57a1",
            opacity: .6,
            dashArray: "10, 10",
            fill: !0,
            fillColor: "#fe57a1",
            fillOpacity: .1
          }},
        remove: {},
        featureGroup: null
      },
      initialize: function(t) {
        t.edit && ("undefined" == typeof t.edit.selectedPathOptions && (t.edit.selectedPathOptions = this.options.edit.selectedPathOptions), t.edit = L.extend({}, this.options.edit, t.edit)), t.remove && (t.remove = L.extend({}, this.options.remove, t.remove)), this._toolbarClass = "leaflet-draw-edit", L.Toolbar.prototype.initialize.call(this, t), this._selectedFeatureCount = 0;
      },
      getModeHandlers: function(t) {
        var e = this.options.featureGroup;
        return [{
          enabled: this.options.edit,
          handler: new L.EditToolbar.Edit(t, {
            featureGroup: e,
            selectedPathOptions: this.options.edit.selectedPathOptions
          }),
          title: L.drawLocal.edit.toolbar.buttons.edit
        }, {
          enabled: this.options.remove,
          handler: new L.EditToolbar.Delete(t, {featureGroup: e}),
          title: L.drawLocal.edit.toolbar.buttons.remove
        }];
      },
      getActions: function() {
        return [{
          title: L.drawLocal.edit.toolbar.actions.save.title,
          text: L.drawLocal.edit.toolbar.actions.save.text,
          callback: this._save,
          context: this
        }, {
          title: L.drawLocal.edit.toolbar.actions.cancel.title,
          text: L.drawLocal.edit.toolbar.actions.cancel.text,
          callback: this.disable,
          context: this
        }];
      },
      addToolbar: function(t) {
        var e = L.Toolbar.prototype.addToolbar.call(this, t);
        return this._checkDisabled(), this.options.featureGroup.on("layeradd layerremove", this._checkDisabled, this), e;
      },
      removeToolbar: function() {
        this.options.featureGroup.off("layeradd layerremove", this._checkDisabled, this), L.Toolbar.prototype.removeToolbar.call(this);
      },
      disable: function() {
        this.enabled() && (this._activeMode.handler.revertLayers(), L.Toolbar.prototype.disable.call(this));
      },
      _save: function() {
        this._activeMode.handler.save(), this._activeMode.handler.disable();
      },
      _checkDisabled: function() {
        var t,
            e = this.options.featureGroup,
            i = 0 !== e.getLayers().length;
        this.options.edit && (t = this._modes[L.EditToolbar.Edit.TYPE].button, i ? L.DomUtil.removeClass(t, "leaflet-disabled") : L.DomUtil.addClass(t, "leaflet-disabled"), t.setAttribute("title", i ? L.drawLocal.edit.toolbar.buttons.edit : L.drawLocal.edit.toolbar.buttons.editDisabled)), this.options.remove && (t = this._modes[L.EditToolbar.Delete.TYPE].button, i ? L.DomUtil.removeClass(t, "leaflet-disabled") : L.DomUtil.addClass(t, "leaflet-disabled"), t.setAttribute("title", i ? L.drawLocal.edit.toolbar.buttons.remove : L.drawLocal.edit.toolbar.buttons.removeDisabled));
      }
    }), L.EditToolbar.Edit = L.Handler.extend({
      statics: {TYPE: "edit"},
      includes: L.Mixin.Events,
      initialize: function(t, e) {
        if (L.Handler.prototype.initialize.call(this, t), this._selectedPathOptions = e.selectedPathOptions, this._featureGroup = e.featureGroup, !(this._featureGroup instanceof L.FeatureGroup))
          throw new Error("options.featureGroup must be a L.FeatureGroup");
        this._uneditedLayerProps = {}, this.type = L.EditToolbar.Edit.TYPE;
      },
      enable: function() {
        !this._enabled && this._hasAvailableLayers() && (this.fire("enabled", {handler: this.type}), this._map.fire("draw:editstart", {handler: this.type}), L.Handler.prototype.enable.call(this), this._featureGroup.on("layeradd", this._enableLayerEdit, this).on("layerremove", this._disableLayerEdit, this));
      },
      disable: function() {
        this._enabled && (this._featureGroup.off("layeradd", this._enableLayerEdit, this).off("layerremove", this._disableLayerEdit, this), L.Handler.prototype.disable.call(this), this._map.fire("draw:editstop", {handler: this.type}), this.fire("disabled", {handler: this.type}));
      },
      addHooks: function() {
        var t = this._map;
        t && (t.getContainer().focus(), this._featureGroup.eachLayer(this._enableLayerEdit, this), this._tooltip = new L.Tooltip(this._map), this._tooltip.updateContent({
          text: L.drawLocal.edit.handlers.edit.tooltip.text,
          subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext
        }), this._map.on("mousemove", this._onMouseMove, this));
      },
      removeHooks: function() {
        this._map && (this._featureGroup.eachLayer(this._disableLayerEdit, this), this._uneditedLayerProps = {}, this._tooltip.dispose(), this._tooltip = null, this._map.off("mousemove", this._onMouseMove, this));
      },
      revertLayers: function() {
        this._featureGroup.eachLayer(function(t) {
          this._revertLayer(t);
        }, this);
      },
      save: function() {
        var t = new L.LayerGroup;
        this._featureGroup.eachLayer(function(e) {
          e.edited && (t.addLayer(e), e.edited = !1);
        }), this._map.fire("draw:edited", {layers: t});
      },
      _backupLayer: function(t) {
        var e = L.Util.stamp(t);
        this._uneditedLayerProps[e] || (t instanceof L.Polyline || t instanceof L.Polygon || t instanceof L.Rectangle ? this._uneditedLayerProps[e] = {latlngs: L.LatLngUtil.cloneLatLngs(t.getLatLngs())} : t instanceof L.Circle ? this._uneditedLayerProps[e] = {
          latlng: L.LatLngUtil.cloneLatLng(t.getLatLng()),
          radius: t.getRadius()
        } : t instanceof L.Marker && (this._uneditedLayerProps[e] = {latlng: L.LatLngUtil.cloneLatLng(t.getLatLng())}));
      },
      _revertLayer: function(t) {
        var e = L.Util.stamp(t);
        t.edited = !1, this._uneditedLayerProps.hasOwnProperty(e) && (t instanceof L.Polyline || t instanceof L.Polygon || t instanceof L.Rectangle ? t.setLatLngs(this._uneditedLayerProps[e].latlngs) : t instanceof L.Circle ? (t.setLatLng(this._uneditedLayerProps[e].latlng), t.setRadius(this._uneditedLayerProps[e].radius)) : t instanceof L.Marker && t.setLatLng(this._uneditedLayerProps[e].latlng));
      },
      _toggleMarkerHighlight: function(t) {
        if (t._icon) {
          var e = t._icon;
          e.style.display = "none", L.DomUtil.hasClass(e, "leaflet-edit-marker-selected") ? (L.DomUtil.removeClass(e, "leaflet-edit-marker-selected"), this._offsetMarker(e, -4)) : (L.DomUtil.addClass(e, "leaflet-edit-marker-selected"), this._offsetMarker(e, 4)), e.style.display = "";
        }
      },
      _offsetMarker: function(t, e) {
        var i = parseInt(t.style.marginTop, 10) - e,
            o = parseInt(t.style.marginLeft, 10) - e;
        t.style.marginTop = i + "px", t.style.marginLeft = o + "px";
      },
      _enableLayerEdit: function(t) {
        var e,
            i = t.layer || t.target || t,
            o = i instanceof L.Marker;
        (!o || i._icon) && (this._backupLayer(i), this._selectedPathOptions && (e = L.Util.extend({}, this._selectedPathOptions), o ? this._toggleMarkerHighlight(i) : (i.options.previousOptions = L.Util.extend({dashArray: null}, i.options), i instanceof L.Circle || i instanceof L.Polygon || i instanceof L.Rectangle || (e.fill = !1), i.setStyle(e))), o ? (i.dragging.enable(), i.on("dragend", this._onMarkerDragEnd)) : i.editing.enable());
      },
      _disableLayerEdit: function(t) {
        var e = t.layer || t.target || t;
        e.edited = !1, this._selectedPathOptions && (e instanceof L.Marker ? this._toggleMarkerHighlight(e) : (e.setStyle(e.options.previousOptions), delete e.options.previousOptions)), e instanceof L.Marker ? (e.dragging.disable(), e.off("dragend", this._onMarkerDragEnd, this)) : e.editing.disable();
      },
      _onMarkerDragEnd: function(t) {
        var e = t.target;
        e.edited = !0;
      },
      _onMouseMove: function(t) {
        this._tooltip.updatePosition(t.latlng);
      },
      _hasAvailableLayers: function() {
        return 0 !== this._featureGroup.getLayers().length;
      }
    }), L.EditToolbar.Delete = L.Handler.extend({
      statics: {TYPE: "remove"},
      includes: L.Mixin.Events,
      initialize: function(t, e) {
        if (L.Handler.prototype.initialize.call(this, t), L.Util.setOptions(this, e), this._deletableLayers = this.options.featureGroup, !(this._deletableLayers instanceof L.FeatureGroup))
          throw new Error("options.featureGroup must be a L.FeatureGroup");
        this.type = L.EditToolbar.Delete.TYPE;
      },
      enable: function() {
        !this._enabled && this._hasAvailableLayers() && (this.fire("enabled", {handler: this.type}), this._map.fire("draw:deletestart", {handler: this.type}), L.Handler.prototype.enable.call(this), this._deletableLayers.on("layeradd", this._enableLayerDelete, this).on("layerremove", this._disableLayerDelete, this));
      },
      disable: function() {
        this._enabled && (this._deletableLayers.off("layeradd", this._enableLayerDelete, this).off("layerremove", this._disableLayerDelete, this), L.Handler.prototype.disable.call(this), this._map.fire("draw:deletestop", {handler: this.type}), this.fire("disabled", {handler: this.type}));
      },
      addHooks: function() {
        var t = this._map;
        t && (t.getContainer().focus(), this._deletableLayers.eachLayer(this._enableLayerDelete, this), this._deletedLayers = new L.layerGroup, this._tooltip = new L.Tooltip(this._map), this._tooltip.updateContent({text: L.drawLocal.edit.handlers.remove.tooltip.text}), this._map.on("mousemove", this._onMouseMove, this));
      },
      removeHooks: function() {
        this._map && (this._deletableLayers.eachLayer(this._disableLayerDelete, this), this._deletedLayers = null, this._tooltip.dispose(), this._tooltip = null, this._map.off("mousemove", this._onMouseMove, this));
      },
      revertLayers: function() {
        this._deletedLayers.eachLayer(function(t) {
          this._deletableLayers.addLayer(t);
        }, this);
      },
      save: function() {
        this._map.fire("draw:deleted", {layers: this._deletedLayers});
      },
      _enableLayerDelete: function(t) {
        var e = t.layer || t.target || t;
        e.on("click", this._removeLayer, this);
      },
      _disableLayerDelete: function(t) {
        var e = t.layer || t.target || t;
        e.off("click", this._removeLayer, this), this._deletedLayers.removeLayer(e);
      },
      _removeLayer: function(t) {
        var e = t.layer || t.target || t;
        this._deletableLayers.removeLayer(e), this._deletedLayers.addLayer(e);
      },
      _onMouseMove: function(t) {
        this._tooltip.updatePosition(t.latlng);
      },
      _hasAvailableLayers: function() {
        return 0 !== this._deletableLayers.getLayers().length;
      }
    });
  }(window, document);
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("c", ["b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('b');
  global.define = __define;
  return module.exports;
});

(function() {
var _removeDefine = $__System.get("@@amd-helpers").createDefine();
(function(window, document, undefined) {
  var oldL = window.L,
      L = {};
  L.version = '0.7.7';
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = L;
  } else if (typeof define === 'function' && define.amd) {
    define("d", [], L);
  }
  L.noConflict = function() {
    window.L = oldL;
    return this;
  };
  window.L = L;
  L.Util = {
    extend: function(dest) {
      var sources = Array.prototype.slice.call(arguments, 1),
          i,
          j,
          len,
          src;
      for (j = 0, len = sources.length; j < len; j++) {
        src = sources[j] || {};
        for (i in src) {
          if (src.hasOwnProperty(i)) {
            dest[i] = src[i];
          }
        }
      }
      return dest;
    },
    bind: function(fn, obj) {
      var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
      return function() {
        return fn.apply(obj, args || arguments);
      };
    },
    stamp: (function() {
      var lastId = 0,
          key = '_leaflet_id';
      return function(obj) {
        obj[key] = obj[key] || ++lastId;
        return obj[key];
      };
    }()),
    invokeEach: function(obj, method, context) {
      var i,
          args;
      if (typeof obj === 'object') {
        args = Array.prototype.slice.call(arguments, 3);
        for (i in obj) {
          method.apply(context, [i, obj[i]].concat(args));
        }
        return true;
      }
      return false;
    },
    limitExecByInterval: function(fn, time, context) {
      var lock,
          execOnUnlock;
      return function wrapperFn() {
        var args = arguments;
        if (lock) {
          execOnUnlock = true;
          return;
        }
        lock = true;
        setTimeout(function() {
          lock = false;
          if (execOnUnlock) {
            wrapperFn.apply(context, args);
            execOnUnlock = false;
          }
        }, time);
        fn.apply(context, args);
      };
    },
    falseFn: function() {
      return false;
    },
    formatNum: function(num, digits) {
      var pow = Math.pow(10, digits || 5);
      return Math.round(num * pow) / pow;
    },
    trim: function(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    },
    splitWords: function(str) {
      return L.Util.trim(str).split(/\s+/);
    },
    setOptions: function(obj, options) {
      obj.options = L.extend({}, obj.options, options);
      return obj.options;
    },
    getParamString: function(obj, existingUrl, uppercase) {
      var params = [];
      for (var i in obj) {
        params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
      }
      return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
    },
    template: function(str, data) {
      return str.replace(/\{ *([\w_]+) *\}/g, function(str, key) {
        var value = data[key];
        if (value === undefined) {
          throw new Error('No value provided for variable ' + str);
        } else if (typeof value === 'function') {
          value = value(data);
        }
        return value;
      });
    },
    isArray: Array.isArray || function(obj) {
      return (Object.prototype.toString.call(obj) === '[object Array]');
    },
    emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
  };
  (function() {
    function getPrefixed(name) {
      var i,
          fn,
          prefixes = ['webkit', 'moz', 'o', 'ms'];
      for (i = 0; i < prefixes.length && !fn; i++) {
        fn = window[prefixes[i] + name];
      }
      return fn;
    }
    var lastTime = 0;
    function timeoutDefer(fn) {
      var time = +new Date(),
          timeToCall = Math.max(0, 16 - (time - lastTime));
      lastTime = time + timeToCall;
      return window.setTimeout(fn, timeToCall);
    }
    var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
    var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') || getPrefixed('CancelRequestAnimationFrame') || function(id) {
      window.clearTimeout(id);
    };
    L.Util.requestAnimFrame = function(fn, context, immediate, element) {
      fn = L.bind(fn, context);
      if (immediate && requestFn === timeoutDefer) {
        fn();
      } else {
        return requestFn.call(window, fn, element);
      }
    };
    L.Util.cancelAnimFrame = function(id) {
      if (id) {
        cancelFn.call(window, id);
      }
    };
  }());
  L.extend = L.Util.extend;
  L.bind = L.Util.bind;
  L.stamp = L.Util.stamp;
  L.setOptions = L.Util.setOptions;
  L.Class = function() {};
  L.Class.extend = function(props) {
    var NewClass = function() {
      if (this.initialize) {
        this.initialize.apply(this, arguments);
      }
      if (this._initHooks) {
        this.callInitHooks();
      }
    };
    var F = function() {};
    F.prototype = this.prototype;
    var proto = new F();
    proto.constructor = NewClass;
    NewClass.prototype = proto;
    for (var i in this) {
      if (this.hasOwnProperty(i) && i !== 'prototype') {
        NewClass[i] = this[i];
      }
    }
    if (props.statics) {
      L.extend(NewClass, props.statics);
      delete props.statics;
    }
    if (props.includes) {
      L.Util.extend.apply(null, [proto].concat(props.includes));
      delete props.includes;
    }
    if (props.options && proto.options) {
      props.options = L.extend({}, proto.options, props.options);
    }
    L.extend(proto, props);
    proto._initHooks = [];
    var parent = this;
    NewClass.__super__ = parent.prototype;
    proto.callInitHooks = function() {
      if (this._initHooksCalled) {
        return;
      }
      if (parent.prototype.callInitHooks) {
        parent.prototype.callInitHooks.call(this);
      }
      this._initHooksCalled = true;
      for (var i = 0,
          len = proto._initHooks.length; i < len; i++) {
        proto._initHooks[i].call(this);
      }
    };
    return NewClass;
  };
  L.Class.include = function(props) {
    L.extend(this.prototype, props);
  };
  L.Class.mergeOptions = function(options) {
    L.extend(this.prototype.options, options);
  };
  L.Class.addInitHook = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    var init = typeof fn === 'function' ? fn : function() {
      this[fn].apply(this, args);
    };
    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push(init);
  };
  var eventsKey = '_leaflet_events';
  L.Mixin = {};
  L.Mixin.Events = {
    addEventListener: function(types, fn, context) {
      if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) {
        return this;
      }
      var events = this[eventsKey] = this[eventsKey] || {},
          contextId = context && context !== this && L.stamp(context),
          i,
          len,
          event,
          type,
          indexKey,
          indexLenKey,
          typeIndex;
      types = L.Util.splitWords(types);
      for (i = 0, len = types.length; i < len; i++) {
        event = {
          action: fn,
          context: context || this
        };
        type = types[i];
        if (contextId) {
          indexKey = type + '_idx';
          indexLenKey = indexKey + '_len';
          typeIndex = events[indexKey] = events[indexKey] || {};
          if (!typeIndex[contextId]) {
            typeIndex[contextId] = [];
            events[indexLenKey] = (events[indexLenKey] || 0) + 1;
          }
          typeIndex[contextId].push(event);
        } else {
          events[type] = events[type] || [];
          events[type].push(event);
        }
      }
      return this;
    },
    hasEventListeners: function(type) {
      var events = this[eventsKey];
      return !!events && ((type in events && events[type].length > 0) || (type + '_idx' in events && events[type + '_idx_len'] > 0));
    },
    removeEventListener: function(types, fn, context) {
      if (!this[eventsKey]) {
        return this;
      }
      if (!types) {
        return this.clearAllEventListeners();
      }
      if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) {
        return this;
      }
      var events = this[eventsKey],
          contextId = context && context !== this && L.stamp(context),
          i,
          len,
          type,
          listeners,
          j,
          indexKey,
          indexLenKey,
          typeIndex,
          removed;
      types = L.Util.splitWords(types);
      for (i = 0, len = types.length; i < len; i++) {
        type = types[i];
        indexKey = type + '_idx';
        indexLenKey = indexKey + '_len';
        typeIndex = events[indexKey];
        if (!fn) {
          delete events[type];
          delete events[indexKey];
          delete events[indexLenKey];
        } else {
          listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];
          if (listeners) {
            for (j = listeners.length - 1; j >= 0; j--) {
              if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
                removed = listeners.splice(j, 1);
                removed[0].action = L.Util.falseFn;
              }
            }
            if (context && typeIndex && (listeners.length === 0)) {
              delete typeIndex[contextId];
              events[indexLenKey]--;
            }
          }
        }
      }
      return this;
    },
    clearAllEventListeners: function() {
      delete this[eventsKey];
      return this;
    },
    fireEvent: function(type, data) {
      if (!this.hasEventListeners(type)) {
        return this;
      }
      var event = L.Util.extend({}, data, {
        type: type,
        target: this
      });
      var events = this[eventsKey],
          listeners,
          i,
          len,
          typeIndex,
          contextId;
      if (events[type]) {
        listeners = events[type].slice();
        for (i = 0, len = listeners.length; i < len; i++) {
          listeners[i].action.call(listeners[i].context, event);
        }
      }
      typeIndex = events[type + '_idx'];
      for (contextId in typeIndex) {
        listeners = typeIndex[contextId].slice();
        if (listeners) {
          for (i = 0, len = listeners.length; i < len; i++) {
            listeners[i].action.call(listeners[i].context, event);
          }
        }
      }
      return this;
    },
    addOneTimeEventListener: function(types, fn, context) {
      if (L.Util.invokeEach(types, this.addOneTimeEventListener, this, fn, context)) {
        return this;
      }
      var handler = L.bind(function() {
        this.removeEventListener(types, fn, context).removeEventListener(types, handler, context);
      }, this);
      return this.addEventListener(types, fn, context).addEventListener(types, handler, context);
    }
  };
  L.Mixin.Events.on = L.Mixin.Events.addEventListener;
  L.Mixin.Events.off = L.Mixin.Events.removeEventListener;
  L.Mixin.Events.once = L.Mixin.Events.addOneTimeEventListener;
  L.Mixin.Events.fire = L.Mixin.Events.fireEvent;
  (function() {
    var ie = 'ActiveXObject' in window,
        ielt9 = ie && !document.addEventListener,
        ua = navigator.userAgent.toLowerCase(),
        webkit = ua.indexOf('webkit') !== -1,
        chrome = ua.indexOf('chrome') !== -1,
        phantomjs = ua.indexOf('phantom') !== -1,
        android = ua.indexOf('android') !== -1,
        android23 = ua.search('android [23]') !== -1,
        gecko = ua.indexOf('gecko') !== -1,
        mobile = typeof orientation !== undefined + '',
        msPointer = !window.PointerEvent && window.MSPointerEvent,
        pointer = (window.PointerEvent && window.navigator.pointerEnabled) || msPointer,
        retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1) || ('matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') && window.matchMedia('(min-resolution:144dpi)').matches),
        doc = document.documentElement,
        ie3d = ie && ('transition' in doc.style),
        webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
        gecko3d = 'MozPerspective' in doc.style,
        opera3d = 'OTransition' in doc.style,
        any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs;
    var touch = !window.L_NO_TOUCH && !phantomjs && (pointer || 'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch));
    L.Browser = {
      ie: ie,
      ielt9: ielt9,
      webkit: webkit,
      gecko: gecko && !webkit && !window.opera && !ie,
      android: android,
      android23: android23,
      chrome: chrome,
      ie3d: ie3d,
      webkit3d: webkit3d,
      gecko3d: gecko3d,
      opera3d: opera3d,
      any3d: any3d,
      mobile: mobile,
      mobileWebkit: mobile && webkit,
      mobileWebkit3d: mobile && webkit3d,
      mobileOpera: mobile && window.opera,
      touch: touch,
      msPointer: msPointer,
      pointer: pointer,
      retina: retina
    };
  }());
  L.Point = function(x, y, round) {
    this.x = (round ? Math.round(x) : x);
    this.y = (round ? Math.round(y) : y);
  };
  L.Point.prototype = {
    clone: function() {
      return new L.Point(this.x, this.y);
    },
    add: function(point) {
      return this.clone()._add(L.point(point));
    },
    _add: function(point) {
      this.x += point.x;
      this.y += point.y;
      return this;
    },
    subtract: function(point) {
      return this.clone()._subtract(L.point(point));
    },
    _subtract: function(point) {
      this.x -= point.x;
      this.y -= point.y;
      return this;
    },
    divideBy: function(num) {
      return this.clone()._divideBy(num);
    },
    _divideBy: function(num) {
      this.x /= num;
      this.y /= num;
      return this;
    },
    multiplyBy: function(num) {
      return this.clone()._multiplyBy(num);
    },
    _multiplyBy: function(num) {
      this.x *= num;
      this.y *= num;
      return this;
    },
    round: function() {
      return this.clone()._round();
    },
    _round: function() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    },
    floor: function() {
      return this.clone()._floor();
    },
    _floor: function() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      return this;
    },
    distanceTo: function(point) {
      point = L.point(point);
      var x = point.x - this.x,
          y = point.y - this.y;
      return Math.sqrt(x * x + y * y);
    },
    equals: function(point) {
      point = L.point(point);
      return point.x === this.x && point.y === this.y;
    },
    contains: function(point) {
      point = L.point(point);
      return Math.abs(point.x) <= Math.abs(this.x) && Math.abs(point.y) <= Math.abs(this.y);
    },
    toString: function() {
      return 'Point(' + L.Util.formatNum(this.x) + ', ' + L.Util.formatNum(this.y) + ')';
    }
  };
  L.point = function(x, y, round) {
    if (x instanceof L.Point) {
      return x;
    }
    if (L.Util.isArray(x)) {
      return new L.Point(x[0], x[1]);
    }
    if (x === undefined || x === null) {
      return x;
    }
    return new L.Point(x, y, round);
  };
  L.Bounds = function(a, b) {
    if (!a) {
      return;
    }
    var points = b ? [a, b] : a;
    for (var i = 0,
        len = points.length; i < len; i++) {
      this.extend(points[i]);
    }
  };
  L.Bounds.prototype = {
    extend: function(point) {
      point = L.point(point);
      if (!this.min && !this.max) {
        this.min = point.clone();
        this.max = point.clone();
      } else {
        this.min.x = Math.min(point.x, this.min.x);
        this.max.x = Math.max(point.x, this.max.x);
        this.min.y = Math.min(point.y, this.min.y);
        this.max.y = Math.max(point.y, this.max.y);
      }
      return this;
    },
    getCenter: function(round) {
      return new L.Point((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, round);
    },
    getBottomLeft: function() {
      return new L.Point(this.min.x, this.max.y);
    },
    getTopRight: function() {
      return new L.Point(this.max.x, this.min.y);
    },
    getSize: function() {
      return this.max.subtract(this.min);
    },
    contains: function(obj) {
      var min,
          max;
      if (typeof obj[0] === 'number' || obj instanceof L.Point) {
        obj = L.point(obj);
      } else {
        obj = L.bounds(obj);
      }
      if (obj instanceof L.Bounds) {
        min = obj.min;
        max = obj.max;
      } else {
        min = max = obj;
      }
      return (min.x >= this.min.x) && (max.x <= this.max.x) && (min.y >= this.min.y) && (max.y <= this.max.y);
    },
    intersects: function(bounds) {
      bounds = L.bounds(bounds);
      var min = this.min,
          max = this.max,
          min2 = bounds.min,
          max2 = bounds.max,
          xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
          yIntersects = (max2.y >= min.y) && (min2.y <= max.y);
      return xIntersects && yIntersects;
    },
    isValid: function() {
      return !!(this.min && this.max);
    }
  };
  L.bounds = function(a, b) {
    if (!a || a instanceof L.Bounds) {
      return a;
    }
    return new L.Bounds(a, b);
  };
  L.Transformation = function(a, b, c, d) {
    this._a = a;
    this._b = b;
    this._c = c;
    this._d = d;
  };
  L.Transformation.prototype = {
    transform: function(point, scale) {
      return this._transform(point.clone(), scale);
    },
    _transform: function(point, scale) {
      scale = scale || 1;
      point.x = scale * (this._a * point.x + this._b);
      point.y = scale * (this._c * point.y + this._d);
      return point;
    },
    untransform: function(point, scale) {
      scale = scale || 1;
      return new L.Point((point.x / scale - this._b) / this._a, (point.y / scale - this._d) / this._c);
    }
  };
  L.DomUtil = {
    get: function(id) {
      return (typeof id === 'string' ? document.getElementById(id) : id);
    },
    getStyle: function(el, style) {
      var value = el.style[style];
      if (!value && el.currentStyle) {
        value = el.currentStyle[style];
      }
      if ((!value || value === 'auto') && document.defaultView) {
        var css = document.defaultView.getComputedStyle(el, null);
        value = css ? css[style] : null;
      }
      return value === 'auto' ? null : value;
    },
    getViewportOffset: function(element) {
      var top = 0,
          left = 0,
          el = element,
          docBody = document.body,
          docEl = document.documentElement,
          pos;
      do {
        top += el.offsetTop || 0;
        left += el.offsetLeft || 0;
        top += parseInt(L.DomUtil.getStyle(el, 'borderTopWidth'), 10) || 0;
        left += parseInt(L.DomUtil.getStyle(el, 'borderLeftWidth'), 10) || 0;
        pos = L.DomUtil.getStyle(el, 'position');
        if (el.offsetParent === docBody && pos === 'absolute') {
          break;
        }
        if (pos === 'fixed') {
          top += docBody.scrollTop || docEl.scrollTop || 0;
          left += docBody.scrollLeft || docEl.scrollLeft || 0;
          break;
        }
        if (pos === 'relative' && !el.offsetLeft) {
          var width = L.DomUtil.getStyle(el, 'width'),
              maxWidth = L.DomUtil.getStyle(el, 'max-width'),
              r = el.getBoundingClientRect();
          if (width !== 'none' || maxWidth !== 'none') {
            left += r.left + el.clientLeft;
          }
          top += r.top + (docBody.scrollTop || docEl.scrollTop || 0);
          break;
        }
        el = el.offsetParent;
      } while (el);
      el = element;
      do {
        if (el === docBody) {
          break;
        }
        top -= el.scrollTop || 0;
        left -= el.scrollLeft || 0;
        el = el.parentNode;
      } while (el);
      return new L.Point(left, top);
    },
    documentIsLtr: function() {
      if (!L.DomUtil._docIsLtrCached) {
        L.DomUtil._docIsLtrCached = true;
        L.DomUtil._docIsLtr = L.DomUtil.getStyle(document.body, 'direction') === 'ltr';
      }
      return L.DomUtil._docIsLtr;
    },
    create: function(tagName, className, container) {
      var el = document.createElement(tagName);
      el.className = className;
      if (container) {
        container.appendChild(el);
      }
      return el;
    },
    hasClass: function(el, name) {
      if (el.classList !== undefined) {
        return el.classList.contains(name);
      }
      var className = L.DomUtil._getClass(el);
      return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
    },
    addClass: function(el, name) {
      if (el.classList !== undefined) {
        var classes = L.Util.splitWords(name);
        for (var i = 0,
            len = classes.length; i < len; i++) {
          el.classList.add(classes[i]);
        }
      } else if (!L.DomUtil.hasClass(el, name)) {
        var className = L.DomUtil._getClass(el);
        L.DomUtil._setClass(el, (className ? className + ' ' : '') + name);
      }
    },
    removeClass: function(el, name) {
      if (el.classList !== undefined) {
        el.classList.remove(name);
      } else {
        L.DomUtil._setClass(el, L.Util.trim((' ' + L.DomUtil._getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
      }
    },
    _setClass: function(el, name) {
      if (el.className.baseVal === undefined) {
        el.className = name;
      } else {
        el.className.baseVal = name;
      }
    },
    _getClass: function(el) {
      return el.className.baseVal === undefined ? el.className : el.className.baseVal;
    },
    setOpacity: function(el, value) {
      if ('opacity' in el.style) {
        el.style.opacity = value;
      } else if ('filter' in el.style) {
        var filter = false,
            filterName = 'DXImageTransform.Microsoft.Alpha';
        try {
          filter = el.filters.item(filterName);
        } catch (e) {
          if (value === 1) {
            return;
          }
        }
        value = Math.round(value * 100);
        if (filter) {
          filter.Enabled = (value !== 100);
          filter.Opacity = value;
        } else {
          el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
        }
      }
    },
    testProp: function(props) {
      var style = document.documentElement.style;
      for (var i = 0; i < props.length; i++) {
        if (props[i] in style) {
          return props[i];
        }
      }
      return false;
    },
    getTranslateString: function(point) {
      var is3d = L.Browser.webkit3d,
          open = 'translate' + (is3d ? '3d' : '') + '(',
          close = (is3d ? ',0' : '') + ')';
      return open + point.x + 'px,' + point.y + 'px' + close;
    },
    getScaleString: function(scale, origin) {
      var preTranslateStr = L.DomUtil.getTranslateString(origin.add(origin.multiplyBy(-1 * scale))),
          scaleStr = ' scale(' + scale + ') ';
      return preTranslateStr + scaleStr;
    },
    setPosition: function(el, point, disable3D) {
      el._leaflet_pos = point;
      if (!disable3D && L.Browser.any3d) {
        el.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(point);
      } else {
        el.style.left = point.x + 'px';
        el.style.top = point.y + 'px';
      }
    },
    getPosition: function(el) {
      return el._leaflet_pos;
    }
  };
  L.DomUtil.TRANSFORM = L.DomUtil.testProp(['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);
  L.DomUtil.TRANSITION = L.DomUtil.testProp(['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);
  L.DomUtil.TRANSITION_END = L.DomUtil.TRANSITION === 'webkitTransition' || L.DomUtil.TRANSITION === 'OTransition' ? L.DomUtil.TRANSITION + 'End' : 'transitionend';
  (function() {
    if ('onselectstart' in document) {
      L.extend(L.DomUtil, {
        disableTextSelection: function() {
          L.DomEvent.on(window, 'selectstart', L.DomEvent.preventDefault);
        },
        enableTextSelection: function() {
          L.DomEvent.off(window, 'selectstart', L.DomEvent.preventDefault);
        }
      });
    } else {
      var userSelectProperty = L.DomUtil.testProp(['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);
      L.extend(L.DomUtil, {
        disableTextSelection: function() {
          if (userSelectProperty) {
            var style = document.documentElement.style;
            this._userSelect = style[userSelectProperty];
            style[userSelectProperty] = 'none';
          }
        },
        enableTextSelection: function() {
          if (userSelectProperty) {
            document.documentElement.style[userSelectProperty] = this._userSelect;
            delete this._userSelect;
          }
        }
      });
    }
    L.extend(L.DomUtil, {
      disableImageDrag: function() {
        L.DomEvent.on(window, 'dragstart', L.DomEvent.preventDefault);
      },
      enableImageDrag: function() {
        L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);
      }
    });
  })();
  L.LatLng = function(lat, lng, alt) {
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
    }
    this.lat = lat;
    this.lng = lng;
    if (alt !== undefined) {
      this.alt = parseFloat(alt);
    }
  };
  L.extend(L.LatLng, {
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    MAX_MARGIN: 1.0E-9
  });
  L.LatLng.prototype = {
    equals: function(obj) {
      if (!obj) {
        return false;
      }
      obj = L.latLng(obj);
      var margin = Math.max(Math.abs(this.lat - obj.lat), Math.abs(this.lng - obj.lng));
      return margin <= L.LatLng.MAX_MARGIN;
    },
    toString: function(precision) {
      return 'LatLng(' + L.Util.formatNum(this.lat, precision) + ', ' + L.Util.formatNum(this.lng, precision) + ')';
    },
    distanceTo: function(other) {
      other = L.latLng(other);
      var R = 6378137,
          d2r = L.LatLng.DEG_TO_RAD,
          dLat = (other.lat - this.lat) * d2r,
          dLon = (other.lng - this.lng) * d2r,
          lat1 = this.lat * d2r,
          lat2 = other.lat * d2r,
          sin1 = Math.sin(dLat / 2),
          sin2 = Math.sin(dLon / 2);
      var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },
    wrap: function(a, b) {
      var lng = this.lng;
      a = a || -180;
      b = b || 180;
      lng = (lng + b) % (b - a) + (lng < a || lng === b ? b : a);
      return new L.LatLng(this.lat, lng);
    }
  };
  L.latLng = function(a, b) {
    if (a instanceof L.LatLng) {
      return a;
    }
    if (L.Util.isArray(a)) {
      if (typeof a[0] === 'number' || typeof a[0] === 'string') {
        return new L.LatLng(a[0], a[1], a[2]);
      } else {
        return null;
      }
    }
    if (a === undefined || a === null) {
      return a;
    }
    if (typeof a === 'object' && 'lat' in a) {
      return new L.LatLng(a.lat, 'lng' in a ? a.lng : a.lon);
    }
    if (b === undefined) {
      return null;
    }
    return new L.LatLng(a, b);
  };
  L.LatLngBounds = function(southWest, northEast) {
    if (!southWest) {
      return;
    }
    var latlngs = northEast ? [southWest, northEast] : southWest;
    for (var i = 0,
        len = latlngs.length; i < len; i++) {
      this.extend(latlngs[i]);
    }
  };
  L.LatLngBounds.prototype = {
    extend: function(obj) {
      if (!obj) {
        return this;
      }
      var latLng = L.latLng(obj);
      if (latLng !== null) {
        obj = latLng;
      } else {
        obj = L.latLngBounds(obj);
      }
      if (obj instanceof L.LatLng) {
        if (!this._southWest && !this._northEast) {
          this._southWest = new L.LatLng(obj.lat, obj.lng);
          this._northEast = new L.LatLng(obj.lat, obj.lng);
        } else {
          this._southWest.lat = Math.min(obj.lat, this._southWest.lat);
          this._southWest.lng = Math.min(obj.lng, this._southWest.lng);
          this._northEast.lat = Math.max(obj.lat, this._northEast.lat);
          this._northEast.lng = Math.max(obj.lng, this._northEast.lng);
        }
      } else if (obj instanceof L.LatLngBounds) {
        this.extend(obj._southWest);
        this.extend(obj._northEast);
      }
      return this;
    },
    pad: function(bufferRatio) {
      var sw = this._southWest,
          ne = this._northEast,
          heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
          widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;
      return new L.LatLngBounds(new L.LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer), new L.LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
    },
    getCenter: function() {
      return new L.LatLng((this._southWest.lat + this._northEast.lat) / 2, (this._southWest.lng + this._northEast.lng) / 2);
    },
    getSouthWest: function() {
      return this._southWest;
    },
    getNorthEast: function() {
      return this._northEast;
    },
    getNorthWest: function() {
      return new L.LatLng(this.getNorth(), this.getWest());
    },
    getSouthEast: function() {
      return new L.LatLng(this.getSouth(), this.getEast());
    },
    getWest: function() {
      return this._southWest.lng;
    },
    getSouth: function() {
      return this._southWest.lat;
    },
    getEast: function() {
      return this._northEast.lng;
    },
    getNorth: function() {
      return this._northEast.lat;
    },
    contains: function(obj) {
      if (typeof obj[0] === 'number' || obj instanceof L.LatLng) {
        obj = L.latLng(obj);
      } else {
        obj = L.latLngBounds(obj);
      }
      var sw = this._southWest,
          ne = this._northEast,
          sw2,
          ne2;
      if (obj instanceof L.LatLngBounds) {
        sw2 = obj.getSouthWest();
        ne2 = obj.getNorthEast();
      } else {
        sw2 = ne2 = obj;
      }
      return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) && (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
    },
    intersects: function(bounds) {
      bounds = L.latLngBounds(bounds);
      var sw = this._southWest,
          ne = this._northEast,
          sw2 = bounds.getSouthWest(),
          ne2 = bounds.getNorthEast(),
          latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
          lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);
      return latIntersects && lngIntersects;
    },
    toBBoxString: function() {
      return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
    },
    equals: function(bounds) {
      if (!bounds) {
        return false;
      }
      bounds = L.latLngBounds(bounds);
      return this._southWest.equals(bounds.getSouthWest()) && this._northEast.equals(bounds.getNorthEast());
    },
    isValid: function() {
      return !!(this._southWest && this._northEast);
    }
  };
  L.latLngBounds = function(a, b) {
    if (!a || a instanceof L.LatLngBounds) {
      return a;
    }
    return new L.LatLngBounds(a, b);
  };
  L.Projection = {};
  L.Projection.SphericalMercator = {
    MAX_LATITUDE: 85.0511287798,
    project: function(latlng) {
      var d = L.LatLng.DEG_TO_RAD,
          max = this.MAX_LATITUDE,
          lat = Math.max(Math.min(max, latlng.lat), -max),
          x = latlng.lng * d,
          y = lat * d;
      y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));
      return new L.Point(x, y);
    },
    unproject: function(point) {
      var d = L.LatLng.RAD_TO_DEG,
          lng = point.x * d,
          lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;
      return new L.LatLng(lat, lng);
    }
  };
  L.Projection.LonLat = {
    project: function(latlng) {
      return new L.Point(latlng.lng, latlng.lat);
    },
    unproject: function(point) {
      return new L.LatLng(point.y, point.x);
    }
  };
  L.CRS = {
    latLngToPoint: function(latlng, zoom) {
      var projectedPoint = this.projection.project(latlng),
          scale = this.scale(zoom);
      return this.transformation._transform(projectedPoint, scale);
    },
    pointToLatLng: function(point, zoom) {
      var scale = this.scale(zoom),
          untransformedPoint = this.transformation.untransform(point, scale);
      return this.projection.unproject(untransformedPoint);
    },
    project: function(latlng) {
      return this.projection.project(latlng);
    },
    scale: function(zoom) {
      return 256 * Math.pow(2, zoom);
    },
    getSize: function(zoom) {
      var s = this.scale(zoom);
      return L.point(s, s);
    }
  };
  L.CRS.Simple = L.extend({}, L.CRS, {
    projection: L.Projection.LonLat,
    transformation: new L.Transformation(1, 0, -1, 0),
    scale: function(zoom) {
      return Math.pow(2, zoom);
    }
  });
  L.CRS.EPSG3857 = L.extend({}, L.CRS, {
    code: 'EPSG:3857',
    projection: L.Projection.SphericalMercator,
    transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),
    project: function(latlng) {
      var projectedPoint = this.projection.project(latlng),
          earthRadius = 6378137;
      return projectedPoint.multiplyBy(earthRadius);
    }
  });
  L.CRS.EPSG900913 = L.extend({}, L.CRS.EPSG3857, {code: 'EPSG:900913'});
  L.CRS.EPSG4326 = L.extend({}, L.CRS, {
    code: 'EPSG:4326',
    projection: L.Projection.LonLat,
    transformation: new L.Transformation(1 / 360, 0.5, -1 / 360, 0.5)
  });
  L.Map = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
      crs: L.CRS.EPSG3857,
      fadeAnimation: L.DomUtil.TRANSITION && !L.Browser.android23,
      trackResize: true,
      markerZoomAnimation: L.DomUtil.TRANSITION && L.Browser.any3d
    },
    initialize: function(id, options) {
      options = L.setOptions(this, options);
      this._initContainer(id);
      this._initLayout();
      this._onResize = L.bind(this._onResize, this);
      this._initEvents();
      if (options.maxBounds) {
        this.setMaxBounds(options.maxBounds);
      }
      if (options.center && options.zoom !== undefined) {
        this.setView(L.latLng(options.center), options.zoom, {reset: true});
      }
      this._handlers = [];
      this._layers = {};
      this._zoomBoundLayers = {};
      this._tileLayersNum = 0;
      this.callInitHooks();
      this._addLayers(options.layers);
    },
    setView: function(center, zoom) {
      zoom = zoom === undefined ? this.getZoom() : zoom;
      this._resetView(L.latLng(center), this._limitZoom(zoom));
      return this;
    },
    setZoom: function(zoom, options) {
      if (!this._loaded) {
        this._zoom = this._limitZoom(zoom);
        return this;
      }
      return this.setView(this.getCenter(), zoom, {zoom: options});
    },
    zoomIn: function(delta, options) {
      return this.setZoom(this._zoom + (delta || 1), options);
    },
    zoomOut: function(delta, options) {
      return this.setZoom(this._zoom - (delta || 1), options);
    },
    setZoomAround: function(latlng, zoom, options) {
      var scale = this.getZoomScale(zoom),
          viewHalf = this.getSize().divideBy(2),
          containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng),
          centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
          newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));
      return this.setView(newCenter, zoom, {zoom: options});
    },
    fitBounds: function(bounds, options) {
      options = options || {};
      bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);
      var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
          paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),
          zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));
      zoom = (options.maxZoom) ? Math.min(options.maxZoom, zoom) : zoom;
      var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),
          swPoint = this.project(bounds.getSouthWest(), zoom),
          nePoint = this.project(bounds.getNorthEast(), zoom),
          center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);
      return this.setView(center, zoom, options);
    },
    fitWorld: function(options) {
      return this.fitBounds([[-90, -180], [90, 180]], options);
    },
    panTo: function(center, options) {
      return this.setView(center, this._zoom, {pan: options});
    },
    panBy: function(offset) {
      this.fire('movestart');
      this._rawPanBy(L.point(offset));
      this.fire('move');
      return this.fire('moveend');
    },
    setMaxBounds: function(bounds) {
      bounds = L.latLngBounds(bounds);
      this.options.maxBounds = bounds;
      if (!bounds) {
        return this.off('moveend', this._panInsideMaxBounds, this);
      }
      if (this._loaded) {
        this._panInsideMaxBounds();
      }
      return this.on('moveend', this._panInsideMaxBounds, this);
    },
    panInsideBounds: function(bounds, options) {
      var center = this.getCenter(),
          newCenter = this._limitCenter(center, this._zoom, bounds);
      if (center.equals(newCenter)) {
        return this;
      }
      return this.panTo(newCenter, options);
    },
    addLayer: function(layer) {
      var id = L.stamp(layer);
      if (this._layers[id]) {
        return this;
      }
      this._layers[id] = layer;
      if (layer.options && (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom))) {
        this._zoomBoundLayers[id] = layer;
        this._updateZoomLevels();
      }
      if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
        this._tileLayersNum++;
        this._tileLayersToLoad++;
        layer.on('load', this._onTileLayerLoad, this);
      }
      if (this._loaded) {
        this._layerAdd(layer);
      }
      return this;
    },
    removeLayer: function(layer) {
      var id = L.stamp(layer);
      if (!this._layers[id]) {
        return this;
      }
      if (this._loaded) {
        layer.onRemove(this);
      }
      delete this._layers[id];
      if (this._loaded) {
        this.fire('layerremove', {layer: layer});
      }
      if (this._zoomBoundLayers[id]) {
        delete this._zoomBoundLayers[id];
        this._updateZoomLevels();
      }
      if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
        this._tileLayersNum--;
        this._tileLayersToLoad--;
        layer.off('load', this._onTileLayerLoad, this);
      }
      return this;
    },
    hasLayer: function(layer) {
      if (!layer) {
        return false;
      }
      return (L.stamp(layer) in this._layers);
    },
    eachLayer: function(method, context) {
      for (var i in this._layers) {
        method.call(context, this._layers[i]);
      }
      return this;
    },
    invalidateSize: function(options) {
      if (!this._loaded) {
        return this;
      }
      options = L.extend({
        animate: false,
        pan: true
      }, options === true ? {animate: true} : options);
      var oldSize = this.getSize();
      this._sizeChanged = true;
      this._initialCenter = null;
      var newSize = this.getSize(),
          oldCenter = oldSize.divideBy(2).round(),
          newCenter = newSize.divideBy(2).round(),
          offset = oldCenter.subtract(newCenter);
      if (!offset.x && !offset.y) {
        return this;
      }
      if (options.animate && options.pan) {
        this.panBy(offset);
      } else {
        if (options.pan) {
          this._rawPanBy(offset);
        }
        this.fire('move');
        if (options.debounceMoveend) {
          clearTimeout(this._sizeTimer);
          this._sizeTimer = setTimeout(L.bind(this.fire, this, 'moveend'), 200);
        } else {
          this.fire('moveend');
        }
      }
      return this.fire('resize', {
        oldSize: oldSize,
        newSize: newSize
      });
    },
    addHandler: function(name, HandlerClass) {
      if (!HandlerClass) {
        return this;
      }
      var handler = this[name] = new HandlerClass(this);
      this._handlers.push(handler);
      if (this.options[name]) {
        handler.enable();
      }
      return this;
    },
    remove: function() {
      if (this._loaded) {
        this.fire('unload');
      }
      this._initEvents('off');
      try {
        delete this._container._leaflet;
      } catch (e) {
        this._container._leaflet = undefined;
      }
      this._clearPanes();
      if (this._clearControlPos) {
        this._clearControlPos();
      }
      this._clearHandlers();
      return this;
    },
    getCenter: function() {
      this._checkIfLoaded();
      if (this._initialCenter && !this._moved()) {
        return this._initialCenter;
      }
      return this.layerPointToLatLng(this._getCenterLayerPoint());
    },
    getZoom: function() {
      return this._zoom;
    },
    getBounds: function() {
      var bounds = this.getPixelBounds(),
          sw = this.unproject(bounds.getBottomLeft()),
          ne = this.unproject(bounds.getTopRight());
      return new L.LatLngBounds(sw, ne);
    },
    getMinZoom: function() {
      return this.options.minZoom === undefined ? (this._layersMinZoom === undefined ? 0 : this._layersMinZoom) : this.options.minZoom;
    },
    getMaxZoom: function() {
      return this.options.maxZoom === undefined ? (this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) : this.options.maxZoom;
    },
    getBoundsZoom: function(bounds, inside, padding) {
      bounds = L.latLngBounds(bounds);
      var zoom = this.getMinZoom() - (inside ? 1 : 0),
          maxZoom = this.getMaxZoom(),
          size = this.getSize(),
          nw = bounds.getNorthWest(),
          se = bounds.getSouthEast(),
          zoomNotFound = true,
          boundsSize;
      padding = L.point(padding || [0, 0]);
      do {
        zoom++;
        boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)).add(padding);
        zoomNotFound = !inside ? size.contains(boundsSize) : boundsSize.x < size.x || boundsSize.y < size.y;
      } while (zoomNotFound && zoom <= maxZoom);
      if (zoomNotFound && inside) {
        return null;
      }
      return inside ? zoom : zoom - 1;
    },
    getSize: function() {
      if (!this._size || this._sizeChanged) {
        this._size = new L.Point(this._container.clientWidth, this._container.clientHeight);
        this._sizeChanged = false;
      }
      return this._size.clone();
    },
    getPixelBounds: function() {
      var topLeftPoint = this._getTopLeftPoint();
      return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
    },
    getPixelOrigin: function() {
      this._checkIfLoaded();
      return this._initialTopLeftPoint;
    },
    getPanes: function() {
      return this._panes;
    },
    getContainer: function() {
      return this._container;
    },
    getZoomScale: function(toZoom) {
      var crs = this.options.crs;
      return crs.scale(toZoom) / crs.scale(this._zoom);
    },
    getScaleZoom: function(scale) {
      return this._zoom + (Math.log(scale) / Math.LN2);
    },
    project: function(latlng, zoom) {
      zoom = zoom === undefined ? this._zoom : zoom;
      return this.options.crs.latLngToPoint(L.latLng(latlng), zoom);
    },
    unproject: function(point, zoom) {
      zoom = zoom === undefined ? this._zoom : zoom;
      return this.options.crs.pointToLatLng(L.point(point), zoom);
    },
    layerPointToLatLng: function(point) {
      var projectedPoint = L.point(point).add(this.getPixelOrigin());
      return this.unproject(projectedPoint);
    },
    latLngToLayerPoint: function(latlng) {
      var projectedPoint = this.project(L.latLng(latlng))._round();
      return projectedPoint._subtract(this.getPixelOrigin());
    },
    containerPointToLayerPoint: function(point) {
      return L.point(point).subtract(this._getMapPanePos());
    },
    layerPointToContainerPoint: function(point) {
      return L.point(point).add(this._getMapPanePos());
    },
    containerPointToLatLng: function(point) {
      var layerPoint = this.containerPointToLayerPoint(L.point(point));
      return this.layerPointToLatLng(layerPoint);
    },
    latLngToContainerPoint: function(latlng) {
      return this.layerPointToContainerPoint(this.latLngToLayerPoint(L.latLng(latlng)));
    },
    mouseEventToContainerPoint: function(e) {
      return L.DomEvent.getMousePosition(e, this._container);
    },
    mouseEventToLayerPoint: function(e) {
      return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
    },
    mouseEventToLatLng: function(e) {
      return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
    },
    _initContainer: function(id) {
      var container = this._container = L.DomUtil.get(id);
      if (!container) {
        throw new Error('Map container not found.');
      } else if (container._leaflet) {
        throw new Error('Map container is already initialized.');
      }
      container._leaflet = true;
    },
    _initLayout: function() {
      var container = this._container;
      L.DomUtil.addClass(container, 'leaflet-container' + (L.Browser.touch ? ' leaflet-touch' : '') + (L.Browser.retina ? ' leaflet-retina' : '') + (L.Browser.ielt9 ? ' leaflet-oldie' : '') + (this.options.fadeAnimation ? ' leaflet-fade-anim' : ''));
      var position = L.DomUtil.getStyle(container, 'position');
      if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
        container.style.position = 'relative';
      }
      this._initPanes();
      if (this._initControlPos) {
        this._initControlPos();
      }
    },
    _initPanes: function() {
      var panes = this._panes = {};
      this._mapPane = panes.mapPane = this._createPane('leaflet-map-pane', this._container);
      this._tilePane = panes.tilePane = this._createPane('leaflet-tile-pane', this._mapPane);
      panes.objectsPane = this._createPane('leaflet-objects-pane', this._mapPane);
      panes.shadowPane = this._createPane('leaflet-shadow-pane');
      panes.overlayPane = this._createPane('leaflet-overlay-pane');
      panes.markerPane = this._createPane('leaflet-marker-pane');
      panes.popupPane = this._createPane('leaflet-popup-pane');
      var zoomHide = ' leaflet-zoom-hide';
      if (!this.options.markerZoomAnimation) {
        L.DomUtil.addClass(panes.markerPane, zoomHide);
        L.DomUtil.addClass(panes.shadowPane, zoomHide);
        L.DomUtil.addClass(panes.popupPane, zoomHide);
      }
    },
    _createPane: function(className, container) {
      return L.DomUtil.create('div', className, container || this._panes.objectsPane);
    },
    _clearPanes: function() {
      this._container.removeChild(this._mapPane);
    },
    _addLayers: function(layers) {
      layers = layers ? (L.Util.isArray(layers) ? layers : [layers]) : [];
      for (var i = 0,
          len = layers.length; i < len; i++) {
        this.addLayer(layers[i]);
      }
    },
    _resetView: function(center, zoom, preserveMapOffset, afterZoomAnim) {
      var zoomChanged = (this._zoom !== zoom);
      if (!afterZoomAnim) {
        this.fire('movestart');
        if (zoomChanged) {
          this.fire('zoomstart');
        }
      }
      this._zoom = zoom;
      this._initialCenter = center;
      this._initialTopLeftPoint = this._getNewTopLeftPoint(center);
      if (!preserveMapOffset) {
        L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
      } else {
        this._initialTopLeftPoint._add(this._getMapPanePos());
      }
      this._tileLayersToLoad = this._tileLayersNum;
      var loading = !this._loaded;
      this._loaded = true;
      this.fire('viewreset', {hard: !preserveMapOffset});
      if (loading) {
        this.fire('load');
        this.eachLayer(this._layerAdd, this);
      }
      this.fire('move');
      if (zoomChanged || afterZoomAnim) {
        this.fire('zoomend');
      }
      this.fire('moveend', {hard: !preserveMapOffset});
    },
    _rawPanBy: function(offset) {
      L.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
    },
    _getZoomSpan: function() {
      return this.getMaxZoom() - this.getMinZoom();
    },
    _updateZoomLevels: function() {
      var i,
          minZoom = Infinity,
          maxZoom = -Infinity,
          oldZoomSpan = this._getZoomSpan();
      for (i in this._zoomBoundLayers) {
        var layer = this._zoomBoundLayers[i];
        if (!isNaN(layer.options.minZoom)) {
          minZoom = Math.min(minZoom, layer.options.minZoom);
        }
        if (!isNaN(layer.options.maxZoom)) {
          maxZoom = Math.max(maxZoom, layer.options.maxZoom);
        }
      }
      if (i === undefined) {
        this._layersMaxZoom = this._layersMinZoom = undefined;
      } else {
        this._layersMaxZoom = maxZoom;
        this._layersMinZoom = minZoom;
      }
      if (oldZoomSpan !== this._getZoomSpan()) {
        this.fire('zoomlevelschange');
      }
    },
    _panInsideMaxBounds: function() {
      this.panInsideBounds(this.options.maxBounds);
    },
    _checkIfLoaded: function() {
      if (!this._loaded) {
        throw new Error('Set map center and zoom first.');
      }
    },
    _initEvents: function(onOff) {
      if (!L.DomEvent) {
        return;
      }
      onOff = onOff || 'on';
      L.DomEvent[onOff](this._container, 'click', this._onMouseClick, this);
      var events = ['dblclick', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave', 'mousemove', 'contextmenu'],
          i,
          len;
      for (i = 0, len = events.length; i < len; i++) {
        L.DomEvent[onOff](this._container, events[i], this._fireMouseEvent, this);
      }
      if (this.options.trackResize) {
        L.DomEvent[onOff](window, 'resize', this._onResize, this);
      }
    },
    _onResize: function() {
      L.Util.cancelAnimFrame(this._resizeRequest);
      this._resizeRequest = L.Util.requestAnimFrame(function() {
        this.invalidateSize({debounceMoveend: true});
      }, this, false, this._container);
    },
    _onMouseClick: function(e) {
      if (!this._loaded || (!e._simulated && ((this.dragging && this.dragging.moved()) || (this.boxZoom && this.boxZoom.moved()))) || L.DomEvent._skipped(e)) {
        return;
      }
      this.fire('preclick');
      this._fireMouseEvent(e);
    },
    _fireMouseEvent: function(e) {
      if (!this._loaded || L.DomEvent._skipped(e)) {
        return;
      }
      var type = e.type;
      type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));
      if (!this.hasEventListeners(type)) {
        return;
      }
      if (type === 'contextmenu') {
        L.DomEvent.preventDefault(e);
      }
      var containerPoint = this.mouseEventToContainerPoint(e),
          layerPoint = this.containerPointToLayerPoint(containerPoint),
          latlng = this.layerPointToLatLng(layerPoint);
      this.fire(type, {
        latlng: latlng,
        layerPoint: layerPoint,
        containerPoint: containerPoint,
        originalEvent: e
      });
    },
    _onTileLayerLoad: function() {
      this._tileLayersToLoad--;
      if (this._tileLayersNum && !this._tileLayersToLoad) {
        this.fire('tilelayersload');
      }
    },
    _clearHandlers: function() {
      for (var i = 0,
          len = this._handlers.length; i < len; i++) {
        this._handlers[i].disable();
      }
    },
    whenReady: function(callback, context) {
      if (this._loaded) {
        callback.call(context || this, this);
      } else {
        this.on('load', callback, context);
      }
      return this;
    },
    _layerAdd: function(layer) {
      layer.onAdd(this);
      this.fire('layeradd', {layer: layer});
    },
    _getMapPanePos: function() {
      return L.DomUtil.getPosition(this._mapPane);
    },
    _moved: function() {
      var pos = this._getMapPanePos();
      return pos && !pos.equals([0, 0]);
    },
    _getTopLeftPoint: function() {
      return this.getPixelOrigin().subtract(this._getMapPanePos());
    },
    _getNewTopLeftPoint: function(center, zoom) {
      var viewHalf = this.getSize()._divideBy(2);
      return this.project(center, zoom)._subtract(viewHalf)._round();
    },
    _latLngToNewLayerPoint: function(latlng, newZoom, newCenter) {
      var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
      return this.project(latlng, newZoom)._subtract(topLeft);
    },
    _getCenterLayerPoint: function() {
      return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
    },
    _getCenterOffset: function(latlng) {
      return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
    },
    _limitCenter: function(center, zoom, bounds) {
      if (!bounds) {
        return center;
      }
      var centerPoint = this.project(center, zoom),
          viewHalf = this.getSize().divideBy(2),
          viewBounds = new L.Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
          offset = this._getBoundsOffset(viewBounds, bounds, zoom);
      return this.unproject(centerPoint.add(offset), zoom);
    },
    _limitOffset: function(offset, bounds) {
      if (!bounds) {
        return offset;
      }
      var viewBounds = this.getPixelBounds(),
          newBounds = new L.Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));
      return offset.add(this._getBoundsOffset(newBounds, bounds));
    },
    _getBoundsOffset: function(pxBounds, maxBounds, zoom) {
      var nwOffset = this.project(maxBounds.getNorthWest(), zoom).subtract(pxBounds.min),
          seOffset = this.project(maxBounds.getSouthEast(), zoom).subtract(pxBounds.max),
          dx = this._rebound(nwOffset.x, -seOffset.x),
          dy = this._rebound(nwOffset.y, -seOffset.y);
      return new L.Point(dx, dy);
    },
    _rebound: function(left, right) {
      return left + right > 0 ? Math.round(left - right) / 2 : Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
    },
    _limitZoom: function(zoom) {
      var min = this.getMinZoom(),
          max = this.getMaxZoom();
      return Math.max(min, Math.min(max, zoom));
    }
  });
  L.map = function(id, options) {
    return new L.Map(id, options);
  };
  L.Projection.Mercator = {
    MAX_LATITUDE: 85.0840591556,
    R_MINOR: 6356752.314245179,
    R_MAJOR: 6378137,
    project: function(latlng) {
      var d = L.LatLng.DEG_TO_RAD,
          max = this.MAX_LATITUDE,
          lat = Math.max(Math.min(max, latlng.lat), -max),
          r = this.R_MAJOR,
          r2 = this.R_MINOR,
          x = latlng.lng * d * r,
          y = lat * d,
          tmp = r2 / r,
          eccent = Math.sqrt(1.0 - tmp * tmp),
          con = eccent * Math.sin(y);
      con = Math.pow((1 - con) / (1 + con), eccent * 0.5);
      var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
      y = -r * Math.log(ts);
      return new L.Point(x, y);
    },
    unproject: function(point) {
      var d = L.LatLng.RAD_TO_DEG,
          r = this.R_MAJOR,
          r2 = this.R_MINOR,
          lng = point.x * d / r,
          tmp = r2 / r,
          eccent = Math.sqrt(1 - (tmp * tmp)),
          ts = Math.exp(-point.y / r),
          phi = (Math.PI / 2) - 2 * Math.atan(ts),
          numIter = 15,
          tol = 1e-7,
          i = numIter,
          dphi = 0.1,
          con;
      while ((Math.abs(dphi) > tol) && (--i > 0)) {
        con = eccent * Math.sin(phi);
        dphi = (Math.PI / 2) - 2 * Math.atan(ts * Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
        phi += dphi;
      }
      return new L.LatLng(phi * d, lng);
    }
  };
  L.CRS.EPSG3395 = L.extend({}, L.CRS, {
    code: 'EPSG:3395',
    projection: L.Projection.Mercator,
    transformation: (function() {
      var m = L.Projection.Mercator,
          r = m.R_MAJOR,
          scale = 0.5 / (Math.PI * r);
      return new L.Transformation(scale, 0.5, -scale, 0.5);
    }())
  });
  L.TileLayer = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
      minZoom: 0,
      maxZoom: 18,
      tileSize: 256,
      subdomains: 'abc',
      errorTileUrl: '',
      attribution: '',
      zoomOffset: 0,
      opacity: 1,
      unloadInvisibleTiles: L.Browser.mobile,
      updateWhenIdle: L.Browser.mobile
    },
    initialize: function(url, options) {
      options = L.setOptions(this, options);
      if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {
        options.tileSize = Math.floor(options.tileSize / 2);
        options.zoomOffset++;
        if (options.minZoom > 0) {
          options.minZoom--;
        }
        this.options.maxZoom--;
      }
      if (options.bounds) {
        options.bounds = L.latLngBounds(options.bounds);
      }
      this._url = url;
      var subdomains = this.options.subdomains;
      if (typeof subdomains === 'string') {
        this.options.subdomains = subdomains.split('');
      }
    },
    onAdd: function(map) {
      this._map = map;
      this._animated = map._zoomAnimated;
      this._initContainer();
      map.on({
        'viewreset': this._reset,
        'moveend': this._update
      }, this);
      if (this._animated) {
        map.on({
          'zoomanim': this._animateZoom,
          'zoomend': this._endZoomAnim
        }, this);
      }
      if (!this.options.updateWhenIdle) {
        this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
        map.on('move', this._limitedUpdate, this);
      }
      this._reset();
      this._update();
    },
    addTo: function(map) {
      map.addLayer(this);
      return this;
    },
    onRemove: function(map) {
      this._container.parentNode.removeChild(this._container);
      map.off({
        'viewreset': this._reset,
        'moveend': this._update
      }, this);
      if (this._animated) {
        map.off({
          'zoomanim': this._animateZoom,
          'zoomend': this._endZoomAnim
        }, this);
      }
      if (!this.options.updateWhenIdle) {
        map.off('move', this._limitedUpdate, this);
      }
      this._container = null;
      this._map = null;
    },
    bringToFront: function() {
      var pane = this._map._panes.tilePane;
      if (this._container) {
        pane.appendChild(this._container);
        this._setAutoZIndex(pane, Math.max);
      }
      return this;
    },
    bringToBack: function() {
      var pane = this._map._panes.tilePane;
      if (this._container) {
        pane.insertBefore(this._container, pane.firstChild);
        this._setAutoZIndex(pane, Math.min);
      }
      return this;
    },
    getAttribution: function() {
      return this.options.attribution;
    },
    getContainer: function() {
      return this._container;
    },
    setOpacity: function(opacity) {
      this.options.opacity = opacity;
      if (this._map) {
        this._updateOpacity();
      }
      return this;
    },
    setZIndex: function(zIndex) {
      this.options.zIndex = zIndex;
      this._updateZIndex();
      return this;
    },
    setUrl: function(url, noRedraw) {
      this._url = url;
      if (!noRedraw) {
        this.redraw();
      }
      return this;
    },
    redraw: function() {
      if (this._map) {
        this._reset({hard: true});
        this._update();
      }
      return this;
    },
    _updateZIndex: function() {
      if (this._container && this.options.zIndex !== undefined) {
        this._container.style.zIndex = this.options.zIndex;
      }
    },
    _setAutoZIndex: function(pane, compare) {
      var layers = pane.children,
          edgeZIndex = -compare(Infinity, -Infinity),
          zIndex,
          i,
          len;
      for (i = 0, len = layers.length; i < len; i++) {
        if (layers[i] !== this._container) {
          zIndex = parseInt(layers[i].style.zIndex, 10);
          if (!isNaN(zIndex)) {
            edgeZIndex = compare(edgeZIndex, zIndex);
          }
        }
      }
      this.options.zIndex = this._container.style.zIndex = (isFinite(edgeZIndex) ? edgeZIndex : 0) + compare(1, -1);
    },
    _updateOpacity: function() {
      var i,
          tiles = this._tiles;
      if (L.Browser.ielt9) {
        for (i in tiles) {
          L.DomUtil.setOpacity(tiles[i], this.options.opacity);
        }
      } else {
        L.DomUtil.setOpacity(this._container, this.options.opacity);
      }
    },
    _initContainer: function() {
      var tilePane = this._map._panes.tilePane;
      if (!this._container) {
        this._container = L.DomUtil.create('div', 'leaflet-layer');
        this._updateZIndex();
        if (this._animated) {
          var className = 'leaflet-tile-container';
          this._bgBuffer = L.DomUtil.create('div', className, this._container);
          this._tileContainer = L.DomUtil.create('div', className, this._container);
        } else {
          this._tileContainer = this._container;
        }
        tilePane.appendChild(this._container);
        if (this.options.opacity < 1) {
          this._updateOpacity();
        }
      }
    },
    _reset: function(e) {
      for (var key in this._tiles) {
        this.fire('tileunload', {tile: this._tiles[key]});
      }
      this._tiles = {};
      this._tilesToLoad = 0;
      if (this.options.reuseTiles) {
        this._unusedTiles = [];
      }
      this._tileContainer.innerHTML = '';
      if (this._animated && e && e.hard) {
        this._clearBgBuffer();
      }
      this._initContainer();
    },
    _getTileSize: function() {
      var map = this._map,
          zoom = map.getZoom() + this.options.zoomOffset,
          zoomN = this.options.maxNativeZoom,
          tileSize = this.options.tileSize;
      if (zoomN && zoom > zoomN) {
        tileSize = Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN) * tileSize);
      }
      return tileSize;
    },
    _update: function() {
      if (!this._map) {
        return;
      }
      var map = this._map,
          bounds = map.getPixelBounds(),
          zoom = map.getZoom(),
          tileSize = this._getTileSize();
      if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
        return;
      }
      var tileBounds = L.bounds(bounds.min.divideBy(tileSize)._floor(), bounds.max.divideBy(tileSize)._floor());
      this._addTilesFromCenterOut(tileBounds);
      if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
        this._removeOtherTiles(tileBounds);
      }
    },
    _addTilesFromCenterOut: function(bounds) {
      var queue = [],
          center = bounds.getCenter();
      var j,
          i,
          point;
      for (j = bounds.min.y; j <= bounds.max.y; j++) {
        for (i = bounds.min.x; i <= bounds.max.x; i++) {
          point = new L.Point(i, j);
          if (this._tileShouldBeLoaded(point)) {
            queue.push(point);
          }
        }
      }
      var tilesToLoad = queue.length;
      if (tilesToLoad === 0) {
        return;
      }
      queue.sort(function(a, b) {
        return a.distanceTo(center) - b.distanceTo(center);
      });
      var fragment = document.createDocumentFragment();
      if (!this._tilesToLoad) {
        this.fire('loading');
      }
      this._tilesToLoad += tilesToLoad;
      for (i = 0; i < tilesToLoad; i++) {
        this._addTile(queue[i], fragment);
      }
      this._tileContainer.appendChild(fragment);
    },
    _tileShouldBeLoaded: function(tilePoint) {
      if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
        return false;
      }
      var options = this.options;
      if (!options.continuousWorld) {
        var limit = this._getWrapTileNum();
        if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) || tilePoint.y < 0 || tilePoint.y >= limit.y) {
          return false;
        }
      }
      if (options.bounds) {
        var tileSize = this._getTileSize(),
            nwPoint = tilePoint.multiplyBy(tileSize),
            sePoint = nwPoint.add([tileSize, tileSize]),
            nw = this._map.unproject(nwPoint),
            se = this._map.unproject(sePoint);
        if (!options.continuousWorld && !options.noWrap) {
          nw = nw.wrap();
          se = se.wrap();
        }
        if (!options.bounds.intersects([nw, se])) {
          return false;
        }
      }
      return true;
    },
    _removeOtherTiles: function(bounds) {
      var kArr,
          x,
          y,
          key;
      for (key in this._tiles) {
        kArr = key.split(':');
        x = parseInt(kArr[0], 10);
        y = parseInt(kArr[1], 10);
        if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
          this._removeTile(key);
        }
      }
    },
    _removeTile: function(key) {
      var tile = this._tiles[key];
      this.fire('tileunload', {
        tile: tile,
        url: tile.src
      });
      if (this.options.reuseTiles) {
        L.DomUtil.removeClass(tile, 'leaflet-tile-loaded');
        this._unusedTiles.push(tile);
      } else if (tile.parentNode === this._tileContainer) {
        this._tileContainer.removeChild(tile);
      }
      if (!L.Browser.android) {
        tile.onload = null;
        tile.src = L.Util.emptyImageUrl;
      }
      delete this._tiles[key];
    },
    _addTile: function(tilePoint, container) {
      var tilePos = this._getTilePos(tilePoint);
      var tile = this._getTile();
      L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome);
      this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;
      this._loadTile(tile, tilePoint);
      if (tile.parentNode !== this._tileContainer) {
        container.appendChild(tile);
      }
    },
    _getZoomForUrl: function() {
      var options = this.options,
          zoom = this._map.getZoom();
      if (options.zoomReverse) {
        zoom = options.maxZoom - zoom;
      }
      zoom += options.zoomOffset;
      return options.maxNativeZoom ? Math.min(zoom, options.maxNativeZoom) : zoom;
    },
    _getTilePos: function(tilePoint) {
      var origin = this._map.getPixelOrigin(),
          tileSize = this._getTileSize();
      return tilePoint.multiplyBy(tileSize).subtract(origin);
    },
    getTileUrl: function(tilePoint) {
      return L.Util.template(this._url, L.extend({
        s: this._getSubdomain(tilePoint),
        z: tilePoint.z,
        x: tilePoint.x,
        y: tilePoint.y
      }, this.options));
    },
    _getWrapTileNum: function() {
      var crs = this._map.options.crs,
          size = crs.getSize(this._map.getZoom());
      return size.divideBy(this._getTileSize())._floor();
    },
    _adjustTilePoint: function(tilePoint) {
      var limit = this._getWrapTileNum();
      if (!this.options.continuousWorld && !this.options.noWrap) {
        tilePoint.x = ((tilePoint.x % limit.x) + limit.x) % limit.x;
      }
      if (this.options.tms) {
        tilePoint.y = limit.y - tilePoint.y - 1;
      }
      tilePoint.z = this._getZoomForUrl();
    },
    _getSubdomain: function(tilePoint) {
      var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
      return this.options.subdomains[index];
    },
    _getTile: function() {
      if (this.options.reuseTiles && this._unusedTiles.length > 0) {
        var tile = this._unusedTiles.pop();
        this._resetTile(tile);
        return tile;
      }
      return this._createTile();
    },
    _resetTile: function() {},
    _createTile: function() {
      var tile = L.DomUtil.create('img', 'leaflet-tile');
      tile.style.width = tile.style.height = this._getTileSize() + 'px';
      tile.galleryimg = 'no';
      tile.onselectstart = tile.onmousemove = L.Util.falseFn;
      if (L.Browser.ielt9 && this.options.opacity !== undefined) {
        L.DomUtil.setOpacity(tile, this.options.opacity);
      }
      if (L.Browser.mobileWebkit3d) {
        tile.style.WebkitBackfaceVisibility = 'hidden';
      }
      return tile;
    },
    _loadTile: function(tile, tilePoint) {
      tile._layer = this;
      tile.onload = this._tileOnLoad;
      tile.onerror = this._tileOnError;
      this._adjustTilePoint(tilePoint);
      tile.src = this.getTileUrl(tilePoint);
      this.fire('tileloadstart', {
        tile: tile,
        url: tile.src
      });
    },
    _tileLoaded: function() {
      this._tilesToLoad--;
      if (this._animated) {
        L.DomUtil.addClass(this._tileContainer, 'leaflet-zoom-animated');
      }
      if (!this._tilesToLoad) {
        this.fire('load');
        if (this._animated) {
          clearTimeout(this._clearBgBufferTimer);
          this._clearBgBufferTimer = setTimeout(L.bind(this._clearBgBuffer, this), 500);
        }
      }
    },
    _tileOnLoad: function() {
      var layer = this._layer;
      if (this.src !== L.Util.emptyImageUrl) {
        L.DomUtil.addClass(this, 'leaflet-tile-loaded');
        layer.fire('tileload', {
          tile: this,
          url: this.src
        });
      }
      layer._tileLoaded();
    },
    _tileOnError: function() {
      var layer = this._layer;
      layer.fire('tileerror', {
        tile: this,
        url: this.src
      });
      var newUrl = layer.options.errorTileUrl;
      if (newUrl) {
        this.src = newUrl;
      }
      layer._tileLoaded();
    }
  });
  L.tileLayer = function(url, options) {
    return new L.TileLayer(url, options);
  };
  L.TileLayer.WMS = L.TileLayer.extend({
    defaultWmsParams: {
      service: 'WMS',
      request: 'GetMap',
      version: '1.1.1',
      layers: '',
      styles: '',
      format: 'image/jpeg',
      transparent: false
    },
    initialize: function(url, options) {
      this._url = url;
      var wmsParams = L.extend({}, this.defaultWmsParams),
          tileSize = options.tileSize || this.options.tileSize;
      if (options.detectRetina && L.Browser.retina) {
        wmsParams.width = wmsParams.height = tileSize * 2;
      } else {
        wmsParams.width = wmsParams.height = tileSize;
      }
      for (var i in options) {
        if (!this.options.hasOwnProperty(i) && i !== 'crs') {
          wmsParams[i] = options[i];
        }
      }
      this.wmsParams = wmsParams;
      L.setOptions(this, options);
    },
    onAdd: function(map) {
      this._crs = this.options.crs || map.options.crs;
      this._wmsVersion = parseFloat(this.wmsParams.version);
      var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
      this.wmsParams[projectionKey] = this._crs.code;
      L.TileLayer.prototype.onAdd.call(this, map);
    },
    getTileUrl: function(tilePoint) {
      var map = this._map,
          tileSize = this.options.tileSize,
          nwPoint = tilePoint.multiplyBy(tileSize),
          sePoint = nwPoint.add([tileSize, tileSize]),
          nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)),
          se = this._crs.project(map.unproject(sePoint, tilePoint.z)),
          bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ? [se.y, nw.x, nw.y, se.x].join(',') : [nw.x, se.y, se.x, nw.y].join(','),
          url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});
      return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
    },
    setParams: function(params, noRedraw) {
      L.extend(this.wmsParams, params);
      if (!noRedraw) {
        this.redraw();
      }
      return this;
    }
  });
  L.tileLayer.wms = function(url, options) {
    return new L.TileLayer.WMS(url, options);
  };
  L.TileLayer.Canvas = L.TileLayer.extend({
    options: {async: false},
    initialize: function(options) {
      L.setOptions(this, options);
    },
    redraw: function() {
      if (this._map) {
        this._reset({hard: true});
        this._update();
      }
      for (var i in this._tiles) {
        this._redrawTile(this._tiles[i]);
      }
      return this;
    },
    _redrawTile: function(tile) {
      this.drawTile(tile, tile._tilePoint, this._map._zoom);
    },
    _createTile: function() {
      var tile = L.DomUtil.create('canvas', 'leaflet-tile');
      tile.width = tile.height = this.options.tileSize;
      tile.onselectstart = tile.onmousemove = L.Util.falseFn;
      return tile;
    },
    _loadTile: function(tile, tilePoint) {
      tile._layer = this;
      tile._tilePoint = tilePoint;
      this._redrawTile(tile);
      if (!this.options.async) {
        this.tileDrawn(tile);
      }
    },
    drawTile: function() {},
    tileDrawn: function(tile) {
      this._tileOnLoad.call(tile);
    }
  });
  L.tileLayer.canvas = function(options) {
    return new L.TileLayer.Canvas(options);
  };
  L.ImageOverlay = L.Class.extend({
    includes: L.Mixin.Events,
    options: {opacity: 1},
    initialize: function(url, bounds, options) {
      this._url = url;
      this._bounds = L.latLngBounds(bounds);
      L.setOptions(this, options);
    },
    onAdd: function(map) {
      this._map = map;
      if (!this._image) {
        this._initImage();
      }
      map._panes.overlayPane.appendChild(this._image);
      map.on('viewreset', this._reset, this);
      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
      }
      this._reset();
    },
    onRemove: function(map) {
      map.getPanes().overlayPane.removeChild(this._image);
      map.off('viewreset', this._reset, this);
      if (map.options.zoomAnimation) {
        map.off('zoomanim', this._animateZoom, this);
      }
    },
    addTo: function(map) {
      map.addLayer(this);
      return this;
    },
    setOpacity: function(opacity) {
      this.options.opacity = opacity;
      this._updateOpacity();
      return this;
    },
    bringToFront: function() {
      if (this._image) {
        this._map._panes.overlayPane.appendChild(this._image);
      }
      return this;
    },
    bringToBack: function() {
      var pane = this._map._panes.overlayPane;
      if (this._image) {
        pane.insertBefore(this._image, pane.firstChild);
      }
      return this;
    },
    setUrl: function(url) {
      this._url = url;
      this._image.src = this._url;
    },
    getAttribution: function() {
      return this.options.attribution;
    },
    _initImage: function() {
      this._image = L.DomUtil.create('img', 'leaflet-image-layer');
      if (this._map.options.zoomAnimation && L.Browser.any3d) {
        L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
      } else {
        L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
      }
      this._updateOpacity();
      L.extend(this._image, {
        galleryimg: 'no',
        onselectstart: L.Util.falseFn,
        onmousemove: L.Util.falseFn,
        onload: L.bind(this._onImageLoad, this),
        src: this._url
      });
    },
    _animateZoom: function(e) {
      var map = this._map,
          image = this._image,
          scale = map.getZoomScale(e.zoom),
          nw = this._bounds.getNorthWest(),
          se = this._bounds.getSouthEast(),
          topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center),
          size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft),
          origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));
      image.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';
    },
    _reset: function() {
      var image = this._image,
          topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
          size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);
      L.DomUtil.setPosition(image, topLeft);
      image.style.width = size.x + 'px';
      image.style.height = size.y + 'px';
    },
    _onImageLoad: function() {
      this.fire('load');
    },
    _updateOpacity: function() {
      L.DomUtil.setOpacity(this._image, this.options.opacity);
    }
  });
  L.imageOverlay = function(url, bounds, options) {
    return new L.ImageOverlay(url, bounds, options);
  };
  L.Icon = L.Class.extend({
    options: {className: ''},
    initialize: function(options) {
      L.setOptions(this, options);
    },
    createIcon: function(oldIcon) {
      return this._createIcon('icon', oldIcon);
    },
    createShadow: function(oldIcon) {
      return this._createIcon('shadow', oldIcon);
    },
    _createIcon: function(name, oldIcon) {
      var src = this._getIconUrl(name);
      if (!src) {
        if (name === 'icon') {
          throw new Error('iconUrl not set in Icon options (see the docs).');
        }
        return null;
      }
      var img;
      if (!oldIcon || oldIcon.tagName !== 'IMG') {
        img = this._createImg(src);
      } else {
        img = this._createImg(src, oldIcon);
      }
      this._setIconStyles(img, name);
      return img;
    },
    _setIconStyles: function(img, name) {
      var options = this.options,
          size = L.point(options[name + 'Size']),
          anchor;
      if (name === 'shadow') {
        anchor = L.point(options.shadowAnchor || options.iconAnchor);
      } else {
        anchor = L.point(options.iconAnchor);
      }
      if (!anchor && size) {
        anchor = size.divideBy(2, true);
      }
      img.className = 'leaflet-marker-' + name + ' ' + options.className;
      if (anchor) {
        img.style.marginLeft = (-anchor.x) + 'px';
        img.style.marginTop = (-anchor.y) + 'px';
      }
      if (size) {
        img.style.width = size.x + 'px';
        img.style.height = size.y + 'px';
      }
    },
    _createImg: function(src, el) {
      el = el || document.createElement('img');
      el.src = src;
      return el;
    },
    _getIconUrl: function(name) {
      if (L.Browser.retina && this.options[name + 'RetinaUrl']) {
        return this.options[name + 'RetinaUrl'];
      }
      return this.options[name + 'Url'];
    }
  });
  L.icon = function(options) {
    return new L.Icon(options);
  };
  L.Icon.Default = L.Icon.extend({
    options: {
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    },
    _getIconUrl: function(name) {
      var key = name + 'Url';
      if (this.options[key]) {
        return this.options[key];
      }
      if (L.Browser.retina && name === 'icon') {
        name += '-2x';
      }
      var path = L.Icon.Default.imagePath;
      if (!path) {
        throw new Error('Couldn\'t autodetect L.Icon.Default.imagePath, set it manually.');
      }
      return path + '/marker-' + name + '.png';
    }
  });
  L.Icon.Default.imagePath = (function() {
    var scripts = document.getElementsByTagName('script'),
        leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;
    var i,
        len,
        src,
        matches,
        path;
    for (i = 0, len = scripts.length; i < len; i++) {
      src = scripts[i].src;
      matches = src.match(leafletRe);
      if (matches) {
        path = src.split(leafletRe)[0];
        return (path ? path + '/' : '') + 'images';
      }
    }
  }());
  L.Marker = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
      icon: new L.Icon.Default(),
      title: '',
      alt: '',
      clickable: true,
      draggable: false,
      keyboard: true,
      zIndexOffset: 0,
      opacity: 1,
      riseOnHover: false,
      riseOffset: 250
    },
    initialize: function(latlng, options) {
      L.setOptions(this, options);
      this._latlng = L.latLng(latlng);
    },
    onAdd: function(map) {
      this._map = map;
      map.on('viewreset', this.update, this);
      this._initIcon();
      this.update();
      this.fire('add');
      if (map.options.zoomAnimation && map.options.markerZoomAnimation) {
        map.on('zoomanim', this._animateZoom, this);
      }
    },
    addTo: function(map) {
      map.addLayer(this);
      return this;
    },
    onRemove: function(map) {
      if (this.dragging) {
        this.dragging.disable();
      }
      this._removeIcon();
      this._removeShadow();
      this.fire('remove');
      map.off({
        'viewreset': this.update,
        'zoomanim': this._animateZoom
      }, this);
      this._map = null;
    },
    getLatLng: function() {
      return this._latlng;
    },
    setLatLng: function(latlng) {
      this._latlng = L.latLng(latlng);
      this.update();
      return this.fire('move', {latlng: this._latlng});
    },
    setZIndexOffset: function(offset) {
      this.options.zIndexOffset = offset;
      this.update();
      return this;
    },
    setIcon: function(icon) {
      this.options.icon = icon;
      if (this._map) {
        this._initIcon();
        this.update();
      }
      if (this._popup) {
        this.bindPopup(this._popup);
      }
      return this;
    },
    update: function() {
      if (this._icon) {
        this._setPos(this._map.latLngToLayerPoint(this._latlng).round());
      }
      return this;
    },
    _initIcon: function() {
      var options = this.options,
          map = this._map,
          animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
          classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';
      var icon = options.icon.createIcon(this._icon),
          addIcon = false;
      if (icon !== this._icon) {
        if (this._icon) {
          this._removeIcon();
        }
        addIcon = true;
        if (options.title) {
          icon.title = options.title;
        }
        if (options.alt) {
          icon.alt = options.alt;
        }
      }
      L.DomUtil.addClass(icon, classToAdd);
      if (options.keyboard) {
        icon.tabIndex = '0';
      }
      this._icon = icon;
      this._initInteraction();
      if (options.riseOnHover) {
        L.DomEvent.on(icon, 'mouseover', this._bringToFront, this).on(icon, 'mouseout', this._resetZIndex, this);
      }
      var newShadow = options.icon.createShadow(this._shadow),
          addShadow = false;
      if (newShadow !== this._shadow) {
        this._removeShadow();
        addShadow = true;
      }
      if (newShadow) {
        L.DomUtil.addClass(newShadow, classToAdd);
      }
      this._shadow = newShadow;
      if (options.opacity < 1) {
        this._updateOpacity();
      }
      var panes = this._map._panes;
      if (addIcon) {
        panes.markerPane.appendChild(this._icon);
      }
      if (newShadow && addShadow) {
        panes.shadowPane.appendChild(this._shadow);
      }
    },
    _removeIcon: function() {
      if (this.options.riseOnHover) {
        L.DomEvent.off(this._icon, 'mouseover', this._bringToFront).off(this._icon, 'mouseout', this._resetZIndex);
      }
      this._map._panes.markerPane.removeChild(this._icon);
      this._icon = null;
    },
    _removeShadow: function() {
      if (this._shadow) {
        this._map._panes.shadowPane.removeChild(this._shadow);
      }
      this._shadow = null;
    },
    _setPos: function(pos) {
      L.DomUtil.setPosition(this._icon, pos);
      if (this._shadow) {
        L.DomUtil.setPosition(this._shadow, pos);
      }
      this._zIndex = pos.y + this.options.zIndexOffset;
      this._resetZIndex();
    },
    _updateZIndex: function(offset) {
      this._icon.style.zIndex = this._zIndex + offset;
    },
    _animateZoom: function(opt) {
      var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();
      this._setPos(pos);
    },
    _initInteraction: function() {
      if (!this.options.clickable) {
        return;
      }
      var icon = this._icon,
          events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];
      L.DomUtil.addClass(icon, 'leaflet-clickable');
      L.DomEvent.on(icon, 'click', this._onMouseClick, this);
      L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);
      for (var i = 0; i < events.length; i++) {
        L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
      }
      if (L.Handler.MarkerDrag) {
        this.dragging = new L.Handler.MarkerDrag(this);
        if (this.options.draggable) {
          this.dragging.enable();
        }
      }
    },
    _onMouseClick: function(e) {
      var wasDragged = this.dragging && this.dragging.moved();
      if (this.hasEventListeners(e.type) || wasDragged) {
        L.DomEvent.stopPropagation(e);
      }
      if (wasDragged) {
        return;
      }
      if ((!this.dragging || !this.dragging._enabled) && this._map.dragging && this._map.dragging.moved()) {
        return;
      }
      this.fire(e.type, {
        originalEvent: e,
        latlng: this._latlng
      });
    },
    _onKeyPress: function(e) {
      if (e.keyCode === 13) {
        this.fire('click', {
          originalEvent: e,
          latlng: this._latlng
        });
      }
    },
    _fireMouseEvent: function(e) {
      this.fire(e.type, {
        originalEvent: e,
        latlng: this._latlng
      });
      if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
        L.DomEvent.preventDefault(e);
      }
      if (e.type !== 'mousedown') {
        L.DomEvent.stopPropagation(e);
      } else {
        L.DomEvent.preventDefault(e);
      }
    },
    setOpacity: function(opacity) {
      this.options.opacity = opacity;
      if (this._map) {
        this._updateOpacity();
      }
      return this;
    },
    _updateOpacity: function() {
      L.DomUtil.setOpacity(this._icon, this.options.opacity);
      if (this._shadow) {
        L.DomUtil.setOpacity(this._shadow, this.options.opacity);
      }
    },
    _bringToFront: function() {
      this._updateZIndex(this.options.riseOffset);
    },
    _resetZIndex: function() {
      this._updateZIndex(0);
    }
  });
  L.marker = function(latlng, options) {
    return new L.Marker(latlng, options);
  };
  L.DivIcon = L.Icon.extend({
    options: {
      iconSize: [12, 12],
      className: 'leaflet-div-icon',
      html: false
    },
    createIcon: function(oldIcon) {
      var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
          options = this.options;
      if (options.html !== false) {
        div.innerHTML = options.html;
      } else {
        div.innerHTML = '';
      }
      if (options.bgPos) {
        div.style.backgroundPosition = (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
      }
      this._setIconStyles(div, 'icon');
      return div;
    },
    createShadow: function() {
      return null;
    }
  });
  L.divIcon = function(options) {
    return new L.DivIcon(options);
  };
  L.Map.mergeOptions({closePopupOnClick: true});
  L.Popup = L.Class.extend({
    includes: L.Mixin.Events,
    options: {
      minWidth: 50,
      maxWidth: 300,
      autoPan: true,
      closeButton: true,
      offset: [0, 7],
      autoPanPadding: [5, 5],
      keepInView: false,
      className: '',
      zoomAnimation: true
    },
    initialize: function(options, source) {
      L.setOptions(this, options);
      this._source = source;
      this._animated = L.Browser.any3d && this.options.zoomAnimation;
      this._isOpen = false;
    },
    onAdd: function(map) {
      this._map = map;
      if (!this._container) {
        this._initLayout();
      }
      var animFade = map.options.fadeAnimation;
      if (animFade) {
        L.DomUtil.setOpacity(this._container, 0);
      }
      map._panes.popupPane.appendChild(this._container);
      map.on(this._getEvents(), this);
      this.update();
      if (animFade) {
        L.DomUtil.setOpacity(this._container, 1);
      }
      this.fire('open');
      map.fire('popupopen', {popup: this});
      if (this._source) {
        this._source.fire('popupopen', {popup: this});
      }
    },
    addTo: function(map) {
      map.addLayer(this);
      return this;
    },
    openOn: function(map) {
      map.openPopup(this);
      return this;
    },
    onRemove: function(map) {
      map._panes.popupPane.removeChild(this._container);
      L.Util.falseFn(this._container.offsetWidth);
      map.off(this._getEvents(), this);
      if (map.options.fadeAnimation) {
        L.DomUtil.setOpacity(this._container, 0);
      }
      this._map = null;
      this.fire('close');
      map.fire('popupclose', {popup: this});
      if (this._source) {
        this._source.fire('popupclose', {popup: this});
      }
    },
    getLatLng: function() {
      return this._latlng;
    },
    setLatLng: function(latlng) {
      this._latlng = L.latLng(latlng);
      if (this._map) {
        this._updatePosition();
        this._adjustPan();
      }
      return this;
    },
    getContent: function() {
      return this._content;
    },
    setContent: function(content) {
      this._content = content;
      this.update();
      return this;
    },
    update: function() {
      if (!this._map) {
        return;
      }
      this._container.style.visibility = 'hidden';
      this._updateContent();
      this._updateLayout();
      this._updatePosition();
      this._container.style.visibility = '';
      this._adjustPan();
    },
    _getEvents: function() {
      var events = {viewreset: this._updatePosition};
      if (this._animated) {
        events.zoomanim = this._zoomAnimation;
      }
      if ('closeOnClick' in this.options ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
        events.preclick = this._close;
      }
      if (this.options.keepInView) {
        events.moveend = this._adjustPan;
      }
      return events;
    },
    _close: function() {
      if (this._map) {
        this._map.closePopup(this);
      }
    },
    _initLayout: function() {
      var prefix = 'leaflet-popup',
          containerClass = prefix + ' ' + this.options.className + ' leaflet-zoom-' + (this._animated ? 'animated' : 'hide'),
          container = this._container = L.DomUtil.create('div', containerClass),
          closeButton;
      if (this.options.closeButton) {
        closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
        closeButton.href = '#close';
        closeButton.innerHTML = '&#215;';
        L.DomEvent.disableClickPropagation(closeButton);
        L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
      }
      var wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
      L.DomEvent.disableClickPropagation(wrapper);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
      L.DomEvent.disableScrollPropagation(this._contentNode);
      L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);
      this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
      this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
    },
    _updateContent: function() {
      if (!this._content) {
        return;
      }
      if (typeof this._content === 'string') {
        this._contentNode.innerHTML = this._content;
      } else {
        while (this._contentNode.hasChildNodes()) {
          this._contentNode.removeChild(this._contentNode.firstChild);
        }
        this._contentNode.appendChild(this._content);
      }
      this.fire('contentupdate');
    },
    _updateLayout: function() {
      var container = this._contentNode,
          style = container.style;
      style.width = '';
      style.whiteSpace = 'nowrap';
      var width = container.offsetWidth;
      width = Math.min(width, this.options.maxWidth);
      width = Math.max(width, this.options.minWidth);
      style.width = (width + 1) + 'px';
      style.whiteSpace = '';
      style.height = '';
      var height = container.offsetHeight,
          maxHeight = this.options.maxHeight,
          scrolledClass = 'leaflet-popup-scrolled';
      if (maxHeight && height > maxHeight) {
        style.height = maxHeight + 'px';
        L.DomUtil.addClass(container, scrolledClass);
      } else {
        L.DomUtil.removeClass(container, scrolledClass);
      }
      this._containerWidth = this._container.offsetWidth;
    },
    _updatePosition: function() {
      if (!this._map) {
        return;
      }
      var pos = this._map.latLngToLayerPoint(this._latlng),
          animated = this._animated,
          offset = L.point(this.options.offset);
      if (animated) {
        L.DomUtil.setPosition(this._container, pos);
      }
      this._containerBottom = -offset.y - (animated ? 0 : pos.y);
      this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (animated ? 0 : pos.x);
      this._container.style.bottom = this._containerBottom + 'px';
      this._container.style.left = this._containerLeft + 'px';
    },
    _zoomAnimation: function(opt) {
      var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center);
      L.DomUtil.setPosition(this._container, pos);
    },
    _adjustPan: function() {
      if (!this.options.autoPan) {
        return;
      }
      var map = this._map,
          containerHeight = this._container.offsetHeight,
          containerWidth = this._containerWidth,
          layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);
      if (this._animated) {
        layerPos._add(L.DomUtil.getPosition(this._container));
      }
      var containerPos = map.layerPointToContainerPoint(layerPos),
          padding = L.point(this.options.autoPanPadding),
          paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
          paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
          size = map.getSize(),
          dx = 0,
          dy = 0;
      if (containerPos.x + containerWidth + paddingBR.x > size.x) {
        dx = containerPos.x + containerWidth - size.x + paddingBR.x;
      }
      if (containerPos.x - dx - paddingTL.x < 0) {
        dx = containerPos.x - paddingTL.x;
      }
      if (containerPos.y + containerHeight + paddingBR.y > size.y) {
        dy = containerPos.y + containerHeight - size.y + paddingBR.y;
      }
      if (containerPos.y - dy - paddingTL.y < 0) {
        dy = containerPos.y - paddingTL.y;
      }
      if (dx || dy) {
        map.fire('autopanstart').panBy([dx, dy]);
      }
    },
    _onCloseButtonClick: function(e) {
      this._close();
      L.DomEvent.stop(e);
    }
  });
  L.popup = function(options, source) {
    return new L.Popup(options, source);
  };
  L.Map.include({
    openPopup: function(popup, latlng, options) {
      this.closePopup();
      if (!(popup instanceof L.Popup)) {
        var content = popup;
        popup = new L.Popup(options).setLatLng(latlng).setContent(content);
      }
      popup._isOpen = true;
      this._popup = popup;
      return this.addLayer(popup);
    },
    closePopup: function(popup) {
      if (!popup || popup === this._popup) {
        popup = this._popup;
        this._popup = null;
      }
      if (popup) {
        this.removeLayer(popup);
        popup._isOpen = false;
      }
      return this;
    }
  });
  L.Marker.include({
    openPopup: function() {
      if (this._popup && this._map && !this._map.hasLayer(this._popup)) {
        this._popup.setLatLng(this._latlng);
        this._map.openPopup(this._popup);
      }
      return this;
    },
    closePopup: function() {
      if (this._popup) {
        this._popup._close();
      }
      return this;
    },
    togglePopup: function() {
      if (this._popup) {
        if (this._popup._isOpen) {
          this.closePopup();
        } else {
          this.openPopup();
        }
      }
      return this;
    },
    bindPopup: function(content, options) {
      var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);
      anchor = anchor.add(L.Popup.prototype.options.offset);
      if (options && options.offset) {
        anchor = anchor.add(options.offset);
      }
      options = L.extend({offset: anchor}, options);
      if (!this._popupHandlersAdded) {
        this.on('click', this.togglePopup, this).on('remove', this.closePopup, this).on('move', this._movePopup, this);
        this._popupHandlersAdded = true;
      }
      if (content instanceof L.Popup) {
        L.setOptions(content, options);
        this._popup = content;
        content._source = this;
      } else {
        this._popup = new L.Popup(options, this).setContent(content);
      }
      return this;
    },
    setPopupContent: function(content) {
      if (this._popup) {
        this._popup.setContent(content);
      }
      return this;
    },
    unbindPopup: function() {
      if (this._popup) {
        this._popup = null;
        this.off('click', this.togglePopup, this).off('remove', this.closePopup, this).off('move', this._movePopup, this);
        this._popupHandlersAdded = false;
      }
      return this;
    },
    getPopup: function() {
      return this._popup;
    },
    _movePopup: function(e) {
      this._popup.setLatLng(e.latlng);
    }
  });
  L.LayerGroup = L.Class.extend({
    initialize: function(layers) {
      this._layers = {};
      var i,
          len;
      if (layers) {
        for (i = 0, len = layers.length; i < len; i++) {
          this.addLayer(layers[i]);
        }
      }
    },
    addLayer: function(layer) {
      var id = this.getLayerId(layer);
      this._layers[id] = layer;
      if (this._map) {
        this._map.addLayer(layer);
      }
      return this;
    },
    removeLayer: function(layer) {
      var id = layer in this._layers ? layer : this.getLayerId(layer);
      if (this._map && this._layers[id]) {
        this._map.removeLayer(this._layers[id]);
      }
      delete this._layers[id];
      return this;
    },
    hasLayer: function(layer) {
      if (!layer) {
        return false;
      }
      return (layer in this._layers || this.getLayerId(layer) in this._layers);
    },
    clearLayers: function() {
      this.eachLayer(this.removeLayer, this);
      return this;
    },
    invoke: function(methodName) {
      var args = Array.prototype.slice.call(arguments, 1),
          i,
          layer;
      for (i in this._layers) {
        layer = this._layers[i];
        if (layer[methodName]) {
          layer[methodName].apply(layer, args);
        }
      }
      return this;
    },
    onAdd: function(map) {
      this._map = map;
      this.eachLayer(map.addLayer, map);
    },
    onRemove: function(map) {
      this.eachLayer(map.removeLayer, map);
      this._map = null;
    },
    addTo: function(map) {
      map.addLayer(this);
      return this;
    },
    eachLayer: function(method, context) {
      for (var i in this._layers) {
        method.call(context, this._layers[i]);
      }
      return this;
    },
    getLayer: function(id) {
      return this._layers[id];
    },
    getLayers: function() {
      var layers = [];
      for (var i in this._layers) {
        layers.push(this._layers[i]);
      }
      return layers;
    },
    setZIndex: function(zIndex) {
      return this.invoke('setZIndex', zIndex);
    },
    getLayerId: function(layer) {
      return L.stamp(layer);
    }
  });
  L.layerGroup = function(layers) {
    return new L.LayerGroup(layers);
  };
  L.FeatureGroup = L.LayerGroup.extend({
    includes: L.Mixin.Events,
    statics: {EVENTS: 'click dblclick mouseover mouseout mousemove contextmenu popupopen popupclose'},
    addLayer: function(layer) {
      if (this.hasLayer(layer)) {
        return this;
      }
      if ('on' in layer) {
        layer.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);
      }
      L.LayerGroup.prototype.addLayer.call(this, layer);
      if (this._popupContent && layer.bindPopup) {
        layer.bindPopup(this._popupContent, this._popupOptions);
      }
      return this.fire('layeradd', {layer: layer});
    },
    removeLayer: function(layer) {
      if (!this.hasLayer(layer)) {
        return this;
      }
      if (layer in this._layers) {
        layer = this._layers[layer];
      }
      if ('off' in layer) {
        layer.off(L.FeatureGroup.EVENTS, this._propagateEvent, this);
      }
      L.LayerGroup.prototype.removeLayer.call(this, layer);
      if (this._popupContent) {
        this.invoke('unbindPopup');
      }
      return this.fire('layerremove', {layer: layer});
    },
    bindPopup: function(content, options) {
      this._popupContent = content;
      this._popupOptions = options;
      return this.invoke('bindPopup', content, options);
    },
    openPopup: function(latlng) {
      for (var id in this._layers) {
        this._layers[id].openPopup(latlng);
        break;
      }
      return this;
    },
    setStyle: function(style) {
      return this.invoke('setStyle', style);
    },
    bringToFront: function() {
      return this.invoke('bringToFront');
    },
    bringToBack: function() {
      return this.invoke('bringToBack');
    },
    getBounds: function() {
      var bounds = new L.LatLngBounds();
      this.eachLayer(function(layer) {
        bounds.extend(layer instanceof L.Marker ? layer.getLatLng() : layer.getBounds());
      });
      return bounds;
    },
    _propagateEvent: function(e) {
      e = L.extend({
        layer: e.target,
        target: this
      }, e);
      this.fire(e.type, e);
    }
  });
  L.featureGroup = function(layers) {
    return new L.FeatureGroup(layers);
  };
  L.Path = L.Class.extend({
    includes: [L.Mixin.Events],
    statics: {CLIP_PADDING: (function() {
        var max = L.Browser.mobile ? 1280 : 2000,
            target = (max / Math.max(window.outerWidth, window.outerHeight) - 1) / 2;
        return Math.max(0, Math.min(0.5, target));
      })()},
    options: {
      stroke: true,
      color: '#0033ff',
      dashArray: null,
      lineCap: null,
      lineJoin: null,
      weight: 5,
      opacity: 0.5,
      fill: false,
      fillColor: null,
      fillOpacity: 0.2,
      clickable: true
    },
    initialize: function(options) {
      L.setOptions(this, options);
    },
    onAdd: function(map) {
      this._map = map;
      if (!this._container) {
        this._initElements();
        this._initEvents();
      }
      this.projectLatlngs();
      this._updatePath();
      if (this._container) {
        this._map._pathRoot.appendChild(this._container);
      }
      this.fire('add');
      map.on({
        'viewreset': this.projectLatlngs,
        'moveend': this._updatePath
      }, this);
    },
    addTo: function(map) {
      map.addLayer(this);
      return this;
    },
    onRemove: function(map) {
      map._pathRoot.removeChild(this._container);
      this.fire('remove');
      this._map = null;
      if (L.Browser.vml) {
        this._container = null;
        this._stroke = null;
        this._fill = null;
      }
      map.off({
        'viewreset': this.projectLatlngs,
        'moveend': this._updatePath
      }, this);
    },
    projectLatlngs: function() {},
    setStyle: function(style) {
      L.setOptions(this, style);
      if (this._container) {
        this._updateStyle();
      }
      return this;
    },
    redraw: function() {
      if (this._map) {
        this.projectLatlngs();
        this._updatePath();
      }
      return this;
    }
  });
  L.Map.include({_updatePathViewport: function() {
      var p = L.Path.CLIP_PADDING,
          size = this.getSize(),
          panePos = L.DomUtil.getPosition(this._mapPane),
          min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
          max = min.add(size.multiplyBy(1 + p * 2)._round());
      this._pathViewport = new L.Bounds(min, max);
    }});
  L.Path.SVG_NS = 'http://www.w3.org/2000/svg';
  L.Browser.svg = !!(document.createElementNS && document.createElementNS(L.Path.SVG_NS, 'svg').createSVGRect);
  L.Path = L.Path.extend({
    statics: {SVG: L.Browser.svg},
    bringToFront: function() {
      var root = this._map._pathRoot,
          path = this._container;
      if (path && root.lastChild !== path) {
        root.appendChild(path);
      }
      return this;
    },
    bringToBack: function() {
      var root = this._map._pathRoot,
          path = this._container,
          first = root.firstChild;
      if (path && first !== path) {
        root.insertBefore(path, first);
      }
      return this;
    },
    getPathString: function() {},
    _createElement: function(name) {
      return document.createElementNS(L.Path.SVG_NS, name);
    },
    _initElements: function() {
      this._map._initPathRoot();
      this._initPath();
      this._initStyle();
    },
    _initPath: function() {
      this._container = this._createElement('g');
      this._path = this._createElement('path');
      if (this.options.className) {
        L.DomUtil.addClass(this._path, this.options.className);
      }
      this._container.appendChild(this._path);
    },
    _initStyle: function() {
      if (this.options.stroke) {
        this._path.setAttribute('stroke-linejoin', 'round');
        this._path.setAttribute('stroke-linecap', 'round');
      }
      if (this.options.fill) {
        this._path.setAttribute('fill-rule', 'evenodd');
      }
      if (this.options.pointerEvents) {
        this._path.setAttribute('pointer-events', this.options.pointerEvents);
      }
      if (!this.options.clickable && !this.options.pointerEvents) {
        this._path.setAttribute('pointer-events', 'none');
      }
      this._updateStyle();
    },
    _updateStyle: function() {
      if (this.options.stroke) {
        this._path.setAttribute('stroke', this.options.color);
        this._path.setAttribute('stroke-opacity', this.options.opacity);
        this._path.setAttribute('stroke-width', this.options.weight);
        if (this.options.dashArray) {
          this._path.setAttribute('stroke-dasharray', this.options.dashArray);
        } else {
          this._path.removeAttribute('stroke-dasharray');
        }
        if (this.options.lineCap) {
          this._path.setAttribute('stroke-linecap', this.options.lineCap);
        }
        if (this.options.lineJoin) {
          this._path.setAttribute('stroke-linejoin', this.options.lineJoin);
        }
      } else {
        this._path.setAttribute('stroke', 'none');
      }
      if (this.options.fill) {
        this._path.setAttribute('fill', this.options.fillColor || this.options.color);
        this._path.setAttribute('fill-opacity', this.options.fillOpacity);
      } else {
        this._path.setAttribute('fill', 'none');
      }
    },
    _updatePath: function() {
      var str = this.getPathString();
      if (!str) {
        str = 'M0 0';
      }
      this._path.setAttribute('d', str);
    },
    _initEvents: function() {
      if (this.options.clickable) {
        if (L.Browser.svg || !L.Browser.vml) {
          L.DomUtil.addClass(this._path, 'leaflet-clickable');
        }
        L.DomEvent.on(this._container, 'click', this._onMouseClick, this);
        var events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu'];
        for (var i = 0; i < events.length; i++) {
          L.DomEvent.on(this._container, events[i], this._fireMouseEvent, this);
        }
      }
    },
    _onMouseClick: function(e) {
      if (this._map.dragging && this._map.dragging.moved()) {
        return;
      }
      this._fireMouseEvent(e);
    },
    _fireMouseEvent: function(e) {
      if (!this._map || !this.hasEventListeners(e.type)) {
        return;
      }
      var map = this._map,
          containerPoint = map.mouseEventToContainerPoint(e),
          layerPoint = map.containerPointToLayerPoint(containerPoint),
          latlng = map.layerPointToLatLng(layerPoint);
      this.fire(e.type, {
        latlng: latlng,
        layerPoint: layerPoint,
        containerPoint: containerPoint,
        originalEvent: e
      });
      if (e.type === 'contextmenu') {
        L.DomEvent.preventDefault(e);
      }
      if (e.type !== 'mousemove') {
        L.DomEvent.stopPropagation(e);
      }
    }
  });
  L.Map.include({
    _initPathRoot: function() {
      if (!this._pathRoot) {
        this._pathRoot = L.Path.prototype._createElement('svg');
        this._panes.overlayPane.appendChild(this._pathRoot);
        if (this.options.zoomAnimation && L.Browser.any3d) {
          L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-animated');
          this.on({
            'zoomanim': this._animatePathZoom,
            'zoomend': this._endPathZoom
          });
        } else {
          L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-hide');
        }
        this.on('moveend', this._updateSvgViewport);
        this._updateSvgViewport();
      }
    },
    _animatePathZoom: function(e) {
      var scale = this.getZoomScale(e.zoom),
          offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);
      this._pathRoot.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';
      this._pathZooming = true;
    },
    _endPathZoom: function() {
      this._pathZooming = false;
    },
    _updateSvgViewport: function() {
      if (this._pathZooming) {
        return;
      }
      this._updatePathViewport();
      var vp = this._pathViewport,
          min = vp.min,
          max = vp.max,
          width = max.x - min.x,
          height = max.y - min.y,
          root = this._pathRoot,
          pane = this._panes.overlayPane;
      if (L.Browser.mobileWebkit) {
        pane.removeChild(root);
      }
      L.DomUtil.setPosition(root, min);
      root.setAttribute('width', width);
      root.setAttribute('height', height);
      root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));
      if (L.Browser.mobileWebkit) {
        pane.appendChild(root);
      }
    }
  });
  L.Path.include({
    bindPopup: function(content, options) {
      if (content instanceof L.Popup) {
        this._popup = content;
      } else {
        if (!this._popup || options) {
          this._popup = new L.Popup(options, this);
        }
        this._popup.setContent(content);
      }
      if (!this._popupHandlersAdded) {
        this.on('click', this._openPopup, this).on('remove', this.closePopup, this);
        this._popupHandlersAdded = true;
      }
      return this;
    },
    unbindPopup: function() {
      if (this._popup) {
        this._popup = null;
        this.off('click', this._openPopup).off('remove', this.closePopup);
        this._popupHandlersAdded = false;
      }
      return this;
    },
    openPopup: function(latlng) {
      if (this._popup) {
        latlng = latlng || this._latlng || this._latlngs[Math.floor(this._latlngs.length / 2)];
        this._openPopup({latlng: latlng});
      }
      return this;
    },
    closePopup: function() {
      if (this._popup) {
        this._popup._close();
      }
      return this;
    },
    _openPopup: function(e) {
      this._popup.setLatLng(e.latlng);
      this._map.openPopup(this._popup);
    }
  });
  L.Browser.vml = !L.Browser.svg && (function() {
    try {
      var div = document.createElement('div');
      div.innerHTML = '<v:shape adj="1"/>';
      var shape = div.firstChild;
      shape.style.behavior = 'url(#default#VML)';
      return shape && (typeof shape.adj === 'object');
    } catch (e) {
      return false;
    }
  }());
  L.Path = L.Browser.svg || !L.Browser.vml ? L.Path : L.Path.extend({
    statics: {
      VML: true,
      CLIP_PADDING: 0.02
    },
    _createElement: (function() {
      try {
        document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
        return function(name) {
          return document.createElement('<lvml:' + name + ' class="lvml">');
        };
      } catch (e) {
        return function(name) {
          return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
        };
      }
    }()),
    _initPath: function() {
      var container = this._container = this._createElement('shape');
      L.DomUtil.addClass(container, 'leaflet-vml-shape' + (this.options.className ? ' ' + this.options.className : ''));
      if (this.options.clickable) {
        L.DomUtil.addClass(container, 'leaflet-clickable');
      }
      container.coordsize = '1 1';
      this._path = this._createElement('path');
      container.appendChild(this._path);
      this._map._pathRoot.appendChild(container);
    },
    _initStyle: function() {
      this._updateStyle();
    },
    _updateStyle: function() {
      var stroke = this._stroke,
          fill = this._fill,
          options = this.options,
          container = this._container;
      container.stroked = options.stroke;
      container.filled = options.fill;
      if (options.stroke) {
        if (!stroke) {
          stroke = this._stroke = this._createElement('stroke');
          stroke.endcap = 'round';
          container.appendChild(stroke);
        }
        stroke.weight = options.weight + 'px';
        stroke.color = options.color;
        stroke.opacity = options.opacity;
        if (options.dashArray) {
          stroke.dashStyle = L.Util.isArray(options.dashArray) ? options.dashArray.join(' ') : options.dashArray.replace(/( *, *)/g, ' ');
        } else {
          stroke.dashStyle = '';
        }
        if (options.lineCap) {
          stroke.endcap = options.lineCap.replace('butt', 'flat');
        }
        if (options.lineJoin) {
          stroke.joinstyle = options.lineJoin;
        }
      } else if (stroke) {
        container.removeChild(stroke);
        this._stroke = null;
      }
      if (options.fill) {
        if (!fill) {
          fill = this._fill = this._createElement('fill');
          container.appendChild(fill);
        }
        fill.color = options.fillColor || options.color;
        fill.opacity = options.fillOpacity;
      } else if (fill) {
        container.removeChild(fill);
        this._fill = null;
      }
    },
    _updatePath: function() {
      var style = this._container.style;
      style.display = 'none';
      this._path.v = this.getPathString() + ' ';
      style.display = '';
    }
  });
  L.Map.include(L.Browser.svg || !L.Browser.vml ? {} : {_initPathRoot: function() {
      if (this._pathRoot) {
        return;
      }
      var root = this._pathRoot = document.createElement('div');
      root.className = 'leaflet-vml-container';
      this._panes.overlayPane.appendChild(root);
      this.on('moveend', this._updatePathViewport);
      this._updatePathViewport();
    }});
  L.Browser.canvas = (function() {
    return !!document.createElement('canvas').getContext;
  }());
  L.Path = (L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? L.Path : L.Path.extend({
    statics: {
      CANVAS: true,
      SVG: false
    },
    redraw: function() {
      if (this._map) {
        this.projectLatlngs();
        this._requestUpdate();
      }
      return this;
    },
    setStyle: function(style) {
      L.setOptions(this, style);
      if (this._map) {
        this._updateStyle();
        this._requestUpdate();
      }
      return this;
    },
    onRemove: function(map) {
      map.off('viewreset', this.projectLatlngs, this).off('moveend', this._updatePath, this);
      if (this.options.clickable) {
        this._map.off('click', this._onClick, this);
        this._map.off('mousemove', this._onMouseMove, this);
      }
      this._requestUpdate();
      this.fire('remove');
      this._map = null;
    },
    _requestUpdate: function() {
      if (this._map && !L.Path._updateRequest) {
        L.Path._updateRequest = L.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
      }
    },
    _fireMapMoveEnd: function() {
      L.Path._updateRequest = null;
      this.fire('moveend');
    },
    _initElements: function() {
      this._map._initPathRoot();
      this._ctx = this._map._canvasCtx;
    },
    _updateStyle: function() {
      var options = this.options;
      if (options.stroke) {
        this._ctx.lineWidth = options.weight;
        this._ctx.strokeStyle = options.color;
      }
      if (options.fill) {
        this._ctx.fillStyle = options.fillColor || options.color;
      }
      if (options.lineCap) {
        this._ctx.lineCap = options.lineCap;
      }
      if (options.lineJoin) {
        this._ctx.lineJoin = options.lineJoin;
      }
    },
    _drawPath: function() {
      var i,
          j,
          len,
          len2,
          point,
          drawMethod;
      this._ctx.beginPath();
      for (i = 0, len = this._parts.length; i < len; i++) {
        for (j = 0, len2 = this._parts[i].length; j < len2; j++) {
          point = this._parts[i][j];
          drawMethod = (j === 0 ? 'move' : 'line') + 'To';
          this._ctx[drawMethod](point.x, point.y);
        }
        if (this instanceof L.Polygon) {
          this._ctx.closePath();
        }
      }
    },
    _checkIfEmpty: function() {
      return !this._parts.length;
    },
    _updatePath: function() {
      if (this._checkIfEmpty()) {
        return;
      }
      var ctx = this._ctx,
          options = this.options;
      this._drawPath();
      ctx.save();
      this._updateStyle();
      if (options.fill) {
        ctx.globalAlpha = options.fillOpacity;
        ctx.fill(options.fillRule || 'evenodd');
      }
      if (options.stroke) {
        ctx.globalAlpha = options.opacity;
        ctx.stroke();
      }
      ctx.restore();
    },
    _initEvents: function() {
      if (this.options.clickable) {
        this._map.on('mousemove', this._onMouseMove, this);
        this._map.on('click dblclick contextmenu', this._fireMouseEvent, this);
      }
    },
    _fireMouseEvent: function(e) {
      if (this._containsPoint(e.layerPoint)) {
        this.fire(e.type, e);
      }
    },
    _onMouseMove: function(e) {
      if (!this._map || this._map._animatingZoom) {
        return;
      }
      if (this._containsPoint(e.layerPoint)) {
        this._ctx.canvas.style.cursor = 'pointer';
        this._mouseInside = true;
        this.fire('mouseover', e);
      } else if (this._mouseInside) {
        this._ctx.canvas.style.cursor = '';
        this._mouseInside = false;
        this.fire('mouseout', e);
      }
    }
  });
  L.Map.include((L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? {} : {
    _initPathRoot: function() {
      var root = this._pathRoot,
          ctx;
      if (!root) {
        root = this._pathRoot = document.createElement('canvas');
        root.style.position = 'absolute';
        ctx = this._canvasCtx = root.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        this._panes.overlayPane.appendChild(root);
        if (this.options.zoomAnimation) {
          this._pathRoot.className = 'leaflet-zoom-animated';
          this.on('zoomanim', this._animatePathZoom);
          this.on('zoomend', this._endPathZoom);
        }
        this.on('moveend', this._updateCanvasViewport);
        this._updateCanvasViewport();
      }
    },
    _updateCanvasViewport: function() {
      if (this._pathZooming) {
        return;
      }
      this._updatePathViewport();
      var vp = this._pathViewport,
          min = vp.min,
          size = vp.max.subtract(min),
          root = this._pathRoot;
      L.DomUtil.setPosition(root, min);
      root.width = size.x;
      root.height = size.y;
      root.getContext('2d').translate(-min.x, -min.y);
    }
  });
  L.LineUtil = {
    simplify: function(points, tolerance) {
      if (!tolerance || !points.length) {
        return points.slice();
      }
      var sqTolerance = tolerance * tolerance;
      points = this._reducePoints(points, sqTolerance);
      points = this._simplifyDP(points, sqTolerance);
      return points;
    },
    pointToSegmentDistance: function(p, p1, p2) {
      return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
    },
    closestPointOnSegment: function(p, p1, p2) {
      return this._sqClosestPointOnSegment(p, p1, p2);
    },
    _simplifyDP: function(points, sqTolerance) {
      var len = points.length,
          ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
          markers = new ArrayConstructor(len);
      markers[0] = markers[len - 1] = 1;
      this._simplifyDPStep(points, markers, sqTolerance, 0, len - 1);
      var i,
          newPoints = [];
      for (i = 0; i < len; i++) {
        if (markers[i]) {
          newPoints.push(points[i]);
        }
      }
      return newPoints;
    },
    _simplifyDPStep: function(points, markers, sqTolerance, first, last) {
      var maxSqDist = 0,
          index,
          i,
          sqDist;
      for (i = first + 1; i <= last - 1; i++) {
        sqDist = this._sqClosestPointOnSegment(points[i], points[first], points[last], true);
        if (sqDist > maxSqDist) {
          index = i;
          maxSqDist = sqDist;
        }
      }
      if (maxSqDist > sqTolerance) {
        markers[index] = 1;
        this._simplifyDPStep(points, markers, sqTolerance, first, index);
        this._simplifyDPStep(points, markers, sqTolerance, index, last);
      }
    },
    _reducePoints: function(points, sqTolerance) {
      var reducedPoints = [points[0]];
      for (var i = 1,
          prev = 0,
          len = points.length; i < len; i++) {
        if (this._sqDist(points[i], points[prev]) > sqTolerance) {
          reducedPoints.push(points[i]);
          prev = i;
        }
      }
      if (prev < len - 1) {
        reducedPoints.push(points[len - 1]);
      }
      return reducedPoints;
    },
    clipSegment: function(a, b, bounds, useLastCode) {
      var codeA = useLastCode ? this._lastCode : this._getBitCode(a, bounds),
          codeB = this._getBitCode(b, bounds),
          codeOut,
          p,
          newCode;
      this._lastCode = codeB;
      while (true) {
        if (!(codeA | codeB)) {
          return [a, b];
        } else if (codeA & codeB) {
          return false;
        } else {
          codeOut = codeA || codeB;
          p = this._getEdgeIntersection(a, b, codeOut, bounds);
          newCode = this._getBitCode(p, bounds);
          if (codeOut === codeA) {
            a = p;
            codeA = newCode;
          } else {
            b = p;
            codeB = newCode;
          }
        }
      }
    },
    _getEdgeIntersection: function(a, b, code, bounds) {
      var dx = b.x - a.x,
          dy = b.y - a.y,
          min = bounds.min,
          max = bounds.max;
      if (code & 8) {
        return new L.Point(a.x + dx * (max.y - a.y) / dy, max.y);
      } else if (code & 4) {
        return new L.Point(a.x + dx * (min.y - a.y) / dy, min.y);
      } else if (code & 2) {
        return new L.Point(max.x, a.y + dy * (max.x - a.x) / dx);
      } else if (code & 1) {
        return new L.Point(min.x, a.y + dy * (min.x - a.x) / dx);
      }
    },
    _getBitCode: function(p, bounds) {
      var code = 0;
      if (p.x < bounds.min.x) {
        code |= 1;
      } else if (p.x > bounds.max.x) {
        code |= 2;
      }
      if (p.y < bounds.min.y) {
        code |= 4;
      } else if (p.y > bounds.max.y) {
        code |= 8;
      }
      return code;
    },
    _sqDist: function(p1, p2) {
      var dx = p2.x - p1.x,
          dy = p2.y - p1.y;
      return dx * dx + dy * dy;
    },
    _sqClosestPointOnSegment: function(p, p1, p2, sqDist) {
      var x = p1.x,
          y = p1.y,
          dx = p2.x - x,
          dy = p2.y - y,
          dot = dx * dx + dy * dy,
          t;
      if (dot > 0) {
        t = ((p.x - x) * dx + (p.y - y) * dy) / dot;
        if (t > 1) {
          x = p2.x;
          y = p2.y;
        } else if (t > 0) {
          x += dx * t;
          y += dy * t;
        }
      }
      dx = p.x - x;
      dy = p.y - y;
      return sqDist ? dx * dx + dy * dy : new L.Point(x, y);
    }
  };
  L.Polyline = L.Path.extend({
    initialize: function(latlngs, options) {
      L.Path.prototype.initialize.call(this, options);
      this._latlngs = this._convertLatLngs(latlngs);
    },
    options: {
      smoothFactor: 1.0,
      noClip: false
    },
    projectLatlngs: function() {
      this._originalPoints = [];
      for (var i = 0,
          len = this._latlngs.length; i < len; i++) {
        this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
      }
    },
    getPathString: function() {
      for (var i = 0,
          len = this._parts.length,
          str = ''; i < len; i++) {
        str += this._getPathPartStr(this._parts[i]);
      }
      return str;
    },
    getLatLngs: function() {
      return this._latlngs;
    },
    setLatLngs: function(latlngs) {
      this._latlngs = this._convertLatLngs(latlngs);
      return this.redraw();
    },
    addLatLng: function(latlng) {
      this._latlngs.push(L.latLng(latlng));
      return this.redraw();
    },
    spliceLatLngs: function() {
      var removed = [].splice.apply(this._latlngs, arguments);
      this._convertLatLngs(this._latlngs, true);
      this.redraw();
      return removed;
    },
    closestLayerPoint: function(p) {
      var minDistance = Infinity,
          parts = this._parts,
          p1,
          p2,
          minPoint = null;
      for (var j = 0,
          jLen = parts.length; j < jLen; j++) {
        var points = parts[j];
        for (var i = 1,
            len = points.length; i < len; i++) {
          p1 = points[i - 1];
          p2 = points[i];
          var sqDist = L.LineUtil._sqClosestPointOnSegment(p, p1, p2, true);
          if (sqDist < minDistance) {
            minDistance = sqDist;
            minPoint = L.LineUtil._sqClosestPointOnSegment(p, p1, p2);
          }
        }
      }
      if (minPoint) {
        minPoint.distance = Math.sqrt(minDistance);
      }
      return minPoint;
    },
    getBounds: function() {
      return new L.LatLngBounds(this.getLatLngs());
    },
    _convertLatLngs: function(latlngs, overwrite) {
      var i,
          len,
          target = overwrite ? latlngs : [];
      for (i = 0, len = latlngs.length; i < len; i++) {
        if (L.Util.isArray(latlngs[i]) && typeof latlngs[i][0] !== 'number') {
          return;
        }
        target[i] = L.latLng(latlngs[i]);
      }
      return target;
    },
    _initEvents: function() {
      L.Path.prototype._initEvents.call(this);
    },
    _getPathPartStr: function(points) {
      var round = L.Path.VML;
      for (var j = 0,
          len2 = points.length,
          str = '',
          p; j < len2; j++) {
        p = points[j];
        if (round) {
          p._round();
        }
        str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
      }
      return str;
    },
    _clipPoints: function() {
      var points = this._originalPoints,
          len = points.length,
          i,
          k,
          segment;
      if (this.options.noClip) {
        this._parts = [points];
        return;
      }
      this._parts = [];
      var parts = this._parts,
          vp = this._map._pathViewport,
          lu = L.LineUtil;
      for (i = 0, k = 0; i < len - 1; i++) {
        segment = lu.clipSegment(points[i], points[i + 1], vp, i);
        if (!segment) {
          continue;
        }
        parts[k] = parts[k] || [];
        parts[k].push(segment[0]);
        if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
          parts[k].push(segment[1]);
          k++;
        }
      }
    },
    _simplifyPoints: function() {
      var parts = this._parts,
          lu = L.LineUtil;
      for (var i = 0,
          len = parts.length; i < len; i++) {
        parts[i] = lu.simplify(parts[i], this.options.smoothFactor);
      }
    },
    _updatePath: function() {
      if (!this._map) {
        return;
      }
      this._clipPoints();
      this._simplifyPoints();
      L.Path.prototype._updatePath.call(this);
    }
  });
  L.polyline = function(latlngs, options) {
    return new L.Polyline(latlngs, options);
  };
  L.PolyUtil = {};
  L.PolyUtil.clipPolygon = function(points, bounds) {
    var clippedPoints,
        edges = [1, 4, 2, 8],
        i,
        j,
        k,
        a,
        b,
        len,
        edge,
        p,
        lu = L.LineUtil;
    for (i = 0, len = points.length; i < len; i++) {
      points[i]._code = lu._getBitCode(points[i], bounds);
    }
    for (k = 0; k < 4; k++) {
      edge = edges[k];
      clippedPoints = [];
      for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
        a = points[i];
        b = points[j];
        if (!(a._code & edge)) {
          if (b._code & edge) {
            p = lu._getEdgeIntersection(b, a, edge, bounds);
            p._code = lu._getBitCode(p, bounds);
            clippedPoints.push(p);
          }
          clippedPoints.push(a);
        } else if (!(b._code & edge)) {
          p = lu._getEdgeIntersection(b, a, edge, bounds);
          p._code = lu._getBitCode(p, bounds);
          clippedPoints.push(p);
        }
      }
      points = clippedPoints;
    }
    return points;
  };
  L.Polygon = L.Polyline.extend({
    options: {fill: true},
    initialize: function(latlngs, options) {
      L.Polyline.prototype.initialize.call(this, latlngs, options);
      this._initWithHoles(latlngs);
    },
    _initWithHoles: function(latlngs) {
      var i,
          len,
          hole;
      if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
        this._latlngs = this._convertLatLngs(latlngs[0]);
        this._holes = latlngs.slice(1);
        for (i = 0, len = this._holes.length; i < len; i++) {
          hole = this._holes[i] = this._convertLatLngs(this._holes[i]);
          if (hole[0].equals(hole[hole.length - 1])) {
            hole.pop();
          }
        }
      }
      latlngs = this._latlngs;
      if (latlngs.length >= 2 && latlngs[0].equals(latlngs[latlngs.length - 1])) {
        latlngs.pop();
      }
    },
    projectLatlngs: function() {
      L.Polyline.prototype.projectLatlngs.call(this);
      this._holePoints = [];
      if (!this._holes) {
        return;
      }
      var i,
          j,
          len,
          len2;
      for (i = 0, len = this._holes.length; i < len; i++) {
        this._holePoints[i] = [];
        for (j = 0, len2 = this._holes[i].length; j < len2; j++) {
          this._holePoints[i][j] = this._map.latLngToLayerPoint(this._holes[i][j]);
        }
      }
    },
    setLatLngs: function(latlngs) {
      if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
        this._initWithHoles(latlngs);
        return this.redraw();
      } else {
        return L.Polyline.prototype.setLatLngs.call(this, latlngs);
      }
    },
    _clipPoints: function() {
      var points = this._originalPoints,
          newParts = [];
      this._parts = [points].concat(this._holePoints);
      if (this.options.noClip) {
        return;
      }
      for (var i = 0,
          len = this._parts.length; i < len; i++) {
        var clipped = L.PolyUtil.clipPolygon(this._parts[i], this._map._pathViewport);
        if (clipped.length) {
          newParts.push(clipped);
        }
      }
      this._parts = newParts;
    },
    _getPathPartStr: function(points) {
      var str = L.Polyline.prototype._getPathPartStr.call(this, points);
      return str + (L.Browser.svg ? 'z' : 'x');
    }
  });
  L.polygon = function(latlngs, options) {
    return new L.Polygon(latlngs, options);
  };
  (function() {
    function createMulti(Klass) {
      return L.FeatureGroup.extend({
        initialize: function(latlngs, options) {
          this._layers = {};
          this._options = options;
          this.setLatLngs(latlngs);
        },
        setLatLngs: function(latlngs) {
          var i = 0,
              len = latlngs.length;
          this.eachLayer(function(layer) {
            if (i < len) {
              layer.setLatLngs(latlngs[i++]);
            } else {
              this.removeLayer(layer);
            }
          }, this);
          while (i < len) {
            this.addLayer(new Klass(latlngs[i++], this._options));
          }
          return this;
        },
        getLatLngs: function() {
          var latlngs = [];
          this.eachLayer(function(layer) {
            latlngs.push(layer.getLatLngs());
          });
          return latlngs;
        }
      });
    }
    L.MultiPolyline = createMulti(L.Polyline);
    L.MultiPolygon = createMulti(L.Polygon);
    L.multiPolyline = function(latlngs, options) {
      return new L.MultiPolyline(latlngs, options);
    };
    L.multiPolygon = function(latlngs, options) {
      return new L.MultiPolygon(latlngs, options);
    };
  }());
  L.Rectangle = L.Polygon.extend({
    initialize: function(latLngBounds, options) {
      L.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
    },
    setBounds: function(latLngBounds) {
      this.setLatLngs(this._boundsToLatLngs(latLngBounds));
    },
    _boundsToLatLngs: function(latLngBounds) {
      latLngBounds = L.latLngBounds(latLngBounds);
      return [latLngBounds.getSouthWest(), latLngBounds.getNorthWest(), latLngBounds.getNorthEast(), latLngBounds.getSouthEast()];
    }
  });
  L.rectangle = function(latLngBounds, options) {
    return new L.Rectangle(latLngBounds, options);
  };
  L.Circle = L.Path.extend({
    initialize: function(latlng, radius, options) {
      L.Path.prototype.initialize.call(this, options);
      this._latlng = L.latLng(latlng);
      this._mRadius = radius;
    },
    options: {fill: true},
    setLatLng: function(latlng) {
      this._latlng = L.latLng(latlng);
      return this.redraw();
    },
    setRadius: function(radius) {
      this._mRadius = radius;
      return this.redraw();
    },
    projectLatlngs: function() {
      var lngRadius = this._getLngRadius(),
          latlng = this._latlng,
          pointLeft = this._map.latLngToLayerPoint([latlng.lat, latlng.lng - lngRadius]);
      this._point = this._map.latLngToLayerPoint(latlng);
      this._radius = Math.max(this._point.x - pointLeft.x, 1);
    },
    getBounds: function() {
      var lngRadius = this._getLngRadius(),
          latRadius = (this._mRadius / 40075017) * 360,
          latlng = this._latlng;
      return new L.LatLngBounds([latlng.lat - latRadius, latlng.lng - lngRadius], [latlng.lat + latRadius, latlng.lng + lngRadius]);
    },
    getLatLng: function() {
      return this._latlng;
    },
    getPathString: function() {
      var p = this._point,
          r = this._radius;
      if (this._checkIfEmpty()) {
        return '';
      }
      if (L.Browser.svg) {
        return 'M' + p.x + ',' + (p.y - r) + 'A' + r + ',' + r + ',0,1,1,' + (p.x - 0.1) + ',' + (p.y - r) + ' z';
      } else {
        p._round();
        r = Math.round(r);
        return 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r + ' 0,' + (65535 * 360);
      }
    },
    getRadius: function() {
      return this._mRadius;
    },
    _getLatRadius: function() {
      return (this._mRadius / 40075017) * 360;
    },
    _getLngRadius: function() {
      return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
    },
    _checkIfEmpty: function() {
      if (!this._map) {
        return false;
      }
      var vp = this._map._pathViewport,
          r = this._radius,
          p = this._point;
      return p.x - r > vp.max.x || p.y - r > vp.max.y || p.x + r < vp.min.x || p.y + r < vp.min.y;
    }
  });
  L.circle = function(latlng, radius, options) {
    return new L.Circle(latlng, radius, options);
  };
  L.CircleMarker = L.Circle.extend({
    options: {
      radius: 10,
      weight: 2
    },
    initialize: function(latlng, options) {
      L.Circle.prototype.initialize.call(this, latlng, null, options);
      this._radius = this.options.radius;
    },
    projectLatlngs: function() {
      this._point = this._map.latLngToLayerPoint(this._latlng);
    },
    _updateStyle: function() {
      L.Circle.prototype._updateStyle.call(this);
      this.setRadius(this.options.radius);
    },
    setLatLng: function(latlng) {
      L.Circle.prototype.setLatLng.call(this, latlng);
      if (this._popup && this._popup._isOpen) {
        this._popup.setLatLng(latlng);
      }
      return this;
    },
    setRadius: function(radius) {
      this.options.radius = this._radius = radius;
      return this.redraw();
    },
    getRadius: function() {
      return this._radius;
    }
  });
  L.circleMarker = function(latlng, options) {
    return new L.CircleMarker(latlng, options);
  };
  L.Polyline.include(!L.Path.CANVAS ? {} : {_containsPoint: function(p, closed) {
      var i,
          j,
          k,
          len,
          len2,
          dist,
          part,
          w = this.options.weight / 2;
      if (L.Browser.touch) {
        w += 10;
      }
      for (i = 0, len = this._parts.length; i < len; i++) {
        part = this._parts[i];
        for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
          if (!closed && (j === 0)) {
            continue;
          }
          dist = L.LineUtil.pointToSegmentDistance(p, part[k], part[j]);
          if (dist <= w) {
            return true;
          }
        }
      }
      return false;
    }});
  L.Polygon.include(!L.Path.CANVAS ? {} : {_containsPoint: function(p) {
      var inside = false,
          part,
          p1,
          p2,
          i,
          j,
          k,
          len,
          len2;
      if (L.Polyline.prototype._containsPoint.call(this, p, true)) {
        return true;
      }
      for (i = 0, len = this._parts.length; i < len; i++) {
        part = this._parts[i];
        for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
          p1 = part[j];
          p2 = part[k];
          if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
            inside = !inside;
          }
        }
      }
      return inside;
    }});
  L.Circle.include(!L.Path.CANVAS ? {} : {
    _drawPath: function() {
      var p = this._point;
      this._ctx.beginPath();
      this._ctx.arc(p.x, p.y, this._radius, 0, Math.PI * 2, false);
    },
    _containsPoint: function(p) {
      var center = this._point,
          w2 = this.options.stroke ? this.options.weight / 2 : 0;
      return (p.distanceTo(center) <= this._radius + w2);
    }
  });
  L.CircleMarker.include(!L.Path.CANVAS ? {} : {_updateStyle: function() {
      L.Path.prototype._updateStyle.call(this);
    }});
  L.GeoJSON = L.FeatureGroup.extend({
    initialize: function(geojson, options) {
      L.setOptions(this, options);
      this._layers = {};
      if (geojson) {
        this.addData(geojson);
      }
    },
    addData: function(geojson) {
      var features = L.Util.isArray(geojson) ? geojson : geojson.features,
          i,
          len,
          feature;
      if (features) {
        for (i = 0, len = features.length; i < len; i++) {
          feature = features[i];
          if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
            this.addData(features[i]);
          }
        }
        return this;
      }
      var options = this.options;
      if (options.filter && !options.filter(geojson)) {
        return;
      }
      var layer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng, options);
      layer.feature = L.GeoJSON.asFeature(geojson);
      layer.defaultOptions = layer.options;
      this.resetStyle(layer);
      if (options.onEachFeature) {
        options.onEachFeature(geojson, layer);
      }
      return this.addLayer(layer);
    },
    resetStyle: function(layer) {
      var style = this.options.style;
      if (style) {
        L.Util.extend(layer.options, layer.defaultOptions);
        this._setLayerStyle(layer, style);
      }
    },
    setStyle: function(style) {
      this.eachLayer(function(layer) {
        this._setLayerStyle(layer, style);
      }, this);
    },
    _setLayerStyle: function(layer, style) {
      if (typeof style === 'function') {
        style = style(layer.feature);
      }
      if (layer.setStyle) {
        layer.setStyle(style);
      }
    }
  });
  L.extend(L.GeoJSON, {
    geometryToLayer: function(geojson, pointToLayer, coordsToLatLng, vectorOptions) {
      var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
          coords = geometry.coordinates,
          layers = [],
          latlng,
          latlngs,
          i,
          len;
      coordsToLatLng = coordsToLatLng || this.coordsToLatLng;
      switch (geometry.type) {
        case 'Point':
          latlng = coordsToLatLng(coords);
          return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);
        case 'MultiPoint':
          for (i = 0, len = coords.length; i < len; i++) {
            latlng = coordsToLatLng(coords[i]);
            layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
          }
          return new L.FeatureGroup(layers);
        case 'LineString':
          latlngs = this.coordsToLatLngs(coords, 0, coordsToLatLng);
          return new L.Polyline(latlngs, vectorOptions);
        case 'Polygon':
          if (coords.length === 2 && !coords[1].length) {
            throw new Error('Invalid GeoJSON object.');
          }
          latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
          return new L.Polygon(latlngs, vectorOptions);
        case 'MultiLineString':
          latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
          return new L.MultiPolyline(latlngs, vectorOptions);
        case 'MultiPolygon':
          latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
          return new L.MultiPolygon(latlngs, vectorOptions);
        case 'GeometryCollection':
          for (i = 0, len = geometry.geometries.length; i < len; i++) {
            layers.push(this.geometryToLayer({
              geometry: geometry.geometries[i],
              type: 'Feature',
              properties: geojson.properties
            }, pointToLayer, coordsToLatLng, vectorOptions));
          }
          return new L.FeatureGroup(layers);
        default:
          throw new Error('Invalid GeoJSON object.');
      }
    },
    coordsToLatLng: function(coords) {
      return new L.LatLng(coords[1], coords[0], coords[2]);
    },
    coordsToLatLngs: function(coords, levelsDeep, coordsToLatLng) {
      var latlng,
          i,
          len,
          latlngs = [];
      for (i = 0, len = coords.length; i < len; i++) {
        latlng = levelsDeep ? this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) : (coordsToLatLng || this.coordsToLatLng)(coords[i]);
        latlngs.push(latlng);
      }
      return latlngs;
    },
    latLngToCoords: function(latlng) {
      var coords = [latlng.lng, latlng.lat];
      if (latlng.alt !== undefined) {
        coords.push(latlng.alt);
      }
      return coords;
    },
    latLngsToCoords: function(latLngs) {
      var coords = [];
      for (var i = 0,
          len = latLngs.length; i < len; i++) {
        coords.push(L.GeoJSON.latLngToCoords(latLngs[i]));
      }
      return coords;
    },
    getFeature: function(layer, newGeometry) {
      return layer.feature ? L.extend({}, layer.feature, {geometry: newGeometry}) : L.GeoJSON.asFeature(newGeometry);
    },
    asFeature: function(geoJSON) {
      if (geoJSON.type === 'Feature') {
        return geoJSON;
      }
      return {
        type: 'Feature',
        properties: {},
        geometry: geoJSON
      };
    }
  });
  var PointToGeoJSON = {toGeoJSON: function() {
      return L.GeoJSON.getFeature(this, {
        type: 'Point',
        coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
      });
    }};
  L.Marker.include(PointToGeoJSON);
  L.Circle.include(PointToGeoJSON);
  L.CircleMarker.include(PointToGeoJSON);
  L.Polyline.include({toGeoJSON: function() {
      return L.GeoJSON.getFeature(this, {
        type: 'LineString',
        coordinates: L.GeoJSON.latLngsToCoords(this.getLatLngs())
      });
    }});
  L.Polygon.include({toGeoJSON: function() {
      var coords = [L.GeoJSON.latLngsToCoords(this.getLatLngs())],
          i,
          len,
          hole;
      coords[0].push(coords[0][0]);
      if (this._holes) {
        for (i = 0, len = this._holes.length; i < len; i++) {
          hole = L.GeoJSON.latLngsToCoords(this._holes[i]);
          hole.push(hole[0]);
          coords.push(hole);
        }
      }
      return L.GeoJSON.getFeature(this, {
        type: 'Polygon',
        coordinates: coords
      });
    }});
  (function() {
    function multiToGeoJSON(type) {
      return function() {
        var coords = [];
        this.eachLayer(function(layer) {
          coords.push(layer.toGeoJSON().geometry.coordinates);
        });
        return L.GeoJSON.getFeature(this, {
          type: type,
          coordinates: coords
        });
      };
    }
    L.MultiPolyline.include({toGeoJSON: multiToGeoJSON('MultiLineString')});
    L.MultiPolygon.include({toGeoJSON: multiToGeoJSON('MultiPolygon')});
    L.LayerGroup.include({toGeoJSON: function() {
        var geometry = this.feature && this.feature.geometry,
            jsons = [],
            json;
        if (geometry && geometry.type === 'MultiPoint') {
          return multiToGeoJSON('MultiPoint').call(this);
        }
        var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';
        this.eachLayer(function(layer) {
          if (layer.toGeoJSON) {
            json = layer.toGeoJSON();
            jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
          }
        });
        if (isGeometryCollection) {
          return L.GeoJSON.getFeature(this, {
            geometries: jsons,
            type: 'GeometryCollection'
          });
        }
        return {
          type: 'FeatureCollection',
          features: jsons
        };
      }});
  }());
  L.geoJson = function(geojson, options) {
    return new L.GeoJSON(geojson, options);
  };
  L.DomEvent = {
    addListener: function(obj, type, fn, context) {
      var id = L.stamp(fn),
          key = '_leaflet_' + type + id,
          handler,
          originalHandler,
          newType;
      if (obj[key]) {
        return this;
      }
      handler = function(e) {
        return fn.call(context || obj, e || L.DomEvent._getEvent());
      };
      if (L.Browser.pointer && type.indexOf('touch') === 0) {
        return this.addPointerListener(obj, type, handler, id);
      }
      if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
        this.addDoubleTapListener(obj, handler, id);
      }
      if ('addEventListener' in obj) {
        if (type === 'mousewheel') {
          obj.addEventListener('DOMMouseScroll', handler, false);
          obj.addEventListener(type, handler, false);
        } else if ((type === 'mouseenter') || (type === 'mouseleave')) {
          originalHandler = handler;
          newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');
          handler = function(e) {
            if (!L.DomEvent._checkMouse(obj, e)) {
              return;
            }
            return originalHandler(e);
          };
          obj.addEventListener(newType, handler, false);
        } else if (type === 'click' && L.Browser.android) {
          originalHandler = handler;
          handler = function(e) {
            return L.DomEvent._filterClick(e, originalHandler);
          };
          obj.addEventListener(type, handler, false);
        } else {
          obj.addEventListener(type, handler, false);
        }
      } else if ('attachEvent' in obj) {
        obj.attachEvent('on' + type, handler);
      }
      obj[key] = handler;
      return this;
    },
    removeListener: function(obj, type, fn) {
      var id = L.stamp(fn),
          key = '_leaflet_' + type + id,
          handler = obj[key];
      if (!handler) {
        return this;
      }
      if (L.Browser.pointer && type.indexOf('touch') === 0) {
        this.removePointerListener(obj, type, id);
      } else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
        this.removeDoubleTapListener(obj, id);
      } else if ('removeEventListener' in obj) {
        if (type === 'mousewheel') {
          obj.removeEventListener('DOMMouseScroll', handler, false);
          obj.removeEventListener(type, handler, false);
        } else if ((type === 'mouseenter') || (type === 'mouseleave')) {
          obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
        } else {
          obj.removeEventListener(type, handler, false);
        }
      } else if ('detachEvent' in obj) {
        obj.detachEvent('on' + type, handler);
      }
      obj[key] = null;
      return this;
    },
    stopPropagation: function(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
      L.DomEvent._skipped(e);
      return this;
    },
    disableScrollPropagation: function(el) {
      var stop = L.DomEvent.stopPropagation;
      return L.DomEvent.on(el, 'mousewheel', stop).on(el, 'MozMousePixelScroll', stop);
    },
    disableClickPropagation: function(el) {
      var stop = L.DomEvent.stopPropagation;
      for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
        L.DomEvent.on(el, L.Draggable.START[i], stop);
      }
      return L.DomEvent.on(el, 'click', L.DomEvent._fakeStop).on(el, 'dblclick', stop);
    },
    preventDefault: function(e) {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
      return this;
    },
    stop: function(e) {
      return L.DomEvent.preventDefault(e).stopPropagation(e);
    },
    getMousePosition: function(e, container) {
      if (!container) {
        return new L.Point(e.clientX, e.clientY);
      }
      var rect = container.getBoundingClientRect();
      return new L.Point(e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop);
    },
    getWheelDelta: function(e) {
      var delta = 0;
      if (e.wheelDelta) {
        delta = e.wheelDelta / 120;
      }
      if (e.detail) {
        delta = -e.detail / 3;
      }
      return delta;
    },
    _skipEvents: {},
    _fakeStop: function(e) {
      L.DomEvent._skipEvents[e.type] = true;
    },
    _skipped: function(e) {
      var skipped = this._skipEvents[e.type];
      this._skipEvents[e.type] = false;
      return skipped;
    },
    _checkMouse: function(el, e) {
      var related = e.relatedTarget;
      if (!related) {
        return true;
      }
      try {
        while (related && (related !== el)) {
          related = related.parentNode;
        }
      } catch (err) {
        return false;
      }
      return (related !== el);
    },
    _getEvent: function() {
      var e = window.event;
      if (!e) {
        var caller = arguments.callee.caller;
        while (caller) {
          e = caller['arguments'][0];
          if (e && window.Event === e.constructor) {
            break;
          }
          caller = caller.caller;
        }
      }
      return e;
    },
    _filterClick: function(e, handler) {
      var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
          elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);
      if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
        L.DomEvent.stop(e);
        return;
      }
      L.DomEvent._lastClick = timeStamp;
      return handler(e);
    }
  };
  L.DomEvent.on = L.DomEvent.addListener;
  L.DomEvent.off = L.DomEvent.removeListener;
  L.Draggable = L.Class.extend({
    includes: L.Mixin.Events,
    statics: {
      START: L.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
      END: {
        mousedown: 'mouseup',
        touchstart: 'touchend',
        pointerdown: 'touchend',
        MSPointerDown: 'touchend'
      },
      MOVE: {
        mousedown: 'mousemove',
        touchstart: 'touchmove',
        pointerdown: 'touchmove',
        MSPointerDown: 'touchmove'
      }
    },
    initialize: function(element, dragStartTarget) {
      this._element = element;
      this._dragStartTarget = dragStartTarget || element;
    },
    enable: function() {
      if (this._enabled) {
        return;
      }
      for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
        L.DomEvent.on(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
      }
      this._enabled = true;
    },
    disable: function() {
      if (!this._enabled) {
        return;
      }
      for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
        L.DomEvent.off(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
      }
      this._enabled = false;
      this._moved = false;
    },
    _onDown: function(e) {
      this._moved = false;
      if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) {
        return;
      }
      L.DomEvent.stopPropagation(e);
      if (L.Draggable._disabled) {
        return;
      }
      L.DomUtil.disableImageDrag();
      L.DomUtil.disableTextSelection();
      if (this._moving) {
        return;
      }
      var first = e.touches ? e.touches[0] : e;
      this._startPoint = new L.Point(first.clientX, first.clientY);
      this._startPos = this._newPos = L.DomUtil.getPosition(this._element);
      L.DomEvent.on(document, L.Draggable.MOVE[e.type], this._onMove, this).on(document, L.Draggable.END[e.type], this._onUp, this);
    },
    _onMove: function(e) {
      if (e.touches && e.touches.length > 1) {
        this._moved = true;
        return;
      }
      var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
          newPoint = new L.Point(first.clientX, first.clientY),
          offset = newPoint.subtract(this._startPoint);
      if (!offset.x && !offset.y) {
        return;
      }
      if (L.Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) {
        return;
      }
      L.DomEvent.preventDefault(e);
      if (!this._moved) {
        this.fire('dragstart');
        this._moved = true;
        this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);
        L.DomUtil.addClass(document.body, 'leaflet-dragging');
        this._lastTarget = e.target || e.srcElement;
        L.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
      }
      this._newPos = this._startPos.add(offset);
      this._moving = true;
      L.Util.cancelAnimFrame(this._animRequest);
      this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
    },
    _updatePosition: function() {
      this.fire('predrag');
      L.DomUtil.setPosition(this._element, this._newPos);
      this.fire('drag');
    },
    _onUp: function() {
      L.DomUtil.removeClass(document.body, 'leaflet-dragging');
      if (this._lastTarget) {
        L.DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
        this._lastTarget = null;
      }
      for (var i in L.Draggable.MOVE) {
        L.DomEvent.off(document, L.Draggable.MOVE[i], this._onMove).off(document, L.Draggable.END[i], this._onUp);
      }
      L.DomUtil.enableImageDrag();
      L.DomUtil.enableTextSelection();
      if (this._moved && this._moving) {
        L.Util.cancelAnimFrame(this._animRequest);
        this.fire('dragend', {distance: this._newPos.distanceTo(this._startPos)});
      }
      this._moving = false;
    }
  });
  L.Handler = L.Class.extend({
    initialize: function(map) {
      this._map = map;
    },
    enable: function() {
      if (this._enabled) {
        return;
      }
      this._enabled = true;
      this.addHooks();
    },
    disable: function() {
      if (!this._enabled) {
        return;
      }
      this._enabled = false;
      this.removeHooks();
    },
    enabled: function() {
      return !!this._enabled;
    }
  });
  L.Map.mergeOptions({
    dragging: true,
    inertia: !L.Browser.android23,
    inertiaDeceleration: 3400,
    inertiaMaxSpeed: Infinity,
    inertiaThreshold: L.Browser.touch ? 32 : 18,
    easeLinearity: 0.25,
    worldCopyJump: false
  });
  L.Map.Drag = L.Handler.extend({
    addHooks: function() {
      if (!this._draggable) {
        var map = this._map;
        this._draggable = new L.Draggable(map._mapPane, map._container);
        this._draggable.on({
          'dragstart': this._onDragStart,
          'drag': this._onDrag,
          'dragend': this._onDragEnd
        }, this);
        if (map.options.worldCopyJump) {
          this._draggable.on('predrag', this._onPreDrag, this);
          map.on('viewreset', this._onViewReset, this);
          map.whenReady(this._onViewReset, this);
        }
      }
      this._draggable.enable();
    },
    removeHooks: function() {
      this._draggable.disable();
    },
    moved: function() {
      return this._draggable && this._draggable._moved;
    },
    _onDragStart: function() {
      var map = this._map;
      if (map._panAnim) {
        map._panAnim.stop();
      }
      map.fire('movestart').fire('dragstart');
      if (map.options.inertia) {
        this._positions = [];
        this._times = [];
      }
    },
    _onDrag: function() {
      if (this._map.options.inertia) {
        var time = this._lastTime = +new Date(),
            pos = this._lastPos = this._draggable._newPos;
        this._positions.push(pos);
        this._times.push(time);
        if (time - this._times[0] > 200) {
          this._positions.shift();
          this._times.shift();
        }
      }
      this._map.fire('move').fire('drag');
    },
    _onViewReset: function() {
      var pxCenter = this._map.getSize()._divideBy(2),
          pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);
      this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
      this._worldWidth = this._map.project([0, 180]).x;
    },
    _onPreDrag: function() {
      var worldWidth = this._worldWidth,
          halfWidth = Math.round(worldWidth / 2),
          dx = this._initialWorldOffset,
          x = this._draggable._newPos.x,
          newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
          newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
          newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;
      this._draggable._newPos.x = newX;
    },
    _onDragEnd: function(e) {
      var map = this._map,
          options = map.options,
          delay = +new Date() - this._lastTime,
          noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];
      map.fire('dragend', e);
      if (noInertia) {
        map.fire('moveend');
      } else {
        var direction = this._lastPos.subtract(this._positions[0]),
            duration = (this._lastTime + delay - this._times[0]) / 1000,
            ease = options.easeLinearity,
            speedVector = direction.multiplyBy(ease / duration),
            speed = speedVector.distanceTo([0, 0]),
            limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
            limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),
            decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
            offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();
        if (!offset.x || !offset.y) {
          map.fire('moveend');
        } else {
          offset = map._limitOffset(offset, map.options.maxBounds);
          L.Util.requestAnimFrame(function() {
            map.panBy(offset, {
              duration: decelerationDuration,
              easeLinearity: ease,
              noMoveStart: true
            });
          });
        }
      }
    }
  });
  L.Map.addInitHook('addHandler', 'dragging', L.Map.Drag);
  L.Map.mergeOptions({doubleClickZoom: true});
  L.Map.DoubleClickZoom = L.Handler.extend({
    addHooks: function() {
      this._map.on('dblclick', this._onDoubleClick, this);
    },
    removeHooks: function() {
      this._map.off('dblclick', this._onDoubleClick, this);
    },
    _onDoubleClick: function(e) {
      var map = this._map,
          zoom = map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1);
      if (map.options.doubleClickZoom === 'center') {
        map.setZoom(zoom);
      } else {
        map.setZoomAround(e.containerPoint, zoom);
      }
    }
  });
  L.Map.addInitHook('addHandler', 'doubleClickZoom', L.Map.DoubleClickZoom);
  L.Map.mergeOptions({scrollWheelZoom: true});
  L.Map.ScrollWheelZoom = L.Handler.extend({
    addHooks: function() {
      L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);
      L.DomEvent.on(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
      this._delta = 0;
    },
    removeHooks: function() {
      L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll);
      L.DomEvent.off(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
    },
    _onWheelScroll: function(e) {
      var delta = L.DomEvent.getWheelDelta(e);
      this._delta += delta;
      this._lastMousePos = this._map.mouseEventToContainerPoint(e);
      if (!this._startTime) {
        this._startTime = +new Date();
      }
      var left = Math.max(40 - (+new Date() - this._startTime), 0);
      clearTimeout(this._timer);
      this._timer = setTimeout(L.bind(this._performZoom, this), left);
      L.DomEvent.preventDefault(e);
      L.DomEvent.stopPropagation(e);
    },
    _performZoom: function() {
      var map = this._map,
          delta = this._delta,
          zoom = map.getZoom();
      delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
      delta = Math.max(Math.min(delta, 4), -4);
      delta = map._limitZoom(zoom + delta) - zoom;
      this._delta = 0;
      this._startTime = null;
      if (!delta) {
        return;
      }
      if (map.options.scrollWheelZoom === 'center') {
        map.setZoom(zoom + delta);
      } else {
        map.setZoomAround(this._lastMousePos, zoom + delta);
      }
    }
  });
  L.Map.addInitHook('addHandler', 'scrollWheelZoom', L.Map.ScrollWheelZoom);
  L.extend(L.DomEvent, {
    _touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
    _touchend: L.Browser.msPointer ? 'MSPointerUp' : L.Browser.pointer ? 'pointerup' : 'touchend',
    addDoubleTapListener: function(obj, handler, id) {
      var last,
          doubleTap = false,
          delay = 250,
          touch,
          pre = '_leaflet_',
          touchstart = this._touchstart,
          touchend = this._touchend,
          trackedTouches = [];
      function onTouchStart(e) {
        var count;
        if (L.Browser.pointer) {
          trackedTouches.push(e.pointerId);
          count = trackedTouches.length;
        } else {
          count = e.touches.length;
        }
        if (count > 1) {
          return;
        }
        var now = Date.now(),
            delta = now - (last || now);
        touch = e.touches ? e.touches[0] : e;
        doubleTap = (delta > 0 && delta <= delay);
        last = now;
      }
      function onTouchEnd(e) {
        if (L.Browser.pointer) {
          var idx = trackedTouches.indexOf(e.pointerId);
          if (idx === -1) {
            return;
          }
          trackedTouches.splice(idx, 1);
        }
        if (doubleTap) {
          if (L.Browser.pointer) {
            var newTouch = {},
                prop;
            for (var i in touch) {
              prop = touch[i];
              if (typeof prop === 'function') {
                newTouch[i] = prop.bind(touch);
              } else {
                newTouch[i] = prop;
              }
            }
            touch = newTouch;
          }
          touch.type = 'dblclick';
          handler(touch);
          last = null;
        }
      }
      obj[pre + touchstart + id] = onTouchStart;
      obj[pre + touchend + id] = onTouchEnd;
      var endElement = L.Browser.pointer ? document.documentElement : obj;
      obj.addEventListener(touchstart, onTouchStart, false);
      endElement.addEventListener(touchend, onTouchEnd, false);
      if (L.Browser.pointer) {
        endElement.addEventListener(L.DomEvent.POINTER_CANCEL, onTouchEnd, false);
      }
      return this;
    },
    removeDoubleTapListener: function(obj, id) {
      var pre = '_leaflet_';
      obj.removeEventListener(this._touchstart, obj[pre + this._touchstart + id], false);
      (L.Browser.pointer ? document.documentElement : obj).removeEventListener(this._touchend, obj[pre + this._touchend + id], false);
      if (L.Browser.pointer) {
        document.documentElement.removeEventListener(L.DomEvent.POINTER_CANCEL, obj[pre + this._touchend + id], false);
      }
      return this;
    }
  });
  L.extend(L.DomEvent, {
    POINTER_DOWN: L.Browser.msPointer ? 'MSPointerDown' : 'pointerdown',
    POINTER_MOVE: L.Browser.msPointer ? 'MSPointerMove' : 'pointermove',
    POINTER_UP: L.Browser.msPointer ? 'MSPointerUp' : 'pointerup',
    POINTER_CANCEL: L.Browser.msPointer ? 'MSPointerCancel' : 'pointercancel',
    _pointers: [],
    _pointerDocumentListener: false,
    addPointerListener: function(obj, type, handler, id) {
      switch (type) {
        case 'touchstart':
          return this.addPointerListenerStart(obj, type, handler, id);
        case 'touchend':
          return this.addPointerListenerEnd(obj, type, handler, id);
        case 'touchmove':
          return this.addPointerListenerMove(obj, type, handler, id);
        default:
          throw 'Unknown touch event type';
      }
    },
    addPointerListenerStart: function(obj, type, handler, id) {
      var pre = '_leaflet_',
          pointers = this._pointers;
      var cb = function(e) {
        if (e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
          L.DomEvent.preventDefault(e);
        }
        var alreadyInArray = false;
        for (var i = 0; i < pointers.length; i++) {
          if (pointers[i].pointerId === e.pointerId) {
            alreadyInArray = true;
            break;
          }
        }
        if (!alreadyInArray) {
          pointers.push(e);
        }
        e.touches = pointers.slice();
        e.changedTouches = [e];
        handler(e);
      };
      obj[pre + 'touchstart' + id] = cb;
      obj.addEventListener(this.POINTER_DOWN, cb, false);
      if (!this._pointerDocumentListener) {
        var internalCb = function(e) {
          for (var i = 0; i < pointers.length; i++) {
            if (pointers[i].pointerId === e.pointerId) {
              pointers.splice(i, 1);
              break;
            }
          }
        };
        document.documentElement.addEventListener(this.POINTER_UP, internalCb, false);
        document.documentElement.addEventListener(this.POINTER_CANCEL, internalCb, false);
        this._pointerDocumentListener = true;
      }
      return this;
    },
    addPointerListenerMove: function(obj, type, handler, id) {
      var pre = '_leaflet_',
          touches = this._pointers;
      function cb(e) {
        if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) {
          return;
        }
        for (var i = 0; i < touches.length; i++) {
          if (touches[i].pointerId === e.pointerId) {
            touches[i] = e;
            break;
          }
        }
        e.touches = touches.slice();
        e.changedTouches = [e];
        handler(e);
      }
      obj[pre + 'touchmove' + id] = cb;
      obj.addEventListener(this.POINTER_MOVE, cb, false);
      return this;
    },
    addPointerListenerEnd: function(obj, type, handler, id) {
      var pre = '_leaflet_',
          touches = this._pointers;
      var cb = function(e) {
        for (var i = 0; i < touches.length; i++) {
          if (touches[i].pointerId === e.pointerId) {
            touches.splice(i, 1);
            break;
          }
        }
        e.touches = touches.slice();
        e.changedTouches = [e];
        handler(e);
      };
      obj[pre + 'touchend' + id] = cb;
      obj.addEventListener(this.POINTER_UP, cb, false);
      obj.addEventListener(this.POINTER_CANCEL, cb, false);
      return this;
    },
    removePointerListener: function(obj, type, id) {
      var pre = '_leaflet_',
          cb = obj[pre + type + id];
      switch (type) {
        case 'touchstart':
          obj.removeEventListener(this.POINTER_DOWN, cb, false);
          break;
        case 'touchmove':
          obj.removeEventListener(this.POINTER_MOVE, cb, false);
          break;
        case 'touchend':
          obj.removeEventListener(this.POINTER_UP, cb, false);
          obj.removeEventListener(this.POINTER_CANCEL, cb, false);
          break;
      }
      return this;
    }
  });
  L.Map.mergeOptions({
    touchZoom: L.Browser.touch && !L.Browser.android23,
    bounceAtZoomLimits: true
  });
  L.Map.TouchZoom = L.Handler.extend({
    addHooks: function() {
      L.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
    },
    removeHooks: function() {
      L.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
    },
    _onTouchStart: function(e) {
      var map = this._map;
      if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) {
        return;
      }
      var p1 = map.mouseEventToLayerPoint(e.touches[0]),
          p2 = map.mouseEventToLayerPoint(e.touches[1]),
          viewCenter = map._getCenterLayerPoint();
      this._startCenter = p1.add(p2)._divideBy(2);
      this._startDist = p1.distanceTo(p2);
      this._moved = false;
      this._zooming = true;
      this._centerOffset = viewCenter.subtract(this._startCenter);
      if (map._panAnim) {
        map._panAnim.stop();
      }
      L.DomEvent.on(document, 'touchmove', this._onTouchMove, this).on(document, 'touchend', this._onTouchEnd, this);
      L.DomEvent.preventDefault(e);
    },
    _onTouchMove: function(e) {
      var map = this._map;
      if (!e.touches || e.touches.length !== 2 || !this._zooming) {
        return;
      }
      var p1 = map.mouseEventToLayerPoint(e.touches[0]),
          p2 = map.mouseEventToLayerPoint(e.touches[1]);
      this._scale = p1.distanceTo(p2) / this._startDist;
      this._delta = p1._add(p2)._divideBy(2)._subtract(this._startCenter);
      if (this._scale === 1) {
        return;
      }
      if (!map.options.bounceAtZoomLimits) {
        if ((map.getZoom() === map.getMinZoom() && this._scale < 1) || (map.getZoom() === map.getMaxZoom() && this._scale > 1)) {
          return;
        }
      }
      if (!this._moved) {
        L.DomUtil.addClass(map._mapPane, 'leaflet-touching');
        map.fire('movestart').fire('zoomstart');
        this._moved = true;
      }
      L.Util.cancelAnimFrame(this._animRequest);
      this._animRequest = L.Util.requestAnimFrame(this._updateOnMove, this, true, this._map._container);
      L.DomEvent.preventDefault(e);
    },
    _updateOnMove: function() {
      var map = this._map,
          origin = this._getScaleOrigin(),
          center = map.layerPointToLatLng(origin),
          zoom = map.getScaleZoom(this._scale);
      map._animateZoom(center, zoom, this._startCenter, this._scale, this._delta, false, true);
    },
    _onTouchEnd: function() {
      if (!this._moved || !this._zooming) {
        this._zooming = false;
        return;
      }
      var map = this._map;
      this._zooming = false;
      L.DomUtil.removeClass(map._mapPane, 'leaflet-touching');
      L.Util.cancelAnimFrame(this._animRequest);
      L.DomEvent.off(document, 'touchmove', this._onTouchMove).off(document, 'touchend', this._onTouchEnd);
      var origin = this._getScaleOrigin(),
          center = map.layerPointToLatLng(origin),
          oldZoom = map.getZoom(),
          floatZoomDelta = map.getScaleZoom(this._scale) - oldZoom,
          roundZoomDelta = (floatZoomDelta > 0 ? Math.ceil(floatZoomDelta) : Math.floor(floatZoomDelta)),
          zoom = map._limitZoom(oldZoom + roundZoomDelta),
          scale = map.getZoomScale(zoom) / this._scale;
      map._animateZoom(center, zoom, origin, scale);
    },
    _getScaleOrigin: function() {
      var centerOffset = this._centerOffset.subtract(this._delta).divideBy(this._scale);
      return this._startCenter.add(centerOffset);
    }
  });
  L.Map.addInitHook('addHandler', 'touchZoom', L.Map.TouchZoom);
  L.Map.mergeOptions({
    tap: true,
    tapTolerance: 15
  });
  L.Map.Tap = L.Handler.extend({
    addHooks: function() {
      L.DomEvent.on(this._map._container, 'touchstart', this._onDown, this);
    },
    removeHooks: function() {
      L.DomEvent.off(this._map._container, 'touchstart', this._onDown, this);
    },
    _onDown: function(e) {
      if (!e.touches) {
        return;
      }
      L.DomEvent.preventDefault(e);
      this._fireClick = true;
      if (e.touches.length > 1) {
        this._fireClick = false;
        clearTimeout(this._holdTimeout);
        return;
      }
      var first = e.touches[0],
          el = first.target;
      this._startPos = this._newPos = new L.Point(first.clientX, first.clientY);
      if (el.tagName && el.tagName.toLowerCase() === 'a') {
        L.DomUtil.addClass(el, 'leaflet-active');
      }
      this._holdTimeout = setTimeout(L.bind(function() {
        if (this._isTapValid()) {
          this._fireClick = false;
          this._onUp();
          this._simulateEvent('contextmenu', first);
        }
      }, this), 1000);
      L.DomEvent.on(document, 'touchmove', this._onMove, this).on(document, 'touchend', this._onUp, this);
    },
    _onUp: function(e) {
      clearTimeout(this._holdTimeout);
      L.DomEvent.off(document, 'touchmove', this._onMove, this).off(document, 'touchend', this._onUp, this);
      if (this._fireClick && e && e.changedTouches) {
        var first = e.changedTouches[0],
            el = first.target;
        if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
          L.DomUtil.removeClass(el, 'leaflet-active');
        }
        if (this._isTapValid()) {
          this._simulateEvent('click', first);
        }
      }
    },
    _isTapValid: function() {
      return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
    },
    _onMove: function(e) {
      var first = e.touches[0];
      this._newPos = new L.Point(first.clientX, first.clientY);
    },
    _simulateEvent: function(type, e) {
      var simulatedEvent = document.createEvent('MouseEvents');
      simulatedEvent._simulated = true;
      e.target._simulatedClick = true;
      simulatedEvent.initMouseEvent(type, true, true, window, 1, e.screenX, e.screenY, e.clientX, e.clientY, false, false, false, false, 0, null);
      e.target.dispatchEvent(simulatedEvent);
    }
  });
  if (L.Browser.touch && !L.Browser.pointer) {
    L.Map.addInitHook('addHandler', 'tap', L.Map.Tap);
  }
  L.Map.mergeOptions({boxZoom: true});
  L.Map.BoxZoom = L.Handler.extend({
    initialize: function(map) {
      this._map = map;
      this._container = map._container;
      this._pane = map._panes.overlayPane;
      this._moved = false;
    },
    addHooks: function() {
      L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
    },
    removeHooks: function() {
      L.DomEvent.off(this._container, 'mousedown', this._onMouseDown);
      this._moved = false;
    },
    moved: function() {
      return this._moved;
    },
    _onMouseDown: function(e) {
      this._moved = false;
      if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) {
        return false;
      }
      L.DomUtil.disableTextSelection();
      L.DomUtil.disableImageDrag();
      this._startLayerPoint = this._map.mouseEventToLayerPoint(e);
      L.DomEvent.on(document, 'mousemove', this._onMouseMove, this).on(document, 'mouseup', this._onMouseUp, this).on(document, 'keydown', this._onKeyDown, this);
    },
    _onMouseMove: function(e) {
      if (!this._moved) {
        this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
        L.DomUtil.setPosition(this._box, this._startLayerPoint);
        this._container.style.cursor = 'crosshair';
        this._map.fire('boxzoomstart');
      }
      var startPoint = this._startLayerPoint,
          box = this._box,
          layerPoint = this._map.mouseEventToLayerPoint(e),
          offset = layerPoint.subtract(startPoint),
          newPos = new L.Point(Math.min(layerPoint.x, startPoint.x), Math.min(layerPoint.y, startPoint.y));
      L.DomUtil.setPosition(box, newPos);
      this._moved = true;
      box.style.width = (Math.max(0, Math.abs(offset.x) - 4)) + 'px';
      box.style.height = (Math.max(0, Math.abs(offset.y) - 4)) + 'px';
    },
    _finish: function() {
      if (this._moved) {
        this._pane.removeChild(this._box);
        this._container.style.cursor = '';
      }
      L.DomUtil.enableTextSelection();
      L.DomUtil.enableImageDrag();
      L.DomEvent.off(document, 'mousemove', this._onMouseMove).off(document, 'mouseup', this._onMouseUp).off(document, 'keydown', this._onKeyDown);
    },
    _onMouseUp: function(e) {
      this._finish();
      var map = this._map,
          layerPoint = map.mouseEventToLayerPoint(e);
      if (this._startLayerPoint.equals(layerPoint)) {
        return;
      }
      var bounds = new L.LatLngBounds(map.layerPointToLatLng(this._startLayerPoint), map.layerPointToLatLng(layerPoint));
      map.fitBounds(bounds);
      map.fire('boxzoomend', {boxZoomBounds: bounds});
    },
    _onKeyDown: function(e) {
      if (e.keyCode === 27) {
        this._finish();
      }
    }
  });
  L.Map.addInitHook('addHandler', 'boxZoom', L.Map.BoxZoom);
  L.Map.mergeOptions({
    keyboard: true,
    keyboardPanOffset: 80,
    keyboardZoomOffset: 1
  });
  L.Map.Keyboard = L.Handler.extend({
    keyCodes: {
      left: [37],
      right: [39],
      down: [40],
      up: [38],
      zoomIn: [187, 107, 61, 171],
      zoomOut: [189, 109, 173]
    },
    initialize: function(map) {
      this._map = map;
      this._setPanOffset(map.options.keyboardPanOffset);
      this._setZoomOffset(map.options.keyboardZoomOffset);
    },
    addHooks: function() {
      var container = this._map._container;
      if (container.tabIndex === -1) {
        container.tabIndex = '0';
      }
      L.DomEvent.on(container, 'focus', this._onFocus, this).on(container, 'blur', this._onBlur, this).on(container, 'mousedown', this._onMouseDown, this);
      this._map.on('focus', this._addHooks, this).on('blur', this._removeHooks, this);
    },
    removeHooks: function() {
      this._removeHooks();
      var container = this._map._container;
      L.DomEvent.off(container, 'focus', this._onFocus, this).off(container, 'blur', this._onBlur, this).off(container, 'mousedown', this._onMouseDown, this);
      this._map.off('focus', this._addHooks, this).off('blur', this._removeHooks, this);
    },
    _onMouseDown: function() {
      if (this._focused) {
        return;
      }
      var body = document.body,
          docEl = document.documentElement,
          top = body.scrollTop || docEl.scrollTop,
          left = body.scrollLeft || docEl.scrollLeft;
      this._map._container.focus();
      window.scrollTo(left, top);
    },
    _onFocus: function() {
      this._focused = true;
      this._map.fire('focus');
    },
    _onBlur: function() {
      this._focused = false;
      this._map.fire('blur');
    },
    _setPanOffset: function(pan) {
      var keys = this._panKeys = {},
          codes = this.keyCodes,
          i,
          len;
      for (i = 0, len = codes.left.length; i < len; i++) {
        keys[codes.left[i]] = [-1 * pan, 0];
      }
      for (i = 0, len = codes.right.length; i < len; i++) {
        keys[codes.right[i]] = [pan, 0];
      }
      for (i = 0, len = codes.down.length; i < len; i++) {
        keys[codes.down[i]] = [0, pan];
      }
      for (i = 0, len = codes.up.length; i < len; i++) {
        keys[codes.up[i]] = [0, -1 * pan];
      }
    },
    _setZoomOffset: function(zoom) {
      var keys = this._zoomKeys = {},
          codes = this.keyCodes,
          i,
          len;
      for (i = 0, len = codes.zoomIn.length; i < len; i++) {
        keys[codes.zoomIn[i]] = zoom;
      }
      for (i = 0, len = codes.zoomOut.length; i < len; i++) {
        keys[codes.zoomOut[i]] = -zoom;
      }
    },
    _addHooks: function() {
      L.DomEvent.on(document, 'keydown', this._onKeyDown, this);
    },
    _removeHooks: function() {
      L.DomEvent.off(document, 'keydown', this._onKeyDown, this);
    },
    _onKeyDown: function(e) {
      var key = e.keyCode,
          map = this._map;
      if (key in this._panKeys) {
        if (map._panAnim && map._panAnim._inProgress) {
          return;
        }
        map.panBy(this._panKeys[key]);
        if (map.options.maxBounds) {
          map.panInsideBounds(map.options.maxBounds);
        }
      } else if (key in this._zoomKeys) {
        map.setZoom(map.getZoom() + this._zoomKeys[key]);
      } else {
        return;
      }
      L.DomEvent.stop(e);
    }
  });
  L.Map.addInitHook('addHandler', 'keyboard', L.Map.Keyboard);
  L.Handler.MarkerDrag = L.Handler.extend({
    initialize: function(marker) {
      this._marker = marker;
    },
    addHooks: function() {
      var icon = this._marker._icon;
      if (!this._draggable) {
        this._draggable = new L.Draggable(icon, icon);
      }
      this._draggable.on('dragstart', this._onDragStart, this).on('drag', this._onDrag, this).on('dragend', this._onDragEnd, this);
      this._draggable.enable();
      L.DomUtil.addClass(this._marker._icon, 'leaflet-marker-draggable');
    },
    removeHooks: function() {
      this._draggable.off('dragstart', this._onDragStart, this).off('drag', this._onDrag, this).off('dragend', this._onDragEnd, this);
      this._draggable.disable();
      L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
    },
    moved: function() {
      return this._draggable && this._draggable._moved;
    },
    _onDragStart: function() {
      this._marker.closePopup().fire('movestart').fire('dragstart');
    },
    _onDrag: function() {
      var marker = this._marker,
          shadow = marker._shadow,
          iconPos = L.DomUtil.getPosition(marker._icon),
          latlng = marker._map.layerPointToLatLng(iconPos);
      if (shadow) {
        L.DomUtil.setPosition(shadow, iconPos);
      }
      marker._latlng = latlng;
      marker.fire('move', {latlng: latlng}).fire('drag');
    },
    _onDragEnd: function(e) {
      this._marker.fire('moveend').fire('dragend', e);
    }
  });
  L.Control = L.Class.extend({
    options: {position: 'topright'},
    initialize: function(options) {
      L.setOptions(this, options);
    },
    getPosition: function() {
      return this.options.position;
    },
    setPosition: function(position) {
      var map = this._map;
      if (map) {
        map.removeControl(this);
      }
      this.options.position = position;
      if (map) {
        map.addControl(this);
      }
      return this;
    },
    getContainer: function() {
      return this._container;
    },
    addTo: function(map) {
      this._map = map;
      var container = this._container = this.onAdd(map),
          pos = this.getPosition(),
          corner = map._controlCorners[pos];
      L.DomUtil.addClass(container, 'leaflet-control');
      if (pos.indexOf('bottom') !== -1) {
        corner.insertBefore(container, corner.firstChild);
      } else {
        corner.appendChild(container);
      }
      return this;
    },
    removeFrom: function(map) {
      var pos = this.getPosition(),
          corner = map._controlCorners[pos];
      corner.removeChild(this._container);
      this._map = null;
      if (this.onRemove) {
        this.onRemove(map);
      }
      return this;
    },
    _refocusOnMap: function() {
      if (this._map) {
        this._map.getContainer().focus();
      }
    }
  });
  L.control = function(options) {
    return new L.Control(options);
  };
  L.Map.include({
    addControl: function(control) {
      control.addTo(this);
      return this;
    },
    removeControl: function(control) {
      control.removeFrom(this);
      return this;
    },
    _initControlPos: function() {
      var corners = this._controlCorners = {},
          l = 'leaflet-',
          container = this._controlContainer = L.DomUtil.create('div', l + 'control-container', this._container);
      function createCorner(vSide, hSide) {
        var className = l + vSide + ' ' + l + hSide;
        corners[vSide + hSide] = L.DomUtil.create('div', className, container);
      }
      createCorner('top', 'left');
      createCorner('top', 'right');
      createCorner('bottom', 'left');
      createCorner('bottom', 'right');
    },
    _clearControlPos: function() {
      this._container.removeChild(this._controlContainer);
    }
  });
  L.Control.Zoom = L.Control.extend({
    options: {
      position: 'topleft',
      zoomInText: '+',
      zoomInTitle: 'Zoom in',
      zoomOutText: '-',
      zoomOutTitle: 'Zoom out'
    },
    onAdd: function(map) {
      var zoomName = 'leaflet-control-zoom',
          container = L.DomUtil.create('div', zoomName + ' leaflet-bar');
      this._map = map;
      this._zoomInButton = this._createButton(this.options.zoomInText, this.options.zoomInTitle, zoomName + '-in', container, this._zoomIn, this);
      this._zoomOutButton = this._createButton(this.options.zoomOutText, this.options.zoomOutTitle, zoomName + '-out', container, this._zoomOut, this);
      this._updateDisabled();
      map.on('zoomend zoomlevelschange', this._updateDisabled, this);
      return container;
    },
    onRemove: function(map) {
      map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },
    _zoomIn: function(e) {
      this._map.zoomIn(e.shiftKey ? 3 : 1);
    },
    _zoomOut: function(e) {
      this._map.zoomOut(e.shiftKey ? 3 : 1);
    },
    _createButton: function(html, title, className, container, fn, context) {
      var link = L.DomUtil.create('a', className, container);
      link.innerHTML = html;
      link.href = '#';
      link.title = title;
      var stop = L.DomEvent.stopPropagation;
      L.DomEvent.on(link, 'click', stop).on(link, 'mousedown', stop).on(link, 'dblclick', stop).on(link, 'click', L.DomEvent.preventDefault).on(link, 'click', fn, context).on(link, 'click', this._refocusOnMap, context);
      return link;
    },
    _updateDisabled: function() {
      var map = this._map,
          className = 'leaflet-disabled';
      L.DomUtil.removeClass(this._zoomInButton, className);
      L.DomUtil.removeClass(this._zoomOutButton, className);
      if (map._zoom === map.getMinZoom()) {
        L.DomUtil.addClass(this._zoomOutButton, className);
      }
      if (map._zoom === map.getMaxZoom()) {
        L.DomUtil.addClass(this._zoomInButton, className);
      }
    }
  });
  L.Map.mergeOptions({zoomControl: true});
  L.Map.addInitHook(function() {
    if (this.options.zoomControl) {
      this.zoomControl = new L.Control.Zoom();
      this.addControl(this.zoomControl);
    }
  });
  L.control.zoom = function(options) {
    return new L.Control.Zoom(options);
  };
  L.Control.Attribution = L.Control.extend({
    options: {
      position: 'bottomright',
      prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
    },
    initialize: function(options) {
      L.setOptions(this, options);
      this._attributions = {};
    },
    onAdd: function(map) {
      this._container = L.DomUtil.create('div', 'leaflet-control-attribution');
      L.DomEvent.disableClickPropagation(this._container);
      for (var i in map._layers) {
        if (map._layers[i].getAttribution) {
          this.addAttribution(map._layers[i].getAttribution());
        }
      }
      map.on('layeradd', this._onLayerAdd, this).on('layerremove', this._onLayerRemove, this);
      this._update();
      return this._container;
    },
    onRemove: function(map) {
      map.off('layeradd', this._onLayerAdd).off('layerremove', this._onLayerRemove);
    },
    setPrefix: function(prefix) {
      this.options.prefix = prefix;
      this._update();
      return this;
    },
    addAttribution: function(text) {
      if (!text) {
        return;
      }
      if (!this._attributions[text]) {
        this._attributions[text] = 0;
      }
      this._attributions[text]++;
      this._update();
      return this;
    },
    removeAttribution: function(text) {
      if (!text) {
        return;
      }
      if (this._attributions[text]) {
        this._attributions[text]--;
        this._update();
      }
      return this;
    },
    _update: function() {
      if (!this._map) {
        return;
      }
      var attribs = [];
      for (var i in this._attributions) {
        if (this._attributions[i]) {
          attribs.push(i);
        }
      }
      var prefixAndAttribs = [];
      if (this.options.prefix) {
        prefixAndAttribs.push(this.options.prefix);
      }
      if (attribs.length) {
        prefixAndAttribs.push(attribs.join(', '));
      }
      this._container.innerHTML = prefixAndAttribs.join(' | ');
    },
    _onLayerAdd: function(e) {
      if (e.layer.getAttribution) {
        this.addAttribution(e.layer.getAttribution());
      }
    },
    _onLayerRemove: function(e) {
      if (e.layer.getAttribution) {
        this.removeAttribution(e.layer.getAttribution());
      }
    }
  });
  L.Map.mergeOptions({attributionControl: true});
  L.Map.addInitHook(function() {
    if (this.options.attributionControl) {
      this.attributionControl = (new L.Control.Attribution()).addTo(this);
    }
  });
  L.control.attribution = function(options) {
    return new L.Control.Attribution(options);
  };
  L.Control.Scale = L.Control.extend({
    options: {
      position: 'bottomleft',
      maxWidth: 100,
      metric: true,
      imperial: true,
      updateWhenIdle: false
    },
    onAdd: function(map) {
      this._map = map;
      var className = 'leaflet-control-scale',
          container = L.DomUtil.create('div', className),
          options = this.options;
      this._addScales(options, className, container);
      map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
      map.whenReady(this._update, this);
      return container;
    },
    onRemove: function(map) {
      map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
    },
    _addScales: function(options, className, container) {
      if (options.metric) {
        this._mScale = L.DomUtil.create('div', className + '-line', container);
      }
      if (options.imperial) {
        this._iScale = L.DomUtil.create('div', className + '-line', container);
      }
    },
    _update: function() {
      var bounds = this._map.getBounds(),
          centerLat = bounds.getCenter().lat,
          halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),
          dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,
          size = this._map.getSize(),
          options = this.options,
          maxMeters = 0;
      if (size.x > 0) {
        maxMeters = dist * (options.maxWidth / size.x);
      }
      this._updateScales(options, maxMeters);
    },
    _updateScales: function(options, maxMeters) {
      if (options.metric && maxMeters) {
        this._updateMetric(maxMeters);
      }
      if (options.imperial && maxMeters) {
        this._updateImperial(maxMeters);
      }
    },
    _updateMetric: function(maxMeters) {
      var meters = this._getRoundNum(maxMeters);
      this._mScale.style.width = this._getScaleWidth(meters / maxMeters) + 'px';
      this._mScale.innerHTML = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';
    },
    _updateImperial: function(maxMeters) {
      var maxFeet = maxMeters * 3.2808399,
          scale = this._iScale,
          maxMiles,
          miles,
          feet;
      if (maxFeet > 5280) {
        maxMiles = maxFeet / 5280;
        miles = this._getRoundNum(maxMiles);
        scale.style.width = this._getScaleWidth(miles / maxMiles) + 'px';
        scale.innerHTML = miles + ' mi';
      } else {
        feet = this._getRoundNum(maxFeet);
        scale.style.width = this._getScaleWidth(feet / maxFeet) + 'px';
        scale.innerHTML = feet + ' ft';
      }
    },
    _getScaleWidth: function(ratio) {
      return Math.round(this.options.maxWidth * ratio) - 10;
    },
    _getRoundNum: function(num) {
      var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
          d = num / pow10;
      d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
      return pow10 * d;
    }
  });
  L.control.scale = function(options) {
    return new L.Control.Scale(options);
  };
  L.Control.Layers = L.Control.extend({
    options: {
      collapsed: true,
      position: 'topright',
      autoZIndex: true
    },
    initialize: function(baseLayers, overlays, options) {
      L.setOptions(this, options);
      this._layers = {};
      this._lastZIndex = 0;
      this._handlingClick = false;
      for (var i in baseLayers) {
        this._addLayer(baseLayers[i], i);
      }
      for (i in overlays) {
        this._addLayer(overlays[i], i, true);
      }
    },
    onAdd: function(map) {
      this._initLayout();
      this._update();
      map.on('layeradd', this._onLayerChange, this).on('layerremove', this._onLayerChange, this);
      return this._container;
    },
    onRemove: function(map) {
      map.off('layeradd', this._onLayerChange, this).off('layerremove', this._onLayerChange, this);
    },
    addBaseLayer: function(layer, name) {
      this._addLayer(layer, name);
      this._update();
      return this;
    },
    addOverlay: function(layer, name) {
      this._addLayer(layer, name, true);
      this._update();
      return this;
    },
    removeLayer: function(layer) {
      var id = L.stamp(layer);
      delete this._layers[id];
      this._update();
      return this;
    },
    _initLayout: function() {
      var className = 'leaflet-control-layers',
          container = this._container = L.DomUtil.create('div', className);
      container.setAttribute('aria-haspopup', true);
      if (!L.Browser.touch) {
        L.DomEvent.disableClickPropagation(container).disableScrollPropagation(container);
      } else {
        L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
      }
      var form = this._form = L.DomUtil.create('form', className + '-list');
      if (this.options.collapsed) {
        if (!L.Browser.android) {
          L.DomEvent.on(container, 'mouseover', this._expand, this).on(container, 'mouseout', this._collapse, this);
        }
        var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
        link.href = '#';
        link.title = 'Layers';
        if (L.Browser.touch) {
          L.DomEvent.on(link, 'click', L.DomEvent.stop).on(link, 'click', this._expand, this);
        } else {
          L.DomEvent.on(link, 'focus', this._expand, this);
        }
        L.DomEvent.on(form, 'click', function() {
          setTimeout(L.bind(this._onInputClick, this), 0);
        }, this);
        this._map.on('click', this._collapse, this);
      } else {
        this._expand();
      }
      this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
      this._separator = L.DomUtil.create('div', className + '-separator', form);
      this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);
      container.appendChild(form);
    },
    _addLayer: function(layer, name, overlay) {
      var id = L.stamp(layer);
      this._layers[id] = {
        layer: layer,
        name: name,
        overlay: overlay
      };
      if (this.options.autoZIndex && layer.setZIndex) {
        this._lastZIndex++;
        layer.setZIndex(this._lastZIndex);
      }
    },
    _update: function() {
      if (!this._container) {
        return;
      }
      this._baseLayersList.innerHTML = '';
      this._overlaysList.innerHTML = '';
      var baseLayersPresent = false,
          overlaysPresent = false,
          i,
          obj;
      for (i in this._layers) {
        obj = this._layers[i];
        this._addItem(obj);
        overlaysPresent = overlaysPresent || obj.overlay;
        baseLayersPresent = baseLayersPresent || !obj.overlay;
      }
      this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
    },
    _onLayerChange: function(e) {
      var obj = this._layers[L.stamp(e.layer)];
      if (!obj) {
        return;
      }
      if (!this._handlingClick) {
        this._update();
      }
      var type = obj.overlay ? (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') : (e.type === 'layeradd' ? 'baselayerchange' : null);
      if (type) {
        this._map.fire(type, obj);
      }
    },
    _createRadioElement: function(name, checked) {
      var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
      if (checked) {
        radioHtml += ' checked="checked"';
      }
      radioHtml += '/>';
      var radioFragment = document.createElement('div');
      radioFragment.innerHTML = radioHtml;
      return radioFragment.firstChild;
    },
    _addItem: function(obj) {
      var label = document.createElement('label'),
          input,
          checked = this._map.hasLayer(obj.layer);
      if (obj.overlay) {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'leaflet-control-layers-selector';
        input.defaultChecked = checked;
      } else {
        input = this._createRadioElement('leaflet-base-layers', checked);
      }
      input.layerId = L.stamp(obj.layer);
      L.DomEvent.on(input, 'click', this._onInputClick, this);
      var name = document.createElement('span');
      name.innerHTML = ' ' + obj.name;
      label.appendChild(input);
      label.appendChild(name);
      var container = obj.overlay ? this._overlaysList : this._baseLayersList;
      container.appendChild(label);
      return label;
    },
    _onInputClick: function() {
      var i,
          input,
          obj,
          inputs = this._form.getElementsByTagName('input'),
          inputsLen = inputs.length;
      this._handlingClick = true;
      for (i = 0; i < inputsLen; i++) {
        input = inputs[i];
        obj = this._layers[input.layerId];
        if (input.checked && !this._map.hasLayer(obj.layer)) {
          this._map.addLayer(obj.layer);
        } else if (!input.checked && this._map.hasLayer(obj.layer)) {
          this._map.removeLayer(obj.layer);
        }
      }
      this._handlingClick = false;
      this._refocusOnMap();
    },
    _expand: function() {
      L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
    },
    _collapse: function() {
      this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
    }
  });
  L.control.layers = function(baseLayers, overlays, options) {
    return new L.Control.Layers(baseLayers, overlays, options);
  };
  L.PosAnimation = L.Class.extend({
    includes: L.Mixin.Events,
    run: function(el, newPos, duration, easeLinearity) {
      this.stop();
      this._el = el;
      this._inProgress = true;
      this._newPos = newPos;
      this.fire('start');
      el.style[L.DomUtil.TRANSITION] = 'all ' + (duration || 0.25) + 's cubic-bezier(0,0,' + (easeLinearity || 0.5) + ',1)';
      L.DomEvent.on(el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);
      L.DomUtil.setPosition(el, newPos);
      L.Util.falseFn(el.offsetWidth);
      this._stepTimer = setInterval(L.bind(this._onStep, this), 50);
    },
    stop: function() {
      if (!this._inProgress) {
        return;
      }
      L.DomUtil.setPosition(this._el, this._getPos());
      this._onTransitionEnd();
      L.Util.falseFn(this._el.offsetWidth);
    },
    _onStep: function() {
      var stepPos = this._getPos();
      if (!stepPos) {
        this._onTransitionEnd();
        return;
      }
      this._el._leaflet_pos = stepPos;
      this.fire('step');
    },
    _transformRe: /([-+]?(?:\d*\.)?\d+)\D*, ([-+]?(?:\d*\.)?\d+)\D*\)/,
    _getPos: function() {
      var left,
          top,
          matches,
          el = this._el,
          style = window.getComputedStyle(el);
      if (L.Browser.any3d) {
        matches = style[L.DomUtil.TRANSFORM].match(this._transformRe);
        if (!matches) {
          return;
        }
        left = parseFloat(matches[1]);
        top = parseFloat(matches[2]);
      } else {
        left = parseFloat(style.left);
        top = parseFloat(style.top);
      }
      return new L.Point(left, top, true);
    },
    _onTransitionEnd: function() {
      L.DomEvent.off(this._el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);
      if (!this._inProgress) {
        return;
      }
      this._inProgress = false;
      this._el.style[L.DomUtil.TRANSITION] = '';
      this._el._leaflet_pos = this._newPos;
      clearInterval(this._stepTimer);
      this.fire('step').fire('end');
    }
  });
  L.Map.include({
    setView: function(center, zoom, options) {
      zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
      center = this._limitCenter(L.latLng(center), zoom, this.options.maxBounds);
      options = options || {};
      if (this._panAnim) {
        this._panAnim.stop();
      }
      if (this._loaded && !options.reset && options !== true) {
        if (options.animate !== undefined) {
          options.zoom = L.extend({animate: options.animate}, options.zoom);
          options.pan = L.extend({animate: options.animate}, options.pan);
        }
        var animated = (this._zoom !== zoom) ? this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) : this._tryAnimatedPan(center, options.pan);
        if (animated) {
          clearTimeout(this._sizeTimer);
          return this;
        }
      }
      this._resetView(center, zoom);
      return this;
    },
    panBy: function(offset, options) {
      offset = L.point(offset).round();
      options = options || {};
      if (!offset.x && !offset.y) {
        return this;
      }
      if (!this._panAnim) {
        this._panAnim = new L.PosAnimation();
        this._panAnim.on({
          'step': this._onPanTransitionStep,
          'end': this._onPanTransitionEnd
        }, this);
      }
      if (!options.noMoveStart) {
        this.fire('movestart');
      }
      if (options.animate !== false) {
        L.DomUtil.addClass(this._mapPane, 'leaflet-pan-anim');
        var newPos = this._getMapPanePos().subtract(offset);
        this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
      } else {
        this._rawPanBy(offset);
        this.fire('move').fire('moveend');
      }
      return this;
    },
    _onPanTransitionStep: function() {
      this.fire('move');
    },
    _onPanTransitionEnd: function() {
      L.DomUtil.removeClass(this._mapPane, 'leaflet-pan-anim');
      this.fire('moveend');
    },
    _tryAnimatedPan: function(center, options) {
      var offset = this._getCenterOffset(center)._floor();
      if ((options && options.animate) !== true && !this.getSize().contains(offset)) {
        return false;
      }
      this.panBy(offset, options);
      return true;
    }
  });
  L.PosAnimation = L.DomUtil.TRANSITION ? L.PosAnimation : L.PosAnimation.extend({
    run: function(el, newPos, duration, easeLinearity) {
      this.stop();
      this._el = el;
      this._inProgress = true;
      this._duration = duration || 0.25;
      this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);
      this._startPos = L.DomUtil.getPosition(el);
      this._offset = newPos.subtract(this._startPos);
      this._startTime = +new Date();
      this.fire('start');
      this._animate();
    },
    stop: function() {
      if (!this._inProgress) {
        return;
      }
      this._step();
      this._complete();
    },
    _animate: function() {
      this._animId = L.Util.requestAnimFrame(this._animate, this);
      this._step();
    },
    _step: function() {
      var elapsed = (+new Date()) - this._startTime,
          duration = this._duration * 1000;
      if (elapsed < duration) {
        this._runFrame(this._easeOut(elapsed / duration));
      } else {
        this._runFrame(1);
        this._complete();
      }
    },
    _runFrame: function(progress) {
      var pos = this._startPos.add(this._offset.multiplyBy(progress));
      L.DomUtil.setPosition(this._el, pos);
      this.fire('step');
    },
    _complete: function() {
      L.Util.cancelAnimFrame(this._animId);
      this._inProgress = false;
      this.fire('end');
    },
    _easeOut: function(t) {
      return 1 - Math.pow(1 - t, this._easeOutPower);
    }
  });
  L.Map.mergeOptions({
    zoomAnimation: true,
    zoomAnimationThreshold: 4
  });
  if (L.DomUtil.TRANSITION) {
    L.Map.addInitHook(function() {
      this._zoomAnimated = this.options.zoomAnimation && L.DomUtil.TRANSITION && L.Browser.any3d && !L.Browser.android23 && !L.Browser.mobileOpera;
      if (this._zoomAnimated) {
        L.DomEvent.on(this._mapPane, L.DomUtil.TRANSITION_END, this._catchTransitionEnd, this);
      }
    });
  }
  L.Map.include(!L.DomUtil.TRANSITION ? {} : {
    _catchTransitionEnd: function(e) {
      if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
        this._onZoomTransitionEnd();
      }
    },
    _nothingToAnimate: function() {
      return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
    },
    _tryAnimatedZoom: function(center, zoom, options) {
      if (this._animatingZoom) {
        return true;
      }
      options = options || {};
      if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() || Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) {
        return false;
      }
      var scale = this.getZoomScale(zoom),
          offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
          origin = this._getCenterLayerPoint()._add(offset);
      if (options.animate !== true && !this.getSize().contains(offset)) {
        return false;
      }
      this.fire('movestart').fire('zoomstart');
      this._animateZoom(center, zoom, origin, scale, null, true);
      return true;
    },
    _animateZoom: function(center, zoom, origin, scale, delta, backwards, forTouchZoom) {
      if (!forTouchZoom) {
        this._animatingZoom = true;
      }
      L.DomUtil.addClass(this._mapPane, 'leaflet-zoom-anim');
      this._animateToCenter = center;
      this._animateToZoom = zoom;
      if (L.Draggable) {
        L.Draggable._disabled = true;
      }
      L.Util.requestAnimFrame(function() {
        this.fire('zoomanim', {
          center: center,
          zoom: zoom,
          origin: origin,
          scale: scale,
          delta: delta,
          backwards: backwards
        });
        setTimeout(L.bind(this._onZoomTransitionEnd, this), 250);
      }, this);
    },
    _onZoomTransitionEnd: function() {
      if (!this._animatingZoom) {
        return;
      }
      this._animatingZoom = false;
      L.DomUtil.removeClass(this._mapPane, 'leaflet-zoom-anim');
      L.Util.requestAnimFrame(function() {
        this._resetView(this._animateToCenter, this._animateToZoom, true, true);
        if (L.Draggable) {
          L.Draggable._disabled = false;
        }
      }, this);
    }
  });
  L.TileLayer.include({
    _animateZoom: function(e) {
      if (!this._animating) {
        this._animating = true;
        this._prepareBgBuffer();
      }
      var bg = this._bgBuffer,
          transform = L.DomUtil.TRANSFORM,
          initialTransform = e.delta ? L.DomUtil.getTranslateString(e.delta) : bg.style[transform],
          scaleStr = L.DomUtil.getScaleString(e.scale, e.origin);
      bg.style[transform] = e.backwards ? scaleStr + ' ' + initialTransform : initialTransform + ' ' + scaleStr;
    },
    _endZoomAnim: function() {
      var front = this._tileContainer,
          bg = this._bgBuffer;
      front.style.visibility = '';
      front.parentNode.appendChild(front);
      L.Util.falseFn(bg.offsetWidth);
      var zoom = this._map.getZoom();
      if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
        this._clearBgBuffer();
      }
      this._animating = false;
    },
    _clearBgBuffer: function() {
      var map = this._map;
      if (map && !map._animatingZoom && !map.touchZoom._zooming) {
        this._bgBuffer.innerHTML = '';
        this._bgBuffer.style[L.DomUtil.TRANSFORM] = '';
      }
    },
    _prepareBgBuffer: function() {
      var front = this._tileContainer,
          bg = this._bgBuffer;
      var bgLoaded = this._getLoadedTilesPercentage(bg),
          frontLoaded = this._getLoadedTilesPercentage(front);
      if (bg && bgLoaded > 0.5 && frontLoaded < 0.5) {
        front.style.visibility = 'hidden';
        this._stopLoadingImages(front);
        return;
      }
      bg.style.visibility = 'hidden';
      bg.style[L.DomUtil.TRANSFORM] = '';
      this._tileContainer = bg;
      bg = this._bgBuffer = front;
      this._stopLoadingImages(bg);
      clearTimeout(this._clearBgBufferTimer);
    },
    _getLoadedTilesPercentage: function(container) {
      var tiles = container.getElementsByTagName('img'),
          i,
          len,
          count = 0;
      for (i = 0, len = tiles.length; i < len; i++) {
        if (tiles[i].complete) {
          count++;
        }
      }
      return count / len;
    },
    _stopLoadingImages: function(container) {
      var tiles = Array.prototype.slice.call(container.getElementsByTagName('img')),
          i,
          len,
          tile;
      for (i = 0, len = tiles.length; i < len; i++) {
        tile = tiles[i];
        if (!tile.complete) {
          tile.onload = L.Util.falseFn;
          tile.onerror = L.Util.falseFn;
          tile.src = L.Util.emptyImageUrl;
          tile.parentNode.removeChild(tile);
        }
      }
    }
  });
  L.Map.include({
    _defaultLocateOptions: {
      watch: false,
      setView: false,
      maxZoom: Infinity,
      timeout: 10000,
      maximumAge: 0,
      enableHighAccuracy: false
    },
    locate: function(options) {
      options = this._locateOptions = L.extend(this._defaultLocateOptions, options);
      if (!navigator.geolocation) {
        this._handleGeolocationError({
          code: 0,
          message: 'Geolocation not supported.'
        });
        return this;
      }
      var onResponse = L.bind(this._handleGeolocationResponse, this),
          onError = L.bind(this._handleGeolocationError, this);
      if (options.watch) {
        this._locationWatchId = navigator.geolocation.watchPosition(onResponse, onError, options);
      } else {
        navigator.geolocation.getCurrentPosition(onResponse, onError, options);
      }
      return this;
    },
    stopLocate: function() {
      if (navigator.geolocation) {
        navigator.geolocation.clearWatch(this._locationWatchId);
      }
      if (this._locateOptions) {
        this._locateOptions.setView = false;
      }
      return this;
    },
    _handleGeolocationError: function(error) {
      var c = error.code,
          message = error.message || (c === 1 ? 'permission denied' : (c === 2 ? 'position unavailable' : 'timeout'));
      if (this._locateOptions.setView && !this._loaded) {
        this.fitWorld();
      }
      this.fire('locationerror', {
        code: c,
        message: 'Geolocation error: ' + message + '.'
      });
    },
    _handleGeolocationResponse: function(pos) {
      var lat = pos.coords.latitude,
          lng = pos.coords.longitude,
          latlng = new L.LatLng(lat, lng),
          latAccuracy = 180 * pos.coords.accuracy / 40075017,
          lngAccuracy = latAccuracy / Math.cos(L.LatLng.DEG_TO_RAD * lat),
          bounds = L.latLngBounds([lat - latAccuracy, lng - lngAccuracy], [lat + latAccuracy, lng + lngAccuracy]),
          options = this._locateOptions;
      if (options.setView) {
        var zoom = Math.min(this.getBoundsZoom(bounds), options.maxZoom);
        this.setView(latlng, zoom);
      }
      var data = {
        latlng: latlng,
        bounds: bounds,
        timestamp: pos.timestamp
      };
      for (var i in pos.coords) {
        if (typeof pos.coords[i] === 'number') {
          data[i] = pos.coords[i];
        }
      }
      this.fire('locationfound', data);
    }
  });
}(window, document));

_removeDefine();
})();
(function() {
var _removeDefine = $__System.get("@@amd-helpers").createDefine();
define("e", ["d"], function(main) {
  return main;
});

_removeDefine();
})();
$__System.register("7", ["e", "f", "c", "5", "10"], function($__export) {
  "use strict";
  var __moduleName = "7";
  var L,
      modal,
      draw,
      utils,
      DataStorage,
      Mapper;
  return {
    setters: [function($__m) {
      L = $__m.default;
    }, function($__m) {
      modal = $__m.default;
    }, function($__m) {
      draw = $__m.default;
    }, function($__m) {
      utils = $__m;
    }, function($__m) {
      DataStorage = $__m.default;
    }],
    execute: function() {
      Mapper = function() {
        function Mapper(options) {
          this.mapId = options.id;
          this.lat = options.lat || 51.505;
          this.lng = options.lng || -0.09;
          this.zoom = options.zoom || 12;
          this.layers = {};
        }
        return ($traceurRuntime.createClass)(Mapper, {
          initMap: function() {
            var map = L.map(this.mapId, {
              center: new L.LatLng(this.lat, this.lng),
              zoom: this.zoom,
              zoomControl: false
            });
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
            var zoomControl = L.control.zoom({position: 'topright'});
            map.addControl(zoomControl);
            this.map = map;
            return map;
          },
          addDrawControl: function() {
            var drawnItems = new L.FeatureGroup();
            var dataStorage = new DataStorage();
            this.map.addLayer(drawnItems);
            var drawControl = new L.Control.Draw({
              draw: {
                position: 'topleft',
                polygon: false,
                polyline: false,
                circle: false,
                marker: false
              },
              edit: {
                featureGroup: drawnItems,
                edit: true
              }
            });
            this.map.addControl(drawControl);
            this.map.on('draw:created', $.proxy(function(e) {
              if (Object.keys(drawnItems._layers).length === 0) {
                var layer = e.layer;
                dataStorage.addField("bbox", layer.toGeoJSON());
                drawnItems.addLayer(layer);
              }
            }, this));
            this.map.on('draw:deleted', $.proxy(function(e) {
              dataStorage.removeField("bbox");
              drawnItems.clearLayers();
            }, this));
            var bbox = dataStorage.getField("bbox");
            if (bbox) {
              var layer = L.geoJson(bbox);
              drawnItems.addLayer(layer);
            }
          },
          addKMLLayer: function(layerName, layerUrl) {
            var layer = omnivore.kml(layerUrl).addTo(this.map);
            this.layers[layerName] = layer;
          },
          getLayer: function(layerName) {
            return this.layers[layerName];
          },
          removeLayer: function(layerName) {
            this.map.removeLayer(this.layers[layerName]);
          }
        }, {});
      }();
      $__export('default', Mapper);
    }
  };
});

$__System.register("11", ["7", "5"], function($__export) {
  "use strict";
  var __moduleName = "11";
  var Mapper,
      utils,
      BBox;
  return {
    setters: [function($__m) {
      Mapper = $__m.default;
    }, function($__m) {
      utils = $__m;
    }],
    execute: function() {
      BBox = function() {
        function BBox(options) {
          this.bbox;
          this.mapper = new Mapper(options);
          this.mapId = options.id;
        }
        return ($traceurRuntime.createClass)(BBox, {initialize: function() {
            var modalId = "map-modal";
            var modalButton = '<button type="button" class="btn btn-primary"' + ' data-toggle="modal" id="define-bbox" data-target="#' + modalId + '">' + 'Define bbox</button>';
            if (document.getElementById(modalId) === null) {
              var options = {
                'id': modalId,
                'title': 'Map',
                'body': '<div id="map-parent"><div id="' + this.mapId + '"></div></div>',
                'footer': '',
                "size": "modal-lg"
              };
              document.body.insertAdjacentHTML('afterbegin', utils.makeModalWindow(options));
              var map = this.mapper.initMap();
              this.mapper.addDrawControl();
              $('#' + modalId).on('shown.bs.modal', $.proxy(function(e) {
                map.invalidateSize(false);
              }, this));
            }
            var d1 = document.getElementsByClassName('fieldcontain-general')[0];
            d1.insertAdjacentHTML('beforeend', modalButton);
          }}, {});
      }();
      $__export('default', BBox);
    }
  };
});

$__System.registerDynamic("12", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<!-- Fixed navbar -->\n<nav class="navbar navbar-inverse" id="myNav">\n  <div class="container-fluid">\n    <div id="navbar" class="navbar-collapse collapse">\n      <ul class="nav navbar-nav" data-spy="affix">\n        <li><a href="javascript:void(0)" id="form-save" data-i18n="menu.save">' + ((__t = (save)) == null ? '' : __t) + '</a></li>\n      </ul>\n    </div><!--/.nav-collapse -->\n  </div>\n</nav>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.register("13", [], function() { return { setters: [], execute: function() {} } });

$__System.register("14", ["10", "5", "f"], function($__export) {
  "use strict";
  var __moduleName = "14";
  var DataStorage,
      utils,
      modal,
      Visibility;
  return {
    setters: [function($__m) {
      DataStorage = $__m.default;
    }, function($__m) {
      utils = $__m;
    }, function($__m) {
      modal = $__m.default;
    }],
    execute: function() {
      Visibility = function() {
        function Visibility() {
          this.ELEMENTS_TO_EXCLUDE = ["dtree", "image", "audio", "general", "geoms", "section", "text", "textarea", "warning"];
          this.dataStorage = new DataStorage();
          this.divQuestion = "relate-question";
          this.divOperator = "relate-operator";
          this.divAnswer = "relate-answer";
          this.visibilityId = "visibility-question";
          this.selectOperators = "visibility-operators";
          this.selectAnswers = "visibility-values";
        }
        return ($traceurRuntime.createClass)(Visibility, {
          addQuestions: function(questionId) {
            var data = this.dataStorage.getData().fields;
            var body = [];
            if (data.length > 0) {
              body.push('<select id="' + this.visibilityId + '">');
              for (var i = 0; i < data.length; i++) {
                if ($.inArray(data[i].type, this.ELEMENTS_TO_EXCLUDE) === -1 && data[i].id !== questionId) {
                  body.push('<option value="' + data[i].id + '">' + data[i].label + '</option>');
                }
              }
              body.push('</select>');
            }
            return body;
          },
          getRulesAndAnswers: function(questionId) {
            var visibility = this.checkForExistingRules(questionId);
            var visibilityId = $('#' + this.visibilityId).val();
            var divAnswers = [];
            var selectOperators = [];
            var selected = "";
            var data = this.dataStorage.getData().fields;
            selectOperators.push('<select id="' + this.selectOperators + '">');
            if (visibility) {
              visibilityId = visibility.id;
            }
            data.forEach($.proxy(function(element) {
              if (visibilityId === element.id) {
                var obj = this.getOperatorsAndAnswersFromJSON(element);
                if (obj.answers.length > 0) {
                  divAnswers.push('<select id="' + this.selectAnswers + '">');
                  obj.answers.forEach(function(element) {
                    if (visibility && visibility.answer === element) {
                      selected = 'selected="selected"';
                    }
                    divAnswers.push('<option value="' + element + '" ' + selected + '>' + element + '</option>');
                    selected = "";
                  });
                  divAnswers.push('</select>');
                } else {
                  var answer = "";
                  if (visibility) {
                    answer = visibility.answer;
                  }
                  divAnswers.push('<input type="text" value="' + answer + '" id="' + this.selectAnswers + '">');
                }
                if (obj.operators.length > 0) {
                  obj.operators.forEach(function(element, index) {
                    selected = "";
                    if (visibility && visibility.operator === element) {
                      selected = 'selected="selected"';
                    }
                    selectOperators.push('<option value="' + element + '" ' + selected + '>' + element + '</option>');
                  });
                }
              }
            }, this));
            selectOperators.push('</select>');
            return {
              "answers": divAnswers,
              "operators": selectOperators,
              "visibility": visibility
            };
          },
          checkForExistingRules: function(id) {
            var dataStorage = new DataStorage();
            return dataStorage.searchForFieldId(id).properties.visibility;
          },
          enableEvents: function(el) {
            $(document).off('click', '#save-rule');
            $(document).on('click', '#save-rule', $.proxy(function() {
              var dataStorage = new DataStorage();
              dataStorage.updateField(el, "visibility", this.getVisibility());
            }, this));
            $(document).off('change', '#' + this.visibilityId);
            $(document).on('change', '#' + this.visibilityId, $.proxy(function(e) {
              var questionId = $(e.target).val();
              this.updateHTMLForAnswers(questionId);
            }, this));
          },
          getVisibility: function() {
            return {
              "id": $("#" + this.visibilityId).val(),
              "operator": $("#" + this.selectOperators).val(),
              "answer": $("#" + this.selectAnswers).val()
            };
          },
          getOperatorsAndAnswersFromJSON: function(field) {
            var obj = {};
            obj.type = field.type;
            obj.operators = [];
            obj.answers = [];
            switch (field.type) {
              case 'text':
                break;
              case 'textarea':
                break;
              case 'range':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                break;
              case 'checkbox':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                field.properties.options.forEach(function(v) {
                  obj.answers.push(v.value);
                });
                break;
              case 'radio':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                field.properties.options.forEach(function(v) {
                  obj.answers.push(v.value);
                });
                break;
              case 'select':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                field.properties.options.forEach(function(v) {
                  obj.answers.push(v.value);
                });
                break;
              case 'dtree':
                break;
              case 'image':
                break;
              case 'audio':
                break;
              case 'gps':
                break;
              case 'warning':
                break;
              case 'section':
                break;
            }
            return obj;
          },
          showVisibilityWindow: function(el) {
            var body = [];
            var footer = [];
            var id = "relate-modal";
            if ($("#" + id).length === 0) {
              body.push('<div class="row">');
              body.push('<div class="col-lg-4" id="' + this.divQuestion + '">');
              body.push('</div>');
              body.push('<div class="col-lg-4" id="' + this.divOperator + '">');
              body.push('</div>');
              body.push('<div class="col-lg-3" id="' + this.divAnswer + '">');
              body.push('</div>');
              body.push('<div class="col-lg-1" id="remove-button-div">');
              body.push('</div>');
              body.push('</div><br>');
              footer.push('<div class="modal-footer">');
              footer.push('<button type="button" class="btn btn-default"' + ' data-dismiss="modal">' + i18n.t("cancel") + '</button>');
              footer.push('<button type="button" class="btn btn-primary"' + ' id="save-rule" data-dismiss="modal">' + i18n.t("save") + '</button>');
              footer.push('</div');
              var options = {
                id: id,
                title: "Visibility Rules",
                body: body,
                footer: footer,
                size: ""
              };
              $("body").append(utils.makeModalWindow(options));
            }
            $("#" + id).modal("show");
            var questions = this.addQuestions(el);
            $("#" + this.divQuestion).html(questions.join(""));
            this.updateHTMLForAnswers(el);
            this.enableEvents(el);
          },
          updateHTMLForAnswers: function(questionId) {
            var operatorsAndAnswers = this.getRulesAndAnswers(questionId);
            $("#" + this.divAnswer).html(operatorsAndAnswers.answers.join(""));
            $("#" + this.divOperator).html(operatorsAndAnswers.operators.join(""));
            if (operatorsAndAnswers.visibility && operatorsAndAnswers.visibility !== "") {
              $("#" + this.visibilityId).val(operatorsAndAnswers.visibility.id);
            }
          }
        }, {});
      }();
      $__export('default', Visibility);
    }
  };
});

$__System.registerDynamic("15", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<div class="row">\n    <div class="col-md-4">\n        <input type="text" class="form-control" name="attribute-key" placeholder="Add a key value">\n    </div>\n    <div class="col-md-2">\n        ------------>\n    </div>\n    <div class="col-md-6">\n        <input type="text" class="form-control"name="attribute-value" placeholder="Add an attribute">\n    </div>\n</div>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("16", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<div class="dropdown add-button">\n  <button class="btn btn-default dropdown-toggle dropdownMenu" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">\n    Add\n    <span class="caret"></span>\n  </button>\n  <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">\n    ';
      for (var i = 0; i < data.length; i++) {
        __p += '\n      <li>\n        <a href="javascript:void(0);" class="add-field" data-toggle="tooltip" data-placement="right" title="' + ((__t = (data[i])) == null ? '' : __t) + '">\n          <span class="glyphicon icon-' + ((__t = (data[i])) == null ? '' : __t) + '" aria-hidden="true"></span>' + ((__t = (data[i])) == null ? '' : __t) + '\n        </a>\n      </li>\n    ';
      }
      __p += '\n  </ul>\n</div>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("17", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-section" id="' + ((__t = (fieldId)) == null ? '' : __t) + '" data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("section.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("section.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" placeholder="' + ((__t = (translate("section.placeholder"))) == null ? '' : __t) + '" value="' + ((__t = (label)) == null ? '' : __t) + '">\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("18", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-dtree" id="' + ((__t = (id)) == null ? '' : __t) + '"  data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("dtree.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("dtree.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (label)) == null ? '' : __t) + '">\n  <br>\n  ';
      if (typeof properties.filename !== 'undefined') {
        __p += '\n    <a href="' + ((__t = (url)) == null ? '' : __t) + '" target="blank" class="dtree-url">' + ((__t = (properties.filename)) == null ? '' : __t) + '</a>\n  ';
      } else {
        __p += '\n  <span class="btn btn-default btn-file">\n    Browse<input type="file" class="add-dtree" aria-label="' + ((__t = (translate("dtree.add-dtree"))) == null ? '' : __t) + '">\n  </span>\n  <span class="btn-filename"></span>\n  <button type="button" class="btn btn-default btn-sm upload-dtree" aria-label="' + ((__t = (translate("dtree.upload"))) == null ? '' : __t) + '">' + ((__t = (translate("dtree.upload"))) == null ? '' : __t) + '</button>\n  ';
      }
      __p += '\n  <br>\n  <button type="button" class="btn btn-default btn-sm relate" aria-label="' + ((__t = (translate("radio.relate"))) == null ? '' : __t) + '">' + ((__t = (translate("radio.relate"))) == null ? '' : __t) + '</button>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("19", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-warning" id="' + ((__t = (id)) == null ? '' : __t) + '" data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("warning.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("warning.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (label)) == null ? '' : __t) + '">\n  <label for="message">' + ((__t = (translate("warning.label"))) == null ? '' : __t) + '</label>\n  <textarea placeholder="' + ((__t = (translate("warning.message"))) == null ? '' : __t) + '">' + ((__t = (properties.placeholder)) == null ? '' : __t) + '</textarea>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1a", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-gps" id="' + ((__t = (fieldId)) == null ? '' : __t) + '"  data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("gps.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("gps.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (translate("gps.label"))) == null ? '' : __t) + '">\n  <input type="checkbox" name="required" ';
      check(required, "checked");
      __p += '>' + ((__t = (translate("gps.required"))) == null ? '' : __t) + '\n  <div class="form-inline">\n    <input type="checkbox" name="gps-background" ';
      check(properties.background, "checked");
      __p += '>' + ((__t = (translate("gps.background"))) == null ? '' : __t) + '\n  </div>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1b", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-audio" id="' + ((__t = (id)) == null ? '' : __t) + '" data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("audio.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("audio.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (label)) == null ? '' : __t) + '">\n  <label for="required">' + ((__t = (translate("audio.required"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="required" ' + ((__t = (check(required, "checked"))) == null ? '' : __t) + '>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1c", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-image" id="' + ((__t = (id)) == null ? '' : __t) + '" data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("image.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("image.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (label)) == null ? '' : __t) + '">\n  <label for="required">' + ((__t = (translate("image.required"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="required" ' + ((__t = (check(required, "checked"))) == null ? '' : __t) + '>\n  <div class="form-inline">\n    <label for="multi-image">' + ((__t = (translate("image.multiple-images"))) == null ? '' : __t) + '</label>\n    <input type="checkbox" name="multi-image" ' + ((__t = (check(properties["multi-image"], "checked"))) == null ? '' : __t) + '>\n  </div>\n  <div class="form-inline">\n    <label for="los">' + ((__t = (translate("image.los"))) == null ? '' : __t) + '</label>\n    <input type="checkbox" name="los" ' + ((__t = (check(properties.los, "checked"))) == null ? '' : __t) + '>\n  </div>\n  <div class="form-inline">\n    <label for="blur">' + ((__t = (translate("image.label-blur"))) == null ? '' : __t) + '</label>\n    <input type="number" name="blur" min="0" max="200" value="' + ((__t = (properties.blur)) == null ? '' : __t) + '"/>\n  </div>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1d", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-select" id="' + ((__t = (id)) == null ? '' : __t) + '" data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("select.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("select.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (label)) == null ? '' : __t) + '"> <br>\n  <label for="required">' + ((__t = (translate("select.required"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="required" ' + ((__t = (check(required, "checked"))) == null ? '' : __t) + '> <br>\n  <label for="persistent">' + ((__t = (translate("select.persistent"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="persistent" ' + ((__t = (check(persistent, "checked"))) == null ? '' : __t) + '>\n  <div class="options">\n    ';
      properties.options.forEach(function(item, key) {
        __p += '\n    <div class="form-inline">\n      <input type="text" value="' + ((__t = (item.value)) == null ? '' : __t) + '" name="' + ((__t = (id)) == null ? '' : __t) + '" id="' + ((__t = (id)) == null ? '' : __t) + '-' + ((__t = (increase(key))) == null ? '' : __t) + '" class="select">\n      <button type="button" class="btn btn-default btn-sm remove-select" aria-label="' + ((__t = (translate("select.remove"))) == null ? '' : __t) + '"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>\n    </div>\n    ';
      });
      __p += '\n  </div>\n  <button type="button" class="btn btn-default btn-sm add-select" aria-label="' + ((__t = (translate("select.add-option"))) == null ? '' : __t) + '"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1e", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-radio" id="' + ((__t = (id)) == null ? '' : __t) + '" data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("radio.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("radio.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value=\'' + ((__t = (label)) == null ? '' : __t) + '\'> <br>\n  <label for="required">' + ((__t = (translate("radio.required"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="required" ' + ((__t = (check(required, "checked"))) == null ? '' : __t) + '><br>\n  <label for="persistent">' + ((__t = (translate("radio.persistent"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="persistent" ' + ((__t = (check(persistent, "checked"))) == null ? '' : __t) + '><br>\n  <label for="other">' + ((__t = (translate("radio.allow-other"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="other" ' + ((__t = (check(properties.other, "checked"))) == null ? '' : __t) + '>\n  <div class="radios">\n  ';
      properties.options.forEach(function(item, key) {
        __p += '\n    <div class="form-inline">\n      ';
        if (item.image) {
          __p += '\n        ';
          if (properties.extraPath) {
            item.image.src = properties.extraPath + '/' + item.image.src;
          }
          __p += '\n        <img src="' + ((__t = (pcapi.buildUrl('editors', item.image.src))) == null ? '' : __t) + '" style="width: 50px;">\n        <button type="file" class="btn btn-default btn-sm upload-image" aria-label="' + ((__t = (translate("radio.upload"))) == null ? '' : __t) + '">\n          <span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>\n        </button>\n      ';
        }
        __p += '\n      <input type="text" value="' + ((__t = (item.value)) == null ? '' : __t) + '" name="' + ((__t = (id)) == null ? '' : __t) + '" id="' + ((__t = (id)) == null ? '' : __t) + '-' + ((__t = (increase(key))) == null ? '' : __t) + '" class="radio">\n      <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="' + ((__t = (translate("radio.remove"))) == null ? '' : __t) + '">\n        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>\n      </button>\n      <input type="file" class="image-upload" id="upload-' + ((__t = (id)) == null ? '' : __t) + '" style="display: none;">\n    </div>\n  ';
      });
      __p += '\n  </div>\n  <button type="button" class="btn btn-default btn-sm add-radio" aria-label="' + ((__t = (translate("radio.add-radio"))) == null ? '' : __t) + '"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>\n  <button type="button" class="btn btn-default btn-sm relate" aria-label="' + ((__t = (translate("radio.relate"))) == null ? '' : __t) + '">' + ((__t = (translate("radio.relate"))) == null ? '' : __t) + '</button>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("1f", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-checkbox" id="' + ((__t = (id)) == null ? '' : __t) + '"  data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("checkbox.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("checkbox.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value=\'' + ((__t = (label)) == null ? '' : __t) + '\'><br>\n  <label for="required">' + ((__t = (translate("checkbox.required"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="required" ' + ((__t = (check(required, "checked"))) == null ? '' : __t) + '><br>\n  <label for="persistent">' + ((__t = (translate("checkbox.persistent"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="persistent" ' + ((__t = (check(persistent, "checked"))) == null ? '' : __t) + '><br>\n  <label for="other">' + ((__t = (translate("checkbox.allow-other"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="other" ' + ((__t = (check(properties.other, "checked"))) == null ? '' : __t) + '>\n  <div class="checkboxes">\n  ';
      properties.options.forEach(function(item, key) {
        __p += '\n    <div class="form-inline">\n      ';
        if (item.image) {
          __p += '\n        ';
          if (properties.extraPath) {
            item.image.src = properties.extraPath + '/' + item.image.src;
          }
          __p += '\n        <img src="' + ((__t = (pcapi.buildUrl('editors', item.image.src))) == null ? '' : __t) + '" style="width: 50px;">\n        <button type="file" class="btn btn-default btn-sm upload-image" aria-label="' + ((__t = (translate("checkbox.upload"))) == null ? '' : __t) + '">\n          <span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span>\n        </button>\n      ';
        }
        __p += '\n      <input type="text" value="' + ((__t = (item.value)) == null ? '' : __t) + '" name="' + ((__t = (id)) == null ? '' : __t) + '" id="' + ((__t = (id)) == null ? '' : __t) + '-' + ((__t = (increase(key))) == null ? '' : __t) + '" class="checkbox">\n      <button type="button" class="btn btn-default btn-sm remove-checkbox" aria-label="' + ((__t = (translate("checkbox.remove"))) == null ? '' : __t) + '">\n        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>\n      </button>\n      <input type="file" class="image-upload" id="upload-' + ((__t = (id)) == null ? '' : __t) + '" style="display: none;">\n    </div>\n  ';
      });
      __p += '\n  </div>\n  <button type="button" class="btn btn-default btn-sm add-checkbox" aria-label="' + ((__t = (translate("checkbox.add-checkbox"))) == null ? '' : __t) + '">\n    <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>\n  </button>\n  <button type="button" class="btn btn-default btn-sm relate" aria-label="' + ((__t = (translate("checkbox.relate"))) == null ? '' : __t) + '">\n    ' + ((__t = (translate("checkbox.relate"))) == null ? '' : __t) + '\n  </button>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("20", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-range" id="' + ((__t = (id)) == null ? '' : __t) + '" data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("range.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("range.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (label)) == null ? '' : __t) + '">\n  <label for="required">' + ((__t = (translate("range.required"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="required" ' + ((__t = (check(required, "checked"))) == null ? '' : __t) + '> <br>\n  <label for="persistent">' + ((__t = (translate("range.persistent"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="persistent" ' + ((__t = (check(persistent, "checked"))) == null ? '' : __t) + '>\n  <label for="step">' + ((__t = (translate("range.step-label"))) == null ? '' : __t) + '</label>\n  <input type="number" name="step" value="' + ((__t = (properties.step)) == null ? '' : __t) + '">\n  <label for="min">' + ((__t = (translate("range.min-label"))) == null ? '' : __t) + '</label>\n  <input type="number" name="min" value="' + ((__t = (properties.min)) == null ? '' : __t) + '">\n  <label for="max">' + ((__t = (translate("range.max-label"))) == null ? '' : __t) + '</label>\n  <input type="number" name="max" value="' + ((__t = (properties.max)) == null ? '' : __t) + '">\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("21", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-textarea" id="' + ((__t = (id)) == null ? '' : __t) + '" data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("textarea.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("textarea.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (label)) == null ? '' : __t) + '">\n  <label for="required">' + ((__t = (translate("textarea.required"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="required" ' + ((__t = (check(required, "checked"))) == null ? '' : __t) + '>\n  <label for="placeholder">' + ((__t = (translate("textarea.default-text-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="placeholder" placeholder="' + ((__t = (translate("textarea.default-text"))) == null ? '' : __t) + '" value="' + ((__t = (properties.placeholder)) == null ? '' : __t) + '">\n  <label for="persistent">' + ((__t = (translate("textarea.persistent"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="persistent" ' + ((__t = (check(persistent, "checked"))) == null ? '' : __t) + '>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("22", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-text" id="' + ((__t = (id)) == null ? '' : __t) + '" data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("text.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("text.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (label)) == null ? '' : __t) + '">\n  <label for="required">' + ((__t = (translate("text.required"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="required" ' + ((__t = (check(required, "checked"))) == null ? '' : __t) + '>\n  <label for="header">' + ((__t = (translate("text.header"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="header" ' + ((__t = (check(header, "checked"))) == null ? '' : __t) + '>\n  <label for="prefix">' + ((__t = (translate("text.prefix-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="prefix" placeholder="' + ((__t = (translate("text.prefix"))) == null ? '' : __t) + '" value="' + ((__t = (properties.prefix)) == null ? '' : __t) + '">\n  <label for="persistent">' + ((__t = (translate("text.persistent"))) == null ? '' : __t) + '</label>\n  <input type="checkbox" name="persistent" ' + ((__t = (check(persistent, "checked"))) == null ? '' : __t) + '>' + ((__t = (translate("text.persistent"))) == null ? '' : __t) + '\n  <label for="placeholder">' + ((__t = (translate("text.default-text-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="placeholder" placeholder="' + ((__t = (translate("text.default-text"))) == null ? '' : __t) + '" value="' + ((__t = (properties.placeholder)) == null ? '' : __t) + '">\n  <label for="max-chars">' + ((__t = (translate("text.max-chars-title"))) == null ? '' : __t) + '</label>\n  <input type="number" name="max-chars" value="' + ((__t = (properties["max-chars"])) == null ? '' : __t) + '">\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("23", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<fieldset class="fieldcontain fieldcontain-general"  data-type="' + ((__t = (type)) == null ? '' : __t) + '">\n  <legend>' + ((__t = (translate("general.field-title"))) == null ? '' : __t) + '</legend>\n  <label for="label">' + ((__t = (translate("general.label-title"))) == null ? '' : __t) + '</label>\n  <input type="text" name="label" value="' + ((__t = (title)) == null ? '' : __t) + '">\n  <div class="control-group">\n    <label class="radio"><input type="checkbox" name="geometryType" ' + ((__t = (checkGeometries("point", geoms))) == null ? '' : __t) + ' value="' + ((__t = (translate("general.point-value"))) == null ? '' : __t) + '">' + ((__t = (translate("general.point-label"))) == null ? '' : __t) + '</label>\n    <label class="radio"><input type="checkbox" name="geometryType" ' + ((__t = (checkGeometries("line", geoms))) == null ? '' : __t) + ' value="' + ((__t = (translate("general.line-value"))) == null ? '' : __t) + '">' + ((__t = (translate("general.line-label"))) == null ? '' : __t) + '</label>\n    <label class="radio"><input type="checkbox" name="geometryType" ' + ((__t = (checkGeometries("polygon", geoms))) == null ? '' : __t) + ' value="' + ((__t = (translate("general.polygon-value"))) == null ? '' : __t) + '">' + ((__t = (translate("general.polygon-label"))) == null ? '' : __t) + '</label>\n    <label class="radio"><input type="checkbox" name="geometryType" ' + ((__t = (checkGeometries("box", geoms))) == null ? '' : __t) + ' value="' + ((__t = (translate("general.box-value"))) == null ? '' : __t) + '">' + ((__t = (translate("general.box-label"))) == null ? '' : __t) + '</label>\n  </div>\n  <button type="button" id="add-attribute" class="btn btn-default">' + ((__t = (translate("general.addAttribute"))) == null ? '' : __t) + '</button>\n  <div id="attributes">\n    ';
      if (typeof(extra) !== "undefined") {
        __p += '\n    ';
        extra.forEach(function(item, index) {
          __p += '\n    ';
          for (var key in item) {
            __p += '\n    <div class="row">\n        <div class="col-md-4">\n            <input type="text" class="form-control" name="attribute-key" placeholder="Add a key value" value="' + ((__t = (key)) == null ? '' : __t) + '">\n        </div>\n        <div class="col-md-2">\n            ------------>\n        </div>\n        <div class="col-md-6">\n            <input type="text" class="form-control"name="attribute-value" placeholder="Add an attribute" value="' + ((__t = (item[key])) == null ? '' : __t) + '">\n        </div>\n    </div>\n    ';
          }
          __p += '\n    ';
        });
        __p += '\n    ';
      }
      __p += '\n  </div>\n</fieldset>\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("24", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {
    "format global";
    (function(root) {
      if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement) {
          "use strict";
          if (this == null) {
            throw new TypeError();
          }
          var t = Object(this);
          var len = t.length >>> 0;
          if (len === 0) {
            return -1;
          }
          var n = 0;
          if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) {
              n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
              n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
          }
          if (n >= len) {
            return -1;
          }
          var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
          for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
              return k;
            }
          }
          return -1;
        };
      }
      if (!Array.prototype.lastIndexOf) {
        Array.prototype.lastIndexOf = function(searchElement) {
          "use strict";
          if (this == null) {
            throw new TypeError();
          }
          var t = Object(this);
          var len = t.length >>> 0;
          if (len === 0) {
            return -1;
          }
          var n = len;
          if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) {
              n = 0;
            } else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
              n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
          }
          var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);
          for (; k >= 0; k--) {
            if (k in t && t[k] === searchElement) {
              return k;
            }
          }
          return -1;
        };
      }
      if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
          return this.replace(/^\s+|\s+$/g, '');
        };
      }
      var $ = root.jQuery || root.Zepto,
          i18n = {},
          resStore = {},
          currentLng,
          replacementCounter = 0,
          languages = [],
          initialized = false,
          sync = {},
          conflictReference = null;
      if (typeof module !== 'undefined' && module.exports) {
        module.exports = i18n;
      } else {
        if ($) {
          $.i18n = $.i18n || i18n;
        }
        if (root.i18n) {
          conflictReference = root.i18n;
        }
        root.i18n = i18n;
      }
      sync = {
        load: function(lngs, options, cb) {
          if (options.useLocalStorage) {
            sync._loadLocal(lngs, options, function(err, store) {
              var missingLngs = [];
              for (var i = 0,
                  len = lngs.length; i < len; i++) {
                if (!store[lngs[i]])
                  missingLngs.push(lngs[i]);
              }
              if (missingLngs.length > 0) {
                sync._fetch(missingLngs, options, function(err, fetched) {
                  f.extend(store, fetched);
                  sync._storeLocal(fetched);
                  cb(err, store);
                });
              } else {
                cb(err, store);
              }
            });
          } else {
            sync._fetch(lngs, options, function(err, store) {
              cb(err, store);
            });
          }
        },
        _loadLocal: function(lngs, options, cb) {
          var store = {},
              nowMS = new Date().getTime();
          if (window.localStorage) {
            var todo = lngs.length;
            f.each(lngs, function(key, lng) {
              var local = f.localStorage.getItem('res_' + lng);
              if (local) {
                local = JSON.parse(local);
                if (local.i18nStamp && local.i18nStamp + options.localStorageExpirationTime > nowMS) {
                  store[lng] = local;
                }
              }
              todo--;
              if (todo === 0)
                cb(null, store);
            });
          }
        },
        _storeLocal: function(store) {
          if (window.localStorage) {
            for (var m in store) {
              store[m].i18nStamp = new Date().getTime();
              f.localStorage.setItem('res_' + m, JSON.stringify(store[m]));
            }
          }
          return;
        },
        _fetch: function(lngs, options, cb) {
          var ns = options.ns,
              store = {};
          if (!options.dynamicLoad) {
            var todo = ns.namespaces.length * lngs.length,
                errors;
            f.each(ns.namespaces, function(nsIndex, nsValue) {
              f.each(lngs, function(lngIndex, lngValue) {
                var loadComplete = function(err, data) {
                  if (err) {
                    errors = errors || [];
                    errors.push(err);
                  }
                  store[lngValue] = store[lngValue] || {};
                  store[lngValue][nsValue] = data;
                  todo--;
                  if (todo === 0)
                    cb(errors, store);
                };
                if (typeof options.customLoad == 'function') {
                  options.customLoad(lngValue, nsValue, options, loadComplete);
                } else {
                  sync._fetchOne(lngValue, nsValue, options, loadComplete);
                }
              });
            });
          } else {
            var loadComplete = function(err, data) {
              cb(err, data);
            };
            if (typeof options.customLoad == 'function') {
              options.customLoad(lngs, ns.namespaces, options, loadComplete);
            } else {
              var url = applyReplacement(options.resGetPath, {
                lng: lngs.join('+'),
                ns: ns.namespaces.join('+')
              });
              f.ajax({
                url: url,
                cache: options.cache,
                success: function(data, status, xhr) {
                  f.log('loaded: ' + url);
                  loadComplete(null, data);
                },
                error: function(xhr, status, error) {
                  f.log('failed loading: ' + url);
                  loadComplete('failed loading resource.json error: ' + error);
                },
                dataType: "json",
                async: options.getAsync,
                timeout: options.ajaxTimeout
              });
            }
          }
        },
        _fetchOne: function(lng, ns, options, done) {
          var url = applyReplacement(options.resGetPath, {
            lng: lng,
            ns: ns
          });
          f.ajax({
            url: url,
            cache: options.cache,
            success: function(data, status, xhr) {
              f.log('loaded: ' + url);
              done(null, data);
            },
            error: function(xhr, status, error) {
              if ((status && status == 200) || (xhr && xhr.status && xhr.status == 200)) {
                f.error('There is a typo in: ' + url);
              } else if ((status && status == 404) || (xhr && xhr.status && xhr.status == 404)) {
                f.log('Does not exist: ' + url);
              } else {
                var theStatus = status ? status : ((xhr && xhr.status) ? xhr.status : null);
                f.log(theStatus + ' when loading ' + url);
              }
              done(error, {});
            },
            dataType: "json",
            async: options.getAsync,
            timeout: options.ajaxTimeout,
            headers: options.headers
          });
        },
        postMissing: function(lng, ns, key, defaultValue, lngs) {
          var payload = {};
          payload[key] = defaultValue;
          var urls = [];
          if (o.sendMissingTo === 'fallback' && o.fallbackLng[0] !== false) {
            for (var i = 0; i < o.fallbackLng.length; i++) {
              urls.push({
                lng: o.fallbackLng[i],
                url: applyReplacement(o.resPostPath, {
                  lng: o.fallbackLng[i],
                  ns: ns
                })
              });
            }
          } else if (o.sendMissingTo === 'current' || (o.sendMissingTo === 'fallback' && o.fallbackLng[0] === false)) {
            urls.push({
              lng: lng,
              url: applyReplacement(o.resPostPath, {
                lng: lng,
                ns: ns
              })
            });
          } else if (o.sendMissingTo === 'all') {
            for (var i = 0,
                l = lngs.length; i < l; i++) {
              urls.push({
                lng: lngs[i],
                url: applyReplacement(o.resPostPath, {
                  lng: lngs[i],
                  ns: ns
                })
              });
            }
          }
          for (var y = 0,
              len = urls.length; y < len; y++) {
            var item = urls[y];
            f.ajax({
              url: item.url,
              type: o.sendType,
              data: payload,
              success: function(data, status, xhr) {
                f.log('posted missing key \'' + key + '\' to: ' + item.url);
                var keys = key.split('.');
                var x = 0;
                var value = resStore[item.lng][ns];
                while (keys[x]) {
                  if (x === keys.length - 1) {
                    value = value[keys[x]] = defaultValue;
                  } else {
                    value = value[keys[x]] = value[keys[x]] || {};
                  }
                  x++;
                }
              },
              error: function(xhr, status, error) {
                f.log('failed posting missing key \'' + key + '\' to: ' + item.url);
              },
              dataType: "json",
              async: o.postAsync,
              timeout: o.ajaxTimeout
            });
          }
        },
        reload: reload
      };
      var o = {
        lng: undefined,
        load: 'all',
        preload: [],
        lowerCaseLng: false,
        returnObjectTrees: false,
        fallbackLng: ['dev'],
        fallbackNS: [],
        detectLngQS: 'setLng',
        detectLngFromLocalStorage: false,
        ns: {
          namespaces: ['translation'],
          defaultNs: 'translation'
        },
        fallbackOnNull: true,
        fallbackOnEmpty: false,
        fallbackToDefaultNS: false,
        showKeyIfEmpty: false,
        nsseparator: ':',
        keyseparator: '.',
        selectorAttr: 'data-i18n',
        debug: false,
        resGetPath: 'locales/__lng__/__ns__.json',
        resPostPath: 'locales/add/__lng__/__ns__',
        getAsync: true,
        postAsync: true,
        resStore: undefined,
        useLocalStorage: false,
        localStorageExpirationTime: 7 * 24 * 60 * 60 * 1000,
        dynamicLoad: false,
        sendMissing: false,
        sendMissingTo: 'fallback',
        sendType: 'POST',
        interpolationPrefix: '__',
        interpolationSuffix: '__',
        defaultVariables: false,
        reusePrefix: '$t(',
        reuseSuffix: ')',
        pluralSuffix: '_plural',
        pluralNotFound: ['plural_not_found', Math.random()].join(''),
        contextNotFound: ['context_not_found', Math.random()].join(''),
        escapeInterpolation: false,
        indefiniteSuffix: '_indefinite',
        indefiniteNotFound: ['indefinite_not_found', Math.random()].join(''),
        setJqueryExt: true,
        defaultValueFromContent: true,
        useDataAttrOptions: false,
        cookieExpirationTime: undefined,
        useCookie: true,
        cookieName: 'i18next',
        cookieDomain: undefined,
        objectTreeKeyHandler: undefined,
        postProcess: undefined,
        parseMissingKey: undefined,
        missingKeyHandler: sync.postMissing,
        ajaxTimeout: 0,
        shortcutFunction: 'sprintf'
      };
      function _extend(target, source) {
        if (!source || typeof source === 'function') {
          return target;
        }
        for (var attr in source) {
          target[attr] = source[attr];
        }
        return target;
      }
      function _deepExtend(target, source, overwrite) {
        for (var prop in source)
          if (prop in target) {
            if (typeof target[prop] === 'string' || target[prop] instanceof String || typeof source[prop] === 'string' || source[prop] instanceof String) {
              if (overwrite) {
                target[prop] = source[prop];
              }
            } else {
              _deepExtend(target[prop], source[prop], overwrite);
            }
          } else {
            target[prop] = source[prop];
          }
        return target;
      }
      function _each(object, callback, args) {
        var name,
            i = 0,
            length = object.length,
            isObj = length === undefined || Object.prototype.toString.apply(object) !== '[object Array]' || typeof object === "function";
        if (args) {
          if (isObj) {
            for (name in object) {
              if (callback.apply(object[name], args) === false) {
                break;
              }
            }
          } else {
            for (; i < length; ) {
              if (callback.apply(object[i++], args) === false) {
                break;
              }
            }
          }
        } else {
          if (isObj) {
            for (name in object) {
              if (callback.call(object[name], name, object[name]) === false) {
                break;
              }
            }
          } else {
            for (; i < length; ) {
              if (callback.call(object[i], i, object[i++]) === false) {
                break;
              }
            }
          }
        }
        return object;
      }
      var _entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      };
      function _escape(data) {
        if (typeof data === 'string') {
          return data.replace(/[&<>"'\/]/g, function(s) {
            return _entityMap[s];
          });
        } else {
          return data;
        }
      }
      function _ajax(options) {
        var getXhr = function(callback) {
          if (window.XMLHttpRequest) {
            return callback(null, new XMLHttpRequest());
          } else if (window.ActiveXObject) {
            try {
              return callback(null, new ActiveXObject("Msxml2.XMLHTTP"));
            } catch (e) {
              return callback(null, new ActiveXObject("Microsoft.XMLHTTP"));
            }
          }
          return callback(new Error());
        };
        var encodeUsingUrlEncoding = function(data) {
          if (typeof data === 'string') {
            return data;
          }
          var result = [];
          for (var dataItem in data) {
            if (data.hasOwnProperty(dataItem)) {
              result.push(encodeURIComponent(dataItem) + '=' + encodeURIComponent(data[dataItem]));
            }
          }
          return result.join('&');
        };
        var utf8 = function(text) {
          text = text.replace(/\r\n/g, '\n');
          var result = '';
          for (var i = 0; i < text.length; i++) {
            var c = text.charCodeAt(i);
            if (c < 128) {
              result += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
              result += String.fromCharCode((c >> 6) | 192);
              result += String.fromCharCode((c & 63) | 128);
            } else {
              result += String.fromCharCode((c >> 12) | 224);
              result += String.fromCharCode(((c >> 6) & 63) | 128);
              result += String.fromCharCode((c & 63) | 128);
            }
          }
          return result;
        };
        var base64 = function(text) {
          var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
          text = utf8(text);
          var result = '',
              chr1,
              chr2,
              chr3,
              enc1,
              enc2,
              enc3,
              enc4,
              i = 0;
          do {
            chr1 = text.charCodeAt(i++);
            chr2 = text.charCodeAt(i++);
            chr3 = text.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
              enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
              enc4 = 64;
            }
            result += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = '';
            enc1 = enc2 = enc3 = enc4 = '';
          } while (i < text.length);
          return result;
        };
        var mergeHeaders = function() {
          var result = arguments[0];
          for (var i = 1; i < arguments.length; i++) {
            var currentHeaders = arguments[i];
            for (var header in currentHeaders) {
              if (currentHeaders.hasOwnProperty(header)) {
                result[header] = currentHeaders[header];
              }
            }
          }
          return result;
        };
        var ajax = function(method, url, options, callback) {
          if (typeof options === 'function') {
            callback = options;
            options = {};
          }
          options.cache = options.cache || false;
          options.data = options.data || {};
          options.headers = options.headers || {};
          options.jsonp = options.jsonp || false;
          options.async = options.async === undefined ? true : options.async;
          var headers = mergeHeaders({
            'accept': '*/*',
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }, ajax.headers, options.headers);
          var payload;
          if (headers['content-type'] === 'application/json') {
            payload = JSON.stringify(options.data);
          } else {
            payload = encodeUsingUrlEncoding(options.data);
          }
          if (method === 'GET') {
            var queryString = [];
            if (payload) {
              queryString.push(payload);
              payload = null;
            }
            if (!options.cache) {
              queryString.push('_=' + (new Date()).getTime());
            }
            if (options.jsonp) {
              queryString.push('callback=' + options.jsonp);
              queryString.push('jsonp=' + options.jsonp);
            }
            queryString = queryString.join('&');
            if (queryString.length > 1) {
              if (url.indexOf('?') > -1) {
                url += '&' + queryString;
              } else {
                url += '?' + queryString;
              }
            }
            if (options.jsonp) {
              var head = document.getElementsByTagName('head')[0];
              var script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = url;
              head.appendChild(script);
              return;
            }
          }
          getXhr(function(err, xhr) {
            if (err)
              return callback(err);
            xhr.open(method, url, options.async);
            for (var header in headers) {
              if (headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, headers[header]);
              }
            }
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                var data = xhr.responseText || '';
                if (!callback) {
                  return;
                }
                callback(xhr.status, {
                  text: function() {
                    return data;
                  },
                  json: function() {
                    try {
                      return JSON.parse(data);
                    } catch (e) {
                      f.error('Can not parse JSON. URL: ' + url);
                      return {};
                    }
                  }
                });
              }
            };
            xhr.send(payload);
          });
        };
        var http = {
          authBasic: function(username, password) {
            ajax.headers['Authorization'] = 'Basic ' + base64(username + ':' + password);
          },
          connect: function(url, options, callback) {
            return ajax('CONNECT', url, options, callback);
          },
          del: function(url, options, callback) {
            return ajax('DELETE', url, options, callback);
          },
          get: function(url, options, callback) {
            return ajax('GET', url, options, callback);
          },
          head: function(url, options, callback) {
            return ajax('HEAD', url, options, callback);
          },
          headers: function(headers) {
            ajax.headers = headers || {};
          },
          isAllowed: function(url, verb, callback) {
            this.options(url, function(status, data) {
              callback(data.text().indexOf(verb) !== -1);
            });
          },
          options: function(url, options, callback) {
            return ajax('OPTIONS', url, options, callback);
          },
          patch: function(url, options, callback) {
            return ajax('PATCH', url, options, callback);
          },
          post: function(url, options, callback) {
            return ajax('POST', url, options, callback);
          },
          put: function(url, options, callback) {
            return ajax('PUT', url, options, callback);
          },
          trace: function(url, options, callback) {
            return ajax('TRACE', url, options, callback);
          }
        };
        var methode = options.type ? options.type.toLowerCase() : 'get';
        http[methode](options.url, options, function(status, data) {
          if (status === 200 || (status === 0 && data.text())) {
            options.success(data.json(), status, null);
          } else {
            options.error(data.text(), status, null);
          }
        });
      }
      var _cookie = {
        create: function(name, value, minutes, domain) {
          var expires;
          if (minutes) {
            var date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
          } else
            expires = "";
          domain = (domain) ? "domain=" + domain + ";" : "";
          document.cookie = name + "=" + value + expires + ";" + domain + "path=/";
        },
        read: function(name) {
          var nameEQ = name + "=";
          var ca = document.cookie.split(';');
          for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
              c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0)
              return c.substring(nameEQ.length, c.length);
          }
          return null;
        },
        remove: function(name) {
          this.create(name, "", -1);
        }
      };
      var cookie_noop = {
        create: function(name, value, minutes, domain) {},
        read: function(name) {
          return null;
        },
        remove: function(name) {}
      };
      var f = {
        extend: $ ? $.extend : _extend,
        deepExtend: _deepExtend,
        each: $ ? $.each : _each,
        ajax: $ ? $.ajax : (typeof document !== 'undefined' ? _ajax : function() {}),
        cookie: typeof document !== 'undefined' ? _cookie : cookie_noop,
        detectLanguage: detectLanguage,
        escape: _escape,
        log: function(str) {
          if (o.debug && typeof console !== "undefined")
            console.log(str);
        },
        error: function(str) {
          if (typeof console !== "undefined")
            console.error(str);
        },
        getCountyIndexOfLng: function(lng) {
          var lng_index = 0;
          if (lng === 'nb-NO' || lng === 'nn-NO' || lng === 'nb-no' || lng === 'nn-no')
            lng_index = 1;
          return lng_index;
        },
        toLanguages: function(lng, fallbackLng) {
          var log = this.log;
          fallbackLng = fallbackLng || o.fallbackLng;
          if (typeof fallbackLng === 'string')
            fallbackLng = [fallbackLng];
          function applyCase(l) {
            var ret = l;
            if (typeof l === 'string' && l.indexOf('-') > -1) {
              var parts = l.split('-');
              ret = o.lowerCaseLng ? parts[0].toLowerCase() + '-' + parts[1].toLowerCase() : parts[0].toLowerCase() + '-' + parts[1].toUpperCase();
            } else {
              ret = o.lowerCaseLng ? l.toLowerCase() : l;
            }
            return ret;
          }
          var languages = [];
          var whitelist = o.lngWhitelist || false;
          var addLanguage = function(language) {
            if (!whitelist || whitelist.indexOf(language) > -1) {
              languages.push(language);
            } else {
              log('rejecting non-whitelisted language: ' + language);
            }
          };
          if (typeof lng === 'string' && lng.indexOf('-') > -1) {
            var parts = lng.split('-');
            if (o.load !== 'unspecific')
              addLanguage(applyCase(lng));
            if (o.load !== 'current')
              addLanguage(applyCase(parts[this.getCountyIndexOfLng(lng)]));
          } else {
            addLanguage(applyCase(lng));
          }
          for (var i = 0; i < fallbackLng.length; i++) {
            if (languages.indexOf(fallbackLng[i]) === -1 && fallbackLng[i])
              languages.push(applyCase(fallbackLng[i]));
          }
          return languages;
        },
        regexEscape: function(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        regexReplacementEscape: function(strOrFn) {
          if (typeof strOrFn === 'string') {
            return strOrFn.replace(/\$/g, "$$$$");
          } else {
            return strOrFn;
          }
        },
        localStorage: {
          setItem: function(key, value) {
            if (window.localStorage) {
              try {
                window.localStorage.setItem(key, value);
              } catch (e) {
                f.log('failed to set value for key "' + key + '" to localStorage.');
              }
            }
          },
          getItem: function(key, value) {
            if (window.localStorage) {
              try {
                return window.localStorage.getItem(key, value);
              } catch (e) {
                f.log('failed to get value for key "' + key + '" from localStorage.');
                return undefined;
              }
            }
          }
        }
      };
      function init(options, cb) {
        if (typeof options === 'function') {
          cb = options;
          options = {};
        }
        options = options || {};
        f.extend(o, options);
        delete o.fixLng;
        if (o.functions) {
          delete o.functions;
          f.extend(f, options.functions);
        }
        if (typeof o.ns == 'string') {
          o.ns = {
            namespaces: [o.ns],
            defaultNs: o.ns
          };
        }
        if (typeof o.fallbackNS == 'string') {
          o.fallbackNS = [o.fallbackNS];
        }
        if (typeof o.fallbackLng == 'string' || typeof o.fallbackLng == 'boolean') {
          o.fallbackLng = [o.fallbackLng];
        }
        o.interpolationPrefixEscaped = f.regexEscape(o.interpolationPrefix);
        o.interpolationSuffixEscaped = f.regexEscape(o.interpolationSuffix);
        if (!o.lng)
          o.lng = f.detectLanguage();
        languages = f.toLanguages(o.lng);
        currentLng = languages[0];
        f.log('currentLng set to: ' + currentLng);
        if (o.useCookie && f.cookie.read(o.cookieName) !== currentLng) {
          f.cookie.create(o.cookieName, currentLng, o.cookieExpirationTime, o.cookieDomain);
        }
        if (o.detectLngFromLocalStorage && typeof document !== 'undefined' && window.localStorage) {
          f.localStorage.setItem('i18next_lng', currentLng);
        }
        var lngTranslate = translate;
        if (options.fixLng) {
          lngTranslate = function(key, options) {
            options = options || {};
            options.lng = options.lng || lngTranslate.lng;
            return translate(key, options);
          };
          lngTranslate.lng = currentLng;
        }
        pluralExtensions.setCurrentLng(currentLng);
        if ($ && o.setJqueryExt) {
          addJqueryFunct && addJqueryFunct();
        } else {
          addJqueryLikeFunctionality && addJqueryLikeFunctionality();
        }
        var deferred;
        if ($ && $.Deferred) {
          deferred = $.Deferred();
        }
        if (o.resStore) {
          resStore = o.resStore;
          initialized = true;
          if (cb)
            cb(null, lngTranslate);
          if (deferred)
            deferred.resolve(lngTranslate);
          if (deferred)
            return deferred.promise();
          return;
        }
        var lngsToLoad = f.toLanguages(o.lng);
        if (typeof o.preload === 'string')
          o.preload = [o.preload];
        for (var i = 0,
            l = o.preload.length; i < l; i++) {
          var pres = f.toLanguages(o.preload[i]);
          for (var y = 0,
              len = pres.length; y < len; y++) {
            if (lngsToLoad.indexOf(pres[y]) < 0) {
              lngsToLoad.push(pres[y]);
            }
          }
        }
        i18n.sync.load(lngsToLoad, o, function(err, store) {
          resStore = store;
          initialized = true;
          if (cb)
            cb(err, lngTranslate);
          if (deferred)
            (!err ? deferred.resolve : deferred.reject)(err || lngTranslate);
        });
        if (deferred)
          return deferred.promise();
      }
      function isInitialized() {
        return initialized;
      }
      function preload(lngs, cb) {
        if (typeof lngs === 'string')
          lngs = [lngs];
        for (var i = 0,
            l = lngs.length; i < l; i++) {
          if (o.preload.indexOf(lngs[i]) < 0) {
            o.preload.push(lngs[i]);
          }
        }
        return init(cb);
      }
      function addResourceBundle(lng, ns, resources, deep, overwrite) {
        if (typeof ns !== 'string') {
          resources = ns;
          ns = o.ns.defaultNs;
        } else if (o.ns.namespaces.indexOf(ns) < 0) {
          o.ns.namespaces.push(ns);
        }
        resStore[lng] = resStore[lng] || {};
        resStore[lng][ns] = resStore[lng][ns] || {};
        if (deep) {
          f.deepExtend(resStore[lng][ns], resources, overwrite);
        } else {
          f.extend(resStore[lng][ns], resources);
        }
        if (o.useLocalStorage) {
          sync._storeLocal(resStore);
        }
      }
      function hasResourceBundle(lng, ns) {
        if (typeof ns !== 'string') {
          ns = o.ns.defaultNs;
        }
        resStore[lng] = resStore[lng] || {};
        var res = resStore[lng][ns] || {};
        var hasValues = false;
        for (var prop in res) {
          if (res.hasOwnProperty(prop)) {
            hasValues = true;
          }
        }
        return hasValues;
      }
      function getResourceBundle(lng, ns) {
        if (typeof ns !== 'string') {
          ns = o.ns.defaultNs;
        }
        resStore[lng] = resStore[lng] || {};
        return f.extend({}, resStore[lng][ns]);
      }
      function removeResourceBundle(lng, ns) {
        if (typeof ns !== 'string') {
          ns = o.ns.defaultNs;
        }
        resStore[lng] = resStore[lng] || {};
        resStore[lng][ns] = {};
        if (o.useLocalStorage) {
          sync._storeLocal(resStore);
        }
      }
      function addResource(lng, ns, key, value) {
        if (typeof ns !== 'string') {
          resource = ns;
          ns = o.ns.defaultNs;
        } else if (o.ns.namespaces.indexOf(ns) < 0) {
          o.ns.namespaces.push(ns);
        }
        resStore[lng] = resStore[lng] || {};
        resStore[lng][ns] = resStore[lng][ns] || {};
        var keys = key.split(o.keyseparator);
        var x = 0;
        var node = resStore[lng][ns];
        var origRef = node;
        while (keys[x]) {
          if (x == keys.length - 1)
            node[keys[x]] = value;
          else {
            if (node[keys[x]] == null)
              node[keys[x]] = {};
            node = node[keys[x]];
          }
          x++;
        }
        if (o.useLocalStorage) {
          sync._storeLocal(resStore);
        }
      }
      function addResources(lng, ns, resources) {
        if (typeof ns !== 'string') {
          resources = ns;
          ns = o.ns.defaultNs;
        } else if (o.ns.namespaces.indexOf(ns) < 0) {
          o.ns.namespaces.push(ns);
        }
        for (var m in resources) {
          if (typeof resources[m] === 'string')
            addResource(lng, ns, m, resources[m]);
        }
      }
      function setDefaultNamespace(ns) {
        o.ns.defaultNs = ns;
      }
      function loadNamespace(namespace, cb) {
        loadNamespaces([namespace], cb);
      }
      function loadNamespaces(namespaces, cb) {
        var opts = {
          dynamicLoad: o.dynamicLoad,
          resGetPath: o.resGetPath,
          getAsync: o.getAsync,
          customLoad: o.customLoad,
          ns: {
            namespaces: namespaces,
            defaultNs: ''
          }
        };
        var lngsToLoad = f.toLanguages(o.lng);
        if (typeof o.preload === 'string')
          o.preload = [o.preload];
        for (var i = 0,
            l = o.preload.length; i < l; i++) {
          var pres = f.toLanguages(o.preload[i]);
          for (var y = 0,
              len = pres.length; y < len; y++) {
            if (lngsToLoad.indexOf(pres[y]) < 0) {
              lngsToLoad.push(pres[y]);
            }
          }
        }
        var lngNeedLoad = [];
        for (var a = 0,
            lenA = lngsToLoad.length; a < lenA; a++) {
          var needLoad = false;
          var resSet = resStore[lngsToLoad[a]];
          if (resSet) {
            for (var b = 0,
                lenB = namespaces.length; b < lenB; b++) {
              if (!resSet[namespaces[b]])
                needLoad = true;
            }
          } else {
            needLoad = true;
          }
          if (needLoad)
            lngNeedLoad.push(lngsToLoad[a]);
        }
        if (lngNeedLoad.length) {
          i18n.sync._fetch(lngNeedLoad, opts, function(err, store) {
            var todo = namespaces.length * lngNeedLoad.length;
            f.each(namespaces, function(nsIndex, nsValue) {
              if (o.ns.namespaces.indexOf(nsValue) < 0) {
                o.ns.namespaces.push(nsValue);
              }
              f.each(lngNeedLoad, function(lngIndex, lngValue) {
                resStore[lngValue] = resStore[lngValue] || {};
                resStore[lngValue][nsValue] = store[lngValue][nsValue];
                todo--;
                if (todo === 0 && cb) {
                  if (o.useLocalStorage)
                    i18n.sync._storeLocal(resStore);
                  cb();
                }
              });
            });
          });
        } else {
          if (cb)
            cb();
        }
      }
      function setLng(lng, options, cb) {
        if (typeof options === 'function') {
          cb = options;
          options = {};
        } else if (!options) {
          options = {};
        }
        options.lng = lng;
        return init(options, cb);
      }
      function lng() {
        return currentLng;
      }
      function dir() {
        var rtlLangs = ["ar", "shu", "sqr", "ssh", "xaa", "yhd", "yud", "aao", "abh", "abv", "acm", "acq", "acw", "acx", "acy", "adf", "ads", "aeb", "aec", "afb", "ajp", "apc", "apd", "arb", "arq", "ars", "ary", "arz", "auz", "avl", "ayh", "ayl", "ayn", "ayp", "bbz", "pga", "he", "iw", "ps", "pbt", "pbu", "pst", "prp", "prd", "ur", "ydd", "yds", "yih", "ji", "yi", "hbo", "men", "xmn", "fa", "jpr", "peo", "pes", "prs", "dv", "sam"];
        if (rtlLangs.some(function(lang) {
          return new RegExp('^' + lang).test(currentLng);
        })) {
          return 'rtl';
        }
        return 'ltr';
      }
      function reload(cb) {
        resStore = {};
        setLng(currentLng, cb);
      }
      function noConflict() {
        window.i18next = window.i18n;
        if (conflictReference) {
          window.i18n = conflictReference;
        } else {
          delete window.i18n;
        }
      }
      function addJqueryFunct() {
        $.t = $.t || translate;
        function parse(ele, key, options) {
          if (key.length === 0)
            return;
          var attr = 'text';
          if (key.indexOf('[') === 0) {
            var parts = key.split(']');
            key = parts[1];
            attr = parts[0].substr(1, parts[0].length - 1);
          }
          if (key.indexOf(';') === key.length - 1) {
            key = key.substr(0, key.length - 2);
          }
          var optionsToUse;
          if (attr === 'html') {
            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.html()}, options) : options;
            ele.html($.t(key, optionsToUse));
          } else if (attr === 'text') {
            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.text()}, options) : options;
            ele.text($.t(key, optionsToUse));
          } else if (attr === 'prepend') {
            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.html()}, options) : options;
            ele.prepend($.t(key, optionsToUse));
          } else if (attr === 'append') {
            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.html()}, options) : options;
            ele.append($.t(key, optionsToUse));
          } else if (attr.indexOf("data-") === 0) {
            var dataAttr = attr.substr(("data-").length);
            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.data(dataAttr)}, options) : options;
            var translated = $.t(key, optionsToUse);
            ele.data(dataAttr, translated);
            ele.attr(attr, translated);
          } else {
            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.attr(attr)}, options) : options;
            ele.attr(attr, $.t(key, optionsToUse));
          }
        }
        function localize(ele, options) {
          var key = ele.attr(o.selectorAttr);
          if (!key && typeof key !== 'undefined' && key !== false)
            key = ele.text() || ele.val();
          if (!key)
            return;
          var target = ele,
              targetSelector = ele.data("i18n-target");
          if (targetSelector) {
            target = ele.find(targetSelector) || ele;
          }
          if (!options && o.useDataAttrOptions === true) {
            options = ele.data("i18n-options");
          }
          options = options || {};
          if (key.indexOf(';') >= 0) {
            var keys = key.split(';');
            $.each(keys, function(m, k) {
              if (k !== '')
                parse(target, k, options);
            });
          } else {
            parse(target, key, options);
          }
          if (o.useDataAttrOptions === true) {
            var clone = $.extend({
              lng: 'non',
              lngs: [],
              _origLng: 'non'
            }, options);
            delete clone.lng;
            delete clone.lngs;
            delete clone._origLng;
            ele.data("i18n-options", clone);
          }
        }
        $.fn.i18n = function(options) {
          return this.each(function() {
            localize($(this), options);
            var elements = $(this).find('[' + o.selectorAttr + ']');
            elements.each(function() {
              localize($(this), options);
            });
          });
        };
      }
      function addJqueryLikeFunctionality() {
        function parse(ele, key, options) {
          if (key.length === 0)
            return;
          var attr = 'text';
          if (key.indexOf('[') === 0) {
            var parts = key.split(']');
            key = parts[1];
            attr = parts[0].substr(1, parts[0].length - 1);
          }
          if (key.indexOf(';') === key.length - 1) {
            key = key.substr(0, key.length - 2);
          }
          if (attr === 'html') {
            ele.innerHTML = translate(key, options);
          } else if (attr === 'text') {
            ele.textContent = translate(key, options);
          } else if (attr === 'prepend') {
            ele.insertAdjacentHTML(translate(key, options), 'afterbegin');
          } else if (attr === 'append') {
            ele.insertAdjacentHTML(translate(key, options), 'beforeend');
          } else {
            ele.setAttribute(attr, translate(key, options));
          }
        }
        function localize(ele, options) {
          var key = ele.getAttribute(o.selectorAttr);
          if (!key && typeof key !== 'undefined' && key !== false)
            key = ele.textContent || ele.value;
          if (!key)
            return;
          var target = ele,
              targetSelector = ele.getAttribute("i18n-target");
          if (targetSelector) {
            target = ele.querySelector(targetSelector) || ele;
          }
          if (key.indexOf(';') >= 0) {
            var keys = key.split(';'),
                index = 0,
                length = keys.length;
            for (; index < length; index++) {
              if (keys[index] !== '')
                parse(target, keys[index], options);
            }
          } else {
            parse(target, key, options);
          }
        }
        i18n.translateObject = function(object, options) {
          var elements = object.querySelectorAll('[' + o.selectorAttr + ']');
          var index = 0,
              length = elements.length;
          for (; index < length; index++) {
            localize(elements[index], options);
          }
        };
      }
      function applyReplacement(str, replacementHash, nestedKey, options) {
        if (!str)
          return str;
        options = options || replacementHash;
        if (str.indexOf(options.interpolationPrefix || o.interpolationPrefix) < 0)
          return str;
        var prefix = options.interpolationPrefix ? f.regexEscape(options.interpolationPrefix) : o.interpolationPrefixEscaped,
            suffix = options.interpolationSuffix ? f.regexEscape(options.interpolationSuffix) : o.interpolationSuffixEscaped,
            keyseparator = options.keyseparator || o.keyseparator,
            unEscapingSuffix = 'HTML' + suffix;
        var hash = replacementHash.replace && typeof replacementHash.replace === 'object' ? replacementHash.replace : replacementHash;
        var replacementRegex = new RegExp([prefix, '(.+?)', '(HTML)?', suffix].join(''), 'g');
        var escapeInterpolation = options.escapeInterpolation || o.escapeInterpolation;
        return str.replace(replacementRegex, function(wholeMatch, keyMatch, htmlMatched) {
          var objectMatching = hash;
          var keyLeaf = keyMatch;
          while (keyLeaf.indexOf(keyseparator) >= 0 && typeof objectMatching === 'object' && objectMatching) {
            var propName = keyLeaf.slice(0, keyLeaf.indexOf(keyseparator));
            keyLeaf = keyLeaf.slice(keyLeaf.indexOf(keyseparator) + 1);
            objectMatching = objectMatching[propName];
          }
          if (objectMatching && typeof objectMatching === 'object' && objectMatching.hasOwnProperty(keyLeaf)) {
            var value = objectMatching[keyLeaf];
            if (escapeInterpolation && !htmlMatched) {
              return f.escape(objectMatching[keyLeaf]);
            } else {
              return objectMatching[keyLeaf];
            }
          } else {
            return wholeMatch;
          }
        });
      }
      f.applyReplacement = applyReplacement;
      function applyReuse(translated, options) {
        var comma = ',';
        var options_open = '{';
        var options_close = '}';
        var opts = f.extend({}, options);
        delete opts.postProcess;
        delete opts.isFallbackLookup;
        while (translated.indexOf(o.reusePrefix) != -1) {
          replacementCounter++;
          if (replacementCounter > o.maxRecursion) {
            break;
          }
          var index_of_opening = translated.lastIndexOf(o.reusePrefix);
          var index_of_end_of_closing = translated.indexOf(o.reuseSuffix, index_of_opening) + o.reuseSuffix.length;
          var token = translated.substring(index_of_opening, index_of_end_of_closing);
          var token_without_symbols = token.replace(o.reusePrefix, '').replace(o.reuseSuffix, '');
          if (index_of_end_of_closing <= index_of_opening) {
            f.error('there is an missing closing in following translation value', translated);
            return '';
          }
          if (token_without_symbols.indexOf(comma) != -1) {
            var index_of_token_end_of_closing = token_without_symbols.indexOf(comma);
            if (token_without_symbols.indexOf(options_open, index_of_token_end_of_closing) != -1 && token_without_symbols.indexOf(options_close, index_of_token_end_of_closing) != -1) {
              var index_of_opts_opening = token_without_symbols.indexOf(options_open, index_of_token_end_of_closing);
              var index_of_opts_end_of_closing = token_without_symbols.indexOf(options_close, index_of_opts_opening) + options_close.length;
              try {
                opts = f.extend(opts, JSON.parse(token_without_symbols.substring(index_of_opts_opening, index_of_opts_end_of_closing)));
                token_without_symbols = token_without_symbols.substring(0, index_of_token_end_of_closing);
              } catch (e) {}
            }
          }
          var translated_token = _translate(token_without_symbols, opts);
          translated = translated.replace(token, f.regexReplacementEscape(translated_token));
        }
        return translated;
      }
      function hasContext(options) {
        return (options.context && (typeof options.context == 'string' || typeof options.context == 'number'));
      }
      function needsPlural(options, lng) {
        return (options.count !== undefined && typeof options.count != 'string');
      }
      function needsIndefiniteArticle(options) {
        return (options.indefinite_article !== undefined && typeof options.indefinite_article != 'string' && options.indefinite_article);
      }
      function exists(key, options) {
        options = options || {};
        var notFound = _getDefaultValue(key, options),
            found = _find(key, options);
        return found !== undefined || found === notFound;
      }
      function translate(key, options) {
        if (!initialized) {
          f.log('i18next not finished initialization. you might have called t function before loading resources finished.');
          if (options && options.defaultValue) {
            return options.detaultValue;
          } else {
            return '';
          }
        }
        ;
        replacementCounter = 0;
        return _translate.apply(null, arguments);
      }
      function _getDefaultValue(key, options) {
        return (options.defaultValue !== undefined) ? options.defaultValue : key;
      }
      function _injectSprintfProcessor() {
        var values = [];
        for (var i = 1; i < arguments.length; i++) {
          values.push(arguments[i]);
        }
        return {
          postProcess: 'sprintf',
          sprintf: values
        };
      }
      function _translate(potentialKeys, options) {
        if (typeof options !== 'undefined' && typeof options !== 'object') {
          if (o.shortcutFunction === 'sprintf') {
            options = _injectSprintfProcessor.apply(null, arguments);
          } else if (o.shortcutFunction === 'defaultValue') {
            options = {defaultValue: options};
          }
        } else {
          options = options || {};
        }
        if (typeof o.defaultVariables === 'object') {
          options = f.extend({}, o.defaultVariables, options);
        }
        if (potentialKeys === undefined || potentialKeys === null || potentialKeys === '')
          return '';
        if (typeof potentialKeys === 'number') {
          potentialKeys = String(potentialKeys);
        }
        if (typeof potentialKeys === 'string') {
          potentialKeys = [potentialKeys];
        }
        var key = potentialKeys[0];
        if (potentialKeys.length > 1) {
          for (var i = 0; i < potentialKeys.length; i++) {
            key = potentialKeys[i];
            if (exists(key, options)) {
              break;
            }
          }
        }
        var notFound = _getDefaultValue(key, options),
            found = _find(key, options),
            nsseparator = options.nsseparator || o.nsseparator,
            lngs = options.lng ? f.toLanguages(options.lng, options.fallbackLng) : languages,
            ns = options.ns || o.ns.defaultNs,
            parts;
        if (key.indexOf(nsseparator) > -1) {
          parts = key.split(nsseparator);
          ns = parts[0];
          key = parts[1];
        }
        if (found === undefined && o.sendMissing && typeof o.missingKeyHandler === 'function') {
          if (options.lng) {
            o.missingKeyHandler(lngs[0], ns, key, notFound, lngs);
          } else {
            o.missingKeyHandler(o.lng, ns, key, notFound, lngs);
          }
        }
        var postProcessorsToApply,
            postProcessor,
            j;
        if (typeof o.postProcess === 'string' && o.postProcess !== '') {
          postProcessorsToApply = [o.postProcess];
        } else if (typeof o.postProcess === 'array' || typeof o.postProcess === 'object') {
          postProcessorsToApply = o.postProcess;
        } else {
          postProcessorsToApply = [];
        }
        if (typeof options.postProcess === 'string' && options.postProcess !== '') {
          postProcessorsToApply = postProcessorsToApply.concat([options.postProcess]);
        } else if (typeof options.postProcess === 'array' || typeof options.postProcess === 'object') {
          postProcessorsToApply = postProcessorsToApply.concat(options.postProcess);
        }
        if (found !== undefined && postProcessorsToApply.length) {
          for (j = 0; j < postProcessorsToApply.length; j += 1) {
            postProcessor = postProcessorsToApply[j];
            if (postProcessors[postProcessor]) {
              found = postProcessors[postProcessor](found, key, options);
            }
          }
        }
        var splitNotFound = notFound;
        if (notFound.indexOf(nsseparator) > -1) {
          parts = notFound.split(nsseparator);
          splitNotFound = parts[1];
        }
        if (splitNotFound === key && o.parseMissingKey) {
          notFound = o.parseMissingKey(notFound);
        }
        if (found === undefined) {
          notFound = applyReplacement(notFound, options);
          notFound = applyReuse(notFound, options);
          if (postProcessorsToApply.length) {
            found = _getDefaultValue(key, options);
            for (j = 0; j < postProcessorsToApply.length; j += 1) {
              postProcessor = postProcessorsToApply[j];
              if (postProcessors[postProcessor]) {
                found = postProcessors[postProcessor](found, key, options);
              }
            }
          }
        }
        return (found !== undefined) ? found : notFound;
      }
      function _find(key, options) {
        options = options || {};
        var optionWithoutCount,
            translated,
            notFound = _getDefaultValue(key, options),
            lngs = languages;
        if (!resStore) {
          return notFound;
        }
        if (lngs[0].toLowerCase() === 'cimode')
          return notFound;
        if (options.lngs)
          lngs = options.lngs;
        if (options.lng) {
          lngs = f.toLanguages(options.lng, options.fallbackLng);
          if (!resStore[lngs[0]]) {
            var oldAsync = o.getAsync;
            o.getAsync = false;
            i18n.sync.load(lngs, o, function(err, store) {
              f.extend(resStore, store);
              o.getAsync = oldAsync;
            });
          }
        }
        var ns = options.ns || o.ns.defaultNs;
        var nsseparator = options.nsseparator || o.nsseparator;
        if (key.indexOf(nsseparator) > -1) {
          var parts = key.split(nsseparator);
          ns = parts[0];
          key = parts[1];
        }
        if (hasContext(options)) {
          optionWithoutCount = f.extend({}, options);
          delete optionWithoutCount.context;
          optionWithoutCount.defaultValue = o.contextNotFound;
          var contextKey = ns + nsseparator + key + '_' + options.context;
          translated = translate(contextKey, optionWithoutCount);
          if (translated != o.contextNotFound) {
            return applyReplacement(translated, {context: options.context});
          }
        }
        if (needsPlural(options, lngs[0])) {
          optionWithoutCount = f.extend({lngs: [lngs[0]]}, options);
          delete optionWithoutCount.count;
          optionWithoutCount._origLng = optionWithoutCount._origLng || optionWithoutCount.lng || lngs[0];
          delete optionWithoutCount.lng;
          optionWithoutCount.defaultValue = o.pluralNotFound;
          var pluralKey;
          if (!pluralExtensions.needsPlural(lngs[0], options.count)) {
            pluralKey = ns + nsseparator + key;
          } else {
            pluralKey = ns + nsseparator + key + o.pluralSuffix;
            var pluralExtension = pluralExtensions.get(lngs[0], options.count);
            if (pluralExtension >= 0) {
              pluralKey = pluralKey + '_' + pluralExtension;
            } else if (pluralExtension === 1) {
              pluralKey = ns + nsseparator + key;
            }
          }
          translated = translate(pluralKey, optionWithoutCount);
          if (translated != o.pluralNotFound) {
            return applyReplacement(translated, {
              count: options.count,
              interpolationPrefix: options.interpolationPrefix,
              interpolationSuffix: options.interpolationSuffix
            });
          } else if (lngs.length > 1) {
            var clone = lngs.slice();
            clone.shift();
            options = f.extend(options, {lngs: clone});
            options._origLng = optionWithoutCount._origLng;
            delete options.lng;
            translated = translate(ns + nsseparator + key, options);
            if (translated != o.pluralNotFound)
              return translated;
          } else {
            optionWithoutCount.lng = optionWithoutCount._origLng;
            delete optionWithoutCount._origLng;
            translated = translate(ns + nsseparator + key, optionWithoutCount);
            return applyReplacement(translated, {
              count: options.count,
              interpolationPrefix: options.interpolationPrefix,
              interpolationSuffix: options.interpolationSuffix
            });
          }
        }
        if (needsIndefiniteArticle(options)) {
          var optionsWithoutIndef = f.extend({}, options);
          delete optionsWithoutIndef.indefinite_article;
          optionsWithoutIndef.defaultValue = o.indefiniteNotFound;
          var indefiniteKey = ns + nsseparator + key + (((options.count && !needsPlural(options, lngs[0])) || !options.count) ? o.indefiniteSuffix : "");
          translated = translate(indefiniteKey, optionsWithoutIndef);
          if (translated != o.indefiniteNotFound) {
            return translated;
          }
        }
        var found;
        var keyseparator = options.keyseparator || o.keyseparator;
        var keys = key.split(keyseparator);
        for (var i = 0,
            len = lngs.length; i < len; i++) {
          if (found !== undefined)
            break;
          var l = lngs[i];
          var x = 0;
          var value = resStore[l] && resStore[l][ns];
          while (keys[x]) {
            value = value && value[keys[x]];
            x++;
          }
          if (value !== undefined && (!o.showKeyIfEmpty || value !== '')) {
            var valueType = Object.prototype.toString.apply(value);
            if (typeof value === 'string') {
              value = applyReplacement(value, options);
              value = applyReuse(value, options);
            } else if (valueType === '[object Array]' && !o.returnObjectTrees && !options.returnObjectTrees) {
              value = value.join('\n');
              value = applyReplacement(value, options);
              value = applyReuse(value, options);
            } else if (value === null && o.fallbackOnNull === true) {
              value = undefined;
            } else if (value !== null) {
              if (!o.returnObjectTrees && !options.returnObjectTrees) {
                if (o.objectTreeKeyHandler && typeof o.objectTreeKeyHandler == 'function') {
                  value = o.objectTreeKeyHandler(key, value, l, ns, options);
                } else {
                  value = 'key \'' + ns + ':' + key + ' (' + l + ')\' ' + 'returned an object instead of string.';
                  f.log(value);
                }
              } else if (valueType !== '[object Number]' && valueType !== '[object Function]' && valueType !== '[object RegExp]') {
                var copy = (valueType === '[object Array]') ? [] : {};
                f.each(value, function(m) {
                  copy[m] = _translate(ns + nsseparator + key + keyseparator + m, options);
                });
                value = copy;
              }
            }
            if (typeof value === 'string' && value.trim() === '' && o.fallbackOnEmpty === true)
              value = undefined;
            found = value;
          }
        }
        if (found === undefined && !options.isFallbackLookup && (o.fallbackToDefaultNS === true || (o.fallbackNS && o.fallbackNS.length > 0))) {
          options.isFallbackLookup = true;
          if (o.fallbackNS.length) {
            for (var y = 0,
                lenY = o.fallbackNS.length; y < lenY; y++) {
              found = _find(o.fallbackNS[y] + nsseparator + key, options);
              if (found || (found === "" && o.fallbackOnEmpty === false)) {
                var foundValue = found.indexOf(nsseparator) > -1 ? found.split(nsseparator)[1] : found,
                    notFoundValue = notFound.indexOf(nsseparator) > -1 ? notFound.split(nsseparator)[1] : notFound;
                if (foundValue !== notFoundValue)
                  break;
              }
            }
          } else {
            options.ns = o.ns.defaultNs;
            found = _find(key, options);
          }
          options.isFallbackLookup = false;
        }
        return found;
      }
      function detectLanguage() {
        var detectedLng;
        var whitelist = o.lngWhitelist || [];
        var userLngChoices = [];
        var qsParm = [];
        if (typeof window !== 'undefined') {
          (function() {
            var query = window.location.search.substring(1);
            var params = query.split('&');
            for (var i = 0; i < params.length; i++) {
              var pos = params[i].indexOf('=');
              if (pos > 0) {
                var key = params[i].substring(0, pos);
                if (key == o.detectLngQS) {
                  userLngChoices.push(params[i].substring(pos + 1));
                }
              }
            }
          })();
        }
        if (o.useCookie && typeof document !== 'undefined') {
          var c = f.cookie.read(o.cookieName);
          if (c)
            userLngChoices.push(c);
        }
        if (o.detectLngFromLocalStorage && typeof window !== 'undefined' && window.localStorage) {
          var lang = f.localStorage.getItem('i18next_lng');
          if (lang) {
            userLngChoices.push(lang);
          }
        }
        if (typeof navigator !== 'undefined') {
          if (navigator.languages) {
            for (var i = 0; i < navigator.languages.length; i++) {
              userLngChoices.push(navigator.languages[i]);
            }
          }
          if (navigator.userLanguage) {
            userLngChoices.push(navigator.userLanguage);
          }
          if (navigator.language) {
            userLngChoices.push(navigator.language);
          }
        }
        (function() {
          for (var i = 0; i < userLngChoices.length; i++) {
            var lng = userLngChoices[i];
            if (lng.indexOf('-') > -1) {
              var parts = lng.split('-');
              lng = o.lowerCaseLng ? parts[0].toLowerCase() + '-' + parts[1].toLowerCase() : parts[0].toLowerCase() + '-' + parts[1].toUpperCase();
            }
            if (whitelist.length === 0 || whitelist.indexOf(lng) > -1) {
              detectedLng = lng;
              break;
            }
          }
        })();
        if (!detectedLng) {
          detectedLng = o.fallbackLng[0];
        }
        return detectedLng;
      }
      var _rules = [["ach", "Acholi", [1, 2], 1], ["af", "Afrikaans", [1, 2], 2], ["ak", "Akan", [1, 2], 1], ["am", "Amharic", [1, 2], 1], ["an", "Aragonese", [1, 2], 2], ["ar", "Arabic", [0, 1, 2, 3, 11, 100], 5], ["arn", "Mapudungun", [1, 2], 1], ["ast", "Asturian", [1, 2], 2], ["ay", "Aymará", [1], 3], ["az", "Azerbaijani", [1, 2], 2], ["be", "Belarusian", [1, 2, 5], 4], ["bg", "Bulgarian", [1, 2], 2], ["bn", "Bengali", [1, 2], 2], ["bo", "Tibetan", [1], 3], ["br", "Breton", [1, 2], 1], ["bs", "Bosnian", [1, 2, 5], 4], ["ca", "Catalan", [1, 2], 2], ["cgg", "Chiga", [1], 3], ["cs", "Czech", [1, 2, 5], 6], ["csb", "Kashubian", [1, 2, 5], 7], ["cy", "Welsh", [1, 2, 3, 8], 8], ["da", "Danish", [1, 2], 2], ["de", "German", [1, 2], 2], ["dev", "Development Fallback", [1, 2], 2], ["dz", "Dzongkha", [1], 3], ["el", "Greek", [1, 2], 2], ["en", "English", [1, 2], 2], ["eo", "Esperanto", [1, 2], 2], ["es", "Spanish", [1, 2], 2], ["es_ar", "Argentinean Spanish", [1, 2], 2], ["et", "Estonian", [1, 2], 2], ["eu", "Basque", [1, 2], 2], ["fa", "Persian", [1], 3], ["fi", "Finnish", [1, 2], 2], ["fil", "Filipino", [1, 2], 1], ["fo", "Faroese", [1, 2], 2], ["fr", "French", [1, 2], 9], ["fur", "Friulian", [1, 2], 2], ["fy", "Frisian", [1, 2], 2], ["ga", "Irish", [1, 2, 3, 7, 11], 10], ["gd", "Scottish Gaelic", [1, 2, 3, 20], 11], ["gl", "Galician", [1, 2], 2], ["gu", "Gujarati", [1, 2], 2], ["gun", "Gun", [1, 2], 1], ["ha", "Hausa", [1, 2], 2], ["he", "Hebrew", [1, 2], 2], ["hi", "Hindi", [1, 2], 2], ["hr", "Croatian", [1, 2, 5], 4], ["hu", "Hungarian", [1, 2], 2], ["hy", "Armenian", [1, 2], 2], ["ia", "Interlingua", [1, 2], 2], ["id", "Indonesian", [1], 3], ["is", "Icelandic", [1, 2], 12], ["it", "Italian", [1, 2], 2], ["ja", "Japanese", [1], 3], ["jbo", "Lojban", [1], 3], ["jv", "Javanese", [0, 1], 13], ["ka", "Georgian", [1], 3], ["kk", "Kazakh", [1], 3], ["km", "Khmer", [1], 3], ["kn", "Kannada", [1, 2], 2], ["ko", "Korean", [1], 3], ["ku", "Kurdish", [1, 2], 2], ["kw", "Cornish", [1, 2, 3, 4], 14], ["ky", "Kyrgyz", [1], 3], ["lb", "Letzeburgesch", [1, 2], 2], ["ln", "Lingala", [1, 2], 1], ["lo", "Lao", [1], 3], ["lt", "Lithuanian", [1, 2, 10], 15], ["lv", "Latvian", [1, 2, 0], 16], ["mai", "Maithili", [1, 2], 2], ["mfe", "Mauritian Creole", [1, 2], 1], ["mg", "Malagasy", [1, 2], 1], ["mi", "Maori", [1, 2], 1], ["mk", "Macedonian", [1, 2], 17], ["ml", "Malayalam", [1, 2], 2], ["mn", "Mongolian", [1, 2], 2], ["mnk", "Mandinka", [0, 1, 2], 18], ["mr", "Marathi", [1, 2], 2], ["ms", "Malay", [1], 3], ["mt", "Maltese", [1, 2, 11, 20], 19], ["nah", "Nahuatl", [1, 2], 2], ["nap", "Neapolitan", [1, 2], 2], ["nb", "Norwegian Bokmal", [1, 2], 2], ["ne", "Nepali", [1, 2], 2], ["nl", "Dutch", [1, 2], 2], ["nn", "Norwegian Nynorsk", [1, 2], 2], ["no", "Norwegian", [1, 2], 2], ["nso", "Northern Sotho", [1, 2], 2], ["oc", "Occitan", [1, 2], 1], ["or", "Oriya", [2, 1], 2], ["pa", "Punjabi", [1, 2], 2], ["pap", "Papiamento", [1, 2], 2], ["pl", "Polish", [1, 2, 5], 7], ["pms", "Piemontese", [1, 2], 2], ["ps", "Pashto", [1, 2], 2], ["pt", "Portuguese", [1, 2], 2], ["pt_br", "Brazilian Portuguese", [1, 2], 2], ["rm", "Romansh", [1, 2], 2], ["ro", "Romanian", [1, 2, 20], 20], ["ru", "Russian", [1, 2, 5], 4], ["sah", "Yakut", [1], 3], ["sco", "Scots", [1, 2], 2], ["se", "Northern Sami", [1, 2], 2], ["si", "Sinhala", [1, 2], 2], ["sk", "Slovak", [1, 2, 5], 6], ["sl", "Slovenian", [5, 1, 2, 3], 21], ["so", "Somali", [1, 2], 2], ["son", "Songhay", [1, 2], 2], ["sq", "Albanian", [1, 2], 2], ["sr", "Serbian", [1, 2, 5], 4], ["su", "Sundanese", [1], 3], ["sv", "Swedish", [1, 2], 2], ["sw", "Swahili", [1, 2], 2], ["ta", "Tamil", [1, 2], 2], ["te", "Telugu", [1, 2], 2], ["tg", "Tajik", [1, 2], 1], ["th", "Thai", [1], 3], ["ti", "Tigrinya", [1, 2], 1], ["tk", "Turkmen", [1, 2], 2], ["tr", "Turkish", [1, 2], 1], ["tt", "Tatar", [1], 3], ["ug", "Uyghur", [1], 3], ["uk", "Ukrainian", [1, 2, 5], 4], ["ur", "Urdu", [1, 2], 2], ["uz", "Uzbek", [1, 2], 1], ["vi", "Vietnamese", [1], 3], ["wa", "Walloon", [1, 2], 1], ["wo", "Wolof", [1], 3], ["yo", "Yoruba", [1, 2], 2], ["zh", "Chinese", [1], 3]];
      var _rulesPluralsTypes = {
        1: function(n) {
          return Number(n > 1);
        },
        2: function(n) {
          return Number(n != 1);
        },
        3: function(n) {
          return 0;
        },
        4: function(n) {
          return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
        },
        5: function(n) {
          return Number(n === 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);
        },
        6: function(n) {
          return Number((n == 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2);
        },
        7: function(n) {
          return Number(n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
        },
        8: function(n) {
          return Number((n == 1) ? 0 : (n == 2) ? 1 : (n != 8 && n != 11) ? 2 : 3);
        },
        9: function(n) {
          return Number(n >= 2);
        },
        10: function(n) {
          return Number(n == 1 ? 0 : n == 2 ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4);
        },
        11: function(n) {
          return Number((n == 1 || n == 11) ? 0 : (n == 2 || n == 12) ? 1 : (n > 2 && n < 20) ? 2 : 3);
        },
        12: function(n) {
          return Number(n % 10 != 1 || n % 100 == 11);
        },
        13: function(n) {
          return Number(n !== 0);
        },
        14: function(n) {
          return Number((n == 1) ? 0 : (n == 2) ? 1 : (n == 3) ? 2 : 3);
        },
        15: function(n) {
          return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
        },
        16: function(n) {
          return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n !== 0 ? 1 : 2);
        },
        17: function(n) {
          return Number(n == 1 || n % 10 == 1 ? 0 : 1);
        },
        18: function(n) {
          return Number(n == 0 ? 0 : n == 1 ? 1 : 2);
        },
        19: function(n) {
          return Number(n == 1 ? 0 : n === 0 || (n % 100 > 1 && n % 100 < 11) ? 1 : (n % 100 > 10 && n % 100 < 20) ? 2 : 3);
        },
        20: function(n) {
          return Number(n == 1 ? 0 : (n === 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2);
        },
        21: function(n) {
          return Number(n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0);
        }
      };
      var pluralExtensions = {
        rules: (function() {
          var l,
              rules = {};
          for (l = _rules.length; l--; ) {
            rules[_rules[l][0]] = {
              name: _rules[l][1],
              numbers: _rules[l][2],
              plurals: _rulesPluralsTypes[_rules[l][3]]
            };
          }
          return rules;
        }()),
        addRule: function(lng, obj) {
          pluralExtensions.rules[lng] = obj;
        },
        setCurrentLng: function(lng) {
          if (!pluralExtensions.currentRule || pluralExtensions.currentRule.lng !== lng) {
            var parts = lng.split('-');
            pluralExtensions.currentRule = {
              lng: lng,
              rule: pluralExtensions.rules[parts[0]]
            };
          }
        },
        needsPlural: function(lng, count) {
          var parts = lng.split('-');
          var ext;
          if (pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng) {
            ext = pluralExtensions.currentRule.rule;
          } else {
            ext = pluralExtensions.rules[parts[f.getCountyIndexOfLng(lng)]];
          }
          if (ext && ext.numbers.length <= 1) {
            return false;
          } else {
            return this.get(lng, count) !== 1;
          }
        },
        get: function(lng, count) {
          var parts = lng.split('-');
          function getResult(l, c) {
            var ext;
            if (pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng) {
              ext = pluralExtensions.currentRule.rule;
            } else {
              ext = pluralExtensions.rules[l];
            }
            if (ext) {
              var i;
              if (ext.noAbs) {
                i = ext.plurals(c);
              } else {
                i = ext.plurals(Math.abs(c));
              }
              var number = ext.numbers[i];
              if (ext.numbers.length === 2 && ext.numbers[0] === 1) {
                if (number === 2) {
                  number = -1;
                } else if (number === 1) {
                  number = 1;
                }
              }
              return number;
            } else {
              return c === 1 ? '1' : '-1';
            }
          }
          return getResult(parts[f.getCountyIndexOfLng(lng)], count);
        }
      };
      var postProcessors = {};
      var addPostProcessor = function(name, fc) {
        postProcessors[name] = fc;
      };
      var sprintf = (function() {
        function get_type(variable) {
          return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
        }
        function str_repeat(input, multiplier) {
          for (var output = []; multiplier > 0; output[--multiplier] = input) {}
          return output.join('');
        }
        var str_format = function() {
          if (!str_format.cache.hasOwnProperty(arguments[0])) {
            str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
          }
          return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
        };
        str_format.format = function(parse_tree, argv) {
          var cursor = 1,
              tree_length = parse_tree.length,
              node_type = '',
              arg,
              output = [],
              i,
              k,
              match,
              pad,
              pad_character,
              pad_length;
          for (i = 0; i < tree_length; i++) {
            node_type = get_type(parse_tree[i]);
            if (node_type === 'string') {
              output.push(parse_tree[i]);
            } else if (node_type === 'array') {
              match = parse_tree[i];
              if (match[2]) {
                arg = argv[cursor];
                for (k = 0; k < match[2].length; k++) {
                  if (!arg.hasOwnProperty(match[2][k])) {
                    throw (sprintf('[sprintf] property "%s" does not exist', match[2][k]));
                  }
                  arg = arg[match[2][k]];
                }
              } else if (match[1]) {
                arg = argv[match[1]];
              } else {
                arg = argv[cursor++];
              }
              if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
                throw (sprintf('[sprintf] expecting number but found %s', get_type(arg)));
              }
              switch (match[8]) {
                case 'b':
                  arg = arg.toString(2);
                  break;
                case 'c':
                  arg = String.fromCharCode(arg);
                  break;
                case 'd':
                  arg = parseInt(arg, 10);
                  break;
                case 'e':
                  arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                  break;
                case 'f':
                  arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                  break;
                case 'o':
                  arg = arg.toString(8);
                  break;
                case 's':
                  arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg);
                  break;
                case 'u':
                  arg = Math.abs(arg);
                  break;
                case 'x':
                  arg = arg.toString(16);
                  break;
                case 'X':
                  arg = arg.toString(16).toUpperCase();
                  break;
              }
              arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+' + arg : arg);
              pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
              pad_length = match[6] - String(arg).length;
              pad = match[6] ? str_repeat(pad_character, pad_length) : '';
              output.push(match[5] ? arg + pad : pad + arg);
            }
          }
          return output.join('');
        };
        str_format.cache = {};
        str_format.parse = function(fmt) {
          var _fmt = fmt,
              match = [],
              parse_tree = [],
              arg_names = 0;
          while (_fmt) {
            if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
              parse_tree.push(match[0]);
            } else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
              parse_tree.push('%');
            } else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
              if (match[2]) {
                arg_names |= 1;
                var field_list = [],
                    replacement_field = match[2],
                    field_match = [];
                if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                  while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                    if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                      field_list.push(field_match[1]);
                    } else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                      field_list.push(field_match[1]);
                    } else {
                      throw ('[sprintf] huh?');
                    }
                  }
                } else {
                  throw ('[sprintf] huh?');
                }
                match[2] = field_list;
              } else {
                arg_names |= 2;
              }
              if (arg_names === 3) {
                throw ('[sprintf] mixing positional and named placeholders is not (yet) supported');
              }
              parse_tree.push(match);
            } else {
              throw ('[sprintf] huh?');
            }
            _fmt = _fmt.substring(match[0].length);
          }
          return parse_tree;
        };
        return str_format;
      })();
      var vsprintf = function(fmt, argv) {
        argv.unshift(fmt);
        return sprintf.apply(null, argv);
      };
      addPostProcessor("sprintf", function(val, key, opts) {
        if (!opts.sprintf)
          return val;
        if (Object.prototype.toString.apply(opts.sprintf) === '[object Array]') {
          return vsprintf(val, opts.sprintf);
        } else if (typeof opts.sprintf === 'object') {
          return sprintf(val, opts.sprintf);
        }
        return val;
      });
      i18n.init = init;
      i18n.isInitialized = isInitialized;
      i18n.setLng = setLng;
      i18n.preload = preload;
      i18n.addResourceBundle = addResourceBundle;
      i18n.hasResourceBundle = hasResourceBundle;
      i18n.getResourceBundle = getResourceBundle;
      i18n.addResource = addResource;
      i18n.addResources = addResources;
      i18n.removeResourceBundle = removeResourceBundle;
      i18n.loadNamespace = loadNamespace;
      i18n.loadNamespaces = loadNamespaces;
      i18n.setDefaultNamespace = setDefaultNamespace;
      i18n.t = translate;
      i18n.translate = translate;
      i18n.exists = exists;
      i18n.detectLanguage = f.detectLanguage;
      i18n.pluralExtensions = pluralExtensions;
      i18n.sync = sync;
      i18n.functions = f;
      i18n.lng = lng;
      i18n.dir = dir;
      i18n.addPostProcessor = addPostProcessor;
      i18n.applyReplacement = f.applyReplacement;
      i18n.options = o;
      i18n.noConflict = noConflict;
    })(typeof exports === 'undefined' ? window : exports);
  })();
  return _retrieveGlobal();
});

$__System.registerDynamic("25", ["24"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('24');
  global.define = __define;
  return module.exports;
});

$__System.register("26", ["9", "25", "6", "27", "23", "22", "21", "20", "1f", "1e", "1d", "1c", "1b", "1a", "19", "18", "17", "16", "15", "5", "28", "10", "14"], function($__export) {
  "use strict";
  var __moduleName = "26";
  var $,
      i18next,
      pcapi,
      _,
      generalTemplate,
      textTemplate,
      textareaTemplate,
      rangeTemplate,
      checkboxTemplate,
      radioTemplate,
      selectTemplate,
      imageTemplate,
      audioTemplate,
      gpsTemplate,
      warningTemplate,
      dtreeTemplate,
      sectionTemplate,
      addfieldTemplate,
      addAttributeTemplate,
      utils,
      save,
      DataStorage,
      Visibility,
      FieldGenerator;
  return {
    setters: [function($__m) {
      $ = $__m.default;
    }, function($__m) {
      i18next = $__m.default;
    }, function($__m) {
      pcapi = $__m.default;
    }, function($__m) {
      _ = $__m.default;
    }, function($__m) {
      generalTemplate = $__m.default;
    }, function($__m) {
      textTemplate = $__m.default;
    }, function($__m) {
      textareaTemplate = $__m.default;
    }, function($__m) {
      rangeTemplate = $__m.default;
    }, function($__m) {
      checkboxTemplate = $__m.default;
    }, function($__m) {
      radioTemplate = $__m.default;
    }, function($__m) {
      selectTemplate = $__m.default;
    }, function($__m) {
      imageTemplate = $__m.default;
    }, function($__m) {
      audioTemplate = $__m.default;
    }, function($__m) {
      gpsTemplate = $__m.default;
    }, function($__m) {
      warningTemplate = $__m.default;
    }, function($__m) {
      dtreeTemplate = $__m.default;
    }, function($__m) {
      sectionTemplate = $__m.default;
    }, function($__m) {
      addfieldTemplate = $__m.default;
    }, function($__m) {
      addAttributeTemplate = $__m.default;
    }, function($__m) {
      utils = $__m;
    }, function($__m) {
      save = $__m;
    }, function($__m) {
      DataStorage = $__m.default;
    }, function($__m) {
      Visibility = $__m.default;
    }],
    execute: function() {
      FieldGenerator = function() {
        function FieldGenerator(el, options) {
          this.el = el;
          this.$el = $(el);
          this.options = options;
        }
        return ($traceurRuntime.createClass)(FieldGenerator, {
          render: function(data, element) {
            if (element) {
              element.closest('div').after(this.createField(data));
            } else {
              this.$el.append(this.createField(data));
            }
            this.addFieldButtons(data.type);
            this.enableActions();
          },
          createField: function(data) {
            var type = data.type;
            var templateData = Object.assign({}, data);
            templateData.id = templateData.id || type + "-" + this.findHighestElement(type);
            templateData.label = templateData.label || i18n.t(type + ".label");
            templateData.required = templateData.required || false;
            templateData.header = false;
            templateData.persistent = templateData.persistent || false;
            templateData.properties = templateData.properties || {};
            _.extend(templateData, this.viewHelpers());
            switch (type) {
              case 'general':
                templateData.title = templateData.title || i18n.t("general.label");
                templateData.geoms = templateData.geoms || ["point"];
                return generalTemplate(templateData);
              case 'text':
                templateData.properties["max-chars"] = templateData.properties["max-chars"] || 10;
                if (this.options && this.options.layout) {
                  templateData.header = this.options.layout.headers.indexOf(templateData.id) > -1;
                }
                return textTemplate(templateData);
              case 'textarea':
                return textareaTemplate(templateData);
              case 'range':
                templateData.properties.min = templateData.properties.min || 0;
                templateData.properties.max = templateData.properties.max || 10;
                templateData.properties.step = templateData.properties.step || 1;
                return rangeTemplate(templateData);
              case 'checkbox':
                if (this.options && this.options.formsFolder) {
                  templateData.properties.extraPath = this.options.formsFolder;
                }
                templateData.properties.options = templateData.properties.options || [];
                return checkboxTemplate(templateData);
              case 'radio':
                if (this.options && this.options.formsFolder) {
                  templateData.properties.extraPath = this.options.formsFolder;
                }
                templateData.properties.options = templateData.properties.options || [];
                return radioTemplate(templateData);
              case 'select':
                templateData.properties.options = templateData.properties.options || [];
                if (templateData.properties.options > 0 && templateData.properties.options[0] === "") {
                  templateData.options.shift();
                }
                return selectTemplate(templateData);
              case 'dtree':
                var fnameURL = templateData.properties.filename;
                if (this.options && this.options.formsFolder && templateData.properties.filename) {
                  fnameURL = this.options.formsFolder + "/" + templateData.properties.filename;
                }
                templateData.url = pcapi.buildUrl('editors', fnameURL);
                return dtreeTemplate(templateData);
              case 'image':
                if (this.$el.find('.fieldcontain-image').length === 0) {
                  templateData.properties["multi-image"] = templateData.properties["multi-image"] || false;
                  templateData.properties.los = templateData.properties.los || false;
                  templateData.properties.blur = templateData.properties.blur || 0;
                  return imageTemplate(templateData);
                }
                return '';
              case 'audio':
                if (this.$el.find('.fieldcontain-audio').length === 0) {
                  return audioTemplate(templateData);
                }
                return '';
              case 'gps':
                if (this.$el.find('.fieldcontain-gps').length === 0) {
                  return gpsTemplate(templateData);
                }
                return '';
              case 'warning':
                if (this.$el.find('.fieldcontain-warning').length === 0) {
                  templateData.properties.placeholder = templateData.properties.placeholder || "";
                  return warningTemplate(templateData);
                }
                return '';
              case 'section':
                return sectionTemplate(templateData);
            }
            return '';
          },
          addFieldButtons: function(type) {
            var fields = this.$el.find('.fieldcontain-' + type);
            var id = type + "-" + (fields.length);
            $(fields[fields.length - 1]).attr("id", id);
            var $id = $("#" + id);
            if (type !== "general") {
              var buttons = '<div class="fieldButtons">' + '<button type="button" class="btn btn-default ' + 'remove-field" aria-label="Remove field">' + '<span class="glyphicon ' + 'glyphicon-remove" aria-hidden="true"></span></button>' + '</div>';
              $id.append(buttons);
            }
            $id.after(addfieldTemplate({data: cfg.options}));
          },
          enableActions: function() {
            this.enableCheckboxEvents();
            this.enableRadioEvents();
            this.enableSelectEvents();
            this.enabledTreeEvents();
            this.enableRemoveField();
            this.enableAddField();
            this.enableAddAttribute();
          },
          enableAddAttribute: function() {
            this.$el.off("click", "#add-attribute");
            this.$el.on("click", "#add-attribute", $.proxy(function(event) {
              $("#attributes").append(addAttributeTemplate());
            }, this));
          },
          enableAddField: function() {
            this.$el.off("click", ".add-field");
            this.$el.on("click", ".add-field", $.proxy(function(event) {
              var $this = $(event.target);
              var $fieldcontain = $this.closest('.fieldcontain');
              this.render({type: $this.text().trim()}, $this);
            }, this));
          },
          enableCheckboxEvents: function() {
            this.enableMultipleOptionsEvents('checkbox');
          },
          enableRadioEvents: function() {
            this.enableMultipleOptionsEvents('radio');
          },
          enableSelectEvents: function() {
            this.enableMultipleOptionsEvents('select');
          },
          enableMultipleOptionsEvents: function(type) {
            this.$el.off("click", ".add-" + type);
            this.$el.on("click", ".add-" + type, function() {
              var fieldcontainId = utils.numberFromId($(this).closest('.fieldcontain-' + type).prop("id"));
              var finds = $("#" + type + "-" + fieldcontainId).find('.' + type);
              var value = i18n.t(type + ".text");
              var nextElement = '<div class="form-inline">' + '<input type="text" value="' + value + '" name="' + type + '-' + fieldcontainId + '" id="checkbox-' + fieldcontainId + '" class="' + type + '">';
              if (type !== "select") {
                nextElement += '<button type="file" class="btn btn-default btn-sm upload-image" aria-label="Upload ' + type + '"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>';
              }
              nextElement += '<button type="button" class="btn btn-default btn-sm remove-' + type + '" aria-label="Remove ' + type + '"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' + '<input type="file" class="image-upload" id="upload-' + type + '-' + fieldcontainId + '" style="display: none;">' + '</div>';
              $(this).prev().append(nextElement);
              var i = 1;
              $("#" + type + "-" + fieldcontainId).find('.' + type).each(function() {
                $(this).prop("id", type + '-' + fieldcontainId + '-' + i);
                i++;
              });
            });
            this.$el.off("click", ".remove-" + type);
            this.$el.on("click", ".remove-" + type, function() {
              $(this).closest('.form-inline').remove();
            });
            this.$el.off("click", ".upload-image");
            this.$el.on("click", ".upload-image", function() {
              $(this).closest('.form-inline').find('input[type="file"]').trigger('click');
            });
            this.$el.off("change", ".image-upload");
            this.$el.on("change", ".image-upload", $.proxy(function(e) {
              var files = e.target.files || e.dataTransfer.files;
              var file = files[0];
              type = $(e.target).closest('.fieldcontain').attr("id").split("-")[0];
              var path = "";
              if (this.options && this.options.formsFolder) {
                path = this.options.formsFolder + "/";
              }
              var options = {
                "remoteDir": "editors",
                "path": path + file.name,
                "file": file,
                "contentType": false
              };
              if (this.options.copyToPublic) {
                options.urlParams = {'public': 'true'};
              }
              utils.loading(true);
              pcapi.uploadFile(options, "PUT").then($.proxy(function(data) {
                utils.loading(false);
                utils.giveFeedback(data.msg);
                var name = utils.getFilenameFromURL(data.path);
                var $formLine = $(e.target).closest('.form-inline');
                var $inputText = $formLine.find('input[type="text"]');
                $inputText.before('<img src="' + pcapi.buildUrl('editors', path + name) + '" style="width: 50px;">');
                $formLine.find('button.upload-image').remove();
              }, this));
            }, this));
            var visibility = new Visibility();
            var element = this.el;
            this.$el.off("click", ".relate");
            this.$el.on("click", ".relate", function() {
              var dataStorage = new DataStorage();
              if (dataStorage.getData() === null) {
                save.saveData(element);
              }
              visibility.showVisibilityWindow($(this).closest('.fieldcontain').attr("id"));
            });
          },
          enabledTreeEvents: function() {
            var $browseElement = $('.add-dtree');
            var $uploadElement = $('.upload-dtree');
            var file;
            $browseElement.unbind();
            $browseElement.bind("change", function(e) {
              var files = e.target.files || e.dataTransfer.files;
              file = files[0];
              $(this).parent().next().append(file.name);
            });
            $uploadElement.unbind('click');
            $uploadElement.click($.proxy(function() {
              var index = this.findHighestElement('dtree') - 1;
              var id = "dtree-" + index;
              var dtreeFname,
                  dtreeFnameURL;
              var ext = utils.getExtension(file.name);
              if (this.options && this.options.formsFolder) {
                dtreeFname = this.options.formsFolder + '-' + index + '.' + ext;
                dtreeFnameURL = this.options.formsFolder + "/" + dtreeFname;
              } else {
                dtreeFname = file.name;
                dtreeFnameURL = dtreeFname;
              }
              var options = {
                "remoteDir": "editors",
                "path": dtreeFnameURL,
                "file": file,
                "contentType": false
              };
              if (this.options.copyToPublic) {
                options.urlParams = {'public': 'true'};
              }
              utils.loading(true);
              pcapi.uploadFile(options, "PUT").then($.proxy(function(data) {
                utils.loading(false);
                utils.giveFeedback("File was uploaded");
                $("#" + id + " .btn-file").remove();
                $("#" + id + " .upload-dtree").remove();
                $("#" + id + " .btn-filename").html('<a class="dtree-url" ' + 'href="' + pcapi.buildUrl('editors', dtreeFnameURL) + '">' + dtreeFname + '</a>');
              }, this));
            }, this));
          },
          enableRemoveField: function() {
            this.$el.off("click", ".remove-field");
            this.$el.on("click", ".remove-field", function() {
              $(this).closest('.fieldcontain').remove();
            });
          },
          findHighestElement: function(type) {
            var j = 0;
            this.$el.find(".fieldcontain-" + type).each(function() {
              var i = parseInt($(this).attr("id").split("-")[1]);
              if (i >= j) {
                j = i;
              }
            });
            return j + 1;
          },
          viewHelpers: function() {
            return {
              'translate': function(i18nKey) {
                return i18n.t(i18nKey);
              },
              'checkGeometries': function(v, geoms) {
                if ($.inArray(v, geoms) > -1) {
                  return 'checked="checked"';
                } else {
                  return '';
                }
              },
              'check': function(v, word) {
                if (v) {
                  return word + '="' + word + '"';
                } else {
                  return '';
                }
              },
              'increase': function(v) {
                return v + 1;
              }
            };
          },
          uploadFile: function(browseElement, uploadElement) {}
        }, {});
      }();
      $__export('default', FieldGenerator);
    }
  };
});

$__System.register("29", ["26", "2a", "5", "28", "10", "25", "13", "27", "12", "11"], function($__export) {
  "use strict";
  var __moduleName = "29";
  var FieldGenerator,
      Convertor,
      utils,
      save,
      DataStorage,
      i18next,
      _,
      saveTemplate,
      BBox,
      Survey;
  return {
    setters: [function($__m) {
      FieldGenerator = $__m.default;
    }, function($__m) {
      Convertor = $__m.default;
    }, function($__m) {
      utils = $__m;
    }, function($__m) {
      save = $__m;
    }, function($__m) {
      DataStorage = $__m.default;
    }, function($__m) {
      i18next = $__m.default;
    }, function($__m) {}, function($__m) {
      _ = $__m.default;
    }, function($__m) {
      saveTemplate = $__m.default;
    }, function($__m) {
      BBox = $__m.default;
    }],
    execute: function() {
      Survey = function() {
        function Survey(options) {
          this.options = options;
          this.title = options.title;
          this.renderEl = "." + options.subElement;
          this.initialize();
          this.enableAutoSave();
        }
        return ($traceurRuntime.createClass)(Survey, {
          initialize: function() {
            document.getElementById(this.options.element).innerHTML = '<div class="mobile">' + '<div class="' + this.options.subElement + '">' + '</div></div>' + '<div id="loader"><img src="app/styles/images/ajax-loader.gif"></div>';
            var $mobile = $(".mobile");
            var $mobileContent = $(this.renderEl);
            $mobileContent.before(saveTemplate({"save": i18n.t("menu.save")}));
            var $myNav = $("#myNav");
            $mobile.height($(window).height() - $("#header").height() - 84);
            $mobileContent.height($mobile.height() - 100 - $myNav.height());
            $myNav.width($mobile.width());
            var options = {id: 'map'};
            this.bbox = new BBox(options);
          },
          enableAutoSave: function(time) {
            var iFrequency = time || 60000;
            var myInterval = 0;
            if (myInterval > 0)
              clearInterval(myInterval);
            myInterval = setInterval($.proxy(function() {
              save.saveData(this.renderEl);
            }, this), iFrequency);
          },
          render: function() {
            var fieldGenerator = new FieldGenerator(this.renderEl, this.options);
            var generalObj = {
              type: "general",
              title: this.title
            };
            var dataStorage = new DataStorage();
            dataStorage.setData({});
            fieldGenerator.render(generalObj);
            this.bbox.initialize();
          },
          renderExistingSurvey: function(title, data) {
            var convertor = new Convertor();
            if (typeof data === 'string') {
              if (utils.isJsonString(data)) {
                data = JSON.parse(data);
              } else {
                data = convertor.HTMLtoJSON(data, this.title);
              }
            }
            var dataStorage = new DataStorage();
            dataStorage.setData(data);
            this.options.layout = data.recordLayout;
            var fieldGenerator = new FieldGenerator(this.renderEl, this.options);
            fieldGenerator.render({
              "title": this.title,
              "geoms": data.geoms,
              "type": "general"
            });
            data.fields.forEach(function(field, index) {
              fieldGenerator.render(field);
            });
            this.bbox.initialize();
          }
        }, {});
      }();
      $__export('default', Survey);
    }
  };
});

$__System.registerDynamic("2b", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  var pcapi = (function() {
    var reservedDirs = ['editors', 'records', 'features'];
    var clearCloudLogin = function() {
      localStorage.setItem('cloud-user', JSON.stringify({'id': undefined}));
    };
    var doLogin = function(provider, callback, cbrowser) {
      var loginUrl = _this.getCloudProviderUrl() + '/auth/' + provider;
      if (provider === 'local') {
        doLoginLocal(callback, cbrowser, loginUrl);
      } else {
        doLoginDropBox(callback, cbrowser, loginUrl);
      }
    };
    var doLoginLocal = function(callback, cbrowser, loginUrl) {
      var pollTimer,
          pollTimerCount = 0,
          pollInterval = 3000,
          pollForMax = 5 * 60 * 1000;
      var pollUrl = loginUrl;
      console.debug('Login with: ' + pollUrl);
      var cb = window.open(pollUrl, '_blank', 'location=no');
      var closeCb = function(userId) {
        clearInterval(pollTimer);
        callback(userId);
      };
      console.debug('Poll: ' + pollUrl);
      pollTimer = setInterval(function() {
        $.ajax({
          url: pollUrl,
          timeout: 3000,
          success: function(pollData) {
            pollTimerCount += pollInterval;
            if (typeof(pollData) === 'object') {
              if (pollData.state === 1 || pollTimerCount > pollForMax) {
                var cloudUserId;
                if (pollData.state === 1) {
                  cloudUserId = pollData.userid;
                  _this.setCloudLogin(cloudUserId);
                }
                cb.close();
                closeCb(cloudUserId);
              }
            }
          },
          error: function(error) {
            console.error("Problem polling api: " + error.statusText);
            closeCb();
          }
        });
      }, pollInterval);
      if (cbrowser) {
        cbrowser(cb);
      }
    };
    var doLoginDropBox = function(callback, cbrowser, loginUrl) {
      var pollTimer,
          pollTimerCount = 0,
          pollInterval = 3000,
          pollForMax = 5 * 60 * 1000;
      var userId = getCloudLoginId();
      if (userId !== undefined) {
        console.debug("got a user id: " + userId);
        loginUrl += '/' + userId;
      }
      clearCloudLogin();
      console.debug('Login with: ' + loginUrl + '?async=true');
      $.ajax({
        url: loginUrl + '?async=true',
        timeout: 3000,
        cache: false,
        success: function(data) {
          console.debug("Redirect to: " + data.url);
          var cloudUserId = data.userid;
          var closeCb = function(userId) {
            clearInterval(pollTimer);
            callback(userId);
          };
          var cb = window.open(data.url, '_blank', 'location=no');
          var pollUrl = loginUrl + '/' + cloudUserId + '?async=true';
          console.debug('Poll: ' + pollUrl);
          pollTimer = setInterval(function() {
            $.ajax({
              url: pollUrl,
              success: function(pollData) {
                pollTimerCount += pollInterval;
                if (pollData.state === 1 || pollTimerCount > pollForMax) {
                  if (pollData.state === 1) {
                    _this.setCloudLogin(cloudUserId);
                  }
                  cb.close();
                  closeCb(cloudUserId);
                }
              },
              error: function(error) {
                console.error("Problem polling api: " + error.statusText);
                closeCb({
                  "status": -1,
                  "msg": "Problem polling api"
                });
              },
              cache: false
            });
          }, pollInterval);
          if (cbrowser) {
            cbrowser(cb);
          }
        },
        error: function(jqXHR, textStatus) {
          var msg;
          if (textStatus === undefined) {
            textStatus = ' Unspecified Error.';
          } else if (textStatus === "timeout") {
            msg = "Unable to login, please enable data connection.";
          } else {
            msg = "Problem with login: " + textStatus;
          }
          callback({
            "status": -1,
            "msg": msg
          });
          console.error(msg);
        }
      });
    };
    var doRequest = function(options) {
      var deferred = new $.Deferred();
      options.cache = false;
      $.ajax(options).then(function(data) {
        if ((typeof(data) === 'string' && options.contentType === 'html') || (typeof(data) === 'object')) {
          deferred.resolve(data);
        } else {
          try {
            deferred.resolve(JSON.parse(data));
          } catch (e) {
            console.error(e);
            deferred.reject(e);
          }
        }
      }).fail(function(error) {
        console.error("Problem with " + options.url + " : status=" + status + " : " + error);
        deferred.reject(error);
      });
      return deferred.promise();
    };
    var getCloudLogin = function() {
      var login = null;
      var user = localStorage.getItem('cloud-user');
      if (user) {
        login = JSON.parse(user);
      }
      return login;
    };
    var getCloudLoginId = function() {
      var id;
      var login = getCloudLogin();
      if (typeof(login) === 'object') {
        id = login.id;
      }
      return id;
    };
    var objectToURL = function(obj) {
      var params = [];
      if (typeof(obj) === 'object') {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
          }
        }
      }
      return params.join("&");
    };
    var endsWith = function(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };
    var _this = {
      init: function(options) {
        this.baseUrl = options.url;
        this.version = options.version;
        this.cloudProviderUrl = options.url + "/" + options.version + "/pcapi";
      },
      buildUrl: function(remoteDir, path, urlParams) {
        var userId = getCloudLoginId();
        return this.buildUserUrl(userId, remoteDir, path, urlParams);
      },
      buildUserUrl: function(userId, remoteDir, path, urlParams) {
        path = path || '';
        var params = objectToURL(urlParams);
        if (params.length > 0) {
          params = '?' + params;
        }
        return this.getCloudProviderUrl() + '/' + remoteDir + '/' + this.getProvider() + '/' + userId + '/' + path + params;
      },
      buildFSUrl: function(remoteDir, path) {
        var userId = getCloudLoginId();
        return this.buildFSUserUrl(userId, remoteDir, path);
      },
      buildFSUserUrl: function(userId, remoteDir, path) {
        path = path || '';
        if (userId !== "") {
          userId = "/" + userId;
        }
        return this.getCloudProviderUrl() + '/fs/' + this.getProvider() + userId + '/' + remoteDir + '/' + path;
      },
      checkLogin: function(callback) {
        if (!this.userId) {
          console.log("check if user is logged in");
          var user = getCloudLogin();
          if (user !== null && user.id) {
            var url = this.getCloudProviderUrl() + '/auth/' + this.getProvider();
            if (user.id !== "local") {
              url += '/' + user.id;
            }
            console.debug("Check user with: " + url);
            $.ajax({
              url: url,
              type: "GET",
              dataType: 'json',
              cache: false,
              success: $.proxy(function(data) {
                if (data.state === 1) {
                  this.setCloudLogin(user.id, user.cursor);
                }
                callback(true, data);
              }, this),
              error: function(jqXHR, status, error) {
                callback(false, error);
              }
            });
          } else {
            console.debug("No user session saved");
            this.logoutCloud();
          }
        } else {
          callback(this.userId);
        }
      },
      deleteItem: function(remoteDir, path, userId) {
        userId = userId || getCloudLoginId();
        var options = {};
        options.url = this.buildFSUserUrl(userId, remoteDir, path);
        options.type = "DELETE";
        console.debug("Delete item from " + remoteDir + " with " + options.url);
        return doRequest(options);
      },
      getAssets: function() {
        var options = {
          "remoteDir": "records",
          "extras": "assets/images/",
          "filters": {"frmt": "url"}
        };
        return this.getItems(options);
      },
      getBaseUrl: function() {
        return this.baseUrl;
      },
      getCloudProviderUrl: function() {
        return this.cloudProviderUrl;
      },
      getEditor: function(options) {
        options.contentType = 'html';
        return this.getItem(options);
      },
      getFSItems: function(remoteDir, userId) {
        userId = userId || getCloudLoginId();
        var options = {};
        options.url = this.buildFSUserUrl(userId, remoteDir);
        options.type = "GET";
        console.debug("Get items of " + remoteDir + " with " + options.url);
        return doRequest(options);
      },
      getFSItem: function(options) {
        var userId = options.userId || getCloudLoginId();
        var requestOptions = {};
        requestOptions.url = this.buildFSUserUrl(userId, options.remoteDir, options.item);
        requestOptions.type = "GET";
        console.debug("Get item " + options.item + " of " + options.remoteDir + " with " + requestOptions.url);
        return doRequest(requestOptions);
      },
      getItem: function(options) {
        var userId = options.userId || getCloudLoginId();
        var requestOptions = {};
        requestOptions.contentType = options.contentType || 'json';
        requestOptions.url = this.buildUserUrl(userId, options.remoteDir, options.item);
        requestOptions.data = options.data;
        requestOptions.type = "GET";
        console.debug("Get item " + options.item + " of " + options.remoteDir + " with " + requestOptions.url);
        return doRequest(requestOptions);
      },
      getItems: function(options) {
        var userId = options.userId || getCloudLoginId();
        var requestOptions = {};
        requestOptions.type = "GET";
        requestOptions.url = this.buildUserUrl(userId, options.remoteDir, options.extras);
        requestOptions.data = options.filters || {};
        console.debug("Get items of " + options.remoteDir + " with " + requestOptions.url);
        console.log("with filters " + JSON.stringify(requestOptions.data));
        return doRequest(requestOptions);
      },
      getParameters: function() {
        var query = window.location.search.substring(1);
        var queryString = {};
        var params = query.split("&");
        for (var i = 0; i < params.length; i++) {
          var pair = params[i].split("=");
          if (typeof queryString[pair[0]] === "undefined") {
            queryString[pair[0]] = pair[1];
          } else if (typeof queryString[pair[0]] === "string") {
            var arr = [queryString[pair[0]], pair[1]];
            queryString[pair[0]] = arr;
          } else {
            queryString[pair[0]].push(pair[1]);
          }
        }
        return queryString;
      },
      getProviders: function(response) {
        var options = {
          type: "GET",
          url: this.getCloudProviderUrl() + "/auth/providers"
        };
        return doRequest(options);
      },
      getProvider: function() {
        return localStorage.getItem('cloud-provider') || 'local';
      },
      getUser: function() {
        return this.user;
      },
      getUserId: function() {
        var id = getCloudLoginId();
        return id;
      },
      loginAsyncCloud: function(provider, cb, cbrowser) {
        doLogin(provider, cb, cbrowser);
      },
      loginCloud: function() {
        if (!("uid" in this.getParameters())) {
          var loginUrl = this.getCloudProviderUrl() + '/auth/' + this.getProvider() + "?callback=" + $(location).attr('href');
          $.getJSON(loginUrl, function(data) {
            $(location).attr('href', data.url);
          });
        }
      },
      logoutCloud: function() {
        clearCloudLogin();
      },
      objectToURL: function(obj) {
        var params = [];
        if (typeof(obj) === 'object') {
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              params.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
            }
          }
        }
        return params.join("&");
      },
      saveItem: function(options) {
        var path,
            requestOptions = {};
        var userId = options.userId || getCloudLoginId();
        requestOptions.type = "POST";
        if (options.remoteDir === "records") {
          requestOptions.data = JSON.stringify(options.data, undefined, 2);
          path = options.path;
          requestOptions.url = this.buildUserUrl(userId, options.remoteDir, path, options.urlParams);
        } else if (options.remoteDir === "editors") {
          requestOptions.data = options.data;
          path = options.path;
          requestOptions.url = this.buildUserUrl(userId, options.remoteDir, path, options.urlParams);
        } else {
          requestOptions.url = this.buildFSUserUrl(userId, options.remoteDir, path, options.urlParams);
        }
        console.debug("Post item to " + options.remoteDir + " with " + requestOptions.url);
        return doRequest(requestOptions);
      },
      setBaseUrl: function(url) {
        this.baseUrl = url;
      },
      setCloudLogin: function(userId, cursor) {
        this.user = {
          'id': userId,
          'cursor': cursor
        };
        localStorage.setItem('cloud-user', JSON.stringify(this.user));
      },
      setCloudProviderUrl: function(url) {
        this.cloudProviderUrl = url + "/" + this.version + "/pcapi";
      },
      setProvider: function(provider) {
        localStorage.setItem('cloud-provider', provider);
      },
      setUserId: function(userId) {
        this.userId = userId;
      },
      setVersion: function(version) {
        this.version = version;
      },
      updateItem: function(options) {
        var path,
            requestOptions = {};
        requestOptions.type = "PUT";
        var userId = options.userId || getCloudLoginId();
        if (options.remoteDir === "records") {
          requestOptions.data = JSON.stringify(options.data, undefined, 2);
          path = options.path;
          requestOptions.url = this.buildUserUrl(userId, options.remoteDir, path, options.urlParams);
        } else if (options.remoteDir === "editors") {
          requestOptions.data = options.data;
          path = options.path;
          requestOptions.url = this.buildUserUrl(userId, options.remoteDir, path, options.urlParams);
        } else {
          requestOptions.url = this.buildFSUserUrl(userId, options.remoteDir, path, options.urlParams);
        }
        console.debug("PUT item to " + options.remoteDir + " with " + requestOptions.url);
        return doRequest(requestOptions);
      },
      uploadFile: function(options, type) {
        type = type || "POST";
        var userId = options.userid || getCloudLoginId();
        var requestOptions = {"type": type};
        requestOptions.url = this.buildFSUserUrl(userId, options.remoteDir, options.path);
        if (reservedDirs.indexOf(options.remoteDir) > -1) {
          requestOptions.url = this.buildUserUrl(userId, options.remoteDir, options.path, options.urlParams);
        }
        console.debug("Upload item " + options.file.name + " to " + options.remoteDir + " with " + requestOptions.url);
        requestOptions.data = options.file;
        requestOptions.contentType = false;
        requestOptions.processData = false;
        requestOptions.beforeSend = function(request) {
          request.setRequestHeader("Content-Type", options.file.type);
        };
        return doRequest(requestOptions);
      }
    };
    return _this;
  })();
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = pcapi;
  } else {
    if (typeof define === "function" && define.amd) {
      define(["pcapi"], function() {
        return pcapi;
      });
    }
  }
  if (typeof window === "object" && typeof window.document === "object") {
    window.pcapi = pcapi;
  }
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("6", ["2b"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('2b');
  global.define = __define;
  return module.exports;
});

$__System.register("10", [], function($__export) {
  "use strict";
  var __moduleName = "10";
  var DataStorage;
  return {
    setters: [],
    execute: function() {
      DataStorage = function() {
        function DataStorage(el) {
          this.formKey = "current-form";
          if (el) {
            this.formKey = el;
          }
        }
        return ($traceurRuntime.createClass)(DataStorage, {
          setData: function(data) {
            if (localStorage) {
              localStorage.setItem(this.formKey, JSON.stringify(data));
            } else {
              console.log("There is no localStorage");
            }
          },
          getData: function() {
            if (localStorage) {
              return JSON.parse(localStorage.getItem(this.formKey));
            } else {
              console.log("There is no localStorage");
              return '';
            }
          },
          searchForFieldId: function(id) {
            return this.searchForFieldProperty("id", id);
          },
          searchForFieldProperty: function(key, value) {
            return this.getData().fields.find(function(x) {
              return x[key] === value;
            });
          },
          searchForFieldProperties: function(key, value) {
            return this.getData().fields.properties.find(function(x) {
              return x[key] === value;
            });
          },
          updateField: function(id, key, value) {
            var data = this.getData();
            var index = data.fields.findIndex(function(x) {
              return x.id === id;
            });
            data.fields[index].properties[key] = value;
            this.setData(data);
          },
          addField: function(key, value) {
            var data = this.getData();
            data[key] = value;
            this.setData(data);
          },
          getField: function(key) {
            var data = this.getData();
            if (data) {
              return data[key];
            }
            return '';
          },
          removeField: function(key) {
            var data = this.getData();
            delete data[key];
            this.setData(data);
          }
        }, {});
      }();
      $__export('default', DataStorage);
    }
  };
});

$__System.register("2a", ["9", "5", "27"], function($__export) {
  "use strict";
  var __moduleName = "2a";
  var $,
      utils,
      _,
      Convertor;
  return {
    setters: [function($__m) {
      $ = $__m.default;
    }, function($__m) {
      utils = $__m;
    }, function($__m) {
      _ = $__m.default;
    }],
    execute: function() {
      Convertor = function() {
        function Convertor() {
          this.form = {};
        }
        return ($traceurRuntime.createClass)(Convertor, {
          getForm: function($html) {
            var self = this;
            var form = {};
            form.title = $html.find(".fieldcontain-general").find('input[name="label"]').val();
            form.geoms = [];
            form.recordLayout = {"headers": []};
            form.fields = [];
            form.extra = [];
            $html.find('input[name="geometryType"]:checked').each(function() {
              form.geoms.push($(this).val());
            });
            var values = [];
            $html.find('input[name="attribute-value"]').each(function() {
              values.push($(this).val());
            });
            $html.find('input[name="attribute-key"]').each(function(index, element) {
              var value = $(element).val();
              var extra = {value: values[index]};
              form.extra.push(extra);
            });
            $html.find('input[name="header"]:checked').each(function() {
              form.recordLayout.headers.push($(this).closest(".fieldcontain").attr("id"));
            });
            $html.find(".fieldcontain").each(function() {
              var $this = $(this);
              if (!$this.hasClass("fieldcontain-general")) {
                var field = {
                  "id": $this.attr("id"),
                  "type": $this.data("type"),
                  "required": false,
                  "persistent": false,
                  "properties": {}
                };
                form.fields.push(self.fieldToJSON(field, $this));
              }
            });
            return form;
          },
          fieldToJSON: function(field, html) {
            field.label = html.find('input[name="label"]').val();
            var createOptions = function(html, id) {
              return html.find('input[name="' + id + '"]').toArray().map(function(element) {
                var $el = $(element);
                var $img = $el.closest('.form-inline').find('img');
                var option = {"value": $el.val()};
                if ($img.length > 0) {
                  option.image = {};
                  option.image.src = utils.getFilenameFromURL($img.attr('src'));
                }
                return option;
              });
            };
            switch (field.type) {
              case 'text':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.prefix = html.find('input[name="prefix"]').val();
                field.properties.placeholder = html.find('input[name="placeholder"]').val();
                field.properties["max-chars"] = html.find('input[name="max-chars"]').val();
                break;
              case 'textarea':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.placeholder = html.find('input[name="placeholder"]').val();
                break;
              case 'range':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.step = html.find('input[name="step"]').val();
                field.properties.min = html.find('input[name="min"]').val();
                field.properties.max = html.find('input[name="max"]').val();
                break;
              case 'checkbox':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.other = html.find('input[name="other"]').is(':checked');
                field.properties.options = createOptions(html, field.id);
                break;
              case 'radio':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.other = html.find('input[name="other"]').is(':checked');
                field.properties.options = createOptions(html, field.id);
                break;
              case 'select':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.options = createOptions(html, field.id);
                break;
              case 'dtree':
                var $a = html.find('.dtree-url');
                field.properties.filename = $a.text();
                break;
              case 'image':
                field.required = html.find('input[name="required"]').is(':checked');
                field.properties["multi-image"] = html.find('input[name="multi-image"]').is(':checked');
                field.properties.los = html.find('input[name="los"]').is(':checked');
                field.properties.blur = html.find('input[name="blur"]').val();
                break;
              case 'audio':
                field.required = html.find('input[name="required"]').is(':checked');
                break;
              case 'gps':
                field.required = html.find('input[name="required"]').is(':checked');
                field.properties["gps-background"] = html.find('input[name="gps-background"]').is(':checked');
                break;
              case 'warning':
                field.properties.placeholder = html.find('textarea').val();
                break;
              case 'section':
                break;
              case undefined:
                break;
            }
            return field;
          },
          HTMLtoJSON: function(html, title) {
            var $form = $(html);
            var form = {};
            var layout = null;
            var section = null;
            var recordLayout = null;
            var fieldsSelector;
            var ignoreFields;
            var self = this;
            if (title) {
              form.title = title;
            } else {
              form.title = $form.data('title') || '';
            }
            form.geoms = ["point"];
            var geomValues = $form.data("record-geometry");
            if (geomValues) {
              form.geoms = $form.data("record-geometry").split(",");
            }
            form.fields = [];
            ignoreFields = ['.fieldcontain-geometryType', '#save-cancel-editor-buttons'];
            fieldsSelector = '.fieldcontain' + ignoreFields.map(function(v) {
              return ':not(' + v + ')';
            }).join('');
            $form.find(fieldsSelector).each(function(i, element) {
              var $field = $(element);
              var $input;
              var required;
              var options;
              var fieldId;
              var type;
              var visibility;
              var field = null;
              var $fieldId = $field.attr("id").replace(/fieldcontain-|form-/g, "");
              var matched = /(.*?)-[0-9]+$/.exec($fieldId);
              if (matched === null) {
                console.log('warning: ' + $field.attr('id') + ' not supported');
                return;
              }
              var visibilityRule = $field.data("visibility");
              if (visibilityRule) {
                visibility = self.parseRule(visibilityRule);
              }
              fieldId = matched[0].replace("multiimage", "image");
              type = matched[1];
              switch (type) {
                case 'text':
                  $input = $field.find('input');
                  field = {
                    label: $field.find('label').text(),
                    type: type,
                    required: $input.attr('required') !== undefined,
                    persistent: $field.data('persistent') === 'on',
                    properties: {
                      prefix: $input.val(),
                      placeholder: $input.attr("placeholder"),
                      'max-chars': $input.attr("maxlength")
                    }
                  };
                  break;
                case 'textarea':
                  $input = $field.find('textarea');
                  field = {
                    label: $field.find('label').text(),
                    type: type,
                    required: $input.attr('required') !== undefined,
                    persistent: $field.data('persistent') === 'on',
                    properties: {placeholder: $input.attr("placeholder")}
                  };
                  break;
                case 'range':
                  $input = $field.find('input');
                  field = {
                    label: $field.find('label').text(),
                    type: type,
                    required: $input.attr('required') !== undefined,
                    persistent: $field.data('persistent') === 'on',
                    properties: {
                      step: $input.attr('step'),
                      min: $input.attr('min'),
                      max: $input.attr('max')
                    }
                  };
                  break;
                case 'checkbox':
                  $input = $field.find('input[type="checkbox"]');
                  options = $input.map(function(i, element) {
                    var $checkbox = $(element);
                    var checkbox = {"value": $checkbox.val()};
                    var $img = $checkbox.prev().find('img');
                    if ($img.is('img')) {
                      checkbox.image = {"src": $img.attr("src")};
                    }
                    return checkbox;
                  });
                  required = $input.is(function() {
                    return $(this).attr('required') !== undefined;
                  });
                  field = {
                    label: $field.find('legend').text(),
                    type: type,
                    required: required,
                    persistent: $field.data('persistent') === 'on',
                    properties: {options: Array.prototype.slice.apply(options)}
                  };
                  break;
                case 'radio':
                  $input = $field.find('input[type="radio"]');
                  options = $input.map(function(i, element) {
                    var $radio = $(element);
                    var $img = $radio.prev().find('img');
                    var radio = {"value": $radio.val()};
                    if ($img.is('img')) {
                      radio.image = {"src": $img.attr("src")};
                    }
                    return radio;
                  });
                  required = $input.is(function() {
                    return $(this).attr('required') !== undefined;
                  });
                  field = {
                    label: $field.find('legend').text(),
                    type: type,
                    required: required,
                    persistent: $field.data('persistent') === 'on',
                    properties: {options: Array.prototype.slice.apply(options)}
                  };
                  break;
                case 'select':
                  $input = $field.find('select');
                  options = $input.find('option').map(function(i, element) {
                    return $(element).val();
                  });
                  field = {
                    label: $field.find('legend').text(),
                    type: type,
                    required: $input.attr('required') !== undefined,
                    persistent: $field.data('persistent') === 'on',
                    properties: {options: Array.prototype.slice.apply(options)}
                  };
                  break;
                case 'dtree':
                  $input = $field.find('input[type="hidden"]');
                  field = {
                    label: $field.find('label').text(),
                    type: type,
                    required: false,
                    persistent: $field.data('persistent') === 'on',
                    properties: {filename: $input.data('dtree')}
                  };
                  break;
                case 'image':
                  $input = $field.find('input');
                  field = {
                    label: $field.find('label').text(),
                    type: type,
                    required: $input.attr("required") !== undefined,
                    persistent: false,
                    properties: {
                      los: $input.attr('class') === 'camera-va',
                      'multi-image': false
                    }
                  };
                  break;
                case 'multiimage':
                  $input = $field.find('input');
                  field = {
                    label: $field.find('label').text(),
                    type: "image",
                    required: $input.attr('required') !== undefined,
                    persistent: false,
                    properties: {
                      los: $input.attr('class') === 'camera-va',
                      'multi-image': true
                    }
                  };
                  break;
                case 'audio':
                  $input = $field.find('input');
                  field = {
                    label: $field.find('label').text(),
                    type: type,
                    required: $input.attr('required') !== undefined,
                    persistent: false,
                    properties: {}
                  };
                  break;
                case 'gps':
                  $input = $field.find('input');
                  field = {
                    label: $field.find('label').text(),
                    type: type,
                    required: $input.attr('required') !== undefined,
                    persistent: false,
                    properties: {'gps-background': $input.find('input[name="gps-background"]').is(':checked')}
                  };
                  break;
                case 'warning':
                  $input = $field.find('textarea');
                  field = {
                    label: $field.find('label').text(),
                    type: type,
                    required: $input.attr('required') !== undefined,
                    persistent: false,
                    properties: {placeholder: $input.attr("placeholder")}
                  };
                  break;
                case 'section':
                  layout = layout || {elements: []};
                  if (section !== null) {
                    layout.elements.push(section);
                  }
                  section = {
                    id: fieldId,
                    type: type,
                    title: $field.find('h3').text(),
                    fields: []
                  };
                  break;
              }
              if (visibility) {
                field.properties.visibility = visibility;
              }
              if (field !== null) {
                field.id = fieldId;
                form.fields.push(field);
                if (section !== null) {
                  section.fields.push(fieldId);
                }
              }
            });
            if (layout !== null) {
              form.layout = layout;
            }
            return form;
          },
          parseRule: function(rule) {
            var field,
                operations,
                operation,
                value,
                comparator,
                matches;
            var fieldRegExp,
                opsRegExp,
                valueRegExp,
                ruleRegExp;
            operations = {
              equal: function(a, b) {
                return a === b;
              },
              notEqual: function(a, b) {
                return a !== b;
              },
              greaterThan: function(a, b) {
                return Number(a) > Number(b);
              },
              smallerThan: function(a, b) {
                return Number(a) < Number(b);
              }
            };
            fieldRegExp = '(.*)';
            opsRegExp = '((?:' + _(operations).keys().join(')|(?:') + '))';
            valueRegExp = '(?:\'(.*)\')';
            ruleRegExp = fieldRegExp + '\\s+' + opsRegExp + '\\s+' + valueRegExp;
            matches = (new RegExp(ruleRegExp)).exec(rule);
            if (matches && matches.length === 4) {
              field = matches[1];
              operation = matches[2];
              value = matches[3];
            } else {
              console.warn('Malformed rule: ' + rule);
              return null;
            }
            if (operations.hasOwnProperty(operation)) {
              comparator = operations[operation];
            } else {
              console.warn('Invalid operation: ' + operation);
              return null;
            }
            return {
              id: field,
              operator: comparator,
              answer: value
            };
          }
        }, {});
      }();
      $__export('default', Convertor);
    }
  };
});

$__System.register("28", ["2a", "10"], function($__export) {
  "use strict";
  var __moduleName = "28";
  var Convertor,
      DataStorage;
  function saveData(element) {
    var convertor = new Convertor();
    var formInJSON = convertor.getForm($(element));
    var dataStorage = new DataStorage();
    var data = dataStorage.getData();
    if (data !== null) {
      formInJSON = Object.assign(data, formInJSON);
    }
    dataStorage.setData(formInJSON);
    return formInJSON;
  }
  return {
    setters: [function($__m) {
      Convertor = $__m.default;
    }, function($__m) {
      DataStorage = $__m.default;
    }],
    execute: function() {
      $__export("saveData", saveData);
    }
  };
});

$__System.registerDynamic("2c", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(obj) {
    var __t,
        __p = '',
        __j = Array.prototype.join,
        print = function() {
          __p += __j.call(arguments, '');
        };
    with (obj || {}) {
      __p += '<div class="modal fade" tabindex="-1" role="dialog" id="' + ((__t = (id)) == null ? '' : __t) + '">\n  <div class="modal-dialog ' + ((__t = (size)) == null ? '' : __t) + '">\n    <div class="modal-content">\n      <div class="modal-header">\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n        <h4 class="modal-title">' + ((__t = (title)) == null ? '' : __t) + '</h4>\n      </div>\n      <div class="modal-body">\n        ' + ((__t = (body)) == null ? '' : __t) + '\n      </div>\n      <div class="modal-footer">\n        ' + ((__t = (footer)) == null ? '' : __t) + '\n      </div>\n    </div><!-- /.modal-content -->\n  </div><!-- /.modal-dialog -->\n</div><!-- /.modal -->\n';
    }
    return __p;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("2d", ["9"], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, "$", null);
  (function() {
    "format global";
    "deps jquery";
    "exports $";
    if (typeof jQuery === 'undefined') {
      throw new Error('Bootstrap\'s JavaScript requires jQuery');
    }
    +function($) {
      'use strict';
      var version = $.fn.jquery.split(' ')[0].split('.');
      if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 2)) {
        throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 3');
      }
    }(jQuery);
    +function($) {
      'use strict';
      function transitionEnd() {
        var el = document.createElement('bootstrap');
        var transEndEventNames = {
          WebkitTransition: 'webkitTransitionEnd',
          MozTransition: 'transitionend',
          OTransition: 'oTransitionEnd otransitionend',
          transition: 'transitionend'
        };
        for (var name in transEndEventNames) {
          if (el.style[name] !== undefined) {
            return {end: transEndEventNames[name]};
          }
        }
        return false;
      }
      $.fn.emulateTransitionEnd = function(duration) {
        var called = false;
        var $el = this;
        $(this).one('bsTransitionEnd', function() {
          called = true;
        });
        var callback = function() {
          if (!called)
            $($el).trigger($.support.transition.end);
        };
        setTimeout(callback, duration);
        return this;
      };
      $(function() {
        $.support.transition = transitionEnd();
        if (!$.support.transition)
          return;
        $.event.special.bsTransitionEnd = {
          bindType: $.support.transition.end,
          delegateType: $.support.transition.end,
          handle: function(e) {
            if ($(e.target).is(this))
              return e.handleObj.handler.apply(this, arguments);
          }
        };
      });
    }(jQuery);
    +function($) {
      'use strict';
      var dismiss = '[data-dismiss="alert"]';
      var Alert = function(el) {
        $(el).on('click', dismiss, this.close);
      };
      Alert.VERSION = '3.3.6';
      Alert.TRANSITION_DURATION = 150;
      Alert.prototype.close = function(e) {
        var $this = $(this);
        var selector = $this.attr('data-target');
        if (!selector) {
          selector = $this.attr('href');
          selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
        }
        var $parent = $(selector);
        if (e)
          e.preventDefault();
        if (!$parent.length) {
          $parent = $this.closest('.alert');
        }
        $parent.trigger(e = $.Event('close.bs.alert'));
        if (e.isDefaultPrevented())
          return;
        $parent.removeClass('in');
        function removeElement() {
          $parent.detach().trigger('closed.bs.alert').remove();
        }
        $.support.transition && $parent.hasClass('fade') ? $parent.one('bsTransitionEnd', removeElement).emulateTransitionEnd(Alert.TRANSITION_DURATION) : removeElement();
      };
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.alert');
          if (!data)
            $this.data('bs.alert', (data = new Alert(this)));
          if (typeof option == 'string')
            data[option].call($this);
        });
      }
      var old = $.fn.alert;
      $.fn.alert = Plugin;
      $.fn.alert.Constructor = Alert;
      $.fn.alert.noConflict = function() {
        $.fn.alert = old;
        return this;
      };
      $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close);
    }(jQuery);
    +function($) {
      'use strict';
      var Button = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Button.DEFAULTS, options);
        this.isLoading = false;
      };
      Button.VERSION = '3.3.6';
      Button.DEFAULTS = {loadingText: 'loading...'};
      Button.prototype.setState = function(state) {
        var d = 'disabled';
        var $el = this.$element;
        var val = $el.is('input') ? 'val' : 'html';
        var data = $el.data();
        state += 'Text';
        if (data.resetText == null)
          $el.data('resetText', $el[val]());
        setTimeout($.proxy(function() {
          $el[val](data[state] == null ? this.options[state] : data[state]);
          if (state == 'loadingText') {
            this.isLoading = true;
            $el.addClass(d).attr(d, d);
          } else if (this.isLoading) {
            this.isLoading = false;
            $el.removeClass(d).removeAttr(d);
          }
        }, this), 0);
      };
      Button.prototype.toggle = function() {
        var changed = true;
        var $parent = this.$element.closest('[data-toggle="buttons"]');
        if ($parent.length) {
          var $input = this.$element.find('input');
          if ($input.prop('type') == 'radio') {
            if ($input.prop('checked'))
              changed = false;
            $parent.find('.active').removeClass('active');
            this.$element.addClass('active');
          } else if ($input.prop('type') == 'checkbox') {
            if (($input.prop('checked')) !== this.$element.hasClass('active'))
              changed = false;
            this.$element.toggleClass('active');
          }
          $input.prop('checked', this.$element.hasClass('active'));
          if (changed)
            $input.trigger('change');
        } else {
          this.$element.attr('aria-pressed', !this.$element.hasClass('active'));
          this.$element.toggleClass('active');
        }
      };
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.button');
          var options = typeof option == 'object' && option;
          if (!data)
            $this.data('bs.button', (data = new Button(this, options)));
          if (option == 'toggle')
            data.toggle();
          else if (option)
            data.setState(option);
        });
      }
      var old = $.fn.button;
      $.fn.button = Plugin;
      $.fn.button.Constructor = Button;
      $.fn.button.noConflict = function() {
        $.fn.button = old;
        return this;
      };
      $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function(e) {
        var $btn = $(e.target);
        if (!$btn.hasClass('btn'))
          $btn = $btn.closest('.btn');
        Plugin.call($btn, 'toggle');
        if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]')))
          e.preventDefault();
      }).on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function(e) {
        $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type));
      });
    }(jQuery);
    +function($) {
      'use strict';
      var Carousel = function(element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.carousel-indicators');
        this.options = options;
        this.paused = null;
        this.sliding = null;
        this.interval = null;
        this.$active = null;
        this.$items = null;
        this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this));
        this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element.on('mouseenter.bs.carousel', $.proxy(this.pause, this)).on('mouseleave.bs.carousel', $.proxy(this.cycle, this));
      };
      Carousel.VERSION = '3.3.6';
      Carousel.TRANSITION_DURATION = 600;
      Carousel.DEFAULTS = {
        interval: 5000,
        pause: 'hover',
        wrap: true,
        keyboard: true
      };
      Carousel.prototype.keydown = function(e) {
        if (/input|textarea/i.test(e.target.tagName))
          return;
        switch (e.which) {
          case 37:
            this.prev();
            break;
          case 39:
            this.next();
            break;
          default:
            return;
        }
        e.preventDefault();
      };
      Carousel.prototype.cycle = function(e) {
        e || (this.paused = false);
        this.interval && clearInterval(this.interval);
        this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
        return this;
      };
      Carousel.prototype.getItemIndex = function(item) {
        this.$items = item.parent().children('.item');
        return this.$items.index(item || this.$active);
      };
      Carousel.prototype.getItemForDirection = function(direction, active) {
        var activeIndex = this.getItemIndex(active);
        var willWrap = (direction == 'prev' && activeIndex === 0) || (direction == 'next' && activeIndex == (this.$items.length - 1));
        if (willWrap && !this.options.wrap)
          return active;
        var delta = direction == 'prev' ? -1 : 1;
        var itemIndex = (activeIndex + delta) % this.$items.length;
        return this.$items.eq(itemIndex);
      };
      Carousel.prototype.to = function(pos) {
        var that = this;
        var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'));
        if (pos > (this.$items.length - 1) || pos < 0)
          return;
        if (this.sliding)
          return this.$element.one('slid.bs.carousel', function() {
            that.to(pos);
          });
        if (activeIndex == pos)
          return this.pause().cycle();
        return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos));
      };
      Carousel.prototype.pause = function(e) {
        e || (this.paused = true);
        if (this.$element.find('.next, .prev').length && $.support.transition) {
          this.$element.trigger($.support.transition.end);
          this.cycle(true);
        }
        this.interval = clearInterval(this.interval);
        return this;
      };
      Carousel.prototype.next = function() {
        if (this.sliding)
          return;
        return this.slide('next');
      };
      Carousel.prototype.prev = function() {
        if (this.sliding)
          return;
        return this.slide('prev');
      };
      Carousel.prototype.slide = function(type, next) {
        var $active = this.$element.find('.item.active');
        var $next = next || this.getItemForDirection(type, $active);
        var isCycling = this.interval;
        var direction = type == 'next' ? 'left' : 'right';
        var that = this;
        if ($next.hasClass('active'))
          return (this.sliding = false);
        var relatedTarget = $next[0];
        var slideEvent = $.Event('slide.bs.carousel', {
          relatedTarget: relatedTarget,
          direction: direction
        });
        this.$element.trigger(slideEvent);
        if (slideEvent.isDefaultPrevented())
          return;
        this.sliding = true;
        isCycling && this.pause();
        if (this.$indicators.length) {
          this.$indicators.find('.active').removeClass('active');
          var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
          $nextIndicator && $nextIndicator.addClass('active');
        }
        var slidEvent = $.Event('slid.bs.carousel', {
          relatedTarget: relatedTarget,
          direction: direction
        });
        if ($.support.transition && this.$element.hasClass('slide')) {
          $next.addClass(type);
          $next[0].offsetWidth;
          $active.addClass(direction);
          $next.addClass(direction);
          $active.one('bsTransitionEnd', function() {
            $next.removeClass([type, direction].join(' ')).addClass('active');
            $active.removeClass(['active', direction].join(' '));
            that.sliding = false;
            setTimeout(function() {
              that.$element.trigger(slidEvent);
            }, 0);
          }).emulateTransitionEnd(Carousel.TRANSITION_DURATION);
        } else {
          $active.removeClass('active');
          $next.addClass('active');
          this.sliding = false;
          this.$element.trigger(slidEvent);
        }
        isCycling && this.cycle();
        return this;
      };
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.carousel');
          var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option);
          var action = typeof option == 'string' ? option : options.slide;
          if (!data)
            $this.data('bs.carousel', (data = new Carousel(this, options)));
          if (typeof option == 'number')
            data.to(option);
          else if (action)
            data[action]();
          else if (options.interval)
            data.pause().cycle();
        });
      }
      var old = $.fn.carousel;
      $.fn.carousel = Plugin;
      $.fn.carousel.Constructor = Carousel;
      $.fn.carousel.noConflict = function() {
        $.fn.carousel = old;
        return this;
      };
      var clickHandler = function(e) {
        var href;
        var $this = $(this);
        var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''));
        if (!$target.hasClass('carousel'))
          return;
        var options = $.extend({}, $target.data(), $this.data());
        var slideIndex = $this.attr('data-slide-to');
        if (slideIndex)
          options.interval = false;
        Plugin.call($target, options);
        if (slideIndex) {
          $target.data('bs.carousel').to(slideIndex);
        }
        e.preventDefault();
      };
      $(document).on('click.bs.carousel.data-api', '[data-slide]', clickHandler).on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler);
      $(window).on('load', function() {
        $('[data-ride="carousel"]').each(function() {
          var $carousel = $(this);
          Plugin.call($carousel, $carousel.data());
        });
      });
    }(jQuery);
    +function($) {
      'use strict';
      var Collapse = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Collapse.DEFAULTS, options);
        this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' + '[data-toggle="collapse"][data-target="#' + element.id + '"]');
        this.transitioning = null;
        if (this.options.parent) {
          this.$parent = this.getParent();
        } else {
          this.addAriaAndCollapsedClass(this.$element, this.$trigger);
        }
        if (this.options.toggle)
          this.toggle();
      };
      Collapse.VERSION = '3.3.6';
      Collapse.TRANSITION_DURATION = 350;
      Collapse.DEFAULTS = {toggle: true};
      Collapse.prototype.dimension = function() {
        var hasWidth = this.$element.hasClass('width');
        return hasWidth ? 'width' : 'height';
      };
      Collapse.prototype.show = function() {
        if (this.transitioning || this.$element.hasClass('in'))
          return;
        var activesData;
        var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing');
        if (actives && actives.length) {
          activesData = actives.data('bs.collapse');
          if (activesData && activesData.transitioning)
            return;
        }
        var startEvent = $.Event('show.bs.collapse');
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented())
          return;
        if (actives && actives.length) {
          Plugin.call(actives, 'hide');
          activesData || actives.data('bs.collapse', null);
        }
        var dimension = this.dimension();
        this.$element.removeClass('collapse').addClass('collapsing')[dimension](0).attr('aria-expanded', true);
        this.$trigger.removeClass('collapsed').attr('aria-expanded', true);
        this.transitioning = 1;
        var complete = function() {
          this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('');
          this.transitioning = 0;
          this.$element.trigger('shown.bs.collapse');
        };
        if (!$.support.transition)
          return complete.call(this);
        var scrollSize = $.camelCase(['scroll', dimension].join('-'));
        this.$element.one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize]);
      };
      Collapse.prototype.hide = function() {
        if (this.transitioning || !this.$element.hasClass('in'))
          return;
        var startEvent = $.Event('hide.bs.collapse');
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented())
          return;
        var dimension = this.dimension();
        this.$element[dimension](this.$element[dimension]())[0].offsetHeight;
        this.$element.addClass('collapsing').removeClass('collapse in').attr('aria-expanded', false);
        this.$trigger.addClass('collapsed').attr('aria-expanded', false);
        this.transitioning = 1;
        var complete = function() {
          this.transitioning = 0;
          this.$element.removeClass('collapsing').addClass('collapse').trigger('hidden.bs.collapse');
        };
        if (!$.support.transition)
          return complete.call(this);
        this.$element[dimension](0).one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION);
      };
      Collapse.prototype.toggle = function() {
        this[this.$element.hasClass('in') ? 'hide' : 'show']();
      };
      Collapse.prototype.getParent = function() {
        return $(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each($.proxy(function(i, element) {
          var $element = $(element);
          this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element);
        }, this)).end();
      };
      Collapse.prototype.addAriaAndCollapsedClass = function($element, $trigger) {
        var isOpen = $element.hasClass('in');
        $element.attr('aria-expanded', isOpen);
        $trigger.toggleClass('collapsed', !isOpen).attr('aria-expanded', isOpen);
      };
      function getTargetFromTrigger($trigger) {
        var href;
        var target = $trigger.attr('data-target') || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '');
        return $(target);
      }
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.collapse');
          var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option);
          if (!data && options.toggle && /show|hide/.test(option))
            options.toggle = false;
          if (!data)
            $this.data('bs.collapse', (data = new Collapse(this, options)));
          if (typeof option == 'string')
            data[option]();
        });
      }
      var old = $.fn.collapse;
      $.fn.collapse = Plugin;
      $.fn.collapse.Constructor = Collapse;
      $.fn.collapse.noConflict = function() {
        $.fn.collapse = old;
        return this;
      };
      $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function(e) {
        var $this = $(this);
        if (!$this.attr('data-target'))
          e.preventDefault();
        var $target = getTargetFromTrigger($this);
        var data = $target.data('bs.collapse');
        var option = data ? 'toggle' : $this.data();
        Plugin.call($target, option);
      });
    }(jQuery);
    +function($) {
      'use strict';
      var backdrop = '.dropdown-backdrop';
      var toggle = '[data-toggle="dropdown"]';
      var Dropdown = function(element) {
        $(element).on('click.bs.dropdown', this.toggle);
      };
      Dropdown.VERSION = '3.3.6';
      function getParent($this) {
        var selector = $this.attr('data-target');
        if (!selector) {
          selector = $this.attr('href');
          selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '');
        }
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
      }
      function clearMenus(e) {
        if (e && e.which === 3)
          return;
        $(backdrop).remove();
        $(toggle).each(function() {
          var $this = $(this);
          var $parent = getParent($this);
          var relatedTarget = {relatedTarget: this};
          if (!$parent.hasClass('open'))
            return;
          if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target))
            return;
          $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget));
          if (e.isDefaultPrevented())
            return;
          $this.attr('aria-expanded', 'false');
          $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget));
        });
      }
      Dropdown.prototype.toggle = function(e) {
        var $this = $(this);
        if ($this.is('.disabled, :disabled'))
          return;
        var $parent = getParent($this);
        var isActive = $parent.hasClass('open');
        clearMenus();
        if (!isActive) {
          if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
            $(document.createElement('div')).addClass('dropdown-backdrop').insertAfter($(this)).on('click', clearMenus);
          }
          var relatedTarget = {relatedTarget: this};
          $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget));
          if (e.isDefaultPrevented())
            return;
          $this.trigger('focus').attr('aria-expanded', 'true');
          $parent.toggleClass('open').trigger($.Event('shown.bs.dropdown', relatedTarget));
        }
        return false;
      };
      Dropdown.prototype.keydown = function(e) {
        if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName))
          return;
        var $this = $(this);
        e.preventDefault();
        e.stopPropagation();
        if ($this.is('.disabled, :disabled'))
          return;
        var $parent = getParent($this);
        var isActive = $parent.hasClass('open');
        if (!isActive && e.which != 27 || isActive && e.which == 27) {
          if (e.which == 27)
            $parent.find(toggle).trigger('focus');
          return $this.trigger('click');
        }
        var desc = ' li:not(.disabled):visible a';
        var $items = $parent.find('.dropdown-menu' + desc);
        if (!$items.length)
          return;
        var index = $items.index(e.target);
        if (e.which == 38 && index > 0)
          index--;
        if (e.which == 40 && index < $items.length - 1)
          index++;
        if (!~index)
          index = 0;
        $items.eq(index).trigger('focus');
      };
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.dropdown');
          if (!data)
            $this.data('bs.dropdown', (data = new Dropdown(this)));
          if (typeof option == 'string')
            data[option].call($this);
        });
      }
      var old = $.fn.dropdown;
      $.fn.dropdown = Plugin;
      $.fn.dropdown.Constructor = Dropdown;
      $.fn.dropdown.noConflict = function() {
        $.fn.dropdown = old;
        return this;
      };
      $(document).on('click.bs.dropdown.data-api', clearMenus).on('click.bs.dropdown.data-api', '.dropdown form', function(e) {
        e.stopPropagation();
      }).on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown).on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown);
    }(jQuery);
    +function($) {
      'use strict';
      var Modal = function(element, options) {
        this.options = options;
        this.$body = $(document.body);
        this.$element = $(element);
        this.$dialog = this.$element.find('.modal-dialog');
        this.$backdrop = null;
        this.isShown = null;
        this.originalBodyPad = null;
        this.scrollbarWidth = 0;
        this.ignoreBackdropClick = false;
        if (this.options.remote) {
          this.$element.find('.modal-content').load(this.options.remote, $.proxy(function() {
            this.$element.trigger('loaded.bs.modal');
          }, this));
        }
      };
      Modal.VERSION = '3.3.6';
      Modal.TRANSITION_DURATION = 300;
      Modal.BACKDROP_TRANSITION_DURATION = 150;
      Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
      };
      Modal.prototype.toggle = function(_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget);
      };
      Modal.prototype.show = function(_relatedTarget) {
        var that = this;
        var e = $.Event('show.bs.modal', {relatedTarget: _relatedTarget});
        this.$element.trigger(e);
        if (this.isShown || e.isDefaultPrevented())
          return;
        this.isShown = true;
        this.checkScrollbar();
        this.setScrollbar();
        this.$body.addClass('modal-open');
        this.escape();
        this.resize();
        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));
        this.$dialog.on('mousedown.dismiss.bs.modal', function() {
          that.$element.one('mouseup.dismiss.bs.modal', function(e) {
            if ($(e.target).is(that.$element))
              that.ignoreBackdropClick = true;
          });
        });
        this.backdrop(function() {
          var transition = $.support.transition && that.$element.hasClass('fade');
          if (!that.$element.parent().length) {
            that.$element.appendTo(that.$body);
          }
          that.$element.show().scrollTop(0);
          that.adjustDialog();
          if (transition) {
            that.$element[0].offsetWidth;
          }
          that.$element.addClass('in');
          that.enforceFocus();
          var e = $.Event('shown.bs.modal', {relatedTarget: _relatedTarget});
          transition ? that.$dialog.one('bsTransitionEnd', function() {
            that.$element.trigger('focus').trigger(e);
          }).emulateTransitionEnd(Modal.TRANSITION_DURATION) : that.$element.trigger('focus').trigger(e);
        });
      };
      Modal.prototype.hide = function(e) {
        if (e)
          e.preventDefault();
        e = $.Event('hide.bs.modal');
        this.$element.trigger(e);
        if (!this.isShown || e.isDefaultPrevented())
          return;
        this.isShown = false;
        this.escape();
        this.resize();
        $(document).off('focusin.bs.modal');
        this.$element.removeClass('in').off('click.dismiss.bs.modal').off('mouseup.dismiss.bs.modal');
        this.$dialog.off('mousedown.dismiss.bs.modal');
        $.support.transition && this.$element.hasClass('fade') ? this.$element.one('bsTransitionEnd', $.proxy(this.hideModal, this)).emulateTransitionEnd(Modal.TRANSITION_DURATION) : this.hideModal();
      };
      Modal.prototype.enforceFocus = function() {
        $(document).off('focusin.bs.modal').on('focusin.bs.modal', $.proxy(function(e) {
          if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
            this.$element.trigger('focus');
          }
        }, this));
      };
      Modal.prototype.escape = function() {
        if (this.isShown && this.options.keyboard) {
          this.$element.on('keydown.dismiss.bs.modal', $.proxy(function(e) {
            e.which == 27 && this.hide();
          }, this));
        } else if (!this.isShown) {
          this.$element.off('keydown.dismiss.bs.modal');
        }
      };
      Modal.prototype.resize = function() {
        if (this.isShown) {
          $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this));
        } else {
          $(window).off('resize.bs.modal');
        }
      };
      Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide();
        this.backdrop(function() {
          that.$body.removeClass('modal-open');
          that.resetAdjustments();
          that.resetScrollbar();
          that.$element.trigger('hidden.bs.modal');
        });
      };
      Modal.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
      };
      Modal.prototype.backdrop = function(callback) {
        var that = this;
        var animate = this.$element.hasClass('fade') ? 'fade' : '';
        if (this.isShown && this.options.backdrop) {
          var doAnimate = $.support.transition && animate;
          this.$backdrop = $(document.createElement('div')).addClass('modal-backdrop ' + animate).appendTo(this.$body);
          this.$element.on('click.dismiss.bs.modal', $.proxy(function(e) {
            if (this.ignoreBackdropClick) {
              this.ignoreBackdropClick = false;
              return;
            }
            if (e.target !== e.currentTarget)
              return;
            this.options.backdrop == 'static' ? this.$element[0].focus() : this.hide();
          }, this));
          if (doAnimate)
            this.$backdrop[0].offsetWidth;
          this.$backdrop.addClass('in');
          if (!callback)
            return;
          doAnimate ? this.$backdrop.one('bsTransitionEnd', callback).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callback();
        } else if (!this.isShown && this.$backdrop) {
          this.$backdrop.removeClass('in');
          var callbackRemove = function() {
            that.removeBackdrop();
            callback && callback();
          };
          $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one('bsTransitionEnd', callbackRemove).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callbackRemove();
        } else if (callback) {
          callback();
        }
      };
      Modal.prototype.handleUpdate = function() {
        this.adjustDialog();
      };
      Modal.prototype.adjustDialog = function() {
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;
        this.$element.css({
          paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
          paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
        });
      };
      Modal.prototype.resetAdjustments = function() {
        this.$element.css({
          paddingLeft: '',
          paddingRight: ''
        });
      };
      Modal.prototype.checkScrollbar = function() {
        var fullWindowWidth = window.innerWidth;
        if (!fullWindowWidth) {
          var documentElementRect = document.documentElement.getBoundingClientRect();
          fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
        }
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
        this.scrollbarWidth = this.measureScrollbar();
      };
      Modal.prototype.setScrollbar = function() {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10);
        this.originalBodyPad = document.body.style.paddingRight || '';
        if (this.bodyIsOverflowing)
          this.$body.css('padding-right', bodyPad + this.scrollbarWidth);
      };
      Modal.prototype.resetScrollbar = function() {
        this.$body.css('padding-right', this.originalBodyPad);
      };
      Modal.prototype.measureScrollbar = function() {
        var scrollDiv = document.createElement('div');
        scrollDiv.className = 'modal-scrollbar-measure';
        this.$body.append(scrollDiv);
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        this.$body[0].removeChild(scrollDiv);
        return scrollbarWidth;
      };
      function Plugin(option, _relatedTarget) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.modal');
          var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);
          if (!data)
            $this.data('bs.modal', (data = new Modal(this, options)));
          if (typeof option == 'string')
            data[option](_relatedTarget);
          else if (options.show)
            data.show(_relatedTarget);
        });
      }
      var old = $.fn.modal;
      $.fn.modal = Plugin;
      $.fn.modal.Constructor = Modal;
      $.fn.modal.noConflict = function() {
        $.fn.modal = old;
        return this;
      };
      $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function(e) {
        var $this = $(this);
        var href = $this.attr('href');
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')));
        var option = $target.data('bs.modal') ? 'toggle' : $.extend({remote: !/#/.test(href) && href}, $target.data(), $this.data());
        if ($this.is('a'))
          e.preventDefault();
        $target.one('show.bs.modal', function(showEvent) {
          if (showEvent.isDefaultPrevented())
            return;
          $target.one('hidden.bs.modal', function() {
            $this.is(':visible') && $this.trigger('focus');
          });
        });
        Plugin.call($target, option, this);
      });
    }(jQuery);
    +function($) {
      'use strict';
      var Tooltip = function(element, options) {
        this.type = null;
        this.options = null;
        this.enabled = null;
        this.timeout = null;
        this.hoverState = null;
        this.$element = null;
        this.inState = null;
        this.init('tooltip', element, options);
      };
      Tooltip.VERSION = '3.3.6';
      Tooltip.TRANSITION_DURATION = 150;
      Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false,
        viewport: {
          selector: 'body',
          padding: 0
        }
      };
      Tooltip.prototype.init = function(type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);
        this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport));
        this.inState = {
          click: false,
          hover: false,
          focus: false
        };
        if (this.$element[0] instanceof document.constructor && !this.options.selector) {
          throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!');
        }
        var triggers = this.options.trigger.split(' ');
        for (var i = triggers.length; i--; ) {
          var trigger = triggers[i];
          if (trigger == 'click') {
            this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
          } else if (trigger != 'manual') {
            var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
            var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';
            this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
            this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
          }
        }
        this.options.selector ? (this._options = $.extend({}, this.options, {
          trigger: 'manual',
          selector: ''
        })) : this.fixTitle();
      };
      Tooltip.prototype.getDefaults = function() {
        return Tooltip.DEFAULTS;
      };
      Tooltip.prototype.getOptions = function(options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);
        if (options.delay && typeof options.delay == 'number') {
          options.delay = {
            show: options.delay,
            hide: options.delay
          };
        }
        return options;
      };
      Tooltip.prototype.getDelegateOptions = function() {
        var options = {};
        var defaults = this.getDefaults();
        this._options && $.each(this._options, function(key, value) {
          if (defaults[key] != value)
            options[key] = value;
        });
        return options;
      };
      Tooltip.prototype.enter = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);
        if (!self) {
          self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
          $(obj.currentTarget).data('bs.' + this.type, self);
        }
        if (obj instanceof $.Event) {
          self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true;
        }
        if (self.tip().hasClass('in') || self.hoverState == 'in') {
          self.hoverState = 'in';
          return;
        }
        clearTimeout(self.timeout);
        self.hoverState = 'in';
        if (!self.options.delay || !self.options.delay.show)
          return self.show();
        self.timeout = setTimeout(function() {
          if (self.hoverState == 'in')
            self.show();
        }, self.options.delay.show);
      };
      Tooltip.prototype.isInStateTrue = function() {
        for (var key in this.inState) {
          if (this.inState[key])
            return true;
        }
        return false;
      };
      Tooltip.prototype.leave = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);
        if (!self) {
          self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
          $(obj.currentTarget).data('bs.' + this.type, self);
        }
        if (obj instanceof $.Event) {
          self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false;
        }
        if (self.isInStateTrue())
          return;
        clearTimeout(self.timeout);
        self.hoverState = 'out';
        if (!self.options.delay || !self.options.delay.hide)
          return self.hide();
        self.timeout = setTimeout(function() {
          if (self.hoverState == 'out')
            self.hide();
        }, self.options.delay.hide);
      };
      Tooltip.prototype.show = function() {
        var e = $.Event('show.bs.' + this.type);
        if (this.hasContent() && this.enabled) {
          this.$element.trigger(e);
          var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
          if (e.isDefaultPrevented() || !inDom)
            return;
          var that = this;
          var $tip = this.tip();
          var tipId = this.getUID(this.type);
          this.setContent();
          $tip.attr('id', tipId);
          this.$element.attr('aria-describedby', tipId);
          if (this.options.animation)
            $tip.addClass('fade');
          var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
          var autoToken = /\s?auto?\s?/i;
          var autoPlace = autoToken.test(placement);
          if (autoPlace)
            placement = placement.replace(autoToken, '') || 'top';
          $tip.detach().css({
            top: 0,
            left: 0,
            display: 'block'
          }).addClass(placement).data('bs.' + this.type, this);
          this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
          this.$element.trigger('inserted.bs.' + this.type);
          var pos = this.getPosition();
          var actualWidth = $tip[0].offsetWidth;
          var actualHeight = $tip[0].offsetHeight;
          if (autoPlace) {
            var orgPlacement = placement;
            var viewportDim = this.getPosition(this.$viewport);
            placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' : placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' : placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' : placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' : placement;
            $tip.removeClass(orgPlacement).addClass(placement);
          }
          var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
          this.applyPlacement(calculatedOffset, placement);
          var complete = function() {
            var prevHoverState = that.hoverState;
            that.$element.trigger('shown.bs.' + that.type);
            that.hoverState = null;
            if (prevHoverState == 'out')
              that.leave(that);
          };
          $.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
        }
      };
      Tooltip.prototype.applyPlacement = function(offset, placement) {
        var $tip = this.tip();
        var width = $tip[0].offsetWidth;
        var height = $tip[0].offsetHeight;
        var marginTop = parseInt($tip.css('margin-top'), 10);
        var marginLeft = parseInt($tip.css('margin-left'), 10);
        if (isNaN(marginTop))
          marginTop = 0;
        if (isNaN(marginLeft))
          marginLeft = 0;
        offset.top += marginTop;
        offset.left += marginLeft;
        $.offset.setOffset($tip[0], $.extend({using: function(props) {
            $tip.css({
              top: Math.round(props.top),
              left: Math.round(props.left)
            });
          }}, offset), 0);
        $tip.addClass('in');
        var actualWidth = $tip[0].offsetWidth;
        var actualHeight = $tip[0].offsetHeight;
        if (placement == 'top' && actualHeight != height) {
          offset.top = offset.top + height - actualHeight;
        }
        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);
        if (delta.left)
          offset.left += delta.left;
        else
          offset.top += delta.top;
        var isVertical = /top|bottom/.test(placement);
        var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
        var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';
        $tip.offset(offset);
        this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical);
      };
      Tooltip.prototype.replaceArrow = function(delta, dimension, isVertical) {
        this.arrow().css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%').css(isVertical ? 'top' : 'left', '');
      };
      Tooltip.prototype.setContent = function() {
        var $tip = this.tip();
        var title = this.getTitle();
        $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('fade in top bottom left right');
      };
      Tooltip.prototype.hide = function(callback) {
        var that = this;
        var $tip = $(this.$tip);
        var e = $.Event('hide.bs.' + this.type);
        function complete() {
          if (that.hoverState != 'in')
            $tip.detach();
          that.$element.removeAttr('aria-describedby').trigger('hidden.bs.' + that.type);
          callback && callback();
        }
        this.$element.trigger(e);
        if (e.isDefaultPrevented())
          return;
        $tip.removeClass('in');
        $.support.transition && $tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
        this.hoverState = null;
        return this;
      };
      Tooltip.prototype.fixTitle = function() {
        var $e = this.$element;
        if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
          $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
      };
      Tooltip.prototype.hasContent = function() {
        return this.getTitle();
      };
      Tooltip.prototype.getPosition = function($element) {
        $element = $element || this.$element;
        var el = $element[0];
        var isBody = el.tagName == 'BODY';
        var elRect = el.getBoundingClientRect();
        if (elRect.width == null) {
          elRect = $.extend({}, elRect, {
            width: elRect.right - elRect.left,
            height: elRect.bottom - elRect.top
          });
        }
        var elOffset = isBody ? {
          top: 0,
          left: 0
        } : $element.offset();
        var scroll = {scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop()};
        var outerDims = isBody ? {
          width: $(window).width(),
          height: $(window).height()
        } : null;
        return $.extend({}, elRect, scroll, outerDims, elOffset);
      };
      Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? {
          top: pos.top + pos.height,
          left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == 'top' ? {
          top: pos.top - actualHeight,
          left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == 'left' ? {
          top: pos.top + pos.height / 2 - actualHeight / 2,
          left: pos.left - actualWidth
        } : {
          top: pos.top + pos.height / 2 - actualHeight / 2,
          left: pos.left + pos.width
        };
      };
      Tooltip.prototype.getViewportAdjustedDelta = function(placement, pos, actualWidth, actualHeight) {
        var delta = {
          top: 0,
          left: 0
        };
        if (!this.$viewport)
          return delta;
        var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
        var viewportDimensions = this.getPosition(this.$viewport);
        if (/right|left/.test(placement)) {
          var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
          var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
          if (topEdgeOffset < viewportDimensions.top) {
            delta.top = viewportDimensions.top - topEdgeOffset;
          } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
            delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
          }
        } else {
          var leftEdgeOffset = pos.left - viewportPadding;
          var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
          if (leftEdgeOffset < viewportDimensions.left) {
            delta.left = viewportDimensions.left - leftEdgeOffset;
          } else if (rightEdgeOffset > viewportDimensions.right) {
            delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
          }
        }
        return delta;
      };
      Tooltip.prototype.getTitle = function() {
        var title;
        var $e = this.$element;
        var o = this.options;
        title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);
        return title;
      };
      Tooltip.prototype.getUID = function(prefix) {
        do
          prefix += ~~(Math.random() * 1000000);
 while (document.getElementById(prefix));
        return prefix;
      };
      Tooltip.prototype.tip = function() {
        if (!this.$tip) {
          this.$tip = $(this.options.template);
          if (this.$tip.length != 1) {
            throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!');
          }
        }
        return this.$tip;
      };
      Tooltip.prototype.arrow = function() {
        return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'));
      };
      Tooltip.prototype.enable = function() {
        this.enabled = true;
      };
      Tooltip.prototype.disable = function() {
        this.enabled = false;
      };
      Tooltip.prototype.toggleEnabled = function() {
        this.enabled = !this.enabled;
      };
      Tooltip.prototype.toggle = function(e) {
        var self = this;
        if (e) {
          self = $(e.currentTarget).data('bs.' + this.type);
          if (!self) {
            self = new this.constructor(e.currentTarget, this.getDelegateOptions());
            $(e.currentTarget).data('bs.' + this.type, self);
          }
        }
        if (e) {
          self.inState.click = !self.inState.click;
          if (self.isInStateTrue())
            self.enter(self);
          else
            self.leave(self);
        } else {
          self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
        }
      };
      Tooltip.prototype.destroy = function() {
        var that = this;
        clearTimeout(this.timeout);
        this.hide(function() {
          that.$element.off('.' + that.type).removeData('bs.' + that.type);
          if (that.$tip) {
            that.$tip.detach();
          }
          that.$tip = null;
          that.$arrow = null;
          that.$viewport = null;
        });
      };
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.tooltip');
          var options = typeof option == 'object' && option;
          if (!data && /destroy|hide/.test(option))
            return;
          if (!data)
            $this.data('bs.tooltip', (data = new Tooltip(this, options)));
          if (typeof option == 'string')
            data[option]();
        });
      }
      var old = $.fn.tooltip;
      $.fn.tooltip = Plugin;
      $.fn.tooltip.Constructor = Tooltip;
      $.fn.tooltip.noConflict = function() {
        $.fn.tooltip = old;
        return this;
      };
    }(jQuery);
    +function($) {
      'use strict';
      var Popover = function(element, options) {
        this.init('popover', element, options);
      };
      if (!$.fn.tooltip)
        throw new Error('Popover requires tooltip.js');
      Popover.VERSION = '3.3.6';
      Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'right',
        trigger: 'click',
        content: '',
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
      });
      Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);
      Popover.prototype.constructor = Popover;
      Popover.prototype.getDefaults = function() {
        return Popover.DEFAULTS;
      };
      Popover.prototype.setContent = function() {
        var $tip = this.tip();
        var title = this.getTitle();
        var content = this.getContent();
        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
        $tip.find('.popover-content').children().detach().end()[this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'](content);
        $tip.removeClass('fade top bottom left right in');
        if (!$tip.find('.popover-title').html())
          $tip.find('.popover-title').hide();
      };
      Popover.prototype.hasContent = function() {
        return this.getTitle() || this.getContent();
      };
      Popover.prototype.getContent = function() {
        var $e = this.$element;
        var o = this.options;
        return $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content);
      };
      Popover.prototype.arrow = function() {
        return (this.$arrow = this.$arrow || this.tip().find('.arrow'));
      };
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.popover');
          var options = typeof option == 'object' && option;
          if (!data && /destroy|hide/.test(option))
            return;
          if (!data)
            $this.data('bs.popover', (data = new Popover(this, options)));
          if (typeof option == 'string')
            data[option]();
        });
      }
      var old = $.fn.popover;
      $.fn.popover = Plugin;
      $.fn.popover.Constructor = Popover;
      $.fn.popover.noConflict = function() {
        $.fn.popover = old;
        return this;
      };
    }(jQuery);
    +function($) {
      'use strict';
      function ScrollSpy(element, options) {
        this.$body = $(document.body);
        this.$scrollElement = $(element).is(document.body) ? $(window) : $(element);
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
        this.selector = (this.options.target || '') + ' .nav li > a';
        this.offsets = [];
        this.targets = [];
        this.activeTarget = null;
        this.scrollHeight = 0;
        this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this));
        this.refresh();
        this.process();
      }
      ScrollSpy.VERSION = '3.3.6';
      ScrollSpy.DEFAULTS = {offset: 10};
      ScrollSpy.prototype.getScrollHeight = function() {
        return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight);
      };
      ScrollSpy.prototype.refresh = function() {
        var that = this;
        var offsetMethod = 'offset';
        var offsetBase = 0;
        this.offsets = [];
        this.targets = [];
        this.scrollHeight = this.getScrollHeight();
        if (!$.isWindow(this.$scrollElement[0])) {
          offsetMethod = 'position';
          offsetBase = this.$scrollElement.scrollTop();
        }
        this.$body.find(this.selector).map(function() {
          var $el = $(this);
          var href = $el.data('target') || $el.attr('href');
          var $href = /^#./.test(href) && $(href);
          return ($href && $href.length && $href.is(':visible') && [[$href[offsetMethod]().top + offsetBase, href]]) || null;
        }).sort(function(a, b) {
          return a[0] - b[0];
        }).each(function() {
          that.offsets.push(this[0]);
          that.targets.push(this[1]);
        });
      };
      ScrollSpy.prototype.process = function() {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
        var scrollHeight = this.getScrollHeight();
        var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height();
        var offsets = this.offsets;
        var targets = this.targets;
        var activeTarget = this.activeTarget;
        var i;
        if (this.scrollHeight != scrollHeight) {
          this.refresh();
        }
        if (scrollTop >= maxScroll) {
          return activeTarget != (i = targets[targets.length - 1]) && this.activate(i);
        }
        if (activeTarget && scrollTop < offsets[0]) {
          this.activeTarget = null;
          return this.clear();
        }
        for (i = offsets.length; i--; ) {
          activeTarget != targets[i] && scrollTop >= offsets[i] && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) && this.activate(targets[i]);
        }
      };
      ScrollSpy.prototype.activate = function(target) {
        this.activeTarget = target;
        this.clear();
        var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
        var active = $(selector).parents('li').addClass('active');
        if (active.parent('.dropdown-menu').length) {
          active = active.closest('li.dropdown').addClass('active');
        }
        active.trigger('activate.bs.scrollspy');
      };
      ScrollSpy.prototype.clear = function() {
        $(this.selector).parentsUntil(this.options.target, '.active').removeClass('active');
      };
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.scrollspy');
          var options = typeof option == 'object' && option;
          if (!data)
            $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)));
          if (typeof option == 'string')
            data[option]();
        });
      }
      var old = $.fn.scrollspy;
      $.fn.scrollspy = Plugin;
      $.fn.scrollspy.Constructor = ScrollSpy;
      $.fn.scrollspy.noConflict = function() {
        $.fn.scrollspy = old;
        return this;
      };
      $(window).on('load.bs.scrollspy.data-api', function() {
        $('[data-spy="scroll"]').each(function() {
          var $spy = $(this);
          Plugin.call($spy, $spy.data());
        });
      });
    }(jQuery);
    +function($) {
      'use strict';
      var Tab = function(element) {
        this.element = $(element);
      };
      Tab.VERSION = '3.3.6';
      Tab.TRANSITION_DURATION = 150;
      Tab.prototype.show = function() {
        var $this = this.element;
        var $ul = $this.closest('ul:not(.dropdown-menu)');
        var selector = $this.data('target');
        if (!selector) {
          selector = $this.attr('href');
          selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
        }
        if ($this.parent('li').hasClass('active'))
          return;
        var $previous = $ul.find('.active:last a');
        var hideEvent = $.Event('hide.bs.tab', {relatedTarget: $this[0]});
        var showEvent = $.Event('show.bs.tab', {relatedTarget: $previous[0]});
        $previous.trigger(hideEvent);
        $this.trigger(showEvent);
        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented())
          return;
        var $target = $(selector);
        this.activate($this.closest('li'), $ul);
        this.activate($target, $target.parent(), function() {
          $previous.trigger({
            type: 'hidden.bs.tab',
            relatedTarget: $this[0]
          });
          $this.trigger({
            type: 'shown.bs.tab',
            relatedTarget: $previous[0]
          });
        });
      };
      Tab.prototype.activate = function(element, container, callback) {
        var $active = container.find('> .active');
        var transition = callback && $.support.transition && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);
        function next() {
          $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', false);
          element.addClass('active').find('[data-toggle="tab"]').attr('aria-expanded', true);
          if (transition) {
            element[0].offsetWidth;
            element.addClass('in');
          } else {
            element.removeClass('fade');
          }
          if (element.parent('.dropdown-menu').length) {
            element.closest('li.dropdown').addClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', true);
          }
          callback && callback();
        }
        $active.length && transition ? $active.one('bsTransitionEnd', next).emulateTransitionEnd(Tab.TRANSITION_DURATION) : next();
        $active.removeClass('in');
      };
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.tab');
          if (!data)
            $this.data('bs.tab', (data = new Tab(this)));
          if (typeof option == 'string')
            data[option]();
        });
      }
      var old = $.fn.tab;
      $.fn.tab = Plugin;
      $.fn.tab.Constructor = Tab;
      $.fn.tab.noConflict = function() {
        $.fn.tab = old;
        return this;
      };
      var clickHandler = function(e) {
        e.preventDefault();
        Plugin.call($(this), 'show');
      };
      $(document).on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler).on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);
    }(jQuery);
    +function($) {
      'use strict';
      var Affix = function(element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options);
        this.$target = $(this.options.target).on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this)).on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this));
        this.$element = $(element);
        this.affixed = null;
        this.unpin = null;
        this.pinnedOffset = null;
        this.checkPosition();
      };
      Affix.VERSION = '3.3.6';
      Affix.RESET = 'affix affix-top affix-bottom';
      Affix.DEFAULTS = {
        offset: 0,
        target: window
      };
      Affix.prototype.getState = function(scrollHeight, height, offsetTop, offsetBottom) {
        var scrollTop = this.$target.scrollTop();
        var position = this.$element.offset();
        var targetHeight = this.$target.height();
        if (offsetTop != null && this.affixed == 'top')
          return scrollTop < offsetTop ? 'top' : false;
        if (this.affixed == 'bottom') {
          if (offsetTop != null)
            return (scrollTop + this.unpin <= position.top) ? false : 'bottom';
          return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom';
        }
        var initializing = this.affixed == null;
        var colliderTop = initializing ? scrollTop : position.top;
        var colliderHeight = initializing ? targetHeight : height;
        if (offsetTop != null && scrollTop <= offsetTop)
          return 'top';
        if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom))
          return 'bottom';
        return false;
      };
      Affix.prototype.getPinnedOffset = function() {
        if (this.pinnedOffset)
          return this.pinnedOffset;
        this.$element.removeClass(Affix.RESET).addClass('affix');
        var scrollTop = this.$target.scrollTop();
        var position = this.$element.offset();
        return (this.pinnedOffset = position.top - scrollTop);
      };
      Affix.prototype.checkPositionWithEventLoop = function() {
        setTimeout($.proxy(this.checkPosition, this), 1);
      };
      Affix.prototype.checkPosition = function() {
        if (!this.$element.is(':visible'))
          return;
        var height = this.$element.height();
        var offset = this.options.offset;
        var offsetTop = offset.top;
        var offsetBottom = offset.bottom;
        var scrollHeight = Math.max($(document).height(), $(document.body).height());
        if (typeof offset != 'object')
          offsetBottom = offsetTop = offset;
        if (typeof offsetTop == 'function')
          offsetTop = offset.top(this.$element);
        if (typeof offsetBottom == 'function')
          offsetBottom = offset.bottom(this.$element);
        var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);
        if (this.affixed != affix) {
          if (this.unpin != null)
            this.$element.css('top', '');
          var affixType = 'affix' + (affix ? '-' + affix : '');
          var e = $.Event(affixType + '.bs.affix');
          this.$element.trigger(e);
          if (e.isDefaultPrevented())
            return;
          this.affixed = affix;
          this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null;
          this.$element.removeClass(Affix.RESET).addClass(affixType).trigger(affixType.replace('affix', 'affixed') + '.bs.affix');
        }
        if (affix == 'bottom') {
          this.$element.offset({top: scrollHeight - height - offsetBottom});
        }
      };
      function Plugin(option) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data('bs.affix');
          var options = typeof option == 'object' && option;
          if (!data)
            $this.data('bs.affix', (data = new Affix(this, options)));
          if (typeof option == 'string')
            data[option]();
        });
      }
      var old = $.fn.affix;
      $.fn.affix = Plugin;
      $.fn.affix.Constructor = Affix;
      $.fn.affix.noConflict = function() {
        $.fn.affix = old;
        return this;
      };
      $(window).on('load', function() {
        $('[data-spy="affix"]').each(function() {
          var $spy = $(this);
          var data = $spy.data();
          data.offset = data.offset || {};
          if (data.offsetBottom != null)
            data.offset.bottom = data.offsetBottom;
          if (data.offsetTop != null)
            data.offset.top = data.offsetTop;
          Plugin.call($spy, data);
        });
      });
    }(jQuery);
  })();
  return _retrieveGlobal();
});

$__System.registerDynamic("f", ["2d"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('2d');
  global.define = __define;
  return module.exports;
});

$__System.register("5", ["f", "2c"], function($__export) {
  "use strict";
  var __moduleName = "5";
  var modal,
      modalTemplate;
  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }
  function getExtension(path) {
    return path.substring(path.length, path.lastIndexOf('.') + 1);
  }
  function getFilenameFromURL(path) {
    return path.substring(path.length, path.lastIndexOf('/') + 1);
  }
  function getParams() {
    var query = window.location.search.substring(1);
    var queryString = {};
    var params = query.split("&");
    for (var i = 0; i < params.length; i++) {
      var pair = params[i].split("=");
      if (typeof queryString[pair[0]] === "undefined") {
        queryString[pair[0]] = pair[1];
      } else if (typeof queryString[pair[0]] === "string") {
        var arr = [queryString[pair[0]], pair[1]];
        queryString[pair[0]] = arr;
      } else {
        queryString[pair[0]].push(pair[1]);
      }
    }
    return queryString;
  }
  function giveFeedback(msg) {
    if ($("#feedback").length === 0) {
      $("body").append(makeAlertModal("feedback", msg));
    } else {
      $("#feedback").find('.alert').html(msg);
    }
    $('#feedback').modal('show');
  }
  function isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  }
  function loading(param) {
    if (param === true) {
      $("#loader").css('visibility', 'visible');
    } else {
      $("#loader").css('visibility', 'hidden');
    }
  }
  function makeAlertModal(id, msg) {
    var options = {
      "id": id,
      "title": "Feedback",
      "body": msg,
      "footer": "",
      "size": ""
    };
    return makeModalWindow(options);
  }
  function makeModalWindow(options) {
    return modalTemplate(options);
  }
  function numberFromId(id) {
    return parseInt(id.substring(id.length, id.lastIndexOf('-') + 1));
  }
  function typeFromId(id) {
    var s = id.indexOf('-') + 1;
    return id.substr(s, id.lastIndexOf('-') - s);
  }
  return {
    setters: [function($__m) {
      modal = $__m.default;
    }, function($__m) {
      modalTemplate = $__m.default;
    }],
    execute: function() {
      $__export("endsWith", endsWith), $__export("getExtension", getExtension), $__export("getFilenameFromURL", getFilenameFromURL), $__export("getParams", getParams), $__export("giveFeedback", giveFeedback), $__export("isJsonString", isJsonString), $__export("loading", loading), $__export("makeAlertModal", makeAlertModal), $__export("makeModalWindow", makeModalWindow), $__export("numberFromId", numberFromId), $__export("typeFromId", typeFromId);
    }
  };
});

$__System.register("2e", ["4", "5", "28", "6", "29", "a"], function($__export) {
  "use strict";
  var __moduleName = "2e";
  var Backbone,
      utils,
      save,
      pcapi,
      Survey,
      Convertor,
      SurveyView;
  return {
    setters: [function($__m) {
      Backbone = $__m.default;
    }, function($__m) {
      utils = $__m;
    }, function($__m) {
      save = $__m;
    }, function($__m) {
      pcapi = $__m.default;
    }, function($__m) {
      Survey = $__m.default;
    }, function($__m) {
      Convertor = $__m.default;
    }],
    execute: function() {
      SurveyView = function($__super) {
        function SurveyView() {
          $traceurRuntime.superConstructor(SurveyView).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(SurveyView, {
          initialize: function() {
            this.cfg = cfg;
            this.options = {
              "element": "content",
              "subElement": "mobile-content"
            };
            this.params = utils.getParams();
            if (this.params) {
              this.options.formsFolder = this.params.sid;
              this.options.copyToPublic = (this.params.public === 'true');
            }
            $('#header-menu li').removeClass('active');
            $('#header-menu li a[href="#/survey-designer"]').parent().addClass('active');
            this.render();
          },
          formSave: function() {
            $(document).off('click', '#form-save');
            $(document).on('click', '#form-save', $.proxy(function() {
              var formInJSON = save.saveData("." + this.options.subElement);
              var htmlConvertor = new Convertor();
              var title = formInJSON.title;
              if ("sid" in this.params && this.params.sid !== undefined) {
                title = this.params.sid;
              }
              var options = {
                remoteDir: "editors",
                path: encodeURIComponent(title) + ".json",
                data: JSON.stringify(formInJSON)
              };
              if (this.params.public === 'true') {
                options.urlParams = {'public': 'true'};
              }
              var optionsForHTML = {
                remoteDir: "editors",
                path: encodeURIComponent(title) + ".edtr",
                data: htmlConvertor.JSONtoHTML(formInJSON).join("")
              };
              if (this.params.public === 'true') {
                optionsForHTML.urlParams = {'public': 'true'};
              }
              pcapi.updateItem(options).then(function(result) {
                utils.giveFeedback("Your form has been uploaded");
              });
              pcapi.updateItem(optionsForHTML).then(function(result) {
                utils.giveFeedback("Your form has been uploaded");
              });
            }, this));
          },
          getEditor: function(options, title) {
            utils.loading(true);
            var survey;
            pcapi.getEditor(options).then($.proxy(function(data) {
              utils.loading(false);
              if (data.error === 1) {
                this.survey.render();
              } else {
                this.survey.renderExistingSurvey(title, data);
              }
            }, this));
          },
          render: function() {
            pcapi.init({
              "url": this.cfg.baseurl,
              "version": this.cfg.version
            });
            var user = this.cfg.userid;
            pcapi.setCloudLogin(user);
            var locale = utils.getParams().lang || 'en';
            localStorage.setItem('locale', locale);
            i18n.init({
              ns: {
                namespaces: ['survey'],
                defaultNs: 'survey'
              },
              detectLngQS: 'lang'
            }, $.proxy(function() {
              if (this.params && this.params.survey) {
                this.options.title = decodeURIComponent(this.params.survey);
              }
              this.survey = new Survey(this.options);
              this.renderSurvey();
              this.formSave();
            }, this));
          },
          renderSurvey: function() {
            if ("sid" in this.params && this.params.sid !== undefined) {
              var title = decodeURIComponent(this.params.survey);
              var options = {
                "remoteDir": "editors",
                "item": utils.getParams().sid + ".json"
              };
              this.getEditor(options, title);
            } else {
              this.survey.render();
            }
            return this;
          }
        }, {}, $__super);
      }(Backbone.View);
      $__export("SurveyView", SurveyView);
    }
  };
});

$__System.register("2f", ["4", "2e", "3"], function($__export) {
  "use strict";
  var __moduleName = "2f";
  var Backbone,
      SurveyView,
      UploadLayerView,
      SurveyRouter;
  return {
    setters: [function($__m) {
      Backbone = $__m.default;
    }, function($__m) {
      SurveyView = $__m.SurveyView;
    }, function($__m) {
      UploadLayerView = $__m.UploadLayerView;
    }],
    execute: function() {
      SurveyRouter = function($__super) {
        function SurveyRouter() {
          $traceurRuntime.superConstructor(SurveyRouter).call(this);
          this.routes = {
            'survey-designer': 'survey',
            'upload-layer': 'uploadLayers'
          };
          this._bindRoutes();
        }
        return ($traceurRuntime.createClass)(SurveyRouter, {
          survey: function() {
            console.log('Route#survey');
            new SurveyView();
          },
          uploadLayers: function() {
            new UploadLayerView();
          }
        }, {}, $__super);
      }(Backbone.Router);
      $__export("SurveyRouter", SurveyRouter);
    }
  };
});

$__System.registerDynamic("30", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var process = module.exports = {};
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
  }
  process.nextTick = function(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      setTimeout(drainQueue, 0);
    }
  };
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {};
  process.argv = [];
  process.version = '';
  process.versions = {};
  function noop() {}
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.binding = function(name) {
    throw new Error('process.binding is not supported');
  };
  process.cwd = function() {
    return '/';
  };
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported');
  };
  process.umask = function() {
    return 0;
  };
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("31", ["30"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('30');
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("32", ["31"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__System._nodeRequire ? process : $__require('31');
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("33", ["32"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('32');
  global.define = __define;
  return module.exports;
});

(function() {
var _removeDefine = $__System.get("@@amd-helpers").createDefine();
(function(global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.document ? factory(global, true) : function(w) {
      if (!w.document) {
        throw new Error("jQuery requires a window with a document");
      }
      return factory(w);
    };
  } else {
    factory(global);
  }
}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
  var arr = [];
  var document = window.document;
  var slice = arr.slice;
  var concat = arr.concat;
  var push = arr.push;
  var indexOf = arr.indexOf;
  var class2type = {};
  var toString = class2type.toString;
  var hasOwn = class2type.hasOwnProperty;
  var support = {};
  var version = "2.2.0",
      jQuery = function(selector, context) {
        return new jQuery.fn.init(selector, context);
      },
      rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
      rmsPrefix = /^-ms-/,
      rdashAlpha = /-([\da-z])/gi,
      fcamelCase = function(all, letter) {
        return letter.toUpperCase();
      };
  jQuery.fn = jQuery.prototype = {
    jquery: version,
    constructor: jQuery,
    selector: "",
    length: 0,
    toArray: function() {
      return slice.call(this);
    },
    get: function(num) {
      return num != null ? (num < 0 ? this[num + this.length] : this[num]) : slice.call(this);
    },
    pushStack: function(elems) {
      var ret = jQuery.merge(this.constructor(), elems);
      ret.prevObject = this;
      ret.context = this.context;
      return ret;
    },
    each: function(callback) {
      return jQuery.each(this, callback);
    },
    map: function(callback) {
      return this.pushStack(jQuery.map(this, function(elem, i) {
        return callback.call(elem, i, elem);
      }));
    },
    slice: function() {
      return this.pushStack(slice.apply(this, arguments));
    },
    first: function() {
      return this.eq(0);
    },
    last: function() {
      return this.eq(-1);
    },
    eq: function(i) {
      var len = this.length,
          j = +i + (i < 0 ? len : 0);
      return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
    },
    end: function() {
      return this.prevObject || this.constructor();
    },
    push: push,
    sort: arr.sort,
    splice: arr.splice
  };
  jQuery.extend = jQuery.fn.extend = function() {
    var options,
        name,
        src,
        copy,
        copyIsArray,
        clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;
    if (typeof target === "boolean") {
      deep = target;
      target = arguments[i] || {};
      i++;
    }
    if (typeof target !== "object" && !jQuery.isFunction(target)) {
      target = {};
    }
    if (i === length) {
      target = this;
      i--;
    }
    for (; i < length; i++) {
      if ((options = arguments[i]) != null) {
        for (name in options) {
          src = target[name];
          copy = options[name];
          if (target === copy) {
            continue;
          }
          if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && jQuery.isArray(src) ? src : [];
            } else {
              clone = src && jQuery.isPlainObject(src) ? src : {};
            }
            target[name] = jQuery.extend(deep, clone, copy);
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    return target;
  };
  jQuery.extend({
    expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
    isReady: true,
    error: function(msg) {
      throw new Error(msg);
    },
    noop: function() {},
    isFunction: function(obj) {
      return jQuery.type(obj) === "function";
    },
    isArray: Array.isArray,
    isWindow: function(obj) {
      return obj != null && obj === obj.window;
    },
    isNumeric: function(obj) {
      var realStringObj = obj && obj.toString();
      return !jQuery.isArray(obj) && (realStringObj - parseFloat(realStringObj) + 1) >= 0;
    },
    isPlainObject: function(obj) {
      if (jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
        return false;
      }
      if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
      }
      return true;
    },
    isEmptyObject: function(obj) {
      var name;
      for (name in obj) {
        return false;
      }
      return true;
    },
    type: function(obj) {
      if (obj == null) {
        return obj + "";
      }
      return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
    },
    globalEval: function(code) {
      var script,
          indirect = eval;
      code = jQuery.trim(code);
      if (code) {
        if (code.indexOf("use strict") === 1) {
          script = document.createElement("script");
          script.text = code;
          document.head.appendChild(script).parentNode.removeChild(script);
        } else {
          indirect(code);
        }
      }
    },
    camelCase: function(string) {
      return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
    },
    nodeName: function(elem, name) {
      return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
    },
    each: function(obj, callback) {
      var length,
          i = 0;
      if (isArrayLike(obj)) {
        length = obj.length;
        for (; i < length; i++) {
          if (callback.call(obj[i], i, obj[i]) === false) {
            break;
          }
        }
      } else {
        for (i in obj) {
          if (callback.call(obj[i], i, obj[i]) === false) {
            break;
          }
        }
      }
      return obj;
    },
    trim: function(text) {
      return text == null ? "" : (text + "").replace(rtrim, "");
    },
    makeArray: function(arr, results) {
      var ret = results || [];
      if (arr != null) {
        if (isArrayLike(Object(arr))) {
          jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
        } else {
          push.call(ret, arr);
        }
      }
      return ret;
    },
    inArray: function(elem, arr, i) {
      return arr == null ? -1 : indexOf.call(arr, elem, i);
    },
    merge: function(first, second) {
      var len = +second.length,
          j = 0,
          i = first.length;
      for (; j < len; j++) {
        first[i++] = second[j];
      }
      first.length = i;
      return first;
    },
    grep: function(elems, callback, invert) {
      var callbackInverse,
          matches = [],
          i = 0,
          length = elems.length,
          callbackExpect = !invert;
      for (; i < length; i++) {
        callbackInverse = !callback(elems[i], i);
        if (callbackInverse !== callbackExpect) {
          matches.push(elems[i]);
        }
      }
      return matches;
    },
    map: function(elems, callback, arg) {
      var length,
          value,
          i = 0,
          ret = [];
      if (isArrayLike(elems)) {
        length = elems.length;
        for (; i < length; i++) {
          value = callback(elems[i], i, arg);
          if (value != null) {
            ret.push(value);
          }
        }
      } else {
        for (i in elems) {
          value = callback(elems[i], i, arg);
          if (value != null) {
            ret.push(value);
          }
        }
      }
      return concat.apply([], ret);
    },
    guid: 1,
    proxy: function(fn, context) {
      var tmp,
          args,
          proxy;
      if (typeof context === "string") {
        tmp = fn[context];
        context = fn;
        fn = tmp;
      }
      if (!jQuery.isFunction(fn)) {
        return undefined;
      }
      args = slice.call(arguments, 2);
      proxy = function() {
        return fn.apply(context || this, args.concat(slice.call(arguments)));
      };
      proxy.guid = fn.guid = fn.guid || jQuery.guid++;
      return proxy;
    },
    now: Date.now,
    support: support
  });
  if (typeof Symbol === "function") {
    jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
  }
  jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase();
  });
  function isArrayLike(obj) {
    var length = !!obj && "length" in obj && obj.length,
        type = jQuery.type(obj);
    if (type === "function" || jQuery.isWindow(obj)) {
      return false;
    }
    return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
  }
  var Sizzle = (function(window) {
    var i,
        support,
        Expr,
        getText,
        isXML,
        tokenize,
        compile,
        select,
        outermostContext,
        sortInput,
        hasDuplicate,
        setDocument,
        document,
        docElem,
        documentIsHTML,
        rbuggyQSA,
        rbuggyMatches,
        matches,
        contains,
        expando = "sizzle" + 1 * new Date(),
        preferredDoc = window.document,
        dirruns = 0,
        done = 0,
        classCache = createCache(),
        tokenCache = createCache(),
        compilerCache = createCache(),
        sortOrder = function(a, b) {
          if (a === b) {
            hasDuplicate = true;
          }
          return 0;
        },
        MAX_NEGATIVE = 1 << 31,
        hasOwn = ({}).hasOwnProperty,
        arr = [],
        pop = arr.pop,
        push_native = arr.push,
        push = arr.push,
        slice = arr.slice,
        indexOf = function(list, elem) {
          var i = 0,
              len = list.length;
          for (; i < len; i++) {
            if (list[i] === elem) {
              return i;
            }
          }
          return -1;
        },
        booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
        whitespace = "[\\x20\\t\\r\\n\\f]",
        identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
        attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace + "*([*^$|!~]?=)" + whitespace + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",
        pseudos = ":(" + identifier + ")(?:\\((" + "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" + "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" + ".*" + ")\\)|)",
        rwhitespace = new RegExp(whitespace + "+", "g"),
        rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
        rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
        rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
        rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
        rpseudo = new RegExp(pseudos),
        ridentifier = new RegExp("^" + identifier + "$"),
        matchExpr = {
          "ID": new RegExp("^#(" + identifier + ")"),
          "CLASS": new RegExp("^\\.(" + identifier + ")"),
          "TAG": new RegExp("^(" + identifier + "|[*])"),
          "ATTR": new RegExp("^" + attributes),
          "PSEUDO": new RegExp("^" + pseudos),
          "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
          "bool": new RegExp("^(?:" + booleans + ")$", "i"),
          "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
        },
        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,
        rnative = /^[^{]+\{\s*\[native \w/,
        rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
        rsibling = /[+~]/,
        rescape = /'|\\/g,
        runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
        funescape = function(_, escaped, escapedWhitespace) {
          var high = "0x" + escaped - 0x10000;
          return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 0x10000) : String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
        },
        unloadHandler = function() {
          setDocument();
        };
    try {
      push.apply((arr = slice.call(preferredDoc.childNodes)), preferredDoc.childNodes);
      arr[preferredDoc.childNodes.length].nodeType;
    } catch (e) {
      push = {apply: arr.length ? function(target, els) {
          push_native.apply(target, slice.call(els));
        } : function(target, els) {
          var j = target.length,
              i = 0;
          while ((target[j++] = els[i++])) {}
          target.length = j - 1;
        }};
    }
    function Sizzle(selector, context, results, seed) {
      var m,
          i,
          elem,
          nid,
          nidselect,
          match,
          groups,
          newSelector,
          newContext = context && context.ownerDocument,
          nodeType = context ? context.nodeType : 9;
      results = results || [];
      if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
        return results;
      }
      if (!seed) {
        if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
          setDocument(context);
        }
        context = context || document;
        if (documentIsHTML) {
          if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {
            if ((m = match[1])) {
              if (nodeType === 9) {
                if ((elem = context.getElementById(m))) {
                  if (elem.id === m) {
                    results.push(elem);
                    return results;
                  }
                } else {
                  return results;
                }
              } else {
                if (newContext && (elem = newContext.getElementById(m)) && contains(context, elem) && elem.id === m) {
                  results.push(elem);
                  return results;
                }
              }
            } else if (match[2]) {
              push.apply(results, context.getElementsByTagName(selector));
              return results;
            } else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
              push.apply(results, context.getElementsByClassName(m));
              return results;
            }
          }
          if (support.qsa && !compilerCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
            if (nodeType !== 1) {
              newContext = context;
              newSelector = selector;
            } else if (context.nodeName.toLowerCase() !== "object") {
              if ((nid = context.getAttribute("id"))) {
                nid = nid.replace(rescape, "\\$&");
              } else {
                context.setAttribute("id", (nid = expando));
              }
              groups = tokenize(selector);
              i = groups.length;
              nidselect = ridentifier.test(nid) ? "#" + nid : "[id='" + nid + "']";
              while (i--) {
                groups[i] = nidselect + " " + toSelector(groups[i]);
              }
              newSelector = groups.join(",");
              newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
            }
            if (newSelector) {
              try {
                push.apply(results, newContext.querySelectorAll(newSelector));
                return results;
              } catch (qsaError) {} finally {
                if (nid === expando) {
                  context.removeAttribute("id");
                }
              }
            }
          }
        }
      }
      return select(selector.replace(rtrim, "$1"), context, results, seed);
    }
    function createCache() {
      var keys = [];
      function cache(key, value) {
        if (keys.push(key + " ") > Expr.cacheLength) {
          delete cache[keys.shift()];
        }
        return (cache[key + " "] = value);
      }
      return cache;
    }
    function markFunction(fn) {
      fn[expando] = true;
      return fn;
    }
    function assert(fn) {
      var div = document.createElement("div");
      try {
        return !!fn(div);
      } catch (e) {
        return false;
      } finally {
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
        div = null;
      }
    }
    function addHandle(attrs, handler) {
      var arr = attrs.split("|"),
          i = arr.length;
      while (i--) {
        Expr.attrHandle[arr[i]] = handler;
      }
    }
    function siblingCheck(a, b) {
      var cur = b && a,
          diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
      if (diff) {
        return diff;
      }
      if (cur) {
        while ((cur = cur.nextSibling)) {
          if (cur === b) {
            return -1;
          }
        }
      }
      return a ? 1 : -1;
    }
    function createInputPseudo(type) {
      return function(elem) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && elem.type === type;
      };
    }
    function createButtonPseudo(type) {
      return function(elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && elem.type === type;
      };
    }
    function createPositionalPseudo(fn) {
      return markFunction(function(argument) {
        argument = +argument;
        return markFunction(function(seed, matches) {
          var j,
              matchIndexes = fn([], seed.length, argument),
              i = matchIndexes.length;
          while (i--) {
            if (seed[(j = matchIndexes[i])]) {
              seed[j] = !(matches[j] = seed[j]);
            }
          }
        });
      });
    }
    function testContext(context) {
      return context && typeof context.getElementsByTagName !== "undefined" && context;
    }
    support = Sizzle.support = {};
    isXML = Sizzle.isXML = function(elem) {
      var documentElement = elem && (elem.ownerDocument || elem).documentElement;
      return documentElement ? documentElement.nodeName !== "HTML" : false;
    };
    setDocument = Sizzle.setDocument = function(node) {
      var hasCompare,
          parent,
          doc = node ? node.ownerDocument || node : preferredDoc;
      if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
        return document;
      }
      document = doc;
      docElem = document.documentElement;
      documentIsHTML = !isXML(document);
      if ((parent = document.defaultView) && parent.top !== parent) {
        if (parent.addEventListener) {
          parent.addEventListener("unload", unloadHandler, false);
        } else if (parent.attachEvent) {
          parent.attachEvent("onunload", unloadHandler);
        }
      }
      support.attributes = assert(function(div) {
        div.className = "i";
        return !div.getAttribute("className");
      });
      support.getElementsByTagName = assert(function(div) {
        div.appendChild(document.createComment(""));
        return !div.getElementsByTagName("*").length;
      });
      support.getElementsByClassName = rnative.test(document.getElementsByClassName);
      support.getById = assert(function(div) {
        docElem.appendChild(div).id = expando;
        return !document.getElementsByName || !document.getElementsByName(expando).length;
      });
      if (support.getById) {
        Expr.find["ID"] = function(id, context) {
          if (typeof context.getElementById !== "undefined" && documentIsHTML) {
            var m = context.getElementById(id);
            return m ? [m] : [];
          }
        };
        Expr.filter["ID"] = function(id) {
          var attrId = id.replace(runescape, funescape);
          return function(elem) {
            return elem.getAttribute("id") === attrId;
          };
        };
      } else {
        delete Expr.find["ID"];
        Expr.filter["ID"] = function(id) {
          var attrId = id.replace(runescape, funescape);
          return function(elem) {
            var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
            return node && node.value === attrId;
          };
        };
      }
      Expr.find["TAG"] = support.getElementsByTagName ? function(tag, context) {
        if (typeof context.getElementsByTagName !== "undefined") {
          return context.getElementsByTagName(tag);
        } else if (support.qsa) {
          return context.querySelectorAll(tag);
        }
      } : function(tag, context) {
        var elem,
            tmp = [],
            i = 0,
            results = context.getElementsByTagName(tag);
        if (tag === "*") {
          while ((elem = results[i++])) {
            if (elem.nodeType === 1) {
              tmp.push(elem);
            }
          }
          return tmp;
        }
        return results;
      };
      Expr.find["CLASS"] = support.getElementsByClassName && function(className, context) {
        if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
          return context.getElementsByClassName(className);
        }
      };
      rbuggyMatches = [];
      rbuggyQSA = [];
      if ((support.qsa = rnative.test(document.querySelectorAll))) {
        assert(function(div) {
          docElem.appendChild(div).innerHTML = "<a id='" + expando + "'></a>" + "<select id='" + expando + "-\r\\' msallowcapture=''>" + "<option selected=''></option></select>";
          if (div.querySelectorAll("[msallowcapture^='']").length) {
            rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
          }
          if (!div.querySelectorAll("[selected]").length) {
            rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
          }
          if (!div.querySelectorAll("[id~=" + expando + "-]").length) {
            rbuggyQSA.push("~=");
          }
          if (!div.querySelectorAll(":checked").length) {
            rbuggyQSA.push(":checked");
          }
          if (!div.querySelectorAll("a#" + expando + "+*").length) {
            rbuggyQSA.push(".#.+[+~]");
          }
        });
        assert(function(div) {
          var input = document.createElement("input");
          input.setAttribute("type", "hidden");
          div.appendChild(input).setAttribute("name", "D");
          if (div.querySelectorAll("[name=d]").length) {
            rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
          }
          if (!div.querySelectorAll(":enabled").length) {
            rbuggyQSA.push(":enabled", ":disabled");
          }
          div.querySelectorAll("*,:x");
          rbuggyQSA.push(",.*:");
        });
      }
      if ((support.matchesSelector = rnative.test((matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)))) {
        assert(function(div) {
          support.disconnectedMatch = matches.call(div, "div");
          matches.call(div, "[s!='']:x");
          rbuggyMatches.push("!=", pseudos);
        });
      }
      rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
      rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
      hasCompare = rnative.test(docElem.compareDocumentPosition);
      contains = hasCompare || rnative.test(docElem.contains) ? function(a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
        return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
      } : function(a, b) {
        if (b) {
          while ((b = b.parentNode)) {
            if (b === a) {
              return true;
            }
          }
        }
        return false;
      };
      sortOrder = hasCompare ? function(a, b) {
        if (a === b) {
          hasDuplicate = true;
          return 0;
        }
        var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
        if (compare) {
          return compare;
        }
        compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1;
        if (compare & 1 || (!support.sortDetached && b.compareDocumentPosition(a) === compare)) {
          if (a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
            return -1;
          }
          if (b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
            return 1;
          }
          return sortInput ? (indexOf(sortInput, a) - indexOf(sortInput, b)) : 0;
        }
        return compare & 4 ? -1 : 1;
      } : function(a, b) {
        if (a === b) {
          hasDuplicate = true;
          return 0;
        }
        var cur,
            i = 0,
            aup = a.parentNode,
            bup = b.parentNode,
            ap = [a],
            bp = [b];
        if (!aup || !bup) {
          return a === document ? -1 : b === document ? 1 : aup ? -1 : bup ? 1 : sortInput ? (indexOf(sortInput, a) - indexOf(sortInput, b)) : 0;
        } else if (aup === bup) {
          return siblingCheck(a, b);
        }
        cur = a;
        while ((cur = cur.parentNode)) {
          ap.unshift(cur);
        }
        cur = b;
        while ((cur = cur.parentNode)) {
          bp.unshift(cur);
        }
        while (ap[i] === bp[i]) {
          i++;
        }
        return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
      };
      return document;
    };
    Sizzle.matches = function(expr, elements) {
      return Sizzle(expr, null, null, elements);
    };
    Sizzle.matchesSelector = function(elem, expr) {
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem);
      }
      expr = expr.replace(rattributeQuotes, "='$1']");
      if (support.matchesSelector && documentIsHTML && !compilerCache[expr + " "] && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
        try {
          var ret = matches.call(elem, expr);
          if (ret || support.disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
            return ret;
          }
        } catch (e) {}
      }
      return Sizzle(expr, document, null, [elem]).length > 0;
    };
    Sizzle.contains = function(context, elem) {
      if ((context.ownerDocument || context) !== document) {
        setDocument(context);
      }
      return contains(context, elem);
    };
    Sizzle.attr = function(elem, name) {
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem);
      }
      var fn = Expr.attrHandle[name.toLowerCase()],
          val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;
      return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
    };
    Sizzle.error = function(msg) {
      throw new Error("Syntax error, unrecognized expression: " + msg);
    };
    Sizzle.uniqueSort = function(results) {
      var elem,
          duplicates = [],
          j = 0,
          i = 0;
      hasDuplicate = !support.detectDuplicates;
      sortInput = !support.sortStable && results.slice(0);
      results.sort(sortOrder);
      if (hasDuplicate) {
        while ((elem = results[i++])) {
          if (elem === results[i]) {
            j = duplicates.push(i);
          }
        }
        while (j--) {
          results.splice(duplicates[j], 1);
        }
      }
      sortInput = null;
      return results;
    };
    getText = Sizzle.getText = function(elem) {
      var node,
          ret = "",
          i = 0,
          nodeType = elem.nodeType;
      if (!nodeType) {
        while ((node = elem[i++])) {
          ret += getText(node);
        }
      } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        if (typeof elem.textContent === "string") {
          return elem.textContent;
        } else {
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            ret += getText(elem);
          }
        }
      } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue;
      }
      return ret;
    };
    Expr = Sizzle.selectors = {
      cacheLength: 50,
      createPseudo: markFunction,
      match: matchExpr,
      attrHandle: {},
      find: {},
      relative: {
        ">": {
          dir: "parentNode",
          first: true
        },
        " ": {dir: "parentNode"},
        "+": {
          dir: "previousSibling",
          first: true
        },
        "~": {dir: "previousSibling"}
      },
      preFilter: {
        "ATTR": function(match) {
          match[1] = match[1].replace(runescape, funescape);
          match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);
          if (match[2] === "~=") {
            match[3] = " " + match[3] + " ";
          }
          return match.slice(0, 4);
        },
        "CHILD": function(match) {
          match[1] = match[1].toLowerCase();
          if (match[1].slice(0, 3) === "nth") {
            if (!match[3]) {
              Sizzle.error(match[0]);
            }
            match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
            match[5] = +((match[7] + match[8]) || match[3] === "odd");
          } else if (match[3]) {
            Sizzle.error(match[0]);
          }
          return match;
        },
        "PSEUDO": function(match) {
          var excess,
              unquoted = !match[6] && match[2];
          if (matchExpr["CHILD"].test(match[0])) {
            return null;
          }
          if (match[3]) {
            match[2] = match[4] || match[5] || "";
          } else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, true)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
            match[0] = match[0].slice(0, excess);
            match[2] = unquoted.slice(0, excess);
          }
          return match.slice(0, 3);
        }
      },
      filter: {
        "TAG": function(nodeNameSelector) {
          var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
          return nodeNameSelector === "*" ? function() {
            return true;
          } : function(elem) {
            return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
          };
        },
        "CLASS": function(className) {
          var pattern = classCache[className + " "];
          return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
            return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
          });
        },
        "ATTR": function(name, operator, check) {
          return function(elem) {
            var result = Sizzle.attr(elem, name);
            if (result == null) {
              return operator === "!=";
            }
            if (!operator) {
              return true;
            }
            result += "";
            return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
          };
        },
        "CHILD": function(type, what, argument, first, last) {
          var simple = type.slice(0, 3) !== "nth",
              forward = type.slice(-4) !== "last",
              ofType = what === "of-type";
          return first === 1 && last === 0 ? function(elem) {
            return !!elem.parentNode;
          } : function(elem, context, xml) {
            var cache,
                uniqueCache,
                outerCache,
                node,
                nodeIndex,
                start,
                dir = simple !== forward ? "nextSibling" : "previousSibling",
                parent = elem.parentNode,
                name = ofType && elem.nodeName.toLowerCase(),
                useCache = !xml && !ofType,
                diff = false;
            if (parent) {
              if (simple) {
                while (dir) {
                  node = elem;
                  while ((node = node[dir])) {
                    if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                      return false;
                    }
                  }
                  start = dir = type === "only" && !start && "nextSibling";
                }
                return true;
              }
              start = [forward ? parent.firstChild : parent.lastChild];
              if (forward && useCache) {
                node = parent;
                outerCache = node[expando] || (node[expando] = {});
                uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                cache = uniqueCache[type] || [];
                nodeIndex = cache[0] === dirruns && cache[1];
                diff = nodeIndex && cache[2];
                node = nodeIndex && parent.childNodes[nodeIndex];
                while ((node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop())) {
                  if (node.nodeType === 1 && ++diff && node === elem) {
                    uniqueCache[type] = [dirruns, nodeIndex, diff];
                    break;
                  }
                }
              } else {
                if (useCache) {
                  node = elem;
                  outerCache = node[expando] || (node[expando] = {});
                  uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                  cache = uniqueCache[type] || [];
                  nodeIndex = cache[0] === dirruns && cache[1];
                  diff = nodeIndex;
                }
                if (diff === false) {
                  while ((node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop())) {
                    if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                      if (useCache) {
                        outerCache = node[expando] || (node[expando] = {});
                        uniqueCache = outerCache[node.uniqueID] || (outerCache[node.uniqueID] = {});
                        uniqueCache[type] = [dirruns, diff];
                      }
                      if (node === elem) {
                        break;
                      }
                    }
                  }
                }
              }
              diff -= last;
              return diff === first || (diff % first === 0 && diff / first >= 0);
            }
          };
        },
        "PSEUDO": function(pseudo, argument) {
          var args,
              fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);
          if (fn[expando]) {
            return fn(argument);
          }
          if (fn.length > 1) {
            args = [pseudo, pseudo, "", argument];
            return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches) {
              var idx,
                  matched = fn(seed, argument),
                  i = matched.length;
              while (i--) {
                idx = indexOf(seed, matched[i]);
                seed[idx] = !(matches[idx] = matched[i]);
              }
            }) : function(elem) {
              return fn(elem, 0, args);
            };
          }
          return fn;
        }
      },
      pseudos: {
        "not": markFunction(function(selector) {
          var input = [],
              results = [],
              matcher = compile(selector.replace(rtrim, "$1"));
          return matcher[expando] ? markFunction(function(seed, matches, context, xml) {
            var elem,
                unmatched = matcher(seed, null, xml, []),
                i = seed.length;
            while (i--) {
              if ((elem = unmatched[i])) {
                seed[i] = !(matches[i] = elem);
              }
            }
          }) : function(elem, context, xml) {
            input[0] = elem;
            matcher(input, null, xml, results);
            input[0] = null;
            return !results.pop();
          };
        }),
        "has": markFunction(function(selector) {
          return function(elem) {
            return Sizzle(selector, elem).length > 0;
          };
        }),
        "contains": markFunction(function(text) {
          text = text.replace(runescape, funescape);
          return function(elem) {
            return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
          };
        }),
        "lang": markFunction(function(lang) {
          if (!ridentifier.test(lang || "")) {
            Sizzle.error("unsupported lang: " + lang);
          }
          lang = lang.replace(runescape, funescape).toLowerCase();
          return function(elem) {
            var elemLang;
            do {
              if ((elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {
                elemLang = elemLang.toLowerCase();
                return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
              }
            } while ((elem = elem.parentNode) && elem.nodeType === 1);
            return false;
          };
        }),
        "target": function(elem) {
          var hash = window.location && window.location.hash;
          return hash && hash.slice(1) === elem.id;
        },
        "root": function(elem) {
          return elem === docElem;
        },
        "focus": function(elem) {
          return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
        },
        "enabled": function(elem) {
          return elem.disabled === false;
        },
        "disabled": function(elem) {
          return elem.disabled === true;
        },
        "checked": function(elem) {
          var nodeName = elem.nodeName.toLowerCase();
          return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
        },
        "selected": function(elem) {
          if (elem.parentNode) {
            elem.parentNode.selectedIndex;
          }
          return elem.selected === true;
        },
        "empty": function(elem) {
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            if (elem.nodeType < 6) {
              return false;
            }
          }
          return true;
        },
        "parent": function(elem) {
          return !Expr.pseudos["empty"](elem);
        },
        "header": function(elem) {
          return rheader.test(elem.nodeName);
        },
        "input": function(elem) {
          return rinputs.test(elem.nodeName);
        },
        "button": function(elem) {
          var name = elem.nodeName.toLowerCase();
          return name === "input" && elem.type === "button" || name === "button";
        },
        "text": function(elem) {
          var attr;
          return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
        },
        "first": createPositionalPseudo(function() {
          return [0];
        }),
        "last": createPositionalPseudo(function(matchIndexes, length) {
          return [length - 1];
        }),
        "eq": createPositionalPseudo(function(matchIndexes, length, argument) {
          return [argument < 0 ? argument + length : argument];
        }),
        "even": createPositionalPseudo(function(matchIndexes, length) {
          var i = 0;
          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        }),
        "odd": createPositionalPseudo(function(matchIndexes, length) {
          var i = 1;
          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        }),
        "lt": createPositionalPseudo(function(matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;
          for (; --i >= 0; ) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        }),
        "gt": createPositionalPseudo(function(matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;
          for (; ++i < length; ) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        })
      }
    };
    Expr.pseudos["nth"] = Expr.pseudos["eq"];
    for (i in {
      radio: true,
      checkbox: true,
      file: true,
      password: true,
      image: true
    }) {
      Expr.pseudos[i] = createInputPseudo(i);
    }
    for (i in {
      submit: true,
      reset: true
    }) {
      Expr.pseudos[i] = createButtonPseudo(i);
    }
    function setFilters() {}
    setFilters.prototype = Expr.filters = Expr.pseudos;
    Expr.setFilters = new setFilters();
    tokenize = Sizzle.tokenize = function(selector, parseOnly) {
      var matched,
          match,
          tokens,
          type,
          soFar,
          groups,
          preFilters,
          cached = tokenCache[selector + " "];
      if (cached) {
        return parseOnly ? 0 : cached.slice(0);
      }
      soFar = selector;
      groups = [];
      preFilters = Expr.preFilter;
      while (soFar) {
        if (!matched || (match = rcomma.exec(soFar))) {
          if (match) {
            soFar = soFar.slice(match[0].length) || soFar;
          }
          groups.push((tokens = []));
        }
        matched = false;
        if ((match = rcombinators.exec(soFar))) {
          matched = match.shift();
          tokens.push({
            value: matched,
            type: match[0].replace(rtrim, " ")
          });
          soFar = soFar.slice(matched.length);
        }
        for (type in Expr.filter) {
          if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
            matched = match.shift();
            tokens.push({
              value: matched,
              type: type,
              matches: match
            });
            soFar = soFar.slice(matched.length);
          }
        }
        if (!matched) {
          break;
        }
      }
      return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0);
    };
    function toSelector(tokens) {
      var i = 0,
          len = tokens.length,
          selector = "";
      for (; i < len; i++) {
        selector += tokens[i].value;
      }
      return selector;
    }
    function addCombinator(matcher, combinator, base) {
      var dir = combinator.dir,
          checkNonElements = base && dir === "parentNode",
          doneName = done++;
      return combinator.first ? function(elem, context, xml) {
        while ((elem = elem[dir])) {
          if (elem.nodeType === 1 || checkNonElements) {
            return matcher(elem, context, xml);
          }
        }
      } : function(elem, context, xml) {
        var oldCache,
            uniqueCache,
            outerCache,
            newCache = [dirruns, doneName];
        if (xml) {
          while ((elem = elem[dir])) {
            if (elem.nodeType === 1 || checkNonElements) {
              if (matcher(elem, context, xml)) {
                return true;
              }
            }
          }
        } else {
          while ((elem = elem[dir])) {
            if (elem.nodeType === 1 || checkNonElements) {
              outerCache = elem[expando] || (elem[expando] = {});
              uniqueCache = outerCache[elem.uniqueID] || (outerCache[elem.uniqueID] = {});
              if ((oldCache = uniqueCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                return (newCache[2] = oldCache[2]);
              } else {
                uniqueCache[dir] = newCache;
                if ((newCache[2] = matcher(elem, context, xml))) {
                  return true;
                }
              }
            }
          }
        }
      };
    }
    function elementMatcher(matchers) {
      return matchers.length > 1 ? function(elem, context, xml) {
        var i = matchers.length;
        while (i--) {
          if (!matchers[i](elem, context, xml)) {
            return false;
          }
        }
        return true;
      } : matchers[0];
    }
    function multipleContexts(selector, contexts, results) {
      var i = 0,
          len = contexts.length;
      for (; i < len; i++) {
        Sizzle(selector, contexts[i], results);
      }
      return results;
    }
    function condense(unmatched, map, filter, context, xml) {
      var elem,
          newUnmatched = [],
          i = 0,
          len = unmatched.length,
          mapped = map != null;
      for (; i < len; i++) {
        if ((elem = unmatched[i])) {
          if (!filter || filter(elem, context, xml)) {
            newUnmatched.push(elem);
            if (mapped) {
              map.push(i);
            }
          }
        }
      }
      return newUnmatched;
    }
    function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
      if (postFilter && !postFilter[expando]) {
        postFilter = setMatcher(postFilter);
      }
      if (postFinder && !postFinder[expando]) {
        postFinder = setMatcher(postFinder, postSelector);
      }
      return markFunction(function(seed, results, context, xml) {
        var temp,
            i,
            elem,
            preMap = [],
            postMap = [],
            preexisting = results.length,
            elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),
            matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems,
            matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
        if (matcher) {
          matcher(matcherIn, matcherOut, context, xml);
        }
        if (postFilter) {
          temp = condense(matcherOut, postMap);
          postFilter(temp, [], context, xml);
          i = temp.length;
          while (i--) {
            if ((elem = temp[i])) {
              matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
            }
          }
        }
        if (seed) {
          if (postFinder || preFilter) {
            if (postFinder) {
              temp = [];
              i = matcherOut.length;
              while (i--) {
                if ((elem = matcherOut[i])) {
                  temp.push((matcherIn[i] = elem));
                }
              }
              postFinder(null, (matcherOut = []), temp, xml);
            }
            i = matcherOut.length;
            while (i--) {
              if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {
                seed[temp] = !(results[temp] = elem);
              }
            }
          }
        } else {
          matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
          if (postFinder) {
            postFinder(null, results, matcherOut, xml);
          } else {
            push.apply(results, matcherOut);
          }
        }
      });
    }
    function matcherFromTokens(tokens) {
      var checkContext,
          matcher,
          j,
          len = tokens.length,
          leadingRelative = Expr.relative[tokens[0].type],
          implicitRelative = leadingRelative || Expr.relative[" "],
          i = leadingRelative ? 1 : 0,
          matchContext = addCombinator(function(elem) {
            return elem === checkContext;
          }, implicitRelative, true),
          matchAnyContext = addCombinator(function(elem) {
            return indexOf(checkContext, elem) > -1;
          }, implicitRelative, true),
          matchers = [function(elem, context, xml) {
            var ret = (!leadingRelative && (xml || context !== outermostContext)) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
            checkContext = null;
            return ret;
          }];
      for (; i < len; i++) {
        if ((matcher = Expr.relative[tokens[i].type])) {
          matchers = [addCombinator(elementMatcher(matchers), matcher)];
        } else {
          matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);
          if (matcher[expando]) {
            j = ++i;
            for (; j < len; j++) {
              if (Expr.relative[tokens[j].type]) {
                break;
              }
            }
            return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({value: tokens[i - 2].type === " " ? "*" : ""})).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens((tokens = tokens.slice(j))), j < len && toSelector(tokens));
          }
          matchers.push(matcher);
        }
      }
      return elementMatcher(matchers);
    }
    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
      var bySet = setMatchers.length > 0,
          byElement = elementMatchers.length > 0,
          superMatcher = function(seed, context, xml, results, outermost) {
            var elem,
                j,
                matcher,
                matchedCount = 0,
                i = "0",
                unmatched = seed && [],
                setMatched = [],
                contextBackup = outermostContext,
                elems = seed || byElement && Expr.find["TAG"]("*", outermost),
                dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
                len = elems.length;
            if (outermost) {
              outermostContext = context === document || context || outermost;
            }
            for (; i !== len && (elem = elems[i]) != null; i++) {
              if (byElement && elem) {
                j = 0;
                if (!context && elem.ownerDocument !== document) {
                  setDocument(elem);
                  xml = !documentIsHTML;
                }
                while ((matcher = elementMatchers[j++])) {
                  if (matcher(elem, context || document, xml)) {
                    results.push(elem);
                    break;
                  }
                }
                if (outermost) {
                  dirruns = dirrunsUnique;
                }
              }
              if (bySet) {
                if ((elem = !matcher && elem)) {
                  matchedCount--;
                }
                if (seed) {
                  unmatched.push(elem);
                }
              }
            }
            matchedCount += i;
            if (bySet && i !== matchedCount) {
              j = 0;
              while ((matcher = setMatchers[j++])) {
                matcher(unmatched, setMatched, context, xml);
              }
              if (seed) {
                if (matchedCount > 0) {
                  while (i--) {
                    if (!(unmatched[i] || setMatched[i])) {
                      setMatched[i] = pop.call(results);
                    }
                  }
                }
                setMatched = condense(setMatched);
              }
              push.apply(results, setMatched);
              if (outermost && !seed && setMatched.length > 0 && (matchedCount + setMatchers.length) > 1) {
                Sizzle.uniqueSort(results);
              }
            }
            if (outermost) {
              dirruns = dirrunsUnique;
              outermostContext = contextBackup;
            }
            return unmatched;
          };
      return bySet ? markFunction(superMatcher) : superMatcher;
    }
    compile = Sizzle.compile = function(selector, match) {
      var i,
          setMatchers = [],
          elementMatchers = [],
          cached = compilerCache[selector + " "];
      if (!cached) {
        if (!match) {
          match = tokenize(selector);
        }
        i = match.length;
        while (i--) {
          cached = matcherFromTokens(match[i]);
          if (cached[expando]) {
            setMatchers.push(cached);
          } else {
            elementMatchers.push(cached);
          }
        }
        cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
        cached.selector = selector;
      }
      return cached;
    };
    select = Sizzle.select = function(selector, context, results, seed) {
      var i,
          tokens,
          token,
          type,
          find,
          compiled = typeof selector === "function" && selector,
          match = !seed && tokenize((selector = compiled.selector || selector));
      results = results || [];
      if (match.length === 1) {
        tokens = match[0] = match[0].slice(0);
        if (tokens.length > 2 && (token = tokens[0]).type === "ID" && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
          context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
          if (!context) {
            return results;
          } else if (compiled) {
            context = context.parentNode;
          }
          selector = selector.slice(tokens.shift().value.length);
        }
        i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
        while (i--) {
          token = tokens[i];
          if (Expr.relative[(type = token.type)]) {
            break;
          }
          if ((find = Expr.find[type])) {
            if ((seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context))) {
              tokens.splice(i, 1);
              selector = seed.length && toSelector(tokens);
              if (!selector) {
                push.apply(results, seed);
                return results;
              }
              break;
            }
          }
        }
      }
      (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, !context || rsibling.test(selector) && testContext(context.parentNode) || context);
      return results;
    };
    support.sortStable = expando.split("").sort(sortOrder).join("") === expando;
    support.detectDuplicates = !!hasDuplicate;
    setDocument();
    support.sortDetached = assert(function(div1) {
      return div1.compareDocumentPosition(document.createElement("div")) & 1;
    });
    if (!assert(function(div) {
      div.innerHTML = "<a href='#'></a>";
      return div.firstChild.getAttribute("href") === "#";
    })) {
      addHandle("type|href|height|width", function(elem, name, isXML) {
        if (!isXML) {
          return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
        }
      });
    }
    if (!support.attributes || !assert(function(div) {
      div.innerHTML = "<input/>";
      div.firstChild.setAttribute("value", "");
      return div.firstChild.getAttribute("value") === "";
    })) {
      addHandle("value", function(elem, name, isXML) {
        if (!isXML && elem.nodeName.toLowerCase() === "input") {
          return elem.defaultValue;
        }
      });
    }
    if (!assert(function(div) {
      return div.getAttribute("disabled") == null;
    })) {
      addHandle(booleans, function(elem, name, isXML) {
        var val;
        if (!isXML) {
          return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
        }
      });
    }
    return Sizzle;
  })(window);
  jQuery.find = Sizzle;
  jQuery.expr = Sizzle.selectors;
  jQuery.expr[":"] = jQuery.expr.pseudos;
  jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
  jQuery.text = Sizzle.getText;
  jQuery.isXMLDoc = Sizzle.isXML;
  jQuery.contains = Sizzle.contains;
  var dir = function(elem, dir, until) {
    var matched = [],
        truncate = until !== undefined;
    while ((elem = elem[dir]) && elem.nodeType !== 9) {
      if (elem.nodeType === 1) {
        if (truncate && jQuery(elem).is(until)) {
          break;
        }
        matched.push(elem);
      }
    }
    return matched;
  };
  var siblings = function(n, elem) {
    var matched = [];
    for (; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n !== elem) {
        matched.push(n);
      }
    }
    return matched;
  };
  var rneedsContext = jQuery.expr.match.needsContext;
  var rsingleTag = (/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/);
  var risSimple = /^.[^:#\[\.,]*$/;
  function winnow(elements, qualifier, not) {
    if (jQuery.isFunction(qualifier)) {
      return jQuery.grep(elements, function(elem, i) {
        return !!qualifier.call(elem, i, elem) !== not;
      });
    }
    if (qualifier.nodeType) {
      return jQuery.grep(elements, function(elem) {
        return (elem === qualifier) !== not;
      });
    }
    if (typeof qualifier === "string") {
      if (risSimple.test(qualifier)) {
        return jQuery.filter(qualifier, elements, not);
      }
      qualifier = jQuery.filter(qualifier, elements);
    }
    return jQuery.grep(elements, function(elem) {
      return (indexOf.call(qualifier, elem) > -1) !== not;
    });
  }
  jQuery.filter = function(expr, elems, not) {
    var elem = elems[0];
    if (not) {
      expr = ":not(" + expr + ")";
    }
    return elems.length === 1 && elem.nodeType === 1 ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function(elem) {
      return elem.nodeType === 1;
    }));
  };
  jQuery.fn.extend({
    find: function(selector) {
      var i,
          len = this.length,
          ret = [],
          self = this;
      if (typeof selector !== "string") {
        return this.pushStack(jQuery(selector).filter(function() {
          for (i = 0; i < len; i++) {
            if (jQuery.contains(self[i], this)) {
              return true;
            }
          }
        }));
      }
      for (i = 0; i < len; i++) {
        jQuery.find(selector, self[i], ret);
      }
      ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
      ret.selector = this.selector ? this.selector + " " + selector : selector;
      return ret;
    },
    filter: function(selector) {
      return this.pushStack(winnow(this, selector || [], false));
    },
    not: function(selector) {
      return this.pushStack(winnow(this, selector || [], true));
    },
    is: function(selector) {
      return !!winnow(this, typeof selector === "string" && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
    }
  });
  var rootjQuery,
      rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
      init = jQuery.fn.init = function(selector, context, root) {
        var match,
            elem;
        if (!selector) {
          return this;
        }
        root = root || rootjQuery;
        if (typeof selector === "string") {
          if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
            match = [null, selector, null];
          } else {
            match = rquickExpr.exec(selector);
          }
          if (match && (match[1] || !context)) {
            if (match[1]) {
              context = context instanceof jQuery ? context[0] : context;
              jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));
              if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                for (match in context) {
                  if (jQuery.isFunction(this[match])) {
                    this[match](context[match]);
                  } else {
                    this.attr(match, context[match]);
                  }
                }
              }
              return this;
            } else {
              elem = document.getElementById(match[2]);
              if (elem && elem.parentNode) {
                this.length = 1;
                this[0] = elem;
              }
              this.context = document;
              this.selector = selector;
              return this;
            }
          } else if (!context || context.jquery) {
            return (context || root).find(selector);
          } else {
            return this.constructor(context).find(selector);
          }
        } else if (selector.nodeType) {
          this.context = this[0] = selector;
          this.length = 1;
          return this;
        } else if (jQuery.isFunction(selector)) {
          return root.ready !== undefined ? root.ready(selector) : selector(jQuery);
        }
        if (selector.selector !== undefined) {
          this.selector = selector.selector;
          this.context = selector.context;
        }
        return jQuery.makeArray(selector, this);
      };
  init.prototype = jQuery.fn;
  rootjQuery = jQuery(document);
  var rparentsprev = /^(?:parents|prev(?:Until|All))/,
      guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
      };
  jQuery.fn.extend({
    has: function(target) {
      var targets = jQuery(target, this),
          l = targets.length;
      return this.filter(function() {
        var i = 0;
        for (; i < l; i++) {
          if (jQuery.contains(this, targets[i])) {
            return true;
          }
        }
      });
    },
    closest: function(selectors, context) {
      var cur,
          i = 0,
          l = this.length,
          matched = [],
          pos = rneedsContext.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context || this.context) : 0;
      for (; i < l; i++) {
        for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
          if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {
            matched.push(cur);
            break;
          }
        }
      }
      return this.pushStack(matched.length > 1 ? jQuery.uniqueSort(matched) : matched);
    },
    index: function(elem) {
      if (!elem) {
        return (this[0] && this[0].parentNode) ? this.first().prevAll().length : -1;
      }
      if (typeof elem === "string") {
        return indexOf.call(jQuery(elem), this[0]);
      }
      return indexOf.call(this, elem.jquery ? elem[0] : elem);
    },
    add: function(selector, context) {
      return this.pushStack(jQuery.uniqueSort(jQuery.merge(this.get(), jQuery(selector, context))));
    },
    addBack: function(selector) {
      return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
    }
  });
  function sibling(cur, dir) {
    while ((cur = cur[dir]) && cur.nodeType !== 1) {}
    return cur;
  }
  jQuery.each({
    parent: function(elem) {
      var parent = elem.parentNode;
      return parent && parent.nodeType !== 11 ? parent : null;
    },
    parents: function(elem) {
      return dir(elem, "parentNode");
    },
    parentsUntil: function(elem, i, until) {
      return dir(elem, "parentNode", until);
    },
    next: function(elem) {
      return sibling(elem, "nextSibling");
    },
    prev: function(elem) {
      return sibling(elem, "previousSibling");
    },
    nextAll: function(elem) {
      return dir(elem, "nextSibling");
    },
    prevAll: function(elem) {
      return dir(elem, "previousSibling");
    },
    nextUntil: function(elem, i, until) {
      return dir(elem, "nextSibling", until);
    },
    prevUntil: function(elem, i, until) {
      return dir(elem, "previousSibling", until);
    },
    siblings: function(elem) {
      return siblings((elem.parentNode || {}).firstChild, elem);
    },
    children: function(elem) {
      return siblings(elem.firstChild);
    },
    contents: function(elem) {
      return elem.contentDocument || jQuery.merge([], elem.childNodes);
    }
  }, function(name, fn) {
    jQuery.fn[name] = function(until, selector) {
      var matched = jQuery.map(this, fn, until);
      if (name.slice(-5) !== "Until") {
        selector = until;
      }
      if (selector && typeof selector === "string") {
        matched = jQuery.filter(selector, matched);
      }
      if (this.length > 1) {
        if (!guaranteedUnique[name]) {
          jQuery.uniqueSort(matched);
        }
        if (rparentsprev.test(name)) {
          matched.reverse();
        }
      }
      return this.pushStack(matched);
    };
  });
  var rnotwhite = (/\S+/g);
  function createOptions(options) {
    var object = {};
    jQuery.each(options.match(rnotwhite) || [], function(_, flag) {
      object[flag] = true;
    });
    return object;
  }
  jQuery.Callbacks = function(options) {
    options = typeof options === "string" ? createOptions(options) : jQuery.extend({}, options);
    var firing,
        memory,
        fired,
        locked,
        list = [],
        queue = [],
        firingIndex = -1,
        fire = function() {
          locked = options.once;
          fired = firing = true;
          for (; queue.length; firingIndex = -1) {
            memory = queue.shift();
            while (++firingIndex < list.length) {
              if (list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {
                firingIndex = list.length;
                memory = false;
              }
            }
          }
          if (!options.memory) {
            memory = false;
          }
          firing = false;
          if (locked) {
            if (memory) {
              list = [];
            } else {
              list = "";
            }
          }
        },
        self = {
          add: function() {
            if (list) {
              if (memory && !firing) {
                firingIndex = list.length - 1;
                queue.push(memory);
              }
              (function add(args) {
                jQuery.each(args, function(_, arg) {
                  if (jQuery.isFunction(arg)) {
                    if (!options.unique || !self.has(arg)) {
                      list.push(arg);
                    }
                  } else if (arg && arg.length && jQuery.type(arg) !== "string") {
                    add(arg);
                  }
                });
              })(arguments);
              if (memory && !firing) {
                fire();
              }
            }
            return this;
          },
          remove: function() {
            jQuery.each(arguments, function(_, arg) {
              var index;
              while ((index = jQuery.inArray(arg, list, index)) > -1) {
                list.splice(index, 1);
                if (index <= firingIndex) {
                  firingIndex--;
                }
              }
            });
            return this;
          },
          has: function(fn) {
            return fn ? jQuery.inArray(fn, list) > -1 : list.length > 0;
          },
          empty: function() {
            if (list) {
              list = [];
            }
            return this;
          },
          disable: function() {
            locked = queue = [];
            list = memory = "";
            return this;
          },
          disabled: function() {
            return !list;
          },
          lock: function() {
            locked = queue = [];
            if (!memory) {
              list = memory = "";
            }
            return this;
          },
          locked: function() {
            return !!locked;
          },
          fireWith: function(context, args) {
            if (!locked) {
              args = args || [];
              args = [context, args.slice ? args.slice() : args];
              queue.push(args);
              if (!firing) {
                fire();
              }
            }
            return this;
          },
          fire: function() {
            self.fireWith(this, arguments);
            return this;
          },
          fired: function() {
            return !!fired;
          }
        };
    return self;
  };
  jQuery.extend({
    Deferred: function(func) {
      var tuples = [["resolve", "done", jQuery.Callbacks("once memory"), "resolved"], ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"], ["notify", "progress", jQuery.Callbacks("memory")]],
          state = "pending",
          promise = {
            state: function() {
              return state;
            },
            always: function() {
              deferred.done(arguments).fail(arguments);
              return this;
            },
            then: function() {
              var fns = arguments;
              return jQuery.Deferred(function(newDefer) {
                jQuery.each(tuples, function(i, tuple) {
                  var fn = jQuery.isFunction(fns[i]) && fns[i];
                  deferred[tuple[1]](function() {
                    var returned = fn && fn.apply(this, arguments);
                    if (returned && jQuery.isFunction(returned.promise)) {
                      returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);
                    } else {
                      newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
                    }
                  });
                });
                fns = null;
              }).promise();
            },
            promise: function(obj) {
              return obj != null ? jQuery.extend(obj, promise) : promise;
            }
          },
          deferred = {};
      promise.pipe = promise.then;
      jQuery.each(tuples, function(i, tuple) {
        var list = tuple[2],
            stateString = tuple[3];
        promise[tuple[1]] = list.add;
        if (stateString) {
          list.add(function() {
            state = stateString;
          }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
        }
        deferred[tuple[0]] = function() {
          deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
          return this;
        };
        deferred[tuple[0] + "With"] = list.fireWith;
      });
      promise.promise(deferred);
      if (func) {
        func.call(deferred, deferred);
      }
      return deferred;
    },
    when: function(subordinate) {
      var i = 0,
          resolveValues = slice.call(arguments),
          length = resolveValues.length,
          remaining = length !== 1 || (subordinate && jQuery.isFunction(subordinate.promise)) ? length : 0,
          deferred = remaining === 1 ? subordinate : jQuery.Deferred(),
          updateFunc = function(i, contexts, values) {
            return function(value) {
              contexts[i] = this;
              values[i] = arguments.length > 1 ? slice.call(arguments) : value;
              if (values === progressValues) {
                deferred.notifyWith(contexts, values);
              } else if (!(--remaining)) {
                deferred.resolveWith(contexts, values);
              }
            };
          },
          progressValues,
          progressContexts,
          resolveContexts;
      if (length > 1) {
        progressValues = new Array(length);
        progressContexts = new Array(length);
        resolveContexts = new Array(length);
        for (; i < length; i++) {
          if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
            resolveValues[i].promise().progress(updateFunc(i, progressContexts, progressValues)).done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject);
          } else {
            --remaining;
          }
        }
      }
      if (!remaining) {
        deferred.resolveWith(resolveContexts, resolveValues);
      }
      return deferred.promise();
    }
  });
  var readyList;
  jQuery.fn.ready = function(fn) {
    jQuery.ready.promise().done(fn);
    return this;
  };
  jQuery.extend({
    isReady: false,
    readyWait: 1,
    holdReady: function(hold) {
      if (hold) {
        jQuery.readyWait++;
      } else {
        jQuery.ready(true);
      }
    },
    ready: function(wait) {
      if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
        return;
      }
      jQuery.isReady = true;
      if (wait !== true && --jQuery.readyWait > 0) {
        return;
      }
      readyList.resolveWith(document, [jQuery]);
      if (jQuery.fn.triggerHandler) {
        jQuery(document).triggerHandler("ready");
        jQuery(document).off("ready");
      }
    }
  });
  function completed() {
    document.removeEventListener("DOMContentLoaded", completed);
    window.removeEventListener("load", completed);
    jQuery.ready();
  }
  jQuery.ready.promise = function(obj) {
    if (!readyList) {
      readyList = jQuery.Deferred();
      if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        window.setTimeout(jQuery.ready);
      } else {
        document.addEventListener("DOMContentLoaded", completed);
        window.addEventListener("load", completed);
      }
    }
    return readyList.promise(obj);
  };
  jQuery.ready.promise();
  var access = function(elems, fn, key, value, chainable, emptyGet, raw) {
    var i = 0,
        len = elems.length,
        bulk = key == null;
    if (jQuery.type(key) === "object") {
      chainable = true;
      for (i in key) {
        access(elems, fn, i, key[i], true, emptyGet, raw);
      }
    } else if (value !== undefined) {
      chainable = true;
      if (!jQuery.isFunction(value)) {
        raw = true;
      }
      if (bulk) {
        if (raw) {
          fn.call(elems, value);
          fn = null;
        } else {
          bulk = fn;
          fn = function(elem, key, value) {
            return bulk.call(jQuery(elem), value);
          };
        }
      }
      if (fn) {
        for (; i < len; i++) {
          fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
        }
      }
    }
    return chainable ? elems : bulk ? fn.call(elems) : len ? fn(elems[0], key) : emptyGet;
  };
  var acceptData = function(owner) {
    return owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType);
  };
  function Data() {
    this.expando = jQuery.expando + Data.uid++;
  }
  Data.uid = 1;
  Data.prototype = {
    register: function(owner, initial) {
      var value = initial || {};
      if (owner.nodeType) {
        owner[this.expando] = value;
      } else {
        Object.defineProperty(owner, this.expando, {
          value: value,
          writable: true,
          configurable: true
        });
      }
      return owner[this.expando];
    },
    cache: function(owner) {
      if (!acceptData(owner)) {
        return {};
      }
      var value = owner[this.expando];
      if (!value) {
        value = {};
        if (acceptData(owner)) {
          if (owner.nodeType) {
            owner[this.expando] = value;
          } else {
            Object.defineProperty(owner, this.expando, {
              value: value,
              configurable: true
            });
          }
        }
      }
      return value;
    },
    set: function(owner, data, value) {
      var prop,
          cache = this.cache(owner);
      if (typeof data === "string") {
        cache[data] = value;
      } else {
        for (prop in data) {
          cache[prop] = data[prop];
        }
      }
      return cache;
    },
    get: function(owner, key) {
      return key === undefined ? this.cache(owner) : owner[this.expando] && owner[this.expando][key];
    },
    access: function(owner, key, value) {
      var stored;
      if (key === undefined || ((key && typeof key === "string") && value === undefined)) {
        stored = this.get(owner, key);
        return stored !== undefined ? stored : this.get(owner, jQuery.camelCase(key));
      }
      this.set(owner, key, value);
      return value !== undefined ? value : key;
    },
    remove: function(owner, key) {
      var i,
          name,
          camel,
          cache = owner[this.expando];
      if (cache === undefined) {
        return;
      }
      if (key === undefined) {
        this.register(owner);
      } else {
        if (jQuery.isArray(key)) {
          name = key.concat(key.map(jQuery.camelCase));
        } else {
          camel = jQuery.camelCase(key);
          if (key in cache) {
            name = [key, camel];
          } else {
            name = camel;
            name = name in cache ? [name] : (name.match(rnotwhite) || []);
          }
        }
        i = name.length;
        while (i--) {
          delete cache[name[i]];
        }
      }
      if (key === undefined || jQuery.isEmptyObject(cache)) {
        if (owner.nodeType) {
          owner[this.expando] = undefined;
        } else {
          delete owner[this.expando];
        }
      }
    },
    hasData: function(owner) {
      var cache = owner[this.expando];
      return cache !== undefined && !jQuery.isEmptyObject(cache);
    }
  };
  var dataPriv = new Data();
  var dataUser = new Data();
  var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
      rmultiDash = /[A-Z]/g;
  function dataAttr(elem, key, data) {
    var name;
    if (data === undefined && elem.nodeType === 1) {
      name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
      data = elem.getAttribute(name);
      if (typeof data === "string") {
        try {
          data = data === "true" ? true : data === "false" ? false : data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
        } catch (e) {}
        dataUser.set(elem, key, data);
      } else {
        data = undefined;
      }
    }
    return data;
  }
  jQuery.extend({
    hasData: function(elem) {
      return dataUser.hasData(elem) || dataPriv.hasData(elem);
    },
    data: function(elem, name, data) {
      return dataUser.access(elem, name, data);
    },
    removeData: function(elem, name) {
      dataUser.remove(elem, name);
    },
    _data: function(elem, name, data) {
      return dataPriv.access(elem, name, data);
    },
    _removeData: function(elem, name) {
      dataPriv.remove(elem, name);
    }
  });
  jQuery.fn.extend({
    data: function(key, value) {
      var i,
          name,
          data,
          elem = this[0],
          attrs = elem && elem.attributes;
      if (key === undefined) {
        if (this.length) {
          data = dataUser.get(elem);
          if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
            i = attrs.length;
            while (i--) {
              if (attrs[i]) {
                name = attrs[i].name;
                if (name.indexOf("data-") === 0) {
                  name = jQuery.camelCase(name.slice(5));
                  dataAttr(elem, name, data[name]);
                }
              }
            }
            dataPriv.set(elem, "hasDataAttrs", true);
          }
        }
        return data;
      }
      if (typeof key === "object") {
        return this.each(function() {
          dataUser.set(this, key);
        });
      }
      return access(this, function(value) {
        var data,
            camelKey;
        if (elem && value === undefined) {
          data = dataUser.get(elem, key) || dataUser.get(elem, key.replace(rmultiDash, "-$&").toLowerCase());
          if (data !== undefined) {
            return data;
          }
          camelKey = jQuery.camelCase(key);
          data = dataUser.get(elem, camelKey);
          if (data !== undefined) {
            return data;
          }
          data = dataAttr(elem, camelKey, undefined);
          if (data !== undefined) {
            return data;
          }
          return;
        }
        camelKey = jQuery.camelCase(key);
        this.each(function() {
          var data = dataUser.get(this, camelKey);
          dataUser.set(this, camelKey, value);
          if (key.indexOf("-") > -1 && data !== undefined) {
            dataUser.set(this, key, value);
          }
        });
      }, null, value, arguments.length > 1, null, true);
    },
    removeData: function(key) {
      return this.each(function() {
        dataUser.remove(this, key);
      });
    }
  });
  jQuery.extend({
    queue: function(elem, type, data) {
      var queue;
      if (elem) {
        type = (type || "fx") + "queue";
        queue = dataPriv.get(elem, type);
        if (data) {
          if (!queue || jQuery.isArray(data)) {
            queue = dataPriv.access(elem, type, jQuery.makeArray(data));
          } else {
            queue.push(data);
          }
        }
        return queue || [];
      }
    },
    dequeue: function(elem, type) {
      type = type || "fx";
      var queue = jQuery.queue(elem, type),
          startLength = queue.length,
          fn = queue.shift(),
          hooks = jQuery._queueHooks(elem, type),
          next = function() {
            jQuery.dequeue(elem, type);
          };
      if (fn === "inprogress") {
        fn = queue.shift();
        startLength--;
      }
      if (fn) {
        if (type === "fx") {
          queue.unshift("inprogress");
        }
        delete hooks.stop;
        fn.call(elem, next, hooks);
      }
      if (!startLength && hooks) {
        hooks.empty.fire();
      }
    },
    _queueHooks: function(elem, type) {
      var key = type + "queueHooks";
      return dataPriv.get(elem, key) || dataPriv.access(elem, key, {empty: jQuery.Callbacks("once memory").add(function() {
          dataPriv.remove(elem, [type + "queue", key]);
        })});
    }
  });
  jQuery.fn.extend({
    queue: function(type, data) {
      var setter = 2;
      if (typeof type !== "string") {
        data = type;
        type = "fx";
        setter--;
      }
      if (arguments.length < setter) {
        return jQuery.queue(this[0], type);
      }
      return data === undefined ? this : this.each(function() {
        var queue = jQuery.queue(this, type, data);
        jQuery._queueHooks(this, type);
        if (type === "fx" && queue[0] !== "inprogress") {
          jQuery.dequeue(this, type);
        }
      });
    },
    dequeue: function(type) {
      return this.each(function() {
        jQuery.dequeue(this, type);
      });
    },
    clearQueue: function(type) {
      return this.queue(type || "fx", []);
    },
    promise: function(type, obj) {
      var tmp,
          count = 1,
          defer = jQuery.Deferred(),
          elements = this,
          i = this.length,
          resolve = function() {
            if (!(--count)) {
              defer.resolveWith(elements, [elements]);
            }
          };
      if (typeof type !== "string") {
        obj = type;
        type = undefined;
      }
      type = type || "fx";
      while (i--) {
        tmp = dataPriv.get(elements[i], type + "queueHooks");
        if (tmp && tmp.empty) {
          count++;
          tmp.empty.add(resolve);
        }
      }
      resolve();
      return defer.promise(obj);
    }
  });
  var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
  var rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");
  var cssExpand = ["Top", "Right", "Bottom", "Left"];
  var isHidden = function(elem, el) {
    elem = el || elem;
    return jQuery.css(elem, "display") === "none" || !jQuery.contains(elem.ownerDocument, elem);
  };
  function adjustCSS(elem, prop, valueParts, tween) {
    var adjusted,
        scale = 1,
        maxIterations = 20,
        currentValue = tween ? function() {
          return tween.cur();
        } : function() {
          return jQuery.css(elem, prop, "");
        },
        initial = currentValue(),
        unit = valueParts && valueParts[3] || (jQuery.cssNumber[prop] ? "" : "px"),
        initialInUnit = (jQuery.cssNumber[prop] || unit !== "px" && +initial) && rcssNum.exec(jQuery.css(elem, prop));
    if (initialInUnit && initialInUnit[3] !== unit) {
      unit = unit || initialInUnit[3];
      valueParts = valueParts || [];
      initialInUnit = +initial || 1;
      do {
        scale = scale || ".5";
        initialInUnit = initialInUnit / scale;
        jQuery.style(elem, prop, initialInUnit + unit);
      } while (scale !== (scale = currentValue() / initial) && scale !== 1 && --maxIterations);
    }
    if (valueParts) {
      initialInUnit = +initialInUnit || +initial || 0;
      adjusted = valueParts[1] ? initialInUnit + (valueParts[1] + 1) * valueParts[2] : +valueParts[2];
      if (tween) {
        tween.unit = unit;
        tween.start = initialInUnit;
        tween.end = adjusted;
      }
    }
    return adjusted;
  }
  var rcheckableType = (/^(?:checkbox|radio)$/i);
  var rtagName = (/<([\w:-]+)/);
  var rscriptType = (/^$|\/(?:java|ecma)script/i);
  var wrapMap = {
    option: [1, "<select multiple='multiple'>", "</select>"],
    thead: [1, "<table>", "</table>"],
    col: [2, "<table><colgroup>", "</colgroup></table>"],
    tr: [2, "<table><tbody>", "</tbody></table>"],
    td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
    _default: [0, "", ""]
  };
  wrapMap.optgroup = wrapMap.option;
  wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
  wrapMap.th = wrapMap.td;
  function getAll(context, tag) {
    var ret = typeof context.getElementsByTagName !== "undefined" ? context.getElementsByTagName(tag || "*") : typeof context.querySelectorAll !== "undefined" ? context.querySelectorAll(tag || "*") : [];
    return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], ret) : ret;
  }
  function setGlobalEval(elems, refElements) {
    var i = 0,
        l = elems.length;
    for (; i < l; i++) {
      dataPriv.set(elems[i], "globalEval", !refElements || dataPriv.get(refElements[i], "globalEval"));
    }
  }
  var rhtml = /<|&#?\w+;/;
  function buildFragment(elems, context, scripts, selection, ignored) {
    var elem,
        tmp,
        tag,
        wrap,
        contains,
        j,
        fragment = context.createDocumentFragment(),
        nodes = [],
        i = 0,
        l = elems.length;
    for (; i < l; i++) {
      elem = elems[i];
      if (elem || elem === 0) {
        if (jQuery.type(elem) === "object") {
          jQuery.merge(nodes, elem.nodeType ? [elem] : elem);
        } else if (!rhtml.test(elem)) {
          nodes.push(context.createTextNode(elem));
        } else {
          tmp = tmp || fragment.appendChild(context.createElement("div"));
          tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
          wrap = wrapMap[tag] || wrapMap._default;
          tmp.innerHTML = wrap[1] + jQuery.htmlPrefilter(elem) + wrap[2];
          j = wrap[0];
          while (j--) {
            tmp = tmp.lastChild;
          }
          jQuery.merge(nodes, tmp.childNodes);
          tmp = fragment.firstChild;
          tmp.textContent = "";
        }
      }
    }
    fragment.textContent = "";
    i = 0;
    while ((elem = nodes[i++])) {
      if (selection && jQuery.inArray(elem, selection) > -1) {
        if (ignored) {
          ignored.push(elem);
        }
        continue;
      }
      contains = jQuery.contains(elem.ownerDocument, elem);
      tmp = getAll(fragment.appendChild(elem), "script");
      if (contains) {
        setGlobalEval(tmp);
      }
      if (scripts) {
        j = 0;
        while ((elem = tmp[j++])) {
          if (rscriptType.test(elem.type || "")) {
            scripts.push(elem);
          }
        }
      }
    }
    return fragment;
  }
  (function() {
    var fragment = document.createDocumentFragment(),
        div = fragment.appendChild(document.createElement("div")),
        input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("checked", "checked");
    input.setAttribute("name", "t");
    div.appendChild(input);
    support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
    div.innerHTML = "<textarea>x</textarea>";
    support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
  })();
  var rkeyEvent = /^key/,
      rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
      rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
  function returnTrue() {
    return true;
  }
  function returnFalse() {
    return false;
  }
  function safeActiveElement() {
    try {
      return document.activeElement;
    } catch (err) {}
  }
  function on(elem, types, selector, data, fn, one) {
    var origFn,
        type;
    if (typeof types === "object") {
      if (typeof selector !== "string") {
        data = data || selector;
        selector = undefined;
      }
      for (type in types) {
        on(elem, type, selector, data, types[type], one);
      }
      return elem;
    }
    if (data == null && fn == null) {
      fn = selector;
      data = selector = undefined;
    } else if (fn == null) {
      if (typeof selector === "string") {
        fn = data;
        data = undefined;
      } else {
        fn = data;
        data = selector;
        selector = undefined;
      }
    }
    if (fn === false) {
      fn = returnFalse;
    } else if (!fn) {
      return this;
    }
    if (one === 1) {
      origFn = fn;
      fn = function(event) {
        jQuery().off(event);
        return origFn.apply(this, arguments);
      };
      fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
    }
    return elem.each(function() {
      jQuery.event.add(this, types, fn, data, selector);
    });
  }
  jQuery.event = {
    global: {},
    add: function(elem, types, handler, data, selector) {
      var handleObjIn,
          eventHandle,
          tmp,
          events,
          t,
          handleObj,
          special,
          handlers,
          type,
          namespaces,
          origType,
          elemData = dataPriv.get(elem);
      if (!elemData) {
        return;
      }
      if (handler.handler) {
        handleObjIn = handler;
        handler = handleObjIn.handler;
        selector = handleObjIn.selector;
      }
      if (!handler.guid) {
        handler.guid = jQuery.guid++;
      }
      if (!(events = elemData.events)) {
        events = elemData.events = {};
      }
      if (!(eventHandle = elemData.handle)) {
        eventHandle = elemData.handle = function(e) {
          return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ? jQuery.event.dispatch.apply(elem, arguments) : undefined;
        };
      }
      types = (types || "").match(rnotwhite) || [""];
      t = types.length;
      while (t--) {
        tmp = rtypenamespace.exec(types[t]) || [];
        type = origType = tmp[1];
        namespaces = (tmp[2] || "").split(".").sort();
        if (!type) {
          continue;
        }
        special = jQuery.event.special[type] || {};
        type = (selector ? special.delegateType : special.bindType) || type;
        special = jQuery.event.special[type] || {};
        handleObj = jQuery.extend({
          type: type,
          origType: origType,
          data: data,
          handler: handler,
          guid: handler.guid,
          selector: selector,
          needsContext: selector && jQuery.expr.match.needsContext.test(selector),
          namespace: namespaces.join(".")
        }, handleObjIn);
        if (!(handlers = events[type])) {
          handlers = events[type] = [];
          handlers.delegateCount = 0;
          if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
            if (elem.addEventListener) {
              elem.addEventListener(type, eventHandle);
            }
          }
        }
        if (special.add) {
          special.add.call(elem, handleObj);
          if (!handleObj.handler.guid) {
            handleObj.handler.guid = handler.guid;
          }
        }
        if (selector) {
          handlers.splice(handlers.delegateCount++, 0, handleObj);
        } else {
          handlers.push(handleObj);
        }
        jQuery.event.global[type] = true;
      }
    },
    remove: function(elem, types, handler, selector, mappedTypes) {
      var j,
          origCount,
          tmp,
          events,
          t,
          handleObj,
          special,
          handlers,
          type,
          namespaces,
          origType,
          elemData = dataPriv.hasData(elem) && dataPriv.get(elem);
      if (!elemData || !(events = elemData.events)) {
        return;
      }
      types = (types || "").match(rnotwhite) || [""];
      t = types.length;
      while (t--) {
        tmp = rtypenamespace.exec(types[t]) || [];
        type = origType = tmp[1];
        namespaces = (tmp[2] || "").split(".").sort();
        if (!type) {
          for (type in events) {
            jQuery.event.remove(elem, type + types[t], handler, selector, true);
          }
          continue;
        }
        special = jQuery.event.special[type] || {};
        type = (selector ? special.delegateType : special.bindType) || type;
        handlers = events[type] || [];
        tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
        origCount = j = handlers.length;
        while (j--) {
          handleObj = handlers[j];
          if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
            handlers.splice(j, 1);
            if (handleObj.selector) {
              handlers.delegateCount--;
            }
            if (special.remove) {
              special.remove.call(elem, handleObj);
            }
          }
        }
        if (origCount && !handlers.length) {
          if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
            jQuery.removeEvent(elem, type, elemData.handle);
          }
          delete events[type];
        }
      }
      if (jQuery.isEmptyObject(events)) {
        dataPriv.remove(elem, "handle events");
      }
    },
    dispatch: function(event) {
      event = jQuery.event.fix(event);
      var i,
          j,
          ret,
          matched,
          handleObj,
          handlerQueue = [],
          args = slice.call(arguments),
          handlers = (dataPriv.get(this, "events") || {})[event.type] || [],
          special = jQuery.event.special[event.type] || {};
      args[0] = event;
      event.delegateTarget = this;
      if (special.preDispatch && special.preDispatch.call(this, event) === false) {
        return;
      }
      handlerQueue = jQuery.event.handlers.call(this, event, handlers);
      i = 0;
      while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
        event.currentTarget = matched.elem;
        j = 0;
        while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
          if (!event.rnamespace || event.rnamespace.test(handleObj.namespace)) {
            event.handleObj = handleObj;
            event.data = handleObj.data;
            ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
            if (ret !== undefined) {
              if ((event.result = ret) === false) {
                event.preventDefault();
                event.stopPropagation();
              }
            }
          }
        }
      }
      if (special.postDispatch) {
        special.postDispatch.call(this, event);
      }
      return event.result;
    },
    handlers: function(event, handlers) {
      var i,
          matches,
          sel,
          handleObj,
          handlerQueue = [],
          delegateCount = handlers.delegateCount,
          cur = event.target;
      if (delegateCount && cur.nodeType && (event.type !== "click" || isNaN(event.button) || event.button < 1)) {
        for (; cur !== this; cur = cur.parentNode || this) {
          if (cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click")) {
            matches = [];
            for (i = 0; i < delegateCount; i++) {
              handleObj = handlers[i];
              sel = handleObj.selector + " ";
              if (matches[sel] === undefined) {
                matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) > -1 : jQuery.find(sel, this, null, [cur]).length;
              }
              if (matches[sel]) {
                matches.push(handleObj);
              }
            }
            if (matches.length) {
              handlerQueue.push({
                elem: cur,
                handlers: matches
              });
            }
          }
        }
      }
      if (delegateCount < handlers.length) {
        handlerQueue.push({
          elem: this,
          handlers: handlers.slice(delegateCount)
        });
      }
      return handlerQueue;
    },
    props: ("altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " + "metaKey relatedTarget shiftKey target timeStamp view which").split(" "),
    fixHooks: {},
    keyHooks: {
      props: "char charCode key keyCode".split(" "),
      filter: function(event, original) {
        if (event.which == null) {
          event.which = original.charCode != null ? original.charCode : original.keyCode;
        }
        return event;
      }
    },
    mouseHooks: {
      props: ("button buttons clientX clientY offsetX offsetY pageX pageY " + "screenX screenY toElement").split(" "),
      filter: function(event, original) {
        var eventDoc,
            doc,
            body,
            button = original.button;
        if (event.pageX == null && original.clientX != null) {
          eventDoc = event.target.ownerDocument || document;
          doc = eventDoc.documentElement;
          body = eventDoc.body;
          event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
          event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
        }
        if (!event.which && button !== undefined) {
          event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
        }
        return event;
      }
    },
    fix: function(event) {
      if (event[jQuery.expando]) {
        return event;
      }
      var i,
          prop,
          copy,
          type = event.type,
          originalEvent = event,
          fixHook = this.fixHooks[type];
      if (!fixHook) {
        this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
      }
      copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
      event = new jQuery.Event(originalEvent);
      i = copy.length;
      while (i--) {
        prop = copy[i];
        event[prop] = originalEvent[prop];
      }
      if (!event.target) {
        event.target = document;
      }
      if (event.target.nodeType === 3) {
        event.target = event.target.parentNode;
      }
      return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
    },
    special: {
      load: {noBubble: true},
      focus: {
        trigger: function() {
          if (this !== safeActiveElement() && this.focus) {
            this.focus();
            return false;
          }
        },
        delegateType: "focusin"
      },
      blur: {
        trigger: function() {
          if (this === safeActiveElement() && this.blur) {
            this.blur();
            return false;
          }
        },
        delegateType: "focusout"
      },
      click: {
        trigger: function() {
          if (this.type === "checkbox" && this.click && jQuery.nodeName(this, "input")) {
            this.click();
            return false;
          }
        },
        _default: function(event) {
          return jQuery.nodeName(event.target, "a");
        }
      },
      beforeunload: {postDispatch: function(event) {
          if (event.result !== undefined && event.originalEvent) {
            event.originalEvent.returnValue = event.result;
          }
        }}
    }
  };
  jQuery.removeEvent = function(elem, type, handle) {
    if (elem.removeEventListener) {
      elem.removeEventListener(type, handle);
    }
  };
  jQuery.Event = function(src, props) {
    if (!(this instanceof jQuery.Event)) {
      return new jQuery.Event(src, props);
    }
    if (src && src.type) {
      this.originalEvent = src;
      this.type = src.type;
      this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined && src.returnValue === false ? returnTrue : returnFalse;
    } else {
      this.type = src;
    }
    if (props) {
      jQuery.extend(this, props);
    }
    this.timeStamp = src && src.timeStamp || jQuery.now();
    this[jQuery.expando] = true;
  };
  jQuery.Event.prototype = {
    constructor: jQuery.Event,
    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,
    preventDefault: function() {
      var e = this.originalEvent;
      this.isDefaultPrevented = returnTrue;
      if (e) {
        e.preventDefault();
      }
    },
    stopPropagation: function() {
      var e = this.originalEvent;
      this.isPropagationStopped = returnTrue;
      if (e) {
        e.stopPropagation();
      }
    },
    stopImmediatePropagation: function() {
      var e = this.originalEvent;
      this.isImmediatePropagationStopped = returnTrue;
      if (e) {
        e.stopImmediatePropagation();
      }
      this.stopPropagation();
    }
  };
  jQuery.each({
    mouseenter: "mouseover",
    mouseleave: "mouseout",
    pointerenter: "pointerover",
    pointerleave: "pointerout"
  }, function(orig, fix) {
    jQuery.event.special[orig] = {
      delegateType: fix,
      bindType: fix,
      handle: function(event) {
        var ret,
            target = this,
            related = event.relatedTarget,
            handleObj = event.handleObj;
        if (!related || (related !== target && !jQuery.contains(target, related))) {
          event.type = handleObj.origType;
          ret = handleObj.handler.apply(this, arguments);
          event.type = fix;
        }
        return ret;
      }
    };
  });
  jQuery.fn.extend({
    on: function(types, selector, data, fn) {
      return on(this, types, selector, data, fn);
    },
    one: function(types, selector, data, fn) {
      return on(this, types, selector, data, fn, 1);
    },
    off: function(types, selector, fn) {
      var handleObj,
          type;
      if (types && types.preventDefault && types.handleObj) {
        handleObj = types.handleObj;
        jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
        return this;
      }
      if (typeof types === "object") {
        for (type in types) {
          this.off(type, selector, types[type]);
        }
        return this;
      }
      if (selector === false || typeof selector === "function") {
        fn = selector;
        selector = undefined;
      }
      if (fn === false) {
        fn = returnFalse;
      }
      return this.each(function() {
        jQuery.event.remove(this, types, fn, selector);
      });
    }
  });
  var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
      rnoInnerhtml = /<script|<style|<link/i,
      rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
      rscriptTypeMasked = /^true\/(.*)/,
      rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
  function manipulationTarget(elem, content) {
    if (jQuery.nodeName(elem, "table") && jQuery.nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr")) {
      return elem.getElementsByTagName("tbody")[0] || elem;
    }
    return elem;
  }
  function disableScript(elem) {
    elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
    return elem;
  }
  function restoreScript(elem) {
    var match = rscriptTypeMasked.exec(elem.type);
    if (match) {
      elem.type = match[1];
    } else {
      elem.removeAttribute("type");
    }
    return elem;
  }
  function cloneCopyEvent(src, dest) {
    var i,
        l,
        type,
        pdataOld,
        pdataCur,
        udataOld,
        udataCur,
        events;
    if (dest.nodeType !== 1) {
      return;
    }
    if (dataPriv.hasData(src)) {
      pdataOld = dataPriv.access(src);
      pdataCur = dataPriv.set(dest, pdataOld);
      events = pdataOld.events;
      if (events) {
        delete pdataCur.handle;
        pdataCur.events = {};
        for (type in events) {
          for (i = 0, l = events[type].length; i < l; i++) {
            jQuery.event.add(dest, type, events[type][i]);
          }
        }
      }
    }
    if (dataUser.hasData(src)) {
      udataOld = dataUser.access(src);
      udataCur = jQuery.extend({}, udataOld);
      dataUser.set(dest, udataCur);
    }
  }
  function fixInput(src, dest) {
    var nodeName = dest.nodeName.toLowerCase();
    if (nodeName === "input" && rcheckableType.test(src.type)) {
      dest.checked = src.checked;
    } else if (nodeName === "input" || nodeName === "textarea") {
      dest.defaultValue = src.defaultValue;
    }
  }
  function domManip(collection, args, callback, ignored) {
    args = concat.apply([], args);
    var fragment,
        first,
        scripts,
        hasScripts,
        node,
        doc,
        i = 0,
        l = collection.length,
        iNoClone = l - 1,
        value = args[0],
        isFunction = jQuery.isFunction(value);
    if (isFunction || (l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value))) {
      return collection.each(function(index) {
        var self = collection.eq(index);
        if (isFunction) {
          args[0] = value.call(this, index, self.html());
        }
        domManip(self, args, callback, ignored);
      });
    }
    if (l) {
      fragment = buildFragment(args, collection[0].ownerDocument, false, collection, ignored);
      first = fragment.firstChild;
      if (fragment.childNodes.length === 1) {
        fragment = first;
      }
      if (first || ignored) {
        scripts = jQuery.map(getAll(fragment, "script"), disableScript);
        hasScripts = scripts.length;
        for (; i < l; i++) {
          node = fragment;
          if (i !== iNoClone) {
            node = jQuery.clone(node, true, true);
            if (hasScripts) {
              jQuery.merge(scripts, getAll(node, "script"));
            }
          }
          callback.call(collection[i], node, i);
        }
        if (hasScripts) {
          doc = scripts[scripts.length - 1].ownerDocument;
          jQuery.map(scripts, restoreScript);
          for (i = 0; i < hasScripts; i++) {
            node = scripts[i];
            if (rscriptType.test(node.type || "") && !dataPriv.access(node, "globalEval") && jQuery.contains(doc, node)) {
              if (node.src) {
                if (jQuery._evalUrl) {
                  jQuery._evalUrl(node.src);
                }
              } else {
                jQuery.globalEval(node.textContent.replace(rcleanScript, ""));
              }
            }
          }
        }
      }
    }
    return collection;
  }
  function remove(elem, selector, keepData) {
    var node,
        nodes = selector ? jQuery.filter(selector, elem) : elem,
        i = 0;
    for (; (node = nodes[i]) != null; i++) {
      if (!keepData && node.nodeType === 1) {
        jQuery.cleanData(getAll(node));
      }
      if (node.parentNode) {
        if (keepData && jQuery.contains(node.ownerDocument, node)) {
          setGlobalEval(getAll(node, "script"));
        }
        node.parentNode.removeChild(node);
      }
    }
    return elem;
  }
  jQuery.extend({
    htmlPrefilter: function(html) {
      return html.replace(rxhtmlTag, "<$1></$2>");
    },
    clone: function(elem, dataAndEvents, deepDataAndEvents) {
      var i,
          l,
          srcElements,
          destElements,
          clone = elem.cloneNode(true),
          inPage = jQuery.contains(elem.ownerDocument, elem);
      if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {
        destElements = getAll(clone);
        srcElements = getAll(elem);
        for (i = 0, l = srcElements.length; i < l; i++) {
          fixInput(srcElements[i], destElements[i]);
        }
      }
      if (dataAndEvents) {
        if (deepDataAndEvents) {
          srcElements = srcElements || getAll(elem);
          destElements = destElements || getAll(clone);
          for (i = 0, l = srcElements.length; i < l; i++) {
            cloneCopyEvent(srcElements[i], destElements[i]);
          }
        } else {
          cloneCopyEvent(elem, clone);
        }
      }
      destElements = getAll(clone, "script");
      if (destElements.length > 0) {
        setGlobalEval(destElements, !inPage && getAll(elem, "script"));
      }
      return clone;
    },
    cleanData: function(elems) {
      var data,
          elem,
          type,
          special = jQuery.event.special,
          i = 0;
      for (; (elem = elems[i]) !== undefined; i++) {
        if (acceptData(elem)) {
          if ((data = elem[dataPriv.expando])) {
            if (data.events) {
              for (type in data.events) {
                if (special[type]) {
                  jQuery.event.remove(elem, type);
                } else {
                  jQuery.removeEvent(elem, type, data.handle);
                }
              }
            }
            elem[dataPriv.expando] = undefined;
          }
          if (elem[dataUser.expando]) {
            elem[dataUser.expando] = undefined;
          }
        }
      }
    }
  });
  jQuery.fn.extend({
    domManip: domManip,
    detach: function(selector) {
      return remove(this, selector, true);
    },
    remove: function(selector) {
      return remove(this, selector);
    },
    text: function(value) {
      return access(this, function(value) {
        return value === undefined ? jQuery.text(this) : this.empty().each(function() {
          if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
            this.textContent = value;
          }
        });
      }, null, value, arguments.length);
    },
    append: function() {
      return domManip(this, arguments, function(elem) {
        if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
          var target = manipulationTarget(this, elem);
          target.appendChild(elem);
        }
      });
    },
    prepend: function() {
      return domManip(this, arguments, function(elem) {
        if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
          var target = manipulationTarget(this, elem);
          target.insertBefore(elem, target.firstChild);
        }
      });
    },
    before: function() {
      return domManip(this, arguments, function(elem) {
        if (this.parentNode) {
          this.parentNode.insertBefore(elem, this);
        }
      });
    },
    after: function() {
      return domManip(this, arguments, function(elem) {
        if (this.parentNode) {
          this.parentNode.insertBefore(elem, this.nextSibling);
        }
      });
    },
    empty: function() {
      var elem,
          i = 0;
      for (; (elem = this[i]) != null; i++) {
        if (elem.nodeType === 1) {
          jQuery.cleanData(getAll(elem, false));
          elem.textContent = "";
        }
      }
      return this;
    },
    clone: function(dataAndEvents, deepDataAndEvents) {
      dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
      deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
      return this.map(function() {
        return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
      });
    },
    html: function(value) {
      return access(this, function(value) {
        var elem = this[0] || {},
            i = 0,
            l = this.length;
        if (value === undefined && elem.nodeType === 1) {
          return elem.innerHTML;
        }
        if (typeof value === "string" && !rnoInnerhtml.test(value) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {
          value = jQuery.htmlPrefilter(value);
          try {
            for (; i < l; i++) {
              elem = this[i] || {};
              if (elem.nodeType === 1) {
                jQuery.cleanData(getAll(elem, false));
                elem.innerHTML = value;
              }
            }
            elem = 0;
          } catch (e) {}
        }
        if (elem) {
          this.empty().append(value);
        }
      }, null, value, arguments.length);
    },
    replaceWith: function() {
      var ignored = [];
      return domManip(this, arguments, function(elem) {
        var parent = this.parentNode;
        if (jQuery.inArray(this, ignored) < 0) {
          jQuery.cleanData(getAll(this));
          if (parent) {
            parent.replaceChild(elem, this);
          }
        }
      }, ignored);
    }
  });
  jQuery.each({
    appendTo: "append",
    prependTo: "prepend",
    insertBefore: "before",
    insertAfter: "after",
    replaceAll: "replaceWith"
  }, function(name, original) {
    jQuery.fn[name] = function(selector) {
      var elems,
          ret = [],
          insert = jQuery(selector),
          last = insert.length - 1,
          i = 0;
      for (; i <= last; i++) {
        elems = i === last ? this : this.clone(true);
        jQuery(insert[i])[original](elems);
        push.apply(ret, elems.get());
      }
      return this.pushStack(ret);
    };
  });
  var iframe,
      elemdisplay = {
        HTML: "block",
        BODY: "block"
      };
  function actualDisplay(name, doc) {
    var elem = jQuery(doc.createElement(name)).appendTo(doc.body),
        display = jQuery.css(elem[0], "display");
    elem.detach();
    return display;
  }
  function defaultDisplay(nodeName) {
    var doc = document,
        display = elemdisplay[nodeName];
    if (!display) {
      display = actualDisplay(nodeName, doc);
      if (display === "none" || !display) {
        iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement);
        doc = iframe[0].contentDocument;
        doc.write();
        doc.close();
        display = actualDisplay(nodeName, doc);
        iframe.detach();
      }
      elemdisplay[nodeName] = display;
    }
    return display;
  }
  var rmargin = (/^margin/);
  var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
  var getStyles = function(elem) {
    var view = elem.ownerDocument.defaultView;
    if (!view.opener) {
      view = window;
    }
    return view.getComputedStyle(elem);
  };
  var swap = function(elem, options, callback, args) {
    var ret,
        name,
        old = {};
    for (name in options) {
      old[name] = elem.style[name];
      elem.style[name] = options[name];
    }
    ret = callback.apply(elem, args || []);
    for (name in options) {
      elem.style[name] = old[name];
    }
    return ret;
  };
  var documentElement = document.documentElement;
  (function() {
    var pixelPositionVal,
        boxSizingReliableVal,
        pixelMarginRightVal,
        reliableMarginLeftVal,
        container = document.createElement("div"),
        div = document.createElement("div");
    if (!div.style) {
      return;
    }
    div.style.backgroundClip = "content-box";
    div.cloneNode(true).style.backgroundClip = "";
    support.clearCloneStyle = div.style.backgroundClip === "content-box";
    container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" + "padding:0;margin-top:1px;position:absolute";
    container.appendChild(div);
    function computeStyleTests() {
      div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" + "position:relative;display:block;" + "margin:auto;border:1px;padding:1px;" + "top:1%;width:50%";
      div.innerHTML = "";
      documentElement.appendChild(container);
      var divStyle = window.getComputedStyle(div);
      pixelPositionVal = divStyle.top !== "1%";
      reliableMarginLeftVal = divStyle.marginLeft === "2px";
      boxSizingReliableVal = divStyle.width === "4px";
      div.style.marginRight = "50%";
      pixelMarginRightVal = divStyle.marginRight === "4px";
      documentElement.removeChild(container);
    }
    jQuery.extend(support, {
      pixelPosition: function() {
        computeStyleTests();
        return pixelPositionVal;
      },
      boxSizingReliable: function() {
        if (boxSizingReliableVal == null) {
          computeStyleTests();
        }
        return boxSizingReliableVal;
      },
      pixelMarginRight: function() {
        if (boxSizingReliableVal == null) {
          computeStyleTests();
        }
        return pixelMarginRightVal;
      },
      reliableMarginLeft: function() {
        if (boxSizingReliableVal == null) {
          computeStyleTests();
        }
        return reliableMarginLeftVal;
      },
      reliableMarginRight: function() {
        var ret,
            marginDiv = div.appendChild(document.createElement("div"));
        marginDiv.style.cssText = div.style.cssText = "-webkit-box-sizing:content-box;box-sizing:content-box;" + "display:block;margin:0;border:0;padding:0";
        marginDiv.style.marginRight = marginDiv.style.width = "0";
        div.style.width = "1px";
        documentElement.appendChild(container);
        ret = !parseFloat(window.getComputedStyle(marginDiv).marginRight);
        documentElement.removeChild(container);
        div.removeChild(marginDiv);
        return ret;
      }
    });
  })();
  function curCSS(elem, name, computed) {
    var width,
        minWidth,
        maxWidth,
        ret,
        style = elem.style;
    computed = computed || getStyles(elem);
    if (computed) {
      ret = computed.getPropertyValue(name) || computed[name];
      if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
        ret = jQuery.style(elem, name);
      }
      if (!support.pixelMarginRight() && rnumnonpx.test(ret) && rmargin.test(name)) {
        width = style.width;
        minWidth = style.minWidth;
        maxWidth = style.maxWidth;
        style.minWidth = style.maxWidth = style.width = ret;
        ret = computed.width;
        style.width = width;
        style.minWidth = minWidth;
        style.maxWidth = maxWidth;
      }
    }
    return ret !== undefined ? ret + "" : ret;
  }
  function addGetHookIf(conditionFn, hookFn) {
    return {get: function() {
        if (conditionFn()) {
          delete this.get;
          return;
        }
        return (this.get = hookFn).apply(this, arguments);
      }};
  }
  var rdisplayswap = /^(none|table(?!-c[ea]).+)/,
      cssShow = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
      },
      cssNormalTransform = {
        letterSpacing: "0",
        fontWeight: "400"
      },
      cssPrefixes = ["Webkit", "O", "Moz", "ms"],
      emptyStyle = document.createElement("div").style;
  function vendorPropName(name) {
    if (name in emptyStyle) {
      return name;
    }
    var capName = name[0].toUpperCase() + name.slice(1),
        i = cssPrefixes.length;
    while (i--) {
      name = cssPrefixes[i] + capName;
      if (name in emptyStyle) {
        return name;
      }
    }
  }
  function setPositiveNumber(elem, value, subtract) {
    var matches = rcssNum.exec(value);
    return matches ? Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || "px") : value;
  }
  function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
    var i = extra === (isBorderBox ? "border" : "content") ? 4 : name === "width" ? 1 : 0,
        val = 0;
    for (; i < 4; i += 2) {
      if (extra === "margin") {
        val += jQuery.css(elem, extra + cssExpand[i], true, styles);
      }
      if (isBorderBox) {
        if (extra === "content") {
          val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
        }
        if (extra !== "margin") {
          val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
        }
      } else {
        val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);
        if (extra !== "padding") {
          val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
        }
      }
    }
    return val;
  }
  function getWidthOrHeight(elem, name, extra) {
    var valueIsBorderBox = true,
        val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
        styles = getStyles(elem),
        isBorderBox = jQuery.css(elem, "boxSizing", false, styles) === "border-box";
    if (document.msFullscreenElement && window.top !== window) {
      if (elem.getClientRects().length) {
        val = Math.round(elem.getBoundingClientRect()[name] * 100);
      }
    }
    if (val <= 0 || val == null) {
      val = curCSS(elem, name, styles);
      if (val < 0 || val == null) {
        val = elem.style[name];
      }
      if (rnumnonpx.test(val)) {
        return val;
      }
      valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
      val = parseFloat(val) || 0;
    }
    return (val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles)) + "px";
  }
  function showHide(elements, show) {
    var display,
        elem,
        hidden,
        values = [],
        index = 0,
        length = elements.length;
    for (; index < length; index++) {
      elem = elements[index];
      if (!elem.style) {
        continue;
      }
      values[index] = dataPriv.get(elem, "olddisplay");
      display = elem.style.display;
      if (show) {
        if (!values[index] && display === "none") {
          elem.style.display = "";
        }
        if (elem.style.display === "" && isHidden(elem)) {
          values[index] = dataPriv.access(elem, "olddisplay", defaultDisplay(elem.nodeName));
        }
      } else {
        hidden = isHidden(elem);
        if (display !== "none" || !hidden) {
          dataPriv.set(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
        }
      }
    }
    for (index = 0; index < length; index++) {
      elem = elements[index];
      if (!elem.style) {
        continue;
      }
      if (!show || elem.style.display === "none" || elem.style.display === "") {
        elem.style.display = show ? values[index] || "" : "none";
      }
    }
    return elements;
  }
  jQuery.extend({
    cssHooks: {opacity: {get: function(elem, computed) {
          if (computed) {
            var ret = curCSS(elem, "opacity");
            return ret === "" ? "1" : ret;
          }
        }}},
    cssNumber: {
      "animationIterationCount": true,
      "columnCount": true,
      "fillOpacity": true,
      "flexGrow": true,
      "flexShrink": true,
      "fontWeight": true,
      "lineHeight": true,
      "opacity": true,
      "order": true,
      "orphans": true,
      "widows": true,
      "zIndex": true,
      "zoom": true
    },
    cssProps: {"float": "cssFloat"},
    style: function(elem, name, value, extra) {
      if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
        return;
      }
      var ret,
          type,
          hooks,
          origName = jQuery.camelCase(name),
          style = elem.style;
      name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(origName) || origName);
      hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
      if (value !== undefined) {
        type = typeof value;
        if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
          value = adjustCSS(elem, name, ret);
          type = "number";
        }
        if (value == null || value !== value) {
          return;
        }
        if (type === "number") {
          value += ret && ret[3] || (jQuery.cssNumber[origName] ? "" : "px");
        }
        if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
          style[name] = "inherit";
        }
        if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
          style[name] = value;
        }
      } else {
        if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
          return ret;
        }
        return style[name];
      }
    },
    css: function(elem, name, extra, styles) {
      var val,
          num,
          hooks,
          origName = jQuery.camelCase(name);
      name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(origName) || origName);
      hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
      if (hooks && "get" in hooks) {
        val = hooks.get(elem, true, extra);
      }
      if (val === undefined) {
        val = curCSS(elem, name, styles);
      }
      if (val === "normal" && name in cssNormalTransform) {
        val = cssNormalTransform[name];
      }
      if (extra === "" || extra) {
        num = parseFloat(val);
        return extra === true || isFinite(num) ? num || 0 : val;
      }
      return val;
    }
  });
  jQuery.each(["height", "width"], function(i, name) {
    jQuery.cssHooks[name] = {
      get: function(elem, computed, extra) {
        if (computed) {
          return rdisplayswap.test(jQuery.css(elem, "display")) && elem.offsetWidth === 0 ? swap(elem, cssShow, function() {
            return getWidthOrHeight(elem, name, extra);
          }) : getWidthOrHeight(elem, name, extra);
        }
      },
      set: function(elem, value, extra) {
        var matches,
            styles = extra && getStyles(elem),
            subtract = extra && augmentWidthOrHeight(elem, name, extra, jQuery.css(elem, "boxSizing", false, styles) === "border-box", styles);
        if (subtract && (matches = rcssNum.exec(value)) && (matches[3] || "px") !== "px") {
          elem.style[name] = value;
          value = jQuery.css(elem, name);
        }
        return setPositiveNumber(elem, value, subtract);
      }
    };
  });
  jQuery.cssHooks.marginLeft = addGetHookIf(support.reliableMarginLeft, function(elem, computed) {
    if (computed) {
      return (parseFloat(curCSS(elem, "marginLeft")) || elem.getBoundingClientRect().left - swap(elem, {marginLeft: 0}, function() {
        return elem.getBoundingClientRect().left;
      })) + "px";
    }
  });
  jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function(elem, computed) {
    if (computed) {
      return swap(elem, {"display": "inline-block"}, curCSS, [elem, "marginRight"]);
    }
  });
  jQuery.each({
    margin: "",
    padding: "",
    border: "Width"
  }, function(prefix, suffix) {
    jQuery.cssHooks[prefix + suffix] = {expand: function(value) {
        var i = 0,
            expanded = {},
            parts = typeof value === "string" ? value.split(" ") : [value];
        for (; i < 4; i++) {
          expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
        }
        return expanded;
      }};
    if (!rmargin.test(prefix)) {
      jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
    }
  });
  jQuery.fn.extend({
    css: function(name, value) {
      return access(this, function(elem, name, value) {
        var styles,
            len,
            map = {},
            i = 0;
        if (jQuery.isArray(name)) {
          styles = getStyles(elem);
          len = name.length;
          for (; i < len; i++) {
            map[name[i]] = jQuery.css(elem, name[i], false, styles);
          }
          return map;
        }
        return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
      }, name, value, arguments.length > 1);
    },
    show: function() {
      return showHide(this, true);
    },
    hide: function() {
      return showHide(this);
    },
    toggle: function(state) {
      if (typeof state === "boolean") {
        return state ? this.show() : this.hide();
      }
      return this.each(function() {
        if (isHidden(this)) {
          jQuery(this).show();
        } else {
          jQuery(this).hide();
        }
      });
    }
  });
  function Tween(elem, options, prop, end, easing) {
    return new Tween.prototype.init(elem, options, prop, end, easing);
  }
  jQuery.Tween = Tween;
  Tween.prototype = {
    constructor: Tween,
    init: function(elem, options, prop, end, easing, unit) {
      this.elem = elem;
      this.prop = prop;
      this.easing = easing || jQuery.easing._default;
      this.options = options;
      this.start = this.now = this.cur();
      this.end = end;
      this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
    },
    cur: function() {
      var hooks = Tween.propHooks[this.prop];
      return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
    },
    run: function(percent) {
      var eased,
          hooks = Tween.propHooks[this.prop];
      if (this.options.duration) {
        this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
      } else {
        this.pos = eased = percent;
      }
      this.now = (this.end - this.start) * eased + this.start;
      if (this.options.step) {
        this.options.step.call(this.elem, this.now, this);
      }
      if (hooks && hooks.set) {
        hooks.set(this);
      } else {
        Tween.propHooks._default.set(this);
      }
      return this;
    }
  };
  Tween.prototype.init.prototype = Tween.prototype;
  Tween.propHooks = {_default: {
      get: function(tween) {
        var result;
        if (tween.elem.nodeType !== 1 || tween.elem[tween.prop] != null && tween.elem.style[tween.prop] == null) {
          return tween.elem[tween.prop];
        }
        result = jQuery.css(tween.elem, tween.prop, "");
        return !result || result === "auto" ? 0 : result;
      },
      set: function(tween) {
        if (jQuery.fx.step[tween.prop]) {
          jQuery.fx.step[tween.prop](tween);
        } else if (tween.elem.nodeType === 1 && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
          jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
        } else {
          tween.elem[tween.prop] = tween.now;
        }
      }
    }};
  Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {set: function(tween) {
      if (tween.elem.nodeType && tween.elem.parentNode) {
        tween.elem[tween.prop] = tween.now;
      }
    }};
  jQuery.easing = {
    linear: function(p) {
      return p;
    },
    swing: function(p) {
      return 0.5 - Math.cos(p * Math.PI) / 2;
    },
    _default: "swing"
  };
  jQuery.fx = Tween.prototype.init;
  jQuery.fx.step = {};
  var fxNow,
      timerId,
      rfxtypes = /^(?:toggle|show|hide)$/,
      rrun = /queueHooks$/;
  function createFxNow() {
    window.setTimeout(function() {
      fxNow = undefined;
    });
    return (fxNow = jQuery.now());
  }
  function genFx(type, includeWidth) {
    var which,
        i = 0,
        attrs = {height: type};
    includeWidth = includeWidth ? 1 : 0;
    for (; i < 4; i += 2 - includeWidth) {
      which = cssExpand[i];
      attrs["margin" + which] = attrs["padding" + which] = type;
    }
    if (includeWidth) {
      attrs.opacity = attrs.width = type;
    }
    return attrs;
  }
  function createTween(value, prop, animation) {
    var tween,
        collection = (Animation.tweeners[prop] || []).concat(Animation.tweeners["*"]),
        index = 0,
        length = collection.length;
    for (; index < length; index++) {
      if ((tween = collection[index].call(animation, prop, value))) {
        return tween;
      }
    }
  }
  function defaultPrefilter(elem, props, opts) {
    var prop,
        value,
        toggle,
        tween,
        hooks,
        oldfire,
        display,
        checkDisplay,
        anim = this,
        orig = {},
        style = elem.style,
        hidden = elem.nodeType && isHidden(elem),
        dataShow = dataPriv.get(elem, "fxshow");
    if (!opts.queue) {
      hooks = jQuery._queueHooks(elem, "fx");
      if (hooks.unqueued == null) {
        hooks.unqueued = 0;
        oldfire = hooks.empty.fire;
        hooks.empty.fire = function() {
          if (!hooks.unqueued) {
            oldfire();
          }
        };
      }
      hooks.unqueued++;
      anim.always(function() {
        anim.always(function() {
          hooks.unqueued--;
          if (!jQuery.queue(elem, "fx").length) {
            hooks.empty.fire();
          }
        });
      });
    }
    if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
      opts.overflow = [style.overflow, style.overflowX, style.overflowY];
      display = jQuery.css(elem, "display");
      checkDisplay = display === "none" ? dataPriv.get(elem, "olddisplay") || defaultDisplay(elem.nodeName) : display;
      if (checkDisplay === "inline" && jQuery.css(elem, "float") === "none") {
        style.display = "inline-block";
      }
    }
    if (opts.overflow) {
      style.overflow = "hidden";
      anim.always(function() {
        style.overflow = opts.overflow[0];
        style.overflowX = opts.overflow[1];
        style.overflowY = opts.overflow[2];
      });
    }
    for (prop in props) {
      value = props[prop];
      if (rfxtypes.exec(value)) {
        delete props[prop];
        toggle = toggle || value === "toggle";
        if (value === (hidden ? "hide" : "show")) {
          if (value === "show" && dataShow && dataShow[prop] !== undefined) {
            hidden = true;
          } else {
            continue;
          }
        }
        orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
      } else {
        display = undefined;
      }
    }
    if (!jQuery.isEmptyObject(orig)) {
      if (dataShow) {
        if ("hidden" in dataShow) {
          hidden = dataShow.hidden;
        }
      } else {
        dataShow = dataPriv.access(elem, "fxshow", {});
      }
      if (toggle) {
        dataShow.hidden = !hidden;
      }
      if (hidden) {
        jQuery(elem).show();
      } else {
        anim.done(function() {
          jQuery(elem).hide();
        });
      }
      anim.done(function() {
        var prop;
        dataPriv.remove(elem, "fxshow");
        for (prop in orig) {
          jQuery.style(elem, prop, orig[prop]);
        }
      });
      for (prop in orig) {
        tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
        if (!(prop in dataShow)) {
          dataShow[prop] = tween.start;
          if (hidden) {
            tween.end = tween.start;
            tween.start = prop === "width" || prop === "height" ? 1 : 0;
          }
        }
      }
    } else if ((display === "none" ? defaultDisplay(elem.nodeName) : display) === "inline") {
      style.display = display;
    }
  }
  function propFilter(props, specialEasing) {
    var index,
        name,
        easing,
        value,
        hooks;
    for (index in props) {
      name = jQuery.camelCase(index);
      easing = specialEasing[name];
      value = props[index];
      if (jQuery.isArray(value)) {
        easing = value[1];
        value = props[index] = value[0];
      }
      if (index !== name) {
        props[name] = value;
        delete props[index];
      }
      hooks = jQuery.cssHooks[name];
      if (hooks && "expand" in hooks) {
        value = hooks.expand(value);
        delete props[name];
        for (index in value) {
          if (!(index in props)) {
            props[index] = value[index];
            specialEasing[index] = easing;
          }
        }
      } else {
        specialEasing[name] = easing;
      }
    }
  }
  function Animation(elem, properties, options) {
    var result,
        stopped,
        index = 0,
        length = Animation.prefilters.length,
        deferred = jQuery.Deferred().always(function() {
          delete tick.elem;
        }),
        tick = function() {
          if (stopped) {
            return false;
          }
          var currentTime = fxNow || createFxNow(),
              remaining = Math.max(0, animation.startTime + animation.duration - currentTime),
              temp = remaining / animation.duration || 0,
              percent = 1 - temp,
              index = 0,
              length = animation.tweens.length;
          for (; index < length; index++) {
            animation.tweens[index].run(percent);
          }
          deferred.notifyWith(elem, [animation, percent, remaining]);
          if (percent < 1 && length) {
            return remaining;
          } else {
            deferred.resolveWith(elem, [animation]);
            return false;
          }
        },
        animation = deferred.promise({
          elem: elem,
          props: jQuery.extend({}, properties),
          opts: jQuery.extend(true, {
            specialEasing: {},
            easing: jQuery.easing._default
          }, options),
          originalProperties: properties,
          originalOptions: options,
          startTime: fxNow || createFxNow(),
          duration: options.duration,
          tweens: [],
          createTween: function(prop, end) {
            var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
            animation.tweens.push(tween);
            return tween;
          },
          stop: function(gotoEnd) {
            var index = 0,
                length = gotoEnd ? animation.tweens.length : 0;
            if (stopped) {
              return this;
            }
            stopped = true;
            for (; index < length; index++) {
              animation.tweens[index].run(1);
            }
            if (gotoEnd) {
              deferred.notifyWith(elem, [animation, 1, 0]);
              deferred.resolveWith(elem, [animation, gotoEnd]);
            } else {
              deferred.rejectWith(elem, [animation, gotoEnd]);
            }
            return this;
          }
        }),
        props = animation.props;
    propFilter(props, animation.opts.specialEasing);
    for (; index < length; index++) {
      result = Animation.prefilters[index].call(animation, elem, props, animation.opts);
      if (result) {
        if (jQuery.isFunction(result.stop)) {
          jQuery._queueHooks(animation.elem, animation.opts.queue).stop = jQuery.proxy(result.stop, result);
        }
        return result;
      }
    }
    jQuery.map(props, createTween, animation);
    if (jQuery.isFunction(animation.opts.start)) {
      animation.opts.start.call(elem, animation);
    }
    jQuery.fx.timer(jQuery.extend(tick, {
      elem: elem,
      anim: animation,
      queue: animation.opts.queue
    }));
    return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
  }
  jQuery.Animation = jQuery.extend(Animation, {
    tweeners: {"*": [function(prop, value) {
        var tween = this.createTween(prop, value);
        adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
        return tween;
      }]},
    tweener: function(props, callback) {
      if (jQuery.isFunction(props)) {
        callback = props;
        props = ["*"];
      } else {
        props = props.match(rnotwhite);
      }
      var prop,
          index = 0,
          length = props.length;
      for (; index < length; index++) {
        prop = props[index];
        Animation.tweeners[prop] = Animation.tweeners[prop] || [];
        Animation.tweeners[prop].unshift(callback);
      }
    },
    prefilters: [defaultPrefilter],
    prefilter: function(callback, prepend) {
      if (prepend) {
        Animation.prefilters.unshift(callback);
      } else {
        Animation.prefilters.push(callback);
      }
    }
  });
  jQuery.speed = function(speed, easing, fn) {
    var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
      complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
      duration: speed,
      easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
    };
    opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
    if (opt.queue == null || opt.queue === true) {
      opt.queue = "fx";
    }
    opt.old = opt.complete;
    opt.complete = function() {
      if (jQuery.isFunction(opt.old)) {
        opt.old.call(this);
      }
      if (opt.queue) {
        jQuery.dequeue(this, opt.queue);
      }
    };
    return opt;
  };
  jQuery.fn.extend({
    fadeTo: function(speed, to, easing, callback) {
      return this.filter(isHidden).css("opacity", 0).show().end().animate({opacity: to}, speed, easing, callback);
    },
    animate: function(prop, speed, easing, callback) {
      var empty = jQuery.isEmptyObject(prop),
          optall = jQuery.speed(speed, easing, callback),
          doAnimation = function() {
            var anim = Animation(this, jQuery.extend({}, prop), optall);
            if (empty || dataPriv.get(this, "finish")) {
              anim.stop(true);
            }
          };
      doAnimation.finish = doAnimation;
      return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
    },
    stop: function(type, clearQueue, gotoEnd) {
      var stopQueue = function(hooks) {
        var stop = hooks.stop;
        delete hooks.stop;
        stop(gotoEnd);
      };
      if (typeof type !== "string") {
        gotoEnd = clearQueue;
        clearQueue = type;
        type = undefined;
      }
      if (clearQueue && type !== false) {
        this.queue(type || "fx", []);
      }
      return this.each(function() {
        var dequeue = true,
            index = type != null && type + "queueHooks",
            timers = jQuery.timers,
            data = dataPriv.get(this);
        if (index) {
          if (data[index] && data[index].stop) {
            stopQueue(data[index]);
          }
        } else {
          for (index in data) {
            if (data[index] && data[index].stop && rrun.test(index)) {
              stopQueue(data[index]);
            }
          }
        }
        for (index = timers.length; index--; ) {
          if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
            timers[index].anim.stop(gotoEnd);
            dequeue = false;
            timers.splice(index, 1);
          }
        }
        if (dequeue || !gotoEnd) {
          jQuery.dequeue(this, type);
        }
      });
    },
    finish: function(type) {
      if (type !== false) {
        type = type || "fx";
      }
      return this.each(function() {
        var index,
            data = dataPriv.get(this),
            queue = data[type + "queue"],
            hooks = data[type + "queueHooks"],
            timers = jQuery.timers,
            length = queue ? queue.length : 0;
        data.finish = true;
        jQuery.queue(this, type, []);
        if (hooks && hooks.stop) {
          hooks.stop.call(this, true);
        }
        for (index = timers.length; index--; ) {
          if (timers[index].elem === this && timers[index].queue === type) {
            timers[index].anim.stop(true);
            timers.splice(index, 1);
          }
        }
        for (index = 0; index < length; index++) {
          if (queue[index] && queue[index].finish) {
            queue[index].finish.call(this);
          }
        }
        delete data.finish;
      });
    }
  });
  jQuery.each(["toggle", "show", "hide"], function(i, name) {
    var cssFn = jQuery.fn[name];
    jQuery.fn[name] = function(speed, easing, callback) {
      return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
    };
  });
  jQuery.each({
    slideDown: genFx("show"),
    slideUp: genFx("hide"),
    slideToggle: genFx("toggle"),
    fadeIn: {opacity: "show"},
    fadeOut: {opacity: "hide"},
    fadeToggle: {opacity: "toggle"}
  }, function(name, props) {
    jQuery.fn[name] = function(speed, easing, callback) {
      return this.animate(props, speed, easing, callback);
    };
  });
  jQuery.timers = [];
  jQuery.fx.tick = function() {
    var timer,
        i = 0,
        timers = jQuery.timers;
    fxNow = jQuery.now();
    for (; i < timers.length; i++) {
      timer = timers[i];
      if (!timer() && timers[i] === timer) {
        timers.splice(i--, 1);
      }
    }
    if (!timers.length) {
      jQuery.fx.stop();
    }
    fxNow = undefined;
  };
  jQuery.fx.timer = function(timer) {
    jQuery.timers.push(timer);
    if (timer()) {
      jQuery.fx.start();
    } else {
      jQuery.timers.pop();
    }
  };
  jQuery.fx.interval = 13;
  jQuery.fx.start = function() {
    if (!timerId) {
      timerId = window.setInterval(jQuery.fx.tick, jQuery.fx.interval);
    }
  };
  jQuery.fx.stop = function() {
    window.clearInterval(timerId);
    timerId = null;
  };
  jQuery.fx.speeds = {
    slow: 600,
    fast: 200,
    _default: 400
  };
  jQuery.fn.delay = function(time, type) {
    time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
    type = type || "fx";
    return this.queue(type, function(next, hooks) {
      var timeout = window.setTimeout(next, time);
      hooks.stop = function() {
        window.clearTimeout(timeout);
      };
    });
  };
  (function() {
    var input = document.createElement("input"),
        select = document.createElement("select"),
        opt = select.appendChild(document.createElement("option"));
    input.type = "checkbox";
    support.checkOn = input.value !== "";
    support.optSelected = opt.selected;
    select.disabled = true;
    support.optDisabled = !opt.disabled;
    input = document.createElement("input");
    input.value = "t";
    input.type = "radio";
    support.radioValue = input.value === "t";
  })();
  var boolHook,
      attrHandle = jQuery.expr.attrHandle;
  jQuery.fn.extend({
    attr: function(name, value) {
      return access(this, jQuery.attr, name, value, arguments.length > 1);
    },
    removeAttr: function(name) {
      return this.each(function() {
        jQuery.removeAttr(this, name);
      });
    }
  });
  jQuery.extend({
    attr: function(elem, name, value) {
      var ret,
          hooks,
          nType = elem.nodeType;
      if (nType === 3 || nType === 8 || nType === 2) {
        return;
      }
      if (typeof elem.getAttribute === "undefined") {
        return jQuery.prop(elem, name, value);
      }
      if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
        name = name.toLowerCase();
        hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : undefined);
      }
      if (value !== undefined) {
        if (value === null) {
          jQuery.removeAttr(elem, name);
          return;
        }
        if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
          return ret;
        }
        elem.setAttribute(name, value + "");
        return value;
      }
      if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
        return ret;
      }
      ret = jQuery.find.attr(elem, name);
      return ret == null ? undefined : ret;
    },
    attrHooks: {type: {set: function(elem, value) {
          if (!support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
            var val = elem.value;
            elem.setAttribute("type", value);
            if (val) {
              elem.value = val;
            }
            return value;
          }
        }}},
    removeAttr: function(elem, value) {
      var name,
          propName,
          i = 0,
          attrNames = value && value.match(rnotwhite);
      if (attrNames && elem.nodeType === 1) {
        while ((name = attrNames[i++])) {
          propName = jQuery.propFix[name] || name;
          if (jQuery.expr.match.bool.test(name)) {
            elem[propName] = false;
          }
          elem.removeAttribute(name);
        }
      }
    }
  });
  boolHook = {set: function(elem, value, name) {
      if (value === false) {
        jQuery.removeAttr(elem, name);
      } else {
        elem.setAttribute(name, name);
      }
      return name;
    }};
  jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function(i, name) {
    var getter = attrHandle[name] || jQuery.find.attr;
    attrHandle[name] = function(elem, name, isXML) {
      var ret,
          handle;
      if (!isXML) {
        handle = attrHandle[name];
        attrHandle[name] = ret;
        ret = getter(elem, name, isXML) != null ? name.toLowerCase() : null;
        attrHandle[name] = handle;
      }
      return ret;
    };
  });
  var rfocusable = /^(?:input|select|textarea|button)$/i,
      rclickable = /^(?:a|area)$/i;
  jQuery.fn.extend({
    prop: function(name, value) {
      return access(this, jQuery.prop, name, value, arguments.length > 1);
    },
    removeProp: function(name) {
      return this.each(function() {
        delete this[jQuery.propFix[name] || name];
      });
    }
  });
  jQuery.extend({
    prop: function(elem, name, value) {
      var ret,
          hooks,
          nType = elem.nodeType;
      if (nType === 3 || nType === 8 || nType === 2) {
        return;
      }
      if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
        name = jQuery.propFix[name] || name;
        hooks = jQuery.propHooks[name];
      }
      if (value !== undefined) {
        if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
          return ret;
        }
        return (elem[name] = value);
      }
      if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
        return ret;
      }
      return elem[name];
    },
    propHooks: {tabIndex: {get: function(elem) {
          var tabindex = jQuery.find.attr(elem, "tabindex");
          return tabindex ? parseInt(tabindex, 10) : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : -1;
        }}},
    propFix: {
      "for": "htmlFor",
      "class": "className"
    }
  });
  if (!support.optSelected) {
    jQuery.propHooks.selected = {get: function(elem) {
        var parent = elem.parentNode;
        if (parent && parent.parentNode) {
          parent.parentNode.selectedIndex;
        }
        return null;
      }};
  }
  jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
    jQuery.propFix[this.toLowerCase()] = this;
  });
  var rclass = /[\t\r\n\f]/g;
  function getClass(elem) {
    return elem.getAttribute && elem.getAttribute("class") || "";
  }
  jQuery.fn.extend({
    addClass: function(value) {
      var classes,
          elem,
          cur,
          curValue,
          clazz,
          j,
          finalValue,
          i = 0;
      if (jQuery.isFunction(value)) {
        return this.each(function(j) {
          jQuery(this).addClass(value.call(this, j, getClass(this)));
        });
      }
      if (typeof value === "string" && value) {
        classes = value.match(rnotwhite) || [];
        while ((elem = this[i++])) {
          curValue = getClass(elem);
          cur = elem.nodeType === 1 && (" " + curValue + " ").replace(rclass, " ");
          if (cur) {
            j = 0;
            while ((clazz = classes[j++])) {
              if (cur.indexOf(" " + clazz + " ") < 0) {
                cur += clazz + " ";
              }
            }
            finalValue = jQuery.trim(cur);
            if (curValue !== finalValue) {
              elem.setAttribute("class", finalValue);
            }
          }
        }
      }
      return this;
    },
    removeClass: function(value) {
      var classes,
          elem,
          cur,
          curValue,
          clazz,
          j,
          finalValue,
          i = 0;
      if (jQuery.isFunction(value)) {
        return this.each(function(j) {
          jQuery(this).removeClass(value.call(this, j, getClass(this)));
        });
      }
      if (!arguments.length) {
        return this.attr("class", "");
      }
      if (typeof value === "string" && value) {
        classes = value.match(rnotwhite) || [];
        while ((elem = this[i++])) {
          curValue = getClass(elem);
          cur = elem.nodeType === 1 && (" " + curValue + " ").replace(rclass, " ");
          if (cur) {
            j = 0;
            while ((clazz = classes[j++])) {
              while (cur.indexOf(" " + clazz + " ") > -1) {
                cur = cur.replace(" " + clazz + " ", " ");
              }
            }
            finalValue = jQuery.trim(cur);
            if (curValue !== finalValue) {
              elem.setAttribute("class", finalValue);
            }
          }
        }
      }
      return this;
    },
    toggleClass: function(value, stateVal) {
      var type = typeof value;
      if (typeof stateVal === "boolean" && type === "string") {
        return stateVal ? this.addClass(value) : this.removeClass(value);
      }
      if (jQuery.isFunction(value)) {
        return this.each(function(i) {
          jQuery(this).toggleClass(value.call(this, i, getClass(this), stateVal), stateVal);
        });
      }
      return this.each(function() {
        var className,
            i,
            self,
            classNames;
        if (type === "string") {
          i = 0;
          self = jQuery(this);
          classNames = value.match(rnotwhite) || [];
          while ((className = classNames[i++])) {
            if (self.hasClass(className)) {
              self.removeClass(className);
            } else {
              self.addClass(className);
            }
          }
        } else if (value === undefined || type === "boolean") {
          className = getClass(this);
          if (className) {
            dataPriv.set(this, "__className__", className);
          }
          if (this.setAttribute) {
            this.setAttribute("class", className || value === false ? "" : dataPriv.get(this, "__className__") || "");
          }
        }
      });
    },
    hasClass: function(selector) {
      var className,
          elem,
          i = 0;
      className = " " + selector + " ";
      while ((elem = this[i++])) {
        if (elem.nodeType === 1 && (" " + getClass(elem) + " ").replace(rclass, " ").indexOf(className) > -1) {
          return true;
        }
      }
      return false;
    }
  });
  var rreturn = /\r/g;
  jQuery.fn.extend({val: function(value) {
      var hooks,
          ret,
          isFunction,
          elem = this[0];
      if (!arguments.length) {
        if (elem) {
          hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];
          if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
            return ret;
          }
          ret = elem.value;
          return typeof ret === "string" ? ret.replace(rreturn, "") : ret == null ? "" : ret;
        }
        return;
      }
      isFunction = jQuery.isFunction(value);
      return this.each(function(i) {
        var val;
        if (this.nodeType !== 1) {
          return;
        }
        if (isFunction) {
          val = value.call(this, i, jQuery(this).val());
        } else {
          val = value;
        }
        if (val == null) {
          val = "";
        } else if (typeof val === "number") {
          val += "";
        } else if (jQuery.isArray(val)) {
          val = jQuery.map(val, function(value) {
            return value == null ? "" : value + "";
          });
        }
        hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
        if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
          this.value = val;
        }
      });
    }});
  jQuery.extend({valHooks: {
      option: {get: function(elem) {
          return jQuery.trim(elem.value);
        }},
      select: {
        get: function(elem) {
          var value,
              option,
              options = elem.options,
              index = elem.selectedIndex,
              one = elem.type === "select-one" || index < 0,
              values = one ? null : [],
              max = one ? index + 1 : options.length,
              i = index < 0 ? max : one ? index : 0;
          for (; i < max; i++) {
            option = options[i];
            if ((option.selected || i === index) && (support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
              value = jQuery(option).val();
              if (one) {
                return value;
              }
              values.push(value);
            }
          }
          return values;
        },
        set: function(elem, value) {
          var optionSet,
              option,
              options = elem.options,
              values = jQuery.makeArray(value),
              i = options.length;
          while (i--) {
            option = options[i];
            if (option.selected = jQuery.inArray(jQuery.valHooks.option.get(option), values) > -1) {
              optionSet = true;
            }
          }
          if (!optionSet) {
            elem.selectedIndex = -1;
          }
          return values;
        }
      }
    }});
  jQuery.each(["radio", "checkbox"], function() {
    jQuery.valHooks[this] = {set: function(elem, value) {
        if (jQuery.isArray(value)) {
          return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) > -1);
        }
      }};
    if (!support.checkOn) {
      jQuery.valHooks[this].get = function(elem) {
        return elem.getAttribute("value") === null ? "on" : elem.value;
      };
    }
  });
  var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;
  jQuery.extend(jQuery.event, {
    trigger: function(event, data, elem, onlyHandlers) {
      var i,
          cur,
          tmp,
          bubbleType,
          ontype,
          handle,
          special,
          eventPath = [elem || document],
          type = hasOwn.call(event, "type") ? event.type : event,
          namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
      cur = tmp = elem = elem || document;
      if (elem.nodeType === 3 || elem.nodeType === 8) {
        return;
      }
      if (rfocusMorph.test(type + jQuery.event.triggered)) {
        return;
      }
      if (type.indexOf(".") > -1) {
        namespaces = type.split(".");
        type = namespaces.shift();
        namespaces.sort();
      }
      ontype = type.indexOf(":") < 0 && "on" + type;
      event = event[jQuery.expando] ? event : new jQuery.Event(type, typeof event === "object" && event);
      event.isTrigger = onlyHandlers ? 2 : 3;
      event.namespace = namespaces.join(".");
      event.rnamespace = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
      event.result = undefined;
      if (!event.target) {
        event.target = elem;
      }
      data = data == null ? [event] : jQuery.makeArray(data, [event]);
      special = jQuery.event.special[type] || {};
      if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
        return;
      }
      if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
        bubbleType = special.delegateType || type;
        if (!rfocusMorph.test(bubbleType + type)) {
          cur = cur.parentNode;
        }
        for (; cur; cur = cur.parentNode) {
          eventPath.push(cur);
          tmp = cur;
        }
        if (tmp === (elem.ownerDocument || document)) {
          eventPath.push(tmp.defaultView || tmp.parentWindow || window);
        }
      }
      i = 0;
      while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
        event.type = i > 1 ? bubbleType : special.bindType || type;
        handle = (dataPriv.get(cur, "events") || {})[event.type] && dataPriv.get(cur, "handle");
        if (handle) {
          handle.apply(cur, data);
        }
        handle = ontype && cur[ontype];
        if (handle && handle.apply && acceptData(cur)) {
          event.result = handle.apply(cur, data);
          if (event.result === false) {
            event.preventDefault();
          }
        }
      }
      event.type = type;
      if (!onlyHandlers && !event.isDefaultPrevented()) {
        if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && acceptData(elem)) {
          if (ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem)) {
            tmp = elem[ontype];
            if (tmp) {
              elem[ontype] = null;
            }
            jQuery.event.triggered = type;
            elem[type]();
            jQuery.event.triggered = undefined;
            if (tmp) {
              elem[ontype] = tmp;
            }
          }
        }
      }
      return event.result;
    },
    simulate: function(type, elem, event) {
      var e = jQuery.extend(new jQuery.Event(), event, {
        type: type,
        isSimulated: true
      });
      jQuery.event.trigger(e, null, elem);
      if (e.isDefaultPrevented()) {
        event.preventDefault();
      }
    }
  });
  jQuery.fn.extend({
    trigger: function(type, data) {
      return this.each(function() {
        jQuery.event.trigger(type, data, this);
      });
    },
    triggerHandler: function(type, data) {
      var elem = this[0];
      if (elem) {
        return jQuery.event.trigger(type, data, elem, true);
      }
    }
  });
  jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {
    jQuery.fn[name] = function(data, fn) {
      return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
    };
  });
  jQuery.fn.extend({hover: function(fnOver, fnOut) {
      return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    }});
  support.focusin = "onfocusin" in window;
  if (!support.focusin) {
    jQuery.each({
      focus: "focusin",
      blur: "focusout"
    }, function(orig, fix) {
      var handler = function(event) {
        jQuery.event.simulate(fix, event.target, jQuery.event.fix(event));
      };
      jQuery.event.special[fix] = {
        setup: function() {
          var doc = this.ownerDocument || this,
              attaches = dataPriv.access(doc, fix);
          if (!attaches) {
            doc.addEventListener(orig, handler, true);
          }
          dataPriv.access(doc, fix, (attaches || 0) + 1);
        },
        teardown: function() {
          var doc = this.ownerDocument || this,
              attaches = dataPriv.access(doc, fix) - 1;
          if (!attaches) {
            doc.removeEventListener(orig, handler, true);
            dataPriv.remove(doc, fix);
          } else {
            dataPriv.access(doc, fix, attaches);
          }
        }
      };
    });
  }
  var location = window.location;
  var nonce = jQuery.now();
  var rquery = (/\?/);
  jQuery.parseJSON = function(data) {
    return JSON.parse(data + "");
  };
  jQuery.parseXML = function(data) {
    var xml;
    if (!data || typeof data !== "string") {
      return null;
    }
    try {
      xml = (new window.DOMParser()).parseFromString(data, "text/xml");
    } catch (e) {
      xml = undefined;
    }
    if (!xml || xml.getElementsByTagName("parsererror").length) {
      jQuery.error("Invalid XML: " + data);
    }
    return xml;
  };
  var rhash = /#.*$/,
      rts = /([?&])_=[^&]*/,
      rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
      rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
      rnoContent = /^(?:GET|HEAD)$/,
      rprotocol = /^\/\//,
      prefilters = {},
      transports = {},
      allTypes = "*/".concat("*"),
      originAnchor = document.createElement("a");
  originAnchor.href = location.href;
  function addToPrefiltersOrTransports(structure) {
    return function(dataTypeExpression, func) {
      if (typeof dataTypeExpression !== "string") {
        func = dataTypeExpression;
        dataTypeExpression = "*";
      }
      var dataType,
          i = 0,
          dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
      if (jQuery.isFunction(func)) {
        while ((dataType = dataTypes[i++])) {
          if (dataType[0] === "+") {
            dataType = dataType.slice(1) || "*";
            (structure[dataType] = structure[dataType] || []).unshift(func);
          } else {
            (structure[dataType] = structure[dataType] || []).push(func);
          }
        }
      }
    };
  }
  function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
    var inspected = {},
        seekingTransport = (structure === transports);
    function inspect(dataType) {
      var selected;
      inspected[dataType] = true;
      jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
        var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
        if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
          options.dataTypes.unshift(dataTypeOrTransport);
          inspect(dataTypeOrTransport);
          return false;
        } else if (seekingTransport) {
          return !(selected = dataTypeOrTransport);
        }
      });
      return selected;
    }
    return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
  }
  function ajaxExtend(target, src) {
    var key,
        deep,
        flatOptions = jQuery.ajaxSettings.flatOptions || {};
    for (key in src) {
      if (src[key] !== undefined) {
        (flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
      }
    }
    if (deep) {
      jQuery.extend(true, target, deep);
    }
    return target;
  }
  function ajaxHandleResponses(s, jqXHR, responses) {
    var ct,
        type,
        finalDataType,
        firstDataType,
        contents = s.contents,
        dataTypes = s.dataTypes;
    while (dataTypes[0] === "*") {
      dataTypes.shift();
      if (ct === undefined) {
        ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
      }
    }
    if (ct) {
      for (type in contents) {
        if (contents[type] && contents[type].test(ct)) {
          dataTypes.unshift(type);
          break;
        }
      }
    }
    if (dataTypes[0] in responses) {
      finalDataType = dataTypes[0];
    } else {
      for (type in responses) {
        if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
          finalDataType = type;
          break;
        }
        if (!firstDataType) {
          firstDataType = type;
        }
      }
      finalDataType = finalDataType || firstDataType;
    }
    if (finalDataType) {
      if (finalDataType !== dataTypes[0]) {
        dataTypes.unshift(finalDataType);
      }
      return responses[finalDataType];
    }
  }
  function ajaxConvert(s, response, jqXHR, isSuccess) {
    var conv2,
        current,
        conv,
        tmp,
        prev,
        converters = {},
        dataTypes = s.dataTypes.slice();
    if (dataTypes[1]) {
      for (conv in s.converters) {
        converters[conv.toLowerCase()] = s.converters[conv];
      }
    }
    current = dataTypes.shift();
    while (current) {
      if (s.responseFields[current]) {
        jqXHR[s.responseFields[current]] = response;
      }
      if (!prev && isSuccess && s.dataFilter) {
        response = s.dataFilter(response, s.dataType);
      }
      prev = current;
      current = dataTypes.shift();
      if (current) {
        if (current === "*") {
          current = prev;
        } else if (prev !== "*" && prev !== current) {
          conv = converters[prev + " " + current] || converters["* " + current];
          if (!conv) {
            for (conv2 in converters) {
              tmp = conv2.split(" ");
              if (tmp[1] === current) {
                conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                if (conv) {
                  if (conv === true) {
                    conv = converters[conv2];
                  } else if (converters[conv2] !== true) {
                    current = tmp[0];
                    dataTypes.unshift(tmp[1]);
                  }
                  break;
                }
              }
            }
          }
          if (conv !== true) {
            if (conv && s.throws) {
              response = conv(response);
            } else {
              try {
                response = conv(response);
              } catch (e) {
                return {
                  state: "parsererror",
                  error: conv ? e : "No conversion from " + prev + " to " + current
                };
              }
            }
          }
        }
      }
    }
    return {
      state: "success",
      data: response
    };
  }
  jQuery.extend({
    active: 0,
    lastModified: {},
    etag: {},
    ajaxSettings: {
      url: location.href,
      type: "GET",
      isLocal: rlocalProtocol.test(location.protocol),
      global: true,
      processData: true,
      async: true,
      contentType: "application/x-www-form-urlencoded; charset=UTF-8",
      accepts: {
        "*": allTypes,
        text: "text/plain",
        html: "text/html",
        xml: "application/xml, text/xml",
        json: "application/json, text/javascript"
      },
      contents: {
        xml: /\bxml\b/,
        html: /\bhtml/,
        json: /\bjson\b/
      },
      responseFields: {
        xml: "responseXML",
        text: "responseText",
        json: "responseJSON"
      },
      converters: {
        "* text": String,
        "text html": true,
        "text json": jQuery.parseJSON,
        "text xml": jQuery.parseXML
      },
      flatOptions: {
        url: true,
        context: true
      }
    },
    ajaxSetup: function(target, settings) {
      return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target);
    },
    ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
    ajaxTransport: addToPrefiltersOrTransports(transports),
    ajax: function(url, options) {
      if (typeof url === "object") {
        options = url;
        url = undefined;
      }
      options = options || {};
      var transport,
          cacheURL,
          responseHeadersString,
          responseHeaders,
          timeoutTimer,
          urlAnchor,
          fireGlobals,
          i,
          s = jQuery.ajaxSetup({}, options),
          callbackContext = s.context || s,
          globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event,
          deferred = jQuery.Deferred(),
          completeDeferred = jQuery.Callbacks("once memory"),
          statusCode = s.statusCode || {},
          requestHeaders = {},
          requestHeadersNames = {},
          state = 0,
          strAbort = "canceled",
          jqXHR = {
            readyState: 0,
            getResponseHeader: function(key) {
              var match;
              if (state === 2) {
                if (!responseHeaders) {
                  responseHeaders = {};
                  while ((match = rheaders.exec(responseHeadersString))) {
                    responseHeaders[match[1].toLowerCase()] = match[2];
                  }
                }
                match = responseHeaders[key.toLowerCase()];
              }
              return match == null ? null : match;
            },
            getAllResponseHeaders: function() {
              return state === 2 ? responseHeadersString : null;
            },
            setRequestHeader: function(name, value) {
              var lname = name.toLowerCase();
              if (!state) {
                name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                requestHeaders[name] = value;
              }
              return this;
            },
            overrideMimeType: function(type) {
              if (!state) {
                s.mimeType = type;
              }
              return this;
            },
            statusCode: function(map) {
              var code;
              if (map) {
                if (state < 2) {
                  for (code in map) {
                    statusCode[code] = [statusCode[code], map[code]];
                  }
                } else {
                  jqXHR.always(map[jqXHR.status]);
                }
              }
              return this;
            },
            abort: function(statusText) {
              var finalText = statusText || strAbort;
              if (transport) {
                transport.abort(finalText);
              }
              done(0, finalText);
              return this;
            }
          };
      deferred.promise(jqXHR).complete = completeDeferred.add;
      jqXHR.success = jqXHR.done;
      jqXHR.error = jqXHR.fail;
      s.url = ((url || s.url || location.href) + "").replace(rhash, "").replace(rprotocol, location.protocol + "//");
      s.type = options.method || options.type || s.method || s.type;
      s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [""];
      if (s.crossDomain == null) {
        urlAnchor = document.createElement("a");
        try {
          urlAnchor.href = s.url;
          urlAnchor.href = urlAnchor.href;
          s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !== urlAnchor.protocol + "//" + urlAnchor.host;
        } catch (e) {
          s.crossDomain = true;
        }
      }
      if (s.data && s.processData && typeof s.data !== "string") {
        s.data = jQuery.param(s.data, s.traditional);
      }
      inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
      if (state === 2) {
        return jqXHR;
      }
      fireGlobals = jQuery.event && s.global;
      if (fireGlobals && jQuery.active++ === 0) {
        jQuery.event.trigger("ajaxStart");
      }
      s.type = s.type.toUpperCase();
      s.hasContent = !rnoContent.test(s.type);
      cacheURL = s.url;
      if (!s.hasContent) {
        if (s.data) {
          cacheURL = (s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data);
          delete s.data;
        }
        if (s.cache === false) {
          s.url = rts.test(cacheURL) ? cacheURL.replace(rts, "$1_=" + nonce++) : cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++;
        }
      }
      if (s.ifModified) {
        if (jQuery.lastModified[cacheURL]) {
          jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
        }
        if (jQuery.etag[cacheURL]) {
          jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
        }
      }
      if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
        jqXHR.setRequestHeader("Content-Type", s.contentType);
      }
      jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
      for (i in s.headers) {
        jqXHR.setRequestHeader(i, s.headers[i]);
      }
      if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
        return jqXHR.abort();
      }
      strAbort = "abort";
      for (i in {
        success: 1,
        error: 1,
        complete: 1
      }) {
        jqXHR[i](s[i]);
      }
      transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
      if (!transport) {
        done(-1, "No Transport");
      } else {
        jqXHR.readyState = 1;
        if (fireGlobals) {
          globalEventContext.trigger("ajaxSend", [jqXHR, s]);
        }
        if (state === 2) {
          return jqXHR;
        }
        if (s.async && s.timeout > 0) {
          timeoutTimer = window.setTimeout(function() {
            jqXHR.abort("timeout");
          }, s.timeout);
        }
        try {
          state = 1;
          transport.send(requestHeaders, done);
        } catch (e) {
          if (state < 2) {
            done(-1, e);
          } else {
            throw e;
          }
        }
      }
      function done(status, nativeStatusText, responses, headers) {
        var isSuccess,
            success,
            error,
            response,
            modified,
            statusText = nativeStatusText;
        if (state === 2) {
          return;
        }
        state = 2;
        if (timeoutTimer) {
          window.clearTimeout(timeoutTimer);
        }
        transport = undefined;
        responseHeadersString = headers || "";
        jqXHR.readyState = status > 0 ? 4 : 0;
        isSuccess = status >= 200 && status < 300 || status === 304;
        if (responses) {
          response = ajaxHandleResponses(s, jqXHR, responses);
        }
        response = ajaxConvert(s, response, jqXHR, isSuccess);
        if (isSuccess) {
          if (s.ifModified) {
            modified = jqXHR.getResponseHeader("Last-Modified");
            if (modified) {
              jQuery.lastModified[cacheURL] = modified;
            }
            modified = jqXHR.getResponseHeader("etag");
            if (modified) {
              jQuery.etag[cacheURL] = modified;
            }
          }
          if (status === 204 || s.type === "HEAD") {
            statusText = "nocontent";
          } else if (status === 304) {
            statusText = "notmodified";
          } else {
            statusText = response.state;
            success = response.data;
            error = response.error;
            isSuccess = !error;
          }
        } else {
          error = statusText;
          if (status || !statusText) {
            statusText = "error";
            if (status < 0) {
              status = 0;
            }
          }
        }
        jqXHR.status = status;
        jqXHR.statusText = (nativeStatusText || statusText) + "";
        if (isSuccess) {
          deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
        } else {
          deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
        }
        jqXHR.statusCode(statusCode);
        statusCode = undefined;
        if (fireGlobals) {
          globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
        }
        completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
        if (fireGlobals) {
          globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
          if (!(--jQuery.active)) {
            jQuery.event.trigger("ajaxStop");
          }
        }
      }
      return jqXHR;
    },
    getJSON: function(url, data, callback) {
      return jQuery.get(url, data, callback, "json");
    },
    getScript: function(url, callback) {
      return jQuery.get(url, undefined, callback, "script");
    }
  });
  jQuery.each(["get", "post"], function(i, method) {
    jQuery[method] = function(url, data, callback, type) {
      if (jQuery.isFunction(data)) {
        type = type || callback;
        callback = data;
        data = undefined;
      }
      return jQuery.ajax(jQuery.extend({
        url: url,
        type: method,
        dataType: type,
        data: data,
        success: callback
      }, jQuery.isPlainObject(url) && url));
    };
  });
  jQuery._evalUrl = function(url) {
    return jQuery.ajax({
      url: url,
      type: "GET",
      dataType: "script",
      async: false,
      global: false,
      "throws": true
    });
  };
  jQuery.fn.extend({
    wrapAll: function(html) {
      var wrap;
      if (jQuery.isFunction(html)) {
        return this.each(function(i) {
          jQuery(this).wrapAll(html.call(this, i));
        });
      }
      if (this[0]) {
        wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
        if (this[0].parentNode) {
          wrap.insertBefore(this[0]);
        }
        wrap.map(function() {
          var elem = this;
          while (elem.firstElementChild) {
            elem = elem.firstElementChild;
          }
          return elem;
        }).append(this);
      }
      return this;
    },
    wrapInner: function(html) {
      if (jQuery.isFunction(html)) {
        return this.each(function(i) {
          jQuery(this).wrapInner(html.call(this, i));
        });
      }
      return this.each(function() {
        var self = jQuery(this),
            contents = self.contents();
        if (contents.length) {
          contents.wrapAll(html);
        } else {
          self.append(html);
        }
      });
    },
    wrap: function(html) {
      var isFunction = jQuery.isFunction(html);
      return this.each(function(i) {
        jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
      });
    },
    unwrap: function() {
      return this.parent().each(function() {
        if (!jQuery.nodeName(this, "body")) {
          jQuery(this).replaceWith(this.childNodes);
        }
      }).end();
    }
  });
  jQuery.expr.filters.hidden = function(elem) {
    return !jQuery.expr.filters.visible(elem);
  };
  jQuery.expr.filters.visible = function(elem) {
    return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
  };
  var r20 = /%20/g,
      rbracket = /\[\]$/,
      rCRLF = /\r?\n/g,
      rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
      rsubmittable = /^(?:input|select|textarea|keygen)/i;
  function buildParams(prefix, obj, traditional, add) {
    var name;
    if (jQuery.isArray(obj)) {
      jQuery.each(obj, function(i, v) {
        if (traditional || rbracket.test(prefix)) {
          add(prefix, v);
        } else {
          buildParams(prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]", v, traditional, add);
        }
      });
    } else if (!traditional && jQuery.type(obj) === "object") {
      for (name in obj) {
        buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
      }
    } else {
      add(prefix, obj);
    }
  }
  jQuery.param = function(a, traditional) {
    var prefix,
        s = [],
        add = function(key, value) {
          value = jQuery.isFunction(value) ? value() : (value == null ? "" : value);
          s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
        };
    if (traditional === undefined) {
      traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
    }
    if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
      jQuery.each(a, function() {
        add(this.name, this.value);
      });
    } else {
      for (prefix in a) {
        buildParams(prefix, a[prefix], traditional, add);
      }
    }
    return s.join("&").replace(r20, "+");
  };
  jQuery.fn.extend({
    serialize: function() {
      return jQuery.param(this.serializeArray());
    },
    serializeArray: function() {
      return this.map(function() {
        var elements = jQuery.prop(this, "elements");
        return elements ? jQuery.makeArray(elements) : this;
      }).filter(function() {
        var type = this.type;
        return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
      }).map(function(i, elem) {
        var val = jQuery(this).val();
        return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function(val) {
          return {
            name: elem.name,
            value: val.replace(rCRLF, "\r\n")
          };
        }) : {
          name: elem.name,
          value: val.replace(rCRLF, "\r\n")
        };
      }).get();
    }
  });
  jQuery.ajaxSettings.xhr = function() {
    try {
      return new window.XMLHttpRequest();
    } catch (e) {}
  };
  var xhrSuccessStatus = {
    0: 200,
    1223: 204
  },
      xhrSupported = jQuery.ajaxSettings.xhr();
  support.cors = !!xhrSupported && ("withCredentials" in xhrSupported);
  support.ajax = xhrSupported = !!xhrSupported;
  jQuery.ajaxTransport(function(options) {
    var callback,
        errorCallback;
    if (support.cors || xhrSupported && !options.crossDomain) {
      return {
        send: function(headers, complete) {
          var i,
              xhr = options.xhr();
          xhr.open(options.type, options.url, options.async, options.username, options.password);
          if (options.xhrFields) {
            for (i in options.xhrFields) {
              xhr[i] = options.xhrFields[i];
            }
          }
          if (options.mimeType && xhr.overrideMimeType) {
            xhr.overrideMimeType(options.mimeType);
          }
          if (!options.crossDomain && !headers["X-Requested-With"]) {
            headers["X-Requested-With"] = "XMLHttpRequest";
          }
          for (i in headers) {
            xhr.setRequestHeader(i, headers[i]);
          }
          callback = function(type) {
            return function() {
              if (callback) {
                callback = errorCallback = xhr.onload = xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;
                if (type === "abort") {
                  xhr.abort();
                } else if (type === "error") {
                  if (typeof xhr.status !== "number") {
                    complete(0, "error");
                  } else {
                    complete(xhr.status, xhr.statusText);
                  }
                } else {
                  complete(xhrSuccessStatus[xhr.status] || xhr.status, xhr.statusText, (xhr.responseType || "text") !== "text" || typeof xhr.responseText !== "string" ? {binary: xhr.response} : {text: xhr.responseText}, xhr.getAllResponseHeaders());
                }
              }
            };
          };
          xhr.onload = callback();
          errorCallback = xhr.onerror = callback("error");
          if (xhr.onabort !== undefined) {
            xhr.onabort = errorCallback;
          } else {
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                window.setTimeout(function() {
                  if (callback) {
                    errorCallback();
                  }
                });
              }
            };
          }
          callback = callback("abort");
          try {
            xhr.send(options.hasContent && options.data || null);
          } catch (e) {
            if (callback) {
              throw e;
            }
          }
        },
        abort: function() {
          if (callback) {
            callback();
          }
        }
      };
    }
  });
  jQuery.ajaxSetup({
    accepts: {script: "text/javascript, application/javascript, " + "application/ecmascript, application/x-ecmascript"},
    contents: {script: /\b(?:java|ecma)script\b/},
    converters: {"text script": function(text) {
        jQuery.globalEval(text);
        return text;
      }}
  });
  jQuery.ajaxPrefilter("script", function(s) {
    if (s.cache === undefined) {
      s.cache = false;
    }
    if (s.crossDomain) {
      s.type = "GET";
    }
  });
  jQuery.ajaxTransport("script", function(s) {
    if (s.crossDomain) {
      var script,
          callback;
      return {
        send: function(_, complete) {
          script = jQuery("<script>").prop({
            charset: s.scriptCharset,
            src: s.url
          }).on("load error", callback = function(evt) {
            script.remove();
            callback = null;
            if (evt) {
              complete(evt.type === "error" ? 404 : 200, evt.type);
            }
          });
          document.head.appendChild(script[0]);
        },
        abort: function() {
          if (callback) {
            callback();
          }
        }
      };
    }
  });
  var oldCallbacks = [],
      rjsonp = /(=)\?(?=&|$)|\?\?/;
  jQuery.ajaxSetup({
    jsonp: "callback",
    jsonpCallback: function() {
      var callback = oldCallbacks.pop() || (jQuery.expando + "_" + (nonce++));
      this[callback] = true;
      return callback;
    }
  });
  jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
    var callbackName,
        overwritten,
        responseContainer,
        jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0 && rjsonp.test(s.data) && "data");
    if (jsonProp || s.dataTypes[0] === "jsonp") {
      callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
      if (jsonProp) {
        s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
      } else if (s.jsonp !== false) {
        s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
      }
      s.converters["script json"] = function() {
        if (!responseContainer) {
          jQuery.error(callbackName + " was not called");
        }
        return responseContainer[0];
      };
      s.dataTypes[0] = "json";
      overwritten = window[callbackName];
      window[callbackName] = function() {
        responseContainer = arguments;
      };
      jqXHR.always(function() {
        if (overwritten === undefined) {
          jQuery(window).removeProp(callbackName);
        } else {
          window[callbackName] = overwritten;
        }
        if (s[callbackName]) {
          s.jsonpCallback = originalSettings.jsonpCallback;
          oldCallbacks.push(callbackName);
        }
        if (responseContainer && jQuery.isFunction(overwritten)) {
          overwritten(responseContainer[0]);
        }
        responseContainer = overwritten = undefined;
      });
      return "script";
    }
  });
  support.createHTMLDocument = (function() {
    var body = document.implementation.createHTMLDocument("").body;
    body.innerHTML = "<form></form><form></form>";
    return body.childNodes.length === 2;
  })();
  jQuery.parseHTML = function(data, context, keepScripts) {
    if (!data || typeof data !== "string") {
      return null;
    }
    if (typeof context === "boolean") {
      keepScripts = context;
      context = false;
    }
    context = context || (support.createHTMLDocument ? document.implementation.createHTMLDocument("") : document);
    var parsed = rsingleTag.exec(data),
        scripts = !keepScripts && [];
    if (parsed) {
      return [context.createElement(parsed[1])];
    }
    parsed = buildFragment([data], context, scripts);
    if (scripts && scripts.length) {
      jQuery(scripts).remove();
    }
    return jQuery.merge([], parsed.childNodes);
  };
  var _load = jQuery.fn.load;
  jQuery.fn.load = function(url, params, callback) {
    if (typeof url !== "string" && _load) {
      return _load.apply(this, arguments);
    }
    var selector,
        type,
        response,
        self = this,
        off = url.indexOf(" ");
    if (off > -1) {
      selector = jQuery.trim(url.slice(off));
      url = url.slice(0, off);
    }
    if (jQuery.isFunction(params)) {
      callback = params;
      params = undefined;
    } else if (params && typeof params === "object") {
      type = "POST";
    }
    if (self.length > 0) {
      jQuery.ajax({
        url: url,
        type: type || "GET",
        dataType: "html",
        data: params
      }).done(function(responseText) {
        response = arguments;
        self.html(selector ? jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : responseText);
      }).always(callback && function(jqXHR, status) {
        self.each(function() {
          callback.apply(self, response || [jqXHR.responseText, status, jqXHR]);
        });
      });
    }
    return this;
  };
  jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(i, type) {
    jQuery.fn[type] = function(fn) {
      return this.on(type, fn);
    };
  });
  jQuery.expr.filters.animated = function(elem) {
    return jQuery.grep(jQuery.timers, function(fn) {
      return elem === fn.elem;
    }).length;
  };
  function getWindow(elem) {
    return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
  }
  jQuery.offset = {setOffset: function(elem, options, i) {
      var curPosition,
          curLeft,
          curCSSTop,
          curTop,
          curOffset,
          curCSSLeft,
          calculatePosition,
          position = jQuery.css(elem, "position"),
          curElem = jQuery(elem),
          props = {};
      if (position === "static") {
        elem.style.position = "relative";
      }
      curOffset = curElem.offset();
      curCSSTop = jQuery.css(elem, "top");
      curCSSLeft = jQuery.css(elem, "left");
      calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
      if (calculatePosition) {
        curPosition = curElem.position();
        curTop = curPosition.top;
        curLeft = curPosition.left;
      } else {
        curTop = parseFloat(curCSSTop) || 0;
        curLeft = parseFloat(curCSSLeft) || 0;
      }
      if (jQuery.isFunction(options)) {
        options = options.call(elem, i, jQuery.extend({}, curOffset));
      }
      if (options.top != null) {
        props.top = (options.top - curOffset.top) + curTop;
      }
      if (options.left != null) {
        props.left = (options.left - curOffset.left) + curLeft;
      }
      if ("using" in options) {
        options.using.call(elem, props);
      } else {
        curElem.css(props);
      }
    }};
  jQuery.fn.extend({
    offset: function(options) {
      if (arguments.length) {
        return options === undefined ? this : this.each(function(i) {
          jQuery.offset.setOffset(this, options, i);
        });
      }
      var docElem,
          win,
          elem = this[0],
          box = {
            top: 0,
            left: 0
          },
          doc = elem && elem.ownerDocument;
      if (!doc) {
        return;
      }
      docElem = doc.documentElement;
      if (!jQuery.contains(docElem, elem)) {
        return box;
      }
      box = elem.getBoundingClientRect();
      win = getWindow(doc);
      return {
        top: box.top + win.pageYOffset - docElem.clientTop,
        left: box.left + win.pageXOffset - docElem.clientLeft
      };
    },
    position: function() {
      if (!this[0]) {
        return;
      }
      var offsetParent,
          offset,
          elem = this[0],
          parentOffset = {
            top: 0,
            left: 0
          };
      if (jQuery.css(elem, "position") === "fixed") {
        offset = elem.getBoundingClientRect();
      } else {
        offsetParent = this.offsetParent();
        offset = this.offset();
        if (!jQuery.nodeName(offsetParent[0], "html")) {
          parentOffset = offsetParent.offset();
        }
        parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true) - offsetParent.scrollTop();
        parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true) - offsetParent.scrollLeft();
      }
      return {
        top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
        left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
      };
    },
    offsetParent: function() {
      return this.map(function() {
        var offsetParent = this.offsetParent;
        while (offsetParent && jQuery.css(offsetParent, "position") === "static") {
          offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || documentElement;
      });
    }
  });
  jQuery.each({
    scrollLeft: "pageXOffset",
    scrollTop: "pageYOffset"
  }, function(method, prop) {
    var top = "pageYOffset" === prop;
    jQuery.fn[method] = function(val) {
      return access(this, function(elem, method, val) {
        var win = getWindow(elem);
        if (val === undefined) {
          return win ? win[prop] : elem[method];
        }
        if (win) {
          win.scrollTo(!top ? val : win.pageXOffset, top ? val : win.pageYOffset);
        } else {
          elem[method] = val;
        }
      }, method, val, arguments.length);
    };
  });
  jQuery.each(["top", "left"], function(i, prop) {
    jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function(elem, computed) {
      if (computed) {
        computed = curCSS(elem, prop);
        return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed;
      }
    });
  });
  jQuery.each({
    Height: "height",
    Width: "width"
  }, function(name, type) {
    jQuery.each({
      padding: "inner" + name,
      content: type,
      "": "outer" + name
    }, function(defaultExtra, funcName) {
      jQuery.fn[funcName] = function(margin, value) {
        var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
            extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
        return access(this, function(elem, type, value) {
          var doc;
          if (jQuery.isWindow(elem)) {
            return elem.document.documentElement["client" + name];
          }
          if (elem.nodeType === 9) {
            doc = elem.documentElement;
            return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
          }
          return value === undefined ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra);
        }, type, chainable ? margin : undefined, chainable, null);
      };
    });
  });
  jQuery.fn.extend({
    bind: function(types, data, fn) {
      return this.on(types, null, data, fn);
    },
    unbind: function(types, fn) {
      return this.off(types, null, fn);
    },
    delegate: function(selector, types, data, fn) {
      return this.on(types, selector, data, fn);
    },
    undelegate: function(selector, types, fn) {
      return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
    },
    size: function() {
      return this.length;
    }
  });
  jQuery.fn.andSelf = jQuery.fn.addBack;
  if (typeof define === "function" && define.amd) {
    define("34", [], function() {
      return jQuery;
    });
  }
  var _jQuery = window.jQuery,
      _$ = window.$;
  jQuery.noConflict = function(deep) {
    if (window.$ === jQuery) {
      window.$ = _$;
    }
    if (deep && window.jQuery === jQuery) {
      window.jQuery = _jQuery;
    }
    return jQuery;
  };
  if (!noGlobal) {
    window.jQuery = window.$ = jQuery;
  }
  return jQuery;
}));

_removeDefine();
})();
(function() {
var _removeDefine = $__System.get("@@amd-helpers").createDefine();
define("9", ["34"], function(main) {
  return main;
});

_removeDefine();
})();
$__System.registerDynamic("35", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  (function() {
    var root = this;
    var previousUnderscore = root._;
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;
    var push = ArrayProto.push,
        slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;
    var nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind,
        nativeCreate = Object.create;
    var Ctor = function() {};
    var _ = function(obj) {
      if (obj instanceof _)
        return obj;
      if (!(this instanceof _))
        return new _(obj);
      this._wrapped = obj;
    };
    if (typeof exports !== 'undefined') {
      if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = _;
      }
      exports._ = _;
    } else {
      root._ = _;
    }
    _.VERSION = '1.8.3';
    var optimizeCb = function(func, context, argCount) {
      if (context === void 0)
        return func;
      switch (argCount == null ? 3 : argCount) {
        case 1:
          return function(value) {
            return func.call(context, value);
          };
        case 2:
          return function(value, other) {
            return func.call(context, value, other);
          };
        case 3:
          return function(value, index, collection) {
            return func.call(context, value, index, collection);
          };
        case 4:
          return function(accumulator, value, index, collection) {
            return func.call(context, accumulator, value, index, collection);
          };
      }
      return function() {
        return func.apply(context, arguments);
      };
    };
    var cb = function(value, context, argCount) {
      if (value == null)
        return _.identity;
      if (_.isFunction(value))
        return optimizeCb(value, context, argCount);
      if (_.isObject(value))
        return _.matcher(value);
      return _.property(value);
    };
    _.iteratee = function(value, context) {
      return cb(value, context, Infinity);
    };
    var createAssigner = function(keysFunc, undefinedOnly) {
      return function(obj) {
        var length = arguments.length;
        if (length < 2 || obj == null)
          return obj;
        for (var index = 1; index < length; index++) {
          var source = arguments[index],
              keys = keysFunc(source),
              l = keys.length;
          for (var i = 0; i < l; i++) {
            var key = keys[i];
            if (!undefinedOnly || obj[key] === void 0)
              obj[key] = source[key];
          }
        }
        return obj;
      };
    };
    var baseCreate = function(prototype) {
      if (!_.isObject(prototype))
        return {};
      if (nativeCreate)
        return nativeCreate(prototype);
      Ctor.prototype = prototype;
      var result = new Ctor;
      Ctor.prototype = null;
      return result;
    };
    var property = function(key) {
      return function(obj) {
        return obj == null ? void 0 : obj[key];
      };
    };
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var getLength = property('length');
    var isArrayLike = function(collection) {
      var length = getLength(collection);
      return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };
    _.each = _.forEach = function(obj, iteratee, context) {
      iteratee = optimizeCb(iteratee, context);
      var i,
          length;
      if (isArrayLike(obj)) {
        for (i = 0, length = obj.length; i < length; i++) {
          iteratee(obj[i], i, obj);
        }
      } else {
        var keys = _.keys(obj);
        for (i = 0, length = keys.length; i < length; i++) {
          iteratee(obj[keys[i]], keys[i], obj);
        }
      }
      return obj;
    };
    _.map = _.collect = function(obj, iteratee, context) {
      iteratee = cb(iteratee, context);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          results = Array(length);
      for (var index = 0; index < length; index++) {
        var currentKey = keys ? keys[index] : index;
        results[index] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
    };
    function createReduce(dir) {
      function iterator(obj, iteratee, memo, keys, index, length) {
        for (; index >= 0 && index < length; index += dir) {
          var currentKey = keys ? keys[index] : index;
          memo = iteratee(memo, obj[currentKey], currentKey, obj);
        }
        return memo;
      }
      return function(obj, iteratee, memo, context) {
        iteratee = optimizeCb(iteratee, context, 4);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length,
            index = dir > 0 ? 0 : length - 1;
        if (arguments.length < 3) {
          memo = obj[keys ? keys[index] : index];
          index += dir;
        }
        return iterator(obj, iteratee, memo, keys, index, length);
      };
    }
    _.reduce = _.foldl = _.inject = createReduce(1);
    _.reduceRight = _.foldr = createReduce(-1);
    _.find = _.detect = function(obj, predicate, context) {
      var key;
      if (isArrayLike(obj)) {
        key = _.findIndex(obj, predicate, context);
      } else {
        key = _.findKey(obj, predicate, context);
      }
      if (key !== void 0 && key !== -1)
        return obj[key];
    };
    _.filter = _.select = function(obj, predicate, context) {
      var results = [];
      predicate = cb(predicate, context);
      _.each(obj, function(value, index, list) {
        if (predicate(value, index, list))
          results.push(value);
      });
      return results;
    };
    _.reject = function(obj, predicate, context) {
      return _.filter(obj, _.negate(cb(predicate)), context);
    };
    _.every = _.all = function(obj, predicate, context) {
      predicate = cb(predicate, context);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length;
      for (var index = 0; index < length; index++) {
        var currentKey = keys ? keys[index] : index;
        if (!predicate(obj[currentKey], currentKey, obj))
          return false;
      }
      return true;
    };
    _.some = _.any = function(obj, predicate, context) {
      predicate = cb(predicate, context);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length;
      for (var index = 0; index < length; index++) {
        var currentKey = keys ? keys[index] : index;
        if (predicate(obj[currentKey], currentKey, obj))
          return true;
      }
      return false;
    };
    _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
      if (!isArrayLike(obj))
        obj = _.values(obj);
      if (typeof fromIndex != 'number' || guard)
        fromIndex = 0;
      return _.indexOf(obj, item, fromIndex) >= 0;
    };
    _.invoke = function(obj, method) {
      var args = slice.call(arguments, 2);
      var isFunc = _.isFunction(method);
      return _.map(obj, function(value) {
        var func = isFunc ? method : value[method];
        return func == null ? func : func.apply(value, args);
      });
    };
    _.pluck = function(obj, key) {
      return _.map(obj, _.property(key));
    };
    _.where = function(obj, attrs) {
      return _.filter(obj, _.matcher(attrs));
    };
    _.findWhere = function(obj, attrs) {
      return _.find(obj, _.matcher(attrs));
    };
    _.max = function(obj, iteratee, context) {
      var result = -Infinity,
          lastComputed = -Infinity,
          value,
          computed;
      if (iteratee == null && obj != null) {
        obj = isArrayLike(obj) ? obj : _.values(obj);
        for (var i = 0,
            length = obj.length; i < length; i++) {
          value = obj[i];
          if (value > result) {
            result = value;
          }
        }
      } else {
        iteratee = cb(iteratee, context);
        _.each(obj, function(value, index, list) {
          computed = iteratee(value, index, list);
          if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
            result = value;
            lastComputed = computed;
          }
        });
      }
      return result;
    };
    _.min = function(obj, iteratee, context) {
      var result = Infinity,
          lastComputed = Infinity,
          value,
          computed;
      if (iteratee == null && obj != null) {
        obj = isArrayLike(obj) ? obj : _.values(obj);
        for (var i = 0,
            length = obj.length; i < length; i++) {
          value = obj[i];
          if (value < result) {
            result = value;
          }
        }
      } else {
        iteratee = cb(iteratee, context);
        _.each(obj, function(value, index, list) {
          computed = iteratee(value, index, list);
          if (computed < lastComputed || computed === Infinity && result === Infinity) {
            result = value;
            lastComputed = computed;
          }
        });
      }
      return result;
    };
    _.shuffle = function(obj) {
      var set = isArrayLike(obj) ? obj : _.values(obj);
      var length = set.length;
      var shuffled = Array(length);
      for (var index = 0,
          rand; index < length; index++) {
        rand = _.random(0, index);
        if (rand !== index)
          shuffled[index] = shuffled[rand];
        shuffled[rand] = set[index];
      }
      return shuffled;
    };
    _.sample = function(obj, n, guard) {
      if (n == null || guard) {
        if (!isArrayLike(obj))
          obj = _.values(obj);
        return obj[_.random(obj.length - 1)];
      }
      return _.shuffle(obj).slice(0, Math.max(0, n));
    };
    _.sortBy = function(obj, iteratee, context) {
      iteratee = cb(iteratee, context);
      return _.pluck(_.map(obj, function(value, index, list) {
        return {
          value: value,
          index: index,
          criteria: iteratee(value, index, list)
        };
      }).sort(function(left, right) {
        var a = left.criteria;
        var b = right.criteria;
        if (a !== b) {
          if (a > b || a === void 0)
            return 1;
          if (a < b || b === void 0)
            return -1;
        }
        return left.index - right.index;
      }), 'value');
    };
    var group = function(behavior) {
      return function(obj, iteratee, context) {
        var result = {};
        iteratee = cb(iteratee, context);
        _.each(obj, function(value, index) {
          var key = iteratee(value, index, obj);
          behavior(result, value, key);
        });
        return result;
      };
    };
    _.groupBy = group(function(result, value, key) {
      if (_.has(result, key))
        result[key].push(value);
      else
        result[key] = [value];
    });
    _.indexBy = group(function(result, value, key) {
      result[key] = value;
    });
    _.countBy = group(function(result, value, key) {
      if (_.has(result, key))
        result[key]++;
      else
        result[key] = 1;
    });
    _.toArray = function(obj) {
      if (!obj)
        return [];
      if (_.isArray(obj))
        return slice.call(obj);
      if (isArrayLike(obj))
        return _.map(obj, _.identity);
      return _.values(obj);
    };
    _.size = function(obj) {
      if (obj == null)
        return 0;
      return isArrayLike(obj) ? obj.length : _.keys(obj).length;
    };
    _.partition = function(obj, predicate, context) {
      predicate = cb(predicate, context);
      var pass = [],
          fail = [];
      _.each(obj, function(value, key, obj) {
        (predicate(value, key, obj) ? pass : fail).push(value);
      });
      return [pass, fail];
    };
    _.first = _.head = _.take = function(array, n, guard) {
      if (array == null)
        return void 0;
      if (n == null || guard)
        return array[0];
      return _.initial(array, array.length - n);
    };
    _.initial = function(array, n, guard) {
      return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
    };
    _.last = function(array, n, guard) {
      if (array == null)
        return void 0;
      if (n == null || guard)
        return array[array.length - 1];
      return _.rest(array, Math.max(0, array.length - n));
    };
    _.rest = _.tail = _.drop = function(array, n, guard) {
      return slice.call(array, n == null || guard ? 1 : n);
    };
    _.compact = function(array) {
      return _.filter(array, _.identity);
    };
    var flatten = function(input, shallow, strict, startIndex) {
      var output = [],
          idx = 0;
      for (var i = startIndex || 0,
          length = getLength(input); i < length; i++) {
        var value = input[i];
        if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
          if (!shallow)
            value = flatten(value, shallow, strict);
          var j = 0,
              len = value.length;
          output.length += len;
          while (j < len) {
            output[idx++] = value[j++];
          }
        } else if (!strict) {
          output[idx++] = value;
        }
      }
      return output;
    };
    _.flatten = function(array, shallow) {
      return flatten(array, shallow, false);
    };
    _.without = function(array) {
      return _.difference(array, slice.call(arguments, 1));
    };
    _.uniq = _.unique = function(array, isSorted, iteratee, context) {
      if (!_.isBoolean(isSorted)) {
        context = iteratee;
        iteratee = isSorted;
        isSorted = false;
      }
      if (iteratee != null)
        iteratee = cb(iteratee, context);
      var result = [];
      var seen = [];
      for (var i = 0,
          length = getLength(array); i < length; i++) {
        var value = array[i],
            computed = iteratee ? iteratee(value, i, array) : value;
        if (isSorted) {
          if (!i || seen !== computed)
            result.push(value);
          seen = computed;
        } else if (iteratee) {
          if (!_.contains(seen, computed)) {
            seen.push(computed);
            result.push(value);
          }
        } else if (!_.contains(result, value)) {
          result.push(value);
        }
      }
      return result;
    };
    _.union = function() {
      return _.uniq(flatten(arguments, true, true));
    };
    _.intersection = function(array) {
      var result = [];
      var argsLength = arguments.length;
      for (var i = 0,
          length = getLength(array); i < length; i++) {
        var item = array[i];
        if (_.contains(result, item))
          continue;
        for (var j = 1; j < argsLength; j++) {
          if (!_.contains(arguments[j], item))
            break;
        }
        if (j === argsLength)
          result.push(item);
      }
      return result;
    };
    _.difference = function(array) {
      var rest = flatten(arguments, true, true, 1);
      return _.filter(array, function(value) {
        return !_.contains(rest, value);
      });
    };
    _.zip = function() {
      return _.unzip(arguments);
    };
    _.unzip = function(array) {
      var length = array && _.max(array, getLength).length || 0;
      var result = Array(length);
      for (var index = 0; index < length; index++) {
        result[index] = _.pluck(array, index);
      }
      return result;
    };
    _.object = function(list, values) {
      var result = {};
      for (var i = 0,
          length = getLength(list); i < length; i++) {
        if (values) {
          result[list[i]] = values[i];
        } else {
          result[list[i][0]] = list[i][1];
        }
      }
      return result;
    };
    function createPredicateIndexFinder(dir) {
      return function(array, predicate, context) {
        predicate = cb(predicate, context);
        var length = getLength(array);
        var index = dir > 0 ? 0 : length - 1;
        for (; index >= 0 && index < length; index += dir) {
          if (predicate(array[index], index, array))
            return index;
        }
        return -1;
      };
    }
    _.findIndex = createPredicateIndexFinder(1);
    _.findLastIndex = createPredicateIndexFinder(-1);
    _.sortedIndex = function(array, obj, iteratee, context) {
      iteratee = cb(iteratee, context, 1);
      var value = iteratee(obj);
      var low = 0,
          high = getLength(array);
      while (low < high) {
        var mid = Math.floor((low + high) / 2);
        if (iteratee(array[mid]) < value)
          low = mid + 1;
        else
          high = mid;
      }
      return low;
    };
    function createIndexFinder(dir, predicateFind, sortedIndex) {
      return function(array, item, idx) {
        var i = 0,
            length = getLength(array);
        if (typeof idx == 'number') {
          if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
          } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
          }
        } else if (sortedIndex && idx && length) {
          idx = sortedIndex(array, item);
          return array[idx] === item ? idx : -1;
        }
        if (item !== item) {
          idx = predicateFind(slice.call(array, i, length), _.isNaN);
          return idx >= 0 ? idx + i : -1;
        }
        for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
          if (array[idx] === item)
            return idx;
        }
        return -1;
      };
    }
    _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
    _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
    _.range = function(start, stop, step) {
      if (stop == null) {
        stop = start || 0;
        start = 0;
      }
      step = step || 1;
      var length = Math.max(Math.ceil((stop - start) / step), 0);
      var range = Array(length);
      for (var idx = 0; idx < length; idx++, start += step) {
        range[idx] = start;
      }
      return range;
    };
    var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
      if (!(callingContext instanceof boundFunc))
        return sourceFunc.apply(context, args);
      var self = baseCreate(sourceFunc.prototype);
      var result = sourceFunc.apply(self, args);
      if (_.isObject(result))
        return result;
      return self;
    };
    _.bind = function(func, context) {
      if (nativeBind && func.bind === nativeBind)
        return nativeBind.apply(func, slice.call(arguments, 1));
      if (!_.isFunction(func))
        throw new TypeError('Bind must be called on a function');
      var args = slice.call(arguments, 2);
      var bound = function() {
        return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
      };
      return bound;
    };
    _.partial = function(func) {
      var boundArgs = slice.call(arguments, 1);
      var bound = function() {
        var position = 0,
            length = boundArgs.length;
        var args = Array(length);
        for (var i = 0; i < length; i++) {
          args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
        }
        while (position < arguments.length)
          args.push(arguments[position++]);
        return executeBound(func, bound, this, this, args);
      };
      return bound;
    };
    _.bindAll = function(obj) {
      var i,
          length = arguments.length,
          key;
      if (length <= 1)
        throw new Error('bindAll must be passed function names');
      for (i = 1; i < length; i++) {
        key = arguments[i];
        obj[key] = _.bind(obj[key], obj);
      }
      return obj;
    };
    _.memoize = function(func, hasher) {
      var memoize = function(key) {
        var cache = memoize.cache;
        var address = '' + (hasher ? hasher.apply(this, arguments) : key);
        if (!_.has(cache, address))
          cache[address] = func.apply(this, arguments);
        return cache[address];
      };
      memoize.cache = {};
      return memoize;
    };
    _.delay = function(func, wait) {
      var args = slice.call(arguments, 2);
      return setTimeout(function() {
        return func.apply(null, args);
      }, wait);
    };
    _.defer = _.partial(_.delay, _, 1);
    _.throttle = function(func, wait, options) {
      var context,
          args,
          result;
      var timeout = null;
      var previous = 0;
      if (!options)
        options = {};
      var later = function() {
        previous = options.leading === false ? 0 : _.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout)
          context = args = null;
      };
      return function() {
        var now = _.now();
        if (!previous && options.leading === false)
          previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          previous = now;
          result = func.apply(context, args);
          if (!timeout)
            context = args = null;
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    };
    _.debounce = function(func, wait, immediate) {
      var timeout,
          args,
          context,
          timestamp,
          result;
      var later = function() {
        var last = _.now() - timestamp;
        if (last < wait && last >= 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            if (!timeout)
              context = args = null;
          }
        }
      };
      return function() {
        context = this;
        args = arguments;
        timestamp = _.now();
        var callNow = immediate && !timeout;
        if (!timeout)
          timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }
        return result;
      };
    };
    _.wrap = function(func, wrapper) {
      return _.partial(wrapper, func);
    };
    _.negate = function(predicate) {
      return function() {
        return !predicate.apply(this, arguments);
      };
    };
    _.compose = function() {
      var args = arguments;
      var start = args.length - 1;
      return function() {
        var i = start;
        var result = args[start].apply(this, arguments);
        while (i--)
          result = args[i].call(this, result);
        return result;
      };
    };
    _.after = function(times, func) {
      return function() {
        if (--times < 1) {
          return func.apply(this, arguments);
        }
      };
    };
    _.before = function(times, func) {
      var memo;
      return function() {
        if (--times > 0) {
          memo = func.apply(this, arguments);
        }
        if (times <= 1)
          func = null;
        return memo;
      };
    };
    _.once = _.partial(_.before, 2);
    var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
    var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
    function collectNonEnumProps(obj, keys) {
      var nonEnumIdx = nonEnumerableProps.length;
      var constructor = obj.constructor;
      var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;
      var prop = 'constructor';
      if (_.has(obj, prop) && !_.contains(keys, prop))
        keys.push(prop);
      while (nonEnumIdx--) {
        prop = nonEnumerableProps[nonEnumIdx];
        if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
          keys.push(prop);
        }
      }
    }
    _.keys = function(obj) {
      if (!_.isObject(obj))
        return [];
      if (nativeKeys)
        return nativeKeys(obj);
      var keys = [];
      for (var key in obj)
        if (_.has(obj, key))
          keys.push(key);
      if (hasEnumBug)
        collectNonEnumProps(obj, keys);
      return keys;
    };
    _.allKeys = function(obj) {
      if (!_.isObject(obj))
        return [];
      var keys = [];
      for (var key in obj)
        keys.push(key);
      if (hasEnumBug)
        collectNonEnumProps(obj, keys);
      return keys;
    };
    _.values = function(obj) {
      var keys = _.keys(obj);
      var length = keys.length;
      var values = Array(length);
      for (var i = 0; i < length; i++) {
        values[i] = obj[keys[i]];
      }
      return values;
    };
    _.mapObject = function(obj, iteratee, context) {
      iteratee = cb(iteratee, context);
      var keys = _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
    };
    _.pairs = function(obj) {
      var keys = _.keys(obj);
      var length = keys.length;
      var pairs = Array(length);
      for (var i = 0; i < length; i++) {
        pairs[i] = [keys[i], obj[keys[i]]];
      }
      return pairs;
    };
    _.invert = function(obj) {
      var result = {};
      var keys = _.keys(obj);
      for (var i = 0,
          length = keys.length; i < length; i++) {
        result[obj[keys[i]]] = keys[i];
      }
      return result;
    };
    _.functions = _.methods = function(obj) {
      var names = [];
      for (var key in obj) {
        if (_.isFunction(obj[key]))
          names.push(key);
      }
      return names.sort();
    };
    _.extend = createAssigner(_.allKeys);
    _.extendOwn = _.assign = createAssigner(_.keys);
    _.findKey = function(obj, predicate, context) {
      predicate = cb(predicate, context);
      var keys = _.keys(obj),
          key;
      for (var i = 0,
          length = keys.length; i < length; i++) {
        key = keys[i];
        if (predicate(obj[key], key, obj))
          return key;
      }
    };
    _.pick = function(object, oiteratee, context) {
      var result = {},
          obj = object,
          iteratee,
          keys;
      if (obj == null)
        return result;
      if (_.isFunction(oiteratee)) {
        keys = _.allKeys(obj);
        iteratee = optimizeCb(oiteratee, context);
      } else {
        keys = flatten(arguments, false, false, 1);
        iteratee = function(value, key, obj) {
          return key in obj;
        };
        obj = Object(obj);
      }
      for (var i = 0,
          length = keys.length; i < length; i++) {
        var key = keys[i];
        var value = obj[key];
        if (iteratee(value, key, obj))
          result[key] = value;
      }
      return result;
    };
    _.omit = function(obj, iteratee, context) {
      if (_.isFunction(iteratee)) {
        iteratee = _.negate(iteratee);
      } else {
        var keys = _.map(flatten(arguments, false, false, 1), String);
        iteratee = function(value, key) {
          return !_.contains(keys, key);
        };
      }
      return _.pick(obj, iteratee, context);
    };
    _.defaults = createAssigner(_.allKeys, true);
    _.create = function(prototype, props) {
      var result = baseCreate(prototype);
      if (props)
        _.extendOwn(result, props);
      return result;
    };
    _.clone = function(obj) {
      if (!_.isObject(obj))
        return obj;
      return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };
    _.tap = function(obj, interceptor) {
      interceptor(obj);
      return obj;
    };
    _.isMatch = function(object, attrs) {
      var keys = _.keys(attrs),
          length = keys.length;
      if (object == null)
        return !length;
      var obj = Object(object);
      for (var i = 0; i < length; i++) {
        var key = keys[i];
        if (attrs[key] !== obj[key] || !(key in obj))
          return false;
      }
      return true;
    };
    var eq = function(a, b, aStack, bStack) {
      if (a === b)
        return a !== 0 || 1 / a === 1 / b;
      if (a == null || b == null)
        return a === b;
      if (a instanceof _)
        a = a._wrapped;
      if (b instanceof _)
        b = b._wrapped;
      var className = toString.call(a);
      if (className !== toString.call(b))
        return false;
      switch (className) {
        case '[object RegExp]':
        case '[object String]':
          return '' + a === '' + b;
        case '[object Number]':
          if (+a !== +a)
            return +b !== +b;
          return +a === 0 ? 1 / +a === 1 / b : +a === +b;
        case '[object Date]':
        case '[object Boolean]':
          return +a === +b;
      }
      var areArrays = className === '[object Array]';
      if (!areArrays) {
        if (typeof a != 'object' || typeof b != 'object')
          return false;
        var aCtor = a.constructor,
            bCtor = b.constructor;
        if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
          return false;
        }
      }
      aStack = aStack || [];
      bStack = bStack || [];
      var length = aStack.length;
      while (length--) {
        if (aStack[length] === a)
          return bStack[length] === b;
      }
      aStack.push(a);
      bStack.push(b);
      if (areArrays) {
        length = a.length;
        if (length !== b.length)
          return false;
        while (length--) {
          if (!eq(a[length], b[length], aStack, bStack))
            return false;
        }
      } else {
        var keys = _.keys(a),
            key;
        length = keys.length;
        if (_.keys(b).length !== length)
          return false;
        while (length--) {
          key = keys[length];
          if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack)))
            return false;
        }
      }
      aStack.pop();
      bStack.pop();
      return true;
    };
    _.isEqual = function(a, b) {
      return eq(a, b);
    };
    _.isEmpty = function(obj) {
      if (obj == null)
        return true;
      if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)))
        return obj.length === 0;
      return _.keys(obj).length === 0;
    };
    _.isElement = function(obj) {
      return !!(obj && obj.nodeType === 1);
    };
    _.isArray = nativeIsArray || function(obj) {
      return toString.call(obj) === '[object Array]';
    };
    _.isObject = function(obj) {
      var type = typeof obj;
      return type === 'function' || type === 'object' && !!obj;
    };
    _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
      _['is' + name] = function(obj) {
        return toString.call(obj) === '[object ' + name + ']';
      };
    });
    if (!_.isArguments(arguments)) {
      _.isArguments = function(obj) {
        return _.has(obj, 'callee');
      };
    }
    if (typeof/./ != 'function' && typeof Int8Array != 'object') {
      _.isFunction = function(obj) {
        return typeof obj == 'function' || false;
      };
    }
    _.isFinite = function(obj) {
      return isFinite(obj) && !isNaN(parseFloat(obj));
    };
    _.isNaN = function(obj) {
      return _.isNumber(obj) && obj !== +obj;
    };
    _.isBoolean = function(obj) {
      return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    };
    _.isNull = function(obj) {
      return obj === null;
    };
    _.isUndefined = function(obj) {
      return obj === void 0;
    };
    _.has = function(obj, key) {
      return obj != null && hasOwnProperty.call(obj, key);
    };
    _.noConflict = function() {
      root._ = previousUnderscore;
      return this;
    };
    _.identity = function(value) {
      return value;
    };
    _.constant = function(value) {
      return function() {
        return value;
      };
    };
    _.noop = function() {};
    _.property = property;
    _.propertyOf = function(obj) {
      return obj == null ? function() {} : function(key) {
        return obj[key];
      };
    };
    _.matcher = _.matches = function(attrs) {
      attrs = _.extendOwn({}, attrs);
      return function(obj) {
        return _.isMatch(obj, attrs);
      };
    };
    _.times = function(n, iteratee, context) {
      var accum = Array(Math.max(0, n));
      iteratee = optimizeCb(iteratee, context, 1);
      for (var i = 0; i < n; i++)
        accum[i] = iteratee(i);
      return accum;
    };
    _.random = function(min, max) {
      if (max == null) {
        max = min;
        min = 0;
      }
      return min + Math.floor(Math.random() * (max - min + 1));
    };
    _.now = Date.now || function() {
      return new Date().getTime();
    };
    var escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '`': '&#x60;'
    };
    var unescapeMap = _.invert(escapeMap);
    var createEscaper = function(map) {
      var escaper = function(match) {
        return map[match];
      };
      var source = '(?:' + _.keys(map).join('|') + ')';
      var testRegexp = RegExp(source);
      var replaceRegexp = RegExp(source, 'g');
      return function(string) {
        string = string == null ? '' : '' + string;
        return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
      };
    };
    _.escape = createEscaper(escapeMap);
    _.unescape = createEscaper(unescapeMap);
    _.result = function(object, property, fallback) {
      var value = object == null ? void 0 : object[property];
      if (value === void 0) {
        value = fallback;
      }
      return _.isFunction(value) ? value.call(object) : value;
    };
    var idCounter = 0;
    _.uniqueId = function(prefix) {
      var id = ++idCounter + '';
      return prefix ? prefix + id : id;
    };
    _.templateSettings = {
      evaluate: /<%([\s\S]+?)%>/g,
      interpolate: /<%=([\s\S]+?)%>/g,
      escape: /<%-([\s\S]+?)%>/g
    };
    var noMatch = /(.)^/;
    var escapes = {
      "'": "'",
      '\\': '\\',
      '\r': 'r',
      '\n': 'n',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    };
    var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
    var escapeChar = function(match) {
      return '\\' + escapes[match];
    };
    _.template = function(text, settings, oldSettings) {
      if (!settings && oldSettings)
        settings = oldSettings;
      settings = _.defaults({}, settings, _.templateSettings);
      var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');
      var index = 0;
      var source = "__p+='";
      text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
        source += text.slice(index, offset).replace(escaper, escapeChar);
        index = offset + match.length;
        if (escape) {
          source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
        } else if (interpolate) {
          source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
        } else if (evaluate) {
          source += "';\n" + evaluate + "\n__p+='";
        }
        return match;
      });
      source += "';\n";
      if (!settings.variable)
        source = 'with(obj||{}){\n' + source + '}\n';
      source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
      try {
        var render = new Function(settings.variable || 'obj', '_', source);
      } catch (e) {
        e.source = source;
        throw e;
      }
      var template = function(data) {
        return render.call(this, data, _);
      };
      var argument = settings.variable || 'obj';
      template.source = 'function(' + argument + '){\n' + source + '}';
      return template;
    };
    _.chain = function(obj) {
      var instance = _(obj);
      instance._chain = true;
      return instance;
    };
    var result = function(instance, obj) {
      return instance._chain ? _(obj).chain() : obj;
    };
    _.mixin = function(obj) {
      _.each(_.functions(obj), function(name) {
        var func = _[name] = obj[name];
        _.prototype[name] = function() {
          var args = [this._wrapped];
          push.apply(args, arguments);
          return result(this, func.apply(_, args));
        };
      });
    };
    _.mixin(_);
    _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
      var method = ArrayProto[name];
      _.prototype[name] = function() {
        var obj = this._wrapped;
        method.apply(obj, arguments);
        if ((name === 'shift' || name === 'splice') && obj.length === 0)
          delete obj[0];
        return result(this, obj);
      };
    });
    _.each(['concat', 'join', 'slice'], function(name) {
      var method = ArrayProto[name];
      _.prototype[name] = function() {
        return result(this, method.apply(this._wrapped, arguments));
      };
    });
    _.prototype.value = function() {
      return this._wrapped;
    };
    _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
    _.prototype.toString = function() {
      return '' + this._wrapped;
    };
    if (typeof define === 'function' && define.amd) {
      define('underscore', [], function() {
        return _;
      });
    }
  }.call(this));
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("27", ["35"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('35');
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("36", ["27", "9", "33"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  (function(process) {
    (function(factory) {
      var root = (typeof self == 'object' && self.self == self && self) || (typeof global == 'object' && global.global == global && global);
      if (typeof define === 'function' && define.amd) {
        define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
          root.Backbone = factory(root, exports, _, $);
        });
      } else if (typeof exports !== 'undefined') {
        var _ = $__require('27'),
            $;
        try {
          $ = $__require('9');
        } catch (e) {}
        factory(root, exports, _, $);
      } else {
        root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
      }
    }(function(root, Backbone, _, $) {
      var previousBackbone = root.Backbone;
      var slice = Array.prototype.slice;
      Backbone.VERSION = '1.2.3';
      Backbone.$ = $;
      Backbone.noConflict = function() {
        root.Backbone = previousBackbone;
        return this;
      };
      Backbone.emulateHTTP = false;
      Backbone.emulateJSON = false;
      var addMethod = function(length, method, attribute) {
        switch (length) {
          case 1:
            return function() {
              return _[method](this[attribute]);
            };
          case 2:
            return function(value) {
              return _[method](this[attribute], value);
            };
          case 3:
            return function(iteratee, context) {
              return _[method](this[attribute], cb(iteratee, this), context);
            };
          case 4:
            return function(iteratee, defaultVal, context) {
              return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
            };
          default:
            return function() {
              var args = slice.call(arguments);
              args.unshift(this[attribute]);
              return _[method].apply(_, args);
            };
        }
      };
      var addUnderscoreMethods = function(Class, methods, attribute) {
        _.each(methods, function(length, method) {
          if (_[method])
            Class.prototype[method] = addMethod(length, method, attribute);
        });
      };
      var cb = function(iteratee, instance) {
        if (_.isFunction(iteratee))
          return iteratee;
        if (_.isObject(iteratee) && !instance._isModel(iteratee))
          return modelMatcher(iteratee);
        if (_.isString(iteratee))
          return function(model) {
            return model.get(iteratee);
          };
        return iteratee;
      };
      var modelMatcher = function(attrs) {
        var matcher = _.matches(attrs);
        return function(model) {
          return matcher(model.attributes);
        };
      };
      var Events = Backbone.Events = {};
      var eventSplitter = /\s+/;
      var eventsApi = function(iteratee, events, name, callback, opts) {
        var i = 0,
            names;
        if (name && typeof name === 'object') {
          if (callback !== void 0 && 'context' in opts && opts.context === void 0)
            opts.context = callback;
          for (names = _.keys(name); i < names.length; i++) {
            events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
          }
        } else if (name && eventSplitter.test(name)) {
          for (names = name.split(eventSplitter); i < names.length; i++) {
            events = iteratee(events, names[i], callback, opts);
          }
        } else {
          events = iteratee(events, name, callback, opts);
        }
        return events;
      };
      Events.on = function(name, callback, context) {
        return internalOn(this, name, callback, context);
      };
      var internalOn = function(obj, name, callback, context, listening) {
        obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
          context: context,
          ctx: obj,
          listening: listening
        });
        if (listening) {
          var listeners = obj._listeners || (obj._listeners = {});
          listeners[listening.id] = listening;
        }
        return obj;
      };
      Events.listenTo = function(obj, name, callback) {
        if (!obj)
          return this;
        var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var listening = listeningTo[id];
        if (!listening) {
          var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
          listening = listeningTo[id] = {
            obj: obj,
            objId: id,
            id: thisId,
            listeningTo: listeningTo,
            count: 0
          };
        }
        internalOn(obj, name, callback, this, listening);
        return this;
      };
      var onApi = function(events, name, callback, options) {
        if (callback) {
          var handlers = events[name] || (events[name] = []);
          var context = options.context,
              ctx = options.ctx,
              listening = options.listening;
          if (listening)
            listening.count++;
          handlers.push({
            callback: callback,
            context: context,
            ctx: context || ctx,
            listening: listening
          });
        }
        return events;
      };
      Events.off = function(name, callback, context) {
        if (!this._events)
          return this;
        this._events = eventsApi(offApi, this._events, name, callback, {
          context: context,
          listeners: this._listeners
        });
        return this;
      };
      Events.stopListening = function(obj, name, callback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo)
          return this;
        var ids = obj ? [obj._listenId] : _.keys(listeningTo);
        for (var i = 0; i < ids.length; i++) {
          var listening = listeningTo[ids[i]];
          if (!listening)
            break;
          listening.obj.off(name, callback, this);
        }
        if (_.isEmpty(listeningTo))
          this._listeningTo = void 0;
        return this;
      };
      var offApi = function(events, name, callback, options) {
        if (!events)
          return;
        var i = 0,
            listening;
        var context = options.context,
            listeners = options.listeners;
        if (!name && !callback && !context) {
          var ids = _.keys(listeners);
          for (; i < ids.length; i++) {
            listening = listeners[ids[i]];
            delete listeners[listening.id];
            delete listening.listeningTo[listening.objId];
          }
          return;
        }
        var names = name ? [name] : _.keys(events);
        for (; i < names.length; i++) {
          name = names[i];
          var handlers = events[name];
          if (!handlers)
            break;
          var remaining = [];
          for (var j = 0; j < handlers.length; j++) {
            var handler = handlers[j];
            if (callback && callback !== handler.callback && callback !== handler.callback._callback || context && context !== handler.context) {
              remaining.push(handler);
            } else {
              listening = handler.listening;
              if (listening && --listening.count === 0) {
                delete listeners[listening.id];
                delete listening.listeningTo[listening.objId];
              }
            }
          }
          if (remaining.length) {
            events[name] = remaining;
          } else {
            delete events[name];
          }
        }
        if (_.size(events))
          return events;
      };
      Events.once = function(name, callback, context) {
        var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
        return this.on(events, void 0, context);
      };
      Events.listenToOnce = function(obj, name, callback) {
        var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
        return this.listenTo(obj, events);
      };
      var onceMap = function(map, name, callback, offer) {
        if (callback) {
          var once = map[name] = _.once(function() {
            offer(name, once);
            callback.apply(this, arguments);
          });
          once._callback = callback;
        }
        return map;
      };
      Events.trigger = function(name) {
        if (!this._events)
          return this;
        var length = Math.max(0, arguments.length - 1);
        var args = Array(length);
        for (var i = 0; i < length; i++)
          args[i] = arguments[i + 1];
        eventsApi(triggerApi, this._events, name, void 0, args);
        return this;
      };
      var triggerApi = function(objEvents, name, cb, args) {
        if (objEvents) {
          var events = objEvents[name];
          var allEvents = objEvents.all;
          if (events && allEvents)
            allEvents = allEvents.slice();
          if (events)
            triggerEvents(events, args);
          if (allEvents)
            triggerEvents(allEvents, [name].concat(args));
        }
        return objEvents;
      };
      var triggerEvents = function(events, args) {
        var ev,
            i = -1,
            l = events.length,
            a1 = args[0],
            a2 = args[1],
            a3 = args[2];
        switch (args.length) {
          case 0:
            while (++i < l)
              (ev = events[i]).callback.call(ev.ctx);
            return;
          case 1:
            while (++i < l)
              (ev = events[i]).callback.call(ev.ctx, a1);
            return;
          case 2:
            while (++i < l)
              (ev = events[i]).callback.call(ev.ctx, a1, a2);
            return;
          case 3:
            while (++i < l)
              (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
            return;
          default:
            while (++i < l)
              (ev = events[i]).callback.apply(ev.ctx, args);
            return;
        }
      };
      Events.bind = Events.on;
      Events.unbind = Events.off;
      _.extend(Backbone, Events);
      var Model = Backbone.Model = function(attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId(this.cidPrefix);
        this.attributes = {};
        if (options.collection)
          this.collection = options.collection;
        if (options.parse)
          attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};
        this.initialize.apply(this, arguments);
      };
      _.extend(Model.prototype, Events, {
        changed: null,
        validationError: null,
        idAttribute: 'id',
        cidPrefix: 'c',
        initialize: function() {},
        toJSON: function(options) {
          return _.clone(this.attributes);
        },
        sync: function() {
          return Backbone.sync.apply(this, arguments);
        },
        get: function(attr) {
          return this.attributes[attr];
        },
        escape: function(attr) {
          return _.escape(this.get(attr));
        },
        has: function(attr) {
          return this.get(attr) != null;
        },
        matches: function(attrs) {
          return !!_.iteratee(attrs, this)(this.attributes);
        },
        set: function(key, val, options) {
          if (key == null)
            return this;
          var attrs;
          if (typeof key === 'object') {
            attrs = key;
            options = val;
          } else {
            (attrs = {})[key] = val;
          }
          options || (options = {});
          if (!this._validate(attrs, options))
            return false;
          var unset = options.unset;
          var silent = options.silent;
          var changes = [];
          var changing = this._changing;
          this._changing = true;
          if (!changing) {
            this._previousAttributes = _.clone(this.attributes);
            this.changed = {};
          }
          var current = this.attributes;
          var changed = this.changed;
          var prev = this._previousAttributes;
          for (var attr in attrs) {
            val = attrs[attr];
            if (!_.isEqual(current[attr], val))
              changes.push(attr);
            if (!_.isEqual(prev[attr], val)) {
              changed[attr] = val;
            } else {
              delete changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
          }
          this.id = this.get(this.idAttribute);
          if (!silent) {
            if (changes.length)
              this._pending = options;
            for (var i = 0; i < changes.length; i++) {
              this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
          }
          if (changing)
            return this;
          if (!silent) {
            while (this._pending) {
              options = this._pending;
              this._pending = false;
              this.trigger('change', this, options);
            }
          }
          this._pending = false;
          this._changing = false;
          return this;
        },
        unset: function(attr, options) {
          return this.set(attr, void 0, _.extend({}, options, {unset: true}));
        },
        clear: function(options) {
          var attrs = {};
          for (var key in this.attributes)
            attrs[key] = void 0;
          return this.set(attrs, _.extend({}, options, {unset: true}));
        },
        hasChanged: function(attr) {
          if (attr == null)
            return !_.isEmpty(this.changed);
          return _.has(this.changed, attr);
        },
        changedAttributes: function(diff) {
          if (!diff)
            return this.hasChanged() ? _.clone(this.changed) : false;
          var old = this._changing ? this._previousAttributes : this.attributes;
          var changed = {};
          for (var attr in diff) {
            var val = diff[attr];
            if (_.isEqual(old[attr], val))
              continue;
            changed[attr] = val;
          }
          return _.size(changed) ? changed : false;
        },
        previous: function(attr) {
          if (attr == null || !this._previousAttributes)
            return null;
          return this._previousAttributes[attr];
        },
        previousAttributes: function() {
          return _.clone(this._previousAttributes);
        },
        fetch: function(options) {
          options = _.extend({parse: true}, options);
          var model = this;
          var success = options.success;
          options.success = function(resp) {
            var serverAttrs = options.parse ? model.parse(resp, options) : resp;
            if (!model.set(serverAttrs, options))
              return false;
            if (success)
              success.call(options.context, model, resp, options);
            model.trigger('sync', model, resp, options);
          };
          wrapError(this, options);
          return this.sync('read', this, options);
        },
        save: function(key, val, options) {
          var attrs;
          if (key == null || typeof key === 'object') {
            attrs = key;
            options = val;
          } else {
            (attrs = {})[key] = val;
          }
          options = _.extend({
            validate: true,
            parse: true
          }, options);
          var wait = options.wait;
          if (attrs && !wait) {
            if (!this.set(attrs, options))
              return false;
          } else {
            if (!this._validate(attrs, options))
              return false;
          }
          var model = this;
          var success = options.success;
          var attributes = this.attributes;
          options.success = function(resp) {
            model.attributes = attributes;
            var serverAttrs = options.parse ? model.parse(resp, options) : resp;
            if (wait)
              serverAttrs = _.extend({}, attrs, serverAttrs);
            if (serverAttrs && !model.set(serverAttrs, options))
              return false;
            if (success)
              success.call(options.context, model, resp, options);
            model.trigger('sync', model, resp, options);
          };
          wrapError(this, options);
          if (attrs && wait)
            this.attributes = _.extend({}, attributes, attrs);
          var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
          if (method === 'patch' && !options.attrs)
            options.attrs = attrs;
          var xhr = this.sync(method, this, options);
          this.attributes = attributes;
          return xhr;
        },
        destroy: function(options) {
          options = options ? _.clone(options) : {};
          var model = this;
          var success = options.success;
          var wait = options.wait;
          var destroy = function() {
            model.stopListening();
            model.trigger('destroy', model, model.collection, options);
          };
          options.success = function(resp) {
            if (wait)
              destroy();
            if (success)
              success.call(options.context, model, resp, options);
            if (!model.isNew())
              model.trigger('sync', model, resp, options);
          };
          var xhr = false;
          if (this.isNew()) {
            _.defer(options.success);
          } else {
            wrapError(this, options);
            xhr = this.sync('delete', this, options);
          }
          if (!wait)
            destroy();
          return xhr;
        },
        url: function() {
          var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
          if (this.isNew())
            return base;
          var id = this.get(this.idAttribute);
          return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
        },
        parse: function(resp, options) {
          return resp;
        },
        clone: function() {
          return new this.constructor(this.attributes);
        },
        isNew: function() {
          return !this.has(this.idAttribute);
        },
        isValid: function(options) {
          return this._validate({}, _.defaults({validate: true}, options));
        },
        _validate: function(attrs, options) {
          if (!options.validate || !this.validate)
            return true;
          attrs = _.extend({}, this.attributes, attrs);
          var error = this.validationError = this.validate(attrs, options) || null;
          if (!error)
            return true;
          this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
          return false;
        }
      });
      var modelMethods = {
        keys: 1,
        values: 1,
        pairs: 1,
        invert: 1,
        pick: 0,
        omit: 0,
        chain: 1,
        isEmpty: 1
      };
      addUnderscoreMethods(Model, modelMethods, 'attributes');
      var Collection = Backbone.Collection = function(models, options) {
        options || (options = {});
        if (options.model)
          this.model = options.model;
        if (options.comparator !== void 0)
          this.comparator = options.comparator;
        this._reset();
        this.initialize.apply(this, arguments);
        if (models)
          this.reset(models, _.extend({silent: true}, options));
      };
      var setOptions = {
        add: true,
        remove: true,
        merge: true
      };
      var addOptions = {
        add: true,
        remove: false
      };
      var splice = function(array, insert, at) {
        at = Math.min(Math.max(at, 0), array.length);
        var tail = Array(array.length - at);
        var length = insert.length;
        for (var i = 0; i < tail.length; i++)
          tail[i] = array[i + at];
        for (i = 0; i < length; i++)
          array[i + at] = insert[i];
        for (i = 0; i < tail.length; i++)
          array[i + length + at] = tail[i];
      };
      _.extend(Collection.prototype, Events, {
        model: Model,
        initialize: function() {},
        toJSON: function(options) {
          return this.map(function(model) {
            return model.toJSON(options);
          });
        },
        sync: function() {
          return Backbone.sync.apply(this, arguments);
        },
        add: function(models, options) {
          return this.set(models, _.extend({merge: false}, options, addOptions));
        },
        remove: function(models, options) {
          options = _.extend({}, options);
          var singular = !_.isArray(models);
          models = singular ? [models] : _.clone(models);
          var removed = this._removeModels(models, options);
          if (!options.silent && removed)
            this.trigger('update', this, options);
          return singular ? removed[0] : removed;
        },
        set: function(models, options) {
          if (models == null)
            return;
          options = _.defaults({}, options, setOptions);
          if (options.parse && !this._isModel(models))
            models = this.parse(models, options);
          var singular = !_.isArray(models);
          models = singular ? [models] : models.slice();
          var at = options.at;
          if (at != null)
            at = +at;
          if (at < 0)
            at += this.length + 1;
          var set = [];
          var toAdd = [];
          var toRemove = [];
          var modelMap = {};
          var add = options.add;
          var merge = options.merge;
          var remove = options.remove;
          var sort = false;
          var sortable = this.comparator && (at == null) && options.sort !== false;
          var sortAttr = _.isString(this.comparator) ? this.comparator : null;
          var model;
          for (var i = 0; i < models.length; i++) {
            model = models[i];
            var existing = this.get(model);
            if (existing) {
              if (merge && model !== existing) {
                var attrs = this._isModel(model) ? model.attributes : model;
                if (options.parse)
                  attrs = existing.parse(attrs, options);
                existing.set(attrs, options);
                if (sortable && !sort)
                  sort = existing.hasChanged(sortAttr);
              }
              if (!modelMap[existing.cid]) {
                modelMap[existing.cid] = true;
                set.push(existing);
              }
              models[i] = existing;
            } else if (add) {
              model = models[i] = this._prepareModel(model, options);
              if (model) {
                toAdd.push(model);
                this._addReference(model, options);
                modelMap[model.cid] = true;
                set.push(model);
              }
            }
          }
          if (remove) {
            for (i = 0; i < this.length; i++) {
              model = this.models[i];
              if (!modelMap[model.cid])
                toRemove.push(model);
            }
            if (toRemove.length)
              this._removeModels(toRemove, options);
          }
          var orderChanged = false;
          var replace = !sortable && add && remove;
          if (set.length && replace) {
            orderChanged = this.length != set.length || _.some(this.models, function(model, index) {
              return model !== set[index];
            });
            this.models.length = 0;
            splice(this.models, set, 0);
            this.length = this.models.length;
          } else if (toAdd.length) {
            if (sortable)
              sort = true;
            splice(this.models, toAdd, at == null ? this.length : at);
            this.length = this.models.length;
          }
          if (sort)
            this.sort({silent: true});
          if (!options.silent) {
            for (i = 0; i < toAdd.length; i++) {
              if (at != null)
                options.index = at + i;
              model = toAdd[i];
              model.trigger('add', model, this, options);
            }
            if (sort || orderChanged)
              this.trigger('sort', this, options);
            if (toAdd.length || toRemove.length)
              this.trigger('update', this, options);
          }
          return singular ? models[0] : models;
        },
        reset: function(models, options) {
          options = options ? _.clone(options) : {};
          for (var i = 0; i < this.models.length; i++) {
            this._removeReference(this.models[i], options);
          }
          options.previousModels = this.models;
          this._reset();
          models = this.add(models, _.extend({silent: true}, options));
          if (!options.silent)
            this.trigger('reset', this, options);
          return models;
        },
        push: function(model, options) {
          return this.add(model, _.extend({at: this.length}, options));
        },
        pop: function(options) {
          var model = this.at(this.length - 1);
          return this.remove(model, options);
        },
        unshift: function(model, options) {
          return this.add(model, _.extend({at: 0}, options));
        },
        shift: function(options) {
          var model = this.at(0);
          return this.remove(model, options);
        },
        slice: function() {
          return slice.apply(this.models, arguments);
        },
        get: function(obj) {
          if (obj == null)
            return void 0;
          var id = this.modelId(this._isModel(obj) ? obj.attributes : obj);
          return this._byId[obj] || this._byId[id] || this._byId[obj.cid];
        },
        at: function(index) {
          if (index < 0)
            index += this.length;
          return this.models[index];
        },
        where: function(attrs, first) {
          return this[first ? 'find' : 'filter'](attrs);
        },
        findWhere: function(attrs) {
          return this.where(attrs, true);
        },
        sort: function(options) {
          var comparator = this.comparator;
          if (!comparator)
            throw new Error('Cannot sort a set without a comparator');
          options || (options = {});
          var length = comparator.length;
          if (_.isFunction(comparator))
            comparator = _.bind(comparator, this);
          if (length === 1 || _.isString(comparator)) {
            this.models = this.sortBy(comparator);
          } else {
            this.models.sort(comparator);
          }
          if (!options.silent)
            this.trigger('sort', this, options);
          return this;
        },
        pluck: function(attr) {
          return _.invoke(this.models, 'get', attr);
        },
        fetch: function(options) {
          options = _.extend({parse: true}, options);
          var success = options.success;
          var collection = this;
          options.success = function(resp) {
            var method = options.reset ? 'reset' : 'set';
            collection[method](resp, options);
            if (success)
              success.call(options.context, collection, resp, options);
            collection.trigger('sync', collection, resp, options);
          };
          wrapError(this, options);
          return this.sync('read', this, options);
        },
        create: function(model, options) {
          options = options ? _.clone(options) : {};
          var wait = options.wait;
          model = this._prepareModel(model, options);
          if (!model)
            return false;
          if (!wait)
            this.add(model, options);
          var collection = this;
          var success = options.success;
          options.success = function(model, resp, callbackOpts) {
            if (wait)
              collection.add(model, callbackOpts);
            if (success)
              success.call(callbackOpts.context, model, resp, callbackOpts);
          };
          model.save(null, options);
          return model;
        },
        parse: function(resp, options) {
          return resp;
        },
        clone: function() {
          return new this.constructor(this.models, {
            model: this.model,
            comparator: this.comparator
          });
        },
        modelId: function(attrs) {
          return attrs[this.model.prototype.idAttribute || 'id'];
        },
        _reset: function() {
          this.length = 0;
          this.models = [];
          this._byId = {};
        },
        _prepareModel: function(attrs, options) {
          if (this._isModel(attrs)) {
            if (!attrs.collection)
              attrs.collection = this;
            return attrs;
          }
          options = options ? _.clone(options) : {};
          options.collection = this;
          var model = new this.model(attrs, options);
          if (!model.validationError)
            return model;
          this.trigger('invalid', this, model.validationError, options);
          return false;
        },
        _removeModels: function(models, options) {
          var removed = [];
          for (var i = 0; i < models.length; i++) {
            var model = this.get(models[i]);
            if (!model)
              continue;
            var index = this.indexOf(model);
            this.models.splice(index, 1);
            this.length--;
            if (!options.silent) {
              options.index = index;
              model.trigger('remove', model, this, options);
            }
            removed.push(model);
            this._removeReference(model, options);
          }
          return removed.length ? removed : false;
        },
        _isModel: function(model) {
          return model instanceof Model;
        },
        _addReference: function(model, options) {
          this._byId[model.cid] = model;
          var id = this.modelId(model.attributes);
          if (id != null)
            this._byId[id] = model;
          model.on('all', this._onModelEvent, this);
        },
        _removeReference: function(model, options) {
          delete this._byId[model.cid];
          var id = this.modelId(model.attributes);
          if (id != null)
            delete this._byId[id];
          if (this === model.collection)
            delete model.collection;
          model.off('all', this._onModelEvent, this);
        },
        _onModelEvent: function(event, model, collection, options) {
          if ((event === 'add' || event === 'remove') && collection !== this)
            return;
          if (event === 'destroy')
            this.remove(model, options);
          if (event === 'change') {
            var prevId = this.modelId(model.previousAttributes());
            var id = this.modelId(model.attributes);
            if (prevId !== id) {
              if (prevId != null)
                delete this._byId[prevId];
              if (id != null)
                this._byId[id] = model;
            }
          }
          this.trigger.apply(this, arguments);
        }
      });
      var collectionMethods = {
        forEach: 3,
        each: 3,
        map: 3,
        collect: 3,
        reduce: 4,
        foldl: 4,
        inject: 4,
        reduceRight: 4,
        foldr: 4,
        find: 3,
        detect: 3,
        filter: 3,
        select: 3,
        reject: 3,
        every: 3,
        all: 3,
        some: 3,
        any: 3,
        include: 3,
        includes: 3,
        contains: 3,
        invoke: 0,
        max: 3,
        min: 3,
        toArray: 1,
        size: 1,
        first: 3,
        head: 3,
        take: 3,
        initial: 3,
        rest: 3,
        tail: 3,
        drop: 3,
        last: 3,
        without: 0,
        difference: 0,
        indexOf: 3,
        shuffle: 1,
        lastIndexOf: 3,
        isEmpty: 1,
        chain: 1,
        sample: 3,
        partition: 3,
        groupBy: 3,
        countBy: 3,
        sortBy: 3,
        indexBy: 3
      };
      addUnderscoreMethods(Collection, collectionMethods, 'models');
      var View = Backbone.View = function(options) {
        this.cid = _.uniqueId('view');
        _.extend(this, _.pick(options, viewOptions));
        this._ensureElement();
        this.initialize.apply(this, arguments);
      };
      var delegateEventSplitter = /^(\S+)\s*(.*)$/;
      var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
      _.extend(View.prototype, Events, {
        tagName: 'div',
        $: function(selector) {
          return this.$el.find(selector);
        },
        initialize: function() {},
        render: function() {
          return this;
        },
        remove: function() {
          this._removeElement();
          this.stopListening();
          return this;
        },
        _removeElement: function() {
          this.$el.remove();
        },
        setElement: function(element) {
          this.undelegateEvents();
          this._setElement(element);
          this.delegateEvents();
          return this;
        },
        _setElement: function(el) {
          this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
          this.el = this.$el[0];
        },
        delegateEvents: function(events) {
          events || (events = _.result(this, 'events'));
          if (!events)
            return this;
          this.undelegateEvents();
          for (var key in events) {
            var method = events[key];
            if (!_.isFunction(method))
              method = this[method];
            if (!method)
              continue;
            var match = key.match(delegateEventSplitter);
            this.delegate(match[1], match[2], _.bind(method, this));
          }
          return this;
        },
        delegate: function(eventName, selector, listener) {
          this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
          return this;
        },
        undelegateEvents: function() {
          if (this.$el)
            this.$el.off('.delegateEvents' + this.cid);
          return this;
        },
        undelegate: function(eventName, selector, listener) {
          this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
          return this;
        },
        _createElement: function(tagName) {
          return document.createElement(tagName);
        },
        _ensureElement: function() {
          if (!this.el) {
            var attrs = _.extend({}, _.result(this, 'attributes'));
            if (this.id)
              attrs.id = _.result(this, 'id');
            if (this.className)
              attrs['class'] = _.result(this, 'className');
            this.setElement(this._createElement(_.result(this, 'tagName')));
            this._setAttributes(attrs);
          } else {
            this.setElement(_.result(this, 'el'));
          }
        },
        _setAttributes: function(attributes) {
          this.$el.attr(attributes);
        }
      });
      Backbone.sync = function(method, model, options) {
        var type = methodMap[method];
        _.defaults(options || (options = {}), {
          emulateHTTP: Backbone.emulateHTTP,
          emulateJSON: Backbone.emulateJSON
        });
        var params = {
          type: type,
          dataType: 'json'
        };
        if (!options.url) {
          params.url = _.result(model, 'url') || urlError();
        }
        if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
          params.contentType = 'application/json';
          params.data = JSON.stringify(options.attrs || model.toJSON(options));
        }
        if (options.emulateJSON) {
          params.contentType = 'application/x-www-form-urlencoded';
          params.data = params.data ? {model: params.data} : {};
        }
        if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
          params.type = 'POST';
          if (options.emulateJSON)
            params.data._method = type;
          var beforeSend = options.beforeSend;
          options.beforeSend = function(xhr) {
            xhr.setRequestHeader('X-HTTP-Method-Override', type);
            if (beforeSend)
              return beforeSend.apply(this, arguments);
          };
        }
        if (params.type !== 'GET' && !options.emulateJSON) {
          params.processData = false;
        }
        var error = options.error;
        options.error = function(xhr, textStatus, errorThrown) {
          options.textStatus = textStatus;
          options.errorThrown = errorThrown;
          if (error)
            error.call(options.context, xhr, textStatus, errorThrown);
        };
        var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
        model.trigger('request', model, xhr, options);
        return xhr;
      };
      var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'patch': 'PATCH',
        'delete': 'DELETE',
        'read': 'GET'
      };
      Backbone.ajax = function() {
        return Backbone.$.ajax.apply(Backbone.$, arguments);
      };
      var Router = Backbone.Router = function(options) {
        options || (options = {});
        if (options.routes)
          this.routes = options.routes;
        this._bindRoutes();
        this.initialize.apply(this, arguments);
      };
      var optionalParam = /\((.*?)\)/g;
      var namedParam = /(\(\?)?:\w+/g;
      var splatParam = /\*\w+/g;
      var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
      _.extend(Router.prototype, Events, {
        initialize: function() {},
        route: function(route, name, callback) {
          if (!_.isRegExp(route))
            route = this._routeToRegExp(route);
          if (_.isFunction(name)) {
            callback = name;
            name = '';
          }
          if (!callback)
            callback = this[name];
          var router = this;
          Backbone.history.route(route, function(fragment) {
            var args = router._extractParameters(route, fragment);
            if (router.execute(callback, args, name) !== false) {
              router.trigger.apply(router, ['route:' + name].concat(args));
              router.trigger('route', name, args);
              Backbone.history.trigger('route', router, name, args);
            }
          });
          return this;
        },
        execute: function(callback, args, name) {
          if (callback)
            callback.apply(this, args);
        },
        navigate: function(fragment, options) {
          Backbone.history.navigate(fragment, options);
          return this;
        },
        _bindRoutes: function() {
          if (!this.routes)
            return;
          this.routes = _.result(this, 'routes');
          var route,
              routes = _.keys(this.routes);
          while ((route = routes.pop()) != null) {
            this.route(route, this.routes[route]);
          }
        },
        _routeToRegExp: function(route) {
          route = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function(match, optional) {
            return optional ? match : '([^/?]+)';
          }).replace(splatParam, '([^?]*?)');
          return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
        },
        _extractParameters: function(route, fragment) {
          var params = route.exec(fragment).slice(1);
          return _.map(params, function(param, i) {
            if (i === params.length - 1)
              return param || null;
            return param ? decodeURIComponent(param) : null;
          });
        }
      });
      var History = Backbone.History = function() {
        this.handlers = [];
        this.checkUrl = _.bind(this.checkUrl, this);
        if (typeof window !== 'undefined') {
          this.location = window.location;
          this.history = window.history;
        }
      };
      var routeStripper = /^[#\/]|\s+$/g;
      var rootStripper = /^\/+|\/+$/g;
      var pathStripper = /#.*$/;
      History.started = false;
      _.extend(History.prototype, Events, {
        interval: 50,
        atRoot: function() {
          var path = this.location.pathname.replace(/[^\/]$/, '$&/');
          return path === this.root && !this.getSearch();
        },
        matchRoot: function() {
          var path = this.decodeFragment(this.location.pathname);
          var root = path.slice(0, this.root.length - 1) + '/';
          return root === this.root;
        },
        decodeFragment: function(fragment) {
          return decodeURI(fragment.replace(/%25/g, '%2525'));
        },
        getSearch: function() {
          var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
          return match ? match[0] : '';
        },
        getHash: function(window) {
          var match = (window || this).location.href.match(/#(.*)$/);
          return match ? match[1] : '';
        },
        getPath: function() {
          var path = this.decodeFragment(this.location.pathname + this.getSearch()).slice(this.root.length - 1);
          return path.charAt(0) === '/' ? path.slice(1) : path;
        },
        getFragment: function(fragment) {
          if (fragment == null) {
            if (this._usePushState || !this._wantsHashChange) {
              fragment = this.getPath();
            } else {
              fragment = this.getHash();
            }
          }
          return fragment.replace(routeStripper, '');
        },
        start: function(options) {
          if (History.started)
            throw new Error('Backbone.history has already been started');
          History.started = true;
          this.options = _.extend({root: '/'}, this.options, options);
          this.root = this.options.root;
          this._wantsHashChange = this.options.hashChange !== false;
          this._hasHashChange = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
          this._useHashChange = this._wantsHashChange && this._hasHashChange;
          this._wantsPushState = !!this.options.pushState;
          this._hasPushState = !!(this.history && this.history.pushState);
          this._usePushState = this._wantsPushState && this._hasPushState;
          this.fragment = this.getFragment();
          this.root = ('/' + this.root + '/').replace(rootStripper, '/');
          if (this._wantsHashChange && this._wantsPushState) {
            if (!this._hasPushState && !this.atRoot()) {
              var root = this.root.slice(0, -1) || '/';
              this.location.replace(root + '#' + this.getPath());
              return true;
            } else if (this._hasPushState && this.atRoot()) {
              this.navigate(this.getHash(), {replace: true});
            }
          }
          if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
            this.iframe = document.createElement('iframe');
            this.iframe.src = 'javascript:0';
            this.iframe.style.display = 'none';
            this.iframe.tabIndex = -1;
            var body = document.body;
            var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
            iWindow.document.open();
            iWindow.document.close();
            iWindow.location.hash = '#' + this.fragment;
          }
          var addEventListener = window.addEventListener || function(eventName, listener) {
            return attachEvent('on' + eventName, listener);
          };
          if (this._usePushState) {
            addEventListener('popstate', this.checkUrl, false);
          } else if (this._useHashChange && !this.iframe) {
            addEventListener('hashchange', this.checkUrl, false);
          } else if (this._wantsHashChange) {
            this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
          }
          if (!this.options.silent)
            return this.loadUrl();
        },
        stop: function() {
          var removeEventListener = window.removeEventListener || function(eventName, listener) {
            return detachEvent('on' + eventName, listener);
          };
          if (this._usePushState) {
            removeEventListener('popstate', this.checkUrl, false);
          } else if (this._useHashChange && !this.iframe) {
            removeEventListener('hashchange', this.checkUrl, false);
          }
          if (this.iframe) {
            document.body.removeChild(this.iframe);
            this.iframe = null;
          }
          if (this._checkUrlInterval)
            clearInterval(this._checkUrlInterval);
          History.started = false;
        },
        route: function(route, callback) {
          this.handlers.unshift({
            route: route,
            callback: callback
          });
        },
        checkUrl: function(e) {
          var current = this.getFragment();
          if (current === this.fragment && this.iframe) {
            current = this.getHash(this.iframe.contentWindow);
          }
          if (current === this.fragment)
            return false;
          if (this.iframe)
            this.navigate(current);
          this.loadUrl();
        },
        loadUrl: function(fragment) {
          if (!this.matchRoot())
            return false;
          fragment = this.fragment = this.getFragment(fragment);
          return _.some(this.handlers, function(handler) {
            if (handler.route.test(fragment)) {
              handler.callback(fragment);
              return true;
            }
          });
        },
        navigate: function(fragment, options) {
          if (!History.started)
            return false;
          if (!options || options === true)
            options = {trigger: !!options};
          fragment = this.getFragment(fragment || '');
          var root = this.root;
          if (fragment === '' || fragment.charAt(0) === '?') {
            root = root.slice(0, -1) || '/';
          }
          var url = root + fragment;
          fragment = this.decodeFragment(fragment.replace(pathStripper, ''));
          if (this.fragment === fragment)
            return;
          this.fragment = fragment;
          if (this._usePushState) {
            this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);
          } else if (this._wantsHashChange) {
            this._updateHash(this.location, fragment, options.replace);
            if (this.iframe && (fragment !== this.getHash(this.iframe.contentWindow))) {
              var iWindow = this.iframe.contentWindow;
              if (!options.replace) {
                iWindow.document.open();
                iWindow.document.close();
              }
              this._updateHash(iWindow.location, fragment, options.replace);
            }
          } else {
            return this.location.assign(url);
          }
          if (options.trigger)
            return this.loadUrl(fragment);
        },
        _updateHash: function(location, fragment, replace) {
          if (replace) {
            var href = location.href.replace(/(javascript:|#).*$/, '');
            location.replace(href + '#' + fragment);
          } else {
            location.hash = '#' + fragment;
          }
        }
      });
      Backbone.history = new History;
      var extend = function(protoProps, staticProps) {
        var parent = this;
        var child;
        if (protoProps && _.has(protoProps, 'constructor')) {
          child = protoProps.constructor;
        } else {
          child = function() {
            return parent.apply(this, arguments);
          };
        }
        _.extend(child, parent, staticProps);
        var Surrogate = function() {
          this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;
        if (protoProps)
          _.extend(child.prototype, protoProps);
        child.__super__ = parent.prototype;
        return child;
      };
      Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;
      var urlError = function() {
        throw new Error('A "url" property or function must be specified');
      };
      var wrapError = function(model, options) {
        var error = options.error;
        options.error = function(resp) {
          if (error)
            error.call(options.context, model, resp, options);
          model.trigger('error', model, resp, options);
        };
      };
      return Backbone;
    }));
  })($__require('33'));
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4", ["36"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('36');
  global.define = __define;
  return module.exports;
});

$__System.register("1", ["4", "2f"], function($__export) {
  "use strict";
  var __moduleName = "1";
  var Backbone,
      SurveyRouter;
  return {
    setters: [function($__m) {
      Backbone = $__m.default;
    }, function($__m) {
      SurveyRouter = $__m.SurveyRouter;
    }],
    execute: function() {
      $(function() {
        new SurveyRouter();
        Backbone.history.start();
      });
    }
  };
});

$__System.register('app/styles/app.css!github:systemjs/plugin-css@0.1.20', [], false, function() {});
(function(c){if (typeof document == 'undefined') return; var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
("#container,body,html{height:100%;width:100%;overflow:hidden}body{padding-top:60px;background-color:#e4e1da}.navbar-inverse{background-image:linear-gradient(to bottom,#2F4820 0,#2F4820 100%)}.theme-showcase .navbar .container{width:auto}.mobile{width:80%;height:800px;background-color:#FFF;-webkit-border-radius:20px;-moz-border-radius:20px;border-radius:20px;padding:24px 20px 0 20px;float:none;margin:0 auto}#myNav{position:fixed}.mobile-content{margin-top:60px;padding:25px;height:80%}.mobile-content{overflow-y:scroll}.mobile-content fieldset{border:2px solid #000;border-style:solid;padding:10px;position:relative}.mobile-content legend{width:auto}.mobile-content label{width:100%;font-size:10px;color:#B7B7B7}.fieldcontain .fieldButtons{position:absolute;right:10px;top:0}#dragme{position:absolute;padding-left:0}#dragme li{list-style-type:none}.menu-icon{width:70px;height:70px;zoom:.5;padding:5px;-moz-transform:scale(.5);-moz-transform-origin:0 0}.icon-text{background-image:url(app/styles/images/menu-icon.png);background-position:-235px 15px}.icon-range{background-image:url(app/styles/images/menu-icon.png);background-position:-230px -80px}.icon-textarea{background-image:url(app/styles/images/menu-icon.png);background-position:-235px -185px}.icon-checkbox{background-image:url(app/styles/images/menu-icon.png);background-position:-235px -285px}.icon-radio{background-image:url(app/styles/images/menu-icon.png);background-position:-235px -385px}.icon-select{background-image:url(app/styles/images/menu-icon.png);background-position:-235px -485px}.icon-image{background-image:url(app/styles/images/menu-icon.png);background-position:-235px -585px}.icon-audio{background-image:url(app/styles/images/menu-icon.png);background-position:-235px -805px}.icon-image-los{background-image:url(app/styles/images/menu-icon.png);background-position:-227px -696px}.icon-warning{background-image:url(app/styles/images/menu-icon.png);background-position:-235px -905px}.icon-help{background-image:url(app/styles/images/menu-icon.png);background-position:-235px -1005px}.icon-dtree{background-image:url(app/styles/images/menu-icon.png);background-position:-235px -1105px}#header{height:50px}#content{height:100%;width:100%;overflow:hidden}.btn-file{position:relative;overflow:hidden}.btn-file input[type=file]{position:absolute;top:0;right:0;min-width:100%;min-height:100%;font-size:100px;text-align:right;filter:alpha(opacity=0);opacity:0;outline:0;background:#fff;cursor:inherit;display:block}#loader{position:absolute;top:50%;left:50%;z-index:999999;visibility:hidden}#relate-modal select{width:100%}#map-parent{min-height:100%;height:300px;width:300px;min-width:100%;position:relative}input[type=text]{width:100%}#sidebar{width:240px;height:100%;max-width:100%;float:left;-webkit-transition:all .7s ease-out;-moz-transition:all .7s ease-out;transition:all .7s ease-out;box-shadow:0 10px 10px rgba(0,0,0,.5);background-color:#fff}#map,#mapLayer{width:auto;height:100%;box-shadow:0 0 10px rgba(0,0,0,.5)}#showHidePanel{position:absolute;left:10px;top:40px;z-index:1000;width:50px}");
})
(function(factory) {
  factory();
});
//# sourceMappingURL=main.js.map