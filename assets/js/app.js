// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import 'phoenix_html'
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from 'phoenix'
import { LiveSocket } from 'phoenix_live_view'
import topbar from '../vendor/topbar'

let Hooks = {}
let liveSocket = null
Hooks.Webcam = {  
  mounted() {
    const constraints = { audio: true, video: true } // specify the media stream constraints
    let LV = this;
    //request access to the user's camera
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(
        function (mediaStream) {
          const options = {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
            // mimeType: 'video/webm'
            mimeType: 'video/mp4'
          }
          const mediaRecorder = new MediaRecorder(mediaStream, options) // create a new media recorder

          mediaRecorder.ondataavailable = function (event) {            
            if (event.data.size > 0) {               
              let fileReader = new FileReader();
              fileReader.onload = function() {              
          
                 LV.pushEvent('new_chunk',fileReader.result)
              };
              fileReader.readAsBinaryString(event.data);
              
              // LV.pushChunk(event.data)
              //  console.log(LV)
            }
          }

          console.log(mediaRecorder.start(300)) // start recording the video stream
        }.bind(this)
      )
      .catch(function (err) {
        console.log(err.name + ': ' + err.message) // handle the error
      })

  }
}

Hooks.VideoStream = {
  mounted() {    
    const videoElement = this.el  
    const event_name = this.el.getAttribute("phx-key")  
    const mediaSource = new MediaSource();
    let sourceBuffer = null;
    this.el.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', function(e) {
       sourceBuffer = mediaSource.addSourceBuffer("video/mp4");
      //sourceBuffer = mediaSource.addSourceBuffer('video/webm');
    })    
    videoElement.addEventListener("loadedmetadata",function(e){
      videoElement.play();
    } )

    this.handleEvent(event_name, function(data){      
      const string = data.value
      const typedArray = new Uint8Array(string.length);

      for (let i = 0; i < string.length; i++) {
        typedArray[i] = string.charCodeAt(i);
      }
       sourceBuffer.appendBuffer(typedArray)       
    })
  }
}

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content')
liveSocket = new LiveSocket('/live', Socket, { hooks: Hooks, params: { _csrf_token: csrfToken } })

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: '#29d' }, shadowColor: 'rgba(0, 0, 0, .3)' })
window.addEventListener('phx:page-loading-start', (_info) => topbar.show(300))
window.addEventListener('phx:page-loading-stop', (_info) => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket
