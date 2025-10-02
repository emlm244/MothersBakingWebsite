"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, TextArea } from "@ui";
import { useDataProvider } from "@/lib/data-provider";
import type { ContentBlock, GalleryItem } from "@data";

export default function AdminContentPage() {
  const provider = useDataProvider();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!provider) return;
    const [contentBlocks, galleryItems] = await Promise.all([
      provider.listContentBlocks(),
      provider.listGalleryItems(),
    ]);
    setBlocks(contentBlocks);
    setGallery(galleryItems);
  }, [provider]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBlockTitleChange = (id: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBlocks((prev) => prev.map((item) => (item.id === id ? { ...item, title: value } : item)));
  };

  const handleBlockBodyChange = (id: string) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setBlocks((prev) => prev.map((item) => (item.id === id ? { ...item, bodyMd: value } : item)));
  };

  const handleGalleryChange = (id: string) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setGallery((prev) => prev.map((item) => (item.id === id ? { ...item, description: value } : item)));
  };

  async function saveBlock(block: ContentBlock) {
    if (!provider) return;
    await provider.upsertContentBlock({ ...block, updatedAt: new Date().toISOString() });
    setMessage(`Saved ${block.title}`);
    void load();
  }

  async function saveGallery(item: GalleryItem) {
    if (!provider) return;
    await provider.upsertGalleryItem({ ...item, updatedAt: new Date().toISOString() });
    setMessage(`Updated ${item.title}`);
    void load();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-brand text-3xl text-brown">Content studio</h1>
        <p className="text-sm text-brown/70">Edit marketing content blocks and gallery captions.</p>
      </header>
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      <div className="space-y-6">
        {blocks.map((block) => (
          <Card key={block.id}>
            <CardHeader>
              <CardTitle>{block.title}</CardTitle>
              <CardDescription>Key: {block.key}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor={`title-${block.id}`}>Title</Label>
              <Input
                id={`title-${block.id}`}
                value={block.title}
                onChange={handleBlockTitleChange(block.id)}
              />
              <Label htmlFor={`body-${block.id}`}>Body (Markdown)</Label>
              <TextArea
                id={`body-${block.id}`}
                rows={6}
                value={block.bodyMd}
                onChange={handleBlockBodyChange(block.id)}
              />
              <Button onClick={() => saveBlock(block)}>Save block</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gallery captions</CardTitle>
          <CardDescription>Update descriptions that render on the gallery page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gallery.map((item) => (
            <div key={item.id} className="space-y-2 rounded-2xl border border-brown/10 bg-white p-4 shadow-soft">
              <Label htmlFor={`gallery-${item.id}`}>{item.title}</Label>
              <TextArea
                id={`gallery-${item.id}`}
                rows={3}
                value={item.description ?? ""}
                onChange={handleGalleryChange(item.id)}
              />
              <Button variant="outline" onClick={() => saveGallery(item)}>Save caption</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
