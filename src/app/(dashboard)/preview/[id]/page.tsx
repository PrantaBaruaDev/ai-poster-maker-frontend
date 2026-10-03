export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Preview {id}</h1>
      <p className="text-slate-600">Coming in soon.</p>
    </div>
  );
}