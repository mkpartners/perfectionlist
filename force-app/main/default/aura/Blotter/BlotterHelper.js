({
    helperMethod : function() {
  
    },

    findInArray : function(obj, colName, val) {
      if (obj.hasOwnProperty(colName)) {
        // this.log(obj[colName]);
      }
      if (obj.hasOwnProperty(colName) && obj[colName].length < 1) {
        return false;
      } 
      if (obj.hasOwnProperty(colName) && val == '') {
        return false;
      }
      return obj.hasOwnProperty(colName) && obj[colName].indexOf(val) == -1;
    },

    sort : function(list, column, direction) {
      if (direction == 'asc' || !direction) {
        return list.sort(function(a, b) {
          if (a[column] > b[column]) {
            return 1;
          }
          else if (a[column] < b[column]) {
            return -1;
          } else if (a[column] == null) {
            return 1;
          } else if (b[column] == null) {
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
      let element = document.getElementById(idToFind);
      if (element) {
        element.classList.add(style);
      } else {
        this.removeStyleClass(idToFind, style)
      }
    },

    removeStyleClass : function(idToFind, style) {
      let element = document.getElementById(idToFind);
      if (element) {
        element.classList.remove(style);
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

    safeCheck : function(obj, fieldWanted) {
      try {
        return obj.currentTarget.dataset[fieldWanted];
      } catch(e) {
        return false;
      }
    },
    
    log : function(thing) {
      console.log(JSON.parse(JSON.stringify(thing)));
    }
  })