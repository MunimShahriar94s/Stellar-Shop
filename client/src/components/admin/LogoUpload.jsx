import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const UploadContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary-color);
    background-color: #fff5f5;
  }
  
  &.dragover {
    border-color: var(--primary-color);
    background-color: #fff5f5;
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  color: #999;
  margin-bottom: 0.5rem;
`;

const UploadText = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const UploadButton = styled.label`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
  }
  
  input[type="file"] {
    display: none;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
`;

const PreviewImage = styled.img`
  max-width: 120px;
  max-height: 80px;
  border: 1px solid #eee;
  border-radius: 6px;
  object-fit: contain;
  background-color: #fafafa;
`;

const ImageInfo = styled.div`
  flex: 1;
`;

const ImageName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const ImageSize = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const RemoveButton = styled.button`
  padding: 0.6rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #c82333;
    transform: translateY(-1px);
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LogoUpload = ({ type, currentValue, onUpload, onRemove }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Update preview when currentValue changes
  useEffect(() => {
    if (currentValue && currentValue !== '/logo.png' && currentValue !== '/favicon.ico') {
      setPreview(currentValue);
    } else {
      setPreview(null);
    }
  }, [currentValue]);

  const validateFile = (file) => {
    setError(null);
    
    // Validate file type
    const validTypes = type === 'logo' 
      ? ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
      : ['image/x-icon', 'image/png', 'image/jpeg', 'image/jpg'];
    
    if (!validTypes.includes(file.type)) {
      setError(`Please select a valid ${type} file. Supported formats: ${validTypes.join(', ')}`);
      return false;
    }

    // Validate file size (max 2MB for logo, 1MB for favicon)
    const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 1 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`${type} file size must be less than ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return;

    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      
      // Update settings
      onUpload(data.imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload ${type}. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onRemove();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <UploadContainer>
      <UploadArea 
        className={dragOver ? 'dragover' : ''}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadIcon>📁</UploadIcon>
        <UploadText>
          Drag and drop your {type} here, or click to browse
        </UploadText>
        <UploadText style={{ fontSize: '0.8rem', color: '#999' }}>
          {type === 'logo' ? 'PNG, JPG, SVG (max 2MB)' : 'ICO, PNG, JPG (max 1MB)'}
        </UploadText>
        <UploadButton>
          {uploading ? (
            <>
              <LoadingSpinner />
              Uploading...
            </>
          ) : (
            `Choose ${type === 'logo' ? 'Logo' : 'Favicon'} File`
          )}
          <input
            type="file"
            accept={type === 'logo' ? 'image/*' : 'image/x-icon,image/png,image/jpeg,image/jpg'}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </UploadButton>
      </UploadArea>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {(preview || (currentValue && currentValue !== '/logo.png' && currentValue !== '/favicon.ico')) && (
        <PreviewContainer>
          <PreviewImage 
            src={preview || currentValue} 
            alt={`${type} preview`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <ImageInfo>
            <ImageName>{type === 'logo' ? 'Logo' : 'Favicon'}</ImageName>
            <ImageSize>
              {preview ? 'New upload' : 'Current file'}
            </ImageSize>
          </ImageInfo>
          <RemoveButton onClick={handleRemove}>
            Remove
          </RemoveButton>
        </PreviewContainer>
      )}
    </UploadContainer>
  );
};

export default LogoUpload;
