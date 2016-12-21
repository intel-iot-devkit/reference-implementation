function radialProgress(parent) {
    var _data=null,
        _duration= 0,
        _selection,
        _margin = {top:0, right:0, bottom:30, left:0},
        __width = 225,
        __height = 150,
        _diameter,
        _arctype,
        _threshold= -100,
        _label="",
        _fontSize=10;


    var _mouseClick;

    var _value= 0,
        _minValue = 0,
        _maxValue = 100;

    var  _currentArc= 0, _currentArc2= 0, _currentValue=0;

    var currentarc=false;

    var hc_startangle = 200;
    var hc_endangle = 520;

    var _arc = d3.svg.arc()
        .startAngle(hc_startangle * (Math.PI/180))
        _arc.endAngle(hc_endangle * (Math.PI/180));

    _selection=d3.select(parent);

    var activestate = "";

    function component() {

        _selection.each(function (data) {

            if(_threshold!=-100) {                 
                currentarc=true;
            }

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            if(d3.select(((this.parentNode).parentNode).parentNode).attr("class")=="truck"){
                activestate="inactive";
            }

            //RESET SVG
            var textlabels = svg.selectAll(".labels");
            var imageicons = svg.selectAll(".images");
            if(textlabels.empty()) {
            } else {
                textlabels.selectAll("text").remove();
                imageicons.selectAll("image").remove();
            }

            var enter = svg.enter().append("svg").attr("class","radial-svg").append("g");

            measure();

            svg.attr("width", __width)
                .attr("height", __height);

    //BACKGROUND ARC
            var background = enter.append("g").attr("class","component");

    //DRAWING BACKGROUND ARC
            background.append("path")
                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                .attr("d", _arc);

    // ARC OUTER DIV
            if(_value>_threshold) {
                var g = svg.select("g")
                    .attr("class", "problem")
                    .attr("transform", "translate(70," + _margin.top + ")");
            } else {
                var g = svg.select("g")
                    .attr("class", "")
                    .attr("transform", "translate(70," + _margin.top + ")");
            }

        //FOREGROUND ARC
            enter.append("g").attr("class", "arcs");
            _arc.endAngle(_currentArc);

            var path = svg.select(".arcs").selectAll(".arc").data(data);
            path.enter().append("path")
                .attr("class","arc")
                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                .attr("d", _arc);

        // LABELS
            enter.append("g").attr("class", "labels");
            var label = svg.select(".labels").selectAll(".label").data(data);

        // FARENHEIT TEMPERATURE LABEL

            var curvalx=40;
            var curvaly=85;
            var thrvalx=-65;
            var thrvaly=95;

            if(currentarc==true) {
                curvalx = 65;

                label.enter().append("text")
                    .attr("class", "far txtcurrent")
                    .attr("text-anchor", "middle")
                    .attr("y",curvaly)
                    .attr("x",curvalx);
            } else {
                if(_value>99) {thrvalx=-70;}
                if(_value<12) {thrvalx=-50;}

                label.enter().append("text")
                    .attr("class", "far txtthreshold")
                    .attr("text-anchor", "start")
                    .attr("y",thrvaly)
                    .attr("x",thrvalx);
            }

        // ICON
            if(currentarc==true && _value>_threshold) {
                enter.append("g").attr("class", "images");
                var image = svg.select(".images").selectAll(".image").data(data);
                    image.enter().append("image")
                        .attr("y",12)
                        .attr("x",50)
                        .attr("width",35)
                        .attr("height",35)
                        .attr("xlink:href","images/"+activestate+""+_arctype+"_bad.png");
            } else if(currentarc==true && _value<=_threshold) {
                enter.append("g").attr("class", "images");
                var image = svg.select(".images").selectAll(".image").data(data);
                    image.enter().append("image")
                        .attr("y",12)
                        .attr("x",50)
                        .attr("width",35)
                        .attr("height",35)
                        .attr("xlink:href","images/"+activestate+""+_arctype+"_good.png");
            }

            path.exit().transition().duration(500).attr("x",1000).remove();

            layout(svg);

            function layout(svg) {

                var ratio=(_value-_minValue)/(_maxValue-_minValue);
                var endAngle=(Math.min(200+(360*ratio),520));
                endAngle=endAngle * Math.PI/180;

                
                path.datum(endAngle);
                path.transition().duration(_duration)
                    .attrTween("d", arcTween);

                updateLabels();
            }

            function updateLabels() {
                // label.datum(_value);
                var labelF = svg.select(".far").data(data);
                var tweenFunc = labelTweenT;
                if(currentarc==true) {
                    if (_arctype === "vib") {
                        tweenFunc = labelTween
                    } else {
                        tweenFunc = labelTweenDecimal
                    }
                }

                labelF.transition().duration(_duration).tween("text",tweenFunc);

            }

        });

        function onMouseClick(d) {
            if (typeof _mouseClick == "function") {
                _mouseClick.call();
            }
        }
    }

    function labelTweenT(a) {
        var i = d3.interpolate(_currentValue, a);
        _currentValue = i(0);

        return function(t) {
            _currentValue = i(t);
            this.textContent = "\u2264 " + Math.round(i(t));
        }
    }

    function labelTween(a) {
        var i = d3.interpolate(_currentValue, a);
        _currentValue = i(0);

        return function(t) {
            _currentValue = i(t);
            this.textContent = Math.round(i(t));
        }
    }

    function labelTweenDecimal(a) {
        var i = d3.interpolate(_currentValue, a);
        _currentValue = i(0);

        return function(t) {
            _currentValue = i(t);
            this.textContent = i(t).toFixed(1);
        }
    }

    function arcTween(a) {
        var i = d3.interpolate(_currentArc, a);

        return function(t) {
            _currentArc=i(t);
            return _arc.endAngle(i(t))();
        };
    }

    function arcTween2(a) {
        var i = d3.interpolate(_currentArc2, a);

        return function(t) {
            return _arc2.endAngle(i(t))();
        };
    }


    function measure() {
        // _width=_diameter - _margin.right - _margin.left - _margin.top - _margin.bottom;
        _width=_diameter;
        _height=_width;
        _fontSize=_width*.2;
        if (currentarc==true) {
            _arc.outerRadius(_width/2);
            _arc.innerRadius(_width/2 * .85);
        } else {
            _arc.outerRadius(_width/2);
            _arc.innerRadius(_width/2 * .95);
        }
    }


    component.render = function() {
        measure();
        component();
        return component;
    }

    component.value = function (_) {
        if (!arguments.length) return _value;
        _value = [_];
        _selection.datum([_value]);
        return component;
    }

    component.threshold = function(_) {
        if (!arguments.length) return _threshold
        _threshold =  _;
        return component;
    }

    component.arctype = function(_) {
        if (!arguments.length) return _arctype
        _arctype =  _;
        return component;
    }

    component.margin = function(_) {
        if (!arguments.length) return _margin;
        _margin = _;
        return component;
    };

    component.diameter = function(_) {
        if (!arguments.length) return _diameter
        _diameter =  _;
        return component;
    };

    component.minValue = function(_) {
        if (!arguments.length) return _minValue;
        _minValue = _;
        return component;
    };

    component.maxValue = function(_) {
        if (!arguments.length) return _maxValue;
        _maxValue = _;
        return component;
    };

    component.label = function(_) {
        if (!arguments.length) return _label;
        _label = _;
        return component;
    };

    component._duration = function(_) {
        if (!arguments.length) return _duration;
        _duration = _;
        return component;
    };

    component.onClick = function (_) {
        if (!arguments.length) return _mouseClick;
        _mouseClick=_;
        return component;
    }

    return component;

}
