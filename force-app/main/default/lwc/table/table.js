import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import HandsOnTable from '@salesforce/resourceUrl/HandsOnTable';
import frappe from '@salesforce/resourceUrl/frappe';

export default class Table extends LightningElement {
    tableInitialized = false;
    objectData = [
        ['', 'Tesla', 'Nissan', 'Toyota', 'Honda', 'Mazda', 'Ford'],
        ['2017', 10, 11, 12, 13, 15, 16],
        ['2018', 10, 11, 12, 13, 15, 16],
        ['2019', 10, 11, 12, 13, 15, 16],
        ['2020', 10, 11, 12, 13, 15, 16],
        ['2021', 10, 11, 12, 13, 15, 16]
      ];
    renderedCallback() {
        if (this.tableInitialized) {
            return;
        }
        console.log(HandsOnTable + '/handsontable.full.min.css')
        this.tableInitialized = true;
        Promise.all([
            loadStyle(this, HandsOnTable + '/handsontable/handsontable.full.min.css'),
            loadScript(this, HandsOnTable + '/handsontable/handsontable.full.min.js'),
            loadScript(this, frappe + '/frappe/frappe.datatable.min.js')
        ])
        .then(() => {
            this.initializetable();
        })
        .catch(err => {
            console.error(err)
        })
    }

    initializetable() {
     
        let hotElement = this.template.querySelector('.hot');
        console.log(hotElement);
        console.log(this.objectData)
        let table = new Handsontable(hotElement, {
            data: this.objectData,
            colHeaders: true,
            licenseKey: 'non-commercial-and-evaluation'
        })

        console.log(table)

        
        // let hot = new Handsontable(hotElement, hotSettings);
    }
}