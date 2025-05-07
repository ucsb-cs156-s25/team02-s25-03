import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestTable from "main/components/RecommendationRequests/RecommendationRequestTable";
import { Button } from "react-bootstrap";
import { useCurrentUser, hasRole } from "main/utils/currentUser";

export default function RecommendationRequestIndexPage() {
  const currentUser = useCurrentUser();

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/recommendationRequest/create"
          style={{ float: "right" }}
        >
          Create RecommendationRequest
        </Button>
      );
    }
  };

  const {
    data: recommendationrequests,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/recommendationRequest/all"],
    { method: "GET", url: "/api/recommendationRequest/all" },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>Recommendation Request</h1>
        <RecommendationRequestTable
          recommendationrequests={recommendationrequests}
          currentUser={currentUser}
        />
      </div>
    </BasicLayout>
  );
}
