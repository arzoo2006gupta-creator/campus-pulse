"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Resource } from "@/lib/types/database";
import {
  createResourceAction,
  updateResourceAction,
  uploadAssetAction,
} from "@/lib/actions/admin";
import { UploadCloud } from "lucide-react";

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: Resource | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  { label: "Academic", value: "Academic" },
  { label: "Administrative", value: "Administrative" },
  { label: "Library", value: "Library" },
  { label: "Campus Support", value: "Campus Support" },
  { label: "Career & Tech", value: "Career & Tech" },
  { label: "General", value: "General" },
];

export function ResourceModal({
  isOpen,
  onClose,
  resource,
  onSuccess,
}: ResourceModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [resourceType, setResourceType] = useState<"link" | "file">("link");
  const [linkUrl, setLinkUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setDescription(resource.description || "");
      setCategory(resource.category);
      setResourceType(resource.resource_type);
      setLinkUrl(resource.link_url || "");
      setFileUrl(resource.file_url || "");
      setFileName(resource.file_name || "");
      setFileSizeBytes(resource.file_size_bytes);
      setIsPublished(resource.is_published);
    } else {
      setTitle("");
      setDescription("");
      setCategory("Academic");
      setResourceType("link");
      setLinkUrl("");
      setFileUrl("");
      setFileName("");
      setFileSizeBytes(null);
      setIsPublished(true);
    }
    setError(null);
  }, [resource, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadAssetAction(formData);
      if (res.success && res.data) {
        setFileUrl(res.data.url);
        setFileName(res.data.fileName);
        setFileSizeBytes(res.data.fileSize);
      } else {
        setError(res.error || "File upload failed.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      description: description || undefined,
      category,
      resource_type: resourceType,
      link_url: resourceType === "link" ? linkUrl : undefined,
      file_url: resourceType === "file" ? fileUrl : undefined,
      file_name: resourceType === "file" ? fileName : undefined,
      file_size_bytes: resourceType === "file" ? fileSizeBytes : undefined,
      is_published: isPublished,
    };

    startTransition(async () => {
      const res = resource
        ? await updateResourceAction(resource.id, payload)
        : await createResourceAction(payload);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to save resource");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resource ? "Edit Campus Resource" : "Add Campus Resource"}
      description="Add portals, guides, handbooks, and documents for student use."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Student Degree Audit Portal"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES}
          />

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Visible to students
              </span>
            </label>
          </div>
        </div>

        {/* Resource Type Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Resource Type
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
              <input
                type="radio"
                name="resourceType"
                checked={resourceType === "link"}
                onChange={() => setResourceType("link")}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>External Web Link / Portal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
              <input
                type="radio"
                name="resourceType"
                checked={resourceType === "file"}
                onChange={() => setResourceType("file")}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Document File Upload</span>
            </label>
          </div>
        </div>

        {resourceType === "link" ? (
          <Input
            label="Portal URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            required
            placeholder="https://..."
            helperText="Include https:// for external student services"
          />
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Upload Document File (PDF, DOCX, PNG)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                disabled={isUploading}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {isUploading && (
                <span className="text-xs text-blue-600 font-medium animate-pulse flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Uploading to Storage...</span>
                </span>
              )}
            </div>
            {fileUrl && (
              <p className="text-xs text-emerald-600 font-medium">
                ✓ Uploaded: {fileName || fileUrl}
              </p>
            )}
            <Input
              label="Direct File URL (or override)"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief summary of what students use this resource for..."
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isPending || isUploading}>
            Cancel
          </Button>
          <Button size="sm" type="submit" isLoading={isPending || isUploading}>
            {resource ? "Update Resource" : "Add Resource"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
