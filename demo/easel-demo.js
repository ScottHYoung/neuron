function init(){
    var canvas = document.getElementById("paper");
    var stage = new createjs.Stage(canvas);
    
    var circle = new createjs.Shape();
    var circleHold = new createjs.Shape();
    var circleFire = new createjs.Shape();
    circle.graphics.beginFill("#EEEEEE").beginStroke("#333333").setStrokeStyle(2).drawCircle(0,0,25);
    circleHold.graphics.beginFill("#AAAAAA").beginStroke("#333333").setStrokeStyle(2).drawCircle(0,0,25);
    
circleFire.graphics.beginFill("#8888FF").beginStroke("#333333").setStrokeStyle(2).drawCircle(0,0,25);
    
    SPACE_DOWN = false
    
    dragger = new createjs.Container();
    dragger.x = 100;
    dragger.y = 100;
    circleHold.alpha = 0;
    circleFire.alpha = 0;
    
    dragger.addChild(circle, circleHold, circleFire);
    stage.addChild(dragger);
    
    dragger.on("pressmove",function(evt) {
        
        evt.currentTarget.x = evt.stageX;
        evt.currentTarget.y = evt.stageY;
        
        createjs.Tween.get(circleHold)
          .to({ alpha: 1}, 200, createjs.Ease.getPowInOut(2))
          .play();        
        
        stage.update();   
    });
    
    dragger.on("pressup", function(evt){
        createjs.Tween.get(circleHold)
          .to({ alpha: 0}, 200, createjs.Ease.getPowInOut(2))
          .play();
    });
    
    dragger.on("click", function(evt){
        if(SPACE_DOWN){
            createjs.Tween.get(circleFire)
              .to({ alpha: 1}, 200, createjs.Ease.getPowInOut(2))
              .to({ alpha: 0}, 800, createjs.Ease.getPowInOut(2))
              .play();        
        }
    });
    
    this.document.onkeydown = function keyDown(event){
        switch(event.keyCode){
            case(32):
                SPACE_DOWN = true;
        }
    }
    
    this.document.onkeyup = function keyUp(event){
         switch(event.keyCode){
            case(32):
                SPACE_DOWN = false;
        }         
    }
    
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);
}