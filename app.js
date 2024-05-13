
 console.log(faceapi.nets);

 Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
  ]).then(startVideo)
  
   function startVideo() {
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
  }
  
  video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
     // const labeledFaceDescriptors = await loadLabeledImages();
      //const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, .6);
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      // const LabeledFaceDescriptors = await loadLabeledImages();
      // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, .6);

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    
      // results.forEach((result, i) => {
      //   const box = resizedDetections[i].detection.box;
      //   const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
      //   drawBox.draw(canvas);
      // });

      for (const detection of detections) {
        const box = detection.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: "Face" });
        drawBox.draw(canvas);
      }
    }, 100);
  });

  // function loadLabeledImages(){
  //   const labels = ['Ivan Peovski', 'Nina Dobrev'];
  //   return Promise.all(
  //     labels.map(async label => {
  //       const descriptions = [];
  //       for(let i = 1; i <= 2; i++){
  //         const img = await faceapi.fetchImage
  //         (`https://github.com/ipeovski/face-recognition-system/tree/161dd8beb06217fde36b701ea2a0440d6b7cfab5/labeled_images/${label}/${i}.jpg`);
  //         const detections = await faceapi.detectSingleFace(img)
  //         .withFaceLandmarks().withFaceDescriptor();
  //         descriptions.push(detections.descriptor);
  //       }

  //       return new faceapi.LabeledFaceDescriptors(label, descriptions);
  //     })
  //   );
  // }