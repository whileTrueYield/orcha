import { useEffect, useRef, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { QuestionMarkCircleIcon, XIcon } from "@heroicons/react/solid";
import { hideTips, showTips } from "actions/tips";
import cn from "classnames";
import { useSelector } from "react-redux";
import { isTipVisible } from "reducers/selector";
import { useAppDispatch } from "store";
import { Popover } from "components/Popover/Popover";
import { useOutsideClick } from "hooks/useOutsideClick";

interface Props extends React.PropsWithChildren {
  name: string;
  title: string;
  className?: string;
  floating?: boolean;
}
/**
 * This component displays a full tips section, it's being
 * triggered using the `<TipsBlock />` element with the same name
 *
 * ```tsx
 * <TipsLabel forTips="foo">Need Help?</TipsLabel>
 * <TipsBlock name="foo">Some tips goes here...</>
 * ```
 * @deprecated We probably be using `<PopoverTips />` now
 * @param props
 * @returns
 */
export const TipsBlock: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const isVisible = useSelector(isTipVisible(props.name));

  if (isVisible) {
    const className = cn("rounded-md bg-sky-50 p-4", props.className, {
      "inset-x-0 top-0 absolute shadow": props.floating,
    });

    return (
      <div className={className}>
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon
              className="h-5 w-5 text-sky-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3 space-y-2">
            <p className="text-sm font-medium text-sky-800">{props.title}</p>
            <p className="text-sm text-sky-800">{props.children}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={() => dispatch(hideTips(props.name))}
                className="inline-flex rounded-md bg-sky-50 p-1.5 text-sky-500 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-sky-50"
              >
                <span className="sr-only">Dismiss</span>
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else return null;
};

interface TipsLabelProps extends React.PropsWithChildren {
  forTips: string;
}

/**
 * This component displays a summary of the tips and display
 * the `<TipsBlock />` with the same name
 *
 * ```tsx
 * <TipsLabel forTips="foo">Need Help?</TipsLabel>
 * <TipsBlock name="foo">Some tips goes here...</>
 * ```
 *
 * @deprecated We probably be using `<PopoverTips />` now
 * @param props
 * @returns
 */
export const TipsLabel: React.FC<TipsLabelProps> = (props) => {
  const dispatch = useAppDispatch();
  const isVisible = useSelector(isTipVisible(props.forTips));

  const toggleTips = () => {
    if (isVisible) {
      dispatch(hideTips(props.forTips));
    } else {
      dispatch(showTips(props.forTips));
    }
  };

  return (
    <button
      type="button"
      className="group text-sm font-normal text-gray-600 transition hover:text-brand-500 hover:underline sm:block"
      onClick={toggleTips}
    >
      <InformationCircleIcon className="relative mr-1 -mt-0.5 hidden h-4 w-4 text-gray-500 group-hover:text-brand-400 sm:inline-block" />
      {props.children}
    </button>
  );
};

interface PopoverTipsProps extends React.PropsWithChildren {
  title: string;
  button?: React.ReactNode;
  className: string;
  light?: boolean;
}

/**
 * This displays a tooltip pop-up through a portal (outside the trigger element)
 * The tooltip is sized to be reasonnably easy to read on desktop and mobile.
 *
 * Tips can be dismissed using Escape key, clickout out or clicking the X button
 * on the top right.
 *
 * Example:
 * ```tsx
 * <PopoverTips
 *    title = "Your checklist"
 *    className="group relative top-1 inline-block px-1"
 *    button={<QuestionMarkCircleIcon className="h-5 w-5 text-gray-300 group-hover:text-brand-600" />}
 * >
 *    Checklist helps you remember small items that do not always fit a ticket.
 * </PopoverTips>
 * ```
 */
export const PopoverTips: React.FC<PopoverTipsProps> = (props) => {
  const [isVisible, setVisible] = useState(false);
  const popoverRef = useRef(null);
  const buttonContainerRef = useRef(null);
  const [referenceElement, setReferenceElement] =
    useState<HTMLSpanElement | null>(null);

  // detect if a user press the "Esc" key and close the tooltip
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // even tho the value is a Boolean (which is an immutable), it
      // seems that React still re-trigger a render, so we check
      // that the tooltip is visible before closing it, it prevents
      // re-rendering more elements than necessary when a page contains
      // more than one tooltip
      if (isVisible && event.code === "Escape") {
        setVisible(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [referenceElement, setVisible, isVisible]);

  // close the tooltip if a user click outside of the tooltip
  useOutsideClick(buttonContainerRef, () => setVisible(false), {
    ignoreTooltipClick: true,
  });

  // Adding classes based on the visibility to help customize
  // the child button. These classes don't point to any existing CSS
  // instead they are to be used to color an active button using tailwindCSS,
  // for example, to change the icon to blue when active:
  // group-[.tips-is-visible]:text-brand-600
  const buttonClassName = cn("group", props.className, {
    "tips-is-visible": isVisible,
    "tips-is-invisible": !isVisible,
  });

  const renderButton = () => {
    if (props.button) {
      return props.button;
    } else {
      return (
        <QuestionMarkCircleIcon className="h-5 w-5 text-gray-300 group-hover:text-brand-600 group-[.tips-is-visible]:text-brand-600" />
      );
    }
  };

  return (
    <>
      <span
        role="button"
        onClick={() => setVisible(!isVisible)}
        ref={buttonContainerRef}
        className={buttonClassName}
      >
        <span ref={setReferenceElement}>{renderButton()}</span>
      </span>
      {referenceElement && isVisible ? (
        <Popover
          referenceElement={referenceElement}
          className="z-[100] w-96 max-w-xs cursor-auto px-2 sm:max-w-sm sm:px-0"
          background={props.light ? "bg-gray-100" : "bg-gray-900"}
        >
          <div
            ref={popoverRef}
            className={cn("relative overflow-hidden rounded-md p-4 shadow-lg", {
              "bg-gray-900": !props.light,
              "bg-gray-200": props.light,
            })}
          >
            <div className="pointer-events-none absolute -top-24 -right-6 text-[240px] font-bold text-gray-400 text-opacity-20">
              ?
            </div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className={cn("absolute right-1.5 top-1.5 z-10 rounded p-1", {
                "text-gray-200 hover:bg-gray-400 hover:bg-opacity-25 hover:text-gray-100":
                  !props.light,
                "text-gray-700 hover:bg-gray-500 hover:bg-opacity-25 hover:text-gray-900":
                  props.light,
              })}
            >
              <XIcon className="h-5 w-5" />
            </button>
            <div className="relative space-y-2">
              <p
                className={cn("text-base font-semibold tracking-wide", {
                  "text-gray-100": !props.light,
                  "text-gray-700": props.light,
                })}
              >
                {props.title}
              </p>
              <div
                className={cn("space-y-2 text-sm font-medium", {
                  "text-gray-200": !props.light,
                  "text-gray-700": props.light,
                })}
              >
                {props.children}
              </div>
            </div>
          </div>
        </Popover>
      ) : null}
    </>
  );
};
