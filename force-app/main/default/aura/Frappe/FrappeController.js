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
        let element = component.find('frappe');
        let container = element.elements[0];
        
        let columns = component.get('v.columns')
        let records = component.get('v.records');

        let cols = [];
        for (let i = 0; i < columns.length; i++) {
            let temp = {}
            temp.name = columns[i].name;
            if (columns[i].name == 'LastModifiedDate') {
                temp.format = function(value) {
                    let date = new Date(value).toLocaleString();
                    return date;
                }
            }

            cols.push(temp)
        }

        let recs = [];
        for (let i = 0; i < records.length; i++) {
            recs.push(records[i]);
        }

        console.log(recs);
        let table = new DataTable(container, {
            columns: cols,
            data: recs,
            inlineFilters: true,
            serialNoColumn: true,
            layout: 'fluid'
        })

        $A.createComponent(
            'lightning:button',
            {
                'aura:id': 'exportToExcel',
                'label': 'Export to XLSX',
                'onclick': component.getReference('c.handlePress')
            },
            function(newButton, status, errorMessage) {
                if (status === 'SUCCESS') {
                    var body = component.get('v.body');
                    body.push(newButton);
                    component.set('v.body', body)
                } else if (status == 'INCOMPLETE') {
                    console.log('no response from server or client is offline')
                } else if (status == 'ERROR') {
                    console.log('error: ' + errorMessage)
                }
            }
        )
    },
    
    handlePress : function(cmp) {
        console.log('button: ' + cmp.find('exportToExcel'));
        console.log('buton has been press')
    }

})