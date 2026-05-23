import "./MentionList.css";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { SuggestionProps } from "@tiptap/suggestion";

export default forwardRef<HTMLDivElement, SuggestionProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item });
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, (): any => {
    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    const eventHandlers = {
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    };

    return eventHandlers;
  });

  return (
    <div className="items">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`item block truncate ${
              index === selectedIndex ? "is-selected" : ""
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.label}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});
