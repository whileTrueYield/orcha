import React from "react";

interface Props {
  onClick: () => void;
}

export const SearchMoreRow: React.FC<Props> = (props) => {
  return (
    <tr className="bg-gray-50 text-gray-500 transition hover:bg-brand-100 hover:text-brand-600">
      <td colSpan={20}>
        <button
          type="button"
          className="block w-full whitespace-nowrap py-2 text-center text-sm font-medium"
          onClick={props.onClick}
        >
          Click to load more...
        </button>
      </td>
    </tr>
  );
};
