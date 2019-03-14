import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import HandsOnTable from '@salesforce/resourceUrl/HandsOnTable';

export default class Table extends LightningElement {
    tableInitialized = false;

    renderedCallback() {
        if (this.tableInitialized) {
            return;
        }
        console.log(HandsOnTable + '/handsontable.full.min.css')
        this.tableInitialized = true;
        Promise.all([
            loadStyle(this, HandsOnTable + '/handsontable/handsontable.full.min.css'),
            loadScript(this, HandsOnTable + '/handsontable/handsontable.full.min.js')
        ])
        .then(() => {
            this.initializetable();
        })
    }

    initializetable() {
        let data = [
            ['', 'Ford', 'Tesla', 'Toyota', 'Honda'],
            ['2017', 10, 11, 12, 13],
            ['2018', 20, 11, 14, 13],
            ['2019', 30, 15, 12, 13]
        ]
        let container = this.template.querySelector('div.hot');
        console.log('acea')
        let table = new Handsontable(container, {
            data: data,
            rowHeaders: true,
            colHeaders: true,
            filters: true,
            dropdownMenu: true,
            licenseKey: 'non-commercial-and-evaluation'
        })

        console.log(table)
    }
}