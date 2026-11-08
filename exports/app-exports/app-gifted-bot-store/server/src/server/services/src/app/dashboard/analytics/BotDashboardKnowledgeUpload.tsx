export function KnowledgeUpload() {
  async function uploadFile(e: any) {
    const file = e.target.files[0];
    const form = new FormData();
    form.append("file", file);

    await fetch("/api/knowledge/upload", {
      method: "POST",
      body: form,
    });
  }

  return <input type="file" onChange={uploadFile} />;
}
