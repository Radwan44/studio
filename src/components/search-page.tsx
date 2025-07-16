"use client";

import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, allConfigProvided } from '@/lib/firebase';
import { summarizeSearchResults } from '@/ai/flows/summarize-search-results';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, BrainCircuit, FileX, AlertCircle } from 'lucide-react';
import FirebaseSetupInstructions from './firebase-setup-instructions';

type Student = {
  id: string;
  studentName: string;
  governorate: string;
  doctorName: string;
  className: string;
  jobTitle: string;
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    if (!allConfigProvided) {
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'students'));
        const studentsData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Student)
        );
        setAllStudents(studentsData);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch data from Firestore. Please ensure your configuration is correct and you have data in the "students" collection.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredStudents = useMemo(() => {
    if (!debouncedQuery) {
      return allStudents;
    }
    return allStudents.filter((student) =>
      Object.values(student).some((value) =>
        String(value).toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    );
  }, [debouncedQuery, allStudents]);

  useEffect(() => {
    if (filteredStudents.length > 0 && debouncedQuery) {
      const generateSummary = async () => {
        setIsSummaryLoading(true);
        setSummary('');
        try {
          const summaryInput = {
            results: filteredStudents.map((s) => ({
              studentName: s.studentName,
              governorate: s.governorate,
              doctorName: s.doctorName,
              className: s.className,
              jobTitle: s.jobTitle,
            })),
          };
          const result = await summarizeSearchResults(summaryInput);
          setSummary(result.summary);
        } catch (e) {
          console.error('Error generating summary:', e);
          setSummary('Could not generate AI summary for these results.');
        } finally {
          setIsSummaryLoading(false);
        }
      };
      generateSummary();
    } else {
      setSummary('');
    }
  }, [filteredStudents, debouncedQuery]);

  const renderContent = () => {
    if (!allConfigProvided) {
      return null; // Instructions are already visible
    }

    if (loading) {
      return (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Governorate</TableHead>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Job Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="mt-6 space-y-6">
        { (isSummaryLoading || summary) && (
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <BrainCircuit className="h-6 w-6 text-primary"/>
                    <CardTitle>AI-Powered Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    {isSummaryLoading ? <Skeleton className="h-16 w-full"/> : <p className="text-sm text-muted-foreground">{summary}</p>}
                </CardContent>
            </Card>
        )}
        
        {filteredStudents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Governorate</TableHead>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Class Name</TableHead>
                <TableHead>Job Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.studentName}</TableCell>
                  <TableCell>{student.governorate}</TableCell>
                  <TableCell>{student.doctorName}</TableCell>
                  <TableCell>{student.className}</TableCell>
                  <TableCell>{student.jobTitle}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : debouncedQuery && (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-16">
            <FileX className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Results Found</h3>
            <p className="text-muted-foreground">Your search for "{debouncedQuery}" did not match any students.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <FirebaseSetupInstructions isConfigured={allConfigProvided} />
      <Card className="transition-opacity duration-500" style={{ opacity: allConfigProvided ? 1 : 0.5, pointerEvents: allConfigProvided ? 'auto' : 'none' }}>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">EduFind</CardTitle>
          <CardDescription>
            Search for students across all fields in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, governorate, doctor, class, or job..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!allConfigProvided || loading}
              />
            </div>
            <Button type="submit" disabled={!allConfigProvided || loading}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
