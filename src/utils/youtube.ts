export const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getEmbedUrl = (url: string): string => {
  const videoId = extractYouTubeId(url);
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
};
