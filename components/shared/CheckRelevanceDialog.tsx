import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';

interface CheckRelevanceDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onContinue: () => void;
}

const CheckRelevanceDialog = ({
  isOpen,
  onCancel,
  onContinue,
}: CheckRelevanceDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="card-wrapper md:p-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-dark400_light800 text-center font-semibold md:text-xl">
            Irrelevant Answer Detected
          </AlertDialogTitle>
          <AlertDialogDescription className="text-dark200_light900 md:text-lg text-center py-3">
            Your answer seems irrelevant to the question. Do you want to post it
            anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            onClick={onCancel}
            className="text-dark200_light900 bg-primary-500"
          >
            Cancel
          </Button>
          <Button
            onClick={onContinue}
            variant="outline"
            className="text-dark200_light900 "
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CheckRelevanceDialog;
