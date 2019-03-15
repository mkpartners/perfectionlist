({
    scriptsLoaded : function(component, event, helper) {
        var location = component.get('v.frappe-table')
        var table = new DataTable(location, {
            columns: ['name', 'age'],
            data: [
                ['angelo', 2],
                ['ben', 5]
            ]
        })
    }
})