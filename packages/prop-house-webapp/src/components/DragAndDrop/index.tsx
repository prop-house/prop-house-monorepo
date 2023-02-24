import React, { useState, useEffect } from 'react';
import classes from './DragAndDrop.module.css';

interface DragAndDropProps {
  onFileDrop: (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
  showImageUploadModal: boolean;
  setShowImageUploadModal: (show: boolean) => void;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({
  onFileDrop,
  children,
  showImageUploadModal,
  setShowImageUploadModal,
}) => {
  const [drag, setDrag] = useState(false);
  let dragCounter = 0;

  const handleDrag = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragIn = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounter++;

    if (event.dataTransfer?.items && event.dataTransfer?.items.length > 0) {
      setDrag(true);
    }
  };

  const handleDragOut = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounter--;

    if (dragCounter === 0) {
      setDrag(false);
    }
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    setDrag(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      onFileDrop(event);
      setShowImageUploadModal(true);
      event.dataTransfer.clearData();
      dragCounter = 0;
    }
  };

  useEffect(() => {
    if (!showImageUploadModal) {
      const el = document.body;
      el.addEventListener('dragenter', handleDragIn);
      el.addEventListener('dragleave', handleDragOut);
      el.addEventListener('dragover', handleDrag);
      el.addEventListener('drop', handleDrop);

      return () => {
        el.removeEventListener('dragenter', handleDragIn);
        el.removeEventListener('dragleave', handleDragOut);
        el.removeEventListener('dragover', handleDrag);
        el.removeEventListener('drop', handleDrop);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImageUploadModal]);

  return (
    <div>
      {drag && (
        <div className={classes.fullPageDragDropContainer}>
          <span>Drop files to upload</span>
        </div>
      )}
      {children}
    </div>
  );
};

export default DragAndDrop;
