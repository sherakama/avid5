// IMPORTS
//  ------------------------------------------------------------------------------------------------------------
import flash.external.ExternalInterface;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.events.Event;
import flash.display.BitmapData
import flash.geom.Point
import flash.geom.Rectangle

// Stage Settings
//--------------------------------------------------------------------------------------------------------------
stage.align = StageAlign.TOP_LEFT;
stage.scaleMode = StageScaleMode.NO_SCALE;


// Variables
//  ------------------------------------------------------------------------------------------------------------
var mc = this.mc_action;
var mystage = stage;
var myroot = this.root;
var paramObj:Object = LoaderInfo(this.root.loaderInfo).parameters;
var instanceID = paramObj['instanceID'];
var timer:Timer = new Timer(30); // 30fps ?
var delayTimer:Timer = new Timer(randomNumber(1,10) * 1000, 1);

timer.addEventListener(TimerEvent.TIMER, process_loop_play); 

// Demo
if(paramObj['swf_video_path'] == null) {
  paramObj['swf_video_path'] = "http://grey.local/mindcheck_plugin/media/compressed.mp4";
}
if(paramObj['video_loop_start'] == undefined) {
  paramObj['video_loop_start'] = 0;
  paramObj['video_loop_end'] = 1000;  
}

paramObj['autoplay'] = "true";


// add a mc container for the bitmap data
var bmpmc = new MovieClip();
addChild(bmpmc);



// CLICK Events
//  ------------------------------------------------------------------------------------------------------------


function mc_click(e:MouseEvent):void {  
   var query:String = ExternalInterface.call("$.avid5.flash_click(" + instanceID + ")", 1);
   var aboutURL:URLRequest = new URLRequest(query);


   // Kill Timers
   timer.stop();
   timer.removeEventListener(TimerEvent.TIMER, process_loop_play); 
   delayTimer.stop();
   delayTimer.removeEventListener(TimerEvent.TIMER, process_loop_play);

   
   // Play through file
   ns.resume();
   
   
}
mc.addEventListener(MouseEvent.CLICK, mc_click);






// Load Video
// -------------------------------------------------------------------------------------------------------------

var video:Video = new Video();
addChild(video);
 
var nc:NetConnection = new NetConnection();
nc.connect(null);
 
var ns:NetStream = new NetStream(nc);
ns.client = {onMetaData:ns_onMetaData, onCuePoint:ns_onCuePoint};
ns.addEventListener(NetStatusEvent.NET_STATUS, onStatusEvent);

video.attachNetStream(ns);
ns.play(paramObj['swf_video_path']);
 



function onStatusEvent(e:NetStatusEvent) {
  
  var op = e.info.code;
  var loop_start = paramObj['video_loop_start'];
  
/*  var dq:String = ExternalInterface.call("$.avid5.flash_debug('OP: " + op + "')", 1);
  var dbug:URLRequest = new URLRequest(dq);
*/
  // Autoplay handler
  if(op == "NetStream.Play.Start") {
   
    if(paramObj['autoplay'] !== "true") {
      ns.seek(0);
      ns.pause();
      return;
    }
    
    //Start a timer to track the position of the the video file
    timer.addEventListener(TimerEvent.TIMER, process_loop_play); 
    timer.start();
    
  }

  // create loop
/*  if(op == "NetStream.Buffer.Empty" || op == "NetStream.Buffer.Flush") {  
    // go back to start
    ns.seek(0);
    ns.pause();
    delay_playback();        
  }
*/

  // Full play through rewind
  if(op == "NetStream.Play.Stop") {
    ns.seek(0);
    ns.pause();
    delay_playback();
  }
  
  // Create loop with seek
  if(op == "NetStream.Seek.Notify") {
    timer.stop();
    delayTimer.stop();    
    delay_playback();
  }


  
}


function delay_playback() {
  
  //Stop a timer to track the position of the the video file
  timer.stop();
  timer.removeEventListener(TimerEvent.TIMER, process_loop_play); 

  // Kill any existing timer
  delayTimer.stop();
  delayTimer.removeEventListener(TimerEvent.TIMER, delayTimerListener);  
  
  // create a delay for the callback based off a random interval
  delayTimer = new Timer(randomNumber(1,10) * 1000, 1);
  delayTimer.addEventListener(TimerEvent.TIMER, delayTimerListener);  
  delayTimer.start();
  
}


function delayTimerListener (e:TimerEvent):void{
  
  delayTimer.removeEventListener(TimerEvent.TIMER, delayTimerListener);
  
  // Play the video
  ns.resume();
  
  //Start a timer to track the position of the the video file
  timer.addEventListener(TimerEvent.TIMER, process_loop_play); 
  timer.start();

}



//////////////////////////////////////////////////////
//function that helps pick random numbers in a particular range
function randomNumber(lo:Number, hi:Number ):Number {
  return Math.round((Math.random() * (hi-lo)) + lo);
}
 
 
 
function ns_onMetaData(item:Object):void {
 
 // Resize video instance.
 video.width = paramObj['vid_width'];
 video.height = paramObj['vid_height'] * 2;
 
 video.x = 0;
 video.y = 0;
 
 // Center video instance on Stage.
/* 
  video.x = (stage.stageWidth - video.width) / 2;
  video.y = (stage.stageHeight - video.height) / 2;
*/

  
}
 
 
 
function ns_onCuePoint(item:Object):void {
/* trace("cuePoint");
 trace(item.name + "\t" + item.time);
*/}




// Timer and video manipulation
// -----------------------------------------------------------------------------------------------------------------




function process_loop_play(e:TimerEvent) {
  
  // trace("running" + ns.time);
  
  var loop_end = paramObj['video_loop_end'];
  var loop_start = paramObj['video_loop_start'];
  var cur = ns.time * 1000;
  
  if(cur >= (loop_end * 0.98)) { // 2% error
    ns.pause();
    ns.seek(0);
    delay_playback();
  }
  
}






/**
* TO DO - Learn pixel bender to get this to work
**/


function process_imagedata(e:TimerEvent):void{


  var vid_pixel_data:BitmapData;

  vid_pixel_data = new BitmapData(video.height, video.width, true);
  vid_pixel_data.draw(video);
  
  removeChild(bmpmc);
  bmpmc = new MovieClip();
  addChild(bmpmc);
  //removeChild(mystage.canvas);
  
  // adds a Bitmap to the stage with the BitmapData (copy of the img1) information to display
  var canvas:Bitmap = new Bitmap(vid_pixel_data);
  bmpmc.x = video.width;
  
/*  var topx = (video.width/2)
  var topy = (video.height/4);
  var bottomy = ((video.height/4) * 3);
  
  var top_pixel = vid_pixel_data.getPixel(topx, topy);
  var bottom_pixel = vid_pixel_data.getPixel(topx, bottomy);

  var tpp = top_pixel.toString(16);
  var btp = bottom_pixel.toString(16);
      
  var bgc = 0xFFFF00FF;
    
  vid_pixel_data.setPixel32((video.width/2),(video.height/4), bgc);*/


  var mask:BitmapData = new BitmapData(video.width, video.height/2, true, 0xFF00FF);
  mask.draw(video, null, null, null, new Rectangle(0, video.height/2, video.width, video.height/2));  
  var maskbmp:Bitmap = new Bitmap(mask);
  maskbmp.y = video.height;
  
  addChild(maskbmp);
  

   vid_pixel_data.threshold(
     mask, 
     new Rectangle(0, 0, video.width, video.height/2), 
     new Point(0, 0), "<=", 0xFF000000);
   

/*  var row:uint = 0;
    for(row; row < video.height / 2; row++)
    {
        var column:uint = 0;
        
        for(column; column < vid_pixel_data.width; column++) {        
     
          var top_pixel = vid_pixel_data.getPixel(column,row);
          var bottom_pixel = vid_pixel_data.getPixel(column, (row*2));
          
          var tpp = top_pixel.toString(16);
          var btp = bottom_pixel.toString(16);
        
          trace(tpp);
          trace(btp);
        
          // the new color with alpha 
          var color = 0xFF000000;
          vid_pixel_data.setPixel32(column, row, color);
        }
    }*/
  
  
  
  
  canvas.smoothing = true;
  bmpmc.addChild(canvas);
}



// STAGE RESIZE EVENT
// -----------------------------------------------------------------------------------------------------------------


function resizeHandler(e:Event):void
{
  video.width = paramObj['vid_width'];
  video.height = paramObj['vid_height'];
  
  video.x = 0;
  video.y = 0;
  
  // resize the mc instance
  mc.width = paramObj['vid_width'];
  mc.height = paramObj['vid_height'];
 
  mc.x = 0;
  mc.y = 0;
  
}

stage.addEventListener(Event.RESIZE, resizeHandler);
stage.dispatchEvent(new Event(Event.RESIZE));

// MISC
//  ------------------------------------------------------------------------------------------------------------

