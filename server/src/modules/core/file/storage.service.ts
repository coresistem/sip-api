
import { supabase, BUCKET_NAME } from '../../../config/supabase';

export class StorageService {
    /**
     * Upload a file to Supabase Storage
     * @param file - The multer file object
     * @param path - The desired path in the bucket (e.g., 'avatars/user-123.jpg')
     * @returns Public URL of the uploaded file
     */
    static async uploadFile(file: any, path: string): Promise<string> {
        try {
            if (!file.buffer) {
                throw new Error('File buffer is empty');
            }

            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(path, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true,
                });

            if (error) {
                throw error;
            }

            return this.getPublicUrl(path);
        } catch (error) {
            console.error('Supabase Upload Error:', error);
            throw new Error('Failed to upload file to storage');
        }
    }

    /**
     * Get the public URL for a file
     * @param path - Path in bucket
     */
    static getPublicUrl(path: string): string {
        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    /**
     * Delete a file from storage
     * @param path - Path in bucket (or full URL)
     */
    static async deleteFile(pathOrUrl: string): Promise<void> {
        try {
            // Extract path if full URL is provided
            let path = pathOrUrl;
            if (pathOrUrl.includes('/storage/v1/object/public/')) {
                const parts = pathOrUrl.split(`/${BUCKET_NAME}/`);
                if (parts.length > 1) {
                    path = parts[1];
                }
            }

            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([path]);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Supabase Delete Error:', error);
            // We don't throw here to avoid blocking other operations if delete fails
        }
    }
}
