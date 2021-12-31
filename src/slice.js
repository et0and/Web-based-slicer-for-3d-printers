
"use strict";

(function() {

    const KIRI = self.kiri,
        PRO = Slice.prototype,
        BASE = self.base,
        UTIL = BASE.util,
        POLY = BASE.polygons,
        NOKEY = BASE.key.NONE;

    KIRI.Top = Top;
    KIRI.Slice = Slice;
    KIRI.newTop = newTop;
    KIRI.newSlice = newSlice;

 
    function Slice(z, view) {
        this.z = z; // z-index
        this.index = 0; // slice index
        this.lines = null; // slice raw
        this.groups = null; // grouped lines
        this.up = null; // slice above (linked list)
        this.down = null; // slice below (linked list)
        this.tops = []; // array of Top objects
        this.view = view; // for rendering this slice
        this.finger = null; // cached fingerprint
        this.layers = null; // will replace most of the layer output data
    }

   
    function Top(polygon) {
        this.poly = polygon; // outline poly
    }

    Top.prototype.clone = function(deep) {
        let top = new Top(this.poly.clone(deep));
        return top;
    };

   
    Top.prototype.innerShells = function() {
        let shells = this.shells,
            array = [];
        if (shells) shells.forEach(function(p) {
            if (p.inner) array.appendAll(p.inner);
        });
        return array;
    };

 
    Top.prototype.shellsAtDepth = function(depth) {
        return this.shells ? this.shells.filter(poly => poly.depth === depth) : [];
    };

  
    PRO.output = function() {
        if (this.layers) return this.layers;
        return this.layers = new KIRI.Layers();
    };

 
    PRO.clone = function(deep) {
        const from = this, slice = newSlice(from.z, from.view);
        from.tops.forEach(function(top) {
            slice.addTop(top.poly.clone(deep));
        });
        return slice;
    };

    PRO.topPolys = function() {
        return this.tops.map(top => top.poly);
    };

    // CAM only
    PRO.topPolyInners = function() {
        return this.tops.map(top => top.poly.inner).flat().filter(poly => poly);
    };

    // FDM / SLA only
    PRO.topInners = function() {
        return this.tops.map(top => top.last).flat().filter(poly => poly);
    };

    // FDM / SLA only
    PRO.topFillOff = function() {
        return this.tops.map(top => top.fill_off).flat().filter(poly => poly);
    };

    // FDM only
    PRO.topFill = function() {
        return this.tops.map(top => top.fill_lines).flat().filter(poly => poly);
    };

    // FDM only
    PRO.topShells = function() {
        return this.tops.map(top => top.shells).flat().filter(poly => poly);
    };

    
    PRO.fingerprint = function() {
        if (this.finger) {
            return this.finger;
        }
        return this.finger = POLY.fingerprint(this.topPolys());
    };

    /**
     * returns true if the layers' fingerprints are the same
     */
    PRO.fingerprintSame = function(slice) {
        return slice ? POLY.fingerprintCompare(this.fingerprint(), slice.fingerprint()) : false;
    };

    PRO.addTops = function(polys) {
        polys.forEach(p => {
            this.addTop(p);
        });
        return this;
    }

    PRO.addTop = function(poly) {
        let top = new Top(poly);
        this.tops.push(top);
        return top;
    };

    PRO.findClosestPointTo = function(target) {
        let min, find;

        if (this.tops.length) {
            this.tops.forEach(function(top) {
                find = top.poly.findClosestPointTo(target);
                if (!min || find.distance < min.distance) {
                    min = find;
                }
            });
        } else if (this.supports) {
            this.supports.forEach(function(poly) {
                find = poly.findClosestPointTo(target);
                if (!min || find.distance < min.distance) {
                    min = find;
                }
            });
        }

        return min;
    };

    PRO.xray = function(dash = 3) {
        // console.log('xray', this);
        this.output().setLayer(`xp`, 0x888800).addPolys(this.topPolys());
        this.lines.forEach((line, i) => {
            const group = i % dash;
            const color = [ 0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff ][group];
            this.output().setLayer(`xl-${group}`, color).addLine(line.p1, line.p2);
        });
    };

    function newTop(poly) {
        return new Top(poly);
    }

  
    function newSlice(z, view) {
        return new Slice(z, view);
    }

})();
