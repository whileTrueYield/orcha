import { Tab, Tabs } from "components/fields/Tab";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMe } from "reducers/selector";
import { ScheduleStatus } from "types/graphql";
import { urlResolver } from "utils/navigation";

type TabCta =
  | "Calendar"
  | "Scheduled Tickets"
  | "Swimlanes"
  | "Blocked"
  | "Priorities"
  | "Gantt";

type ScheduleTab = {
  cta: TabCta;
  to: (orgId: string) => string;
  label?: ReactNode;
};

const TABS: ScheduleTab[] = [
  {
    cta: "Calendar",
    to: (orgId: string) => urlResolver.schedule.root(orgId),
  },
  {
    cta: "Swimlanes",
    to: (orgId: string) => urlResolver.schedule.swimlanes(orgId),
  },
  {
    cta: "Scheduled Tickets",
    to: (orgId: string) => urlResolver.schedule.list(orgId),
  },
  {
    cta: "Gantt",
    to: (orgId: string) => urlResolver.schedule.gantt(orgId),
  },
  {
    cta: "Priorities",
    to: (orgId: string) => urlResolver.schedule.priorities(orgId),
  },
];

const blockingTicketsTab: ScheduleTab = {
  cta: "Blocked",
  to: (orgId: string) => urlResolver.schedule.blockingTickets(orgId),
};

interface Props {
  orgId: string;
  current: TabCta;
}

export const ScheduleTabs: React.FC<Props> = (props) => {
  const me = useSelector(getMe);

  const scheduleStatus = me?.organization?.scheduleStatus || ScheduleStatus.Ok;
  if (scheduleStatus !== ScheduleStatus.Ok) {
  }
  const displayedTabs =
    scheduleStatus === ScheduleStatus.Ok ? TABS : [blockingTicketsTab, ...TABS];

  return (
    <Tabs className="hidden md:flex" layoutId="schedule">
      {displayedTabs.map((tab) =>
        tab.cta === props.current ? (
          <Tab active key={tab.cta}>
            {tab.label || tab.cta}
          </Tab>
        ) : (
          <Tab
            key={tab.cta}
            asElement={(className) => (
              <Link className={className} to={tab.to(props.orgId)}>
                {tab.label || tab.cta}
              </Link>
            )}
          />
        ),
      )}
    </Tabs>
  );
};
