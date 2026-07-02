'use server'

import { createClient } from "@/utils/supabase/server"

import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
})

export async function processAIImage(imageUrl: string, type: 'remove-bg' | 'upscale' = 'remove-bg') {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      // Demo mode if no API token is present
      console.log("No REPLICATE_API_TOKEN found, using demo simulation...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { 
        success: true, 
        processedUrl: imageUrl,
        isDemo: true,
        message: "Demo Mode: Add REPLICATE_API_TOKEN to .env for real background removal."
      };
    }

    let prediction;

    if (type === 'remove-bg') {
      prediction = await replicate.predictions.create({
        version: "fb8d6b13e5d0e2719f96b997c2763f0636f33230be08f86f9d22081d4512c525", // isnet-general-use
        input: { image: imageUrl }
      });
    } else {
      // Upscale/Enhance
      prediction = await replicate.predictions.create({
        version: "66004602952cf7c75a4073e1644783320f78508e826b1c67426176311029c78d", // real-esrgan
        input: { image: imageUrl, scale: 2 }
      });
    }

    // Wait for result (Poll for a few seconds as it's an MVP)
    const result = await replicate.wait(prediction);

    if (result.status === "succeeded") {
      // Replicate usually returns an array or single string URL
      const output = Array.isArray(result.output) ? result.output[0] : result.output;
      return { success: true, processedUrl: output };
    } else {
      throw new Error(`AI Processing failed with status: ${result.status}`);
    }

  } catch (error: any) {
    console.error("AI Processing Error:", error);
    return { success: false, error: error.message };
  }
}

export async function uploadProductImage(formData: FormData) {
  try {
    // Frontend se bheji hui file nikal rahay hain
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error("No image file provided.");
    }

    const supabase = await createClient();

    // File ka naam unique bana rahay hain taake overwrite na ho
    const fileExt = file.name.split('.').pop();
    const fileName = `product-raw-${Date.now()}.${fileExt}`;

    // File ko buffer mein convert karna zaroori hai backend upload k liye
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Uploading raw image directly to Supabase...");

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    // Upload hone k baad uska public URL nikal rahay hain
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    console.log("Image successfully uploaded at:", publicUrlData.publicUrl);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl
    };

  } catch (error: any) {
    console.error("Direct upload failed:", error);
    return { success: false, error: error.message };
  }
}