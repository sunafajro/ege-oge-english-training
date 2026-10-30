const audioTypes = [
  { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
  { mimeType: 'audio/webm', extension: 'webm' },
  { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
  { mimeType: 'audio/mp4', extension: 'm4a' },
];

export const recordAudio = (stream) => {
  return new Promise((resolve) => {
    const audioType = audioTypes.find(({ mimeType }) =>
      MediaRecorder.isTypeSupported(mimeType)
    );
    const mediaRecorder = audioType
      ? new MediaRecorder(stream, { mimeType: audioType.mimeType })
      : new MediaRecorder(stream);
    const extension = audioType?.extension ?? 'webm';
    const audioChunks = [];
    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size) {
        audioChunks.push(event.data);
      }
    });
    const start = () => {
      mediaRecorder.start();
    };
    const stop = () => {
      return new Promise((resolve) => {
        if (mediaRecorder.state === 'inactive') {
          resolve(null);
          return;
        }
        mediaRecorder.addEventListener(
          'stop',
          () => {
            const type =
              mediaRecorder.mimeType || audioType?.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunks, { type });
            const audioUrl = URL.createObjectURL(audioBlob);
            resolve({ audioUrl, extension });
          },
          { once: true }
        );
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      });
    };
    const cancel = () => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
    resolve({ start, stop, cancel });
  });
};

export const playBeep = (frequency) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    context.resume().catch(() => {});
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.15;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);
    oscillator.addEventListener('ended', () => context.close(), { once: true });
  } catch (e) {
    return;
  }
};

export const timeFormat = (seconds) => {
  const sec = seconds % 60;
  const min = seconds / 60 > 0 ? Math.floor(seconds / 60) : 0;
  return (min > 9 ? min : '0' + min) + ':' + (sec > 9 ? sec : '0' + sec);
};
