import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

type AnthropicMessageContent = {
  type: string;
  text: string;
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const imagePath = formData.get('imagePath') as string | null;

    let base64Image: string;
    let mediaType: "image/png" | "image/jpeg" | "image/gif" | "image/webp";

    if (image) {
      const imageBuffer = await image.arrayBuffer();
      base64Image = Buffer.from(imageBuffer).toString('base64');
      mediaType = image.type as "image/png" | "image/jpeg" | "image/gif" | "image/webp";
    } else if (imagePath) {
      const publicImagePath = path.join(process.cwd(), 'public', 'images', imagePath);
      const imageBuffer = await fs.readFile(publicImagePath);
      base64Image = imageBuffer.toString('base64');
      mediaType = "image/jpeg"; // Assuming all public images are JPG
    } else {
      return NextResponse.json({ error: 'No image or imagePath provided' }, { status: 400 });
    }

    // Validate mediaType
    if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(mediaType)) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
    }

    const prompt = `Analyze the provided image from an insurance provider's perspective. First, determine if the image is of an interior room or an exterior area (such as a garden). Then, perform the following tasks:

1. Identify the type of space:
   For interior:
   - Primary bedroom
   - Primary bathroom
   - Bathroom
   - Half bathroom
   - Bedroom
   - Walk-in closet
   - Closet
   - Kitchen
   - Dining room
   - Breakfast nook
   - Living room
   - Family room
   - Entry
   - Office
   - Laundry room
   - Hallway
   - Stairway
   - Garage
   - Other interior

   For exterior:
   - Vegetable garden
   - Flower garden
   - Herb garden
   - Rock garden
   - Water garden
   - Container garden
   - Woodland garden
   - Xeriscape garden
   - Mixed garden
   - Other exterior

   If the type is not clearly one of the listed options or if you cannot determine it with confidence, classify it as "Other interior" or "Other exterior" as appropriate.

2. For each feature, assign a boolean value: true if the feature is present in the image, and false if it is not present or not visible.

If you cannot determine the presence or absence of a feature with confidence, default to false.

Provide your analysis in the following JSON format:

{
  "locationType": "interior" | "exterior",
  "spaceType": "string",
  "features": {
    // Interior features (only include if locationType is "interior")
    "wallDamage": boolean,
    "visibleMold": boolean,
    "waterDamage": boolean,
    "outdatedElectrical": boolean,
    "plumbingIssues": boolean,
    "structuralCracks": boolean,
    "poorVentilation": boolean,
    "fireHazards": boolean,
    "trippingHazards": boolean,
    "pestInfestation": boolean,
    "roofLeaks": boolean,
    "flooringDamage": boolean,

    // Exterior features (only include if locationType is "exterior")
    "largeTreesNearStructures": boolean,
    "unstableSlopeOrRetainingWall": boolean,
    "waterFeatures": boolean,
    "trippingHazards": boolean,
    "poorDrainage": boolean,
    "overgrowthNearPowerLines": boolean,
    "deadOrDiseasedTrees": boolean,
    "unsecuredTools": boolean,
    "chemicalStorage": boolean,
    "fireHazards": boolean,
    "wildlifeAttractants": boolean,
    "invasiveSpecies": boolean,
    "unsecuredGardenStructures": boolean,
    "poorFencing": boolean,
    "visiblePestInfestation": boolean
  }
}

Where "string" in "spaceType" is replaced by the identified type from the appropriate list above.

Analyze the provided image and return only the JSON output without any additional explanation or commentary.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const result = JSON.parse((response.content[0] as AnthropicMessageContent).text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing image:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error processing image: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred while processing the image' }, { status: 500 });
    }
  }
}
