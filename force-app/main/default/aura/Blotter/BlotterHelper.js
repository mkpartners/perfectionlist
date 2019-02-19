({
    helperMethod : function() {
  
    },

    sort : function(list, column, direction) {
      console.log('sorting')
      if (direction == 'asc' || !direction) {
        return list.sort(function(a, b) {
          if (a[column] > b[column]) {
            return 1;
          }
          else if (a[column] < b[column]) {
            return -1;
          }
          else return 0;
        })
      } else if (direction == 'dsc') {
        return list.sort(function(b, a) {
          if (a[column] > b[column]) {
            return 1;
          }
          else if (a[column] < b[column]) {
            return -1;
          }
          else return 0;
        })
      }
    },

    addStyleClass : function(idToFind, style) {
      console.log(idToFind, style)
      let element = document.getElementById(idToFind);
      if (element) {
        element.classList.add(style);
      }
    },

    removeStyleClass : function(idToFind, style) {
      console.log(idToFind, style)
      let element = document.getElementById(idToFind);
      if (element) {
        console.log('element found');
        element.classList.remove(style);
      }
    },

    compare : function(a, b) {
      return (a || b) ? (!a ? -1 : !b ? 1 : a.localCompare(b)) : 0;
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