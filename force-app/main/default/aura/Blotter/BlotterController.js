({
  doInit: function (component, event, helper) {
    console.info('BlotterController.doInit v 2019-02-05 12:05');

    let sObjectName = component.get('v.sObjectName');
    let fieldsString = component.get('v.fields');
    let listViewId = component.get('v.fields');

    let action = component.get('c.initBlotter');
    action.setParams({ sObjectName: sObjectName, fieldsString: fieldsString });
    action.setCallback(this, function (response) {
      let state = response.getState() ;
      let ret = response.getReturnValue();
      console.info(state, ret);
      if (state === "SUCCESS") {
        component.set('v.queriedRecords', ret.records);
        component.set('v.records', ret.records);
        let columns = ret.columns;
        columns[0].sortBy = 'asc';
        for (let i = 1; i < columns.length; i++) {
          columns[i].sortBy = '';
          //columns havethe sort by field, but might need a new variable
          //slds-hide, 2 copies, hide , down = desc, 
          //hover on header if it's not sorted, use z-index to put the color higher
        }
        component.set('v.columns', ret.columns);
        component.set('v.recordCount.total', ret.records.length);
        component.set('v.recordCount.showing', ret.records.length);
      }
      else if (state === "INCOMPLETE") {

      }
      else if (state === "ERROR") {
        let errors = response.getError();
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
    console.log('on column change is called');
    let currentFilters = component.get('v.columnFilters');
    helper.log(currentFilters);
    let filteredRecords = [];
    let query, fromDate, toDate;
    for (let r in records) {
      let record = records[r];
      let keep = true;
      for (let c in columns) {
        let col = columns[c];
        let val = record[col.name] ? record[col.name].toString() : '';
        let colName = columns[c].label;

        if (col.filterText) {
          query = col.filterText || col.filterFromDate || col.filterToDate;
        }
        if (col.type == 'STRING' && '' != col.filterText && !val.toLowerCase().includes(col.filterText.toLowerCase())) {
          keep = false;
        }
        else if (col.type == 'PHONE' && '' != col.filterText && !val.includes(col.filterText)) {
          keep = false;
        }
        else if (col.type == 'PICKLIST' && helper.findInArray(currentFilters, colName, val)) {
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
    component.set('v.recordCount.showing', filteredRecords.length);
    
    if (event.currentTarget.dataset !== undefined) { 
      let icon = 'span-icon-wrapper' + event.currentTarget.dataset.index;
      helper.addStyleClass(icon, 'icn');
      if (query === undefined || query == '') {
        helper.removeStyleClass(icon, 'icn');
      }
    } else { 
      console.log('not actually defined');
    }
  },

  handleSettingsButtonClick: function (component, event, helper) {
    component.set('v.showFilters', !component.get('v.showFilters'));
  },

  handleFilterSpanClick: function (component, event, helper) {
    let target = 'filterDiv' + event.currentTarget.dataset.value;
    document.getElementById(target).classList.toggle('hidden');
  },

  alphabetize: function (component, event, helper) {
    let records = component.get('v.records');
    let columnToSortBy = event.currentTarget.dataset.value;

    //check if the state already has a direction and column
    let direction = component.get('v.sortState.direction');
    let column = component.get('v.sortState.column');
    // determine if we are going to be switching the order
    let directionToSortBy = column == columnToSortBy && direction == 'asc' ? 'dsc' : 'asc';  
    
    component.set('v.sortState.direction', directionToSortBy);
    component.set('v.sortState.column', columnToSortBy);
    component.set('v.records', helper.sort(records, columnToSortBy, directionToSortBy));

  },
  //trying to reset back to the queried columns and not the original list
  resetColumn: function(component, event, helper) {
    let records = component.get('v.queriedRecords');
    component.set('v.records', records);
    component.set('v.recordCount.showing', records.length);
    // let columns = component.get('v.columns');

    let inputs = component.find('aura-input');
    let inputSearch = 'inputSearch' + event.currentTarget.dataset.value;
    inputs.forEach(input => {
      if (input.get('v.id') == inputSearch) {
        input.set('v.value', '');
      }
    })

    component.set('v.columnFilters', {});

    let picks = component.find('aura-pick');
    let targetPick = 'select' + event.currentTarget.dataset.value;
    if (picks.length > 0) {
      picks.forEach(pick => {
        if (pick.get('v.name') == targetPick) {
          pick.set('v.value', '');
        }
      })
    }

    let dates = component.find('aura-date');
    let dateFrom = 'from' + event.currentTarget.dataset.value;
    let dateTo = 'to' + event.currentTarget.dataset.value;
    if (dates.length > 0) {
      dates.forEach(date => {
        if (date.get('v.name') == dateTo) {
          date.set('v.value', '');
        }
        if (date.get('v.name') == dateFrom) {
          date.set('v.value', '');
        }
      })
    }

    let icon = 'span-icon-wrapper' + event.currentTarget.dataset.value;
    helper.removeStyleClass(icon ,'icn');
  }
})