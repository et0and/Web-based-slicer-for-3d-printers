(function() {

    let terms = {
        COPYRIGHT: "Karan Shah, Devashish Pujari, Mintu Kumar",
        LICENSE: "Made for minor project CSE 4th Year",
        VERSION: "0.0.1"
    };

    if (typeof(module) === 'object') {
        module.exports = terms;
    } else if (self.kiri) {
        // self.exports = terms;
        self.kiri.license = terms.LICENSE;
        self.kiri.version = terms.VERSION;
        self.kiri.copyright = terms.COPYRIGHT;
        self.module = { exports: terms };
    }

})();
