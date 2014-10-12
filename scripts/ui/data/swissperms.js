define(function () {
  return {
    strict : {
      up : {
        up : false,
        down : false,
        bye : false
      },
      down : {
        up : false,
        down : false,
        bye : false
      },
      bye : {
        up : false,
        down : false,
        bye : false
      },
    },
    none : {
      up : {
        up : true,
        down : true,
        bye : true
      },
      down : {
        up : true,
        down : true,
        bye : true
      },
      bye : {
        up : true,
        down : true,
        bye : true
      },
    },
    updown : {
      up : {
        up : false,
        down : false,
        bye : true
      },
      down : {
        up : false,
        down : false,
        bye : true
      },
      bye : {
        up : true,
        down : true,
        bye : false
      },
    },
    pvo : {
      up : {
        up : false,
        down : true,
        bye : true
      },
      down : {
        up : true,
        down : false,
        bye : true
      },
      bye : {
        up : true,
        down : true,
        bye : false
      },
    },
    relaxed : {
      up : {
        up : false,
        down : true,
        bye : true
      },
      down : {
        up : true,
        down : false,
        bye : true
      },
      bye : {
        up : true,
        down : true,
        bye : true
      },
    },
    nice : {
      up : {
        up : false,
        down : true,
        bye : true
      },
      down : {
        up : true,
        down : false,
        bye : false
      },
      bye : {
        up : true,
        down : false,
        bye : false
      },
    },
    // indicate that we don't want to change anything
    custom : undefined
  };
});