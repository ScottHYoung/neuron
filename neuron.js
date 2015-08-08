/*
    Neuron source file.
    
    Namespace organization:
    
    NEURO - All global variables to prevent collisions
    
        .model - Stores the game logic and objects
        .view  - Stores rendering logic
        .controller - Write access to model from view


*/

// Global namespace
var NEURO = {};

// Some constants

NEURO.KEY_SPACE = 32;
NEURO.KEY_C = 67;
NEURO.KEY_X = 88;
NEURO.KEY_Z = 90;
NEURO.NEURON_SIZE = 25;

// NEURON DETAILS
NEURO.network = (function(){
    
    var allNeurons = [];
    var axonScreen = new createjs.Container();
    
    var Neuron = function(x, y){
        
        var that = {};
        
        // Add the axonScreen to the stage first, so axons will render behind the neurons        
        if(NEURO.stage.getChildIndex(axonScreen) < 0){
            NEURO.stage.addChild(axonScreen);    
        }
        
        that.x = x;    
        that.y = y;
        that.lastFired = 0;
        that.GFX = {};
        that.axons = [];
        
        //Member functions
        that.update = function(){
            
            //Variable declarations
            var d = new Date();
            var timeElapsed = d.getTime() - that.lastFired;
            var pulseLength = 400;
            var alpha = 0.0;
            var i;
            var axonRedraw = false;
            
            // Update the alpha in response to a firing event
            if (timeElapsed < pulseLength){
                alpha = 1.0 - timeElapsed/pulseLength;
            }
            that.GFX.fire.alpha = alpha;
            
            // Redraw any axons
            for(i = 0; i<that.axons.length; i++){
                axonRedraw = false;
                if(that.x !== that.axons[i].lineCoords.fx || that.y !== that.axons[i].lineCoords.fy){
                    that.axons[i].lineCoords.fx = that.x;
                    that.axons[i].lineCoords.fy = that.y;
                    axonRedraw = true;
                }
                if(that.axons[i].to.x !== that.axons[i].lineCoords.tx || that.axons[i].to.y !== that.axons[i].lineCoords.ty){
                    that.axons[i].lineCoords.tx = that.axons[i].to.x;
                    that.axons[i].lineCoords.ty = that.axons[i].to.y;  
                    axonRedraw = true;
                }
                if(axonRedraw){
                    that.axons[i].draw();    
                }
            }
        };
        
        that.deleteSelf = function(){
            var i, j, k, index = undefined;
            //Delete all incoming and outgoing axons
            for(j=allNeurons.length-1; j>=0; j--){
                for(k=allNeurons[j].axons.length-1; k>=0; k--){
                    if(allNeurons[j].axons[k].to === that || allNeurons[j].axons[k].from === that){
                        allNeurons[j].axons[k].deleteSelf();
                    }
                }
            }
            //Destroy the graphics
            NEURO.stage.removeChild(that.GFX.main);
            //Remove this neuron from the list of all neurons
            for(i=0; i<allNeurons.length; i++){
                if(allNeurons[i] === that){
                    index = i;    
                }
            }
            if(index !== undefined){
                allNeurons.splice(index, 1);
            }
            
        };
        
        //Setup the graphics
        that.GFX.main = new createjs.Container(); // Contains all graphics associated with the neuron for movement
        that.GFX.main.x = x;
        that.GFX.main.y = y;
        
        that.GFX.base = new createjs.Shape();     // Basic image
        that.GFX.fire = new createjs.Shape();     // Image of neuron firing
        
        //Draw the graphics
        that.GFX.base.graphics.beginFill("#EEEEEE").beginStroke("#333333").setStrokeStyle(2).drawCircle(0,0,NEURO.NEURON_SIZE);
        that.GFX.fire.graphics.beginFill("#8888FF").beginStroke("#333333").setStrokeStyle(2).drawCircle(0,0,NEURO.NEURON_SIZE);
        
        //Mask all but the base graphics for now
        that.GFX.fire.alpha = 0;
        
        //Add these graphics to the container and stage
        that.GFX.main.addChild(that.GFX.base, that.GFX.fire);
        NEURO.stage.addChild(that.GFX.main);
        
        //Add the GUI controls
        that.GFX.main.on("pressmove",function(evt) {
            if(NEURO.keyDown[NEURO.KEY_Z] !== true){
                evt.currentTarget.x = evt.stageX;
                evt.currentTarget.y = evt.stageY; 
                that.x = evt.stageX;
                that.y = evt.stageY;
            }
        });
        
        that.GFX.main.on("click", function(evt){
            if(NEURO.keyDown[NEURO.KEY_SPACE] === true){
                var d = new Date();
                that.lastFired = d.getTime();
            }
        });
           
        that.GFX.main.on("mousedown", function(evt){
            if(NEURO.keyDown[NEURO.KEY_C] === true){
                var newNeuron = new Neuron(that.x, that.y);
                var i, j, k;
                //Duplicate all outgoing axons
                for(i=0; i<that.axons.length; i++){
                    new Axon(newNeuron, that.axons[i].to);
                }
                //Duplicated all incoming neurons
                for(j=0; j<allNeurons.length; j++){
                    for(k=0; k<allNeurons[j].axons.length; k++){
                        if(allNeurons[j].axons[k].to === that){
                            new Axon(allNeurons[j].axons[k].from, newNeuron);
                        }
                    }
                }
                
            }
            if(NEURO.keyDown[NEURO.KEY_X] === true){
                that.deleteSelf();
            }
        });
        
        //Log information regarding the neuron
        console.log("Created a neuron at "+x.toString()+","+y.toString()+".");
        
        allNeurons.push(that);
        
        return that;
    };
    
    var Axon = function(from, to){
        
        var that = {};
        
        that.from = from;
        that.to = to;
        that.lineCoords = {fx:from.x,fy:from.y,tx:to.x,ty:to.y};
        that.line;
        
        //Draw or redraw the given axon
        that.draw = function(){
            //Declarations
            var startX, startY, endX, endY, l,
                lc = that.lineCoords;
            
            //Delete the previously drawn axon
            if(that.line !== undefined){
                axonScreen.removeChild(that.line);
            }
            that.line = new createjs.Shape();
            axonScreen.addChild(that.line);
            that.line.graphics.setStrokeStyle(2).beginStroke("#000000");
            
            //Calculate starting and end points so as to not draw on top of the neurons
            l = Math.sqrt(((lc.tx-lc.fx)*(lc.tx-lc.fx))+((lc.ty-lc.fy)*(lc.ty-lc.fy)));
            if(l >= 2*NEURO.NEURON_SIZE){
                startX = lc.fx + (NEURO.NEURON_SIZE * (lc.tx-lc.fx)/l);
                startY = lc.fy + (NEURO.NEURON_SIZE * (lc.ty-lc.fy)/l);
                endX = lc.tx;
                endY = lc.ty;
                that.line.graphics.moveTo(startX, startY).lineTo(endX, endY);
            }
        };
        
        that.deleteSelf = function(){
            
            var i, parentIndex = undefined;
            //Delete the graphics
            if(that.line !== undefined){
                axonScreen.removeChild(that.line);
            }
            //Remove the axon from the parental list
            for(i=0; i<that.from.axons.length; i++){
                if (that.from.axons[i] === that){
                    parentIndex = i;   
                }
            }
            if (parentIndex !== undefined){
                that.from.axons.splice(parentIndex, 1);
            }
            
        }
        
        //Add itself to the parent neuron and draw itself
        from.axons.push(that);
        that.draw();
        
        return that;
    };
    
    var update = function(){
        var i;
        for(i = 0; i < allNeurons.length; i++){
            allNeurons[i].update();
        }
        NEURO.stage.update();
    };
    
    return {
        Neuron : Neuron,
        Axon : Axon,
        update : update
    };
    
})();


function init(){
    
    NEURO.keyDown = {};
    this.document.onkeydown = function keyDown(event){
        NEURO.keyDown[event.keyCode] = true;
    }
    
    this.document.onkeyup = function keyUp(event){
        NEURO.keyDown[event.keyCode] = false;        
    }
    
    //Setup the canvas
    NEURO.canvas = document.getElementById("easel");
    NEURO.stage = new createjs.Stage(NEURO.canvas);
    
    var n = new NEURO.network.Neuron(100, 100);
    var n2 = new NEURO.network.Neuron(50, 150);
    var n3 = new NEURO.network.Neuron(400, 50);
    var axon = new NEURO.network.Axon(n, n2);
    var axon2 = new NEURO.network.Axon(n2, n3);
    var axon3 = new NEURO.network.Axon(n, n3);
    NEURO.stage.update();
    
    
    // Now run the program
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", NEURO.network.update);    
}