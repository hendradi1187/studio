'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  Image,
  Archive,
  Database,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type FileCategory = 'seismic' | 'well_logs' | 'production' | 'reports' | 'other';

interface UploadedFile {
  fileName: string;
  originalName: string;
  size: number;
  type: string;
  category: FileCategory;
  path: string;
  uploadedAt: string;
}

interface FileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void;
  onFileRemoved?: (fileName: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  category?: FileCategory;
  allowCategorySelection?: boolean;
  disabled?: boolean;
  className?: string;
}

const FILE_ICONS = {
  'application/pdf': FileText,
  'text/csv': Database,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': Database,
  'application/vnd.ms-excel': Database,
  'image/png': Image,
  'image/jpeg': Image,
  'image/tiff': Image,
  'application/zip': Archive,
  'application/x-rar-compressed': Archive,
  'application/x-7z-compressed': Archive,
  'application/octet-stream': Database, // For SEG-Y files
  'text/plain': FileText, // For LAS files
  default: FileText,
};

const CATEGORY_DESCRIPTIONS = {
  seismic: 'Seismic survey data (SEG-Y, processed interpretations)',
  well_logs: 'Well logging data (LAS, DLIS, wireline logs)',
  production: 'Production data (CSV, Excel, time-series)',
  reports: 'Reports and documentation (PDF, Word, presentations)',
  other: 'Other file types and miscellaneous data',
};

export default function FileUpload({
  onFileUploaded,
  onFileRemoved,
  maxFiles = 5,
  maxSize = 100 * 1024 * 1024 * 1024, // 100GB default
  acceptedTypes = [
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/json',
    'text/xml',
    'application/xml',
    'image/png',
    'image/jpeg',
    'image/tiff',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/octet-stream', // SEG-Y files
    'text/plain', // LAS files
  ],
  category = 'other',
  allowCategorySelection = true,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [uploading, setUploading] = React.useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = React.useState<FileCategory>(category);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, fileName: string) => {
    // Check for specific file extensions
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'sgy' || ext === 'segy' || ext === 'seg') {
      return Database;
    }
    if (ext === 'las' || ext === 'dlis') {
      return FileText;
    }
    
    return FILE_ICONS[type as keyof typeof FILE_ICONS] || FILE_ICONS.default;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${formatFileSize(maxSize)}`;
    }

    const fileName = file.name.toLowerCase();
    const isSeismicFile = fileName.endsWith('.sgy') || fileName.endsWith('.segy') || 
                         fileName.endsWith('.seg') || fileName.endsWith('.segx');
    const isWellLogFile = fileName.endsWith('.las') || fileName.endsWith('.dlis') || 
                         fileName.endsWith('.lis');

    if (!acceptedTypes.includes(file.type) && !isSeismicFile && !isWellLogFile) {
      return 'File type not supported. Supported formats: SEG-Y, LAS, CSV, Excel, PDF, Images, Archives';
    }

    if (files.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    setUploading(prev => [...prev, fileId]);
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: Math.min((prev[fileId] || 0) + Math.random() * 30, 90)
        }));
      }, 500);

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      
      const uploadedFile: UploadedFile = {
        fileName: result.fileName,
        originalName: result.originalName,
        size: result.size,
        type: result.type,
        category: result.category,
        path: result.path,
        uploadedAt: result.uploadedAt,
      };

      setFiles(prev => [...prev, uploadedFile]);
      
      if (onFileUploaded) {
        onFileUploaded(uploadedFile);
      }

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: "destructive",
      });
    } finally {
      setUploading(prev => prev.filter(id => id !== fileId));
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 1000);
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;

    const filesArray = Array.from(selectedFiles);
    
    for (const file of filesArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "File validation failed",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }
      
      uploadFile(file);
    }
  };

  const handleFileRemove = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.fileName !== fileName));
    if (onFileRemoved) {
      onFileRemoved(fileName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {allowCategorySelection && (
        <div className="space-y-2">
          <Label htmlFor="category">File Category</Label>
          <Select value={selectedCategory} onValueChange={(value: FileCategory) => setSelectedCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select file category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_DESCRIPTIONS).map(([key, description]) => (
                <SelectItem key={key} value={key}>
                  <div>
                    <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card 
        className={cn(
          "border-2 border-dashed transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Upload className={cn("h-10 w-10", dragOver ? "text-primary" : "text-muted-foreground")} />
          </div>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop files here or click to browse
            <br />
            <span className="text-xs">
              Max {maxFiles} files, {formatFileSize(maxSize)} each
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={disabled}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= maxFiles}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {(files.length > 0 || uploading.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type, file.fileName);
              return (
                <div key={file.fileName} className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.originalName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {file.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFileRemove(file.fileName)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {uploading.map((fileId) => {
              const progress = uploadProgress[fileId] || 0;
              return (
                <div key={fileId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Uploading...</p>
                    <Progress value={progress} className="h-2 mt-1" />
                    <p className="text-sm text-muted-foreground mt-1">{Math.round(progress)}%</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}