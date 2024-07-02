import axios from 'axios';

export const convertLogoToBase64 = async (logo: string) => {
  if (logo) {
    const image = await axios.get(logo, {
      responseType: 'arraybuffer',
    });
    const base64Image = Buffer.from(image.data, 'binary').toString('base64');
    return `data:image/webp;base64,${base64Image}`;
  }
  return logo;
};
