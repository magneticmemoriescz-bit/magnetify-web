import React, { useState } from 'react';
import { UploadedPhoto } from '../types';

// Tell TypeScript that uploadcare widget exists on the window object
declare global {
    interface Window {
        uploadcare: any;
    }
}

export interface UploadedFilesInfo {
    photos: UploadedPhoto[];
    groupId: string | null;
}

interface FileUploadProps {
  maxFiles: number;
  onFilesChange: (filesInfo: UploadedFilesInfo) => void;
  uploadedFilesInfo: UploadedFilesInfo;
  isReorderable?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ maxFiles, onFilesChange, uploadedFilesInfo, isReorderable = false }) => {
  const { photos } = uploadedFilesInfo;
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleUpload = () => {
    if (!window.uploadcare) {
        console.error("Uploadcare widget is not available.");
        alert("Služba pro nahrávání souborů není k dispozici. Zkuste prosím obnovit stránku.");
        return;
    }
    const alreadyUploaded = photos.map(p => p.url);
    const dialog = window.uploadcare.openDialog(alreadyUploaded, {
        imagesOnly: false, // Allow PDFs for printing
        multiple: true,
        multipleMax: maxFiles,
    });
    
    dialog.done((fileGroup: any) => {
        Promise.all(fileGroup.files()).then(files => {
            const uploadedPhotos: UploadedPhoto[] = files.map(file => ({ url: file.cdnUrl, name: file.name }));
            onFilesChange({ photos: uploadedPhotos, groupId: fileGroup.uuid });
        });
    });
  };

  const removeFile = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onFilesChange({ photos: newPhotos, groupId: null }); 
  };

  const handleDragStart = (index: number) => {
    if (!isReorderable) return;
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (!isReorderable || draggedIndex === null) return;
    setDropIndex(index);
  };
  
  const handleDragLeave = () => {
      setDropIndex(null);
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!isReorderable) return;
    e.preventDefault();
  };

  const handleDrop = () => {
    if (!isReorderable || draggedIndex === null || dropIndex === null) return;
    const newPhotos = [...photos];
    const draggedItem = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(dropIndex, 0, draggedItem);
    onFilesChange({ photos: newPhotos, groupId: uploadedFilesInfo.groupId });
    setDraggedIndex(null);
    setDropIndex(null);
  };

  return (
    <div className="space-y-4">
        <button 
            type="button" 
            onClick={handleUpload}
            className="w-full relative block border-2 border-dashed rounded-lg p-8 text-center hover:border-brand-primary hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all border-gray-300 bg-gray-50"
        >
             <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="mt-2 block text-sm font-medium text-brand-primary hover:underline">
                    {photos.length > 0 ? 'Spravovat soubory' : 'Klikněte pro nahrání souborů'}
                </span>
                <p className="mt-1 text-xs text-gray-500">Podporujeme JPG, PNG i tisková PDF.</p>
            </div>
        </button>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-700">Nahráno {photos.length} z {maxFiles} souborů</p>
        </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div 
              key={photo.url + index} 
              className="relative group border border-gray-200 rounded-md p-2 bg-white"
            >
                <div className="text-xs font-mono truncate mb-1">{photo.name}</div>
                <div className="h-20 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                    {photo.name.toLowerCase().endsWith('.pdf') ? (
                         <span className="text-red-500 font-bold">PDF</span>
                    ) : (
                        <img src={`${photo.url}-/preview/200x200/`} alt={photo.name} className="w-full h-full object-contain" />
                    )}
                </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};