"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

interface EditProfileProps {
  initialName: string;
  initialBio: string;
  initialImage: string | null;
}

type SaveState = "idle" | "saving" | "error";
type UploadState = "idle" | "uploading" | "error";

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function EditProfile({ initialName, initialBio, initialImage }: EditProfileProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  const [image, setImage] = useState(initialImage);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState("");

  const isSaving = saveState === "saving";
  const isUploading = uploadState === "uploading";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setSaveState("error");
      setSaveError("Name is required.");
      return;
    }

    setSaveState("saving");
    setSaveError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() || null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSaveError(data?.error ?? "Something went wrong. Please try again.");
        setSaveState("error");
        return;
      }

      setSaveState("idle");
      router.refresh();
    } catch {
      setSaveError("Network error. Please try again.");
      setSaveState("error");
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState("uploading");
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setUploadError(data?.error ?? "Something went wrong. Please try again.");
        setUploadState("error");
        return;
      }

      const data: { url: string } = await res.json();
      setImage(data.url);
      setUploadState("idle");
      router.refresh();
    } catch {
      setUploadError("Network error. Please try again.");
      setUploadState("error");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <div className="mb-4 flex items-center gap-4">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name || "User"}
            className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-lg font-semibold text-gray-300">
            {initials(name)}
          </div>
        )}

        <div>
          <label className="inline-block cursor-pointer rounded-lg bg-gray-700 px-3 py-1.5 text-sm text-gray-200 transition hover:bg-gray-600">
            {isUploading ? "Uploading..." : "Change avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>
          {uploadState === "error" && uploadError && (
            <p className="mt-1 text-xs text-red-400">{uploadError}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-gray-300">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
            maxLength={100}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-600 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="bio" className="mb-1 block text-sm text-gray-300">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isSaving}
            rows={3}
            maxLength={500}
            placeholder="Tell other movie geeks about yourself"
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition focus:border-blue-600 disabled:opacity-50"
          />
        </div>

        {saveState === "error" && saveError && (
          <p className="text-sm text-red-400">{saveError}</p>
        )}

        <div>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
