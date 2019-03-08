import { LightningElement, api } from 'lwc';

export default class BlotterRecord extends LightningElement {
    @api record;
    @api columns;

    connectedCallback() {
        // this.log(this.record);
    }

    get url() {
        return `/lightning/o/Account/${this.record}/view`;
    }

    log(x) {
        if (x.length > 0) {
            x.forEach(y => this.log(y))
        } else {
            console.log(JSON.parse(JSON.stringify(x)));
        }
    }
}