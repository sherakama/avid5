// IMPORTS
//  ------------------------------------------------------------------------------------------------------------
import flash.external.ExternalInterface;

// Variables
//  ------------------------------------------------------------------------------------------------------------
var mc = this.mc_action;
var instanceID = this.instanceID;


// Events
//  ------------------------------------------------------------------------------------------------------------


function mc_click(e:MouseEvent):void {
   var query:String = ExternalInterface.call("$.avid5.flash_click(" + instanceID + ")", 1);
   var aboutURL:URLRequest = new URLRequest(query);
}

mc.addEventListener(MouseEvent.CLICK, mc_click);


// MISC
//  ------------------------------------------------------------------------------------------------------------

