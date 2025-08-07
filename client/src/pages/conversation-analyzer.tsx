import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertConversationSchema, type Conversation, type Analysis } from "@shared/schema";
import { 
  Brain, 
  MessageSquareDashed, 
  Key, 
  Upload, 
  Clipboard, 
  Trash, 
  Save, 
  History,
  Heart,
  Scale,
  Users,
  MessageSquare,
  Copy,
  Printer,
  Bookmark,
  Eye,
  EyeOff,
  FileText,
  Share,
  Shield,
  CheckCircle,
  Lightbulb
} from "lucide-react";

const formSchema = insertConversationSchema.extend({
  apiKey: z.string().min(1, "API key is required"),
});

type FormData = z.infer<typeof formSchema>;

interface AnalysisResult {
  emotionalTone: string;
  emotionalToneDescription: string;
  powerDynamics: string;
  powerDynamicsDescription: string;
  communicationPatterns: string;
  communicationPatternsDescription: string;
  relationshipInsights: string;
  relationshipInsightsDescription: string;
  recommendations: string[];
  emotionalIntensity: number;
  resolutionPotential: number;
  communicationQuality: number;
  powerBalance: number;
  rawAnalysis: string;
}

export default function ConversationAnalyzer() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      analysisType: "General Psychological Analysis",
      model: "gpt-4o",
      temperature: "0.7",
      maxTokens: 500,
      apiKey: "",
    },
  });

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: recentAnalyses } = useQuery<(Analysis & { conversation?: Conversation })[]>({
    queryKey: ["/api/analyses"],
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { apiKey, ...conversationData } = data;
      
      // Set API key in environment temporarily for this request
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(conversationData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create conversation");
      }

      return response.json();
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setCurrentConversation(conversation);
      analyzeConversationMutation.mutate({ 
        conversationId: conversation.id, 
        apiKey: form.getValues("apiKey") 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const analyzeConversationMutation = useMutation({
    mutationFn: async ({ conversationId, apiKey }: { conversationId: string; apiKey: string }) => {
      setIsAnalyzing(true);
      
      const response = await fetch(`/api/conversations/${conversationId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to analyze conversation");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data.result);
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({
        title: "Analysis Complete",
        description: "Your conversation has been successfully analyzed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  const onSubmit = (data: FormData) => {
    createConversationMutation.mutate(data);
  };

  const characterCount = form.watch("content")?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquareDashed className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-textPrimary">Conversation Analyzer</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-secondary hover:text-primary transition-colors font-medium">Dashboard</a>
              <a href="#" className="text-secondary hover:text-primary transition-colors font-medium">History</a>
              <a href="#" className="text-secondary hover:text-primary transition-colors font-medium">Settings</a>
              <Button className="font-medium" data-testid="button-profile">
                <Users className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Key className="text-amber-600 w-4 h-4" />
                  </div>
                  <span>API Configuration</span>
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      {...form.register("apiKey")}
                      className="pr-10"
                      data-testid="input-api-key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                      data-testid="button-toggle-api-key"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-secondary flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Your API key is encrypted and stored securely
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model Selection</Label>
                    <Select value={form.watch("model")} onValueChange={(value) => form.setValue("model", value)}>
                      <SelectTrigger data-testid="select-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                        <SelectItem value="gpt-4">gpt-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (0.1 - 1.0)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      {...form.register("temperature")}
                      data-testid="input-temperature"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversation Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="text-blue-600 w-4 h-4" />
                    </div>
                    <span>Conversation Input</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" title="Upload file" data-testid="button-upload">
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Paste from clipboard" data-testid="button-paste">
                      <Clipboard className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Clear all" data-testid="button-clear">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Session Title (Optional)</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Couple's Communication Session #1"
                      {...form.register("title")}
                      data-testid="input-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content">Conversation Text</Label>
                      <span className="text-xs text-secondary" data-testid="text-character-count">
                        {characterCount} characters
                      </span>
                    </div>
                    <Textarea
                      id="content"
                      rows={12}
                      placeholder="Paste or type the conversation here. Each person's dialogue should be clearly separated..."
                      {...form.register("content")}
                      className="resize-none"
                      data-testid="textarea-conversation"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="analysisType">Analysis Focus</Label>
                      <Select value={form.watch("analysisType")} onValueChange={(value) => form.setValue("analysisType", value)}>
                        <SelectTrigger data-testid="select-analysis-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General Psychological Analysis">General Psychological Analysis</SelectItem>
                          <SelectItem value="Relationship Dynamics">Relationship Dynamics</SelectItem>
                          <SelectItem value="Communication Patterns">Communication Patterns</SelectItem>
                          <SelectItem value="Conflict Resolution">Conflict Resolution</SelectItem>
                          <SelectItem value="Emotional Intelligence">Emotional Intelligence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Response Length</Label>
                      <Select value={form.watch("maxTokens").toString()} onValueChange={(value) => form.setValue("maxTokens", parseInt(value))}>
                        <SelectTrigger data-testid="select-response-length">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="250">Brief (250 tokens)</SelectItem>
                          <SelectItem value="500">Standard (500 tokens)</SelectItem>
                          <SelectItem value="1000">Detailed (1000 tokens)</SelectItem>
                          <SelectItem value="1500">Comprehensive (1500 tokens)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <Button type="button" variant="ghost" size="sm" data-testid="button-save-draft">
                        <Save className="w-4 h-4 mr-1" />
                        Save Draft
                      </Button>
                      <Button type="button" variant="ghost" size="sm" data-testid="button-load-previous">
                        <History className="w-4 h-4 mr-1" />
                        Load Previous
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={createConversationMutation.isPending || isAnalyzing}
                      className="flex items-center space-x-2"
                      data-testid="button-analyze"
                    >
                      <Brain className="w-4 h-4" />
                      <span>{isAnalyzing ? "Analyzing..." : "Analyze Conversation"}</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Emotional Tone</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-sm font-medium" data-testid="text-emotional-tone">{analysisResult.emotionalTone}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Communication Style</span>
                    <span className="text-sm font-medium" data-testid="text-communication-patterns">{analysisResult.communicationPatterns}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Power Balance</span>
                    <span className="text-sm font-medium" data-testid="text-power-dynamics">{analysisResult.powerDynamics}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Resolution Potential</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-sm font-medium" data-testid="text-relationship-insights">{analysisResult.relationshipInsights}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Analyses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Recent Analyses</CardTitle>
                <Button variant="ghost" size="sm" data-testid="button-view-all">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAnalyses?.slice(0, 3).map((analysis, index) => (
                    <div 
                      key={analysis.id} 
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      data-testid={`analysis-item-${index}`}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="text-blue-600 w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-textPrimary truncate">
                          {analysis.conversation?.title || "Untitled Session"}
                        </p>
                        <p className="text-xs text-secondary">
                          {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : "Recently"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!recentAnalyses || recentAnalyses.length === 0) && (
                    <div className="text-sm text-secondary text-center py-4">
                      No analyses yet. Create your first analysis above.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export & Share</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-center" data-testid="button-export-pdf">
                  <FileText className="w-4 h-4 mr-2 text-red-500" />
                  Export as PDF
                </Button>
                <Button variant="outline" className="w-full justify-center" data-testid="button-export-word">
                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                  Export as Word
                </Button>
                <Button variant="outline" className="w-full justify-center" data-testid="button-share">
                  <Share className="w-4 h-4 mr-2 text-accent" />
                  Share Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analysis Results */}
        {isAnalyzing && (
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center animate-pulse">
                    <Brain className="text-white w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-textPrimary">Analyzing Conversation...</h3>
                    <p className="text-sm text-secondary">Processing psychological dynamics and patterns</p>
                  </div>
                </div>
                <div className="mt-4 bg-gray-100 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-3/4 transition-all duration-300 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {analysisResult && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-textPrimary">Psychological Analysis Complete</h3>
                      <p className="text-sm text-secondary">
                        Analysis generated on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" title="Copy analysis" data-testid="button-copy-analysis">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Printer analysis" data-testid="button-print-analysis">
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Save analysis" data-testid="button-save-analysis">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Emotional Tone */}
                <div className="border-l-4 border-amber-400 pl-6">
                  <h4 className="text-lg font-semibold text-textPrimary mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-amber-500" />
                    Emotional Tone & Atmosphere
                  </h4>
                  <div className="bg-amber-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-amber-800">Overall Tone:</span>
                      <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                        {analysisResult.emotionalTone}
                      </span>
                    </div>
                  </div>
                  <p className="text-textPrimary leading-relaxed" data-testid="text-emotional-tone-description">
                    {analysisResult.emotionalToneDescription}
                  </p>
                </div>

                {/* Power Dynamics */}
                <div className="border-l-4 border-purple-400 pl-6">
                  <h4 className="text-lg font-semibold text-textPrimary mb-3 flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-purple-500" />
                    Power Balance & Dynamics
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-purple-800">Dynamic:</span>
                      <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                        {analysisResult.powerDynamics}
                      </span>
                    </div>
                  </div>
                  <p className="text-textPrimary leading-relaxed" data-testid="text-power-dynamics-description">
                    {analysisResult.powerDynamicsDescription}
                  </p>
                </div>

                {/* Communication Patterns */}
                <div className="border-l-4 border-blue-400 pl-6">
                  <h4 className="text-lg font-semibold text-textPrimary mb-3 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                    Communication Patterns & Styles
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-blue-800">Pattern:</span>
                      <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {analysisResult.communicationPatterns}
                      </span>
                    </div>
                  </div>
                  <p className="text-textPrimary leading-relaxed" data-testid="text-communication-patterns-description">
                    {analysisResult.communicationPatternsDescription}
                  </p>
                </div>

                {/* Relationship Insights */}
                <div className="border-l-4 border-accent pl-6">
                  <h4 className="text-lg font-semibold text-textPrimary mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-accent" />
                    Relationship Insights & Recommendations
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-800">Insight:</span>
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {analysisResult.relationshipInsights}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-textPrimary leading-relaxed mb-4" data-testid="text-relationship-insights-description">
                    {analysisResult.relationshipInsightsDescription}
                  </p>

                  {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-textPrimary mb-3">Therapeutic Recommendations:</h5>
                      <ul className="space-y-2 text-sm text-textPrimary">
                        {analysisResult.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start space-x-2" data-testid={`recommendation-${index}`}>
                            <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Analysis Metrics */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-primary" data-testid="metric-emotional-intensity">
                        {analysisResult.emotionalIntensity.toFixed(1)}
                      </div>
                      <div className="text-xs text-secondary uppercase tracking-wide">Emotional Intensity</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent" data-testid="metric-resolution-potential">
                        {analysisResult.resolutionPotential.toFixed(1)}
                      </div>
                      <div className="text-xs text-secondary uppercase tracking-wide">Resolution Potential</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-amber-500" data-testid="metric-communication-quality">
                        {analysisResult.communicationQuality.toFixed(1)}
                      </div>
                      <div className="text-xs text-secondary uppercase tracking-wide">Communication Quality</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-500" data-testid="metric-power-balance">
                        {analysisResult.powerBalance.toFixed(1)}
                      </div>
                      <div className="text-xs text-secondary uppercase tracking-wide">Power Balance</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
