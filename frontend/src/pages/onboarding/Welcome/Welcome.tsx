import { CollectionIcon } from "@heroicons/react/outline";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { Panel } from "components/views/Panel";
import { usePageTitle } from "hooks/usePageTitle";
import React from "react";

type KeyProps = {
  children?: React.ReactNode;
};

const Key: React.FC<KeyProps> = (props) => {
  return (
    <kbd className="relative mx-0.5 cursor-pointer rounded border border-b-2 border-r-2 border-gray-400 bg-gray-50 py-px px-1 text-xs font-semibold text-gray-600 shadow-sm transition hover:top-px hover:left-px hover:border-b hover:border-r hover:bg-white hover:shadow-none">
      {props.children}
    </kbd>
  );
};

export const Welcome: React.FC = () => {
  usePageTitle("Welcome");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto space-y-8 py-6 px-2 text-gray-700 sm:mb-8 md:py-4">
        <Panel>
          <div className="flex flex-col-reverse md:flex-row">
            <div className="flex flex-1 flex-col justify-center space-y-4 p-8">
              <h1 className="text-lg font-semibold text-gray-700 md:text-3xl">
                The Task Switcher
              </h1>
              <p>
                We would like you help you familiarize yourself with our
                interface. Lets get started with The task switcher.
              </p>
              <p>
                At any time you can trigger the task switcher by using{" "}
                <Key>Cmd ⌘</Key>+<Key>K</Key> on a Mac or <Key>Ctrl</Key>+
                <Key>K</Key> on Linux and Windows. You may also simply click the
                <CollectionIcon className="mx-1 inline-block h-5 w-5 text-gray-500" />{" "}
                icon, the header as shown below:
              </p>
              <img
                src="/img/onboarding/task-player.png"
                className="rounded-l-lg object-scale-down"
                alt="top interactive header element"
              />
              <p>
                The task switcher (on the right) allow you to search through
                tickets, see your current, paused and upcomming tasks.
              </p>
              <p>
                The task marked as "RECOMMENDED" should be the next one you work
                on.
              </p>
            </div>
            <img
              src="/img/onboarding/switcher.png"
              className="md:rounded-bt-lg max-w-[50%] rounded-tl-lg rounded-tr-lg bg-[#4C515F] object-contain md:rounded-tl-none md:rounded-br-lg"
              alt="The task switcher"
            />
          </div>
        </Panel>
        <Panel>
          <div className="flex flex-col md:flex-row">
            <img
              src="/img/onboarding/state-manager.png"
              className="max-w-fit rounded-tr-lg rounded-tl-lg bg-gray-200 object-contain p-8 md:rounded-tr-none md:rounded-bl-lg"
              alt="ticket state manager"
            />
            <div className="flex flex-1 flex-col justify-center space-y-4 p-8">
              <h1 className="text-lg font-semibold text-gray-700 md:text-3xl">
                The State Manager
              </h1>
              <p>
                Every scheduled ticket display the state manager. It list all
                the step of your workflow, in order, from top to bottom.
              </p>

              <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                <div className="space-y-4">
                  <p>
                    Every state is color coded, when not yet started, it will
                    appear in white. When started it will show in blue, paused
                    show as yellow and finally finalized state are show in
                    green.
                  </p>
                  <p>
                    At any point you can change the state by clicking on one and
                    hitting the Start button.
                  </p>
                  <p>
                    You are following good practice and encouraging pair
                    programing, no problem, when a task is started, click on the{" "}
                    <ChevronDownIcon className="mx-1 inline-block h-5 w-5 text-gray-500" />
                    menu and select "Join"
                  </p>
                </div>
                <img
                  src="/img/onboarding/task-menu.png"
                  className="rounded-r-lg object-scale-down"
                  alt="state manager drop-down menu"
                />
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
