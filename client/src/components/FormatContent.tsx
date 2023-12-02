export default function PostContent({
  content,
}: {
  content: string | undefined;
}) {
  return (
    <div>
      <div
        dangerouslySetInnerHTML={{ __html: content! }}
        style={{ wordWrap: "break-word" }}
      />
    </div>
  );
}
