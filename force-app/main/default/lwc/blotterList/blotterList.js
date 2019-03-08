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
    @track query = '';
    @track select;

    connectedCallback() {
        // console.log(new Date().getTimezoneOffset())

        initBlotter({sObjectName: this.objectType, fieldsString: this.fields})
            .then((result) => {
                this.records = result.records;
                this.columns = result.columns;
                // console.log(JSON.parse(JSON.stringify(this.records)))
                // console.log(JSON.parse(JSON.stringify(this.columns)))
            })
            .catch((error) => {this.error = error})
    }

    handleQuery(event) {
        // this receives the query from the column and sets the query on this state forcing a page rerender
        this.query = event.detail;
        console.log(this.query);
    }

    handleSelect(event) {
        this.select = event.detail;
        console.log(this.select);
    }

    columnChange(event) {
        console.log('column change event fired');
    }

    get shouldRender() {
        return this.records && this.columns;
    }

    // onclick methods
    alphabetize(event) {
        console.log('trying to alphabetizer');
        console.log(this.query)
    }

    // css methods
    get columnHeaderClass() {
        return `slds-col cell slds-size_1-of-${this.columns.length}`;
    }

    get lightningIcon() {
        //something will go here to dynamically set which icon we should render
        return Math.random() * 100 > 50 ? 'utility:filter' : 'utility:flow';
    }

    log(json) {
        return JSON.parse(JSON.stringify(json));
    }
}