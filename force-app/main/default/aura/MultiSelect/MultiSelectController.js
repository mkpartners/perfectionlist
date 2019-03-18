({
    doInit : function(component, event, helper) {
        //console.log(JSON.parse(JSON.stringify(component.get('v.picklistValues'))));
    },
    
    pickSelect : function(component, event, helper) {
        let { value, label, index } = event.currentTarget.dataset;
        let filters = component.get('v.filters');
        let target = value + index;
        let element = index ? document.getElementById(target) : document.getElementById('blank' + label);
        if (filters.hasOwnProperty(label) && Array.isArray(filters[label])) {
            let index = filters[label].indexOf(value);
            if (index > -1) {
                filters[label].splice(index, 1);
                element.classList.add('invisible');
            } else {
                filters[label].push(value);
                element.classList.remove('invisible');
            }
        } else {
            if (value == 'blank') {
                if (filters.hasOwnProperty(label) && Array.isArray(filters[label])) {
                    let index = filters[label].indexOf('blank');
                    if (index > -1) {
                        filters[label].splice(index, 1)
                        element.classList.add('invisible');
                    } else {
                        filters[label].push('blank');
                        element.classList.remove('invisible');
                    }
                } else {
                    filters[label] = ['blank'];
                    element.classList.remove('invisible');
                }
            } else {
                filters[label] = [value];
                element.classList.remove('invisible');
            }
        } 
        // helper.log(filters);
        component.set('v.filters', filters);
        let p = component.get('v.parent');
        p.onColumnChange(component, event);
        if (filters[label].length != undefined) {
            component.set('v.filterCount', helper.constructFilterMessage(filters[label].length));
        }

        let icon = 'span-icon-wrapper' + component.get('v.targetForFilter');
        if (filters[label].length < 1) {
            helper.removeStyleClass(icon, 'icn');
        } else {
            helper.addStyleClass(icon, 'icn');
        }

    },

    handleClick : function(component, event, helper) {
        // let { index } = event.currentTarget.dataset;
    },

})