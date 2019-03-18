({
    log : function(thing) {
        console.log(JSON.parse(JSON.stringify(thing)));
    },
    constructFilterMessage : function(num) {
        // console.log('construct filter message');
        if (num == 0) {
            return 'No filters applied';
        } else if (num == 1) {
            return '1 filter applied';
        }
        return num + ' filters applied';
    },

    addStyleClass : function(idToFind, style) {
        let element = document.getElementById(idToFind);
        if (element) {
            element.classList.add(style);
        } else {
            this.removeStyleClass(idToFind, styles);
        }
    },
    removeStyleClass : function(idToFind, style) {
        let element = document.getElementById(idToFind);
        if (element) {
            element.classList.remove(style);
        }
    },

      
})