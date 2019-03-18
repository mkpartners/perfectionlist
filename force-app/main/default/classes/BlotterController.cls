public with sharing class BlotterController {

    @AuraEnabled(cacheable = true)
    public static Map<String,Object> initBlotter(
        String sObjectName,
        String fieldsString
    ){
        Map<String,Object> res = new Map<String,Object>();
        if ( String.isBlank( fieldsString) ){
            fieldsString = 'Id';
        }
        String queryString = 'SELECT '+fieldsString+' FROM '+ sObjectName+ ' LIMIT 10';
        List<sObject> records = database.query(queryString);
        res.put('records', records);

        List<Map<String,Object>> columns = new List<Map<String,Object>>();
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();
        for ( String f : fieldsString.split(',') ){
            if ( fieldMap.containsKey(f) ){
                Schema.DescribeFieldResult dfr = fieldMap.get(f).getDescribe();

                Map<String,Object> fieldDef = new Map<String,Object>();
                fieldDef.put('name', dfr.getName() );
                fieldDef.put('label', dfr.getLabel() );
                fieldDef.put('type', dfr.getType().name() );
                fieldDef.put('filterText', '');
                fieldDef.put('filterFromDate', '');
                fieldDef.put('filterToDate', '');
                fieldDef.put('isLast',false);
                if ( dfr.getType().name() == 'PICKLIST' ){
                    List<String> picklistValues = new List<String>();
                    for ( Schema.PicklistEntry pe : dfr.getPicklistValues() ){
                        picklistValues.add(pe.getLabel());
                    }
                    fieldDef.put('picklistValues',picklistValues);
                }
                columns.add(fieldDef);
            }
        }
        columns[columns.size()-1].put('isLast', true);
        res.put( 'columns', columns );
        return res;
    }
}