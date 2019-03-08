import { LightningElement, api, track } from 'lwc';

export default class BlotterColumn extends LightningElement {
    @api column;
    @track query;
    @track select;
    @track filterFromDate;
    @track filterToDate;

    connectedCallback() {
        // console.log(this.column);
    }

    columnChange(event) {
        // we want this to send an event any time we have changes on a column to trigger a re-render of all the records
        this.dispatchEvent(new CustomEvent('column'))
    }

    handleDate(event) {
        console.log(event.currentTarget.value)
    }

    handleQuery(event) {
        // grab the query from the input and dispatch it as an event up to the parent component to handle the filtering of records
        this.query = event.currentTarget.value;
        this.dispatchEvent(new CustomEvent('query', { bubbles: true, detail: this.query }));
        this.columnChange(event);
    }

    handleSelect(event) {
        this.select = event.detail.value;
        this.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: this.select }));
        this.columnChange(event);
    }

    get pickOptions() {
        return this.column.picklistValues ? this.column.picklistValues.map(c => ({name: c, value: c, label: c})) : '';
    }

    get isStringOrPhone() {
        return this.column.type === 'STRING' || this.column.type === 'PHONE';
    }

    get isPickList() {
        return this.column.type === 'PICKLIST';
    }

    get isDateTime() {
        return this.column.type === 'DATETIME';
    }

    get isDate() {
        return this.column.type === 'DATE';
    }

    log(x) {
        if (x.length > 0) {
            x.forEach(y => this.log(y))
        } 
        console.log(JSON.parse(JSON.stringify(x)));
    }
}