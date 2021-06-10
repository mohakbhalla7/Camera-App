
let dbAccess;
let container = document.querySelector(".container");
let request= indexedDB.open("Camera", 1);

request.addEventListener("success", function(){
    dbAccess= request.result; 
});

request.addEventListener("upgradeneeded", function(){
    let db= request.result;
    db.createObjectStore("gallery", {keyPath:"mId"});
});

request.addEventListener("error", function(){
     alert("some error occured");
});

function addMedia(type, media) {
    // Assuming ki tabhi chalega jab dbAccess hoga humare pas
    let tx = dbAccess.transaction("gallery", "readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    let data ={
        mId: Date.now(),
        type,
        media,
    };
    galleryObjectStore.add(data);
}

function viewMedia() {
    // Assuming ki tabhi chalega jab dbAccess hoga humare pas
    let tx = dbAccess.transaction("gallery", "readonly");
    let galleryObjectStore = tx.objectStore("gallery");
    let cursorRequest = galleryObjectStore.openCursor();
    cursorRequest.addEventListener("success", function(){
        let cursor = cursorRequest.result;

        if(cursor){
            let div = document.createElement("div");
            div.classList.add("media-card");
            div.innerHTML = `<div class= "media-container">
                </div>
                <div class="action-container">
                    <button class="material-icons-outlined media-download">file_download</button>
                    <button class="material-icons-outlined media-delete" data-id="${cursor.value.mId}">delete</button>
                </div>`;

            let downloadBtn = div.querySelector(".media-download");
            let deleteBtn = div.querySelector(".media-delete");

            deleteBtn.addEventListener("click", function(e){
                let mId = e.currentTarget.getAttribute("data-id");
                e.currentTarget.parentElement.parentElement.remove();
                deleteMediaFromDB(mId); 
            });

            if(cursor.value.type == "img") { 
                let img = document.createElement("img");
                img.classList.add("media-gallery");
                img.src = cursor.value.media;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(img);

                downloadBtn.addEventListener("click", function(e){
                    let a = document.createElement("a");
                    a.download = "image.jpg";
                    a.href = img.src;
                    a.click();
                    a.remove();
                });
            } else {
                let video = document.createElement("video");
                video.classList.add("media-gallery");
                video.src = window.URL.createObjectURL(cursor.value.media);
                video.addEventListener("mouseenter", function(){
                    video.currentTime = 0;
                    video.play();
                });
                video.addEventListener("mouseleave", function(){
                    video.pause();
                });
                video.controls = true;
                video.loop = true;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(video);

                downloadBtn.addEventListener("click", function(e){
                    let a = document.createElement("a");
                    a.download = "video.mp4";
                    a.href = e.currentTarget.parentElement.parentElement.querySelector(
                        ".media-container"
                        ).children[0].src;
                    a.click();
                    a.remove();
                });
            }
            container.appendChild(div);
            cursor.continue();
        }
    });
}

function deleteMediaFromDB(mId) {
    let tx = dbAccess.transaction("gallery", "readwrite");
    let galleryObjectStore = tx.objectStore("gallery");

    galleryObjectStore.delete(Number(mId));
}