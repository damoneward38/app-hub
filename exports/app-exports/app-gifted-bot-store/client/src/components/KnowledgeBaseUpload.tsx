/**
 * Knowledge Base Upload Component
 * Allows users to upload documents to train their bots
 * Integrated with BotDashboard for bot-specific training
 */

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Loader2, CheckCircle, AlertCircle, X, FileText } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: "uploading" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}

interface KnowledgeBaseUploadProps {
  botId: number;
  onUploadComplete?: () => void;
}

export function KnowledgeBaseUpload({ botId, onUploadComplete }: KnowledgeBaseUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutations
  const uploadFileMutation = trpc.knowledgeBase.uploadFile.useMutation({
    onSuccess: (data: any) => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === data.id
            ? { ...f, status: "processing", progress: 100 }
            : f
        )
      );

      // Simulate processing completion
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === (data as any).id
              ? { ...f, status: "completed" }
              : f
          )
        );
        onUploadComplete?.();
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to upload file";
      setError(errorMessage);
    },
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setError(null);
    const supportedTypes = ["application/pdf", "text/plain", "text/csv", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/markdown"];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!supportedTypes.includes(file.type)) {
        setError(`File type not supported: ${file.name}. Supported types: PDF, TXT, CSV, DOCX, Markdown`);
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 10MB`);
        continue;
      }

      // Create file entry
      const fileId = `${Date.now()}-${i}`;
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        status: "uploading",
        progress: 0,
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);

      // Upload file
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, progress: Math.min(f.progress + Math.random() * 30, 90) }
                : f
            )
          );
        }, 500);

        const fileContent = await file.text();

        await uploadFileMutation.mutateAsync({
          botId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileContent,
        });

        clearInterval(progressInterval);
      } catch (err) {
        setError(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type === "application/pdf") return "📄";
    if (type === "text/plain") return "📝";
    if (type === "text/csv") return "📊";
    if (type.includes("wordprocessingml")) return "📋";
    if (type === "text/markdown") return "📑";
    return "📁";
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Upload Knowledge Base</CardTitle>
          <CardDescription>Train your bot with documents and content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging
                ? "border-purple-500 bg-purple-500/10"
                : "border-purple-500/30 bg-slate-800/30 hover:border-purple-500/50"
            }`}
          >
            <Upload className="h-8 w-8 mx-auto mb-3 text-purple-400" />
            <p className="text-white font-medium mb-1">Drag files here or click to browse</p>
            <p className="text-sm text-purple-300 mb-4">
              Supported: PDF, TXT, CSV, DOCX, Markdown (max 10MB each)
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadFileMutation.isPending}
            >
              {uploadFileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.csv,.docx,.md"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-purple-200">Upload Progress</h3>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="bg-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{getFileIcon(file.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                        <p className="text-xs text-purple-300">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === "completed" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {file.status === "failed" && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {(file.status === "uploading" || file.status === "processing") && (
                        <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                      )}
                      {file.status !== "processing" && file.status !== "uploading" && (
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(file.status === "uploading" || file.status === "processing") && (
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        file.status === "completed"
                          ? "default"
                          : file.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {file.status === "uploading" ? "Uploading..." : file.status === "processing" ? "Processing..." : file.status}
                    </Badge>
                    {file.error && <p className="text-xs text-red-400">{file.error}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
