({
  doInit: function (component, event, helper) {
    console.info('BlotterController.doInit v 2019-02-05 12:05');

    let sObjectName = component.get('v.sObjectName');
    let fieldsString = component.get('v.fields');
    let listViewId = component.get('v.fields');

    let action = component.get('c.initBlotter');
    action.setParams({ sObjectName: sObjectName, fieldsString: fieldsString });
    action.setCallback(this, function (response) {
      let state = response.getState();
      let ret = response.getReturnValue();
      console.info(state, ret);
      if (state === "SUCCESS") {
        component.set('v.queriedRecords', ret.records);
        component.set('v.records', ret.records);
        let columns = ret.columns;
        columns[0].sortBy = 'asc';
        for (let i = 1; i < columns.length; i++) {
          columns[i].sortBy = '';
        }
        component.set('v.columns', ret.columns);
      }
      else if (state === "INCOMPLETE") {

      }
      else if (state === "ERROR") {
        var errors = response.getError();
        if (errors) {
          if (errors[0] && errors[0].message) {
            console.log("Error message: " + errors[0].message);
          }
        } else {
          console.log("Unknown error");
        }
      }
    });

    // component.set('v.showFilters', false);
    $A.enqueueAction(action);
  },
  onColumnChange: function (component, event, helper) {
    let columns = component.get('v.columns');
    let records = component.get('v.queriedRecords');
    let filteredRecords = [];
    let query;
    for (let r in records) {
      let record = records[r];
      let keep = true;
      for (let c in columns) {
        let col = columns[c];
        let val = record[col.name] ? record[col.name].toString() : '';
        if (col.filterText) {
          query = col.filterText;
        }
        // testing some variables out
        if (col.type == 'STRING' && '' != col.filterText && !val.toLowerCase().includes(col.filterText.toLowerCase())) {
          keep = false;
        }
        else if (col.type == 'PHONE' && '' != col.filterText && !val.includes(col.filterText)) {
          keep = false;
        }
        else if (col.type == 'PICKLIST' && '' != col.filterText && col.filterText != val) {
          keep = false;
        }
        else if ((col.type == 'DATE' || col.type == 'DATETIME') && null != col.filterFromDate && '' != col.filterFromDate && col.filterFromDate > val) {
          keep = false;
        }
        else if ((col.type == 'DATE' || col.type == 'DATETIME') && null != col.filterToDate && '' != col.filterToDate && col.filterToDate < val) {
          keep = false;
        }
      }
    
      if (keep) {
        filteredRecords.push(records[r]);
      }
    }
    component.set('v.columns', columns);
    component.set('v.records', filteredRecords);
  },
  handleSettingsButtonClick: function (component, event, helper) {
    console.log('handleSettingsButtonClick clicked')
    console.log(event.target.value);
    console.log(event.getSource().get('v.value'))
    component.set('v.showFilters', !component.get('v.showFilters'));
  },

  handleFilterSpanClick: function (component, event, helper) {
    console.log('clicked');
    var ctarget = event.currentTarget;
    var filterDivId = ctarget.dataset.value;
    var displayOption = document.getElementById('filterDiv' + filterDivId);
    console.log(displayOption);
    displayOption.classList.toggle('hidden');
  },

  alphabetize: function (component, event, helper) {
   // let columns = component.get('v.columns');
    var records = component.get('v.records');
    var sortByField = event.currentTarget.dataset.value;
    console.log('clicked');

    var sortOrder = component.get('v.sortOrder');

    //look through columns
    //if it has asc = dsc
    //otherwise asc
    //if it's not asc = ''

    var sorted = records.sort(function(a, b) {
      if (a[sortByField] > b[sortByField]) {
        return sortOrder;
      } else if (a[sortByField] < b[sortByField]) {
        return sortOrder * -1;
      } else return 0;
    })

    component.set('v.sortOrder', sortOrder * -1)
    component.set('v.records', sorted);
  },

  resetColumn: function(component, event, helper) {
    console.log('resetting the columns')
    var getTheProperId = 'inputSearch' + event.currentTarget.dataset.value;
    console.log('inputSearch' + getTheProperId);
    var records = component.get('v.queriedRecords');
    // helper.consoleLogArrayOfObjects(records);
    component.set('v.records', records);
    let columns = component.get('v.columns');
    //clear 1 column, filter entire array
    //add attribute to the column asc/dsc
    // document.getElementById(getTheProperId).value() = '';

    //loop through columns to match the name
    //set filtertext to ''
  }
})