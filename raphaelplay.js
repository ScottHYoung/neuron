window.onload = function() {
    var paper = new Raphael(document.getElementById('canvas_container'), 500, 500);
    var tetronimo = paper.path("M 250 250 l 0 -50 l -50 0 l 0 -50 l -50 0 l 0 50 l -50 0 l 0 50 z");
    tetronimo.attr(
        {
            gradient: '90-#526c7a-#64a0c1',
            stroke: '#3b4449',
            'stroke-width': 10,
            'stroke-linejoin': 'round',
            rotation: -90
        }
    );
    
    tetronimo.animate({rotation: 360}, 2000, 'bounce');
        
};