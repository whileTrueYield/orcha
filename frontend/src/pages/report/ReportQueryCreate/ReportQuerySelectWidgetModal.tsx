import { Dialog } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { Modal, ModalProps } from "components/modals/Modal";
import React, { useState } from "react";
import { Report } from "types/graphql";
import { ReportQueryCreateCalendarModal } from "./ReportQueryCreateCalendarModal";
import { ReportQueryCreateCompareThroughTimeModal } from "./ReportQueryCreateCompareThroughTimeModal";
import { ReportQueryCreateCompareValuesModal } from "./ReportQueryCreateCompareValuesModal";
import { ReportQueryCreateRatioModal } from "./ReportQueryCreateRatio";
import { ReportQueryCreateValuesBrokenDownModal } from "./ReportQueryCreateValuesBrokenDownModal";
import { ReportQueryCreateValuesThroughTimeModal } from "./ReportQueryCreateValuesThroughTimeModal";

interface Props extends ModalProps {
  report: Report;
}

interface WidgetType {
  title: string;
  icon: string;
  description: string;
}

const widgetTypes = [
  {
    title: "Compare through time",
    icon: "/img/icons/line-chart.svg",
    description: "This widget can be used to compare ticket created vs closed",
  },
  {
    title: "Values through time",
    icon: "/img/icons/line-chart.svg",
    description: "Display value or group of values evolutions through time",
  },
  {
    title: "Compare values",
    icon: "/img/icons/bar-chart.svg",
    description: "Compare the number of bug tickets between two products",
  },
  {
    title: "Values & sub-values",
    icon: "/img/icons/bar-chart.svg",
    description:
      "Display the number of ticket within a product and its workflows.",
  },
  {
    title: "Ratio",
    icon: "/img/icons/pie-chart.svg",
    description:
      "Display a single layer of data, like the number of ticket per workflow.",
  },
  {
    title: "Calendar",
    icon: "/img/icons/calendar.svg",
    description: "Display the number of tickets closed large period of time.",
  },
];

export const ReportQuerySelectWidgetModal: React.FC<Props> = (props) => {
  const [widgetType, setWidgetType] = useState<WidgetType | null>(null);

  const renderSelector = () => (
    <>
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
      >
        Select Widget
      </Dialog.Title>
      <Dialog.Description className="text-sm text-gray-600">
        Select a type of reporting widget below.
      </Dialog.Description>
      <div className="mt-4 space-y-4 text-left">
        <div role="list" className="space-y-1">
          {widgetTypes.map((widgetType, index) => (
            <button
              onClick={() => setWidgetType(widgetType)}
              key={index}
              className="flex w-full items-center rounded-xl border-2 border-transparent py-4 px-2 text-left hover:border-brand-300 hover:bg-brand-50"
            >
              <img
                className="hidden h-10 w-10 sm:block"
                src={widgetType.icon}
                alt=""
              />
              <div className="flex-1 sm:ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {widgetType.title}
                </p>
                <p className="text-sm text-gray-500">
                  {widgetType.description}
                </p>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const onWidgetClose = () => {
    props.onClose();
    setWidgetType(null);
  };

  const renderWidgetForm = (widgetType: WidgetType) => {
    switch (widgetType.title) {
      case "Compare through time":
        return (
          <ReportQueryCreateCompareThroughTimeModal
            {...props}
            onClose={onWidgetClose}
          />
        );
      case "Values through time":
        return (
          <ReportQueryCreateValuesThroughTimeModal
            {...props}
            onClose={onWidgetClose}
          />
        );
      case "Compare values":
        return (
          <ReportQueryCreateCompareValuesModal
            {...props}
            onClose={onWidgetClose}
          />
        );
      case "Values & sub-values":
        return (
          <ReportQueryCreateValuesBrokenDownModal
            {...props}
            onClose={onWidgetClose}
          />
        );
      case "Ratio":
        return (
          <ReportQueryCreateRatioModal {...props} onClose={onWidgetClose} />
        );
      case "Calendar":
        return (
          <ReportQueryCreateCalendarModal {...props} onClose={onWidgetClose} />
        );

      default:
        return null;
    }
  };

  return (
    <Modal {...props} large initialFocusSelector="#query-title">
      <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
        {widgetType ? renderWidgetForm(widgetType) : renderSelector()}
      </div>
    </Modal>
  );
};
