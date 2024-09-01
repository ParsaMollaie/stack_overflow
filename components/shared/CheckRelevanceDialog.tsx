import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
          <AlertDialogDescription className="text-dark200_light900 md:text-lg">
            Your answer seems irrelevant to the question. Do you want to post it
            anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="text-dark200_light900"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onContinue}
            className="text-dark200_light900 bg-primary-500"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CheckRelevanceDialog;
