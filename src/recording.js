export const recordAudio = stream => {
  return new Promise(resolve => {
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });
    const start = () => {
      mediaRecorder.start();
    };
    const stop = () => {
      return new Promise(resolve => {
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const audioUrl = URL.createObjectURL(audioBlob);
          resolve({ audioUrl });
        });
        mediaRecorder.stop();
      });
    };
    resolve({ start, stop });
  });
};
