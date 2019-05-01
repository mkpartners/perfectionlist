/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';
import initPFList from '@salesforce/apex/PerfectionListController.initPFList';

export default class PerfectionList extends LightningElement {

  // Attributes passed in to the Component by the Page
  @api recordId;  //RecordId if renderd on a Record's Page
  @api cardTitle;
  @api sObjectName;
  @api fieldsString;
  @api selectedListViewId;
  @api childRelationship;
  @api whereClause; // string
  @api rowsDivStyle;

  // Attributes that are tracked because they may be modified
  @track columns; // array of column objects
  @track filterText = ''; // global search
  @track records; // array of original records returned from the DB

  @track showFilters; // boolean

  @track colsAreStringsOrPhones = true;
  @track fields; // array of field names
  @track sortOrder; // integer default 1
 
  @track recordCount = {
    showing: 0,
    total: ''
  };

  @track sortState = {
    column: '',
    direction: ''
  };

  @track error;

  // Private variables
  version = 'PerfectionList 0.1.4.11 made with <3 by MK Partners, Inc.';
  _filteredRecords; // array of only the records being displayed



  get rowsDivClassName(){
    let name = 'row slds-m-horizontal_small';
    if ( undefined !== this.rowsDivClass && null !== this.rowsDivClass && this.rowsDivClass.length > 0 ){
      name = this.rowsDivClass;
    }
    return name;
  }

  get displayedRecords(){
    return this._filteredRecords;

  }

  get cardTitleLabel() {
    let label = 'List';
    if ( this.cardTitle !== undefined && this.cardTitle !== null && this.cardTitle.length > 0 ){
      label = this.cardTitle;
    }
    return label;
  }

  get searchPlaceHolder() {
    return 'Search';
  }

  get iconName() {
    let iconName = '';
    if ( null != this.sObjectName && undefined !== this.sObjectName ){
      iconName = 'standard:' + this.sObjectName.includes('__') ? 'lightning_component' : this.sObjectName.toLowerCase();
    }
    return iconName;
  }

  get searchBoxWidth() {
    return 'slds-m-bottom_xx-small slds-align_absolute-center slds-text-align_center slds-size_1-of-' + Math.floor(this.columns.length / 2);
  }

  get columnGridLength() {
    return 'slds-m-right_xx-small slds-truncate slds-col cell slds-size_1-of-' + this.columns.length;
  }

  connectedCallback() {
    initPFList({ 
      sObjectName: this.sObjectName, 
      fieldsString: this.fieldsString, 
      selectedListViewId: this.selectedListViewId,
      parentId: this.recordId,
      childRelationship: this.childRelationship,  
      whereClause: this.whereClause
    })
      .then(res => {
        // this.log( this.recordId );
        this.log('RES');
        this.log(res);
        // data structure attaching a getter for every element in columns
        // this.log('BEFORE');
        let expanded_records = [];
        let expanded_columns = [];
        let ret_records = res.records;
        let ret_columns = res.columns;

        for(let col = 0; col < ret_columns.length; col++) {
          let keys = Object.keys(ret_columns[col]);
          let vals = Object.values(ret_columns[col]);
          let newCol = {};
          for(let key = 0; key < keys.length; key++) {
            newCol[keys[key]] = vals[key];
          }          
          newCol.iconName = 'utility:sort';
          expanded_columns.push(newCol);
        }

        for (let rec = 0; rec < ret_records.length; rec++) {
          let keys = Object.keys(ret_records[rec]);
          let vals = Object.values(ret_records[rec]);
          let newRecord = {};
          for (let key = 0; key < keys.length; key++) {
            newRecord[keys[key]] = vals[key];
          }
          newRecord.link = `/lightning/r/${this.sObjectName}/${ret_records[rec].Id}/view`;
          expanded_records.push(newRecord);
        }

        this.records = expanded_records;
        this._filteredRecords = expanded_records;
        this.columns = expanded_columns;
        // this.filteredRecords = expanded_records;
        this.recordCount.showing = res.records.length;
        this.recordCount.total = res.records.length;
      })
      .catch(err => {
        this.error = err;
      });

  }

  alphabetize(event) {
    let columnToSortBy = event.currentTarget.dataset.value;
    let colIndex = event.currentTarget.dataset.index;
    let direction = this.sortState.direction;
    let column = this.sortState.column;

    let directionToSortBy = column === columnToSortBy && direction === 'asc' ? 'dsc' : 'asc';
    this.sortState.direction = directionToSortBy;
    this.sortState.column = columnToSortBy;

    // this.log('the sort state');
    // this.log(this.sortState);

    this.filteredRecords = this.sort(this.records, columnToSortBy, directionToSortBy);
    let utilityIcon = directionToSortBy === 'asc' ? 'utility:arrowup' : 'utility:arrowdown';
    
    for(let col = 0; col < this.columns.length; col++) {
      this.columns[col].iconName = 'utility:sort';
    }
    this.columns[colIndex].iconName = utilityIcon;
    // this.log(this.columns[colIndex]);
    this.filterRecords();
  }

  sort(records, column, direction) {
    let sortedRecords;
    if (direction === 'asc' || !direction) {
      sortedRecords = records.sort((a, b) => {
        return a[column] > b[column] || a[column] === null ? 1 : -1;
      });
    }
    else if (direction === 'dsc') {
      sortedRecords = records.sort((b, a) => {
        return a[column] > b[column] ? 1 : -1;
      });
    }
    return sortedRecords;
  }

  handleSObjectName(event) {

    this.sObjectName = event.detail.value.trim();
  }

  searchRecords(event){
    if ( null !== event && undefined !== event ){
      this.filterText = event.target.value;
    }
    this.filterRecords();
  }

  handleColumnFilterUpdate(event){
    let columnId = event.target.id;
    columnId = columnId.substring(0,columnId.indexOf('-'));
    // this.log( columnId );
    let columnList = this.columns;
    for ( let c=0; c<columnList.length; c++ ){
      columnList[c].class = '';
      // this.log(columnList[c].name);
      if ( columnList[c].name === columnId ){
        columnList[c].filterText = event.detail.value;
        columnList[c].class = 'blue';
      }
    }
    this.columns = columnList;
    this.filterRecords();
  }

  filterRecords(){
    let recordsList = this.records;
    let columnList = this.columns;
    let globalSearchString = this.filterText;
    let filteredList = [];
    for ( let r=0; r<recordsList.length; r++ ){
      let record = recordsList[r];
      let recordMatchesSearch = false;
      let recordMatchesColumnFilter= true;
      for ( let c=0; c<columnList.length; c++ ){
        let column = columnList[c];

        //Check the Search Value
        let matchesSearch = true;
        if ( this.isNotBlank(globalSearchString ) ){
          matchesSearch = this.passesFilter( record, column, globalSearchString );
        }
        if ( matchesSearch === true ){
          recordMatchesSearch = true;
        }

        //Check the Column Filter Value
        let matchesColumnFilter = true;
        if ( this.isNotBlank(column.filterText) ){
          matchesColumnFilter = this.passesFilter( record, column, null);
        }
        if ( matchesColumnFilter === false ){
          recordMatchesColumnFilter = false;
        }
      }
      if ( recordMatchesSearch && recordMatchesColumnFilter ){
        this.log( {"recordMatchesSearch": recordMatchesSearch, "recordMatchesColumnFilter": recordMatchesColumnFilter} );
        filteredList.push(record);
      }
    }
    this.recordCount.showing = filteredList.length;
    this._filteredRecords = filteredList;
  }

  isNotBlank(textValue){
    return (undefined !== textValue && null != textValue && textValue.length > 0);
  }

  passesFilter(record, column, searchString){
    let fieldValue = record[column.name];
    let matchesFilter = false;
    if ( null === searchString ){
      searchString = column.filterText;
    }
    if ( column.displayType === 'STRING' || column.displayType === 'EMAIL' || column.displayType === 'PHONE' ){
      matchesFilter = this.containsString(searchString, fieldValue);
    } 
    else if ( column.displayType === 'REFERENCE' ){
      fieldValue = record;
      let parts = column.relatedRecordFieldName.split('.');
      for ( let p=0; p<parts.length; p++ ){
        if ( fieldValue.hasOwnProperty(parts[p]) ){
          fieldValue = fieldValue[parts[p]];
        }
      }
      this.log( searchString );
      this.log( fieldValue );
      if ( typeof fieldValue !== 'object' && typeof fieldValue !== 'undefined' ){
        matchesFilter = this.containsString(searchString, fieldValue);
      }
    }
    // else if ( column.displayType === 'DATE' ){
    //   //column.fromDate
    //   //column.toDate      
    // }
    // else if ( column.displayType === 'DATETIME' ){
    //   //column.fromDate
    //   //column.toDate      
    // }
    // else if ( column.displayType === 'boolean' ){
    //   //column.fromDate
    // }
    else {
      matchesFilter = true;
    }
    this.log( column.displayType+' '+column.name+' '+matchesFilter );
    return matchesFilter;
  }

  containsString(searchingFor, searchingIn){
    // this.log( {"searchingFor": searchingFor, "searchingIn": searchingIn} );
    let doesContainString;
    if ( null == searchingFor || undefined === searchingFor || searchingFor.trim().length === 0 ){
      doesContainString = true;
    }
    else if ( null == searchingIn ){
      doesContainString = false;
    }
    else {
      searchingFor = searchingFor.trim().toLowerCase();
      searchingIn = searchingIn.trim().toLowerCase();
      doesContainString = searchingIn.includes( searchingFor );
    }
    return doesContainString;
  }

  log(obj) {
    let string = JSON.stringify(obj);
    let retObj = (string !== undefined) ? JSON.parse(string) : obj;
    // console.log(retObj);
  }

}