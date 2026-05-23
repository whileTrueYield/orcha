import { trim } from "lodash";
import fuzzysort from "fuzzysort";

interface Props {
  value: string;
  query: string;
}

export const HighlightMatch: React.FC<Props> = (props) => {
  const value = trim(props.value);
  const query = trim(props.query);

  const match = fuzzysort.single(query, value);

  if (match) {
    return (
      <>
        {fuzzysort.highlight(match, (m: string, i: number) => (
          <span className="font-extrabold" key={i}>
            {m}
          </span>
        ))}
      </>
    );
  } else {
    return <>{value}</>;
  }
};
