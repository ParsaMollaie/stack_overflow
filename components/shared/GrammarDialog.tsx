import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (correctedContent: string) => void;
  originalContent: {
    title: string;
    explanation: string;
    tags: string[];
  } | null;
  correctedContent: string | null;
}

const GrammarDialog: React.FC<AlertDialogProps> = ({
  open,
  onClose,
  onSubmit,
  originalContent,
  correctedContent,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="crad-wrapper">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-dark200_light900">
            AI Suggested Corrections
          </AlertDialogTitle>
          <AlertDialogDescription className="text-dark200_light900">
            The AI has suggested some corrections to your question. Please
            review them below:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4">
          <h4 className="text-dark200_light900">Original Content:</h4>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {originalContent?.explanation}
          </pre>
          <h4 className="mt-4 text-dark200_light900">Corrected Content:</h4>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {correctedContent}
          </pre>
        </div>
        <AlertDialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="text-dark200_light900"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (correctedContent) {
                onSubmit(correctedContent);
              }
              onClose();
            }}
            className="bg-primary-500 text-dark200_light900"
          >
            Use Corrected Version
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GrammarDialog;
