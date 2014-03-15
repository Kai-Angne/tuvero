/*
 * Interface Test
 */
define([ '../../lib/interface' ], function (Interface) {
  QUnit.test("Interface Implementation Validator", function () {
    var intf;

    QUnit.equal(Interface(Interface.selfInterface, Interface, 'ifm'), '', 'self-matching');

    intf = {};

    QUnit.notEqual(Interface(intf), '', "empty interface");

    intf = {
      Interface : {}
    };

    QUnit.equal(Interface(intf), '', "minimal interface");

    intf = {
      Interface : []
    };

    QUnit.notEqual(Interface(intf), '', "empty array interface");

    intf = [];

    QUnit.notEqual(Interface(intf), '', "array as interface (wrong type)");

    intf = {
      Interface : [ undefined ]
    };

    QUnit.notEqual(Interface(intf), '', "array interface with undefined");

    intf = {
      Interface : [ {} ]
    };

    QUnit.notEqual(Interface(intf), '', "array interface with empty object");

    intf = {
      Interface : [ 5 ]
    };

    QUnit.equal(Interface(intf), '', "minimal array interface");

    intf = {
      Interface : [ 5 ],
      Extends : [ {
        Interface : {}
      } ]
    };

    QUnit.equal(Interface(intf), '', "array interface with Extends");

    intf = {
      Interface : {
        asd : function () {
        },
      }
    };

    QUnit.equal(Interface(intf), '', "interface with function");

    intf = {
      Interface : {
        otherinterface : intf,
        funky : function () {
        }
      }
    };

    QUnit.equal(Interface(intf), '', "nested Interfaces");

    intf.Interface.otherinterface = intf;

    QUnit.equal(Interface(intf), '', "directly infinitely nested Interfaces");

    intf = {
      Interface : {
        otherinterface : {
          Interface : {
            firstinterface : undefined
          }
        },
        funky : function () {
        }
      }
    };

    intf.Interface.otherinterface.Interface.firstinterface = intf;

    QUnit.equal(Interface(intf), '', "second order infinitely nested Interfaces");

    intf.Interface.otherinterface.Interface.error = {};

    QUnit.notEqual(Interface(intf), '', "second order infinitely nested Interfaces with invalid data type");

    intf = {
      Interface : {
        asd : 0
      }
    };

    QUnit.equal(Interface(intf), '', "Interface with number");

    intf = {
      Interface : {
        asd : undefined
      }
    };

    QUnit.notEqual(Interface(intf), '', "Interface with undefined");

    intf = {
      Interface : {
        asd : "asd"
      }
    };

    QUnit.equal(Interface(intf), '', "Interface with string");

    intf = {
      Interface : {
        asd : /asd/g
      }
    };

    QUnit.equal(Interface(intf), '', "Interface with regexp");

    intf = {
      Interface : {
        asd : new Date()
      }
    };

    QUnit.equal(Interface(intf), '', "Interface with date");

    intf = {
      Interface : {
        asd : true
      }
    };

    QUnit.equal(Interface(intf), '', "Interface with bool");

    intf = {
      Interface : {
        asd : [ 4, 8, 15, 16, 23, 42 ]
      }
    };

    QUnit.equal(Interface(intf), '', "Interface with array");

    intf = {
      Interface : {
        asd : {}
      }
    };

    QUnit.notEqual(Interface(intf), '', "invalid nesting");

    intf = {
      Interface : {
        intf : intf
      }
    };

    QUnit.notEqual(Interface(intf), '', "invalid nesting 2");

    intf = {
      Interface : {},
      ASD : 0,
      ASE : "0",
      ASF : new Date(0),
      ASG : /0/,
      ASH : undefined,
      ASJ : false
    };

    QUnit.equal(Interface(intf), '', "valid atomic constants");

    intf = {
      Interface : {},
      CONSTANT : {
        ASD : 0,
        ASE : "0",
        ASF : new Date(0),
        ASG : /0/,
        ASH : undefined,
        ASJ : false
      }
    };

    QUnit.equal(Interface(intf), '', "valid constants within an object");

    intf = {
      Interface : {},
      CONSTANT : {
        ASD : function () {
        },
      }
    };

    QUnit.notEqual(Interface(intf), '', "invalid constants within an object");

    intf = {
      Interface : {},
      CONSTANT : {
        asd : 5,
      }
    };

    QUnit.notEqual(Interface(intf), '', "invalid constant name within an object");

    intf = {
      Interface : {},
      ASD : []
    };

    QUnit.equal(Interface(intf), '', "empty constant array");

    intf = {
      Interface : {},
      ASD : [ 0, "0", new Date(0), /0/, undefined, false ]
    };

    QUnit.equal(Interface(intf), '', "array of atomic constants");

    intf = {
      Interface : {},
      ASD2 : 0
    };

    QUnit.equal(Interface(intf), '', "upper case alphanumerical constant name");

    intf = {
      Interface : {},
      ASd : 0
    };

    QUnit.notEqual(Interface(intf), '', "constant not all caps 1");

    intf = {
      Interface : {},
      asd : 0
    };

    QUnit.notEqual(Interface(intf), '', "constant not all caps 2");

    intf = {
      Interface : {},
      AS_D : 0
    };

    QUnit.notEqual(Interface(intf), '', "constant not all caps 3");

    intf = {
      Interface : {},
      A : "ASD",
      B : true,
      C : [ 0, "dux", {
        F : 5
      } ],
      D : undefined,
      E : /imaregex/
    };

    QUnit.equal(Interface(intf), '', "valid constants");

    intf = {
      Interface : {},
      A : function () {
      }
    };

    QUnit.notEqual(Interface(intf), '', "function as constant");

    intf = {
      Interface : {},
      a : function () {
      },
      asd : function () {
      },
      a4 : function () {
      },
      aSdF : function () {
      },
      aSdF5 : function () {
      }
    };

    QUnit.equal(Interface(intf), '', "global function name tests");

    intf = {
      Interface : {},
      6 : function () {
      }
    };

    QUnit.notEqual(Interface(intf), '', 'numerical global function name');

    intf = {
      Interface : {},
      Extends : {
        Interface : {}
      }
    };

    QUnit.notEqual(Interface(intf), '', 'Extends is no array');

    intf = {
      Interface : {},
      Extends : []
    };

    QUnit.equal(Interface(intf), '', 'Extends is empty');

    intf = {
      Interface : {},
      Extends : [ {
        Interface : {}
      } ]
    };

    QUnit.equal(Interface(intf), '', 'Extends is minimal');

    intf.Extends.push(intf);
    QUnit.equal(Interface(intf), '', 'Extends is recursively nested');

    intf = {
      Interface : {},
      Extends : [ {} ]
    };

    QUnit.notEqual(Interface(intf), '', 'Extends contains invalid Interface');

    intf.Extends = [];
    intf.Extends[1] = {
      Interface : {}
    };
    intf.Extends[5] = intf;

    QUnit.notEqual(Interface(intf), '', 'Extends isn\'t compact');

    intf = {
      Interface : {},
      Requires : {
        Interface : {}
      }
    };

    QUnit.notEqual(Interface(intf), '', 'Requires is no array');

    intf = {
      Interface : {},
      Requires : []
    };

    QUnit.equal(Interface(intf), '', 'Requires is empty');

    intf = {
      Interface : {},
      Requires : [ {
        Interface : {}
      } ]
    };

    QUnit.equal(Interface(intf), '', 'Requires is minimal');

    intf.Requires.push(intf);
    QUnit.equal(Interface(intf), '', 'Requires is recursively nested');

    intf = {
      Interface : {},
      Requires : [ {} ]
    };

    QUnit.notEqual(Interface(intf), '', 'Requires contains invalid Interface');

    intf.Requires = [];
    intf.Requires[1] = {
      Interface : {}
    };
    intf.Requires[5] = intf;

    QUnit.notEqual(Interface(intf), '', 'Requires isn\'t compact');

    intf = {
      Interface : {
        asd : 0,
        dsa : function () {
        }
      },
      Extends : [],
      Requires : []
    };

    QUnit.equal(Interface(Interface.combine(intf, intf, intf)), '', 'Interface.combine returned interface validation');
  });

  QUnit.test("Interface Implementation Matcher", function () {
    var intf, obj, Obj;

    intf = {};
    obj = {};

    QUnit.notEqual(Interface(), '', "missing arguments");
    QUnit.notEqual(Interface.match(intf), '', "missing obj");
    QUnit.notEqual(Interface(undefined, obj), '', "missing intf");

    QUnit.notEqual(Interface(intf, obj, 'i'), '', "interface validator invocation: missing Interface member");
    intf = {
      Interface : {
        asd : undefined
      }
    };
    QUnit.notEqual(Interface(intf, obj, 'i'), '', "interface validator invocation: invalid type");

    intf = {
      Interface : {}
    };

    QUnit.equal(Interface(intf, obj), '', "valid empty interface match");
    QUnit.equal(Interface(intf, obj, 'f'), '', "option 'f'");
    QUnit.equal(Interface(intf, obj, 'm'), '', "option 'm'");
    QUnit.equal(Interface(intf, obj, 'r'), '', "option 'r' without subinterfaces");

    obj = {
      asd : 5
    };

    QUnit.equal(Interface(intf, obj), '', "default option with additional member");
    QUnit.notEqual(Interface(intf, obj, 'm'), '', "option 'm' with member");
    QUnit.equal(Interface(intf, obj, 'f'), '', "option 'f' with member");

    obj = {
      asd : function () {
      }
    };

    QUnit.notEqual(Interface(intf, obj, 'f'), '', "option 'f' with function");
    QUnit.equal(Interface(intf, obj, 'm'), '', "option 'm' with function");

    intf = {
      Interface : {
        asd : function () {
        }
      }
    };

    obj = {};

    QUnit.notEqual(Interface(intf, obj, 'i'), '', "missing function");

    obj = {
      asd : function () {
      }
    };

    QUnit.equal(Interface(intf, obj), '', "object with function");

    obj = {
      asd : "5"
    };

    QUnit.notEqual(Interface(intf, obj), '', "object with member of wrong type");

    Obj = function () {
      this.asd = function () {
      };
      return this;
    };

    obj = new Obj();

    QUnit.notEqual(Interface(intf, Obj), '', "class with local function");
    QUnit.equal(Interface(intf, obj), '', "instance with local function");

    Obj = function () {
      return this;
    };
    Obj.prototype.asd = function () {
    };

    obj = new Obj();

    QUnit.equal(Interface(intf, obj), '', "instance with prototype function");
    QUnit.equal(Interface(intf, Obj), '', "class with prototype function");

    intf = {
      Interface : {
        intf : {
          Interface : {
            asd : function () {
            }
          }
        }
      }
    };

    obj = {};

    QUnit.notEqual(Interface(intf, obj), '', "nested interface: missing subinterface");

    obj = {
      intf : {}
    };

    QUnit.equal(Interface(intf, obj, 'i'), '', "nested interface: non-recursive false positive");
    QUnit.equal(Interface(intf, obj, 'i'), '', "nested interface: non-recursive false positive");

    obj.intf.asd = function () {
    };
    QUnit.equal(Interface(intf, obj, 'r'), '', "nested interface: recursive success");

    intf = {
      Interface : {
        sub : undefined
      }
    };
    intf.Interface.sub = intf;

    obj = {
      sub : undefined
    };
    obj.sub = obj;

    QUnit.equal(Interface(intf, obj, 'r'), '', "infinite recursion, first order (both)");

    obj.sub = {
      sub : obj
    };

    QUnit.equal(Interface(intf, obj, 'r'), '', "infinite recursion, second order (obj)");

    intf.Interface.sub = {
      Interface : {
        sub : intf
      }
    };

    QUnit.equal(Interface(intf, obj, 'r'), '', "infinite recursion, second order (both)");

    obj.sub = obj;
    QUnit.equal(Interface(intf, obj, 'r'), '', "infinite recursion, second order (intf)");

    intf = {
      Interface : {
        asd : {
          Interface : {
            dsa : undefined
          }
        }
      }
    };
    intf.Interface.asd.Interface.dsa = intf;

    obj = {
      asd : undefined,
      dsa : undefined
    };
    obj.asd = obj.dsa = obj;

    QUnit.equal(Interface(intf, obj, 'r'), '', "infinite recursion, multiple interface matching");

    obj.dsa = undefined;
    QUnit.notEqual(Interface(intf, obj, 'r'), '', "infinite recursion, multiple interfaces, nesting depth test");

    intf = {
      Interface : {
        asd : function () {
        }
      },
      Extends : [ {
        Interface : {
          dsa : function () {
          }
        }
      } ]
    };

    obj = {
      asd : function () {
      },
    };

    QUnit.notEqual(Interface(intf, obj, 'r'), '', "Extends: missing function");

    obj.dsa = function () {
    };

    QUnit.equal(Interface(intf, obj, 'r'), '', "Extends: valid object");
    QUnit.equal(Interface(intf, obj, 'rfm'), '', "Extends: valid object, strict matching");

    intf = {
      Interface : {
        asd : function () {
        }
      },
      Extends : [ {
        Interface : {
          asd : function () {
          }
        }
      } ]
    };

    obj = {
      asd : function () {
      }
    };

    QUnit.equal(Interface(intf, obj, 'r'), '', "Extends: function overload");

    intf.Extends.push(intf);
    QUnit.equal(Interface(intf, obj, 'r'), '', "Extends: recursion");

    intf.Extends = [];
    QUnit.equal(Interface(intf, obj, 'r'), '', "Extends: empty interface");

    intf = {
      Interface : [ 4 ]
    };
    obj = {};
    obj[0] = 5;

    QUnit.notEqual(Interface(intf, obj, 'r'), '', "array interface with an object object");

    obj = [ 6 ];
    QUnit.equal(Interface(intf, obj, 'r'), '', "array interface with an array object");

    intf = {
      Interface : [ 4, "5" ]
    };
    obj = [ "6", 7 ];
    QUnit.equal(Interface(intf, obj, 'r'), '', "array: multiple datatypes");

    obj = [ /0/ ];
    QUnit.notEqual(Interface(intf, obj, 'r'), '', "array: mismatching element type");

    intf = {
      Interface : [ [ 5, /5/ ] ]
    };
    obj = [ [ 1, /2/ ], [ 1 ], [ /3/ ], [] ];
    QUnit.equal(Interface(intf, obj, 'r'), '', "array match: nested arrays");

    intf = {
      Interface : [ [ 5 ], [ /5/ ] ]
    };
    obj = [ [ 1, /2/ ], [ 1 ], [ /3/ ], [] ];
    QUnit.notEqual(Interface(intf, obj, 'r'), '', "array match: separation of nested arrays");

    intf = {
      Interface : {
        subarr : [ 5, /5/ ]
      }
    };
    obj = {
      subarr : [ 6, /sechs/ ]
    };

    QUnit.equal(Interface(intf, obj, 'r'), '', "interface object subarray shorthand");

    obj = {
      subarr : [ false ]
    };

    QUnit.notEqual(Interface(intf, obj, 'r'), '', "interface object subarray shorthand: wrong element type");

    intf = {
      Interface : {
        subarr : {
          Interface : [ 5, /5/ ]
        }
      }
    };
    obj = {
      subarr : [ 6, /sechs/ ]
    };

    QUnit.equal(Interface(intf, obj, 'r'), '', "interface object subarray shorthand");

    obj = {
      subarr : [ false ]
    };

    QUnit.notEqual(Interface(intf, obj, 'r'), '', "interface object subarray shorthand: wrong element type");
  });
});
