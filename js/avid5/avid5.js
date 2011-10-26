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
          ,swf_path               : ''
          ,swf_video_path         : ''
          ,action_img_path        : '' 
          ,autoplay               : true // play the looping portion of the video automatically
          ,video_loop_start       : 0 // in milliseconds
          ,video_loop_end         : 5000 // in miliseconds
          ,action_callback_delay  : 1000 // in milliseconds
          ,callback               : function() {} // external callback function
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
      
      /**
       * validates the browser for canvas and video capabilities
       * returns boolean
       **/
      ,is_html5_enabled: function() {
                
        if(this.has_canvas && (this.has_h264 == "" || this.has_h264 == "probably")) {
          return true;
        }
        return false;
      }
      
      /**
       * validates the browser for flash capabilities
       * returns boolean
       **/
      ,is_flash_enabled: function() {
        return false;
      }
      
      /**
      * Get Instance
      * Returns a stored instance by ID
      **/
      ,get_instance: function(id) {
        return this.instance_container[id];
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
                
              
       // Resize The element
       $(this.element).css({
         height: this.options.height + "px", 
         width : this.options.width + "px" , 
         overflow:"hidden"
        });
        
        
        // if html5 enabled build out that version
        if($.avid5.is_html5_enabled()){
          this.build_html5_vid();
        } 
        else if
       // If not html5 enabled but has flash
       // if html5 enabled build out that version
       (!$.avid5.is_html5_enabled() && $.avid5.is_flash_enabled()){
         this.build_flash_vid();
       }
       else
       // No flash no html5 then fallback to static image
       {
         // Sad face   :(
       }
       
       
   };


// Build / Setup
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
   * Browser support HTML5 canvas/video
   * Build out the canvas/video based plugin
   */
   
   avid5.prototype.build_html5_vid = function () {
     
     // Create some tags
     var outputCanvas = $("<canvas />");
     outputCanvas.addClass('output-canvas')
     .attr('style', 'display:block')
     .attr('height', parseInt(this.options.height))
     .attr('width', parseInt(this.options.width));
     
     var bufferCanvas = $("<canvas />");
     bufferCanvas.addClass('buffer-canvas')
     .attr('style', 'display:none')
     .attr('height', parseInt(this.options.height * 2))
     .attr('width', parseInt(this.options.width));
     
     var video = $("<video />");
     video.attr('style', "visibility:hidden")
     .attr('height', parseInt(this.options.height * 2))
     .attr('width', parseInt(this.options.width))
     .attr('preload', 'true')
     // .attr('loop', 'true')
     .attr("id", 'video-' + $.avid5.instance_count)
     .attr('class', 'video');
     
     var hiddenInstanceId = $("<input />")
     .attr('type','hidden')
     .attr('class', 'instanceID')
     .attr('value', $.avid5.instance_count);
     
     
     // Autoplay > moved to video events in play_loop
     // if(this.options.autoplay) {
     //   video.attr('autoplay','true'); 
     // }
      
     // Create the source video tag
     $.each(this.options.videos, function(i, v) {
       // create the tag
       var vidsource = "<source type=\"" + v.codec + "\" src='" + v.path + "' />";       
       // add it to the video tag
       video.append(vidsource);  
     });
     

     
     // Add it to the dom!
     var elem = $(this.element)
     elem.html(''); // clear out whatever is already there
     
     elem.append(outputCanvas);
     elem.append(bufferCanvas);
     elem.append(video);
     elem.append(hiddenInstanceId);
     
     // Add some more info
     outputCanvas.instanceID = this.instanceID;
     video.instanceID = this.instanceID;
     
     // store references for use later
     this.outputcanvas = outputCanvas;
     this.buffercanvas = bufferCanvas;
     this.videoelem = video;
     

     // Start the loop
    this.play_loop(); 
    
    // Event Handlers
    this.html5_setup_event_handlers()
    
    
    

     
   };
   

   /**
   * Browser supports flash
   * Build out the flash based plugin
   */
   
   avid5.prototype.build_flash_vid = function () {
     
     
     
   };


// Controls
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    
    avid5.prototype.play_loop = function() {
      
      
      // HTML 5 Loop
      if($.avid5.is_html5_enabled()) {
      
        var video = this.videoelem[0];
        video.instanceID = this.instanceID;
        video.loop_start = this.options.video_loop_start / 1000;
        
        // Check for autoplay
        if(this.options.autoplay) {
          video.addEventListener('canplay', function() {
            this.currentTime = this.loop_start;
            this.play();
          }, false);
        }
                
        // add play listenter to the video
        video.addEventListener('play', function() {
         // console.log("PLAY LOOP");
          clearInterval(this.process_interval);
          this.process_interval = setInterval(function() {
            var instance = $.avid5.get_instance(video.instanceID);
            instance.process_frame();
//            instance.check_loop();
          }, 35);
        }, false);


        // Firefox doesn't support looping video, so we emulate it this way
        video.addEventListener('ended', this.video_listener_ended, false);
        
        
       // add pause/stop listenter to the video
        video.addEventListener('pause', function() {
           clearInterval(this.process_interval);
        }, false);
        
        
        // Should probably add a seek here
        //video.play();
        
      } 
      else 
      // Flash Loop --------------------------------------------------------------------
      {
        // ...
      }
      
      
    }
    

// HTML 5 Specific
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    avid5.prototype.video_listener_ended = function() {
      
      console.log('ended');
      
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

      buffer.drawImage(video, 0, 0);

      // this can be done without alphaData, except in Firefox which doesn't like it when image is bigger than the canvas
      var	image = buffer.getImageData(0, 0, width, height),
      imageData = image.data,
      alphaData = buffer.getImageData(0, height, width, height).data;
  
      for (var i = 3, len = imageData.length; i < len; i = i + 4) {
        imageData[i] = alphaData[i-1];
      }

      output.putImageData(image, 0, 0, 0, 0, width, height);
     
    }



    /**
    * Check the play duration
    * Dont want to go over the loop period
    */
    
    avid5.prototype.check_loop = function () {
      var video = this.videoelem[0];
      var cur_pos = parseInt(video.currentTime * 1000);
      
      if(cur_pos >= this.options.video_loop_end) {
        video.pause();
        video.currentTime = this.options.video_loop_start / 1000;
        video.play();
      }
      
    }
    
    
    
    /**
    * Add the default event handlers from user interaction (hover/click)
    **/
    
    avid5.prototype.html5_setup_event_handlers = function() {
            
     var outputCanvas = this.outputcanvas[0];
         outputCanvas.instanceID = this.instanceID;
               
      // CLICK HANDLING
      this.outputcanvas.click(function(e){
        e.preventDefault();
        var instance = $.avid5.get_instance(outputCanvas.instanceID);
        var video = instance.videoelem[0];      
  
        // remove the loop intervals and video events        
        // clearInterval(video.process_interval);
        
        video.removeEventListener('ended', this.video_listener_ended, false);        

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




