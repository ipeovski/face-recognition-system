 const startBtn = document.getElementById("start");
 const stopBtn = document.getElementById("stop");
 const videoContainer = document.getElementById("video-container");
 const btnsContainer = document.querySelector("buttons-container");
 const ulList = document.getElementById("list");

 Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
  ]);


  startBtn.addEventListener('click', () => {
    startVideo();
    });

  
  stopBtn.addEventListener('click', () => {
    stopVideo();
    startBtn.disabled = false;
  });

  
  function startVideo() {
    navigator.getUserMedia(
      { video: {} },
      stream => {
        video.srcObject = stream;
      },
      err => console.error(err)
    )
  }

  function stopVideo() {
    const videoElement = document.getElementById("video");
    if (videoElement && videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach(track => track.stop());
      videoElement.srcObject = null;
    }
  }
  
  video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize);

      const detectFaces = async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks().withFaceDescriptors();
      const labeledFaceDescriptors = await loadLabeledImages();
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, .6);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        if (resizedDetections[i].descriptor) {
          const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

          drawBox.draw(canvas);

          const existingLis = document.querySelectorAll(`li`);
          
          if(result.toString().split(' ')[0] == 'unknown'){
            //Do nothing
          } 

          else if(existingLis.length == 0 ){
            const li = document.createElement('li');
            li.textContent = result.toString().split(' ').splice(0, 2).join(' ');
            ulList.appendChild(li);
          } 

           else if(existingLis.length > 0){
          
            const liText = result.toString().split(' ').splice(0, 2).join(' ');

          if (ulList.hasChildNodes()) {
            const existingLis = Array.from(ulList.children);
            let existingLi = existingLis.find(li => li.textContent.trim() === liText);

            if (existingLi) {
              // Do nothing
            } else {
              existingLi = document.createElement('li');
              existingLi.textContent = liText;
              ulList.appendChild(existingLi);
            }
          } else {
            const li = document.createElement('li');
            li.textContent = liText;
            ulList.appendChild(li);
          }
            
            }
            

        }
      });
  }

    const intervalId = setInterval(() => {
      if (video.srcObject) {
        detectFaces();
      } else {
        clearInterval(intervalId);
      }
    }, 100);
  });

  function loadLabeledImages(){
    const labels = ['Ivan Peovski', 'Nina Dobrev'];
    return Promise.all(
      labels.map(async label => {
        const descriptions = [];
        for(let i = 1; i <= 2; i++){
          const img = await faceapi.fetchImage
          (`labeled_images/${label}/${i}.jpg`);
          const detections = await faceapi.detectSingleFace(img)
          .withFaceLandmarks().withFaceDescriptor();
          descriptions.push(detections.descriptor);
        }

        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  }
