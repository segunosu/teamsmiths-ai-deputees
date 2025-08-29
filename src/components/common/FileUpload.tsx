import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  X, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  maxTotalSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFiles = 10,
  maxSizePerFile = 10,
  maxTotalSize = 30,
  acceptedTypes = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.zip'],
  className
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    if (type.includes('image')) return <ImageIcon className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = (fileList: File[]) => {
    return fileList.reduce((total, file) => total + file.size, 0);
  };

  const validateFiles = (newFiles: File[]) => {
    const errors: string[] = [];
    const combinedFiles = [...files, ...newFiles];

    // Check total number of files
    if (combinedFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    // Check individual file sizes
    newFiles.forEach(file => {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizePerFile) {
        errors.push(`${file.name} exceeds ${maxSizePerFile}MB limit`);
      }
    });

    // Check total size
    const totalSizeMB = getTotalSize(combinedFiles) / (1024 * 1024);
    if (totalSizeMB > maxTotalSize) {
      errors.push(`Total size exceeds ${maxTotalSize}MB limit`);
    }

    // Check file types
    newFiles.forEach(file => {
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExt)) {
        errors.push(`${file.name} type not supported`);
      }
    });

    return errors;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const errors = validateFiles(acceptedFiles);
    
    if (errors.length > 0) {
      setUploadErrors(errors);
      toast.error(`Upload failed: ${errors[0]}`);
      return;
    }

    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    setUploadErrors([]);
    onFilesChange(newFiles);
    
    toast.success(`${acceptedFiles.length} file(s) added successfully`);
  }, [files, maxFiles, maxSizePerFile, maxTotalSize, acceptedTypes, onFilesChange]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
    toast.success('File removed');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxSizePerFile * 1024 * 1024,
    multiple: true
  });

  const remainingFiles = maxFiles - files.length;
  const currentTotalSizeMB = getTotalSize(files) / (1024 * 1024);
  const remainingSizeMB = maxTotalSize - currentTotalSizeMB;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}>
        <CardContent {...getRootProps()} className="p-6 cursor-pointer text-center">
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          
          {isDragActive ? (
            <p className="text-lg font-medium">Drop files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supported: {acceptedTypes.join(', ')} • Max {maxSizePerFile}MB per file
              </p>
              <Button type="button" variant="outline">
                Choose Files
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Stats */}
      {(files.length > 0 || uploadErrors.length > 0) && (
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">
            {files.length}/{maxFiles} files
          </Badge>
          <Badge variant="outline">
            {formatFileSize(getTotalSize(files))}/{formatFileSize(maxTotalSize * 1024 * 1024)} used
          </Badge>
          {remainingFiles > 0 && (
            <Badge variant="secondary">
              {remainingFiles} more allowed
            </Badge>
          )}
          {remainingSizeMB > 0 && (
            <Badge variant="secondary">
              {remainingSizeMB.toFixed(1)}MB space left
            </Badge>
          )}
        </div>
      )}

      {/* Error Messages */}
      {uploadErrors.length > 0 && (
        <div className="space-y-2">
          {uploadErrors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Accepted formats: PDF, DOCX, PNG, JPG, ZIP</p>
        <p>• Maximum {maxSizePerFile}MB per file, {maxTotalSize}MB total</p>
        <p>• Up to {maxFiles} files can be uploaded</p>
      </div>
    </div>
  );
};

export default FileUpload;