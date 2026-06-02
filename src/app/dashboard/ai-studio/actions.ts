'use server'

import { createClient } from "@/utils/supabase/server"

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