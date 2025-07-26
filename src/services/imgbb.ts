const IMGBB_API_KEY = "0100bb0997f8e8f29f50bbee19a76bc8";
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

export async function uploadToImgBB(base64Image: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", base64Image.replace(/^data:image\/\w+;base64,/, ""));

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (data && data.success) {
      return data.data.url; // URL pública da imagem
    } else {
      throw new Error("Falha no upload da imagem");
    }
  } catch (error) {
    console.error("Erro ao enviar imagem para ImgBB:", error);
    return null;
  }
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}