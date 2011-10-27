// IMPORTS
//  ------------------------------------------------------------------------------------------------------------
import flash.external.ExternalInterface;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.events.Event;

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

if(paramObj['swf_video_path'] == null) {
  paramObj['swf_video_path'] = "http://grey.local/mindcheck_plugin/media/compressed.flv";
}

// CLICK Events
//  ------------------------------------------------------------------------------------------------------------


function mc_click(e:MouseEvent):void {  
   var query:String = ExternalInterface.call("$.avid5.flash_click(" + instanceID + ")", 1);
   var aboutURL:URLRequest = new URLRequest(query);
   
   // Play through file
   
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
 
video.attachNetStream(ns);
ns.play(paramObj['swf_video_path']);
 
function ns_onMetaData(item:Object):void {
 
 // Resize video instance.
 video.width = paramObj['vid_width'];
 video.height = paramObj['vid_height'];
 
 video.x = 0;
 video.y = 0;
 
 // Center video instance on Stage.
/* 
  video.x = (stage.stageWidth - video.width) / 2;
  video.y = (stage.stageHeight - video.height) / 2;
*/
 
 
}
 
function ns_onCuePoint(item:Object):void {
 trace("cuePoint");
 trace(item.name + "\t" + item.time);
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

