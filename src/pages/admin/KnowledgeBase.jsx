import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  FileText,
  Globe,
  HelpCircle,
  Loader2,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import LoadErrorBanner from "@/components/admin/LoadErrorBanner";

const TABS = [
  { id: "qa", label: "Q&A Pairs", Icon: HelpCircle },
  { id: "document", label: "Documents", Icon: FileText },
  { id: "web_page", label: "Web Pages", Icon: Globe },
];

export default function KnowledgeBase() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState("qa");

  // Q&A form
  const [qaTitle, setQaTitle] = useState("");
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");

  // Document form
  const [docFile, setDocFile] = useState(null);
  const [docUploading, setDocUploading] = useState(false);

  // Web page form
  const [webUrl, setWebUrl] = useState("");
  const [webTitle, setWebTitle] = useState("");
  const [webProcessing, setWebProcessing] = useState(false);

  const load = async () => {
    try {
      const data = await base44.entities.KnowledgeBase.list("-created_date");
      setItems(data);
    } catch (e) {
      console.error("Failed to load knowledge base", e);
      setLoadError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addQA = async (e) => {
    e.preventDefault();
    if (!qaQuestion.trim() || !qaAnswer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    try {
      const created = await base44.entities.KnowledgeBase.create({
        title: qaTitle || qaQuestion.slice(0, 60),
        type: "qa",
        question: qaQuestion,
        answer: qaAnswer,
        status: "active",
      });
      setItems((prev) => [created, ...prev]);
      setQaTitle("");
      setQaQuestion("");
      setQaAnswer("");
      toast.success("Q&A pair added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add Q&A pair");
    }
  };

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.error("Select a file first");
      return;
    }
    setDocUploading(true);
    try {
      // 1. Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: docFile });
      // 2. Extract text content
      let extracted = "";
      try {
        const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: "object",
            properties: {
              content: { type: "string" },
            },
          },
        });
        extracted = (res.output && (res.output.content || JSON.stringify(res.output))) || "";
      } catch (extErr) {
        console.warn("Extraction failed, saving without content", extErr);
      }
      const created = await base44.entities.KnowledgeBase.create({
        title: docFile.name,
        type: "document",
        file_url,
        file_name: docFile.name,
        content: extracted,
        status: "active",
      });
      setItems((prev) => [created, ...prev]);
      setDocFile(null);
      toast.success("Document added to knowledge base");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload document");
    } finally {
      setDocUploading(false);
    }
  };

  const addWebPage = async (e) => {
    e.preventDefault();
    if (!webUrl.trim()) {
      toast.error("URL is required");
      return;
    }
    setWebProcessing(true);
    try {
      // Use LLM with internet context to summarize the page
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize the key information about this company/services from the following URL: ${webUrl}. Provide a clear, factual summary of what they do, their services, pricing, and any key contact or product details. URL: ${webUrl}`,
        add_context_from_internet: true,
      });
      const content = typeof res === "string" ? res : JSON.stringify(res);
      const created = await base44.entities.KnowledgeBase.create({
        title: webTitle || webUrl,
        type: "web_page",
        source_url: webUrl,
        content,
        status: "active",
      });
      setItems((prev) => [created, ...prev]);
      setWebUrl("");
      setWebTitle("");
      toast.success("Web page added to knowledge base");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process web page");
    } finally {
      setWebProcessing(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      await base44.entities.KnowledgeBase.delete(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove");
    }
  };

  const filtered = items.filter((i) => i.type === tab);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadErrorBanner label="knowledge base" error={loadError} />

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Knowledge Base</h2>
        <p className="text-sm text-slate-500">
          Train the sales assistant with Q&amp;A pairs, documents, and web pages.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
              <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 ml-1">
                {items.filter((i) => i.type === t.id).length}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Q&A Form */}
      {tab === "qa" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={addQA} className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Add Q&amp;A Pair</h3>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Title (optional)</Label>
              <Input
                value={qaTitle}
                onChange={(e) => setQaTitle(e.target.value)}
                placeholder="Short label for this pair"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Question *</Label>
              <Textarea
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                placeholder="What the user might ask..."
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Answer *</Label>
              <Textarea
                value={qaAnswer}
                onChange={(e) => setQaAnswer(e.target.value)}
                placeholder="The correct response..."
                rows={4}
              />
            </div>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 w-full">
              <Plus className="h-4 w-4" />
              Add Q&amp;A Pair
            </Button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Saved Q&amp;A ({filtered.length})</h3>
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-lg">
                No Q&amp;A pairs yet.
              </p>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="text-slate-400 hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Q: {item.question}</p>
                  <p className="text-xs text-slate-500 whitespace-pre-wrap">A: {item.answer}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Document Upload */}
      {tab === "document" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleDocUpload} className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Upload Document</h3>
            <p className="text-xs text-slate-500">PDF, DOCX, or image files. Text is extracted automatically.</p>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">File *</Label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg py-6 px-4 hover:border-slate-400 transition-colors">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      {docFile ? docFile.name : "Click to choose a file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
            <Button type="submit" disabled={docUploading} className="bg-slate-900 hover:bg-slate-800 w-full">
              {docUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading & extracting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Document
                </>
              )}
            </Button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Documents ({filtered.length})</h3>
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-lg">
                No documents yet.
              </p>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                        {item.file_url && (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View file
                          </a>
                        )}
                        {item.content && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-3 whitespace-pre-wrap">
                            {item.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="text-slate-400 hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Web Page */}
      {tab === "web_page" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={addWebPage} className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Add Web Page</h3>
            <p className="text-xs text-slate-500">The assistant will fetch and summarize the page content.</p>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Title (optional)</Label>
              <Input
                value={webTitle}
                onChange={(e) => setWebTitle(e.target.value)}
                placeholder="Short label"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">URL *</Label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-slate-400 shrink-0" />
                <Input
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <Button type="submit" disabled={webProcessing} className="bg-slate-900 hover:bg-slate-800 w-full">
              {webProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching & summarizing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Web Page
                </>
              )}
            </Button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Web Pages ({filtered.length})</h3>
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-lg">
                No web pages yet.
              </p>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Globe className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate block"
                          >
                            {item.source_url}
                          </a>
                        )}
                        {item.content && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-3 whitespace-pre-wrap">
                            {item.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="text-slate-400 hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
