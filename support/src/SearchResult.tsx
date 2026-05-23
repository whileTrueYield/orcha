interface ResultDocument {
  id: string;
  title: string;
  body: string;
  pageTitle: string;
}

interface Props {
  result: string;
  query: string;
  onClick: () => void;
  documentationId: string;
}

const uniqStringFilter = (value: string, index: number, array: string[]) =>
  array.indexOf(value) === index;

const indexAllWords = (
  source: string
): Array<{ value: string; pos: number }> => {
  // only do a matchAll if the browser supports it (94% should)
  if (!String.prototype.hasOwnProperty("matchAll")) {
    return [];
  }

  const words: { value: string; pos: number }[] = [];
  const indices = source.matchAll(/[a-z0-9]+/gi);

  while (true) {
    const word = indices.next();
    if (word.done) {
      return words;
    }

    words.push({
      value: word.value[0],
      pos: word.value.index as number,
    });
  }
};

export const SearchResult: React.FC<Props> = (props) => {
  const { result } = props;
  const queryFragment =
    props.query
      .toLowerCase()
      .match(/[a-z0-9]+/gi)
      ?.filter(uniqStringFilter) || [];

  const doc: ResultDocument = (window as any).documentsById[result];

  if (!doc) {
    return null;
  }

  const title = doc.pageTitle ? `${doc.pageTitle} > ${doc.title}` : doc.title;
  let body: JSX.Element[] = [<span key="text-whole">{doc.body}</span>];

  // find all the matches in the paragraph
  const positions: [number, number][] = [];

  // break down the document in words for matching
  const bodyWords = indexAllWords(doc.body);

  for (const word of queryFragment) {
    for (const bodyWord of bodyWords) {
      if (word.toLowerCase() === bodyWord.value.toLowerCase()) {
        positions.push([bodyWord.pos, bodyWord.pos + bodyWord.value.length]);
      }
    }
  }

  // sort the matched position from the greatest to the lowest
  positions.sort((b, a) => a[0] - b[0]);

  if (positions.length) {
    const focusPosition = positions[Math.floor(positions.length / 2)];
    const startPos = focusPosition[0] > 60 ? focusPosition[0] - 60 : 0;
    const stopPos =
      doc.body.length > startPos + 180 ? startPos + 180 : doc.body.length;

    body = [];
    let lastPosition = stopPos;
    for (const position of positions) {
      if (position[0] >= startPos && position[1] <= stopPos) {
        body.unshift(
          <span key={`text-${position[1]}-${lastPosition}`}>
            {doc.body.slice(position[1], lastPosition)}
          </span>
        );
        body.unshift(
          <strong
            className="text-sky-900 font-semibold"
            key={`high-${position[0]}-${position[1]}`}
          >
            {doc.body.slice(position[0], position[1])}
          </strong>
        );
        lastPosition = position[0];
      }
    }

    body.unshift(
      <span key={`text-start`}>{doc.body.slice(startPos, lastPosition)}</span>
    );
  }

  const [pageId, anchor] = result.split("#");

  return (
    <li className="">
      <button
        type="button"
        onClick={props.onClick}
        className="text-left max-w-full focus:ring-2 focus:outline-none group ring-sky-300 block rounded-md p-2 space-y-1 cursor-pointer hover:bg-sky-100 focus:bg-sky-100 group"
      >
        <div className="text-gray-600 font-semibold font-sm group-hover:text-gray-700 font-title group-focus:text-gray-700 ">
          {title}
          <a
            href={`${import.meta.env.VITE_DOCUMENTATION_URI}/doc/${
              props.documentationId
            }/${pageId}.html#${anchor}`}
            onClickCapture={(event) => event.stopPropagation()}
            target="_blank"
            rel="noreferrer"
            className="hover:underline font-normal text-sm hover:text-sky-800 text-gray-400 ml-2 whitespace-nowrap group-hover:text-sky-700"
          >
            new tab
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-6 inline-block px-1 align-text-bottom"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>

        <div className="text-gray-500 line-clamp-3 text-xs">
          &#8230; {body} &#8230;
        </div>
      </button>
    </li>
  );
};
