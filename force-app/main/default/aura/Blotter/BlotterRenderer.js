({
    doInit : function(component, event, helper) {
      console.info('BlotterController.doInit v 2019-02-05 12:05' );

      let sObjectName = component.get('v.sObjectName');
      let fieldsString = component.get('v.fields');
      let listViewId = component.get('v.fields');

      let action = component.get('c.initBlotter');
      action.setParams({sObjectName: sObjectName, fieldsString: fieldsString});
      action.setCallback(this, function(response) {
        let state = response.getState();
        let ret = response.getReturnValue();
        console.info( state, ret );
        if (state === "SUCCESS") {
          component.set('v.queriedRecords', ret.records );
          component.set('v.records', ret.records );
          component.set('v.columns', ret.columns );
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
    component.set('v.showFilters', false );
    $A.enqueueAction(action);
  },
  onColumnChange : function(component, event, helper){
    let columns = component.get('v.columns');
    let records = component.get('v.queriedRecords');
    let filteredRecords = [];
    for ( let r in records ){
      let record = records[r];
      let keep = true;
      for ( let c in columns ){
        let col = columns[c];
        let val = record[col.name];
        if ( col.type == 'STRING' && '' != col.filterText && !val.includes(col.filterText) ){
          keep = false;
        }
        else if ( col.type == 'PICKLIST' && '' != col.filterText && col.filterText != val){
          keep = false;
        }
        else if ( ( col.type == 'DATE' || col.type == 'DATETIME' ) && null != col.filterFromDate && '' != col.filterFromDate && col.filterFromDate > val ){
          keep = false;
        }
        else if ( ( col.type == 'DATE' || col.type == 'DATETIME' ) && null != col.filterToDate && '' != col.filterToDate && col.filterToDate < val ){
          keep = false;
        }
      }
      if ( keep ){
        filteredRecords.push(records[r]);
      }
    }
    component.set('v.records',filteredRecords);
  },
  handleSettingsButtonClick : function(component, event, helper){
    component.set('v.showFilters', !component.get('v.showFilters'));
  },
})