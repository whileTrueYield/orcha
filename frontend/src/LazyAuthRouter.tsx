import { PushNotification } from "components/notification/PushNotification";
import { Sidebar } from "components/sidebar/Sidebar";
import { AdminRouter } from "pages/admin/Router";
import { FeatureFlagLoader } from "pages/auth/FeatureFlagLoader";
import { RoleLoader } from "pages/auth/RoleLoader";
import { Home } from "pages/dashboard/Home/Home";
import { HomeRouter } from "pages/dashboard/Router";
import { DocumentationRouter } from "pages/documentation/Router";
import { ExplorerRouter } from "pages/explorer/Router";
import { IssueRouter } from "pages/issue/Router";
import { LogoRouter } from "pages/logo/Router";
import { NoteRouter } from "pages/note/Router";
import { OnboardingRouter } from "pages/onboarding/Router";
import { ScheduleRouter } from "pages/schedule/Router";
import { ReportRouter } from "pages/report/Router";
import { SearchRouter } from "pages/search/Router";
import { TicketRouter } from "pages/ticket/Router";
import { MeEdit } from "pages/user/MeEdit/MeEdit";
import { Route } from "react-router-dom";
import { urlResolver } from "utils/navigation";

const LazyAuthRouter: React.FC = () => {
  return (
    <RoleLoader>
      <PushNotification />
      <FeatureFlagLoader />
      <Sidebar>
        <HomeRouter />
        <TicketRouter />
        <LogoRouter />

        <AdminRouter />

        <NoteRouter />
        <OnboardingRouter />

        <DocumentationRouter />
        <IssueRouter />
        <ReportRouter />
        <SearchRouter />

        <ExplorerRouter />
        <ScheduleRouter />
        <Route path={urlResolver.user.paths.editMe} component={MeEdit} />
        <Route path="/" exact component={Home} />
      </Sidebar>
    </RoleLoader>
  );
};

export default LazyAuthRouter;
