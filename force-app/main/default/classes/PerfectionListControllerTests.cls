@isTest
private class PerfectionListControllerTests {

  static TestMethod void initPFListUnitTest(){
    String sObjectName = 'User';
    String selectedListViewId;
    String fieldsString = 'Id,FirstName,LastName,ProfileId,LanguageLocaleKey';
    String parentId;
    String childRelationship;
    String whereClause = 'Name = :UserInfo.getName()';


    String userQueryString = 'SELECT Name FROM User LIMIT 1';
    ApexPages.StandardSetController userSetController = new ApexPages.StandardSetController(Database.getQueryLocator(userQueryString));
    List<SelectOption> userListViews = userSetController.getListViewOptions();
    selectedListViewId = userListViews[0].getValue();

    test.startTest();
      //Standard Query
      PerfectionLIstController.initPFList(sObjectName,selectedListViewId,fieldsString,parentId,childRelationship,whereClause);

      //List View
      whereClause = null;
      PerfectionLIstController.initPFList(sObjectName,selectedListViewId,fieldsString,parentId,childRelationship,whereClause);

      //Exception
      PerfectionLIstController.initPFList('Test__c',selectedListViewId,fieldsString,parentId,childRelationship,whereClause);
    test.stopTest();
  }
}