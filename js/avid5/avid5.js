/*
 * Jquery widget for creating transparent html5 video with click interaction
 * @author ImageX Media - Shea McKinney
 * 
 */


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * The jQuery plugin part
 * 
 **/

// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
;(function ( $, window, document, undefined ) {

   // undefined is used here as the undefined global
   // variable in ECMAScript 3 and is mutable (i.e. it can
   // be changed by someone else). undefined isn't really
   // being passed in so we can ensure that its value is
   // truly undefined. In ES5, undefined can no longer be
   // modified.

   // window and document are passed through as local
   // variables rather than as globals, because this (slightly)
   // quickens the resolution process and can be more
   // efficiently minified (especially when both are
   // regularly referenced in your plugin).

   // Create the defaults once
   var pluginName = 'avid5',
       defaults = {
           height                 : 480
          ,width                  : 640
          ,videos                 : {} // absolute paths work best
          ,swf_path               : 'js/avid5/swf/video_player.swf'
          ,swf_video_path         : ''
          // ,action_img_path        : '' 
          ,action_url_path        : '#' 
          ,autoplay               : true // play the looping portion of the video automatically
          ,video_loop_start       : 0 // in milliseconds
          ,video_loop_end         : 5000 // in miliseconds
          ,hover_callback_delay   : 1000 // in milliseconds
          ,click_callback_delay   : 1000 // in milliseconds
          ,hover_callback         : function() {} // hover callback function
          ,hover_out_callback     : function() {} // hover callback function
          ,click_callback         : function() {} // external callback function
       };


// Global Scope Functions
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    // claim the namespace
    $.avid5 = {
      
      // Vars
      has_canvas: Modernizr.canvas
      ,has_h264: Modernizr.video.h264
      ,has_ogg: Modernizr.video.ogg
      ,has_webm: Modernizr.video.webm 
      ,instance_count: 0 // simple counter
      ,instance_container: new Array() // container for the instances (TODO)
      ,webm_alert: 0
      
      /**
       * validates the browser for canvas and video capabilities
       * returns boolean
       **/
       
      ,is_html5_enabled: function() {
                                
        var is_mobile = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || false;
        
        // var has_flash = this.is_flash_enabled();
        //        var log = $("#log");
        //        var logtext = '';
        //        logtext += "has canvas: " + Modernizr.canvas + "\n";
        //        logtext += "has has_h264: " + Modernizr.video.h264 + "\n";
        //        logtext += "has has_ogg: " + Modernizr.video.ogg + "\n";
        //        logtext += "has webm: " + Modernizr.video.webm + "\n";
        //        logtext += "has flash: " + has_flash + "\n";
        //        logtext += "is safari: " + $.browser.safari + "\n";
        //        logtext += "version: " + $.browser.version + "\n";
        //        logtext += "is ios: " + is_mobile + "\n";
        //        log.val(logtext);
        
        if(is_mobile !== false) {
          return false; // mobile does not have enough power to go from video to canvas :(
        }      

        // Prompt ie 9 users for webm
        if($.browser.msie == true && parseInt($.browser.version) >= 9 && !this.has_webm && $.avid5.webm_alert == 0) {
          alert('Your broswer has the capability of displaying this content but is missing a plugin. Download it from google here: https://tools.google.com/dlpage/webmmf');
          $.avid5.webm_alert = 1;
          return false;
        }
        
        
        // Webkit
        if(this.has_canvas && (this.has_h264 == "probably")) {
          return true;
        }
        
        // the moz... Gecko
        if(this.has_canvas && (this.has_ogg == "probably")) {
          return true;
        }
        
        // webm IE 9 and safari (sometimes)
        if(this.has_canvas && (this.has_webm == "probably")) {          
          return true;
        }
        
        // Prompt mac safari users for perian
        if($.browser.safari == true && !this.has_webm && navigator.platform == "Mac" && $.avid5.webm_alert == 0) {
          alert('Your broswer has the capability of displaying this content but is missing a plugin. Download it here: http://perian.org/ or here: ');
          $.avid5.webm_alert = 1;
          return false;
        }
        
        // probably ie
        return false;
      }
      
      
      
      /**
       * validates the browser for flash capabilities
       * returns boolean
       **/
       
      ,is_flash_enabled: function() {
                
        if(swfobject == undefined) { alert('Please Install SWFObject 2 or later'); }        
        var version = swfobject.getFlashPlayerVersion();
  
        // var logval = $("#log").val();
        // logval += "Flash version: " + version.major + "\n";
        // $("#log").val(logval);
        
        // If android roll with flash
        if(navigator.userAgent.match(/Android/i)) {
          return true;
        }
  
        
        if(version.major >= 9) {
          return true;
        }
        
        return false;
        
      }
      
      
      
      /**
      * Get Instance
      * Returns a stored instance by ID
      **/
      
      ,get_instance: function(id) {
        return this.instance_container[id];
      }
      
      
      
      /**
      * External Interface call (from flash)
      */
      
      ,flash_click: function(instanceID) {
        
        var instance = this.get_instance(instanceID);
        
        setTimeout(
          function() {
            // instance.click_action_default_callback();
            instance.click_action_extra_callback();
          }, 
          instance.options.action_callback_delay
        );

        
      }
      
      
      /**
      * DEBUG - FLASH EXTERNAL CALLBACK
      **/
      
      ,flash_debug: function(msg) {
        console.log(msg);
      }
      
    };
    

   
    
// End Global Scope
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    
   // The actual plugin constructor
   function avid5( element, options ) {
       this.element = element;
    
       // jQuery has an extend method that merges the
       // contents of two or more objects, storing the
       // result in the first object. The first object
       // is generally empty because we don't want to alter
       // the default options for future instances of the plugin
       this.options = $.extend( {}, defaults, options) ;

       this._defaults = defaults;
       this._name = pluginName;

       this.init();       
   }
   

   avid5.prototype.init = function () {
       // Place initialization logic here
       // You already have access to the DOM element and
       // the options via the instance, e.g. this.element
       // and this.options
       
       this.instanceID = $.avid5.instance_count;
       $.avid5.instance_container.push(this);
       $.avid5.instance_count++; // increment the counter

       $(this.element).data('avid5', this); // store for later

       // Resize The element
       $(this.element).css({
         height: this.options.height + "px", 
         width : this.options.width + "px" 
         // overflow:"hidden"
        });
         
        // Add the avid5 class to the main element
        if(!$(this.element).hasClass('avid5')) {
          $(this.element).addClass('avid5');
        }
        
        
        
        // if html5 enabled build out that version
        if($.avid5.is_html5_enabled()){
          this.build_html5_vid();
        } 
        else if
       // If not html5 enabled but has flash
       // if html5 enabled build out that version
       (!$.avid5.is_html5_enabled() && $.avid5.is_flash_enabled() && this.options.swf_video_path.length >= 3){
         this.build_flash_vid();
       }
       else
       // No flash no html5 then fallback to static image
       {
        
        // Sad face   :( 
        this.image_fallback_handlers();
       }
       
       
   };


// Build / Setup
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
   * Browser support HTML5 canvas/video
   * Build out the canvas/video based plugin
   */
   
   avid5.prototype.build_html5_vid = function () {
     
     // The poster image will be the static image
     this.poster = $(this.element).find('img');
     
     // Create the output (what is seen) canvas tag
     var outputCanvas = $("<canvas />");
     outputCanvas.addClass('output-canvas')
     .attr('style', 'display:block')
     .attr('height', parseInt(this.options.height))
     .attr('width', parseInt(this.options.width));
     
     // Buffer canvas for video processing
     var bufferCanvas = $("<canvas />");
     bufferCanvas.addClass('buffer-canvas')
     // .attr('style', 'display:none')
     .attr('height', parseInt(this.options.height * 2))
     .attr('width', parseInt(this.options.width));
     
     // The video tag
     var video = $("<video />");
     video.attr('height', parseInt(this.options.height * 2))
     .attr('width', parseInt(this.options.width))
     .attr('preload', 'auto')
     .attr('muted', 'muted')
     // .attr('loop', 'true')
     // .attr('autoplay', 'autoplay')
     // .attr('style', "display:none")
     .attr('controls', 'true')
     .attr("id", 'video-' + $.avid5.instance_count)
     .attr('class', 'video');
          
      // Create the video sources tags
       $.each(this.options.videos, function(i, v) {
         // create the tag
         var vidsource = "<source type='" + v.codec + "' src='" + v.path + "' />";       

         // add it to the video tag
         video.append(vidsource);  

         // special for IE (of course)
         if($.browser.msie == true && parseInt($.browser.version) >= 9) {
                      
           if($.avid5.has_h264 && v.codec.match(/video\/mp4/)) {
             video.attr("src", v.path);
           }
           if($.avid5.has_h264.has_webm && v.codec.match(/video\/wemb/)) {
             video.attr("src", v.path);
           }
           
         }

       });
     
     // Add it to the dom!
     var elem = $(this.element)
     elem.empty(); // clear out whatever is already there
     
     elem.append(outputCanvas);
     elem.append(bufferCanvas);
     elem.append(video);
     

     // store references for use later
     this.outputcanvas = outputCanvas;
     this.buffercanvas = bufferCanvas;
     this.videoelem = video;
    
    // Event Handlers
    this.html5_setup_event_handlers();    
     
    // Start the loop
    this.play_loop();
     
   };
   

   /**
   * Browser supports flash
   * Build out the flash based plugin
   */
   
   avid5.prototype.build_flash_vid = function () {
     
     var id = 'flvplayer-' + this.instanceID;
     var swfcontainer = $("<div class=\"swf-container\" />");
     swfcontainer.attr('id',id);
     
     $(this.element).html(swfcontainer);          
     
     var flashvars = {
        instanceID : this.instanceID
       ,swf_video_path : this.options.swf_video_path
       ,vid_width: this.options.width
       ,vid_height: this.options.height
       ,autoplay: this.options.autoplay
       ,video_loop_start : this.options.video_loop_start
       ,video_loop_end: this.options.video_loop_end
     };
     
     var params = {
       quality: "high"
       ,wmode: "transparent"
     };
     
     var attr = {};
     
     swfobject.embedSWF(this.options.swf_path, id, this.options.width, this.options.height, "9.0.0", '', flashvars, params, attr);
     
   };


// Controls
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    
    avid5.prototype.play_loop = function() {
      
      
      // HTML 5 Loop
      if($.avid5.is_html5_enabled()) {
      
        var video = this.videoelem[0];
        var instance = this;
        video.instanceID = this.instanceID;
        video.loop_start = this.options.video_loop_start / 1000;
                
        
        // Check for autoplay
        if(this.options.autoplay) {
          
          // process first frame
         video.addEventListener('canplay', this.video_listener_can_play, false);          
                    
          // Play on ready
          video.addEventListener('canplaythrough', this.video_listener_can_play_through, false);
          
          
          
          
        } else {
          // Create a poster element
          if(this.poster.length >= 1) {
            
            var posterImage = this.poster;
            var output = this.outputcanvas[0].getContext('2d');
            posterImage.load(function() {
              output.drawImage(posterImage[0], 0, 0);
            });

          }
          
        }
                                
        // add play listenter to the video
        video.addEventListener('play', this.video_listener_loop_play, false);        
        
      } 
      else 
      // Flash Loop --------------------------------------------------------------------
      {
        // NADA
      }
      
      
    }
    

// HTML 5 Specific
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
    * When the movie is ready to play a frame
    */

    avid5.prototype.video_listener_can_play = function(){      
      var instance = $(this).parent().data('avid5');
      var video = instance.videoelem[0];      
      
      video.currentFrame = video.loop_start;      
      video.play();
      video.pause();
      
      // for safari force a redraw
      if($.browser.safari == true) {
        $(this.element).find('canvas').css({padding:"0px"});
      }
            
      video.removeEventListener('canplay', instance.video_listener_can_play, false);
                  
    }


  /**
  * When the movie is ready to play through
  */
  
  avid5.prototype.video_listener_can_play_through = function() {
                
      var instance = $(this).parent().data('avid5');
      var video = instance.videoelem[0];
      video.currentTime = video.loop_start;
      
      // create a random timeout and start the loop again
      var timeout = Math.floor(Math.random() * (10 - 1 + 1)) + 1; // between 1 and 10 seconds
      timeout *= 1000;

      setTimeout(function() { video.play(); }, timeout);

      video.removeEventListener('canplaythrough', instance.video_listener_can_play_through, false);
  }



    /**
    * Loop sequence play event handler
    *
    **/
    
    avid5.prototype.video_listener_loop_play = function() {
        //var instance = $(this).parent().data('avid5');        
        var instance = $.avid5.get_instance(this.instanceID); // this refers to the video dom element

        clearInterval(instance.process_interval);
        instance.process_interval = null;
        
        instance.process_interval = setInterval(function() {
          instance.process_frame();
          instance.check_loop();
        }, 35);
    }

    /**
     * Full play through event handler
     *
     **/

     avid5.prototype.video_listener_full_play = function() {
         // Setup the process interval again
         // var instance = $(this).parent().data('avid5');
         var instance = $.avid5.get_instance(this.instanceID);
       
         clearInterval(instance.process_interval);
         instance.process_interval = null;
         
         instance.process_interval = setInterval(function() {
           instance.process_frame();
         }, 35);

        

     }

     /**
      * Full play through end of clip handler
      *
      **/

      avid5.prototype.video_listener_full_ended = function() {
        // console.log('ENDED FULL');    
        var instance = $(this).parent().data('avid5');
        var video = instance.videoelem[0];

        // remove interval
        var instance = this;        
        clearInterval(instance.process_interval);      
        instance.process_interval = null;
                
        video.pause();
        
        // remove full play event listeners
        video.removeEventListener('play', instance.video_listener_full_play, false);
        video.removeEventListener('ended', instance.video_listener_full_ended, false);
        
        // Add in loop portion video listeners
        video.addEventListener('play', instance.video_listener_loop_play, false);
        
        // create a random timeout and start the loop again
        var timeout = Math.floor(Math.random() * (10 - 1 + 1)) + 1; // between 1 and 10 seconds
        timeout *= 1000;
                
        setTimeout(function() { video.play(); }, timeout);

      }

      
    /**
    * Default click on the video callback action. Called after a delay
    * fades in action item
    **/

    avid5.prototype.click_action_extra_callback = function() {
       this.options.click_callback(); // hehe
     }  


     /**
     * Default hover on the video callback action. Called after a delay
     * fades in action item
     **/

     avid5.prototype.hover_action_extra_callback = function() {
        this.options.hover_callback(); // hehe
      } 
      
    /**
    * Default hover out on the video callback action. Called after a delay
    * fades in action item
    **/

    avid5.prototype.hover_out_action_extra_callback = function() {
       this.options.hover_out_callback(); // hehe
     }   


    /**
    * process the video frame and display it on the page
    * 
    */

    avid5.prototype.process_frame = function () {
      
      var buffer = this.buffercanvas[0].getContext('2d');
      var output = this.outputcanvas[0].getContext('2d');
      var video = this.videoelem[0];
      var width = this.options.width;
      var height = this.options.height;
      // 
      // buffer.save();
      // buffer.restore();
      buffer.drawImage(video, 0, 0);   
      
      
      // for safari force a redraw
      if($.browser.safari == true) {
        $(this.element).find('canvas').css({padding:"0px"});
      }
      
      
      // this can be done without alphaData, except in Firefox which doesn't like 
      // it when image is bigger than the canvas
      var  image = buffer.getImageData(0, 0, width, height),
      imageData = image.data,
      alphaData = buffer.getImageData(0, height, width, height).data;
                      
      for (var i = 3, len = imageData.length; i < len; i = i + 4) {
        imageData[i] = alphaData[i-1];
      }      

     var success = output.putImageData(image, 0, 0, 0, 0, width, height);
     
    }



    /**
    * Check the play duration
    * Dont want to go over the loop period
    */
    
    avid5.prototype.check_loop = function () {
      var video = this.videoelem[0];
      var cur_pos = parseInt(video.currentTime * 1000);
      
                        
      if(cur_pos >= parseInt(this.options.video_loop_end)) {
        video.pause();
        video.currentTime = this.options.video_loop_start / 1000;
        // video.play();  
        
        // remove interval
        var instance = this;        
        clearInterval(instance.process_interval);      
        instance.process_interval = null;
                
        // create a random timeout and start the loop again
        var timeout = Math.floor(Math.random() * (10 - 1 + 1)) + 1; // between 1 and 10 seconds
        timeout *= 1000;
                
        setTimeout(function() { video.play(); }, timeout);              
      }
      
    }
    
    
    
    /**
    * Add the default event handlers from user interaction (hover/click)
    **/
    
    avid5.prototype.html5_setup_event_handlers = function() {
            
      var outputCanvas = this.outputcanvas[0];
      
      
      // CANVAS CLICK HANDLING
      this.outputcanvas.click(function(e){
        e.preventDefault();
        
        var instance = $(this).parent().data('avid5');
        var video = instance.videoelem[0];
        
        // temporarily pause the video
        video.pause();
        
        // remove the loop intervals and video events
        clearInterval(instance.process_interval);
        instance.process_interval = null;
        
        // Remove the loop event handlers
        //video.removeEventListener('ended', instance.video_listener_loop_ended, false);
        video.removeEventListener('play', instance.video_listener_loop_play, false);

        // Add in the playthrough!
        video.addEventListener('play', instance.video_listener_full_play, false);
        video.addEventListener('ended', instance.video_listener_full_ended, false);
        
        // Resume playing
        video.play();
          
        // action event handling. Call the default and extra callback after the delay
        setTimeout(
          function() {
            // instance.click_action_default_callback();
            instance.click_action_extra_callback();
          }, 
          instance.options.click_callback_delay
        );  
        
        
          
      });
      
          
      
       
      
    }

// Flash Specific
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // Nothing to see here.
  
  
  
// Default and static support
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    
    avid5.prototype.image_fallback_handlers = function() {
      
      var instance = this;
      
      $(this.element).click(function() {
        
        // action event handling. Call the default and extra callback after the delay
        setTimeout(
          function() {
            instance.click_action_extra_callback();
          }, 
          instance.options.action_callback_delay
        );
        
      });
      
      
      $(this.element).hover(function() {
        
        // action event handling. Call the default and extra callback after the delay
        setTimeout(
          function() {
            instance.hover_action_extra_callback();
          }, 
          instance.options.hover_callback_delay
        );
        
      }, funtion() {
        
        setTimeout(
          function() {
            instance.hover_out_action_extra_callback();
          }, 
          instance.options.hover_callback_delay
        );
        
      });
      
      
    }




// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


   // A really lightweight plugin wrapper around the constructor,
   // preventing against multiple instantiations
   $.fn[pluginName] = function ( options ) {
       return this.each(function () {
           if (!$.data(this, 'plugin_' + pluginName)) {
               $.data(this, 'plugin_' + pluginName,
               new avid5( this, options ));
           }
       });
   }

})( jQuery, window, document );



// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////