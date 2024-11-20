'use client';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { z } from 'zod';
import { AnswerSchema } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { Button } from '../ui/button';
import Image from 'next/image';
import { createAnswer } from '@/lib/actions/answer.action';
import { usePathname } from 'next/navigation';
import { toast } from '../ui/use-toast';
import CheckRelevanceDialog from '../shared/CheckRelevanceDialog';

interface Props {
  question: string;
  questionId: string;
  authorId: string;
}

const Answer = ({ question, questionId, authorId }: Props) => {
  const { mode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAI, setIsSubmittingAI] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<z.infer<
    typeof AnswerSchema
  > | null>(null);

  const pathname = usePathname();

  const editorRef = useRef(null);
  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      answer: '',
    },
  });

  const handleSubmitAnswer = async (values: z.infer<typeof AnswerSchema>) => {
    setIsSubmitting(true);

    try {
      const answer = values.answer;
      const checkRelevanceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/checkRelevance`,
        {
          method: 'POST',
          body: JSON.stringify({ question, answer }),
        }
      );

      const relevanceResult = await checkRelevanceResponse.json();

      if (!relevanceResult.relevant) {
        setPendingSubmission(values);
        setIsDialogOpen(true);
        return;
      }

      await createAnswer({
        content: answer,
        author: JSON.parse(authorId),
        question: JSON.parse(questionId),
        path: pathname,
      });

      form.reset();
      if (editorRef.current) {
        const editor = editorRef.current as any;
        editor.setContent('');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    setPendingSubmission(null);
  };

  const handleDialogContinue = async () => {
    if (pendingSubmission) {
      await createAnswer({
        content: pendingSubmission.answer,
        author: JSON.parse(authorId),
        question: JSON.parse(questionId),
        path: pathname,
      });

      form.reset();
      if (editorRef.current) {
        const editor = editorRef.current as any;
        editor.setContent('');
      }
    }
    setIsDialogOpen(false);
    setPendingSubmission(null);
  };

  const generateAIAnswer = async () => {
    if (!authorId) {
      return toast({
        title: 'Please log in',
        description: 'You must be logged in to perform this action',
      });
    }
    setIsSubmittingAI(true);

    try {
      const responese = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/chatgpt`,
        {
          method: 'POST',
          body: JSON.stringify({ question }),
        }
      );
      const aiAnswer = await responese.json();
      // console.log(aiAnswer.reply);
      // Convert plain text to HTML format
      const formattedAnswert = aiAnswer.reply.replace(/\n/g, '<br />');

      if (editorRef.current) {
        const editor = editorRef.current as any;
        editor.setContent(formattedAnswert);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmittingAI(false);
    }
  };

  return (
    <>
      <CheckRelevanceDialog
        isOpen={isDialogOpen}
        onCancel={handleDialogCancel}
        onContinue={handleDialogContinue}
      />
      <div className="flex flex-col justify-between gap-5 mt-6 sm:flex-row sm:gap-2 sm:items-center">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 gap-1.5 rounded-md px-4 py-2.5 text-primary-500 shadow-none"
          onClick={generateAIAnswer}
        >
          {isSubmittingAI ? (
            <>Generating...</>
          ) : (
            <>
              <Image
                src="/assets/icons/stars.svg"
                alt="star"
                width={12}
                height={12}
                className="object-contain"
              />
              Generate AI Answer
            </>
          )}
        </Button>
      </div>
      <Form {...form}>
        <form
          className="mt-6 flex w-full flex-col gap-10"
          onSubmit={form.handleSubmit(handleSubmitAnswer)}
        >
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full gap-3">
                <FormControl className="mt-3.5">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                    onInit={(evt, editor) => {
                      //@ts-ignore
                      editorRef.current = editor;
                    }}
                    onBlur={field.onBlur}
                    onEditorChange={(connect) => field.onChange(connect)}
                    init={{
                      height: 350,
                      menubar: false,

                      plugins: [
                        'advlist',
                        'autolink',
                        'lists',
                        'link',
                        'image',
                        'charmap',
                        'preview',
                        'anchor',
                        'searchreplace',
                        'visualblocks',
                        'codesample',
                        'fullscreen',
                        'insertdatetime',
                        'media',
                        'table',
                      ],
                      toolbar:
                        'undo redo |  ' +
                        'codesample | bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist',
                      content_style:
                        'body { font-family:Inter; font-size:16px }',
                      skin: mode === 'dark' ? 'oxide-dark' : 'oxide',
                      content_css: mode === 'dark' ? 'dark' : 'light',
                    }}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="primary-gradient w-fit text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default Answer;
