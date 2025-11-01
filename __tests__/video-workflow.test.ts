/**
 * 🧪 Tests du Workflow Vidéo Unifié
 * Tests complets pour le nouveau système de traitement vidéo
 */

import { VideoSourceDetector, VideoSource } from '../src/lib/video/video-source-detector';
import { VideoValidator } from '../src/lib/video/video-validator';
import { VideoCompressor } from '../src/lib/video/video-compressor';
import { VideoErrorHandler, VideoError } from '../src/lib/errors/video-errors';

// Mocks
jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  cacheDirectory: '/mock/cache/'
}));

describe('🔍 VideoSourceDetector', () => {
  describe('Source Detection', () => {
    test('should detect camera recorded video', () => {
      const cameraUris = [
        'file:///var/mobile/Containers/Data/Application/camera/video.mp4',
        'file:///tmp/expo-camera-12345.mp4',
        'file:///cache/ImagePicker/camera_video.mp4'
      ];
      
      cameraUris.forEach(uri => {
        const source = VideoSourceDetector.detectSource(uri);
        expect(source).toBe(VideoSource.CAMERA_RECORDED);
      });
    });
    
    test('should detect gallery selected video', () => {
      const galleryUris = [
        'file:///var/mobile/Media/DCIM/100APPLE/IMG_1234.MOV',
        'file:///storage/emulated/0/DCIM/Camera/VID_20231201.mp4',
        'file:///Users/Documents/golf_swing.mp4'
      ];
      
      galleryUris.forEach(uri => {
        const source = VideoSourceDetector.detectSource(uri);
        expect(source).toBe(VideoSource.GALLERY_SELECTED);
      });
    });
  });
  
  describe('Video Metadata', () => {
    test('should extract video metadata', async () => {
      const mockFileInfo = {
        exists: true,
        size: 10 * 1024 * 1024, // 10MB
        uri: 'file:///mock/video.mp4'
      };
      
      require('expo-file-system/legacy').getInfoAsync.mockResolvedValue(mockFileInfo);
      
      const metadata = await VideoSourceDetector.getVideoMetadata('file:///mock/video.mp4');
      
      expect(metadata.sizeMB).toBeCloseTo(10, 1);
      expect(metadata.source).toBe(VideoSource.GALLERY_SELECTED);
      expect(metadata.uri).toBe('file:///mock/video.mp4');
    });
    
    test('should handle missing file', async () => {
      require('expo-file-system/legacy').getInfoAsync.mockResolvedValue({
        exists: false
      });
      
      await expect(
        VideoSourceDetector.getVideoMetadata('file:///nonexistent.mp4')
      ).rejects.toThrow('Video file does not exist');
    });
  });
  
  describe('Compression Level Calculation', () => {
    test('should calculate no compression for small videos', () => {
      const metadata = {
        sizeMB: 5,
        source: VideoSource.CAMERA_RECORDED,
        uri: 'test.mp4'
      };
      
      const level = VideoSourceDetector.calculateCompressionLevel(metadata, 10);
      expect(level.quality).toBe(1.0);
      expect(level.aggressive).toBe(false);
    });
    
    test('should calculate aggressive compression for large videos', () => {
      const metadata = {
        sizeMB: 80,
        source: VideoSource.GALLERY_SELECTED,
        uri: 'test.mp4'
      };
      
      const level = VideoSourceDetector.calculateCompressionLevel(metadata, 10);
      expect(level.quality).toBeLessThan(0.3); // Plus agressif maintenant
      expect(level.aggressive).toBe(true);
      expect(level.resolution).toBe('720p');
    });
    
    test('should ensure compression guarantees Gemini compatibility', () => {
      const metadata = {
        sizeMB: 26.9, // Cas de test réel
        source: VideoSource.GALLERY_SELECTED,
        uri: 'test.mp4'
      };
      
      const level = VideoSourceDetector.calculateCompressionLevel(metadata, 10);
      const estimatedFinalSize = metadata.sizeMB * level.quality;
      
      expect(estimatedFinalSize).toBeLessThan(14.5); // Garantir < 15MB avec marge
      expect(level.aggressive).toBe(true);
    });
  });
});

describe('✅ VideoValidator', () => {
  describe('Camera Video Validation', () => {
    test('should validate optimal camera video', async () => {
      const mockMetadata = {
        sizeMB: 8,
        duration: 10,
        source: VideoSource.CAMERA_RECORDED,
        uri: 'file:///camera/video.mp4'
      };
      
      jest.spyOn(VideoSourceDetector, 'getVideoMetadata')
        .mockResolvedValue(mockMetadata);
      
      const validation = await VideoValidator.validateRecordedVideo('file:///camera/video.mp4');
      
      expect(validation.success).toBe(true);
      expect(validation.needsCompression).toBe(false);
      expect(validation.issues).toHaveLength(0);
    });
    
    test('should flag oversized camera video', async () => {
      const mockMetadata = {
        sizeMB: 15,
        duration: 12,
        source: VideoSource.CAMERA_RECORDED,
        uri: 'file:///camera/large.mp4'
      };
      
      jest.spyOn(VideoSourceDetector, 'getVideoMetadata')
        .mockResolvedValue(mockMetadata);
      
      const validation = await VideoValidator.validateRecordedVideo('file:///camera/large.mp4');
      
      expect(validation.success).toBe(true); // Still processable
      expect(validation.needsCompression).toBe(true);
      expect(validation.issues.some(issue => issue.type === 'size')).toBe(true);
    });
  });
  
  describe('Gallery Video Validation', () => {
    test('should validate small gallery video', async () => {
      const mockMetadata = {
        sizeMB: 6,
        source: VideoSource.GALLERY_SELECTED,
        uri: 'file:///gallery/small.mp4'
      };
      
      jest.spyOn(VideoSourceDetector, 'getVideoMetadata')
        .mockResolvedValue(mockMetadata);
      
      const validation = await VideoValidator.validateGalleryVideo('file:///gallery/small.mp4');
      
      expect(validation.success).toBe(true);
      expect(validation.needsCompression).toBe(false);
    });
    
    test('should reject extremely large gallery video', async () => {
      const mockMetadata = {
        sizeMB: 150,
        source: VideoSource.GALLERY_SELECTED,
        uri: 'file:///gallery/huge.mp4'
      };
      
      jest.spyOn(VideoSourceDetector, 'getVideoMetadata')
        .mockResolvedValue(mockMetadata);
      
      const validation = await VideoValidator.validateGalleryVideo('file:///gallery/huge.mp4');
      
      expect(validation.success).toBe(false);
      expect(validation.canProceed).toBe(false);
      expect(validation.issues.some(issue => issue.severity === 'error')).toBe(true);
    });
  });
});

describe('🗜️ VideoCompressor', () => {
  describe('Compression Logic', () => {
    test('should skip compression for small videos', async () => {
      const mockMetadata = {
        sizeMB: 8,
        source: VideoSource.CAMERA_RECORDED,
        uri: 'file:///small.mp4'
      };
      
      jest.spyOn(VideoSourceDetector, 'getVideoMetadata')
        .mockResolvedValue(mockMetadata);
      
      const result = await VideoCompressor.compressToTarget('file:///small.mp4', 10);
      
      expect(result.success).toBe(true);
      expect(result.method).toBe('no_compression');
      expect(result.compressionRatio).toBe(1.0);
    });
    
    test('should compress large videos', async () => {
      const mockMetadata = {
        sizeMB: 25,
        source: VideoSource.GALLERY_SELECTED,
        uri: 'file:///large.mp4'
      };
      
      jest.spyOn(VideoSourceDetector, 'getVideoMetadata')
        .mockResolvedValue(mockMetadata);
      
      // Mock file operations
      require('expo-file-system/legacy').getInfoAsync.mockResolvedValue({
        exists: true,
        size: 8 * 1024 * 1024 // 8MB after compression
      });
      
      const result = await VideoCompressor.compressToTarget('file:///large.mp4', 10);
      
      expect(result.success).toBe(true);
      expect(result.compressedSizeMB).toBeLessThan(10);
      expect(result.compressionRatio).toBeLessThan(1.0);
    });
  });
  
  describe('Size Estimation', () => {
    test('should estimate compressed size accurately', () => {
      const options = { quality: 0.6, resolution: '720p' };
      const estimated = VideoCompressor.estimateCompressedSize(20, options);
      
      expect(estimated).toBeLessThan(20);
      expect(estimated).toBeGreaterThan(0.5); // Minimum size
    });
  });
});

describe('🚨 VideoErrorHandler', () => {
  describe('Error Categorization', () => {
    test('should categorize size errors', () => {
      const sizeErrors = [
        'Video too large: 25MB',
        'Vidéo trop volumineuse: 30MB',
        'File size exceeds limit'
      ];
      
      sizeErrors.forEach(error => {
        const category = VideoErrorHandler.categorizeError(new Error(error));
        expect(category).toBe(VideoError.TOO_LARGE);
      });
    });
    
    test('should categorize compression errors', () => {
      const compressionErrors = [
        'Compression failed',
        'Unable to compress video',
        'Compression process error'
      ];
      
      compressionErrors.forEach(error => {
        const category = VideoErrorHandler.categorizeError(new Error(error));
        expect(category).toBe(VideoError.COMPRESSION_FAILED);
      });
    });
    
    test('should categorize network errors', () => {
      const networkErrors = [
        'Network connection failed',
        'Upload timeout',
        'Connection refused'
      ];
      
      networkErrors.forEach(error => {
        const category = VideoErrorHandler.categorizeError(new Error(error));
        expect(category).toBe(VideoError.NETWORK_ERROR);
      });
    });
  });
  
  describe('Error Messages', () => {
    test('should generate user-friendly error messages', () => {
      const errorInfo = VideoErrorHandler.getErrorMessage(VideoError.TOO_LARGE);
      
      expect(errorInfo.title).toBe('Problème de taille');
      expect(errorInfo.message).toContain('trop volumineuse');
      expect(errorInfo.suggestion).toContain('plus courte');
      expect(errorInfo.canRetry).toBe(true);
    });
    
    test('should handle non-retryable errors', () => {
      const errorInfo = VideoErrorHandler.getErrorMessage(VideoError.INVALID_FORMAT);
      
      expect(errorInfo.canRetry).toBe(false);
      expect(errorInfo.suggestion).toContain('MP4');
    });
  });
});

describe('🎯 Unified Workflow Integration', () => {
  test('should handle complete camera workflow', async () => {
    // Mock optimal camera video
    const mockMetadata = {
      sizeMB: 9,
      duration: 8,
      source: VideoSource.CAMERA_RECORDED,
      uri: 'file:///camera/optimal.mp4'
    };
    
    jest.spyOn(VideoSourceDetector, 'getVideoMetadata')
      .mockResolvedValue(mockMetadata);
    
    // Test validation
    const validation = await VideoValidator.validateRecordedVideo('file:///camera/optimal.mp4');
    expect(validation.success).toBe(true);
    expect(validation.needsCompression).toBe(false);
    
    // Test compression (should skip)
    const compression = await VideoCompressor.compressToTarget('file:///camera/optimal.mp4');
    expect(compression.method).toBe('no_compression');
  });
  
  test('should handle complete gallery workflow with compression', async () => {
    // Mock large gallery video
    const mockMetadata = {
      sizeMB: 30,
      source: VideoSource.GALLERY_SELECTED,
      uri: 'file:///gallery/large.mp4'
    };
    
    jest.spyOn(VideoSourceDetector, 'getVideoMetadata')
      .mockResolvedValue(mockMetadata);
    
    // Mock compressed file info
    require('expo-file-system/legacy').getInfoAsync.mockResolvedValue({
      exists: true,
      size: 9 * 1024 * 1024 // 9MB after compression
    });
    
    // Test validation
    const validation = await VideoValidator.validateGalleryVideo('file:///gallery/large.mp4');
    expect(validation.success).toBe(true);
    expect(validation.needsCompression).toBe(true);
    
    // Test compression
    const compression = await VideoCompressor.compressToTarget('file:///gallery/large.mp4');
    expect(compression.success).toBe(true);
    expect(compression.compressedSizeMB).toBeLessThan(10);
  });
});

// Cleanup
afterEach(() => {
  jest.clearAllMocks();
});