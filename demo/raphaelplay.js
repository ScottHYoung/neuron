var paper;
var circle;

window.onload = function() {
    paper = new Raphael(document.getElementById('holder'), 500, 500);
    circle = paper.circle(100, 100, 35);
    circle.attr({fill:'#ccc', stroke:'#222', 'stroke-width':5});
};

