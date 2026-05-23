import React from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { Disclosure } from "@headlessui/react";
import { ShowCount } from "./ShowCount";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { uniqBy } from "lodash";
import { MiniProduct } from "types/graphql";
import { ProductSelect } from "components/fields/ProductSelect";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
}

export function ProductFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, ...divProps } = props;

  divProps.className = cn(divProps.className);

  const onAddFilter = (product?: MiniProduct) => {
    if (product) {
      const filterElt: RecordFilterElement = {
        id: product.id,
        label: product.name,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          products: uniqBy([...filter.recordSets.products, filterElt], "id"),
        },
      });
    }
  };

  return (
    <div {...divProps}>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className=" my-1 flex w-full justify-between rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring">
              <div className="leading-5">
                Product
                <ShowCount arr={filter.recordSets.products} />
              </div>

              <ChevronRightIcon
                className={`${
                  open ? "rotate-90 transform " : ""
                } h-5 w-5 text-gray-400 transition-transform duration-150`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex-1 rounded-md bg-gray-100 p-2">
              <ProductSelect
                tabIndex={1}
                onChange={(product) => onAddFilter(product)}
                placeholder="Filter by product..."
                includeDraft
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
