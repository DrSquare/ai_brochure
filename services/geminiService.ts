import { GoogleGenAI, Modality } from "@google/genai";
import { ImageData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const templateInstructions: { [key: string]: string } = {
  'classic-ad': `
    Layout Style: "Classic Ad".
    - The product image should be the dominant visual element.
    - The human model should be smaller, positioned to the side of or slightly behind the product, interacting with or presenting it.
    - The advertising copy should be placed in a clean, readable block at the bottom or top of the brochure.
  `,
  'modern-split': `
    Layout Style: "Modern Split Screen".
    - Divide the brochure vertically into two halves.
    - Place the product image prominently in the left half.
    - Place the human model in the right half, seamlessly integrated with the background.
    - Overlay the advertising copy stylishly on the right half.
  `,
  'minimalist-focus': `
    Layout Style: "Minimalist Focus".
    - The background should be clean and uncluttered.
    - The human model and product should be integrated together as the central focal point.
    - The advertising copy should be placed elegantly in a corner or a less busy area with ample negative space around it.
  `,
  'dynamic-showcase': `
    Layout Style: "Dynamic Showcase".
    - Use a dynamic, possibly angled, composition.
    - The product image should be the clear hero element.
    - The human model should be an integrated part of the scene, perhaps in the background or interacting with the product in a lifestyle context.
    - Place the advertising copy in a designated sidebar or a stylized text box.
  `
};

export async function generateBrochureImage(
  productImage: ImageData,
  modelImage: ImageData,
  backgroundImage: ImageData,
  adCopy: string,
  aspectRatio: string,
  template: string
): Promise<string | null> {
  const model = 'gemini-2.5-flash-image';

  const layoutInstruction = templateInstructions[template] || templateInstructions['classic-ad'];

  const prompt = `
    Create a professional and visually appealing advertising brochure image.
    Follow these instructions carefully:
    1.  Use the provided background image as the main canvas for the brochure.
    2.  Seamlessly integrate the human model image into the background. The model should look natural in the environment. Note that the model and product images may have artistic filters (like sepia or black & white) applied; maintain these styles.
    3.  Place the product image prominently, making it the main focus.
    4.  Incorporate the following advertising copy onto the brochure in a stylish, modern, and highly readable font: "${adCopy}"
    5.  Arrange all elements according to the specified layout style below.
    ${layoutInstruction}
    6.  The final output image must have an aspect ratio of ${aspectRatio}. For example, a 16:9 ratio is a wide landscape image, and a 1:1 ratio is a perfect square.
    The final output must be a single, combined image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: productImage.base64,
              mimeType: productImage.mimeType,
            },
          },
          {
            inlineData: {
              data: modelImage.base64,
              mimeType: modelImage.mimeType,
            },
          },
          {
            inlineData: {
              data: backgroundImage.base64,
              mimeType: backgroundImage.mimeType,
            },
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}