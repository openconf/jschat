/*
* JSChat v0.0.1
* @Eldar Djafarov <djkojb@gmail.com>
* The client part of JSChat project.
* MIT
* 19-12-2013
*/


/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("edjafarov-socker/socker.client.js", function(exports, require, module){
;(function(){
  
var cbStack = {};

//socker-client
var sockerClient = function(socket){
  socket.addEventListener('message', function(data){
    try{
      data = JSON.parse(data);
    }catch(e){
      //throw new Error("data is not an object " + data);
      //ignore?
    }
    if(data.__cbid){
      var callback = cbStack[data.__cbid];
      if(!callback) throw new Error("cbid " + data.__cbid + "is not available");
      if(data.type === "ERROR"){
        callback.call(this, data.__raw);
      } else {
        callback.call(this, null, data.__raw, data.type);
      }
    }

  });
  socket.serve = function(path, data, callback){
    if(typeOfArgument(data) === "[object Function]"){
      callback = data;
      if(typeOfArgument(path) === "[object String]"){
        data = {};
      }
    }
    if(typeOfArgument(path) === "[object Object]") {
      data = path;
    }
    var packet = packetBuild(path, data);
    cbStack[packet.__cbid] = callback;
    socket.send(JSON.stringify(packet));
  }
  return socket;
}

function packetBuild(path, data){
  var clone = JSON.parse(JSON.stringify(data));
  clone.path = path;
  clone.__cbid = Math.ceil(Math.random()*Math.pow(10,16));
  return clone;
}

function typeOfArgument(arg){
  return Object.prototype.toString.call(arg);
}


if (typeof exports == "object") {
  module.exports = sockerClient;
} else if (typeof define == "function" && define.amd) {
  define(function(){ return sockerClient; });
} else {
  this["sockerClient"] = sockerClient;
}

})();

});
require.register("edjafarov-underscore/index.js", function(exports, require, module){
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the 
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

});
require.register("edjafarov-bbsocker.sync/bbsocker.sync.js", function(exports, require, module){
var _ = require('underscore');

module.exports = function(bb){
  bb.sync = function(method, model, options){
    var type = methodMap[method] || method.toUpperCase();
    options = options || {};
    params = {type : type};
    
    if(!options.url){
      params.url = _.result(model, 'url');
    }
    
    var data = _.extend(params, options);
    
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      var modelData = options.attrs || model;
      return bb.socket.serve(data.type + " " + data.url, modelData, function(err, response){
        if(err){
          return data.error(err);
        }
        data.success && data.success(response);
      });
    }
    
    if(options.attrs){
      bb.socket.serve(data.type + " " + data.url, options.attrs, function(err, response){
        if(err){
          return data.error(err);
        }
        data.success && data.success(response);
      });
    }
    
    bb.socket.serve(data.type + " " + data.url,  function(err, response){
      if(err){
        return data.error(err);
      }
      data.success && data.success(response);
    });
    
    model.trigger('request', model, bb.socket, options);
  }
  var methodMap = {
    'create':'CREATE',
    'update':'UPDATE',
    'patch':'PATCH',
    'delete':'DELETE',
    'read':'READ'
  };
  bb.ajax = null;
}
});
require.register("jashkenas-underscore/underscore.js", function(exports, require, module){
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  //use the faster Date.now if available.
  var getTime = (Date.now || function() {
    return new Date().getTime();
  });

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = value == null ? _.identity : lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : getTime();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = getTime();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = getTime();
      var later = function() {
        var last = getTime() - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-global/index.js", function(exports, require, module){

/**
 * Returns `this`. Execute this without a "context" (i.e. without it being
 * attached to an object of the left-hand side), and `this` points to the
 * "global" scope of the current JS execution.
 */

module.exports = (function () { return this; })();

});
require.register("component-has-cors/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var global = require('global');

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

module.exports = 'XMLHttpRequest' in global &&
  'withCredentials' in new global.XMLHttpRequest();

});
require.register("component-ws/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var global = require('global');

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

});
require.register("LearnBoost-engine.io-protocol/lib/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var keys = require('./keys');

/**
 * Current protocol version.
 */
exports.protocol = 2;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Encodes a packet.
 *
 *     <packet type id> [ `:` <data> ]
 *
 * Example:
 *
 *     5:hello world
 *     3
 *     4
 *
 * @api private
 */

exports.encodePacket = function (packet) {
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += String(packet.data);
  }

  return '' + encoded;
};

/**
 * Decodes a packet.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data) {
  var type = data.charAt(0);

  if (Number(type) != type || !packetslist[type]) {
    return err;
  }

  if (data.length > 1) {
    return { type: packetslist[type], data: data.substring(1) };
  } else {
    return { type: packetslist[type] };
  }
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets) {
  if (!packets.length) {
    return '0:';
  }

  var encoded = '';
  var message;

  for (var i = 0, l = packets.length; i < l; i++) {
    message = exports.encodePacket(packets[i]);
    encoded += message.length + ':' + message;
  }

  return encoded;
};

/*
 * Decodes data when a payload is maybe expected.
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, callback) {
  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

});
require.register("LearnBoost-engine.io-protocol/lib/keys.js", function(exports, require, module){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

});
require.register("visionmedia-debug/index.js", function(exports, require, module){
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

});
require.register("visionmedia-debug/debug.js", function(exports, require, module){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

});
require.register("learnboost-engine.io-client/lib/index.js", function(exports, require, module){

module.exports = require('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = require('engine.io-parser');

});
require.register("learnboost-engine.io-client/lib/socket.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var util = require('./util')
  , transports = require('./transports')
  , Emitter = require('./emitter')
  , debug = require('debug')('engine.io-client:socket')
  , index = require('indexof')
  , parser = require('engine.io-parser');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Noop function.
 *
 * @api private
 */

function noop () {};

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts){
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if ('object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = util.parseUri(uri);
    opts.host = uri.host;
    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  }

  this.secure = null != opts.secure ? opts.secure :
    (global.location && 'https:' == location.protocol);

  if (opts.host) {
    var pieces = opts.host.split(':');
    opts.hostname = pieces.shift();
    if (pieces.length) opts.port = pieces.pop();
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port ?
       location.port :
       (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' == typeof this.query) this.query = util.qsParse(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = !!opts.timestampRequests;
  this.flashPath = opts.flashPath || '';
  this.transports = opts.transports || ['polling', 'websocket', 'flashsocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.callbackBuffer = [];
  this.policyPort = opts.policyPort || 843;
  this.open();

  Socket.sockets.push(this);
  Socket.sockets.evs.emit('add', this);
};

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Static EventEmitter.
 */

Socket.sockets = [];
Socket.sockets.evs = new Emitter;

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = require('./transport');
Socket.Emitter = require('./emitter');
Socket.transports = require('./transports');
Socket.util = require('./util');
Socket.parser = require('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    flashPath: this.flashPath,
    policyPort: this.policyPort
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */

Socket.prototype.open = function () {
  this.readyState = 'opening';
  var transport = this.createTransport(this.transports[0]);
  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function (transport) {
  var self = this;

  if (this.transport) {
    debug('clearing existing transport');
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
    .on('drain', function () {
      self.onDrain();
    })
    .on('packet', function (packet) {
      self.onPacket(packet);
    })
    .on('error', function (e) {
      self.onError(e);
    })
    .on('close', function () {
      self.onClose('transport close');
    });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 })
    , failed = false
    , self = this;

  transport.once('open', function () {
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' == msg.type && 'probe' == msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' == self.readyState || 'closing' == self.readyState) {
            return;
          }
          debug('changing transport and sending upgrade packet');
          transport.removeListener('error', onerror);
          self.emit('upgrade', transport);
          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('error', err);
      }
    });
  });

  transport.once('error', onerror);
  function onerror(err) {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    transport.close();
    transport = null;

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('error', error);
  };

  transport.open();

  this.once('close', function () {
    if (transport) {
      debug('socket closed prematurely - aborting probe');
      failed = true;
      transport.close();
      transport = null;
    }
  });

  this.once('upgrading', function (to) {
    if (transport && to.name != transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      transport.close();
      transport = null;
    }
  });
};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  this.emit('open');
  this.onopen && this.onopen.call(this);
  this.flush();

  // we check for `readyState` in case an `open`
  // listener alreay closed the socket
  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(util.parseJSON(packet.data));
        break;

      case 'pong':
        this.setPing();
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.emit('error', err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        var event = { data: packet.data };
        event.toString = function () {
          return packet.data;
        };
        this.onmessage && this.onmessage.call(this, event);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' == self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api public
*/

Socket.prototype.ping = function () {
  this.sendPacket('ping');
};

/**
 * Called on `drain` event
 *
 * @api private
 */

 Socket.prototype.onDrain = function() {
  for (var i = 0; i < this.prevBufferLen; i++) {
    if (this.callbackBuffer[i]) {
      this.callbackBuffer[i]();
    }
  }

  this.writeBuffer.splice(0, this.prevBufferLen);
  this.callbackBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (this.writeBuffer.length == 0) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' != this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, fn) {
  this.sendPacket('message', msg, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, fn) {
  var packet = { type: type, data: data };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  this.callbackBuffer.push(fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.onClose('forced close');
    debug('socket closing - telling transport to close');
    this.transport.close();
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  this.emit('error', err);
  this.onerror && this.onerror.call(this, err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // clean buffers in next tick, so developers can still
    // grab the buffers on `close` event
    setTimeout(function() {
      self.writeBuffer = [];
      self.callbackBuffer = [];
      self.prevBufferLen = 0;
    }, 0);

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    var prev = this.readyState;
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit events
    if (prev == 'open') {
      this.emit('close', reason, desc);
      this.onclose && this.onclose.call(this);
    }
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i<j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

});
require.register("learnboost-engine.io-client/lib/transport.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var util = require('./util')
  , parser = require('engine.io-parser')
  , Emitter = require('./emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
};

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' == this.readyState || '' == this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function(packets){
  if ('open' == this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function (data) {
  this.onPacket(parser.decodePacket(data));
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

});
require.register("learnboost-engine.io-client/lib/emitter.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');

/**
 * Module exports.
 */

module.exports = Emitter;

/**
 * Compatibility with `WebSocket#addEventListener`.
 *
 * @api public
 */

Emitter.prototype.addEventListener = Emitter.prototype.on;

/**
 * Compatibility with `WebSocket#removeEventListener`.
 *
 * @api public
 */

Emitter.prototype.removeEventListener = Emitter.prototype.off;

/**
 * Node-compatible `EventEmitter#removeListener`
 *
 * @api public
 */

Emitter.prototype.removeListener = Emitter.prototype.off;

});
require.register("learnboost-engine.io-client/lib/util.js", function(exports, require, module){

var global = require('global');

/**
 * Status of page load.
 */

var pageLoaded = false;

/**
 * Inheritance.
 *
 * @param {Function} ctor a
 * @param {Function} ctor b
 * @api private
 */

exports.inherits = function inherits (a, b) {
  function c () { }
  c.prototype = b.prototype;
  a.prototype = new c;
};

/**
 * Object.keys
 */

exports.keys = Object.keys || function (obj) {
  var ret = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      ret.push(i);
    }
  }

  return ret;
};

/**
 * Adds an event.
 *
 * @api private
 */

exports.on = function (element, event, fn, capture) {
  if (element.attachEvent) {
    element.attachEvent('on' + event, fn);
  } else if (element.addEventListener) {
    element.addEventListener(event, fn, capture);
  }
};

/**
 * Load utility.
 *
 * @api private
 */

exports.load = function (fn) {
  if (global.document && document.readyState === 'complete' || pageLoaded) {
    return fn();
  }

  exports.on(global, 'load', fn, false);
};

/**
 * Change the internal pageLoaded value.
 */

if ('undefined' != typeof window) {
  exports.load(function () {
    pageLoaded = true;
  });
}

/**
 * Defers a function to ensure a spinner is not displayed by the browser.
 *
 * @param {Function} fn
 * @api private
 */

exports.defer = function (fn) {
  if (!exports.ua.webkit || 'undefined' != typeof importScripts) {
    return fn();
  }

  exports.load(function () {
    setTimeout(fn, 100);
  });
};

/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

exports.parseJSON = function (data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};

/**
 * UA / engines detection namespace.
 *
 * @namespace
 */

exports.ua = {};

/**
 * Whether the UA supports CORS for XHR.
 *
 * @api private
 */

exports.ua.hasCORS = require('has-cors');

/**
 * Detect webkit.
 *
 * @api private
 */

exports.ua.webkit = 'undefined' != typeof navigator &&
  /webkit/i.test(navigator.userAgent);

/**
 * Detect gecko.
 *
 * @api private
 */

exports.ua.gecko = 'undefined' != typeof navigator &&
  /gecko/i.test(navigator.userAgent);

/**
 * Detect android;
 */

exports.ua.android = 'undefined' != typeof navigator &&
  /android/i.test(navigator.userAgent);

/**
 * Detect iOS.
 */

exports.ua.ios = 'undefined' != typeof navigator &&
  /^(iPad|iPhone|iPod)$/.test(navigator.platform);
exports.ua.ios6 = exports.ua.ios && /OS 6_/.test(navigator.userAgent);

/**
 * Detect Chrome Frame.
 */

exports.ua.chromeframe = Boolean(global.externalHost);

/**
 * XHR request helper.
 *
 * @param {Boolean} whether we need xdomain
 * @param {Object} opts Optional "options" object
 * @api private
 */

exports.request = function request (xdomain, opts) {
  opts = opts || {};
  opts.xdomain = xdomain;

  try {
    var _XMLHttpRequest = require('xmlhttprequest');
    return new _XMLHttpRequest(opts);
  } catch (e) {}

  if (xdomain && 'undefined' != typeof XDomainRequest && !exports.ua.hasCORS) {
    return new XDomainRequest();
  }

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || exports.ua.hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch(e) { }
  }
};

/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host'
  , 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

exports.parseUri = function (str) {
  var m = re.exec(str || '')
    , uri = {}
    , i = 14;

  while (i--) {
    uri[parts[i]] = m[i] || '';
  }

  return uri;
};

/**
 * Compiles a querystring
 *
 * @param {Object}
 * @api private
 */

exports.qs = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring.
 *
 * @param {String} qs
 * @api private
 */

exports.qsParse = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

});
require.register("learnboost-engine.io-client/lib/transports/index.js", function(exports, require, module){

/**
 * Module dependencies
 */

var XHR = require('./polling-xhr')
  , JSONP = require('./polling-jsonp')
  , websocket = require('./websocket')
  , flashsocket = require('./flashsocket')
  , util = require('../util');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;
exports.flashsocket = flashsocket;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling (opts) {
  var xhr
    , xd = false
    , isXProtocol = false;

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname != location.hostname || port != opts.port;
    isXProtocol = opts.secure != isSSL;
  }

  xhr = util.request(xd, opts);
  /* See #7 at http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx */
  if (isXProtocol && global.XDomainRequest && xhr instanceof global.XDomainRequest) {
    return new JSONP(opts);
  }

  if (xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    return new JSONP(opts);
  }
};

});
require.register("learnboost-engine.io-client/lib/transports/polling.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Transport = require('../transport')
  , util = require('../util')
  , parser = require('engine.io-parser')
  , debug = require('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling(opts){
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

util.inherits(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function(){
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function(onPause){
  var pending = 0;
  var self = this;

  this.readyState = 'pausing';

  function pause(){
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function(){
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function(){
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function(){
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function(data){
  var self = this;
  debug('polling got data %s', data);

  // decode payload
  parser.decodePayload(data, function(packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' == self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' == packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  });

  // if an event did not trigger closing
  if ('closed' != this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' == this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function(){
  var self = this;

  function close(){
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' == this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  this.doWrite(parser.encodePayload(packets), function(){
    self.writable = true;
    self.emit('drain');
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced for IE / android / iOS6 ಠ_ಠ
  if (global.ActiveXObject || util.ua.chromeframe || util.ua.android || util.ua.ios6 ||
      this.timestampRequests) {
    query[this.timestampParam] = +new Date;
  }

  query = util.qs(query);

  // avoid port if default for schema
  if (this.port && (('https' == schema && this.port != 443) ||
     ('http' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

});
require.register("learnboost-engine.io-client/lib/transports/polling-xhr.js", function(exports, require, module){
/**
 * Module requirements.
 */

var Polling = require('./polling')
  , util = require('../util')
  , Emitter = require('../emitter')
  , debug = require('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Obfuscated key for Blue Coat.
 */

var xobject = global[['Active'].concat('Object').join('X')];

/**
 * Empty function
 */

function empty(){}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR(opts){
  Polling.call(this, opts);

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname != global.location.hostname ||
      port != opts.port;
  }
};

/**
 * Inherits from Polling.
 */

util.inherits(XHR, Polling);

/**
 * Opens the socket
 *
 * @api private
 */

XHR.prototype.doOpen = function(){
  var self = this;
  util.defer(function(){
    Polling.prototype.doOpen.call(self);
  });
};

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function(opts){
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.agent = this.agent || false;
  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function(data, fn){
  var req = this.request({ method: 'POST', data: data });
  var self = this;
  req.on('success', fn);
  req.on('error', function(err){
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function(){
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function(data){
    self.onData(data);
  });
  req.on('error', function(err){
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts){
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.async = false !== opts.async;
  this.data = undefined != opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function(){
  var xhr = this.xhr = util.request(this.xd, { agent: this.agent });
  var self = this;

  xhr.open(this.method, this.uri, this.async);

  if ('POST' == this.method) {
    try {
      if (xhr.setRequestHeader) {
        // xmlhttprequest
        xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
      } else {
        // xdomainrequest
        xhr.contentType = 'text/plain';
      }
    } catch (e) {}
  }

  if (this.xd && global.XDomainRequest && xhr instanceof XDomainRequest) {
    xhr.onerror = function(e){
      self.onError(e);
    };
    xhr.onload = function(){
      self.onData(xhr.responseText);
    };
    xhr.onprogress = empty;
  } else {
    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    xhr.onreadystatechange = function(){
      var data;

      try {
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          data = xhr.responseText;
        } else {
          self.onError(xhr.status);
        }
      } catch (e) {
        self.onError(e);
      }

      if (undefined !== data) {
        self.onData(data);
      }
    };
  }

  debug('sending xhr with url %s | data %s', this.uri, this.data);
  try {
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly from the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function() {
      self.onError(e);
    }, 0);
    return;
  }

  if (xobject) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup();
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(){
  if ('undefined' == typeof this.xhr ) {
    return;
  }
  // xmlhttprequest
  this.xhr.onreadystatechange = empty;

  // xdomainrequest
  this.xhr.onload = this.xhr.onerror = empty;

  try {
    this.xhr.abort();
  } catch(e) {}

  if (xobject) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

if (xobject) {
  Request.requestsCount = 0;
  Request.requests = {};

  global.attachEvent('onunload', function(){
    for (var i in Request.requests) {
      if (Request.requests.hasOwnProperty(i)) {
        Request.requests[i].abort();
      }
    }
  });
}

});
require.register("learnboost-engine.io-client/lib/transports/polling-jsonp.js", function(exports, require, module){

/**
 * Module requirements.
 */

var Polling = require('./polling')
  , util = require('../util');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Callbacks count.
 */

var index = 0;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;
};

/**
 * Inherits from Polling.
 */

util.inherits(JSONPPolling, Polling);

/**
 * Opens the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doOpen = function () {
  var self = this;
  util.defer(function () {
    Polling.prototype.doOpen.call(self);
  });
};

/**
 * Closes the socket
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
	var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
	script.onerror = function(e){
		self.onError('jsonp poll error',e);
	}

  var insertAt = document.getElementsByTagName('script')[0];
  insertAt.parentNode.insertBefore(script, insertAt);
  this.script = script;


  if (util.ua.gecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  };

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  };

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch(e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function(){
      if (self.iframe.readyState == 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

});
require.register("learnboost-engine.io-client/lib/transports/websocket.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Transport = require('../transport')
  , WebSocket = require('ws')
  , parser = require('engine.io-parser')
  , util = require('../util')
  , debug = require('debug')('engine.io-client:websocket');

/**
 * Module exports.
 */

module.exports = WS;

/**
 * Global reference.
 */

var global = require('global');

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts){
  Transport.call(this, opts);
};

/**
 * Inherits from Transport.
 */

util.inherits(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function(){
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var self = this;
  var uri = this.uri();
  var protocols = void(0);
  var opts = { agent: this.agent };

  this.socket = new WebSocket(uri, protocols, opts);
  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function() {
  var self = this;

  this.socket.onopen = function(){
    self.onOpen();
  };
  this.socket.onclose = function(){
    self.onClose();
  };
  this.socket.onmessage = function(ev){
    self.onData(ev.data);
  };
  this.socket.onerror = function(e){
    self.onError('websocket error', e);
  };
};

/**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */

if ('undefined' != typeof navigator
  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  WS.prototype.onData = function(data){
    var self = this;
    setTimeout(function(){
      Transport.prototype.onData.call(self, data);
    }, 0);
  };
}

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  for (var i = 0, l = packets.length; i < l; i++) {
    this.socket.send(parser.encodePacket(packets[i]));
  }
  function ondrain() {
    self.writable = true;
    self.emit('drain');
  }
  // fake drain
  // defer to next tick to allow Socket to clear writeBuffer
  setTimeout(ondrain, 0);
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function(){
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function(){
  if (typeof this.socket !== 'undefined') {
    this.socket.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' == schema && this.port != 443)
    || ('ws' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = +new Date;
  }

  query = util.qs(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  return schema + '://' + this.hostname + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function(){
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

});
require.register("learnboost-engine.io-client/lib/transports/flashsocket.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var WS = require('./websocket')
  , util = require('../util')
  , debug = require('debug')('engine.io-client:flashsocket');

/**
 * Module exports.
 */

module.exports = FlashWS;

/**
 * Global reference.
 */

var global = require('global');

/**
 * Obfuscated key for Blue Coat.
 */

var xobject = global[['Active'].concat('Object').join('X')];

/**
 * FlashWS constructor.
 *
 * @api public
 */

function FlashWS (options) {
  WS.call(this, options);
  this.flashPath = options.flashPath;
  this.policyPort = options.policyPort;
};

/**
 * Inherits from WebSocket.
 */

util.inherits(FlashWS, WS);

/**
 * Transport name.
 *
 * @api public
 */

FlashWS.prototype.name = 'flashsocket';

/**
 * Opens the transport.
 *
 * @api public
 */

FlashWS.prototype.doOpen = function () {
  if (!this.check()) {
    // let the probe timeout
    return;
  }

  // instrument websocketjs logging
  function log (type) {
    return function(){
      var str = Array.prototype.join.call(arguments, ' ');
      debug('[websocketjs %s] %s', type, str);
    };
  };

  WEB_SOCKET_LOGGER = { log: log('debug'), error: log('error') };
  WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;
  WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;

  if ('undefined' == typeof WEB_SOCKET_SWF_LOCATION) {
    WEB_SOCKET_SWF_LOCATION = this.flashPath + 'WebSocketMainInsecure.swf';
  }

  // dependencies
  var deps = [this.flashPath + 'web_socket.js'];

  if ('undefined' == typeof swfobject) {
    deps.unshift(this.flashPath + 'swfobject.js');
  }

  var self = this;

  load(deps, function () {
    self.ready(function () {
      WebSocket.__addTask(function () {
        self.socket = new WebSocket(self.uri());
        self.addEventListeners();
      });
    });
  });
};

/**
 * Override to prevent closing uninitialized flashsocket.
 *
 * @api private
 */

FlashWS.prototype.doClose = function () {
  if (!this.socket) return;
  var self = this;
  WebSocket.__addTask(function() {
    WS.prototype.doClose.call(self);
  });
};

/**
 * Writes to the Flash socket.
 *
 * @api private
 */

FlashWS.prototype.write = function() {
  var self = this, args = arguments;
  WebSocket.__addTask(function () {
    WS.prototype.write.apply(self, args);
  });
};

/**
 * Called upon dependencies are loaded.
 *
 * @api private
 */

FlashWS.prototype.ready = function (fn) {
  if (typeof WebSocket == 'undefined' ||
    !('__initialize' in WebSocket) || !swfobject) {
    return;
  }

  if (swfobject.getFlashPlayerVersion().major < 10) {
    return;
  }

  function init () {
    // Only start downloading the swf file when the checked that this browser
    // actually supports it
    if (!FlashWS.loaded) {
      if (843 != self.policyPort) {
        WebSocket.loadFlashPolicyFile('xmlsocket://' + self.hostname + ':' + self.policyPort);
      }

      WebSocket.__initialize();
      FlashWS.loaded = true;
    }

    fn.call(self);
  }

  var self = this;
  if (document.body) {
    return init();
  }

  util.load(init);
};

/**
 * Feature detection for flashsocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

FlashWS.prototype.check = function () {
  if ('undefined' == typeof window) {
    return false;
  }

  if (typeof WebSocket != 'undefined' && !('__initialize' in WebSocket)) {
    return false;
  }

  if (xobject) {
    var control = null;
    try {
      control = new xobject('ShockwaveFlash.ShockwaveFlash');
    } catch (e) { }
    if (control) {
      return true;
    }
  } else {
    for (var i = 0, l = navigator.plugins.length; i < l; i++) {
      for (var j = 0, m = navigator.plugins[i].length; j < m; j++) {
        if (navigator.plugins[i][j].description == 'Shockwave Flash') {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * Lazy loading of scripts.
 * Based on $script by Dustin Diaz - MIT
 */

var scripts = {};

/**
 * Injects a script. Keeps tracked of injected ones.
 *
 * @param {String} path
 * @param {Function} callback
 * @api private
 */

function create (path, fn) {
  if (scripts[path]) return fn();

  var el = document.createElement('script');
  var loaded = false;

  debug('loading "%s"', path);
  el.onload = el.onreadystatechange = function () {
    if (loaded || scripts[path]) return;
    var rs = el.readyState;
    if (!rs || 'loaded' == rs || 'complete' == rs) {
      debug('loaded "%s"', path);
      el.onload = el.onreadystatechange = null;
      loaded = true;
      scripts[path] = true;
      fn();
    }
  };

  el.async = 1;
  el.src = path;

  var head = document.getElementsByTagName('head')[0];
  head.insertBefore(el, head.firstChild);
};

/**
 * Loads scripts and fires a callback.
 *
 * @param {Array} paths
 * @param {Function} callback
 */

function load (arr, fn) {
  function process (i) {
    if (!arr[i]) return fn();
    create(arr[i], function () {
      process(++i);
    });
  };

  process(0);
};

});
require.register("paulmillr-exoskeleton/exoskeleton.js", function(exports, require, module){
/*!
 * Exoskeleton.js 0.5.1
 * (c) 2013 Paul Miller <http://paulmillr.com>
 * Based on Backbone.js
 * (c) 2010-2013 Jeremy Ashkenas, DocumentCloud
 * Exoskeleton may be freely distributed under the MIT license.
 * For all details and documentation: <http://exosjs.com>
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery'], factory);
  } else if (typeof exports === 'object') {
    var _, jquery;
    try {
      _ = require('underscore');
    } catch(e) { }
    try {
      jquery = require('jquery');
    } catch(e) { }

    factory(_, jquery);
  } else {
    factory(this._, this.jQuery || this.Zepto || this.ender || this.$);
  }
})(function(_, $) {
  'use strict';

  // Initial Setup
  // -------------

  // Check whether we are in common.js (e.g. node.js) environment.
  var isCommonJs = (typeof exports === 'object');

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = isCommonJs ? exports : window;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;
  var previousExoskeleton = root.Exoskeleton;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both the browser and the server.
  var Backbone = isCommonJs ?
    exports :
    (root.Exoskeleton = root.Backbone = {});

  // Underscore replacement.
  var utils = Backbone.utils = _ = (_ || {});

  // Hold onto a local reference to `$`. Can be changed at any point.
  Backbone.$ = $;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var toString = ({}).toString;

  // Current version of the library. Keep in sync with `package.json`.
  // Backbone.VERSION = '1.0.0';

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    root.Exoskeleton = previousExoskeleton;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  Backbone.extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && hasOwnProperty.call(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  // Checker for utility methods. Useful for custom builds.
  var utilExists = function(method) {
    return typeof _[method] === 'function';
  };
utils.result = function result(object, property) {
  var value = object ? object[property] : undefined;
  return typeof value === 'function' ? object[property]() : value;
};

utils.defaults = function defaults(obj) {
  slice.call(arguments, 1).forEach(function(item) {
    for (var key in item) if (obj[key] === undefined)
      obj[key] = item[key];
  });
  return obj;
};

utils.extend = function extend(obj) {
  slice.call(arguments, 1).forEach(function(item) {
    for (var key in item) obj[key] = item[key];
  });
  return obj;
};

var htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

utils.escape = function escape(string) {
  return string == null ? '' : String(string).replace(/[&<>"']/g, function(match) {
    return htmlEscapes[match];
  });
};

utils.sortBy = function(obj, value, context) {
  var iterator = typeof value === 'function' ? value : function(obj){ return obj[value]; };
  return obj
    .map(function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    })
    .sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    })
    .map(function(item) {
      return item.value;
    });
};

/** Used to generate unique IDs */
var idCounter = 0;

utils.uniqueId = function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
};

var eq = function(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a == 1 / b;
  // A strict comparison is necessary because `null == undefined`.
  if (a == null || b == null) return a === b;
  // Unwrap any wrapped objects.
  //if (a instanceof _) a = a._wrapped;
  //if (b instanceof _) b = b._wrapped;
  // Compare `[[Class]]` names.
  var className = toString.call(a);
  if (className != toString.call(b)) return false;
  switch (className) {
    // Strings, numbers, dates, and booleans are compared by value.
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return a == String(b);
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
      // other numeric values.
      return a !== +a ? b !== +b : (a === 0 ? 1 / a === 1 / b : a === +b);
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a == +b;
    // RegExps are compared by their source patterns and flags.
    case '[object RegExp]':
      return a.source == b.source &&
             a.global == b.global &&
             a.multiline == b.multiline &&
             a.ignoreCase == b.ignoreCase;
  }
  if (typeof a != 'object' || typeof b != 'object') return false;
  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] == a) return bStack[length] == b;
  }
  // Objects with different constructors are not equivalent, but `Object`s
  // from different frames are.
  var aCtor = a.constructor, bCtor = b.constructor;
  if (aCtor !== bCtor && !(typeof aCtor === 'function' && (aCtor instanceof aCtor) &&
                           typeof bCtor === 'function' && (bCtor instanceof bCtor))) {
    return false;
  }
  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);
  var size = 0, result = true;
  // Recursively compare objects and arrays.
  if (className === '[object Array]') {
    // Compare array lengths to determine if a deep comparison is necessary.
    size = a.length;
    result = size === b.length;
    if (result) {
      // Deep compare the contents, ignoring non-numeric properties.
      while (size--) {
        if (!(result = eq(a[size], b[size], aStack, bStack))) break;
      }
    }
  } else {
    // Deep compare objects.
    for (var key in a) {
      if (hasOwnProperty.call(a, key)) {
        // Count the expected number of properties.
        size++;
        // Deep compare each member.
        if (!(result = hasOwnProperty.call(b, key) && eq(a[key], b[key], aStack, bStack))) break;
      }
    }
    // Ensure that both objects contain the same number of properties.
    if (result) {
      for (key in b) {
        if (hasOwnProperty.call(b, key) && !(size--)) break;
      }
      result = !size;
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();
  return result;
};

// Perform a deep comparison to check if two objects are equal.
utils.isEqual = function(a, b) {
  return eq(a, b, [], []);
};
// Usage:
//   utils.matchesSelector(div, '.something');
utils.matchesSelector = (function() {
  if (typeof document === 'undefined') return;
  // Suffix.
  var sfx = 'MatchesSelector';
  var tag = document.createElement('div');
  var name;
  // Detect the right suffix.
  ['matches', 'webkit' + sfx, 'moz' + sfx, 'ms' + sfx].some(function(item) {
    var valid = (item in tag);
    name = item;
    return valid;
  });
  if (!name) throw new Error('Element#matches is not supported');
  return function(element, selector) {
    return element[name](selector);
  };
})();

// Make AJAX request to the server.
// Usage:
//   var callback = function(error, data) {console.log('Done.', error, data);};
//   ajax({url: 'url', type: 'PATCH', data: 'data'}, callback);
utils.ajax = (function() {
  var xmlRe = /^(?:application|text)\/xml/;
  var jsonRe = /^application\/json/;

  var getData = function(accepts, xhr) {
    if (accepts == null) accepts = xhr.getResponseHeader('content-type');
    if (xmlRe.test(accepts)) {
      return xhr.responseXML;
    } else if (jsonRe.test(accepts)) {
      return JSON.parse(xhr.responseText);
    } else {
      return xhr.responseText;
    }
  };

  var isValid = function(xhr) {
    return (xhr.status >= 200 && xhr.status < 300) ||
      (xhr.status === 304) ||
      (xhr.status === 0 && window.location.protocol === 'file:')
  };

  var end = function(xhr, options, deferred) {
    return function() {
      if (xhr.readyState !== 4) return;

      var status = xhr.status;
      var data = getData(options.headers && options.headers.Accept, xhr);

      // Check for validity.
      if (isValid(xhr)) {
        if (options.success) options.success(data);
        if (deferred) deferred.resolve(data);
      } else {
        var error = new Error('Server responded with a status of ' + status);
        if (options.error) options.error(xhr, status, error);
        if (deferred) deferred.reject(xhr);
      }
    }
  };

  return function(options) {
    if (options == null) throw new Error('You must provide options');
    if (options.type == null) options.type = 'GET';

    var xhr = new XMLHttpRequest();
    var deferred = Backbone.Deferred && Backbone.Deferred();

    if (options.contentType) {
      if (options.headers == null) options.headers = {};
      options.headers['Content-Type'] = options.contentType;
    }
    if (options.credentials) options.withCredentials = true;
    xhr.addEventListener('readystatechange', end(xhr, options, deferred));
    xhr.open(options.type, options.url, true);
    if (options.headers) for (var key in options.headers) {
      xhr.setRequestHeader(key, options.headers[key]);
    }
    if (options.beforeSend) options.beforeSend(xhr);
    xhr.send(options.data);

    return deferred ? deferred.promise : undefined;
  };
})();
// Backbone.Events
// ---------------

// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback
// functions to an event; `trigger`-ing an event fires all callbacks in
// succession.
//
//     var object = {};
//     _.extend(object, Backbone.Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
var Events = Backbone.Events = {

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  on: function(name, callback, context) {
    if (!eventsApi(this, 'on', name, [callback, context]) || !callback)
      return this;
    this._events || (this._events = {});
    var events = this._events[name] || (this._events[name] = []);
    events.push({callback: callback, context: context, ctx: context || this});
    return this;
  },

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, it will be removed.
  once: function(name, callback, context) {
    if (!eventsApi(this, 'once', name, [callback, context]) || !callback)
      return this;
    var self = this;
    var ran;

    var once = function() {
      if (ran) return;
      ran = true;
      self.off(name, once);
      callback.apply(this, arguments);
    };
    once._callback = callback;
    return this.on(name, once, context);
  },

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  off: function(name, callback, context) {
    var retain, ev, events, names, i, l, j, k;
    if (!this._events || !eventsApi(this, 'off', name, [callback, context]))
      return this;
    if (!name && !callback && !context) {
      this._events = undefined;
      return this;
    }

    names = name ? [name] : Object.keys(this._events);
    for (i = 0, l = names.length; i < l; i++) {
      name = names[i];
      if (events = this._events[name]) {
        this._events[name] = retain = [];
        if (callback || context) {
          for (j = 0, k = events.length; j < k; j++) {
            ev = events[j];
            if ((callback && callback !== ev.callback &&
                callback !== ev.callback._callback) ||
                (context && context !== ev.context)) {
              retain.push(ev);
            }
          }
        }
        if (!retain.length) delete this._events[name];
      }
    }

    return this;
  },

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  trigger: function(name) {
    if (!this._events) return this;
    var args = slice.call(arguments, 1);
    if (!eventsApi(this, 'trigger', name, args)) return this;
    var events = this._events[name];
    var allEvents = this._events.all;
    if (events) triggerEvents(events, args);
    if (allEvents) triggerEvents(allEvents, arguments);
    return this;
  },

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  stopListening: function(obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;
    var remove = !name && !callback;
    if (!callback && typeof name === 'object') callback = this;
    if (obj) (listeningTo = {})[obj._listenId] = obj;
    for (var id in listeningTo) {
      obj = listeningTo[id];
      obj.off(name, callback, this);
      if (remove || !Object.keys(obj._events).length) {
        delete this._listeningTo[id];
      }
    }
    return this;
  }

};

// Regular expression used to split event strings.
var eventSplitter = /\s+/;

// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
var eventsApi = function(obj, action, name, rest) {
  if (!name) return true;
  var arr;

  // Handle event maps.
  if (typeof name === 'object') {
    for (var key in name) {
      arr = [key, name[key]];
      push.apply(arr, rest);
      obj[action].apply(obj, arr);
    }
    return false;
  }

  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      arr = [names[i]];
      push.apply(arr, rest);
      obj[action].apply(obj, arr);
    }
    return false;
  }

  return true;
};

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy (most internal
// Backbone events have 3 arguments).
var triggerEvents = function(events, args) {
  var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
  switch (args.length) {
    case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
    case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
    case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
    case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
    default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
  }
};

var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
Object.keys(listenMethods).forEach(function(method) {
  var implementation = listenMethods[method];
  Events[method] = function(obj, name, callback) {
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    listeningTo[id] = obj;
    if (!callback && typeof name === 'object') callback = this;
    obj[implementation](name, callback, this);
    return this;
  };
});

// Aliases for backwards compatibility.
Events.bind   = Events.on;
Events.unbind = Events.off;
// Backbone.Model
// --------------

// Backbone **Models** are the basic data object in the framework --
// frequently representing a row in a table in a database on your server.
// A discrete chunk of data and a bunch of useful, related methods for
// performing computations and transformations on that data.

// Create a new model with the specified attributes. A client id (`cid`)
// is automatically generated and assigned for you.
var Model = Backbone.Model = function(attributes, options) {
  var attrs = attributes || {};
  options || (options = {});
  this.cid = _.uniqueId('c');
  this.attributes = Object.create(null);
  if (options.collection) this.collection = options.collection;
  if (options.parse) attrs = this.parse(attrs, options) || {};
  attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
  this.set(attrs, options);
  this.changed = Object.create(null);
  this.initialize.apply(this, arguments);
};

// Attach all inheritable methods to the Model prototype.
_.extend(Model.prototype, Events, {

  // A hash of attributes whose current and previous value differ.
  changed: null,

  // The value returned during the last failed validation.
  validationError: null,

  // The default name for the JSON `id` attribute is `"id"`. MongoDB and
  // CouchDB users may want to set this to `"_id"`.
  idAttribute: 'id',

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function(){},

  // Return a copy of the model's `attributes` object.
  toJSON: function(options) {
    return _.extend(Object.create(null), this.attributes);
  },

  // Proxy `Backbone.sync` by default -- but override this if you need
  // custom syncing semantics for *this* particular model.
  sync: function() {
    return Backbone.sync.apply(this, arguments);
  },

  // Get the value of an attribute.
  get: function(attr) {
    return this.attributes[attr];
  },

  // Get the HTML-escaped value of an attribute.
  escape: function(attr) {
    return _.escape(this.get(attr));
  },

  // Returns `true` if the attribute contains a value that is not null
  // or undefined.
  has: function(attr) {
    return this.get(attr) != null;
  },

  // Set a hash of model attributes on the object, firing `"change"`. This is
  // the core primitive operation of a model, updating the data and notifying
  // anyone who needs to know about the change in state. The heart of the beast.
  set: function(key, val, options) {
    var attr, attrs, unset, changes, silent, changing, prev, current;
    if (key == null) return this;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options || (options = {});

    // Run validation.
    if (!this._validate(attrs, options)) return false;

    // Extract attributes and options.
    unset           = options.unset;
    silent          = options.silent;
    changes         = [];
    changing        = this._changing;
    this._changing  = true;

    if (!changing) {
      this._previousAttributes = _.extend(Object.create(null), this.attributes);
      this.changed = {};
    }
    current = this.attributes, prev = this._previousAttributes;

    // Check for changes of `id`.
    if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

    // For each `set` attribute, update or delete the current value.
    for (attr in attrs) {
      val = attrs[attr];
      if (!_.isEqual(current[attr], val)) changes.push(attr);
      if (!_.isEqual(prev[attr], val)) {
        this.changed[attr] = val;
      } else {
        delete this.changed[attr];
      }
      unset ? delete current[attr] : current[attr] = val;
    }

    // Trigger all relevant attribute changes.
    if (!silent) {
      if (changes.length) this._pending = true;
      for (var i = 0, l = changes.length; i < l; i++) {
        this.trigger('change:' + changes[i], this, current[changes[i]], options);
      }
    }

    // You might be wondering why there's a `while` loop here. Changes can
    // be recursively nested within `"change"` events.
    if (changing) return this;
    if (!silent) {
      while (this._pending) {
        this._pending = false;
        this.trigger('change', this, options);
      }
    }
    this._pending = false;
    this._changing = false;
    return this;
  },

  // Remove an attribute from the model, firing `"change"`. `unset` is a noop
  // if the attribute doesn't exist.
  unset: function(attr, options) {
    return this.set(attr, void 0, _.extend({}, options, {unset: true}));
  },

  // Clear all attributes on the model, firing `"change"`.
  clear: function(options) {
    var attrs = {};
    for (var key in this.attributes) attrs[key] = void 0;
    return this.set(attrs, _.extend({}, options, {unset: true}));
  },

  // Determine if the model has changed since the last `"change"` event.
  // If you specify an attribute name, determine if that attribute has changed.
  hasChanged: function(attr) {
    if (attr == null) return !!Object.keys(this.changed).length;
    return hasOwnProperty.call(this.changed, attr);
  },

  // Return an object containing all the attributes that have changed, or
  // false if there are no changed attributes. Useful for determining what
  // parts of a view need to be updated and/or what attributes need to be
  // persisted to the server. Unset attributes will be set to undefined.
  // You can also pass an attributes object to diff against the model,
  // determining if there *would be* a change.
  changedAttributes: function(diff) {
    if (!diff) return this.hasChanged() ? _.extend(Object.create(null), this.changed) : false;
    var val, changed = false;
    var old = this._changing ? this._previousAttributes : this.attributes;
    for (var attr in diff) {
      if (_.isEqual(old[attr], (val = diff[attr]))) continue;
      (changed || (changed = {}))[attr] = val;
    }
    return changed;
  },

  // Get the previous value of an attribute, recorded at the time the last
  // `"change"` event was fired.
  previous: function(attr) {
    if (attr == null || !this._previousAttributes) return null;
    return this._previousAttributes[attr];
  },

  // Get all of the attributes of the model at the time of the previous
  // `"change"` event.
  previousAttributes: function() {
    return _.extend(Object.create(null), this._previousAttributes);
  },

  // Fetch the model from the server. If the server's representation of the
  // model differs from its current attributes, they will be overridden,
  // triggering a `"change"` event.
  fetch: function(options) {
    options = options ? _.extend({}, options) : {};
    if (options.parse === void 0) options.parse = true;
    var model = this;
    var success = options.success;
    options.success = function(resp) {
      if (!model.set(model.parse(resp, options), options)) return false;
      if (success) success(model, resp, options);
      model.trigger('sync', model, resp, options);
    };
    wrapError(this, options);
    return this.sync('read', this, options);
  },

  // Set a hash of model attributes, and sync the model to the server.
  // If the server returns an attributes hash that differs, the model's
  // state will be `set` again.
  save: function(key, val, options) {
    var attrs, method, xhr, attributes = this.attributes;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (key == null || typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = _.extend({validate: true}, options);

    // If we're not waiting and attributes exist, save acts as
    // `set(attr).save(null, opts)` with validation. Otherwise, check if
    // the model will be valid when the attributes, if any, are set.
    if (attrs && !options.wait) {
      if (!this.set(attrs, options)) return false;
    } else {
      if (!this._validate(attrs, options)) return false;
    }

    // Set temporary attributes if `{wait: true}`.
    if (attrs && options.wait) {
      this.attributes = _.extend(Object.create(null), attributes, attrs);
    }

    // After a successful server-side save, the client is (optionally)
    // updated with the server-side state.
    if (options.parse === void 0) options.parse = true;
    var model = this;
    var success = options.success;
    options.success = function(resp) {
      // Ensure attributes are restored during synchronous saves.
      model.attributes = attributes;
      var serverAttrs = model.parse(resp, options);
      if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
      if (serverAttrs && typeof serverAttrs === 'object' && !model.set(serverAttrs, options)) {
        return false;
      }
      if (success) success(model, resp, options);
      model.trigger('sync', model, resp, options);
    };
    wrapError(this, options);

    method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
    if (method === 'patch') options.attrs = attrs;
    xhr = this.sync(method, this, options);

    // Restore attributes.
    if (attrs && options.wait) this.attributes = attributes;

    return xhr;
  },

  // Destroy this model on the server if it was already persisted.
  // Optimistically removes the model from its collection, if it has one.
  // If `wait: true` is passed, waits for the server to respond before removal.
  destroy: function(options) {
    options = options ? _.extend({}, options) : {};
    var model = this;
    var success = options.success;

    var destroy = function() {
      model.trigger('destroy', model, model.collection, options);
    };

    options.success = function(resp) {
      if (options.wait || model.isNew()) destroy();
      if (success) success(model, resp, options);
      if (!model.isNew()) model.trigger('sync', model, resp, options);
    };

    if (this.isNew()) {
      options.success();
      return false;
    }
    wrapError(this, options);

    var xhr = this.sync('delete', this, options);
    if (!options.wait) destroy();
    return xhr;
  },

  // Default URL for the model's representation on the server -- if you're
  // using Backbone's restful methods, override this to change the endpoint
  // that will be called.
  url: function() {
    var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
    if (this.isNew()) return base;
    return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
  },

  // **parse** converts a response into the hash of attributes to be `set` on
  // the model. The default implementation is just to pass the response along.
  parse: function(resp, options) {
    return resp;
  },

  // Create a new model with identical attributes to this one.
  clone: function() {
    return new this.constructor(this.attributes);
  },

  // A model is new if it has never been saved to the server, and lacks an id.
  isNew: function() {
    return this.id == null;
  },

  // Check if the model is currently in a valid state.
  isValid: function(options) {
    return this._validate({}, _.extend(options || {}, { validate: true }));
  },

  // Run validation against the next complete set of model attributes,
  // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
  _validate: function(attrs, options) {
    if (!options.validate || !this.validate) return true;
    attrs = _.extend(Object.create(null), this.attributes, attrs);
    var error = this.validationError = this.validate(attrs, options) || null;
    if (!error) return true;
    this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
    return false;
  }

});

if (_.keys) {
  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  modelMethods.filter(utilExists).forEach(function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });
}
// Backbone.Collection
// -------------------

// If models tend to represent a single row of data, a Backbone Collection is
// more analagous to a table full of data ... or a small slice or page of that
// table, or a collection of rows that belong together for a particular reason
// -- all of the messages in this particular folder, all of the documents
// belonging to this particular author, and so on. Collections maintain
// indexes of their models, both in order, and for lookup by `id`.

// Create a new **Collection**, perhaps to contain a specific type of `model`.
// If a `comparator` is specified, the Collection will maintain
// its models in sort order, as they're added and removed.
var Collection = Backbone.Collection = function(models, options) {
  options || (options = {});
  if (options.model) this.model = options.model;
  if (options.comparator !== void 0) this.comparator = options.comparator;
  this._reset();
  this.initialize.apply(this, arguments);
  if (models) this.reset(models, _.extend({silent: true}, options));
};

// Default options for `Collection#set`.
var setOptions = {add: true, remove: true, merge: true};
var addOptions = {add: true, remove: false};

// Define the Collection's inheritable methods.
_.extend(Collection.prototype, Events, {

  // The default model for a collection is just a **Backbone.Model**.
  // This should be overridden in most cases.
  model: typeof Model === 'undefined' ? null : Model,

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function(){},

  // The JSON representation of a Collection is an array of the
  // models' attributes.
  toJSON: function(options) {
    return this.map(function(model){ return model.toJSON(options); });
  },

  // Proxy `Backbone.sync` by default.
  sync: function() {
    return Backbone.sync.apply(this, arguments);
  },

  // Add a model, or list of models to the set.
  add: function(models, options) {
    return this.set(models, _.extend({merge: false}, options, addOptions));
  },

  // Remove a model, or a list of models from the set.
  remove: function(models, options) {
    var singular = !Array.isArray(models);
    models = singular ? [models] : models.slice();
    options || (options = {});
    var i, l, index, model;
    for (i = 0, l = models.length; i < l; i++) {
      model = models[i] = this.get(models[i]);
      if (!model) continue;
      delete this._byId[model.id];
      delete this._byId[model.cid];
      index = this.indexOf(model);
      this.models.splice(index, 1);
      this.length--;
      if (!options.silent) {
        options.index = index;
        model.trigger('remove', model, this, options);
      }
      this._removeReference(model);
    }
    return singular ? models[0] : models;
  },

  // Update a collection by `set`-ing a new list of models, adding new ones,
  // removing models that are no longer present, and merging models that
  // already exist in the collection, as necessary. Similar to **Model#set**,
  // the core operation for updating the data contained by the collection.
  set: function(models, options) {
    options = _.defaults({}, options, setOptions);
    if (options.parse) models = this.parse(models, options);
    var singular = !Array.isArray(models);
    models = singular ? (models ? [models] : []) : models.slice();
    var i, l, id, model, attrs, existing, sort;
    var at = options.at;
    var targetModel = this.model;
    var sortable = this.comparator && (at == null) && options.sort !== false;
    var sortAttr = typeof this.comparator === 'string' ? this.comparator : null;
    var toAdd = [], toRemove = [], modelMap = {};
    var add = options.add, merge = options.merge, remove = options.remove;
    var order = !sortable && add && remove ? [] : false;

    // Turn bare objects into model references, and prevent invalid models
    // from being added.
    for (i = 0, l = models.length; i < l; i++) {
      attrs = models[i];
      if (attrs instanceof Model) {
        id = model = attrs;
      } else {
        id = attrs[targetModel.prototype.idAttribute];
      }

      // If a duplicate is found, prevent it from being added and
      // optionally merge it into the existing model.
      if (existing = this.get(id)) {
        if (remove) modelMap[existing.cid] = true;
        if (merge) {
          attrs = attrs === model ? model.attributes : attrs;
          if (options.parse) attrs = existing.parse(attrs, options);
          existing.set(attrs, options);
          if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
        }
        models[i] = existing;

      // If this is a new, valid model, push it to the `toAdd` list.
      } else if (add) {
        model = models[i] = this._prepareModel(attrs, options);
        if (!model) continue;
        toAdd.push(model);

        // Listen to added models' events, and index models for lookup by
        // `id` and by `cid`.
        model.on('all', this._onModelEvent, this);
        this._byId[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }
      if (order) order.push(existing || model);
    }

    // Remove nonexistent models if appropriate.
    if (remove) {
      for (i = 0, l = this.length; i < l; ++i) {
        if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
      }
      if (toRemove.length) this.remove(toRemove, options);
    }

    // See if sorting is needed, update `length` and splice in new models.
    if (toAdd.length || (order && order.length)) {
      if (sortable) sort = true;
      this.length += toAdd.length;
      if (at != null) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          this.models.splice(at + i, 0, toAdd[i]);
        }
      } else {
        if (order) this.models.length = 0;
        var orderedModels = order || toAdd;
        for (i = 0, l = orderedModels.length; i < l; i++) {
          this.models.push(orderedModels[i]);
        }
      }
    }

    // Silently sort the collection if appropriate.
    if (sort) this.sort({silent: true});

    // Unless silenced, it's time to fire all appropriate add/sort events.
    if (!options.silent) {
      for (i = 0, l = toAdd.length; i < l; i++) {
        (model = toAdd[i]).trigger('add', model, this, options);
      }
      if (sort || (order && order.length)) this.trigger('sort', this, options);
    }

    // Return the added (or merged) model (or models).
    return singular ? models[0] : models;
  },

  // When you have more items than you want to add or remove individually,
  // you can reset the entire set with a new list of models, without firing
  // any granular `add` or `remove` events. Fires `reset` when finished.
  // Useful for bulk operations and optimizations.
  reset: function(models, options) {
    options || (options = {});
    for (var i = 0, l = this.models.length; i < l; i++) {
      this._removeReference(this.models[i]);
    }
    options.previousModels = this.models;
    this._reset();
    models = this.add(models, _.extend({silent: true}, options));
    if (!options.silent) this.trigger('reset', this, options);
    return models;
  },

  // Add a model to the end of the collection.
  push: function(model, options) {
    return this.add(model, _.extend({at: this.length}, options));
  },

  // Remove a model from the end of the collection.
  pop: function(options) {
    var model = this.at(this.length - 1);
    this.remove(model, options);
    return model;
  },

  // Add a model to the beginning of the collection.
  unshift: function(model, options) {
    return this.add(model, _.extend({at: 0}, options));
  },

  // Remove a model from the beginning of the collection.
  shift: function(options) {
    var model = this.at(0);
    this.remove(model, options);
    return model;
  },

  // Slice out a sub-array of models from the collection.
  slice: function() {
    return slice.apply(this.models, arguments);
  },

  // Get a model from the set by id.
  get: function(obj) {
    if (obj == null) return void 0;
    return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
  },

  // Get the model at the given index.
  at: function(index) {
    return this.models[index];
  },

  // Return models with matching attributes. Useful for simple cases of
  // `filter`.
  where: function(attrs, first) {
    if (!attrs || !Object.keys(attrs).length) return first ? void 0 : [];
    return this[first ? 'find' : 'filter'](function(model) {
      for (var key in attrs) {
        if (attrs[key] !== model.get(key)) return false;
      }
      return true;
    });
  },

  // Return the first model with matching attributes. Useful for simple cases
  // of `find`.
  findWhere: function(attrs) {
    return this.where(attrs, true);
  },

  // Force the collection to re-sort itself. You don't need to call this under
  // normal circumstances, as the set will maintain sort order as each item
  // is added.
  sort: function(options) {
    if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
    options || (options = {});

    // Run sort based on type of `comparator`.
    if (typeof this.comparator === 'string' || this.comparator.length === 1) {
      this.models = this.sortBy(this.comparator, this);
    } else {
      this.models.sort(this.comparator.bind(this));
    }

    if (!options.silent) this.trigger('sort', this, options);
    return this;
  },

  // Pluck an attribute from each model in the collection.
  pluck: function(attr) {
    return this.models.map(function(model) {
      return model.get(attr);
    });
  },

  // Fetch the default set of models for this collection, resetting the
  // collection when they arrive. If `reset: true` is passed, the response
  // data will be passed through the `reset` method instead of `set`.
  fetch: function(options) {
    options = options ? _.extend({}, options) : {};
    if (options.parse === void 0) options.parse = true;
    var success = options.success;
    var collection = this;
    options.success = function(resp) {
      var method = options.reset ? 'reset' : 'set';
      collection[method](resp, options);
      if (success) success(collection, resp, options);
      collection.trigger('sync', collection, resp, options);
    };
    wrapError(this, options);
    return this.sync('read', this, options);
  },

  // Create a new instance of a model in this collection. Add the model to the
  // collection immediately, unless `wait: true` is passed, in which case we
  // wait for the server to agree.
  create: function(model, options) {
    options = options ? _.extend({}, options) : {};
    if (!(model = this._prepareModel(model, options))) return false;
    if (!options.wait) this.add(model, options);
    var collection = this;
    var success = options.success;
    options.success = function(model, resp, options) {
      if (options.wait) collection.add(model, options);
      if (success) success(model, resp, options);
    };
    model.save(null, options);
    return model;
  },

  // **parse** converts a response into a list of models to be added to the
  // collection. The default implementation is just to pass it through.
  parse: function(resp, options) {
    return resp;
  },

  // Create a new collection with an identical list of models as this one.
  clone: function() {
    return new this.constructor(this.models);
  },

  // Private method to reset all internal state. Called when the collection
  // is first initialized or reset.
  _reset: function() {
    this.length = 0;
    this.models = [];
    this._byId  = {};
  },

  // Prepare a hash of attributes (or other model) to be added to this
  // collection.
  _prepareModel: function(attrs, options) {
    if (attrs instanceof Collection.prototype.model) {
      if (!attrs.collection) attrs.collection = this;
      return attrs;
    }
    options = options ? _.extend({}, options) : {};
    options.collection = this;
    var model = new this.model(attrs, options);
    if (!model.validationError) return model;
    this.trigger('invalid', this, model.validationError, options);
    return false;
  },

  // Internal method to sever a model's ties to a collection.
  _removeReference: function(model) {
    if (this === model.collection) delete model.collection;
    model.off('all', this._onModelEvent, this);
  },

  // Internal method called every time a model in the set fires an event.
  // Sets need to update their indexes when models change ids. All other
  // events simply proxy through. "add" and "remove" events that originate
  // in other collections are ignored.
  _onModelEvent: function(event, model, collection, options) {
    if ((event === 'add' || event === 'remove') && collection !== this) return;
    if (event === 'destroy') this.remove(model, options);
    if (model && event === 'change:' + model.idAttribute) {
      delete this._byId[model.previous(model.idAttribute)];
      if (model.id != null) this._byId[model.id] = model;
    }
    this.trigger.apply(this, arguments);
  }

});

if (utilExists('each')) {
  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  methods.filter(utilExists).forEach(function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  attributeMethods.filter(utilExists).forEach(function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = typeof value === 'function' ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });
} else {
  ['forEach', 'map', 'filter', 'some', 'every', 'reduce', 'reduceRight',
    'indexOf', 'lastIndexOf'].forEach(function(method) {
    var fn = Array.prototype[method];
    Collection.prototype[method] = function(arg, context) {
      return fn.call(this.models, arg, context);
    };
  });

  // Underscore methods that take a property name as an argument.
  ['sortBy'].forEach(function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = typeof value === 'function' ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });
}
// Backbone.View
// -------------

// Backbone Views are almost more convention than they are actual code. A View
// is simply a JavaScript object that represents a logical chunk of UI in the
// DOM. This might be a single item, an entire list, a sidebar or panel, or
// even the surrounding frame which wraps your whole app. Defining a chunk of
// UI as a **View** allows you to define your DOM events declaratively, without
// having to worry about render order ... and makes it easy for the view to
// react to specific changes in the state of your models.

// Options with special meaning *(e.g. model, collection, id, className)* are
// attached directly to the view.  See `viewOptions` for an exhaustive
// list.

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

// List of view options to be merged as properties.
var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

// Creating a Backbone.View creates its initial element outside of the DOM,
// if an existing element is not provided...
var View = Backbone.View = function(options) {
  this.cid = _.uniqueId('view');
  if (options) Object.keys(options).forEach(function(key) {
    if (viewOptions.indexOf(key) !== -1) this[key] = options[key];
  }, this);
  this._handlers = [];
  this._ensureElement();
  this.initialize.apply(this, arguments);
  this.delegateEvents();
};

// Set up all inheritable **Backbone.View** properties and methods.
_.extend(View.prototype, Events, {

  // The default `tagName` of a View's element is `"div"`.
  tagName: 'div',

  // jQuery delegate for element lookup, scoped to DOM elements within the
  // current view. This should be preferred to global lookups where possible.
  $: function(selector) {
    return Backbone.$ ? this.$el.find(selector) : this.findAll(selector);
  },

  // Exoskeleton-related DOM methods.
  find: function(selector) {
    return this.el.querySelector(selector);
  },

  findAll: function(selector) {
    return slice.call(this.el.querySelectorAll(selector));
  },

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function(){},

  // **render** is the core function that your view should override, in order
  // to populate its element (`this.el`), with the appropriate HTML. The
  // convention is for **render** to always return `this`.
  render: function() {
    return this;
  },

  // Remove this view by taking the element out of the DOM, and removing any
  // applicable Backbone.Events listeners.
  remove: function() {
    if (Backbone.$) {
      this.$el.remove();
    } else if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.stopListening();
    return this;
  },

  // Change the view's element (`this.el` property), including event
  // re-delegation.
  setElement: function(element, delegate) {
    if (Backbone.$) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
    } else {
      if (this.el) this.undelegateEvents();
      var el = (typeof element === 'string') ?
        document.querySelector(element) : element;
      this.el = el;
    }
    if (delegate !== false) this.delegateEvents();
    return this;
  },

  delegate: function(eventName, selector, callback) {
    if (typeof selector === 'function') {
      callback = selector;
      selector = null;
    }

    if (typeof callback !== 'function') {
      throw new TypeError('View#delegate expects callback function');
    }

    var root = this.el;
    var bound = callback.bind(this);
    var handler = selector ? function(event) {
      for (var el = event.target; el && el !== root; el = el.parentNode) {
        if (utils.matchesSelector(el, selector)) {
          // event.currentTarget or event.target are read-only.
          event.delegateTarget = el;
          return bound(event);
        }
      }
    } : bound;

    root.addEventListener(eventName, handler, false);
    this._handlers.push({
      eventName: eventName, selector: selector,
      callback: callback, handler: handler
    });
    return handler;
  },

  undelegate: function(eventName, selector, callback) {
    if (typeof selector === 'function') {
      callback = selector;
      selector = null;
    }

    var root = this.el;
    var handlers = this._handlers;
    var removeListener = function(item) {
      root.removeEventListener(item.eventName, item.handler, false);
    };

    // Remove all handlers.
    if (!eventName && !selector && !callback) {
      handlers.forEach(removeListener);
      this._handlers = [];
    } else {
      // Remove some handlers.
      handlers
        .filter(function(item) {
          return item.eventName === eventName &&
            (callback ? item.callback === callback : true) &&
            (selector ? item.selector === selector : true);
        })
        .forEach(function(item) {
          removeListener(item);
          handlers.splice(handlers.indexOf(item), 1);
        });
    }
  },

  // Set callbacks, where `this.events` is a hash of
  //
  // *{"event selector": "callback"}*
  //
  //     {
  //       'mousedown .title':  'edit',
  //       'click .button':     'save',
  //       'click .open':       function(e) { ... }
  //     }
  //
  // pairs. Callbacks will be bound to the view, with `this` set properly.
  // Uses event delegation for efficiency.
  // Omitting the selector binds the event to `this.el`.
  // This only works for delegate-able events: not `focus`, `blur`, and
  // not `change`, `submit`, and `reset` in Internet Explorer.
  delegateEvents: function(events, keepOld) {
    if (!(events || (events = _.result(this, 'events')))) return this;
    if (!keepOld) this.undelegateEvents();
    for (var key in events) {
      var method = events[key];
      if (typeof method !== 'function') method = this[events[key]];
      // if (!method) continue;

      var match = key.match(delegateEventSplitter);
      var eventName = match[1], selector = match[2];

      if (Backbone.$) {
        eventName += '.delegateEvents' + this.cid;
        method = method.bind(this);
        this.$el.on(eventName, (selector ? selector : null), method);
      } else {
        this.delegate(eventName, selector, method);
      }
    }
    return this;
  },

  // Clears all callbacks previously bound to the view with `delegateEvents`.
  // You usually don't need to use this, but may wish to if you have multiple
  // Backbone views attached to the same DOM element.
  undelegateEvents: function() {
    if (Backbone.$) {
      this.$el.off('.delegateEvents' + this.cid);
    } else {
      this.undelegate();
    }
    return this;
  },

  // Ensure that the View has a DOM element to render into.
  // If `this.el` is a string, pass it through `$()`, take the first
  // matching element, and re-assign it to `el`. Otherwise, create
  // an element from the `id`, `className` and `tagName` properties.
  _ensureElement: function() {
    if (!this.el) {
      var attrs = _.extend({}, _.result(this, 'attributes'));
      if (this.id) attrs.id = _.result(this, 'id');
      if (this.className) attrs.className = _.result(this, 'className');
      if (attrs['class']) attrs.className = attrs['class'];
      var el = _.extend(document.createElement(_.result(this, 'tagName')), attrs);
      this.setElement(el, false);
    } else {
      this.setElement(_.result(this, 'el'), false);
    }
  }

});
// Backbone.sync
// -------------

// Override this function to change the manner in which Backbone persists
// models to the server. You will be passed the type of request, and the
// model in question. By default, makes a RESTful Ajax request
// to the model's `url()`. Some possible customizations could be:
//
// * Use `setTimeout` to batch rapid-fire updates into a single request.
// * Send up the models as XML instead of JSON.
// * Persist models via WebSockets instead of Ajax.
//
// Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
// as `POST`, with a `_method` parameter containing the true HTTP method,
// as well as all requests with the body as `application/x-www-form-urlencoded`
// instead of `application/json` with the model in a param named `model`.
// Useful when interfacing with server-side languages like **PHP** that make
// it difficult to read the body of `PUT` requests.
Backbone.sync = function(method, model, options) {
  var type = methodMap[method];

  // Default options, unless specified.
  _.defaults(options || (options = {}), {
    emulateHTTP: Backbone.emulateHTTP,
    emulateJSON: Backbone.emulateJSON
  });

  // Default JSON-request options.
  var params = {type: type, dataType: 'json'};

  // Ensure that we have a URL.
  if (!options.url) {
    params.url = _.result(model, 'url') || urlError();
  }

  // Ensure that we have the appropriate request data.
  if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.contentType = 'application/json';
    params.data = JSON.stringify(options.attrs || model.toJSON(options));
  }

  // For older servers, emulate JSON by encoding the request into an HTML-form.
  if (options.emulateJSON) {
    params.contentType = 'application/x-www-form-urlencoded';
    params.data = params.data ? {model: params.data} : {};
  }

  // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
  // And an `X-HTTP-Method-Override` header.
  if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
    params.type = 'POST';
    if (options.emulateJSON) params.data._method = type;
    var beforeSend = options.beforeSend;
    options.beforeSend = function(xhr) {
      xhr.setRequestHeader('X-HTTP-Method-Override', type);
      if (beforeSend) return beforeSend.apply(this, arguments);
    };
  }

  // Don't process data on a non-GET request.
  if (params.type !== 'GET' && !options.emulateJSON) {
    params.processData = false;
  }

  // Make the request, allowing the user to override any Ajax options.
  var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
  model.trigger('request', model, xhr, options);
  return xhr;
};

// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
var methodMap = {
  'create': 'POST',
  'update': 'PUT',
  'patch':  'PATCH',
  'delete': 'DELETE',
  'read':   'GET'
};

// Set the default implementation of `Backbone.ajax` to proxy through to `$`.
// Override this if you'd like to use a different library.
Backbone.ajax = Backbone.$ ? function() {
  return Backbone.$.ajax.apply(Backbone.$, arguments);
} : utils.ajax;

if (Backbone.$) Backbone.Deferred = function() {
  return new Backbone.$.Deferred();
};
// Backbone.Router
// ---------------

// Routers map faux-URLs to actions, and fire events when routes are
// matched. Creating a new one sets its `routes` hash, if not set statically.
var Router = Backbone.Router = function(options) {
  options || (options = {});
  if (options.routes) this.routes = options.routes;
  this._bindRoutes();
  this.initialize.apply(this, arguments);
};

// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

var isRegExp = function(value) {
  return value ? (typeof value === 'object' && toString.call(value) === '[object RegExp]') : false;
};

// Set up all inheritable **Backbone.Router** properties and methods.
_.extend(Router.prototype, Events, {

  // Initialize is an empty function by default. Override it with your own
  // initialization logic.
  initialize: function(){},

  // Manually bind a single named route to a callback. For example:
  //
  //     this.route('search/:query/p:num', 'search', function(query, num) {
  //       ...
  //     });
  //
  route: function(route, name, callback) {
    if (!isRegExp(route)) route = this._routeToRegExp(route);
    if (typeof name === 'function') {
      callback = name;
      name = '';
    }
    if (!callback) callback = this[name];
    var router = this;
    Backbone.history.route(route, function(fragment) {
      var args = router._extractParameters(route, fragment);
      callback && callback.apply(router, args);
      router.trigger.apply(router, ['route:' + name].concat(args));
      router.trigger('route', name, args);
      Backbone.history.trigger('route', router, name, args);
    });
    return this;
  },

  // Simple proxy to `Backbone.history` to save a fragment into the history.
  navigate: function(fragment, options) {
    Backbone.history.navigate(fragment, options);
    return this;
  },

  // Bind all defined routes to `Backbone.history`. We have to reverse the
  // order of the routes here to support behavior where the most general
  // routes can be defined at the bottom of the route map.
  _bindRoutes: function() {
    if (!this.routes) return;
    this.routes = _.result(this, 'routes');
    var route, routes = Object.keys(this.routes);
    while ((route = routes.pop()) != null) {
      this.route(route, this.routes[route]);
    }
  },

  // Convert a route string into a regular expression, suitable for matching
  // against the current location hash.
  _routeToRegExp: function(route) {
    route = route.replace(escapeRegExp, '\\$&')
                 .replace(optionalParam, '(?:$1)?')
                 .replace(namedParam, function(match, optional) {
                   return optional ? match : '([^\/]+)';
                 })
                 .replace(splatParam, '(.*?)');
    return new RegExp('^' + route + '$');
  },

  // Given a route, and a URL fragment that it matches, return the array of
  // extracted decoded parameters. Empty or unmatched parameters will be
  // treated as `null` to normalize cross-browser behavior.
  _extractParameters: function(route, fragment) {
    var params = route.exec(fragment).slice(1);
    return params.map(function(param) {
      return param ? decodeURIComponent(param) : null;
    });
  }

});
// Backbone.History
// ----------------

// Handles cross-browser history management, based on either
// [pushState](http://diveintohtml5.info/history.html) and real URLs, or
// [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
// and URL fragments.
var History = Backbone.History = function() {
  this.handlers = [];
  this.checkUrl = this.checkUrl.bind(this);

  // Ensure that `History` can be used outside of the browser.
  if (typeof window !== 'undefined') {
    this.location = window.location;
    this.history = window.history;
  }
};

// Cached regex for stripping a leading hash/slash and trailing space.
var routeStripper = /^[#\/]|\s+$/g;

// Cached regex for stripping leading and trailing slashes.
var rootStripper = /^\/+|\/+$/g;

// Cached regex for removing a trailing slash.
var trailingSlash = /\/$/;

// Cached regex for stripping urls of hash and query.
var pathStripper = /[#].*$/;

// Has the history handling already been started?
History.started = false;

// Set up all inheritable **Backbone.History** properties and methods.
_.extend(History.prototype, Events, {

  // Gets the true hash value. Cannot use location.hash directly due to bug
  // in Firefox where location.hash will always be decoded.
  getHash: function(window) {
    var match = (window || this).location.href.match(/#(.*)$/);
    return match ? match[1] : '';
  },

  // Get the cross-browser normalized URL fragment, either from the URL,
  // the hash, or the override.
  getFragment: function(fragment) {
    if (fragment == null) {
      if (this._wantsPushState || !this._wantsHashChange) {
        // CHANGED: Make fragment include query string.
        fragment = this.location.pathname + this.location.search;
        var root = this.root.replace(trailingSlash, '');
        if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
      } else {
        fragment = this.getHash();
      }
    }
    return fragment.replace(routeStripper, '');
  },

  // Start the hash change handling, returning `true` if the current URL matches
  // an existing route, and `false` otherwise.
  start: function(options) {
    if (History.started) throw new Error("Backbone.history has already been started");
    History.started = true;

    // Figure out the initial configuration.
    // Is pushState desired or should we use hashchange only?
    this.options          = _.extend({root: '/'}, this.options, options);
    this.root             = this.options.root;
    this._wantsHashChange = this.options.hashChange !== false;
    this._wantsPushState  = !!this.options.pushState;
    var fragment          = this.getFragment();

    // Normalize root to always include a leading and trailing slash.
    this.root = ('/' + this.root + '/').replace(rootStripper, '/');

    // Depending on whether we're using pushState or hashes, determine how we
    // check the URL state.
    if (this._wantsPushState) {
      window.addEventListener('popstate', this.checkUrl, false);
    } else if (this._wantsHashChange) {
      window.addEventListener('hashchange', this.checkUrl, false);
    }

    // Determine if we need to change the base url, for a pushState link
    // opened by a non-pushState browser.
    this.fragment = fragment;
    var loc = this.location;
    var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

    // Transition from hashChange to pushState or vice versa if both are
    // requested.
    if (this._wantsHashChange && this._wantsPushState) {
      // If we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      if (atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        // CHANGED: It's no longer needed to add loc.search at the end,
        // as query params have been already included into @fragment
        this.history.replaceState({}, document.title, this.root + this.fragment);
      }

    }

    if (!this.options.silent) return this.loadUrl();
  },

  // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
  // but possibly useful for unit testing Routers.
  stop: function() {
    window.removeEventListener('popstate', this.checkUrl);
    window.removeEventListener('hashchange', this.checkUrl);
    History.started = false;
  },

  // Add a route to be tested when the fragment changes. Routes added later
  // may override previous routes.
  route: function(route, callback) {
    this.handlers.unshift({route: route, callback: callback});
  },

  // Checks the current URL to see if it has changed, and if it has,
  // calls `loadUrl`.
  checkUrl: function() {
    var current = this.getFragment();
    if (current === this.fragment) return false;
    this.loadUrl();
  },

  // Attempt to load the current URL fragment. If a route succeeds with a
  // match, returns `true`. If no defined routes matches the fragment,
  // returns `false`.
  loadUrl: function(fragment) {
    fragment = this.fragment = this.getFragment(fragment);
    return this.handlers.some(function(handler) {
      if (handler.route.test(fragment)) {
        handler.callback(fragment);
        return true;
      }
    });
  },

  // Save a fragment into the hash history, or replace the URL state if the
  // 'replace' option is passed. You are responsible for properly URL-encoding
  // the fragment in advance.
  //
  // The options object can contain `trigger: true` if you wish to have the
  // route callback be fired (not usually desirable), or `replace: true`, if
  // you wish to modify the current URL without adding an entry to the history.
  navigate: function(fragment, options) {
    if (!History.started) return false;
    if (!options || options === true) options = {trigger: !!options};

    var url = this.root + (fragment = this.getFragment(fragment || ''));

    // Strip the fragment of the query and hash for matching.
    fragment = fragment.replace(pathStripper, '');

    if (this.fragment === fragment) return;
    this.fragment = fragment;

    // Don't include a trailing slash on the root.
    if (fragment === '' && url !== '/') url = url.slice(0, -1);

    // If we're using pushState we use it to set the fragment as a real URL.
    if (this._wantsPushState) {
      this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

    // If hash changes haven't been explicitly disabled, update the hash
    // fragment to store history.
    } else if (this._wantsHashChange) {
      this._updateHash(this.location, fragment, options.replace);
    // If you've told us that you explicitly don't want fallback hashchange-
    // based history, then `navigate` becomes a page refresh.
    } else {
      return this.location.assign(url);
    }
    if (options.trigger) return this.loadUrl(fragment);
  },

  // Update the hash location, either replacing the current entry, or adding
  // a new one to the browser history.
  _updateHash: function(location, fragment, replace) {
    if (replace) {
      var href = location.href.replace(/(javascript:|#).*$/, '');
      location.replace(href + '#' + fragment);
    } else {
      // Some browsers require that `hash` contains a leading #.
      location.hash = '#' + fragment;
    }
  }

});
  // !!!
  // Init.
  ['Model', 'Collection', 'Router', 'View', 'History'].forEach(function(name) {
    var item = Backbone[name];
    if (item) item.extend = Backbone.extend;
  });

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Create the default Backbone.history.
  Backbone.history = new History();
  return Backbone;
});

});










require.register("chjj-marked/lib/marked.js", function(exports, require, module){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (cap = this.rules.url.exec(src)) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      out += this.outputLink(cap, link);
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(this.smartypants(cap[0]));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  if (cap[0].charAt(0) !== '!') {
    return this.renderer.link(href, title, this.output(cap[1]));
  } else {
    return this.renderer.image(href, title, escape(cap[1]));
  }
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/--/g, '\u2014')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer() {}

Renderer.prototype.code = function(code, lang) {
  if (!lang) {
    return '<pre><code>'
      + escape(code, true)
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + 'lang-'
    + lang
    + '">'
    + escape(code)
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw, options) {
  return '<h'
    + level
    + '>'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>';
  return out;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth
      );
    }
    case 'code': {
      return this.renderer.code(this.token.text, this.token.lang);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function() {
      var out, err;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    return done();
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  smartypants: false,
  renderer: new Renderer
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

});

require.register("IScroll/iscroll.js", function(exports, require, module){
/*! iScroll v5.0.6 ~ (c) 2008-2013 Matteo Spinelli ~ http://cubiq.org/license */
module.exports = (function (window, document, Math) {
var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function (callback) { window.setTimeout(callback, 1000 / 60); };

var utils = (function () {
	var me = {};

	var _elementStyle = document.createElement('div').style;
	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + 'ransform';
			if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
		}

		return false;
	})();

	function _prefixStyle (style) {
		if ( _vendor === false ) return false;
		if ( _vendor === '' ) return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}

	me.getTime = Date.now || function getTime () { return new Date().getTime(); };

	me.extend = function (target, obj) {
		for ( var i in obj ) {
			target[i] = obj[i];
		}
	};

	me.addEvent = function (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);
	};

	me.removeEvent = function (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	};

	me.momentum = function (current, start, time, lowerMargin, wrapperSize) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration,
			deceleration = 0.0006;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if ( destination < lowerMargin ) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	};

	var _transform = _prefixStyle('transform');

	me.extend(me, {
		hasTransform: _transform !== false,
		hasPerspective: _prefixStyle('perspective') in _elementStyle,
		hasTouch: 'ontouchstart' in window,
		hasPointer: navigator.msPointerEnabled,
		hasTransition: _prefixStyle('transition') in _elementStyle
	});

	me.isAndroidBrowser = /Android/.test(window.navigator.appVersion) && /Version\/\d/.test(window.navigator.appVersion);

	me.extend(me.style = {}, {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		transformOrigin: _prefixStyle('transformOrigin')
	});

	me.hasClass = function (e, c) {
		var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
		return re.test(e.className);
	};

	me.addClass = function (e, c) {
		if ( me.hasClass(e, c) ) {
			return;
		}

		var newclass = e.className.split(' ');
		newclass.push(c);
		e.className = newclass.join(' ');
	};

	me.removeClass = function (e, c) {
		if ( !me.hasClass(e, c) ) {
			return;
		}

		var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
		e.className = e.className.replace(re, ' ');
	};

	me.offset = function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		// jshint -W084
		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}
		// jshint +W084

		return {
			left: left,
			top: top
		};
	};

	me.preventDefaultException = function (el, exceptions) {
		for ( var i in exceptions ) {
			if ( exceptions[i].test(el[i]) ) {
				return true;
			}
		}

		return false;
	};

	me.extend(me.eventType = {}, {
		touchstart: 1,
		touchmove: 1,
		touchend: 1,

		mousedown: 2,
		mousemove: 2,
		mouseup: 2,

		MSPointerDown: 3,
		MSPointerMove: 3,
		MSPointerUp: 3
	});

	me.extend(me.ease = {}, {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if ( k === 0 ) { return 0; }
				if ( k == 1 ) { return 1; }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
			}
		}
	});

	me.tap = function (e, eventName) {
		var ev = document.createEvent('Event');
		ev.initEvent(eventName, true, true);
		ev.pageX = e.pageX;
		ev.pageY = e.pageY;
		e.target.dispatchEvent(ev);
	};

	me.click = function (e) {
		var target = e.target,
			ev;

		if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent('click', true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);

			ev._constructed = true;
			target.dispatchEvent(ev);
		}
	};

	return me;
})();

function IScroll (el, options) {
	this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
	this.scroller = this.wrapper.children[0];
	this.scrollerStyle = this.scroller.style;		// cache style for better performance

	this.options = {

		resizeIndicator: true,

		mouseWheelSpeed: 20,

		snapThreshold: 0.334,

// INSERT POINT: OPTIONS 

		startX: 0,
		startY: 0,
		scrollY: true,
		directionLockThreshold: 5,
		momentum: true,

		bounce: true,
		bounceTime: 600,
		bounceEasing: '',

		preventDefault: true,
		preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

		HWCompositing: true,
		useTransition: true,
		useTransform: true
	};

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	// Normalize options
	this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

	this.options.useTransition = utils.hasTransition && this.options.useTransition;
	this.options.useTransform = utils.hasTransform && this.options.useTransform;

	this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
	this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

	// If you want eventPassthrough I have to lock one of the axes
	this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
	this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

	// With eventPassthrough we also need lockDirection mechanism
	this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
	this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

	this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

	this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

	if ( this.options.tap === true ) {
		this.options.tap = 'tap';
	}

	this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

// INSERT POINT: NORMALIZATION

	// Some defaults	
	this.x = 0;
	this.y = 0;
	this.directionX = 0;
	this.directionY = 0;
	this._events = {};

// INSERT POINT: DEFAULTS

	this._init();
	this.refresh();

	this.scrollTo(this.options.startX, this.options.startY);
	this.enable();
}

IScroll.prototype = {
	version: '5.0.6',

	_init: function () {
		this._initEvents();

		if ( this.options.scrollbars || this.options.indicators ) {
			this._initIndicators();
		}

		if ( this.options.mouseWheel ) {
			this._initWheel();
		}

		if ( this.options.snap ) {
			this._initSnap();
		}

		if ( this.options.keyBindings ) {
			this._initKeys();
		}

// INSERT POINT: _init

	},

	destroy: function () {
		this._initEvents(true);

		this._execEvent('destroy');
	},

	_transitionEnd: function (e) {
		if ( e.target != this.scroller ) {
			return;
		}

		this._transitionTime(0);
		if ( !this.resetPosition(this.options.bounceTime) ) {
			this._execEvent('scrollEnd');
		}
	},

	_start: function (e) {
		// React to left mouse button only
		if ( utils.eventType[e.type] != 1 ) {
			if ( e.button !== 0 ) {
				return;
			}
		}

		if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
			return;
		}

		if ( this.options.preventDefault && !utils.isAndroidBrowser && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();		// This seems to break default Android browser
		}

		var point = e.touches ? e.touches[0] : e,
			pos;

		this.initiated	= utils.eventType[e.type];
		this.moved		= false;
		this.distX		= 0;
		this.distY		= 0;
		this.directionX = 0;
		this.directionY = 0;
		this.directionLocked = 0;

		this._transitionTime();

		this.isAnimating = false;
		this.startTime = utils.getTime();

		if ( this.options.useTransition && this.isInTransition ) {
			pos = this.getComputedPosition();

			this._translate(Math.round(pos.x), Math.round(pos.y));
			this._execEvent('scrollEnd');
			this.isInTransition = false;
		}

		this.startX    = this.x;
		this.startY    = this.y;
		this.absStartX = this.x;
		this.absStartY = this.y;
		this.pointX    = point.pageX;
		this.pointY    = point.pageY;

		this._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault ) {	// increases performance on Android? TODO: check!
			e.preventDefault();
		}

		var point		= e.touches ? e.touches[0] : e,
			deltaX		= point.pageX - this.pointX,
			deltaY		= point.pageY - this.pointY,
			timestamp	= utils.getTime(),
			newX, newY,
			absDistX, absDistY;

		this.pointX		= point.pageX;
		this.pointY		= point.pageY;

		this.distX		+= deltaX;
		this.distY		+= deltaY;
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);

		// We need to move at least 10 pixels for the scrolling to initiate
		if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
			return;
		}

		// If you are scrolling in one direction lock the other
		if ( !this.directionLocked && !this.options.freeScroll ) {
			if ( absDistX > absDistY + this.options.directionLockThreshold ) {
				this.directionLocked = 'h';		// lock horizontally
			} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}

		if ( this.directionLocked == 'h' ) {
			if ( this.options.eventPassthrough == 'vertical' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'horizontal' ) {
				this.initiated = false;
				return;
			}

			deltaY = 0;
		} else if ( this.directionLocked == 'v' ) {
			if ( this.options.eventPassthrough == 'horizontal' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'vertical' ) {
				this.initiated = false;
				return;
			}

			deltaX = 0;
		}

		deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		// Slow down if outside of the boundaries
		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if ( !this.moved ) {
			this._execEvent('scrollStart');
		}

		this.moved = true;

		this._translate(newX, newY);

/* REPLACE START: _move */

		if ( timestamp - this.startTime > 300 ) {
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}

/* REPLACE END: _move */

	},

	_end: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.changedTouches ? e.changedTouches[0] : e,
			momentumX,
			momentumY,
			duration = utils.getTime() - this.startTime,
			newX = Math.round(this.x),
			newY = Math.round(this.y),
			distanceX = Math.abs(newX - this.startX),
			distanceY = Math.abs(newY - this.startY),
			time = 0,
			easing = '';

		this.scrollTo(newX, newY);	// ensures that the last position is rounded

		this.isInTransition = 0;
		this.initiated = 0;
		this.endTime = utils.getTime();

		// reset if we are outside of the boundaries
		if ( this.resetPosition(this.options.bounceTime) ) {
			return;
		}

		// we scrolled less than 10 pixels
		if ( !this.moved ) {
			if ( this.options.tap ) {
				utils.tap(e, this.options.tap);
			}

			if ( this.options.click ) {
				utils.click(e);
			}

			return;
		}

		if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
			this._execEvent('flick');
			return;
		}

		// start momentum animation if needed
		if ( this.options.momentum && duration < 300 ) {
			momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0) : { destination: newX, duration: 0 };
			momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0) : { destination: newY, duration: 0 };
			newX = momentumX.destination;
			newY = momentumY.destination;
			time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = 1;
		}


		if ( this.options.snap ) {
			var snap = this._nearestSnap(newX, newY);
			this.currentPage = snap;
			time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(newX - snap.x), 1000),
						Math.min(Math.abs(newY - snap.y), 1000)
					), 300);
			newX = snap.x;
			newY = snap.y;

			this.directionX = 0;
			this.directionY = 0;
			easing = this.options.bounceEasing;
		}

// INSERT POINT: _end

		if ( newX != this.x || newY != this.y ) {
			// change easing function when scroller goes out of the boundaries
			if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
				easing = utils.ease.quadratic;
			}

			this.scrollTo(newX, newY, time, easing);
			return;
		}

		this._execEvent('scrollEnd');
	},

	_resize: function () {
		var that = this;

		clearTimeout(this.resizeTimeout);

		this.resizeTimeout = setTimeout(function () {
			that.refresh();
		}, this.options.resizePolling);
	},

	resetPosition: function (time) {
		var x = this.x,
			y = this.y;

		time = time || 0;

		if ( !this.hasHorizontalScroll || this.x > 0 ) {
			x = 0;
		} else if ( this.x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( !this.hasVerticalScroll || this.y > 0 ) {
			y = 0;
		} else if ( this.y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		if ( x == this.x && y == this.y ) {
			return false;
		}

		this.scrollTo(x, y, time, this.options.bounceEasing);

		return true;
	},

	disable: function () {
		this.enabled = false;
	},

	enable: function () {
		this.enabled = true;
	},

	refresh: function () {
		var rf = this.wrapper.offsetHeight;		// Force reflow

		this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight	= this.wrapper.clientHeight;

/* REPLACE START: refresh */

		this.scrollerWidth	= this.scroller.offsetWidth;
		this.scrollerHeight	= this.scroller.offsetHeight;

/* REPLACE END: refresh */

		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
		this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

		this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
		this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

		if ( !this.hasHorizontalScroll ) {
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}

		if ( !this.hasVerticalScroll ) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

		this.endTime = 0;
		this.directionX = 0;
		this.directionY = 0;

		this.wrapperOffset = utils.offset(this.wrapper);

		this._execEvent('refresh');

		this.resetPosition();

// INSERT POINT: _refresh

	},

	on: function (type, fn) {
		if ( !this._events[type] ) {
			this._events[type] = [];
		}

		this._events[type].push(fn);
	},

	_execEvent: function (type) {
		if ( !this._events[type] ) {
			return;
		}

		var i = 0,
			l = this._events[type].length;

		if ( !l ) {
			return;
		}

		for ( ; i < l; i++ ) {
			this._events[type][i].call(this);
		}
	},

	scrollBy: function (x, y, time, easing) {
		x = this.x + x;
		y = this.y + y;
		time = time || 0;

		this.scrollTo(x, y, time, easing);
	},

	scrollTo: function (x, y, time, easing) {
		easing = easing || utils.ease.circular;

		if ( !time || (this.options.useTransition && easing.style) ) {
			this._transitionTimingFunction(easing.style);
			this._transitionTime(time);
			this._translate(x, y);
		} else {
			this._animate(x, y, time, easing.fn);
		}
	},

	scrollToElement: function (el, time, offsetX, offsetY, easing) {
		el = el.nodeType ? el : this.scroller.querySelector(el);

		if ( !el ) {
			return;
		}

		var pos = utils.offset(el);

		pos.left -= this.wrapperOffset.left;
		pos.top  -= this.wrapperOffset.top;

		// if offsetX/Y are true we center the element to the screen
		if ( offsetX === true ) {
			offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		}
		if ( offsetY === true ) {
			offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		}

		pos.left -= offsetX || 0;
		pos.top  -= offsetY || 0;

		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

		time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

		this.scrollTo(pos.left, pos.top, time, easing);
	},

	_transitionTime: function (time) {
		time = time || 0;
		this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTime(time);
			}
		}


// INSERT POINT: _transitionTime

	},

	_transitionTimingFunction: function (easing) {
		this.scrollerStyle[utils.style.transitionTimingFunction] = easing;


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTimingFunction(easing);
			}
		}


// INSERT POINT: _transitionTimingFunction

	},

	_translate: function (x, y) {
		if ( this.options.useTransform ) {

/* REPLACE START: _translate */

			this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

/* REPLACE END: _translate */

		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.scrollerStyle.left = x + 'px';
			this.scrollerStyle.top = y + 'px';
		}

		this.x = x;
		this.y = y;


	if ( this.indicators ) {
		for ( var i = this.indicators.length; i--; ) {
			this.indicators[i].updatePosition();
		}
	}


// INSERT POINT: _translate

	},

	_initEvents: function (remove) {
		var eventType = remove ? utils.removeEvent : utils.addEvent,
			target = this.options.bindToWrapper ? this.wrapper : window;

		eventType(window, 'orientationchange', this);
		eventType(window, 'resize', this);

		if ( this.options.click ) {
			eventType(this.wrapper, 'click', this, true);
		}

		if ( !this.options.disableMouse ) {
			eventType(this.wrapper, 'mousedown', this);
			eventType(target, 'mousemove', this);
			eventType(target, 'mousecancel', this);
			eventType(target, 'mouseup', this);
		}

		if ( utils.hasPointer && !this.options.disablePointer ) {
			eventType(this.wrapper, 'MSPointerDown', this);
			eventType(target, 'MSPointerMove', this);
			eventType(target, 'MSPointerCancel', this);
			eventType(target, 'MSPointerUp', this);
		}

		if ( utils.hasTouch && !this.options.disableTouch ) {
			eventType(this.wrapper, 'touchstart', this);
			eventType(target, 'touchmove', this);
			eventType(target, 'touchcancel', this);
			eventType(target, 'touchend', this);
		}

		eventType(this.scroller, 'transitionend', this);
		eventType(this.scroller, 'webkitTransitionEnd', this);
		eventType(this.scroller, 'oTransitionEnd', this);
		eventType(this.scroller, 'MSTransitionEnd', this);
	},

	getComputedPosition: function () {
		var matrix = window.getComputedStyle(this.scroller, null),
			x, y;

		if ( this.options.useTransform ) {
			matrix = matrix[utils.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d]/g, '');
			y = +matrix.top.replace(/[^-\d]/g, '');
		}

		return { x: x, y: y };
	},

	_initIndicators: function () {
		var interactive = this.options.interactiveScrollbars,
			defaultScrollbars = typeof this.options.scrollbars != 'object',
			customStyle = typeof this.options.scrollbars != 'string',
			indicators = [],
			indicator;

		this.indicators = [];

		if ( this.options.scrollbars ) {
			// Vertical scrollbar
			if ( this.options.scrollY ) {
				indicator = {
					el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeIndicator,
					listenX: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}

			// Horizontal scrollbar
			if ( this.options.scrollX ) {
				indicator = {
					el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeIndicator,
					listenY: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}
		}

		if ( this.options.indicators ) {
			// works fine for arrays and non-arrays
			indicators = indicators.concat(this.options.indicators);
		}

		for ( var i = indicators.length; i--; ) {
			this.indicators[i] = new Indicator(this, indicators[i]);
		}

		this.on('refresh', function () {
			if ( this.indicators ) {
				for ( var i = this.indicators.length; i--; ) {
					this.indicators[i].refresh();
				}
			}
		});

		this.on('destroy', function () {
			if ( this.indicators ) {
				for ( var i = this.indicators.length; i--; ) {
					this.indicators[i].destroy();
				}
			}

			delete this.indicators;
		});
	},

	_initWheel: function () {
		utils.addEvent(this.wrapper, 'mousewheel', this);
		utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

		this.on('destroy', function () {
			utils.removeEvent(this.wrapper, 'mousewheel', this);
			utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
		});
	},

	_wheel: function (e) {
		if ( !this.enabled ) {
			return;
		}

		e.preventDefault();

		var wheelDeltaX, wheelDeltaY,
			newX, newY,
			that = this;

		// Execute the scrollEnd event after 400ms the wheel stopped scrolling
		clearTimeout(this.wheelTimeout);
		this.wheelTimeout = setTimeout(function () {
			that._execEvent('scrollEnd');
		}, 400);

		if ( 'wheelDeltaX' in e ) {
			wheelDeltaX = e.wheelDeltaX / 120;
			wheelDeltaY = e.wheelDeltaY / 120;
		} else if ( 'wheelDelta' in e ) {
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 120;
		} else if ( 'detail' in e ) {
			wheelDeltaX = wheelDeltaY = -e.detail / 3;
		} else {
			return;
		}

		wheelDeltaX *= this.options.mouseWheelSpeed;
		wheelDeltaY *= this.options.mouseWheelSpeed;

		if ( !this.hasVerticalScroll ) {
			wheelDeltaX = wheelDeltaY;
			wheelDeltaY = 0;
		}

		if ( this.options.snap ) {
			newX = this.currentPage.pageX;
			newY = this.currentPage.pageY;

			if ( wheelDeltaX > 0 ) {
				newX--;
			} else if ( wheelDeltaX < 0 ) {
				newX++;
			}

			if ( wheelDeltaY > 0 ) {
				newY--;
			} else if ( wheelDeltaY < 0 ) {
				newY++;
			}

			this.goToPage(newX, newY);

			return;
		}

		newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX * this.options.invertWheelDirection : 0);
		newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY * this.options.invertWheelDirection : 0);

		if ( newX > 0 ) {
			newX = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
		}

		if ( newY > 0 ) {
			newY = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
		}

		this.scrollTo(newX, newY, 0);

// INSERT POINT: _wheel
	},

	_initSnap: function () {
		this.currentPage = {};

		if ( typeof this.options.snap == 'string' ) {
			this.options.snap = this.scroller.querySelectorAll(this.options.snap);
		}

		this.on('refresh', function () {
			var i = 0, l,
				m = 0, n,
				cx, cy,
				x = 0, y,
				stepX = this.options.snapStepX || this.wrapperWidth,
				stepY = this.options.snapStepY || this.wrapperHeight,
				el;

			this.pages = [];

			if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
				return;
			}

			if ( this.options.snap === true ) {
				cx = Math.round( stepX / 2 );
				cy = Math.round( stepY / 2 );

				while ( x > -this.scrollerWidth ) {
					this.pages[i] = [];
					l = 0;
					y = 0;

					while ( y > -this.scrollerHeight ) {
						this.pages[i][l] = {
							x: Math.max(x, this.maxScrollX),
							y: Math.max(y, this.maxScrollY),
							width: stepX,
							height: stepY,
							cx: x - cx,
							cy: y - cy
						};

						y -= stepY;
						l++;
					}

					x -= stepX;
					i++;
				}
			} else {
				el = this.options.snap;
				l = el.length;
				n = -1;

				for ( ; i < l; i++ ) {
					if ( i === 0 || el[i].offsetLeft <= el[i-1].offsetLeft ) {
						m = 0;
						n++;
					}

					if ( !this.pages[m] ) {
						this.pages[m] = [];
					}

					x = Math.max(-el[i].offsetLeft, this.maxScrollX);
					y = Math.max(-el[i].offsetTop, this.maxScrollY);
					cx = x - Math.round(el[i].offsetWidth / 2);
					cy = y - Math.round(el[i].offsetHeight / 2);

					this.pages[m][n] = {
						x: x,
						y: y,
						width: el[i].offsetWidth,
						height: el[i].offsetHeight,
						cx: cx,
						cy: cy
					};

					if ( x > this.maxScrollX ) {
						m++;
					}
				}
			}

			this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

			// Update snap threshold if needed
			if ( this.options.snapThreshold % 1 === 0 ) {
				this.snapThresholdX = this.options.snapThreshold;
				this.snapThresholdY = this.options.snapThreshold;
			} else {
				this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
				this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
			}
		});

		this.on('flick', function () {
			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.x - this.startX), 1000),
						Math.min(Math.abs(this.y - this.startY), 1000)
					), 300);

			this.goToPage(
				this.currentPage.pageX + this.directionX,
				this.currentPage.pageY + this.directionY,
				time
			);
		});
	},

	_nearestSnap: function (x, y) {
		if ( !this.pages.length ) {
			return { x: 0, y: 0, pageX: 0, pageY: 0 };
		}

		var i = 0,
			l = this.pages.length,
			m = 0;

		// Check if we exceeded the snap threshold
		if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
			Math.abs(y - this.absStartY) < this.snapThresholdY ) {
			return this.currentPage;
		}

		if ( x > 0 ) {
			x = 0;
		} else if ( x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( y > 0 ) {
			y = 0;
		} else if ( y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		for ( ; i < l; i++ ) {
			if ( x >= this.pages[i][0].cx ) {
				x = this.pages[i][0].x;
				break;
			}
		}

		l = this.pages[i].length;

		for ( ; m < l; m++ ) {
			if ( y >= this.pages[0][m].cy ) {
				y = this.pages[0][m].y;
				break;
			}
		}

		if ( i == this.currentPage.pageX ) {
			i += this.directionX;

			if ( i < 0 ) {
				i = 0;
			} else if ( i >= this.pages.length ) {
				i = this.pages.length - 1;
			}

			x = this.pages[i][0].x;
		}

		if ( m == this.currentPage.pageY ) {
			m += this.directionY;

			if ( m < 0 ) {
				m = 0;
			} else if ( m >= this.pages[0].length ) {
				m = this.pages[0].length - 1;
			}

			y = this.pages[0][m].y;
		}

		return {
			x: x,
			y: y,
			pageX: i,
			pageY: m
		};
	},

	goToPage: function (x, y, time, easing) {
		easing = easing || this.options.bounceEasing;

		if ( x >= this.pages.length ) {
			x = this.pages.length - 1;
		} else if ( x < 0 ) {
			x = 0;
		}

		if ( y >= this.pages[x].length ) {
			y = this.pages[x].length - 1;
		} else if ( y < 0 ) {
			y = 0;
		}

		var posX = this.pages[x][y].x,
			posY = this.pages[x][y].y;

		time = time === undefined ? this.options.snapSpeed || Math.max(
			Math.max(
				Math.min(Math.abs(posX - this.x), 1000),
				Math.min(Math.abs(posY - this.y), 1000)
			), 300) : time;

		this.currentPage = {
			x: posX,
			y: posY,
			pageX: x,
			pageY: y
		};

		this.scrollTo(posX, posY, time, easing);
	},

	next: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x++;

		if ( x >= this.pages.length && this.hasVerticalScroll ) {
			x = 0;
			y++;
		}

		this.goToPage(x, y, time, easing);
	},

	prev: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x--;

		if ( x < 0 && this.hasVerticalScroll ) {
			x = 0;
			y--;
		}

		this.goToPage(x, y, time, easing);
	},

	_initKeys: function (e) {
		// default key bindings
		var keys = {
			pageUp: 33,
			pageDown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};
		var i;

		// if you give me characters I give you keycode
		if ( typeof this.options.keyBindings == 'object' ) {
			for ( i in this.options.keyBindings ) {
				if ( typeof this.options.keyBindings[i] == 'string' ) {
					this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
				}
			}
		} else {
			this.options.keyBindings = {};
		}

		for ( i in keys ) {
			this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
		}

		utils.addEvent(window, 'keydown', this);

		this.on('destroy', function () {
			utils.removeEvent(window, 'keydown', this);
		});
	},

	_key: function (e) {
		if ( !this.enabled ) {
			return;
		}

		var snap = this.options.snap,	// we are using this alot, better to cache it
			newX = snap ? this.currentPage.pageX : this.x,
			newY = snap ? this.currentPage.pageY : this.y,
			now = utils.getTime(),
			prevTime = this.keyTime || 0,
			acceleration = 0.250,
			pos;

		if ( this.options.useTransition && this.isInTransition ) {
			pos = this.getComputedPosition();

			this._translate(Math.round(pos.x), Math.round(pos.y));
			this.isInTransition = false;
		}

		this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

		switch ( e.keyCode ) {
			case this.options.keyBindings.pageUp:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX += snap ? 1 : this.wrapperWidth;
				} else {
					newY += snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.pageDown:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX -= snap ? 1 : this.wrapperWidth;
				} else {
					newY -= snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.end:
				newX = snap ? this.pages.length-1 : this.maxScrollX;
				newY = snap ? this.pages[0].length-1 : this.maxScrollY;
				break;
			case this.options.keyBindings.home:
				newX = 0;
				newY = 0;
				break;
			case this.options.keyBindings.left:
				newX += snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.up:
				newY += snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.right:
				newX -= snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.down:
				newY -= snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			default:
				return;
		}

		if ( snap ) {
			this.goToPage(newX, newY);
			return;
		}

		if ( newX > 0 ) {
			newX = 0;
			this.keyAcceleration = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
			this.keyAcceleration = 0;
		}

		if ( newY > 0 ) {
			newY = 0;
			this.keyAcceleration = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
			this.keyAcceleration = 0;
		}

		this.scrollTo(newX, newY, 0);

		this.keyTime = now;
	},

	_animate: function (destX, destY, duration, easingFn) {
		var that = this,
			startX = this.x,
			startY = this.y,
			startTime = utils.getTime(),
			destTime = startTime + duration;

		function step () {
			var now = utils.getTime(),
				newX, newY,
				easing;

			if ( now >= destTime ) {
				that.isAnimating = false;
				that._translate(destX, destY);

				if ( !that.resetPosition(that.options.bounceTime) ) {
					that._execEvent('scrollEnd');
				}

				return;
			}

			now = ( now - startTime ) / duration;
			easing = easingFn(now);
			newX = ( destX - startX ) * easing + startX;
			newY = ( destY - startY ) * easing + startY;
			that._translate(newX, newY);

			if ( that.isAnimating ) {
				rAF(step);
			}
		}

		this.isAnimating = true;
		step();
	},
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
			case 'orientationchange':
			case 'resize':
				this._resize();
				break;
			case 'transitionend':
			case 'webkitTransitionEnd':
			case 'oTransitionEnd':
			case 'MSTransitionEnd':
				this._transitionEnd(e);
				break;
			case 'DOMMouseScroll':
			case 'mousewheel':
				this._wheel(e);
				break;
			case 'keydown':
				this._key(e);
				break;
			case 'click':
				if ( !e._constructed ) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	}
};
function createDefaultScrollbar (direction, interactive, type) {
	var scrollbar = document.createElement('div'),
		indicator = document.createElement('div');

	if ( type === true ) {
		scrollbar.style.cssText = 'position:absolute;z-index:9999';
		indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
	}

	indicator.className = 'iScrollIndicator';

	if ( direction == 'h' ) {
		if ( type === true ) {
			scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
			indicator.style.height = '100%';
		}
		scrollbar.className = 'iScrollHorizontalScrollbar';
	} else {
		if ( type === true ) {
			scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
			indicator.style.width = '100%';
		}
		scrollbar.className = 'iScrollVerticalScrollbar';
	}

	if ( !interactive ) {
		scrollbar.style.pointerEvents = 'none';
	}

	scrollbar.appendChild(indicator);

	return scrollbar;
}

function Indicator (scroller, options) {
	this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
	this.indicator = this.wrapper.children[0];
	this.indicatorStyle = this.indicator.style;
	this.scroller = scroller;

	this.options = {
		listenX: true,
		listenY: true,
		interactive: false,
		resize: true,
		defaultScrollbars: false,
		speedRatioX: 0,
		speedRatioY: 0
	};

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	this.sizeRatioX = 1;
	this.sizeRatioY = 1;
	this.maxPosX = 0;
	this.maxPosY = 0;

	if ( this.options.interactive ) {
		if ( !this.options.disableTouch ) {
			utils.addEvent(this.indicator, 'touchstart', this);
			utils.addEvent(window, 'touchend', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(this.indicator, 'MSPointerDown', this);
			utils.addEvent(window, 'MSPointerUp', this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(this.indicator, 'mousedown', this);
			utils.addEvent(window, 'mouseup', this);
		}
	}
}

Indicator.prototype = {
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
		}
	},

	destroy: function () {
		if ( this.options.interactive ) {
			utils.removeEvent(this.indicator, 'touchstart', this);
			utils.removeEvent(this.indicator, 'MSPointerDown', this);
			utils.removeEvent(this.indicator, 'mousedown', this);

			utils.removeEvent(window, 'touchmove', this);
			utils.removeEvent(window, 'MSPointerMove', this);
			utils.removeEvent(window, 'mousemove', this);

			utils.removeEvent(window, 'touchend', this);
			utils.removeEvent(window, 'MSPointerUp', this);
			utils.removeEvent(window, 'mouseup', this);
		}

		if ( this.options.defaultScrollbars ) {
			this.wrapper.parentNode.removeChild(this.wrapper);
		}
	},

	_start: function (e) {
		var point = e.touches ? e.touches[0] : e;

		e.preventDefault();
		e.stopPropagation();

		this.transitionTime(0);

		this.initiated = true;
		this.moved = false;
		this.lastPointX	= point.pageX;
		this.lastPointY	= point.pageY;

		this.startTime	= utils.getTime();

		if ( !this.options.disableTouch ) {
			utils.addEvent(window, 'touchmove', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(window, 'MSPointerMove', this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(window, 'mousemove', this);
		}

		this.scroller._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		var point = e.touches ? e.touches[0] : e,
			deltaX, deltaY,
			newX, newY,
			timestamp = utils.getTime();

		if ( !this.moved ) {
			this.scroller._execEvent('scrollStart');
		}

		this.moved = true;

		deltaX = point.pageX - this.lastPointX;
		this.lastPointX = point.pageX;

		deltaY = point.pageY - this.lastPointY;
		this.lastPointY = point.pageY;

		newX = this.x + deltaX;
		newY = this.y + deltaY;

		this._pos(newX, newY);

		e.preventDefault();
		e.stopPropagation();
	},

	_end: function (e) {
		if ( !this.initiated ) {
			return;
		}

		this.initiated = false;

		e.preventDefault();
		e.stopPropagation();

		utils.removeEvent(window, 'touchmove', this);
		utils.removeEvent(window, 'MSPointerMove', this);
		utils.removeEvent(window, 'mousemove', this);

		if ( this.scroller.options.snap ) {
			var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.scroller.x - snap.x), 1000),
						Math.min(Math.abs(this.scroller.y - snap.y), 1000)
					), 300);

			if ( this.scroller.x != snap.x || this.scroller.y != snap.y ) {
				this.scroller.directionX = 0;
				this.scroller.directionY = 0;
				this.scroller.currentPage = snap;
				this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
			}
		}

		if ( this.moved ) {
			this.scroller._execEvent('scrollEnd');
		}
	},

	transitionTime: function (time) {
		time = time || 0;
		this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';
	},

	transitionTimingFunction: function (easing) {
		this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
	},

	refresh: function () {
		this.transitionTime(0);

		if ( this.options.listenX && !this.options.listenY ) {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
		} else if ( this.options.listenY && !this.options.listenX ) {
			this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
		} else {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
		}

		if ( this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ) {
			utils.addClass(this.wrapper, 'iScrollBothScrollbars');
			utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '8px';
				} else {
					this.wrapper.style.bottom = '8px';
				}
			}
		} else {
			utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
			utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '2px';
				} else {
					this.wrapper.style.bottom = '2px';
				}
			}
		}

		var r = this.wrapper.offsetHeight;	// force refresh

		if ( this.options.listenX ) {
			this.wrapperWidth = this.wrapper.clientWidth;
			if ( this.options.resize ) {
				this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
				this.indicatorStyle.width = this.indicatorWidth + 'px';
			} else {
				this.indicatorWidth = this.indicator.clientWidth;
			}
			this.maxPosX = this.wrapperWidth - this.indicatorWidth;
			this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));	
		}

		if ( this.options.listenY ) {
			this.wrapperHeight = this.wrapper.clientHeight;
			if ( this.options.resize ) {
				this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
				this.indicatorStyle.height = this.indicatorHeight + 'px';
			} else {
				this.indicatorHeight = this.indicator.clientHeight;
			}

			this.maxPosY = this.wrapperHeight - this.indicatorHeight;
			this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
		}

		this.updatePosition();
	},

	updatePosition: function () {
		var x = Math.round(this.sizeRatioX * this.scroller.x) || 0,
			y = Math.round(this.sizeRatioY * this.scroller.y) || 0;

		if ( !this.options.ignoreBoundaries ) {
			if ( x < 0 ) {
				x = 0;
			} else if ( x > this.maxPosX ) {
				x = this.maxPosX;
			}

			if ( y < 0 ) {
				y = 0;
			} else if ( y > this.maxPosY ) {
				y = this.maxPosY;
			}		
		}

		this.x = x;
		this.y = y;

		if ( this.scroller.options.useTransform ) {
			this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
		} else {
			this.indicatorStyle.left = x + 'px';
			this.indicatorStyle.top = y + 'px';
		}
	},

	_pos: function (x, y) {
		if ( x < 0 ) {
			x = 0;
		} else if ( x > this.maxPosX ) {
			x = this.maxPosX;
		}

		if ( y < 0 ) {
			y = 0;
		} else if ( y > this.maxPosY ) {
			y = this.maxPosY;
		}

		x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
		y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

		this.scroller.scrollTo(x, y);
	}
};

IScroll.ease = utils.ease;

return IScroll;

})(window, document, Math);
});
require.register("davy/davy.js", function(exports, require, module){
(function(global) {
  "use strict";
  var next;
  if (typeof define === "function" && define.amd) {
    define([ "subsequent" ], function(subsequent) {
      next = subsequent;
      return Promise;
    });
  } else if (typeof module === "object" && module.exports) {
    module.exports = Promise;
    next = require("./subsequent");
  } else {
    global.Davy = Promise;
    next = global.subsequent;
  }
  function Promise() {
    this.value = undefined;
    this.deferreds = [];
  }
  Promise.prototype.isFulfilled = false;
  Promise.prototype.isRejected = false;
  Promise.prototype.then = function(onFulfill, onReject) {
    var promise = new Promise(), deferred = defer(promise, onFulfill, onReject);
    if (this.isFulfilled || this.isRejected) {
      resolve(deferred, this.isFulfilled ? Promise.SUCCESS : Promise.FAILURE, this.value);
    } else {
      this.deferreds.push(deferred);
    }
    return promise;
  };
  Promise.prototype.catch = function(onReject) {
    return this.then(null, onReject);
  };
  Promise.prototype.throw = function() {
    return this.catch(function(error) {
      next(function() {
        throw error;
      });
    });
  };
  Promise.prototype.fulfill = function(value) {
    if (this.isFulfilled || this.isRejected) return;
    var isResolved = false;
    try {
      if (value === this) throw new TypeError("Can't resolve a promise with itself.");
      if (isObject(value) || isFunction(value)) {
        var then = value.then, self = this;
        if (isFunction(then)) {
          then.call(value, function(val) {
            if (!isResolved) {
              isResolved = true;
              self.fulfill(val);
            }
          }, function(err) {
            if (!isResolved) {
              isResolved = true;
              self.reject(err);
            }
          });
          return;
        }
      }
      this.isFulfilled = true;
      this.complete(value);
    } catch (e) {
      if (!isResolved) {
        this.reject(e);
      }
    }
  };
  Promise.prototype.reject = function(error) {
    if (this.isFulfilled || this.isRejected) return;
    this.isRejected = true;
    this.complete(error);
  };
  Promise.prototype.complete = function(value) {
    this.value = value;
    var type = this.isFulfilled ? Promise.SUCCESS : Promise.FAILURE;
    for (var i = 0; i < this.deferreds.length; ++i) {
      resolve(this.deferreds[i], type, value);
    }
    this.deferreds = undefined;
  };
  Promise.SUCCESS = "fulfill";
  Promise.FAILURE = "reject";
  function resolve(deferred, type, value) {
    var fn = deferred[type], promise = deferred.promise;
    if (isFunction(fn)) {
      next(function() {
        try {
          value = fn(value);
          promise.fulfill(value);
        } catch (e) {
          promise.reject(e);
        }
      });
    } else {
      promise[type](value);
    }
  }
  function defer(promise, fulfill, reject) {
    return {
      promise: promise,
      fulfill: fulfill,
      reject: reject
    };
  }
  function isObject(obj) {
    return obj && typeof obj === "object";
  }
  function isFunction(fn) {
    return fn && typeof fn === "function";
  }
  Promise.all = function() {
    var args = [].slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments), promise = new Promise(), remaining = args.length;
    if (remaining === 0) promise.fulfill([]);
    for (var i = 0; i < args.length; ++i) {
      resolve(i, args[i]);
    }
    return promise;
    function reject(err) {
      promise.reject(err);
    }
    function fulfill(val) {
      resolve(i, val);
    }
    function resolve(i, value) {
      if (isObject(value) && isFunction(value.then)) {
        value.then(fulfill, reject);
        return;
      }
      args[i] = value;
      if (--remaining === 0) {
        promise.fulfill(args);
      }
    }
  };
  Promise.wrap = function(fn) {
    return function() {
      var args = [].slice.call(arguments), promise = new Promise();
      args.push(function(err, val) {
        if (err) {
          promise.reject(err);
        } else {
          promise.fulfill(val);
        }
      });
      fn.apply(this, args);
      return promise;
    };
  };
})(this);
});
require.register("davy/subsequent.js", function(exports, require, module){
(function(global) {
  "use strict";
  var next = function(next, buffer, length, tick) {
    buffer = new Array(1e4);
    length = 0;
    function enqueue(fn) {
      if (length === buffer.length) {
        length = buffer.push(fn);
      } else {
        buffer[length++] = fn;
      }
      if (!tick) {
        return tick = true;
      }
    }
    function execute() {
      var i = 0;
      while (i < length) {
        buffer[i]();
        buffer[i++] = undefined;
      }
      length = 0;
      tick = false;
    }
    if (typeof setImmediate === "function") {
      next = function(fn) {
        enqueue(fn) && setImmediate(execute);
      };
    } else if (typeof process === "object" && process.nextTick) {
      next = function(fn) {
        enqueue(fn) && process.nextTick(execute);
      };
    } else if (global.postMessage) {
      var message = "__subsequent", onMessage = function(e) {
        if (e.data === message) {
          e.stopPropagation && e.stopPropagation();
          execute();
        }
      };
      if (global.addEventListener) {
        global.addEventListener("message", onMessage, true);
      } else {
        global.attachEvent("onmessage", onMessage);
      }
      next = function(fn) {
        enqueue(fn) && global.postMessage(message, "*");
      };
    } else {
      next = function(fn) {
        enqueue(fn) && setTimeout(execute, 0);
      };
    }
    return next;
  }();
  if (typeof define === "function" && define.amd) {
    define(function() {
      return next;
    });
  } else if (typeof module === "object" && module.exports) {
    module.exports = next;
  } else {
    global.subsequent = next;
  }
})(this);
});
require.register("JSChat/Main.js", function(exports, require, module){
var backbone = require('exoskeleton');
var socket = require('engine.io')(location.origin.replace(/^http/, 'ws'));
require('socker-client')(socket);
backbone.socket = socket;
require('bbsocker.sync')(backbone);

var _ = require('underscore');
var app = function(){
}

_.extend(app,{
  router: require('./router.js'),
  run: function () {
    backbone.history.start({
      pushState: false,
      root: '/'
    });
  }
});
backbone.socket.onopen = function(){
  app.run();
}
module.exports = app;

});
require.register("JSChat/filters/escapeFilter.js", function(exports, require, module){
module.exports = function(text){
  return escapeHTML(text);
}

function escapeHTML(string){
  var pre = document.createElement('pre');
  var text = document.createTextNode(string);
  pre.appendChild(text);
  return pre.innerHTML;
}

});
require.register("JSChat/filters/index.js", function(exports, require, module){
module.exports = [
  require('./escapeFilter.js'),
  require('./youtubeFilter.js'),
  require('./vimeoFilter.js'),
  require('./markdownFilter.js'),
]

});
require.register("JSChat/filters/markdownFilter.js", function(exports, require, module){
var marked = require('marked');
module.exports = function(text){
  return marked(text);
}

});
require.register("JSChat/filters/nextLineFilter.js", function(exports, require, module){
var nl = /\n/g;
module.exports = function(text){
  return text.replace(nl, "<br/>");
}

});
require.register("JSChat/filters/urlFilter.js", function(exports, require, module){
module.exports = function(text){
  return  urlify(text);
}

function urlify(text) {
  var urlRegex = /([^'">]|^)(https?:\/\/[^\s<]+)/g;
  var result = text.replace(urlRegex, function(url) {
    return '<a href="' + url + '">' + url + '</a>';
  });
  return result;
}

});
require.register("JSChat/filters/vimeoFilter.js", function(exports, require, module){
module.exports = function(text){
  var result = vimeo_parser(text);
  if(result) text += embed(result);
  return text;
}


function embed(id){
  return '<iframe src="//player.vimeo.com/video/'+id+'" width="640" height="390"  frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
}
function vimeo_parser(url){
  var regExp = /http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;

  var match = url.match(regExp);

  if (match&&match[2]){
    return match[2];
  }else{
    return false;
  }
}

});
require.register("JSChat/filters/youtubeFilter.js", function(exports, require, module){
module.exports = function(text){
  var result = youtube_parser(text);
  if(result) text += embed(result);
  return text;
}


function embed(id){
  return '<iframe id="ytplayer" type="text/html" width="640" height="390" src="http://www.youtube.com/embed/' + id + '?autoplay=0" frameborder="0"></iframe>'
}
function youtube_parser(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match&&match[7].length==11){
    return match[7];
  }else{
    return false;
  }
}

});
require.register("JSChat/models/Contact.js", function(exports, require, module){
var Exo = require('exoskeleton');

var Contact = Exo.Model.extend({
  urlRoot: "/api/users",
  initialize: function(){
    this.transformData();
    this.on('change', this.transformData.bind(this));
  },
  transformData: function(){
    this.name = this.get('displayName') || '@' + this.get('gh_username');
  }
})

module.exports = Contact;

});
require.register("JSChat/models/ContactFactory.js", function(exports, require, module){
var contactModelsCache = {};
var ContactModel = require('./Contact');
var ContactsCollection = require('./Contacts');
var _ = require('underscore');
/**
 * this Factory should minimize calls to server for contacts information:
 * - any new cache model with ID defined will be fetched
 * - any model that doesn't have ID will be watched untill it get's the ID
 * - any collection will be watched untill it get's models with ID's and those will be saved 
 *   in cache
 */
module.exports = {
  getContactModel: function(id){
    if(id && contactModelsCache[id]){
      return contactModelsCache[id];
    }
    var contact = new ContactModel({id: id});
    if(contact.get('id')){
      contact.fetch();
      return putInCache.call(contact);
    }
    contact.on('change', putInCache, contact);
    return contact;
  },
  getContactsCollection: function(){
    var collection = new ContactsCollection();
    collection.on('change', processCollection, collection);
    return collection;
  }
}

/**
 * on change of collection, get all elements and put them in chache if required
 */
function processCollection(){
  _(this.models).each(function(contact){
    var modelId = contact.get('id');
    if(!modelId) return;
    if(contactModelsCache[modelId]){
      return contactModelsCache[modelId].set(contact.toJSON());
    }
    putInCache.call(contact);
  });
}

function putInCache(){
  if(this.get('id')){
    contactModelsCache[this.get('id')] = this;
    this.off('change', putInCache);
  }
  return this;
}

});
require.register("JSChat/models/Contacts.js", function(exports, require, module){
var Exo = require('exoskeleton');
var ContactModel = require('./Contact');

var ContactsCollection = Exo.Collection.extend({
  url: "/api/users",
  model: ContactModel,
  initialize: function(){
    console.log("Initialize ContactsCollection");
  }
})

module.exports = ContactsCollection;

});
require.register("JSChat/models/Me.js", function(exports, require, module){
var Exo = require('exoskeleton');

var Profile = Exo.Model.extend({
  url: "/api/me",
  initialize: function(){
    console.log("Initialize ME");
  }
})

module.exports = new Profile();

});
require.register("JSChat/models/Message.js", function(exports, require, module){
var Exo = require('exoskeleton');
var ContactFactory = require('./ContactFactory');
var _ = require('underscore');
var filters = require('../filters');

var Message = Exo.Model.extend({
  initialize: function(){
    this.transformData();
    this.on('change', this.transformData.bind(this));
  },
  transformData: function(){
    if(this.get('tms')) this.date = new Date(+this.get('tms'));
    if(this.get('uid') && !this.__user) this.__user = ContactFactory.getContactModel(this.get('uid'));
    if(this.get('text')) this.text = _.reduce(filters, iterator, this.get('text'), this);
  }
})

function iterator(memo, filter){
  return filter(memo);
}

module.exports = Message;

});
require.register("JSChat/models/Messages.js", function(exports, require, module){
var Exo = require('exoskeleton');
var MessageModel = require('./Message');

var MessageCollection = Exo.Collection.extend({
  url: function(){
    return "/api/rooms/" + this.roomId + "/messages";
  },
  initialize: function(models, options){
    this.roomId = options.roomId;

  },
  writing: function(){
    this.sync('writing', this);
  },
  model: MessageModel
})

module.exports = MessageCollection;

});
require.register("JSChat/models/ModelMixin.js", function(exports, require, module){
module.exports = {
  __syncedModels: [],
  componentDidMount: function() {
  // Whenever there may be a change in the Backbone data, trigger a reconcile.
    this.getBackboneModels().forEach(this.injectModel, this);
  },
  componentWillUnmount: function() {
  // Ensure that we clean up any dangling references when the component is
    // destroyed.
    console.log("DESTROYER");
    this.__syncedModels.forEach(function(model) {
      model.off(null, model.__updater, this);
    }, this);
  },
  injectModel: function(model){
    if(!~this.__syncedModels.indexOf(model)){
      var updater = this.forceUpdate.bind(this, null);
      model.__updater = updater;
      model.on('add change remove', updater, this);
      this.__syncedModels.push(model);
    }
  }
};

});
require.register("JSChat/models/Room.js", function(exports, require, module){
var Exo = require('exoskeleton');
var _ = require('underscore');
var ContactFactory = require('./ContactFactory.js');
var Room = Exo.Model.extend({
  urlRoot: "/api/rooms",
  initialize: function(){
    this.on('change', function(){
      console.log('changed!!');
    });
    console.log("Initialize Room");
  },
  join: function(opts){
    opts = _({url: this.urlRoot + '/' + this.get('id')}).extend(opts);
    this.sync('join', this, opts);
  },
  leave: function(opts){
    opts = _({url: this.urlRoot + '/' + this.get('id')}).extend(opts);
    this.sync('leave', this, opts);
  },
  writingHash:{},
  writing: function(userId){
    //WORK stopped here
    if(!userId) return;
    var user = ContactFactory.getContactModel(userId);
    var users = this.get('writing_users');
    if(!users) users = [];
    var userFound = _(users).find(function(usr){
      return usr.get('id') == user.get('id');
    });
    if(!userFound){
      users = users.concat(user);
      this.set('writing_users', users);
    } else {
      clearTimeout(this.writingHash[userId]);
    }
    
    this.writingHash[userId] = setTimeout(function ejectUser(){
      var ejected = _(this.get('writing_users')).reject(function(usr){
        return usr.get('id') == user.get('id');
      });
      this.set('writing_users', ejected);
    }.bind(this), 3000)
    
  }
})

module.exports = Room;

});
require.register("JSChat/models/RoomFactory.js", function(exports, require, module){
var roomModelsCache = {};
var RoomModel = require('./Room');
var RoomsCollection = require('./Rooms');
var _ = require('underscore');
/**
 * this Factory should minimize calls to server for contacts information:
 * - any new cache model with ID defined will be fetched
 * - any model that doesn't have ID will be watched untill it get's the ID
 * - any collection will be watched untill it get's models with ID's and those will be saved 
 *   in cache
 */
module.exports = {
  getRoomModel: function(id){
    if(id && roomModelsCache[id]){
      return roomModelsCache[id];
    }
    var room = new RoomModel({id: id});
    if(room.get('id')){
      room.fetch();
      return putInCache.call(room);
    }
    room.on('change', putInCache, room);
    return room;
  },
  getRoomsCollection: function(ids){
    var roomsArray = _(ids).map(function(id){
      return {id: id};
    });
    var collection = new RoomsCollection(roomsArray);
    collection.on('change', processCollection, collection);
    return collection;
  }
}

/**
 * on change of collection, get all elements and put them in chache if required
 */
function processCollection(){
  _(this.models).each(function(room){
    var modelId = room.get('id');
    if(!modelId) return;
    if(roomModelsCache[modelId]){
      return roomModelsCache[modelId].set(room.toJSON());
    }
    putInCache.call(room);
  });
}

function putInCache(){
  if(this.get('id')){
    roomModelsCache[this.get('id')] = this;
    this.off('change', putInCache);
  }
  return this;
}

});
require.register("JSChat/models/Rooms.js", function(exports, require, module){
var Exo = require('exoskeleton');
var RoomModel = require('./Room');

var RoomCollection = Exo.Collection.extend({
  url: "/api/rooms",
  model: RoomModel,
  initialize: function(){
    console.log("Initialize Rooms");
  }
})

module.exports = RoomCollection;

});
require.register("JSChat/reacts/BackboneMixin.js", function(exports, require, module){
module.exports = {
  componentDidMount: function() {
  // Whenever there may be a change in the Backbone data, trigger a reconcile.
    this.getBackboneModels().forEach(function(model) {
      model.on('add change remove', this.forceUpdate.bind(this, null), this);
    }, this);
  },
  componentWillUnmount: function() {
  // Ensure that we clean up any dangling references when the component is
  // destroyed.
    this.getBackboneModels().forEach(function(model) {
      model.off(null, null, this);
    }, this);
  }
};

});
require.register("JSChat/reacts/ChatRoom.js", function(exports, require, module){
/** @jsx React.DOM */
var ContactList = require('./ContactList');
var ParticipantsList = require('./ParticipantsList');
var ContactFactory = require('../models/ContactFactory');
var notification = require('../services/notification');

// item rendering im Messages list
var MessagesList = require('./MessagesList')(require('./Message.js'));

var MessageModel = require('../models/Message');
var backbone = require('exoskeleton');
var Nav = require('./Nav.js');
var _ = require('underscore');


module.exports = React.createClass({
  mixins: [require('./BackboneMixin')],
  handleTyping: function(evt){
    this.__textBoxValue = evt.target.value;
  },
  sendWriting: function(){
    if(this.__writing) return;
    this.__writing = true;
    this.props.messages.writing();
    setTimeout(function(){
      this.__writing = false;
    }.bind(this), 2000);
  },
  sendMessage: function(){
    this.props.messages.create(new MessageModel({
      text: this.__textBoxValue
      }),{
      success: function(){
        this.cleanTextBox();
        this.refs.messagesList.scrollToBottom(200);
        this.refs.messagesList.forceUpdate();
      }.bind(this)
    });
  },
  joinRoom: function(){
    notification.access()
    this.props.room.join({
      success: function(model, response){
        this.props.me.fetch()
        this.props.room.fetch()
      }.bind(this)
    });
  },
  leaveRoom: function(){
    this.props.room.leave({
      success: function(model, response){
        this.props.me.fetch()
        this.props.room.fetch()
      }.bind(this)
    });
  },
  getBackboneModels : function(){
    return [
            this.props.room,
            this.props.rooms,
            this.props.me
            ]
  },
  refresh: function(){
    this.props.room.fetch()
    this.props.rooms.fetch({attrs: {ids: this.props.me.get('rooms')}});
    this.props.messages.fetch({
      success: function(){
        this.refs.messagesList.scrollToBottom();
      }.bind(this)
    })
  },
  meJoinedTheRoom: function(){
    return !!_(this.props.me.get('rooms')).find(function(id){
      return this.props.room.get('id') === id;
    }.bind(this));
  },
  leaveJoinButton: function(){
    if(this.meJoinedTheRoom()){
      return React.DOM.button( {onClick:this.leaveRoom}, "leave");
    } else {
      return React.DOM.button( {onClick:this.joinRoom}, "join");
    }
  },
  cleanTextBox: function(){
    this.refs.textbox.getDOMNode().value = '';
    this.__textBoxValue = '';
  },
  onKeyDown: function(e){
    if(e.keyCode === 13 && !e.shiftKey){
      if(!this.__textBoxValue || this.__textBoxValue == "\n") {
        return this.cleanTextBox();
      };
      this.sendMessage();
    }
    this.sendWriting();
  },
  render: function(){
    return React.DOM.div(null, 
    Nav( {me:this.props.me}),
    React.DOM.div( {className:"container"}, 
      React.DOM.div( {className:"row"}, 
        ContactList( {rooms:this.props.rooms, room:this.props.room, me:this.props.me} ),
        React.DOM.div( {className:"chat col-md-9 com-sm-7"}, 
          React.DOM.div(null, this.props.room.get('name'), this.leaveJoinButton()),
          ParticipantsList( {room:this.props.room}),
          MessagesList( 
            {messages:this.props.messages,
            ref:"messagesList", 
            writingStatus:  writingStatus(this.props.room.get('writing_users'))}),
          React.DOM.div( {className:"form"}, 
            React.DOM.textarea( {onChange:this.handleTyping, 
              disabled:!this.meJoinedTheRoom(), 
              onKeyDown:this.onKeyDown, ref:"textbox"})
          )
        )
      )
    )
  )
  }
})

function writingStatus(usersWrite){
  return React.DOM.span(null, 
    usersWrite && usersWrite.map(renderUserWrite),
    usersWrite && !_(usersWrite).isEmpty() && " typing ..."
  )
}

function renderUserWrite(user, i){
  return React.DOM.span(null, i !== 0 && ',',user.name)
}

});
require.register("JSChat/reacts/Contact.js", function(exports, require, module){
/** @jsx React.DOM */
var ContactModel = require('../models/Contact');

module.exports = React.createClass({
  mixins: [require('./BackboneMixin')],
  getBackboneModels : function(){
    return [this.props.user]
  },
  render: function(){
    return React.DOM.span( {className:  "label label-default"}, 
      this.props.user.name
    )
  }
});

});
require.register("JSChat/reacts/ContactList.js", function(exports, require, module){
/** @jsx React.DOM */
var _ = require('underscore');
var RoomFactory = require('../models/RoomFactory');

var roomContact = function(roomId){
  var room = RoomFactory.getRoomModel(roomId);
  return React.DOM.div( {className:room.get('id') == this.props.room.get('id') && "current"}, 
    React.DOM.a( {href:'#room/' + room.get('id'), target:"_self"}, room.get('name'))
  )
}

module.exports = React.createClass({
  render: function(){
    var rooms = this.props.me.get('rooms');
    return React.DOM.div( {className:"col-sm-4 col-md-2 contactList"}, 
      React.DOM.h3(null, "Rooms"),
      rooms.map(roomContact, this)
    )
  }
})

});
require.register("JSChat/reacts/Home.js", function(exports, require, module){
/** @jsx React.DOM */
var RoomsModel = require('../models/Rooms');
var room = require('../models/Room');
var rooms = new RoomsModel();
var ContactFactory = require('../models/ContactFactory');

var renderUsers = function(uid){
  var user = ContactFactory.getContactModel(uid);
  this.injectModel(user);
  return React.DOM.img( {src:  user.get('gh_avatar'), title:user.name})
}

var aRoom = function(data){
  var users = data.participants.slice(-10);
  return React.DOM.div( {className:  "col-xs-3"}, 
    React.DOM.div( {className:"chat-badge"}, 
      React.DOM.h4(null, React.DOM.a( {href:'#room/' + data.id, target:"_self"}, data.name)),
      React.DOM.small(null, data.description),
       React.DOM.div(null, users.map(renderUsers, this))
    )
  )
}
var Nav = require('./Nav.js');

module.exports = React.createClass({
  mixins: [require('../models/ModelMixin')],
  getBackboneModels: function(){
    return [this.props.rooms, this.props.me]
  },
  getInitialState: function(){
    return {
        rooms: []
      }
  },
  newRoomNameHandle: function(evt){
    this.newRoomName = evt.target.value;
  },
  newRoomDescHandle: function(evt){
    this.newRoomDesc = evt.target.value;
  },
  createRoom: function(evt){
    this.props.rooms.create({
      name: this.newRoomName,
      description: this.newRoomDesc
    }, {
      success: function(model, roomId){
        var newRoom = new room({id:roomId});
        newRoom.join();
        this.fetchRooms();
        document.location = "#room/" + roomId;
      }.bind(this)
    });
  },
  fetchRooms: function(){
    this.props.rooms.fetch({
      success:function(model, data){
        this.setState({rooms: data})
      }.bind(this)
    });
  },
  componentDidMount: function(){
    this.fetchRooms();
  },
  render: function(){
    console.log("RENDER HOME");
    return React.DOM.div(null, 
      Nav( {me:this.props.me}),
      React.DOM.div( {className:"container"}, 
        React.DOM.div( {className:  "row"}, 
          this.state.rooms.map(aRoom, this)
        ),
        React.DOM.div( {className: "form-group col-xs-6"}, 
          React.DOM.h4(null, "create new room"),
          React.DOM.input( {type:"text", className:"form-control", onChange:  this.newRoomNameHandle, placeholder:"name"}),
          React.DOM.br(null),
          React.DOM.textarea( {className:  "form-control", placeholder:"description", onChange:  this.newRoomDescHandle}),
          React.DOM.br(null),
          React.DOM.button( {onClick:this.createRoom, className:"btn btn-success", disabled:!this.props.me.get('id')}, "Create")
        )
      )
  )
  }
});

});
require.register("JSChat/reacts/Login.js", function(exports, require, module){
/** @jsx React.DOM */
var Nav = require('./Nav.js');
module.exports = React.createClass({
  render: function(){
    return React.DOM.div(null, 
      Nav(null ),
      React.DOM.div( {className:"container"}, 
        React.DOM.div( {className:"jumbotron"}, 
          React.DOM.h2(null, "Login/signup chat"),
          React.DOM.a( {className:"btn btn-success", href:"/auth/github", target:"_self"}, "Login with GitHub")
        )
      )
    )
  }
});

});
require.register("JSChat/reacts/Message.js", function(exports, require, module){
/** @jsx React.DOM */
module.exports = function(item, i, items){
  var user = function(message, previous){
    // if message is from same user as previous message
    if(previous && previous.__user && message.__user && previous.__user 
       && message.__user === previous.__user) {
        return;
       }
    if(!message.__user) return;
    var data = message.__user;
    var avatar = data.get('gh_avatar');
    var cn = "nick text " + (parseInt(data.get('online'))?"online":"");
    return React.DOM.div( {className:"msg user"}, 
      React.DOM.div( {className:"avatar"}, 
        React.DOM.img( {src:avatar} ) 
        
      ),
      React.DOM.div( {className:cn}, 
        React.DOM.span( {className:"status"}),
        message.__user.name,": "
      )
    )
  }
  if(item.get('action') == "JOIN" || item.get('action') == "LEAVE"){
    return React.DOM.div(null, 
       React.DOM.div( {className:"nick text"}, 
        item.__user.name + ' ', React.DOM.span( {dangerouslySetInnerHTML:{__html:item.get('text')}})
       )
    );
  }
  if(!item.get('id')) return;
  var date = {
    hh:item.date.getHours(),
    mm:item.date.getMinutes()
  }
  if(date.hh < 10) date.hh = '0' + date.hh;
  if(date.mm < 10) date.mm = '0' + date.mm;
  return React.DOM.div(null, 
    user(item, items[i-1]),
    React.DOM.div( {className:"msg"}, 
      React.DOM.div( {className:"time"}, 
        item.date && ([date.hh, date.mm].join(":"))
      ),
      React.DOM.div( {className:"text", dangerouslySetInnerHTML:{__html:item.text}}
      )
    )
  )
}

});
require.register("JSChat/reacts/MessagesList.js", function(exports, require, module){
/** @jsx React.DOM */
var ContactFactory = require('../models/ContactFactory');

var IScroll = require('IScroll');
var GETTING_TO_CONST = 5;
module.exports = function(itemClass){
  return React.createClass({
    mixins: [require('../models/ModelMixin')],
    getBackboneModels: function(){
      return [this.props.messages]
    },
    lastScrollPosition: null,
    iscroll: null,
    scrollDirectionDown: true,
    scroll: function(e){
      if(this.autoscrolling) return;
      this.scrollDirectionDown = e.y < this.lastScrollPosition

      if(this.props.onTop && e.y == 0 ){
        this.props.onTop(e);
      };
      if(this.props.onBottom && e.y == e.maxScrollY ){
        this.props.onBottom(e);
      };
      if(this.props.onGetToBottom && this.scrollDirectionDown &&
          e.y < e.maxScrollY - e.wrapperHeight * GETTING_TO_CONST){
        this.props.onGetToBottom(e);
      }

      if(this.props.onGetToTop && !this.scrollDirectionDown && 
          e.y > -e.wrapperHeight * GETTING_TO_CONST){
        this.props.onGetToTop(e);
      }
    },
    scrollToBottom: function(time){
      this.autoscrolling = true;
      this.iscroll.scrollTo(0, this.iscroll.maxScrollY, time);
    },
    componentDidMount: function(){
      this.iscroll = new IScroll(this.getDOMNode(), {
        mouseWheel: true,
        scrollbars: true
      });
      // populate User model inside object
      this.props.messages.models.forEach(function(model){
        console.log(model);
        populateUser(model,this)
      }.bind(this));
      this.props.messages.on('change add remove', function(){
        this.props.messages.models.forEach(function(model){
          if(model.__user && !model.__user.injected) populateUser(model, this);
        }.bind(this));
      }.bind(this));

      function populateUser(message, component){
        message.__user.injected = true;
        component.injectModel(message.__user);
      };
      /*
      this.lastScrollHeight = this.iscroll.scrollerHeight;
      /*var checkPosition = setInterval(function(){
        if(this.iscroll.y !== this.lastScrollPosition && !this.autoscrolling){
          //this.scroll.call(this, this.iscroll);
          this.lastScrollPosition = this.iscroll.y;
        }
      }.bind(this), 30);
      this.iscroll.on('scrollEnd', function(){
        if(!this.autoscrolling) return;
        this.autoscrolling = false;
        this.lastScrollPosition = this.iscroll.y;
      }.bind(this));*/
    },
    lastScrollHeight: null,
    componentDidUpdate:function(){
      this.iscroll.refresh();
      if(!this.scrollDirectionDown){
        var diff = this.iscroll.scrollerHeight - this.lastScrollHeight;
        setTimeout(function(){
          this.iscroll.scrollTo(0, this.lastScrollPosition - diff, 0);
        }.bind(this), 0)
      }
      this.lastScrollHeight = this.iscroll.scrollerHeight;
    },
    render: function() {
      return React.DOM.div( {className:"messagesList"}, 
        React.DOM.div( {onScroll: this.notify}, 
          React.DOM.div( {id:"scroller"} , 
            this.props.messages && this.props.messages.models.map(itemClass),
            React.DOM.div( {className:"writingBar"}, this.props.writingStatus)
          )
        )
      );
    }
  });
}

});
require.register("JSChat/reacts/Nav.js", function(exports, require, module){
/** @jsx React.DOM */
module.exports = React.createClass({
  render: function(){
    var user = function(meModel){
      if(meModel && meModel.get('id')){
        return React.DOM.li(null, 
          React.DOM.a( {href:"#", target:"_self"}, meModel.get('displayName') || meModel.get('gh_username'))
        );
      } else {
        return React.DOM.li(null, 
          React.DOM.a( {href:"/auth/github", target:"_self"}, "Login with GitHub")
        ) 
      }
    }
    return React.DOM.nav( {className:"navbar navbar-default", role:"navigation"}, 
      React.DOM.div( {className:"navbar-header"}, 
        React.DOM.a( {className:"navbar-brand", href:"#", target:"_self"}, "JSchat")
      ),
      React.DOM.ul( {className:"nav navbar-nav navbar-right"}, 
        user(this.props.me)
      )
    )
  }
});

});
require.register("JSChat/reacts/ParticipantsList.js", function(exports, require, module){
/** @jsx React.DOM */
var Contact = require('./Contact');
var ContactFactory = require('../models/ContactFactory');

var ContactItem = function(item){
  var user = ContactFactory.getContactModel(item);
  return Contact( {user:  user});
}

module.exports = React.createClass({
  render: function(){
    var participants = this.props.room.toJSON();
    participants.users = participants.users||[];
    return React.DOM.div( {className:"participants"}, participants.users.map(ContactItem))
  }
});

});
require.register("JSChat/router.js", function(exports, require, module){
/** @jsx React.DOM */
var backbone = require('exoskeleton');
var Me = require('./models/Me');
//var RoomModel = require('./models/Room');
var Rooms = require('./models/Rooms');
var notification = require('./services/notification');
var processMessage;
backbone.socket.addEventListener("message", function(data, type){
  try{
    data = JSON.parse(data);
  }catch(e){
    console.log('cant parse data', data);
  }
  if(processMessage){
    processMessage.call(this, data, type);
  }
});
var router = backbone.Router.extend({
  routes: {
    '': 'main',
    'room/:id': 'room'
  },
  main: function () {
    var Home = require('./reacts/Home');
    Me.fetch();
    React.unmountComponentAtNode(document.body.children[0]);
    React.renderComponent(Home( {me:Me, rooms:new Rooms()}), document.body.children[0]);
  },
  room: function (id){
    Me.fetch({success: gotProfile, error: gotProfile});
    function gotProfile(){
      if(Me.get('id')){
        React.unmountComponentAtNode(document.body.children[0]);
        var ChatRoom = require('./reacts/ChatRoom');
        var Room = require('./models/Room');
        
        var Messages = require('./models/Messages');
        var messages = new Messages(null, {roomId: id});
        var room = new Room({id : id});
        var component = React.renderComponent(ChatRoom( {me:Me, 
          room:  room,
          messages:  messages,
          rooms:  new Rooms()} ),
        document.body.children[0]);
        component.refresh();

        processMessage = function(data, type){
          if(data.type == "WRITING" && id == data.rid){
            room.writing(data.uid);
            return;
          }
          if(data.action == "JOIN" || data.action == "LEAVE"){
            // todo: optimize
            room.fetch();
          }
          if(data.rid == id && messages && component){
            var model = messages.push(data);
            if(model.__user){
              var data = model.__user;
              // throw notification
              if(notification.shouldNotify()){
                var note = notification.show(data.get('gh_avatar'), data.get('displayName') || data.get('gh_username'), model.get('text'));
                // focus on window if notification is clicked
                note.onclick = function(){
                  window.focus();
                }
                if(note){
                  setTimeout(function(){
                    note.cancel();
                  }, 2000);
                }
              }
            }
            component.refs.messagesList.scrollToBottom();
          }
        }

      } else {
        var Login = require('./reacts/Login');
        React.renderComponent(Login(null), document.body.children[0]);
      }
    }
  }
});
module.exports = new router();

});
require.register("JSChat/services/notification.js", function(exports, require, module){
module.exports = {
  show: function(img, title, text){
    if (window.webkitNotifications.checkPermission() == 0) {
      var notification = window.webkitNotifications.createNotification(img, title, text);
      notification.show();
      return notification;
    } else {
      console.log("No premission for notification");
    }
  },
  access: function(){
    if (window.webkitNotifications.checkPermission() != 0) {
      window.webkitNotifications.requestPermission();
    }
  },
  shouldNotify: function(){
    return document.hidden || document.mozHidden || document.msHidden || document.webkitHidden;
  }
}


});

























require.alias("edjafarov-socker/socker.client.js", "JSChat/deps/socker-client/socker.client.js");
require.alias("edjafarov-socker/socker.client.js", "JSChat/deps/socker-client/index.js");
require.alias("edjafarov-socker/socker.client.js", "socker-client/index.js");
require.alias("edjafarov-socker/socker.client.js", "edjafarov-socker/index.js");
require.alias("edjafarov-bbsocker.sync/bbsocker.sync.js", "JSChat/deps/bbsocker.sync/bbsocker.sync.js");
require.alias("edjafarov-bbsocker.sync/bbsocker.sync.js", "JSChat/deps/bbsocker.sync/index.js");
require.alias("edjafarov-bbsocker.sync/bbsocker.sync.js", "bbsocker.sync/index.js");
require.alias("edjafarov-underscore/index.js", "edjafarov-bbsocker.sync/deps/underscore/index.js");

require.alias("edjafarov-bbsocker.sync/bbsocker.sync.js", "edjafarov-bbsocker.sync/index.js");
require.alias("jashkenas-underscore/underscore.js", "JSChat/deps/underscore/underscore.js");
require.alias("jashkenas-underscore/underscore.js", "JSChat/deps/underscore/index.js");
require.alias("jashkenas-underscore/underscore.js", "underscore/index.js");
require.alias("jashkenas-underscore/underscore.js", "jashkenas-underscore/index.js");
require.alias("learnboost-engine.io-client/lib/index.js", "JSChat/deps/engine.io/lib/index.js");
require.alias("learnboost-engine.io-client/lib/socket.js", "JSChat/deps/engine.io/lib/socket.js");
require.alias("learnboost-engine.io-client/lib/transport.js", "JSChat/deps/engine.io/lib/transport.js");
require.alias("learnboost-engine.io-client/lib/emitter.js", "JSChat/deps/engine.io/lib/emitter.js");
require.alias("learnboost-engine.io-client/lib/util.js", "JSChat/deps/engine.io/lib/util.js");
require.alias("learnboost-engine.io-client/lib/transports/index.js", "JSChat/deps/engine.io/lib/transports/index.js");
require.alias("learnboost-engine.io-client/lib/transports/polling.js", "JSChat/deps/engine.io/lib/transports/polling.js");
require.alias("learnboost-engine.io-client/lib/transports/polling-xhr.js", "JSChat/deps/engine.io/lib/transports/polling-xhr.js");
require.alias("learnboost-engine.io-client/lib/transports/polling-jsonp.js", "JSChat/deps/engine.io/lib/transports/polling-jsonp.js");
require.alias("learnboost-engine.io-client/lib/transports/websocket.js", "JSChat/deps/engine.io/lib/transports/websocket.js");
require.alias("learnboost-engine.io-client/lib/transports/flashsocket.js", "JSChat/deps/engine.io/lib/transports/flashsocket.js");
require.alias("learnboost-engine.io-client/lib/index.js", "JSChat/deps/engine.io/index.js");
require.alias("learnboost-engine.io-client/lib/index.js", "engine.io/index.js");
require.alias("component-emitter/index.js", "learnboost-engine.io-client/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-indexof/index.js", "learnboost-engine.io-client/deps/indexof/index.js");

require.alias("component-global/index.js", "learnboost-engine.io-client/deps/global/index.js");

require.alias("component-has-cors/index.js", "learnboost-engine.io-client/deps/has-cors/index.js");
require.alias("component-has-cors/index.js", "learnboost-engine.io-client/deps/has-cors/index.js");
require.alias("component-global/index.js", "component-has-cors/deps/global/index.js");

require.alias("component-has-cors/index.js", "component-has-cors/index.js");
require.alias("component-ws/index.js", "learnboost-engine.io-client/deps/ws/index.js");
require.alias("component-ws/index.js", "learnboost-engine.io-client/deps/ws/index.js");
require.alias("component-global/index.js", "component-ws/deps/global/index.js");

require.alias("component-ws/index.js", "component-ws/index.js");
require.alias("LearnBoost-engine.io-protocol/lib/index.js", "learnboost-engine.io-client/deps/engine.io-parser/lib/index.js");
require.alias("LearnBoost-engine.io-protocol/lib/keys.js", "learnboost-engine.io-client/deps/engine.io-parser/lib/keys.js");
require.alias("LearnBoost-engine.io-protocol/lib/index.js", "learnboost-engine.io-client/deps/engine.io-parser/index.js");
require.alias("LearnBoost-engine.io-protocol/lib/index.js", "LearnBoost-engine.io-protocol/index.js");
require.alias("visionmedia-debug/index.js", "learnboost-engine.io-client/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "learnboost-engine.io-client/deps/debug/debug.js");

require.alias("learnboost-engine.io-client/lib/index.js", "learnboost-engine.io-client/index.js");
require.alias("paulmillr-exoskeleton/exoskeleton.js", "JSChat/deps/exoskeleton/exoskeleton.js");
require.alias("paulmillr-exoskeleton/exoskeleton.js", "JSChat/deps/exoskeleton/index.js");
require.alias("paulmillr-exoskeleton/exoskeleton.js", "exoskeleton/index.js");
require.alias("paulmillr-exoskeleton/exoskeleton.js", "paulmillr-exoskeleton/index.js");










require.alias("chjj-marked/lib/marked.js", "JSChat/deps/marked/lib/marked.js");
require.alias("chjj-marked/lib/marked.js", "JSChat/deps/marked/index.js");
require.alias("chjj-marked/lib/marked.js", "marked/index.js");
require.alias("chjj-marked/lib/marked.js", "chjj-marked/index.js");

require.alias("IScroll/iscroll.js", "JSChat/deps/IScroll/iscroll.js");
require.alias("IScroll/iscroll.js", "JSChat/deps/IScroll/index.js");
require.alias("IScroll/iscroll.js", "IScroll/index.js");
require.alias("IScroll/iscroll.js", "IScroll/index.js");
require.alias("davy/davy.js", "JSChat/deps/davy/davy.js");
require.alias("davy/subsequent.js", "JSChat/deps/davy/subsequent.js");
require.alias("davy/davy.js", "JSChat/deps/davy/index.js");
require.alias("davy/davy.js", "davy/index.js");
require.alias("davy/davy.js", "davy/index.js");
require.alias("JSChat/Main.js", "JSChat/index.js");
var scripts = document.getElementsByTagName('script');
for(var i=0; i < scripts.length; i++){
  var dataMain = scripts[i].getAttribute('data-main');
  if(dataMain){
    require(dataMain);
    break;
  }
}


