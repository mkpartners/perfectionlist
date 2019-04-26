import { LightningElement, track } from 'lwc';
import initPFList from '@salesforce/apex/perfectionListController.initPFList';

export default class PerfectionList extends LightningElement {

  @track columns; // array of columns
  @track colsAreStringsOrPhones = true;
  @track fields; // array of field names
  @track filterText = '';
  @track queriedRecords; // array of queried records
  @track records; // array of records
  @track showFilters; // boolean
  @track sObjectName; // string Default account
  @track sortOrder; // integer default 1

  @track columnFilters = {};

  @track recordCount = {
    showing: 0,
    total: ''
  };

  @track sortState = {
    column: '',
    direction: ''
  };


  @track error;
  @track version = '0.1.3.5';

  get cardTitle() {

    this.sObjectName = this.sObjectName ? this.sObjectName : 'Account';
    // this.log('SOBJECT');
    // this.log(this.sObjectName);

    return this.sObjectName + 's';
  }

  get searchPlaceHolder() {

    return 'Search ' + this.sObjectName + 's';
  }

  get iconName() {

    let iconName = this.sObjectName.includes('__') ? 'lightning_component' : this.sObjectName.toLowerCase();
    return 'standard:' + iconName;
  }

  get searchBoxWidth() {

    return 'slds-m-bottom_xx-small slds-align_absolute-center slds-text-align_center slds-size_1-of-' + Math.floor(this.columns.length / 2);
  }

  get columnGridLength() {

    return 'slds-m-right_xx-small slds-truncate slds-col cell slds-size_1-of-' + this.columns.length;
  }

  connectedCallback() {

    let sobjName = this.sObjectName ? this.sObjectName
      : 'Account';

    let fieldsString = this.fields ? this.fields.join()
      : 'Name,Type,Industry,Phone,BillingState,LastModifiedDate';

    initPFList({ sObjectName: sobjName, fieldsString: fieldsString })
      .then(res => {

        // this.log('RES');
        // this.log(res);
        // data structure attaching a getter for every element in columns
        // this.log('BEFORE');
        let expanded_records = [];
        let ret_records = res.records;
        let ret_columns = res.columns;
        let expanded_columns = [];

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

            // this.log(keys[key]);

            newRecord[keys[key]] = vals[key];

          }

          // this.log(newRecord);
          newRecord.link = `/lightning/r/${this.sObjectName}/${ret_records[rec].Id}/view`;
          expanded_records.push(newRecord);
        }


        this.records = expanded_records;
        this.columns = expanded_columns;
        this.queriedRecords = res.records;
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

    this.records = this.sort(this.records, columnToSortBy, directionToSortBy);
    let utilityIcon = directionToSortBy === 'asc' ? 'utility:arrowup' : 'utility:arrowdown';
    
    for(let col = 0; col < this.columns.length; col++) {
      this.columns[col].iconName = 'utility:sort';
    }

    this.columns[colIndex].iconName = utilityIcon;
    this.log(this.columns[colIndex]);
  }

  sort(records, column, direction) {
    if (direction === 'asc' || !direction) {
      return records.sort((a, b) => {
        return a[column] > b[column] || a[column] === null ? 1 : -1;
      });
    }

    else if (direction === 'dsc') {
      return records.sort((b, a) => {
        return a[column] > b[column] ? 1 : -1;
      });
    }
  }

  handleSObjectName(event) {

    this.sObjectName = event.detail.value.trim();
  }

  searchColumns(event) {

    this.filterText = event.target.value;
    let records = this.records;

    if (this.filterText === '') {

      this.connectedCallback();
    }

    this.log(this.filterText);

    let filteredRecords = [];

    for (let r = 0; r < records.length; r++) {

      let record = this.records[r];
      let keep = false;

      for (let i = 0; i < this.columns.length; i++) {

        let col = this.columns[i];
        let val = record[col.name] ? record[col.name].toString() : '';
        this.log('val');
        this.log(val);
        let colName = col.label

        this.log('FILTER TEXT');
        this.log(this.filterText);
        this.log('col');
        this.log(col);

        if (col.type === 'STRING' && val.toLowerCase().startsWith(this.filterText.toLowerCase())) {
          this.log('I AM A STRRING');
          this.log(val.toLowerCase());
          keep = true;
        }
        else if (col.type === 'PHONE' && val.includes(this.filterText)) {

          keep = true;
        }
        // else if (col.type === 'PICKLIST' && helper.findInArray(this.columnFilters, colName, val)) {

        //     keep = false;
        // }
        else if ((col.type === 'DATE' || col.type === 'DATETIME') && null !== col.filterFromDate && '' !== col.filterFromDate && col.filterFromDate > val) {

          keep = true;
        }
        else if ((col.type === 'DATE' || col.type === 'DATETIME') && null !== col.filterToDate && '' !== col.filterToDate && col.filterToDate < val) {

          keep = true;
        }
      }

      this.log('keep');
      this.log(keep);

      if (keep) {
        this.log('HEEEEELLLLO');
        filteredRecords.push(this.records[r]);
        this.queriedRecords = filteredRecords;
      }
    }

    this.log('filteredRecords');
    this.log(filteredRecords);
    this.records = filteredRecords;
    this.log('records');
    this.log(this.records);
    this.recordCount.showing = filteredRecords.length;
  }

  checkIfMatches(filterText, val, type) {


  }

  log(obj) {

    let string = JSON.stringify(obj);
    let retObj = (string !== undefined) ? JSON.parse(string) : obj;

    console.log(retObj);
  }

}