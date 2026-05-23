import React, { FC, useState } from "react";
import { find, last, map, range, sortBy } from "lodash";
import cn from "classnames";
import { StarIcon } from "@heroicons/react/solid";

interface StarRatingOption {
  className: string;
  value: number;
}

interface Props {
  value?: number | null;
  options: StarRatingOption[];
  onChange?: (value: number) => void;
  readOnly?: boolean;
  className?: string;
}

const defaultOption: StarRatingOption = {
  className: "text-gray-200",
  value: 0,
};

export const StarRating: FC<Props> = (props) => {
  const { readOnly } = props;
  const options = sortBy(props.options || [], "value");
  const starCount = options.length ? last(options)!.value : 0;
  const [hoverValue, setHoverValue] = useState(0);
  const value = hoverValue ? hoverValue : props.value || 0;

  const activeOption: StarRatingOption =
    find(options, { value }) || defaultOption;

  const onMouseEnter = (position: number) => {
    const newValue = find(options, (option) => option.value > position);
    setHoverValue(newValue!.value);
  };

  const onMouseLeave = () => {
    setHoverValue(0);
  };

  const onchange = (value: number) => {
    if (props.onChange) {
      props.onChange(value);
    }
  };

  const renderStars = () => {
    return map(range(0, starCount), (position) => {
      const className = cn("w-5 h-5 transition duration-200", {
        [activeOption.className]: position < value,
        "text-gray-300": position >= value,
      });

      if (readOnly) {
        return (
          <span key={`star-${position}`} className="mt-1 flex-grow py-1">
            <StarIcon className={className} />
          </span>
        );
      }

      return (
        <span
          key={`star-${position}`}
          onMouseEnter={() => onMouseEnter(position)}
          onMouseLeave={onMouseLeave}
          onClick={() => onchange(value)}
          className="mt-1 flex-grow py-1"
        >
          <StarIcon className={className} />
        </span>
      );
    });
  };

  const containerClass = cn("flex flex-row", props.className);

  return <div className={containerClass}>{renderStars()}</div>;
};
