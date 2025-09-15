import { v2 as cloudinary } from 'cloudinary';
import { 
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET 
} from './env.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    public_id: string;
    secure_url: string;
    format: string;
    resource_type: string;
    bytes: number;
    width?: number;
    height?: number;
    duration?: number;
}

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or file path
 * @param options - Upload options
 */
export async function uploadToCloudinary(
    file: Buffer | string,
    options: {
        folder?: string;
        resource_type?: 'image' | 'video' | 'raw' | 'auto';
        public_id?: string;
        transformation?: any[];
        quality?: string | number;
        format?: string;
    } = {}
): Promise<UploadResult> {
    try {
        let fileToUpload: string;
        
        if (file instanceof Buffer) {
            fileToUpload = `data:application/octet-stream;base64,${file.toString('base64')}`;
        } else {
            fileToUpload = file as string;
        }

        const uploadOptions: any = {
            folder: options.folder || 'naijalingua',
            resource_type: options.resource_type || 'auto',
            quality: options.quality || 'auto',
            ...options
        };

        const result = await cloudinary.uploader.upload(fileToUpload, uploadOptions);

        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration
        };
    } catch (error) {
        console.error('=== Cloudinary Upload Error ===');
        console.error('Error:', error);
        console.error('Error type:', typeof error);
        console.error('Error constructor:', error?.constructor?.name);
        console.error('Cloudinary config check:', {
            cloud_name: CLOUDINARY_CLOUD_NAME || 'MISSING',
            api_key: CLOUDINARY_API_KEY ? `${CLOUDINARY_API_KEY.slice(0, 4)}...` : 'MISSING',
            api_secret: CLOUDINARY_API_SECRET ? `${CLOUDINARY_API_SECRET.slice(0, 4)}...` : 'MISSING'
        });
        
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }
        
        console.error('Unknown error type, stringified:', JSON.stringify(error));
        throw new Error('Failed to upload file to Cloudinary');
    }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @param resourceType - The type of resource to delete
 */
export async function deleteFromCloudinary(
    publicId: string,
    resourceType: 'image' | 'video' | 'audio' | 'raw' = 'image'
): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete file from Cloudinary');
    }
}

/**
 * Generate a transformation URL for an image
 * @param publicId - The public ID of the image
 * @param transformations - Array of transformations to apply
 */
export function getTransformedImageUrl(
    publicId: string,
    transformations: any[] = []
): string {
    return cloudinary.url(publicId, {
        transformation: transformations,
        secure: true
    });
}

/**
 * Generate video streaming URL
 * @param publicId - The public ID of the video
 * @param options - Video options
 */
export function getVideoStreamUrl(
    publicId: string,
    options: {
        quality?: string;
        format?: string;
        transformation?: any[];
    } = {}
): string {
    return cloudinary.video(publicId, {
        quality: options.quality || 'auto',
        format: options.format || 'mp4',
        transformation: options.transformation || [],
        secure: true
    });
}

/**
 * Generate audio streaming URL
 * @param publicId - The public ID of the audio
 * @param options - Audio options
 */
export function getAudioStreamUrl(
    publicId: string,
    options: {
        quality?: string;
        format?: string;
    } = {}
): string {
    return cloudinary.url(publicId, {
        resource_type: 'video', // Audio is handled as video in Cloudinary
        quality: options.quality || 'auto',
        format: options.format || 'mp3',
        secure: true
    });
}

export default cloudinary;
