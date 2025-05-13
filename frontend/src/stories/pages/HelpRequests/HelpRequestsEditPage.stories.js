import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import HelpRequestsEditPage from "main/pages/HelpRequests/HelpRequestsEditPage";
import { helpRequestFixtures } from "fixtures/helpRequestsFixtures";

export default {
  title: "pages/HelpRequests/HelpRequestsEditPage",
  component: HelpRequestsEditPage,
};

const Template = () => <HelpRequestsEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/helprequests", () => {
      return HttpResponse.json(helpRequestFixtures.threeHelpRequests[0], {
        status: 200,
      });
    }),

    http.put("/api/helprequests", (req) => {
      window.alert("PUT: " + req.url + " and body: " + req.body);
      return HttpResponse.json(
        {
          id: "17",
          requesterEmail: "syuricha@ucsb.edu",
          teamId: "s22-6pm-3\t",
          tableOrBreakoutRoom: "7",
          requestTime: "2023-04-20T17:35:02.000Z",
          explanation: "DokkuIssue",
          solved: false,
        },
        { status: 200 },
      );
    }),
  ],
};
