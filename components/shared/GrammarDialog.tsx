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
  onUseMyVersion: () => void;
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
  onUseMyVersion,
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
      <AlertDialogContent className="w-full max-w-3xl p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[90vh] sm:max-h-[80vh]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg md:text-xl font-semibold text-dark200_light900">
            AI Suggested Corrections
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm md:text-base text-dark200_light900">
            The AI has suggested some corrections to your question. Please
            review them below:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 space-y-6">
          <div>
            <h4 className="font-medium text-sm md:text-base text-dark200_light900">
              Original Title:
            </h4>
            <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded max-w-full overflow-x-auto text-sm">
              {highlightChanges(
                originalContent?.title || '',
                changes?.title || []
              )}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-sm md:text-base text-dark200_light900">
              Corrected Title:
            </h4>
            <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded max-w-full overflow-x-auto text-sm">
              {ReactHtmlParser(correctedContent?.title || '')}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-sm md:text-base text-dark200_light900">
              Original Content:
            </h4>
            <div className="max-h-48 overflow-y-auto bg-gray-100 p-2 rounded text-sm">
              <pre className="whitespace-pre-wrap">
                {ReactHtmlParser(originalContent?.explanation || '')}
              </pre>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm md:text-base text-dark200_light900">
              Corrected Content:
            </h4>
            <div className="max-h-48 overflow-y-auto bg-gray-100 p-2 rounded text-sm">
              <pre className="whitespace-pre-wrap">
                {ReactHtmlParser(correctedContent?.content || '')}
              </pre>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto text-dark200_light900 bg-primary-500"
          >
            Cancel
          </Button>

          <Button
            onClick={onUseMyVersion}
            className="w-full sm:w-auto bg-gray-500 text-dark200_light900"
          >
            Use My Version
          </Button>

          <Button
            onClick={() => correctedContent && onSubmit(correctedContent)}
            variant="outline"
            className="w-full sm:w-auto text-dark200_light900"
          >
            Use AI Version
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GrammarDialog;
