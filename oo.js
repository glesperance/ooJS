/******************************************************************************
 * extend is used when you want to merge to copy a parent's property to the 
 * child.
 *  
 * Options:
 *  ** overwrite **
 *      Copy all of the parent's properties to the child even if
 *      overwriting those if needed.   
 *                   
 *  **copyOnWrite**
 *      returns a new copy of the child, leaving the original one
 *      untouched, if modified.
 * 
 * @param child the child object
 * @param parent the parent object
 * @param options the option object      
 * @returns `child` or a copy of `child` (with options.copyOnWrite === true)
 * @api public
 */
function extend(child, parent, options) {
  
  var options = options || {}
    , child_copy = undefined;

  for(var prop in parent) {
    if(typeof parent[prop] !== 'undefined' && parent[prop] !== child[prop]) {
      var dst = undefined;
      
      if(options.copyOnWrite) {
        child_copy = child_copy || __extends({}, child);
        dst = child_copy
      }else{
        dst = child;
      }
      
      dst[prop] = (!options.overwrite && typeof dst[prop] !== 'undefined' ? dst[prop] : parent[prop]);
    }
  }
  return child_copy || child;
};
exports.extend = extend;

/******************************************************************************
 * deepExtend is used when you want to merge two objects together, by 
 * recursively traversing the objects and adding a parent's property to the 
 * child.
 * 
 * Arrays are merged.
 * 
 * Options:
 *  ** overwrite **
 *      Copy all of the parent's properties to the child even if
 *      overwriting those if needed.   
 *                   
 *  **copyOnWrite**
 *      returns a new copy of the child, leaving the original one
 *      untouched, if modified.
 *
 * 
 * @param child the child object
 * @param parent the parent object
 * @param options the object containing the options
 * @returns {child | copy of Child (with options.copyOnWrite === true) }
 */
function deepExtend(child, parent, options) { 
  
  var options = options || {}
    , child_copy = undefined
    ;

  for (var prop in parent) {
  
    //ignore all `undefined` and equal props
    if(typeof parent[prop] !== 'undefined' && parent[prop] !== child[prop] ) {
      var dst;
      
      if(options.copyOnWrite) {
        child_copy = child_copy || __extends({}, child);
        dst = child_copy;
      }else{
        dst = child;
      }
    
      //if the current prop is an object, and is not `null` we recurse
      if(typeof parent[prop] === 'object' 
      && parent[prop] !== null 
      && !Array.isArray(parent[prop])
      && typeof parent[prop] === typeof dst[prop]
      )
      {        
        dst[prop] = dst[prop] || new parent[prop].constructor();
        dst[prop] = arguments.callee(dst[prop], parent[prop], options);
      }else{
        //
        // if the prop is *not* an object (or is null)
        // copy it in the child if it doesn't already exists
        //  
        
        if(typeof parent[prop] === 'object' 
        && parent[prop] !== null 
        && Array.isArray(parent[prop])
        )
        { 
          
          if( !Array.isArray(dst[prop]) && 
              ( typeof dst[prop] === 'undefined' 
              || dst[prop] === null 
              || options.overwrite === true
              )
          ){
            dst[prop] = [];
          }
              
          if(Array.isArray(dst[prop])) {
          
            for(var i = 0, ii = parent[prop].length; i < ii; i++) {
              dst[prop].push(arguments.callee({}, parent[prop][i], options));
            }
          }          
        }else{
          dst[prop] = (!options.overwrite && typeof dst[prop] !== 'undefined' ? dst[prop] : parent[prop]);
        }
      }
    }
  }
  return child_copy || child;
};

exports.deepExtend = deepExtend;

/******************************************************************************
 * Performs inheritance of parent attributes/functions to child
 * 
 * @param child The child object
 * @param parent The parent object
 */
function inherit(child, parent, options) {
  
  if(options && options.deepExtend) {
    //copy all members of parents to this (the child)
    deepExtend(child, parent);
  } else {
    extend(child, parent);
  }
  
  //constructor helper
  function ctor() { this.constructor = child; }
  
  //set ctor prototype to the parent's
  ctor.prototype = parent.prototype;
  
  // Put the parent's prototype in the child's prototype hierarchy
  //
  // i.e. set the child's prototype to new object such that
  //
  // (1) child.prototype.constructor = parent.contructor = child
  // (2) child.prototype.__proto__   = parent.__proto__ 
  //                                 = ctor.prototype 
  //                                 = parent.prototype
  //
  child.prototype = extend(new ctor, child.prototype, {overwrite: true});
  
  //save the parent's prototype for future reference
  child.__super__ = parent;
};

exports.inherit = inherit;

/******************************************************************************
 * Placeholder used to implement interfaces or abstract classes.
 * 
 * @param name the name of the placeholder function
 */
function unimplemented(name) {
  return function(){
    throw 'xxx function ' + name + '() hasn not been implemented';
  };
};