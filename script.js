let video= document.querySelector("video");     //Yaha video tag select kiya
let body = document.querySelector("body");
let vidBtn = document.querySelector("button#record");
let capBtn = document.querySelector("button#capture");
let filters = document.querySelectorAll(".filter");
let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");
let galleryBtn = document.querySelector(".gallery");

let constraints= {video : true, audio : true};
let mediaRecorder;
let isRecording= false;
let chunks= [];

let minZoom= 1;
let maxZoom= 3;
let curZoom= 1;

let filter = "";

for(let i = 0; i < filters.length; i++) {
    // filters[i].addEventListener("mouseover", function(e) {
    //     filter = e.currentTarget.style.backgroundColor;
    //     removeFilter();
    //     applyFilter(filter);
    //     removeFilter();
    // }, false);

    filters[i].addEventListener("click", function(e) {
        filter = e.currentTarget.style.backgroundColor;
        removeFilter();
        applyFilter(filter);
    });
}

zoomIn.addEventListener("click", function() {
    console.log(1);
    let vidCurrScale = video.style.transform.split("(")[1].split(")")[0];
    if (vidCurrScale < maxZoom) {
        curZoom = Number(vidCurrScale) + 0.1;
        video.style.transform = `scale(${curZoom})`;
    }
});

zoomOut.addEventListener("click", function() {
    if (curZoom > minZoom) {
        curZoom -= 0.1;
        video.style.transform = `scale(${curZoom})`;
    }
});

vidBtn.addEventListener("click",function(){
    let innerDiv = vidBtn.querySelector("div");

    if(isRecording){
        mediaRecorder.stop();
        isRecording = false;
        innerDiv.classList.remove("record-animation");
    }
    else{
        mediaRecorder.start();
        filter="";
        removeFilter();
        curZoom = 1;
        video.style.transform = "scale(1)";
        isRecording = true;
        innerDiv.classList.add("record-animation");
    }
});

capBtn.addEventListener("click",function(){
    let innerDiv = capBtn.querySelector("div");

    innerDiv.classList.add("capture-animation");
    setTimeout(function(){
        innerDiv.classList.remove("capture-animation");
    }, 500)
    capture();
});

galleryBtn.addEventListener("click", function(){
    location.assign("gallery.html");
})

navigator.mediaDevices                          //navigator ek object hai jo humme browser ne diya hai. Usme ek object hai mediaDevices
    .getUserMedia(constraints)                  //jiska ek function hai getUserMedia. Vo function ki argument me contraints object de rakha
    .then(function(mediaStream){                //hai humne aur ye ek promise return krta hai. Iss promise me vo humme mideaStream object
        video.srcObject= mediaStream;           //deta hai jisme video stream hoti hai
        
        let options = { mimeType: "video/webm; codecs=vp9" };
        mediaRecorder = new MediaRecorder(mediaStream, options);

        /* Dataavailable humme mediaRecorder ke start hone se leke stop hone tak chunks array
           me data push krta rahega
        */
        mediaRecorder.addEventListener("dataavailable",function(e){
            chunks.push(e.data);
        });

        mediaRecorder.addEventListener("stop", function(){
            let blob = new Blob(chunks, {type : "video/mp4"});
            console.log(blob)
            addMedia("video", blob);
            chunks = [];

            // let url = URL.createObjectURL(blob);

            // let a = document.createElement("a");
            // a.href = url;
            // a.download = "video.mp4";
            // a.click();
            // a.remove();
        });
    });

    function capture(){
        let c = document.createElement("canvas");
        c.width = video.videoWidth;
        c.height = video.videoHeight;
        let ctx = c.getContext("2d");

        ctx.translate(c.width / 2, c.height / 2);
        ctx.scale(curZoom, curZoom);
        ctx.translate(-c.width / 2, -c.height / 2);

        ctx.drawImage(video, 0, 0);
        if (filter != "") {
            ctx.fillStyle = filter;
            ctx.fillRect(0, 0, c.width, c.height);
        }
        // let a = document.createElement("a");
        // a.download = "image.jpg";
        // a.href = c.toDataURL();
        addMedia("img", c.toDataURL());
        // a.click();
        // a.remove();
    }

    function applyFilter(filterColor) {
        let filterDiv = document.createElement("div");
        filterDiv.classList.add("filter-div");
        filterDiv.style.backgroundColor = filterColor;
        body.appendChild(filterDiv);
    }

    function removeFilter() {
        let filterDiv = document.querySelector(".filter-div");
        if (filterDiv){
            filterDiv.remove();
        }
    }