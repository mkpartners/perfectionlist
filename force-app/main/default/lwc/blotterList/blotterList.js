import { LightningElement, track } from 'lwc';
import initBlotter from '@salesforce/apex/BlotterController.initBlotter';

export default class BlotterList extends LightningElement {
    constructor() {
        super();
        this.template.addEventListener('query', this.handleQuery.bind(this))
    }

    @track objectType = 'Account';
    @track fields = 'Name,Type,Industry,Phone,BillingState,LastModifiedDate';
    @track records;
    @track columns;
    @track error;
    @track query = {};
    @track select;
    @track filterDate;
    @track queriedRecords;

    connectedCallback() {
        initBlotter({sObjectName: this.objectType, fieldsString: this.fields})
            .then((result) => {
                this.records = result.records;
                this.columns = result.columns;
                this.queriedRecords = result.records;
            })
            .catch((error) => {this.error = error})
    }

    handleQuery(event) {
        // we take in the data from the event and use the spread to create a state of filters we are going to use when sorting and alphabetizing
        this.query = {...this.query, ...event.detail};
    }

    handleSelect(event) {
        // similar to the handle query, we are creating an object of any filters we are going to be applying
        this.select = {...this.select, ...event.detail};
    }

    handleDate(event) {
        console.log('received event to date');
        this.filterDate = {...this.filterDate, ...event.detail};
        console.log(this.filterDate);
    }

    handleSort(event) {
        console.log('received an event')
        // this.query = {...this.query, ...event.detail };
        console.log('49', event.detail)
        console.log(this.query[event.detail].sortOrder)

        // let's check if the column exists in the state
        // if (this.query.hasOwnProperty(event.detail.column)) {
        //     console.log('i exist');
        // }

        // let newRecords = this.records.filter((a) => {
        //     return a[event.detail.column] !== 'Edge Communications';
        // })

        // console.log(newRecords);
        // this.records = newRecords;
    }

    columnChange(event) {
        console.log('column change event fired');
        console.log('line 46')
        if (this.query != null) {
            // do some sorting of the records
            // console.log(this.query.name)
        }
        if (this.select != null) {
            // console.log(this.select)
        }


    }

    get shouldRender() {
        return this.records && this.columns;
    }
    // css methods
    get columnHeaderClass() {
        return `slds-col cell slds-size_1-of-${this.columns.length}`;
    }

    log(json) {
        return JSON.parse(JSON.stringify(json));
    }
}