interface Props {
  documentationId: string;
  documentationPageId: string;
}

export const DocumentationPage: React.FC<Props> = (props) => {
  const { documentationPageId, documentationId } = props;
  const [pageId, anchor] = documentationPageId.split("#");

  return (
    <iframe
      title="Documentation Page"
      className="w-full h-[calc(100vh-40px)]"
      src={`${
        import.meta.env.VITE_DOCUMENTATION_URI
      }/doc/${documentationId}/article/${pageId}.html#${anchor}`}
    ></iframe>
  );
};
