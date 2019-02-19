({
    helperMethod : function() {
  
    },

    sort : function(list, column, direction) {
      console.log('sorting')
      if (direction == 'asc' || !direction) {
        return list.sort(function(a, b) {
          if (a[column] > b[column]) {
            return 1;
          } else if (a[column] < b[column]) {
            return -1;
          } else return 0;
        })
      } else if (direction == 'dsc') {
        return list.sort(function(a, b) {
          if (a[column] < b[column]) {
            return 1;
          } else if (a[column] > b[column]) {
            return -1;
          } else return 0;
        })
      }
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