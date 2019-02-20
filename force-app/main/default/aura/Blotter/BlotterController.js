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

    if (event.currentTarget.dataset !== undefined) { 
      let icon = 'span-icon-wrapper' + event.currentTarget.dataset.index;
      helper.addStyleClass(icon, 'icn');
      if (query === undefined || query == '') {
        helper.removeStyleClass(icon, 'icn');
      }
    } else { 
      console.log('not actually defined')
    }
  },

  handleSettingsButtonClick: function (component, event, helper) {
    component.set('v.showFilters', !component.get('v.showFilters'));
  },

  handleFilterSpanClick: function (component, event, helper) {
    var ctarget = event.currentTarget;
    var filterDivId = ctarget.dataset.value;
    var displayOption = document.getElementById('filterDiv' + filterDivId);
    displayOption.classList.toggle('hidden');
  },

  alphabetize: function (component, event, helper) {
   // let columns = component.get('v.columns');
    var records = component.get('v.records');
    var columnToSortBy = event.currentTarget.dataset.value;
    
    //check if the state already has a direction and column
    let direction = component.get('v.sortState.direction');
    let column = component.get('v.sortState.column')
    
    // determine if we are going to be switching the order
    let directionToSortBy = column == columnToSortBy && direction == 'asc' ? 'dsc' : 'asc';  
    
    component.set('v.sortState.direction', directionToSortBy);
    component.set('v.sortState.column', columnToSortBy);
    component.set('v.records', helper.sort(records, columnToSortBy, directionToSortBy))

  },

  resetColumn: function(component, event, helper) {
    var getTheProperId = 'inputSearch' + event.currentTarget.dataset.value;
    var records = component.get('v.queriedRecords');
    component.set('v.records', records);

    let columns = component.get('v.columns');
    let matches = component.find('aura-input');
    
    matches.forEach(match => {
      if (match.get('v.id') == 'inputSearch' + event.currentTarget.dataset.value) {
        match.set('v.value', '');
      }
    })
    //clear 1 column, filter entire array
    //add attribute to the column asc/dsc
    // document.getElementById(getTheProperId).value() = '';

    //loop through columns to match the name
    //set filtertext to ''
    let icon = 'span-icon-wrapper' + event.currentTarget.dataset.value;
    helper.removeStyleClass(icon ,'icn')
  }
})