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

  _filteredRecords; // array of only the records being displayed
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
  version = 'PerfectionList 0.1.4.10 made with <3 by MK Partners, Inc.';

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
        // this.log( column );
        let fieldValue = record[column.name];
        let matchesSearch = true;
        if ( undefined !== globalSearchString && null != globalSearchString && globalSearchString.length > 0 ){
          matchesSearch = this.passesSearch(fieldValue, globalSearchString);
        }
        if ( matchesSearch ){
          recordMatchesSearch = true;
        }
        let matchesColumnFilter = true;
        if ( undefined !== column.filterText && null != column.filterText && column.filterText.length > 0 ){
          matchesColumnFilter = this.passesColumnFilter( record, column);
        }
        if ( matchesColumnFilter === false ){
          recordMatchesColumnFilter = false;
        }
        // this.log( recordMatchesColumnFilter );
      }
      // this.log( {"recordMatchesSearch": recordMatchesSearch, "recordMatchesColumnFilter": recordMatchesColumnFilter} );
      if ( recordMatchesSearch && recordMatchesColumnFilter ){
        filteredList.push(record);
      }
    }
    // return filteredList;
    this._filteredRecords = filteredList;
  }

  passesSearch(fieldValue, globalSearchString){
    let matchesGlobalSearchString = false;
    if ( null === globalSearchString || globalSearchString.length === 0 ){
      matchesGlobalSearchString = true;
    } else {
      matchesGlobalSearchString = this.containsString(globalSearchString, fieldValue);
    }
    return matchesGlobalSearchString;
  }

  passesColumnFilter(record, column){
    let fieldValue = record[column.name];
    let matchesColumnFilter = false;
    if ( null != column.filterText && (column.displayType === 'STRING' || column.displayType === 'PHONE') ){
      matchesColumnFilter = this.containsString(column.filterText, fieldValue);
      // this.log( {'matchesColumnFilter': matchesColumnFilter} );
    } 
    else if ( column.displayType === 'REFERENCE' ){
      fieldValue = record;
      let parts = column.relatedRecordFieldName.split('.');
      for ( let p=0; p<parts.length; p++ ){
        this.log(fieldValue);
        this.log(parts[p]);
        if ( fieldValue.hasOwnProperty(parts[p]) ){
          fieldValue = fieldValue[parts[p]];
        }
      }
      this.log( column.filterText );
      this.log( fieldValue );
      if ( typeof fieldValue !== 'object' && typeof fieldValue !== 'undefined' ){
        matchesColumnFilter = this.containsString(column.filterText, fieldValue);
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
      matchesColumnFilter = true;
    }
    return matchesColumnFilter;
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

  // global search
  searchColumns(event) {

    this.filterText = event.target.value;
    let records = this.records;
    let recordsToKeep = [];

    for (let r = 0; r < records.length; r++) {

      let record = this.records[r];
      let keep = false;

      for (let i = 0; i < this.columns.length; i++) {

        let col = this.columns[i];
        let val = record[col.name] ? record[col.name].toString() : '';

        if (
            col.type === 'STRING' 
            && val.toLowerCase().startsWith(this.filterText.toLowerCase())
        ) {
          keep = true;
        }
        else if (
          col.type === 'PHONE' 
          && val.includes(this.filterText)
        ) {
          keep = true;
        }
        // else if (col.type === 'PICKLIST' && helper.findInArray(this.columnFilters, colName, val)) {

        //     keep = false;
        // }
        else if (
          (col.type === 'DATE' || col.type === 'DATETIME') 
                && null !== col.filterFromDate 
                && '' !== col.filterFromDate 
                && col.filterFromDate > val
        ) {

          keep = true;
        }
        else if (
          (col.type === 'DATE' || col.type === 'DATETIME') 
                && null !== col.filterToDate 
                && '' !== col.filterToDate 
                && col.filterToDate < val
        ) {
          keep = true;
        }
      }

      if (keep) {
        recordsToKeep.push(this.records[r]);
        this.filteredRecords = recordsToKeep;
      }
    }

    this.recordCount.showing = recordsToKeep.length;
  }

  log(obj) {
    let string = JSON.stringify(obj);
    let retObj = (string !== undefined) ? JSON.parse(string) : obj;
    console.log(retObj);
  }

}