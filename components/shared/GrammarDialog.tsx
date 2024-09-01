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
import ReactHtmlParser from 'html-react-parser';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (correctedContent: { title: string; content: string }) => void;
  originalContent: {
    title: string;
    explanation: string;
    tags: string[];
  } | null;
  correctedContent: { title: string; content: string } | null;
  changes: {
    title: string[];
    explanation: string[];
  } | null;
}

const GrammarDialog: React.FC<AlertDialogProps> = ({
  open,
  onClose,
  onSubmit,
  originalContent,
  correctedContent,
  changes,
}) => {
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightChanges = (text: string, wordsToHighlight: string[]) => {
    let highlightedText = text;
    wordsToHighlight.forEach((word) => {
      const escapedWord = escapeRegExp(word);
      const regex = new RegExp(`(${escapedWord})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<span class="underline-error">$1</span>'
      );
    });
    // Ensure ReactHtmlParser processes the HTML string safely
    return ReactHtmlParser(highlightedText);
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="card-wrapper">
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
          <h4 className="text-dark200_light900">Original Title:</h4>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {highlightChanges(
              originalContent?.title || '',
              changes?.title || []
            )}
          </pre>
          <h4 className="mt-4 text-dark200_light900">Corrected Title:</h4>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {ReactHtmlParser(correctedContent?.title || '')}
          </pre>
          <h4 className="mt-4 text-dark200_light900">Original Content:</h4>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {highlightChanges(
              originalContent?.explanation || '',
              changes?.explanation || []
            )}
          </pre>
          <h4 className="mt-4 text-dark200_light900">Corrected Content:</h4>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {ReactHtmlParser(correctedContent?.content || '')}
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
