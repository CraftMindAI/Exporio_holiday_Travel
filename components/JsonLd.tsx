/** Renders schema.org structured data as a JSON-LD script tag. */
export default function JsonLd({ data }: { data: object | object[] }) {
  // Escape "<" so content like "</script>" inside strings can't break out of the tag
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
