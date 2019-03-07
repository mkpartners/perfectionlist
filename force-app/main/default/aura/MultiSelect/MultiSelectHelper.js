({
    log : function(thing) {
        console.log(JSON.parse(JSON.stringify(thing)));
    },
    constructFilterMessage : function(num) {
        if (num == 0) {
            return 'No filters applied';
        } else if (num == 1) {
            return '1 filter applied';
        }
        return num + ' filters applied';
    }
})
