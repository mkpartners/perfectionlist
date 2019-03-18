({
     init: function(component, event, helper) {
        let sObjectName = component.get('v.sObjectName');
        let fieldsString = component.get('v.fields');

        let action = component.get('c.initBlotter');
        action.setParams({ sObjectName: sObjectName, fieldsString: fieldsString });

        action.setCallback(this, function(response) {
            let state = response.getState();
            let ret = response.getReturnValue();
            console.log(ret)
            if (state === 'SUCCESS') {
                console.log('success on the get')
                component.set('v.queriedRecords', ret.records);
                component.set('v.records', ret.records);
                component.set('v.columns', ret.columns);
                $A.enqueueAction(component.get('c.constructTable'))
            } else if (state === 'INCOMPLETE') {

            } else if (state === 'ERROR') {
                let errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log('Error message: ' + errors[0].message);
                    }
                }
            } else {
                console.log('Unknown error');
            }
        });
        $A.enqueueAction(action);
    },
    
    constructTable : function(component, event, helper) {
        var element = component.find('frappe');
        container = element.elements[0];
        
        let columns = component.get('v.columns')
        console.log(columns)
        let records = component.get('v.records');
        console.log(records);

        let cols = helper.map(function(col) {
            return col.label
        })
        console.log(cols)
        
        let table = new DataTable(container, {
            columns: cols,
            data: [
				['angelo', 53],
                ['ben', 824],
                ['luigi', 35],
                ['yiyan', 24],
                ['alex', 26],
                ['jason', 3893],
                ['hello', 829489],
                ['tomato', 24892],
                ['tilted', 82948],
                ['risky', 8248924],
                ['shifty', 24982],
                ['greasy', 284]
            ]
        })
    }
})