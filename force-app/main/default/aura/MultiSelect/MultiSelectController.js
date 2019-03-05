({
    doInit : function(component, event, helper) {
        console.log(JSON.parse(JSON.stringify(component.get('v.picklistValues'))));
    },
    
    pickSelect : function(component, event, helper) {
        let { value, label } = event.currentTarget.dataset;
        let filters = component.get('v.filters');
        if (filters.hasOwnProperty(label) && Array.isArray(filters[label])) {
            let index = filters[label].indexOf(value);
            if (index > -1) {
                filters[label].splice(index, 1);
            } else {
                filters[label].push(value);
            }
        } else {
            filters[label] = [value];
        }
        // helper.log(filters);
        component.set('v.filters', filters);
        let p = component.get('v.parent');
        p.onColumnChange();
    },
})
