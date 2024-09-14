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
    const escapedWords = wordsToHighlight.map((word) => escapeRegExp(word));
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, index) =>
      escapedWords.includes(part.toLowerCase()) ? (
        <span key={index} className="underline-error">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="card-wrapper max-w-3xl">
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
          {/* Add static height and scrollbar for long content */}
          <div className="max-h-60 overflow-y-auto bg-gray-100 p-2 rounded">
            <pre className="whitespace-pre-wrap">
              {highlightChanges(
                originalContent?.explanation || '',
                changes?.explanation || []
              )}
            </pre>
          </div>

          <h4 className="mt-4 text-dark200_light900">Corrected Content:</h4>
          <div className="max-h-60 overflow-y-auto bg-gray-100 p-2 rounded">
            <pre className="whitespace-pre-wrap">
              {ReactHtmlParser(correctedContent?.content || '')}
            </pre>
          </div>
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
            onClick={() => correctedContent && onSubmit(correctedContent)}
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
