({
    helperMethod : function() {
  
    },
    filterCombiner : function(d, filterArray) {
      for (let fn of filterArray) {
        if (!fn(d)) {
          return false;
        }
      }
      return true;
    },
    log: function(arr) {
      arr.forEach(a => console.log(a))
    }
  })