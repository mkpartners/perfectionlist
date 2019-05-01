public class PerfectionListController {

  @AuraEnabled
  public static Map<String,Object> initPFList(
    String sObjectName,
    String selectedListViewId,
    String fieldsString,
    String parentId,
    String childRelationship,
    String whereClause
  ){
    Map<Id,ListView> listViewsOptions = queryListViewsOptions(sObjectName);

    Map<String,Object> res = new Map<String,Object>();
    res.put( 'listViewsOptions', listViewsOptions );

    List<sObject> records = queryRecords(sObjectName, fieldsString, selectedListViewId, parentId, childRelationship, whereClause);
    res.put('records',records);

    if ( String.isNotBlank(sObjectName) && String.isNotBlank(fieldsString) ){
      List<Map<String,Object>> columns = getColumns(sObjectName, fieldsString);
      res.put( 'columns', columns );
    }
    return res;
  }

  public static Map<Id,ListView> queryListViewsOptions(String sObjectName){
    Map<Id,ListView> res = new Map<Id,ListView>([
      SELECT Id, DeveloperName, Name, SobjectType 
      FROM ListView 
      WHERE SobjectType = :sObjectName
      ORDER BY LastViewedDate desc
    ]);
    return res;
  }

  public static List<sObject> queryRecords(
    String sObjectName, 
    String fieldsString, 
    String filterId, 
    String parentId,
    String childRelationship,
    String whereClause
  ){
    system.debug(JSON.serialize(new Map<String,Object>{
      'sObjectName'=>sObjectName,
      'fieldsString'=>fieldsString,
      'filterId'=>filterId,
      'parentId'=>parentId,
      'childRelationship'=>childRelationship,
      'whereClause'=>whereClause
    }));
    // if ( fieldsString.contains('Client_Code__c,') ){
    //   fieldsString = fieldsString.replace('Client_Code__c,','Client_Code__c,Client_Code__r.Name,');
    // }
    // if ( fieldsString.contains('Client_Entity__c,') ){
    //   fieldsString = fieldsString.replace('Client_Entity__c,','Client_Entity__c,Client_Entity__r.Name,');
    // }
    // if ( fieldsString.contains('Fund__c,') ){
    //   fieldsString = fieldsString.replace('Fund__c,','Fund__c,Fund__r.Name,');
    // }
    // if ( fieldsString.contains('Firm__c,') ){
    //   fieldsString = fieldsString.replace('Firm__c,','Firm__c,Firm__r.Name,');
    // }
    String queryString = 'SELECT ';
    queryString += fieldsString;

    Set<String> inSet = new Set<String>();
    if ( String.isNotBlank(whereClause) && whereClause.contains('= :UserInfo.getName()') ){
      inSet.add( UserInfo.getName() );
      inSet.add( UserInfo.getLastName()+', '+UserInfo.getFirstName() );
      whereClause = whereClause.replace('= :UserInfo.getName()', 'IN :inSet' );
    }

    if ( String.isNotBlank(childRelationship) && String.isNotBlank(parentId) ){
      queryString = 'Select Id, ('+queryString;
      queryString += ' FROM '+childRelationship;
      if ( String.isNotBlank(whereClause) ){
        queryString += ' WHERE ' + whereCLAUSE;
      }
      queryString += ' ORDER BY '+fieldsString.subStringBefore(',') +' LIMIT 25';
      queryString += ')';
      queryString += ' FROM '+((Id)parentId).getSobjectType();
      queryString += ' WHERE Id = \''+parentId+'\' LIMIT 1';
    } else {
      queryString += ' FROM '+sObjectName;
      if ( String.isNotBlank(whereClause) ){
        queryString += ' WHERE ' + whereCLAUSE;
      }
      queryString += ' ORDER BY '+fieldsString.subStringBefore(',') +' LIMIT 25';
    }
    system.debug( queryString );

    List<sObject> res;
    if ( String.isNotBlank(filterId) ){
      ApexPages.StandardSetController standardSetController = new ApexPages.StandardSetController( Database.getQueryLocator(queryString) );
      standardSetController.setFilterId(filterId);
      standardSetController.setPageSize(25);
      res = (List<sObject>)standardSetController.getRecords();
    } else {
      res = Database.query(queryString);
      if ( String.isNotBlank(childRelationship) ){
        res = res[0].getSObjects(childRelationship);
      }
    }
    if ( res == null ){
      res = new List<sObject>();
    }
    return res;
  }

  public static List<Map<String,Object>> getColumns(String sObjectName, String fieldsString){
    List<Map<String,Object>> columns = new List<Map<String,Object>>();
    Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();
    for ( String f : fieldsString.split(',') ){
      if ( fieldMap.containsKey(f) ){
        Schema.DescribeFieldResult dfr = fieldMap.get(f).getDescribe();
        String dfrType = dfr.getType().name();

        Map<String,Object> fieldDef = new Map<String,Object>();
        fieldDef.put('name', dfr.getName() );
        fieldDef.put('label', dfr.getLabel() );
        fieldDef.put('filterText', '');
        fieldDef.put('filterFromDate', '');
        fieldDef.put('filterToDate', '');
        // fieldDef.put('isFirst',false);
        // fieldDef.put('isLast',false);
        if ( dfrType == 'STRING' && String.isNotBlank(dfr.getCalculatedFormula()) ){
          dfrType = 'FORMULA';
          List<String> picklistValues = new List<String>();
          fieldDef.put('picklistValues',picklistValues);
        }
        else if ( dfrType == 'REFERENCE' ){
          List<String> picklistValues = new List<String>();
          if ( dfr.getLabel().endsWith(' Id') ){
            fieldDef.put('label', dfr.getLabel().subStringBeforeLast(' Id') );
          }
          fieldDef.put('picklistValues',picklistValues);
        }
        else if ( dfrType == 'PICKLIST' ){
          List<String> picklistValues = new List<String>();
          for ( Schema.PicklistEntry pe : dfr.getPicklistValues() ){
            picklistValues.add(pe.getLabel());
          }
          fieldDef.put('picklistValues',picklistValues);
        }
        fieldDef.put('type', dfrType );
        fieldDef.put('displayType', dfrType );
        columns.add(fieldDef);
      }
    }
    system.debug( columns );
    // columns[0].put('isFirst', true);
    // columns[columns.size()-1].put('isLast', true);
    return columns;
  }

    // @AuraEnabled
    // public static Map<String,Object> initBlotterWithoutSpecifiedList(
    //     String sObjectName
    // ){
    //     Map<String,Object> res = new Map<String,Object>();
    //     res.put('listViewOptions', [
    //         SELECT Id, DeveloperName, Name 
    //         FROM ListView 
    //         WHERE SobjectType = :sObjectName
    //         ORDER BY LastViewedDate desc
    //     ]);
    //     return res;
    // }

    // @AuraEnabled
    // public static Map<String,Object> initBlotter(
    //     String sObjectName,
    //     String fieldsString
    // ){
    //     Map<String,Object> res = new Map<String,Object>();
    //     if ( String.isBlank( fieldsString) ){
    //         fieldsString = 'Id';
    //     }
    //     String queryString = 'SELECT '+fieldsString+' FROM '+ sObjectName+' LIMIT 10';
    //     List<sObject> records = database.query(queryString);
    //     res.put('records', records);

    //     List<Map<String,Object>> columns = new List<Map<String,Object>>();
    //     Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();
    //     for ( String f : fieldsString.split(',') ){
    //         if ( fieldMap.containsKey(f) ){
    //             Schema.DescribeFieldResult dfr = fieldMap.get(f).getDescribe();

    //             Map<String,Object> fieldDef = new Map<String,Object>();
    //             fieldDef.put('name', dfr.getName() );
    //             fieldDef.put('label', dfr.getLabel() );
    //             fieldDef.put('type', dfr.getType().name() );
    //             fieldDef.put('filterText', '');
    //             fieldDef.put('filterFromDate', '');
    //             fieldDef.put('filterToDate', '');
    //             fieldDef.put('isLast',false);
    //             if ( dfr.getType().name() == 'PICKLIST' ){
    //                 List<String> picklistValues = new List<String>();
    //                 for ( Schema.PicklistEntry pe : dfr.getPicklistValues() ){
    //                     picklistValues.add(pe.getLabel());
    //                 }
    //                 fieldDef.put('picklistValues',picklistValues);
    //             }
    //             columns.add(fieldDef);
    //         }
    //     }
    //     columns[columns.size()-1].put('isLast', true);
    //     res.put( 'columns', columns );
    //     return res;
    // }

    // @AuraEnabled(cacheable = true)
    // public static Map<String,Object> initBlotter(
    //     String sObjectName,
    //     String fieldsString
    // ){
    //     Map<String,Object> res = new Map<String,Object>();
    //     if ( String.isBlank( fieldsString) ){
    //         fieldsString = 'Id';
    //     }
    //     String queryString = 'SELECT '+fieldsString+' FROM '+ sObjectName+' LIMIT 10';
    //     List<sObject> records = database.query(queryString);
    //     res.put('records', records);

    //     List<Map<String,Object>> columns = new List<Map<String,Object>>();
    //     Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();
    //     for ( String f : fieldsString.split(',') ){
    //         if ( fieldMap.containsKey(f) ){
    //             Schema.DescribeFieldResult dfr = fieldMap.get(f).getDescribe();

    //             Map<String,Object> fieldDef = new Map<String,Object>();
    //             fieldDef.put('name', dfr.getName() );
    //             fieldDef.put('label', dfr.getLabel() );
    //             fieldDef.put('type', dfr.getType().name() );
    //             fieldDef.put('filterText', '');
    //             fieldDef.put('filterFromDate', '');
    //             fieldDef.put('filterToDate', '');
    //             fieldDef.put('isLast',false);
    //             if ( dfr.getType().name() == 'PICKLIST' ){
    //                 List<String> picklistValues = new List<String>();
    //                 for ( Schema.PicklistEntry pe : dfr.getPicklistValues() ){
    //                     picklistValues.add(pe.getLabel());
    //                 }
    //                 fieldDef.put('picklistValues',picklistValues);
    //             }
    //             columns.add(fieldDef);
    //         }
    //     }
    //     columns[columns.size()-1].put('isLast', true);
    //     res.put( 'columns', columns );
    //     return res;
    // }

}