"use client";

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileQuestion, Database, KeyRound, ClipboardCopy, Check, PartyPopper } from 'lucide-react';

const envFileContent = `NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
`;

export default function FirebaseSetupInstructions({ isConfigured }: { isConfigured: boolean }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(envFileContent);
    setCopied(true);
    toast({
      title: 'Copied to clipboard!',
      description: 'You can now paste the content into your .env.local file.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConfigured) {
    return (
       <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/50">
          <PartyPopper className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-600 dark:text-green-400">Firebase Connected</AlertTitle>
          <AlertDescription>
            Your Firebase configuration is loaded. The app is ready to use.
          </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="mb-8">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-accent" />
              <span className="font-semibold text-lg">How to connect your Firebase project</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p>
              To get started, you need to connect this app to your Firebase project. Follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-3 pl-2">
              <li>
                <strong>Go to your Firebase project settings:</strong>
                <br />
                Navigate to your project on the{' '}
                <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Firebase Console
                </a>
                , then click the gear icon and select "Project settings".
              </li>
              <li>
                <strong>Get your Firebase config object:</strong>
                <br />
                In your project settings, scroll down to the "Your apps" card. If you don't have a web app, create one. Click on the web app to find your config object (select the "Config" radio button).
              </li>
              <li>
                <strong>Create a <code>.env.local</code> file:</strong>
                <br />
                In the root directory of this project, create a new file named <code>.env.local</code>.
              </li>
              <li>
                <strong>Add your Firebase credentials to <code>.env.local</code>:</strong>
                <br />
                Copy the content below, paste it into your <code>.env.local</code> file, and replace the placeholder values with your actual Firebase config values.
                <div className="mt-2 rounded-md bg-muted p-4 relative">
                  <pre className="text-sm text-muted-foreground overflow-x-auto">
                    <code>{envFileContent}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                  </Button>
                </div>
              </li>
              <li>
                <strong>Add data to Firestore:</strong>
                 <br />
                In your Firebase console, go to Firestore Database. Create a collection named "students". Add a few documents with the following fields: <code>studentName</code>, <code>governorate</code>, <code>doctorName</code>, <code>className</code>, and <code>jobTitle</code>.
              </li>
              <li>
                <strong>Restart the development server:</strong>
                <br />
                Stop and restart the development server (<code>npm run dev</code>) for the new environment variables to be loaded.
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
