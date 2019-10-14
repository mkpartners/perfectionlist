public with sharing class PerfectionListController {

  @AuraEnabled
  public static Map<String,Object> initPFList(
    String sObjectName,
    String selectedListViewId,
    String fieldsString,
    String parentId,
    String childRelationship,
    String whereClause
  ){
    Map<String,Object> res = new Map<String,Object>();
    try {
      if ( String.isNotBlank(sObjectName) && String.isNotBlank(fieldsString) ){
        res.putAll( getColumns(sObjectName, fieldsString) );
        fieldsString = (String)res.get('fieldsString');
      }
    } catch ( Exception e ){
      res.put( 'errors', e.getMessage() );
    }

    try {
      Map<Id,ListView> listViewsOptions = queryListViewsOptions(sObjectName);
      res.put( 'listViewsOptions', listViewsOptions );
    } catch ( Exception e ){

    }

    List<sObject> records = queryRecords(sObjectName, fieldsString, selectedListViewId, parentId, childRelationship, whereClause);
    system.debug( records.size() );
    res.put('records',records);

    return res;
  }

  public static Map<String,String> getThisObject(String sObjectName){
    Map<String,String> objDescribe = new Map<String,String>();
    DescribeSObjectResult r = Schema.getGlobalDescribe().get(sObjectName).getDescribe();
    objDescribe.put('labelPlural', r.getLabelPlural() );
    objDescribe.put('label', r.getLabel() );
    return objDescribe;
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
    String queryString = 'SELECT ';
    queryString += fieldsString;

    Set<String> inSet = new Set<String>();
    // if ( String.isNotBlank(whereClause) && whereClause.contains('= :UserInfo.getName()') ){
    //   inSet.add( UserInfo.getName() );
    //   inSet.add( UserInfo.getLastName()+', '+UserInfo.getFirstName() );
    //   whereClause = whereClause.replace('= :UserInfo.getName()', 'IN :inSet' );
    // }

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
  
  public static Map<String,Object> getColumns(String sObjectName, String fieldsString){
    Map<String,Object> res = new Map<String,Object>();
    List<Map<String,Object>> columns = new List<Map<String,Object>>();
    Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap();
    List<String> fieldList = new List<String>();
    for ( String f : fieldsString.split(',') ){
      if ( fieldMap.containsKey(f) ){
        Schema.DescribeFieldResult dfr = fieldMap.get(f).getDescribe();
        String dfrType = dfr.getType().name();

        Map<String,Object> fieldDef = new Map<String,Object>();
        fieldDef.put('name', dfr.getName() );
        fieldList.add( dfr.getName() );

        fieldDef.put('label', dfr.getLabel() );
        fieldDef.put('filterText', '');
        fieldDef.put('filterFromDate', '');
        fieldDef.put('filterToDate', '');
        // fieldDef.put('iconName','utility:sort');
        // fieldDef.put('iconState',false);

        if ( dfrType == 'STRING' && String.isNotBlank(dfr.getCalculatedFormula()) ){
          dfrType = 'FORMULA';
          List<String> picklistValues = new List<String>();
          fieldDef.put('picklistValues',picklistValues);
        }
        else if ( dfrType == 'REFERENCE' ){
          //If not a Task, Case, or Event
          String relatedRecordFieldName = dfr.getName();
          if ( relatedRecordFieldName.endsWith('__c') ){
            relatedRecordFieldName = relatedRecordFieldName.replace('__c','__r');
          } 
          else if( relatedRecordFieldName.endsWith('Id') ){
            relatedRecordFieldName = relatedRecordFieldName.subStringBeforeLast('Id');
          }
          if ( dfr.getReferenceTo()[0] == Schema.Case.sObjectType || dfr.getReferenceTo()[0] == Schema.Event.sObjectType || dfr.getReferenceTo()[0] == Schema.Task.sObjectType ){
            relatedRecordFieldName += '.Subject';
          } else {
            relatedRecordFieldName += '.Name';
          }
          fieldDef.put('relatedRecordFieldName',relatedRecordFieldName);
          fieldList.add( relatedRecordFieldName );

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
        else if ( dfrType == 'DATE' || dfrType == 'DATETIME' ){
          fieldDef.put('fromDate',null);
          fieldDef.put('toDate',null);
        }
        fieldDef.put('type', dfrType );
        fieldDef.put('displayType', dfrType );
        columns.add(fieldDef);
      }
    }
    system.debug( columns );
    res.put( 'fieldsString', String.join(fieldList,',') );
    res.put( 'columns', columns );
    return res;
  }

}
