import { LightningElement, api, track } from 'lwc';

export default class BlotterColumn extends LightningElement {
    @api column;
    @track query = {};
    @track queryString = '';
    @track select;
    @track selectString = '';
    @track filterFromDate;
    @track filterToDate;
    @track filterToDateString = '';
    @track columnName;

    connectedCallback() {
        this.columnName = this.column.name;
    }

    columnChange(event) {
        // we want this to send an event any time we have changes on a column to trigger a re-render of all the records
        this.dispatchEvent(new CustomEvent('column'))
    }

    handleSort(event) {
        let columnToSortBy = event.currentTarget.dataset.column;
        //need to check if the query object has one with this column name
        console.log(this.query.hasOwnProperty(columnToSortBy))
        //and if it does then we need to check the sort order
        //then we can reassign the sort order if we need to''
        if (this.query.hasOwnProperty(columnToSortBy)) {
            let direction = this.whatDirection(this.query[columnToSortBy])
        }
        let direction = 'this.whatDirection(this.query[columnToSortBy].sortOrder);'
        console.log(direction);
        this.query = {[columnToSortBy]: { value: '', sortOrder: direction} };
        console.log('from the query', this.query[columnToSortBy].sortOrder)
        this.dispatchEvent(new CustomEvent('query', { bubbles: true, detail: this.query }))

        this.dispatchEvent(new CustomEvent('sort', { bubbles: true, detail: columnToSortBy }));
    }


    handleQuery(event) {
        // grab the query from the input and dispatch it as an event up to the parent component to handle the filtering of records
        this.queryString = event.currentTarget.value;
        this.query = {[this.columnName]: { value: event.currentTarget.value, sortOrder: ''} };
        console.log(this.query);
        this.dispatchEvent(new CustomEvent('query', { bubbles: true, detail: this.query }));
        this.columnChange(event);
    }

    handleSelect(event) {
        this.select = {[this.columnName]: { value: event.currentTarget.value, sortOrder: ''} };
        this.selectString = event.currentTarget.value;
        this.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: this.select }));
        this.columnChange(event);
    }

    handleToDate(event) {
        console.log('handling the date');
        this.filterToDate = {toDate: { value: event.currentTarget.value, sortOrder: ''} };
        this.filterToDateString = event.currentTarget.value;
        this.dispatchEvent(new CustomEvent('date', { bubbles: true, detail: this.filterToDate }));
        this.columnChange(event);
    }

    handleFromDate(event) {
        console.log('handling the date');
        this.filterFromDate = {fromDate: { value: event.currentTarget.value, sortOrder: ''} };
        this.filterToDateString = event.currentTarget.value;
        this.dispatchEvent(new CustomEvent('date', { bubbles: true, detail: this.filterFromDate }));
        this.columnChange(event);
    }

    whatDirection(dir) {
        console.log('calling what direction');
        console.log(dir)
        if (dir !== undefined) {
            console.log('making an assignment');
            return dir === 'asc' ? 'dsc' : 'asc';
        }
        console.log('ok didnt get into the if')
        return 'asc';
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

    get lightningIcon() {
        //something will go here to dynamically set which icon we should render
        if (this.query.hasOwnProperty(this.columnName)) {
            return this.query[this.columnName].sortOrder === 'asc' ? 'utility:chevronup' : 'utility:chevrondown';
        }
        return 'utility:sort';
    }

    log(x) {
        if (x.length > 0) {
            x.forEach(y => this.log(y))
        } 
        console.log(JSON.parse(JSON.stringify(x)));
    }
}