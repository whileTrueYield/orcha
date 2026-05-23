import { Label } from "components/fields/Label";
import { map } from "lodash";
import React, { FC, useEffect } from "react";
import { useWatch } from "react-hook-form";
import { ConnectForm, FormContextType } from "../fields/ConnectForm";
import { StarRating } from "./StarRating";

const difficulties = [
  {
    value: 1,
    label: "Very Simple - 1pt",
    className: "text-green-400",
  },
  {
    value: 2,
    label: "Simple - 2pts",
    className: "text-blue-400",
  },
  {
    value: 3,
    label: "Medium - 3pts",
    className: "text-yellow-300",
  },
  {
    value: 5,
    label: "Complex - 5pts",
    className: "text-orange-500",
  },
  {
    value: 8,
    label: "Very Complex - 8pts",
    className: "text-red-600",
  },
  {
    value: 13,
    label: "Sooo Insane - 13pts",
    className: "text-red-800",
  },
];

export interface TicketRatingModuleProps {
  name: string;
  label: string;
  description?: string;
  onChange?: (value: number) => void;
}

interface ElementProps extends TicketRatingModuleProps {
  formContext: FormContextType;
}

const TicketRatingModuleElement: FC<ElementProps> = (props) => {
  const { name, formContext, description, label } = props;
  const { register, control } = formContext;

  useEffect(() => {
    register(name);
  }, [register, name]);

  const value: number = useWatch({ name, control }) || 0;

  const setValue = (value: number) => {
    formContext.setValue(name, value);
    if (props.onChange) {
      props.onChange(value);
    }
  };

  const renderDescription = () => {
    if (description) {
      return <div className="text-sm text-gray-500">{description}</div>;
    }

    return null;
  };

  return (
    <div>
      <div className="flex flex-row items-end justify-between text-gray-700">
        <Label htmlFor={`rating-${name}`}>{label}</Label>
        <div>
          <select
            className="form-select rounded border border-gray-300 bg-white py-0.5 text-sm"
            placeholder="Choose complexity"
            onChange={(event) => setValue(parseInt(event.target.value))}
            id={`rating-${name}`}
            name={name}
            value={value}
            style={{ backgroundSize: "1rem" }}
          >
            <option value={0}>Unrated</option>
            {map(difficulties, (complexity) => (
              <option key={complexity.value} value={complexity.value}>
                {complexity.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <StarRating onChange={setValue} options={difficulties} value={value} />
      {renderDescription()}
    </div>
  );
};

export const TicketRatingModule: React.FC<TicketRatingModuleProps> = (
  props
) => (
  <ConnectForm>
    {(formContext) => <TicketRatingModuleElement {...props} {...formContext} />}
  </ConnectForm>
);
