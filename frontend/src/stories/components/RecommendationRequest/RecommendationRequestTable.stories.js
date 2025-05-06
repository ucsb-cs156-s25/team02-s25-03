import React from "react";
import RecommendationRequestTable from "main/components/RecommendationRequests/RecommendationRequestTable";
import { RecommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/RecommendationRequests/RecommendationRequestTable",
  component: RecommendationRequestTable,
};

const Template = (args) => {
  return <RecommendationRequestTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  recommendationrequests: [],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  recommendationrequests:
    RecommendationRequestFixtures.threeRecommendationRequest,
  currentUser: RecommendationRequestFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  recommendationrequests:
    RecommendationRequestFixtures.threeRecommendationRequest,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/recommendationrequests", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
