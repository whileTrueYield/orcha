import React from "react";
import { Link } from "react-router-dom";
import { Tag } from "components/tags/Tag";
import { ModelStage, Product } from "types/graphql";
import { StageBadge } from "components/tags/StageBadge";

interface Props {
  product: Product;
  index: number;
  url: string;
}

export const ProductListRow: React.FC<Props> = (props) => {
  return (
    <Link
      to={props.url}
      className="col-span-6 block transform rounded-lg bg-white shadow transition duration-300 ease-in-out hover:scale-105 hover:shadow-md focus:scale-105 focus:shadow-lg focus:outline-none sm:col-span-3"
    >
      <div className="relative flex flex-col">
        {props.product.coverUrl ? (
          <img
            className="h-32 w-full rounded-t-lg bg-gray-300 object-cover sm:h-36"
            src={props.product.coverUrl}
            alt=""
          />
        ) : (
          <div
            className="h-32 w-full rounded-t-lg bg-gray-300 sm:h-36"
            style={{ backgroundImage: "linear-gradient(#ebf2ff, #adbbbb)" }}
          />
        )}

        {props.product.stage === ModelStage.Published ? null : (
          <div className="absolute left-2 top-24 sm:top-28">
            <StageBadge stage={props.product.stage} className="shadow" />
          </div>
        )}

        <div className="flex flex-col rounded-b-md bg-white px-4 py-5 sm:p-6">
          <div className="flex flex-row items-center justify-between text-xl">
            <div className="truncate text-gray-800">{props.product.name}</div>
            <Tag>{props.product.code}</Tag>
          </div>

          {props.product.description ? (
            <div className="mt-2 line-clamp-4 text-sm text-gray-600">
              {props.product.description}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
};
