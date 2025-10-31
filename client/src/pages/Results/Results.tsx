"use client";

import type React from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { backendUrl } from "@/config/backendUrl";


interface InterviewResult {
  technicalAssessment: {
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    codeQuality?: {
      rating: string;
      comments: string[];
    };
  };
  projectDiscussion: {
    score: number;
    feedback: string;
    insights: string[];
    technicalDepth: string;
  };
  behavioralAssessment: {
    score: number;
    feedback: string;
    communicationSkills: string;
    problemSolving: string;
    teamwork: string;
  };
  malpracticeFlags: {
    timestamp: string;
    type: string;
    description: string;
  }[];
  overallScore: number;
  finalRecommendation: string;
}

// Custom components for markdown rendering
const MarkdownComponents = {
  h1: ({ node, ...props }: any) => (
    <h1
      className="text-3xl font-bold mt-8 mb-4 text-gray-800 border-b pb-2"
      {...props}
    />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-800" {...props} />
  ),
  h4: ({ node, ...props }: any) => (
    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-700" {...props} />
  ),
  h5: ({ node, ...props }: any) => (
    <h5
      className="text-base font-semibold mt-3 mb-1 text-gray-700"
      {...props}
    />
  ),
  h6: ({ node, ...props }: any) => (
    <h6 className="text-sm font-semibold mt-3 mb-1 text-gray-700" {...props} />
  ),
  p: ({ node, ...props }: any) => (
    <p className="my-4 text-gray-600 leading-relaxed" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="my-4 pl-6 list-disc space-y-2" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="my-4 pl-6 list-decimal space-y-2" {...props} />
  ),
  li: ({ node, ...props }: any) => <li className="text-gray-600" {...props} />,
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 py-1 my-4 text-gray-600 italic"
      {...props}
    />
  ),
  a: ({ node, ...props }: any) => (
    <a className="text-primary hover:underline font-medium" {...props} />
  ),
  strong: ({ node, ...props }: any) => (
    <strong className="font-bold text-gray-800" {...props} />
  ),
  em: ({ node, ...props }: any) => (
    <em className="italic text-gray-700" {...props} />
  ),
  code: ({ node, inline, ...props }: any) =>
    inline ? (
      <code
        className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono"
        {...props}
      />
    ) : (
      <code
        className="block bg-gray-100 text-gray-800 p-4 rounded-md my-4 overflow-x-auto text-sm font-mono"
        {...props}
      />
    ),
  pre: ({ node, ...props }: any) => (
    <pre
      className="bg-gray-100 rounded-md p-4 my-4 overflow-x-auto"
      {...props}
    />
  ),
  hr: ({ node, ...props }: any) => (
    <hr className="my-8 border-gray-200" {...props} />
  ),
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-6">
      <table
        className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg"
        {...props}
      />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-gray-50" {...props} />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody className="divide-y divide-gray-200" {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="hover:bg-gray-50" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      {...props}
    />
  ),
  td: ({ node, ...props }: any) => (
    <td
      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
      {...props}
    />
  ),
  img: ({ node, ...props }: any) => (
    <img
      className="max-w-full h-auto rounded-lg my-4 mx-auto"
      {...props}
      alt={props.alt || ""}
    />
  ),
};

// Custom component for callouts/admonitions in markdown
const Callout = ({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: string;
}) => {
  const styles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <Info className="h-5 w-5 text-blue-500" />,
      text: "text-blue-800",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      text: "text-green-800",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      text: "text-amber-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      text: "text-red-800",
    },
  };

  const style = styles[type as keyof typeof styles] || styles.info;

  return (
    <div
      className={`${style.bg} ${style.border} border-l-4 rounded-r-md p-4 my-4`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5 mr-3">{style.icon}</div>
        <div className={`${style.text} text-sm`}>{children}</div>
      </div>
    </div>
  );
};

const Results = () => {
  // Precise Analysis state
  //@ts-ignore
  const [result, setResult] = useState<InterviewResult>(null);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
 const { interviewId } = useParams<{ interviewId: string }>();


  // Detailed Analysis state
  const [detailedText, setDetailedText] = useState<string>("");
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      try { 
    const response = await axios.get(`${backendUrl}/api/v1/interview/getinterviewresults/${interviewId}`);
    setResult(response.data.structured_response);
    setDetailedText(response.data.detailed_response);
    setLoading(false);
      } catch (err) { 
        console.error("Error fetching data:", err);
        setTextError("Failed to load detailed analysis.");
      }
    };

    fetchData();
  }, []);

  // Custom renderer for markdown that processes special syntax for callouts
  const renderMarkdown = (content: string) => {
    // Process custom callout syntax: :::type Content :::
    const processedContent = content.replace(
      /:::(info|success|warning|error)\s+([\s\S]+?):::/g,
      (_, type, content) => {
        return `<Callout type="${type}">${content.trim()}</Callout>`;
      }
    );

    return processedContent;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <span className="ml-4 text-lg text-gray-700">Loading...</span>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">
              Error Loading Results
            </h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  

  return (
    <Tabs defaultValue="precise" className="container mx-auto px-4 py-8">
      <TabsList className="mb-6">
        <TabsTrigger value="precise">Precise Analysis</TabsTrigger>
        <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
      </TabsList>

      <TabsContent value="precise">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Interview Results</CardTitle>
              <Badge
                variant={result.overallScore >= 70 ? "default" : "destructive"}
                className="text-lg px-4 py-2"
              >
                {result.overallScore}%
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{result.finalRecommendation}</p>
            </CardContent>
          </Card>

          {/* Technical Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Technical Assessment
                <Badge
                  variant={
                    result.technicalAssessment.score >= 70
                      ? "default"
                      : "destructive"
                  }
                >
                  {result.technicalAssessment.score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                {result.technicalAssessment.feedback}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">
                    Strengths
                  </h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.technicalAssessment.strengths.map((s, i) => (
                      <li key={i} className="text-gray-600">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">
                    Areas for Improvement
                  </h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.technicalAssessment.weaknesses.map((w, i) => (
                      <li key={i} className="text-gray-600">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Discussion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Project Discussion
                <Badge
                  variant={
                    result.projectDiscussion.score >= 70
                      ? "default"
                      : "destructive"
                  }
                >
                  {result.projectDiscussion.score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                {result.projectDiscussion.feedback}
              </p>
              <div>
                <h4 className="font-semibold mb-2">Key Insights</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {result.projectDiscussion.insights.map((insight, i) => (
                    <li key={i} className="text-gray-600">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technical Depth</h4>
                <p className="text-gray-700">
                  {result.projectDiscussion.technicalDepth}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Behavioral Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Behavioral Assessment
                <Badge
                  variant={
                    result.behavioralAssessment.score >= 70
                      ? "default"
                      : "destructive"
                  }
                >
                  {result.behavioralAssessment.score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                {result.behavioralAssessment.feedback}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Communication</h4>
                  <p className="text-gray-600">
                    {result.behavioralAssessment.communicationSkills}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Problem Solving</h4>
                  <p className="text-gray-600">
                    {result.behavioralAssessment.problemSolving}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Teamwork</h4>
                  <p className="text-gray-600">
                    {result.behavioralAssessment.teamwork}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Malpractice Flags */}
          {result.malpracticeFlags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">
                  Malpractice Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.malpracticeFlags.map((flag, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-red-50 rounded-lg"
                    >
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-700">{flag.type}</p>
                        <p className="text-sm text-red-600">
                          {flag.description}
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                          {flag.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="detailed">
        {textError ? (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 inline-block mr-2" />
            Error loading detailed analysis: {textError}
          </div>
        ) : (
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <ReactMarkdown
                components={MarkdownComponents}
                children={renderMarkdown(detailedText)}
              />
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default Results;
